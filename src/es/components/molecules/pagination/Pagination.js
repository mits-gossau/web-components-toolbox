// @ts-check
/* global CustomEvent */
/* global sessionStorage */
import { Shadow } from '../../prototypes/Shadow.js'

export default class Pagination extends Shadow() {
  constructor (...args) {
    super(...args)
    const articles = sessionStorage.getItem('articles')
    // @ts-ignore
    const articlesData = JSON.parse(articles)
    const { total, limit, skip } = articlesData?.data.newsEntryCollection
    console.log('skip ', skip)
    this.pages = Math.ceil(total / limit)
    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
      console.log(event.target.textContent - 1)
      this.dispatchEvent(new CustomEvent('requestListArticles', {
        detail: {
          skip: event.target.textContent - 1
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.nav = this.root.querySelector('.pagination')
    this.nav.addEventListener('click', this.clickListener)
    console.log('pagination connected....')
  }

  disconnectedCallback () {
    this.nav.removeEventListener('click', this.clickListener)
  }

  shouldComponentRenderHTML () {
    return !this.pagination
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML () {
    let pageItems = ''
    for (let i = 0; i < this.pages; ++i) {
      pageItems += `<li class="page-item" page="${i + 1}"><a class="page-link" href="#">${i + 1}</a></li>`
    }

    this.pagination = this.root.querySelector('div') || document.createElement('div')
    this.pagination.innerHTML =
      `<nav>
        <ul class="pagination">
          ${pageItems}
        </ul>
      </nav>
    `
    this.html = this.pagination
  }

  renderCSS () {
    this.css = /* css */`
    :host {
      display: block;
      background-color: black;
      height: 62px;
    }
    :host ul {
      margin: 0;
      float: right;
      display:flex;
    }
    :host li {
      display: inline;
      width: 60px;
      height: 54px;
      padding: 0;
      border: 0;
      font-size: 1.2em;
      position:relative;
    }
    :host li::after {
      position:absolute;
      top: 9px;
      left: 0;
      width: 1px;
      height: 43px;
      background-color: #bbb;
      content: '';
    }
    :host nav ul li > a {
      border-top: 6px solid black;
      height:100%;
      display:flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    :host nav ul li > a:hover {
      border-top: 6px solid #97A619;
    }
     @media only screen and (max-width: _max-width_) {}
    `

    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'preview-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
