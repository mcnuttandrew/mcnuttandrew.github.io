import { PUBLICATIONS } from "../constants";

import type { VisualizationSpec } from "svelte-vega";

type PersonId = string;

interface Person {
  id: PersonId;
  label: string;
  order: number;
}

interface Link {
  source: PersonId;
  target: PersonId;
  weight: number;
}

function cleanAuthorName(value: string): string {
  return value
    .replaceAll("\n", " ")
    .replace(/\s+/g, " ")
    .replace(/^and\s+/i, "")
    .trim();
}

function normalizeAuthorName(value: string): PersonId {
  return cleanAuthorName(value).toLocaleLowerCase();
}

/**
 * Weighted circular distance between two node positions.
 *
 * For example, positions 0 and n - 1 are adjacent on a circle.
 */
function circularDistance(a: number, b: number, count: number): number {
  if (count <= 1) return 0;

  const direct = Math.abs(a - b);
  return Math.min(direct, count - direct);
}

function scoreCircularOrder(order: PersonId[], links: Link[]): number {
  if (order.length <= 1) return 0;

  const positions = new Map<PersonId, number>();

  order.forEach((id, index) => {
    positions.set(id, index);
  });

  let score = 0;

  for (const link of links) {
    const sourcePosition = positions.get(link.source);
    const targetPosition = positions.get(link.target);

    // This also lets the function score partially constructed orders.
    if (sourcePosition === undefined || targetPosition === undefined) {
      continue;
    }

    score +=
      link.weight *
      circularDistance(sourcePosition, targetPosition, order.length);
  }

  return score;
}

/**
 * Creates a useful initial order by placing strongly connected people
 * first and inserting each person at the lowest-cost position.
 */
function buildInitialCircularOrder(ids: PersonId[], links: Link[]): PersonId[] {
  const adjacency = new Map<PersonId, Map<PersonId, number>>();

  for (const id of ids) {
    adjacency.set(id, new Map());
  }

  for (const link of links) {
    adjacency.get(link.source)?.set(link.target, link.weight);
    adjacency.get(link.target)?.set(link.source, link.weight);
  }

  const weightedDegree = (id: PersonId): number => {
    let degree = 0;

    for (const weight of adjacency.get(id)?.values() ?? []) {
      degree += weight;
    }

    return degree;
  };

  const remaining = [...ids].sort(
    (a, b) => weightedDegree(b) - weightedDegree(a) || a.localeCompare(b),
  );

  const order: PersonId[] = [];

  if (remaining.length === 0) {
    return order;
  }

  order.push(remaining.shift()!);

  while (remaining.length > 0) {
    /*
     * Select the unplaced person with the greatest total connection
     * weight to people already on the circle.
     */
    let selectedIndex = 0;
    let selectedPlacedWeight = -1;
    let selectedDegree = -1;

    for (let index = 0; index < remaining.length; index += 1) {
      const id = remaining[index];

      let placedWeight = 0;

      for (const placedId of order) {
        placedWeight += adjacency.get(id)?.get(placedId) ?? 0;
      }

      const degree = weightedDegree(id);

      if (
        placedWeight > selectedPlacedWeight ||
        (placedWeight === selectedPlacedWeight && degree > selectedDegree)
      ) {
        selectedIndex = index;
        selectedPlacedWeight = placedWeight;
        selectedDegree = degree;
      }
    }

    const [selected] = remaining.splice(selectedIndex, 1);

    let bestPosition = 0;
    let bestScore = Number.POSITIVE_INFINITY;

    /*
     * Try every insertion position. Because this is a circle, inserting
     * before index 0 is sufficient; inserting after the final item is
     * equivalent under rotation.
     */
    for (let position = 0; position < order.length; position += 1) {
      const candidate = [
        ...order.slice(0, position),
        selected,
        ...order.slice(position),
      ];

      const score = scoreCircularOrder(candidate, links);

      if (score < bestScore) {
        bestScore = score;
        bestPosition = position;
      }
    }

    order.splice(bestPosition, 0, selected);
  }

  return order;
}

/**
 * Improves an existing order using deterministic pair swaps.
 *
 * The exact minimum circular arrangement is computationally expensive,
 * so this performs bounded local optimization instead.
 */
