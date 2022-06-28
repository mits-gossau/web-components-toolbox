// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class ArticlePreview extends Shadow() {
  constructor(article, ...args) {
    super(...args)
    this.namespace = args[0]['namespace']
    this.article = article || null
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
    this.newsWrapper.innerHTML = `
    <o-wrapper namespace="${this.namespace}">
      <div class="article-preview">
          <h3><a class="link" href="/src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/molecules/navigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/pages/News.html&article=${this.article.slug}">${this.article.slug}</a></h3>
          <p>${this.article.description}</p>
        </div>
    </o-wrapper>
  `


    this.html = this.newsWrapper


  }

  renderCSS() {
    this.css = /* css */`
      :host > div {
        border-width: 0 0 2px;
        border-image: url(/src/img/border-dotted.png) 0 0 2 0 repeat;
        border-style: dotted;
        border-color: #ddd;
        padding: 2em 0;
        }
      }
      @media only screen and (max-width: _max-width_) { 
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
      case 'preview-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
