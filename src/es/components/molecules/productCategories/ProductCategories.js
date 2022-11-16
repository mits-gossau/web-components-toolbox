// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

export default class ProductCategories extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A-LINK') return false
      event.preventDefault()
      this.dispatchRequestCategoriesEvent(event.target.getAttribute('category'))
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.categoriesNavigation.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.categoriesNavigation.removeEventListener('click', this.clickListener)
  }

  dispatchRequestCategoriesEvent (category) {
    this.dispatchEvent(new CustomEvent('requestArticleCategory', {
      detail: {
        category
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldComponentRenderHTML () {
    return !this.categoriesNavigation
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML () {
    this.categoriesNavigation = this.root.querySelector('ul')
    this.html = this.categoriesNavigation
  }

  renderCSS () {
    this.css = /* css */ `
        :host ul {
            padding:0;
            list-style:none;
        }
        :host a-link {
            align-items: center;
            display: flex;
            flex-direction: row;
            height: 3.5em;
            justify-content: flex-start;
            width: 100%;
        }
        :host li {
            background-color: #fefce5;
            border-bottom: 4px solid var(--background-color);
            height: 3.5em;
            width: 100%;
        }
        :host li:hover {
            color: #fefce5;
            background-color: var(--color-secondary);
        }
        @media only screen and(max-width:_max-width_) {
            :host li {}
        }`

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
      case 'categories-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
