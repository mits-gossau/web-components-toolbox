// @ts-check
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Article extends Shadow() {
  constructor (...args) {
    super(...args)
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const article = urlParams.get('article')
    const articles = sessionStorage.getItem('articles') || {}

    // @ts-ignore
    const articlesData = JSON.parse(articles)
    const { items } = articlesData.data.newsEntryCollection
    this.found = items.find(e => e.slug === article)
    console.log('article', this.found)
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
  }

  disconnectedCallback () {
  }

  shouldComponentRenderHTML () {
    return !this.newsWrapper
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML () {
    this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
    this.newsWrapper = `
    <div class="article">
      <p>${new Date(this.found.date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })} - ${this.found.tags[1]}</p>
      <h1 class="font-size-big">${this.found.metaTitle}</h1>
      <p><b>${this.found.introText}</b></p>
      <div>
          <p>${window
        // @ts-ignore
        .documentToHtmlString(this.found.contentOne.json)}</p> 
          ${this.found.imageOne ? `<div><a-picture namespace="article-preview-" picture-load defaultSource="${this.found.imageOne.url}" alt="randomized image"></a-picture></div>` : ''} 
          ${this.found.contentTwo ? '<p>window.documentToHtmlString(this.found.contentTwo.json)</p>' : ''} 
          ${this.found.imageTwo ? `<div><a-picture namespace="article-preview-" picture-load defaultSource="${this.found.imageTwo.url}" alt="randomized image"></a-picture></div>` : ''} 
      </div>
     
    </div>`

    this.html = this.newsWrapper
  }

  renderCSS () {
    this.css = /* css */`
    :host ul li{
      position: var(--li-position, relative);
      padding-left: 2em;
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
}
