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
  constructor(options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: { rootMargin: '0px', threshold: 0.75 } }), ...args)

    Array.from(this.root.childNodes).forEach(node => {
      if (node.tagName === 'A-PICTURE') node.setAttribute('loading', this.getAttribute('loading') || 'eager')
    })
  }

  intersectionCallback(entries, observer) {
    for (let entry of entries) {
      if(!entry.isIntersecting && entry.intersectionRatio === 0){
        this.classList.add('visible')
        break
      }
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        this.classList.add('visible')
        break;
      }else{
        this.classList.remove('visible')
        break
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shown && Array.from(this.root.childNodes).filter(child => child.tagName !== 'STYLE').length > 1) this.shuffle()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.shuffle(false)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS() {
    this.css = /* css */`
      :host {
        display: grid !important;
        margin: var(--margin, 0) !important;
        width: var(--width, 100%) !important;
        line-height: var(--line-height, 0);
        align-items: start;
        justify-items: start;
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
      :host > div {
        position: relative;
        width: var(--width, 100%);
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

    this.setCss(/* css */`
    :host > * {
      --img-width: var(--${this.getAttribute('namespace')}img-width, 100%);
      --img-max-height:var(--${this.getAttribute('namespace')}img-max-height, 100vh);
    }
  `, undefined, '', false)


    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'emotion-pictures-with-title-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./with-title-/with-title-.css`,
          namespace: false
        }, ...styles])
        case 'emotion-pictures-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`,
          namespace: false
        }, ...styles])
    }
  }

  shuffle(start = true) {
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

  get shown() {
    return this.root.querySelector('.shown') || (() => {
      if (this.root.childNodes[0]) this.root.childNodes[0].classList.add('shown')
      return this.root.childNodes[0]
    })()
  }
}