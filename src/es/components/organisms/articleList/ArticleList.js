// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class NewsList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.listArticlesListener = event => {
      this.hidden = false
      this.renderHTML(event.detail.fetch)
    }
  }




  connectedCallback() {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    document.body.addEventListener('listArticles', this.listArticlesListener)
    this.hidden = true
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS() {
    this.css = /* css */`
      :host {
        display:flex;
        // background-color:red;
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
      case 'article-list-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  renderHTML(articleFetch) {
    Promise.all([articleFetch, this.loadChildComponents()]).then(([article, child]) => {
      const { items } = article.data.newsEntryCollection;
      items.forEach(article => {
        // @ts-ignore
        const articleEle = new child[0][1](article, { namespace: 'preview-default-' })
        //articleEle.setAttribute('namespace', 'preview-default-')
        articleEle.setAttribute('article-url', this.getAttribute('article-url'))
        this.html = articleEle
      })
    }).catch(e => this.html = "error")
  }


  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/articlePreview/ArticlePreview.js').then(
        module => ['m-article-preview', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }
}
