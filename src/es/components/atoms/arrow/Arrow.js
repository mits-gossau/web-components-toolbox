// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

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
    return ['hover']
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'hover') {
      const duration = 370
      this.style.textContent = /* CSS */`
        :host > svg{
          animation: move ${duration}ms ease-out ${newValue ? '' : 'reverse'};
        }
      `
      clearTimeout(this.timeout)
      this.timeout = setTimeout(() => (this.style.textContent = ''), duration + 100)
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
    return !this.svg
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host([hover]) {
        display: block;
        overflow: hidden;
      }
      :host > svg {
        align-items: center;
        color: var(--color, #777);
        cursor: pointer;
        display: flex;
        font-size: var(--font-size);
        height: 1em;
        justify-content: center;
        width: 1em;
      }
      :host > svg path {
        stroke: var(--color, #777);
      }
      :host(:hover) > svg{
        color: var(--color-hover, var(--color, white));
      }
      :host([direction=up]) > svg {
        transform: rotate(270deg);
      }
      :host([direction=right]) > svg {
        transform: rotate(0deg);
      }
      :host([direction=down]) > svg {
        transform: rotate(90deg);
      }
      :host([direction=left]) > svg {
        transform: rotate(180deg);
      }
      @keyframes move {
        0% {transform: translateY(0);}
        48% {transform: translateY(-0.8em); opacity: 1;}
        49% {transform: translateY(-0.8em); opacity: 0;}
        50% {transform: translateY(0.8em); opacity: 0;}
        51% {transform: translateY(0.8em); opacity: 1;}
        100% {transform: translateY(0);}
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    // TODO: SVG's should be taken from icons folder but fetch can't use cache and is too slow on loads of requests at once. object, img, etc. does not work for css styling. so most likely it needs a node script copying this stuff on update in the icon folder.
    // src/es/components/web-components-toolbox/src/icons/chevron_right.svg
    this.html = /* html */`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="#333333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    this.html = this.style
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
