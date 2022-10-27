// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 *
 *
 * @export
 * @class ImageHotspot
 * @type {CustomElementConstructor}
 * @css {
 *
 * }
 * @attribute {
 * }
 */
export default class ImageHotspot extends Shadow() {
  constructor (...args) {
    super(...args)
    this.hasRendered = false
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
  }

  disconnectedCallback () {

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
    return !this.hasRendered
  }

  /**
   * renders the m-Image-Hotspot css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host{
        width: var(--hotspot-content-width, 100vw);
      }

      :host .wrapper {
        position: relative;
      }
      :host .picture{
        --hotspot-picture-img-max-height: var(--content-width);
        --hotspot-picture-img-width: var(--content-width);
      }

      :host .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        margin: -1px;
        padding: 0;
        overflow: hidden;
        clip: rect(0,0,0,0);
        border: 0;
      }

      @media screen and (max-width: _max-width_){
        :host .wrapper{
          white-space: nowrap;
          overflow-x: scroll;
          overflow-y: hidden;
        }
        :host .picture,
        :host .hotspots-container {
          width: 100%;
          height: 100%;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          white-space: nowrap;
        }
        :host .hotspots-container {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }

        :host > div::-webkit-scrollbar {
          width: 0;
        }
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.hasRendered = true

    this.divWrapper.classList.add('wrapper')

    this.divPicture.classList.add('picture')
    this.divPicture.appendChild(this.picture)
    this.divWrapper.appendChild(this.divPicture)

    this.divHotspot.classList.add('hotspots-container')
    Array.from(this.hotspots).forEach(node => {
      this.divHotspot.appendChild(node)
    })
    this.divWrapper.appendChild(this.divHotspot)

    this.html = this.divWrapper
  }

  get hotspots () {
    return this.root.querySelectorAll('a-hotspot')
  }

  get picture () {
    return this.root.querySelector('a-picture') || this.root.querySelector('picture')
  }

  get divWrapper () {
    return this._divWrapper || (this._divWrapper = document.createElement('div'))
  }

  get divHotspot () {
    return this._divHotspot || (this._divHotspot = document.createElement('div'))
  }

  get divPicture () {
    return this._divPicture || (this._divPicture = document.createElement('div'))
  }
}
