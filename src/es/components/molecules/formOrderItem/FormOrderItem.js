// @ts-check
/* global self */

import Form from '../form/Form.js'

export default class FormOrderItem extends Form {
  //inputFieldQuantity;
  constructor(...args) {
    super(...args)
    this.eventListener = event => {
      const inputField = this.root.querySelector(':focus')
      const value = inputField?.value ? inputField.value : '0'
      this.updateInputAttributeValue(inputField, value)
      this.calcTotal(value, this.priceAttribute, this.priceTotalElement)
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.addEventListener('focusout', this.eventListener)
    this.addEventListener('focusin', this.eventListener)
    this.addEventListener('change', this.eventListener)
    this.addEventListener('keyup', this.eventListener)
    this.setPrice(this.priceAttribute, this.priceElement)
    this.calcTotal('0', this.priceAttribute, this.priceTotalElement)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    this.removeEventListener('focusout', this.eventListener)
    this.removeEventListener('focusin', this.eventListener)
    this.removeEventListener('change', this.eventListener)
    this.removeEventListener('keyup', this.eventListener)
  }

  renderCSS() {
    this.css = /* css */ `
      :host {
        margin:0 auto !important;
      }
      :host input[type=number] {
        width:var(--a-input-width, auto);
      }
      :host > div {
        align-items: center;
        background-color:#ccc;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        padding:var(--padding, 0);
        border-top: 1px solid var(--border-top-color, black);
      }
    }`

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
      case 'form-order-item-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  setPrice(priceAttribute, priceElement) {
    if (!priceElement) return
    priceElement.innerText = priceAttribute
  }

  calcTotal(value, price, targetElement) {
    if (!targetElement) return
    const total = value === '0' ? parseFloat(value).toFixed(2) : (parseFloat(value) * parseFloat(price)).toFixed(2)
    targetElement.innerText = total
  }

  updateInputAttributeValue(element, value) {
    if (!element) return
    const quantity = value !== '0' ? value : ''
    element.setAttribute('value', quantity)
  }

  get quantityField() {
    return this.root.querySelector('#quantity')
  }

  get priceAttribute() {
    return this.getAttribute('price')
  }

  get priceElement() {
    return this.root.querySelector('.price') || null
  }

  get priceTotalElement() {
    return this.root.querySelector('.price-total') || null
  }
}
