// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * @export
 * @class Tooltip
 * @type {CustomElementConstructor}
 */
export default class Tooltip extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.clickListener = event => {
      console.log(this, this.tooltipContent);
      console.log(event) 
      this.tooltipContent.classList.toggle("show");
    }
  }
  
  connectedCallback () {
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.shouldRenderCSS()) this.renderCSS()
    this.root.addEventListener('click', this.clickListener)
   

  }

  disconnectedCallback () {
    this.root.removeEventListener('click', this.clickListener)
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
    return !this.tooltipContent
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
  */
 renderCSS () {
   console.log("..", this.tooltipContent.offsetWidth)
   this.css = /* css */`
   :host .tooltip {
        --width: ${this.tooltipContent.offsetWidth/2}px;
        --half: ${0 - this.tooltipContent.offsetWidth/4}px;
        background:red;
        display: inline-block;
        position: relative;
      }
      :host .tooltip-text {
        border-radius: 0.25em;
        bottom: 100%;
        color: #fff;
        font-size:0.85em;
        left: 50%;
        margin-left: var(--half);
        padding: 0.25em 0;
        position: absolute;
        text-align: center;
        visibility: hidden;
        width: var(--width);
        z-index: 1;
      }

      :host .tooltip:hover .tooltip-text{
        background-color:var(--m-gray-800, black);
        visibility: visible;
      }

      :host .tooltip .tooltip-text::after {
        content: " ";
        position: absolute;
        top: 100%;
        left: 50%;
        margin-left: -0.25em;
        border-width: 0.25em;
        border-style: solid;
        border-color: var(--m-gray-800, black) transparent transparent transparent;
      }

     @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'tooltip-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    //this.html = "tool"
    Array.from(this.root.children).forEach(node => {
      console.log(node)
      this.elementWidth = node.offsetWidth
    })
  }

  get tooltipContent(){
    return this.root.querySelector('.tooltip')
  }
}
