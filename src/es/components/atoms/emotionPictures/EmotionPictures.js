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
  constructor (options = {}, ...args) {
    super(...args)

    this.childEle = this.root.childNodes;

    Array.from(this.childEle).forEach(node => {
      if(node.tagName === 'A-PICTURE'){
        node.setAttribute('loading', this.getAttribute('loading') || 'eager')
      }
    })

    this.observer = this.titleObserver()
    this.titleElement = this.root.querySelector('H2')

  }

  titleObserver = () => {
    return new IntersectionObserver(entries => {
      if(!entries[0]['isIntersecting']){
        return;
      }
      if(entries[0]['isIntersecting']) {
        if(entries[0]['intersectionRatio'] === 1) {
          this.titleElement.style.opacity =  1;
        } else {
          this.titleElement.style.opacity =  entries[0]['intersectionRatio'];
        }
      }else{
        this.titleElement.style.opacity =  1;
      }
    }, { threshold: [0, 0.5, 1] });
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shown) this.shuffle()
    if (this.titleElement) this.observer.observe(this.titleElement)
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
      :host > h2 {
        z-index:2;
        top: 4vw;
        left: 10vw !important;
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
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
        this.setCss(/* css */`:host > * {--img-width: var(--emotion-pictures-has-title-img-width, 100%);}`, undefined, '', false)
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./has-title-/has-title-.css`,
          namespace: false
        },...styles])
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
