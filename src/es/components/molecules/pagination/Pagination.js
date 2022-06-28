// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class Pagination extends Shadow() {
  constructor(...args) {
    super(...args)
    let skip = 0
    this.clickListener = event => {
      skip = skip + 1
      console.log("skip", skip)
      // if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
      this.dispatchEvent(new CustomEvent('requestListArticles', {
        detail: {
          skip: skip,
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback() {
    this.addEventListener('click', this.clickListener)
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    console.log("pagination connected....");
  }

  disconnectedCallback() {
  }

  shouldComponentRenderHTML() {
    return !this.pagination
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML() {
    this.pagination = this.root.querySelector('div') || document.createElement('div')
    this.pagination.innerHTML =
      `<nav>
        <ul class="pagination">
          <li class="page-item"><a class="page-link" href="#">XXX</a></li>
        </ul>
      </nav>
    `
    this.html = this.pagination
  }

  renderCSS() {
    this.css = /* css */`
      :host  {
      display: block;
      background - color: yellow;
      height: 200px;
      color: red;
    }
    `
  }
}
