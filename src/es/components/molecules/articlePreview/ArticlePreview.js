// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class ArticlePreview extends Shadow() {
  constructor(article, ...args) {
    super(...args)
    console.log("article preview", article)
    this.article = article || null
    // this.articleListener = () => {
    //   console.log("click")
    //   this.dispatchEvent(new CustomEvent('article', {
    //     detail: {},
    //     bubbles: true,
    //     cancelable: true,
    //     composed: true
    //   }))
    // }
  }

  connectedCallback() {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    console.log("article preview connected....");
    // this.link = this.root.querySelector('a')
    // console.log(this.link)
    // this.link.addEventListener("click", this.articleListener)
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
    this.newsWrapper.innerHTML = `
      <div class="article-preview">
          <h1><a class="link" href="/src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/molecules/navigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/pages/News.html&article=${this.article.slug}">${this.article.slug}</a></h1>
          <p>${this.article.description}</p>
      </div>
    `
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
