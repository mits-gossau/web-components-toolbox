// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global MutationObserver */
/* global CustomEvent */

/**
 * Header can be sticky and hosts as a flex mostly a logo and a navigation
 * Example at: /src/es/components/pages/Home.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Header
 * @type {CustomElementConstructor}
 * @css {
 *  NOTE: grid-area: header;
 *  --position [sticky]
 *  --z-index [1000]
 *  --align-items [center]
 *  --background-color [black]
 *  --height  [85px]
 *  --justify-content  [space-between]
 *  --justify-content-mobile [space-between]
 *  --content-spacing [40px]
 *  --flex-direction  [row]
 *  --flex-direction-mobile [row-reverse]
 *  --height-mobile [50px]
 *  --text-align [initial]
 *  --padding [calc...]
 * }
 * @attribute {
 *  {boolean} [show]
 *  {boolean} [is-checkout=false]
 *  {boolean} [is-easy-portal-header=false]
 *  {string} mobile-breakpoint
 *  {boolean} [menu-icon=false]
 *  {string} [no-scroll="no-scroll"]
 *  {has} [sticky] make header sticky
 * }
 */
export default class Header extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.noScroll = () => { window.scroll(0, 0) }
    this.setAttribute('role', 'banner')
    this.setAttribute('aria-label', 'Header')
    this.scrollListener = event => {
      const lastScroll = self.scrollY
      setTimeout(() => {
        this.setStickyOffsetHeight()
        // is top
        if (self.scrollY <= this.offsetHeight + 5) {
          this.classList.add('top')
          // is scrolled down
        } else {
          this.classList.remove('top')
          // scrolling up and show header
          if ((Math.abs(self.scrollY - lastScroll) > 30 && self.scrollY <= lastScroll)) {
            this.classList.add('show')
            // scrolling down and hide header
          } else if (Math.abs(self.scrollY - lastScroll) > 30) {
            // if (this.mNavigation) Array.from(this.mNavigation.root.querySelectorAll('.open')).forEach(node => node.classList.remove('open'))
            this.classList.remove('show')
          }
        }
        self.addEventListener('scroll', this.scrollListener, { once: true })
      }, 200)
    }

    this.clickAnimationListener = event => {
      if (this.header.classList.contains('open')) {
        this.noScroll()
        this.mNavigation.classList.add('open')
        if (this.getMedia() !== 'desktop') this.mNavigation.setAttribute('aria-expanded', 'true')
      } else if (event && event.animationName === 'close') {
        this.mNavigation.classList.remove('open')
        if (this.getMedia() !== 'desktop') this.mNavigation.setAttribute('aria-expanded', 'false')
      }
    }
    this.keyupListener = event => {
      if (event.key === 'Escape') {
        document.body.click()
        if (this.MenuIcon.classList.contains('open')) this.MenuIcon.click()
      }
    }
    this.clickAnchorListener = event => {
      if (this.getMedia() !== 'desktop' && this.MenuIcon.classList.contains('open')) this.MenuIcon.click()
    }
    let timeout = null
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        this.setStickyOffsetHeight()
      }, 200)
    }
    this.mutationCallbackTimeout = null
    this.mutationCallback = mutationsList => {
      clearTimeout(this.mutationCallbackTimeout)
      this.mutationCallbackTimeout = setTimeout(() => {
        // make sure that the sticky header is shown when the menu is open
        if (this.header.classList.contains('open') && !this.classList.contains('show')) this.classList.add('show')
      }, 50)
    }
    this.observer = new MutationObserver(this.mutationCallback)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (!this.hasAttribute('no-navigation')) showPromises.push(new Promise(resolve => this.addEventListener('navigation-load', event => resolve(), { once: true })))
    if (this.aLogo && !this.aLogo.hasAttribute('loaded')) showPromises.push(new Promise(resolve => this.addEventListener('logo-load', event => resolve(), { once: true })))
    Promise.all(showPromises).then(() => {
      this.hidden = false
      this.setStickyOffsetHeight()
    })
    if (this.hasAttribute('sticky')) self.addEventListener('scroll', this.scrollListener, { once: true })
    this.addEventListener('click', this.clickAnimationListener)
    this.addEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorListener)
    self.addEventListener('resize', this.resizeListener)
    if (this.mNavigation) this.mNavigation.addEventListener('animationend', this.clickAnimationListener)
    self.addEventListener('resize', this.mutationCallback)
    document.addEventListener('keyup', this.keyupListener)
    this.observer.observe(this.header, { attributes: true })

    this.isCheckout = this.getAttribute('is-checkout') === 'true'
    this.isEasyPortalHeader = this.getAttribute('is-easy-portal-header') === 'true'

    if (this.isCheckout) this.root.querySelector('header').setAttribute('is-checkout', this.isCheckout)
    if (this.isEasyPortalHeader) this.root.querySelector('header').setAttribute('is-easy-portal-header', this.isEasyPortalHeader)
  }

  disconnectedCallback () {
    if (this.hasAttribute('sticky')) self.removeEventListener('scroll', this.scrollListener)
    this.removeEventListener('click', this.clickAnimationListener)
    this.removeEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorListener)
    self.removeEventListener('resize', this.resizeListener)
    if (this.mNavigation) this.mNavigation.removeEventListener('animationend', this.clickAnimationListener)
    self.removeEventListener('resize', this.mutationCallback)
    document.removeEventListener('keyup', this.keyupListener)
    this.observer.disconnect()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.header
  }

  /**
   * renders the o-header css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        grid-area: header;
        position: var(--position, sticky);
        top: 0;
        z-index: var(--z-index, 1000);
        text-align: var(--text-align, initial);
        background-color: var(--host-background-color, transparent);
      }
      :host > * {
        font-size: var(--font-size, 1rem);
        margin: var(--content-spacing, 40px) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 55%);
      }
      :host([sticky]) {
        position: static;
      }
      :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'}{
        flex-grow: 1;
        max-width: calc(var(--content-width, 55%) - var(--logo-width));
      }
      
      :host > header::before {
        display: block;
        width: var(--logo-width);
        height: auto;
        clear: both;
        content: '';
        order: 1;
      }
      :host > header > *:first-child {
        align-self: baseline;
      }
      :host > span, :host > div, :host > p, :host > ul, :host > ol {
        width: var(--content-width, 55%);
      }
      :host > header {
        align-items: var(--align-items, center);
        background-color: var(--background-color, black);
        border: var(--border, 0);
        border-bottom: var(--border-bottom, 0);
        display: flex;
        flex-direction: var(--flex-direction , row);
        flex-wrap: var(--flex-wrap, nowrap);
        height: var(--height , 85px);
        justify-content: var(--justify-content , space-between);
        padding: var(--padding, 0);
        margin: var(--margin, 0);
        ${this.previousElementSibling && this.previousElementSibling.tagName === 'MSRC-LOGIN'
        ? 'margin-top: 0;'
        : ''
      }
        width: var(--width, 100%);
        position: var(--header-position, relative);
        transition: var(--transition, all 0.2s ease);
      }
      :host > header.open {
        background-color: var(--background-color-open, var(--background-color, black));
      }
      :host > header.animate {
        background: linear-gradient(to bottom, var(--background-color-open) 0%, var(--background-color-open) 50%, var(--background-color) 50%, var(--background-color) 100%);
        animation: backgroundAnimation var(--background-animation, 0.5s ease);
        background-size: 100% 200%;
        background-position-y: 0%;
      }
      :host > header > a {
        align-self: var(--a-align-self, var(--align-self, auto));
        color: var(--a-color, var(--color));
        font-family: var(--a-font-family, var(--font-family));
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        font-size: var(--a-font-size, var(--font-size));
        padding: var(--a-padding, 0);
        margin: var(--a-margin, 0);
        line-height: var(--a-line-height, 0);
        order: var(--order, 1);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        text-transform: var(--a-text-transform, none);
        transition: var(--a-transition, all 0.2s ease);
        white-space: var(--a-white-space, normal);
      }
      :host > header > a:hover {
        color: var(--a-color-hover, var(--a-color-hover, var(--a-color, var(--color))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host > header.open > a {
        font-size: var(--a-font-size-open, var(--font-size-open, var(--a-font-size, var(--font-size))));
      }
      :host > header > a-menu-icon {
        align-self: var(--a-menu-icon-align-self, var(--align-self, auto));
        display: none;
      }
      :host([sticky].top) {
        position: var(--position, sticky);
      }
      :host([sticky].show:not(.top)) {
        top: 0;
        transition: var(--sticky-transition-show, top .5s ease);
      }
      :host([sticky].show:not(.top)) > header {
        border-bottom: var(--sticky-border-bottom, 1px solid var(--color));
      }
      :host([sticky]:not(.top)) {
        transition: var(--sticky-transition-hide, top .4s ease);
      }
      :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'}{
        order: 2;
      }
      :host > header > a-logo{
        position: absolute;
        left: calc((100% - var(--content-width, 55%)) / 2);
        z-index: 1001;
        transform: translate(0, -50%);
        top: var(--logo-position-top, 50%);
        transition: top 0.2s ease-out;
      }
      @keyframes backgroundAnimation {
        0%{background-position-y:100%}
        100%{background-position-y:0%}
      }
      @keyframes open {
        0% {left: -100vw}
        100% {left: 0}
      }
      @keyframes close {
        0% {left: 0}
        100% {left: -100vw}
      }
      @media only screen and (max-width: _max-width_) {
        :host > * {
          --logo-default-justify-content: flex-end;
          font-size: var(--font-size-mobile, var(--font-size, 1rem));
          margin: var(--content-spacing-mobile, 0) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, 90%);
        }
        :host([sticky]) {
          position: sticky;
          top: -7em;
        }
        :host([sticky].show:not(.top)) > header, :host([sticky]:not(.top)) > header {
          transform: translateY(calc(-1 * var(--content-spacing-mobile)));
        }
        :host > header {
          flex-wrap: nowrap;
          margin: var(--margin-mobile, var(--margin, 0));
          ${this.previousElementSibling && this.previousElementSibling.tagName === 'MSRC-LOGIN'
        ? 'margin-top: 0;'
        : ''
      }
          width: var(--width-mobile, var(--width, 100%));
        }
        :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'}{
          animation: close .4s ease-in;
          left: -100vw;
        }
        :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'}.open {
          display: block;
        }
        :host > header.open > ${this.getAttribute('m-navigation') || 'm-navigation'} {
          animation: open .3s ease-out;
          left: 0;
        }
        :host > header > *:first-child {
          align-self: center;
        }
        :host > span, :host > div, :host > p, :host > ul, :host > ol {
          width: var(--content-width, 90%);
        }
        :host > header {
          box-sizing: var(--box-sizing-open-mobile, var(--box-sizing-open, var(--box-sizing, content-box)));
          height: var(--height-mobile, 50px);
          flex-direction: var(--flex-direction-mobile, row-reverse);
          justify-content: var(--justify-content-mobile, space-between);
          padding: var(--padding-mobile, var(--padding, 0 calc(var(--content-spacing, 40px) / 2)));
        }
        :host > header.open {
          position: var(--position-open-mobile, var(--position-open, var(--position, static)));
          top: var(--top-open-mobile, var(--top-open, var(--top, auto)));
          left: var(--left-open-mobile, var(--left-open, var(--position, auto)));
          width: var(--width-open-mobile, var(--width-open, var(--width, auto)));
        }
        :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'} {
          display: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-display-mobile, none);
          left: 0;
          background-color: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-background-color-mobile, transparent);
          height: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-height-mobile, 0);
          overflow: hidden;
          position: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-position-mobile, absolute);
          align-items: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-align-items-mobile, normal);
          justify-content: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-justify-content-mobile, normal);
          transition: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-transition, all 0.2s ease);
          top: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-top-mobile, var(--height-mobile, 50px));
          padding: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-padding-mobile, 0);
          width: 100%;
          min-width: 100%;
        }
        :host > header > a {
          align-self: var(--a-align-self-mobile, var(--a-align-self, var(--align-self, auto)));
          font-size: var(--a-font-size-mobile, var(--a-font-size, var(--font-size)));
          padding: var(--a-padding-mobile, var(--a-padding, 0));
          margin: var(--a-margin-mobile, var(--a-margin, 0));
          order: var(--order-mobile, var(--order, 1));
        }
        :host > header > a-title {
          z-index: var(--a-title-z-index, auto);
        }
        :host > header.open > ${this.getAttribute('m-navigation') || 'm-navigation'} {
          display: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-display-open-mobile, var(--${this.getAttribute('m-navigation') || 'm-navigation'}-display-mobile, block));
          height: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-height-open-mobile, 100vh);
          overflow-y: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-overflow-y-open-mobile, auto);
          padding: var(--${this.getAttribute('m-navigation') || 'm-navigation'}-padding-open-mobile, var(--${this.getAttribute('m-navigation') || 'm-navigation'}-padding-mobile, 0));
        }
        :host  > header > a-menu-icon{
          align-self: var(--a-menu-icon-align-self-mobile, var(--a-menu-icon-align-self, var(--align-self, auto)));
          display: var(--a-menu-icon-display-mobile, block);
          z-index: 1002;
        }
        :host  > header.open > a-menu-icon{
          --a-menu-icon-height: var(--a-menu-icon-height-open-mobile);
          --a-menu-icon-margin: var(--a-menu-icon-margin-open-mobile);
          display: var(--a-menu-icon-display-open-mobile, var(--a-menu-icon-display-mobile, block));
        }
        :host > header > a-menu-icon {
          order: 3;
        }
        :host > header > a-logo{
          flex-grow: 1;
          left: auto;
          right: var(--content-spacing-mobile, var(--content-spacing));
          top: var(--logo-position-top-mobile, 50%);
        }
        :host > header::before {
          order: 1;
        }
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    switch (this.getAttribute('namespace')) {
      case 'header-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }], false)
      case 'header-nav-right-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--header-default-',
            flags: 'g',
            replacement: '--header-nav-right-'
          }]
        }, {
          path: `${this.importMetaUrl}./nav-right-/nav-right-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }], false)
      case 'header-nav-grid-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--header-default-',
            flags: 'g',
            replacement: '--header-nav-grid-'
          }]
        }, {
          path: `${this.importMetaUrl}./nav-grid-/nav-grid-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }], false)
      case 'header-nav-grid-delica-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--header-default-',
            flags: 'g',
            replacement: '--header-nav-grid-delica-'
          }]
        }, {
          path: `${this.importMetaUrl}./nav-grid-delica-/nav-grid-delica-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }], false)
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.header = this.root.querySelector(this.cssSelector + ' > header') || document.createElement('header')
    Array.from(this.root.children).forEach(node => {
      if (node === this.header || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.header.appendChild(node)
    })
    this.html = this.header
    if (this.hasAttribute('sticky')) this.classList.add('top')
    self.addEventListener('resize', event => this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
      detail: {
        hasNoScroll: false,
        origEvent: event,
        this: this
      },
      bubbles: true,
      cancelable: true,
      composed: true
    })))
    return this.getAttribute('menu-icon')
      ? this.fetchModules([
        {
          path: `${this.importMetaUrl}'../../../../atoms/menuIcon/MenuIcon.js`,
          name: 'a-menu-icon'
        }
      ]).then(children => {
        this.MenuIcon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') ? `${this.getAttribute('namespace')}a-menu-icon-` : '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
        this.MenuIcon.addEventListener('click', event => {
          this.header.classList.toggle('open')
          const prop = this.header.classList.contains('open') ? 'add' : 'remove'
          if (this.getMedia() !== 'desktop') this.mNavigation.setAttribute('aria-expanded', this.header.classList.contains('open') ? 'true' : 'false')
          this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
            detail: {
              hasNoScroll: this.header.classList.contains('open'),
              origEvent: event,
              this: this
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))

          Array.from(this.header.children).forEach(node => {
            node.classList[prop](this.getAttribute('no-scroll') || 'no-scroll')
          })
        })
        this.header.appendChild(this.MenuIcon)
        this.html = this.style
      })
      : Promise.resolve()
  }

  get mNavigation () {
    return this.root.querySelector(this.getAttribute('m-navigation') || 'm-navigation')
  }

  get aLogo () {
    return this.root.querySelector(this.getAttribute('a-logo') || 'a-logo')
  }

  setStickyOffsetHeight () {
    this.style.textContent = ''
    self.requestAnimationFrame(timeStamp => {
      this.setCss(/* CSS */`
        :host([sticky].top), :host([sticky]:not(.top)) {
          top: -${this.offsetHeight + 5}px;
          transition: var(--sticky-transition-hide, top .4s ease);
        }
        @media only screen and (max-width: _max-width_) {
          :host {
            min-height: ${this.offsetHeight}px;
          }
        }
      `, undefined, undefined, undefined, this.style)
    })
  }

  getMedia () {
    return self.matchMedia(`(min-width: calc(${this.mobileBreakpoint} + 1px))`).matches ? 'desktop' : 'mobile'
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      style.setAttribute('_csssetStickyOffsetHeight', '')
      return style
    })())
  }
}
