// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global Arrow */
/* global customElements */

/**
 * Stage is an image with text acting as a viewport cover, which can be clicked/scrolled away
 * Example at: /src/es/components/pages/Home.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Stage
 * @type {CustomElementConstructor}
 * @css {
 *  --content-spacing [40px]
 *  --arrow-font-size [3rem]
 *  --bottom [100px] overlay text position absolute at bottom
 *  --color, white
 * }
 * @attribute {src} background image source link
 */
export default class Stage extends Shadow() {
  constructor (...args) {
    super(...args)

    const section = document.createElement('section')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      section.appendChild(node)
    })
    this.html = section
    this.clickEventListenerTimeout = null
    this.clickEventListener = event => {
      clearTimeout(this.clickEventListenerTimeout)
      const direction = () => self.scrollY > 0 ? 'down' : 'up'
      this.arrow.setAttribute('direction', direction())
      this.clickEventListenerTimeout = setTimeout(() => {
        this.arrow.setAttribute('direction', direction())
        if (event && event.type !== 'scroll') {
          if (direction() === 'down') {
            document.body.scrollIntoView({ behavior: 'smooth' })
          } else {
            this.nextSibling.scrollIntoView({ behavior: 'smooth' })
          }
        }
      }, 50)
    }
  }

  connectedCallback () {
    this.loadChildComponents()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.root.addEventListener('click', this.clickEventListener)
    self.addEventListener('scroll', this.clickEventListener)
  }

  disconnectedCallback () {
    this.root.removeEventListener('click', this.clickEventListener)
    self.removeEventListener('scroll', this.clickEventListener)
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
    return !this.img
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host{
        color: var(--color, white);
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        height: calc(100vh - var(--header-height , 85px));
        margin: 0 !important;
        width: 100% !important;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          height: calc(100vh - var(--header-height-mobile, 50px));
        }
      }
      :host > img{
        display: block;
        height: auto;
        object-fit: cover;
        width: 100%;
      }
      :host > a-arrow {
        --color: var(--arrow-color);
        --font-size: var(--arrow-font-size, 3rem);
        animation: bounce 3s infinite;
        bottom: calc(var(--content-spacing, 40px) / 2);
        position: absolute;
        user-select: none;
      }
      :host > section {
        bottom: var(--bottom, 100px);
        position: absolute;
      }
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 
        40% {transform: translateY(-15px);} 
        60% {transform: translateY(-7px);} 
     } 
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = `<img src=${this.getAttribute('src')}><a-arrow direction=up namespace=${this.getAttribute('namespace') || ''}${this.hasAttribute('namespace-fallback') ? ' namespace-fallback' : ''}></a-arrow>`
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let arrowPromise
    try {
      arrowPromise = Promise.resolve({ default: Arrow })
    } catch (error) {
      arrowPromise = import('../atoms/Arrow.js')
    }
    return (this.childComponentsPromise = Promise.all([
      arrowPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-arrow', module.default]
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

  get img () {
    return this.root.querySelector('img')
  }

  get arrow () {
    return this.root.querySelector('a-arrow')
  }
}
