// @ts-check
/* global CustomEvent */
/* global customElements */
/* global self */
/* global sessionStorage */
/* global location */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor (...args) {
    super(...args)
    this.RESOLVE_STATE = 'LOADED'
    this.listNewsListener = event => {
      this.hidden = false
      const newsPreviewNamespace = this.getAttribute('news-preview-namespace') || 'preview-default-'
      this.loadScriptDependency().then(script => {
        if (script === this.RESOLVE_STATE) {
          this.loadDependency().then(dependency => {
            if (dependency === this.RESOLVE_STATE) {
              this.renderHTML(event.detail.fetch, newsPreviewNamespace)
            }
          })
        }
      })
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    document.body.addEventListener('listNews', this.listNewsListener)
    this.hidden = true
    const newsViewed = sessionStorage.getItem('news-viewed')?.toLowerCase() === 'true'
    let currentPageSkip = newsViewed ? this.getCurrentPageSkip(sessionStorage.getItem('news') || '') : 0
    sessionStorage.removeItem('news-viewed')
    const params = location.search.split('page=')[1] || 1
    const paramsPage = Number(params) - 1
    if (currentPageSkip !== paramsPage) {
      currentPageSkip = paramsPage
    }

    this.dispatchEvent(new CustomEvent('requestListNews', {
      detail: {
        skip: currentPageSkip,
        tag: this.getTag(sessionStorage.getItem('news') || '{}')
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    document.body.removeEventListener('listNews', this.listNewsListener)
  }

  getCurrentPageSkip (sessionData) {
    if (sessionData === '') return 0
    const newsData = JSON.parse(sessionData)
    const { skip, limit } = newsData.data.newsEntryCollection
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
      case 'news-list-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML (newsFetch, namespace) {
    // here a loading animation could be added
    Promise.all([newsFetch, this.loadChildComponents()]).then(([news, child]) => {
      const { items } = news.data.newsEntryCollection
      const wrapper = document.createElement('div')
      items.forEach(news => {
        // @ts-ignore
        const newsEle = new child[0][1](news, { namespace, mobileBreakpoint: this.mobileBreakpoint })
        newsEle.setAttribute('news-url', this.getAttribute('news-url'))
        if (this.getAttribute('is-on-home') !== null) {
          newsEle.setAttribute('is-on-home', this.getAttribute('is-on-home'))
        }
        wrapper.appendChild(newsEle)
      })
      this.html = ''
      this.html = wrapper
    }).catch(e => {
      this.html = 'Error'
    })
  }

  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../contentful/newsPreview/NewsPreview.js').then(
        module => ['m-news-preview', module.default]
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

  /**
   * Get tag from store
   * @param {string} store 
   * @returns Array
   */
  getTag(store){
    const newsData = JSON.parse(store)
    return newsData?.data?.newsEntryCollection?.tag || []
  }
}
