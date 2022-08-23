// @ts-check
/* global CustomEvent */
/* global customElements */
/* global self */
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor (...args) {
    super(...args)
    this.RESOLVE_STATE = 'LOADED'
    this.listArticlesListener = event => {
      this.hidden = false
      const articlePreviewNamespace = this.getAttribute('article-preview-namespace') || 'preview-default-'
      this.loadScriptDependency().then(script => {
        if (script === this.RESOLVE_STATE) {
          this.loadDependency().then(dependency => {
            if (dependency === this.RESOLVE_STATE) {
              this.renderHTML(event.detail.fetch, articlePreviewNamespace)
            }
          })
        }
      })
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    document.body.addEventListener('listArticles', this.listArticlesListener)
    this.hidden = true
    const articleViewed = sessionStorage.getItem('article-viewed')?.toLowerCase() === 'true'
    const currentPageSkip = articleViewed ? this.getCurrentPageSkip(sessionStorage.getItem('articles') || '') : 0
    sessionStorage.removeItem('article-viewed')

    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {
        skip: currentPageSkip
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener('listArticles', this.listArticlesListener)
  }

  getCurrentPageSkip (sessionData) {
    if (sessionData === '') return 0
    const articlesData = JSON.parse(sessionData)
    const { skip, limit } = articlesData.data.newsEntryCollection
    return skip / limit
  }

  loadScriptDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-module-export')) {
        return resolve(this.RESOLVE_STATE)
      }
      const moduleExportScripts = document.createElement('script')
      moduleExportScripts.setAttribute('id', 'contentful-module-export')
      moduleExportScripts.type = 'text/javascript'
      const code = 'var exports = { "__esModule": true };'
      try {
        moduleExportScripts.appendChild(document.createTextNode(code))
        document.body.appendChild(moduleExportScripts)
        return resolve(this.RESOLVE_STATE)
      } catch (e) {
        return reject(e)
      }
    })
  }

  loadDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-renderer')) {
        return resolve(this.RESOLVE_STATE)
      }
      const contentfulRenderer = document.createElement('script')
      contentfulRenderer.setAttribute('type', 'text/javascript')
      contentfulRenderer.setAttribute('id', 'contentful-renderer')
      try {
        contentfulRenderer.setAttribute('src', self.Environment.contentfulRenderer)
        document.body.appendChild(contentfulRenderer)
        contentfulRenderer.onload = () => resolve(this.RESOLVE_STATE)
      } catch (e) {
        return reject(e)
      }
    })
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
    this.css = /* css */ `
    :host > div {
      display: var(--display, flex);
      flex-direction: var(--flex-direction, column);
      width: var(--width, 100%);
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

  renderHTML (articleFetch, namespace) {
    this.html = ''
    Promise.all([articleFetch, this.loadChildComponents()]).then(([articles, child]) => {
      const { items } = articles.data.newsEntryCollection
      const wrapper = document.createElement('div')
      items.forEach(article => {
        // @ts-ignore
        const articleEle = new child[0][1](article, { namespace })
        articleEle.setAttribute('article-url', this.getAttribute('article-url'))
        if (this.getAttribute('is-on-home') !== null) {
          articleEle.setAttribute('is-on-home', this.getAttribute('is-on-home'))
        }
        wrapper.appendChild(articleEle)
      })
      this.html = wrapper
    }).catch(e => {
      this.html = 'Error'
    })
  }

  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/articlePreview/ArticlePreview.js').then(
        module => ['m-article-preview', module.default]
      ),
      import('../../atoms/picture/Picture.js').then(
        module => ['a-picture', module.default]
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
