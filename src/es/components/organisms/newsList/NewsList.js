// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class NewsList extends Shadow() {
  constructor(...args) {
    super(...args)
    this.listArticlesListener = event => {
      console.log("data", event.detail);
    }
  }

  connectedCallback() {
    console.log("connected... NewsList");
    if (this.shouldComponentRenderHTML()) this.renderHTML();
    self.addEventListener('listArticles', this.listArticlesListener)
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {},
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldComponentRenderHTML() {
    return !this.section
  }

  renderHTML() {
    Promise.all([this.loadChildComponents()]).then(result => {
      console.log("result", result)
      this.innerHTML = '<m-article></m-article>'
    })
  }


  loadChildComponents() {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../molecules/article/Article.js').then(
        module => ['m-article', module.default]
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
