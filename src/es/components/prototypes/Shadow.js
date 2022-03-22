// @ts-check
/** @typedef {ShadowRootMode | 'false'} mode */
/** @typedef {{
  path: string,
  cssSelector?: string,
  namespace?: string|false,
  namespaceFallback?: boolean,
  styleNode?: HTMLStyleElement,
  origStyle?: string | Promise<string>,
  style?: string,
  appendStyleNode?: boolean,
  error?: string,
  maxWidth?: string,
  node?: HTMLElement & Shadow & *
}} fetchCSSParams */

/* global HTMLElement */
/* global document */
/* global self */
/* global fetch */
/* global CustomEvent */

/**
 * Shadow is a helper with a few functions for every web component which possibly allows a shadowRoot (atom, organism and molecule)
 *
 * @export
 * @function Shadow
 * @param {CustomElementConstructor} ChosenHTMLElement
 * @attribute {mode} [mode='open'] decide which ShadowRootMode it shall be + 'false' if no shadow is desired
 * @attribute {namespace} namespace all css vars by the string passed here
 * @attribute {namespace-fallback} if the node has this attribute it will make a fallback to the css vars without namespace
 * @property {
    connectedCallback,
    disconnectedCallback,
    Shadow.parseAttribute,
    Shadow.getMode,
    mode,
    namespace,
    namespaceFallback,
    hasShadowRoot,
    root,
    cssSelector,
    css,
    _css,
    _cssHidden,
    setCss,
    Shadow.cssHostFallback,
    Shadow.cssNamespaceToVarFunc,
    Shadow.cssNamespaceToVarDec,
    Shadow.cssNamespaceToVar,
    cssMaxWidth,
    fetchCSS,
    Shadow.cssTextDecorationShortHandFix,
    html
  }
 * @return {CustomElementConstructor | *}
 */
