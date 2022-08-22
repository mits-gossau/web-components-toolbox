// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global customElements */
/* global CustomEvent */

/**
 * https://css-tricks.com/how-to-make-a-css-only-carousel/
 *
 * @attribute {
 * }
 * @css {
 * }
 * @type {CustomElementConstructor}
 */
export default class MacroCarousel extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => this.root.querySelector(event.composedPath().find(node => typeof node.getAttribute === 'function' && node.getAttribute('href')).getAttribute('href')).scrollIntoView()
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
    this.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
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
    return false
  }

  /**
   * renders the css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    this.css = /* css */`
      .gallery {
        overflow: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        display: flex;
      
      }
      .gallery__img {
        min-width: 100%;
      }
      .lil-nav {
        overflow-x: scroll;
        overflow-y: hidden;
        display: flex;
      }
      .lil-nav a {
        display: flex;
        margin-right: 10px;
      }
    `
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    return Promise.resolve()
  }
}
