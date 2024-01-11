// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * ProductCard animation
 * Example at: Checkout.js
 *
 * @export
 * @class ProductCard
 * @type {CustomElementConstructor}
 */
export default class ProductCard extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.renderHTML()
  }

  disconnectedCallback () {
    this.checkbox.removeEventListener('change', this.checkboxEventListener)
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
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */ `
    :host {
      --checkout-default-delete-article-button-padding: var(--product-delete-button-padding, 0.5em);
    }
    :host .product-item {
        border-bottom: var(--product-item-border-bottom, 1px) solid var(--item-border-bottom, black);
        display: var(--product-item-display, flex);
        font-family: var(--font-family, inherit);
        padding: var(--product-item-padding, 2em 0);
        width: var(--product-item-width, 100%);
      }
      :host .product-item:last-of-type {
        border-bottom: var(--product-item-last-border-bottom, none);
        padding-bottom:var(--product-item-last-padding-bottom, 2em);
      }
      :host .product-select {
        align-items: var(--product-select-align-items, center);
        display: var(--product-select-display, flex);
        justify-content: var(--product-select-justify-content, center);
        margin: var(--product-select-margin, 0 0.5em 0 0);
      }
      :host .product-select input {
        transform: scale(1.75);
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
      :host .product-info .product-info-action-section {
        margin: var(--product-info-action-section-margin, auto 0);
      }
      :host .product-footer {
        align-items: var(--product-footer-align-items, center);
        display: var(--product-footer-display, flex);
        justify-content: var(--product-footer-justify-content, space-between);
      }
      :host input[type="checkbox"] {
        cursor: pointer;
        accent-color: var(--checkbox-selected-background-color, #ff5b03);
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
  }

  /**
   * renderHTML
   *
   * @return {Promise<void>}
   */
  renderHTML () {
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
        path: `${this.importMetaUrl}'../../../../atoms/iconMdx/IconMdx.js`,
        name: 'a-icon-mdx'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/basketControl/BasketControl.js`,
        name: 'm-basket-control'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/systemNotification/SystemNotification.js`,
        name: 'm-system-notification'
      }
    ])

    // TODO
    const defaultProduct = {
      productDetail: {
        id: '000000000000',
        image: 'https://placehold.co/400',
        name: 'TEST PRODUCT',
        price: '999.99',
        estimatedPieceWeight: '1000kg'
      },
      amount: 99,
      totalTcc: 12.90
    }

    const product = JSON.parse(this.getAttribute('data')) || defaultProduct

    return Promise.all([fetchModules]).then(() => {
      this.setAttribute('id', product.id)
      const productPrice = product.price ? `<span>${product.price}</span>` : ''
      const productName = product.name ? `<span class="name">${product.name}</span>` : ''
      const productEstimatedPieceWeight = product.estimatedPieceWeight ? `<span class="additional-info">${product.estimatedPieceWeight}</span>` : ''
      const productAmount = product.amount
        ? `<m-basket-control namespace="basket-control-default-" answer-event-name="update-basket" disable-minimum="1" disable-all-elements="${this.isLoggedIn}">
            <a-button id="remove" namespace="basket-control-default-button-" request-event-name="remove-basket" tag='${product.id}' label="-" product-name="${product.name}"></a-button>
            <input id="${product.id}" class="basket-control-input" tag=${product.id} name="quantity" type="number" value="${product.amount}" min=0 max=9999 request-event-name="add-basket" product-name="${product.name}">
            <a-button id="add" namespace="basket-control-default-button-" request-event-name="add-basket" tag='${product.id}' label="+" product-name="${product.name}"></a-button>
          </m-basket-control>`
        : '<div></div>'
      const productTotalTcc = product.totalTcc ? `<div class="bold">${product.totalTcc.toFixed(2)}</div>` : ''

      this.html = /* html */`
        <div class="product-item">
            <div class="product-select">
              <input id="selectCheckbox" type="checkbox" value=${product} />
            </div>
            <div class="product-image">
              <a-picture namespace="product-list-" picture-load defaultSource='${product.image}' alt='${product.name}'></a-picture>
            </div>
            <div class="product-data">
                <div class="product-info">
                    <div class="product-info-data-section">
                        ${productPrice}
                        ${productName}
                        ${productEstimatedPieceWeight}
                    </div>
                    <div class="product-info-action-section">
                        <a-button namespace="checkout-default-delete-article-button-" request-event-name="delete-favorite-product-from-favorite-list" tag="${product.id}">
                          <a-icon-mdx icon-name="Trash" size="1.25em"></a-icon-mdx>
                        </a-button>
                    </div>
                </div>
                <div class="product-footer">
                    ${productAmount}
                    ${productTotalTcc}
                </div>
            </div>
        </div> 
      `
      this.checkbox.addEventListener('change', this.checkboxEventListener)
    })
  }

  checkboxEventListener = (e) => {
    if (this.checkbox.checked) {
      this.setAttribute('selected', 'true')
    } else {
      this.removeAttribute('selected')
    }
  }

  // orders dropdown
  get checkbox () {
    return this.root.querySelector('#selectCheckbox')
  }
}
