// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

export default class TotalPrice extends Shadow() {
  constructor (...args) {
    super(...args)
    const itemList = []
    this.answerEventNameListener = event => {
      if (this.totalPriceElement) {
        const item = {
          total: event.detail.total,
          name: event.detail.name
        }
        const currentItem = itemList.find(il => il.name === item.name)
        if (currentItem) {
          currentItem.total = item.total
        } else {
          itemList.push(item)
        }
        const priceValues = itemList.map(i => i.total)
        const totalPrice = price => price.reduce((a, b) => a + Number(b), 0)
        this.totalPriceElement.textContent = parseFloat(totalPrice(priceValues)).toFixed(2)
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > div {
        align-items: center;
        display: flex;
        flex-direction: row;
        gap:var(--gap, 1em);
        justify-content: flex-end;
      }
    `
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.totalPriceElement
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.divWrapper = document.createElement('div')
    this.divWrapper.appendChild(this.createTextContentElement(this.totalText))
    this.totalPriceElement = this.createTextContentElement('0.00')
    this.divWrapper.appendChild(this.totalPriceElement)
    this.divWrapper.appendChild(this.createTextContentElement('CHF'))
    this.html = this.divWrapper
  }

  /**
   * create a simple p element
   * @param {string} content
   * @returns
   */
  createTextContentElement (content) {
    const contentElement = document.createElement('p')
    if (content) contentElement.textContent = content
    return contentElement
  }

  get totalText () {
    return this.getAttribute('total-text') || 'Total'
  }
}
