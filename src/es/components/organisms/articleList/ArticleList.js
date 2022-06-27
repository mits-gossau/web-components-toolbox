// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class NewsList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.listArticlesListener = event => {
      console.log("news list data", event.detail);
      this.renderHTML(event.detail)
      sessionStorage.setItem('articles', JSON.stringify(event.detail))
    }
  }

  connectedCallback() {
    console.log("connected... NewsList");
    self.addEventListener('listArticles', this.listArticlesListener)
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }


  renderHTML(articles) {
    const { items } = articles.data.data.newsEntryCollection;
    console.log("render articles....", items);
    Promise.all([this.loadChildComponents()]).then(child => {
      console.log("child components loaded....", child)
      items.forEach(article => {
        //console.log("child", child[0][0][1])
        //console.log("article", article);
        // @ts-ignore
        const articleEle = new child[0][0][1](article)
        console.log(articleEle)
        this.html = articleEle
      })
    })
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
