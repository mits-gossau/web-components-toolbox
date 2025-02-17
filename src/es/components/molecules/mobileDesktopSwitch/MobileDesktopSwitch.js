// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* Its children will be visible ether on desktop or mobile
* Attribute visible can hold desktop or mobile as string
* 
* @export
* @class MobileDesktopSwitch
* @type {CustomElementConstructor}
*/
export default class MobileDesktopSwitch extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  disconnectedCallback () {}

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: contents;
      }
      ${this.getAttribute('visible') === 'desktop'
        ? /* css */`
          @media only screen and (max-width: _max-width_) {
            :host > * {
              display: none;
            }
          }
        `
        : this.getAttribute('visible') === 'mobile'
        ? /* css */`
          @media only screen and (min-width: calc(_max-width_ + 1px)) {
            :host > * {
              display: none;
            }
          }
        `
        : ''
      }
    `
  }
}
