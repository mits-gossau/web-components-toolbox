// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

export default class BasketControl extends Shadow() {
  /**
   * @param options
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.currentProductId = this.quantityField?.getAttribute('id') || 0

    this.answerEventNameListener = event => {
      event.detail.fetch.then(productData => {
        if (!event.detail.id || this.currentProductId === event.detail.id) {
          const { orderItems } = productData.response
          const currentProduct = orderItems.find((/** @type {{ mapiProductId: any; }} */ item) => {
            return item.mapiProductId === event.detail.id && item.mapiProductId === this.currentProductId
          })
          if (currentProduct) {
            this.setVisibilityAndValue(currentProduct.amount.toString(), this.quantityField, this.addButton, this.removeButton)
          } else {
            this.setVisibilityAndValue('0', this.quantityField, this.addButton, this.removeButton)
          }
        }
      }).catch(error => console.warn(error))
    }

    this.clickListener = event => {
      event.preventDefault()
      event.stopPropagation()
    }

    this.inputListener = event => {
      const inputValue = Number(event.target.value)
      if (!inputValue || isNaN(inputValue)) return
      this.dispatchEvent(new CustomEvent(this.quantityField.getAttribute('request-event-name') || 'request-event-name',
        {
          detail: {
            amount: inputValue,
            id: event.target.getAttribute('tag'),
            productName: event.target.getAttribute('product-name')
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }
      ))
    }
  }

  connectedCallback () {
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    if (this.shouldRenderCSS()) this.renderCSS()
    this.quantityField?.addEventListener('click', this.clickListener)
    this.quantityField?.addEventListener('input', this.inputListener)
    this.setVisibilityAndValue(this.quantityField?.value, this.quantityField, this.addButton, this.removeButton)
    this.disableElements(this.disableAllElements, this.removeButton, this.addButton, this.quantityField)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.quantityField?.removeEventListener('click', this.clickListener)
    this.quantityField?.removeEventListener('input', this.inputListener)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
    :host {
        align-items: var(--align-items, center);
        animation: var(--show, show .3s ease-out);
        container: productList / inline-size;
        display: var(--display, flex);
        justify-content: var(--justify-content, flex-start);
        min-height: var(--min-height, 3em);
        width: var(--width, 100%);
      }

      a-button {
        --button-label-margin: -3px 0 0 0;
        --button-label-padding: 0;
      }

      @container productList (max-width: 10em) {
        :host input {
          margin: 0;
        }
        a-button{
          --button-height: 2em;
          --button-padding: 0;
          --button-width: 2em;
        }
      }
      
      @container productList (max-width: 7em) {
        a-button#remove{
          --button-margin: 0 0 0 -0.85em;
        }
        a-button#add{
          --button-margin: 0 -0.85em 0 0;
        }
        :host .basket-control-input {
          margin: 0 0.25em;
          padding: 0;
        }
      }
      :host(.default) {
        justify-content:space-between;
      }
      :host(.closed) input, :host(.closed) #remove {
        display:none;
      }
      :host(.closed.default) {
        justify-content:flex-end;
      }
      :host input {
        background-color: var(--quantity-background-color, transparent);
        border-radius: var(--quantity-border-radius, 0.5em);
        border: 1px solid var(--quantity-border-color, red);
        font-family: var(--quantity-font-family, inherit);
        font-size: var(--quantity-font-size, inherit);
        height: var(--quantity-height, auto);
        margin: var(--quantity-margin, 0 0.5em);
        padding: var(--quantity-padding, 0.25em);
        text-align: var(--quantity-text-align, center);
        width: var(--quantity-width, 4em);
      }
      input[type=number] {
        appearance: textfield;
      }
      /* Chrome, Safari, Edge, Opera */
      input::-webkit-outer-spin-button,
      input::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
      /* Firefox */
      input[type=number] {
        -moz-appearance: textfield;
      }
      @keyframes show {
          0%{opacity: 0}
          100%{opacity: 1}
        }
      @media only screen and (max-width: _max-width_) {
        :host {
          padding-bottom:var(--content-spacing-mobile, 0);
        }
      }
      `
    return this.fetchTemplate()
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
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'basket-control-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Sets the visibility and value of certain elements based on a given value.
   * @param {string} value - The value is the value that will be set in the input field and used as the attribute value for the addButton and removeButton elements.
   * @param inputField - The inputField parameter is the HTML input element where the value will be displayed or set.
   * @param addButton - The addButton parameter is the button element that is used to add a value to the input field.
   * @param removeButton - The `removeButton` parameter is a reference to a button element that is used to remove an item or perform a similar action.
   */
  setVisibilityAndValue (value, inputField, addButton, removeButton) {
    inputField.value = value.toString()
    addButton.setAttribute('amount', value.toString())
    removeButton.setAttribute('amount', value.toString())
    if (value === '0') {
      this.classList.add('closed')
    } else if (value === this.disableMinimum) {
      this.removeButton.setAttribute('disabled', '')
    } else {
      this.classList.remove('closed')
      this.removeButton.removeAttribute('disabled')
    }
  }

  /**
   * Disables or enables a list of elements based on the value of the `disableState` parameter.
   * @param {string} disableState - The `disableState` parameter is a string that represents the state of whether
   * the elements should be disabled or not. It can have two possible values: "true" or "false".
   * @param {HTMLElement[]} elements - The `elements` parameter is a rest parameter that allows you to pass in multiple
   * elements as arguments to the function. It can be any number of elements that you want to disable.
   */
  disableElements (disableState, ...elements) {
    const disableElements = (disableState.toLowerCase() === 'true')
    if (!disableElements) {
      Array.from(elements).forEach(element => {
        element.setAttribute('disabled', '')
      })
    }
  }

  get quantityField () {
    return this.root.querySelector('input')
  }

  get disableMinimum () {
    return this.getAttribute('disable-minimum') || 0
  }

  get removeButton () {
    return this.root.querySelector('#remove')
  }

  get addButton () {
    return this.root.querySelector('#add')
  }

  get disableAllElements () {
    return this.getAttribute('disable-all-elements') || 'false'
  }
}