function improveCircularOrder(
  initialOrder: PersonId[],
  links: Link[],
): PersonId[] {
  const order = [...initialOrder];

  if (order.length < 3) {
    return order;
  }

  let currentScore = scoreCircularOrder(order, links);

  // Prevent very large datasets from spending excessive time optimizing.
  const maximumPasses = order.length <= 100 ? 20 : order.length <= 250 ? 8 : 3;

  for (let pass = 0; pass < maximumPasses; pass += 1) {
    let improved = false;

    for (let first = 0; first < order.length - 1; first += 1) {
      for (let second = first + 1; second < order.length; second += 1) {
        [order[first], order[second]] = [order[second], order[first]];

        const candidateScore = scoreCircularOrder(order, links);

        if (candidateScore < currentScore) {
          currentScore = candidateScore;
          improved = true;
        } else {
          // Undo a swap that did not improve the layout.
          [order[first], order[second]] = [order[second], order[first]];
        }
      }
    }

    if (!improved) {
      break;
    }
  }

  return order;
}

function buildNetworkData(): {
  people: Person[];
  links: Link[];
} {
  const labels = new Map<PersonId, string>();
  const linkWeights = new Map<string, Link>();

  for (const publication of PUBLICATIONS) {
    /*
     * Supports both:
     *
     *   "Alice, Bob, Carol"
     *   "Alice, Bob and Carol"
     */
    const publicationAuthors = publication.authors
      .replaceAll("\n", " ")
      .split("(")
      .at(0)!
      .split(/\s*,\s*|\s+and\s+/i)
      .map(cleanAuthorName)
      .filter(Boolean);
    //   .filter((author) => author !== "Andrew McNutt");

    /*
     * Deduplicate authors within one publication. This prevents a malformed
     * publication record from adding the same collaboration more than once.
     */
    const authorsById = new Map<PersonId, string>();

    for (const author of publicationAuthors) {
      const id = normalizeAuthorName(author);

      if (!id) continue;

      if (!authorsById.has(id)) {
        authorsById.set(id, author);
      }

      if (!labels.has(id)) {
        labels.set(id, author);
      }
    }

    const authorIds = [...authorsById.keys()];

    /*
     * Generate each unordered pair exactly once.
     *
     * For n authors this creates n * (n - 1) / 2 links, instead of creating
     * both [a, b] and [b, a].
     */
    for (let first = 0; first < authorIds.length - 1; first += 1) {
      for (let second = first + 1; second < authorIds.length; second += 1) {
        const firstId = authorIds[first];
        const secondId = authorIds[second];

        const source = firstId < secondId ? firstId : secondId;
        const target = firstId < secondId ? secondId : firstId;
        const key = `${source}\u0000${target}`;

        const existing = linkWeights.get(key);

        if (existing) {
          existing.weight += 1;
        } else {
          linkWeights.set(key, {
            source,
            target,
            weight: 1,
          });
        }
      }
    }
  }

  const links = [...linkWeights.values()];
  const ids = [...labels.keys()];

  const initialOrder = buildInitialCircularOrder(ids, links);
  const optimizedOrder = improveCircularOrder(initialOrder, links);

  const people = optimizedOrder.map((id, order) => ({
    id,
    label: labels.get(id) ?? id,
    order,
  }));

  return { people, links };
}

