// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/**
 * Arrow is an icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Arrow
 * @type {CustomElementConstructor}
 * @attribute {
 *  {up, right, down, left} [direction=left]
 * }
 * @css {
 *  --color [#777]
 *  --font-size [1.2rem]
 *  --color-hover [white]
 * }
 */
export default class Arrow extends Shadow() {
  static get observedAttributes () {
    return ['direction']
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'direction' && this.span) {
      if (newValue === 'toggle') this.setAttribute('direction', (newValue = this.span.classList.contains('up') ? 'down' : this.span.classList.contains('down') ? 'up' : newValue))
      this.span.className = newValue
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
    return !this.span
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > span{
        align-items: center;
        color: var(--color, #777);
        cursor: pointer;
        display: flex;
        font-size: var(--font-size, 1.2rem);
        height: 100%;
        justify-content: center;
        width: 100%;
      }
      :host > span:hover{
        color: var(--color-hover, var(--color, white));
      }
      :host > span.up{
        transform: rotate(90deg);
      }
      :host > span.right{
        transform: rotate(180deg);
      }
      :host > span.down{
        transform: rotate(270deg);
      }
      :host > span.left{
        transform: rotate(0deg);
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.html = /* html */`
      <span class=${this.getAttribute('direction')}>&#10094;</span>
    `
  }

  get span () {
    return this.root.querySelector('span')
  }
}
