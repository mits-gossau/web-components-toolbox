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

    this.answerEventNameListener = event => {
      console.log('update product', event.detail)
      const currentProduct = event.detail.find((/** @type {{ id: any; }} */ product) => product.id === this.currentProductId)
      if (currentProduct) {
        this.quantityField.value = currentProduct.count
      }
    }
    this.clickListener = event => {
      event.preventDefault()
    }

    this.inputListener = event => {
      this.dispatchEvent(new CustomEvent(this.quantityField.getAttribute('request-event-name') || 'request-event-name',
        {
          detail: {
            this: this,
            count: event.target.value,
            id: event.target.getAttribute('tag')
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
    if (this.shouldRenderHTML()) this.renderHTML()
    this.quantityField?.addEventListener('click', this.clickListener)
    this.quantityField?.addEventListener('input', this.inputListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.quantityField?.removeEventListener('click', this.clickListener)
    this.quantityField?.removeEventListener('input', this.inputListener)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldRenderHTML () {
    return !this.quantityField
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
    :host {
        display:flex;
        justify-content: space-between;
        align-items: center;
      }
      :host input {
        background-color: var(--quantity-background-color, transparent);
        border-radius: var(--quantity-border-radius, 0.5em);
        border: 1px solid var(--quantity-border-color, red);
        font-family: var(--quantity-font-family, inherit);
        font-size: var(--quantity-font-size, inherit);
        height:var(--quantity-height, auto);
        margin: var(--quantity-margin, 0 0.5em);
        padding: var(--quantity-margin, 0.5em);
        text-align:var(--quantity-text-align, center);
        width: var(--quantity-margin, 4em);
      }
    @media only screen and (max-width: _max-width_) {}
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
      case 'basket-control-product-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./product-/product-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * renderHTML
   */
  renderHTML () {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/button/Button.js`,
        name: 'a-button'
      }
    ])
    this.quantityField = this.root.querySelector('input')
    this.currentProductId = this.quantityField.getAttribute('id')
  }
}
