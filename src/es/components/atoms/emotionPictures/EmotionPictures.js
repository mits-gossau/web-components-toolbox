// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * EmotionPictures
 * A picture shuffle Component
 *
 * @export
 * @class EmotionPictures
 * @type {CustomElementConstructor}
 */
export default class EmotionPictures extends Shadow() {
  constructor (...args) {
    super(...args)
    this.childEle = this.root.childNodes;
    Array.from(this.childEle).forEach(node => {
      if(node.tagName === 'A-PICTURE'){
        node.setAttribute('loading', this.getAttribute('loading') || 'eager')
      }
    })
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
        margin: var(--margin, 0) !important;
        width: var(--width, 100%) !important;
        line-height:var(--line-height, 0);
        /*background:red;*/
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
      @media only screen and (max-width: _max-width_) {
        :host {
          margin: var(--margin-mobile, var(--margin, calc(-1.5rem + 1px) auto 1.5rem)) !important;
        }
      }
    `

    switch (this.getAttribute('namespace')) {
      case 'emotion-pictures-has-title-':
        this.setCss(/* css */`:host > * {--img-width: var(--emotion-pictures-has-title-img-width, 100%);}`, undefined, '', false)
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./has-title-/has-title-.css`,
          namespace: false
        }])
      default:
        if (!this.hasAttribute('namespace')) {
          this.css = /* css */`
          :host {
            --img-width: 14%;
           }
          `
        }
    }
  }

  shuffle (start = true) {
    clearInterval(this.interval || null)
    if (start) {
      this.interval = setInterval(() => {
        let shown
        if ((shown = this.shown)) {
          Array.from(this.childEle).forEach(node => {
            if(node.tagName === "A-PICTURE"){
              node.classList.remove('shown')
            }
          })
          if (shown.nextElementSibling && shown.nextElementSibling.tagName !== 'STYLE') {
            shown.nextElementSibling.classList.add('shown')
          } else if (this.childEle[0]) {
            if(this.childEle[0].tagName !== "A-PICTURE"){
              this.childEle[1].classList.add('shown')
            }else{
              this.childEle[0].classList.add('shown')
            }
          }
        }
      }, Number(this.getAttribute('interval')) || 8000)
    }
  }

  get shown () {
    return this.root.querySelector('a-picture.shown') || (() => {
      if (this.childEle[0].tagName !== 'A-PICTURE') {
        this.childEle[0].classList.add('shown')
        this.childEle[1].classList.add('shown')
        return this.childEle[1]
      }else{
        this.childEle[0].classList.add('shown')
        return this.childEle[0]
      }
    })()
  }
}
