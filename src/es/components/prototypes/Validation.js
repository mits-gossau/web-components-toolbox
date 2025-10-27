// @ts-check
import { Shadow } from './Shadow.js'

/* global customElements */

export const Validation = (ChosenClass = Shadow()) => class Validation extends ChosenClass {
  /**
   * Creates an instance of Shadow. The constructor will be called for every custom element using this class when initially created.
   * Validation is a helper used for frontend-side validation. It facilitates the addition of customized error messages at customized HTML locations and times, such as upon input or change.
   *
   * @param {{ValidationInit: {level?: number|undefined, selector?: string|undefined}|undefined}} options
   * @param {*} args
   */
  constructor(options = { ValidationInit: undefined }, ...args) {
    super(options, ...args)

    this.validationValues = {}

    this.validationChangeEventListener = (event) => {
      const inputField = event.currentTarget
      const inputFieldName = inputField.getAttribute('name')

      if (event.type === 'change' && this.validationValues[inputFieldName]['day'] && this.validationValues[inputFieldName]['month'] && this.validationValues[inputFieldName]['year'] && inputField.hasAttribute('node-index')) {
        let dateInputNodeIndex = inputField.getAttribute('node-index')
        let dateInputCurrentFormatCharLength = this.getInputFieldByNodeIndex(dateInputNodeIndex)?.value.split('').filter(char => char === this[`dateInputFormatChar${dateInputNodeIndex}`]).length
        let dateInputOldFormatCharLength = this[`oldDateInputValue${dateInputNodeIndex}`]?.split('').filter(char => char === this[`dateInputFormatChar${dateInputNodeIndex}`]).length

        if (this[`isDateInputValueRemoved${dateInputNodeIndex}`] && dateInputOldFormatCharLength > 0 && dateInputCurrentFormatCharLength !== dateInputOldFormatCharLength) {
          this.getInputFieldByNodeIndex(dateInputNodeIndex).value = this.setFormatOfDateInput(this.getInputFieldByNodeIndex(dateInputNodeIndex).value, this[`oldDateInputValue${dateInputNodeIndex}`], dateInputNodeIndex, inputFieldName)
        }

        if (inputField.value.length > this[`dateInputFormIndexes${dateInputNodeIndex}`]['day'][0]) this.dateInputAddZeroIfNeeded('day', dateInputNodeIndex)
        if (inputField.value.length > this[`dateInputFormIndexes${dateInputNodeIndex}`]['month'][0]) this.dateInputAddZeroIfNeeded('month', dateInputNodeIndex)
        if (inputField.value.length > this[`dateInputFormIndexes${dateInputNodeIndex}`]['year'][0]) this.dateInputAddZeroIfNeeded('year', dateInputNodeIndex)

        this[`oldDateInputValue${dateInputNodeIndex}`] = this.getInputFieldByNodeIndex(dateInputNodeIndex).value
      }

      if (event.type === 'input' && this.validationValues[inputFieldName]['day'] && this.validationValues[inputFieldName]['month'] && this.validationValues[inputFieldName]['year'] && inputField.hasAttribute('node-index')) {
        let dateInputNodeIndex = inputField.getAttribute('node-index')
        let currentValueAsStringArray = this.getInputFieldByNodeIndex(dateInputNodeIndex).value.split(this[`dateInputFormatChar${dateInputNodeIndex}`]).filter(char => char !== this[`dateInputFormatChar${dateInputNodeIndex}`])
        if (currentValueAsStringArray[0] && currentValueAsStringArray[0][0] > 3 && this.getInputFieldByNodeIndex(dateInputNodeIndex).value.length - 1 < this[`dateInputFormIndexes${dateInputNodeIndex}`]['day'][1]) {
          currentValueAsStringArray[0] = '0' + currentValueAsStringArray[0] + this[`dateInputFormatChar${dateInputNodeIndex}`]
        }
        if (currentValueAsStringArray[1] && currentValueAsStringArray[1][0] > 1 && this.getInputFieldByNodeIndex(dateInputNodeIndex).value.length - 1 < this[`dateInputFormIndexes${dateInputNodeIndex}`]['month'][1]) {
          currentValueAsStringArray[1] = '0' + currentValueAsStringArray[1] + this[`dateInputFormatChar${dateInputNodeIndex}`]
        }
        this.getInputFieldByNodeIndex(dateInputNodeIndex).value = currentValueAsStringArray.join(this[`dateInputFormatChar${dateInputNodeIndex}`])
      }
      this.validator(this.validationValues[inputFieldName], inputField, inputFieldName)
      if (this.realTimeSubmitButton) {
        this.checkIfFormValid()
      }
    }

    this.dateInputFormatterEventListener = (event) => {
      let inputField = event.currentTarget
      let currentDateInputNodeIndex = inputField.getAttribute('node-index')
      let currentValueAsStringArray = this.getInputFieldByNodeIndex(currentDateInputNodeIndex).value.split(this[`dateInputFormatChar${currentDateInputNodeIndex}`]).filter(char => char !== this[`dateInputFormatChar${currentDateInputNodeIndex}`])

      if (currentValueAsStringArray[0] && currentValueAsStringArray[0][0] > 3 && this.getInputFieldByNodeIndex(currentDateInputNodeIndex).value.length - 1 < this[`dateInputFormIndexes${currentDateInputNodeIndex}`]['day'][1]) {
        currentValueAsStringArray[0] = '0' + currentValueAsStringArray[0]
      }

      if (currentValueAsStringArray[1] && currentValueAsStringArray[1][0] > 1 && this.getInputFieldByNodeIndex(currentDateInputNodeIndex).value.length - 1 < this[`dateInputFormIndexes${currentDateInputNodeIndex}`]['month'][1]) {
        currentValueAsStringArray[1] = '0' + currentValueAsStringArray[1]
      }

      currentValueAsStringArray = currentValueAsStringArray.filter(char => char && char !== this[`dateInputFormatChar${currentDateInputNodeIndex}`])
      this.getInputFieldByNodeIndex(currentDateInputNodeIndex).value = currentValueAsStringArray.join(this[`dateInputFormatChar${currentDateInputNodeIndex}`])
    }

    this.dateInputValidationChangeEventListener = (event) => {
      const inputField = event.currentTarget
      const currentDateInputNodeIndex = inputField.getAttribute('node-index')
      const currentValidatedInputHasNewErrorReferencePoint = inputField.getAttribute('error-message-reference-point-changed') === 'true'
      const currentValidatedInputErrorTextWrapper = inputField.errorTextWrapper ? inputField.errorTextWrapper : currentValidatedInputHasNewErrorReferencePoint ? inputField.closest('[new-error-message-reference-point="true"]').parentElement.querySelector('div.custom-error-text') : inputField.parentElement.querySelector('div.custom-error-text')
      const errorMessages = Array.from(currentValidatedInputErrorTextWrapper.querySelectorAll('[error-text-id]'))
      const activeErrorTextIndex = errorMessages?.findIndex(errorText => !errorText.hasAttribute('hidden'))
      const currentErrorMessage = errorMessages[activeErrorTextIndex]
      const currentErrorMessageId = currentErrorMessage?.getAttribute('error-text-id')

      errorMessages[activeErrorTextIndex]?.setAttribute('hidden', true)

      if (this[`dateInputFormIndexes${currentDateInputNodeIndex}`][currentErrorMessageId] && inputField.value.length > this[`dateInputFormIndexes${currentDateInputNodeIndex}`][currentErrorMessageId][0]) {
        errorMessages[activeErrorTextIndex].removeAttribute('hidden')
      }
    }

    this.validationPatternInputEventListener = (event) => {
      const inputField = event.currentTarget
      const maskPattern = this.validationValues[event.currentTarget.getAttribute('name')].pattern['mask-value']
      const cursorPosition = event.target.selectionStart
      const isBackspace = (event?.data == null)
      const inputValue = inputField.value
      const newValue = this.applyMask(inputValue, maskPattern, isBackspace, cursorPosition)

      if (newValue !== inputValue) {
        event.currentTarget.value = newValue
      } else {
        event.preventDefault()
      }
    }

    this.validationDateInputPatternEventListener = (event) => {
      const currentDateInputIndex = event.currentTarget.getAttribute('node-index')
      this[`currentDateInput${currentDateInputIndex}`] = event.data
      this[`currentDateInputValue${currentDateInputIndex}`] = event.currentTarget.value
      this[`currentDateInputSelectionStart${currentDateInputIndex}`] = event.currentTarget.selectionStart
      this[`currentDateInputValueLength${currentDateInputIndex}`] = this[`currentDateInputValue${currentDateInputIndex}`].length
      this[`isDateInputValueRemoved${currentDateInputIndex}`] = false

      if (this[`currentDateInput${currentDateInputIndex}`] !== null) this.checkDateInputNextChar(currentDateInputIndex)
      if (this[`currentDateInput${currentDateInputIndex}`] !== null && this[`currentDateInput${currentDateInputIndex}`] !== this[`dateInputFormatChar${currentDateInputIndex}`] && this[`dateFormat${currentDateInputIndex}`].split('')[this[`currentDateInputValue${currentDateInputIndex}`].length - 1] === this[`dateInputFormatChar${currentDateInputIndex}`]) {
        this.getInputFieldByNodeIndex(currentDateInputIndex).value = this[`currentDateInputValue${currentDateInputIndex}`].slice(0, -1) + this[`dateInputFormatChar${currentDateInputIndex}`] + this[`currentDateInputValue${currentDateInputIndex}`].slice(-1)
      }

      // if remove
      if (this[`currentDateInput${currentDateInputIndex}`] === null) {
        this[`isDateInputValueRemoved${currentDateInputIndex}`] = true
        if (this[`dateFormat${currentDateInputIndex}`][this[`currentDateInputSelectionStart${currentDateInputIndex}`]] === this[`dateInputFormatChar${currentDateInputIndex}`] && this[`currentDateInputValue${currentDateInputIndex}`].length === this[`currentDateInputSelectionStart${currentDateInputIndex}`]) {
          this.getInputFieldByNodeIndex(currentDateInputIndex).value = this[`currentDateInputValue${currentDateInputIndex}`]
        }
        else if (this[`dateFormat${currentDateInputIndex}`][this[`currentDateInputSelectionStart${currentDateInputIndex}`]] === this[`dateInputFormatChar${currentDateInputIndex}`] && this[`currentDateInputValue${currentDateInputIndex}`].length > this[`currentDateInputSelectionStart${currentDateInputIndex}`]) {
          this.getInputFieldByNodeIndex(currentDateInputIndex).value = this[`currentDateInputValue${currentDateInputIndex}`].slice(0, this[`currentDateInputSelectionStart${currentDateInputIndex}`]) + this[`dateInputFormatChar${currentDateInputIndex}`] + this[`currentDateInputValue${currentDateInputIndex}`].slice(this[`currentDateInputSelectionStart${currentDateInputIndex}`])
          this.getInputFieldByNodeIndex(currentDateInputIndex).setSelectionRange(this[`currentDateInputSelectionStart${currentDateInputIndex}`], this[`currentDateInputSelectionStart${currentDateInputIndex}`])
        }
      } else if (this[`currentDateInput${currentDateInputIndex}`] === this[`dateInputFormatChar${currentDateInputIndex}`]) {
        if (this[`dateFormat${currentDateInputIndex}`][this[`currentDateInputSelectionStart${currentDateInputIndex}`] - 1] === 'd') {
          this.formatDateInput(currentDateInputIndex, 'day')
        }
        else if (this[`dateFormat${currentDateInputIndex}`][this[`currentDateInputSelectionStart${currentDateInputIndex}`] - 1] === 'm') {
          this.formatDateInput(currentDateInputIndex, 'month')
        }
        else if (this[`dateFormat${currentDateInputIndex}`][this[`currentDateInputSelectionStart${currentDateInputIndex}`] - 1] === 'y') {
          this.formatDateInput(currentDateInputIndex, 'year')
        }
      }
    }

    this.applyMask = (value, maskPattern, isBackspace, cursorPosition) => {
      let result = ''
      let valueIndex = 0
      for (let i = 0; i < maskPattern.length && valueIndex < value.length; i++) {
        const maskPatternChar = maskPattern[i]
        const nextMaskPatternChar = maskPattern[i + 1]
        const valueChar = value[valueIndex]

        if (maskPatternChar === '#') {
          result += valueChar || ''
          valueIndex++
        } else if (maskPatternChar === 'N') {
          if (+valueChar >= 0 && +valueChar <= 9) {
            result += valueChar
          }
          valueIndex++
        } else if (maskPatternChar === 'C') {
          if (/[A-Za-z]/.test(valueChar)) {
            result += valueChar.toUpperCase()
          }
          valueIndex++
        } else if (maskPatternChar === 'L') {
          if (/[A-Za-z]/.test(valueChar)) {
            result += valueChar.toLowerCase()
          }
          valueIndex++
        }
        if (!isBackspace && nextMaskPatternChar && this.isCharSpecial(nextMaskPatternChar)) {
          result += nextMaskPatternChar
          if (result.length === value.length) {
            result += value.slice(-1)
          }
          valueIndex++
        }
        if (isBackspace && this.isCharSpecial(maskPattern[cursorPosition])) {
          if (cursorPosition < value.length) {
            result = value.slice(0, cursorPosition) + maskPattern[cursorPosition] + value.slice(cursorPosition)
          }
          if (cursorPosition === value.length) {
            result = value
          }
          valueIndex++
        }
        if (isBackspace && !this.isCharSpecial(maskPattern[cursorPosition])) {
          result = value
        }
      }
      return result
    }

    this.isCharSpecial = character => {
      if (character !== '#' && character !== 'C' && character !== 'N' && character !== 'L') {
        return true
      }
      return false
    }

    this.submitFormValidation = (event) => {
      Object.keys(this.validationValues).forEach(key => {
        this.validationValues[key].isTouched = true
      })

      this.allValidationNodes?.forEach(node => {
        const inputFieldName = node.getAttribute('name')
        if (inputFieldName) this.validator(this.validationValues[inputFieldName], node, inputFieldName)
      })
      if (this.root.querySelector('form').querySelector('.has-error')) {
        this.scrollToFirstError()
        event.preventDefault()
        event.stopPropagation()
      }
    }

    this.baseInputChangeListener = (event) => {
      const shouldIgnoreFirstSpace = event.currentTarget.hasAttribute('ignore-first-space')
      let inputFieldSplittedValue = event.currentTarget.value.split('')
      const isFirstCharacterSpace = inputFieldSplittedValue[0] === ' '
      if (shouldIgnoreFirstSpace && isFirstCharacterSpace) {
        inputFieldSplittedValue = inputFieldSplittedValue.slice(0, -1)
        event.currentTarget.value = inputFieldSplittedValue.join('')
      }

      const inputFieldName = event.currentTarget.getAttribute('name')
      this.validationValues[inputFieldName].isTouched = true
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback()
    this.shouldValidateOnInitiate = this.root.querySelector('form').getAttribute('validate-on-initiate') === 'true'
    this.realTimeSubmitButton = this.root.querySelector('form').getAttribute('real-time-submit-button') === 'true'

    this.allValidationNodes = Array.from(this.form.querySelectorAll('[data-m-v-rules]'))
    if (!this.hasAttribute('no-validation-error-css')) this.renderValidationCSS()

    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes.forEach((node, index) => {
        const currentNodeHasNewErrorReferencePoint = node.getAttribute('error-message-reference-point-changed') === 'true'
        const errorTextWrapper = node.hasAttribute('error-text-tag-name') ? document.createElement(node.getAttribute('error-text-tag-name')) : document.createElement('div')
        const nodeHasLiveValidation = node.getAttribute('live-input-validation') === 'true'
        errorTextWrapper.classList.add('custom-error-text')
        let errorMessageContainer = node.getAttribute('type') === 'radio' ? node.parentElement : node
        if (currentNodeHasNewErrorReferencePoint) {
          let errorMessageContainerSelect = node.parentElement.querySelector('[new-error-message-reference-point="true"]')
          if (!errorMessageContainerSelect) errorMessageContainerSelect = node.closest('[new-error-message-reference-point="true"]')
          if (!errorMessageContainerSelect) errorMessageContainerSelect = Validation.walksUpDomQuerySelector(node, '[new-error-message-reference-point="true"]')
          if (errorMessageContainerSelect) errorMessageContainer = errorMessageContainerSelect
        }
        errorMessageContainer.after(errorTextWrapper)
        node.errorTextWrapper = errorTextWrapper

        if (nodeHasLiveValidation) {
          // Keep this ranking of event-binding; it's important to trigger this function earlier than the other ones.
          if (node.hasAttribute('m-date-input')) node.addEventListener('input', this.validationDateInputPatternEventListener)

          node.addEventListener('input', this.validationChangeEventListener)

          if (node.hasAttribute('m-date-input')) {
            node.addEventListener('input', this.dateInputValidationChangeEventListener)
            node.addEventListener('change', this.validationChangeEventListener)
          }

        } else {
          node.addEventListener('change', this.validationChangeEventListener)
          node.addEventListener('input', this.dateInputFormatterEventListener)
        }
        node.addEventListener('input', this.baseInputChangeListener)
        // IMPORTANT name attribute has to be unique and always available
        if (node.hasAttribute('name')) {
          if (!Object.prototype.hasOwnProperty.call(this.validationValues, node.getAttribute('name'))) {
            const parsedRules = JSON.parse(node.getAttribute('data-m-v-rules'))
            Object.keys(parsedRules).forEach(key => {
              this.validationValues[node.getAttribute('name')] = this.validationValues[node.getAttribute('name')] ? Object.assign(this.validationValues[node.getAttribute('name')], { isTouched: false }) : {}
              this.validationValues[node.getAttribute('name')][key] = Object.assign(parsedRules[key], { isValid: false })
              if (this.validationValues[node.getAttribute('name')].pattern && Object.prototype.hasOwnProperty.call(this.validationValues[node.getAttribute('name')].pattern, 'mask-value')) {
                if (node.hasAttribute('m-date-input')) node.addEventListener('input', this.validationDateInputPatternEventListener)
                else node.addEventListener('input', this.validationPatternInputEventListener)
              }
            })
          }
        }
        if (node.hasAttribute('m-date-input') && !node.hasAttribute('node-index')) {
          node.setAttribute('node-index', index)
          this[`dateFormat${index}`] = this.validationValues[node.getAttribute('name')].pattern['mask-value'] ?? 'dd/mm/yyyy'

          if (this[`dateFormat${index}`].includes('/')) this[`dateInputFormatChar${index}`] = '/'
          else if (this[`dateFormat${index}`].includes('.')) this[`dateInputFormatChar${index}`] = '.'
          else if (this[`dateFormat${index}`].includes('-')) this[`dateInputFormatChar${index}`] = '-'

          this[`dateInputFormIndexes${index}`] = {
            formatChar: Array(),
            day: Array(),
            month: Array(),
            year: Array()
          }
          this.setDateInputFormIndexes(index)

          node.setAttribute('maxlength', `${this[`dateFormat${index}`].length}`)
          node.addEventListener('keydown', this.setDateInputAllowedKeys)
        }
      })
    }

    if (this.shouldValidateOnInitiate) {
      this.allValidationNodes.forEach(node => {
        const inputFieldName = node.getAttribute('name')
        if (inputFieldName) this.validator(this.validationValues[inputFieldName], node, inputFieldName)
      })
    }

    if (this.realTimeSubmitButton) {
      this.checkIfFormValid()
    }

    const addClickEventListenerOnSubmit = () => {
      if (!this.submitButton) this.submitButton = this.form.querySelector('[type="submit"]')

      if (this.submitButton) {
        this.submitButton.addEventListener('click', this.submitFormValidation)
      }
    }

    if ((this.submitButton = this.form.querySelector('[type="submit"]'))) {
      addClickEventListenerOnSubmit()
    } else {
      const undefinedElements = this.form.querySelectorAll(':not(:defined)')
      const promises = [...undefinedElements].map((button) =>
        customElements.whenDefined(button.localName)
      )

      // Wait for all the children to be upgraded
      Promise.all(promises).then(addClickEventListenerOnSubmit)
    }
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    // @ts-ignore
    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes?.forEach(node => {
        const nodeHasLiveValidation = node.getAttribute('live-input-validation') === 'true'
        if (nodeHasLiveValidation) {
          node.removeEventListener('input', this.validationChangeEventListener)
        } else {
          node.removeEventListener('change', this.validationChangeEventListener)
        }
        node.removeEventListener('input', this.baseInputChangeListener)
        // IMPORTANT name attribute has to be unique and always available
        if (node.hasAttribute('name')) {
          if (!Object.prototype.hasOwnProperty.call(this.validationValues, node.getAttribute('name'))) {
            const parsedRules = JSON.parse(node.getAttribute('data-m-v-rules'))
            // @ts-ignore
            Object.keys(parsedRules).forEach(key => {
              if (this.validationValues[node.getAttribute('name')].pattern && Object.prototype.hasOwnProperty.call(this.validationValues[node.getAttribute('name')].pattern, 'mask-value')) {
                node.removeEventListener('input', this.validationPatternInputEventListener)
              }
            })
          }
        }
        if (node.hasAttribute('m-date-input')) {
          node.removeEventListener('keydown', this.setDateInputAllowedKeys)
          node.removeEventListener('input', this.validationDateInputPatternEventListener)
        }
      })
    }
    if (this.submitButton) {
      this.submitButton.removeEventListener('click', this.submitFormValidation)
    }
  }

  validator(validationRules, currentInput, inputFieldName) {
    const validationNames = Object.keys(validationRules) || []
    validationNames.forEach(validationName => {
      if (validationName === 'required') {
        const isCheckboxInput = currentInput.getAttribute('type') === 'checkbox'
        if (isCheckboxInput) {
          this.setValidity(inputFieldName, validationName, currentInput.checked, 'checkbox')
        } else {
          // check if input is type radio
          const isRadioInput = currentInput.getAttribute('type') === 'radio'
          if (isRadioInput) {
            const radioInputName = currentInput.getAttribute('name')
            const radioInputs = this.form.querySelectorAll(`input[name="${radioInputName}"]`)
            const isRadioInputChecked = Array.from(radioInputs).some(radioInput => radioInput.checked)
            this.setValidity(radioInputName, validationName, isRadioInputChecked, 'radio')
          } else {
            const isRequiredValidationValid = !!(currentInput.value && currentInput.value.trim().length > 0)
            this.setValidity(inputFieldName, validationName, isRequiredValidationValid)
          }
        }
      }
      if (validationName === 'max-length') {
        const isMaxLengthValidationValid = !!(currentInput.value.trim().length < validationRules['max-length'].value)
        this.setValidity(inputFieldName, validationName, isMaxLengthValidationValid)
      }
      if (validationName === 'min-length') {
        const isMinLengthValidationValid = !!(currentInput.value.trim().length >= validationRules['min-length'].value)
        this.setValidity(inputFieldName, validationName, isMinLengthValidationValid)
      }
      if (validationName === 'email') {
        const isEmailValidationValid = !!(currentInput.value.match(
          // Special characters like periods, underscores, and hyphens are permitted in the local part, but they cannot be the first or last character in the local part, and they cannot appear consecutively (e.g., “..” or “__”).
          /^(?!.*__)(?!_)(?!.*_@)[^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        ))
        this.setValidity(inputFieldName, validationName, isEmailValidationValid)
      }
      if (validationName === 'max-number-value') {
        const isMaxNumberValueValidationValid = !!(+currentInput.value <= +validationRules['max-number-value'].value)
        this.setValidity(inputFieldName, validationName, isMaxNumberValueValidationValid)
      }
      if (validationName === 'min-number-value') {
        const isMinNumberValueValidationValid = !!(+currentInput.value >= +validationRules['min-number-value'].value)
        this.setValidity(inputFieldName, validationName, isMinNumberValueValidationValid)
      } if (validationName === 'min-max-number-value') {
        const minNumberValue = +validationRules['min-max-number-value'].value.split('-')[0]
        const maxNumberValue = +validationRules['min-max-number-value'].value.split('-')[1]
        const isMinMaxNumberValueValidationValid = !!((+currentInput.value > minNumberValue) && (+currentInput.value < maxNumberValue))
        this.setValidity(inputFieldName, validationName, isMinMaxNumberValueValidationValid)
      } if (validationName === 'pattern') {
        if (validationRules.pattern['pattern-value']) {
          let re = new RegExp(`${validationRules.pattern['pattern-value']}`)
          // If it's an email pattern validation, we set the regex to be case-insensitive using the 'i' flag.
          if (validationRules.email) re = new RegExp(`${validationRules.pattern['pattern-value']}`, 'i')
          const isPatternValueValidationValid = re.test(currentInput.value)
          this.setValidity(inputFieldName, validationName, isPatternValueValidationValid)
        }
        if (validationRules.pattern['mask-value'] && !validationRules['day']) {
          const maskValue = validationRules.pattern['mask-value']
          let currentInputValue = currentInput.value

          if (maskValue.length < currentInputValue.length) currentInputValue = currentInputValue.slice(0, -1)

          const isPatternMaskValueValidationValid = this.validationPatternEnd(inputFieldName, validationName, currentInputValue)
          this.setValidity(inputFieldName, validationName, isPatternMaskValueValidationValid)
        }
        if (validationRules.pattern['mask-value'] && validationRules['day']) {
          const currentFieldIndex = currentInput.getAttribute('node-index')
          const mainDateFormatValid = this.customMainDateFormatValidator(currentFieldIndex)
          this.setValidity(inputFieldName, validationName, mainDateFormatValid)
        }
        if (!currentInput.value && !validationRules.required) {
          this.setValidity(inputFieldName, validationName, true)
        }
      }
      if (validationName === 'min-date-value') {
        const isMinDateValidationValid = !!(new Date(currentInput.value) > new Date(validationRules['min-date-value'].value))
        this.setValidity(inputFieldName, validationName, isMinDateValidationValid)
      }
      if (validationName === 'max-date-value') {
        const isMaxDateValidationValid = !!(new Date(currentInput.value) < new Date(validationRules['max-date-value'].value))
        this.setValidity(inputFieldName, validationName, isMaxDateValidationValid)
      }
      if (validationName === 'day') {
        const currentFieldIndex = currentInput.getAttribute('node-index')
        const isDayValidationValid = this.customDateInputValidator('day', +validationRules['day'].min, +validationRules['day'].max, currentFieldIndex)
        this.setValidity(inputFieldName, validationName, isDayValidationValid)
      }
      if (validationName === 'month') {
        const currentFieldIndex = currentInput.getAttribute('node-index')
        const isMonthValidationValid = this.customDateInputValidator('month', +validationRules['month'].min, +validationRules['month'].max, currentFieldIndex)
        this.setValidity(inputFieldName, validationName, isMonthValidationValid)
      }
      if (validationName === 'year') {
        const currentFieldIndex = currentInput.getAttribute('node-index')
        const isYearValidationValid = this.customDateInputValidator('year', +validationRules['year'].min, +validationRules['year'].max, currentFieldIndex)
        this.setValidity(inputFieldName, validationName, isYearValidationValid)
      }
    })
  }

  setValidity(inputFieldName, validationName, isValid, inputType) {
    this.validationValues[inputFieldName][validationName].isValid = isValid
    const currentValidatedInput = this.allValidationNodes?.find(node => node.getAttribute('name') === inputFieldName)
    const currentValidatedInputHasNewErrorReferencePoint = currentValidatedInput.getAttribute('error-message-reference-point-changed') === 'true'
    const currentValidatedInputErrorTextWrapper = currentValidatedInput.errorTextWrapper ? currentValidatedInput.errorTextWrapper : currentValidatedInputHasNewErrorReferencePoint ? currentValidatedInput.closest('[new-error-message-reference-point="true"]').parentElement.querySelector('div.custom-error-text') : currentValidatedInput.parentElement.querySelector('div.custom-error-text')
    const isCurrentValidatedInputErrorTextWrapperFilled = currentValidatedInputErrorTextWrapper.querySelector('p')
    const isValidValues = []
    if (!this.validationValues[inputFieldName]['required'] && currentValidatedInput.value === '') {
      Object.keys(this.validationValues[inputFieldName]).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(this.validationValues[inputFieldName][key], 'isValid')) this.validationValues[inputFieldName][key]['isValid'] = true
      })
    }
    if (!currentValidatedInput.hasAttribute('disabled')) {
      Object.keys(this.validationValues[inputFieldName]).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(this.validationValues[inputFieldName][key], 'isValid')) isValidValues.push(this.validationValues[inputFieldName][key].isValid)
        if (!isCurrentValidatedInputErrorTextWrapperFilled) {
          if (Object.prototype.hasOwnProperty.call(this.validationValues[inputFieldName][key], 'error-message')) {
            if (currentValidatedInput.hasAttribute('no-error-text-p')) {
              currentValidatedInputErrorTextWrapper.setAttribute('error-text-id', key)
              currentValidatedInputErrorTextWrapper.hidden = true
              currentValidatedInputErrorTextWrapper.textContent = this.validationValues[inputFieldName][key]['error-message']
            } else {
              const errorText = document.createElement('p')
              errorText.setAttribute('error-text-id', key)
              errorText.hidden = true
              errorText.textContent = this.validationValues[inputFieldName][key]['error-message']
              currentValidatedInputErrorTextWrapper.appendChild(errorText)
            }
          }
        }
      })
    }
    if (isValidValues.includes(false)) {
      currentValidatedInputErrorTextWrapper.classList.add('error-active')
      currentValidatedInputErrorTextWrapper.previousSibling.classList.add('has-error')
      currentValidatedInput.classList.add('has-error')
      if (inputType === 'radio' || inputType === 'checkbox') {
        // this element has to be the message wrapper of radio buttons
        const radioBtnErrorMessageWrapper = currentValidatedInput.parentElement.parentElement.querySelector('.message')
        if (radioBtnErrorMessageWrapper) {
          radioBtnErrorMessageWrapper.classList.toggle('has-error', true)
        }
      }
    } else {
      currentValidatedInputErrorTextWrapper.classList.remove('error-active')
      currentValidatedInputErrorTextWrapper.previousSibling.classList.remove('has-error')
      currentValidatedInput.classList.remove('has-error')
      if (inputType === 'radio' || inputType === 'checkbox') {
        // this element has to be the message wrapper of radio buttons
        const radioBtnErrorMessageWrapper = currentValidatedInput.parentElement.parentElement.querySelector('.message')
        if (radioBtnErrorMessageWrapper) {
          if (radioBtnErrorMessageWrapper.classList.contains('has-error')) {
            radioBtnErrorMessageWrapper.classList.remove('has-error')
          }
        }
      }
    }

    const errorMessages = Array.from(currentValidatedInputErrorTextWrapper.querySelectorAll('[error-text-id]'))
    if (currentValidatedInputErrorTextWrapper.matches('[error-text-id]')) errorMessages.push(currentValidatedInputErrorTextWrapper)

    const currentErrorMessageIndex = isValidValues.findIndex(elem => elem === false)

    if (errorMessages) {
      errorMessages.forEach(p => {
        p.hidden = true
      })
      if (+currentErrorMessageIndex === -1) return
      if (errorMessages[currentErrorMessageIndex]) errorMessages[currentErrorMessageIndex].hidden = false
    }
  }

  validationPatternEnd(inputFieldName, validationName, currentValue) {
    const validationMask = this.validationValues[inputFieldName][validationName]['mask-value']
    const validationMaskSplitted = validationMask.split('')
    const currentValueSplitted = currentValue.split('')
    const hasSameLength = validationMaskSplitted.length === currentValueSplitted.length
    const isValuesValid = []
    if (!hasSameLength) return false
    currentValueSplitted.forEach((char, index) => {
      if (validationMaskSplitted[index] !== 'N' && validationMaskSplitted[index] !== 'L' && validationMaskSplitted[index] !== 'C' && validationMaskSplitted[index] !== '#') {
        if (validationMaskSplitted[index] === char) {
          isValuesValid.push(true)
        } else {
          isValuesValid.push(false)
        }
      } else if (validationMaskSplitted[index] === 'N') {
        const currentInputIsNumber = +char >= 0 && +char <= 9
        currentInputIsNumber ? isValuesValid.push(true) : isValuesValid.push(false)
      } else if (validationMaskSplitted[index] === 'C') {
        const currentInputIsLetterAndCapitalCase = /[a-zA-Z]/.test(char) && char === char.toUpperCase()
        currentInputIsLetterAndCapitalCase ? isValuesValid.push(true) : isValuesValid.push(false)
      } else if (validationMaskSplitted[index] === 'L') {
        const currentInputIsLetterAndLowerCase = /[a-zA-Z]/.test(char) && char === char.toLowerCase()
        currentInputIsLetterAndLowerCase ? isValuesValid.push(true) : isValuesValid.push(false)
      }
    })
    return !isValuesValid.includes(false)
  }

  scrollToFirstError() {
    // @ts-ignore
    const firstNodeWithError = this.allValidationNodes.find(node => node.classList.contains('has-error'))
    firstNodeWithError.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  checkIfFormValid() {
    const allIsValidValue = []
    Object.keys(this.validationValues).forEach(key => {
      Object.keys(this.validationValues[key]).forEach(subKey => {
        if (Object.prototype.hasOwnProperty.call(this.validationValues[key][subKey], 'isValid')) {
          allIsValidValue.push(this.validationValues[key][subKey].isValid)
        }
      })
    })
    if (this.submitButton) this.submitButton.disabled = allIsValidValue.includes(false)
  }

  /**
* renders the css
*/
  renderValidationCSS() {
    this.style.textContent = /* css */`
    :host .custom-error-text {
      margin: var(--error-border-radius, 3px 0 0 0);
      height: calc(var(--error-font-size, 1rem) * 1.55);
      width: var(--error-width, fit-content);
      background-color: var(--error-background-color, rgb(252, 169, 169));
    }
    :host .custom-error-text.error-active {
      border-radius: var(--error-border-radius, 5px);
      border: var(--error-border-width, 0px) solid var(--error-border-color, transparent);
    }
    :host .custom-error-text p {
      color: var(--error-color, red);
      font-weight: var(--error-font-weight, 400);
      margin: var(--error-text-margin, 0);
      padding: var(--error-text-padding, 0 0 0 0.2rem);
      font-size: var(--error-font-size, 1rem);
    }
    :host .has-error {
      border: var(--error-input-border-width, 1px) solid var(--error-input-border-color, red) !important;
      outline-color: var(--error-input-border-color, red) !important;
    }
    `
    this.html = this.style
  }

  get style() {
    return (
      this._style ||
      (this._style = (() => {
        const style = document.createElement('style')
        style.setAttribute('protected', 'true')
        style.setAttribute('validation-style', '')
        return style
      })())
    )
  }

  /**
   * find html element by id or class
   * return the element of whose parent finds the query
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @param {HTMLElement} [root=document.documentElement]
   * @return {HTMLElement}
   */
  static walksUpDomQuerySelector(el, selector, root = document.documentElement) {
    if (typeof el.matches === 'function' && el.matches(selector)) return el
    if (el.querySelector(selector)) return el.querySelector(selector)
    while ((el = el.parentNode || el.host || root) && el !== root) { // eslint-disable-line
      if (typeof el.matches === 'function' && el.matches(selector)) return el
      if (el.querySelector(selector)) return el.querySelector(selector)
    }
    return el
  }

  setDateInputAllowedKeys = (event) => {
    const currentDateInputIndex = event.currentTarget.getAttribute('node-index')
    const keyCode = event.which
    if (event.key == this[`dateInputFormatChar${currentDateInputIndex}`]) { }
    else if (keyCode == 32) {
      event.preventDefault()
      return false
    } else if (keyCode == 8 || keyCode == 37 || keyCode == 39 || keyCode == 46) {
    } else if (keyCode < 48 || keyCode > 57) {
      event.preventDefault()
      return false
    }
  }

  setDateInputFormIndexes(index) {
    this[`dateFormat${index}`].split('').forEach((char, index2) => {
      if (char === 'd') this[`dateInputFormIndexes${index}`]['day'].push(index2)
      else if (char === 'm') this[`dateInputFormIndexes${index}`]['month'].push(index2)
      else if (char === 'y') this[`dateInputFormIndexes${index}`]['year'].push(index2)
      else if (char === this[`dateInputFormatChar${index}`]) this[`dateInputFormIndexes${index}`].formatChar.push(index2)
    })
  }

  checkDateInputNextChar(index, formatCharTyped) {
    if (this[`dateFormat${index}`][this[`currentDateInputValueLength${index}`]] && this[`dateFormat${index}`][this[`currentDateInputValueLength${index}`]] === this[`dateInputFormatChar${index}`]) {
      this.getInputFieldByNodeIndex(index).value = this.getInputFieldByNodeIndex(index).value + this[`dateInputFormatChar${index}`]
    }
    if (formatCharTyped && this[`dateFormat${index}`][this[`currentDateInputValueLength${index}`] + 1] === this[`dateInputFormatChar${index}`]) {
      this.getInputFieldByNodeIndex(index).value = this.getInputFieldByNodeIndex(index).value + this[`dateInputFormatChar${index}`]
    }
  }

  getInputFieldByNodeIndex(nodeIndex) {
    if (this.root.querySelector(`input[node-index="${nodeIndex}"]`)) return this.root.querySelector(`input[node-index="${nodeIndex}"]`)
  }

  formatDateInput(index, dateType) {
    this[`currentDateInputValue${index}`].split('').forEach((char, index2) => {
      if (this[`dateInputFormIndexes${index}`][dateType].includes(index2)) {
        if (char === this[`dateInputFormatChar${index}`]) {
          let currentDateTypeValue = Array()
          this[`dateInputFormIndexes${index}`][dateType].forEach(ind => {
            if (this[`currentDateInputValue${index}`][ind] === this[`dateInputFormatChar${index}`] || !this[`currentDateInputValue${index}`][ind]) {
              currentDateTypeValue.unshift('0')
            } else {
              currentDateTypeValue.unshift(this[`currentDateInputValue${index}`][ind])
            }
          })
          let inputFieldValue = this[`currentDateInputValue${index}`].split('')
          this[`dateInputFormIndexes${index}`][dateType].forEach((ind, i) => {
            inputFieldValue[ind] = currentDateTypeValue[i]
          })
          this.getInputFieldByNodeIndex(index).value = inputFieldValue.join('')
          this.checkDateInputNextChar(index, true)
        }
      }
    })
  }

  customDateInputValidator(type, min, max, index) {
    let currentValueAsStringArray = this.getInputFieldByNodeIndex(index).value.split(this[`dateInputFormatChar${index}`]).filter(char => char !== this[`dateInputFormatChar${index}`])
    if (type === 'day') return (min <= +currentValueAsStringArray[0] && +currentValueAsStringArray[0] <= max) ? true : false
    else if (type === 'month') return (min <= +currentValueAsStringArray[1] && +currentValueAsStringArray[1] <= max) ? true : false
    else if (type === 'year') return (min <= +currentValueAsStringArray[2] && +currentValueAsStringArray[2] <= max) ? true : false
    else return false
  }

  customMainDateFormatValidator(index) {
    let mainValidation = true
    this[`dateInputFormIndexes${index}`].formatChar.forEach(ind => {
      if (this.getInputFieldByNodeIndex(index).value[ind] !== this[`dateInputFormatChar${index}`]) mainValidation = false
    })
    if (this.getInputFieldByNodeIndex(index).value.length !== this[`dateFormat${index}`].length) mainValidation = false
    return mainValidation
  }

  dateInputAddZeroIfNeeded(dateType, index) {
    let currentDateUnit = this.getInputFieldByNodeIndex(index).value.slice(this[`dateInputFormIndexes${index}`][dateType][0], this[`dateInputFormIndexes${index}`][dateType][this[`dateInputFormIndexes${index}`][dateType].length - 1] + 1)
    let newCurrentDateUnit = currentDateUnit.split('').filter(el => el !== this[`dateInputFormatChar${index}`])

    if (newCurrentDateUnit.length !== this[`dateInputFormIndexes${index}`][dateType].length) {
      let currentFormatCharIndexes = []
      this.getInputFieldByNodeIndex(index).value.split('').forEach((char, index2) => {
        char === this[`dateInputFormatChar${index}`] ? currentFormatCharIndexes.push(index2) : ''
      })

      let lengthDiff = this[`dateInputFormIndexes${index}`][dateType].length - newCurrentDateUnit.length
      for (let i = 0; i < lengthDiff; i++) {
        if (dateType === 'year') newCurrentDateUnit.push('0')
        else newCurrentDateUnit.unshift('0')
      }

      let formatCharsNextToEachOther = currentFormatCharIndexes.find((el, index) => el + 1 === currentFormatCharIndexes[index + 1])

      if (formatCharsNextToEachOther || this.getInputFieldByNodeIndex(index).value[0] === this[`dateInputFormatChar${index}`]) {
        newCurrentDateUnit = ['0', '1', this[`dateInputFormatChar${index}`]]
      } else {
        let isAllZero = true
        newCurrentDateUnit.forEach(num => +num !== 0 ? isAllZero = false : '')

        if (isAllZero) {
          newCurrentDateUnit = ['0', '1']
        }
      }

      this.getInputFieldByNodeIndex(index).value = this.getInputFieldByNodeIndex(index).value.slice(0, this[`dateInputFormIndexes${index}`][dateType][0]) + newCurrentDateUnit.join('') + this.getInputFieldByNodeIndex(index).value.slice(this[`dateInputFormIndexes${index}`][dateType][this[`dateInputFormIndexes${index}`][dateType].length - 1])

      if (this[`dateFormat${index}`][this.getInputFieldByNodeIndex(index).value.length] === this[`dateInputFormatChar${index}`]) {
        this.getInputFieldByNodeIndex(index).value = this.getInputFieldByNodeIndex(index).value + this[`dateInputFormatChar${index}`]
      }
    }
    if (this[`dateFormat${index}`][this.getInputFieldByNodeIndex(index).value.length] === this[`dateInputFormatChar${index}`] && this.getInputFieldByNodeIndex(index).value[this.getInputFieldByNodeIndex(index).value.length - 1] !== this[`dateInputFormatChar${index}`]) {
      this.getInputFieldByNodeIndex(index).value = this.getInputFieldByNodeIndex(index).value + this[`dateInputFormatChar${index}`]
    }
  }

  setFormatOfDateInput(newDateInput, oldDateInput, nodeIndex, inputFieldName) {
    if (!newDateInput) return ''
    let newDateInputValue = oldDateInput
    let newDateInputArray = newDateInput.split(this[`dateInputFormatChar${nodeIndex}`]).filter(unit => unit)
    let oldDateInputArray = oldDateInput.split(this[`dateInputFormatChar${nodeIndex}`]).filter(unit => unit)
    let diffBetweenOldAndNewArray = oldDateInputArray.filter(unit => !newDateInputArray.includes(unit)).filter(unit => unit)
    if ((diffBetweenOldAndNewArray.length === 1 && diffBetweenOldAndNewArray[0].length === 4) || (diffBetweenOldAndNewArray.length === 1 && diffBetweenOldAndNewArray[0] === oldDateInputArray[oldDateInputArray.length - 1]) || (diffBetweenOldAndNewArray.length === 2 && diffBetweenOldAndNewArray[0] === oldDateInputArray[oldDateInputArray.length - 2] && diffBetweenOldAndNewArray[1] === oldDateInputArray[oldDateInputArray.length - 1])) {
      return newDateInput
    }
    if (diffBetweenOldAndNewArray.length > 0) {
      diffBetweenOldAndNewArray.forEach(el => {
        let currentContentIndex = oldDateInputArray.findIndex(oldEl => el === oldEl)
        if (oldDateInputArray[currentContentIndex].length === 2) oldDateInputArray[currentContentIndex] = "01"
        if (oldDateInputArray[currentContentIndex].length === 4) oldDateInputArray[currentContentIndex] = this.validationValues[inputFieldName]['year']['min']
        newDateInputValue = oldDateInputArray.join(this[`dateInputFormatChar${nodeIndex}`])
      })
    }
    return newDateInputValue
  }
}
