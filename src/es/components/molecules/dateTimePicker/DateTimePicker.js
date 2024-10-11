// @ts-check
// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class DateTimePicker
 * @type {CustomElementConstructor}
 * @attribute {
 * }
 */

export default class DateTimePicker extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    // TODO create warning if picker-type doesn't exist
    this.pickerType = this.getAttribute("picker-type")
    // TODO create warning if picker-format doesn't exist
    this.pickerFormat = this.getAttribute("picker-format").toLowerCase() ?? 'dd/mm/yyyy'
    this.pickerFormatChar = "/"
    this.splittedFormat = this.getSplittedFormat(this.pickerFormat)
    this.customValidationObj = this.getAttribute("custom-validation-obj") || {
      d: {
        max: 31,
        min: 1,
        isValid: false,
        errorMessage: 'Please add a valid day, between 1 and 31.'
      },
      m: {
        max: 12,
        min: 1,
        isValid: false,
        errorMessage: 'Please add a valid month, between 1 and 12.'
      },
      y: {
        max: 2010,
        min: 1900,
        isValid: false,
        errorMessage: 'Please add a valid year, between 1900 and 2010.'
      },
      isTouched: false,
      isValid: false,
      errorMessage: 'Please add a valid format as dd/mm/yyyy'
    }

    console.log("fpattern", this.pickerFormatChar, this.pickerFormatChar.charCodeAt(0))

    this.formAsPattern = (event) => {
      this.currentInput = event.data
      this.currentValue = this.inputField.value
      this.currentSelectionStart = this.inputField.selectionStart
      this.currentValueLength = this.currentValue.length
      this.checkNextChar()

      // if remove
      if (this.currentInput === null) {
        if (this.pickerFormat[this.currentSelectionStart] === this.pickerFormatChar && this.currentValue.length === this.currentSelectionStart) {
          this.inputField.value = this.currentValue
        }
        else if (this.pickerFormat[this.currentSelectionStart] === this.pickerFormatChar && this.currentValue.length > this.currentSelectionStart) {
          this.inputField.value = this.currentValue.slice(0, this.currentSelectionStart) + this.pickerFormatChar + this.currentValue.slice(this.currentSelectionStart)
          this.inputField.setSelectionRange(this.currentSelectionStart, this.currentSelectionStart)
        }
      }
    }

    this.setNotAllowedKeys = (event) => {
      const keyCode = event.which
      if (event.key == this.pickerFormatChar) { }
      else if (keyCode == 32) {
        event.preventDefault()
        return false
      } else if (keyCode == 8 || keyCode == 37 || keyCode == 39 || keyCode == 46) {
      } else if (keyCode < 48 || keyCode > 57) {
        event.preventDefault()
        return false
      }
    }

    this.customValidation = (event) => {
      console.log("event validation", event)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.inputField) {
      this.inputField.addEventListener('keydown', this.setNotAllowedKeys)
      this.inputField.addEventListener('input', this.formAsPattern)
      this.inputField.addEventListener('change', this.customValidation)
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.inputField) {
      this.inputField.removeEventListener('keydown', this.setNotAllowedKeys)
      this.inputField.removeEventListener('input', this.formAsPattern)
      this.inputField.removeEventListener('change', this.customValidation)
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.root.querySelector('input')
  }

  /**
   * renders the m-multi-level-navigation css
   *
   * @return {Promise<void>|void}
   */
  renderCSS() {
    this.css = /* css */`
    :host { }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate() {
    /** @type {import('../../prototypes/Shadow.js').fetchCSSParams[]} */
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
      case 'date-time-picker-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--date-time-picker-default-',
            flags: 'g',
            replacement: '--date-time-picker-default-'
          }]
        }, ...styles], false)
      default:
        return Promise.resolve()
    }
  }

  /**
   *
   *
   * @return {Promise<void>|void}
   */
  renderHTML() {
    let inputField = document.createElement('input')
    if (this.pickerFormat) inputField.setAttribute('maxlength', `${this.pickerFormat.length}`)
    if (this.pickerType === 'birth') {
      this.html = inputField
    } else {

    }
    return
  }

  getSplittedFormat = (format) => {
    if (format.includes('/')) return this.pickerFormatChar = '/', format.split('/')
    if (format.includes('.')) return this.pickerFormatChar = '.', format.split('.')
    if (format.includes('-')) return this.pickerFormatChar = '-', format.split('-')
    return
  }

  checkNextChar() {
    if (this.pickerFormat[this.currentValueLength] && this.pickerFormat[this.currentValueLength] === this.pickerFormatChar) {
      this.inputField.value = this.inputField.value + this.pickerFormatChar
    }
  }

  get inputField() {
    return this.root.querySelector('input')
  }
}
