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

      img {
        display: block;
        max-width: 100%;
      }
      
      .wrapper {
        overflow: hidden;
        height: 100vh;
        display: grid;
        grid-template-rows: 2fr 1fr;
        grid-gap: 10px;
      
      }
      @media screen and (min-width: 1200px) {
        .wrapper {
          grid-template-columns: 1fr 5fr;
          grid-template-rows: auto;
        }
      }
      
      .gallery {
        overflow-x: scroll;
        overflow-y: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        display: flex;
      
      }
      @media screen and (min-width: 1200px) {
        .gallery {
          display: block;
          overflow-y: scroll;
          overflow-x: hidden;
          scroll-snap-type: y mandatory;
        }
      }
      
      .gallery__img {
        scroll-snap-align: start;
        margin-bottom: 10px;
        min-width: 100%;
        object-fit: cover;
      
      }
      @media screen and (min-width: 1200px) {
        .gallery__img {
          min-width: auto;
          min-height: 100vh;
        }
      }
      
      .lil-nav {
        overflow-x: scroll;
        overflow-y: hidden;
        display: flex;
        grid-row-start: 2;
      
        
      }
      @media screen and (min-width: 1200px) {
        .lil-nav {
          overflow-y: scroll;
          overflow-x: hidden;
          display: block;
          grid-row-start: auto;
        }
      }
      .lil-nav a {
        display: flex;
        min-width: 45vw;
        margin-right: 10px;
        
      }
          @media screen and (min-width: 1200px) {
            .lil-nav a {
              margin-bottom: 10px;
              min-height: 200px;
              min-width: 100%;
            }
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
