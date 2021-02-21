
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
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
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
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
        else if (node.getAttribute(attribute) !== value)
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

    const active_docs = new Set();
    let active = 0;
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
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
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
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
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
            if (running_program || pending_program) {
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
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
                block.p(child_ctx, dirty);
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
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
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
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
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
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
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
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.32.3' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
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
        links: [
          {
            name: 'about',
            link: '#/research/ivy',
          },
          {
            name: 'preprint',
            link: 'https://arxiv.org/pdf/2101.07902.pdf',
          },
          {
            name: 'osf',
            link: 'https://osf.io/cture/',
          },
        ],
        abstract: `Interfaces for creating visualizations typically embrace one of several common forms. Textual specification enables fine-grained control, shelf building facilitates rapid exploration, while chart choosing promotes immediacy and simplicity. Ideally these approaches could be unified to integrate the user- and usage-dependent benefits found in each modality, yet these forms remain distinct.

We propose parameterized declarative templates, a simple abstraction mechanism over JSON-based visualization grammars, as a foundation for multimodal visualization editors. We demonstrate how templates can facilitate organization and reuse by factoring the more than 160 charts that constitute Vega-Lite's example gallery into approximately 40 templates. We exemplify the pliability of abstracting over charting grammars by implementing---as a template---the functionality of the shelf builder Polestar (a simulacra of Tableau) and a set of templates that emulate the Google Sheets chart chooser. We show how templates support multimodal visualization editing by implementing a prototype and evaluating it through an approachability study.`,
        bibTex: `TODO`,
        type: 'conference / journal articles',
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
        type: 'extended abstract / workshop papers',
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
        type: 'posters',
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
          {
            name: 'blog post',
            link:
              'https://medium.com/multiple-views-visualization-research-explained/surfacing-visualization-mirages-8d39e547e38c',
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
        type: 'conference / journal articles',
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
        type: 'extended abstract / workshop papers',
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
        type: 'posters',
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
        type: 'posters',
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
        type: 'extended abstract / workshop papers',
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
        type: 'theses / book chapters',
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
        type: 'conference / journal articles',
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
        type: 'conference / journal articles',
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
        type: 'theses / book chapters',
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
        title: '"How to read an academic paper" zine',
        dates: 'February 2021',
        link: 'http://www.mcnutt.in/paper-zine/',
        sourceLink: 'https://github.com/mcnuttandrew/paper-zine',
        imgLink: 'http://www.mcnutt.in/paper-zine/cover.png',
        text: 'A non-definitive guide to paper reading.',
        section: 'art',
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
        date: 'January 2021',
        content:
          'Our paper ["Integrated Visualization Editing via Parameterized Declarative Templates"](https://www.mcnutt.in/#/research/ivy) was accepted to CHI 2021.',
      },
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
          'Our paper ["Surfacing Visualization Mirages"](https://www.mcnutt.in/#/research/mirage) won a 🏆best paper honorable mention🏆 at CHI2020!!',
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

    /* src/components/Header.svelte generated by Svelte v3.32.3 */
    const file = "src/components/Header.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (34:4) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
    function create_each_block(key_1, ctx) {
    	let a;
    	let t0_value = /*section*/ ctx[1].toUpperCase() + "";
    	let t0;
    	let t1;
    	let a_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(a, "href", "/#/" + /*section*/ ctx[1]);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*section*/ ctx[1],
    				padding: true
    			})) + " svelte-czmeur"));

    			add_location(a, file, 34, 6, 564);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*currentSection*/ 1 && a_class_value !== (a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*section*/ ctx[1],
    				padding: true
    			})) + " svelte-czmeur"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(34:4) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div2;
    	let div0;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t0;
    	let div1;
    	let a0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let a1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let a2;
    	let img2;
    	let img2_src_value;
    	let each_value = ["about", "publications", "projects", "cv"];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*section*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < 4; i += 1) {
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
    			add_location(div0, file, 32, 2, 462);
    			if (img0.src !== (img0_src_value = "icons/twitter.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "link to twitter account");
    			attr_dev(img0, "class", "svelte-czmeur");
    			add_location(img0, file, 40, 43, 810);
    			attr_dev(a0, "href", "https://twitter.com/_mcnutt_");
    			attr_dev(a0, "class", "svelte-czmeur");
    			add_location(a0, file, 40, 4, 771);
    			if (img1.src !== (img1_src_value = "icons/github.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "link to github account");
    			attr_dev(img1, "class", "svelte-czmeur");
    			add_location(img1, file, 41, 46, 922);
    			attr_dev(a1, "href", "https://github.com/mcnuttandrew");
    			attr_dev(a1, "class", "svelte-czmeur");
    			add_location(a1, file, 41, 4, 880);
    			if (img2.src !== (img2_src_value = "icons/scholar.svg")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "link to scholar page");
    			attr_dev(img2, "class", "svelte-czmeur");
    			add_location(img2, file, 42, 69, 1055);
    			attr_dev(a2, "href", "https://scholar.google.com/citations?user=BFOrUoQAAAAJ");
    			attr_dev(a2, "class", "svelte-czmeur");
    			add_location(a2, file, 42, 4, 990);
    			attr_dev(div1, "class", "flex align space-between svelte-czmeur");
    			add_location(div1, file, 39, 2, 728);
    			attr_dev(div2, "class", "bar align header svelte-czmeur");
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classnames, currentSection*/ 1) {
    				each_value = ["about", "publications", "projects", "cv"];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div0, destroy_block, create_each_block, null, get_each_context);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Header", slots, []);
    	let { currentSection } = $$props;
    	const writable_props = ["currentSection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("currentSection" in $$props) $$invalidate(0, currentSection = $$props.currentSection);
    	};

    	$$self.$capture_state = () => ({ currentSection, classnames });

    	$$self.$inject_state = $$props => {
    		if ("currentSection" in $$props) $$invalidate(0, currentSection = $$props.currentSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentSection];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { currentSection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentSection*/ ctx[0] === undefined && !("currentSection" in props)) {
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
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
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

    /* src/components/MobileHeader.svelte generated by Svelte v3.32.3 */
    const file$1 = "src/components/MobileHeader.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (72:2) {#if open}
    function create_if_block(ctx) {
    	let div;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let t;
    	let each_value_1 = ["about", "publications", "projects", "cv"];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*section*/ ctx[9];
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);

    	for (let i = 0; i < 4; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_1(key, child_ctx));
    	}

    	let each_value = /*externalLinks*/ ctx[5];
    	validate_each_argument(each_value);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*classnames, currentSection*/ 1) {
    				each_value_1 = ["about", "publications", "projects", "cv"];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_1, each0_lookup, div, destroy_block, create_each_block_1, t, get_each_context_1);
    			}

    			if (dirty & /*externalLinks, classnames, currentSection*/ 33) {
    				each_value = /*externalLinks*/ ctx[5];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < 4; i += 1) {
    				each_blocks_1[i].d();
    			}

    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(72:2) {#if open}",
    		ctx
    	});

    	return block;
    }

    // (74:6) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}
    function create_each_block_1(key_1, ctx) {
    	let a;
    	let t_value = /*section*/ ctx[9].toUpperCase() + "";
    	let t;
    	let a_class_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", "/#/" + /*section*/ ctx[9]);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*section*/ ctx[9],
    				padding: true
    			})) + " svelte-hz9bf5"));

    			add_location(a, file$1, 74, 8, 1690);
    			this.first = a;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*currentSection*/ 1 && a_class_value !== (a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*section*/ ctx[9],
    				padding: true
    			})) + " svelte-hz9bf5"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(74:6) {#each ['about', 'publications', 'projects', 'cv'] as section (section)}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {#each externalLinks as x}
    function create_each_block$1(ctx) {
    	let a;
    	let t0_value = /*x*/ ctx[6].name.toUpperCase() + "";
    	let t0;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let a_class_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t0 = text(t0_value);
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			if (img.src !== (img_src_value = "icons/" + /*x*/ ctx[6].name + ".svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "link to " + /*x*/ ctx[6].name + " account");
    			add_location(img, file$1, 83, 10, 2064);
    			attr_dev(a, "href", /*x*/ ctx[6].link);

    			attr_dev(a, "class", a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*x*/ ctx[6].name,
    				padding: true,
    				externalLink: true
    			})) + " svelte-hz9bf5"));

    			add_location(a, file$1, 79, 8, 1890);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t0);
    			append_dev(a, t1);
    			append_dev(a, img);
    			append_dev(a, t2);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*currentSection*/ 1 && a_class_value !== (a_class_value = "" + (null_to_empty(classnames({
    				selected: /*currentSection*/ ctx[0] === /*x*/ ctx[6].name,
    				padding: true,
    				externalLink: true
    			})) + " svelte-hz9bf5"))) {
    				attr_dev(a, "class", a_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(79:6) {#each externalLinks as x}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div2;
    	let div1;
    	let h3;
    	let t1;
    	let div0;
    	let svg;
    	let rect0;
    	let rect1;
    	let rect2;
    	let svg_transform_value;
    	let t2;
    	let mounted;
    	let dispose;
    	let if_block = /*open*/ ctx[1] && create_if_block(ctx);

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
    			attr_dev(svg, "transform", svg_transform_value = "rotate(" + /*$rotation*/ ctx[2] + ")");
    			attr_dev(svg, "width", "25px");
    			attr_dev(svg, "height", "21px");
    			add_location(svg, file$1, 64, 6, 1296);
    			add_location(div0, file$1, 62, 4, 1254);
    			attr_dev(div1, "class", "flex align svelte-hz9bf5");
    			add_location(div1, file$1, 60, 2, 1174);
    			attr_dev(div2, "class", "flex-down bar header svelte-hz9bf5");
    			add_location(div2, file$1, 59, 0, 1137);
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

    			if (!mounted) {
    				dispose = listen_dev(div1, "click", /*toggleHeader*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$rotation*/ 4 && svg_transform_value !== (svg_transform_value = "rotate(" + /*$rotation*/ ctx[2] + ")")) {
    				attr_dev(svg, "transform", svg_transform_value);
    			}

    			if (/*open*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(div2);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $rotation;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MobileHeader", slots, []);
    	const rotation = tweened(0, { duration: 400, easing: cubicOut });
    	validate_store(rotation, "rotation");
    	component_subscribe($$self, rotation, value => $$invalidate(2, $rotation = value));
    	let { currentSection } = $$props;
    	let open = false;

    	function toggleHeader() {
    		$$invalidate(1, open = !open);
    		rotation.set(!$rotation ? 90 : 0);
    	}

    	const externalLinks = [
    		{
    			link: "https://twitter.com/_mcnutt_",
    			name: "twitter"
    		},
    		{
    			link: "https://scholar.google.com/citations?user=BFOrUoQAAAAJ",
    			name: "scholar"
    		},
    		{
    			link: "https://github.com/mcnuttandrew",
    			name: "github"
    		}
    	];

    	const writable_props = ["currentSection"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MobileHeader> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("currentSection" in $$props) $$invalidate(0, currentSection = $$props.currentSection);
    	};

    	$$self.$capture_state = () => ({
    		classnames,
    		tweened,
    		cubicOut,
    		rotation,
    		currentSection,
    		open,
    		toggleHeader,
    		externalLinks,
    		$rotation
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentSection" in $$props) $$invalidate(0, currentSection = $$props.currentSection);
    		if ("open" in $$props) $$invalidate(1, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentSection, open, $rotation, rotation, toggleHeader, externalLinks];
    }

    class MobileHeader extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { currentSection: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MobileHeader",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentSection*/ ctx[0] === undefined && !("currentSection" in props)) {
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

    var ABOUT = "I am a PhD student in Computer Science at the University of Chicago. My work falls in the intersection of  Data Visualization and HCI. \n\n<br/>\n\nI'm interested in theories of visualization (and finding opportunities for the operationalization of those ideas), as well as the design of user interfaces for knowledge-based tasks (such as visual analytics and creative coding) with an eye towards leveraging tools from programming languages and software engineering in those designs.  \n\n<br/>\nIn the near past I worked as a Data Visualization Engineer for a variety of companies in San Francisco. \nI got a formal education in physics from Reed College in Portland, and an informal education in web development from App Academy. \nI am a fan of deserts, buffalo, and bicycles.";

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * marked - a markdown parser
     * Copyright (c) 2011-2021, Christopher Jeffrey. (MIT Licensed)
     * https://github.com/markedjs/marked
     */

    var marked = createCommonjsModule(function (module, exports) {
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

      function createCommonjsModule(fn) {
        var module = { exports: {} };
      	return fn(module, module.exports), module.exports;
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

        _proto.code = function code(src) {
          var cap = this.rules.block.code.exec(src);

          if (cap) {
            var text = cap[0].replace(/^ {1,4}/gm, '');
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

                if (!this.options.pedantic ? bnext[1].length > bcurr[0].length || bnext[1].length > 3 : bnext[1].length > bcurr[1].length) {
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

        _proto.text = function text(src) {
          var cap = this.rules.block.text.exec(src);

          if (cap) {
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

        _proto.emStrong = function emStrong(src, maskedSrc, prevChar) {
          if (prevChar === void 0) {
            prevChar = '';
          }

          var match = this.rules.inline.emStrong.lDelim.exec(src);
          if (!match) return;
          if (match[3] && prevChar.match(/(?:[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0560-\u0588\u05D0-\u05EA\u05EF-\u05F2\u0620-\u064A\u0660-\u0669\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07C0-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08C7\u0904-\u0939\u093D\u0950\u0958-\u0961\u0966-\u096F\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09E6-\u09F1\u09F4-\u09F9\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A66-\u0A6F\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AE6-\u0AEF\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B66-\u0B6F\u0B71-\u0B77\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0BE6-\u0BF2\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C66-\u0C6F\u0C78-\u0C7E\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CE6-\u0CEF\u0CF1\u0CF2\u0D04-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D58-\u0D61\u0D66-\u0D78\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DE6-\u0DEF\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E86-\u0E8A\u0E8C-\u0EA3\u0EA5\u0EA7-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F20-\u0F33\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F-\u1049\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u1090-\u1099\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1820-\u1878\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A16\u1A20-\u1A54\u1A80-\u1A89\u1A90-\u1A99\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B50-\u1B59\u1B83-\u1BA0\u1BAE-\u1BE5\u1C00-\u1C23\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1C90-\u1CBA\u1CBD-\u1CBF\u1CE9-\u1CEC\u1CEE-\u1CF3\u1CF5\u1CF6\u1CFA\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312F\u3131-\u318E\u3192-\u3195\u31A0-\u31BF\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DBF\u4E00-\u9FFC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7BF\uA7C2-\uA7CA\uA7F5-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA830-\uA835\uA840-\uA873\uA882-\uA8B3\uA8D0-\uA8D9\uA8F2-\uA8F7\uA8FB\uA8FD\uA8FE\uA900-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF-\uA9D9\uA9E0-\uA9E4\uA9E6-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA50-\uAA59\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB69\uAB70-\uABE2\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDE80-\uDE9C\uDEA0-\uDED0\uDEE1-\uDEFB\uDF00-\uDF23\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE35\uDE40-\uDE48\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE4\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDD23\uDD30-\uDD39\uDE60-\uDE7E\uDE80-\uDEA9\uDEB0\uDEB1\uDF00-\uDF27\uDF30-\uDF45\uDF51-\uDF54\uDFB0-\uDFCB\uDFE0-\uDFF6]|\uD804[\uDC03-\uDC37\uDC52-\uDC6F\uDC83-\uDCAF\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD03-\uDD26\uDD36-\uDD3F\uDD44\uDD47\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDEF0-\uDEF9\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC50-\uDC59\uDC5F-\uDC61\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE50-\uDE59\uDE80-\uDEAA\uDEB8\uDEC0-\uDEC9\uDF00-\uDF1A\uDF30-\uDF3B]|\uD806[\uDC00-\uDC2B\uDCA0-\uDCF2\uDCFF-\uDD06\uDD09\uDD0C-\uDD13\uDD15\uDD16\uDD18-\uDD2F\uDD3F\uDD41\uDD50-\uDD59\uDDA0-\uDDA7\uDDAA-\uDDD0\uDDE1\uDDE3\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE89\uDE9D\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC50-\uDC6C\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46\uDD50-\uDD59\uDD60-\uDD65\uDD67\uDD68\uDD6A-\uDD89\uDD98\uDDA0-\uDDA9\uDEE0-\uDEF2\uDFB0\uDFC0-\uDFD4]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD822\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879\uD880-\uD883][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDE40-\uDE96\uDF00-\uDF4A\uDF50\uDF93-\uDF9F\uDFE0\uDFE1\uDFE3]|\uD821[\uDC00-\uDFF7]|\uD823[\uDC00-\uDCD5\uDD00-\uDD08]|\uD82C[\uDC00-\uDD1E\uDD50-\uDD52\uDD64-\uDD67\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD834[\uDEE0-\uDEF3\uDF60-\uDF78]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD838[\uDD00-\uDD2C\uDD37-\uDD3D\uDD40-\uDD49\uDD4E\uDEC0-\uDEEB\uDEF0-\uDEF9]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCCF\uDD00-\uDD43\uDD4B\uDD50-\uDD59]|\uD83B[\uDC71-\uDCAB\uDCAD-\uDCAF\uDCB1-\uDCB4\uDD01-\uDD2D\uDD2F-\uDD3D\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD83E[\uDFF0-\uDFF9]|\uD869[\uDC00-\uDEDD\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uD884[\uDC00-\uDF4A])/)) return; // _ can't be between two alphanumerics. \p{L}\p{N} includes non-english alphabet/numbers as well

          var nextChar = match[1] || match[2] || '';

          if (!nextChar || nextChar && (prevChar === '' || this.rules.inline.punctuation.exec(prevChar))) {
            var lLength = match[0].length - 1;
            var rDelim,
                rLength,
                delimTotal = lLength,
                midDelimTotal = 0;
            var endReg = match[0][0] === '*' ? this.rules.inline.emStrong.rDelimAst : this.rules.inline.emStrong.rDelimUnd;
            endReg.lastIndex = 0;
            maskedSrc = maskedSrc.slice(-1 * src.length + lLength); // Bump maskedSrc to same section of string as src (move to lexer?)

            while ((match = endReg.exec(maskedSrc)) != null) {
              rDelim = match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
              if (!rDelim) continue; // matched the first alternative in rules.js (skip the * in __abc*abc__)

              rLength = rDelim.length;

              if (match[3] || match[4]) {
                // found another Left Delim
                delimTotal += rLength;
                continue;
              } else if (match[5] || match[6]) {
                // either Left or Right Delim
                if (lLength % 3 && !((lLength + rLength) % 3)) {
                  midDelimTotal += rLength;
                  continue; // CommonMark Emphasis Rules 9-10
                }
              }

              delimTotal -= rLength;
              if (delimTotal > 0) continue; // Haven't found enough closing delimiters
              // If this is the last rDelimiter, remove extra characters. *a*** -> *a*

              if (delimTotal + midDelimTotal - rLength <= 0 && !maskedSrc.slice(endReg.lastIndex).match(endReg)) {
                rLength = Math.min(rLength, rLength + delimTotal + midDelimTotal);
              }

              if (Math.min(lLength, rLength) % 2) {
                return {
                  type: 'em',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: src.slice(1, lLength + match.index + rLength)
                };
              }

              if (Math.min(lLength, rLength) % 2 === 0) {
                return {
                  type: 'strong',
                  raw: src.slice(0, lLength + match.index + rLength + 1),
                  text: src.slice(2, lLength + match.index + rLength - 1)
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
        newline: /^(?: *(?:\n|$))+/,
        code: /^( {4}[^\n]+(?:\n(?: *(?:\n|$))*)?)+/,
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
        _paragraph: /^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html| +\n)[^\n]+)*)/,
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
        emStrong: {
          lDelim: /^(?:\*+(?:([punct_])|[^\s*]))|^_+(?:([punct*])|([^\s_]))/,
          //        (1) and (2) can only be a Right Delimiter. (3) and (4) can only be Left.  (5) and (6) can be either Left or Right.
          //        () Skip other delimiter (1) #***                (2) a***#, a***                   (3) #***a, ***a                 (4) ***#              (5) #***#                 (6) a***a
          rDelimAst: /\_\_[^_]*?\*[^_]*?\_\_|[punct_](\*+)(?=[\s]|$)|[^punct*_\s](\*+)(?=[punct_\s]|$)|[punct_\s](\*+)(?=[^punct*_\s])|[\s](\*+)(?=[punct_])|[punct_](\*+)(?=[punct_])|[^punct*_\s](\*+)(?=[^punct*_\s])/,
          rDelimUnd: /\*\*[^*]*?\_[^*]*?\*\*|[punct*](\_+)(?=[\s]|$)|[^punct*_\s](\_+)(?=[punct*\s]|$)|[punct*\s](\_+)(?=[^punct*_\s])|[\s](\_+)(?=[punct*])|[punct*](\_+)(?=[punct*])/ // ^- Not allowed for _

        },
        code: /^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,
        br: /^( {2,}|\\)\n(?!\s*$)/,
        del: noopTest$1,
        text: /^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,
        punctuation: /^([\spunctuation])/
      }; // list of punctuation marks from CommonMark spec
      // without * and _ to handle the different emphasis markers * and _

      inline._punctuation = '!"#$%&\'()+\\-.,/:;<=>?@\\[\\]`^{|}~';
      inline.punctuation = edit$1(inline.punctuation).replace(/punctuation/g, inline._punctuation).getRegex(); // sequences em should skip over [title](link), `code`, <html>

      inline.blockSkip = /\[[^\]]*?\]\([^\)]*?\)|`[^`]*?`|<[^>]*?>/g;
      inline.escapedEmSt = /\\\*|\\_/g;
      inline._comment = edit$1(block._comment).replace('(?:-->|$)', '-->').getRegex();
      inline.emStrong.lDelim = edit$1(inline.emStrong.lDelim).replace(/punct/g, inline._punctuation).getRegex();
      inline.emStrong.rDelimAst = edit$1(inline.emStrong.rDelimAst, 'g').replace(/punct/g, inline._punctuation).getRegex();
      inline.emStrong.rDelimUnd = edit$1(inline.emStrong.rDelimUnd, 'g').replace(/punct/g, inline._punctuation).getRegex();
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
        text: /^([`~]+|[^`~])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@))/
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

          if (this.options.pedantic) {
            src = src.replace(/^ +$/gm, '');
          }

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


            if (token = this.tokenizer.code(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1]; // An indented code block cannot interrupt a paragraph.

              if (lastToken && lastToken.type === 'paragraph') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              } else {
                tokens.push(token);
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


            if (token = this.tokenizer.text(src)) {
              src = src.substring(token.raw.length);
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += '\n' + token.raw;
                lastToken.text += '\n' + token.text;
              } else {
                tokens.push(token);
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

          var token, lastToken; // String with links masked to avoid interference with em and strong

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
          } // Mask out escaped em & strong delimiters


          while ((match = this.tokenizer.rules.inline.escapedEmSt.exec(maskedSrc)) != null) {
            maskedSrc = maskedSrc.slice(0, match.index) + '++' + maskedSrc.slice(this.tokenizer.rules.inline.escapedEmSt.lastIndex);
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
              var _lastToken = tokens[tokens.length - 1];

              if (_lastToken && token.type === 'text' && _lastToken.type === 'text') {
                _lastToken.raw += token.raw;
                _lastToken.text += token.text;
              } else {
                tokens.push(token);
              }

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
              var _lastToken2 = tokens[tokens.length - 1];

              if (token.type === 'link') {
                token.tokens = this.inlineTokens(token.text, [], true, inRawBlock);
                tokens.push(token);
              } else if (_lastToken2 && token.type === 'text' && _lastToken2.type === 'text') {
                _lastToken2.raw += token.raw;
                _lastToken2.text += token.text;
              } else {
                tokens.push(token);
              }

              continue;
            } // em & strong


            if (token = this.tokenizer.emStrong(src, maskedSrc, prevChar)) {
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

              if (token.raw.slice(-1) !== '_') {
                // Track prevChar before string of ____ started
                prevChar = token.raw.slice(-1);
              }

              keepPrevChar = true;
              lastToken = tokens[tokens.length - 1];

              if (lastToken && lastToken.type === 'text') {
                lastToken.raw += token.raw;
                lastToken.text += token.text;
              } else {
                tokens.push(token);
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

          _code = _code.replace(/\n$/, '') + '\n';

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

    /* src/components/About.svelte generated by Svelte v3.32.3 */

    const file$2 = "src/components/About.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i].date;
    	child_ctx[1] = list[i].content;
    	return child_ctx;
    }

    // (57:4) {#each NEWS as {date, content}}
    function create_each_block$2(ctx) {
    	let div2;
    	let div0;
    	let t0_value = /*date*/ ctx[0] + "";
    	let t0;
    	let t1;
    	let t2;
    	let div1;
    	let raw_value = marked(/*content*/ ctx[1]) + "";
    	let t3;

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
    			add_location(div0, file$2, 58, 8, 1215);
    			attr_dev(div1, "class", "news-item-content");
    			add_location(div1, file$2, 59, 8, 1265);
    			attr_dev(div2, "class", "news-item svelte-gvr2xp");
    			add_location(div2, file$2, 57, 6, 1183);
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
    			if (detaching) detach_dev(div2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(57:4) {#each NEWS as {date, content}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let raw_value = marked(ABOUT) + "";
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let h2;
    	let t3;
    	let div2;
    	let each_value = NEWS;
    	validate_each_argument(each_value);
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
    			attr_dev(img, "alt", "me in canyonlands utah");
    			attr_dev(img, "class", "self-pic svelte-gvr2xp");
    			if (img.src !== (img_src_value = "assets/desert-pic.jpg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$2, 52, 4, 1004);
    			attr_dev(div1, "class", "about-section svelte-gvr2xp");
    			add_location(div1, file$2, 48, 2, 903);
    			add_location(h2, file$2, 54, 2, 1097);
    			attr_dev(div2, "class", "about-section svelte-gvr2xp");
    			add_location(div2, file$2, 55, 2, 1113);
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*marked, NEWS*/ 0) {
    				each_value = NEWS;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div3);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ NEWS, ABOUT, marked });
    	return [];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Projects.svelte generated by Svelte v3.32.3 */

    const { Object: Object_1 } = globals;
    const file$3 = "src/components/Projects.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i].sectionName;
    	child_ctx[2] = list[i].rows;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (62:12) {#if project.sourceLink}
    function create_if_block_1(ctx) {
    	let a;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			img = element("img");
    			attr_dev(img, "alt", "github icon");
    			if (img.src !== (img_src_value = "icons/github.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "gh-icon svelte-19c2nqh");
    			add_location(img, file$3, 63, 16, 1364);
    			attr_dev(a, "href", /*project*/ ctx[5].sourceLink);
    			add_location(a, file$3, 62, 14, 1318);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, img);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(62:12) {#if project.sourceLink}",
    		ctx
    	});

    	return block;
    }

    // (67:12) {#if project.link}
    function create_if_block$1(ctx) {
    	let a;
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text("Live");
    			attr_dev(a, "href", /*project*/ ctx[5].link);
    			add_location(a, file$3, 66, 30, 1496);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(67:12) {#if project.link}",
    		ctx
    	});

    	return block;
    }

    // (54:6) {#each rows as project (project.title)}
    function create_each_block_1$1(key_1, ctx) {
    	let div2;
    	let a;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let h3;
    	let t1_value = /*project*/ ctx[5].title + "";
    	let t1;
    	let t2;
    	let h5;
    	let t3_value = /*project*/ ctx[5].dates + "";
    	let t3;
    	let t4;
    	let div1;
    	let t5;
    	let t6;
    	let p;
    	let t7_value = /*project*/ ctx[5].text + "";
    	let t7;
    	let if_block0 = /*project*/ ctx[5].sourceLink && create_if_block_1(ctx);
    	let if_block1 = /*project*/ ctx[5].link && create_if_block$1(ctx);

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
    			if (img.src !== (img_src_value = /*project*/ ctx[5].imgLink)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "image for " + /*project*/ ctx[5].title);
    			attr_dev(img, "class", "svelte-19c2nqh");
    			add_location(img, file$3, 56, 39, 1098);
    			attr_dev(div0, "class", "img-container svelte-19c2nqh");
    			add_location(div0, file$3, 56, 12, 1071);
    			attr_dev(a, "href", /*project*/ ctx[5].link);
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
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (/*project*/ ctx[5].sourceLink) if_block0.p(ctx, dirty);
    			if (/*project*/ ctx[5].link) if_block1.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(54:6) {#each rows as project (project.title)}",
    		ctx
    	});

    	return block;
    }

    // (51:2) {#each sections as {sectionName, rows}
    function create_each_block$3(key_1, ctx) {
    	let h2;
    	let t0_value = /*sectionName*/ ctx[1].toUpperCase() + "";
    	let t0;
    	let t1;
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let t2;
    	let each_value_1 = /*rows*/ ctx[2];
    	validate_each_argument(each_value_1);
    	const get_key = ctx => /*project*/ ctx[5].title;
    	validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);

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
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*sections*/ 1) {
    				each_value_1 = /*rows*/ ctx[2];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value_1, each_1_lookup, div, destroy_block, create_each_block_1$1, t2, get_each_context_1$1);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(51:2) {#each sections as {sectionName, rows}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_value = /*sections*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*sectionName*/ ctx[1];
    	validate_each_keys(ctx, each_value, get_each_context$3, get_key);

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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*sections*/ 1) {
    				each_value = /*sections*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$3, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, destroy_block, create_each_block$3, null, get_each_context$3);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Projects", slots, []);
    	const sections = Object.entries(groupBy(PROJECTS, "section")).map(([sectionName, rows]) => ({ sectionName, rows }));
    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Projects> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ PROJECTS, groupBy, sections });
    	return [sections];
    }

    class Projects extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Projects",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
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
            css: t => 'overflow: hidden;' +
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

    function flip(node, animation, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const scaleX = animation.from.width / node.clientWidth;
        const scaleY = animation.from.height / node.clientHeight;
        const dx = (animation.from.left - animation.to.left) / scaleX;
        const dy = (animation.from.top - animation.to.top) / scaleY;
        const d = Math.sqrt(dx * dx + dy * dy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(d) : duration,
            easing,
            css: (_t, u) => `transform: ${transform} translate(${u * dx}px, ${u * dy}px);`
        };
    }

    /* src/components/Publication.svelte generated by Svelte v3.32.3 */

    const { Object: Object_1$1 } = globals;
    const file$4 = "src/components/Publication.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i].name;
    	child_ctx[7] = list[i].link;
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    // (88:4) {#if !noImg}
    function create_if_block_4(ctx) {
    	let div;
    	let img;
    	let img_alt_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "alt", img_alt_value = "image drawn from " + /*publication*/ ctx[1].title);
    			if (img.src !== (img_src_value = /*publication*/ ctx[1].imgLink)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-19opfld");
    			add_location(img, file$4, 89, 8, 1753);
    			attr_dev(div, "class", "img-container svelte-19opfld");
    			add_location(div, file$4, 88, 6, 1717);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publication*/ 2 && img_alt_value !== (img_alt_value = "image drawn from " + /*publication*/ ctx[1].title)) {
    				attr_dev(img, "alt", img_alt_value);
    			}

    			if (dirty & /*publication*/ 2 && img.src !== (img_src_value = /*publication*/ ctx[1].imgLink)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(88:4) {#if !noImg}",
    		ctx
    	});

    	return block;
    }

    // (95:6) {#if publication.authors}
    function create_if_block_3(ctx) {
    	let span;
    	let raw_value = marked(/*addLinks*/ ctx[5](/*publication*/ ctx[1].authors)) + "";

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file$4, 95, 8, 1978);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			span.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publication*/ 2 && raw_value !== (raw_value = marked(/*addLinks*/ ctx[5](/*publication*/ ctx[1].authors)) + "")) span.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(95:6) {#if publication.authors}",
    		ctx
    	});

    	return block;
    }

    // (100:10) {#if publication[key]}
    function create_if_block_2(ctx) {
    	let span;
    	let t0_value = /*publication*/ ctx[1][/*key*/ ctx[10]] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			add_location(span, file$4, 99, 32, 2122);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t0);
    			append_dev(span, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publication*/ 2 && t0_value !== (t0_value = /*publication*/ ctx[1][/*key*/ ctx[10]] + "")) set_data_dev(t0, t0_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(100:10) {#if publication[key]}",
    		ctx
    	});

    	return block;
    }

    // (99:8) {#each keys as key}
    function create_each_block_1$2(ctx) {
    	let if_block_anchor;
    	let if_block = /*publication*/ ctx[1][/*key*/ ctx[10]] && create_if_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*publication*/ ctx[1][/*key*/ ctx[10]]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(99:8) {#each keys as key}",
    		ctx
    	});

    	return block;
    }

    // (105:8) {#each publication.links as {name, link}}
    function create_each_block$4(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[6] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "publink svelte-19opfld");
    			attr_dev(a, "href", a_href_value = /*link*/ ctx[7]);
    			add_location(a, file$4, 104, 49, 2275);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*publication*/ 2 && t_value !== (t_value = /*name*/ ctx[6] + "")) set_data_dev(t, t_value);

    			if (dirty & /*publication*/ 2 && a_href_value !== (a_href_value = /*link*/ ctx[7])) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(105:8) {#each publication.links as {name, link}}",
    		ctx
    	});

    	return block;
    }

    // (106:8) {#if publication.abstract}
    function create_if_block_1$1(ctx) {
    	let div;
    	let t0;
    	let t1_value = (/*abstractOpen*/ ctx[2] ? "-" : "+") + "";
    	let t1;
    	let t2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text("abstract (");
    			t1 = text(t1_value);
    			t2 = text(")");
    			attr_dev(div, "class", "publink svelte-19opfld");
    			add_location(div, file$4, 106, 10, 2369);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleAbstract*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*abstractOpen*/ 4 && t1_value !== (t1_value = (/*abstractOpen*/ ctx[2] ? "-" : "+") + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(106:8) {#if publication.abstract}",
    		ctx
    	});

    	return block;
    }

    // (112:2) {#if abstractOpen}
    function create_if_block$2(ctx) {
    	let div;
    	let t_value = /*publication*/ ctx[1].abstract + "";
    	let t;
    	let div_transition;
    	let current;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "abstract svelte-19opfld");
    			add_location(div, file$4, 112, 4, 2532);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*publication*/ 2) && t_value !== (t_value = /*publication*/ ctx[1].abstract + "")) set_data_dev(t, t_value);
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
    			if (detaching) detach_dev(div);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(112:2) {#if abstractOpen}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div3;
    	let div2;
    	let t0;
    	let div1;
    	let a;
    	let t1_value = /*publication*/ ctx[1].title + "";
    	let t1;
    	let a_href_value;
    	let t2;
    	let t3;
    	let span;
    	let t4;
    	let div0;
    	let t5;
    	let t6;
    	let current;
    	let if_block0 = !/*noImg*/ ctx[0] && create_if_block_4(ctx);
    	let if_block1 = /*publication*/ ctx[1].authors && create_if_block_3(ctx);
    	let each_value_1 = /*keys*/ ctx[4];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	let each_value = /*publication*/ ctx[1].links;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	let if_block2 = /*publication*/ ctx[1].abstract && create_if_block_1$1(ctx);
    	let if_block3 = /*abstractOpen*/ ctx[2] && create_if_block$2(ctx);

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
    			attr_dev(a, "href", a_href_value = /*publication*/ ctx[1].link);
    			add_location(a, file$4, 93, 6, 1887);
    			add_location(span, file$4, 97, 6, 2055);
    			attr_dev(div0, "class", "flex flex-wrap svelte-19opfld");
    			add_location(div0, file$4, 103, 6, 2197);
    			attr_dev(div1, "class", "flex-down svelte-19opfld");
    			add_location(div1, file$4, 92, 4, 1857);
    			attr_dev(div2, "class", "content-container svelte-19opfld");
    			add_location(div2, file$4, 86, 2, 1662);
    			attr_dev(div3, "class", "flex-down publication svelte-19opfld");
    			add_location(div3, file$4, 85, 0, 1624);
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
    		p: function update(ctx, [dirty]) {
    			if (!/*noImg*/ ctx[0]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_4(ctx);
    					if_block0.c();
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*publication*/ 2) && t1_value !== (t1_value = /*publication*/ ctx[1].title + "")) set_data_dev(t1, t1_value);

    			if (!current || dirty & /*publication*/ 2 && a_href_value !== (a_href_value = /*publication*/ ctx[1].link)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (/*publication*/ ctx[1].authors) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_3(ctx);
    					if_block1.c();
    					if_block1.m(div1, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (dirty & /*publication, keys*/ 18) {
    				each_value_1 = /*keys*/ ctx[4];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
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

    			if (dirty & /*publication*/ 2) {
    				each_value = /*publication*/ ctx[1].links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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

    			if (/*publication*/ ctx[1].abstract) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					if_block2.m(div0, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (/*abstractOpen*/ ctx[2]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty & /*abstractOpen*/ 4) {
    						transition_in(if_block3, 1);
    					}
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
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Publication", slots, []);
    	let { noImg = false } = $$props;
    	let { publication } = $$props;
    	let abstractOpen = false;

    	function toggleAbstract(e) {
    		e.preventDefault();
    		$$invalidate(2, abstractOpen = !abstractOpen);
    	}

    	const keys = ["subtitle", "journal", "date"];

    	function addLinks(authors) {
    		return Object.entries(COLLABORATOR_LINKS).reduce(
    			(str, [key, link]) => {
    				return str.replace(key, `[${key}](${link})`);
    			},
    			authors.replace("Andrew McNutt", "__Andrew McNutt__")
    		);
    	}

    	const writable_props = ["noImg", "publication"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Publication> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("noImg" in $$props) $$invalidate(0, noImg = $$props.noImg);
    		if ("publication" in $$props) $$invalidate(1, publication = $$props.publication);
    	};

    	$$self.$capture_state = () => ({
    		slide,
    		flip,
    		COLLABORATOR_LINKS,
    		marked,
    		noImg,
    		publication,
    		abstractOpen,
    		toggleAbstract,
    		keys,
    		addLinks
    	});

    	$$self.$inject_state = $$props => {
    		if ("noImg" in $$props) $$invalidate(0, noImg = $$props.noImg);
    		if ("publication" in $$props) $$invalidate(1, publication = $$props.publication);
    		if ("abstractOpen" in $$props) $$invalidate(2, abstractOpen = $$props.abstractOpen);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [noImg, publication, abstractOpen, toggleAbstract, keys, addLinks];
    }

    class Publication extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { noImg: 0, publication: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Publication",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*publication*/ ctx[1] === undefined && !("publication" in props)) {
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

    /* src/components/Publications.svelte generated by Svelte v3.32.3 */

    const { Object: Object_1$2 } = globals;
    const file$5 = "src/components/Publications.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[13] = list[i];
    	return child_ctx;
    }

    // (52:2) {#each sorts as sort}
    function create_each_block_2(ctx) {
    	let button;
    	let t_value = /*sort*/ ctx[13] + "";
    	let t;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*sort*/ ctx[13]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t = text(t_value);

    			attr_dev(button, "class", button_class_value = "" + (null_to_empty(classnames({
    				"sort-button": true,
    				"selected-button": /*sort*/ ctx[13] === /*currentSort*/ ctx[0]
    			})) + " svelte-19ovtu1"));

    			add_location(button, file$5, 52, 4, 1371);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*currentSort*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty(classnames({
    				"sort-button": true,
    				"selected-button": /*sort*/ ctx[13] === /*currentSort*/ ctx[0]
    			})) + " svelte-19ovtu1"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(52:2) {#each sorts as sort}",
    		ctx
    	});

    	return block;
    }

    // (65:4) {#each pubs[1] as publication}
    function create_each_block_1$3(ctx) {
    	let br;
    	let t;
    	let publication;
    	let current;

    	publication = new Publication({
    			props: { publication: /*publication*/ ctx[10] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			br = element("br");
    			t = space();
    			create_component(publication.$$.fragment);
    			add_location(br, file$5, 65, 6, 1726);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, br, anchor);
    			insert_dev(target, t, anchor);
    			mount_component(publication, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const publication_changes = {};
    			if (dirty & /*sortedPublications*/ 2) publication_changes.publication = /*publication*/ ctx[10];
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
    			if (detaching) detach_dev(br);
    			if (detaching) detach_dev(t);
    			destroy_component(publication, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(65:4) {#each pubs[1] as publication}",
    		ctx
    	});

    	return block;
    }

    // (62:2) {#each Object.entries(sortedPublications) as pubs}
    function create_each_block$5(ctx) {
    	let h2;
    	let t0_value = /*pubs*/ ctx[7][0].toUpperCase() + "";
    	let t0;
    	let t1;
    	let each_1_anchor;
    	let current;
    	let each_value_1 = /*pubs*/ ctx[7][1];
    	validate_each_argument(each_value_1);
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
    			add_location(h2, file$5, 62, 4, 1651);
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
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*sortedPublications*/ 2) && t0_value !== (t0_value = /*pubs*/ ctx[7][0].toUpperCase() + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*Object, sortedPublications*/ 2) {
    				each_value_1 = /*pubs*/ ctx[7][1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(h2);
    			if (detaching) detach_dev(t1);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(62:2) {#each Object.entries(sortedPublications) as pubs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div0;
    	let h3;
    	let t1;
    	let t2;
    	let div1;
    	let current;
    	let each_value_2 = /*sorts*/ ctx[2];
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = Object.entries(/*sortedPublications*/ ctx[1]);
    	validate_each_argument(each_value);
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

    			add_location(h3, file$5, 50, 2, 1326);
    			add_location(div0, file$5, 49, 0, 1318);
    			attr_dev(div1, "class", "research-section svelte-19ovtu1");
    			add_location(div1, file$5, 60, 0, 1563);
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*classnames, sorts, currentSort*/ 5) {
    				each_value_2 = /*sorts*/ ctx[2];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
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

    			if (dirty & /*Object, sortedPublications*/ 2) {
    				each_value = Object.entries(/*sortedPublications*/ ctx[1]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let sortedPublications;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Publications", slots, []);
    	let currentSort = "type";
    	const sorts = ["type", "year", "name"];

    	const typeOrder = [
    		"conference / journal articles",
    		"extended abstract / workshop papers",
    		"posters",
    		"theses / book chapters"
    	];

    	const yearOrder = [2014, 2017, 2018, 2019, 2020, 2021];

    	function sortPublications(currentSort) {
    		if (currentSort === "type" || currentSort === "year") {
    			return PUBLICATIONS.map(x => ({
    				...x,
    				year: new Date(x.date).getFullYear()
    			})).reduce(
    				(acc, row) => {
    					acc[row[currentSort]].push(row);
    					return acc;
    				},
    				(currentSort === "type" ? typeOrder : yearOrder).reduce((acc, key) => ({ ...acc, [key]: [] }), {})
    			);
    		}

    		return {
    			publications: PUBLICATIONS.sort((a, b) => a.title.localeCompare(b.title))
    		};
    	}

    	const writable_props = [];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Publications> was created with unknown prop '${key}'`);
    	});

    	const click_handler = sort => {
    		$$invalidate(0, currentSort = sort);
    	};

    	$$self.$capture_state = () => ({
    		PUBLICATIONS,
    		BLOG_POSTS,
    		PRESENTATIONS,
    		Publication,
    		classnames,
    		currentSort,
    		sorts,
    		typeOrder,
    		yearOrder,
    		sortPublications,
    		sortedPublications
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentSort" in $$props) $$invalidate(0, currentSort = $$props.currentSort);
    		if ("sortedPublications" in $$props) $$invalidate(1, sortedPublications = $$props.sortedPublications);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentSort*/ 1) {
    			$$invalidate(1, sortedPublications = sortPublications(currentSort));
    		}
    	};

    	return [currentSort, sortedPublications, sorts, click_handler];
    }

    class Publications extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Publications",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Teaching.svelte generated by Svelte v3.32.3 */

    const { Object: Object_1$3 } = globals;
    const file$6 = "src/components/Teaching.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (26:10) {#if position.link}
    function create_if_block_1$2(ctx) {
    	let a;
    	let t_value = /*position*/ ctx[4].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", /*position*/ ctx[4].link);
    			add_location(a, file$6, 26, 12, 536);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(26:10) {#if position.link}",
    		ctx
    	});

    	return block;
    }

    // (29:10) {#if !position.link}
    function create_if_block$3(ctx) {
    	let div;
    	let t_value = /*position*/ ctx[4].title + "";
    	let t;

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
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:10) {#if !position.link}",
    		ctx
    	});

    	return block;
    }

    // (24:6) {#each groups[key] as position}
    function create_each_block_1$4(ctx) {
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let i;
    	let t2_value = `${/*position*/ ctx[4].fancyTitle || /*position*/ ctx[4].role}` + "";
    	let t2;
    	let t3;
    	let span;
    	let t4_value = /*position*/ ctx[4].date + "";
    	let t4;
    	let if_block0 = /*position*/ ctx[4].link && create_if_block_1$2(ctx);
    	let if_block1 = !/*position*/ ctx[4].link && create_if_block$3(ctx);

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
    		p: function update(ctx, dirty) {
    			if (/*position*/ ctx[4].link) if_block0.p(ctx, dirty);
    			if (!/*position*/ ctx[4].link) if_block1.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$4.name,
    		type: "each",
    		source: "(24:6) {#each groups[key] as position}",
    		ctx
    	});

    	return block;
    }

    // (21:2) {#each Object.keys(groups) as key}
    function create_each_block$6(ctx) {
    	let div;
    	let h3;
    	let t0_value = /*key*/ ctx[1].toUpperCase() + "";
    	let t0;
    	let t1;
    	let t2;
    	let each_value_1 = /*groups*/ ctx[0][/*key*/ ctx[1]];
    	validate_each_argument(each_value_1);
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
    		p: function update(ctx, dirty) {
    			if (dirty & /*groups, Object*/ 1) {
    				each_value_1 = /*groups*/ ctx[0][/*key*/ ctx[1]];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$4(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(21:2) {#each Object.keys(groups) as key}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_value = Object.keys(/*groups*/ ctx[0]);
    	validate_each_argument(each_value);
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
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*groups, Object*/ 1) {
    				each_value = Object.keys(/*groups*/ ctx[0]);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Teaching", slots, []);
    	const groups = groupBy(TEACHING, "role");
    	const writable_props = [];

    	Object_1$3.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Teaching> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ TEACHING, groupBy, groups });
    	return [groups];
    }

    class Teaching extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Teaching",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/ShowPage.svelte generated by Svelte v3.32.3 */
    const file$7 = "src/components/ShowPage.svelte";

    function get_each_context$7(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i].name;
    	child_ctx[4] = list[i].link;
    	return child_ctx;
    }

    function get_each_context_1$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[7] = list[i];
    	return child_ctx;
    }

    // (80:6) {#if publication[key]}
    function create_if_block$4(ctx) {
    	let span;
    	let t_value = /*publication*/ ctx[0][/*key*/ ctx[7]] + "";
    	let t;

    	const block = {
    		c: function create() {
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$7, 79, 28, 1506);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(80:6) {#if publication[key]}",
    		ctx
    	});

    	return block;
    }

    // (79:4) {#each keys as key}
    function create_each_block_1$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*publication*/ ctx[0][/*key*/ ctx[7]] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (/*publication*/ ctx[0][/*key*/ ctx[7]]) if_block.p(ctx, dirty);
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$5.name,
    		type: "each",
    		source: "(79:4) {#each keys as key}",
    		ctx
    	});

    	return block;
    }

    // (86:6) {#each publication.links as {name, link}}
    function create_each_block$7(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[3] + "";
    	let t;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "class", "publink svelte-l95eyp");
    			attr_dev(a, "href", /*link*/ ctx[4]);
    			add_location(a, file$7, 85, 47, 1708);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$7.name,
    		type: "each",
    		source: "(86:6) {#each publication.links as {name, link}}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div7;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let a;
    	let t1_value = /*publication*/ ctx[0].title + "";
    	let t1;
    	let t2;
    	let t3;
    	let div2;
    	let t5;
    	let div4;
    	let div3;
    	let t6;
    	let div5;
    	let t8;
    	let div6;
    	let each_value_1 = /*keys*/ ctx[1];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$5(get_each_context_1$5(ctx, each_value_1, i));
    	}

    	let each_value = /*publication*/ ctx[0].links;
    	validate_each_argument(each_value);
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
    			div6.textContent = `${/*publication*/ ctx[0].abstract}`;
    			attr_dev(img, "alt", "image drawn from " + /*publication*/ ctx[0].title);
    			if (img.src !== (img_src_value = /*publication*/ ctx[0].imgLink)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-l95eyp");
    			add_location(img, file$7, 73, 4, 1272);
    			attr_dev(div0, "class", "img-container svelte-l95eyp");
    			add_location(div0, file$7, 72, 2, 1240);
    			attr_dev(a, "href", /*publication*/ ctx[0].link);
    			attr_dev(a, "class", "title svelte-l95eyp");
    			add_location(a, file$7, 76, 4, 1388);
    			attr_dev(div1, "class", "flex-down svelte-l95eyp");
    			add_location(div1, file$7, 75, 2, 1360);
    			attr_dev(div2, "class", "section-subtitle svelte-l95eyp");
    			add_location(div2, file$7, 82, 2, 1566);
    			attr_dev(div3, "class", "flex svelte-l95eyp");
    			add_location(div3, file$7, 84, 4, 1642);
    			attr_dev(div4, "class", "materials svelte-l95eyp");
    			add_location(div4, file$7, 83, 2, 1614);
    			attr_dev(div5, "class", "section-subtitle svelte-l95eyp");
    			add_location(div5, file$7, 88, 2, 1779);
    			attr_dev(div6, "class", "abstract svelte-l95eyp");
    			add_location(div6, file$7, 89, 2, 1826);
    			attr_dev(div7, "class", "flex-down publication svelte-l95eyp");
    			add_location(div7, file$7, 71, 0, 1202);
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
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*publication, keys*/ 3) {
    				each_value_1 = /*keys*/ ctx[1];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$5(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
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

    			if (dirty & /*publication*/ 1) {
    				each_value = /*publication*/ ctx[0].links;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$7(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
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
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("ShowPage", slots, []);
    	const pubName = getShowPage();
    	const publication = PUBLICATIONS.find(d => d.urlTitle === pubName);
    	const keys = ["subtitle", "date", "authors", "journal"];
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ShowPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PUBLICATIONS,
    		getShowPage,
    		pubName,
    		publication,
    		keys
    	});

    	return [publication, keys];
    }

    class ShowPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ShowPage",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/components/CV.svelte generated by Svelte v3.32.3 */
    const file$8 = "src/components/CV.svelte";

    function get_each_context$8(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[0] = list[i];
    	return child_ctx;
    }

    // (44:4) {#each PUBLICATIONS as publication}
    function create_each_block_2$1(ctx) {
    	let publication;
    	let current;

    	publication = new Publication({
    			props: {
    				publication: /*publication*/ ctx[0],
    				noImg: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(publication.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(44:4) {#each PUBLICATIONS as publication}",
    		ctx
    	});

    	return block;
    }

    // (53:4) {#each BLOG_POSTS as publication}
    function create_each_block_1$6(ctx) {
    	let publication;
    	let current;

    	publication = new Publication({
    			props: {
    				publication: /*publication*/ ctx[0],
    				noImg: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(publication.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$6.name,
    		type: "each",
    		source: "(53:4) {#each BLOG_POSTS as publication}",
    		ctx
    	});

    	return block;
    }

    // (62:4) {#each PRESENTATIONS as publication}
    function create_each_block$8(ctx) {
    	let publication;
    	let current;

    	publication = new Publication({
    			props: {
    				publication: /*publication*/ ctx[0],
    				noImg: true
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(publication.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$8.name,
    		type: "each",
    		source: "(62:4) {#each PRESENTATIONS as publication}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let h1;
    	let t1;
    	let div0;
    	let t3;
    	let div1;
    	let t4;
    	let a0;
    	let t6;
    	let section0;
    	let h20;
    	let t8;
    	let h30;
    	let t10;
    	let div2;
    	let t12;
    	let div3;
    	let t13;
    	let a1;
    	let t15;
    	let br0;
    	let t16;
    	let h31;
    	let t18;
    	let div4;
    	let t20;
    	let div5;
    	let t21;
    	let a2;
    	let t23;
    	let br1;
    	let t24;
    	let h32;
    	let t26;
    	let div6;
    	let t28;
    	let div7;
    	let t29;
    	let a3;
    	let t31;
    	let section1;
    	let h21;
    	let t33;
    	let div8;
    	let t35;
    	let div9;
    	let t37;
    	let div10;
    	let t39;
    	let div11;
    	let t41;
    	let div12;
    	let t43;
    	let section2;
    	let h22;
    	let t45;
    	let div13;
    	let t46;
    	let section3;
    	let h23;
    	let t48;
    	let div14;
    	let t49;
    	let section4;
    	let h24;
    	let t51;
    	let div15;
    	let t52;
    	let section5;
    	let h25;
    	let t54;
    	let teaching;
    	let current;
    	let each_value_2 = PUBLICATIONS;
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = BLOG_POSTS;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$6(get_each_context_1$6(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = PRESENTATIONS;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$8(get_each_context$8(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	teaching = new Teaching({ $$inline: true });

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			h1.textContent = "Andrew McNutt";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "PhD Student at Univeristy of Chicago in Computer Science";
    			t3 = space();
    			div1 = element("div");
    			t4 = text("For a pdf version of my CV ");
    			a0 = element("a");
    			a0.textContent = "click here";
    			t6 = space();
    			section0 = element("section");
    			h20 = element("h2");
    			h20.textContent = "Education";
    			t8 = space();
    			h30 = element("h3");
    			h30.textContent = "University of Chicago";
    			t10 = space();
    			div2 = element("div");
    			div2.textContent = "PhD, Computer Science, 2017 - Present";
    			t12 = space();
    			div3 = element("div");
    			t13 = text("Advised by ");
    			a1 = element("a");
    			a1.textContent = "Ravi Chugh";
    			t15 = space();
    			br0 = element("br");
    			t16 = space();
    			h31 = element("h3");
    			h31.textContent = "University of Chicago";
    			t18 = space();
    			div4 = element("div");
    			div4.textContent = "MS, Computer Science, 2017 - 2019";
    			t20 = space();
    			div5 = element("div");
    			t21 = text("Advised by ");
    			a2 = element("a");
    			a2.textContent = "Gordon Kindlmann";
    			t23 = space();
    			br1 = element("br");
    			t24 = space();
    			h32 = element("h3");
    			h32.textContent = "Reed College";
    			t26 = space();
    			div6 = element("div");
    			div6.textContent = "BA, Physics, 2010 - 2014";
    			t28 = space();
    			div7 = element("div");
    			t29 = text("Advised by ");
    			a3 = element("a");
    			a3.textContent = "Nelia Mann";
    			t31 = space();
    			section1 = element("section");
    			h21 = element("h2");
    			h21.textContent = "Professional Experience";
    			t33 = space();
    			div8 = element("div");
    			div8.textContent = "Research Intern at Tableau Research, 2019";
    			t35 = space();
    			div9 = element("div");
    			div9.textContent = "Graduate Researcher at University of Chicago, 2017 -";
    			t37 = space();
    			div10 = element("div");
    			div10.textContent = "Data Visualization Engineer at Uber, 2015 - 2017";
    			t39 = space();
    			div11 = element("div");
    			div11.textContent = "Scientific Visualization Developer at Collaborative Drug Discovery, 2014 - 2015";
    			t41 = space();
    			div12 = element("div");
    			div12.textContent = "Undergraduate Researcher at Reed College, 2013";
    			t43 = space();
    			section2 = element("section");
    			h22 = element("h2");
    			h22.textContent = "Publications";
    			t45 = space();
    			div13 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t46 = space();
    			section3 = element("section");
    			h23 = element("h2");
    			h23.textContent = "BLOG POSTS";
    			t48 = space();
    			div14 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t49 = space();
    			section4 = element("section");
    			h24 = element("h2");
    			h24.textContent = "Talks";
    			t51 = space();
    			div15 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t52 = space();
    			section5 = element("section");
    			h25 = element("h2");
    			h25.textContent = "Teaching";
    			t54 = space();
    			create_component(teaching.$$.fragment);
    			add_location(h1, file$8, 12, 0, 243);
    			add_location(div0, file$8, 13, 0, 266);
    			attr_dev(a0, "href", "./assets/cv.pdf");
    			add_location(a0, file$8, 14, 32, 366);
    			add_location(div1, file$8, 14, 0, 334);
    			add_location(h20, file$8, 17, 2, 442);
    			add_location(h30, file$8, 18, 2, 463);
    			add_location(div2, file$8, 19, 2, 496);
    			attr_dev(a1, "href", "http://people.cs.uchicago.edu/~rchugh/");
    			add_location(a1, file$8, 20, 18, 563);
    			add_location(div3, file$8, 20, 2, 547);
    			add_location(br0, file$8, 21, 2, 635);
    			add_location(h31, file$8, 22, 2, 644);
    			add_location(div4, file$8, 23, 2, 677);
    			attr_dev(a2, "href", "http://people.cs.uchicago.edu/~glk/");
    			add_location(a2, file$8, 24, 18, 740);
    			add_location(div5, file$8, 24, 2, 724);
    			add_location(br1, file$8, 25, 2, 815);
    			add_location(h32, file$8, 26, 2, 824);
    			add_location(div6, file$8, 27, 2, 848);
    			attr_dev(a3, "href", "http://people.cs.uchicago.edu/~rchugh/");
    			add_location(a3, file$8, 28, 18, 902);
    			add_location(div7, file$8, 28, 2, 886);
    			attr_dev(section0, "class", "section svelte-b4hjag");
    			add_location(section0, file$8, 16, 0, 414);
    			add_location(h21, file$8, 32, 2, 1012);
    			add_location(div8, file$8, 33, 2, 1047);
    			add_location(div9, file$8, 34, 2, 1102);
    			add_location(div10, file$8, 35, 2, 1168);
    			add_location(div11, file$8, 36, 2, 1230);
    			add_location(div12, file$8, 37, 2, 1323);
    			attr_dev(section1, "class", "section svelte-b4hjag");
    			add_location(section1, file$8, 31, 0, 984);
    			add_location(h22, file$8, 41, 2, 1421);
    			attr_dev(div13, "class", "research-section");
    			add_location(div13, file$8, 42, 2, 1445);
    			attr_dev(section2, "class", "section svelte-b4hjag");
    			add_location(section2, file$8, 40, 0, 1393);
    			add_location(h23, file$8, 50, 2, 1626);
    			attr_dev(div14, "class", "research-section");
    			add_location(div14, file$8, 51, 2, 1648);
    			attr_dev(section3, "class", "section svelte-b4hjag");
    			add_location(section3, file$8, 49, 0, 1598);
    			add_location(h24, file$8, 59, 2, 1827);
    			attr_dev(div15, "class", "research-section");
    			add_location(div15, file$8, 60, 2, 1844);
    			attr_dev(section4, "class", "section svelte-b4hjag");
    			add_location(section4, file$8, 58, 0, 1799);
    			add_location(h25, file$8, 72, 2, 2091);
    			attr_dev(section5, "class", "section svelte-b4hjag");
    			add_location(section5, file$8, 71, 0, 2063);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, t4);
    			append_dev(div1, a0);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, section0, anchor);
    			append_dev(section0, h20);
    			append_dev(section0, t8);
    			append_dev(section0, h30);
    			append_dev(section0, t10);
    			append_dev(section0, div2);
    			append_dev(section0, t12);
    			append_dev(section0, div3);
    			append_dev(div3, t13);
    			append_dev(div3, a1);
    			append_dev(section0, t15);
    			append_dev(section0, br0);
    			append_dev(section0, t16);
    			append_dev(section0, h31);
    			append_dev(section0, t18);
    			append_dev(section0, div4);
    			append_dev(section0, t20);
    			append_dev(section0, div5);
    			append_dev(div5, t21);
    			append_dev(div5, a2);
    			append_dev(section0, t23);
    			append_dev(section0, br1);
    			append_dev(section0, t24);
    			append_dev(section0, h32);
    			append_dev(section0, t26);
    			append_dev(section0, div6);
    			append_dev(section0, t28);
    			append_dev(section0, div7);
    			append_dev(div7, t29);
    			append_dev(div7, a3);
    			insert_dev(target, t31, anchor);
    			insert_dev(target, section1, anchor);
    			append_dev(section1, h21);
    			append_dev(section1, t33);
    			append_dev(section1, div8);
    			append_dev(section1, t35);
    			append_dev(section1, div9);
    			append_dev(section1, t37);
    			append_dev(section1, div10);
    			append_dev(section1, t39);
    			append_dev(section1, div11);
    			append_dev(section1, t41);
    			append_dev(section1, div12);
    			insert_dev(target, t43, anchor);
    			insert_dev(target, section2, anchor);
    			append_dev(section2, h22);
    			append_dev(section2, t45);
    			append_dev(section2, div13);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div13, null);
    			}

    			insert_dev(target, t46, anchor);
    			insert_dev(target, section3, anchor);
    			append_dev(section3, h23);
    			append_dev(section3, t48);
    			append_dev(section3, div14);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div14, null);
    			}

    			insert_dev(target, t49, anchor);
    			insert_dev(target, section4, anchor);
    			append_dev(section4, h24);
    			append_dev(section4, t51);
    			append_dev(section4, div15);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div15, null);
    			}

    			insert_dev(target, t52, anchor);
    			insert_dev(target, section5, anchor);
    			append_dev(section5, h25);
    			append_dev(section5, t54);
    			mount_component(teaching, section5, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*PUBLICATIONS*/ 0) {
    				each_value_2 = PUBLICATIONS;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div13, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*BLOG_POSTS*/ 0) {
    				each_value_1 = BLOG_POSTS;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$6(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1$6(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div14, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*PRESENTATIONS*/ 0) {
    				each_value = PRESENTATIONS;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$8(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$8(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div15, null);
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
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(section0);
    			if (detaching) detach_dev(t31);
    			if (detaching) detach_dev(section1);
    			if (detaching) detach_dev(t43);
    			if (detaching) detach_dev(section2);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t46);
    			if (detaching) detach_dev(section3);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t49);
    			if (detaching) detach_dev(section4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(t52);
    			if (detaching) detach_dev(section5);
    			destroy_component(teaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CV", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CV> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Teaching,
    		BLOG_POSTS,
    		PRESENTATIONS,
    		PUBLICATIONS,
    		Publication
    	});

    	return [];
    }

    class CV extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CV",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.32.3 */
    const file$9 = "src/App.svelte";

    // (98:8) {:else}
    function create_else_block(ctx) {
    	let about;
    	let current;
    	about = new About({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(about.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(98:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (96:48) 
    function create_if_block_4$1(ctx) {
    	let teaching;
    	let current;
    	teaching = new Teaching({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(teaching.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4$1.name,
    		type: "if",
    		source: "(96:48) ",
    		ctx
    	});

    	return block;
    }

    // (94:48) 
    function create_if_block_3$1(ctx) {
    	let projects;
    	let current;
    	projects = new Projects({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(projects.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(94:48) ",
    		ctx
    	});

    	return block;
    }

    // (92:42) 
    function create_if_block_2$1(ctx) {
    	let cv;
    	let current;
    	cv = new CV({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(cv.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(92:42) ",
    		ctx
    	});

    	return block;
    }

    // (90:49) 
    function create_if_block_1$3(ctx) {
    	let showpage;
    	let current;
    	showpage = new ShowPage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(showpage.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(90:49) ",
    		ctx
    	});

    	return block;
    }

    // (88:8) {#if currentSection === 'publications'}
    function create_if_block$5(ctx) {
    	let publications;
    	let current;
    	publications = new Publications({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(publications.$$.fragment);
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

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(88:8) {#if currentSection === 'publications'}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let div4;
    	let div0;
    	let h1;
    	let t1;
    	let div3;
    	let mobileheader;
    	let t2;
    	let div2;
    	let header;
    	let t3;
    	let div1;
    	let current_block_type_index;
    	let if_block;
    	let current;

    	mobileheader = new MobileHeader({
    			props: {
    				currentSection: /*currentSection*/ ctx[0]
    			},
    			$$inline: true
    		});

    	header = new Header({
    			props: {
    				currentSection: /*currentSection*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const if_block_creators = [
    		create_if_block$5,
    		create_if_block_1$3,
    		create_if_block_2$1,
    		create_if_block_3$1,
    		create_if_block_4$1,
    		create_else_block
    	];

    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*currentSection*/ ctx[0] === "publications") return 0;
    		if (/*currentSection*/ ctx[0] === "show-page") return 1;
    		if (/*currentSection*/ ctx[0] === "cv") return 2;
    		if (/*currentSection*/ ctx[0] === "projects") return 3;
    		if (/*currentSection*/ ctx[0] === "teaching") return 4;
    		return 5;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "ANDREW MCNUTT";
    			t1 = space();
    			div3 = element("div");
    			create_component(mobileheader.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(header.$$.fragment);
    			t3 = space();
    			div1 = element("div");
    			if_block.c();
    			attr_dev(h1, "class", "svelte-7waqd0");
    			add_location(h1, file$9, 80, 4, 1519);
    			attr_dev(div0, "class", "header svelte-7waqd0");
    			add_location(div0, file$9, 79, 2, 1494);
    			attr_dev(div1, "class", "content-wrapper svelte-7waqd0");
    			add_location(div1, file$9, 86, 6, 1699);
    			attr_dev(div2, "class", "main-container svelte-7waqd0");
    			add_location(div2, file$9, 84, 4, 1630);
    			attr_dev(div3, "class", "flex-down full-width svelte-7waqd0");
    			add_location(div3, file$9, 82, 2, 1553);
    			attr_dev(div4, "class", "flex-down full-height svelte-7waqd0");
    			add_location(div4, file$9, 78, 0, 1456);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, h1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			mount_component(mobileheader, div3, null);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			mount_component(header, div2, null);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			if_blocks[current_block_type_index].m(div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const mobileheader_changes = {};
    			if (dirty & /*currentSection*/ 1) mobileheader_changes.currentSection = /*currentSection*/ ctx[0];
    			mobileheader.$set(mobileheader_changes);
    			const header_changes = {};
    			if (dirty & /*currentSection*/ 1) header_changes.currentSection = /*currentSection*/ ctx[0];
    			header.$set(header_changes);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

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
    				if_block.m(div1, null);
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
    			if (detaching) detach_dev(div4);
    			destroy_component(mobileheader);
    			destroy_component(header);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let currentSection = getRoute();

    	window.onhashchange = () => {
    		$$invalidate(0, currentSection = getRoute());
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Header,
    		MobileHeader,
    		About,
    		Projects,
    		Publications,
    		Teaching,
    		ShowPage,
    		CV,
    		getRoute,
    		currentSection
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentSection" in $$props) $$invalidate(0, currentSection = $$props.currentSection);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [currentSection];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    const app = new App({target: document.body});

    return app;

}());
//# sourceMappingURL=bundle.js.map
