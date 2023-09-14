// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * @export
 * @class Basket
 * @type {CustomElementConstructor}
 */
export default class Basket extends Shadow() {
  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    document.body.addEventListener(this.getAttribute('active-order-item-event-name') || 'active-order-item-event-name', this.activeOrderItemEventNameListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    document.body.removeEventListener(this.getAttribute('active-order-item-event-name') || 'active-order-item-event-name', this.activeOrderItemEventNameListener)
  }

  answerEventNameListener = (/** @type {{ detail: { fetch: Promise<any>; }; }} */ event) => {
    event.detail.fetch.then((/** @type {{ response: { allOrderItemProductTotal: any; }; }} */ productData) => {
      this.count.textContent = productData.response.allOrderItemProductTotal
    }).catch((/** @type {any} */ error) => {
      this.count.textContent = '0'
      this.html = `${error}`
    })
  }

  activeOrderItemEventNameListener = (/** @type {{ detail: { fetch: Promise<any>; }; }} */ event) => {
    event.detail.fetch.then((/** @type {{ response: { allOrderItemProductTotal: any; }; }[]} */ activeItems) => {
      this.count.textContent = activeItems[1].response.allOrderItemProductTotal
    }).catch((/** @type {any} */ error) => {
      this.count.textContent = '0'
      this.html = `${error}`
    })
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
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.basketIcon
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display:block;
      }
      :host div {
        background-color:#f5f5f5;
        border-radius:1.6em;
        padding:0.8em;
        display:flex;
      }
      :host div:hover {
        cursor: pointer;
        background-color:#E0E0E0;
      }
      :host img {
        height:1.2em;
      }
      :host span {
        min-width:1.2em;
        font-size:0.7em;
        padding:0 0.25em;
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
      case 'basket-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}../iconMdx/IconMdx.js`,
        name: 'a-icon-mdx'
      }
    ]).then((/** @type {{ constructorClass: new (arg0: { namespace: any; namespaceFallback: any; mobileBreakpoint: any; }) => any; }[]} */ children) => {
      const icon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
      icon.setAttribute('icon-name', 'ShoppingBasket')
      icon.setAttribute('size', '1em')
      this.wrapper = this.root.querySelector('div') || document.createElement('div')
      this.wrapper.appendChild(this.count)
      this.wrapper.appendChild(icon)
      this.html = this.wrapper
    })
  }

  /**
   * The function returns a span element with a text content of '0'.
   * @returns The `count` method is returning an HTML `span` element.
   */
  get count () {
    const element = this.root.querySelector('span') || document.createElement('span')
    element.textContent = '0'
    return element
  }
}
