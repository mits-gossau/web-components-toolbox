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
  constructor (options = { ValidationInit: undefined }, ...args) {
    super(options, ...args)

    this.validationValues = {}

    this.validationChangeEventListener = (event) => {
      const inputField = event.currentTarget
      const inputFieldName = inputField.getAttribute('name')
      this.validator(this.validationValues[inputFieldName], inputField, inputFieldName)
      if (this.realTimeSubmitButton) {
        this.checkIfFormValid()
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
  connectedCallback () {
    super.connectedCallback()
    this.shouldValidateOnInitiate = this.root.querySelector('form').getAttribute('validate-on-initiate') === 'true'
    this.realTimeSubmitButton = this.root.querySelector('form').getAttribute('real-time-submit-button') === 'true'

    this.allValidationNodes = Array.from(this.form.querySelectorAll('[data-m-v-rules]'))
    if (!this.hasAttribute('no-validation-error-css')) this.renderValidationCSS()

    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes.forEach(node => {
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
          node.addEventListener('input', this.validationChangeEventListener)
        } else {
          node.addEventListener('change', this.validationChangeEventListener)
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
                node.addEventListener('input', this.validationPatternInputEventListener)
              }
            })
          }
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
  disconnectedCallback () {
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
      })
    }
    if (this.submitButton) {
      this.submitButton.removeEventListener('click', this.submitFormValidation)
    }
  }

  validator (validationRules, currentInput, inputFieldName) {
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
        if (validationRules.pattern['mask-value']) {
          const maskValue = validationRules.pattern['mask-value']
          let currentInputValue = currentInput.value

          if (maskValue.length < currentInputValue.length) currentInputValue = currentInputValue.slice(0, -1)

          const isPatternMaskValueValidationValid = this.validationPatternEnd(inputFieldName, validationName, currentInputValue)
          this.setValidity(inputFieldName, validationName, isPatternMaskValueValidationValid)
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
    })
  }

  setValidity (inputFieldName, validationName, isValid, inputType) {
    this.validationValues[inputFieldName][validationName].isValid = isValid
    const currentValidatedInput = this.allValidationNodes?.find(node => node.getAttribute('name') === inputFieldName)
    const currentValidatedInputHasNewErrorReferencePoint = currentValidatedInput.getAttribute('error-message-reference-point-changed') === 'true'
    const currentValidatedInputErrorTextWrapper = currentValidatedInput.errorTextWrapper ? currentValidatedInput.errorTextWrapper : currentValidatedInputHasNewErrorReferencePoint ? currentValidatedInput.closest('[new-error-message-reference-point="true"]').parentElement.querySelector('div.custom-error-text') : currentValidatedInput.parentElement.querySelector('div.custom-error-text')
    const isCurrentValidatedInputErrorTextWrapperFilled = currentValidatedInputErrorTextWrapper.querySelector('p')
    const isValidValues = []
    if (!currentValidatedInput.hasAttribute('disabled')) {
      Object.keys(this.validationValues[inputFieldName]).forEach(key => {
        if (Object.prototype.hasOwnProperty.call(this.validationValues[inputFieldName][key], 'isValid')) isValidValues.push(this.validationValues[inputFieldName][key].isValid)
        if (!isCurrentValidatedInputErrorTextWrapperFilled) {
          if (Object.prototype.hasOwnProperty.call(this.validationValues[inputFieldName][key], 'error-message')) {
            if (currentValidatedInput.hasAttribute('no-error-text-p')) {
              currentValidatedInputErrorTextWrapper.setAttribute('error-text-id', validationName)
              currentValidatedInputErrorTextWrapper.hidden = true
              currentValidatedInputErrorTextWrapper.textContent = this.validationValues[inputFieldName][key]['error-message']
            } else {
              const errorText = document.createElement('p')
              errorText.setAttribute('error-text-id', validationName)
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
        if (radioBtnErrorMessageWrapper) radioBtnErrorMessageWrapper.classList.contains('has-error') ? '' : radioBtnErrorMessageWrapper.classList.add('has-error')
      }
    } else {
      currentValidatedInputErrorTextWrapper.classList.remove('error-active')
      currentValidatedInputErrorTextWrapper.previousSibling.classList.remove('has-error')
      currentValidatedInput.classList.remove('has-error')
      if (inputType === 'radio' || inputType === 'checkbox') {
        // this element has to be the message wrapper of radio buttons
        const radioBtnErrorMessageWrapper = currentValidatedInput.parentElement.parentElement.querySelector('.message')
        if (radioBtnErrorMessageWrapper) radioBtnErrorMessageWrapper.classList.contains('has-error') ? radioBtnErrorMessageWrapper.classList.remove('has-error') : ''
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

  validationPatternEnd (inputFieldName, validationName, currentValue) {
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

  scrollToFirstError () {
    // @ts-ignore
    const firstNodeWithError = this.allValidationNodes.find(node => node.classList.contains('has-error'))
    firstNodeWithError.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  checkIfFormValid () {
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
  renderValidationCSS () {
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

  get style () {
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
  static walksUpDomQuerySelector (el, selector, root = document.documentElement) {
    if (typeof el.matches === 'function' && el.matches(selector)) return el
    if (el.querySelector(selector)) return el.querySelector(selector)
    while ((el = el.parentNode || el.host || root) && el !== root) { // eslint-disable-line
      if (typeof el.matches === 'function' && el.matches(selector)) return el
      if (el.querySelector(selector)) return el.querySelector(selector)
    }
    return el
  }
}
