// @ts-check
/* global CustomEvent */

import { Shadow } from '../../prototypes/Shadow.js'

export default class NewsList extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.RESOLVE_STATE = 'LOADED'
    this.answerEventNameListener = event => {
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
    if (this.shouldRenderCSS()) this.renderCSS()
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.hidden = true
    Promise.all([this.loadScriptDependency(), this.loadDependency()]).then(() => this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
      bubbles: true,
      cancelable: true,
      composed: true
    })))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
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
        contentfulRenderer.setAttribute('src', `${this.importMetaUrl}../../controllers/contentful/rich-text-html-renderer.es5.min.js`)
        document.body.appendChild(contentfulRenderer)
        contentfulRenderer.onload = () => resolve(this.RESOLVE_STATE)
      } catch (e) {
        return reject(e)
      }
    })
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */ `
    :host > div {
      display: var(--display, flex);
      flex-direction: var(--flex-direction, column);
      width: var(--width, 100%);
    }
    @media only screen and (max-width: _max-width_) {}
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
      case 'news-list-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML (newsFetch, namespace) {
    // here a loading animation could be added
    Promise.all([
      newsFetch,
      this.fetchModules([
        {
          path: `${this.importMetaUrl}../../contentful/newsPreview/NewsPreview.js`,
          name: 'm-news-preview'
        },
        {
          path: `${this.importMetaUrl}../../atoms/picture/Picture.js`,
          name: 'a-picture'
        }
      ])
    ]).then(([news, child]) => {
      const { items } = news
      const wrapper = document.createElement('div')
      items.forEach(news => {
        // @ts-ignore
        const newsEle = new child[0].constructorClass(news, { namespace, mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
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
}
