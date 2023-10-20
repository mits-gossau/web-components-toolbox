// @ts-check

import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

export default class ProductList extends Shadow() {
  /**
   * @param options
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    // TODO: Replace with attribute value
    this.productNamespace = 'product-default-'

    this.answerEventNameListener = event => {
      this.renderHTML('loading', null, null)
      this.productNamespace = event.detail.namespace || this.productNamespace
      event.detail.fetch.then(productData => {
        const { products, total_hits: totalHits } = productData[0]
        const { orderItems } = (productData && productData[1]?.response) || {}
        if (!products) throw new Error('No Products found')
        this.renderHTML(products, totalHits, orderItems)
      }).catch(error => {
        this.html = ''
        this.html = `<span style="color:var(--color-error);">${error}</span>`
      })
    }
    this.sortEventListener = event => {
      console.log(event.target.value)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name',
      {
        detail: {
          type: 'get-active-order-items'
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }
    ))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    if (this.showSort) this.sortSelect.removeEventListener('change', this.sortEventListener)
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
      align-items: var(--align, stretch);
      container: products / inline-size;
      display: var(--display, flex);
      flex-direction:var(--flex-direction, row);
      flex-wrap: var(--flex-wrap, wrap);
      justify-content: var(--justify-content, start);
      width: 100%;
    }

    :host > m-load-template-tag {
      flex: var(--m-load-template-tag-flex, 0 0 13vw);
      margin: var(--m-load-template-tag-margin, 0 0.5em 0.5em 0);
      min-height: var(--m-load-template-tag-min-height, 12em);
      min-width: var(--m-load-template-tag-min-width, 13vw);
      width: var(--m-load-template-tag-width, 13vw);
    }

    :host .filter {
      align-items: var(--filter-align-items, center);
      align-self: var(--filter-align-self, center);
      display: var(--filter-display, inherit);
      justify-content: var(--filter-justify-content, space-between);
      margin: var(--filter-margin, 0 0 1em 0);
      min-height: var(--filter-min-height, 1em);
      width: var(--filter-width, 100%);
    }

    :host select {}

    @container products (max-width: 52em){
      :host > m-load-template-tag {
        min-height: var(--m-load-template-tag-min-height-mobile, auto);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(33% - 0.5em)));
      }
    }

    @container products (max-width: 30em){
      :host > m-load-template-tag {
        min-height: var(--m-load-template-tag-min-height-mobile, auto);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(50% - 0.5em)));
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
      case 'product-list-default-':
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
   * @param {string | any[]} productData - An array of product data objects.
   * @param {null} totalHits - The total number of products found in the search.
   * @param {any[] | null} orderItems - The `orderItems` parameter is an array that contains information about the
   * items that have been ordered. Each item in the array is an object with properties such as
   * `mapiProductId` (the ID of the product) and `amount` (the quantity of the product ordered).
   * @returns {Promise<void>} The function `renderHTML` returns a Promise.
   */
  async renderHTML (productData, totalHits, orderItems) {
    if (!productData || (productData !== 'loading' && (!Array.isArray(productData) || !productData.length))) {
      this.html = ''
      this.html = `${this.getAttribute('no-products-found-translation') || 'Leider haben wir keine Produkte zu diesem Suchbegriff gefunden.'}`
      return Promise.resolve()
    }
    let productListHeight = this.offsetHeight
    this.html = ''
    const fetchModules = this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../molecules/product/Product.js`,
        name: 'm-product'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/picture/Picture.js`,
        name: 'a-picture'
      },
      {
        path: `${this.importMetaUrl}'../../../../atoms/loading/Loading.js`,
        name: 'a-loading'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/loadTemplateTag/LoadTemplateTag.js`,
        name: 'm-load-template-tag'
      },
      {
        path: `${this.importMetaUrl}'../../../../molecules/form/Form.js`,
        name: 'm-form'
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

    // @ts-ignore
    if (productData === 'loading') {
      this.html = '<a-loading z-index="1"></a-loading>'
      const setStyleTextContent = () => {
        this.style.textContent = /* css */`
          :host {
            min-height: ${productListHeight}px;
          }
        `
      }
      let initialTimeoutId = null
      if (!productListHeight) {
        initialTimeoutId = setTimeout(() => {
          productListHeight = this.offsetHeight
          setStyleTextContent()
        }, 1000)
      }
      setStyleTextContent()
      let timeoutId = null
      let pictureLoadEventListener
      this.addEventListener('picture-load', (pictureLoadEventListener = event => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          clearTimeout(initialTimeoutId)
          this.style.textContent = ''
          this.removeEventListener('picture-load', pictureLoadEventListener)
        }, 200)
      }))
      return Promise.resolve()
    }
    return Promise.all([productData, fetchModules]).then(() => {
      const products = productData.map((/** @type {any} */ product) => {
        const activeOrderItemAmount = orderItems?.find(item => item.mapiProductId === product.id)?.amount || '0'
        return /* html */`
        <m-load-template-tag>
          <template>
            <m-product
              disable="${this.isLoggedIn}"
              tooltip-text-balance="${this.tooltipBalanceText}" 
              detail-product-link=${this.getAttribute('detail-product-link') || ''}  
              namespace=${this.productNamespace} 
              data='${escapeForHtml(JSON.stringify(product))}' 
              active-order-item-amount=${activeOrderItemAmount}>
            </m-product>
          </template>
        </m-load-template-tag>`
      })
      const divHeaderWrapper = document.createElement('div')
      divHeaderWrapper.classList.add('filter')
      const totalElement = document.createElement('div')
      totalElement.innerHTML = `${totalHits}  ${this.totalArticlesText}` || ''
      divHeaderWrapper.appendChild(totalElement)
      const showSort = this.showSort
      if (showSort) {
        const select = this.renderSort()
        divHeaderWrapper.appendChild(select)
      }
      products.unshift(divHeaderWrapper.outerHTML)
      this.html = products.join('')

      if (showSort) {
        this.sortSelect = this.root.querySelector('select')
        this.sortSelect.addEventListener('change', this.sortEventListener)
      }
    })
  }

  /**
   * Creates a div element with a select dropdown menu for sorting options.
   * @returns The `renderSort()` function returns a div element containing a select element with various sorting options.
   */
  renderSort () {
    const sortWrapper = document.createElement('div')
    this.sortSelect = `
      <m-form role="form">
        <div class="form-group">
          <select class="form-control" id="sort">
            <option disabled selected value>Trier par</option>
            <option value="asc">Prix le plus élevé</option>
            <option value="desc">Prix le plus bas</option>
            <option value="az">A-Z</option>
            <option value="za">Z-A</option>
          </select>
        </div>
      </m-form>`
    sortWrapper.innerHTML = this.sortSelect
    return sortWrapper
  }

  /**
   * The function returns a style element if it exists, otherwise it creates a new style element and
   * returns it.
   * @returns {HTMLElement} The code is returning the value of `this._style` if it exists, otherwise it is creating a
   * new `<style>` element, setting its `protected` attribute to `true`, and returning it.
   */
  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }

  get totalArticlesText () {
    return this.getAttribute('total-articles-text') || ''
  }

  get tooltipBalanceText () {
    return this.getAttribute('tooltip-translation-balance') || ''
  }

  get isLoggedIn () {
    return this.getAttribute('is-logged-in') || 'false'
  }

  get showSort () {
    return this.getAttribute('show-sort') || 'false'
  }
}
