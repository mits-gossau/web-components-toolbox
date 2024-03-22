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
        // IMPORTANT name attribute has to be unique and always available
        if (node.hasAttribute('name')) {
          if (!this.validationValues.hasOwnProperty(node.getAttribute('name'))) {
            const parsedRules = JSON.parse(node.getAttribute('data-m-v-rules'))
            Object.keys(parsedRules).forEach(key => {
              this.validationValues[node.getAttribute('name')] = this.validationValues[node.getAttribute('name')] ? Object.assign(this.validationValues[node.getAttribute('name')]) : {}
              this.validationValues[node.getAttribute('name')][key] = Object.assign(parsedRules[key], { isValid: false })
            })
          }
        }
      })
    }

    if (this.submitButton) {
      this.preventDefault
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
        if (currentInput.value.includes('@')) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)
        }
      }
      if (validationName === 'max-number-value') {
        if (+currentInput.value > +validationRules['max-length'].value) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)

        }
      }
      if (validationName === 'min-number-value') {
        if (+currentInput.value < +validationRules['max-length'].value) {
          this.setValidity(inputFieldName, validationName, true)
        } else {
          this.setValidity(inputFieldName, validationName, false)

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
    const sameValidationMessage = currentValidatedInputErrorTextWrapper.querySelector(`p[error-text-id=${validationName}]`)
    const errorText = document.createElement('p')
    errorText.setAttribute('error-text-id', validationName)
    errorText.hidden = true
    errorText.textContent = this.validationValues[inputFieldName][validationName]['error-message']
    if (!sameValidationMessage) currentValidatedInputErrorTextWrapper.appendChild(errorText)
    
    if(isValid === false){
      currentValidatedInputErrorTextWrapper.querySelector(`p[error-text-id=${validationName}]`).hidden = false
    }else{
      currentValidatedInputErrorTextWrapper.querySelector(`p[error-text-id=${validationName}]`).hidden = true
    }

    const errorMessages = Array.from(currentValidatedInputErrorTextWrapper.querySelectorAll('p'))
    const hasMoreThenOneError = errorMessages.filter(p => !p.hasAttribute('hidden')).length > 1

    if(hasMoreThenOneError){
      errorMessages.forEach(p => p.hidden = true)
      errorMessages[0].hidden = false
    }
  }
}
