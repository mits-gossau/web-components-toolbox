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
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
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
      :host li {
        background-color:var(--li-background-color, red);
        border-bottom: var(--li-border-bottom, 0) solid var(--background-color);
        height:var(--li-height, 100%);
        width:var(--li-width, 100%);
        transition: var(--transition, all 0.3s ease-out);
      }
      :host li:hover {
        background-color:var(--li-background-color-hover, red);
      }
      :host a-link {
        align-items:var(--a-link-align-items,center);
        display:var(--a-link-display, flex);
        flex-direction:var(--a-link-flex-direction,row);
        height:var(--a-link-height,100%);
        justify-content:var(--a-link-justify-content, flex-start);
        width:var(--a-link-width,100%);
      }
      @media only screen and (max-width: _max-width_) {}`

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
