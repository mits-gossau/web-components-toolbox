// @ts-check
/* global CustomEvent */
/* global location */
/* global history */
/* global customElements */

import { Shadow } from '../../prototypes/Shadow.js'

export default class TagFilter extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A-BUTTON') return false
      event.preventDefault()

      const tag = event.target.hasAttribute('tag') ? event.target.getAttribute('tag') : ''
      const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
      url.searchParams.set('page', '1')
      url.searchParams.set('tag', tag)
      history.pushState({ ...history.state, tag, page: 1 }, document.title, url.href)

      this.setActiveItem(tag, this.root.querySelector('ul'))

      this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
        detail: {
          tag: tag !== '' ? tag.split(',') : []
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    this.answerEventNameListener = event => {
      const urlParams = new URLSearchParams(location.search)
      const tagParam = urlParams.get('tag') || ''
      this.setActiveItem(tagParam, this.root.querySelector('ul'))
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    // @ts-ignore
    const tagList = this.constructor.parseAttribute(this.getAttribute('tag') || [])
    if (this.shouldComponentRenderHTML()) this.renderHTML(tagList)
    this.tagFilterWrapper.addEventListener('click', this.clickListener)
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  disconnectedCallback () {
    this.tagFilterWrapper.removeEventListener('click', this.clickListener)
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
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
      flex-wrap:var(--flex-wrap, wrap);
    }
    :host li {
      padding:0 var(--content-spacing) var(--content-spacing) 0;
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

  /**
   * Render HTML
   * @param {Array<object>} tagList
   * @returns void
   */
  renderHTML (tagList) {
    if (!tagList.length) return
    this.loadChildComponents()
    this.tagFilterWrapper = this.root.querySelector('div') || document.createElement('div')
    const ul = document.createElement('ul')
    tagList.forEach(tagItem => {
      const li = document.createElement('li')
      li.innerHTML = `<a-button namespace="tag-filter-button-" tag="${tagItem.tag}">${tagItem.name}</a-button>`
      ul.appendChild(li)
    })
    this.tagFilterWrapper.appendChild(ul)
    this.html = this.tagFilterWrapper
  }

  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../atoms/button/Button.js').then(
        module => ['a-button', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  /**
   * Set css class for active tag item
   * @param {string} activeItem
   * @param { Element } element
   */
  setActiveItem (activeItem, element) {
    Array.from(element.querySelectorAll('a-button')).forEach(element => {
      const btn = element.shadowRoot ? element.shadowRoot.querySelector('button') : element
      if (element.getAttribute('tag') === activeItem) {
        btn && btn.classList.add('hover')
      } else {
        btn && btn.classList.remove('hover')
      }
    })
  }

  /**
   * Set URL search param
   * @param {string} param
   * @param {string} value
   * @param {object} url
   */
  setURLSearchParam (param, value, url) {
    url.searchParams.set(param, value)
  }
}
