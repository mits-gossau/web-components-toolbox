// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Footer is sticky and hosts uls
 * Example at: /src/es/components/organisms/Playlist.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 * @type {CustomElementConstructor}
 * @attribute {
 * }
 * @css {
 *  NOTE: grid-area: footer;
 *  --background-color [black]
 *  --z-index [100]
 *  --content-spacing [40px]
 *  --a-link-content-spacing [0]
 *  --a-link-font-size [1em]
 *  --a-link-font-size-2 [1em]
 *  --list-style [none]
 *  --align-items [start]
 *  --font-size [1em]
 *  --p-margin [0]
 * }
 */
export default class Footer extends Shadow() {
  constructor (...args) {
    super(...args)

    this.setAttribute('role', 'navigation')
    this.setAttribute('aria-label', 'Footer')
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => {
        let wrappers = Array.from(this.root.querySelectorAll('o-wrapper[namespace=footer-default-]'))
        Footer.recalcWrappers(wrappers) // make sure that the wrapper has all the variables just set and recalc
        Footer.injectCssIntoWrappers(wrappers)
        this.loadChildComponents().then(modules => {
          let moduleDetails
          if ((moduleDetails = modules.find(element => element[0] === 'm-details'))) this.autoAddDetails(wrappers, moduleDetails)
        })
        this.hidden = false
      })
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
    return !this.footer
  }

  /**
   * renders the o-footer css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        grid-area: footer;
      }
      :host > footer > *, :host > footer .invert > * {
        margin: var(--content-spacing, unset) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 55%);
      }
      :host > footer a.logo {
        display: block;
      }
      :host > footer .invert {
        display: flow-root;
        margin: 0;
        width: 100%;
        color: var(--invert-color);
        --a-color-hover: var(--invert-a-color-hover);
        --a-color: var(--invert-color);
        --color: var(--invert-color);
        background-color: var(--invert-background-color);
      }
      :host > footer o-wrapper[namespace=footer-default-] {
        --align-items: normal;
        --gap: var(--gap-custom, var(--content-spacing));
        --justify-content: var(--justify-content-custom, left);
      }
      :host > footer .language-switcher > ul, :host > footer .footer-links > ul {
        --color: var(--background-color);
        --color-hover: var(--m-orange-300);
        --padding: 1.1429em 1.2143em;
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        margin: 0;
        padding: 0;
      }
      :host > footer .footer-links > ul {
        flex-direction: row;
        justify-content: start;
      }
      :host > footer .language-switcher > ul > li, :host > footer .footer-links > ul > li {
        border: 0;
        list-style: var(--list-style, none);
        width: auto;
        padding: 0 var(--content-spacing);
      }
      :host > footer .language-switcher > ul > li:first-child, :host > footer .footer-links > ul:not(.has-copyright) > li:first-child {
        padding-left: 0;
      }
      :host > footer .language-switcher > ul > li:last-child, :host > footer .footer-links > ul > li:last-child {
        padding-right: 0;
      }
      /* force copyright to be at first position desktop */
      :host > footer .footer-links > ul > li.copyright {
        order: -1;
        padding: 0 var(--content-spacing) 0 0;
      }
      /* in case copyright and language are supposed to be on the same line on desktop */
      :host > footer > .copyright-and-language {
        display: flex;
        flex-direction: row;
        gap: var(--content-spacing);
        justify-content: space-between;
      }
      :host > footer > .copyright-and-language .footer-links ~ .language-switcher > ul {
        justify-content: right;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          margin-top: var(--content-spacing-mobile);
        }
        :host > footer > *, :host > footer .invert > * {
          margin: var(--content-spacing-mobile, var(--content-spacing, unset)) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
        }
        :host > footer o-wrapper[namespace=footer-default-] {
          --gap: var(--gap-mobile-custom, var(--gap-custom, var(--content-spacing-mobile, var(--content-spacing))));
        }
        :host > footer .language-switcher > ul > li {
          padding: 0 var(--content-spacing-mobile);
        }
        /* force copyright to be at first position desktop */
        :host > footer .footer-links > ul > li.copyright {
          order: 0;
        }
        /* in case copyright and language are supposed to be on the same line on desktop */
        :host > footer > .copyright-and-language {
          flex-direction: row;
          gap: var(--content-spacing-mobile, var(--content-spacing));
          justify-content: space-between;
        }
        :host > footer .footer-links > ul {
          flex-direction: column;
        }
        :host > footer > .copyright-and-language .footer-links ~ .language-switcher > ul {
          gap: var(--content-spacing-mobile, var(--content-spacing));
          flex-wrap: nowrap;
        }
        :host > footer .footer-links > ul > li, :host > footer > .footer-links > ul > li.copyright {
          padding: 0;
        }
        :host > footer > .copyright-and-language .footer-links ~ .language-switcher > ul > li {
          padding: 0;
        }
      }
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'footer-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * renders the a-link html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.footer = this.root.querySelector('footer') || document.createElement('footer')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE' || node.tagName === 'FOOTER') return false
      this.footer.appendChild(node)
    })
    // mark the copyright list element
    Array.from(this.footer.querySelectorAll('.footer-links > ul > li')).forEach(li => {
     if (li.textContent.includes('©')) {
       li.classList.add('copyright')
       li.parentNode.classList.add('has-copyright')
     }
    })
    this.html = this.footer
    return Promise.resolve()
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    return this._loadChildComponentsPromise || (this._loadChildComponentsPromise = Promise.all([
      import('../../molecules/details/Details.js').then(
        /**
         * @param {any} module
         * @returns {[string, any]}
         */
        module => ['m-details', module.Details()]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  /**
   * replaces by CSS resp. clones "o-wrapper > section > *" into a "div > m-details" structure for certain view ports
   *
   * @param {HTMLElement[] & any} wrappers
   * @param {[string, CustomElementConstructor]} moduleDetails
   * @returns {HTMLElement[]}
   */
  autoAddDetails (wrappers, moduleDetails) {
    if (!moduleDetails) return wrappers
    const hasDetailsMobile = !this.hasAttribute('no-details-mobile') // mobile default true
    const hasDetailsDesktop = this.hasAttribute('details-desktop') // desktop default false
    // check if wrappers.map returns any true
    if ((hasDetailsMobile || hasDetailsDesktop) && !!wrappers.map(wrapper => {
      // check if section children.filter returns any element. map.length
      if (!!Array.from(wrapper.section && wrapper.section.children || [])
        .filter(sectionChild => sectionChild.children && sectionChild.children.length > 1 && sectionChild.children[0] && !!sectionChild.children[0].tagName)
        .map(sectionChild => {
          // html adjustments
          sectionChild.classList.add('contains-details')
          /** @type {HTMLElement[]} */
          const sectionChildChildren = Array.from(sectionChild.children)
          // move all children into a dedicated div
          const div = document.createElement('div')
          // create a summary/details for each sectionChild
          const detailsDiv = document.createElement('div')
          detailsDiv.innerHTML = `
            <m-details namespace="details-default-icon-right-" open-event-name="open-footer">
              <details>
                <summary>${sectionChildChildren.splice(0,1)[0].outerHTML}</summary>
                <div>${sectionChildChildren.reduce((previousValue, currentValue) => previousValue + currentValue.outerHTML, '')}</div>
              </details>
            </m-details>
          `
          sectionChild.appendChild(div)
          sectionChild.appendChild(detailsDiv.children[0])
          return sectionChild
        })
      .length) {
        // found eligible elements to make summary details
        if (wrapper.previousElementSibling) wrapper.previousElementSibling.classList.add('next-contains-details')
        // inject the CSS logic to display by hasDetailsMobile and hasDetailsDesktop
        wrapper.setCss(/*css*/`
          ${hasDetailsDesktop
            ? /*css*/`
              :host > section > *.contains-details > m-details {
                display: block;
              }
              :host > section > *.contains-details > *:not(m-details) {
                display: none;
              }
            `
            :/*css*/`
              :host > section > *.contains-details > m-details {
                display: none;
              }
              :host > section > *.contains-details > *:not(m-details) {
                display: block;
              }
            `
          }
          @media only screen and (max-width: _max-width_) {
            ${hasDetailsMobile
              ? /*css*/`
                :host > section {
                  gap: 0;
                }
                :host > section > *:not(.contains-details):not(:first-child) {
                  margin-top: var(--${this.getAttribute('namespace')}gap-mobile-custom, var(--${this.getAttribute('namespace')}gap-custom, var(--content-spacing-mobile, var(--content-spacing)))) !important;
                }
                :host > section > *.contains-details:not(:first-of-type) > m-details {
                  --details-default-icon-right-border-top-custom: 0;
                }
                :host > section > *.contains-details > m-details {
                  display: block;
                }
                :host > section > *.contains-details > *:not(m-details) {
                  display: none;
                }
              `
              :/*css*/`
                :host > section > *.contains-details > m-details {
                  display: none;
                }
                :host > section > *.contains-details > *:not(m-details) {
                  display: block;
                }
              `
            }
          }
        `, undefined, false)
        return true
      }
      // didn't find any elements which could be used as summary details
      return false
    }).includes(true)) {
      // make the invert style useable for summary details within
      this.setCss(/*css*/`
        :host > footer .invert {
          --details-default-icon-right-summary-child-color-hover-custom: var(--${this.getAttribute('namespace')}invert-color-hover);
          --details-default-icon-right-a-color-hover: var(--${this.getAttribute('namespace')}invert-color-hover);
          --details-default-icon-right-summary-child-color-custom: var(--${this.getAttribute('namespace')}invert-color);
          --details-default-icon-right-a-color: var(--${this.getAttribute('namespace')}invert-color);
          --details-default-icon-right-svg-color-custom: var(--${this.getAttribute('namespace')}invert-color);
          --details-default-icon-right-border-color-custom: var(--${this.getAttribute('namespace')}invert-color);
          --color: var(--${this.getAttribute('namespace')}invert-color);
        }
        @media only screen and (max-width: ${wrappers[0] && wrappers[0].mobileBreakpoint || '_max-width_'}) {
          ${hasDetailsMobile
            ? /*css*/`
              :host > footer hr.next-contains-details {
                display: none;
              }
            `
            : ''
          }
        }
      `, undefined, false)
    }
    return wrappers
  }

  /**
   * force the wrapper to recalc its column width with the new variables set in the css above
   *
   * @param {HTMLElement[] & any} wrappers
   * @returns {HTMLElement[]}
   * @static
   */
  static recalcWrappers (wrappers) {
    wrappers.forEach(wrapper => wrapper.calcColumnWidth())
    return wrappers
  }

  /**
   * should actually be done with the template for o-wrapper namespace="footer-default-" but this has already been done within the razor template, this fix should work without any razor adjustments
   *
   * @param {HTMLElement[] & any} wrappers
   * @returns {HTMLElement[]}
   * @static
   */
  static injectCssIntoWrappers (wrappers) {
    wrappers.forEach(wrapper => wrapper.setCss(/*css*/`
      :host .footer-links-row {
        --footer-default-margin: 0 1em 3em 0;
        --footer-default-margin-mobile: 0;
      }
      :host .footer-links-row:not(:last-child){
        border-right: 1px solid var(--m-gray-500);
      }
      :host .footer-links-row ul, :host .footer-links-row ul.bull {
        list-style: none;
        padding-left: 0;
      }
      :host .footer-links-row ul.bull li::before {
        border: 0;
        background-color: transparent;
      }
      @media only screen and (max-width: _max-width_) {
          :host .footer-links-row:not(:last-child){
            border-right: none;
          }
      }
    `, undefined, false))
    return wrappers
  }
}
