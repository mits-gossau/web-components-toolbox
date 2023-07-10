// @ts-check
/* global CustomEvent */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.answerEventNameListener = event => {
      event.detail.fetch.then(productData => {
        console.log(productData["products"])
        this.renderHTML(productData["products"].map(p => p.name))
      })
    }
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback() {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  shouldRenderHTML() {
    return !this.listWrapper
  }

  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS() {
    this.css = /* css */ `
    :host {
      display:flex:
    }
    @media only screen and (max-width: _max-width_) {}
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
      case 'product-list-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML(productData) {
    this.listWrapper = document.querySelector('div') || document.createElement('div')
    this.listWrapper.innerText = JSON.stringify(productData, null, 2)
    this.html = this.listWrapper
  }
}
