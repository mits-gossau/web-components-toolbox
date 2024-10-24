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
    this.isValidationFormElem = this.getAttribute("validation-form-usage") === 'true'
    if (this.isValidationFormElem) this.validationFormWrapper = this.getRootNode().host // console.log("hi", this.getRootNode().host.setValidity())
    // implementing into validation js
    this.pickerFormatChar = "/"
    this.formIndexes = {
      formatChar: Array(),
      d: Array(),
      m: Array(),
      y: Array()
    }
    this.splittedFormat = this.getSplittedFormat(this.pickerFormat)
    this.customValidationObj = this.getAttribute("custom-validation-obj") || {
      d: {
        max: 31,
        min: 1,
        errorMessage: 'Please add a valid day, between 1 and 31.'
      },
      m: {
        max: 12,
        min: 1,
        errorMessage: 'Please add a valid month, between 1 and 12.'
      },
      y: {
        max: 2010,
        min: 1900,
        errorMessage: 'Please add a valid year, between 1900 and 2010.'
      },
      errorMessage: 'Please add a valid format as dd/mm/yyyy'
    }
    this.setFormIndexes()

    this.formAsPattern = (event) => {
      this.customValidationObj.inTouched = true
      this.currentInput = event.data
      this.currentValue = this.inputField.value
      this.currentSelectionStart = this.inputField.selectionStart
      this.currentValueLength = this.currentValue.length

      if (this.currentInput !== null) this.checkNextChar()
      if (this.currentInput !== null && this.currentInput !== this.pickerFormatChar && this.pickerFormat.split('')[this.currentValue.length - 1] === this.pickerFormatChar) {
        this.inputField.value = this.currentValue.slice(0, -1) + this.pickerFormatChar + this.currentValue.slice(-1)
      }

      // if remove
      if (this.currentInput === null) {
        if (this.pickerFormat[this.currentSelectionStart] === this.pickerFormatChar && this.currentValue.length === this.currentSelectionStart) {
          this.inputField.value = this.currentValue
          // this.inputField.value = this.currentValue.slice(0, this.currentSelectionStart) + this.pickerFormatChar + this.currentValue.slice(this.currentSelectionStart)
          // this.inputField.setSelectionRange(this.currentSelectionStart, this.currentSelectionStart)
        }
        else if (this.pickerFormat[this.currentSelectionStart] === this.pickerFormatChar && this.currentValue.length > this.currentSelectionStart) {
          this.inputField.value = this.currentValue.slice(0, this.currentSelectionStart) + this.pickerFormatChar + this.currentValue.slice(this.currentSelectionStart)
          this.inputField.setSelectionRange(this.currentSelectionStart, this.currentSelectionStart)
        }
      } else if (this.currentInput === this.pickerFormatChar) {
        if (this.pickerFormat[this.currentSelectionStart - 1] === 'd') {
          this.formatInput('d')
        }
        else if (this.pickerFormat[this.currentSelectionStart - 1] === 'm') {
          this.formatInput('m')
        }
        else if (this.pickerFormat[this.currentSelectionStart - 1] === 'y') {
          this.formatInput('y')
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
      if (this.customValidationObj.inTouched) {
        if (this.inputField.value.length > this.formIndexes['d'][0]) this.addZeroIfNeeded('d')
        if (this.inputField.value.length > this.formIndexes['m'][0]) this.addZeroIfNeeded('m')
        if (this.inputField.value.length > this.formIndexes['y'][0]) this.addZeroIfNeeded('y')

        let mainValid = this.customMainValidator()
        let dayValid = this.customDateValidator('d', +this.customValidationObj.d.min, +this.customValidationObj.d.max)
        let monthValid = this.customDateValidator('m', +this.customValidationObj.m.min, +this.customValidationObj.m.max)
        let yearValid = this.customDateValidator('y', +this.customValidationObj.y.min, +this.customValidationObj.y.max)

        if (this.root.querySelector('div.error-message-wrapper')) {
          this.classList.remove('error')
          this.root.removeChild(this.root.querySelector('div.error-message-wrapper'))
        }

        let errorMessageWrapper = document.createElement('div')
        errorMessageWrapper.classList.add('error-message-wrapper')
        let errorMessageText = document.createElement('p')
        errorMessageText.classList.add('error-message-text')
        errorMessageWrapper.appendChild(errorMessageText)

        if (!mainValid) {
          this.classList.add('error')
          errorMessageText.textContent = this.customValidationObj.errorMessage
        } else if (!dayValid) {
          this.classList.add('error')
          errorMessageText.textContent = this.customValidationObj.d.errorMessage
        } else if (!monthValid) {
          this.classList.add('error')
          errorMessageText.textContent = this.customValidationObj.m.errorMessage

        } else if (!yearValid) {
          this.classList.add('error')
          errorMessageText.textContent = this.customValidationObj.y.errorMessage

        } else {
          this.classList.remove('error')
          errorMessageWrapper.removeChild(errorMessageText)
        }
        this.root.appendChild(errorMessageWrapper)
      }
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
    if (this.pickerFormat) {
      inputField.setAttribute('maxlength', `${this.pickerFormat.length}`)
      inputField.setAttribute('placeholder', `${this.getAttribute("placeholder")}`)

    }
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

  checkNextChar(formatCharTyped) {
    if (this.pickerFormat[this.currentValueLength] && this.pickerFormat[this.currentValueLength] === this.pickerFormatChar) {
      this.inputField.value = this.inputField.value + this.pickerFormatChar
    }
    if (formatCharTyped && this.pickerFormat[this.currentValueLength + 1] === this.pickerFormatChar) {
      this.inputField.value = this.inputField.value + this.pickerFormatChar
    }
  }

  setFormIndexes() {
    this.pickerFormat.split('').forEach((char, index) => {
      if (char === 'd') this.formIndexes.d.push(index)
      else if (char === 'm') this.formIndexes.m.push(index)
      else if (char === 'y') this.formIndexes.y.push(index)
      else if (char === this.pickerFormatChar) this.formIndexes.formatChar.push(index)

    })
  }

  formatInput(dateType) {
    this.currentValue.split('').forEach((char, index) => {
      if (this.formIndexes[dateType].includes(index)) {
        if (char === this.pickerFormatChar) {
          let currentDateTypeValue = Array()
          this.formIndexes[dateType].forEach(ind => {
            if (this.currentValue[ind] === this.pickerFormatChar || !this.currentValue[ind]) {
              currentDateTypeValue.unshift('0')
            } else {
              currentDateTypeValue.unshift(this.currentValue[ind])
            }
          })
          let inputFieldValue = this.currentValue.split('')
          this.formIndexes[dateType].forEach((ind, i) => {
            inputFieldValue[ind] = currentDateTypeValue[i]
          })
          this.inputField.value = inputFieldValue.join('')
          this.checkNextChar(true)
        }
      }
    })
  }

  customMainValidator() {
    let mainValidation = true
    this.formIndexes.formatChar.forEach(ind => {
      if (this.inputField.value[ind] !== this.pickerFormatChar) mainValidation = false
    })
    if (this.inputField.value.length !== this.pickerFormat.length) mainValidation = false
    return mainValidation
  }

  customDateValidator(type, min, max) {
    let currentValueString = ''
    let currentValueNumber = 0

    this.formIndexes[type].forEach(ind => {
      if (this.inputField.value[ind]) currentValueString = currentValueString + this.inputField.value[ind]
    })

    currentValueNumber = +currentValueString || 0

    if (min <= currentValueNumber && currentValueNumber <= max) return true
    else return false
  }

  addZeroIfNeeded(dateType) {
    let currentDateUnit = this.inputField.value.slice(this.formIndexes[dateType][0], this.formIndexes[dateType][this.formIndexes[dateType].length - 1] + 1)
    let newCurrentDateUnit = currentDateUnit.split('').filter(el => el !== this.pickerFormatChar)

    if (newCurrentDateUnit.length !== this.formIndexes[dateType].length) {
      let lengthDiff = this.formIndexes[dateType].length - newCurrentDateUnit.length
      for (let i = 0; i < lengthDiff; i++) {
        if (dateType === 'y') newCurrentDateUnit.push('0')
        else newCurrentDateUnit.unshift('0')
      }
      this.inputField.value = this.inputField.value.slice(0, this.formIndexes[dateType][0]) + newCurrentDateUnit.join('') + this.inputField.value.slice(this.formIndexes[dateType][this.formIndexes[dateType].length - 1])
      if (this.pickerFormat[this.inputField.value.length] === this.pickerFormatChar) {
        this.inputField.value = this.inputField.value + this.pickerFormatChar
      }
    }
  }

  get inputField() {
    return this.root.querySelector('input')
  }
}
