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
    this.submitButton = this.form.querySelector('input[type="submit"]')
    this.allValidationNodes = Array.from(this.form.querySelectorAll('[data-m-v-rules]'))
    // TODO create new Validation class here
    let handler = {
      set: function whenChange(obj,prop,value) {
        obj[prop] = value
      console.log("The value of the object has changed!");
      return true
     }
    }
    this.validationValues = new Proxy({}, handler);


    if (this.allValidationNodes.length > 0) {
      this.allValidationNodes.forEach(node => {
        // TODO if type radio we need other logic
        const errorText = document.createElement('div')
        errorText.classList.add('custom-error-text')
        node.after(errorText)
        // IMPORTANT name attribute has to be unique and always available
        // maybe we need to create this part of code as separated function
        if (node.hasAttribute('name')) {
          if (!this.validationValues.hasOwnProperty(node.getAttribute('name'))) {
            console.log("rules", JSON.parse(node.getAttribute('data-m-v-rules')))
            this.validationValues[node.getAttribute('name')] = {

            }
          }
        }
      })
    }
    console.log(this.validationValues)

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
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback()
  }
}
