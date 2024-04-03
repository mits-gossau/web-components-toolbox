// @ts-check

import { Shadow } from './Shadow.js'

export const Validation = (ChosenClass = Shadow()) => class Validation extends ChosenClass {
  /**
   * Creates an instance of Shadow. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{ValidationInit: {level?: number|undefined, selector?: string|undefined}|undefined}} options
   * @param {*} args
   */
  constructor(options = { ValidationInit: undefined }, ...args) {
    super(options, ...args)
    // TODO What if dont have submit button but only one validation field
    // TODO what if we had more forms? how to solve?

    this.validationChangeEventListener = (event) => {
      const inputField = event.currentTarget
      const inputFieldName = event.currentTarget.getAttribute('name')
      this.validator(this.validationValues[inputFieldName], inputField, inputFieldName)
    }

    this.validationPatternInputEventListener = (event) => {
      const inputField = event.currentTarget
      const splittedMaskPattern = this.validationValues[event.currentTarget.getAttribute('name')]['pattern']['mask-value'].split('')
      let splittedInputValue = inputField.value.split('')
      if (splittedInputValue.length <= splittedMaskPattern.length) {
        splittedInputValue.forEach((input, index) => {
          if (splittedMaskPattern[index]) {
            if (splittedMaskPattern[index] === 'C' || splittedMaskPattern[index] === 'U') {
              const currentInputIsLetter = /[a-zA-Z]/.test(splittedInputValue[index])
              if (!currentInputIsLetter) {
                splittedInputValue = splittedInputValue.slice(0, -1)
              } else {
                if (splittedMaskPattern[index] === 'C') {
                  splittedInputValue[index] = splittedInputValue[index].toUpperCase()
                }
                else if (splittedMaskPattern[index] === 'U') {
                  splittedInputValue[index] = splittedInputValue[index].toLowerCase()
                }
              }
            }
            if (splittedMaskPattern[index] === 'N') {
              const currentInputIsNumber = +splittedInputValue[index] >= 0 && +splittedInputValue[index] <= 9
              if (!currentInputIsNumber) splittedInputValue = splittedInputValue.slice(0, -1)
            }
            if (splittedMaskPattern[index + 1] !== 'C' && splittedMaskPattern[index + 1] !== 'U' && splittedMaskPattern[index + 1] !== '#' && splittedMaskPattern[index + 1] !== 'N') {
              if (this.oldValueLength - 1 < index) {
                splittedInputValue[index + 1] = splittedMaskPattern[index + 1]
              }
            }
          }
        })
        inputField.value = splittedInputValue.join('')
        this.oldValueLength = inputField.value.length
      } else {
        inputField.value = inputField.value.slice(0, splittedMaskPattern.length)
      }
    }

    this.submitFormValidation = (event) => {
      event.preventDefault()
      Object.keys(this.validationValues).forEach(key => {
        this.validationValues[key].isTouched = true
      })
      this.allValidationNodes.forEach(node => {
        const inputFieldName = node.getAttribute('name')
        if (inputFieldName) this.validator(this.validationValues[inputFieldName], node, inputFieldName)
      })
    }

    this.baseInputChangeListener = (event) => {
      const shouldIgnoreFirstSpace = event.currentTarget.hasAttribute('ignore-first-space')
      let inputFieldValue = event.currentTarget.value.split('')
      const isFirstCharacterSpace = inputFieldValue[0] === " "
      if (shouldIgnoreFirstSpace && isFirstCharacterSpace) {
        inputFieldValue = inputFieldValue.slice(0, -1)
        event.currentTarget.value = inputFieldValue.join('')
      }

      const inputFieldName = event.currentTarget.getAttribute('name')
      this.validationValues[inputFieldName].isTouched = true
    }

    this.submitButton = this.form.querySelector('input[type="submit"]')
    this.allValidationNodes = Array.from(this.form.querySelectorAll('[data-m-v-rules]'))
    this.validationValues = {}
    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes.forEach(node => {
        // TODO if type radio we need other logic
        const errorTextWrapper = document.createElement('div')
        errorTextWrapper.classList.add('custom-error-text')
        node.after(errorTextWrapper)
        node.addEventListener('change', this.validationChangeEventListener)
        node.addEventListener('input', this.baseInputChangeListener)
        // IMPORTANT name attribute has to be unique and always available
        if (node.hasAttribute('name')) {
          if (!this.validationValues.hasOwnProperty(node.getAttribute('name'))) {
            const parsedRules = JSON.parse(node.getAttribute('data-m-v-rules'))
            Object.keys(parsedRules).forEach(key => {
              this.validationValues[node.getAttribute('name')] = this.validationValues[node.getAttribute('name')] ? Object.assign(this.validationValues[node.getAttribute('name')], { isTouched: false }) : {}
              this.validationValues[node.getAttribute('name')][key] = Object.assign(parsedRules[key], { isValid: false })
              if (this.validationValues[node.getAttribute('name')]['pattern'] && this.validationValues[node.getAttribute('name')]['pattern'].hasOwnProperty('mask-value')) {
                node.addEventListener('input', this.validationPatternInputEventListener)
              }
            })
          }
        }
      })
    }

    if (this.submitButton) {
      this.submitButton.addEventListener('click', this.submitFormValidation)
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback()
    // this.validate('Name')
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback()
  }

  validate(inputFieldName) {
    if (inputFieldName) {
      // implement if only one imput field has to be validated
      const currentValidatedInput = this.allValidationNodes.find(node => node.getAttribute('name') === inputFieldName)
      this.validator(this.validationValues[inputFieldName], currentValidatedInput, inputFieldName)
    } else {
      // implement if all needs to be validated
    }
  }

  validator(validationRules, currentInput, inputFieldName) {
    const validationNames = Object.keys(validationRules)
    // @ts-ignore
    validationNames.forEach(validationName => {
      if (validationName === 'required') {
        if (currentInput.value && currentInput.value.trim().length > 0) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)
        }
      }
      if (validationName === 'max-length') {
        if (currentInput.value.trim().length < validationRules['max-length'].value) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)

        }
      }
      if (validationName === 'min-length') {
        if (currentInput.value.trim().length < validationRules['min-length'].value) {
          this.setValidity(inputFieldName, validationName, false)
        } else {
          this.setValidity(inputFieldName, validationName, true)
        }
      }
      if (validationName === 'email') {
        if (currentInput.value.match(
          /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        )) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)
        }
      }
      if (validationName === 'max-number-value') {
        if (+currentInput.value > +validationRules['max-number-value'].value) {
          this.setValidity(inputFieldName, validationName, false)
        } else {
          this.setValidity(inputFieldName, validationName, true)

        }
      }
      if (validationName === 'min-number-value') {
        if (+currentInput.value < +validationRules['min-number-value'].value) {
          this.setValidity(inputFieldName, validationName, false)
        } else {
          this.setValidity(inputFieldName, validationName, true)

        }
      } if (validationName === 'min-max-number-value') {
        const minNumberValue = +validationRules['min-max-number-value'].value.split('-')[0]
        const maxNumberValue = +validationRules['min-max-number-value'].value.split('-')[1]

        if ((+currentInput.value > minNumberValue) && (+currentInput.value < maxNumberValue)) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)
        }
      } if (validationName === 'pattern') {
        if (validationRules['pattern']['pattern-value']) {
          const re = new RegExp(`${validationRules['pattern']['pattern-value']}`)
          const regExpValid = re.test(currentInput.value)
          if (regExpValid) {
            this.setValidity(inputFieldName, validationName, true)
          } else {
            this.setValidity(inputFieldName, validationName, false)
          }
        }
        if (validationRules['pattern']['mask-value']) {
          const isValid = this.validationPatternEnd(inputFieldName, validationName, currentInput.value.trim())
          if (isValid) {
            this.setValidity(inputFieldName, validationName, true)
          } else {
            this.setValidity(inputFieldName, validationName, false)
          }
        }
      } else {
        return
      }
    })
  }

  setValidity(inputFieldName, validationName, isValid) {
    this.validationValues[inputFieldName][validationName].isValid = isValid
    const currentValidatedInput = this.allValidationNodes.find(node => node.getAttribute('name') === inputFieldName)
    const currentValidatedInputErrorTextWrapper = currentValidatedInput.parentElement.querySelector('div.custom-error-text')
    const isCurrentValidatedInputErrorTextWrapperFilled = currentValidatedInputErrorTextWrapper.querySelector('p')
    let isValidValues = []
    Object.keys(this.validationValues[inputFieldName]).forEach(key => {
      if (this.validationValues[inputFieldName][key].hasOwnProperty('isValid')) isValidValues.push(this.validationValues[inputFieldName][key].isValid)
      if (!isCurrentValidatedInputErrorTextWrapperFilled) {
        if (this.validationValues[inputFieldName][key].hasOwnProperty('error-message')) {
          const errorText = document.createElement('p')
          errorText.setAttribute('error-text-id', validationName)
          errorText.hidden = true
          errorText.textContent = this.validationValues[inputFieldName][key]['error-message']
          currentValidatedInputErrorTextWrapper.appendChild(errorText)
        }
      }
    })
    if (isValidValues.includes(false)) {
      currentValidatedInputErrorTextWrapper.classList.add('error-active')
      currentValidatedInputErrorTextWrapper.previousSibling.classList.add('has-error')
    } else {
      currentValidatedInputErrorTextWrapper.classList.remove('error-active')
      currentValidatedInputErrorTextWrapper.previousSibling.classList.remove('has-error')
    }

    const errorMessages = Array.from(currentValidatedInputErrorTextWrapper.querySelectorAll('p'))

    const currentErrorMessageIndex = isValidValues.findIndex(elem => elem === false)

    if (errorMessages) {
      errorMessages.forEach(p => p.hidden = true)
      if (+currentErrorMessageIndex === -1) return
      errorMessages[currentErrorMessageIndex].hidden = false
    }
  }

  validationPatternEnd(inputFieldName, validationName, currentValue) {
    const validationMask = this.validationValues[inputFieldName][validationName]['mask-value']
    const validationMaskSplitted = validationMask.split('')
    const currentValueSplitted = currentValue.split('')
    const hasSameLength = validationMaskSplitted.length === currentValueSplitted.length
    let isValuesValid = []
    if (!hasSameLength) return
    currentValueSplitted.forEach((char, index) => {
      if (validationMaskSplitted[index] !== 'N' && validationMaskSplitted[index] !== 'U' && validationMaskSplitted[index] !== 'C' && validationMaskSplitted[index] !== '#') {
        if (validationMaskSplitted[index] === char) {
          isValuesValid.push(true)
        } else {
          isValuesValid.push(false)
        }
      }
      else if (validationMaskSplitted[index] === 'N') {
        const currentInputIsNumber = +char >= 0 && +char <= 9
        currentInputIsNumber ? isValuesValid.push(true) : isValuesValid.push(false)
      }
      else if (validationMaskSplitted[index] === 'C') {
        const currentInputIsLetterAndCapitalCase = /[a-zA-Z]/.test(char) && char === char.toUpperCase()
        currentInputIsLetterAndCapitalCase ? isValuesValid.push(true) : isValuesValid.push(false)
      }
      else if (validationMaskSplitted[index] === 'U') {
        const currentInputIsLetterAndLowerCase = /[a-zA-Z]/.test(char) && char === char.toLowerCase()
        currentInputIsLetterAndLowerCase ? isValuesValid.push(true) : isValuesValid.push(false)
      }
    })
    return !isValuesValid.includes(false)
  }
}
