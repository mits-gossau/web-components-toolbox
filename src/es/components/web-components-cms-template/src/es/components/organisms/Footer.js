// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global Link */
/* global customElements */

/**
 * Footer is sticky and hosts uls
 * Example at: /src/es/components/organisms/Playlist.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} [logo-load="logo-load"]
 *  {boolean} [homepage] for classics homepage styles (only one logo at right side)
 * }
 * @css {
 *  NOTE: grid-area: footer;
 *  --background-color [black]
 *  --z-index [100]
 *  --content-spacing [40px]
 *  --a-link-content-spacing [0]
 *  --a-link-font-size [1rem]
 *  --a-link-font-size-2 [1rem]
 *  --list-style [none]
 *  --align-items [start]
 *  --font-size [1rem]
 *  --p-margin [0]
 * }
 */
export default class Footer extends Shadow() {
  constructor (...args) {
    super(...args)

    this.footer = document.createElement('footer')
    this.footer.hidden = true
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.footer.appendChild(node)
    })
    this.root.appendChild(this.footer)

    let timeout = null
    // check if the flex-box wrapped
    this.wrappedListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (this.logoContainer) {
          if (this.logoContainer.children.length) {
            const children = Array.from(this.logoContainer.children)
            const top = children.pop().getBoundingClientRect().top
            if (children.some(child => top !== child.getBoundingClientRect().top)) return this.logoContainer.classList.add('wrapped')
          }
          this.logoContainer.classList.remove('wrapped')
        }
      }, 200)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.renderHTML()
    self.addEventListener('resize', this.wrappedListener)
    this.addEventListener(this.getAttribute('logo-load') || 'logo-load', this.wrappedListener)
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.wrappedListener)
    this.removeEventListener(this.getAttribute('logo-load') || 'logo-load', this.wrappedListener)
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
   * renders the o-footer css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        grid-area: footer;
        z-index: var(--z-index, 100);
      }
      ${this.getAttribute('homepage') === 'true'
        ? /* css */`
          :host {
            position: fixed;
            bottom: 0;
            right: 0;
          }
        `
        : ''}
      :host > * {
        width: var(--content-width, 80%);
        margin: var(--content-spacing, 0) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
      }
      :host > span, :host > div, :host > p, :host > ul, :host > ol {
        width: var(--content-width-not-web-component, 80%);
      }
      :host div p {
        line-height: var(--p-line-height, 1em);
      }
      :host > footer {
        display: var(--display, flex);
        background-color: var(${this.getAttribute('homepage') === 'true'
          ? 'transparent'
          : '--background-color'}, black);
        justify-content: var(--justify-content, normal);
        flex-direction: var(--flex-direction, row);
        align-content: var(--align-content, normal);
        padding: var(${this.getAttribute('homepage') === 'true'
          ? '--homepage-padding'
          : '--padding'}, 0);
        box-sizing: var(--box-sizing, content-box);
      }
      
      :host .logo-container {
        width: ${this.getAttribute('homepage') === 'true' ? '100%' : 'unset'};
        justify-content: var(${this.getAttribute('homepage') === 'true'
          ? '--homepage-logo-container-justify-content'
          : '--logo-container-justify-content'}, space-between);
        display: flex;
        flex-wrap: var(--logo-container-flex-wrap, nowrap);
        align-content: var(--logo-container-align-content, normal);
      }
      :host .logo-container.wrapped {
        justify-content: var(--logo-container-justify-content-wrapped, var(--logo-container-justify-content, space-between));
      }
      ${this.getAttribute('homepage') === 'true'
        ? ''
        : /* css */`
          :host .logo-container:first-child {
            --logo-height: var(--logo-height-first, max(65px, 4.8vw));
            --logo-height-mobile: var(--logo-height-first-mobile, 48px);
          }
        `
      }
      
      :host .footer-links {
        display: flex;
        justify-content: center;
        flex-wrap: wrap;
      }
      :host a-link {
        --padding: var(--a-link-content-spacing, 0);
        --display: var(--a-link-display);
        --display-mobile: var(--a-link-display-mobile);
      }
      :host > footer ul > li {
        color: var(--color, red);
      }
      :host > footer ul > li > * {
        font-size: var(--a-link-font-size, 1rem);
        display: block;
      }
      :host > footer ul > li > a-link {
        --font-size: var(--a-link-font-size, 1rem);
      }
      :host > footer ul > li > ul a-link {
        --font-size: var(--a-link-font-size-2, 1rem);
      }

      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > * {
          width: var(--content-width-mobile, 90%);
          margin: var(--content-spacing-mobile, 0) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        }
        :host > footer {
          padding: var(${this.getAttribute('homepage') === 'true'
          ? '--homepage-padding-mobile'
          : '--padding-mobile'}, 0);
        }
        :host > span, :host > div, :host > p, :host > ul, :host > ol {
          width: var(--content-width-not-web-component-mobile, 90%);
        }
        :host .logo-container {
          flex-wrap: var(--logo-container-flex-wrap-mobile, nowrap);
          justify-content: var(${this.getAttribute('homepage') === 'true'
          ? '--homepage-logo-container-justify-content'
          : '--logo-container-justify-content-mobile'}, space-between);
        }
        :host .logo-container.wrapped {
          justify-content: var(--logo-container-justify-content-wrapped-mobile, var(--logo-container-justify-content-mobile, space-between));
        }
        :host .logo-container:first-child {
          --logo-height: var(--logo-height-first-mobile, 50px);
        }
        :host .footer-links {
          flex-direction: column;
       }
      }
    `
    /* ----------------------------------------- CLUB CONCERT CSS ------------------------------------------------- */
    if (this.getAttribute('theme') === 'simple') {
      this.css = /* css */`
        
        :host ul, :host .language-switcher {
          display: flex;
          flex-direction: row;
          flex-wrap: var(--flex-wrap, nowrap);
          list-style: var(--list-style, none);
          justify-content: center;
          margin: var(--ul-margin, 10px 0);
          padding: 0;
        }
        :host ul li {
          margin: 0 var(--content-spacing, 15px);
        }
        :host .language-switcher li {
          margin: 0 var(--lanuage-switcher-margin, 5px);
        }
        :host .language-switcher {
          margin-left: 15px;
        }
        @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
          :host ul {
            flex-direction: column;
          }
          :host .language-switcher {
            margin-left: 0;
          }
          :host ul li {
            align-self: center;
            margin: var(--content-spacing-mobile, 0) 0;
          }
          :host ul li:first-of-type {
            margin-top: 0;
          }
          :host ul li:last-of-type {
            margin-bottom: 0;
          }
          :host > footer ul > li > * {
            font-size: var(--a-link-font-size-mobile, 1rem);
          }
          :host > footer ul > li > a-link {
            --font-size: var(--a-link-font-size-mobile, 1rem);
          }
        }
      `
      /* ----------------------------------------------------------------------------- */

      /* ----------------------------------------- CLASSICS CSS ------------------------------------------------- */
    } else if (this.getAttribute('theme') === 'classics') {
      this.css = /* css */`
        .logo-container {
          display: flex;
        }
        :host > footer ul {
          list-style-type: none;
          padding: var(--ul-padding, 0);
          margin: var(--ul-margin, 30px 0);
        }
        :host > footer ul > li {
          text-align: center;
        }
        .footer-ul-wrapper {
          padding-top: 19px;
        }
        :host > footer > div:not(.footer-ul-wrapper) {
          flex: 1;
        }
        :host > footer > div:first-of-type > * {
          width: max-content;
          height: 100%;
        }
        :host > footer ul > li p {
          margin: var(--p-margin, 0);
        }
        :host > footer ul > li:last-of-type {
          padding: var(--li-last-of-type-padding, 10px 0 0);
        }
        @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
          .language-switcher a-link {
            --display-mobile: inline;
          }
          :host > footer {
            flex-direction: var(--flex-direction-mobile, column);
          }
          :host > footer ul {
            margin: var(--ul-margin-mobile, 10px auto);
            padding: var(--ul-padding-mobile, 0);
          }
        }
      `
      /* ----------------------------------------------------------------------------- */
    } else {
      this.css = /* css */`
        :host ul {
          list-style: var(--list-style, none);
          margin: calc(var(--content-spacing, 40px) / 2) auto 0;
          padding: 0;
        }
        :host ul:first-child{
          margin-top: 0;
        }
        :host > footer > ul {
          align-items: var(--align-items, start);
          display: flex;
          flex-wrap: wrap;
          padding: calc(var(--content-spacing, 40px) / 2) var(--content-spacing, 40px);
        }
        :host > footer > ul > li{
          font-size: var(--font-size, 1rem);
        }
        :host > footer > ul li:hover{
          cursor: pointer;
        }
        :host > footer > ul > li{
          margin: calc(var(--content-spacing, 40px) / 2) var(--content-spacing, 40px) 0 0;
        }
        :host > footer > ul li{
          padding-bottom: .5rem;
        }
        :host > footer > ul li:last-child{
          padding-bottom: 0;
        }
        :host > footer > ul > li:last-child {
          margin-right: 0;
        }
      `
    }
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    this.loadChildComponents().then(children => Array.from(this.root.querySelectorAll('a')).forEach(a => {
      const li = a.parentElement
      const aLink = new children[0][1](a, { namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
      if (a.classList.contains('active')) aLink.classList.add('active')
      a.replaceWith(aLink)
      li.prepend(aLink)
      this.footer.hidden = false
    }))
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let linkPromise
    try {
      linkPromise = Promise.resolve({ default: Link })
    } catch (error) {
      linkPromise = import('../atoms/Link.js')
    }
    return (this.childComponentsPromise = Promise.all([
      linkPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-link', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  get logoContainer () {
    return this.root.querySelector('.logo-container')
  }
}
