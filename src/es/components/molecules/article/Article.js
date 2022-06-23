// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class Article extends Shadow() {
  constructor(article, ...args) {
    super(...args)
    console.log("article", article)
    this.article = article || null
  }

  connectedCallback() {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    console.log("article connected....");
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
    this.newsWrapper.innerText = this.article.slug
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
