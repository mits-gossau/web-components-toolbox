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
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.answerEventNameListener = event => {
      console.log('update product', event.detail.products.length, this.quantity)
      this.quantity = (Number(this.quantity.innerText) + event.detail.products.length).toString()
    }
  }

  connectedCallback() {
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  disconnectedCallback() {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldRenderHTML() {
    return !this.productImage
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the m-Teaser css
   *
   * @return {Promise<void>}
   */
  renderCSS() {
    this.css = /* css */`
    :host {
        box-shadow:0px 0px 12px 0px rgba(51, 51, 51, 0.10);
        display:block;
        height:100%;
        margin:0 0 calc(var(--content-spacing)/2) 0;
        /*padding:0 1em;*/
      }

      :host > a {
        height:100%;
      }

      :host > a > div {
        box-sizing: border-box;
        display: flex;
        flex-direction: column; 
        height:100%;
        padding:calc(var(--content-spacing)/2);
      }

      :host > a > div > div {
        margin-bottom: var(--content-spacing);
        padding: calc(var(--content-spacing)/2);
      }

      :host .basket-utils {
        align-items: center;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        max-height: 3em;
        min-height: 3em;
        padding: calc(var(--content-spacing) / 2) 0;
        width: 100%;
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
        min-height: 7em;
        margin:0;
        padding: 0 calc(var(--content-spacing)/2);
      }

      :host .product-price {
        display: block;
        font-size: 1.25em;
        font-weight: bold;
      }

      :host .product-name {
        display: block;
        font-size: 0.85em;
        font-weight: bold;
      }

      :host .product-data {
        flex: 1;
        margin: 0;
      }

      :host .footer-label-data {
        align-items: flex-start;
        align-self: flex-end;
        display: flex;
        flex-direction: column;
        margin: 0;
        width: 100%;
      }

      :host .unit-price {
        color: var(--unit-price-color, black);
        font-size: 0.75em;
        line-height: 1.5em;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      :host .footer-label-data > img {
        height: 1.5em;
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
  fetchTemplate() {
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
  renderHTML() {
    this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/button/Button.js`,
        name: 'a-button'
      }
    ])

    const productCard = document.createElement('div')

    productCard.innerHTML = /* html */ `
      ${this.createBasketUtilsElement(this.productData.id)}
      ${this.createProductImageElement(this.productData.image.original, this.productData.accessible_information_text)}
      ${this.createProductDataElement(this.productData.price, this.productData.brand?.name, this.productData.name, this.productData.unit_price, this.productData.isWeighable)}`

    productCard.innerHTML += `${this.createFooterLabels(this.productData.isWeighable)}`

    const a = document.createElement('a')
    a.href = `${this.getAttribute('detail-product-link') || ''}?${this.productData.slug}`
    a.appendChild(productCard)

    this.html = a

    /* setting the initial value. This property is used to keep track of the quantity of the product */
    this.quantity = '0'
  }

  get quantity() {
    return this.root.querySelector('.quantity')
  }

  set quantity(quantity) {
    if (this.quantity) this.quantity.innerText = quantity
  }

  /**
   * The function creates a HTML element for a basket utility with buttons to add and remove items.
   * @param {string} productInfo - The `productInfo` parameter is a variable that contains information about a
   * product. It could include details such as the product name, price, image, and any other relevant information.
   * @returns {string} an HTML element as a string. The returned element is a div with the class "basket-utils"
   * containing two buttons and a div with the class "quantity". The buttons have different request event
   * names and tags based on the provided productInfo.
   */
  createBasketUtilsElement(productInfo) {
    return /* html */ `
      <div class="basket-utils">
      <a-button namespace="button-tertiary-" request-event-name="remove-basket" tag='${productInfo}' label="-"></a-button>
      <div class="quantity"></div>
      <a-button namespace="button-tertiary-" request-event-name="add-basket" tag='${productInfo}' label="+"></a-button>
      </div>`
  }

  /**
   * The function creates a product image element with the specified image source and alt text.
   * @param {string} imageSrc - The image source URL or path. This is the location of the image file that will be displayed.
   * @param {string} alt - The "alt" parameter is used to specify the alternative text for the image. This text
   * is displayed if the image cannot be loaded or if the user is using a screen reader. It should
   * provide a concise description of the image.
   * @returns an HTML string that represents a product image element.
   */
  createProductImageElement(imageSrc, alt) {
    return /* html */ `
      <div class="product-image">
        <a-picture namespace="product-default-" picture-load defaultSource='${imageSrc}' alt='${alt}'></a-picture>
      </div>`
  }

  /**
   * The function creates an HTML element for displaying product data, including price, brand, name, and
   * unit price if applicable.
   * @param {string} price - The price of the product.
   * @param {string} brand - The `brand` parameter represents the brand of the product.
   * @param {string} name - The name parameter represents the name of the product.
   * @param {string} unitPrice - The `unitPrice` parameter represents the price per unit of the product.
   * @param {string} isWeighable - A boolean value indicating whether the product is weighable or not.
   * @returns an HTML string that represents a product data element.
   */
  createProductDataElement(price, brand, name, unitPrice, isWeighable) {
    return /* html */ `
      <div class="product-data">
        <span class="product-price">${price}</span>
        <span class="product-brand">${brand}</span>
        <span class="product-name">${this.deleteBrandFromName(name, brand)}</span>
        <span class="unit-price">${isWeighable ? unitPrice : ''}</span>
      <div>
    `
  }

  /**
   * The function `createFooterLabels` returns a string of HTML code that includes footer icons, based on
   * the value of the `isWeighable` parameter.
   * @param {string} isWeighable - A boolean value indicating whether the item is weighable or not.
   * @returns an HTML string that includes a div element with the class "footer-label-data" and the
   * result of calling the "createFooterIcons" function.
   */
  createFooterLabels(isWeighable) {
    if (!isWeighable) return ''
    return /* html */ `
      <div class="footer-label-data">
        ${this.createFooterIcons()}
      </div>`
  }

  /**
   * The function creates a footer icon by returning an HTML image tag.
   * @returns an HTML string that includes an image tag with the source attribute set to
   * "../../src/img/migrospro/label-balance.svg" and an empty alt attribute.
   */
  createFooterIcons() {
    return `<img src="${this.importMetaUrl}./../../../../img/migrospro/label-balance.svg" alt="" />`
  }

  /**
   * The function retrieves and parses the value of the 'data' attribute of an element.
   * @returns the parsed JSON data from the 'data' attribute.
   */
  get productData() {
    const pd = this.getAttribute('data') || ''
    return JSON.parse(pd)
  }

  /**
   * The function removes the brand-name from a given full product name string.
   * @param {string} name - The name parameter is a string that represents a full product name.
   * @param {string} brand - The `brand` parameter is the name of the brand that you want to delete from the `name` string.
   * @returns the modified name after removing the brand from it.
   */
  deleteBrandFromName(name, brand) {
    const index = name.indexOf(brand)
    if (index === -1) return name
    return name.slice(index + brand.length).trim()
  }
}
