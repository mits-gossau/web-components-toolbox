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
    super({
      importMetaUrl: import.meta.url,
      mode: 'false',
      ...options
    }, ...args)

    this.setAttribute('role', 'form')
    // scroll to first error
    // @ts-ignore
    this.clickListener = event => {
      setTimeout(() => {
        let fieldValidationError
        if ((fieldValidationError = this.root.querySelector('.field-validation-error')) && fieldValidationError.parentNode && fieldValidationError.parentNode.parentNode) fieldValidationError.parentNode.parentNode.scrollIntoView()
      }, 50)
    }

    this.textAreaKeyUpListener = event => {
      this.updateCounter(event.target)
    }

    this.changeListener = event => {
      // input file detection with writing the selected files into the label
      let inputTypeFile
      if ((inputTypeFile = event.composedPath()[0]) && inputTypeFile.hasAttribute('type') && inputTypeFile.getAttribute('type') === 'file') {
        const files = Array.from(inputTypeFile.files)
        let typeFileLabel
        if ((typeFileLabel = inputTypeFile.parentNode.querySelector('.type-file-label'))) {
          if (files.length) {
            if (inputTypeFile.hasAttribute('remove-file-title')) inputTypeFile.setAttribute('title', (inputTypeFile.getAttribute('remove-file-title')))
            inputTypeFile.parentNode.classList.add('has-files')
            if (!typeFileLabel.hasAttribute('original-label')) typeFileLabel.setAttribute('original-label', typeFileLabel.innerHTML)
            typeFileLabel.innerHTML = files.reduce((acc, file, i) => `${acc}${file.name}${files[i + 1] ? '<br>' : ''}`, '&nbsp;')
            inputTypeFile.addEventListener('click', event => {
              event.preventDefault()
              inputTypeFile.value = ''
              this.changeListener(event)
            }, { once: true })
          } else if (typeFileLabel.hasAttribute('original-label')) {
            if (inputTypeFile.hasAttribute('remove-file-title')) inputTypeFile.removeAttribute('title')
            inputTypeFile.parentNode.classList.remove('has-files')
            typeFileLabel.innerHTML = typeFileLabel.getAttribute('original-label')
          }
        }
      }
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.submit) this.submit.addEventListener('click', this.clickListener)
    this.textarea.forEach(a => {
      if (a.hasAttribute('maxlength') && !a.hasAttribute('no-counter')) {
        a.addEventListener('keyup', this.textAreaKeyUpListener)
      }
    })
    this.addEventListener('change', this.changeListener)
  }

  disconnectedCallback () {
    if (this.submit) this.submit.removeEventListener('click', this.clickListener)
    this.textarea.forEach(a => {
      if (a.hasAttribute('maxlength') && !a.hasAttribute('no-counter')) {
        a.removeEventListener('keyup', this.textAreaKeyUpListener)
      }
    })
    this.removeEventListener('change', this.changeListener)
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
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.root.querySelector('span.counter')
  }

  /**
   * renders the css
   *
   * @return {Promise<void| [] | unknown[]>}
   */
  renderCSS () {
    const buttonPromises = []
    // @ts-ignore
    if (!customElements.get('a-button')) customElements.define('a-button', Button)
    const button = new Button({ namespace: 'button-primary-' })
    button.hidden = true
    this.html = button
    // @ts-ignore
    buttonPromises.push(button.renderCssPromise.then(styles => styles.forEach(style => {
      if (!this.hasShadowRoot) style.styleNode.textContent = style.styleNode.textContent.replace(/:host/g, this.tagName)
      this.html = style.styleNode
    })))
    // @ts-ignore
    this.css = button.css.replace(/\sbutton/g, ' input[type=submit]').replace(/\s#label/g, ' input[type=submit]')
    button.remove()
    const buttonSecondary = new Button({ namespace: 'button-secondary-' })
    buttonSecondary.hidden = true
    this.html = buttonSecondary
    // @ts-ignore
    buttonPromises.push(buttonSecondary.renderCssPromise.then(styles => styles.forEach(style => {
      if (!this.hasShadowRoot) style.styleNode.textContent = style.styleNode.textContent.replace(/:host/g, this.tagName)
      this.html = style.styleNode
    })))
    // make browser default file button look nicer
    buttonSecondary.css = /* css */ `
      @supports(selector(:has(> input[type=file]))) {
        *:has(> input[type=file]) {
          display: inline-grid !important;
          padding: 0;
        }
        *:has(> input[type=file]) > * {
          grid-column: 1;
          grid-row: 1;
          padding: var(--padding, calc(0.75em - var(--border-width, 0px)) calc(1.5em - var(--border-width, 0px)));
        }
        *:has(> input[type=file]) > *:has(+ input[type=file]) {
          display: flex;
          pointer-events: none;
          justify-content: center;
        }
        input[type=file] {
          cursor: pointer;
          opacity: 0 !important;
          height: 100%;
          width: 100%;
        }
      }
      
    `
    // use the below without namespacing
    this.css = /* css */`
      *:has(> input[type=file]) {
        --color: var(--button-secondary-color);
        --color-hover: var(--button-secondary-color-hover);
      }
    `
    this.css = buttonSecondary.css.replace(/\sbutton/g, ' *:has(> input[type=file])').replace(/\s#label/g, ' *:has(> input[type=file])')
    buttonSecondary.remove()
    this.css = /* css */`
      :host {
        width:100%;
      }
      :host .has-files:after {
        content: 'x';
        position: absolute;
        top: 0.1em;
        right: 0.3em;
        line-height: 1em;
        pointer-events: none;
      }
      .validation-errors {
        background-color: var(--m-orange-100);
        color: var(--color-error);
        padding: 1em;
        margin-bottom: var(--content-spacing);
      }
      .validation-errors ul{
        list-style: none;
        text-align:center;
        padding:0;
        margin:0;
      }
      .form-radio-group {
        display: flex;
        gap: var(--radio-group-gap, 2rem);
      }
      .form-radio-group span {
        display: flex;
        align-items: center;
        gap: var(--radio-group-span-gap, 0.5rem);
      }
      .form-radio-group label{
        display: flex;
      }
      .form-radio-group label input{
        margin: 0 0.25em 0 0;
        cursor: pointer;
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
        background-color:#E0E0E0;
        border: 1px solid #E0E0E0;
      }
      ${this.getInputFieldsWithText()}, ${this.getInputFieldsWithControl()} {
        font-family: var(--font-family, inherit);
        border-radius: var(--border-radius, 0.5em);
        background-color: var(--background-color, transparent);
        box-sizing: border-box;
        border: 1px solid var(--m-gray-400);
        color: var(--color);
        padding: 0.625em;
        font-size: var(--font-size);
        width: 100%;
      }
      ${this.getInputFieldsWithText()} {
        outline: none;
      }
      ${this.getInputFieldsWithText('::placeholder')} {
        color: var(--placeholder-color, var(--m-gray-600));
        opacity: var(--placeholder-opacity, 1);
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
      :host form > div, :host form > section > div, :host form > div > section > div, .umbraco-forms-field, :host form > ks-m-checkout-additional-input > div > div {
        padding-bottom: var(--content-spacing);
      }
      :host form > div > *:has(+ section:not([hidden])) {
        margin-bottom: var(--content-spacing);
      }
      .umbraco-forms-field.checkbox .umbraco-forms-field-wrapper {
        display:var(--checkbox-display, flex);
      }
      .umbraco-forms-field.checkbox .umbraco-forms-field-wrapper label {
        padding: var(--checkbox-label-padding, 0 0 0 10px);
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
      input[type=checkbox] {
        min-width: 1.5em;
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
      input[type="submit"] {
          padding: 0.75em 1.5em;
          float:left;
          margin: var(--input-type-submit-margin, auto);
      }
      input[type="checkbox"] {
        cursor: pointer;
      }

      @media only screen and (max-width: _max-width_) {
        ${this.getInputFieldsWithText()} {
          font-size: var(--input-font-size-mobile, var(--font-size-mobile, 16px));
        }
        ${this.getInputFieldsWithText()}, ${this.getInputFieldsWithControl()} {
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
      }

      datalist {
        position: relative; 
        border: 1px solid var(--m-gray-400);
        border-top: none;
        width: 100%;
        max-height: 10em;
        overflow-y: auto;
      }
      
      :host option {
        background-color: var(--background-color);
        padding: 0.3em var(--content-spacing, 0.3em) 0.3em var(--content-spacing, 0.3em) ;
        cursor: pointer;
      }
      :host option:hover, :host .active {
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
      :host .two-column-align-bottom {
        display: flex;
        gap: var(--content-spacing, 1em);
        flex-wrap: nowrap;
      }
      :host .two-column-align-bottom > * {
        align-items: baseline;
        display: flex;
        flex: 1;
        flex-direction: column;
        justify-content: end;
      }
      :host .two-column-align-bottom input[type="submit"] {
        margin: 0;
      }
      @media only screen and (max-width: _max-width_) {
        :host .two-column-align-bottom {
          flex-direction: column
        }
        :host form > div, :host form > section > div, :host form > div > section > div, .umbraco-forms-field {
          padding-bottom: var(--content-spacing-mobile, var(--content-spacing));
        }
        :host form > div > *:has(+ section:not([hidden])) {
          margin-bottom: var(--content-spacing-mobile, var(--content-spacing));
        }
        .validation-errors {
          margin-bottom: var(--content-spacing-mobile, var(--content-spacing));
        }
        .checkbox > label, .checkbox > .help-block, .checkboxlist > label, .checkboxlist > .help-block, .radiobutton > label, .radiobutton > .help-block, .radiobuttonlist > label, .radiobuttonlist > .help-block {
          padding-left: var(--content-spacing-mobile, var(--content-spacing));
        }
        .checkboxlist img {
          padding: 0 var(--content-spacing-mobile, var(--content-spacing));
        }
        :host option {
          padding: 0.3em var(--content-spacing-mobile, var(--content-spacing, 0.3em)) 0.3em var(--content-spacing-mobile, var(--content-spacing, 0.3em)) ;
        }
        :host .two-column-align-bottom {
          gap: var(--content-spacing-mobile, var(--content-spacing, 1em));
        }
      }
    `
    return (this.renderCssPromise = Promise.all([this.fetchTemplate(), ...buttonPromises]))
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
        // @ts-ignore
        resolve(self.grecaptcha) // eslint-disable-line
      } else {
        const vendorsMainScript = document.createElement('script')
        vendorsMainScript.setAttribute('type', 'text/javascript')
        vendorsMainScript.setAttribute('async', '')
        vendorsMainScript.setAttribute('src', `https://www.google.com/recaptcha/api.js?render=${this.getAttribute('site-key')}`)
        vendorsMainScript.onload = () => {
          // @ts-ignore
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
