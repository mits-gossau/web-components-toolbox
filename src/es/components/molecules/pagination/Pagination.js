// @ts-check
/* global self */
/* global CustomEvent */
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Pagination extends Shadow() {
  constructor (...args) {
    super(...args)

    this.pagination = this.root.querySelector('div') || document.createElement('div')
    this.listArticlesListener = event => {
      event.detail.fetch.then(() => {
        const articles = sessionStorage.getItem('articles') || ''
        const articlesData = JSON.parse(articles)
        const { total, limit, skip } = articlesData?.data.newsEntryCollection
        const pages = Math.ceil(total / limit)
        this.renderHTML(pages, limit, skip)
      })
    }

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
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
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    self.addEventListener('listArticles', this.listArticlesListener)
    this.pagination.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.pagination.removeEventListener('click', this.clickListener)
    self.removeEventListener('listArticles', this.listArticlesListener)
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML (pages, limit, skip) {
    let pageItems = ''
    for (let i = 0; i < pages; ++i) {
      const active = (skip / limit)
      pageItems += `<li class="page-item ${i === active ? 'active' : ''}" page="${i + 1}" ><a class="page-link ${i === active ? 'active' : ''}" href="#">${i + 1}</a></li>`
    }

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
    this.css = /* css */ `
    :host {
      display: block;
      background-color: black;
      height: 62px;
    }
    :host ul {
      margin: 0 0.75em 0 0;
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
    :host li.active {
      background:white;
    }
    :host nav ul li > a {
      border-top: 6px solid black;
      height:100%;
      display:flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
    }
    :host nav ul li > a.active {
      color:black;
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
      case 'pagination-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
