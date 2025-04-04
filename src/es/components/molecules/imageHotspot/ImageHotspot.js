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
  static get observedAttributes () {
    return ['open']
  }

  constructor (...args) {
    super(...args)
    this.hasRendered = false

    this.clickEventListener = event => event.stopPropagation()
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickEventListener)

    this.addEventListener('picture-load', event => {
      const spotContainer = document.createElement('div')
      const divContainer = document.createElement('div')

      divContainer.classList.add('img-is-spot-reference-wrapper')

      this.hotspots.forEach(el => spotContainer.appendChild(el))

      divContainer.appendChild(spotContainer)

      if (this.picture) {
        this.picture.html = divContainer
        divContainer.prepend(this.picture.picture)
        if (this.picture.closeBtn) divContainer.prepend(this.picture.closeBtn)
        if (this.picture.hasAttribute('open-modal')) {
          if (this.hasAttribute('only-show-hotspot-in-modal')) this.picture.css = /* css */`
            :host(:not([open])) a-hotspot {
              display: none;
            }
            ${this.hasAttribute('only-show-hotspot-in-modal-mobile')
              ? ''
              : /* css */`
                @media only screen and (max-width: _max-width_) {
                  :host(:not([open])) a-hotspot {
                    display: block;
                  }
                }
              `
            }
          `
          if (this.hasAttribute('only-show-hotspot-in-modal-mobile')) this.picture.css = /* css */`
            @media only screen and (max-width: _max-width_) {
              :host(:not([open])) a-hotspot {
                display: none;
              }
            }
          `
          // scroll
          const css = /* css */`
            :host([open]) {
              --img-width-mobile: max-content;
              --img-max-width: max-content;
              --picture-default-img-width-mobile: max-content;
              --picture-default-img-max-width: max-content;
              --picture-hotspot-img-width-mobile: max-content;
              --picture-hotspot-img-max-width: max-content;
              --host-overflow: auto;
              --picture-default-host-overflow: auto;
              --picture-hotspot-host-overflow: auto;
            }
          `
          if (this.hasAttribute('scroll-image-in-modal')) this.picture.css = /* css */`
            @media only screen and (min-width: calc(${this.mobileBreakpoint} + 1px)) {
              ${css}
            }
          `
          if (this.hasAttribute('scroll-image-in-modal-mobile')) this.picture.css = /* css */`
            @media only screen and (max-width: _max-width_) {
              ${css}
            }
          `
        }
      }
    })
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickEventListener)
  }

  // modal handling
  attributeChangedCallback (name, oldValue, newValue) {
    if (this.picture) {
      if (this.hasAttribute('open')) {
        this.picture.setAttribute('open', '')
      } else {
        this.picture.removeAttribute('open')
        this.hotspots.forEach(el => el.classList.remove('active'))
      }
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
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
        width: var(--width, 100%) !important;
      }

      :host .wrapper {
        position: relative;
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
        :host{
          width: var(--width-mobile, var(--width, 100%)) !important;
        }

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
    this.html = this.divWrapper
  }

  get hotspots () {
    return this.root.querySelector('a-hotspot') ? this.root.querySelectorAll('a-hotspot') : this.picture.root.querySelectorAll('a-hotspot')
  }

  get picture () {
    return this.root.querySelector('a-picture') || this.root.querySelector('ks-a-picture') || this.root.querySelector('picture')
  }

  get divWrapper () {
    return this._divWrapper || (this._divWrapper = document.createElement('div'))
  }

  get divPicture () {
    return this._divPicture || (this._divPicture = document.createElement('div'))
  }
}
