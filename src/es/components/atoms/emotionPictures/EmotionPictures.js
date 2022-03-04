// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/**
 * EmotionPictures
 * A picture shuffle Component
 *
 * @export
 * @class EmotionPictures
 * @type {CustomElementConstructor}
 */
export default class EmotionPictures extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: { rootMargin: '200px 0px 200px 0px', threshold: 0.5 } }), ...args)

    this.childEle = this.root.childNodes

    Array.from(this.childEle).forEach(node => {
      if (node.tagName === 'A-PICTURE') {
        node.setAttribute('loading', this.getAttribute('loading') || 'eager')
      }
    })
  }

  intersectionCallback (entries, observer) {
    if (entries && entries[0]) {
      if (entries[0].isIntersecting) {
        this.classList.add('visible')
      } else {
        this.classList.remove('visible')
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shown) this.shuffle()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
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
        margin: var(--margin, 0) !important;
        width: var(--width, 100%) !important;
        line-height:var(--line-height, 0);
        align-items: start;
        justify-items: start;
      }
      :host > * {
        grid-column: 1;
        grid-row: 1;
        /*opacity: 0;*/
        opacity: 0;
        transition: var(--transition, opacity 3s ease);
      }
      :host > *.shown {
        /*opacity: 1;*/
        opacity: 1;
      }
      :host > div {
        position:relative;
      }
      :host > div > h2 {
        position: absolute !important;
        z-index:2;
        top: 4vw;
        left: 10vw !important;
        opacity: 0;
        animation: opacity 500ms ease-out;
      }
      :host(.visible) > div > h2 {
        opacity: 1;

      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
      @keyframes opacity {
        0% {opacity: 0;}
        100% {opacity: 1;}
      }
    `

    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'emotion-pictures-has-title-':
        this.setCss(/* css */':host > * {--img-width: var(--emotion-pictures-has-title-img-width, 100%);}', undefined, '', false)
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./has-title-/has-title-.css`,
          namespace: false
        }, ...styles])
      default:
        if (!this.hasAttribute('namespace')) {
          this.css = /* css */`
          :host {
            --img-width: 100%;
           }
          `
        }
        return this.fetchCSS(styles)
    }
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
