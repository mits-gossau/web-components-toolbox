// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'
import Button from '../web-components/src/es/components/atoms/buttons/Button.js'

/* global customElements */
/* global self */

/**
 * As a molecule, this component shall hold Atoms
 * Umbraco Forms Styling
 * Example at: http://localhost:4200/src/es/components/pages/Formularbestellung.html
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @return {CustomElementConstructor | *}
 */
export default class Form extends Shadow() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'false' }), ...args)

    // scroll to first error
    this.clickListener = event => {
      setTimeout(() => {
        let fieldValidationError
        if ((fieldValidationError = this.root.querySelector('.field-validation-error')) && fieldValidationError.parentNode && fieldValidationError.parentNode.parentNode) fieldValidationError.parentNode.parentNode.scrollIntoView()
      }, 50)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.submit) this.submit.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    if (this.submit) this.submit.removeEventListener('click', this.clickListener)
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
    /** @type {any} */
    const ButtonConstructor = class extends Button {} // otherwise the browser complains that this constructor was already defined
    if (!customElements.get('a-button')) customElements.define('a-button', ButtonConstructor)
    const button = new ButtonConstructor({ namespace: 'btn-' })
    button.renderCSS()
    this.css = button.css.replace(/\sbutton/g, ' input[type=submit]').replace(/\s#label/g, ' input[type=submit]')
    this.css = /* css */`
      legend {
        font-weight: bold;
      }
      input, textarea {
        caret-color: var(--color-secondary);
      }
      textarea {
        resize: none;
      }
      input[type=text], input[type=password], textarea, input[type=checkbox], select {
        background-color: transparent;
        box-sizing: border-box;
        border-radius: 8px;
        border: 1px solid var(--m-gray-400);
        color: var(--color);
        padding: 10px;
        font-size: var(--font-size);
        outline: none;
        width: 100%;
      }
      input[type=text]::placeholder, input[type=password]::placeholder, textarea::placeholder {
        color: var(--m-gray-600);
        opacity: 1;
      }
      input[type=text]:hover, input[type=password]:hover, textarea:hover, input[type=checkbox]:hover {
        border-color: var(--m-gray-600);
      }
      input[type=text]:focus, input[type=password]:focus, textarea:focus, input[type=checkbox]:focus {
        border-color: var(--color-secondary);
      }
      .umbraco-forms-indicator {
        color: var(--color-secondary);
      }
      .umbraco-forms-field {
        padding-bottom: var(--content-spacing);
      }
      .field-validation-error {
        color: var(--color-secondary);
        padding: 0 10px;
        font-size: 0.875rem;
      }
      fieldset {
        border: 0;
      }
      .help-block {
        font-style: italic;
      }
      .checkbox > label {
        vertical-align: super;
      }
      .checkbox > label, .checkbox > .help-block {
        padding-left: var(--content-spacing);
      }
      input[type=checkbox] {
        border-radius: 8px;
        height: 1.5em;
        width: 1.5em;
      }
      *.steps__title {
        color: var(--background-color) !important;
        background-color: var(--color-secondary) !important;
        padding: 10px !important;
      }
      .checkboxlist {
        align-items: center;
        display: flex;
        flex-wrap: wrap;
      }
      .checkboxlist img {
        padding: 0 var(--content-spacing);
        max-width: 30vw !important;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          width: 100% !important;
        }
        input[type=text], input[type=password], textarea {
          font-size: var(--font-size-mobile);
        }
      }
    `
  }

  get submit () {
    return this.root.querySelector('input[type=submit]')
  }
}
