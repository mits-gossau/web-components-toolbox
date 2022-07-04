// @ts-check
/* global sessionStorage */
/* global self */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Article extends Shadow() {
  constructor (...args) {
    super(...args)
    this.RESOLVE_MSG = 'LOADED'
    const articles = this.loadArticles(window, sessionStorage)
    this.article = this.getArticle(articles.slug, articles.articles)
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (!this.article) {
      // TODO
      this.html = 'Error!'
    } else {
      this.loadScriptDependency().then(script => {
        if (script === this.RESOLVE_MSG) {
          this.loadDependency().then(dependency => {
            if (dependency === this.RESOLVE_MSG) {
              this.renderHTML()
            }
          })
        }
      })
    }
  }

  disconnectedCallback () {
  }

  loadArticles (window, sessionStorage) {
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const slug = urlParams.get('article')
    const articles = sessionStorage.getItem('articles')
    return { slug, articles }
  }

  getArticle (slug, articles) {
    if (!articles || !slug) return
    const articlesData = JSON.parse(articles)
    const { items } = articlesData.data.newsEntryCollection
    const article = items.find(item => item.slug === slug)
    return article
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML () {
    const { date, tags, introHeadline, location, introText, contentOne, imageOne, contentTwo, imageTwo } = this.article
    this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
    this.newsWrapper = `
    <div class="article">
      <p>${new Date(date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })} - ${tags[1]}</p>
      <h1 class="font-size-big">${introHeadline}</h1>
      <p><b>${location ? `${location} - ` : ''}${introText}</b></p>
      <div>
          ${contentOne
        ? `<p>${window
          // @ts-ignore
          .documentToHtmlString(contentOne.json)}</p>`
        : ''}
          ${imageOne ? `<div><a-picture namespace="article-preview-" picture-load defaultSource="${imageOne.url}" alt="randomized image"></a-picture></div>` : ''} 
          ${contentTwo
        ? `<p>${window
          // @ts-ignore
          .documentToHtmlString(contentTwo.json)}</p>`
        : ''} 
          ${imageTwo ? `<div><a-picture namespace="article-preview-" picture-load defaultSource="${imageTwo.url}" alt="randomized image"></a-picture></div>` : ''} 
      </div>
    </div>`
    this.html = this.newsWrapper
  }

  renderCSS () {
    this.css = /* css */`
    :host ul li{
      position: var(--li-position, relative);
      padding-left: var(--li-padding-left, 2em);
    }
    :host ul li::before {
      position: absolute;
      top: 10px;
      left: 8px;
      display: block;
      width: 5px;
      height: 5px;
      background-color: #97A619;
      border-radius: 50%;
      content: '';
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
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'article-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles)
    }
  }

  loadScriptDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-module-export')) resolve(this.RESOLVE_MSG)
      const moduleExportScript = document.createElement('script')
      moduleExportScript.setAttribute('id', 'contentful-module-export')
      moduleExportScript.type = 'text/javascript'
      const code = 'var exports = { "__esModule": true };'
      try {
        moduleExportScript.appendChild(document.createTextNode(code))
        document.body.appendChild(moduleExportScript)
        return resolve(this.RESOLVE_MSG)
      } catch (e) {
        return reject(e)
      }
    })
  }

  loadDependency () {
    return new Promise((resolve, reject) => {
      if (document.getElementById('contentful-renderer')) resolve(this.RESOLVE_MSG)
      const contentfulRenderer = document.createElement('script')
      contentfulRenderer.setAttribute('type', 'text/javascript')
      contentfulRenderer.setAttribute('id', 'contentful-renderer')
      try {
        contentfulRenderer.setAttribute('src', self.Environment.contentfulRenderer)
        document.body.appendChild(contentfulRenderer)
        contentfulRenderer.onload = () => resolve(this.RESOLVE_MSG)
      } catch (e) {
        return reject(e)
      }
    })
  }
}
