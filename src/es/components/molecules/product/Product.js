// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Product
 * @type {CustomElementConstructor}
 */
export default class Product extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.quantity = null

    this.answerEventNameListener = event => {
      console.log('update product', event.detail.products.length, this.quantity)
      this.quantity.innerText = event.detail.products.length.toString()
    }
  }

  connectedCallback () {
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldRenderHTML () {
    return !this.productImage
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the m-Teaser css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
    :host {
        --img-max-height:8vw;
        --img-min-height:10vw;
        --img-max-width:10vw;
        --img-min-width:10vw;
        align-items:flex-start;
        background-color:var(--m-white);
        border-left:.5em solid transparent;
        border-radius:8px;
        border-right:.5em solid transparent;
        box-shadow:0px 0px 12px 0px rgba(51, 51, 51, 0.10);
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        margin:0 0 var(--content-spacing) 0;
        
      }
      :host .basket-utils {
        align-items: center;
        display:flex;
        flex-direction: row;
        justify-content: space-between;
        padding:calc(var(--content-spacing) / 2); 
        width:100%;
      }
      :host .quantity {
        align-items: center;
        border-radius: 4px;
        border: 2px solid  #333;
        display: flex;
        flex-shrink: 0;
        font-size: 14px;
        height: 24px;
        justify-content: center;
        padding: 1px;
        width: 24px;
      }
      :host .product-image {
        padding:0 var(--content-spacing);
        align-self:center;
      }
      :host .product-price{
        display:block;
        font-size:1.25em;
        font-weight: bold;
      }
      :host .product-name{
        display:block;
        font-size:0.85em;
        font-weight: bold;
      }
      :host .product-data {
        min-height:5em;

      }
      @media only screen and (max-width: _max-width_) {
        :host {}
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
      case 'product-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/button/Button.js`,
        name: 'a-button'
      }
    ])
    this.html = this.createBasketUtilsElement(this.productData.tracking_information)
    this.html = this.createProductImageElement(this.productData.image.original, this.productData.accessible_information_text)
    this.html = this.createProductDataElement(this.productData.price, this.productData.name)
    this.quantity = this.root.querySelector('.quantity')
    this.quantity.innerText = '0'
  }

  /**
   * The function creates a div element with buttons for adding and removing items from a basket, along
   * with a quantity display.
   * @param productInfo - The `productInfo` parameter is a variable that contains information about a
   * product. It could include details such as the product name, price, and any other relevant
   * information that you want to display in the basket utils element.
   * @returns a div element with the class "basket-utils" and inner HTML that includes two buttons and a
   * div with the class "quantity".
   */
  createBasketUtilsElement (productInfo) {
    const div = document.createElement('div')
    div.classList.add('basket-utils')
    div.innerHTML = `
      <a-button namespace="button-tertiary-" request-event-name="add-basket" tag='${productInfo}'>+</a-button>
        <div class="quantity"></div>
      <a-button namespace="button-tertiary-" request-event-name="remove-basket" tag='${productInfo}'>-</a-button>`
    return div
  }

  /**
   * The function creates a div element with a product image inside, using the provided image source and
   * alt text.
   * @param imageSrc - The image source URL for the product image.
   * @param alt - The "alt" parameter is a string that represents the alternative text for the image. It
   * is used to provide a textual description of the image for users who are visually impaired or when
   * the image cannot be displayed.
   * @returns a div element with a class of "product-image" and an innerHTML that includes an "a-picture"
   * element with the specified image source and alt text.
   */
  createProductImageElement (imageSrc, alt) {
    const div = document.createElement('div')
    div.classList.add('product-image')
    div.innerHTML = `<a-picture namespace="product-default-" picture-load defaultSource='${imageSrc}' alt='${alt}'></a-picture>`
    return div
  }

  /**
   * The function creates a div element with two spans inside,
   * one for the price and one for the name, and returns the div element.
   * @param price - The price parameter is the price of the product.
   * It can be a number or a string representing the price value.
   * @param name - The name parameter is a string that represents the name of the product.
   * @returns a div element with two child span elements. The first span element has a class of
   * "product-price" and its inner text is set to the value of the "price" parameter. The second span
   * element has a class of "product-name" and its inner text is set to the value of the "name"
   * parameter.
   */
  createProductDataElement (price, name) {
    const div = document.createElement('div')
    div.classList.add('product-data')
    const priceSpan = document.createElement('span')
    priceSpan.classList.add('product-price')
    priceSpan.innerText = price
    div.appendChild(priceSpan)
    const nameSpan = document.createElement('span')
    nameSpan.classList.add('product-name')
    nameSpan.innerText = name
    div.appendChild(nameSpan)
    return div
  }

  /**
   * The function retrieves and parses the value of the 'data' attribute of an element.
   * @returns the parsed JSON data from the 'data' attribute.
   */
  get productData () {
    const pd = this.getAttribute('data') || ''
    return JSON.parse(pd)
  }
}
