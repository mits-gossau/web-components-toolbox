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
        this.html = ''
        if (productData.removedProducts) {
          productData.response.removedProducts = true;
        }
        this.renderHTML(productData.response)
      }).catch(error => {
        this.html = ''
        this.html = `${error}`
      })
    }
    this.clickListener = event => {
      event.preventDefault()
      event.stopPropagation()
    }

    this.inputListener = event => {
      const inputValue = Number(event.target.value)
      if (!inputValue || isNaN(inputValue)) return
      this.dispatchEvent(new CustomEvent(event.target.getAttribute('request-event-name') || 'request-event-name',
        {
          detail: {
            id: event.target.getAttribute('id'),
            productName: event.target.getAttribute('product-name'),
            price: inputValue
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }
      ))
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    document.body.addEventListener('update-basket', this.answerEventNameListener)
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
    document.body.removeEventListener('update-basket', this.answerEventNameListener)
    Array.from(this.root.querySelectorAll('input')).forEach(input => {
      input.removeEventListener('click', this.clickListener)
      input.removeEventListener('input', this.inputListener)
    })
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
        border-bottom: var(--product-item-last-border-bottom, none);
        padding-bottom:var(--product-item-last-padding-bottom, 4em);
      }
      :host .product-data {
        display: var(--product-data-display, flex);
        flex-direction: var(--product-data-flex-direction, column);
        justify-content: var(--product-data-justify-content, flex-start);
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
        background-color: var(--table-tr-with-background-background-color, #F5F5F5);
      }
      :host table td {
        text-align: var(--table-td-text-align, right);
        padding: var(--table-td-padding, 0.5em);
      }
    @media only screen and (max-width: _max-width_) {
      :host .product-item {
        padding: var(--product-item-padding-mobile, 1em 0);
      }
      :host .product-item:last-of-type {
        padding-bottom: var(--product-item-last-padding-bottom-mobile, 1em);
      }
      :host .product-image {
        margin: var(--product-image-margin-mobile, 0 0.5em);
        min-width: var(--product-image-min-width-mobile, 5em);
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
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/systemNotification/SystemNotification.js`,
        name: 'm-system-notification'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/tooltip/Tooltip.js`,
        name: 'a-tooltip'
      }
    ])

    return Promise.all([productData, fetchModules]).then(() => {
      // @ts-ignore
      if (!productData || !productData.orderItems || productData.orderItems.length === 0) {
        this.html = /* html */ `
          <m-system-notification 
              icon-src="/web-components-toolbox-migrospro/src/icons/shopping_basket.svg" 
              icon-badge="0"
              title="Panier vide">
              <div slot="description">
                <ul>
                  <li>Ajoutez des produits à votre sélection en parcourant notre catalogue.</li>
                  <li>Vous ne trouvez pas l'offre qui vous convient? Faites nous parvenir votre demande en remplissant les champs "Votre demande sur mesure" ci-dessous.</li>
                </ul>
            </div>
        </m-system-notification>
        `
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
                    ${this.renderPrice(product.productDetail.id, this.allowEditPrice, product.productDetail.price, product.productDetail.name)} 
                    <span class="name">${product.productDetail.name}</span>
                    ${product.productDetail.estimated_piece_weight ? `<span class="additional-info">${product.productDetail.estimated_piece_weight}</span>` : ''}
                    ${product.productDetail.package_size
                      ? `<span class="additional-info">${product.productDetail.package_size}${product.productDetail.unit_price ? ` &nbsp; ${product.productDetail.unit_price}` : ''}</span>`
                      : product.productDetail.unit_price
                         ? `<span class="additional-info">${product.productDetail.unit_price}</span>`
                         : ''}
                    ${product.productDetail.isWeighable ? this.renderBalanceTooltip(this.tooltipBalanceText) : ''}
                  </div>
                  <div>
                    <a-button namespace="checkout-default-delete-article-button-" request-event-name="delete-from-order" tag="${product.productDetail.id}"><a-icon-mdx icon-name="Trash" size="1.25em"></a-icon-mdx></a-button>
                  </div>
                </div>
                <div class="product-footer">
                  <m-basket-control namespace="basket-control-default-" answer-event-name="update-basket" disable-minimum="1" disable-all-elements="${this.isLoggedIn}">
                    <a-button id="remove" namespace="basket-control-default-button-" request-event-name="remove-basket" tag='${product.productDetail.id}' label="-" product-name="${product.productDetail.name}"></a-button>
                    <input id="${product.productDetail.id}" class="basket-control-input" tag=${product.productDetail.id} name="quantity" type="number" value="${product.amount}" min=0 max=9999 request-event-name="add-basket" product-name="${product.productDetail.name}">
                    <a-button id="add" namespace="basket-control-default-button-" request-event-name="add-basket" tag='${product.productDetail.id}' label="+" product-name="${product.productDetail.name}"></a-button>
                  </m-basket-control>
                  <div class="bold">${product.productTotal}</div>
                </div>
             </div>
             </div>`
        } else {
          return null
        }
      })
      // @ts-ignore
      if (productData.removedProducts) {
        this.html = /* html */ `
        <m-system-notification type="info">
        <style>
            :host {
                --svg-color: var(--m-blue-800);
                width: 100%;
                margin: 0 1em;
            }
            :host a {
                color: inherit;
            }
            :host .description > div {
                display: flex;
                align-items: center;
                gap: 0.5em;
            }

            :host .description svg {
                min-width: var(--svg-min-width, 24px);
                width: var(--svg-min-width, 24px);
            }
        </style>
        <div slot="description">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56" stroke-linejoin="round" stroke-linecap="round" stroke="currentColor" fill="none" part="svg"><path stroke-width="3.5" d="M28 18.667V28m0 9.333h.023M51.333 28c0 12.887-10.446 23.333-23.333 23.333C15.113 51.333 4.667 40.887 4.667 28 4.667 15.113 15.113 4.667 28 4.667c12.887 0 23.333 10.446 23.333 23.333Z"></path></svg>
            <p>Some products were removed</a></p>
        </div>
    </m-system-notification>
        `
      }
      this.html = products.join('')
      this.html = this.totalAndTaxes(productData)
      Array.from(this.root.querySelectorAll('input')).forEach(input => {
        input.addEventListener('click', this.clickListener)
        input.addEventListener('input', this.inputListener)
      })
    })
  }

  /**
   * Takes in a data object and returns an HTML table with various totals and taxes calculated from the data.
   * @param {object} data - The `data` parameter is an object that contains the following properties:
   * @returns {string} an HTML table with the following information:
   */
  totalAndTaxes (data) {
    const { totalTtc, totalTva1, totalTva2, totalHt, totalTtcDiscount, totalTtcWithDiscount, totalTtcTranslation, montantRabaisTranslation, totalTva1Translation, totalTva2Translation, totalHtAvecRabaisTranslation, totalTtcAvecRabaisTranslation } = data
    return /* html */ `
      <table>
        <tr class="bold">
          <td>${totalTtcTranslation}</td>
          <td>CHF ${totalTtc}</td>
        </tr>
        <tr>
          <td>${montantRabaisTranslation}</td>
          <td>CHF ${totalTtcDiscount}</td>
        </tr>
        ${totalTva1 !== '0.00'
        ? `<tr>
              <td>${totalTva1Translation}</td>
              <td>CHF ${totalTva1}</td>
            </tr>
            <tr>`
        : ''}
          ${totalTva2 !== '0.00'
        ? `<tr>
                <td>${totalTva2Translation}</td>
                <td>CHF ${totalTva2}</td>
              </tr>
              <tr>`
        : ''}
        <tr class="important">
          <td>${totalHtAvecRabaisTranslation}</td>
          <td>CHF ${totalHt}</td>
        </tr>
        <tr class="bold important with-background">
          <td>${totalTtcAvecRabaisTranslation}</td>
          <td>CHF ${totalTtcWithDiscount}</td>
        </tr>
      </table>
    `
  }

  /**
   * Returns an HTML tooltip element with an icon and text.
   * @param {string} text - The `text` parameter represents the content of the tooltip.
   * @returns HTML template string that includes a tooltip element. The tooltip element contains an
   * image and a span element with the provided text.
   */
  renderBalanceTooltip (text) {
    return /* html */ `
      <span>
        <a-tooltip>
          <div class="tooltip">
            <img class="icon-img" src="${this.importMetaUrl}./../../../../img/migrospro/label-balance.svg" alt="" />
            <span class="tooltip-text tooltip-text-icon">${text}</span>
          </div>
        </a-tooltip>
      </span>`
  }

  renderPrice (id, allowEditPrice, price, productName) {
    if (allowEditPrice) {
      return /* html */ `
          <style>
            input, *:focus-visible {
              font-size:1em;
              margin: 0;
              padding: 0.25em;
              background-color: transparent;
              border-radius: 0.5em;
              border: 1px solid var(--m-gray-300, white);
              font-family: inherit;
              height: auto;
              text-align: center;
              width: 4em;
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
          </style>
          <input id="${id}" name="price" type="number" value="${parseFloat(price).toFixed(2)}" min=0 max=9999 request-event-name="edit-product-price" product-name="${productName}">
        `
    } else {
      return `<span>${price}</span>`
    }
  }

  get isLoggedIn () {
    return this.getAttribute('is-logged-in') || 'false'
  }

  get tooltipBalanceText () {
    return this.getAttribute('tooltip-translation-balance') || ''
  }

  get allowEditPrice () {
    return this.getAttribute('allow-edit-price') || false
  }
}
