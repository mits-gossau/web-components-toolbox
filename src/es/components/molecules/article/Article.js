// @ts-check
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Article extends Shadow() {
  constructor(...args) {
    super(...args)
    const queryString = window.location.search
    const urlParams = new URLSearchParams(queryString)
    const article = urlParams.get('article')
    const articles = sessionStorage.getItem('articles')
    // @ts-ignore
    const articlesData = JSON.parse(articles)
    const { items } = articlesData.data.newsEntryCollection
    this.found = items.find(e => e.slug === article)
    console.log("article", this.found);
  }

  connectedCallback() {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
  }

  disconnectedCallback() {
  }

  shouldComponentRenderHTML() {
    return !this.newsWrapper
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML() {
    this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
    this.newsWrapper = `<div class="article">
      <p>${this.found.date}</p>
      <h1 class="font-size-big">${this.found.title}</h1>
      <p>${this.found.location} - ${window.documentToHtmlString(this.found.intro.json)} </p>
      <p>${window.documentToHtmlString(this.found.content.json)}</p>
    </div>`

    this.html = this.newsWrapper
  }

  renderCSS() {
    this.css = /* css */`
      :host  { }
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
