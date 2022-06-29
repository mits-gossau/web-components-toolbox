// @ts-check
/* global CustomEvent */
/* global customElements */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.listArticlesListener = event => {
      this.hidden = false
      const articlePreviewNamespace = this.getAttribute('article-preview-namespace') || 'preview-default-'
      this.renderHTML(event.detail.fetch, articlePreviewNamespace)
    }
  }

  connectedCallback() {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    document.body.addEventListener('listArticles', this.listArticlesListener)
    this.hidden = true
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS() {
    this.css = /* css */`
    :host > div {
      display: var(--display, flex);
      flex-direction: var(--flex-direction, column);
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
      case 'article-list-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML(articleFetch, namespace) {

    Promise.all([articleFetch, this.loadChildComponents()]).then(([article, child]) => {
      const { items } = article.data.newsEntryCollection
      const wrapper = document.createElement('div')
      items.forEach(article => {
        // @ts-ignore
        const articleEle = new child[0][1](article, { namespace })
        // articleEle.setAttribute('namespace', 'preview-default-')
        articleEle.setAttribute('article-url', this.getAttribute('article-url'))
        // this.html = articleEle
        wrapper.appendChild(articleEle)
      })
      this.html = wrapper
    }).catch(e => {
      this.html = 'error'
    })
  }

  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/articlePreview/ArticlePreview.js').then(
        module => ['m-article-preview', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }
}