export function radialWheel(): VisualizationSpec {
  const { people, links } = buildNetworkData();

  return {
    $schema: "https://vega.github.io/schema/vega/v6.json",
    description:
      "Circular relationship network with distance-optimized node ordering.",

    width: 500,
    height: 600,
    padding: 40,
    autosize: "none",

    signals: [
      { name: "radius", value: 180 },
      { name: "curveStrength", value: 0.7 },
      { name: "textSize", value: 10 },
      { name: "textOffset", value: 8 },

      { name: "originX", update: "width / 2" },
      { name: "originY", update: "height / 2" },

      {
        name: "active",
        value: null,
        on: [
          { events: "@nodes:pointerover", update: "datum.id" },
          { events: "@labels:pointerover", update: "datum.id" },
          { events: "view:pointermove[!event.item]", update: "null" },
          { events: "view:pointerout", update: "null" },
        ],
      },
    ],

    data: [
      {
        name: "inputPeople",
        values: people,
      },

      {
        name: "inputLinks",
        values: links,
      },

      {
        name: "people",
        source: "inputPeople",
        transform: [
          { type: "collect", sort: { field: "order", order: "ascending" } },
          { type: "joinaggregate", ops: ["count"], as: ["nodeCount"] },
          {
            type: "window",
            ops: ["row_number"],
            as: ["nodeIndex"],
            sort: { field: "order", order: "ascending" },
          },
          {
            type: "formula",
            expr: "-PI / 2 + 2 * PI * (datum.nodeIndex - 1) / datum.nodeCount",
            as: "angle",
          },
          { type: "formula", expr: "cos(datum.angle) < 0", as: "leftside" },
          {
            type: "formula",
            expr: "originX + radius * cos(datum.angle)",
            as: "x",
          },
          {
            type: "formula",
            expr: "originY + radius * sin(datum.angle)",
            as: "y",
          },
        ],
      },

      {
        name: "links",
        source: "inputLinks",
        transform: [
          {
            type: "lookup",
            from: "people",
            key: "id",
            fields: ["source"],
            values: ["x", "y"],
            as: ["sourceX", "sourceY"],
          },
          {
            type: "lookup",
            from: "people",
            key: "id",
            fields: ["target"],
            values: ["x", "y"],
            as: ["targetX", "targetY"],
          },
          {
            type: "formula",
            expr: "datum.sourceX + (originX - datum.sourceX) * curveStrength",
            as: "controlX",
          },
          {
            type: "formula",
            expr: "datum.sourceY + (originY - datum.sourceY) * curveStrength",
            as: "controlY",
          },
          {
            type: "formula",
            expr:
              "'M' + datum.sourceX + ',' + datum.sourceY + " +
              "' Q' + datum.controlX + ',' + datum.controlY + " +
              "' ' + datum.targetX + ',' + datum.targetY",
            as: "path",
          },
        ],
      },

      {
        name: "selectedLinks",
        source: "links",
        transform: [
          {
            type: "filter",
            expr: "datum.source === active || datum.target === active",
          },
        ],
      },
    ],

    marks: [
      {
        name: "markLinks",
        type: "path",
        interactive: false,
        from: {
          data: "links",
        },
        encode: {
          enter: { fill: { value: null } },
          update: {
            path: { field: "path" },
            stroke: [
              {
                test: "datum.source === active || datum.target === active",
                value: "#d62728",
              },
              { value: "gray" },
            ],
            strokeOpacity: [
              { test: "active === null", value: 0.22 },
              {
                test: "datum.source === active || datum.target === active",
                value: 0.9,
              },
              { value: 0.035 },
            ],
            strokeWidth: [
              {
                test: "datum.source === active || datum.target === active",
                signal: "2 + sqrt(datum.weight)",
              },
              { signal: "0.75 + sqrt(datum.weight) * 0.5" },
            ],
          },
        },
      },

      {
        name: "nodes",
        type: "symbol",
        from: {
          data: "people",
        },
        encode: {
          enter: { shape: { value: "circle" } },
          update: {
            x: { field: "x" },
            y: { field: "y" },
            size: [{ test: "datum.id === active", value: 100 }, { value: 30 }],
            fill: [
              { test: "datum.id === active", value: "#111111" },
              {
                test:
                  "indata('selectedLinks', 'source', datum.id) || " +
                  "indata('selectedLinks', 'target', datum.id)",
                value: "#d62728",
              },
              { value: "gray" },
            ],
            stroke: { value: "white" },
            strokeWidth: { value: 1 },
          },
        },
      },

      {
        name: "labels",
        type: "text",
        from: {
          data: "people",
        },
        encode: {
          enter: {
            text: { field: "label" },
            baseline: { value: "middle" },
            fontSize: { signal: "textSize" },
          },
          update: {
            x: { field: "x" },
            y: { field: "y" },
            dx: { signal: "textOffset * (datum.leftside ? -1 : 1)" },
            align: { signal: "datum.leftside ? 'right' : 'left'" },
            angle: {
              signal:
                "datum.leftside " +
                "? datum.angle * 180 / PI - 180 " +
                ": datum.angle * 180 / PI",
            },
            fill: [
              { test: "datum.id === active", value: "#111111" },
              {
                test:
                  "indata('selectedLinks', 'source', datum.id) || " +
                  "indata('selectedLinks', 'target', datum.id)",
                value: "#d62728",
              },
              { value: "#222222" },
            ],

            fontWeight: [
              {
                test:
                  "datum.id === active || " +
                  "indata('selectedLinks', 'source', datum.id) || " +
                  "indata('selectedLinks', 'target', datum.id)",
                value: "bold",
              },
              { value: "normal" },
            ],

            opacity: [
              { test: "active === null", value: 1 },
              {
                test:
                  "datum.id === active || " +
                  "indata('selectedLinks', 'source', datum.id) || " +
                  "indata('selectedLinks', 'target', datum.id)",
                value: 1,
              },
              { value: 0.18 },
            ],
          },
        },
      },
    ],
  } as VisualizationSpec;
}

