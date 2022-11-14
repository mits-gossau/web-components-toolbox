// @ts-check
/* global CustomEvent */
/* global self */
/* global location */
/* global history */

import { Shadow } from '../../prototypes/Shadow.js'

export default class TagFilter extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
      this.resetURLPageParam()
      this.dispatchEvent(new CustomEvent('requestListNews', {
        detail: {
          tag: event.target.hasAttribute('tag') ? event.target.getAttribute('tag') !== '' ? event.target.getAttribute('tag').split(',') : [] : []
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    const tagList = this.constructor.parseAttribute(this.getAttribute('tag') || [])
    if (this.shouldComponentRenderHTML()) this.renderHTML(tagList)
    this.tagFilterWrapper.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.tagFilterWrapper.removeEventListener('click', this.clickListener)
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldComponentRenderHTML () {
    return !this.tagFilterWrapper
  }

  renderCSS () {
    this.css = /* css */ `
    :host ul {
      justify-content: flex-start;
      flex-wrap: wrap;
    }
    :host li {
      padding:0 2rem 1rem 0;
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
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'tag-filter-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML (tagList) {
    if (!tagList.length) return
    this.tagFilterWrapper = this.root.querySelector('div') || document.createElement('div')
    const ul = document.createElement('ul')
    tagList.forEach(tagItem => {
      const li = document.createElement('li')
      li.innerHTML = `<a href="#" tag=${tagItem.tag}>${tagItem.name}</a>`
      ul.appendChild(li)
    })
    this.tagFilterWrapper.appendChild(ul)
    this.html = this.tagFilterWrapper
  }

  /**
   * Reset url param 'page=' to default value 'page=1'
   * @param {string} locationURL
   */
  resetURLPageParam (locationURL = self.location.href) {
    const url = new URL(locationURL, locationURL.charAt(0) === '/' ? location.origin : locationURL.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    url.searchParams.set('page', '1')
    history.pushState('1', document.title, url.href)
  }
}
