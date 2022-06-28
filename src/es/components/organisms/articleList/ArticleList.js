// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class NewsList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.listArticlesListener = event => {
      this.hidden = false
      console.log("news list data", event.detail);
      this.renderHTML(event.detail.fetch)
      // sessionStorage.setItem('articles', JSON.stringify(event.detail))
    }
  }

  connectedCallback() {
    console.log("connected... NewsList");
    document.body.addEventListener('listArticles', this.listArticlesListener)
    this.hidden = true
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }


  renderHTML(articleFetch) {
    //console.log("render articles....", items);
    Promise.all([articleFetch, this.loadChildComponents()]).then(([article, child]) => {
      console.log("child components loaded....", article, child)
      const { items } = article.data.newsEntryCollection;
      console.log(items)
      items.forEach(article => {
        //console.log("child", child[0][0][1])
        //console.log("article", article);
        // @ts-ignore
        const articleEle = new child[0][1](article)
        articleEle.setAttribute('namespace', 'preview-default-')
        console.log(articleEle)
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
