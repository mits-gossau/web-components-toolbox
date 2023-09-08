// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
 * @export
 * @class Basket
 * @type {CustomElementConstructor}
 */
export default class Basket extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.count = this.root.querySelector('span') || document.createElement('span')
    this.count.innerHTML = '0'
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    this.hidden = true
    Promise.all(showPromises).then(() => (this.hidden = false))
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  answerEventNameListener = event => {
    // WIP!!!
    console.log('basket event', event.detail)
    this.count.innerHTML = Number(this.count.innerHTML) + event.detail.length
    // console.log('type', JSON.parse(event.detail.tags))
    // const eventData = JSON.parse(event.detail.tags)
    // console.log('type', eventData[0])
    // const counter = eventData[0] === 'add' ? Number(this.count.innerHTML) + 1 : Number(this.count.innerHTML) - 1
    // this.count.innerHTML = counter
    // this.dispatchEvent(new CustomEvent(this.getAttribute('update-product') || 'update-product', {
    //   detail: {
    //     count: '20'
    //   },
    //   bubbles: true,
    //   cancelable: true,
    //   composed: true
    // }))
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-basket') || 'update-basket', {
      detail: {
        products: event.detail
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
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
    switch (this.getAttribute('namespace')) {
      case 'basket-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }])
      default:
        return Promise.resolve()
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
    ]).then(children => {
      const icon = new children[0].constructorClass({ namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
      icon.setAttribute('icon-name', 'ShoppingBasket')
      icon.setAttribute('size', '1em')
      this.wrapper = this.root.querySelector('div') || document.createElement('div')
      // this.count = this.root.querySelector('span') || document.createElement('span')
      // this.count.innerHTML = '0'
      this.wrapper.appendChild(this.count)
      this.wrapper.appendChild(icon)
      this.html = this.wrapper
    })
  }
}
