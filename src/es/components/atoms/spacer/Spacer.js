// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class Spacer
* @type {CustomElementConstructor}
*/
export default class Spacer extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
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
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    // keep in harmony with: src/es/components/web-components-toolbox/src/css/style.css L:574 + L:768 /* spacer-stylings */
    this.css = /* css */`
      :host {
        display: block;
        height: 1px;
        margin: var(--spacer-margin, var(--content-spacing) auto) !important;
        padding: 0;
      }
      :host([spacer-one]) {
        margin: var(--spacer-margin, var(--content-spacing) auto 0) !important;
      }
      :host([spacer-two]) {
        height: var(--spacer-two-height, calc(2 * var(--content-spacing)));
      }
      :host([spacer-three]) {
        height: var(--spacer-three-height, calc(3 * var(--content-spacing)));
      }
      :host([spacer-four]) {
        height: var(--spacer-four-height, calc(4 * var(--content-spacing)));
      }
      :host([height]) {
        ${!this.getAttribute('height') || this.getAttribute('height') === '0'
          ? 'display: none;'
          : `height: ${this.getAttribute('height')};`}
      }
      @media only screen and (min-width: calc(_max-width_ + 1px)) {
        /*conditional rendering*/
        :host([show-only-mobile]) {
          display: none !important;
        }
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          margin: var(--spacer-margin-mobile, var(--spacer-margin, var(--content-spacing-mobile, var(--content-spacing)) auto)) !important;
        }
        :host([spacer-one]) {
          margin: var(--spacer-margin-mobile, var(--spacer-margin, var(--content-spacing-mobile, var(--content-spacing)) auto 0)) !important;
        }
        :host([spacer-two]) {
          height: var(--spacer-two-height-mobile, var(--spacer-two-height, calc(2 * var(--content-spacing-mobile, var(--content-spacing)))));
        }
        :host([spacer-three]) {
          height: var(--spacer-three-height-mobile, var(--spacer-three-height, calc(3 * var(--content-spacing-mobile, var(--content-spacing)))));
        }
        :host([spacer-four]) {
          height: var(--spacer-four-height-mobile, var(--spacer-four-height, calc(4 * var(--content-spacing-mobile, var(--content-spacing)))));
        }
        :host([height-mobile]) {
          ${!this.getAttribute('height-mobile') || this.getAttribute('height-mobile') === '0'
            ? 'display: none;'
            : `height: ${this.getAttribute('height-mobile')};`}
        }
        /*conditional rendering*/
        :host([show-only-desktop]) {
          display: none !important;
        }
      }
    `
  }
}
