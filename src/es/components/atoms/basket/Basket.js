// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
 * @export
 * @class Basket
 * @type {CustomElementConstructor}
 */
export default class Basket extends Shadow() {
  constructor (...args) {
    super(...args)
    this.count = this.root.querySelector('span') || document.createElement('span')
    this.count.innerHTML = '0'
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  answerEventNameListener = event => {
    // WIP!!!
    console.log('event', event.detail)
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
    this.dispatchEvent(new CustomEvent(this.getAttribute('update-product') || 'update-product', {
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
        font-size:0.8em;
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
   * @return {void}
   */
  renderHTML () {
    this.wrapper = this.root.querySelector('div') || document.createElement('div')
    // this.count = this.root.querySelector('span') || document.createElement('span')
    // this.count.innerHTML = '0'
    this.wrapper.appendChild(this.count)
    this.basketIcon = this.root.querySelector('img') || document.createElement('img')
    this.basketIcon.setAttribute('src', this.icon)
    this.wrapper.appendChild(this.basketIcon)
    this.html = this.wrapper
  }

  get icon () {
    return this.getAttribute('icon')
  }
}
