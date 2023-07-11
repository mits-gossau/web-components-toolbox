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
        display:flex;
        flex-direction: column;
        justify-content: space-between;
        align-items: flex-start;
        background-color:var(--m-white);
        width: 17vw;
        border-radius: 8px;
        box-shadow: 0px 0px 12px 0px rgba(51, 51, 51, 0.10);
        margin:0 0 var(--content-spacing) 0;
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
    this.basketUtils = this.root.querySelector('.basket-utils') || document.createElement('div')
    this.basketUtils.innerText = 'Basket Add, etc.'
    this.productImage = this.root.querySelector('.product-image') || document.createElement('div')
    this.productImage.innerHTML = `<a-picture defaultSource='${this.pd.transparent_image.src}' alt=''></a-picture>`
    this.productData = this.root.querySelector('.product-data') || document.createElement('div')
    this.productData.innerText = `${this.pd.price_info?.price}\n${this.pd.name}`
    this.html = this.basketUtils
    this.html = this.productImage
    this.html = this.productData
  }

  get pd () {
    const pd = this.getAttribute('data') || ''
    return JSON.parse(pd)
  }
}
