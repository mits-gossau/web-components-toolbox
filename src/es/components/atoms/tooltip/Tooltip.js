// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class Tooltip
 * @type {CustomElementConstructor}
 */
export default class Tooltip extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.clickListener = event => {
      this.tooltipContent.classList.toggle('show')
    }
  }

  connectedCallback () {
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
    this.css = /* css */`
    :host {
      display: var(--display, block);
      width: var(--width, auto);
    }
    :host .tooltip {
      --width: ${this.tooltipWidth}em;
      --half: ${0 - this.tooltipWidth / 2}em;
      display: var(--tooltip-display, inline-block);
      position: var(--tooltip-position, relative);
    }
    :host .tooltip-text {
      --text-align: ${this.textAlign ? this.textAlign : 'left'};
      border-radius:var(--tooltip-text-border-radius, 0.25em);
      bottom: var(--tooltip-text-bottom, 100%);
      color: var(--tooltip-text-color, #FFFFFF);
      font-size:var(--tooltip-text-font-size, 0.85em);
      left: var(--tooltip-text-left, 50%);
      line-height: var(--tooltip-text-line-height, normal);
      margin-left: var(--half);
      padding: var(--tooltip-text-padding, 0.5em);
      position: var(--tooltip-text-position, absolute);
      text-align: var(--text-align, left);
      visibility: var(--tooltip-text-visibility, hidden);
      width: var(--width);
      z-index: var(--tooltip-text-z-index, 1);
    }
    :host .tooltip:hover .tooltip-text {
      background-color: var(--m-gray-800, black);
      visibility: var(--tooltip-hover-visibility, visible);
    }
    :host .tooltip .tooltip-text::after {
      border-color: var(--m-gray-800, black) transparent transparent transparent;
      border-style: solid;
      border-width: 0.25em;
      content: " ";
      left: 50%;
      margin-left: -0.25em;
      position: absolute;
      top: 100%;
    }
    :host .tooltip-text-icon {
      margin-bottom: var(--tooltip-text-icon-margin-bottom, 0.4em);
    }
    :host .icon-img {
      height: var(--icon-img-height, 1.5em);
      width: var(--icon-img-width, 100%);
    }
    @media only screen and (max-width: _max-width_) {
      :host .tooltip:hover .tooltip-text {
        visibility: var(--tooltip-hover-visibility-mobile, hidden);
      }
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
        return this.fetchCSS(styles)
    }
  }

  /**
   * Returns the element with the class "tooltip" that is a child of the root element.
   * @returns The method is returning the element with the class "tooltip" that is found within the root element.
   */
  get tooltipContent () {
    return this.root.querySelector('.tooltip')
  }

  /**
   * Returns the width attribute of the root element as a number, or 10 if the attribute is not present or not a valid number.
   * @returns number|number value of the `width` attribute of the element as a number.
   * If the `width` attribute is not present or cannot be converted to a number, it will return 10
   */
  get tooltipWidth () {
    return Number(this.getAttribute('width')) || 10
  }

  get textAlign () {
    return this.getAttribute('text-align')
  }
}
