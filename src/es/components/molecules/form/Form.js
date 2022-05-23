// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'
import Button from '../../atoms/button/Button.js'

/* global customElements */
/* global self */

/**
 * As a molecule, this component shall hold Atoms
 * Umbraco Forms Styling
 * Figma Example: https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=1904%3A17142
 *
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

    this.textAreaKeyUpListener = event => {
      this.updateCounter(event.target)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.submit) this.submit.addEventListener('click', this.clickListener)
    this.textarea.forEach(a => {
      if (a.hasAttribute('maxlength') && !a.hasAttribute('no-counter')) {
        a.addEventListener('keyup', this.textAreaKeyUpListener)
      }
    })
  }

  disconnectedCallback () {
    if (this.submit) this.submit.removeEventListener('click', this.clickListener)
    this.textarea.forEach(a => {
      if (a.hasAttribute('maxlength') && !a.hasAttribute('no-counter')) {
        a.removeEventListener('keyup', this.textAreaKeyUpListener)
      }
    })
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
    return !this.root.querySelector('span.counter')
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
      :host {
        width:100%;
      }
      legend {
        font-family: var(--font-family-bold, var(--font-family, inherit));
      }
      input, textarea {
        caret-color: var(--color-secondary);
      }
      textarea {
        resize: none;
      }
      input[type]:disabled{
        background-color:red;
      }
      ${this.getInputFieldsWithText()}, ${this.getInputFieldsWithControl()} {
        font-family: var(--font-family, inherit);
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
      .umbraco-forms-field-wrapper{
        display: grid;
        grid-template-columns: auto;
      }
      .counter{
        text-align: end;
        padding: 0 0.625em;
      }
      textarea[maxlength]{
        grid-area: 1/1 / 2 / span1;
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

      datalist {
        position: absolute;
        border: 1px solid var(--m-gray-400);
        border-top: none;
        width: 350px;
        max-height: 10em;
        overflow-y: auto;
      }
      
      option {
        background-color: var(--background-color);
        padding: 4px;
        cursor: pointer;
      }

      option:hover, .active{
        background-color: var(--color-secondary);
        color: var(--background-color);
      }

      /* loading icon for form fields */
      .icon-container {
        position: relative;
        right: 0px;
        bottom: 30px;
      }
      .loader {
        position: absolute;
        right:10px;
        height: 20px;
        width: 20px;
        display: inline-block;
        animation: around 5.4s infinite;
      }
      @keyframes around {
        0% {
          transform: rotate(0deg)
        }
        100% {
          transform: rotate(360deg)
        }
      }
      .loader::after, .loader::before {
        content: "";
        background: white;
        position: absolute;
        display: inline-block;
        width: 100%;
        height: 100%;
        border-width: 2px;
        border-color: #333 #333 transparent transparent;
        border-style: solid;
        border-radius: 20px;
        box-sizing: border-box;
        top: 0;
        left: 0;
        animation: around 0.7s ease-in-out infinite;
      }
      
      .loader::after {
        animation: around 0.7s ease-in-out 0.1s infinite;
        background: transparent;
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

  renderHTML () {
    this.textarea.forEach(textarea => {
      if (textarea.hasAttribute('maxlength') && !textarea.hasAttribute('no-counter')) {
        const lable = textarea.hasAttribute('data-maxlength-lable') ? textarea.getAttribute('data-maxlength-lable') : ''
        if (lable !== '' && !lable.includes('#number')) {
          textarea.setAttribute('data-maxlength-lable', lable + '#number')
        } else {
          textarea.setAttribute('data-maxlength-lable', '#number' + ' / ' + textarea.getAttribute('maxlength'))
        }

        // new span for counter
        const counter = document.createElement('span')
        counter.classList.add('counter')
        counter.id = 'id-' + textarea.getAttribute('id')
        counter.innerHTML = lable
        textarea.parentNode.append(counter)

        this.updateCounter(textarea)
      }
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency () {
    return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
      // needs markdown
      if ('grecaptcha' in self === true) {
        resolve(self.grecaptcha) // eslint-disable-line
      } else {
        const vendorsMainScript = document.createElement('script')
        vendorsMainScript.setAttribute('type', 'text/javascript')
        vendorsMainScript.setAttribute('async', '')
        vendorsMainScript.setAttribute('src', `https://www.google.com/recaptcha/api.js?render=${this.getAttribute('site-key')}`)
        vendorsMainScript.onload = () => {
          if ('grecaptcha' in self === true) resolve(self.grecaptcha) // eslint-disable-line
        }
        this.html = [vendorsMainScript]
      }
    }))
  }

  updateCounter (textArea) {
    if (!textArea || textArea.value === undefined) return
    const value = textArea.value.length
    const lable = textArea.getAttribute('data-maxlength-lable')
    const counter = this.root.querySelector('span#' + 'id-' + textArea.getAttribute('id'))

    counter.innerHTML = lable.replace('#number', value)
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

  get textarea () {
    return this.root.querySelectorAll('textarea')
  }
}
