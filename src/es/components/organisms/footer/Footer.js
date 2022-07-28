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
        this.recalcWrapper() // make sure that the wrapper has all the variables just set and recalc
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

  recalcWrapper () {
    // force the wrapper to recalc its column width with the new variables set in the css above
    Array.from(this.root.querySelectorAll('o-wrapper[namespace=footer-default-]')).forEach(wrapper => wrapper.calcColumnWidth())
  }
}