export const Shadow = (ChosenHTMLElement = HTMLElement) => class Shadow extends ChosenHTMLElement {
  /**
   * Creates an instance of Shadow. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{mode?: mode | undefined, namespace?: string | undefined, namespaceFallback?: boolean | undefined}} [options = {mode: undefined, namespace: undefined, namespaceFallback: undefined}]
   * @param {*} args
   */
  constructor (options = { mode: undefined, namespace: undefined, namespaceFallback: undefined }, ...args) {
    // @ts-ignore
    super(...args)

    /**
     * Digest attribute to have shadow or not
     * open, closed or false (no shadow) Note: open or closed only differs by exposing shadowRoot, which could be worked around anyways.
     * IMPORTANT: If you use mode = 'closed' this.shadowRoot will not be exposed and for this reason this.root, this.html and this.css is not going to work
     *
     * @type {mode}
     */
    this.mode = Shadow.getMode(typeof options.mode === 'string' ? options.mode : this.getAttribute('mode'))
    if (this.hasShadowRoot) {
      // @ts-ignore
      const shadowRoot = this.attachShadow({ mode: this.mode })
      Array.from(this.children).forEach(node => {
        if (!node.getAttribute('slot')) shadowRoot.appendChild(node)
      })
    }
    if (typeof options.namespace === 'string') this.setAttribute('namespace', options.namespace)
    /** @type {string} */
    this.namespace = this.getAttribute('namespace') || ''
    if (options.namespaceFallback) this.setAttribute('namespace-fallback', '')
    /** @type {boolean} */
    this.namespaceFallback = this.hasAttribute('namespace-fallback')
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   * must be here as a placeholder
   *
   * @return {void}
   */
  connectedCallback () {}

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   * must be here as a placeholder
   *
   * @return {void}
   */
  disconnectedCallback () {}

  /**
   * Helper function to parse object strings within attributes
   * return object if JSON parsable or null
   *
   * @static
   * @param {string} attribute
   * @return {{} | null}
   */
  static parseAttribute (attribute) {
    if (!attribute || typeof attribute !== 'string') return null
    try {
      return JSON.parse(attribute.replace(/'/g, '"')) || null
    } catch (e) {
      return null
    }
  }

  /**
   * returns a mode from a string and falls back to 'open'
   *
   * @static
   * @param {string | null} mode
   * @return {mode}
   */
  static getMode (mode) {
    return mode === 'closed' || mode === 'open' || mode === 'false' ? mode : 'open'
  }

  /**
   * check if we operate with a shadow
   *
   * @readonly
   * @return {boolean}
   */
  get hasShadowRoot () {
    return this.mode === 'closed' || this.mode === 'open'
  }

  /**
   * html nodes have to be placed within the shadowRoot if existent
   * this function helps to find the parent (shadowRoot or this)
   *
   * @readonly
   * @return {ShadowRoot | this}
   */
  get root () {
    return this.shadowRoot || this
  }

  /**
   * selector :host only works when shadow is active, fallback to id then nodeName
   *
   * @readonly
   * @return {string}
   */
  get cssSelector () {
    return this.hasShadowRoot ? ':host' : this.getAttribute('id') ? `#${this.getAttribute('id')}` : this.nodeName
  }

  /**
   * the master css style of this component
   *
   * @return {string}
   */
  get css () {
    return this._css && this._css.textContent
  }

  /**
   * to clear, set empty string otherwise it gets prepended to already set style
   *
   * @param {string} style
   */
  set css (style) {
    this.setCss(style)
  }

  /**
   * setCss is an alternative to the this.css setter and returns a string once done
   *
   * @param {string} style
   * @param {string} [cssSelector = this.cssSelector]
   * @param {string|false} [namespace = this.namespace]
   * @param {boolean} [namespaceFallback = this.namespaceFallback]
   * @param {HTMLStyleElement} [styleNode = this._css]
   * @param {boolean} [appendStyleNode = true]
   * @param {string} [maxWidth = this.mobileBreakpoint]
   * @param {HTMLElement & Shadow} [node = this]
   * @return {string}
   */
  setCss (style, cssSelector = this.cssSelector, namespace = this.namespace, namespaceFallback = this.namespaceFallback, styleNode = this._css, appendStyleNode = true, maxWidth = this.mobileBreakpoint, node = this) {
    if (!styleNode) {
    /** @type {HTMLStyleElement} */
      styleNode = document.createElement('style')
      styleNode.setAttribute('_css', '')
      styleNode.setAttribute('protected', 'true') // this will avoid deletion by html=''
      this._css = styleNode
    }
    if (appendStyleNode) node.root.appendChild(styleNode)
    if (!style) {
      return (styleNode.textContent = '')
    } else {
      style = Shadow.cssMaxWidth(style, maxWidth)
      if (cssSelector !== ':host') style = Shadow.cssHostFallback(style, cssSelector)
      if (namespace) {
        if (style.includes('---')) console.error('this.css has illegal dash characters at:', this)
        if (namespaceFallback) {
          style = Shadow.cssNamespaceToVarFunc(style, namespace)
          style = Shadow.cssNamespaceToVarDec(style, namespace)
        } else {
          style = Shadow.cssNamespaceToVar(style, namespace)
        }
      }
      // TODO: Review the safari fix below, if the bug got fixed within safari itself (NOTE: -webkit prefix did not work for text-decoration-thickness). DONE 2021.11.10 | LAST CHECKED 2021.11.10
      // safari text-decoration un-supported shorthand fix
      if (navigator.userAgent.includes('Mac') && style.includes('text-decoration:')) style = Shadow.cssTextDecorationShortHandFix(style, node)
      return (styleNode.textContent += style)
    }
  }

  /**
   * namespace and fallback for variable consumptions
   * NOTE: this function has two simple regex which are likely faster in the main dom threat
   *
   * @static
   * @param {string} style
   * @param {string} cssSelector
   * @return {string}
   */
  static cssHostFallback (style, cssSelector) {
    style = style.replace(/:host\s{0,5}\((.*?)\)/g, `${cssSelector}$1 `) // remove :host([...]) selector brackets
    return style.replace(/:host\s{0,5}/g, `${cssSelector} `) // replace :host with cssSelector
  }

  /**
   * namespace and fallback for variable consumptions
   * NOTE: this function has a lot of recursive calls and would be nearly DOUBLE as fast within a webworker (tested)
   * BUT: It produces a flickering (build up) on pictures within a component eg. Wrapper.js and for that is skipped at this stage
   *
   * @static
   * @param {string} style
   * @param {string} namespace
   * @return {string}
   */
  static cssNamespaceToVarFunc (style, namespace) {
    return style.replace(/var\(--([^,)]*)([^;]*)/g, (match, p1, p2) => {
      if (!p2) console.error('this.css cssNamespaceToVarFunc found corrupt css at:', this)
      return `var(--${namespace}${p1},var(--${p1}${p2 ? this.cssNamespaceToVarFunc(p2, namespace).replace(/([^)]*)(.*?)$/, '$1)$2') : '));'}`
    })
  }

  /**
   * namespace and fallback for variable declarations
   * NOTE: this function has a simple regex which is couple ms 5-10% faster in the main dom threat (tested)
   *
   * @static
   * @param {string} style
   * @param {string} namespace
   * @return {string}
   */
  static cssNamespaceToVarDec (style, namespace) {
    return style.replace(/([^(])--([^;]*)/g, `$1--${namespace}$2;--$2`)
  }

  /**
   * namespace for variable declarations and consumptions
   * NOTE: this function has a simple regex which is likely faster in the main dom threat
   *
   * @static
   * @param {string} style
   * @param {string} namespace
   * @return {string}
   */
  static cssNamespaceToVar (style, namespace) {
    return style.replace(/--/g, `--${namespace}`)
  }

  /**
   * maxWidth replaced by media query declaration
   *
   * @static
   * @param {string} style
   * @param {string} maxWidth
   * @return {string}
   */
  // @ts-ignore
  static cssMaxWidth (style, maxWidth) {
    return style.replace(/_max-width_/g, maxWidth)
  }

  /**
   * spread text-decoration shorthand to text-decoration-line, text-decoration-style, text-decoration-color and text-decoration-thickness
   *
   * @static
   * @param {string} style
   * @param {HTMLElement} node
   * @return {string}
   */
  static cssTextDecorationShortHandFix (style, node) {
    return style.replace(/text-decoration:\s*([^;]*);/g, (match, p1) => {
      if (p1.includes('var(--')) p1.match(/var\(--[^,)]*/g).some(variable => (p1 = self.getComputedStyle(node).getPropertyValue(variable.replace('var(', ''))) !== '')
      return `${p1.split(' ').filter(prop => /\w/g.test(prop)).reduce((acc, prop, i) => {
        switch (i) {
          case 0:
            return `${acc}text-decoration-line: ${prop};`
          case 1:
            return `${acc}text-decoration-style: ${prop};`
          case 2:
            return `${acc}text-decoration-color: ${prop};`
          case 3:
            return `${acc}text-decoration-thickness: ${prop};`
          default:
            return acc
        }
      }, `${match}/* Safari fix of text-decoration shorthand bug which only supports the first two arguments. */`)}/* end of fix. More Infos at: src/es/components/web-components-cms-template/src/es/components/prototypes/Shadow.js */`
    }) // find text-decoration: and spread the arguments to line, style, color and thickness
  }

  /**
   * renders the o-highlight-list css
   *
   * @param {fetchCSSParams[]} fetchCSSParams
   * @param {boolean} [hide = true]
   * @param {boolean} [useController = true]
   * @return {Promise<fetchCSSParams[]>}
   */
  fetchCSS (fetchCSSParams, hide = true, useController = true) {
    if (hide) this.hidden = true
    if (!Array.isArray(fetchCSSParams)) fetchCSSParams = [fetchCSSParams]
    if (useController && document.body.hasAttribute(this.getAttribute('fetch-css') || 'fetch-css')) {
      // use: /src/es/components/controllers/fetchCss/FetchCss.js instead of fetching here, to use the cache from within the controller
      return new Promise(
        /**
         * setup Promise function
         *
         * @param {(fetchCSSParams: fetchCSSParams[]) => fetchCSSParams[] | any} resolve
         * @return {boolean}
         */
        resolve => this.dispatchEvent(new CustomEvent(this.getAttribute('fetch-css') || 'fetch-css', {
          /** @type {import("../controllers/fetchCss/FetchCss.js").fetchCssEventDetail} */
          detail: {
            fetchCSSParams,
            hide,
            resolve,
            node: this
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      ).then(
        /**
         * the controller resolving fetch-css will return with its fetchCSS results
         *
         * @param {fetchCSSParams[]} resultFetchCSSParams
         * @return {fetchCSSParams[]}
         */
        resultFetchCSSParams => {
          if (hide) this.hidden = false
          return resultFetchCSSParams
        }
      )
    } else {
      // TODO: typeof fetchCSSParam.then === 'function'
      return Promise.all(fetchCSSParams.map(
        /**
         * fetch each fetchCSSParam.path and return the promise
         *
         * @param {fetchCSSParams} fetchCSSParam
         * @return {Promise<fetchCSSParams>}
         */
        fetchCSSParam => (fetchCSSParam.origStyle 
          ? Promise.all([Promise.resolve(fetchCSSParam), Promise.resolve(fetchCSSParam.origStyle)])
          : fetch(fetchCSSParam.path).then(
          /**
           * return the fetchCSSParam with the response.text or an Error
           *
           * @param {Response} response
           * @return {Promise<[fetchCSSParams, string]>}
           */
          response => {
            if (response.status >= 200 && response.status <= 299) return Promise.all([Promise.resolve(fetchCSSParam), response.text()])
            throw new Error(response.statusText)
          }
        )).then(
          /**
             * Resolve both promises and return it into one
             *
             * @param {[fetchCSSParams, string]} fetchCSSParam, style
             * @return {fetchCSSParams}
             */
          ([fetchCSSParam, style]) => ({ ...fetchCSSParam, style })
        ).catch(
          /**
             * Return the fetchCSSParams with the attached error
             *
             * @param {string} error
             * @return {fetchCSSParams}
             */
          error => {
            if (hide) this.hidden = false
            error = `${fetchCSSParam.path} ${error}!!!`
            // @ts-ignore
            return { ...fetchCSSParam, error: (this.html = console.error(error, this) || `<code style="color: red;">${error}</code>`) }
          }
        )
      )).then(
        /**
         * Process each fetchCSSParam, make a styleNode if needed and return them with the result of setStyle
         *
         * @param {fetchCSSParams[]} fetchCSSParams
         * @return {fetchCSSParams[]}
         */
        fetchCSSParams => {
          if (hide) this.hidden = false
          return fetchCSSParams.map(
            /**
             * @param {fetchCSSParams} path, cssSelector, namespace, namespaceFallback, styleNode, appendStyleNode, style, error
             * @return {fetchCSSParams}
             */
            ({ path, cssSelector, namespace, namespaceFallback, styleNode, style, appendStyleNode = true, error, maxWidth, node = this }, i) => {
              if (error) return fetchCSSParams[i]
              // create a new style node if none is supplied
              if (!styleNode) {
                /** @type {HTMLStyleElement} */
                styleNode = document.createElement('style')
                styleNode.setAttribute('_css', path)
                styleNode.setAttribute('protected', 'true') // this will avoid deletion by html=''
                if (this.root.querySelector(`[_css="${path}"]`)) console.warn(`${path} got imported more than once!!!`, node)
              }
              if (appendStyleNode) node.root.appendChild(styleNode) // append the style tag in order to which promise.all resolves
              return { ...fetchCSSParams[i], styleNode, appendStyleNode, node, origStyle: style, style: this.setCss(style, cssSelector, namespace, namespaceFallback, styleNode, appendStyleNode, maxWidth, node) }
            }
          )
        }
      ).catch(error => error)
    }
  }

  /**
   * returns innerHTML STRING of shadow else this
   *
   * @return {string | HTMLCollection | HTMLElement[]| ChildNode[] | HTMLElement | NodeList}
   */
  get html () {
    return this.root.innerHTML
  }

  /**
   * set innerHTML of shadow else this
   *
   * @param {string | HTMLCollection | HTMLElement[]| ChildNode[] | HTMLElement | NodeList} innerHTML
   */
  set html (innerHTML) {
    if (typeof innerHTML === 'string') {
      if (!innerHTML) {
        // save all protected
        innerHTML = this.root.querySelectorAll('[protected=true]')
        // clear all childNodes but keep protected
        this.root.innerHTML = ''
      } else {
        /**
         * this div is used to render string to childNodes and avoids:
         * "this.root.innerHTML = this.root.innerHTML + innerHTML"
         * the above would re-initiate (newly construct) already set childNodes, which is bad for performance but also destroys references
         *
         * @type {HTMLElement}
         */
        const div = document.createElement('div')
        div.innerHTML = innerHTML
        innerHTML = div.childNodes
      }
    }
    // @ts-ignore
    if (innerHTML.length === undefined) innerHTML = [innerHTML]
    // @ts-ignore
    Array.from(innerHTML).forEach(node => {
      if (node) this.root.appendChild(node)
    })
  }

  // display trumps hidden property, which we resolve here as well as we allow an animation on show
  set hidden (value) {
    if (!this._cssHidden) {
      /** @type {HTMLStyleElement} */
      this._cssHidden = document.createElement('style')
      this._cssHidden.setAttribute('_cssHidden', '')
      this._cssHidden.setAttribute('protected', 'true') // this will avoid deletion by html=''
      this.root.appendChild(this._cssHidden)
    }
    this._cssHidden.textContent = ''
    this.setCss(value
      ? /* css */`
        :host {
          visibility: hidden !important;
        }
      `
      : /* css */`
        :host, :host > *, :host > * > * {
          animation: var(--show, show .2s ease-out);
        }
        @keyframes show {
          0%{opacity: 0}
          100%{opacity: 1}
        }
      `, undefined, undefined, undefined, this._cssHidden)
    super.hidden = value
  }

  get hidden () {
    return super.hidden
  }

  /**
   * the most common way to figure out the sites break point
   *
   * @readonly
   * @return {string}
   */
  get mobileBreakpoint () {
    // @ts-ignore ignoring self.Environment error
    return this.getAttribute('mobile-breakpoint')
      ? this.getAttribute('mobile-breakpoint')
      : self.Environment && !!self.Environment.mobileBreakpoint
        ? self.Environment.mobileBreakpoint({
            constructor: this.constructor.name,
            tagName: this.tagName
          })
        : '767px'
  }
}
