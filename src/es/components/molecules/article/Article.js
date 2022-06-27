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
    console.log(articlesData);
    const { items } = articlesData.data.data.newsEntryCollection;
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
    this.newsWrapper.innerText = this.found.title


    this.html = this.newsWrapper
  }

  renderCSS() {
    this.css = /* css */`
      :host  {
        display: block;
        background-color:yellow;
        height:200px;
        color:red;
      }
    `
  }
}
