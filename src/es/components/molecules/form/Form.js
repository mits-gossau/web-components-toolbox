// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'
import Button from '../../atoms/button/Button.js'

/* global customElements */

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

    this.setAttribute('role', 'form')
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
    // @ts-ignore
    if (!customElements.get('a-button')) customElements.define('a-button', Button)
    const button = new Button({ namespace: 'button-primary-' })
    button.hidden = true
    this.html = button
    button.renderCSS().then(styles => styles.forEach(style => (this.html = style.styleNode)))
    this.css = button.css.replace(/\sbutton/g, ' input[type=submit]').replace(/\s#label/g, ' input[type=submit]')
    button.remove()
    this.css = /* css */`
      legend {
        font-family: var(--font-family-bold, var(--font-family, inherit));
      }
      input, textarea {
        caret-color: var(--color-secondary);
      }
      textarea {
        resize: none;
      }
      ${this.getInputFieldsWithText()}, ${this.getInputFieldsWithControl()} {
        border-radius: var(--border-radius, 0.5em);
        background-color: transparent;
        box-sizing: border-box;
        border: 1px solid var(--m-gray-400);
        color: var(--color);
        padding: 0.625em;
        font-size: var(--font-size);
        outline: none;
        width: 100%;
      }
      ${this.getInputFieldsWithText('::placeholder')} {
        color: var(--m-gray-600);
        opacity: 1;
      }
      ${this.getInputFieldsWithText(':hover')} {
        border-color: var(--m-gray-600);
      }
      ${this.getInputFieldsWithText(':focus')} {
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
        padding: 0 0.625em;
        font-size: 0.875em;
      }
      fieldset {
        border: 0;
        margin: 0;
        padding: 0;
      }
      .help-block {
        font-style: italic;
      }
      .checkbox > label, .checkboxlist > label, .radiobutton > label, .radiobuttonlist > label {
        vertical-align: super;
      }
      .checkbox > label, .checkbox > .help-block, .checkboxlist > label, .checkboxlist > .help-block, .radiobutton > label, .radiobutton > .help-block, .radiobuttonlist > label, .radiobuttonlist > .help-block {
        padding-left: var(--content-spacing);
      }
      ${this.getInputFieldsWithControl()} {
        height: 1.5em;
        width: 1.5em;
      }
      *.steps__title {
        color: var(--background-color) !important;
        background-color: var(--color-secondary) !important;
        padding: 0.625em !important;
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
      @media only screen and (max-width: _max-width_) {
        :host {
          width: 100% !important;
        }
        ${this.getInputFieldsWithText()} {
          font-size: var(--font-size-mobile);
        }
        ${this.getInputFieldsWithText()}, ${this.getInputFieldsWithControl()} {
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
      }
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      default:
        return this.fetchCSS(styles, false)
    }
  }

  getInputFieldsWithText (add) {
    return [
      'input[type=text]',
      'input[type=password]',
      'input[type=tel]',
      'input[type=email]',
      'input[type=number]',
      'input[type=search]',
      'input[type=url]',
      'input[type=datetime-local]',
      'input[type=date]',
      'input[type=month]',
      'input[type=time]',
      'input[type=week]',
      'textarea',
      'select'
    ].reduce((acc, value, i) => `${acc}${i === 0 ? '' : ','}${value}${add || ''}`, '')
  }

  getInputFieldsWithControl (add) {
    return [
      'input[type=radio]',
      'input[type=checkbox]'
    ].reduce((acc, value, i) => `${acc}${i === 0 ? '' : ','}${value}${add || ''}`, '')
  }

  get submit () {
    return this.root.querySelector('input[type=submit]')
  }
}
