
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function validate_store(store, name) {
        if (!store || typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, callback) {
        const unsub = store.subscribe(callback);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    let running = false;
    function run_tasks() {
        tasks.forEach(task => {
            if (!task[0](now())) {
                tasks.delete(task);
                task[1]();
            }
        });
        running = tasks.size > 0;
        if (running)
            raf(run_tasks);
    }
    function loop(fn) {
        let task;
        if (!running) {
            running = true;
            raf(run_tasks);
        }
        return {
            promise: new Promise(fulfil => {
                tasks.add(task = [fn, fulfil]);
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let stylesheet;
    let active = 0;
    let current_rules = {};
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        if (!current_rules[name]) {
            if (!stylesheet) {
                const style = element('style');
                document.head.appendChild(style);
                stylesheet = style.sheet;
            }
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        node.style.animation = (node.style.animation || '')
            .split(', ')
            .filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        )
            .join(', ');
        if (name && !--active)
            clear_rules();
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            let i = stylesheet.cssRules.length;
            while (i--)
                stylesheet.deleteRule(i);
            current_rules = {};
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function flush() {
        const seen_callbacks = new Set();
        do {
            // first, call beforeUpdate functions
            // and update components
            while (dirty_components.length) {
                const component = dirty_components.shift();
                set_current_component(component);
                update(component.$$);
            }
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    callback();
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
    }
    function update($$) {
        if ($$.fragment) {
            $$.update($$.dirty);
            run_all($$.before_update);
            $$.fragment.p($$.dirty, $$.ctx);
            $$.dirty = null;
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, changed, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(changed, child_ctx);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        if (component.$$.fragment) {
            run_all(component.$$.on_destroy);
            component.$$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            component.$$.on_destroy = component.$$.fragment = null;
            component.$$.ctx = {};
        }
    }
    function make_dirty(component, key) {
        if (!component.$$.dirty) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty = blank_object();
        }
        component.$$.dirty[key] = true;
    }
    function init(component, options, instance, create_fragment, not_equal, prop_names) {
        const parent_component = current_component;
        set_current_component(component);
        const props = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props: prop_names,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty: null
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, props, (key, ret, value = ret) => {
                if ($$.ctx && not_equal($$.ctx[key], $$.ctx[key] = value)) {
                    if ($$.bound[key])
                        $$.bound[key](value);
                    if (ready)
                        make_dirty(component, key);
                }
                return ret;
            })
            : props;
        $$.update();
        ready = true;
        run_all($$.before_update);
        $$.fragment = create_fragment($$.ctx);
        if (options.target) {
            if (options.hydrate) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.l(children(options.target));
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, detail));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
    }

    /* eslint-disable max-len */
    // export const ABOUT = `  My name is Andrew McNutt, and I am a PhD student in Computer Science at the University of Chicago. My work focuses on information visualization in general, and on automated guidance systems (like linters), unusual or xenographical data visualizations, and web applications as a visualization medium specifically.
      // `;
      // export const ABOUT = `
      // My name is Andrew McNutt, and I am a PhD student in Computer Science at the University of Chicago. My work is concerned with visualization theory and therein opportunities for the mechanistic operationalization of those ideas, as well as the design of user interfaces for complex knowledge-based tasks, such as visual analytics and creative coding, in a manner that opportunistically leverages ideas from programming languages and software engineering.  
      // `;

    const ABOUT = `
My name is Andrew McNutt, and I am a PhD student in Computer Science at the University of Chicago. My work falls in the intersection of the Data Visualization and HCI fields. I'm especially interested in theories of visualization (opportunities for the operationalization of those ideas), as well as the design of user interfaces for knowledge-based tasks (such as visual analytics or creative coding) and ways to leverage ideas from programming languages and software engineering in those designs.  
`;

    const HISTORY = `
In the near past I worked as a Data Visualization Engineer for a variety of companies in San Francisco, where I made visual analytics software. The software I produced while in this role is still widely used across the world. I got a formal education in physics from Reed College in Portland, and an informal education in web development from App Academy. I really like deserts, buffalo, and motorcycles.
`;
    // export const INTERESTS = `
    //   I\'m familiar with a wide variety of technologies, including (but not limited to):
    //   d3, react, flux/redux, node, backbone, processing, jquery, ruby, ruby on rails,
    //   python, flask, sketch, mathematica, grid mathematica, numpy, pandaz, git.
    //   (Above are some glib radar charts about skills I possess)
    //   I\'m excited about info-vis, databases, applied category theory, dashboards, testing,
    //   and pretty much anything in the wild world of javascript.`;
    const INTERESTS = `
    I\'m excited about InfoVis, applied category theory, dashboards, testing,
    and pretty much anything in the wild world of javascript.`;

    const PUBLICATIONS = [
      {
        link: '',
        urlTitle: 'nearby',
        imgLink: 'converted-images/nearby-preview.jpg',
        title: 'Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading',
        authors: 'Andrew McNutt, Agatha Kim, Sergio Elahi, Kazutaka Takahashi',
        journal: '2020 IEEE 5th Workshop on Visualization for the Digital Humanities (VIS4DH). October 2020',
        links: [
          {
            name: "preprint",
            link: 'https://arxiv.org/pdf/2009.02384.pdf'
          },
          {
            name: "about",
            link: "#/research/nearby"
          },
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/sci-text-compare'
          },
          {
            name: 'live',
            link: 'https://goetheanddecandolle.rcc.uchicago.edu/'
          },
          
        ],
        abstract: `
    Distant reading methodologies make use of computational processes to aid in the analysis of large text corpora which might not be pliable to traditional methods of scholarly analysis due to their volume. While these methods have been applied effectively to a variety of types of texts and contexts, they can leave unaddressed the needs of scholars in the humanities disciplines like history, who often engage in close reading of sources. Complementing the close analysis of texts with some of the tools of distant reading, such as visualization, can resolve some of the issues. We focus on a particular category of this intersection—which we refer to as near-by reading—wherein an expert engages in a computer-mediated analysis of a text with which they are familiar. We provide an example of this approach by developing a visual analysis application for the near-by reading of 19th-century scientific writings by J. W. von Goethe and A. P. de Candolle. We show that even the most formal and public texts, such as scientific treatises, can reveal unexpressed personal biases and philosophies that the authors themselves might not have recognized.
    `,
        bibTex: `TODO`
      },
      {
        link: '',
        urlTitle: 'table-cartogram',
        imgLink: 'converted-images/tc-preview.jpg',
        title: 'A Minimally Constrained Optimization Algorithm for Table Cartograms',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        journal: 'VIS 2020 - InfoVIS Poster Track - 🏆 Honorable Mention for Best Poster Research 🏆. October 2020',
        links: [
          {
            name: "about",
            link: "#/research/table-cartogram"
          },
          {
            name: 'preprint',
            link: 'https://osf.io/kem6j/'
          },
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/table-cartogram'
          },
                {
            name: 'poster',
            link: './assets/table-cartogram-poster.pdf'
          },
          {
            name: 'live',
            link: 'https://www.mcnutt.in/table-cartogram/'
          },
          
        ],
        abstract: `
    Table cartograms are a recent type of data visualization that encodes numerical tabular data as a grid of quadrilaterals whose area areb rought into correspondence with the input data. The overall effect is similar to that of a heat map that has been ‘area-ed‘ rather than shaded. There exist several algorithms for creating these structures—variously utilizing techniques such as computational geometry and numerical optimization —yet each of them impose aesthetically-motivated conditions that impede fine tuning or manipulation of the visual aesthetic of the output. In this work we contribute an optimization algorithm for creating table cartograms that is able to compute a variety of table cartograms layouts for a single dataset. We make our web-ready implementation available as table-cartogram.ts
    `,
        bibTex: `TODO`
      },
      {
        link: 'https://arxiv.org/pdf/2001.02316.pdf',
        urlTitle: 'mirage',
        imgLink: 'converted-images/surfacing-visualization-mirages.jpg',
        title: 'Surfacing Visualization Mirages',
        authors: 'Andrew McNutt, Gordon Kindlmann, Michael Correll',
        journal: 'Proceedings of the 2020 ACM annual conference on Human Factors in Computing Systems - 🏆 Honorable Mention for Best Paper 🏆. April 2020',
        links: [
                {
            name: "about",
            link: "#/research/mirage"
          },
          {name: 'preprint', link: 'https://arxiv.org/pdf/2001.02316.pdf'},
          {name: 'live', link: 'https://metamorphic-linting.netlify.com/'},
          {
            name: 'code',
            link: 'https://github.com/tableau/Visualization-Linting'
          },
          {name: 'osf', link: 'https://osf.io/je3x9'},
          {name: 'slides', link: './assets/mirage-talk.pdf'},
          {name: 'talk', link: 'https://www.youtube.com/watch?v=arHbVFbq-mQ'}
        ],
        abstract: `
    Dirty data and deceptive design practices can undermine, invert, or invalidate the purported messages of charts and graphs.
    These failures can arise silently: a conclusion derived from
    a particular visualization may look plausible unless the analyst looks closer and discovers an issue with the backing
    data, visual specification, or their own assumptions. We term
    such silent but significant failures visualization mirages. We
    describe a conceptual model of mirages and show how they
    can be generated at every stage of the visual analytics process.
    We adapt a methodology from software testing, metamorphic
    testing, as a way of automatically surfacing potential mirages
    at the visual encoding stage of analysis through modifications
    to the underlying data and chart specification. We show that
    metamorphic testing can reliably identify mirages across a
    variety of chart types with relatively little prior knowledge of
    the data or the domain.
    `,
        bibTex: `TODO`
      },
      {
        link: 'assets/altchi-tarot-cameraready.pdf',
        imgLink: 'converted-images/vis-tarot.jpg',
        urlTitle: 'tarot',
        title: 'Divining Insights: Visual Analytics Through Cartomancy',
        authors: 'Andrew McNutt, Anamaria Crisan, Michael Correll',
        journal: 'Proceedings of alt.CHI. April 2020',
        links: [
                      {
            name: "about",
            link: "#/research/tarot"
          },
          {
            name: 'preprint',
            link: 'assets/altchi-tarot-cameraready.pdf'
          },
          {name: 'live', link: 'https://vis-tarot.netlify.com/'},
          {
            name: 'code',
            link: 'https://github.com/mcorrell/vis-tarot'
          },
          {name: 'slides', link: './assets/tarot-talk.pdf'},
          {name: 'talk', link: 'https://www.youtube.com/watch?v=fRA42BjyG_Q'}
        ],
        abstract: `
    Our interactions with data, visual analytics included, are increasingly shaped by automated or algorithmic systems. An
open question is how to give analysts the tools to interpret
these “automatic insights” while also inculcating critical engagement with algorithmic analysis. We present a system,
Sortilège, that uses the metaphor of a Tarot card reading to
provide an overview of automatically detected patterns in
data in a way that is meant to encourage critique, reflection,
and healthy skepticism.
    `,
        bibTex: `TODO`
      },
      {
        imgLink: 'converted-images/agathas-thing.jpg',
        title:
          'Textual Analysis & Comparison National Forms of Scientific Texts: Goethe + de Candolle',
        authors: 'Agatha Kim, Andrew McNutt, S. Sergio Elahi, Kazutaka Takahashi, Robert J Richards',
        journal: 'MindBytes Research Symposium. November 2019',
        links: [
          {name: 'poster', link: 'https://mindbytes.uchicago.edu/posters/2019/10252019165647_posterkim102519.pdf'},
          {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
          {name: 'award', link: 'https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research'}
        ],
        abstract: `
    When the 19th-century European scientists were evaluating each other's ideas, they frequently validated their opinions by referring to the nationality of a given scientist as an explanatory type. Is there such a thing as â€œnational scienceâ€? This project examines widely-held ideas about the German and French styles of science in early 19th-century France. During this politically volatile period scientists found themselves in a difficult position. Between the aggressive political reality and the ideals of the cosmopolitan scientific community; as well as between the popularized image of national differences and the actual comparisons of the scientific ideas across national borders. As a case study, Goethe's and Candolle's botanical ideas, their receptions in France, and their actual texts are compared. We contrast these texts in detail through several types of interactive visualizations.
    `,
      },
      // link to award: https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research
      {
        link: 'assets/forum-explorer-paper.pdf',
        imgLink: 'converted-images/forested-tree-view-example.jpg',
        title:
          'Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        urlTitle: 'forum-explorer-eurovis',
        journal: 'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters. June 2019',
        links: [
          {name: 'paper', link: 'assets/forum-explorer-paper.pdf'},
          {name: 'poster', link: 'assets/forum-explorer-poster.pdf'},
          {name: 'live', link: 'https://www.mcnutt.in/forum-explorer/'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/forum-explorer'
          },
          {name: 'osf', link: 'https://osf.io/nrhqw/'}
        ],
        abstract: `
    Large threaded conversations, such as those found on YCombinator’s HackerNews,
    are typically presented in a way that shows individual comments clearly,
    but can obscure larger trends or patterns within the conversational corpus.
    Previous research has addressed this problem through graphical-overviews and NLP-generated summaries.
    These efforts have generally assumed a particular (and modest) data size,
    which limits their utility for large or deeply-nested conversations, and often
    require non-trivial offline processing time, which makes them impractical for day-to-day usage.
    We describe here Forum Explorer, a Chrome extension that combines and expands upon
    prior art through a collection of techniques that enable this type of
    representation to handle wider ranges of data in real time. Materials for this project are available at https://osf.io/nrhqw/.
    `,
        bibTex: `
    @inproceedings{McNuttKindlmannForumExplorerPoster,
      title={Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations},
      author={McNutt, Andrew and Kindlmann, Gordon},
      booktitle={Poster Abstracts of the EG/VGTC Conference on Visualization (EuroVis)},
      year={2019}
    }`
      },
      {
        link: 'assets/McNutt_Kindlmann_2018.pdf',
        imgLink: 'converted-images/lint-pic.jpg',
        urlTitle: 'linting-visguides',
        title:
          'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        journal: '2nd IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization ("VisGuides"). October 2018',
        links: [
          {name: 'paper', link: 'assets/McNutt_Kindlmann_2018.pdf'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/vislint_mpl'
          },
          {name: 'talk', link: 'talks/vis-lint-talk.pdf'}
        ],
        abstract: `
    Constructing effective charts and graphs in a scientific setting is a
    nuanced task that requires a thorough understanding of visualization
    design; a knowledge that may not be available to all practicing scientists.
    Previous attempts to address this problem have pushed chart
    creators to pore over large collections of guidelines and heuristics,
    or to relegate their entire workflow to end-to-end tools that provide
    automated recommendations. In this paper we bring together these
    two strains of ideas by introducing the use of lint as a mechanism for
    guiding chart creators towards effective visualizations in a manner
    that can be configured to taste and task without forcing users to abandon their usual workflows.
    The programmatic evaluation model of
    visualization linting (or vis lint) offers a compelling framework for
    the automation of visualization guidelines, as it offers unambiguous
    feedback during the chart creation process, and can execute analyses derived from machine vision and natural language processing.
    We demonstrate the feasibility of this system through the production of vislint_mpl,
    a prototype visualization linting system, that
    evaluates charts created in matplotlib.
    `,
        bibTex: `
    @misc{mcnuttKindlmannLinting,
      Author = {McNutt, Andrew and Kindlmann, Gordon},
      Howpublished = {IEEE VIS Workshop: \href{https://c4pgv.dbvis.de/}{VisGuides: 2nd Workshop on the Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization}},
      Month = oct,
      Title = {Linting for Visualization: Towards a Practical Automated Visualization Guidance System},
      Year = {2018}}
    `
      },
      {
        link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14',
        imgLink: 'converted-images/cdd-pic.jpg',
        urlTitle: 'reporter-assays',
        title:
          'Data Mining and Computational Modeling of High-Throughput Screening Datasets',
        authors: `Sean Ekins, Alex M Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
        journal: 'Reporter Gene Assays. 2018',
        links: [
          {
            name: 'paper',
            link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14'
          }
        ],
        abstract: `
    We are now seeing the benefit of investments made over the last decade in
    high-throughput screening (HTS) that is resulting in large structure activity
    datasets entering public and open databases such as ChEMBL and PubChem.
    The growth of academic HTS screening centers and the increasing move to academia
    for early stage drug discovery suggests a great need for the informatics tools and
    methods to mine such data and learn from it. Collaborative Drug Discovery, Inc. (CDD)
    has developed a number of tools for storing, mining, securely and selectively sharing,
    as well as learning from such HTS data. We present a new web based data mining and
    visualization module directly within the CDD Vault platform for high-throughput
    drug discovery data that makes use of a novel technology stack following modern
    reactive design principles. We also describe CDD Models within the CDD Vault platform
    that enables researchers to share models, share predictions from models, and create models
    from distributed, heterogeneous data. Our system is built on top of the Collaborative
    Drug Discovery Vault Activity and Registration data repository ecosystem which allows
    users to manipulate and visualize thousands of molecules in real time. This can be
    performed in any browser on any platform. In this chapter we present examples of its
    use with public datasets in CDD Vault. Such approaches can complement other cheminformatics
    tools, whether open source or commercial, in providing approaches for data mining and modeling of HTS data.
    `
      },
      {
        link: 'https://arxiv.org/abs/1501.07537',
        imgLink: 'converted-images/qgrav-pic.jpg',
        title: 'The Schrodinger-Newton System with Self-field Coupling',
        authors: 'Joel Franklin, Youdan Guo, Andrew McNutt, and Allison Morgan',
        urlTitle: 'qgrav',
        journal: 'Journal of Classical and Quantum Gravity. 2015',
        links: [
          {name: 'paper', link: 'https://arxiv.org/abs/1501.07537'},
          {name: 'talk', link: 'assets/QGravPresentation.pdf'}
        ],
        abstract: `
    We study the Schrodinger-Newton system of equations with the addition of gravitational
    field energy sourcing - such additional nonlinearity is to be expected from a theory
    of gravity (like general relativity), and its appearance in this simplified scalar
    setting (one of Einstein's precursors to general relativity) leads to significant
    changes in the spectrum of the self-gravitating theory. Using an iterative technique,
    we compare the mass dependence of the ground state energies of both Schrodinger-Newton
    and the new, self-sourced system and find that they are dramatically different.
    The Bohr method approach from old quantization provides a qualitative description of
    the difference, which comes from the additional nonlinearity introduced in the self-sourced
    case. In addition to comparison of ground state energies, we calculate the transition
    energy between the ground state and first excited state to compare emission frequencies
    between Schrodinger-Newton and the self-coupled scalar case.
    `
      },
      {
        link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143',
        imgLink: 'converted-images/cdd-models-pic.jpg',
        title:
          'Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets.',
        urlTitle: 'bayes-models',
        authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, and Sean Ekins`,
        journal: 'Journal of Chemical Information and Modeling. 2015',
        links: [
          {
            name: 'paper',
            link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143'
          }
        ],
        abstract: `
    On the order of hundreds of absorption, distribution, metabolism, excretion,
    and toxicity (ADME/Tox) models have been described in the literature in the
    past decade which are more often than not inaccessible to anyone but their authors.
    Public accessibility is also an issue with computational models for bioactivity,
    and the ability to share such models still remains a major challenge limiting drug
    discovery. We describe the creation of a reference implementation of a Bayesian
    model-building software module, which we have released as an open source component
    that is now included in the Chemistry Development Kit (CDK) project, as well as
    implemented in the CDD Vault and in several mobile apps. We use this implementation
    to build an array of Bayesian models for ADME/Tox, in vitro and in vivo bioactivity,
    and other physicochemical properties. We show that these models possess cross-validation
    receiver operator curve values comparable to those generated previously in prior
    publications using alternative tools. We have now described how the implementation
    of Bayesian models with FCFP6 descriptors generated in the CDD Vault enables the
    rapid production of robust machine learning models from public data or the user’s
    own datasets. The current study sets the stage for generating models in proprietary
    software (such as CDD) and exporting these models in a format that could be run in
    open source software using CDK components. This work also demonstrates that we can
    enable biocomputation across distributed private or public datasets to enhance drug discovery.`
      },
      {
        link: 'assets/thesis.pdf',
        imgLink: 'converted-images/thesis-pic.jpg',
        title: 'Nonequivalent Lagrangian Mechanics',
        urlTitle: 'nonequiv',
        authors: 'Andrew McNutt (Advised by Nelia Mann)',
        journal: 'Undergraduate thesis. Reed College. June 2014.',
        links: [
          {name: 'thesis', link: 'assets/thesis.pdf'},
          {name: 'talk', link: './assets/nlm-talk.pdf'}
        ],
        abstract: `
    In this thesis we study a modern formalism known as Nonequivalent Lagrangian
    Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics.
    By making use of the non-uniqueness of the Lagrangian representation of dynamical
    systems, we are able to generate conservation laws in a way that is novel and, in
    many cases much faster than the traditional Noetherian analysis. In every case that
    we examine, these invariants turn out to be Noetherian invariants in disguise. We
    apply this theory to a wide variety of systems including predator-prey dynamics and
    damped driven harmonic motion.`
      }
    ];

    const PRESENTATIONS = [
      // {
      //   title:
      //     'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
      //   link: 'assets/vis-lint-talk.pdf',
      //   journal: 'VisGuides 2018. October 22, 2018'
      // },
      {
        imgLink: 'converted-images/design-patterns-pic.jpg',
        title: 'Design Patterns For Data Visualization in React',
        link: 'http://tinyurl.com/reactvisdesignpatterns',
        journal: 'React Chicago. August 29, 2018',
        subtitle:
          'An overview of four useful patterns for developing visualizations in react.',
        links: [
          {
            name: 'slides',
            link: 'http://tinyurl.com/reactvisdesignpatterns'
          }
        ]
      }
      // {
      //   link: 'assets/nlm-talk.pdf',
      //   title: 'Nonequivalent Lagrangian Mechanics',
      //   journal: 'Reed Physics Seminar. April 8, 2014'
      // },
      // {
      // link: 'assets/QGravPresentation.pdf',
      // links: [],
      // title: 'The Schrodinger-Newton System with Self-field Coupling',
      // authors: 'Varchas Gopalaswamy, Andrew McNutt, Allie Morgan, Carl Proepper.',
      // journal: 'Reed Physics Seminar. September 18, 2013'
      // }
    ];

    const BLOG_POSTS = [
      {
        imgLink: 'converted-images/tarot-image.jpg',
        title:
          'A Brief Saga Concerning the Making of a Tarot Deck About the American Highway System',
        subtitle: 'A little essay about making',
        date: 'Personal Blog. December 10, 2018',
        link:
          'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
        links: [
          {
            name: 'blog post',
            link:
              'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8'
          },
          {name: 'github', link: 'https://github.com/mcnuttandrew/tarot-deck'}
        ]
      },
      {
        imgLink: 'converted-images/advanced-react-vis-pic.jpg',
        title: 'Advanced Visualization with react-vis',
        subtitle:
          'Using Voronois, single pass rendering, and canvas components for amazing user experiences',
        date: 'Towards Data Science. May 21, 2018',
        link:
          'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4',
        links: [
          {
            name: 'blog post',
            link:
              'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4'
          },
          // {name: 'talk', link: 'http://tinyurl.com/reactvisdesignpatterns'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/advanced-react-vis-tutorial'
          }, 
        ]
      }
    ];

    const PROJECTS = [
      // {
      //   title: 'Chaotic Circuit',
      //   imgLink: 'converted-images/chaotic-image.jpg',
      //   link: 'assets/Chaotic_circuit.pdf',
      //   text: `In culminating effort of my junior year at Reed I built a third order
      //   Chaotic circuit as an independent project. This shows some of the best data visualization
      //   work I had done at that point, particularlly the combination phase and signal metering small multiples diagram.`
      // },
      //
      {
        title: 'Sortilège',
        dates: 'January 2020',
        sourceLink: 'https://github.com/vis-tarot/vis-tarot',
        link: 'https://vis-tarot.github.io/vis-tarot/',
        imgLink: 'converted-images/vis-tarot-back.jpg',
        text:
          'A tarot based visual analytics system. It guides users analytics process via the divine hands of fate.',
        section: 'visualization'
      },
      {
        title: 'Data is Plural Search',
        dates: 'May 2020',
        sourceLink: 'https://github.com/mcnuttandrew/data-is-plural-search',
        link: 'https://data-is-plural-search.netlify.app/',
        imgLink: 'converted-images/data-is-plural.jpg',
        text:
          'A simple web view for the data is plural news letter by Singer-Vine.',
        section: 'tech'
      },

      {
        title: 'Cycles & Rain / Seasons In Size',
        dates: 'July 2019',
        sourceLink: 'https://github.com/mcnuttandrew/cycles-rain-seasons-in-size/',
        link: 'https://www.mcnutt.in/cycles-rain-seasons-in-size/',
        imgLink: 'converted-images/cycles-in-rain.jpg',
        text:
          'A little infographic about bicycle ridership in Seattle featuring table cartograms.',
        section: 'visualization'
      },
      {
        title: 'CSSQL',
        dates: 'May 2019',
        sourceLink: 'https://github.com/mcnuttandrew/cssql',
        link: 'https://www.npmjs.com/package/node-cssql',
        imgLink: 'converted-images/cssql-logo.jpg',
        text:
          'A new answer to this css-in-js question: css in sql. A sql-ddl to css transpiler written in haskell, available on npm.',
        section: 'tech'
      },
      {
        title: 'Forum Explorer',
        dates: 'April 2019',
        sourceLink: 'https://github.com/mcnuttandrew/forum-explorer',
        link: 'https://www.mcnutt.in/forum-explorer/',
        imgLink: 'converted-images/forum-ex-pic.jpg',
        text:
          'A chrome extension and website that allows users to explore threaded conversations using trees.',
        section: 'visualization'
      },
      {
        title: 'Readability As A Service',
        dates: 'November 2018',
        sourceLink: 'https://github.com/mcnuttandrew/flesch-kincaid-as-a-service',
        link: 'https://www.mcnutt.in/flesch-kincaid-as-a-service/',
        imgLink: 'converted-images/readability.jpg',
        text: `Have you ever wanted specific numerical quantification on how readable
    your prose is? This micro app wraps the textstat package as a webservice so that you can easily check.`,
        section: 'tech'
      },
      {
        title: 'tap-react-browser',
        dates: 'Feburary - April 2018',
        sourceLink: 'https://github.com/mcnuttandrew/tap-react-browser/',
        imgLink: 'converted-images/tap-react-browser.jpg',
        text: `In the process of building a variety of javascipt libraries in the course of
    my graduate research, I found myself needing a testing tool that played a particular
    role in relation to the browser, so I made one! tap-react-browser is a light
    wrapper on tape that spits out react components.`,
        section: 'tech'
      },
      {
        title: 'Constellations of Home - XMAS CARDS 2017',
        dates: 'December 2017',
        link: 'http://www.mcnutt.in/home-graphs/',
        sourceLink: 'https://github.com/mcnuttandrew/home-graphs',
        imgLink: 'converted-images/home-graphs.jpg',
        text: `Over the 2017 holidays I spent some time meditating on memory, home, and
    graph theory, which led to my making these christmas cards.`,
        section: 'visualization'
      },
      {
        title: 'On The Shape of American Cities I/II',
        dates: 'July 2017',
        link: 'http://www.mcnutt.in/city-size/',
        sourceLink: 'https://github.com/mcnuttandrew/city-size',
        imgLink: 'converted-images/city-size.jpg',
        text:
          'A print graphic describing the shape of the 100 most populous American cities.',
        section: 'visualization'
      },
      {
        title: 'Pantone: Color of the year',
        dates: 'Updated yearly, starting 2016',
        link: 'http://www.mcnutt.in/color-of-the-year/',
        sourceLink: 'https://github.com/mcnuttandrew/color-of-the-year',
        imgLink: 'converted-images/color-of-year.jpg',
        text:
          'A small exploration of the glory and wonder that is pantones color of the year.',
        section: 'visualization'
      },
      {
        title: 'react-vis',
        dates: '2016 - 2019',
        link: 'http://uber.github.io/react-vis/#/',
        sourceLink: 'https://github.com/uber/react-vis',
        imgLink: 'converted-images/react-vis-image.jpg',
        text: 'A charting library for the react ecosystem.',
        section: 'visualization'
      },
      {
        title: 'CSV Conversion',
        dates: 'December 2016',
        link: 'http://www.mcnutt.in/csv-conversion/',
        sourceLink: 'https://github.com/mcnuttandrew/csv-conversion',
        imgLink: 'converted-images/csv-conversion.jpg',
        text:
          'A handy client-side csv to json converter. I built this little app, because my favorite conversion site got knocked down and I wanted to improve the UI.',
        section: 'tech'
      },
      {
        title: 'Personal Timeline',
        dates: 'June 2016',
        link: 'http://www.mcnutt.in/personal-timeline/',
        sourceLink: 'https://github.com/mcnuttandrew/personal-timeline',
        imgLink: 'converted-images/personal-time.jpg',
        text:
          'A brief timeline of my life, a resume through a dark mirror if you will.',
        section: 'visualization'
      },
      {
        title: 'Unnamed Tarot Deck',
        dates: 'Dec 2015 - June 2016',
        link:
          'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
        sourceLink: 'https://github.com/mcnuttandrew/tarot-deck',
        imgLink: 'converted-images/tarot-image.jpg',
        text:
          'A tarot tech themed around the signage and spirit of the American highway system.',
        section: 'art'
      },
      {
        title: 'Why Not Ipsum',
        dates: 'September 2014',
        link: 'http://why-not-ipsum.herokuapp.com/',
        sourceLink: 'https://github.com/mcnuttandrew/Why-Not-Zoidberg',
        imgLink: 'converted-images/why-not-image.jpg',
        text:
          'A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning.',
        section: 'tech'
      },
      {
        title: 'N-Hedron',
        dates: 'September - December 2013',
        imgLink: 'converted-images/n-hydron.jpg',
        link: 'converted-images/nhedron.pdf',
        text:
          'An independent college project regarding the effacy of various numerical algorithms for constructing the n-hedron.',
        section: 'tech'
      }

      // {
      //   title: 'N-Body Simulator',
      //   link: 'https://mcnuttandrew.github.io/n-body-simulator/',
      //   sourceLink: 'https://github.com/mcnuttandrew/N-Body-Simulator',
      //   imgLink: 'converted-images/n-body-image.jpg',
      //   text: 'A low N gravitional interaction simulator built in processing.'
      // },
      // {
      //   title: 'Asteroids',
      //   imgLink: 'converted-images/asteroids-image.jpg',
      //   link: 'https://mcnuttandrew.github.io/asteroids/',
      //   sourceLink: 'https://github.com/mcnuttandrew/Asteroids',
      //   text: 'A reimaging of the classic arcade game. Technologies included Javascipt, HTML5 Canvas, and jQuery'
      // }
      // {
      //   title: 'Teacup',
      //   liveLink: 'http://tea-cup.org/',
      //   sourceLink: 'https://github.com/mcnuttandrew/Project-Teacup',
      //   text: 'A microblogging platform for viewing the collective unconscious. Single page Backbone app based on RESTful practices. Features data visualizations including trending topics and user population. Seed data was generated using a variety of large scale data scrapes and data cleaning techniques. Technologies included a Rails API, Backbone.js, jQuery, Nokogiri, and D3.'
      // }
      // {
      //   title: 'Slim Record',
      //   sourceLink: 'https://github.com/mcnuttandrew/Active-Record-Lite',
      //   text: 'An Object Relational Mapper that rebuilds much of the functionality of active record. The point of the project was to get a better comprehension of the underlying mechanisms that we so often take for granted in Rails'
      // },
      // {
      //   title: 'Railsito',
      //   sourceLink: 'https://github.com/mcnuttandrew/railsito',
      //   text: 'An Object Relational Mapper that rebuilds much of the functionality of active record. The point of the project was to get a better comprehension of the underlying mechanisms that we so often take for granted in Rails'
      // }
    ];

    const TEACHING = [
      {
        title: 'CAPP 30239 - Data Visualization For Public Policy',
        date: 'Winter 2020',
        role: 'Instructor',
        location: 'UChicago',
        link: 'https://capp-30239-winter-2020.netlify.com/'
      },
      {
        title: 'Visualization Research Reading Group',
        date: 'February 2019-Present',
        role: 'Other',
        location: 'UChicago',
        fancyTitle: 'Director',
        link: 'https://uchicago-vis-pl-lab.github.io/vis-reading-group/'
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2020',
        role: 'Instructor',
        location: 'UChicago'
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2019',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'http://people.cs.uchicago.edu/~glk/class/datavis19/'
      },
      {
        title: 'CAPP 30239 - Data Visualization For Public Policy',
        date: 'Winter 2019',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://twitter.com/AlexCEngler/status/1101245224733605891?s=20'
      },
      {
        title: 'CAPP 30121 - Computer Science with Applications 1',
        date: 'Fall 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://classes.cs.uchicago.edu/archive/2018/fall/30121-1/'
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'http://people.cs.uchicago.edu/~glk/class/datavis18/'
      },
      {
        title: 'CMSC 15100 - Introduction to Computer Science 1',
        date: 'Winter 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link:
          'https://www.classes.cs.uchicago.edu/archive/2018/winter/15100-1/syllabus.html'
      },
      {
        title: 'CMSC 12100 - Computer Science with Applications 1.',
        date: 'Fall 2017',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://www.classes.cs.uchicago.edu/archive/2017/fall/12100-1/'
      },
      {
        title: 'Uberversity Speaker',
        date: '2016-2017',
        role: 'Instructor',
        fancyTitle: 'Lecturer',
        location: 'Uber'
      },
      {
        title: 'Visualization Eng-ucation',
        date: '2015-2017',
        role: 'Instructor',
        fancyTitle: 'Lecturer',
        location: 'Uber'
      },
      {
        title: 'Physics 101 - General Physics I',
        date: '2012',
        role: 'Teaching Assistant',
        location: 'Reed College'
      },
      {
        title: 'F.L. Griffin Mathfest',
        date: '2014',
        role: 'Teaching Assistant',
        location: 'Reed College'
      }
    ];

    const NEWS = [
        {
        date: 'October 2020',
        content:
          'Presented our paper on nearby reading at VIS4DH (@IEEEVIS 2020) and our poster  "A Minimally Constrained Optimization Algorithm for Table Cartograms" won a 🏆honorable mention🏆 in the InfoVis track.'
      },
      {
        date: 'September 2020',
        content:
          'Our paper "Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading" on mixing close and distant reading for 19th century scientific writing was accepted to VIS4DH20.'
      },
      // {
      //   date: 'August 2020',
      //   content:
      //     'Our abstract on a web-based algorithm for producing table cartograms got accepted to IEEEVIS20'
      // },
      {
        date: 'March 2020',
        content:
          'Our paper "Surfacing Visualization Mirages" won a 🏆best paper honorable mention🏆 at CHI2020!!'
      },
      {
        date: 'Feburary 2020',
        content:
          'Our paper on using tarot for visual analytics "Divining Insights: Visual Analytics Through Cartomancy" was accepted to alt.chi 2020'
      },
      {
        date: 'January 2020',
        content:
          'Started teaching my first class as the instructor of record! ("Data Visualization for Public Policy")'
      },
      {
        date: 'December 2019',
        content: 'Received my Masters of Computer Science!!'
      },
      {
        date: 'November 2019',
        content:
          'Our poster on using graph visualizations to compare 19th century scentific writing was shown at both MindBytes (where it won best poster!) and the 2019 Chicago Colloquium on Digital Humanities.'
      },
      {
        date: 'October 2019',
        content:
          'Had a great time at IEEEVIS 2019 in Vancouver, BC! Helped contribute to the Open Access Vis (http://oavis.org/) efforts for the conference.'
      },
      {
        date: 'September 2019',
        content:
          'Two of my vis projects (ForumExplorer and Cycles in Rain) were Long-Listed at the Kantar Information is Beautiful Awards.'
      },
      {
        date: 'June 2019',
        content: 'Started an internship with Tableau Research in Seattle'
      },
      {
        date: 'June 2019',
        content: '🎉🎉🎉 Successfully defended my masters thesis 🎉🎉🎉'
      },
      {
        date: 'May 2019',
        content:
          'Presented our poster on ForumExplorer at EuroVis 2019 in Porto, Portugal.'
      },
      {
        date: 'May 2019',
        content:
          'I was awarded the UChicago Department of Computer Science TA Prize for my work TAing Spring 2018 - Winter 2019.'
      },
      {
        date: 'May 2019',
        content:
          "My piece 'On The Road To The Lake: Debugging in Tryptic' won second prize in the print media category of the UChicago Art+Science expo."
      },
      {
        date: 'October 2018',
        content:
          'Presented our paper on linting charts created in matplotlib at VisGuides, a IEEEVIS 2018 workshop. '
      },
      // {
      //   date: 'September 2018',
      //   content: 'Started my second year of grad school!'
      // }
    ];

    function classnames(classObject) {
      return Object.keys(classObject)
        .filter(name => classObject[name])
        .join(' ');
    }

    const routes = new Set(['research', 'projects', 'about', 'teaching']);
    function getRoute() {
      const locationSplit = location.href.split('/');
      const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
      if (
        location.href.includes('research') && 
        naiveLocation !== 'research' && 
        PUBLICATIONS.map(d => d.urlTitle).includes(naiveLocation)
      ) {
        
        return 'show-page';
      }

      return routes.has(naiveLocation) ? naiveLocation : 'about';
    }

    function getShowPage() {
      const locationSplit = location.href.split('/');
      const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
      return naiveLocation;
    }

    function groupBy(data, key) {
      return data.reduce((acc, row) => {
        acc[row[key]] = (acc[row[key]] || []).concat(row);
        return acc;
      }, {});
    }

    /* src/components/Header.svelte generated by Svelte v3.12.1 */

    const file = "src/components/Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.section = list[i];
    	return child_ctx;
    }

    // (31:4) {#each ['about', 'projects', 'research', 'teaching'] as section (section)}
    function create_each_block(key_1, ctx) {
    	var a, t0_value = ctx.section.toUpperCase() + "", t0, t1, a_class_value;

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "/#/" + ctx.section);
    			attr_dev(a, "class", a_class_value = "" + null_to_empty(classnames({
              selected: ctx.currentSection === ctx.section,
              padding: true
            })) + " svelte-6z6hfq");
    			add_location(a, file, 31, 6, 531);
    			this.first = a;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentSection) && a_class_value !== (a_class_value = "" + null_to_empty(classnames({
              selected: ctx.currentSection === ctx.section,
              padding: true
            })) + " svelte-6z6hfq")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(31:4) {#each ['about', 'projects', 'research', 'teaching'] as section (section)}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div1, div0, each_blocks = [], each_1_lookup = new Map();

    	let each_value = ['about', 'projects', 'research', 'teaching'];

    	const get_key = ctx => ctx.section;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file, 29, 2, 427);
    			attr_dev(div1, "class", "flex-down bar align header svelte-6z6hfq");
    			add_location(div1, file, 28, 0, 384);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(div0, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			const each_value = ['about', 'projects', 'research', 'teaching'];
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, null, get_each_context);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { currentSection } = $$props;

    	const writable_props = ['currentSection'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('currentSection' in $$props) $$invalidate('currentSection', currentSection = $$props.currentSection);
    	};

    	$$self.$capture_state = () => {
    		return { currentSection };
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentSection' in $$props) $$invalidate('currentSection', currentSection = $$props.currentSection);
    	};

    	return { currentSection };
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, ["currentSection"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Header", options, id: create_fragment.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.currentSection === undefined && !('currentSection' in props)) {
    			console.warn("<Header> was created without expected prop 'currentSection'");
    		}
    	}

    	get currentSection() {
    		throw new Error("<Header>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentSection(value) {
    		throw new Error("<Header>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/components/MobileHeader.svelte generated by Svelte v3.12.1 */

    const file$1 = "src/components/MobileHeader.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.section = list[i];
    	return child_ctx;
    }

    // (66:2) {#if open}
    function create_if_block(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map();

    	let each_value = ['about', 'projects', 'research', 'teaching'];

    	const get_key = ctx => ctx.section;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "flex-down margin-bottom svelte-hz9bf5");
    			add_location(div, file$1, 66, 4, 1292);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			const each_value = ['about', 'projects', 'research', 'teaching'];
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$1, null, get_each_context$1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(66:2) {#if open}", ctx });
    	return block;
    }

    // (68:6) {#each ['about', 'projects', 'research', 'teaching'] as section (section)}
    function create_each_block$1(key_1, ctx) {
    	var a, t0_value = ctx.section.toUpperCase() + "", t0, t1, a_class_value;

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "/#/" + ctx.section);
    			attr_dev(a, "class", a_class_value = "" + null_to_empty(classnames({
                selected: ctx.currentSection === ctx.section,
                padding: true
              })) + " svelte-hz9bf5");
    			add_location(a, file$1, 68, 8, 1419);
    			this.first = a;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentSection) && a_class_value !== (a_class_value = "" + null_to_empty(classnames({
                selected: ctx.currentSection === ctx.section,
                padding: true
              })) + " svelte-hz9bf5")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(68:6) {#each ['about', 'projects', 'research', 'teaching'] as section (section)}", ctx });
    	return block;
    }

    function create_fragment$1(ctx) {
    	var div2, div1, h3, t1, div0, svg, rect0, rect1, rect2, svg_transform_value, t2, dispose;

    	var if_block = (ctx.open) && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Andrew McNutt";
    			t1 = space();
    			div0 = element("div");
    			svg = svg_element("svg");
    			rect0 = svg_element("rect");
    			rect1 = svg_element("rect");
    			rect2 = svg_element("rect");
    			t2 = space();
    			if (if_block) if_block.c();
    			add_location(h3, file$1, 56, 4, 984);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "3");
    			add_location(rect0, file$1, 59, 8, 1096);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "3");
    			add_location(rect1, file$1, 60, 8, 1147);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "14");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "3");
    			add_location(rect2, file$1, 61, 8, 1198);
    			attr_dev(svg, "transform", svg_transform_value = "rotate(" + ctx.$rotation + ")");
    			attr_dev(svg, "width", "25px");
    			attr_dev(svg, "height", "21px");
    			add_location(svg, file$1, 58, 6, 1023);
    			add_location(div0, file$1, 57, 4, 1011);
    			attr_dev(div1, "class", "flex align svelte-hz9bf5");
    			add_location(div1, file$1, 55, 2, 931);
    			attr_dev(div2, "class", "flex-down bar header svelte-hz9bf5");
    			add_location(div2, file$1, 54, 0, 894);
    			dispose = listen_dev(div1, "click", ctx.toggleHeader);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, h3);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, svg);
    			append_dev(svg, rect0);
    			append_dev(svg, rect1);
    			append_dev(svg, rect2);
    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.$rotation) && svg_transform_value !== (svg_transform_value = "rotate(" + ctx.$rotation + ")")) {
    				attr_dev(svg, "transform", svg_transform_value);
    			}

    			if (ctx.open) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if (if_block) if_block.d();
    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $rotation;

    	

      const rotation = tweened(0, {
        duration: 400,
        easing: cubicOut
      }); validate_store(rotation, 'rotation'); component_subscribe($$self, rotation, $$value => { $rotation = $$value; $$invalidate('$rotation', $rotation); });

      let { currentSection } = $$props;
      let open = false;
      function toggleHeader() {
        $$invalidate('open', open = !open);
        rotation.set(!$rotation ? 90 : 0);
      }

    	const writable_props = ['currentSection'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<MobileHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('currentSection' in $$props) $$invalidate('currentSection', currentSection = $$props.currentSection);
    	};

    	$$self.$capture_state = () => {
    		return { currentSection, open, $rotation };
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentSection' in $$props) $$invalidate('currentSection', currentSection = $$props.currentSection);
    		if ('open' in $$props) $$invalidate('open', open = $$props.open);
    		if ('$rotation' in $$props) rotation.set($rotation);
    	};

    	return {
    		rotation,
    		currentSection,
    		open,
    		toggleHeader,
    		$rotation
    	};
    }

    class MobileHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["currentSection"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "MobileHeader", options, id: create_fragment$1.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.currentSection === undefined && !('currentSection' in props)) {
    			console.warn("<MobileHeader> was created without expected prop 'currentSection'");
    		}
    	}

    	get currentSection() {
    		throw new Error("<MobileHeader>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentSection(value) {
    		throw new Error("<MobileHeader>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/About.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/components/About.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.date = list[i].date;
    	child_ctx.content = list[i].content;
    	return child_ctx;
    }

    // (33:4) {#each NEWS as {date, content}}
    function create_each_block$2(ctx) {
    	var div, span0, t0_value = ctx.date + "", t0, t1, t2, span1, t3_value = ctx.content + "", t3, t4;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			attr_dev(span0, "class", "news-item-date svelte-13inknk");
    			add_location(span0, file$2, 34, 8, 649);
    			add_location(span1, file$2, 35, 8, 701);
    			attr_dev(div, "class", "news-item svelte-13inknk");
    			add_location(div, file$2, 33, 6, 617);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    			append_dev(div, t4);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(33:4) {#each NEWS as {date, content}}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div3, h10, t1, div1, div0, t2, t3, t4, t5, t6, t7, img, t8, h11, t10, div2;

    	let each_value = NEWS;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h10 = element("h1");
    			h10.textContent = "INTRODUCTION";
    			t1 = space();
    			div1 = element("div");
    			div0 = element("div");
    			t2 = text(ABOUT);
    			t3 = space();
    			t4 = text(HISTORY);
    			t5 = space();
    			t6 = text(INTERESTS);
    			t7 = space();
    			img = element("img");
    			t8 = space();
    			h11 = element("h1");
    			h11.textContent = "NEWS";
    			t10 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h10, file$2, 22, 2, 308);
    			add_location(div0, file$2, 24, 4, 364);
    			attr_dev(img, "alt", "picture of me in canyonlands utah");
    			attr_dev(img, "class", "self-pic svelte-13inknk");
    			attr_dev(img, "src", "assets/desert-pic.jpg");
    			add_location(img, file$2, 25, 4, 409);
    			attr_dev(div1, "class", "about-section svelte-13inknk");
    			add_location(div1, file$2, 23, 2, 332);
    			add_location(h11, file$2, 30, 2, 531);
    			attr_dev(div2, "class", "about-section svelte-13inknk");
    			add_location(div2, file$2, 31, 2, 547);
    			add_location(div3, file$2, 21, 0, 300);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h10);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t2);
    			append_dev(div0, t3);
    			append_dev(div0, t4);
    			append_dev(div0, t5);
    			append_dev(div0, t6);
    			append_dev(div1, t7);
    			append_dev(div1, img);
    			append_dev(div3, t8);
    			append_dev(div3, h11);
    			append_dev(div3, t10);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.NEWS) {
    				each_value = NEWS;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div2, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
    	return block;
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$2, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "About", options, id: create_fragment$2.name });
    	}
    }

    /* src/components/Projects.svelte generated by Svelte v3.12.1 */
    const { Object: Object_1 } = globals;

    const file$3 = "src/components/Projects.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.project = list[i];
    	return child_ctx;
    }

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = Object_1.create(ctx);
    	child_ctx.sectionName = list[i].sectionName;
    	child_ctx.rows = list[i].rows;
    	return child_ctx;
    }

    // (56:12) {#if project.sourceLink}
    function create_if_block_1(ctx) {
    	var a, svg, g, path;

    	const block = {
    		c: function create() {
    			a = element("a");
    			svg = svg_element("svg");
    			g = svg_element("g");
    			path = svg_element("path");
    			attr_dev(path, "d", "m20 0c-11 0-20 9-20 20 0 8.8 5.7 16.3 13.7 19 1 0.2\n                      1.3-0.5 1.3-1 0-0.5 0-2 0-3.7-5.5\n                      1.2-6.7-2.4-6.7-2.4-0.9-2.3-2.2-2.9-2.2-2.9-1.9-1.2\n                      0.1-1.2 0.1-1.2 2 0.1 3.1 2.1 3.1 2.1 1.7 3 4.6 2.1 5.8\n                      1.6 0.2-1.3 0.7-2.2 1.3-2.7-4.5-0.5-9.2-2.2-9.2-9.8 0-2.2\n                      0.8-4 2.1-5.4-0.2-0.5-0.9-2.6 0.2-5.3 0 0 1.7-0.5 5.5 2\n                      1.6-0.4 3.3-0.6 5-0.6 1.7 0 3.4 0.2 5 0.7 3.8-2.6 5.5-2.1\n                      5.5-2.1 1.1 2.8 0.4 4.8 0.2 5.3 1.3 1.4 2.1 3.2 2.1 5.4 0\n                      7.6-4.7 9.3-9.2 9.8 0.7 0.6 1.4 1.9 1.4 3.7 0 2.7 0 4.9 0\n                      5.5 0 0.6 0.3 1.2 1.3 1 8-2.7 13.7-10.2 13.7-19\n                      0-11-9-20-20-20z");
    			add_location(path, file$3, 65, 20, 1563);
    			add_location(g, file$3, 64, 18, 1539);
    			attr_dev(svg, "class", "github-icon");
    			attr_dev(svg, "fill", "black");
    			attr_dev(svg, "preserveAspectRatio", "xMidYMid meet");
    			attr_dev(svg, "height", "1em");
    			attr_dev(svg, "width", "1em");
    			attr_dev(svg, "viewBox", "0 0 40 40");
    			add_location(svg, file$3, 57, 16, 1293);
    			attr_dev(a, "href", ctx.project.sourceLink);
    			add_location(a, file$3, 56, 14, 1247);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, svg);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(56:12) {#if project.sourceLink}", ctx });
    	return block;
    }

    // (82:12) {#if project.link}
    function create_if_block$1(ctx) {
    	var a, t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("Live");
    			attr_dev(a, "href", ctx.project.link);
    			add_location(a, file$3, 82, 14, 2493);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(82:12) {#if project.link}", ctx });
    	return block;
    }

    // (46:6) {#each rows as project (project.title)}
    function create_each_block_1(key_1, ctx) {
    	var div2, a, div0, img, t0, h3, t1_value = ctx.project.title + "", t1, t2, h5, t3_value = ctx.project.dates + "", t3, t4, div1, t5, t6, p, t7_value = ctx.project.text + "", t7;

    	var if_block0 = (ctx.project.sourceLink) && create_if_block_1(ctx);

    	var if_block1 = (ctx.project.link) && create_if_block$1(ctx);

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			div2 = element("div");
    			a = element("a");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			h3 = element("h3");
    			t1 = text(t1_value);
    			t2 = space();
    			h5 = element("h5");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			t6 = space();
    			p = element("p");
    			t7 = text(t7_value);
    			attr_dev(img, "src", ctx.project.imgLink);
    			attr_dev(img, "alt", "image for " + ctx.project.title);
    			attr_dev(img, "class", "svelte-m2lfav");
    			add_location(img, file$3, 49, 14, 1014);
    			attr_dev(div0, "class", "img-container svelte-m2lfav");
    			add_location(div0, file$3, 48, 12, 972);
    			attr_dev(a, "href", ctx.project.link);
    			add_location(a, file$3, 47, 10, 936);
    			add_location(h3, file$3, 52, 10, 1120);
    			add_location(h5, file$3, 53, 10, 1155);
    			add_location(div1, file$3, 54, 10, 1190);
    			attr_dev(p, "class", "svelte-m2lfav");
    			add_location(p, file$3, 85, 10, 2570);
    			attr_dev(div2, "class", "project-block svelte-m2lfav");
    			add_location(div2, file$3, 46, 8, 898);
    			this.first = div2;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, a);
    			append_dev(a, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, h3);
    			append_dev(h3, t1);
    			append_dev(div2, t2);
    			append_dev(div2, h5);
    			append_dev(h5, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t5);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div2, t6);
    			append_dev(div2, p);
    			append_dev(p, t7);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.project.sourceLink) if_block0.p(changed, ctx);

    			if (ctx.project.link) if_block1.p(changed, ctx);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(46:6) {#each rows as project (project.title)}", ctx });
    	return block;
    }

    // (43:2) {#each sections as {sectionName, rows}
    function create_each_block$3(key_1, ctx) {
    	var h1, t0_value = ctx.sectionName.toUpperCase() + "", t0, t1, div, each_blocks = [], each_1_lookup = new Map(), t2;

    	let each_value_1 = ctx.rows;

    	const get_key = ctx => ctx.project.title;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(h1, file$3, 43, 4, 774);
    			attr_dev(div, "class", "flex-with-wrap svelte-m2lfav");
    			add_location(div, file$3, 44, 4, 815);
    			this.first = h1;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    		},

    		p: function update(changed, ctx) {
    			const each_value_1 = ctx.rows;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1, t2, get_each_context_1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    				detach_dev(t1);
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(43:2) {#each sections as {sectionName, rows}", ctx });
    	return block;
    }

    function create_fragment$3(ctx) {
    	var div, each_blocks = [], each_1_lookup = new Map();

    	let each_value = ctx.sections;

    	const get_key = ctx => ctx.sectionName;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$3(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$3(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "");
    			add_location(div, file$3, 41, 0, 699);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			const each_value = ctx.sections;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$3, null, get_each_context$3);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$2($$self) {
    	
      const sections = Object.entries(groupBy(PROJECTS, 'section')).map(
        ([sectionName, rows]) => ({sectionName, rows})
      );

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { sections };
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$3, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Projects", options, id: create_fragment$3.name });
    	}
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut }) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => `overflow: hidden;` +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/components/Publication.svelte generated by Svelte v3.12.1 */

    const file$4 = "src/components/Publication.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.link = list[i].link;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (82:8) {#if publication[key]}
    function create_if_block_2(ctx) {
    	var span, t_value = ctx.publication[ctx.key] + "", t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$4, 82, 10, 1544);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.publication) && t_value !== (t_value = ctx.publication[ctx.key] + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(82:8) {#if publication[key]}", ctx });
    	return block;
    }

    // (81:6) {#each keys as key}
    function create_each_block_1$1(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.publication[ctx.key]) && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.publication[ctx.key]) {
    				if (if_block) {
    					if_block.p(changed, ctx);
    				} else {
    					if_block = create_if_block_2(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(81:6) {#each keys as key}", ctx });
    	return block;
    }

    // (88:8) {#each publication.links as {name, link}}
    function create_each_block$4(ctx) {
    	var a, t_value = ctx.name + "", t, a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "publink svelte-1kxcwum");
    			attr_dev(a, "href", a_href_value = ctx.link);
    			add_location(a, file$4, 88, 10, 1690);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.publication) && t_value !== (t_value = ctx.name + "")) {
    				set_data_dev(t, t_value);
    			}

    			if ((changed.publication) && a_href_value !== (a_href_value = ctx.link)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(88:8) {#each publication.links as {name, link}}", ctx });
    	return block;
    }

    // (91:8) {#if publication.abstract}
    function create_if_block_1$1(ctx) {
    	var div, t0, t1_value = ctx.abstractOpen ? '-' : '+' + "", t1, t2, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("abstract (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(div, "class", "publink svelte-1kxcwum");
    			add_location(div, file$4, 91, 10, 1793);
    			dispose = listen_dev(div, "click", ctx.toggleAbstract);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.abstractOpen) && t1_value !== (t1_value = ctx.abstractOpen ? '-' : '+' + "")) {
    				set_data_dev(t1, t1_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(91:8) {#if publication.abstract}", ctx });
    	return block;
    }

    // (100:2) {#if abstractOpen}
    function create_if_block$2(ctx) {
    	var div, t_value = ctx.publication.abstract + "", t, div_transition, current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "abstract svelte-1kxcwum");
    			add_location(div, file$4, 100, 4, 1981);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.publication) && t_value !== (t_value = ctx.publication.abstract + "")) {
    				set_data_dev(t, t_value);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},

    		o: function outro(local) {
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    				if (div_transition) div_transition.end();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(100:2) {#if abstractOpen}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div4, div3, div0, img, img_alt_value, img_src_value, t0, div2, a, t1_value = ctx.publication.title + "", t1, a_href_value, t2, t3, div1, t4, t5, current;

    	let each_value_1 = ctx.keys;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = ctx.publication.links;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	var if_block0 = (ctx.publication.abstract) && create_if_block_1$1(ctx);

    	var if_block1 = (ctx.abstractOpen) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div2 = element("div");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t4 = space();
    			if (if_block0) if_block0.c();
    			t5 = space();
    			if (if_block1) if_block1.c();
    			attr_dev(img, "alt", img_alt_value = "image drawn from " + ctx.publication.title);
    			attr_dev(img, "src", img_src_value = ctx.publication.imgLink);
    			attr_dev(img, "class", "svelte-1kxcwum");
    			add_location(img, file$4, 73, 6, 1287);
    			attr_dev(div0, "class", "img-container svelte-1kxcwum");
    			add_location(div0, file$4, 72, 4, 1253);
    			attr_dev(a, "href", a_href_value = ctx.publication.link);
    			add_location(a, file$4, 78, 6, 1425);
    			attr_dev(div1, "class", "flex svelte-1kxcwum");
    			add_location(div1, file$4, 86, 6, 1611);
    			attr_dev(div2, "class", "flex-down svelte-1kxcwum");
    			add_location(div2, file$4, 77, 4, 1395);
    			attr_dev(div3, "class", "content-container svelte-1kxcwum");
    			add_location(div3, file$4, 71, 2, 1217);
    			attr_dev(div4, "class", "flex-down publication svelte-1kxcwum");
    			add_location(div4, file$4, 70, 0, 1179);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, img);
    			append_dev(div3, t0);
    			append_dev(div3, div2);
    			append_dev(div2, a);
    			append_dev(a, t1);
    			append_dev(div2, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div2, null);
    			}

    			append_dev(div2, t3);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t4);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div4, t5);
    			if (if_block1) if_block1.m(div4, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.publication) && img_alt_value !== (img_alt_value = "image drawn from " + ctx.publication.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((!current || changed.publication) && img_src_value !== (img_src_value = ctx.publication.imgLink)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if ((!current || changed.publication) && t1_value !== (t1_value = ctx.publication.title + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((!current || changed.publication) && a_href_value !== (a_href_value = ctx.publication.link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (changed.publication || changed.keys) {
    				each_value_1 = ctx.keys;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div2, t3);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.publication) {
    				each_value = ctx.publication.links;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t4);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (ctx.publication.abstract) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_1$1(ctx);
    					if_block0.c();
    					if_block0.m(div1, null);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (ctx.abstractOpen) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    					transition_in(if_block1, 1);
    				} else {
    					if_block1 = create_if_block$2(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div4, null);
    				}
    			} else if (if_block1) {
    				group_outros();
    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block1);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block1);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div4);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { publication } = $$props;
      let abstractOpen = false;
      function toggleAbstract(e) {
        e.preventDefault();
        $$invalidate('abstractOpen', abstractOpen = !abstractOpen);
      }
      const keys = ['subtitle', 'date', 'authors', 'journal'];

    	const writable_props = ['publication'];
    	Object.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Publication> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('publication' in $$props) $$invalidate('publication', publication = $$props.publication);
    	};

    	$$self.$capture_state = () => {
    		return { publication, abstractOpen };
    	};

    	$$self.$inject_state = $$props => {
    		if ('publication' in $$props) $$invalidate('publication', publication = $$props.publication);
    		if ('abstractOpen' in $$props) $$invalidate('abstractOpen', abstractOpen = $$props.abstractOpen);
    	};

    	return {
    		publication,
    		abstractOpen,
    		toggleAbstract,
    		keys
    	};
    }

    class Publication extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["publication"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Publication", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.publication === undefined && !('publication' in props)) {
    			console.warn("<Publication> was created without expected prop 'publication'");
    		}
    	}

    	get publication() {
    		throw new Error("<Publication>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set publication(value) {
    		throw new Error("<Publication>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Research.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/components/Research.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    // (16:4) {#each PUBLICATIONS as publication}
    function create_each_block_2(ctx) {
    	var current;

    	var publication = new Publication({
    		props: { publication: ctx.publication },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			publication.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(publication, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(publication.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(publication.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(publication, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(16:4) {#each PUBLICATIONS as publication}", ctx });
    	return block;
    }

    // (23:4) {#each BLOG_POSTS as publication}
    function create_each_block_1$2(ctx) {
    	var current;

    	var publication = new Publication({
    		props: { publication: ctx.publication },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			publication.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(publication, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(publication.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(publication.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(publication, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$2.name, type: "each", source: "(23:4) {#each BLOG_POSTS as publication}", ctx });
    	return block;
    }

    // (30:4) {#each PRESENTATIONS as publication}
    function create_each_block$5(ctx) {
    	var current;

    	var publication = new Publication({
    		props: { publication: ctx.publication },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			publication.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(publication, target, anchor);
    			current = true;
    		},

    		p: noop,

    		i: function intro(local) {
    			if (current) return;
    			transition_in(publication.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(publication.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(publication, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$5.name, type: "each", source: "(30:4) {#each PRESENTATIONS as publication}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div3, h10, t1, div0, t2, h11, t4, div1, t5, h12, t7, div2, current;

    	let each_value_2 = PUBLICATIONS;

    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = BLOG_POSTS;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = PRESENTATIONS;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			h10 = element("h1");
    			h10.textContent = "PUBLICATIONS";
    			t1 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t2 = space();
    			h11 = element("h1");
    			h11.textContent = "BLOG POSTS";
    			t4 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t5 = space();
    			h12 = element("h1");
    			h12.textContent = "Talks";
    			t7 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h10, file$5, 13, 2, 247);
    			attr_dev(div0, "class", "research-section svelte-1w0h618");
    			add_location(div0, file$5, 14, 2, 271);
    			add_location(h11, file$5, 20, 2, 402);
    			attr_dev(div1, "class", "research-section svelte-1w0h618");
    			add_location(div1, file$5, 21, 2, 424);
    			add_location(h12, file$5, 27, 2, 553);
    			attr_dev(div2, "class", "research-section svelte-1w0h618");
    			add_location(div2, file$5, 28, 2, 570);
    			add_location(div3, file$5, 12, 0, 239);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, h10);
    			append_dev(div3, t1);
    			append_dev(div3, div0);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			append_dev(div3, t2);
    			append_dev(div3, h11);
    			append_dev(div3, t4);
    			append_dev(div3, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div3, t5);
    			append_dev(div3, h12);
    			append_dev(div3, t7);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.PUBLICATIONS) {
    				each_value_2 = PUBLICATIONS;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				group_outros();
    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}

    			if (changed.BLOG_POSTS) {
    				each_value_1 = BLOG_POSTS;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();
    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}
    				check_outros();
    			}

    			if (changed.PRESENTATIONS) {
    				each_value = PRESENTATIONS;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);
    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);
    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			destroy_each(each_blocks_2, detaching);

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    class Research extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Research", options, id: create_fragment$5.name });
    	}
    }

    /* src/components/Teaching.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/components/Teaching.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.position = list[i];
    	return child_ctx;
    }

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (26:10) {#if position.link}
    function create_if_block_1$2(ctx) {
    	var a, t_value = ctx.position.title + "", t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", ctx.position.link);
    			add_location(a, file$6, 26, 12, 536);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$2.name, type: "if", source: "(26:10) {#if position.link}", ctx });
    	return block;
    }

    // (29:10) {#if !position.link}
    function create_if_block$3(ctx) {
    	var div, t_value = ctx.position.title + "", t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$6, 29, 12, 640);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(29:10) {#if !position.link}", ctx });
    	return block;
    }

    // (24:6) {#each groups[key] as position}
    function create_each_block_1$3(ctx) {
    	var div1, t0, t1, div0, i, t2_value = `${ctx.position.fancyTitle || ctx.position.role}` + "", t2, t3, span, t4_value = ctx.position.date + "", t4;

    	var if_block0 = (ctx.position.link) && create_if_block_1$2(ctx);

    	var if_block1 = (!ctx.position.link) && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			div0 = element("div");
    			i = element("i");
    			t2 = text(t2_value);
    			t3 = space();
    			span = element("span");
    			t4 = text(t4_value);
    			add_location(i, file$6, 33, 12, 726);
    			attr_dev(span, "class", "margin-left svelte-15b5xf0");
    			add_location(span, file$6, 34, 12, 789);
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file$6, 32, 10, 695);
    			attr_dev(div1, "class", "margin-bottom svelte-15b5xf0");
    			add_location(div1, file$6, 24, 8, 466);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			if (if_block0) if_block0.m(div1, null);
    			append_dev(div1, t0);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, i);
    			append_dev(i, t2);
    			append_dev(div0, t3);
    			append_dev(div0, span);
    			append_dev(span, t4);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.position.link) if_block0.p(changed, ctx);

    			if (!ctx.position.link) if_block1.p(changed, ctx);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div1);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$3.name, type: "each", source: "(24:6) {#each groups[key] as position}", ctx });
    	return block;
    }

    // (21:2) {#each Object.keys(groups) as key}
    function create_each_block$6(ctx) {
    	var div, h3, t0_value = ctx.key.toUpperCase() + "", t0, t1, t2;

    	let each_value_1 = ctx.groups[ctx.key];

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h3 = element("h3");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(h3, file$6, 22, 6, 391);
    			attr_dev(div, "class", "margin-large-bottom svelte-15b5xf0");
    			add_location(div, file$6, 21, 4, 351);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h3);
    			append_dev(h3, t0);
    			append_dev(div, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    		},

    		p: function update(changed, ctx) {
    			if (changed.groups) {
    				each_value_1 = ctx.groups[ctx.key];

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t2);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value_1.length;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$6.name, type: "each", source: "(21:2) {#each Object.keys(groups) as key}", ctx });
    	return block;
    }

    function create_fragment$6(ctx) {
    	var div;

    	let each_value = Object.keys(ctx.groups);

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(div, file$6, 19, 0, 304);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.groups) {
    				each_value = Object.keys(ctx.groups);

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self) {
    	
      const groups = groupBy(TEACHING, 'role');

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { groups };
    }

    class Teaching extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$6, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Teaching", options, id: create_fragment$6.name });
    	}
    }

    /* src/components/ShowPage.svelte generated by Svelte v3.12.1 */

    const file$7 = "src/components/ShowPage.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.link = list[i].link;
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (83:6) {#if publication[key]}
    function create_if_block$4(ctx) {
    	var span, t_value = ctx.publication[ctx.key] + "", t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$7, 83, 8, 1557);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$4.name, type: "if", source: "(83:6) {#if publication[key]}", ctx });
    	return block;
    }

    // (82:4) {#each keys as key}
    function create_each_block_1$4(ctx) {
    	var if_block_anchor;

    	var if_block = (ctx.publication[ctx.key]) && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},

    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},

    		p: function update(changed, ctx) {
    			if (ctx.publication[ctx.key]) if_block.p(changed, ctx);
    		},

    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);

    			if (detaching) {
    				detach_dev(if_block_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$4.name, type: "each", source: "(82:4) {#each keys as key}", ctx });
    	return block;
    }

    // (92:6) {#each publication.links as {name, link}}
    function create_each_block$7(ctx) {
    	var a, t_value = ctx.name + "", t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "publink svelte-1ubekoh");
    			attr_dev(a, "href", ctx.link);
    			add_location(a, file$7, 92, 8, 1776);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$7.name, type: "each", source: "(92:6) {#each publication.links as {name, link}}", ctx });
    	return block;
    }

    function create_fragment$7(ctx) {
    	var div7, div0, img, t0, div1, a, t1_value = ctx.publication.title + "", t1, t2, t3, div2, t5, div4, div3, t6, div5, t8, div6, t9_value = ctx.publication.abstract + "", t9;

    	let each_value_1 = ctx.keys;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
    	}

    	let each_value = ctx.publication.links;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$7(get_each_context$7(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Materials";
    			t5 = space();
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			div5 = element("div");
    			div5.textContent = "Abstract";
    			t8 = space();
    			div6 = element("div");
    			t9 = text(t9_value);
    			attr_dev(img, "alt", "image drawn from " + ctx.publication.title);
    			attr_dev(img, "src", ctx.publication.imgLink);
    			attr_dev(img, "class", "svelte-1ubekoh");
    			add_location(img, file$7, 76, 4, 1314);
    			attr_dev(div0, "class", "img-container svelte-1ubekoh");
    			add_location(div0, file$7, 75, 2, 1282);
    			attr_dev(a, "href", ctx.publication.link);
    			attr_dev(a, "class", "title svelte-1ubekoh");
    			add_location(a, file$7, 79, 4, 1430);
    			attr_dev(div1, "class", "flex-down svelte-1ubekoh");
    			add_location(div1, file$7, 78, 2, 1402);
    			attr_dev(div2, "class", "section-subtitle svelte-1ubekoh");
    			add_location(div2, file$7, 88, 2, 1625);
    			attr_dev(div3, "class", "flex svelte-1ubekoh");
    			add_location(div3, file$7, 90, 4, 1701);
    			attr_dev(div4, "class", "materials svelte-1ubekoh");
    			add_location(div4, file$7, 89, 2, 1673);
    			attr_dev(div5, "class", "section-subtitle svelte-1ubekoh");
    			add_location(div5, file$7, 96, 2, 1854);
    			attr_dev(div6, "class", "abstract svelte-1ubekoh");
    			add_location(div6, file$7, 97, 2, 1901);
    			attr_dev(div7, "class", "flex-down publication svelte-1ubekoh");
    			add_location(div7, file$7, 74, 0, 1244);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div0, img);
    			append_dev(div7, t0);
    			append_dev(div7, div1);
    			append_dev(div1, a);
    			append_dev(a, t1);
    			append_dev(div1, t2);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div7, t3);
    			append_dev(div7, div2);
    			append_dev(div7, t5);
    			append_dev(div7, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div7, t6);
    			append_dev(div7, div5);
    			append_dev(div7, t8);
    			append_dev(div7, div6);
    			append_dev(div6, t9);
    		},

    		p: function update(changed, ctx) {
    			if (changed.publication || changed.keys) {
    				each_value_1 = ctx.keys;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_1.length;
    			}

    			if (changed.publication) {
    				each_value = ctx.publication.links;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$7(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div3, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div7);
    			}

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$5($$self) {
    	
      const pubName = getShowPage();
      const publication = PUBLICATIONS.find(d => d.urlTitle === pubName);
      const keys = ['subtitle', 'date', 'authors', 'journal'];

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {};

    	return { publication, keys };
    }

    class ShowPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ShowPage", options, id: create_fragment$7.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/App.svelte";

    // (117:8) {:else}
    function create_else_block(ctx) {
    	var current;

    	var about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			about.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(about, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(about.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(about.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(about, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(117:8) {:else}", ctx });
    	return block;
    }

    // (115:48) 
    function create_if_block_3(ctx) {
    	var current;

    	var teaching = new Teaching({ $$inline: true });

    	const block = {
    		c: function create() {
    			teaching.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(teaching, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(teaching.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(teaching.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(teaching, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(115:48) ", ctx });
    	return block;
    }

    // (113:48) 
    function create_if_block_2$1(ctx) {
    	var current;

    	var projects = new Projects({ $$inline: true });

    	const block = {
    		c: function create() {
    			projects.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(projects, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(projects.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(projects.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(projects, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(113:48) ", ctx });
    	return block;
    }

    // (111:49) 
    function create_if_block_1$3(ctx) {
    	var current;

    	var showpage = new ShowPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			showpage.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(showpage, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(showpage.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(showpage.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(showpage, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$3.name, type: "if", source: "(111:49) ", ctx });
    	return block;
    }

    // (109:8) {#if currentSection === 'research'}
    function create_if_block$5(ctx) {
    	var current;

    	var research = new Research({ $$inline: true });

    	const block = {
    		c: function create() {
    			research.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(research, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(research.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(research.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(research, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$5.name, type: "if", source: "(109:8) {#if currentSection === 'research'}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var div6, div2, div1, h10, t1, h11, t3, h3, t5, div0, a0, t7, a1, t9, a2, t11, div5, t12, div4, t13, div3, current_block_type_index, if_block, current;

    	var mobileheader = new MobileHeader({
    		props: { currentSection: ctx.currentSection },
    		$$inline: true
    	});

    	var header = new Header({
    		props: { currentSection: ctx.currentSection },
    		$$inline: true
    	});

    	var if_block_creators = [
    		create_if_block$5,
    		create_if_block_1$3,
    		create_if_block_2$1,
    		create_if_block_3,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.currentSection === 'research') return 0;
    		if (ctx.currentSection === 'show-page') return 1;
    		if (ctx.currentSection === 'projects') return 2;
    		if (ctx.currentSection === 'teaching') return 3;
    		return 4;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			h10 = element("h1");
    			h10.textContent = "ANDREW";
    			t1 = space();
    			h11 = element("h1");
    			h11.textContent = "MCNUTT";
    			t3 = space();
    			h3 = element("h3");
    			h3.textContent = "VISUALIZATION";
    			t5 = space();
    			div0 = element("div");
    			a0 = element("a");
    			a0.textContent = "GITHUB";
    			t7 = space();
    			a1 = element("a");
    			a1.textContent = "TWITTER";
    			t9 = space();
    			a2 = element("a");
    			a2.textContent = "CV";
    			t11 = space();
    			div5 = element("div");
    			mobileheader.$$.fragment.c();
    			t12 = space();
    			div4 = element("div");
    			header.$$.fragment.c();
    			t13 = space();
    			div3 = element("div");
    			if_block.c();
    			attr_dev(h10, "class", "svelte-eyk0im");
    			add_location(h10, file$8, 93, 6, 1926);
    			attr_dev(h11, "class", "svelte-eyk0im");
    			add_location(h11, file$8, 94, 6, 1948);
    			attr_dev(h3, "class", "svelte-eyk0im");
    			add_location(h3, file$8, 95, 6, 1970);
    			attr_dev(a0, "href", "https://github.com/mcnuttandrew");
    			attr_dev(a0, "class", "svelte-eyk0im");
    			add_location(a0, file$8, 97, 8, 2013);
    			attr_dev(a1, "href", "https://twitter.com/_mcnutt_");
    			attr_dev(a1, "class", "svelte-eyk0im");
    			add_location(a1, file$8, 98, 8, 2074);
    			attr_dev(a2, "href", "https://www.mcnutt.in/assets/resume.pdf");
    			attr_dev(a2, "class", "svelte-eyk0im");
    			add_location(a2, file$8, 99, 8, 2133);
    			add_location(div0, file$8, 96, 6, 1999);
    			attr_dev(div1, "class", "info-container svelte-eyk0im");
    			add_location(div1, file$8, 92, 4, 1891);
    			attr_dev(div2, "class", "left-panel flex-down svelte-eyk0im");
    			add_location(div2, file$8, 91, 2, 1852);
    			attr_dev(div3, "class", "content-wrapper svelte-eyk0im");
    			add_location(div3, file$8, 107, 6, 2368);
    			attr_dev(div4, "class", "right-panel svelte-eyk0im");
    			add_location(div4, file$8, 105, 4, 2302);
    			attr_dev(div5, "class", "flex-down full-width svelte-eyk0im");
    			add_location(div5, file$8, 103, 2, 2225);
    			attr_dev(div6, "class", "flex full-height svelte-eyk0im");
    			add_location(div6, file$8, 90, 0, 1819);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div2);
    			append_dev(div2, div1);
    			append_dev(div1, h10);
    			append_dev(div1, t1);
    			append_dev(div1, h11);
    			append_dev(div1, t3);
    			append_dev(div1, h3);
    			append_dev(div1, t5);
    			append_dev(div1, div0);
    			append_dev(div0, a0);
    			append_dev(div0, t7);
    			append_dev(div0, a1);
    			append_dev(div0, t9);
    			append_dev(div0, a2);
    			append_dev(div6, t11);
    			append_dev(div6, div5);
    			mount_component(mobileheader, div5, null);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			mount_component(header, div4, null);
    			append_dev(div4, t13);
    			append_dev(div4, div3);
    			if_blocks[current_block_type_index].m(div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var mobileheader_changes = {};
    			if (changed.currentSection) mobileheader_changes.currentSection = ctx.currentSection;
    			mobileheader.$set(mobileheader_changes);

    			var header_changes = {};
    			if (changed.currentSection) header_changes.currentSection = ctx.currentSection;
    			header.$set(header_changes);

    			var previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(changed, ctx);
    			if (current_block_type_index !== previous_block_index) {
    				group_outros();
    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});
    				check_outros();

    				if_block = if_blocks[current_block_type_index];
    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}
    				transition_in(if_block, 1);
    				if_block.m(div3, null);
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(mobileheader.$$.fragment, local);

    			transition_in(header.$$.fragment, local);

    			transition_in(if_block);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(mobileheader.$$.fragment, local);
    			transition_out(header.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div6);
    			}

    			destroy_component(mobileheader);

    			destroy_component(header);

    			if_blocks[current_block_type_index].d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	
      let currentSection = getRoute();
      window.onhashchange = () => {
        $$invalidate('currentSection', currentSection = getRoute());
      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentSection' in $$props) $$invalidate('currentSection', currentSection = $$props.currentSection);
    	};

    	return { currentSection };
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$8.name });
    	}
    }

    const app = new App({target: document.body});

    return app;

}());
//# sourceMappingURL=bundle.js.map
