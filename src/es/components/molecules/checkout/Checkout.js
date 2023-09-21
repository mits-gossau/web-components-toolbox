// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

export default class Checkout extends Shadow() {
  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.answerEventNameListener = event => {
      event.detail.fetch.then(productData => {
        this.renderHTML(productData.response)
      }).catch(error => {
        this.html = ''
        this.html = `${error}`
      })
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name',
      {
        bubbles: true,
        cancelable: true,
        composed: true
      }
    ))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
      :host {
        align-items: var(--flex-start);
        display: var(--display, flex);
        flex-direction:var(--flex-direction, column);
        gap: var(--gap, 1em);
      }

      :host .product-item {
        border-bottom: var(--product-item-border-bottom, 1px) solid var(--item-border-bottom, black);
        display: var(--product-item-display, flex);
        padding: var(--product-item-padding, 2em 0);
        width: var(--product-item-width, 100%);
      }

      :host .product-item:last-of-type {
        padding-bottom:var(--product-item-last-padding-bottom, 4em);
      }

      :host .product-data {
        display: var(--product-data-display, flex);
        flex-direction: var(--product-data-flex-direction, column);
        justify-content: var(--product-data-justify-content, space-between);
        width: var(--product-data-width, 100%);
      }

      :host .product-data  span {
        display: var(--product-data-span-display, block);
        line-height: var(--product-data-span-line-height, 1.75em);
      }

      :host span.name {
        font-size: var(--span-name-font-size, 1.25em);
      }

      :host span.additional-info{
        color: var(--span-additional-info-color, black);
        font-size: var(--span-additional-info-font-size, 0.75em);
      }

      :host .product-image {
        align-items: var(--product-image-align-items, center);
        display: var(--product-image-display, flex);
        flex-direction: var(--product-image-flex-direction, column);
        margin: var(--product-image-margin, 0 1em);
        min-width: var(--product-image-min-width, 10em);
      }

      :host .product-info {
        display: var(--product-info-display, flex);
        justify-content: var(--product-info-justify-content, space-between);
        padding: var(--product-info-padding, 0 0 1em 0);
      }

      :host .product-footer {
        align-items: var(--product-footer-align-items, center);
        display: var(--product-footer-display, flex);
        justify-content: var(--product-footer-justify-content, space-between);
      }

      :host table {
        border-top: 3px solid var(--table-border-bottom-color, #E0E0E0);
      }

      :host table tr {
        border-bottom: 1px solid var(--table-tr-border-bottom-color, #E0E0E0);
      }

      :host table tr.important {
       border-bottom: 3px solid var(--table-tr-important-border-bottom-color, #E0E0E0);
      }

      :host table tr.with-background {
        background-color: var(--tr-with-background-background-color, #F5F5F5);
      }

      :host table td {
        text-align: var(--td-text-align, right);
        padding: var(--td-padding, 0.5em);
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
      case 'checkout-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * renderHTML
   *
   * @param {any[] | 'loading'} productData
   * @return {Promise<void>}
   */
  renderHTML (productData) {
    const fetchModules = this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/picture/Picture.js`,
        name: 'a-picture'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/button/Button.js`,
        name: 'a-button'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/basketControl/BasketControl.js`,
        name: 'm-basket-control'
      }
    ])

    return Promise.all([productData, fetchModules]).then(() => {
      if (!productData) {
        this.html = '<span style="color:var(--color-error);">A error has occurred. Data cannot be display</span>'
        return
      }
      // @ts-ignore
      const products = productData.orderItems.map(product => {
        if (product.productDetail) {
          return /* html */ `
            <div class="product-item">
              <div class="product-image">
                <a-picture namespace="product-checkout-" picture-load defaultSource='${product.productDetail.image}' alt='${product.productDetail.name}'></a-picture>
              </div>
              <div class="product-data">
                <div class="product-info">
                  <div>
                    <span>${product.productDetail.price}</span>
                    <span class="name">${product.productDetail.name}</span>
                    <span class="additional-info">${product.productDetail.estimatedPieceWeight || ''}</span>
                  </div>
                  <div>
                    <a-button namespace="checkout-default-delete-article-button-"  request-event-name="remove-from-order" tag="${product.productDetail.id}"><a-icon-mdx icon-name="Trash" size="1.25em"></a-icon-mdx></a-button>
                  </div>
                </div>
                <div class="product-footer">
                  <m-basket-control namespace="basket-control-default-" answer-event-name="update-basket" disable-minimum="1" disable-all-elements="${this.isLoggedIn}">
                    <a-button id="remove" namespace="basket-control-default-button-" request-event-name="remove-basket" tag='${product.productDetail.id}' label="-"></a-button>
                    <input id="${product.productDetail.id}" class="basket-control-input" tag=${product.productDetail.id} name="quantity" type="number" value="${product.amount}" min=0 max=9999 request-event-name="add-basket">
                    <a-button id="add" namespace="basket-control-default-button-" request-event-name="add-basket" tag='${product.productDetail.id}' label="+"></a-button>
                  </m-basket-control>
                  <div class="bold">${product.productTotal}</div>
                </div>
             </div>
             </div>`
        } else {
          return null
        }
      })
      this.html = products.join('')
      this.html = this.totalAndTaxes(productData)
    })
  }

  /**
   * Takes in a data object and returns an HTML table with various totals and taxes calculated from the data.
   * @param {object} data - The `data` parameter is an object that contains the following properties:
   * @returns {string} an HTML table with the following information:
   */
  totalAndTaxes (data) {
    // TODO Get values from translation-attribute
    const { totalTtc, totalHt, totalTva1, totalTva2 } = data
    return /* html */ `
      <table>
        <tr class="bold">
          <td>Total TTC</td>
          <td>${totalTtc}</td>
        </tr>
        <tr>
          <td>Montant Rabais TTC (XX %)</td>
          <td>${totalTtc}</td>
        </tr>
        <tr>
          <td>Total TVA 2.5%</td>
          <td>${totalTva1}</td>
        </tr>
        <tr>
          <td>Total TVA 7.7%</td>
          <td>${totalTva2}</td>
        </tr>
        <tr class="bold important">
          <td>Total HT avec rabais</td>
          <td>${totalHt}</td>
        </tr>
        <tr class="bold important with-background">
          <td>Total TTC avec rabais</td>
          <td>${totalTtc}</td>
        </tr>
      </table>
    `
  }

  get isLoggedIn () {
    return this.getAttribute('is-logged-in') || 'false'
  }
}
