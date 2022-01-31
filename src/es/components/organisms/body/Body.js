// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global location */
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
export default class Body extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickAnchorEventListener = event => {
      let element = null
      if (event && event.detail && event.detail.selector && (element = this.root.querySelector(event.detail.selector))) element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
    if (location.hash) {
      self.addEventListener('load', event => this.clickAnchorEventListener({ detail: { selector: location.hash } }), { once: true })
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', event => setTimeout(() => this.clickAnchorEventListener({ detail: { selector: location.hash } }), 1000), { once: true })
    }
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
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
    return !this.root.querySelector('main')
  }

  /**
   * renders the o-highlight-list css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        background-color: var(--background-color, white);
        grid-area: body;
      }
      :host > main {
        padding: var(--main-padding, 0);
      }
      :host > main > * {
        margin: var(--content-spacing, unset) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 80%);
      }
      :host > main > *:not(style) {
        display: var(--any-display, block);
      }
      :host > main > span, :host > main > div, :host > main > p, :host > main > a, :host > main > article, :host > main > ul, :host > main > ol, :host > main > section, :host > main > h1, :host > main > h2, :host > main > h3, :host > main > h4, :host > main > h5, :host > main > h6 {
        width: var(--content-width-not-web-component, 80%);
      }
      :host(.content-max-width) > main > *:not(.ignore-max-width), :host> main > *.content-max-width {
        max-width: var(--content-max-width, none);
      }
      :host(.content-max-width-two) > main > *:not(.ignore-max-width), :host > main > *.content-max-width-two {
        max-width: var(--content-max-width-two, none);
      }
      :host > main h1 {
        color: var(--h1-color, var(--color, black));
        font-size: var(--h1-font-size, min(5rem, 10vw));
        font-family: var(--h1-font-family, var(--font-family-bold));
        font-weight: var(--h1-font-weight, var(--font-weight, normal));
        line-height: var(--h1-line-height, normal);
        text-align: var(--h1-text-align, start);
        word-break: var(--h1-word-break, normal);
        text-transform: var(--h1-text-transform, none);
        margin: var(--h1-margin, var(--content-spacing, unset)) auto;
        padding: var(--h1-padding, unset);
      }
      :host > main h2 {
        color: var(--h2-color, var(--color, black));
        font-size: var(--h2-font-size, min(4rem, 10vw));
        font-family: var(--h2-font-family, var(--font-family-bold));
        font-weight: var(--h2-font-weight, var(--font-weight, normal));
        line-height: var(--h2-line-height, normal);
        text-align: var(--h2-text-align, start);
        word-break: var(--h2-word-break, normal);
        text-transform: var(--h2-text-transform, none);
        margin: var(--h2-margin, var(--content-spacing, unset)) auto;
        padding: var(--h2-padding, unset);
      }
      :host > main h3 {
        color: var(--h3-color, var(--color, black));
        font-size: var(--h3-font-size, min(3rem, 10vw));
        font-family: var(--h3-font-family, var(--font-family-bold));
        font-weight: var(--h3-font-weight, var(--font-weight, normal));
        line-height: var(--h3-line-height, normal);
        text-align: var(--h3-text-align, start);
        word-break: var(--h3-word-break, normal);
        text-transform: var(--h3-text-transform, none);
        margin: var(--h3-margin, var(--content-spacing, unset)) auto;
        padding: var(--h3-padding, unset);
      }
      :host > main h4 {
        color: var(--h4-color, var(--color, black));
        font-size: var(--h4-font-size, min(2rem, 10vw));
        font-family: var(--h4-font-family);
        font-weight: var(--h4-font-weight, var(--font-weight, normal));
        line-height: var(--h4-line-height, normal);
        text-align: var(--h4-text-align, start);
        word-break: var(--h4-word-break, normal);
        text-transform: var(--h4-text-transform, none);
        margin: var(--h4-margin, var(--content-spacing, unset)) auto;
        padding: var(--h4-padding, unset);
      }
      :host > main h5 {
        color: var(--h5-color, var(--color, black));
        font-size: var(--h5-font-size, min(1.5rem, 10vw));
        font-family: var(--h5-font-family, var(--font-family-secondary));
        font-weight: var(--h5-font-weight, var(--font-weight, normal));
        line-height: var(--h5-line-height, normal);
        text-align: var(--h5-text-align, start);
        word-break: var(--h5-word-break, normal);
        text-transform: var(--h5-text-transform, none);
        margin: var(--h5-margin, var(--content-spacing, unset)) auto;
        padding: var(--h5-padding, unset);
      }
      :host > main h6 {
        color: var(--h6-color, var(--color, black));
        font-size: var(--h6-font-size, min(1.5rem, 10vw));
        font-family: var(--h6-font-family, var(--font-family-secondary));
        font-weight: var(--h6-font-weight, var(--font-weight, normal));
        line-height: var(--h6-line-height, normal);
        text-align: var(--h6-text-align, start);
        word-break: var(--h6-word-break, normal);
        text-transform: var(--h6-text-transform, none);
        margin: var(--h6-margin, var(--content-spacing, unset)) auto;
        padding: var(--h6-padding, unset);
      }
      :host > main p {
        font-family: var(--p-font-family, var(--font-family-secondary));
        font-weight: var(--p-font-weight, var(--font-weight, normal));
        text-align: var(--p-text-align, start);
        text-transform: var(--p-text-transform, none);
        margin: var(--p-margin, var(--content-spacing, unset)) auto;
      }
      :host > main a {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        font-weight: var(--a-font-weight, var(--font-weight, normal));
        text-align: var(--a-text-align, unset);
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
        text-underline-offset: var(--a-text-underline-offset, unset);
        display: var(--a-display, inline);
        margin: var(--a-margin, var(--content-spacing, unset)) auto;
      }
      :host > main * a {
        display: var(--any-a-display, var(--a-display, inline));
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
      :host > main a:hover, :host > main a:active, :host > main a:focus {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host > main ul {
        text-align: var(--ul-text-align, var(--ol-text-align, start));
        display: var(--ul-display, var(--ol-display, block));
        flex-direction: var(--ul-flex-direction, var(--ol-flex-direction, column));
        box-sizing: var(--ul-box-sizing, var(--ol-box-sizing, border-box));
        list-style: var(--ul-list-style, disc);
      }
      :host > main ul.icons {
        list-style: var(--ul-icon-list-style, none);
        padding: var(--ul-icon-padding, 0);;
      }
      :host > main ul li, :host > main ol li {
        align-self: var(--li-align-self, auto);
      }
      :host > main ol {
        text-align: var(--ol-text-align, var(--ul-text-align, start));
        display: var(--ol-display, var(--ul-display, block));
        flex-direction: var(--ol-flex-direction, var(--ul-flex-direction, column));
        box-sizing: var(--ol-box-sizing, var(--ul-box-sizing, border-box));
      }
      :host > main .bold, :host > main strong {
        font-family: var(--strong-font-family, var(--font-family-bold));
        font-weight: var(--strong-font-weight, bold);
        text-transform: var(--strong-text-transform, none);
      }
      :host > main hr {
        border: var(--hr-border, 0);
        border-bottom: var(--hr-border-bottom, 1px dashed var(--color));
        background: var(--hr-background, 0);
      }
      :host > main img {
        max-width: 100%;
      }
      :host > main table {
        border-collapse: var(--table-border-collapse, collapse);
        border-spacing: var(--table-border-spacing, 0);
        max-width: var(--table-max-width, 100%);
        width: var(--table-width, 100%);
      }
      :host > main table:not([border=0]) td {
        border: var(--table-td-border, 1px solid var(--color));
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
      :host > main .quote {
        text-align: var(--q-text-align, center);
      }
      :host > main .quote > q {
        font-style: var(--q-font-style, italic);
      }
      :host > main .quote > small {
        font-size: var(--q-font-size, 0.8rem);
      }
      .spacer {
        display: block;
        height: var(--spacer-height, 15vw);
        margin: 0 auto;
        padding: 0;
        width: 100%;
      }
      :host > main wc-a-button {
        width: var(--content-width-not-web-component, 80%);
      }
      :host > main wc-a-button ~ wc-a-button {
        padding-top: var(--content-spacing);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > main {
          padding: var(--main-padding-mobile, var(--main-padding, 0));
        }
        :host > main > * {
          margin: var(--content-spacing-mobile, var(--content-spacing, unset)) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, var(--content-width, 90%));
        }
        :host > main > span, :host > main > div, :host > main > p, :host > main > a, :host > main > article, :host > main > ul, :host > main > ol, :host > main > section, :host > main > h1, :host > main > h2, :host > main > h3, :host > main > h4, :host > main > h5, :host > main > h6 {
          width: var(--content-width-not-web-component-mobile, var(--content-width-not-web-component, var(--content-width-mobile, var(--content-width, 90%))));
        }
        :host > main h1 {
          font-size: var(--h1-font-size-mobile, var(--h1-font-size, min(5rem, 14vw)));
          line-height: var(--h1-line-height-mobile, var(--h1-line-height, normal));
          word-break: var(--h1-word-break-mobile, var(--h1-word-break, normal));
          text-transform: var(--h1-text-transform-mobile, var(--h1-text-transform, normal));
          margin: var(--h1-margin-mobile, var(--h1-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main h2 {
          font-size: var(--h2-font-size-mobile, var(--h2-font-size, min(4rem, 14vw)));
          line-height: var(--h2-line-height-mobile, var(--h2-line-height, normal));
          word-break: var(--h2-word-break-mobile, var(--h2-word-break, normal));
          text-transform: var(--h2-text-transform-mobile, var(--h2-text-transform, normal));
          margin: var(--h2-margin-mobile, var(--h2-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main h3 {
          font-size: var(--h3-font-size-mobile, var(--h3-font-size, min(3rem, 14vw)));
          line-height: var(--h3-line-height-mobile, var(--h3-line-height, normal));
          word-break: var(--h3-word-break-mobile, var(--h3-word-break, normal));
          text-transform: var(--h3-text-transform-mobile, var(--h3-text-transform, normal));
          margin: var(--h3-margin-mobile, var(--h3-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main h4 {
          font-size: var(--h4-font-size-mobile, var(--h4-font-size, min(2rem, 14vw)));
          line-height: var(--h4-line-height-mobile, var(--h4-line-height, normal));
          word-break: var(--h4-word-break-mobile, var(--h4-word-break, normal));
          text-transform: var(--h4-text-transform-mobile, var(--h4-text-transform, normal));
          margin: var(--h4-margin-mobile, var(--h4-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main h5 {
          font-size: var(--h5-font-size-mobile, var(--h5-font-size, min(1.5rem, 14vw)));
          line-height: var(--h5-line-height-mobile, var(--h5-line-height, normal));
          word-break: var(--h5-word-break-mobile, var(--h5-word-break, normal));
          text-transform: var(--h5-text-transform-mobile, var(--h5-text-transform, normal));
          margin: var(--h5-margin-mobile, var(--h5-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main h6 {
          font-size: var(--h6-font-size-mobile, var(--h6-font-size, min(1.5rem, 14vw)));
          line-height: var(--h6-line-height-mobile, var(--h6-line-height, normal));
          word-break: var(--h6-word-break-mobile, var(--h6-word-break, normal));
          text-transform: var(--h6-text-transform-mobile, var(--h6-text-transform, normal));
          margin: var(--h6-margin-mobile, var(--h6-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main p {
          text-transform: var(--p-text-transform-mobile, var(--p-text-transform, none));
          margin: var(--p-margin-mobile, var(--p-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        :host > main a {
          margin: var(--a-margin-mobile, var(--a-margin, var(--content-spacing-mobile, var(--content-spacing, unset)))) auto;
        }
        .outro-text {
          margin-top: var(--outro-text-margin-top-mobile, 50px) auto;
        }
        .spacer {
          height: var(--spacer-height-mobile, 15vw);
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

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    const main = this.root.appendChild(document.createElement('main'))
    Array.from(this.root.children).forEach(node => {
      if (node === main || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      main.appendChild(node)
    })
  }
}
