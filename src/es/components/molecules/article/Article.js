// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class Article extends Shadow() {
  constructor(...args) {
    super(...args)
    const queryString = window.location.search;
    console.log(queryString);
    const urlParams = new URLSearchParams(queryString);
    const article = urlParams.get('article')
    console.log(article)
    const articles = sessionStorage.getItem('articles')
    // @ts-ignore
    const articlesData = JSON.parse(articles)
    console.log("article", articlesData);
    const { items } = articlesData.data.newsEntryCollection;
    console.log(items)
    this.found = items.find(e => e.slug === article);
    console.log(this.found);
    // this.articleListener = () => {
    //   console.log("single article")
    // }
  }

  connectedCallback() {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    console.log("article connected....");
    // document.body.addEventListener('article', this.articleListener)
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
      <h1>${this.found.title}</h1>
      <p>${this.found.description}</p>
    </div>`


    this.html = this.newsWrapper
  }

  renderCSS() {
    this.css = /* css */`
      :host  {
        // display: block;
        // background-color:yellow;
        // height:200px;
        // color:red;
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
