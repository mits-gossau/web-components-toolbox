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

  constructor (...args) {
    super(...args)

    this.mouseoverListener = event => {
      if (this.hasAttribute('move') && !this.hasAttribute('hover-set-by-outside')) this.setAttribute('hover', 'true')
      this.classList.add('hover')
    }
    this.mouseoutListener = event => {
      if (this.hasAttribute('move') && !this.hasAttribute('hover-set-by-outside')) this.setAttribute('hover', '')
      this.classList.remove('hover')
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.mouseEventElement.addEventListener('mouseover', this.mouseoverListener)
    this.mouseEventElement.addEventListener('mouseout', this.mouseoutListener)
  }

  disconnectedCallback () {
    this.mouseEventElement.removeEventListener('mouseover', this.mouseoverListener)
    this.mouseEventElement.removeEventListener('mouseout', this.mouseoutListener)
    this.parentNodeShadowRootHost = null
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
      :host {
        cursor: pointer;
        display: inline-block;
        overflow: hidden;
        height: var(--svg-size, 1.5em);
        width: var(--svg-size, 1.5em);
        vertical-align: text-top;
      }
      :host > svg {
        align-items: center;
        color: var(--color, #777);
        height: var(--svg-size, 1.5em);
        justify-content: center;
        width: var(--svg-size, 1.5em);
      }
      :host > svg path {
        stroke: var(--path-color, var(--color, #777));
        transition: var(--path-transition, all 0.3s ease-out);
      }
      :host(:hover) > svg path, :host(.hover) > svg path{
        stroke: var(--path-color-hover, var(--color, #777));
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
    // TODO: or solve the problem with an icon controller with caching. Send event with Promise.resolve to controller, which then resolves it with the svg
    // src/es/components/web-components-toolbox/src/icons/chevron_right.svg
    this.html = /* html */`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    this.html = this.style
  }

  get svg () {
    return this.root.querySelector('svg')
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }

  get parentNodeShadowRootHost () {
    if (this._parentNodeShadowRootHost) return this._parentNodeShadowRootHost
    const searchShadowRoot = node => node.root || node.shadowRoot ? node : node.parentNode ? searchShadowRoot(node.parentNode) : node.host ? searchShadowRoot(node.host) : node
    return (this._parentNodeShadowRootHost = searchShadowRoot(this.parentNode))
  }

  set parentNodeShadowRootHost (node) {
    this._parentNodeShadowRootHost = node
  }

  get mouseEventElement () {
    return this[this.hasAttribute('hover-on-parent-element') ? 'parentNode' : this.hasAttribute('hover-on-parent-shadow-root-host') ? 'parentNodeShadowRootHost' : 'svg']
  }
}
