// @ts-check
/* global customElements */

import { Mutation } from '../../prototypes/Mutation.js'

export default class TagFilter extends Mutation() {
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mutationObserverInit: { childList: true },
      ...options,
    }, ...args)

    this.answerEventListener = event => {
      const tagsFetch = event.detail[this.getAttribute('tag-detail-property-name') || 'tag-detail-property-name']
      if (event.detail.clearSubTags) this.html = ''
      if (tagsFetch) {
        tagsFetch.then(data => {
          this.renderHTML(data, event)
          this.scrollIntoView()
        })
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    // @ts-ignore
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventListener)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventListener)
  }

  mutationCallback (mutationList, observer) {
    this.setAttribute('count-children', Array.from(this.root.children).filter(child => child.tagName !== 'STYLE').length)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  shouldRenderHTML () {
    return !this.tagFilterWrapper
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
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
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'tag-filter-vertical-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./vertical-/vertical-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'tag-filter-horizontal-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./horizontal-/horizontal-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @param {Array<object>} tagList
   * @param {CustomEvent} [event=null]
   * @returns void
   */
  renderHTML (tagList, event = null) {
    if (!tagList || !tagList.length) return
    this.loadChildComponents()
    this.html = ''
    tagList.forEach(tagItem => {
      // TODO: fix attribute naming to harmonize with api
      this.html = `<a-button
          namespace="button-category-"
          tag="${tagItem.code}"
          answer-event-name="${this.getAttribute('answer-event-name') || ''}"
          request-event-name="${this.getAttribute('request-event-name') || ''}"
          active-detail-property-name="${this.getAttribute('active-detail-property-name') || ''}"
        >${tagItem.name}</a-button>`
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
