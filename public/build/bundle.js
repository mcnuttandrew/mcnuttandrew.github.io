
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
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

    const COLLABORATOR_LINKS = {
      'Agatha Kim': 'https://history.uchicago.edu/directory/agatha-kim',
      'Alex M. Clark': 'https://scholar.google.com/citations?user=4Gv4PboAAAAJ&hl=en',
      'Allison Morgan': 'https://allisonmorgan.github.io/',
      'Anamaria Crisan': 'https://amcrisan.github.io/',
      'Gordon Kindlmann': 'http://people.cs.uchicago.edu/~glk/',
      'Joel Franklin': 'http://people.reed.edu/~jfrankli/',
      'Krishna Dole': 'https://scholar.google.com/citations?user=J4TpF1YAAAAJ&hl=en',
      'Michael Correll': 'https://correll.io/',
      'Nelia Mann': 'https://www.union.edu/physics-and-astronomy/faculty-staff/nelia-mann',
      'Ravi Chugh': 'http://people.cs.uchicago.edu/~rchugh/',
      'Sean Ekins': 'https://scholar.google.com/citations?user=6NNfXAMAAAAJ&hl=en',
      'Varchas Gopalaswamy': 'https://scholar.google.com/citations?user=PxH1Z7kAAAAJ&hl=en',
    };

    const PUBLICATIONS = [
      {
        link: '',
        urlTitle: 'ivy',
        imgLink: 'converted-images/ivy-logo.jpg',
        title: 'Integrated Visualization Editing via Parameterized Declarative Templates',
        authors: 'Andrew McNutt, Ravi Chugh',
        journal: 'Proceedings of the 2021 ACM annual conference on Human Factors in Computing Systems',
        date: 'May 2021',
        links: [],
        abstract: ``,
        bibTex: `TODO`,
        type: 'conference / journal article',
      },
      {
        link: '',
        urlTitle: 'nearby',
        imgLink: 'converted-images/nearby-preview.jpg',
        title:
          'Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading',
        authors: 'Andrew McNutt, Agatha Kim, Sergio Elahi, Kazutaka Takahashi',
        journal: '2020 IEEE 5th Workshop on Visualization for the Digital Humanities (VIS4DH)',
        date: 'October 2020',
        links: [
          {
            name: 'about',
            link: '#/research/nearby',
          },
          {
            name: 'preprint',
            link: 'https://arxiv.org/pdf/2009.02384.pdf',
          },
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/sci-text-compare',
          },
          {
            name: 'live',
            link: 'https://goetheanddecandolle.rcc.uchicago.edu/',
          },
        ],
        abstract: `
    Distant reading methodologies make use of computational processes to aid in the analysis of large text corpora which might not be pliable to traditional methods of scholarly analysis due to their volume. While these methods have been applied effectively to a variety of types of texts and contexts, they can leave unaddressed the needs of scholars in the humanities disciplines like history, who often engage in close reading of sources. Complementing the close analysis of texts with some of the tools of distant reading, such as visualization, can resolve some of the issues. We focus on a particular category of this intersection—which we refer to as near-by reading—wherein an expert engages in a computer-mediated analysis of a text with which they are familiar. We provide an example of this approach by developing a visual analysis application for the near-by reading of 19th-century scientific writings by J. W. von Goethe and A. P. de Candolle. We show that even the most formal and public texts, such as scientific treatises, can reveal unexpressed personal biases and philosophies that the authors themselves might not have recognized.
    `,
        bibTex: `TODO`,
        type: 'extended abstract / workshop paper',
      },
      {
        link: '',
        urlTitle: 'table-cartogram',
        imgLink: 'converted-images/tc-preview.jpg',
        title: 'A Minimally Constrained Optimization Algorithm for Table Cartograms',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        journal: 'VIS 2020 - InfoVIS Poster Track - 🏆 Honorable Mention for Best Poster Research 🏆',
        date: 'October 2020',
        links: [
          {
            name: 'about',
            link: '#/research/table-cartogram',
          },
          {
            name: 'preprint',
            link: 'https://osf.io/kem6j/',
          },
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/table-cartogram',
          },
          {
            name: 'poster',
            link: './assets/table-cartogram-poster.pdf',
          },
          {
            name: 'live',
            link: 'https://www.mcnutt.in/table-cartogram/',
          },
        ],
        abstract: `
    Table cartograms are a recent type of data visualization that encodes numerical tabular data as a grid of quadrilaterals whose area areb rought into correspondence with the input data. The overall effect is similar to that of a heat map that has been ‘area-ed‘ rather than shaded. There exist several algorithms for creating these structures—variously utilizing techniques such as computational geometry and numerical optimization —yet each of them impose aesthetically-motivated conditions that impede fine tuning or manipulation of the visual aesthetic of the output. In this work we contribute an optimization algorithm for creating table cartograms that is able to compute a variety of table cartograms layouts for a single dataset. We make our web-ready implementation available as table-cartogram.ts
    `,
        bibTex: `TODO`,
        type: 'poster',
      },
      {
        link: 'https://arxiv.org/pdf/2001.02316.pdf',
        urlTitle: 'mirage',
        imgLink: 'converted-images/surfacing-visualization-mirages.jpg',
        title: 'Surfacing Visualization Mirages',
        authors: 'Andrew McNutt, Gordon Kindlmann, Michael Correll',
        journal:
          'Proceedings of the 2020 ACM annual conference on Human Factors in Computing Systems - 🏆 Honorable Mention for Best Paper 🏆',
        date: 'April 2020',
        links: [
          {
            name: 'about',
            link: '#/research/mirage',
          },
          {name: 'preprint', link: 'https://arxiv.org/pdf/2001.02316.pdf'},
          {name: 'live', link: 'https://metamorphic-linting.netlify.com/'},
          {
            name: 'code',
            link: 'https://github.com/tableau/Visualization-Linting',
          },
          {name: 'osf', link: 'https://osf.io/je3x9'},
          {name: 'slides', link: './assets/mirage-talk.pdf'},
          {name: 'talk', link: 'https://www.youtube.com/watch?v=arHbVFbq-mQ'},
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
        bibTex: `TODO`,
        type: 'conference / journal article',
      },
      {
        link: 'assets/altchi-tarot-cameraready.pdf',
        imgLink: 'converted-images/vis-tarot.jpg',
        urlTitle: 'tarot',
        title: 'Divining Insights: Visual Analytics Through Cartomancy',
        authors: 'Andrew McNutt, Anamaria Crisan, Michael Correll',
        journal: 'Proceedings of alt.CHI',
        date: 'April 2020',
        links: [
          {
            name: 'about',
            link: '#/research/tarot',
          },
          {
            name: 'preprint',
            link: 'assets/altchi-tarot-cameraready.pdf',
          },
          {name: 'live', link: 'https://vis-tarot.netlify.com/'},
          {
            name: 'code',
            link: 'https://github.com/mcorrell/vis-tarot',
          },
          {name: 'slides', link: './assets/tarot-talk.pdf'},
          {name: 'talk', link: 'https://www.youtube.com/watch?v=fRA42BjyG_Q'},
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
        bibTex: `TODO`,
        type: 'extended abstract / workshop paper',
      },
      {
        imgLink: 'converted-images/agathas-thing.jpg',
        title: 'Textual Analysis & Comparison National Forms of Scientific Texts: Goethe + de Candolle',
        authors: 'Agatha Kim, Andrew McNutt, Sergio Elahi, Kazutaka Takahashi, Robert J Richards',
        journal: 'MindBytes Research Symposium. 🏆 Best Poster in Visualization 🏆',
        date: 'November 2019',
        links: [
          {name: 'poster', link: 'assets/posterkim102519.pdf'},
          // {name: 'live', link: 'https://goetheanddecandolle.rcc.uchicago.edu/'},
          {
            name: 'award',
            link:
              'https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research',
          },
        ],
        abstract: `
    When the 19th-century European scientists were evaluating each other's ideas, they frequently validated their opinions by referring to the nationality of a given scientist as an explanatory type. Is there such a thing as â€œnational scienceâ€? This project examines widely-held ideas about the German and French styles of science in early 19th-century France. During this politically volatile period scientists found themselves in a difficult position. Between the aggressive political reality and the ideals of the cosmopolitan scientific community; as well as between the popularized image of national differences and the actual comparisons of the scientific ideas across national borders. As a case study, Goethe's and Candolle's botanical ideas, their receptions in France, and their actual texts are compared. We contrast these texts in detail through several types of interactive visualizations.
    `,
        type: 'poster',
      },
      // link to award: https://rcc.uchicago.edu/about-rcc/news-features/mind-bytes-2019-tipping-point-computational-and-ai-research
      {
        link: 'assets/forum-explorer-paper.pdf',
        imgLink: 'converted-images/forested-tree-view-example.jpg',
        title:
          'Improving the Scalability of Interactive Visualization Systems for Exploring Threaded Conversations',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        urlTitle: 'forum-explorer-eurovis',
        journal: 'Proceedings of the Eurographics Conference on Visualization "EuroVis" - Posters',
        date: 'June 2019',
        links: [
          {name: 'paper', link: 'assets/forum-explorer-paper.pdf'},
          {name: 'poster', link: 'assets/forum-explorer-poster.pdf'},
          {name: 'live', link: 'https://www.mcnutt.in/forum-explorer/'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/forum-explorer',
          },
          {name: 'osf', link: 'https://osf.io/nrhqw/'},
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
    }`,
        type: 'poster',
      },
      {
        link: 'assets/McNutt_Kindlmann_2018.pdf',
        imgLink: 'converted-images/lint-pic.jpg',
        urlTitle: 'linting-visguides',
        title: 'Linting for Visualization: Towards a Practical Automated Visualization Guidance System',
        authors: 'Andrew McNutt, Gordon Kindlmann',
        journal:
          '2nd IEEE VIS Workshop on Creation, Curation, Critique and Conditioning of Principles and Guidelines in Visualization ("VisGuides")',
        date: 'October 2018',
        links: [
          {name: 'paper', link: 'assets/McNutt_Kindlmann_2018.pdf'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/vislint_mpl',
          },
          {name: 'talk', link: 'talks/vis-lint-talk.pdf'},
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
    `,
        type: 'extended abstract / workshop paper',
      },
      {
        link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14',
        imgLink: 'converted-images/cdd-pic.jpg',
        urlTitle: 'reporter-assays',
        title: 'Data Mining and Computational Modeling of High-Throughput Screening Datasets',
        authors: `Sean Ekins, Alex M. Clark, Krishna Dole, Kellan Gregory, Andrew McNutt,
    Anna Coulon Spektor, Charlie Weatherall, Nadia K Litterman, Barry A Bunin`,
        journal: 'Reporter Gene Assays',
        date: '2018',
        links: [
          {
            name: 'paper',
            link: 'https://link.springer.com/protocol/10.1007/978-1-4939-7724-6_14',
          },
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
    `,
        type: 'book chapter',
      },
      {
        link: 'https://arxiv.org/abs/1501.07537',
        imgLink: 'converted-images/qgrav-pic.jpg',
        title: 'The Schrodinger-Newton System with Self-field Coupling',
        authors: 'Joel Franklin, Youdan Guo, Andrew McNutt, Allison Morgan',
        urlTitle: 'qgrav',
        journal: 'Journal of Classical and Quantum Gravity',
        date: '2015',
        links: [
          {name: 'paper', link: 'https://arxiv.org/abs/1501.07537'},
          {name: 'talk', link: 'assets/QGravPresentation.pdf'},
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
    `,
        type: 'conference / journal article',
      },
      {
        link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143',
        imgLink: 'converted-images/cdd-models-pic.jpg',
        title: 'Open source Bayesian models. 1. Application to ADME/Tox and drug discovery datasets.',
        urlTitle: 'bayes-models',
        authors: `Alex M. Clark, Krishna Dole, Anna Coulon-Spektor, Andrew McNutt,
    George Grass, Joel S. Freundlich, Robert C. Reynolds, and Sean Ekins`,
        journal: 'Journal of Chemical Information and Modeling',
        date: '2015',
        links: [
          {
            name: 'paper',
            link: 'http://pubs.acs.org/doi/abs/10.1021/acs.jcim.5b00143',
          },
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
    enable biocomputation across distributed private or public datasets to enhance drug discovery.`,
        type: 'conference / journal article',
      },
      {
        link: 'assets/thesis.pdf',
        imgLink: 'converted-images/thesis-pic.jpg',
        title: 'Nonequivalent Lagrangian Mechanics',
        urlTitle: 'nonequiv',
        authors: 'Andrew McNutt (Advised by Nelia Mann)',
        journal: 'Undergraduate thesis. Reed College',
        date: 'June 2014',
        links: [
          {name: 'thesis', link: 'assets/thesis.pdf'},
          {name: 'talk', link: './assets/nlm-talk.pdf'},
        ],
        abstract: `
    In this thesis we study a modern formalism known as Nonequivalent Lagrangian
    Mechanics, that is constructed on top of the traditional Lagrangian theory of mechanics.
    By making use of the non-uniqueness of the Lagrangian representation of dynamical
    systems, we are able to generate conservation laws in a way that is novel and, in
    many cases much faster than the traditional Noetherian analysis. In every case that
    we examine, these invariants turn out to be Noetherian invariants in disguise. We
    apply this theory to a wide variety of systems including predator-prey dynamics and
    damped driven harmonic motion.`,
        type: 'thesis',
      },
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
        subtitle: 'An overview of four useful patterns for developing visualizations in react.',
        links: [
          {
            name: 'slides',
            link: 'http://tinyurl.com/reactvisdesignpatterns',
          },
        ],
      },
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
        title: 'A Brief Saga Concerning the Making of a Tarot Deck About the American Highway System',
        subtitle: 'A little essay about making',
        date: 'Personal Blog. December 10, 2018',
        link:
          'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
        links: [
          {
            name: 'blog post',
            link:
              'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
          },
          {name: 'github', link: 'https://github.com/mcnuttandrew/tarot-deck'},
        ],
      },
      {
        imgLink: 'converted-images/advanced-react-vis-pic.jpg',
        title: 'Advanced Visualization with react-vis',
        subtitle: 'Using Voronois, single pass rendering, and canvas components for amazing user experiences',
        date: 'Towards Data Science. May 21, 2018',
        link: 'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4',
        links: [
          {
            name: 'blog post',
            link: 'https://towardsdatascience.com/advanced-visualization-with-react-vis-efc5c6667b4',
          },
          // {name: 'talk', link: 'http://tinyurl.com/reactvisdesignpatterns'},
          {
            name: 'code',
            link: 'https://github.com/mcnuttandrew/advanced-react-vis-tutorial',
          },
        ],
      },
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
        section: 'visualization',
      },
      {
        title: 'Data is Plural Search',
        dates: 'May 2020',
        sourceLink: 'https://github.com/mcnuttandrew/data-is-plural-search',
        link: 'https://data-is-plural-search.netlify.app/',
        imgLink: 'converted-images/data-is-plural.jpg',
        text: 'A simple web view for the data is plural news letter by Singer-Vine.',
        section: 'tech',
      },

      {
        title: 'Cycles & Rain / Seasons In Size',
        dates: 'July 2019',
        sourceLink: 'https://github.com/mcnuttandrew/cycles-rain-seasons-in-size/',
        link: 'https://www.mcnutt.in/cycles-rain-seasons-in-size/',
        imgLink: 'converted-images/cycles-in-rain.jpg',
        text: 'A little infographic about bicycle ridership in Seattle featuring table cartograms.',
        section: 'visualization',
      },
      {
        title: 'CSSQL',
        dates: 'May 2019',
        sourceLink: 'https://github.com/mcnuttandrew/cssql',
        link: 'https://www.npmjs.com/package/node-cssql',
        imgLink: 'converted-images/cssql-logo.jpg',
        text:
          'A new answer to this css-in-js question: css in sql. A sql-ddl to css transpiler written in haskell, available on npm.',
        section: 'tech',
      },
      {
        title: 'Forum Explorer',
        dates: 'April 2019',
        sourceLink: 'https://github.com/mcnuttandrew/forum-explorer',
        link: 'https://www.mcnutt.in/forum-explorer/',
        imgLink: 'converted-images/forum-ex-pic.jpg',
        text: 'A chrome extension and website that allows users to explore threaded conversations using trees.',
        section: 'visualization',
      },
      {
        title: 'Readability As A Service',
        dates: 'November 2018',
        sourceLink: 'https://github.com/mcnuttandrew/flesch-kincaid-as-a-service',
        link: 'https://www.mcnutt.in/flesch-kincaid-as-a-service/',
        imgLink: 'converted-images/readability.jpg',
        text: `Have you ever wanted specific numerical quantification on how readable
    your prose is? This micro app wraps the textstat package as a webservice so that you can easily check.`,
        section: 'tech',
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
        section: 'tech',
      },
      {
        title: 'Constellations of Home - XMAS CARDS 2017',
        dates: 'December 2017',
        link: 'http://www.mcnutt.in/home-graphs/',
        sourceLink: 'https://github.com/mcnuttandrew/home-graphs',
        imgLink: 'converted-images/home-graphs.jpg',
        text: `Over the 2017 holidays I spent some time meditating on memory, home, and
    graph theory, which led to my making these christmas cards.`,
        section: 'visualization',
      },
      {
        title: 'On The Shape of American Cities I/II',
        dates: 'July 2017',
        link: 'http://www.mcnutt.in/city-size/',
        sourceLink: 'https://github.com/mcnuttandrew/city-size',
        imgLink: 'converted-images/city-size.jpg',
        text: 'A print graphic describing the shape of the 100 most populous American cities.',
        section: 'visualization',
      },
      {
        title: 'Pantone: Color of the year',
        dates: 'Updated yearly, starting 2016',
        link: 'http://www.mcnutt.in/color-of-the-year/',
        sourceLink: 'https://github.com/mcnuttandrew/color-of-the-year',
        imgLink: 'converted-images/color-of-year.jpg',
        text: 'A small exploration of the glory and wonder that is pantones color of the year.',
        section: 'visualization',
      },
      {
        title: 'react-vis',
        dates: '2016 - 2019',
        link: 'http://uber.github.io/react-vis/#/',
        sourceLink: 'https://github.com/uber/react-vis',
        imgLink: 'converted-images/react-vis-image.jpg',
        text: 'A charting library for the react ecosystem.',
        section: 'visualization',
      },
      {
        title: 'CSV Conversion',
        dates: 'December 2016',
        link: 'http://www.mcnutt.in/csv-conversion/',
        sourceLink: 'https://github.com/mcnuttandrew/csv-conversion',
        imgLink: 'converted-images/csv-conversion.jpg',
        text:
          'A handy client-side csv to json converter. I built this little app, because my favorite conversion site got knocked down and I wanted to improve the UI.',
        section: 'tech',
      },
      {
        title: 'Personal Timeline',
        dates: 'June 2016',
        link: 'http://www.mcnutt.in/personal-timeline/',
        sourceLink: 'https://github.com/mcnuttandrew/personal-timeline',
        imgLink: 'converted-images/personal-time.jpg',
        text: 'A brief timeline of my life, a resume through a dark mirror if you will.',
        section: 'visualization',
      },
      {
        title: 'Unnamed Tarot Deck',
        dates: 'Dec 2015 - June 2016',
        link:
          'https://medium.com/@mcnutt/a-brief-saga-concerning-the-making-of-a-tarot-deck-about-the-american-highway-system-2eaebf3320c8',
        sourceLink: 'https://github.com/mcnuttandrew/tarot-deck',
        imgLink: 'converted-images/tarot-image.jpg',
        text: 'A tarot tech themed around the signage and spirit of the American highway system.',
        section: 'art',
      },
      {
        title: 'Why Not Ipsum',
        dates: 'September 2014',
        link: 'http://why-not-ipsum.herokuapp.com/',
        sourceLink: 'https://github.com/mcnuttandrew/Why-Not-Zoidberg',
        imgLink: 'converted-images/why-not-image.jpg',
        text:
          'A Lorem Ipsum generator populated by Zoidberg quotes, built following RESTful design practices. Included a large series of data scrapes, which were necessarily followed by intensive data cleaning.',
        section: 'tech',
      },
      {
        title: 'N-Hedron',
        dates: 'September - December 2013',
        imgLink: 'converted-images/n-hydron.jpg',
        link: 'converted-images/nhedron.pdf',
        text:
          'An independent college project regarding the effacy of various numerical algorithms for constructing the n-hedron.',
        section: 'tech',
      },

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
        date: 'Winter 2021',
        role: 'Instructor',
        location: 'UChicago',
        link: 'https://capp-30239-winter-2021.netlify.com/',
      },
      {
        title: 'CAPP 30239 - Data Visualization For Public Policy',
        date: 'Winter 2020',
        role: 'Instructor',
        location: 'UChicago',
        link: 'https://capp-30239-winter-2020.netlify.com/',
      },
      {
        title: 'Visualization Research Reading Group',
        date: 'February 2019-Present',
        role: 'Other',
        location: 'UChicago',
        fancyTitle: 'Director',
        link: 'https://uchicago-vis-pl-lab.github.io/vis-reading-group/',
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2020',
        role: 'Instructor',
        location: 'UChicago',
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2019',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'http://people.cs.uchicago.edu/~glk/class/datavis19/',
      },
      {
        title: 'CAPP 30239 - Data Visualization For Public Policy',
        date: 'Winter 2019',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://twitter.com/AlexCEngler/status/1101245224733605891?s=20',
      },
      {
        title: 'CAPP 30121 - Computer Science with Applications 1',
        date: 'Fall 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://classes.cs.uchicago.edu/archive/2018/fall/30121-1/',
      },
      {
        title: 'CMSC 23900 - Data Visualization',
        date: 'Spring 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'http://people.cs.uchicago.edu/~glk/class/datavis18/',
      },
      {
        title: 'CMSC 15100 - Introduction to Computer Science 1',
        date: 'Winter 2018',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://www.classes.cs.uchicago.edu/archive/2018/winter/15100-1/syllabus.html',
      },
      {
        title: 'CMSC 12100 - Computer Science with Applications 1.',
        date: 'Fall 2017',
        role: 'Teaching Assistant',
        location: 'UChicago',
        link: 'https://www.classes.cs.uchicago.edu/archive/2017/fall/12100-1/',
      },
      {
        title: 'Uberversity Speaker',
        date: '2016-2017',
        role: 'Instructor',
        fancyTitle: 'Lecturer',
        location: 'Uber',
      },
      {
        title: 'Visualization Eng-ucation',
        date: '2015-2017',
        role: 'Instructor',
        fancyTitle: 'Lecturer',
        location: 'Uber',
      },
      {
        title: 'Physics 101 - General Physics I',
        date: '2012',
        role: 'Teaching Assistant',
        location: 'Reed College',
      },
      {
        title: 'F.L. Griffin Mathfest',
        date: '2014',
        role: 'Teaching Assistant',
        location: 'Reed College',
      },
    ];

    const NEWS = [
      {
        date: 'October 2020',
        content:
          '["A Minimally Constrained Optimization Algorithm for Table Cartograms"](https://osf.io/kem6j/) won a 🏆honorable mention🏆 in the IEEEVIS InfoVis poster track.',
      },
      {
        date: 'Sept 2020',
        content:
          'Our paper ["Supporting Expert Close Analysis of Historical Scientific Writings: A Case Study for Near-by Reading"](https://arxiv.org/pdf/2009.02384.pdf) on mixing close and distant reading for 19th century scientific writing was accepted to [VIS4DH20](http://www.vis4dh.org/).',
      },
      {
        date: 'March 2020',
        content:
          'Our paper "Surfacing Visualization Mirages" won a 🏆best paper honorable mention🏆 at CHI2020!!',
      },
      {
        date: 'Feburary 2020',
        content:
          'Our paper on using tarot for visual analytics "Divining Insights: Visual Analytics Through Cartomancy" was accepted to alt.chi 2020',
      },
      {
        date: 'January 2020',
        content:
          'Started teaching my first class as the instructor of record! ("Data Visualization for Public Policy")',
      },
      {
        date: 'December 2019',
        content: 'Received my Masters of Computer Science!!',
      },
      {
        date: 'November 2019',
        content:
          'Our poster on using graph visualizations to compare 19th century scentific writing was shown at both MindBytes (where it won best poster!) and the 2019 Chicago Colloquium on Digital Humanities.',
      },
      {
        date: 'October 2019',
        content:
          'Had a great time at IEEEVIS 2019 in Vancouver, BC! Helped contribute to the [Open Access Vis](http://oavis.org/) efforts for the conference.',
      },
      {
        date: 'Sept 2019',
        content:
          'Two of my vis projects (ForumExplorer and Cycles in Rain) were Long-Listed at the Kantar Information is Beautiful Awards.',
      },
      {
        date: 'June 2019',
        content: 'Started an internship with Tableau Research in Seattle',
      },
      {
        date: 'June 2019',
        content: '🎉🎉🎉 Successfully defended my masters thesis 🎉🎉🎉',
      },
      {
        date: 'May 2019',
        content:
          'Presented our [poster on ForumExplorer](https://www.mcnutt.in/forum-explorer/) at EuroVis 2019 in Porto, Portugal.',
      },
      {
        date: 'May 2019',
        content:
          'I was awarded the UChicago Department of Computer Science TA Prize for my work TAing Spring 2018 - Winter 2019.',
      },
      {
        date: 'May 2019',
        content:
          "My piece 'On The Road To The Lake: Debugging in Tryptic' won second prize in the print media category of the UChicago Art+Science expo.",
      },
      {
        date: 'October 2018',
        content:
          'Presented our paper on linting charts created in matplotlib at VisGuides, a IEEEVIS 2018 workshop. ',
      },
      // {
      //   date: 'September 2018',
      //   content: 'Started my second year of grad school!'
      // }
    ];

    function classnames(classObject) {
      return Object.keys(classObject)
        .filter((name) => classObject[name])
        .join(' ');
    }

    const routes = new Set(['cv', 'publications', 'projects', 'about', 'teaching']);
    function getRoute() {
      const locationSplit = location.href.split('/');
      const naiveLocation = locationSplit[locationSplit.length - 1].toLowerCase();
      if (
        location.href.includes('research') &&
        naiveLocation !== 'research' &&
        PUBLICATIONS.map((d) => d.urlTitle).includes(naiveLocation)
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

    // (34:4) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
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
    			attr_dev(a, "class", a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.section, padding: true})) + " svelte-czmeur");
    			add_location(a, file, 34, 6, 574);
    			this.first = a;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentSection) && a_class_value !== (a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.section, padding: true})) + " svelte-czmeur")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(34:4) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}", ctx });
    	return block;
    }

    function create_fragment(ctx) {
    	var div2, div0, each_blocks = [], each_1_lookup = new Map(), t0, div1, a0, img0, t1, a1, img1, t2, a2, img2;

    	let each_value = ['about', 'publications', 'projects', 'cv'];

    	const get_key = ctx => ctx.section;

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			div1 = element("div");
    			a0 = element("a");
    			img0 = element("img");
    			t1 = space();
    			a1 = element("a");
    			img1 = element("img");
    			t2 = space();
    			a2 = element("a");
    			img2 = element("img");
    			attr_dev(div0, "class", "flex");
    			add_location(div0, file, 32, 2, 472);
    			attr_dev(img0, "src", "icons/twitter.svg");
    			attr_dev(img0, "alt", "link to twitter account");
    			attr_dev(img0, "class", "svelte-czmeur");
    			add_location(img0, file, 40, 43, 820);
    			attr_dev(a0, "href", "https://twitter.com/_mcnutt_");
    			attr_dev(a0, "class", "svelte-czmeur");
    			add_location(a0, file, 40, 4, 781);
    			attr_dev(img1, "src", "icons/github.svg");
    			attr_dev(img1, "alt", "link to github account");
    			attr_dev(img1, "class", "svelte-czmeur");
    			add_location(img1, file, 41, 46, 932);
    			attr_dev(a1, "href", "https://github.com/mcnuttandrew");
    			attr_dev(a1, "class", "svelte-czmeur");
    			add_location(a1, file, 41, 4, 890);
    			attr_dev(img2, "src", "icons/scholar.svg");
    			attr_dev(img2, "alt", "link to scholar page");
    			attr_dev(img2, "class", "svelte-czmeur");
    			add_location(img2, file, 42, 69, 1065);
    			attr_dev(a2, "href", "https://scholar.google.com/citations?user=BFOrUoQAAAAJ");
    			attr_dev(a2, "class", "svelte-czmeur");
    			add_location(a2, file, 42, 4, 1000);
    			attr_dev(div1, "class", "flex align space-between svelte-czmeur");
    			add_location(div1, file, 39, 2, 738);
    			attr_dev(div2, "class", "flex-down bar align header svelte-czmeur");
    			add_location(div2, file, 31, 0, 429);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, a0);
    			append_dev(a0, img0);
    			append_dev(div1, t1);
    			append_dev(div1, a1);
    			append_dev(a1, img1);
    			append_dev(div1, t2);
    			append_dev(div1, a2);
    			append_dev(a2, img2);
    		},

    		p: function update(changed, ctx) {
    			const each_value = ['about', 'publications', 'projects', 'cv'];
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, null, get_each_context);
    		},

    		i: noop,
    		o: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
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
    	child_ctx.x = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.section = list[i];
    	return child_ctx;
    }

    // (72:2) {#if open}
    function create_if_block(ctx) {
    	var div, each_blocks_1 = [], each0_lookup = new Map(), t;

    	let each_value_1 = ['about', 'publications', 'projects', 'cv'];

    	const get_key = ctx => ctx.section;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = ctx.externalLinks;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div, "class", "flex-down margin-bottom svelte-hz9bf5");
    			add_location(div, file$1, 72, 4, 1565);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks_1[i].m(div, null);
    			}

    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			const each_value_1 = ['about', 'publications', 'projects', 'cv'];
    			each_blocks_1 = update_keyed_each(each_blocks_1, changed, get_key, 1, ctx, each_value_1, each0_lookup, div, destroy_block, create_each_block_1, t, get_each_context_1);

    			if (changed.externalLinks || changed.classnames || changed.currentSection) {
    				each_value = ctx.externalLinks;

    				let i;
    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(72:2) {#if open}", ctx });
    	return block;
    }

    // (74:6) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
    function create_each_block_1(key_1, ctx) {
    	var a, t_value = ctx.section.toUpperCase() + "", t, a_class_value;

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "/#/" + ctx.section);
    			attr_dev(a, "class", a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.section, padding: true})) + " svelte-hz9bf5");
    			add_location(a, file$1, 74, 8, 1690);
    			this.first = a;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentSection) && a_class_value !== (a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.section, padding: true})) + " svelte-hz9bf5")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(74:6) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}", ctx });
    	return block;
    }

    // (79:6) {#each externalLinks as x}
    function create_each_block$1(ctx) {
    	var a, t0_value = ctx.x.name.toUpperCase() + "", t0, t1, img, t2, a_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			attr_dev(img, "src", "icons/" + ctx.x.name + ".svg");
    			attr_dev(img, "alt", "link to " + ctx.x.name + " account");
    			add_location(img, file$1, 83, 10, 2064);
    			attr_dev(a, "href", ctx.x.link);
    			attr_dev(a, "class", a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.x.name, padding: true, externalLink: true})) + " svelte-hz9bf5");
    			add_location(a, file$1, 79, 8, 1890);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, img);
    			append_dev(a, t2);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.currentSection) && a_class_value !== (a_class_value = "" + null_to_empty(classnames({selected: ctx.currentSection === ctx.x.name, padding: true, externalLink: true})) + " svelte-hz9bf5")) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(79:6) {#each externalLinks as x}", ctx });
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
    			add_location(h3, file$1, 61, 4, 1227);
    			attr_dev(rect0, "x", "0");
    			attr_dev(rect0, "y", "0");
    			attr_dev(rect0, "width", "25");
    			attr_dev(rect0, "height", "3");
    			add_location(rect0, file$1, 65, 8, 1369);
    			attr_dev(rect1, "x", "0");
    			attr_dev(rect1, "y", "7");
    			attr_dev(rect1, "width", "25");
    			attr_dev(rect1, "height", "3");
    			add_location(rect1, file$1, 66, 8, 1420);
    			attr_dev(rect2, "x", "0");
    			attr_dev(rect2, "y", "14");
    			attr_dev(rect2, "width", "25");
    			attr_dev(rect2, "height", "3");
    			add_location(rect2, file$1, 67, 8, 1471);
    			attr_dev(svg, "transform", svg_transform_value = "rotate(" + ctx.$rotation + ")");
    			attr_dev(svg, "width", "25px");
    			attr_dev(svg, "height", "21px");
    			add_location(svg, file$1, 64, 6, 1296);
    			add_location(div0, file$1, 62, 4, 1254);
    			attr_dev(div1, "class", "flex align svelte-hz9bf5");
    			add_location(div1, file$1, 60, 2, 1174);
    			attr_dev(div2, "class", "flex-down bar header svelte-hz9bf5");
    			add_location(div2, file$1, 59, 0, 1137);
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
        easing: cubicOut,
      }); validate_store(rotation, 'rotation'); component_subscribe($$self, rotation, $$value => { $rotation = $$value; $$invalidate('$rotation', $rotation); });

      let { currentSection } = $$props;
      let open = false;
      function toggleHeader() {
        $$invalidate('open', open = !open);
        rotation.set(!$rotation ? 90 : 0);
      }
      const externalLinks = [
        {link: 'https://twitter.com/_mcnutt_', name: 'twitter'},
        {link: 'https://scholar.google.com/citations?user=BFOrUoQAAAAJ', name: 'scholar'},
        {link: 'https://github.com/mcnuttandrew', name: 'github'},
      ];

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
    		externalLinks,
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

    var ABOUT = "I am a PhD student in Computer Science at the University of Chicago. My work falls in the intersection of the Data Visualization and HCI fields. \n\n<br/>\n\nI'm interested in theories of visualization (and finding opportunities for the operationalization of those ideas), as well as the design of user interfaces for knowledge-based tasks (such as visual analytics and creative coding) with an eye towards leveraging tools from programming languages and software engineering in those designs.  \n\n<br/>\nIn the near past I worked as a Data Visualization Engineer for a variety of companies in San Francisco. \nI got a formal education in physics from Reed College in Portland, and an informal education in web development from App Academy. \nI am a fan of deserts, buffalo, and bicycles.";

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn, basedir, module) {
    	return module = {
    		path: basedir,
    		exports: {},
    		require: function (path, base) {
    			return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    		}
    	}, fn(module, module.exports), module.exports;
    }

    function commonjsRequire () {
    	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
    }

    var marked = createCommonjsModule(function (module, exports) {
    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2020, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    /**
     * DO NOT EDIT THIS FILE
     * The code in this file is generated from files in ./src/
     */

    (function (global, factory) {
       module.exports = factory() ;
    }(commonjsGlobal, (function () {
      function _defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
          var descriptor = props[i];
          descriptor.enumerable = descriptor.enumerable || false;
          descriptor.configurable = true;
          if ("value" in descriptor) descriptor.writable = true;
          Object.defineProperty(target, descriptor.key, descriptor);
        }
      }

      function _createClass(Constructor, protoProps, staticProps) {
        if (protoProps) _defineProperties(Constructor.prototype, protoProps);
        if (staticProps) _defineProperties(Constructor, staticProps);
        return Constructor;
      }

      function _unsupportedIterableToArray(o, minLen) {
        if (!o) return;
        if (typeof o === "string") return _arrayLikeToArray(o, minLen);
        var n = Object.prototype.toString.call(o).slice(8, -1);
        if (n === "Object" && o.constructor) n = o.constructor.name;
        if (n === "Map" || n === "Set") return Array.from(o);
        if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
      }

      function _arrayLikeToArray(arr, len) {
        if (len == null || len > arr.length) len = arr.length;

        for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

        return arr2;
      }

      function _createForOfIteratorHelperLoose(o, allowArrayLike) {
        var it;

        if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
          if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            return function () {
              if (i >= o.length) return {
                done: true
              };
              return {
                done: false,
                value: o[i++]
              };
            };
          }

          throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
        }

        it = o[Symbol.iterator]();
        return it.next.bind(it);
      }

      function createCommonjsModule(fn, module) {
      	return module = { exports: {} }, fn(module, module.exports), module.exports;
      }

      var defaults = createCommonjsModule(function (module) {
        function getDefaults() {
          return {
            baseUrl: null,
            breaks: false,
            gfm: true,
            headerIds: true,
            headerPrefix: '',
            highlight: null,
            langPrefix: 'language-',
            mangle: true,
            pedantic: false,
            renderer: null,
            sanitize: false,
            sanitizer: null,
            silent: false,
            smartLists: false,
            smartypants: false,
            tokenizer: null,
            walkTokens: null,
            xhtml: false
          };
        }

        function changeDefaults(newDefaults) {
          module.exports.defaults = newDefaults;
        }

        module.exports = {
          defaults: getDefaults(),
          getDefaults: getDefaults,
          changeDefaults: changeDefaults
        };
      });
      var defaults_1 = defaults.defaults;
      var defaults_2 = defaults.getDefaults;
      var defaults_3 = defaults.changeDefaults;

      /**
       * Helpers
       */
      var escapeTest = /[&<>"']/;
      var escapeReplace = /[&<>"']/g;
      var escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
      var escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
      var escapeReplacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      };

      var getEscapeReplacement = function getEscapeReplacement(ch) {
        return escapeReplacements[ch];
      };

      function escape(html, encode) {
        if (encode) {
          if (escapeTest.test(html)) {
            return html.replace(escapeReplace, getEscapeReplacement);
          }
        } else {
          if (escapeTestNoEncode.test(html)) {
            return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
          }
        }

        return html;
      }

      var unescapeTest = /&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig;

      function unescape(html) {
        // explicitly match decimal, hex, and named HTML entities
        return html.replace(unescapeTest, function (_, n) {
          n = n.toLowerCase();
          if (n === 'colon') return ':';

          if (n.charAt(0) === '#') {
            return n.charAt(1) === 'x' ? String.fromCharCode(parseInt(n.substring(2), 16)) : String.fromCharCode(+n.substring(1));
          }

          return '';
        });
      }

      var caret = /(^|[^\[])\^/g;

      function edit(regex, opt) {
        regex = regex.source || regex;
        opt = opt || '';
        var obj = {
          replace: function replace(name, val) {
            val = val.source || val;
            val = val.replace(caret, '$1');
            regex = regex.replace(name, val);
            return obj;
          },
          getRegex: function getRegex() {
            return new RegExp(regex, opt);
          }
        };
        return obj;
      }

      var nonWordAndColonTest = /[^\w:]/g;
      var originIndependentUrl = /^$|^[a-z][a-z0-9+.-]*:|^[?#]/i;

      function cleanUrl(sanitize, base, href) {
        if (sanitize) {
          var prot;

          try {
            prot = decodeURIComponent(unescape(href)).replace(nonWordAndColonTest, '').toLowerCase();
          } catch (e) {
            return null;
          }

          if (prot.indexOf('javascript:') === 0 || prot.indexOf('vbscript:') === 0 || prot.indexOf('data:') === 0) {
            return null;
          }
        }

        if (base && !originIndependentUrl.test(href)) {
          href = resolveUrl(base, href);
        }

        try {
          href = encodeURI(href).replace(/%25/g, '%');
        } catch (e) {
          return null;
        }

        return href;
      }

      var baseUrls = {};
      var justDomain = /^[^:]+:\/*[^/]*$/;
      var protocol = /^([^:]+:)[\s\S]*$/;
      var domain = /^([^:]+:\/*[^/]*)[\s\S]*$/;

      function resolveUrl(base, href) {
        if (!baseUrls[' ' + base]) {
          // we can ignore everything in base after the last slash of its path component,
          // but we might need to add _that_
          // https://tools.ietf.org/html/rfc3986#section-3
          if (justDomain.test(base)) {
            baseUrls[' ' + base] = base + '/';
          } else {
            baseUrls[' ' + base] = rtrim(base, '/', true);
          }
        }

        base = baseUrls[' ' + base];
        var relativeBase = base.indexOf(':') === -1;

        if (href.substring(0, 2) === '//') {
          if (relativeBase) {
            return href;
          }

          return base.replace(protocol, '$1') + href;
        } else if (href.charAt(0) === '/') {
          if (relativeBase) {
            return href;
          }

          return base.replace(domain, '$1') + href;
        } else {
          return base + href;
        }
      }

      var noopTest = {
        exec: function noopTest() {}
      };

      function merge(obj) {
        var i = 1,
            target,
            key;

        for (; i < arguments.length; i++) {
          target = arguments[i];

          for (key in target) {
            if (Object.prototype.hasOwnProperty.call(target, key)) {
              obj[key] = target[key];
            }
          }
        }

        return obj;
      }

      function splitCells(tableRow, count) {
        // ensure that every cell-delimiting pipe has a space
        // before it to distinguish it from an escaped pipe
        var row = tableRow.replace(/\|/g, function (match, offset, str) {
          var escaped = false,
              curr = offset;

          while (--curr >= 0 && str[curr] === '\\') {
            escaped = !escaped;
          }

          if (escaped) {
            // odd number of slashes means | is escaped
            // so we leave it alone
            return '|';
          } else {
            // add space before unescaped |
            return ' |';
          }
        }),
            cells = row.split(/ \|/);
        var i = 0;

        if (cells.length > count) {
          cells.splice(count);
        } else {
          while (cells.length < count) {
            cells.push('');
          }
        }

        for (; i < cells.length; i++) {
          // leading or trailing whitespace is ignored per the gfm spec
          cells[i] = cells[i].trim().replace(/\\\|/g, '|');
        }

        return cells;
      } // Remove trailing 'c's. Equivalent to str.replace(/c*$/, '').
      // /c*$/ is vulnerable to REDOS.
      // invert: Remove suffix of non-c chars instead. Default falsey.


      function rtrim(str, c, invert) {
        var l = str.length;

        if (l === 0) {
          return '';
        } // Length of suffix matching the invert condition.


        var suffLen = 0; // Step left until we fail to match the invert condition.

        while (suffLen < l) {
          var currChar = str.charAt(l - suffLen - 1);

          if (currChar === c && !invert) {
            suffLen++;
          } else if (currChar !== c && invert) {
            suffLen++;
          } else {
            break;
          }
        }

        return str.substr(0, l - suffLen);
      }

      function findClosingBracket(str, b) {
        if (str.indexOf(b[1]) === -1) {
          return -1;
        }

        var l = str.length;
        var level = 0,
            i = 0;

        for (; i < l; i++) {
          if (str[i] === '\\') {
            i++;
          } else if (str[i] === b[0]) {
            level++;
          } else if (str[i] === b[1]) {
            level--;

            if (level < 0) {
              return i;
            }
          }
        }

        return -1;
      }

      function checkSanitizeDeprecation(opt) {
        if (opt && opt.sanitize && !opt.silent) {
          console.warn('marked(): sanitize and sanitizer parameters are deprecated since version 0.7.0, should not be used and will be removed in the future. Read more here: https://marked.js.org/#/USING_ADVANCED.md#options');
        }
      } // copied from https://stackoverflow.com/a/5450113/806777


      function repeatString(pattern, count) {
        if (count < 1) {
          return '';
        }

        var result = '';

        while (count > 1) {
          if (count & 1) {
            result += pattern;
          }

          count >>= 1;
          pattern += pattern;
        }

        return result + pattern;
      }

      var helpers = {
        escape: escape,
        unescape: unescape,
        edit: edit,
        cleanUrl: cleanUrl,
        resolveUrl: resolveUrl,
        noopTest: noopTest,
        merge: merge,
        splitCells: splitCells,
        rtrim: rtrim,
        findClosingBracket: findClosingBracket,
        checkSanitizeDeprecation: checkSanitizeDeprecation,
        repeatString: repeatString
      };

      var defaults$1 = defaults.defaults;
      var rtrim$1 = helpers.rtrim,
          splitCells$1 = helpers.splitCells,
          _escape = helpers.escape,
          findClosingBracket$1 = helpers.findClosingBracket;

      function outputLink(cap, link, raw) {
        var href = link.href;
        var title = link.title ? _escape(link.title) : null;
        var text = cap[1].replace(/\\([\[\]])/g, '$1');

        if (cap[0].charAt(0) !== '!') {
          return {
            type: 'link',
            raw: raw,
            href: href,
            title: title,
            text: text
          };
        } else {
          return {
            type: 'image',
            raw: raw,
            href: href,
            title: title,
            text: _escape(text)
          };
        }
      }

      function indentCodeCompensation(raw, text) {
        var matchIndentToCode = raw.match(/^(\s+)(?:```)/);

        if (matchIndentToCode === null) {
          return text;
        }

        var indentToCode = matchIndentToCode[1];
        return text.split('\n').map(function (node) {
          var matchIndentInNode = node.match(/^\s+/);

          if (matchIndentInNode === null) {
            return node;
          }

          var indentInNode = matchIndentInNode[0];

          if (indentInNode.length >= indentToCode.length) {
            return node.slice(indentToCode.length);
          }

          return node;
        }).join('\n');
      }
      /**
       * Tokenizer
       */


      var Tokenizer_1 = /*#__PURE__*/function () {
        function Tokenizer(options) {
          this.options = options || defaults$1;
        }

        var _proto = Tokenizer.prototype;

        _proto.space = function space(src) {
          var cap = this.rules.block.newline.exec(src);

          if (cap) {
            if (cap[0].length > 1) {
              return {
                type: 'space',
                raw: cap[0]
              };
            }

            return {
              raw: '\n'
            };
          }
        };

        _proto.code = function code(src, tokens) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

            if (lastToken && lastToken.type === 'paragraph') {
              return {
                raw: cap[0],
                text: cap[0].trimRight()
              };
            }

            var text = cap[0].replace(/^ {4}/gm, '');
            return {
              type: 'code',
              raw: cap[0],
              codeBlockStyle: 'indented',
              text: !this.options.pedantic ? rtrim$1(text, '\n') : text
            };
          }
        };

        _proto.fences = function fences(src) {
          var cap = this.rules.block.fences.exec(src);

          if (cap) {
            var raw = cap[0];
            var text = indentCodeCompensation(raw, cap[3] || '');
            return {
              type: 'code',
              raw: raw,
              lang: cap[2] ? cap[2].trim() : cap[2],
              text: text
            };
          }
        };

        _proto.heading = function heading(src) {
          var cap = this.rules.block.heading.exec(src);

          if (cap) {
            var text = cap[2].trim(); // remove trailing #s

            if (/#$/.test(text)) {
              var trimmed = rtrim$1(text, '#');

              if (this.options.pedantic) {
                text = trimmed.trim();
              } else if (!trimmed || / $/.test(trimmed)) {
                // CommonMark requires space before trailing #s
                text = trimmed.trim();
              }
            }

            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[1].length,
              text: text
            };
          }
        };

        _proto.nptable = function nptable(src) {
          var cap = this.rules.block.nptable.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : [],
              raw: cap[0]
            };

            if (item.header.length === item.align.length) {
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i], item.header.length);
              }

              return item;
            }
          }
        };

        _proto.hr = function hr(src) {
          var cap = this.rules.block.hr.exec(src);

          if (cap) {
            return {
              type: 'hr',
              raw: cap[0]
            };
          }
        };

        _proto.blockquote = function blockquote(src) {
          var cap = this.rules.block.blockquote.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ *> ?/gm, '');
            return {
              type: 'blockquote',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.list = function list(src) {
          var cap = this.rules.block.list.exec(src);

          if (cap) {
            var raw = cap[0];
            var bull = cap[2];
            var isordered = bull.length > 1;
            var list = {
              type: 'list',
              raw: raw,
              ordered: isordered,
              start: isordered ? +bull.slice(0, -1) : '',
              loose: false,
              items: []
            }; // Get each top-level item.

            var itemMatch = cap[0].match(this.rules.block.item);
            var next = false,
                item,
                space,
                bcurr,
                bnext,
                addBack,
                loose,
                istask,
                ischecked;
            var l = itemMatch.length;
            bcurr = this.rules.block.listItemStart.exec(itemMatch[0]);

            for (var i = 0; i < l; i++) {
              item = itemMatch[i];
              raw = item; // Determine whether the next list item belongs here.
              // Backpedal if it does not belong in this list.

              if (i !== l - 1) {
                bnext = this.rules.block.listItemStart.exec(itemMatch[i + 1]);

                if (bnext[1].length > bcurr[0].length || bnext[1].length > 3) {
                  // nested list
                  itemMatch.splice(i, 2, itemMatch[i] + '\n' + itemMatch[i + 1]);
                  i--;
                  l--;
                  continue;
                } else {
                  if ( // different bullet style
                  !this.options.pedantic || this.options.smartLists ? bnext[2][bnext[2].length - 1] !== bull[bull.length - 1] : isordered === (bnext[2].length === 1)) {
                    addBack = itemMatch.slice(i + 1).join('\n');
                    list.raw = list.raw.substring(0, list.raw.length - addBack.length);
                    i = l - 1;
                  }
                }

                bcurr = bnext;
              } // Remove the list item's bullet
              // so it is seen as the next token.


              space = item.length;
              item = item.replace(/^ *([*+-]|\d+[.)]) ?/, ''); // Outdent whatever the
              // list item contains. Hacky.

              if (~item.indexOf('\n ')) {
                space -= item.length;
                item = !this.options.pedantic ? item.replace(new RegExp('^ {1,' + space + '}', 'gm'), '') : item.replace(/^ {1,4}/gm, '');
              } // Determine whether item is loose or not.
              // Use: /(^|\n)(?! )[^\n]+\n\n(?!\s*$)/
              // for discount behavior.


              loose = next || /\n\n(?!\s*$)/.test(item);

              if (i !== l - 1) {
                next = item.charAt(item.length - 1) === '\n';
                if (!loose) loose = next;
              }

              if (loose) {
                list.loose = true;
              } // Check for task list items


              if (this.options.gfm) {
                istask = /^\[[ xX]\] /.test(item);
                ischecked = undefined;

                if (istask) {
                  ischecked = item[1] !== ' ';
                  item = item.replace(/^\[[ xX]\] +/, '');
                }
              }

              list.items.push({
                type: 'list_item',
                raw: raw,
                task: istask,
                checked: ischecked,
                loose: loose,
                text: item
              });
            }

            return list;
          }
        };

        _proto.html = function html(src) {
          var cap = this.rules.block.html.exec(src);

          if (cap) {
            return {
              type: this.options.sanitize ? 'paragraph' : 'html',
              raw: cap[0],
              pre: !this.options.sanitizer && (cap[1] === 'pre' || cap[1] === 'script' || cap[1] === 'style'),
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.def = function def(src) {
          var cap = this.rules.block.def.exec(src);

          if (cap) {
            if (cap[3]) cap[3] = cap[3].substring(1, cap[3].length - 1);
            var tag = cap[1].toLowerCase().replace(/\s+/g, ' ');
            return {
              tag: tag,
              raw: cap[0],
              href: cap[2],
              title: cap[3]
            };
          }
        };

        _proto.table = function table(src) {
          var cap = this.rules.block.table.exec(src);

          if (cap) {
            var item = {
              type: 'table',
              header: splitCells$1(cap[1].replace(/^ *| *\| *$/g, '')),
              align: cap[2].replace(/^ *|\| *$/g, '').split(/ *\| */),
              cells: cap[3] ? cap[3].replace(/\n$/, '').split('\n') : []
            };

            if (item.header.length === item.align.length) {
              item.raw = cap[0];
              var l = item.align.length;
              var i;

              for (i = 0; i < l; i++) {
                if (/^ *-+: *$/.test(item.align[i])) {
                  item.align[i] = 'right';
                } else if (/^ *:-+: *$/.test(item.align[i])) {
                  item.align[i] = 'center';
                } else if (/^ *:-+ *$/.test(item.align[i])) {
                  item.align[i] = 'left';
                } else {
                  item.align[i] = null;
                }
              }

              l = item.cells.length;

              for (i = 0; i < l; i++) {
                item.cells[i] = splitCells$1(item.cells[i].replace(/^ *\| *| *\| *$/g, ''), item.header.length);
              }

              return item;
            }
          }
        };

        _proto.lheading = function lheading(src) {
          var cap = this.rules.block.lheading.exec(src);

          if (cap) {
            return {
              type: 'heading',
              raw: cap[0],
              depth: cap[2].charAt(0) === '=' ? 1 : 2,
              text: cap[1]
            };
          }
        };

        _proto.paragraph = function paragraph(src) {
          var cap = this.rules.block.paragraph.exec(src);

          if (cap) {
            return {
              type: 'paragraph',
              raw: cap[0],
              text: cap[1].charAt(cap[1].length - 1) === '\n' ? cap[1].slice(0, -1) : cap[1]
            };
          }
        };

        _proto.text = function text(src, tokens) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
            var lastToken = tokens[tokens.length - 1];

            if (lastToken && lastToken.type === 'text') {
              return {
                raw: cap[0],
                text: cap[0]
              };
            }

            return {
              type: 'text',
              raw: cap[0],
              text: cap[0]
            };
          }
        };

        _proto.escape = function escape(src) {
          var cap = this.rules.inline.escape.exec(src);

          if (cap) {
            return {
              type: 'escape',
              raw: cap[0],
              text: _escape(cap[1])
            };
          }
        };

        _proto.tag = function tag(src, inLink, inRawBlock) {
          var cap = this.rules.inline.tag.exec(src);

          if (cap) {
            if (!inLink && /^<a /i.test(cap[0])) {
              inLink = true;
            } else if (inLink && /^<\/a>/i.test(cap[0])) {
              inLink = false;
            }

            if (!inRawBlock && /^<(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = true;
            } else if (inRawBlock && /^<\/(pre|code|kbd|script)(\s|>)/i.test(cap[0])) {
              inRawBlock = false;
            }

            return {
              type: this.options.sanitize ? 'text' : 'html',
              raw: cap[0],
              inLink: inLink,
              inRawBlock: inRawBlock,
              text: this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0]
            };
          }
        };

        _proto.link = function link(src) {
          var cap = this.rules.inline.link.exec(src);

          if (cap) {
            var trimmedUrl = cap[2].trim();

            if (!this.options.pedantic && /^</.test(trimmedUrl)) {
              // commonmark requires matching angle brackets
              if (!/>$/.test(trimmedUrl)) {
                return;
              } // ending angle bracket cannot be escaped


              var rtrimSlash = rtrim$1(trimmedUrl.slice(0, -1), '\\');

              if ((trimmedUrl.length - rtrimSlash.length) % 2 === 0) {
                return;
              }
            } else {
              // find closing parenthesis
              var lastParenIndex = findClosingBracket$1(cap[2], '()');

              if (lastParenIndex > -1) {
                var start = cap[0].indexOf('!') === 0 ? 5 : 4;
                var linkLen = start + cap[1].length + lastParenIndex;
                cap[2] = cap[2].substring(0, lastParenIndex);
                cap[0] = cap[0].substring(0, linkLen).trim();
                cap[3] = '';
              }
            }

            var href = cap[2];
            var title = '';

            if (this.options.pedantic) {
              // split pedantic href and title
              var link = /^([^'"]*[^\s])\s+(['"])(.*)\2/.exec(href);

              if (link) {
                href = link[1];
                title = link[3];
              }
            } else {
              title = cap[3] ? cap[3].slice(1, -1) : '';
            }

            href = href.trim();

            if (/^</.test(href)) {
              if (this.options.pedantic && !/>$/.test(trimmedUrl)) {
                // pedantic allows starting angle bracket without ending angle bracket
                href = href.slice(1);
              } else {
                href = href.slice(1, -1);
              }
            }

            return outputLink(cap, {
              href: href ? href.replace(this.rules.inline._escapes, '$1') : href,
              title: title ? title.replace(this.rules.inline._escapes, '$1') : title
            }, cap[0]);
          }
        };

        _proto.reflink = function reflink(src, links) {
          var cap;

          if ((cap = this.rules.inline.reflink.exec(src)) || (cap = this.rules.inline.nolink.exec(src))) {
            var link = (cap[2] || cap[1]).replace(/\s+/g, ' ');
            link = links[link.toLowerCase()];

            if (!link || !link.href) {
              var text = cap[0].charAt(0);
              return {
                type: 'text',
                raw: text,
                text: text
              };
            }

            return outputLink(cap, link, cap[0]);
          }
        };

        _proto.strong = function strong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.strong.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '**' ? this.rules.inline.strong.endAst : this.rules.inline.strong.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.strong.middle.exec(maskedSrc.slice(0, match.index + 3));

              if (cap) {
                return {
                  type: 'strong',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(2, cap[0].length - 2)
                };
              }
            }
          }
        };

        _proto.em = function em(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.em.start.exec(src);

          if (match && (!match[1] || match[1] && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar)))) {
            maskedSrc = maskedSrc.slice(-1 * src.length);
            var endReg = match[0] === '*' ? this.rules.inline.em.endAst : this.rules.inline.em.endUnd;
            endReg.lastIndex = 0;
            var cap;

            while ((match = endReg.exec(maskedSrc)) != null) {
              cap = this.rules.inline.em.middle.exec(maskedSrc.slice(0, match.index + 2));

              if (cap) {
                return {
                  type: 'em',
                  raw: src.slice(0, cap[0].length),
                  text: src.slice(1, cap[0].length - 1)
                };
              }
            }
          }
        };

        _proto.codespan = function codespan(src) {
          var cap = this.rules.inline.code.exec(src);

          if (cap) {
            var text = cap[2].replace(/\n/g, ' ');
            var hasNonSpaceChars = /[^ ]/.test(text);
            var hasSpaceCharsOnBothEnds = /^ /.test(text) && / $/.test(text);

            if (hasNonSpaceChars && hasSpaceCharsOnBothEnds) {
              text = text.substring(1, text.length - 1);
            }

            text = _escape(text, true);
            return {
              type: 'codespan',
              raw: cap[0],
              text: text
            };
          }
        };

        _proto.br = function br(src) {
          var cap = this.rules.inline.br.exec(src);

          if (cap) {
            return {
              type: 'br',
              raw: cap[0]
            };
          }
        };

        _proto.del = function del(src) {
          var cap = this.rules.inline.del.exec(src);

          if (cap) {
            return {
              type: 'del',
              raw: cap[0],
              text: cap[2]
            };
          }
        };

        _proto.autolink = function autolink(src, mangle) {
          var cap = this.rules.inline.autolink.exec(src);

          if (cap) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[1]) : cap[1]);
              href = 'mailto:' + text;
            } else {
              text = _escape(cap[1]);
              href = text;
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.url = function url(src, mangle) {
          var cap;

          if (cap = this.rules.inline.url.exec(src)) {
            var text, href;

            if (cap[2] === '@') {
              text = _escape(this.options.mangle ? mangle(cap[0]) : cap[0]);
              href = 'mailto:' + text;
            } else {
              // do extended autolink path validation
              var prevCapZero;

              do {
                prevCapZero = cap[0];
                cap[0] = this.rules.inline._backpedal.exec(cap[0])[0];
              } while (prevCapZero !== cap[0]);

              text = _escape(cap[0]);

              if (cap[1] === 'www.') {
                href = 'http://' + text;
              } else {
                href = text;
              }
            }

            return {
              type: 'link',
              raw: cap[0],
              text: text,
              href: href,
              tokens: [{
                type: 'text',
                raw: text,
                text: text
              }]
            };
          }
        };

        _proto.inlineText = function inlineText(src, inRawBlock, smartypants) {
          var cap = this.rules.inline.text.exec(src);

          if (cap) {
            var text;

            if (inRawBlock) {
              text = this.options.sanitize ? this.options.sanitizer ? this.options.sanitizer(cap[0]) : _escape(cap[0]) : cap[0];
            } else {
              text = _escape(this.options.smartypants ? smartypants(cap[0]) : cap[0]);
            }

            return {
              type: 'text',
              raw: cap[0],
              text: text
            };
          }
        };

        return Tokenizer;
      }();

      var noopTest$1 = helpers.noopTest,
          edit$1 = helpers.edit,
          merge$1 = helpers.merge;
      /**
       * Block-Level Grammar
       */

      var block = {
        newline: /^\n+/,
        code: /^( {4}[^\n]+\n*)+/,
        fences: /^ {0,3}(`{3,}(?=[^`\n]*\n)|~{3,})([^\n]*)\n(?:|([\s\S]*?)\n)(?: {0,3}\1[~`]* *(?:\n+|$)|$)/,
        hr: /^ {0,3}((?:- *){3,}|(?:_ *){3,}|(?:\* *){3,})(?:\n+|$)/,
        heading: /^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,
        blockquote: /^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/,
        list: /^( {0,3})(bull) [\s\S]+?(?:hr|def|\n{2,}(?! )(?! {0,3}bull )\n*|\s*$)/,
        html: '^ {0,3}(?:' // optional indentation
        + '<(script|pre|style)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)' // (1)
        + '|comment[^\\n]*(\\n+|$)' // (2)
        + '|<\\?[\\s\\S]*?(?:\\?>\\n*|$)' // (3)
        + '|<![A-Z][\\s\\S]*?(?:>\\n*|$)' // (4)
        + '|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)' // (5)
        + '|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:\\n{2,}|$)' // (6)
        + '|<(?!script|pre|style)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) open tag
        + '|</(?!script|pre|style)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:\\n{2,}|$)' // (7) closing tag
        + ')',
        def: /^ {0,3}\[(label)\]: *\n? *<?([^\s>]+)>?(?:(?: +\n? *| *\n *)(title))? *(?:\n+|$)/,
        nptable: noopTest$1,
        table: noopTest$1,
        lheading: /^([^\n]+)\n {0,3}(=+|-+) *(?:\n+|$)/,
        // regex template, placeholders will be replaced according to different paragraph
        // interruption rules of commonmark and the original markdown spec:
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html)[^\n]+)*)/,
        text: /^[^\n]+/
      };
      block._label = /(?!\s*\])(?:\\[\[\]]|[^\[\]])+/;
      block._title = /(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/;
      block.def = edit$1(block.def).replace('label', block._label).replace('title', block._title).getRegex();
      block.bullet = /(?:[*+-]|\d{1,9}[.)])/;
      block.item = /^( *)(bull) ?[^\n]*(?:\n(?! *bull ?)[^\n]*)*/;
      block.item = edit$1(block.item, 'gm').replace(/bull/g, block.bullet).getRegex();
      block.listItemStart = edit$1(/^( *)(bull)/).replace('bull', block.bullet).getRegex();
      block.list = edit$1(block.list).replace(/bull/g, block.bullet).replace('hr', '\\n+(?=\\1?(?:(?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$))').replace('def', '\\n+(?=' + block.def.source + ')').getRegex();
      block._tag = 'address|article|aside|base|basefont|blockquote|body|caption' + '|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption' + '|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe' + '|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option' + '|p|param|section|source|summary|table|tbody|td|tfoot|th|thead|title|tr' + '|track|ul';
      block._comment = /<!--(?!-?>)[\s\S]*?(?:-->|$)/;
      block.html = edit$1(block.html, 'i').replace('comment', block._comment).replace('tag', block._tag).replace('attribute', / +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex();
      block.paragraph = edit$1(block._paragraph).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('|lheading', '') // setex headings don't interrupt commonmark paragraphs
      .replace('blockquote', ' {0,3}>').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // pars can be interrupted by type (6) html blocks
      .getRegex();
      block.blockquote = edit$1(block.blockquote).replace('paragraph', block.paragraph).getRegex();
      /**
       * Normal Block Grammar
       */

      block.normal = merge$1({}, block);
      /**
       * GFM Block Grammar
       */

      block.gfm = merge$1({}, block.normal, {
        nptable: '^ *([^|\\n ].*\\|.*)\\n' // Header
        + ' {0,3}([-:]+ *\\|[-| :]*)' // Align
        + '(?:\\n((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)',
        // Cells
        table: '^ *\\|(.+)\\n' // Header
        + ' {0,3}\\|?( *[-:]+[-| :]*)' // Align
        + '(?:\\n *((?:(?!\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)' // Cells

      });
      block.gfm.nptable = edit$1(block.gfm.nptable).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      block.gfm.table = edit$1(block.gfm.table).replace('hr', block.hr).replace('heading', ' {0,3}#{1,6} ').replace('blockquote', ' {0,3}>').replace('code', ' {4}[^\\n]').replace('fences', ' {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n').replace('list', ' {0,3}(?:[*+-]|1[.)]) ') // only lists starting from 1 can interrupt
      .replace('html', '</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|!--)').replace('tag', block._tag) // tables can be interrupted by type (6) html blocks
      .getRegex();
      /**
       * Pedantic grammar (original John Gruber's loose markdown specification)
       */

      block.pedantic = merge$1({}, block.normal, {
        html: edit$1('^ *(?:comment *(?:\\n|\\s*$)' + '|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)' // closed tag
        + '|<tag(?:"[^"]*"|\'[^\']*\'|\\s[^\'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))').replace('comment', block._comment).replace(/tag/g, '(?!(?:' + 'a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub' + '|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)' + '\\b)\\w+(?!:|[^\\w\\s@]*@)\\b').getRegex(),
        def: /^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,
        heading: /^(#{1,6})(.*)(?:\n+|$)/,
        fences: noopTest$1,
        // fences not supported
        paragraph: edit$1(block.normal._paragraph).replace('hr', block.hr).replace('heading', ' *#{1,6} *[^\n]').replace('lheading', block.lheading).replace('blockquote', ' {0,3}>').replace('|fences', '').replace('|list', '').replace('|html', '').getRegex()
      });
      /**
       * Inline-Level Grammar
       */

      var inline = {
        escape: /^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,
        autolink: /^<(scheme:[^\s\x00-\x1f<>]*|email)>/,
        url: noopTest$1,
        tag: '^comment' + '|^</[a-zA-Z][\\w:-]*\\s*>' // self-closing tag
        + '|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>' // open tag
        + '|^<\\?[\\s\\S]*?\\?>' // processing instruction, e.g. <?php ?>
        + '|^<![a-zA-Z]+\\s[\\s\\S]*?>' // declaration, e.g. <!DOCTYPE html>
        + '|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>',
        // CDATA section
        link: /^!?\[(label)\]\(\s*(href)(?:\s+(title))?\s*\)/,
        reflink: /^!?\[(label)\]\[(?!\s*\])((?:\\[\[\]]?|[^\[\]\\])+)\]/,
        nolink: /^!?\[(?!\s*\])((?:\[[^\[\]]*\]|\\[\[\]]|[^\[\]])*)\](?:\[\])?/,
        reflinkSearch: 'reflink|nolink(?!\\()',
        strong: {
          start: /^(?:(\*\*(?=[*punctuation]))|\*\*)(?![\s])|__/,
          // (1) returns if starts w/ punctuation
          middle: /^\*\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*\*$|^__(?![\s])((?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?)__$/,
          endAst: /[^punctuation\s]\*\*(?!\*)|[punctuation]\*\*(?!\*)(?:(?=[punctuation_\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]__(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        em: {
          start: /^(?:(\*(?=[punctuation]))|\*)(?![*\s])|_/,
          // (1) returns if starts w/ punctuation
          middle: /^\*(?:(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)|\*(?:(?!overlapSkip)(?:[^*]|\\\*)|overlapSkip)*?\*)+?\*$|^_(?![_\s])(?:(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)|_(?:(?!overlapSkip)(?:[^_]|\\_)|overlapSkip)*?_)+?_$/,
          endAst: /[^punctuation\s]\*(?!\*)|[punctuation]\*(?!\*)(?:(?=[punctuation_\s]|$))/,
          // last char can't be punct, or final * must also be followed by punct (or endline)
          endUnd: /[^\s]_(?!_)(?:(?=[punctuation*\s])|$)/ // last char can't be a space, and final _ must preceed punct or \s (or endline)

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest$1,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\s*punctuation])/
      }; // list of punctuation marks from common mark spec
      // without * and _ to workaround cases with double emphasis

      inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline._blockSkip = '\\[[^\\]]*?\\]\\([^\\)]*?\\)|`[^`]*?`|<[^>]*?>';
      inline._overlapSkip = '__[^_]*?__|\\*\\*\\[^\\*\\]*?\\*\\*';
      inline._comment = edit$1(block._comment).replace('(?:-->|$)', '-->').getRegex();
      inline.em.start = edit$1(inline.em.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.middle = edit$1(inline.em.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
      inline.em.endAst = edit$1(inline.em.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.em.endUnd = edit$1(inline.em.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.start = edit$1(inline.strong.start).replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.middle = edit$1(inline.strong.middle).replace(/punctuation/g, inline._punctuation).replace(/overlapSkip/g, inline._overlapSkip).getRegex();
      inline.strong.endAst = edit$1(inline.strong.endAst, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.strong.endUnd = edit$1(inline.strong.endUnd, 'g').replace(/punctuation/g, inline._punctuation).getRegex();
      inline.blockSkip = edit$1(inline._blockSkip, 'g').getRegex();
      inline.overlapSkip = edit$1(inline._overlapSkip, 'g').getRegex();
      inline._escapes = /\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/g;
      inline._scheme = /[a-zA-Z][a-zA-Z0-9+.-]{1,31}/;
      inline._email = /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/;
      inline.autolink = edit$1(inline.autolink).replace('scheme', inline._scheme).replace('email', inline._email).getRegex();
      inline._attribute = /\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/;
      inline.tag = edit$1(inline.tag).replace('comment', inline._comment).replace('attribute', inline._attribute).getRegex();
      inline._label = /(?:\[(?:\\.|[^\[\]\\])*\]|\\.|`[^`]*`|[^\[\]\\`])*?/;
      inline._href = /<(?:\\.|[^\n<>\\])+>|[^\s\x00-\x1f]*/;
      inline._title = /"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/;
      inline.link = edit$1(inline.link).replace('label', inline._label).replace('href', inline._href).replace('title', inline._title).getRegex();
      inline.reflink = edit$1(inline.reflink).replace('label', inline._label).getRegex();
      inline.reflinkSearch = edit$1(inline.reflinkSearch, 'g').replace('reflink', inline.reflink).replace('nolink', inline.nolink).getRegex();
      /**
       * Normal Inline Grammar
       */

      inline.normal = merge$1({}, inline);
      /**
       * Pedantic Inline Grammar
       */

      inline.pedantic = merge$1({}, inline.normal, {
        strong: {
          start: /^__|\*\*/,
          middle: /^__(?=\S)([\s\S]*?\S)__(?!_)|^\*\*(?=\S)([\s\S]*?\S)\*\*(?!\*)/,
          endAst: /\*\*(?!\*)/g,
          endUnd: /__(?!_)/g
        },
        em: {
          start: /^_|\*/,
          middle: /^()\*(?=\S)([\s\S]*?\S)\*(?!\*)|^_(?=\S)([\s\S]*?\S)_(?!_)/,
          endAst: /\*(?!\*)/g,
          endUnd: /_(?!_)/g
        },
        link: edit$1(/^!?\[(label)\]\((.*?)\)/).replace('label', inline._label).getRegex(),
        reflink: edit$1(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace('label', inline._label).getRegex()
      });
      /**
       * GFM Inline Grammar
       */

      inline.gfm = merge$1({}, inline.normal, {
        escape: edit$1(inline.escape).replace('])', '~|])').getRegex(),
        _extended_email: /[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/,
        url: /^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,
        _backpedal: /(?:[^?!.,:;*_~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_~)]+(?!$))+/,
        del: /^(~~?)(?=[^\s~])([\s\S]*?[^\s~])\1(?=[^~]|$)/,
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
      });
      inline.gfm.url = edit$1(inline.gfm.url, 'i').replace('email', inline.gfm._extended_email).getRegex();
      /**
       * GFM + Line Breaks Inline Grammar
       */

      inline.breaks = merge$1({}, inline.gfm, {
        br: edit$1(inline.br).replace('{2,}', '*').getRegex(),
        text: edit$1(inline.gfm.text).replace('\\b_', '\\b_| {2,}\\n').replace(/\{2,\}/g, '*').getRegex()
      });
      var rules = {
        block: block,
        inline: inline
      };

      var defaults$2 = defaults.defaults;
      var block$1 = rules.block,
          inline$1 = rules.inline;
      var repeatString$1 = helpers.repeatString;
      /**
       * smartypants text replacement
       */

      function smartypants(text) {
        return text // em-dashes
        .replace(/---/g, "\u2014") // en-dashes
        .replace(/--/g, "\u2013") // opening singles
        .replace(/(^|[-\u2014/(\[{"\s])'/g, "$1\u2018") // closing singles & apostrophes
        .replace(/'/g, "\u2019") // opening doubles
        .replace(/(^|[-\u2014/(\[{\u2018\s])"/g, "$1\u201C") // closing doubles
        .replace(/"/g, "\u201D") // ellipses
        .replace(/\.{3}/g, "\u2026");
      }
      /**
       * mangle email addresses
       */


      function mangle(text) {
        var out = '',
            i,
            ch;
        var l = text.length;

        for (i = 0; i < l; i++) {
          ch = text.charCodeAt(i);

          if (Math.random() > 0.5) {
            ch = 'x' + ch.toString(16);
          }

          out += '&#' + ch + ';';
        }

        return out;
      }
      /**
       * Block Lexer
       */


      var Lexer_1 = /*#__PURE__*/function () {
        function Lexer(options) {
          this.tokens = [];
          this.tokens.links = Object.create(null);
          this.options = options || defaults$2;
          this.options.tokenizer = this.options.tokenizer || new Tokenizer_1();
          this.tokenizer = this.options.tokenizer;
          this.tokenizer.options = this.options;
          var rules = {
            block: block$1.normal,
            inline: inline$1.normal
          };

          if (this.options.pedantic) {
            rules.block = block$1.pedantic;
            rules.inline = inline$1.pedantic;
          } else if (this.options.gfm) {
            rules.block = block$1.gfm;

            if (this.options.breaks) {
              rules.inline = inline$1.breaks;
            } else {
              rules.inline = inline$1.gfm;
            }
          }

          this.tokenizer.rules = rules;
        }
        /**
         * Expose Rules
         */


        /**
         * Static Lex Method
         */
        Lexer.lex = function lex(src, options) {
          var lexer = new Lexer(options);
          return lexer.lex(src);
        }
        /**
         * Static Lex Inline Method
         */
        ;

        Lexer.lexInline = function lexInline(src, options) {
          var lexer = new Lexer(options);
          return lexer.inlineTokens(src);
        }
        /**
         * Preprocessing
         */
        ;

        var _proto = Lexer.prototype;

        _proto.lex = function lex(src) {
          src = src.replace(/\r\n|\r/g, '\n').replace(/\t/g, '    ');
          this.blockTokens(src, this.tokens, true);
          this.inline(this.tokens);
          return this.tokens;
        }
        /**
         * Lexing
         */
        ;

        _proto.blockTokens = function blockTokens(src, tokens, top) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (top === void 0) {
            top = true;
          }

          src = src.replace(/^ +$/gm, '');
          var token, i, l, lastToken;

          while (src) {
            // newline
            if (token = this.tokenizer.space(src)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              }

              continue;
            } // code


            if (token = this.tokenizer.code(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            } // fences


            if (token = this.tokenizer.fences(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // heading


            if (token = this.tokenizer.heading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // table no leading pipe (gfm)


            if (token = this.tokenizer.nptable(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // hr


            if (token = this.tokenizer.hr(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // blockquote


            if (token = this.tokenizer.blockquote(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.blockTokens(token.text, [], top);
              tokens.push(token);
              continue;
            } // list


            if (token = this.tokenizer.list(src)) {
              src = src.substring(token.raw.length);
              l = token.items.length;

              for (i = 0; i < l; i++) {
                token.items[i].tokens = this.blockTokens(token.items[i].text, [], false);
              }

              tokens.push(token);
              continue;
            } // html


            if (token = this.tokenizer.html(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // def


            if (top && (token = this.tokenizer.def(src))) {
              src = src.substring(token.raw.length);

              if (!this.tokens.links[token.tag]) {
                this.tokens.links[token.tag] = {
                  href: token.href,
                  title: token.title
                };
              }

              continue;
            } // table (gfm)


            if (token = this.tokenizer.table(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // lheading


            if (token = this.tokenizer.lheading(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // top-level paragraph


            if (top && (token = this.tokenizer.paragraph(src))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.text(src, tokens)) {
              src = src.substring(token.raw.length);

              if (token.type) {
                tokens.push(token);
              } else {
                lastToken = tokens[tokens.length - 1];
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              }

              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _proto.inline = function inline(tokens) {
          var i, j, k, l2, row, token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'paragraph':
              case 'text':
              case 'heading':
                {
                  token.tokens = [];
                  this.inlineTokens(token.text, token.tokens);
                  break;
                }

              case 'table':
                {
                  token.tokens = {
                    header: [],
                    cells: []
                  }; // header

                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    token.tokens.header[j] = [];
                    this.inlineTokens(token.header[j], token.tokens.header[j]);
                  } // cells


                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.cells[j];
                    token.tokens.cells[j] = [];

                    for (k = 0; k < row.length; k++) {
                      token.tokens.cells[j][k] = [];
                      this.inlineTokens(row[k], token.tokens.cells[j][k]);
                    }
                  }

                  break;
                }

              case 'blockquote':
                {
                  this.inline(token.tokens);
                  break;
                }

              case 'list':
                {
                  l2 = token.items.length;

                  for (j = 0; j < l2; j++) {
                    this.inline(token.items[j].tokens);
                  }

                  break;
                }
            }
          }

          return tokens;
        }
        /**
         * Lexing/Compiling
         */
        ;

        _proto.inlineTokens = function inlineTokens(src, tokens, inLink, inRawBlock) {
          if (tokens === void 0) {
            tokens = [];
          }

          if (inLink === void 0) {
            inLink = false;
          }

          if (inRawBlock === void 0) {
            inRawBlock = false;
          }

          var token; // String with links masked to avoid interference with em and strong

          var maskedSrc = src;
          var match;
          var keepPrevChar, prevChar; // Mask out reflinks

          if (this.tokens.links) {
            var links = Object.keys(this.tokens.links);

            if (links.length > 0) {
              while ((match = this.tokenizer.rules.inline.reflinkSearch.exec(maskedSrc)) != null) {
                if (links.includes(match[0].slice(match[0].lastIndexOf('[') + 1, -1))) {
                  maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString$1('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex);
                }
              }
            }
          } // Mask out other blocks


          while ((match = this.tokenizer.rules.inline.blockSkip.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '[' + repeatString$1('a', match[0].length - 2) + ']' + maskedSrc.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);
          }

          while (src) {
            if (!keepPrevChar) {
              prevChar = '';
            }

            keepPrevChar = false; // escape

            if (token = this.tokenizer.escape(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // tag


            if (token = this.tokenizer.tag(src, inLink, inRawBlock)) {
              src = src.substring(token.raw.length);
              inLink = token.inLink;
              inRawBlock = token.inRawBlock;
              tokens.push(token);
              continue;
            } // link


            if (token = this.tokenizer.link(src)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // reflink, nolink


            if (token = this.tokenizer.reflink(src, this.tokens.links)) {
              src = src.substring(token.raw.length);

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
              }

              tokens.push(token);
              continue;
            } // strong


            if (token = this.tokenizer.strong(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // em


            if (token = this.tokenizer.em(src, maskedSrc, prevChar)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // code


            if (token = this.tokenizer.codespan(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // br


            if (token = this.tokenizer.br(src)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // del (gfm)


            if (token = this.tokenizer.del(src)) {
              src = src.substring(token.raw.length);
              token.tokens = this.inlineTokens(token.text, [], inLink, inRawBlock);
              tokens.push(token);
              continue;
            } // autolink


            if (token = this.tokenizer.autolink(src, mangle)) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // url (gfm)


            if (!inLink && (token = this.tokenizer.url(src, mangle))) {
              src = src.substring(token.raw.length);
              tokens.push(token);
              continue;
            } // text


            if (token = this.tokenizer.inlineText(src, inRawBlock, smartypants)) {
              src = src.substring(token.raw.length);
              prevChar = token.raw.slice(-1);
              keepPrevChar = true;
              tokens.push(token);
              continue;
            }

            if (src) {
              var errMsg = 'Infinite loop on byte: ' + src.charCodeAt(0);

              if (this.options.silent) {
                console.error(errMsg);
                break;
              } else {
                throw new Error(errMsg);
              }
            }
          }

          return tokens;
        };

        _createClass(Lexer, null, [{
          key: "rules",
          get: function get() {
            return {
              block: block$1,
              inline: inline$1
            };
          }
        }]);

        return Lexer;
      }();

      var defaults$3 = defaults.defaults;
      var cleanUrl$1 = helpers.cleanUrl,
          escape$1 = helpers.escape;
      /**
       * Renderer
       */

      var Renderer_1 = /*#__PURE__*/function () {
        function Renderer(options) {
          this.options = options || defaults$3;
        }

        var _proto = Renderer.prototype;

        _proto.code = function code(_code, infostring, escaped) {
          var lang = (infostring || '').match(/\S*/)[0];

          if (this.options.highlight) {
            var out = this.options.highlight(_code, lang);

            if (out != null && out !== _code) {
              escaped = true;
              _code = out;
            }
          }

          if (!lang) {
            return '<pre><code>' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
          }

          return '<pre><code class="' + this.options.langPrefix + escape$1(lang, true) + '">' + (escaped ? _code : escape$1(_code, true)) + '</code></pre>\n';
        };

        _proto.blockquote = function blockquote(quote) {
          return '<blockquote>\n' + quote + '</blockquote>\n';
        };

        _proto.html = function html(_html) {
          return _html;
        };

        _proto.heading = function heading(text, level, raw, slugger) {
          if (this.options.headerIds) {
            return '<h' + level + ' id="' + this.options.headerPrefix + slugger.slug(raw) + '">' + text + '</h' + level + '>\n';
          } // ignore IDs


          return '<h' + level + '>' + text + '</h' + level + '>\n';
        };

        _proto.hr = function hr() {
          return this.options.xhtml ? '<hr/>\n' : '<hr>\n';
        };

        _proto.list = function list(body, ordered, start) {
          var type = ordered ? 'ol' : 'ul',
              startatt = ordered && start !== 1 ? ' start="' + start + '"' : '';
          return '<' + type + startatt + '>\n' + body + '</' + type + '>\n';
        };

        _proto.listitem = function listitem(text) {
          return '<li>' + text + '</li>\n';
        };

        _proto.checkbox = function checkbox(checked) {
          return '<input ' + (checked ? 'checked="" ' : '') + 'disabled="" type="checkbox"' + (this.options.xhtml ? ' /' : '') + '> ';
        };

        _proto.paragraph = function paragraph(text) {
          return '<p>' + text + '</p>\n';
        };

        _proto.table = function table(header, body) {
          if (body) body = '<tbody>' + body + '</tbody>';
          return '<table>\n' + '<thead>\n' + header + '</thead>\n' + body + '</table>\n';
        };

        _proto.tablerow = function tablerow(content) {
          return '<tr>\n' + content + '</tr>\n';
        };

        _proto.tablecell = function tablecell(content, flags) {
          var type = flags.header ? 'th' : 'td';
          var tag = flags.align ? '<' + type + ' align="' + flags.align + '">' : '<' + type + '>';
          return tag + content + '</' + type + '>\n';
        } // span level renderer
        ;

        _proto.strong = function strong(text) {
          return '<strong>' + text + '</strong>';
        };

        _proto.em = function em(text) {
          return '<em>' + text + '</em>';
        };

        _proto.codespan = function codespan(text) {
          return '<code>' + text + '</code>';
        };

        _proto.br = function br() {
          return this.options.xhtml ? '<br/>' : '<br>';
        };

        _proto.del = function del(text) {
          return '<del>' + text + '</del>';
        };

        _proto.link = function link(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<a href="' + escape$1(href) + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += '>' + text + '</a>';
          return out;
        };

        _proto.image = function image(href, title, text) {
          href = cleanUrl$1(this.options.sanitize, this.options.baseUrl, href);

          if (href === null) {
            return text;
          }

          var out = '<img src="' + href + '" alt="' + text + '"';

          if (title) {
            out += ' title="' + title + '"';
          }

          out += this.options.xhtml ? '/>' : '>';
          return out;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        return Renderer;
      }();

      /**
       * TextRenderer
       * returns only the textual part of the token
       */
      var TextRenderer_1 = /*#__PURE__*/function () {
        function TextRenderer() {}

        var _proto = TextRenderer.prototype;

        // no need for block level renderers
        _proto.strong = function strong(text) {
          return text;
        };

        _proto.em = function em(text) {
          return text;
        };

        _proto.codespan = function codespan(text) {
          return text;
        };

        _proto.del = function del(text) {
          return text;
        };

        _proto.html = function html(text) {
          return text;
        };

        _proto.text = function text(_text) {
          return _text;
        };

        _proto.link = function link(href, title, text) {
          return '' + text;
        };

        _proto.image = function image(href, title, text) {
          return '' + text;
        };

        _proto.br = function br() {
          return '';
        };

        return TextRenderer;
      }();

      /**
       * Slugger generates header id
       */
      var Slugger_1 = /*#__PURE__*/function () {
        function Slugger() {
          this.seen = {};
        }

        var _proto = Slugger.prototype;

        _proto.serialize = function serialize(value) {
          return value.toLowerCase().trim() // remove html tags
          .replace(/<[!\/a-z].*?>/ig, '') // remove unwanted chars
          .replace(/[\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,./:;<=>?@[\]^`{|}~]/g, '').replace(/\s/g, '-');
        }
        /**
         * Finds the next safe (unique) slug to use
         */
        ;

        _proto.getNextSafeSlug = function getNextSafeSlug(originalSlug, isDryRun) {
          var slug = originalSlug;
          var occurenceAccumulator = 0;

          if (this.seen.hasOwnProperty(slug)) {
            occurenceAccumulator = this.seen[originalSlug];

            do {
              occurenceAccumulator++;
              slug = originalSlug + '-' + occurenceAccumulator;
            } while (this.seen.hasOwnProperty(slug));
          }

          if (!isDryRun) {
            this.seen[originalSlug] = occurenceAccumulator;
            this.seen[slug] = 0;
          }

          return slug;
        }
        /**
         * Convert string to unique id
         * @param {object} options
         * @param {boolean} options.dryrun Generates the next unique slug without updating the internal accumulator.
         */
        ;

        _proto.slug = function slug(value, options) {
          if (options === void 0) {
            options = {};
          }

          var slug = this.serialize(value);
          return this.getNextSafeSlug(slug, options.dryrun);
        };

        return Slugger;
      }();

      var defaults$4 = defaults.defaults;
      var unescape$1 = helpers.unescape;
      /**
       * Parsing & Compiling
       */

      var Parser_1 = /*#__PURE__*/function () {
        function Parser(options) {
          this.options = options || defaults$4;
          this.options.renderer = this.options.renderer || new Renderer_1();
          this.renderer = this.options.renderer;
          this.renderer.options = this.options;
          this.textRenderer = new TextRenderer_1();
          this.slugger = new Slugger_1();
        }
        /**
         * Static Parse Method
         */


        Parser.parse = function parse(tokens, options) {
          var parser = new Parser(options);
          return parser.parse(tokens);
        }
        /**
         * Static Parse Inline Method
         */
        ;

        Parser.parseInline = function parseInline(tokens, options) {
          var parser = new Parser(options);
          return parser.parseInline(tokens);
        }
        /**
         * Parse Loop
         */
        ;

        var _proto = Parser.prototype;

        _proto.parse = function parse(tokens, top) {
          if (top === void 0) {
            top = true;
          }

          var out = '',
              i,
              j,
              k,
              l2,
              l3,
              row,
              cell,
              header,
              body,
              token,
              ordered,
              start,
              loose,
              itemBody,
              item,
              checked,
              task,
              checkbox;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'space':
                {
                  continue;
                }

              case 'hr':
                {
                  out += this.renderer.hr();
                  continue;
                }

              case 'heading':
                {
                  out += this.renderer.heading(this.parseInline(token.tokens), token.depth, unescape$1(this.parseInline(token.tokens, this.textRenderer)), this.slugger);
                  continue;
                }

              case 'code':
                {
                  out += this.renderer.code(token.text, token.lang, token.escaped);
                  continue;
                }

              case 'table':
                {
                  header = ''; // header

                  cell = '';
                  l2 = token.header.length;

                  for (j = 0; j < l2; j++) {
                    cell += this.renderer.tablecell(this.parseInline(token.tokens.header[j]), {
                      header: true,
                      align: token.align[j]
                    });
                  }

                  header += this.renderer.tablerow(cell);
                  body = '';
                  l2 = token.cells.length;

                  for (j = 0; j < l2; j++) {
                    row = token.tokens.cells[j];
                    cell = '';
                    l3 = row.length;

                    for (k = 0; k < l3; k++) {
                      cell += this.renderer.tablecell(this.parseInline(row[k]), {
                        header: false,
                        align: token.align[k]
                      });
                    }

                    body += this.renderer.tablerow(cell);
                  }

                  out += this.renderer.table(header, body);
                  continue;
                }

              case 'blockquote':
                {
                  body = this.parse(token.tokens);
                  out += this.renderer.blockquote(body);
                  continue;
                }

              case 'list':
                {
                  ordered = token.ordered;
                  start = token.start;
                  loose = token.loose;
                  l2 = token.items.length;
                  body = '';

                  for (j = 0; j < l2; j++) {
                    item = token.items[j];
                    checked = item.checked;
                    task = item.task;
                    itemBody = '';

                    if (item.task) {
                      checkbox = this.renderer.checkbox(checked);

                      if (loose) {
                        if (item.tokens.length > 0 && item.tokens[0].type === 'text') {
                          item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;

                          if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
                            item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
                          }
                        } else {
                          item.tokens.unshift({
                            type: 'text',
                            text: checkbox
                          });
                        }
                      } else {
                        itemBody += checkbox;
                      }
                    }

                    itemBody += this.parse(item.tokens, loose);
                    body += this.renderer.listitem(itemBody, task, checked);
                  }

                  out += this.renderer.list(body, ordered, start);
                  continue;
                }

              case 'html':
                {
                  // TODO parse inline content if parameter markdown=1
                  out += this.renderer.html(token.text);
                  continue;
                }

              case 'paragraph':
                {
                  out += this.renderer.paragraph(this.parseInline(token.tokens));
                  continue;
                }

              case 'text':
                {
                  body = token.tokens ? this.parseInline(token.tokens) : token.text;

                  while (i + 1 < l && tokens[i + 1].type === 'text') {
                    token = tokens[++i];
                    body += '\n' + (token.tokens ? this.parseInline(token.tokens) : token.text);
                  }

                  out += top ? this.renderer.paragraph(body) : body;
                  continue;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        }
        /**
         * Parse Inline Tokens
         */
        ;

        _proto.parseInline = function parseInline(tokens, renderer) {
          renderer = renderer || this.renderer;
          var out = '',
              i,
              token;
          var l = tokens.length;

          for (i = 0; i < l; i++) {
            token = tokens[i];

            switch (token.type) {
              case 'escape':
                {
                  out += renderer.text(token.text);
                  break;
                }

              case 'html':
                {
                  out += renderer.html(token.text);
                  break;
                }

              case 'link':
                {
                  out += renderer.link(token.href, token.title, this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'image':
                {
                  out += renderer.image(token.href, token.title, token.text);
                  break;
                }

              case 'strong':
                {
                  out += renderer.strong(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'em':
                {
                  out += renderer.em(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'codespan':
                {
                  out += renderer.codespan(token.text);
                  break;
                }

              case 'br':
                {
                  out += renderer.br();
                  break;
                }

              case 'del':
                {
                  out += renderer.del(this.parseInline(token.tokens, renderer));
                  break;
                }

              case 'text':
                {
                  out += renderer.text(token.text);
                  break;
                }

              default:
                {
                  var errMsg = 'Token with "' + token.type + '" type was not found.';

                  if (this.options.silent) {
                    console.error(errMsg);
                    return;
                  } else {
                    throw new Error(errMsg);
                  }
                }
            }
          }

          return out;
        };

        return Parser;
      }();

      var merge$2 = helpers.merge,
          checkSanitizeDeprecation$1 = helpers.checkSanitizeDeprecation,
          escape$2 = helpers.escape;
      var getDefaults = defaults.getDefaults,
          changeDefaults = defaults.changeDefaults,
          defaults$5 = defaults.defaults;
      /**
       * Marked
       */

      function marked(src, opt, callback) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        if (typeof opt === 'function') {
          callback = opt;
          opt = null;
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);

        if (callback) {
          var highlight = opt.highlight;
          var tokens;

          try {
            tokens = Lexer_1.lex(src, opt);
          } catch (e) {
            return callback(e);
          }

          var done = function done(err) {
            var out;

            if (!err) {
              try {
                out = Parser_1.parse(tokens, opt);
              } catch (e) {
                err = e;
              }
            }

            opt.highlight = highlight;
            return err ? callback(err) : callback(null, out);
          };

          if (!highlight || highlight.length < 3) {
            return done();
          }

          delete opt.highlight;
          if (!tokens.length) return done();
          var pending = 0;
          marked.walkTokens(tokens, function (token) {
            if (token.type === 'code') {
              pending++;
              setTimeout(function () {
                highlight(token.text, token.lang, function (err, code) {
                  if (err) {
                    return done(err);
                  }

                  if (code != null && code !== token.text) {
                    token.text = code;
                    token.escaped = true;
                  }

                  pending--;

                  if (pending === 0) {
                    done();
                  }
                });
              }, 0);
            }
          });

          if (pending === 0) {
            done();
          }

          return;
        }

        try {
          var _tokens = Lexer_1.lex(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(_tokens, opt.walkTokens);
          }

          return Parser_1.parse(_tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      }
      /**
       * Options
       */


      marked.options = marked.setOptions = function (opt) {
        merge$2(marked.defaults, opt);
        changeDefaults(marked.defaults);
        return marked;
      };

      marked.getDefaults = getDefaults;
      marked.defaults = defaults$5;
      /**
       * Use Extension
       */

      marked.use = function (extension) {
        var opts = merge$2({}, extension);

        if (extension.renderer) {
          (function () {
            var renderer = marked.defaults.renderer || new Renderer_1();

            var _loop = function _loop(prop) {
              var prevRenderer = renderer[prop];

              renderer[prop] = function () {
                for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                  args[_key] = arguments[_key];
                }

                var ret = extension.renderer[prop].apply(renderer, args);

                if (ret === false) {
                  ret = prevRenderer.apply(renderer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.renderer) {
              _loop(prop);
            }

            opts.renderer = renderer;
          })();
        }

        if (extension.tokenizer) {
          (function () {
            var tokenizer = marked.defaults.tokenizer || new Tokenizer_1();

            var _loop2 = function _loop2(prop) {
              var prevTokenizer = tokenizer[prop];

              tokenizer[prop] = function () {
                for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                  args[_key2] = arguments[_key2];
                }

                var ret = extension.tokenizer[prop].apply(tokenizer, args);

                if (ret === false) {
                  ret = prevTokenizer.apply(tokenizer, args);
                }

                return ret;
              };
            };

            for (var prop in extension.tokenizer) {
              _loop2(prop);
            }

            opts.tokenizer = tokenizer;
          })();
        }

        if (extension.walkTokens) {
          var walkTokens = marked.defaults.walkTokens;

          opts.walkTokens = function (token) {
            extension.walkTokens(token);

            if (walkTokens) {
              walkTokens(token);
            }
          };
        }

        marked.setOptions(opts);
      };
      /**
       * Run callback for every token
       */


      marked.walkTokens = function (tokens, callback) {
        for (var _iterator = _createForOfIteratorHelperLoose(tokens), _step; !(_step = _iterator()).done;) {
          var token = _step.value;
          callback(token);

          switch (token.type) {
            case 'table':
              {
                for (var _iterator2 = _createForOfIteratorHelperLoose(token.tokens.header), _step2; !(_step2 = _iterator2()).done;) {
                  var cell = _step2.value;
                  marked.walkTokens(cell, callback);
                }

                for (var _iterator3 = _createForOfIteratorHelperLoose(token.tokens.cells), _step3; !(_step3 = _iterator3()).done;) {
                  var row = _step3.value;

                  for (var _iterator4 = _createForOfIteratorHelperLoose(row), _step4; !(_step4 = _iterator4()).done;) {
                    var _cell = _step4.value;
                    marked.walkTokens(_cell, callback);
                  }
                }

                break;
              }

            case 'list':
              {
                marked.walkTokens(token.items, callback);
                break;
              }

            default:
              {
                if (token.tokens) {
                  marked.walkTokens(token.tokens, callback);
                }
              }
          }
        }
      };
      /**
       * Parse Inline
       */


      marked.parseInline = function (src, opt) {
        // throw error in case of non string input
        if (typeof src === 'undefined' || src === null) {
          throw new Error('marked.parseInline(): input parameter is undefined or null');
        }

        if (typeof src !== 'string') {
          throw new Error('marked.parseInline(): input parameter is of type ' + Object.prototype.toString.call(src) + ', string expected');
        }

        opt = merge$2({}, marked.defaults, opt || {});
        checkSanitizeDeprecation$1(opt);

        try {
          var tokens = Lexer_1.lexInline(src, opt);

          if (opt.walkTokens) {
            marked.walkTokens(tokens, opt.walkTokens);
          }

          return Parser_1.parseInline(tokens, opt);
        } catch (e) {
          e.message += '\nPlease report this to https://github.com/markedjs/marked.';

          if (opt.silent) {
            return '<p>An error occurred:</p><pre>' + escape$2(e.message + '', true) + '</pre>';
          }

          throw e;
        }
      };
      /**
       * Expose
       */


      marked.Parser = Parser_1;
      marked.parser = Parser_1.parse;
      marked.Renderer = Renderer_1;
      marked.TextRenderer = TextRenderer_1;
      marked.Lexer = Lexer_1;
      marked.lexer = Lexer_1.lex;
      marked.Tokenizer = Tokenizer_1;
      marked.Slugger = Slugger_1;
      marked.parse = marked;
      var marked_1 = marked;

      return marked_1;

    })));
    });

    /* src/components/About.svelte generated by Svelte v3.12.1 */

    const file$2 = "src/components/About.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.date = list[i].date;
    	child_ctx.content = list[i].content;
    	return child_ctx;
    }

    // (60:4) {#each NEWS as {date, content}}
    function create_each_block$2(ctx) {
    	var div2, div0, t0_value = ctx.date + "", t0, t1, t2, div1, raw_value = marked(ctx.content) + "", t3;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = text(":");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			attr_dev(div0, "class", "news-item-date svelte-gvr2xp");
    			add_location(div0, file$2, 61, 8, 1244);
    			attr_dev(div1, "class", "news-item-content svelte-gvr2xp");
    			add_location(div1, file$2, 62, 8, 1294);
    			attr_dev(div2, "class", "news-item svelte-gvr2xp");
    			add_location(div2, file$2, 60, 6, 1212);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, t1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			div1.innerHTML = raw_value;
    			append_dev(div2, t3);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div2);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(60:4) {#each NEWS as {date, content}}", ctx });
    	return block;
    }

    function create_fragment$2(ctx) {
    	var div3, div1, div0, raw_value = marked(ABOUT) + "", t0, img, t1, h2, t3, div2;

    	let each_value = NEWS;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			h2 = element("h2");
    			h2.textContent = "NEWS";
    			t3 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			attr_dev(div0, "class", "description svelte-gvr2xp");
    			add_location(div0, file$2, 49, 4, 935);
    			attr_dev(img, "alt", "picture of me in canyonlands utah");
    			attr_dev(img, "class", "self-pic svelte-gvr2xp");
    			attr_dev(img, "src", "assets/desert-pic.jpg");
    			add_location(img, file$2, 52, 4, 1004);
    			attr_dev(div1, "class", "about-section svelte-gvr2xp");
    			add_location(div1, file$2, 48, 2, 903);
    			add_location(h2, file$2, 57, 2, 1126);
    			attr_dev(div2, "class", "about-section svelte-gvr2xp");
    			add_location(div2, file$2, 58, 2, 1142);
    			add_location(div3, file$2, 47, 0, 895);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			div0.innerHTML = raw_value;
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div3, t1);
    			append_dev(div3, h2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}
    		},

    		p: function update(changed, ctx) {
    			if (changed.marked || changed.NEWS) {
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

    function get_each_context_1$1(ctx, list, i) {
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

    // (62:12) {#if project.sourceLink}
    function create_if_block_1(ctx) {
    	var a, img;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "alt", "github icon");
    			attr_dev(img, "src", "icons/github.svg");
    			attr_dev(img, "class", "gh-icon svelte-19c2nqh");
    			add_location(img, file$3, 63, 16, 1364);
    			attr_dev(a, "href", ctx.project.sourceLink);
    			add_location(a, file$3, 62, 14, 1318);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},

    		p: noop,

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(a);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(62:12) {#if project.sourceLink}", ctx });
    	return block;
    }

    // (67:12) {#if project.link}
    function create_if_block$1(ctx) {
    	var a, t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("Live");
    			attr_dev(a, "href", ctx.project.link);
    			add_location(a, file$3, 66, 30, 1496);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(67:12) {#if project.link}", ctx });
    	return block;
    }

    // (54:6) {#each rows as project (project.title)}
    function create_each_block_1$1(key_1, ctx) {
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
    			attr_dev(img, "class", "svelte-19c2nqh");
    			add_location(img, file$3, 56, 39, 1098);
    			attr_dev(div0, "class", "img-container svelte-19c2nqh");
    			add_location(div0, file$3, 56, 12, 1071);
    			attr_dev(a, "href", ctx.project.link);
    			add_location(a, file$3, 55, 10, 1035);
    			add_location(h3, file$3, 58, 10, 1191);
    			add_location(h5, file$3, 59, 10, 1226);
    			add_location(div1, file$3, 60, 10, 1261);
    			attr_dev(p, "class", "svelte-19c2nqh");
    			add_location(p, file$3, 68, 10, 1560);
    			attr_dev(div2, "class", "project-block svelte-19c2nqh");
    			add_location(div2, file$3, 54, 8, 997);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(54:6) {#each rows as project (project.title)}", ctx });
    	return block;
    }

    // (51:2) {#each sections as {sectionName, rows}
    function create_each_block$3(key_1, ctx) {
    	var h2, t0_value = ctx.sectionName.toUpperCase() + "", t0, t1, div, each_blocks = [], each_1_lookup = new Map(), t2;

    	let each_value_1 = ctx.rows;

    	const get_key = ctx => ctx.project.title;

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1$1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,

    		first: null,

    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			add_location(h2, file$3, 51, 4, 873);
    			attr_dev(div, "class", "flex-with-wrap svelte-19c2nqh");
    			add_location(div, file$3, 52, 4, 914);
    			this.first = h2;
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t2);
    		},

    		p: function update(changed, ctx) {
    			const each_value_1 = ctx.rows;
    			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1$1, t2, get_each_context_1$1);
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h2);
    				detach_dev(t1);
    				detach_dev(div);
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(51:2) {#each sections as {sectionName, rows}", ctx });
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
    			add_location(div, file$3, 49, 0, 798);
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
    	
      const sections = Object.entries(groupBy(PROJECTS, 'section')).map(([sectionName, rows]) => ({
        sectionName,
        rows,
      }));

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
    const { Object: Object_1$1 } = globals;

    const file$4 = "src/components/Publication.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = Object_1$1.create(ctx);
    	child_ctx.name = list[i].name;
    	child_ctx.link = list[i].link;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = Object_1$1.create(ctx);
    	child_ctx.key = list[i];
    	return child_ctx;
    }

    // (85:4) {#if !noImg}
    function create_if_block_4(ctx) {
    	var div, img, img_alt_value, img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", img_alt_value = "image drawn from " + ctx.publication.title);
    			attr_dev(img, "src", img_src_value = ctx.publication.imgLink);
    			attr_dev(img, "class", "svelte-1tgtbbk");
    			add_location(img, file$4, 86, 8, 1713);
    			attr_dev(div, "class", "img-container svelte-1tgtbbk");
    			add_location(div, file$4, 85, 6, 1677);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.publication) && img_alt_value !== (img_alt_value = "image drawn from " + ctx.publication.title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if ((changed.publication) && img_src_value !== (img_src_value = ctx.publication.imgLink)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(85:4) {#if !noImg}", ctx });
    	return block;
    }

    // (92:6) {#if publication.authors}
    function create_if_block_3(ctx) {
    	var span, raw_value = marked(addLinks(ctx.publication.authors)) + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$4, 92, 8, 1938);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},

    		p: function update(changed, ctx) {
    			if ((changed.publication) && raw_value !== (raw_value = marked(addLinks(ctx.publication.authors)) + "")) {
    				span.innerHTML = raw_value;
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(92:6) {#if publication.authors}", ctx });
    	return block;
    }

    // (97:10) {#if publication[key]}
    function create_if_block_2(ctx) {
    	var span, t0_value = ctx.publication[ctx.key] + "", t0, t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$4, 96, 32, 2082);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},

    		p: function update(changed, ctx) {
    			if ((changed.publication) && t0_value !== (t0_value = ctx.publication[ctx.key] + "")) {
    				set_data_dev(t0, t0_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(span);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(97:10) {#if publication[key]}", ctx });
    	return block;
    }

    // (96:8) {#each keys as key}
    function create_each_block_1$2(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$2.name, type: "each", source: "(96:8) {#each keys as key}", ctx });
    	return block;
    }

    // (102:8) {#each publication.links as {name, link}}
    function create_each_block$4(ctx) {
    	var a, t_value = ctx.name + "", t, a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "publink svelte-1tgtbbk");
    			attr_dev(a, "href", a_href_value = ctx.link);
    			add_location(a, file$4, 101, 49, 2225);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(102:8) {#each publication.links as {name, link}}", ctx });
    	return block;
    }

    // (103:8) {#if publication.abstract}
    function create_if_block_1$1(ctx) {
    	var div, t0, t1_value = ctx.abstractOpen ? '-' : '+' + "", t1, t2, dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("abstract (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(div, "class", "publink svelte-1tgtbbk");
    			add_location(div, file$4, 103, 10, 2319);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(103:8) {#if publication.abstract}", ctx });
    	return block;
    }

    // (109:2) {#if abstractOpen}
    function create_if_block$2(ctx) {
    	var div, t_value = ctx.publication.abstract + "", t, div_transition, current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "abstract svelte-1tgtbbk");
    			add_location(div, file$4, 109, 4, 2482);
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(109:2) {#if abstractOpen}", ctx });
    	return block;
    }

    function create_fragment$4(ctx) {
    	var div3, div2, t0, div1, a, t1_value = ctx.publication.title + "", t1, a_href_value, t2, t3, span, t4, div0, t5, t6, current;

    	var if_block0 = (!ctx.noImg) && create_if_block_4(ctx);

    	var if_block1 = (ctx.publication.authors) && create_if_block_3(ctx);

    	let each_value_1 = ctx.keys;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = ctx.publication.links;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	var if_block2 = (ctx.publication.abstract) && create_if_block_1$1(ctx);

    	var if_block3 = (ctx.abstractOpen) && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			a = element("a");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			span = element("span");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			if (if_block2) if_block2.c();
    			t6 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(a, "href", a_href_value = ctx.publication.link);
    			add_location(a, file$4, 90, 6, 1847);
    			add_location(span, file$4, 94, 6, 2015);
    			attr_dev(div0, "class", "flex svelte-1tgtbbk");
    			add_location(div0, file$4, 100, 6, 2157);
    			attr_dev(div1, "class", "flex-down svelte-1tgtbbk");
    			add_location(div1, file$4, 89, 4, 1817);
    			attr_dev(div2, "class", "content-container svelte-1tgtbbk");
    			add_location(div2, file$4, 83, 2, 1622);
    			attr_dev(div3, "class", "flex-down publication svelte-1tgtbbk");
    			add_location(div3, file$4, 82, 0, 1584);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    			append_dev(a, t1);
    			append_dev(div1, t2);
    			if (if_block1) if_block1.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, span);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(span, null);
    			}

    			append_dev(div1, t4);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div0, t5);
    			if (if_block2) if_block2.m(div0, null);
    			append_dev(div3, t6);
    			if (if_block3) if_block3.m(div3, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (!ctx.noImg) {
    				if (if_block0) {
    					if_block0.p(changed, ctx);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || changed.publication) && t1_value !== (t1_value = ctx.publication.title + "")) {
    				set_data_dev(t1, t1_value);
    			}

    			if ((!current || changed.publication) && a_href_value !== (a_href_value = ctx.publication.link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (ctx.publication.authors) {
    				if (if_block1) {
    					if_block1.p(changed, ctx);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (changed.publication || changed.keys) {
    				each_value_1 = ctx.keys;

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(span, null);
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
    						each_blocks[i].m(div0, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}
    				each_blocks.length = each_value.length;
    			}

    			if (ctx.publication.abstract) {
    				if (if_block2) {
    					if_block2.p(changed, ctx);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (ctx.abstractOpen) {
    				if (if_block3) {
    					if_block3.p(changed, ctx);
    					transition_in(if_block3, 1);
    				} else {
    					if_block3 = create_if_block$2(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				group_outros();
    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block3);
    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(if_block3);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div3);
    			}

    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();

    			destroy_each(each_blocks_1, detaching);

    			destroy_each(each_blocks, detaching);

    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
    	return block;
    }

    function addLinks(authors) {
      return Object.entries(COLLABORATOR_LINKS).reduce((str, [key, link]) => {
        return str.replace(key, `[${key}](${link})`);
      }, authors.replace('Andrew McNutt', '__Andrew McNutt__'));
    }

    function instance$3($$self, $$props, $$invalidate) {
    	

      let { noImg = false, publication } = $$props;
      let abstractOpen = false;
      function toggleAbstract(e) {
        e.preventDefault();
        $$invalidate('abstractOpen', abstractOpen = !abstractOpen);
      }
      const keys = ['subtitle', 'journal', 'date'];

    	const writable_props = ['noImg', 'publication'];
    	Object_1$1.keys($$props).forEach(key => {
    		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Publication> was created with unknown prop '${key}'`);
    	});

    	$$self.$set = $$props => {
    		if ('noImg' in $$props) $$invalidate('noImg', noImg = $$props.noImg);
    		if ('publication' in $$props) $$invalidate('publication', publication = $$props.publication);
    	};

    	$$self.$capture_state = () => {
    		return { noImg, publication, abstractOpen };
    	};

    	$$self.$inject_state = $$props => {
    		if ('noImg' in $$props) $$invalidate('noImg', noImg = $$props.noImg);
    		if ('publication' in $$props) $$invalidate('publication', publication = $$props.publication);
    		if ('abstractOpen' in $$props) $$invalidate('abstractOpen', abstractOpen = $$props.abstractOpen);
    	};

    	return {
    		noImg,
    		publication,
    		abstractOpen,
    		toggleAbstract,
    		keys
    	};
    }

    class Publication extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$4, safe_not_equal, ["noImg", "publication"]);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Publication", options, id: create_fragment$4.name });

    		const { ctx } = this.$$;
    		const props = options.props || {};
    		if (ctx.publication === undefined && !('publication' in props)) {
    			console.warn("<Publication> was created without expected prop 'publication'");
    		}
    	}

    	get noImg() {
    		throw new Error("<Publication>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noImg(value) {
    		throw new Error("<Publication>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get publication() {
    		throw new Error("<Publication>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set publication(value) {
    		throw new Error("<Publication>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Publications.svelte generated by Svelte v3.12.1 */

    const file$5 = "src/components/Publications.svelte";

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.pubs = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.sort = list[i];
    	return child_ctx;
    }

    // (53:2) {#each sorts as sort}
    function create_each_block_2(ctx) {
    	var button, t_value = ctx.sort + "", t, button_class_value, dispose;

    	function click_handler() {
    		return ctx.click_handler(ctx);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);
    			attr_dev(button, "class", button_class_value = "" + null_to_empty(classnames({'sort-button': true, 'selected-button': ctx.sort === ctx.currentSort})) + " svelte-19ovtu1");
    			add_location(button, file$5, 53, 4, 1378);
    			dispose = listen_dev(button, "click", click_handler);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);
    		},

    		p: function update(changed, new_ctx) {
    			ctx = new_ctx;
    			if ((changed.currentSort) && button_class_value !== (button_class_value = "" + null_to_empty(classnames({'sort-button': true, 'selected-button': ctx.sort === ctx.currentSort})) + " svelte-19ovtu1")) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(button);
    			}

    			dispose();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(53:2) {#each sorts as sort}", ctx });
    	return block;
    }

    // (66:4) {#each pubs[1] as publication}
    function create_each_block_1$3(ctx) {
    	var br, t, current;

    	var publication = new Publication({
    		props: { publication: ctx.publication },
    		$$inline: true
    	});

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = space();
    			publication.$$.fragment.c();
    			add_location(br, file$5, 66, 6, 1733);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(publication, target, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			var publication_changes = {};
    			if (changed.sortedPublications) publication_changes.publication = ctx.publication;
    			publication.$set(publication_changes);
    		},

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
    			if (detaching) {
    				detach_dev(br);
    				detach_dev(t);
    			}

    			destroy_component(publication, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$3.name, type: "each", source: "(66:4) {#each pubs[1] as publication}", ctx });
    	return block;
    }

    // (63:2) {#each Object.entries(sortedPublications) as pubs}
    function create_each_block$5(ctx) {
    	var h2, t0_value = ctx.pubs[0].toUpperCase() + "", t0, t1, each_1_anchor, current;

    	let each_value_1 = ctx.pubs[1];

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			attr_dev(h2, "class", "svelte-19ovtu1");
    			add_location(h2, file$5, 63, 4, 1658);
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h2, anchor);
    			append_dev(h2, t0);
    			insert_dev(target, t1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if ((!current || changed.sortedPublications) && t0_value !== (t0_value = ctx.pubs[0].toUpperCase() + "")) {
    				set_data_dev(t0, t0_value);
    			}

    			if (changed.sortedPublications) {
    				each_value_1 = ctx.pubs[1];

    				let i;
    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();
    				for (i = each_value_1.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h2);
    				detach_dev(t1);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(each_1_anchor);
    			}
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$5.name, type: "each", source: "(63:2) {#each Object.entries(sortedPublications) as pubs}", ctx });
    	return block;
    }

    function create_fragment$5(ctx) {
    	var div0, h3, t1, t2, div1, current;

    	let each_value_2 = ctx.sorts;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.entries(ctx.sortedPublications);

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			h3 = element("h3");
    			h3.textContent = "Sort by";
    			t1 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}
    			add_location(h3, file$5, 51, 2, 1333);
    			add_location(div0, file$5, 50, 0, 1325);
    			attr_dev(div1, "class", "research-section svelte-19ovtu1");
    			add_location(div1, file$5, 61, 0, 1570);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, h3);
    			append_dev(div0, t1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			insert_dev(target, t2, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.classnames || changed.sorts || changed.currentSort) {
    				each_value_2 = ctx.sorts;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}
    				each_blocks_1.length = each_value_2.length;
    			}

    			if (changed.sortedPublications) {
    				each_value = Object.entries(ctx.sortedPublications);

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
    						each_blocks[i].m(div1, null);
    					}
    				}

    				group_outros();
    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}
    				check_outros();
    			}
    		},

    		i: function intro(local) {
    			if (current) return;
    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},

    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(div0);
    			}

    			destroy_each(each_blocks_1, detaching);

    			if (detaching) {
    				detach_dev(t2);
    				detach_dev(div1);
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	

      let currentSort = 'type';
      const sorts = ['type', 'year', 'name'];
      const typeOrder = [
        'conference / journal article',
        'extended abstract / workshop paper',
        'poster',
        'book chapter',
        'thesis',
      ];
      const yearOrder = [2021, 2014, 2017, 2018, 2019, 2020, 2021];

      function sortPublications(currentSort) {
        if (currentSort === 'type' || currentSort === 'year') {
          return PUBLICATIONS.map((x) => ({...x, year: new Date(x.date).getFullYear()})).reduce(
            (acc, row) => {
              acc[row[currentSort]].push(row);
              return acc;
            },
            (currentSort === 'type' ? typeOrder : yearOrder).reduce((acc, key) => ({...acc, [key]: []}), {}),
          );
        }
        return {publications: PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title))};
      }

    	const click_handler = ({ sort }) => {
    	        $$invalidate('currentSort', currentSort = sort);
    	      };

    	$$self.$capture_state = () => {
    		return {};
    	};

    	$$self.$inject_state = $$props => {
    		if ('currentSort' in $$props) $$invalidate('currentSort', currentSort = $$props.currentSort);
    		if ('sortedPublications' in $$props) $$invalidate('sortedPublications', sortedPublications = $$props.sortedPublications);
    	};

    	let sortedPublications;

    	$$self.$$.update = ($$dirty = { currentSort: 1 }) => {
    		if ($$dirty.currentSort) { $$invalidate('sortedPublications', sortedPublications = sortPublications(currentSort)); }
    	};

    	return {
    		currentSort,
    		sorts,
    		sortedPublications,
    		click_handler
    	};
    }

    class Publications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$5, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Publications", options, id: create_fragment$5.name });
    	}
    }

    /* src/components/Teaching.svelte generated by Svelte v3.12.1 */

    const file$6 = "src/components/Teaching.svelte";

    function get_each_context_1$4(ctx, list, i) {
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
    function create_each_block_1$4(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$4.name, type: "each", source: "(24:6) {#each groups[key] as position}", ctx });
    	return block;
    }

    // (21:2) {#each Object.keys(groups) as key}
    function create_each_block$6(ctx) {
    	var div, h3, t0_value = ctx.key.toUpperCase() + "", t0, t1, t2;

    	let each_value_1 = ctx.groups[ctx.key];

    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$4(get_each_context_1$4(ctx, each_value_1, i));
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
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    					} else {
    						each_blocks[i] = create_each_block_1$4(child_ctx);
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

    function instance$5($$self) {
    	
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
    		init(this, options, instance$5, create_fragment$6, safe_not_equal, []);
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

    function get_each_context_1$5(ctx, list, i) {
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
    function create_each_block_1$5(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$5.name, type: "each", source: "(82:4) {#each keys as key}", ctx });
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
    		each_blocks_1[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
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
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    					} else {
    						each_blocks_1[i] = create_each_block_1$5(child_ctx);
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

    function instance$6($$self) {
    	
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
    		init(this, options, instance$6, create_fragment$7, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "ShowPage", options, id: create_fragment$7.name });
    	}
    }

    /* src/components/CV.svelte generated by Svelte v3.12.1 */

    const file$8 = "src/components/CV.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    function get_each_context_1$6(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = Object.create(ctx);
    	child_ctx.publication = list[i];
    	return child_ctx;
    }

    // (43:4) {#each PUBLICATIONS as publication}
    function create_each_block_2$1(ctx) {
    	var current;

    	var publication = new Publication({
    		props: {
    		publication: ctx.publication,
    		noImg: true
    	},
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2$1.name, type: "each", source: "(43:4) {#each PUBLICATIONS as publication}", ctx });
    	return block;
    }

    // (52:4) {#each BLOG_POSTS as publication}
    function create_each_block_1$6(ctx) {
    	var current;

    	var publication = new Publication({
    		props: {
    		publication: ctx.publication,
    		noImg: true
    	},
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$6.name, type: "each", source: "(52:4) {#each BLOG_POSTS as publication}", ctx });
    	return block;
    }

    // (61:4) {#each PRESENTATIONS as publication}
    function create_each_block$8(ctx) {
    	var current;

    	var publication = new Publication({
    		props: {
    		publication: ctx.publication,
    		noImg: true
    	},
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$8.name, type: "each", source: "(61:4) {#each PRESENTATIONS as publication}", ctx });
    	return block;
    }

    function create_fragment$8(ctx) {
    	var h1, t1, section0, h20, t3, h30, t5, div0, t7, div1, t8, a0, t10, br0, t11, h31, t13, div2, t15, div3, t16, a1, t18, br1, t19, h32, t21, div4, t23, div5, t24, a2, t26, section1, h21, t28, div6, t30, div7, t32, div8, t34, div9, t36, div10, t38, section2, h22, t40, div11, t41, section3, h23, t43, div12, t44, section4, h24, t46, div13, t47, section5, h25, t49, current;

    	let each_value_2 = PUBLICATIONS;

    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = BLOG_POSTS;

    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$6(get_each_context_1$6(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = PRESENTATIONS;

    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	var teaching = new Teaching({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Andrew McNutt";
    			t1 = text("\nPhD Student at Univeristy of Chicago in Computer Science\n\n");
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Education";
    			t3 = space();
    			h30 = element("h3");
    			h30.textContent = "University of Chicago";
    			t5 = space();
    			div0 = element("div");
    			div0.textContent = "PhD, Computer Science, 2017 - Present";
    			t7 = space();
    			div1 = element("div");
    			t8 = text("Advised by ");
    			a0 = element("a");
    			a0.textContent = "Ravi Chugh";
    			t10 = space();
    			br0 = element("br");
    			t11 = space();
    			h31 = element("h3");
    			h31.textContent = "University of Chicago";
    			t13 = space();
    			div2 = element("div");
    			div2.textContent = "MS, Computer Science, 2017 - 2019";
    			t15 = space();
    			div3 = element("div");
    			t16 = text("Advised by ");
    			a1 = element("a");
    			a1.textContent = "Gordon Kindlmann";
    			t18 = space();
    			br1 = element("br");
    			t19 = space();
    			h32 = element("h3");
    			h32.textContent = "Reed College";
    			t21 = space();
    			div4 = element("div");
    			div4.textContent = "BA, Physics, 2010 - 2014";
    			t23 = space();
    			div5 = element("div");
    			t24 = text("Advised by ");
    			a2 = element("a");
    			a2.textContent = "Nelia Mann";
    			t26 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Professional Experience";
    			t28 = space();
    			div6 = element("div");
    			div6.textContent = "Research Intern at Tableau Research, 2019";
    			t30 = space();
    			div7 = element("div");
    			div7.textContent = "Graduate Researcher at University of Chicago, 2017 -";
    			t32 = space();
    			div8 = element("div");
    			div8.textContent = "Data Visualization Engineer at Uber, 2015 - 2017";
    			t34 = space();
    			div9 = element("div");
    			div9.textContent = "Scientific Visualization Developer at Collaborative Drug Discovery, 2014 - 2015";
    			t36 = space();
    			div10 = element("div");
    			div10.textContent = "Undergraduate Researcher at Reed College, 2013";
    			t38 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Publications";
    			t40 = space();
    			div11 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t41 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "BLOG POSTS";
    			t43 = space();
    			div12 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t44 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Talks";
    			t46 = space();
    			div13 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t47 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "Teaching";
    			t49 = space();
    			teaching.$$.fragment.c();
    			add_location(h1, file$8, 12, 0, 243);
    			add_location(h20, file$8, 16, 2, 352);
    			add_location(h30, file$8, 17, 2, 373);
    			add_location(div0, file$8, 18, 2, 406);
    			attr_dev(a0, "href", "http://people.cs.uchicago.edu/~rchugh/");
    			add_location(a0, file$8, 19, 18, 473);
    			add_location(div1, file$8, 19, 2, 457);
    			add_location(br0, file$8, 20, 2, 545);
    			add_location(h31, file$8, 21, 2, 554);
    			add_location(div2, file$8, 22, 2, 587);
    			attr_dev(a1, "href", "http://people.cs.uchicago.edu/~glk/");
    			add_location(a1, file$8, 23, 18, 650);
    			add_location(div3, file$8, 23, 2, 634);
    			add_location(br1, file$8, 24, 2, 725);
    			add_location(h32, file$8, 25, 2, 734);
    			add_location(div4, file$8, 26, 2, 758);
    			attr_dev(a2, "href", "http://people.cs.uchicago.edu/~rchugh/");
    			add_location(a2, file$8, 27, 18, 812);
    			add_location(div5, file$8, 27, 2, 796);
    			attr_dev(section0, "class", "section svelte-b4hjag");
    			add_location(section0, file$8, 15, 0, 324);
    			add_location(h21, file$8, 31, 2, 922);
    			add_location(div6, file$8, 32, 2, 957);
    			add_location(div7, file$8, 33, 2, 1012);
    			add_location(div8, file$8, 34, 2, 1078);
    			add_location(div9, file$8, 35, 2, 1140);
    			add_location(div10, file$8, 36, 2, 1233);
    			attr_dev(section1, "class", "section svelte-b4hjag");
    			add_location(section1, file$8, 30, 0, 894);
    			add_location(h22, file$8, 40, 2, 1331);
    			attr_dev(div11, "class", "research-section svelte-b4hjag");
    			add_location(div11, file$8, 41, 2, 1355);
    			attr_dev(section2, "class", "section svelte-b4hjag");
    			add_location(section2, file$8, 39, 0, 1303);
    			add_location(h23, file$8, 49, 2, 1536);
    			attr_dev(div12, "class", "research-section svelte-b4hjag");
    			add_location(div12, file$8, 50, 2, 1558);
    			attr_dev(section3, "class", "section svelte-b4hjag");
    			add_location(section3, file$8, 48, 0, 1508);
    			add_location(h24, file$8, 58, 2, 1737);
    			attr_dev(div13, "class", "research-section svelte-b4hjag");
    			add_location(div13, file$8, 59, 2, 1754);
    			attr_dev(section4, "class", "section svelte-b4hjag");
    			add_location(section4, file$8, 57, 0, 1709);
    			add_location(h25, file$8, 71, 2, 2001);
    			attr_dev(section5, "class", "section svelte-b4hjag");
    			add_location(section5, file$8, 70, 0, 1973);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t3);
    			append_dev(section0, h30);
    			append_dev(section0, t5);
    			append_dev(section0, div0);
    			append_dev(section0, t7);
    			append_dev(section0, div1);
    			append_dev(div1, t8);
    			append_dev(div1, a0);
    			append_dev(section0, t10);
    			append_dev(section0, br0);
    			append_dev(section0, t11);
    			append_dev(section0, h31);
    			append_dev(section0, t13);
    			append_dev(section0, div2);
    			append_dev(section0, t15);
    			append_dev(section0, div3);
    			append_dev(div3, t16);
    			append_dev(div3, a1);
    			append_dev(section0, t18);
    			append_dev(section0, br1);
    			append_dev(section0, t19);
    			append_dev(section0, h32);
    			append_dev(section0, t21);
    			append_dev(section0, div4);
    			append_dev(section0, t23);
    			append_dev(section0, div5);
    			append_dev(div5, t24);
    			append_dev(div5, a2);
    			insert_dev(target, t26, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t28);
    			append_dev(section1, div6);
    			append_dev(section1, t30);
    			append_dev(section1, div7);
    			append_dev(section1, t32);
    			append_dev(section1, div8);
    			append_dev(section1, t34);
    			append_dev(section1, div9);
    			append_dev(section1, t36);
    			append_dev(section1, div10);
    			insert_dev(target, t38, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h22);
    			append_dev(section2, t40);
    			append_dev(section2, div11);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div11, null);
    			}

    			insert_dev(target, t41, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, h23);
    			append_dev(section3, t43);
    			append_dev(section3, div12);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div12, null);
    			}

    			insert_dev(target, t44, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, h24);
    			append_dev(section4, t46);
    			append_dev(section4, div13);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div13, null);
    			}

    			insert_dev(target, t47, anchor);
    			insert_dev(target, section5, anchor);
    			append_dev(section5, h25);
    			append_dev(section5, t49);
    			mount_component(teaching, section5, null);
    			current = true;
    		},

    		p: function update(changed, ctx) {
    			if (changed.PUBLICATIONS) {
    				each_value_2 = PUBLICATIONS;

    				let i;
    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(changed, child_ctx);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div11, null);
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
    					const child_ctx = get_each_context_1$6(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(changed, child_ctx);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$6(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div12, null);
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
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(changed, child_ctx);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div13, null);
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

    			transition_in(teaching.$$.fragment, local);

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

    			transition_out(teaching.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			if (detaching) {
    				detach_dev(h1);
    				detach_dev(t1);
    				detach_dev(section0);
    				detach_dev(t26);
    				detach_dev(section1);
    				detach_dev(t38);
    				detach_dev(section2);
    			}

    			destroy_each(each_blocks_2, detaching);

    			if (detaching) {
    				detach_dev(t41);
    				detach_dev(section3);
    			}

    			destroy_each(each_blocks_1, detaching);

    			if (detaching) {
    				detach_dev(t44);
    				detach_dev(section4);
    			}

    			destroy_each(each_blocks, detaching);

    			if (detaching) {
    				detach_dev(t47);
    				detach_dev(section5);
    			}

    			destroy_component(teaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$8.name, type: "component", source: "", ctx });
    	return block;
    }

    class CV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, null, create_fragment$8, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "CV", options, id: create_fragment$8.name });
    	}
    }

    /* src/App.svelte generated by Svelte v3.12.1 */

    const file$9 = "src/App.svelte";

    // (132:8) {:else}
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(132:8) {:else}", ctx });
    	return block;
    }

    // (130:48) 
    function create_if_block_4$1(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4$1.name, type: "if", source: "(130:48) ", ctx });
    	return block;
    }

    // (128:48) 
    function create_if_block_3$1(ctx) {
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3$1.name, type: "if", source: "(128:48) ", ctx });
    	return block;
    }

    // (126:42) 
    function create_if_block_2$1(ctx) {
    	var current;

    	var cv = new CV({ $$inline: true });

    	const block = {
    		c: function create() {
    			cv.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(cv, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(cv.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(cv.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(cv, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(126:42) ", ctx });
    	return block;
    }

    // (124:49) 
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
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$3.name, type: "if", source: "(124:49) ", ctx });
    	return block;
    }

    // (122:8) {#if currentSection === 'publications'}
    function create_if_block$5(ctx) {
    	var current;

    	var publications = new Publications({ $$inline: true });

    	const block = {
    		c: function create() {
    			publications.$$.fragment.c();
    		},

    		m: function mount(target, anchor) {
    			mount_component(publications, target, anchor);
    			current = true;
    		},

    		i: function intro(local) {
    			if (current) return;
    			transition_in(publications.$$.fragment, local);

    			current = true;
    		},

    		o: function outro(local) {
    			transition_out(publications.$$.fragment, local);
    			current = false;
    		},

    		d: function destroy(detaching) {
    			destroy_component(publications, detaching);
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$5.name, type: "if", source: "(122:8) {#if currentSection === 'publications'}", ctx });
    	return block;
    }

    function create_fragment$9(ctx) {
    	var div5, div1, div0, h1, t1, div4, t2, div3, t3, div2, current_block_type_index, if_block, current;

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
    		create_if_block_3$1,
    		create_if_block_4$1,
    		create_else_block
    	];

    	var if_blocks = [];

    	function select_block_type(changed, ctx) {
    		if (ctx.currentSection === 'publications') return 0;
    		if (ctx.currentSection === 'show-page') return 1;
    		if (ctx.currentSection === 'cv') return 2;
    		if (ctx.currentSection === 'projects') return 3;
    		if (ctx.currentSection === 'teaching') return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(null, ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ANDREW MCNUTT";
    			t1 = space();
    			div4 = element("div");
    			mobileheader.$$.fragment.c();
    			t2 = space();
    			div3 = element("div");
    			header.$$.fragment.c();
    			t3 = space();
    			div2 = element("div");
    			if_block.c();
    			attr_dev(h1, "class", "svelte-n5vgjv");
    			add_location(h1, file$9, 108, 6, 2318);
    			attr_dev(div0, "class", "info-container svelte-n5vgjv");
    			add_location(div0, file$9, 107, 4, 2283);
    			attr_dev(div1, "class", "header flex-down svelte-n5vgjv");
    			add_location(div1, file$9, 106, 2, 2248);
    			attr_dev(div2, "class", "content-wrapper svelte-n5vgjv");
    			add_location(div2, file$9, 120, 6, 2728);
    			attr_dev(div3, "class", "main-container svelte-n5vgjv");
    			add_location(div3, file$9, 118, 4, 2659);
    			attr_dev(div4, "class", "flex-down full-width svelte-n5vgjv");
    			add_location(div4, file$9, 116, 2, 2582);
    			attr_dev(div5, "class", "flex-down full-height svelte-n5vgjv");
    			add_location(div5, file$9, 105, 0, 2210);
    		},

    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},

    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div1);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			mount_component(mobileheader, div4, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(header, div3, null);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			if_blocks[current_block_type_index].m(div2, null);
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
    				if_block.m(div2, null);
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
    				detach_dev(div5);
    			}

    			destroy_component(mobileheader);

    			destroy_component(header);

    			if_blocks[current_block_type_index].d();
    		}
    	};
    	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$9.name, type: "component", source: "", ctx });
    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	
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
    		init(this, options, instance$7, create_fragment$9, safe_not_equal, []);
    		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "App", options, id: create_fragment$9.name });
    	}
    }

    const app = new App({target: document.body});

    return app;

}());
//# sourceMappingURL=bundle.js.map
