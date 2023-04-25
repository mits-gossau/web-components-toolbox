// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * IconLocation is an icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class IconLocation
 * @type {CustomElementConstructor}
 */
export default class IconLocation extends Shadow() {
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
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.mouseEventElement.addEventListener('mouseover', this.mouseoverListener)
    this.mouseEventElement.addEventListener('mouseout', this.mouseoutListener)
  }

  disconnectedCallback () {
    this.mouseEventElement.removeEventListener('mouseover', this.mouseoverListener)
    this.mouseEventElement.removeEventListener('mouseout', this.mouseoutListener)
    this.parentNodeShadowRootHost = null
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
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
        display: inline-block;
        overflow: hidden;
        margin-bottom: 0.225em;
        height: var(--svg-size, 1.5em);
        width: var(--svg-size, 1.5em);
        vertical-align: middle;
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
        stroke: var(--path-color-hover, var(--color-hover, var(--color, #777)));
      }
    `
    // font-family can have an effect on size on the bounding h-tag with .bg-color
    if (this.parentElement && this.parentElement.children.length === 1) this.parentElement.setAttribute('style', 'font-family: inherit')
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    // TODO: SVG's should be taken from icons folder but fetch can't use cache and is too slow on loads of requests at once. object, img, etc. does not work for css styling. so most likely it needs a node script copying this stuff on update in the icon folder.
    // TODO: or solve the problem with an icon controller with caching. Send event with Promise.resolve to controller, which then resolves it with the svg
    // src/es/components/web-components-toolbox/src/icons/location.svg
    this.html = /* html */`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  }

  get svg () {
    return this.root.querySelector('svg')
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
