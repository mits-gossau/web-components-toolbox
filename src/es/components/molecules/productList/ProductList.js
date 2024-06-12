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
      this.renderHTML('loading', null, null, '')
      this.productNamespace = event.detail.namespace || this.productNamespace
      event.detail.fetch.then(productData => {
        const { products, total_hits: totalHits, sort } = productData[0]
        const { orderItems } = (productData && productData[1]?.response) || {}
        if (!products) throw new Error('No Products found')
        this.renderHTML(products, totalHits, orderItems, sort)
      }).catch(error => {
        this.html = ''
        this.html = `<span style="color:var(--color-error);">${error}</span>`
      })
    }

    this.sortEventListener = event => {
      this.dispatchEvent(new CustomEvent('request-list-product',
        {
          detail: {
            type: 'sort-articles',
            sortOrder: event.target.value
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
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name',
      {
        detail: {
          type: 'get-active-order-items',
          searchterm: this.getAttribute('searchterm')
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
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
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
      flex: var(--m-load-template-tag-flex, 0 0 min(calc(16.66% - 0.5em)));
      margin: var(--m-load-template-tag-margin, 0 0.5em 0.5em 0);
      min-height: var(--m-load-template-tag-min-height, 25em);
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

    @container products (max-width: 80em) {
      :host > m-load-template-tag  {
        min-height: var(--m-load-template-tag-min-height-mobile, 22em);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(20% - 0.5em)));
      }
    }

    @container products (max-width: 60em){
      :host > m-load-template-tag {
        min-height: var(--m-load-template-tag-min-height-mobile, 22em);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(25% - 0.5em)));
      }
    }

    @container products (max-width: 40em){
      :host > m-load-template-tag {
        min-height: var(--m-load-template-tag-min-height-mobile, 22em);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(33.33% - 0.5em)));
      }
    }

    @container products (max-width: 30em){
      :host > m-load-template-tag {
        min-height: var(--m-load-template-tag-min-height-mobile, 22em);
        min-width: var(--m-load-template-tag-min-width-mobile, min(calc(50% - 0.5em)));
      }
    }

    @media only screen and (max-width: _max-width_) {
      :host > m-load-template-tag {
        flex: var(--m-load-template-tag-flex-mobile, 1 1 35%);
      }
      :host::after{
        display: block;
        width: 50%;
        height: auto;
        clear: both;
        content: '';
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
   * @param {string} sort - Sort order
   * @returns {Promise<void>} The function `renderHTML` returns a Promise.
   */
  async renderHTML (productData, totalHits, orderItems, sort) {
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
        path: `${this.importMetaUrl}'../../../../molecules/systemNotification/SystemNotification.js`,
        name: 'm-system-notification'
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
        const select = this.renderSort(sort)
        divHeaderWrapper.appendChild(select)
      }

      if (!this.isLoggedIn) this.html = this.renderNotification('info')

      products.unshift(divHeaderWrapper.outerHTML)
      this.html = products.join('')

      if (showSort) {
        this.sortSelect = this.root.querySelector('select')
        this.sortSelect.addEventListener('change', this.sortEventListener)
      }
    })
  }

  /**
   * Return a system notification component with a description
   * containing a message and a link.
   * @param {string} type - The "type" parameter is used to specify the type of notification to be rendered. It
   * is passed as an argument to the "renderNotification" function.
   * @returns a string that represents an HTML template for a system notification. The template
   * includes a slot for the description and a link to the login/registration page. The type of the
   * notification is determined by the "type" parameter passed to the function.
   */
  renderNotification (type) {
    return `
    <m-system-notification type="${type}">
      <style>
        :host {
          --svg-color:var(--m-blue-800);
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
          <p>Les fonctionnalités d'ajout au panier et de passation de commande ne sont disponibles que pour les utilisateurs enregistrés. Se connecter / Créer son compte <a href="/login">Login/registre</a></p>
      </div>
    </m-system-notification>`
  }

  /**
   * Creates a select element with options for sorting and returns it wrapped in a div.
   * @param {string} sortValue - The current selected value for sorting. It can be
   * one of the following values: 'default', 'asc', 'desc', 'az', or 'za'.
   * @returns a div element containing a select element with options for sorting values.
   */
  renderSort (sortValue) {
    // TODO: Refactor - Use translation attribute
    const options = {
      default: 'Trier par',
      asc: 'Prix le plus bas',
      desc: 'Prix le plus élevé',
      az: 'Nom A - Z',
      za: 'Nom Z - A'
    }

    const selected = Object.keys(options).find(key => key === sortValue)

    const sortList = document.createElement('select')
    sortList.classList.add('form-control')
    sortList.id = 'sort'

    for (const key in options) {
      const option = document.createElement('option')
      option.value = key
      option.text = options[key]
      if (key === selected) option.setAttribute('selected', 'selected')
      sortList.appendChild(option)
    }

    this.sortSelect = `
      <m-form role="form">
        <div class="form-group">
          ${sortList.outerHTML} 
        </div>
      </m-form>
    `
    const sortWrapper = document.createElement('div')
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
    return (this.getAttribute('is-logged-in').toLowerCase() === 'true') || false
  }

  get showSort () {
    return this.getAttribute('show-sort') || false
  }
}
