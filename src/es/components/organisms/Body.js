// @ts-check
import BaseBody from '../web-components-cms-template/src/es/components/organisms/Body.js'

/* global self */

/**
 * Defines a body body for content and maps variables to global tags
 * Example at: /src/es/components/pages/General.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Body
 * @type {CustomElementConstructor}
 * @css {
 *  NOTE: grid-area: body;
 *  --content-spacing [40px]
 *  --content-width [80%]
 *  --h1-color [--color, black]
 *  --font-family-secondary
 * }
 */
export default class Body extends BaseBody {
  renderCSS () {
    super.renderCSS()
    this.css = /* css */`
      :host(.content-max-width) > main > *:not(.ignore-max-width), :host> main > *.content-max-width {
        max-width: var(--content-max-width, none);
      }
      :host(.content-max-width-two) > main > *:not(.ignore-max-width), :host > main > *.content-max-width-two {
        max-width: var(--content-max-width-two, none);
      }
      :host > main > *:not(style) {
        display: block;
      }
      :host > main h1 {
        --h1-margin: 1rem auto 1.143em;
      }
      :host > main h2 {
        --h2-margin: 1rem auto 1.143em;
      }
      :host > main h3 {
        --h3-margin: 1rem auto 1.143em;
      }
      :host > main h4 {
        --h4-margin: 1rem auto 1.143em;
      }
      :host > main .bold, :host > main strong {
        font-weight: bold;
      }
      :host > main a-picture {
        --picture-img-max-height: 75vh;
        --picture-img-object-fit: contain;
      }
      :host > main wc-a-button {
        width: var(--content-width-not-web-component, 80%);
      }
      :host > main ul {
        list-style: disc;
      }
      :host > main ul.icons {
        list-style: none;
        padding: 0;
      }
      :host > main hr {
        border: 0;
        border-bottom: 1px dashed var(--color);
        background: 0;
      }
      :host > main table {
        border-collapse: collapse;
        border-spacing: 0;
        max-width: 100%;
        width: 100%;
      }
      :host > main table:not([border=0]) td {
        border: 1px solid var(--color);
      }
      :host > main a > h1, :host > main a > h2, :host > main a > h3, :host > main a > h4, :host > main a > h5, :host > main a > h6 {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
      }
      :host > main a:hover > h1, :host > main a:active > h1, :host > main a:focus > h1,
      :host > main a:hover > h2, :host > main a:active > h2, :host > main a:focus > h2,
      :host > main a:hover > h3, :host > main a:active > h3, :host > main a:focus > h3,
      :host > main a:hover > h4, :host > main a:active > h4, :host > main a:focus > h4,
      :host > main a:hover > h5, :host > main a:active > h5, :host > main a:focus > h5,
      :host > main a:hover > h6, :host > main a:active > h6, :host > main a:focus > h6 {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      /* https://heroicons.com/ */
      :host > main a[href^="/"]:not(.no-icon):before {
        content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clip-rule="evenodd" /></svg>');
      }
      :host > main a[href^="http"]:not(.no-icon):before {
        content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="white"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>');
      }
      :host > main a[href$=".pdf"]:not(.no-icon):before {
        content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clip-rule="evenodd" /></svg>');
      }
      :host > main a[href$=".xls"]:not(.no-icon):before {
        content: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="white"><path fill-rule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clip-rule="evenodd" /></svg>');
      }
      :host > main a[href^="/"]:not(.no-icon):before, :host > main a[href^="http"]:not(.no-icon):before, :host > main a[href$=".pdf"]:not(.no-icon):before, :host > main a[href$=".xls"]:not(.no-icon):before {
        background-color: var(--a-color);
        border-radius: 0.25rem;
        display: inline-block;
        padding: 0.25rem;
        margin: 0.25rem 0.5rem 0.25rem 0;
        height: 1.25rem;
        vertical-align: middle;
        width: 1.25rem;
      }
      :host > main a[href^="/"]:not(.no-icon):hover:before, :host > main a[href^="http"]:not(.no-icon):hover:before, :host > main a[href$=".pdf"]:not(.no-icon):hover:before, :host > main a[href$=".xls"]:not(.no-icon):hover:before {
        background-color: var(--a-color-hover);
      }
      :host > main img {
        max-width: 100%;
      }
      :host([home]) .spacer {
        height: var(--home-spacer-height, 15vw);
      }
      :host > main wc-a-button ~ wc-a-button {
        padding-top: var(--content-spacing);
      }
      :host > main .quote {
        text-align: var(--q-text-align, center);
      }
      :host > main .quote > q {
        font-style: var(--q-font-style, italic);
      }
      :host > main .quote > small {
        font-size: var(--q-font-size, 0.8rem);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host([home]) .spacer {
          height: var(--home-spacer-height-mobile, var(--home-spacer-height, 15vw));
        }
        :host([home]) o-wrapper {
          margin: 0;
          --picture-text-wrapper-content-spacing-mobile: 0;
          --teaser-wrapper-content-spacing-mobile: 0;
        }
        :host > main wc-a-button {
          width: var(--content-width-not-web-component-mobile, var(--content-width-not-web-component, var(--content-width-mobile, var(--content-width, 90%))));
        }
        :host > main wc-a-button ~ wc-a-button {
          padding-top: var(--content-spacing-mobile, var(--content-spacing));
        }
      }
    `
  }
}
