// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global customElements */
/* global CustomEvent */

/**
 * Dependencies: https://github.com/ciampo/macro-carousel
 * Example at: /src/es/components/organisms/MacroCarousel.html
 * !!! NOTE: If this component has a namespace you need to add the namespace to all children for attributes like "height" to work !!!
 *
 * @attribute {
 *  {number + px} height
 *  {number + px} [mobile-breakpoint=1000px]
 *  {number} interval (autoplay is activated if this is set)
 *  ↓↓↓ macro-carousel attributes ↓↓↓
 *  https://github.com/ciampo/macro-carousel/blob/master/docs/macro-carousel.md#properties-all-reflected-to-attributes-in-kebab-case
 *  {number} [selected=0]
 *  {boolean} [loop=false]
 *  {boolean} [navigation=false]
 *  {boolean} [pagination=false]
 *  {boolean} [disable-drag=false]
 *  {number} [slides-per-view=1]
 *  {number} [slides-per-view-mobile=1]
 *  {boolean} [reduced-motion=false]
 *  {boolean} [auto-focus=false]
 *  {number} [sync-id=undefined] used to sync carousels on 'macro-carousel-selected-changed' only one of the synced elements is allowed to have an interval
 * }
 * @css {
 *  --content-width [100%]
 *  --margin [0 auto]
 *  --outline-focus [0]
 *  --content-width-mobile [100%]
 *  --margin-mobile [0 auto]
 *  --transition-duration [0.5s]
 *  --pagination-position
 *  --pagination-bottom
 *  --pagination-background-color [black]
 *  --pagination-background-color-selected [pink]
 *  --pagination-width [5px]
 *  --navigation-color [black]
 *  --navigation-color-focus [black]
 *  --navigation-background-color [transparent]
 *  --navigation-background-color-focus [rgba(0, 0, 0, 0.2)]
 *  --navigation-button-size [48px]
 *  --navigation-icon-size [24px]
 *  --navigation-icon-mask [url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000'%3E %3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E %3C/svg%3E")]
 * }
 * @type {CustomElementConstructor}
 */
