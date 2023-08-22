// @ts-check

import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

export default class ProductList extends Shadow() {
  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.productNamespace = 'product-default-'
    this.answerEventNameListener = event => {
      this.renderHTML('loading')
      this.productNamespace = event.detail.namespace || this.productNamespace
      event.detail.fetch.then(productData => {
        // remove the shitty html mui stuff
        const products = productData.products.map(({ html, ...keepAttrs }) => keepAttrs)
        this.renderHTML(products)
      }).catch(error => {
        this.html = ''
        this.html = `Error: ${error}`
      })
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.renderHTML('loading')
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
      display: flex;
      flex-wrap: wrap;
      flex-direction:var(--flex-direction, row);
      justify-content: space-between;
      gap:1em;
    }
    /* TODO: a-picture needs aspect ratio to lazy load after the fold */
    :host > * {
      min-height: 10em;
      min-width: 7em;
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
      case 'product-list-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'product-list-checkout-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./checkout-/checkout-.css`, // apply namespace since it is specific and no fallback
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
      const products = productData.map((/** @type {any} */ product, i) => /* html */`
        <m-load-template-tag>
          <template>
            <m-product detail-product-link=${this.getAttribute('detail-product-link') || ''} answer-event-name="update-product" namespace=${this.productNamespace} data='${escapeForHtml(JSON.stringify(product))}'></m-product>
          </template>
        </m-load-template-tag>`)
      this.html = products.join('')
    })
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
}
