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
        console.log('productData', productData)
        this.renderHTML(productData.products)
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
        align-items: flex-start;
        display:flex;
        flex-direction: column;
        gap:1em; 
      }
      
      :host .product-item {
        border-bottom:1px solid var(--item-border-bottom, black); 
        display:flex;
        padding:1em 0;
        width:100%;
      }

      :host .product-data {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        width:100%;
      }

      :host .product-data  span {
        display:block;
      }

      :host span.name {
        font-size:1.25em;
      }

      :host span.additional-info{
        font-size:0.75em;
        color:var(--additional-info-color, black);
      }

      :host .product-image {
        align-items: center;
        display: flex;
        flex-direction: column;
        margin: 0 1em;
        min-width: 6em;
      }

      :host .product-info {
        display:flex;
        justify-content: space-between;
        padding:0 0 1em 0;
      }

      :host .product-footer {
        align-items: center;
        display:flex;
        justify-content: space-between;
      }

      /*:host .basket {
        display:flex;
        align-items: center;
      }*/

      /*:host .quantity {
        align-items: center;
        border-radius: 4px;
        border: 1px solid var(--quantity-border, black);
        display: flex;
        font-size: 14px;
        height: 24px;
        justify-content: center;
        padding: 4px 24px;
        width: 24px;
        margin:1em;
      }*/

      /*:host #quantity {
        align-items: center;
        background-color: var(--input-quantity-background-color, transparent);
        border-radius: var(--input-quantity-border-radius, 0.5em);
        border: 1px solid var(--input-quantity-border, red);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        font-family: var(--input-quantity-font-family, inherit);
        font-size: var(--input-quantity-font-size, inherit);
        justify-content: center;
        margin: 0 0.5em;
        padding: 0.5em;
        width: 4em;
      }*/
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

    const escapeForHtml = (htmlString) => {
      return htmlString
        .replaceAll(/&/g, '&amp;')
        .replaceAll(/</g, '&lt;')
        .replaceAll(/>/g, '&gt;')
        .replaceAll(/"/g, '&quot;')
        .replaceAll(/'/g, '&#39;')
    }

    return Promise.all([productData, fetchModules]).then(() => {
      // @ts-ignore
      const products = productData.map(product => /* html */`
      <div class="product-item">
        <div class="product-image">
          <a-picture namespace="product-checkout-" picture-load defaultSource='${product.image.original}' alt='${product.accessible_information_text}'></a-picture>
        </div>
        <div class="product-data">
          <div class="product-info">
            <div><span>3.23</span><span class="name">Happy Bread IP-SUISSE · Dunkles Brot · Geschnitten</span><span class="additional-info">350 g 6.86/kg</span></div>
            <div><a-button namespace="checkout-default-delete-article-button-"  request-event-name="remove-basket" tag="1"><a-icon-mdx icon-name="Trash" size="1.25em"></a-icon-mdx></a-button> </div>
          </div>
          <div class="product-footer">
            <m-basket-control namespace=basket-control-default->
              <a-button namespace="basket-control-default-button-" request-event-name="remove-basket" tag="1" label="-"></a-button>
              <input id="quantity" name="quantity" type="text">
              <a-button namespace="basket-control-default-button-" request-event-name="add-basket" tag="2" label="+"></a-button>
            </m-basket-control>
            <div>4.434</div>
          </div>
        </div>
      </div>    
      `)
      this.html = products.join('')
    })
  }
}
