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
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
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
        --img-height:10vw;
        align-items:flex-start;
        background-color:var(--m-white);
        border-radius:8px;
        box-shadow:0px 0px 12px 0px rgba(51, 51, 51, 0.10);
        display:flex;
        flex-direction:column;
        justify-content:space-between;
        margin:0 0 var(--content-spacing) 0;
        width:13vw;
      }
      :host .basket-utils {
       padding:calc(var(--content-spacing) / 2); 
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
        padding:calc(var(--content-spacing) / 2); 
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
    this.html = this.createBasketUtilsElement()
    this.html = this.createProductImageElement(this.productData.image.retina_src, this.productData.accessible_information_text)
    this.html = this.createProductDataElement(this.productData.price_info?.price, this.productData.name)
  }

  createBasketUtilsElement () {
    const div = document.createElement('div')
    div.classList.add('basket-utils')
    div.innerText = 'Basket Add, etc.'
    return div
  }

  createProductImageElement (imageSrc, alt) {
    const div = document.createElement('div')
    div.classList.add('product-image')
    div.innerHTML = `<a-picture defaultSource='${imageSrc}' alt='${alt}'></a-picture>`
    return div
  }

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

  get productData () {
    const pd = this.getAttribute('data') || ''
    console.log(JSON.parse(pd))
    return JSON.parse(pd)
  }
}