export default class MacroCarousel extends Shadow() {
  constructor (...args) {
    super(...args)

    this.macroCarousel = document.createElement('macro-carousel')
    // copy all kids into the macro-carousel
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      node.setAttribute('loading', 'eager') // must be eager, not that it loads once visible
      if (node.nodeName !== 'A') node.setAttribute('pointer-events', 'none') // firefox would drag the ghost image and interrupt the carousel
      this.macroCarousel.appendChild(node)
    })
    // forward all attributes
    Array.from(this.attributes).forEach(attribute => {
      if (attribute.name) {
        // only grab the slides-per-view-mobile if mobile else without
        if (attribute.name.includes('slides-per-view')) {
          this.macroCarousel.setAttribute('slides-per-view', this.getAttribute(`slides-per-view${this.getMedia()}`) || '1')
        } else if (attribute.name !== 'namespace' && !attribute.name.includes('hidden')) {
          this.macroCarousel.setAttribute(attribute.name, attribute.value || 'true')
        }
      }
    })

    this.resizeListener = event => {
      this.macroCarousel.setAttribute('slides-per-view', this.getAttribute(`slides-per-view${this.getMedia()}`) || '1')
    }

    this.macroCarouselSelectedChangedListener = event => {
      this.dispatchEvent(new CustomEvent((this.getAttribute('macro-carousel-selected-changed') || 'macro-carousel-selected-changed') + this.getAttribute('sync-id'), {
        detail: {
          slide: event.detail
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
    this.macroCarouselSelectedChangedListenerSyncId = event => {
      if (event && event.detail) {
        // to support loop function and at end or beginning not go the opposite direction, use next and previous if possible
        // current slide is last and going to first
        if (event.detail.slide === 0 && Number(this.macroCarousel.getAttribute('selected')) === this.macroCarousel.querySelectorAll('[role=listitem]').length - 1) {
          this.macroCarousel.next()
        // current slide is first and going to the last
        } else if (event.detail.slide === this.macroCarousel.querySelectorAll('[role=listitem]').length - 1 && Number(this.macroCarousel.getAttribute('selected')) === 0) {
          this.macroCarousel.previous()
        } else {
          this.macroCarousel.setAttribute('selected', event.detail.slide)
        }
      }
    }
    this.clickListener = event => {
      if (!this.hasAttribute('open')) event.stopPropagation()
      this.dispatchEvent(new CustomEvent(this.getAttribute('open-modal') || 'open-modal', {
        detail: {
          origEvent: event,
          child: this,
          btnCloseOnly: true
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.interval = null

    // stop interval when clicking outside window eg. iframe, etc.
    this.blurEventListener = event => this.clearInterval()
    this.focusEventListener = event => this.setInterval()

    // workaround open-modal (carousel in modal) bug where buttons stop working
    if (this.hasAttribute('open-modal')) {
      this.nextEventListener = event => this.macroCarousel.next()
      this.prevEventListener = event => this.macroCarousel.previous()
      this.indicatorEventListener = event => {
        this.macroCarousel.selected = Number(event.target.getAttribute('aria-label').replace(/.*?(\d)/, '$1')) - 1
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    self.addEventListener('resize', this.resizeListener)
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) this.addEventListener('picture-load', this.resizeListener)
    if (this.hasAttribute('sync-id')) {
      if (this.getAttribute('interval')) {
        this.macroCarousel.addEventListener('macro-carousel-selected-changed', this.macroCarouselSelectedChangedListener)
      } else {
        document.body.addEventListener((this.getAttribute('macro-carousel-selected-changed') || 'macro-carousel-selected-changed') + this.getAttribute('sync-id'), this.macroCarouselSelectedChangedListenerSyncId)
      }
    }
    if (this.hasAttribute('open-modal')) {
      this.setAttribute('aria-haspopup', 'true')
      this.addEventListener('click', this.clickListener)
      if (this.macroCarousel.querySelector('.macro-carousel-next')) this.macroCarousel.querySelector('.macro-carousel-next').addEventListener('click', this.nextEventListener)
      if (this.macroCarousel.querySelector('.macro-carousel-previous')) this.macroCarousel.querySelector('.macro-carousel-previous').addEventListener('click', this.prevEventListener)
      Array.from(this.macroCarousel.querySelectorAll('macro-carousel-pagination-indicator')).forEach(indicator => indicator.addEventListener('click', this.indicatorEventListener))
    }
    if (this.getAttribute('interval')) {
      self.addEventListener('blur', this.blurEventListener)
      self.addEventListener('focus', this.focusEventListener)
      document.body.addEventListener('play', this.blurEventListener, true)
      document.body.addEventListener('pause', this.focusEventListener, true)
    }
    this.resizeListener() // resets the picture calculations
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) this.removeEventListener('picture-load', this.resizeListener)
    if (this.hasAttribute('sync-id')) {
      if (this.getAttribute('interval')) {
        this.macroCarousel.removeEventListener('macro-carousel-selected-changed', this.macroCarouselSelectedChangedListener)
      } else {
        document.body.removeEventListener((this.getAttribute('macro-carousel-selected-changed') || 'macro-carousel-selected-changed') + this.getAttribute('sync-id'), this.macroCarouselSelectedChangedListenerSyncId)
      }
    }
    if (this.hasAttribute('open-modal')) {
      this.removeEventListener('click', this.clickListener)
      if (this.macroCarousel.querySelector('.macro-carousel-next')) this.macroCarousel.querySelector('.macro-carousel-next').removeEventListener('click', this.nextEventListener)
      if (this.macroCarousel.querySelector('.macro-carousel-previous')) this.macroCarousel.querySelector('.macro-carousel-previous').removeEventListener('click', this.prevEventListener)
      Array.from(this.macroCarousel.querySelectorAll('macro-carousel-pagination-indicator')).forEach(indicator => indicator.removeEventListener('click', this.indicatorEventListener))
    }
    if (this.getAttribute('interval')) {
      self.removeEventListener('blur', this.blurEventListener)
      self.removeEventListener('focus', this.focusEventListener)
      document.body.removeEventListener('play', this.blurEventListener)
      document.body.removeEventListener('pause', this.focusEventListener)
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.scripts.length
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > macro-carousel {
         width: var(--width, 100%) !important;
      }
      :host > macro-carousel > * {
        display: flex;
        align-items: var(--align-items, center);
        flex-direction: var(--flex-direction, row);
        justify-content: var(--justify-content, center);
      }
      :host > macro-carousel > .container {
        color: var(--color, red);
        width: 100%;
        position: relative;
      }  
      :host> macro-carousel >  macro-carousel-nav-button {
        top:40%;
      }
      :host > macro-carousel > .container {
        display: flex;
        align-items: stretch;
        font-size: var(--font-size, 1em);
      } 
      :host > macro-carousel > div > .text {
        background-color: var(--text-background-color, red);
      }
      :host > macro-carousel > div > .text p {
        padding:var(--text-padding, 0); 
      }
      :host .title {
        position:var(--title-position, absolute);
        top: var(--title-top, 4vw);
        left: var(--title-left, 10vw);
        right: var(--title-right, 10vw);
      }
      :host .macro-carousel-previous, .macro-carousel-next{
         margin:1em;
      }
      :host([open-modal]) {
        position: relative;
      }
      :host([open]) > .close-btn {
        opacity: 0;
      }
      :host(:not([open])) > .close-btn {
        opacity: 1;
      }
      :host([open-modal]) > .close-btn {
        background-color: var(--close-btn-background-color, var(--color-secondary, var(--background-color)));
        border-radius: 50%;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 7px;
        padding: 0.75em;
        width: 7px;
        position: absolute;
        right: calc(var(--close-btn-right, var(--content-spacing)) / 2);
        bottom: calc(var(--close-btn-bottom, var(--content-spacing)) / 2);
      }
      :host([open-modal]) > .close-btn > span {
        height: 22px;
        width: 22px;
      }
      @media only screen and (max-width: _max-width_) {
        :host> macro-carousel >  macro-carousel-nav-button {
          top:35%;
        }
        :host > macro-carousel > div > .text p {
          padding:var(--text-padding-mobile, 0); 
        }
        :host .title > h1.font-size-big {
          font-size: var(--h1-font-size-mobile);
        }
        :host .title {
          top: 2vw;
          left: 0;
          margin:var(--div-margin-mobile);
        }
        :host(:not([open-modal-mobile])) {
          position: static;
        }
        :host(:not([open-modal-mobile])) > .close-btn {
          display: none;
        }
        :host([open-modal-mobile]) > .close-btn {
          right: calc(var(--close-btn-right-mobile, var(--close-btn-right, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
          bottom: calc(var(--close-btn-bottom-mobile, var(--close-btn-bottom, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
        }
      }
    `
    // inject style which can't be controlled through css vars
    // style which must be inside macro-carousel shadowDom
    // TODO: review how to apply the namespaces properly, usually we would use setCss but here vars like --macro-carousel-pagination-color must not get namespaced with cssNamespaceToVar / cssNamespaceToVarDec
    this.injectStyle = document.createElement('style')
    // get more from here: https://github.com/ciampo/macro-carousel/blob/master/src/macro-carousel/macro-carousel.css
    this.injectStyle.textContent = /* css */`
      :host {
        --macro-carousel-transition-duration: var(--transition-duration, 0.5s);
      }
      :host > #pagination {
        position: var(--pagination-position);
        bottom: var(--pagination-bottom);
      }
      :host div ::slotted(macro-carousel-pagination-indicator) {
        --macro-carousel-pagination-color: var(--pagination-background-color, var(--background-color, black));
        --macro-carousel-pagination-color-selected: var(--pagination-background-color-selected, var(--background-color-selected, var(--background-color, pink)));
        --macro-carousel-pagination-size-dot: var(--pagination-width, 12px);    
        --macro-carousel-pagination-border-selected: var(--pagination-border-selected);   
        opacity: var(--pagination-opacity, 1);
      }
      :host div ::slotted(macro-carousel-nav-button) {
        --macro-carousel-navigation-color: var(--navigation-color, var(--color, black));
        --macro-carousel-navigation-color-focus: var(--navigation-color-focus, var(--color-focus, var(--color, black)));
        --macro-carousel-navigation-color-background: var(--navigation-background-color, var(--background-color, transparent));
        --macro-carousel-navigation-color-background-focus: var(--navigation-background-color-focus, var(--navigation-background-color, var(--background-color, rgba(0, 0, 0, 0.2))));
        --macro-carousel-navigation-button-size: var(--navigation-button-size, 6em);
        --macro-carousel-navigation-icon-size: var(--navigation-icon-size, 5em);
        --macro-carousel-navigation-icon-mask: var(--navigation-icon-mask, url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23000'%3E %3Cpath d='M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z'/%3E %3C/svg%3E")) ;
      }
    `.replace(/var\(--/g, `var(--${this.namespace}`)

    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'carousel-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'carousel-emotion-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, {
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./emotion-/emotion-.css`,
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          fetchCSSParams[0].styleNode.textContent = fetchCSSParams[0].styleNode.textContent.replace(/--carousel-default-/g, '--carousel-emotion-')
        })
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.loadDependency().then(() => {
      this.html = this.macroCarousel
      // wait for the carousel component to initiate the shadowDom and be ready
      const interval = setInterval(() => {
        if (this.macroCarousel.shadowRoot) {
          clearInterval(interval)
          this.macroCarouselReady()
        }
      }, 100)
      // modal stuff
      if (this.hasAttribute('open-modal')) {
        this.closeBtn = document.createElement('button')
        this.closeBtn.innerHTML = `
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Untitled-Seite%201" viewBox="0 0 22 22" style="background-color:#ffffff00" version="1.1" xml:space="preserve" x="0px" y="0px" width="22px" height="22px">
              <g>
                <path id="Ellipse" d="M 1 11 C 1 5.4771 5.4771 1 11 1 C 16.5229 1 21 5.4771 21 11 C 21 16.5229 16.5229 21 11 21 C 5.4771 21 1 16.5229 1 11 Z" fill="#FF6600"/>
                <path d="M 15 10 L 15 12 L 7 12 L 7 10 L 15 10 Z" fill="#ffffff"/>
                <path d="M 12 15 L 10 15 L 10 7 L 12 7 L 12 15 Z" fill="#ffffff"/>
              </g>
            </svg>
          </span>
        `
        this.closeBtn.classList.add('close-btn')
        this.html = this.closeBtn
      }
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency () {
    // make it global to self so that other components can know when it has been loaded
    return self.macroCarousel || (self.macroCarousel = new Promise(resolve => {
      if (customElements.get('macro-carousel')) {
        resolve()
      } else {
        const macroCarouselScript = document.createElement('script')
        macroCarouselScript.setAttribute('type', 'text/javascript')
        macroCarouselScript.setAttribute('async', '')
        // macroCarouselScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/macro-carousel/dist/macro-carousel.min.js')
        macroCarouselScript.setAttribute('src', 'https://cdn.jsdelivr.net/npm/macro-carousel@1.0.0/dist/macro-carousel.min.js')
        macroCarouselScript.setAttribute('integrity', 'sha384-zdSqIGGcobwlWW1xUQRlMCHvEp1eYvisEFv4LRQzdG5fZvcZSKFbC3CLWcH1u3mG')
        macroCarouselScript.setAttribute('crossorigin', 'anonymous')
        macroCarouselScript.onload = () => resolve()
        this.html = macroCarouselScript
      }
    }))
  }

  macroCarouselReady () {
    // style which has to be injected to take effect
    this.macroCarousel.shadowRoot.appendChild(this.injectStyle)
    // autoplay
    if (this.getAttribute('interval')) {
      this.setInterval()
      this.macroCarousel.addEventListener('macro-carousel-selected-changed', event => this.setInterval())
    }
  }

  setInterval () {
    clearInterval(this.interval)
    this.interval = setInterval(() => this.macroCarousel.next(), Number(this.getAttribute('interval')))
  }

  clearInterval () {
    clearInterval(this.interval)
  }

  getMedia () {
    return self.matchMedia(`(min-width: calc(${this.mobileBreakpoint} + 1px))`).matches ? '' : '-mobile'
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }

  get aPicture () {
    return this.macroCarousel.querySelector('a-picture')
  }
}
