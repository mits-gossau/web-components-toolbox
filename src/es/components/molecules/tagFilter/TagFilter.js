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
      const tag = event.target.hasAttribute('tag') ? event.target.getAttribute('tag') : ''
      const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
      url.searchParams.set('page', '1')
      url.searchParams.set('tag', tag)
      history.pushState({ ...history.state, tag, page: 1 }, document.title, url.href)
    }
    this.answerEventListener = event => {
      const tagsFetch = event.detail[this.getAttribute('tag-detail-property-name') || 'tag-detail-property-name']
      if (tagsFetch) {
        tagsFetch.then(async response => {
          if (response.status >= 200 && response.status <= 299) {
            const data = await response.json()
            return this.renderHTML(data)
          }
          throw new Error(response.statusText)
        })
      }
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    // @ts-ignore
    if (this.shouldComponentRenderHTML()) this.renderHTML(this.constructor.parseAttribute(this.getAttribute('tag') || []))
    // TODO: history / params stuff
    /* this.tagFilterWrapper.addEventListener('click', this.clickListener) */
    if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventListener)
  }

  disconnectedCallback () {
    this.tagFilterWrapper.removeEventListener('click', this.clickListener)
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventListener)
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldComponentRenderHTML () {
    return !this.tagFilterWrapper
  }

  renderCSS () {
    this.css = /* css */ `
      :host {
        display: var(--display, flex);
        flex-wrap:var(--flex-wrap, wrap);
        gap: var(--gap, 0.25em);
        width: 100%;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          flex-wrap:var(--flex-wrap, wrap);
        }
      }
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
      case 'tag-filter-vertical-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./vertical-/vertical-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'tag-filter-horizontal-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./horizontal-/horizontal-.css`, // apply namespace since it is specific and no fallback
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
    if (!tagList || !tagList.length) return
    this.loadChildComponents()
    this.html = ''
    const request = this.getAttribute('request-event-name')
    const answer = this.getAttribute('answer-event-name')
    tagList.forEach(tagItem => {
      // TODO: fix attribute naming to harmonize with api
      this.html = `<a-button namespace="button-category-" tag="${tagItem.code}" request-event-name="${request}" answer-event-name="${answer}">${tagItem.name}</a-button>`
    })
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
   * Set URL search param
   * @param {string} param
   * @param {string} value
   * @param {object} url
   */
  setURLSearchParam (param, value, url) {
    url.searchParams.set(param, value)
  }
}
