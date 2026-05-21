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
    this.validationTranslations = {
      summarySingle: 'Es gibt {0} Fehler im Formular.',
      summaryMultiple: 'Es gibt {0} Fehler im Formular.',
      fieldFallback: 'Feld'
    }

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
        this.updateErrorSummary()
        this.focusErrorSummary()
        event.preventDefault()
        event.stopPropagation()
      } else {
        this.removeErrorSummary()
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
    this.renderValidationA11yCSS()
    this.loadValidationTranslations()

    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes.forEach(node => {
        const currentNodeHasNewErrorReferencePoint = node.getAttribute('error-message-reference-point-changed') === 'true'
        const errorTextWrapper = node.hasAttribute('error-text-tag-name') ? document.createElement(node.getAttribute('error-text-tag-name')) : document.createElement('div')
        const nodeHasLiveValidation = node.getAttribute('live-input-validation') === 'true'
        errorTextWrapper.classList.add('custom-error-text')
        errorTextWrapper.id = this.getErrorWrapperId(node)
        errorTextWrapper.setAttribute('aria-live', 'polite')
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
              currentValidatedInputErrorTextWrapper.id = this.getErrorMessageId(currentValidatedInput, validationName)
              currentValidatedInputErrorTextWrapper.hidden = true
              currentValidatedInputErrorTextWrapper.textContent = this.validationValues[inputFieldName][key]['error-message']
            } else {
              const errorText = document.createElement('p')
              errorText.setAttribute('error-text-id', validationName)
              errorText.id = this.getErrorMessageId(currentValidatedInput, validationName)
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
      this.setAriaInvalid(currentValidatedInput, true)
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
      this.setAriaInvalid(currentValidatedInput, false)
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
      if (errorMessages[currentErrorMessageIndex]) {
        errorMessages[currentErrorMessageIndex].hidden = false
        this.setActiveErrorDescription(currentValidatedInput, errorMessages[currentErrorMessageIndex])
      }
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

  getErrorWrapperId (node) {
    return `${this.getSafeInputId(node)}-error`
  }

  getErrorMessageId (node, validationName) {
    return `${this.getSafeInputId(node)}-error-${validationName}`
  }

  getSafeInputId (node) {
    if (node.id) return node.id
    const baseId = (node.getAttribute('name') || 'field').replace(/[^a-zA-Z0-9_-]/g, '_')
    let safeId = baseId
    let index = 1
    while (this.form.querySelector(`#${CSS.escape(safeId)}`)) {
      safeId = `${baseId}-${index++}`
    }
    node.id = safeId
    return safeId
  }

  setAriaInvalid (node, isInvalid) {
    const relatedNodes = this.getRelatedValidationNodes(node)
    relatedNodes.forEach(relatedNode => {
      if (isInvalid) {
        relatedNode.setAttribute('aria-invalid', 'true')
      } else {
        relatedNode.removeAttribute('aria-invalid')
        this.removeDescribedById(relatedNode, relatedNode.getAttribute('data-active-error-id'))
        relatedNode.removeAttribute('data-active-error-id')
      }
    })
  }

  setActiveErrorDescription (node, errorMessage) {
    const relatedNodes = this.getRelatedValidationNodes(node)
    relatedNodes.forEach(relatedNode => {
      this.removeDescribedById(relatedNode, relatedNode.getAttribute('data-active-error-id'))
      if (errorMessage?.id) {
        this.addDescribedById(relatedNode, errorMessage.id)
        relatedNode.setAttribute('data-active-error-id', errorMessage.id)
      }
    })
  }

  getRelatedValidationNodes (node) {
    if (node.getAttribute('type') !== 'radio') return [node]
    const radioName = node.getAttribute('name')
    return Array.from(this.form.querySelectorAll(`input[type="radio"][name="${radioName}"]`))
  }

  addDescribedById (node, id) {
    if (!id) return
    const describedBy = (node.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)
    if (!describedBy.includes(id)) describedBy.push(id)
    node.setAttribute('aria-describedby', describedBy.join(' '))
  }

  removeDescribedById (node, id) {
    if (!id) return
    const describedBy = (node.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean).filter(item => item !== id)
    if (describedBy.length) {
      node.setAttribute('aria-describedby', describedBy.join(' '))
    } else {
      node.removeAttribute('aria-describedby')
    }
  }

  updateErrorSummary () {
    const errors = this.getCurrentValidationErrors()
    if (!errors.length) return this.removeErrorSummary()

    const summary = this.getOrCreateErrorSummary()
    const title = summary.querySelector('[data-error-summary-title]')
    const list = summary.querySelector('ul')
    const translations = this.getValidationTranslations()
    title.textContent = (errors.length === 1 ? translations.summarySingle : translations.summaryMultiple).replace('{0}', String(errors.length))
    list.textContent = ''

    errors.forEach(error => {
      const item = document.createElement('li')
      const link = document.createElement('a')
      this.getSafeInputId(error.input)
      link.href = `#${error.input.id}`
      link.textContent = `${error.label}: ${error.message}`
      link.addEventListener('click', event => {
        event.preventDefault()
        error.input.scrollIntoView({ behavior: 'smooth', block: 'center' })
        error.input.focus({ preventScroll: true })
      })
      item.appendChild(link)
      list.appendChild(item)
    })
  }

  getOrCreateErrorSummary () {
    let summary = this.form.querySelector('#form-error-summary')
    if (summary) return summary

    summary = document.createElement('div')
    summary.id = 'form-error-summary'
    summary.classList.add('form-error-summary')
    summary.setAttribute('role', 'alert')
    summary.setAttribute('aria-labelledby', 'form-error-summary-title')
    summary.setAttribute('tabindex', '-1')

    const title = document.createElement('h2')
    title.id = 'form-error-summary-title'
    title.setAttribute('data-error-summary-title', '')
    summary.appendChild(title)

    const list = document.createElement('ul')
    summary.appendChild(list)

    this.form.insertBefore(summary, this.form.firstElementChild)
    return summary
  }

  removeErrorSummary () {
    this.form?.querySelector('#form-error-summary')?.remove()
  }

  focusErrorSummary () {
    requestAnimationFrame(() => {
      const summary = this.form.querySelector('#form-error-summary')
      if (summary) {
        summary.scrollIntoView({ behavior: 'smooth', block: 'start' })
        summary.focus({ preventScroll: true })
      }
    })
  }

  getCurrentValidationErrors () {
    const errors = []
    const seenNames = new Set()
    this.allValidationNodes?.forEach(node => {
      if (!node.classList.contains('has-error')) return
      const inputName = node.getAttribute('name') || node.id
      if (seenNames.has(inputName)) return
      seenNames.add(inputName)
      const message = this.getActiveErrorMessage(node)
      if (!message) return
      errors.push({
        input: node,
        label: this.getInputLabel(node),
        message
      })
    })
    return errors
  }

  getActiveErrorMessage (node) {
    const activeErrorId = node.getAttribute('data-active-error-id')
    if (activeErrorId) return this.form.querySelector(`#${CSS.escape(activeErrorId)}`)?.textContent?.trim()
    return node.errorTextWrapper?.querySelector(':not([hidden])')?.textContent?.trim() || node.errorTextWrapper?.textContent?.trim()
  }

  getInputLabel (node) {
    if (node.id) {
      const label = this.form.querySelector(`label[for="${CSS.escape(node.id)}"]`)
      if (label?.textContent?.trim()) return label.textContent.trim()
    }
    const wrappingLabel = node.closest('label')
    if (wrappingLabel?.textContent?.trim()) return wrappingLabel.textContent.trim()
    if (node.getAttribute('type') === 'radio') {
      const groupLabel = node.parentElement?.parentElement?.previousElementSibling
      if (groupLabel?.tagName === 'LABEL' && groupLabel.textContent?.trim()) return groupLabel.textContent.trim()
    }
    return node.getAttribute('name') || node.id || this.getValidationTranslations().fieldFallback
  }

  loadValidationTranslations () {
    const fallbacks = this.validationTranslations
    const keys = {
      summarySingle: 'Accessibility.Form.ErrorSummary.Single',
      summaryMultiple: 'Accessibility.Form.ErrorSummary.Multiple',
      fieldFallback: 'Accessibility.Form.FieldFallback'
    }

    this.dispatchEvent(new CustomEvent(this.getAttribute('request-translations') || 'request-translations', {
      detail: {
        resolve: ({ getTranslationSync }) => {
          this.validationTranslations = Object.entries(keys).reduce((acc, [name, key]) => {
            const translation = getTranslationSync(key)
            acc[name] = translation === key ? fallbacks[name] : translation
            return acc
          }, {})
        }
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  getValidationTranslations () {
    return this.validationTranslations
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

  renderValidationA11yCSS () {
    if (this.root.querySelector('style[validation-a11y-style]')) return
    const style = document.createElement('style')
    style.setAttribute('protected', 'true')
    style.setAttribute('validation-a11y-style', '')
    style.textContent = /* css */`
      :host .form-error-summary {
        border: 2px solid var(--color-error, #b00020);
        padding: 1rem;
        margin: 0 0 1.5rem 0;
        background: var(--background-color-error, #fff5f5);
        color: var(--color, inherit);
      }
      :host .form-error-summary:focus {
        outline: 2px solid var(--outline-color-focus-visible, var(--color-secondary, #111));
        outline-offset: 2px;
      }
      :host .form-error-summary h2 {
        margin-top: 0;
      }
    `
    this.root.appendChild(style)
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
