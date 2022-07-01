// @ts-check
/* global CustomEvent */
/* global customElements */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor (...args) {
    super(...args)
    this.RESOLVE_STATES = {
      LOADED: 'LOADED',
      EXIST: 'EXIST'
    }
    this.listArticlesListener = event => {
      this.hidden = false
      const articlePreviewNamespace = this.getAttribute('article-preview-namespace') || 'preview-default-'
      this.loadScriptDependency().then(script => {
        console.log('script', script)
        if (script === this.RESOLVE_STATES.EXIST || this.RESOLVE_STATES.LOADED) {
          this.loadDependency().then(dependency => {
            console.log('dependency', dependency)
            if (dependency === this.RESOLVE_STATES.EXIST || this.RESOLVE_STATES.LOADED) {
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
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener('listArticles', this.listArticlesListener)
  }

  loadScriptDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-module-export')) {
        console.log('-----iEXPORTER---------')
        return resolve(this.RESOLVE_STATES.EXIST)
      }
      const s = document.createElement('script')
      s.setAttribute('id', 'contentful-module-export')
      s.type = 'text/javascript'
      const code = 'var exports = { "__esModule": true };'
      try {
        s.appendChild(document.createTextNode(code))
        document.body.appendChild(s)
        return resolve(this.RESOLVE_STATES.LOADED)
      } catch (e) {
        return reject(e)
      }
    })
  }

  loadDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-renderer')) {
        console.log('----RENDERER----------')
        return resolve(this.RESOLVE_STATES.EXIST)
      }
      const macroCarouselScript = document.createElement('script')
      macroCarouselScript.setAttribute('type', 'text/javascript')
      macroCarouselScript.setAttribute('id', 'contentful-renderer')
      try {
        macroCarouselScript.setAttribute('src', '//cdn.jsdelivr.net/npm/@contentful/rich-text-html-renderer@15.13.1/dist/rich-text-html-renderer.es5.min.js')
        document.body.appendChild(macroCarouselScript)
        macroCarouselScript.onload = () => resolve('loaded')
      } catch (e) {
        return reject(e)
      }
    })
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
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

  renderHTML (articleFetch, namespace) {
    this.html = ''
    Promise.all([articleFetch, this.loadChildComponents()]).then(([articles, child]) => {
      console.log('articles', articles)
      const { items } = articles.data.newsEntryCollection
      const wrapper = document.createElement('div')
      items.forEach(article => {
        // @ts-ignore
        const articleEle = new child[0][1](article, { namespace })
        articleEle.setAttribute('article-url', this.getAttribute('article-url'))
        wrapper.appendChild(articleEle)
      })
      this.html = wrapper
    }).catch(e => {
      console.log(e)
      this.html = 'error'
    })
  }

  loadChildComponents () {
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
