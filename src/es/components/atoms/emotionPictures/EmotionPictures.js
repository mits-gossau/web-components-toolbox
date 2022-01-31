// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * EmotionPictures
 * A picture shuffle example at: src/es/components/pages/Kontakt.html
 *
 * @export
 * @class EmotionPictures
 * @type {CustomElementConstructor}
 */
export default class EmotionPictures extends Shadow() {
  constructor (...args) {
    super(...args)

    Array.from(this.root.children).forEach(node => node.setAttribute('loading', this.getAttribute('loading') || 'eager'))
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shown) this.shuffle()
  }

  disconnectedCallback () {
    this.shuffle(false)
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
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: grid !important;
        margin: var(--margin, -1.5rem auto 1.5rem) !important;
        width: var(--width, 100%) !important;
        max-width: var(--max-width, none) !important;
      }
      :host > * {
        grid-column: 1;
        grid-row: 1;
        opacity: 0;
        transition: var(--transition, opacity 3s ease);
      }
      :host > *.shown {
        opacity: 1;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          margin: var(--margin-mobile, var(--margin, calc(-1.5rem + 1px) auto 1.5rem)) !important;
        }
      }
    `
    this.setCss(/* css */`:host > * {
      --${this.getAttribute('namespace') || ''}img-max-height: var(--${this.getAttribute('namespace') || ''}max-height, 35vh);
      --picture-img-max-height: var(--${this.getAttribute('namespace') || ''}img-max-height);
      --${this.getAttribute('namespace') || ''}img-width: var(--${this.getAttribute('namespace') || ''}width, 100%);
      --picture-img-width: var(--${this.getAttribute('namespace') || ''}img-width);
    }`, undefined, '', false)
  }

  shuffle (start = true) {
    clearInterval(this.interval || null)
    if (start) {
      this.interval = setInterval(() => {
        let shown
        if ((shown = this.shown)) {
          Array.from(this.root.childNodes).forEach(node => node.classList.remove('shown'))
          if (shown.nextElementSibling && shown.nextElementSibling.tagName !== 'STYLE') {
            shown.nextElementSibling.classList.add('shown')
          } else if (this.root.childNodes[0]) {
            this.root.childNodes[0].classList.add('shown')
          }
        }
      }, Number(this.getAttribute('interval')) || 8000)
    }
  }

  get shown () {
    return this.root.querySelector('.shown') || (() => {
      if (this.root.childNodes[0]) this.root.childNodes[0].classList.add('shown')
      return this.root.childNodes[0]
    })()
  }
}
