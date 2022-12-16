// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */
/* global history */
/* global location */

export default class Categories extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A-BUTTON') return false
      event.preventDefault()
      history.replaceState && history.replaceState(
        null, '', location.pathname + location.search.replace(/[?&]tag=[^&]+/, '').replace(/^&/, '?')
      )
      const element = event.target.hasAttribute('category') ? event.target.getAttribute('category') : ''
      this.setActiveItem(element, this.root.querySelector('ul'))
      const category = event.target.getAttribute('category')
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
        detail: {
          category
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
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
        padding-bottom: var(--li-padding-bottom, 0);
      }
      :host li > a-button {
        width:var(--a-button-width, 100%);
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

  setActiveItem (activeItem, element) {
    Array.from(element.querySelectorAll('a-button')).forEach(element => {
      const btn = element.shadowRoot ? element.shadowRoot.querySelector('button') : element
      if (element.getAttribute('category') === activeItem) {
        btn && btn.classList.add('hover')
      } else {
        btn && btn.classList.remove('hover')
      }
    })
  }
}