const colorScheme = [
  "#e04e68",
  "#3ab2c0",
  "#249d60",
  "#efa616",
  "#967bb2",
  "#c7b6bc",
  "#86756f",
];

export function publicationsByYear(): VisualizationSpec {
  return {
    width: 500,
    height: 150,
    padding: { left: 80, top: 0, bottom: 0, right: 0 },
    autosize: "none",

    data: {
      values: PUBLICATIONS.map((publication) => ({
        year: publication.year,
        type: publication.type,
        title: publication.title,
      })),
    },
    mark: "bar",
    encoding: {
      y: {
        field: "year",
        type: "ordinal",
        scale: { reverse: true },
        axis: { title: null, ticks: false },
      },
      x: {
        aggregate: "count",
        type: "quantitative",
        axis: { ticks: false, title: null },
      },
      color: {
        field: "type",
        type: "nominal",
        legend: null,
        scale: { range: colorScheme },
      },
      tooltip: [
        { field: "title", type: "nominal", title: "Title" },
        { field: "type", type: "nominal", title: "Type" },
        { field: "year", type: "ordinal", title: "Year" },
      ],
    },
  };
}

const longNameToShortName: Record<string, string> = {
  "ACM SIGPLAN International Workshop on Programming for the Planet": "POPL",
  "ACM Symposium on User Interface Systems and Technologies": "UIST",
  "Computer Graphics & Applications": "Other Journal",
  "Computer Graphics Forum (EuroVis)": "EuroVis",
  "Conference on Innovative Data Systems Research": "CIDR",
  "Extended Abstracts of the ACM Conference on Human Factors in Computing (alt.chi)":
    "CHI",
  "IEEE InfoVis Posters": "VIS",
  "IEEE Symposium on Visual Languages and Human Centered Computing (VL/HCC) — Short Papers":
    "VL/HCC",
  "IEEE Symposium on Visual Languages and Human Centered Computing (VL/HCC)":
    "VL/HCC",
  "IEEE Transactions on Visualization and Computer Graphics (Proceedings of IEEE VIS)":
    "VIS",
  "IEEE Transactions on Visualization and Computer Graphics": "VIS",
  "IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization (VisGuides)":
    "VIS",
  "IEEE VIS Workshop on Visualization Education, Literacy, and Activities (EduVIS)":
    "VIS",
  "Journal of Chemical Information and Modeling": "Other Journal",
  "Journal of Classical and Quantum Gravity": "Other Journal",
  "LIVE Workshop": "Other workshop",
  "Masters thesis": "Thesis",
  "MindBytes Research Symposium": "Other workshop",
  "PLATEAU Workshop": "Other workshop",
  "Ph.D. Thesis": "Thesis",
  Preprint: "Preprint",
  "Proceedings of IEEE VIS (Short Papers)": "VIS",
  "Proceedings of the ACM Conference on Human Factors in Computing (SIGCHI)":
    "CHI",
  "Proceedings of the North American Association of Computational Linguistics (NAACL)":
    "NAACL",
  "Proceedings of the VLDB Endowment (Demo)": "VLDB",
  "Reporter Gene Assays": "Other Journal",
  "Theory in Biosciences": "Other Journal",
  "Undergraduate thesis": "Thesis",
  "Visualization for the Digital Humanities (VIS4DH)": "VIS",
  "alt.vis": "VIS",
  'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters':
    "EuroVis",
  "VisXVision Workshop": "VIS",
  "IEEE BELIV": "VIS",
};
export function publicationsByVenue(): VisualizationSpec {
  return {
    width: 500,
    height: 150,
    // padding: { left: 100, top: 0, bottom: 0, right: 0 },
    // autosize: "none",
    data: {
      values: PUBLICATIONS.map((publication) => ({
        venue: longNameToShortName[publication.journal] || publication.journal,
        actualVenue: publication.journal,
        type: publication.type,
        title: publication.title,
      })),
    },
    mark: "bar",
    encoding: {
      y: {
        field: "venue",
        type: "ordinal",
        sort: "-x",
        axis: { title: null, ticks: false },
      },
      x: {
        aggregate: "count",
        type: "quantitative",
        axis: { title: null, ticks: false },
      },
      color: {
        field: "type",
        type: "nominal",
        legend: { orient: "bottom" },
        scale: { range: colorScheme },
      },
      tooltip: [
        { field: "actualVenue", type: "ordinal", title: "Actual Venue" },
        { field: "type", type: "nominal", title: "Type" },
        { field: "title", type: "nominal", title: "Title" },
      ],
    },
  };
}
