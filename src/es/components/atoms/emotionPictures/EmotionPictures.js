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
    super(Object.assign(options, { intersectionObserverInit: { rootMargin: '0px', threshold: 0.75 } }), ...args)

    Array.from(this.root.childNodes).forEach(node => {
      if (node.tagName === 'A-PICTURE') node.setAttribute('loading', this.getAttribute('loading') || 'eager')
    })
  }

  intersectionCallback (entries, observer) {
    for (const entry of entries) {
      if (!entry.isIntersecting && entry.intersectionRatio === 0) {
        this.classList.add('visible')
        break
      }
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        this.classList.add('visible')
        break
      } else {
        this.classList.remove('visible')
        break
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    const showPromises = []
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) {
      showPromises.push(new Promise(resolve => this.addEventListener('picture-load', event => resolve(), { once: true })))
    }
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => {
        this.hidden = false
        if (this.shown && Array.from(this.root.childNodes).filter(child => child.tagName !== 'STYLE').length > 1) this.shuffle()
        this.css = /* CSS */`
          :host {
            --show: none;
          }
        `
      })
    }
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
        width: var(--width, 100%) !important;
        line-height: var(--line-height, 0);
        align-items: start;
        justify-items: start;
      }
      :host > * {
        grid-column: 1;
        grid-row: 1;
        opacity: 0;
        transition: var(--transition, opacity 2s ease-out);
      }
      :host > *.shown {
        opacity: 1;
      }
      :host > div {
        position: relative;
        width: var(--width, 100%);
      }
      :host > div > *:not(a-picture) {
        position: absolute;
        z-index:2;
        top: 4vw;
        left: 10vw;
        right:10vw;
        opacity: 0;
        transition: var(--text-transition, opacity 0.5s ease-out);
      }
      :host(.visible) > div > *:not(a-picture) {
        opacity: 1;
      }
      @media only screen and (max-width: _max-width_) {
        :host > div h2.font-size-big {
          font-size: var(--h2-font-size-mobile);
        }
        :host > div h1.font-size-big {
          font-size: var(--h1-font-size-mobile);
        }
        :host > div > *:not(a-picture) {
          top: 2vw;
          left: 0;
          margin:var(--div-margin-mobile);
        }
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
        // @ts-ignore
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
        }, ...styles], false)
      case 'emotion-pictures-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`,
          namespace: false
        }], false)
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

  get aPicture () {
    return this.root.querySelector('a-picture')
  }
}
