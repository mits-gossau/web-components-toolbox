// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Breadcrumb
 * An example at: src/es/components/pages/Home.html
 *
 * @export
 * @class Breadcrumb
 * @type {CustomElementConstructor}
 */
export default class Breadcrumb extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
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
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    // extract frequently used value to variables
    const icon = this.getAttribute('icon')
    const iconWidth = this.getAttribute('iconWidth')
    const color = 'var(--color, pink)'
    const textDecoration = 'var(--text-decoration, none)'

    this.css = /* css */`
      :host {
        margin: var(--margin, 0) !important;
        width: var(--width, 0) !important;
      }
      :host ul {
        display: flex;
        flex-wrap: wrap;
        list-style: var(--list-style, none);
        margin: var(--ul-margin, 0);
        padding: var(--ul-padding, 0);
      }
      :host > ul > li {
        display: flex;
        white-space: nowrap;
      }
      :host > ul > li > a {
        color: var(--a-color, var(--color-secondary, ${color})); /* use variable "color" */
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, ${textDecoration}); /* use variable "textDecoration" */
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      :host > a:hover, :host > a:active, :host > a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, ${textDecoration}))); /* use variable "textDecoration" */
      }
      :host > ul > li > a {
        color: var(--a-color, var(--color-secondary, ${color})); /* use variable "color" */
        text-decoration: var(--a-text-decoration, ${textDecoration}); /* use variable "textDecoration" */
        text-underline-offset: var(--a-text-underline-offset, unset);
      }
      :host > ul > li > a:hover, :host > ul > li > a:active, :host > ul > li > a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, ${textDecoration}))); /* use variable "textDecoration" */
      }
      :host > ul > li > span {
        ${icon !== 'false' ? `background-image: var(--background-image, url(${icon || '_import-meta-url_../web-components/src/icons/chevron_right.svg'}));` : ''}
        background-position: center;
        background-repeat: no-repeat;
        background-size: 1em;
        ${icon !== 'false' ? 'color: transparent;' : ''}
        min-width: ${iconWidth ? `${iconWidth}` : 'var(--breadcrumb-icon-width, 1em)'};

      }
      @media only screen and (max-width: _max-width_) {
        :host {
          margin: var(--margin-mobile, var(--margin, 0)) !important;
          width: var(--width-mobile, var(--width, 0)) !important;
        }
        :host ul {
          margin: var(--ul-margin-mobile, var(--ul-margin, 0));
          padding: var(--ul-padding-mobile, var(--ul-padding, 0));
        }
        :host > ul > li > a {
          margin: var(--a-margin-mobile, var(--a-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
      }
    `
  }
}
