// @ts-check
/* global CustomEvent */
/* global customElements */
/* global self */
/* global sessionStorage */
/* global location */

import { Shadow } from '../../prototypes/Shadow.js'

export default class TagFilter extends Shadow() {
  constructor(...args) {
    super(...args)
    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
      console.log("event", event.target.text);

    }
  }

  connectedCallback() {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    const tagList = this.constructor.parseAttribute(this.getAttribute('tags') || [])
    console.log(this.getAttribute('tags'))
    if (this.shouldComponentRenderHTML()) this.renderHTML(tagList)
    this.tagFilterWrapper.addEventListener('click', this.clickListener)
  }

  disconnectedCallback() {
    this.tagFilterWrapper.removeEventListener('click', this.clickListener)
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldComponentRenderHTML() {
    return !this.tagFilterWrapper
  }

  renderCSS() {
    this.css = /* css */ `
    :host ul {
      justify-content: space-between;
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

  renderHTML(tagList) {
    if (!tagList.length) return
    this.tagFilterWrapper = this.root.querySelector('div') || document.createElement('div')
    const ul = document.createElement('ul')
    tagList.forEach(tag => {
      const li = document.createElement('li')
      li.innerHTML = `<a href="#" tag=${tag['tag']}>${tag['name']}</a>`
      ul.appendChild(li)
    })
    this.tagFilterWrapper.appendChild(ul)
    this.html = this.tagFilterWrapper
  }
}
