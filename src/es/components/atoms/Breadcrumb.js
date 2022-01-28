// @ts-check
import { Shadow } from '../web-components-cms-template/src/es/components/prototypes/Shadow.js'

/* global self */

/**
 * Breadcrumb
 * An example at: src/es/components/pages/Home.html
 *
 * @export
 * @class Breadcrumb
 * @type {CustomElementConstructor}
 */
export default class Breadcrumb extends Shadow() {
  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
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
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
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
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      :host > main a:hover, :host > main a:active, :host > main a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host > ul > li > a {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
      }
      :host > ul > li > a:hover, :host > ul > li > a:active, :host > ul > li > a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host > ul > li > span {
        ${this.getAttribute('icon') !== 'false' ? `background-image: var(--background-image, url(${this.getAttribute('icon') || `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../web-components/src/icons/chevron_right.svg`}));` : ''}
        background-position: center;
        background-repeat: no-repeat;
        background-size: 1em;
        ${this.getAttribute('icon') !== 'false' ? 'color: transparent;' : ''}
        min-width: 1em;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
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
