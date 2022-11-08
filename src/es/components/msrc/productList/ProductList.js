// @ts-check
import { Prototype } from '../Prototype.js'

export default class ProductList extends Prototype() {
  constructor (...args) {
    super(...args)
    this.abortController = null
    this.requestArticleCategory = event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      this.config.filterOptions.category = [event.detail.category]
      msrc.components.articles.productList(this.msrcProductListWrapper, this.config)
    }
  }

  config = {
    mode: 'default',
    environment: 'production',
    language: 'de',
    webAPIKey: 'ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe',
    colCount: ['2', '2', '2', '4', '4'],
    articlesPerPage: 10,
    filterOptions: {
      additionalQueryParams: {
        limit: 999,
        view: 'browseallretailers'
      },
      category: ['BeSS_97'],
      fo: {
        anchor_target: '_blank',
        link_target: '/de/produkte/{productSlug}.html',
        target: 'alnatura'
      },
      region: 'gmzh'
    },
    paginationOptions: {
      disabled: true
    },
    hideRating: false,
    order: 'asc',
    sort: 'updated_at',
    theme: 'mgb'
  }

  connectedCallback () {
    document.body.addEventListener('requestArticleCategory', this.requestArticleCategory)
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
  }

  disconnectedCallback () {
    document.body.removeEventListener('requestArticleCategory', this.requestArticleCategory)
  }

  shouldComponentRender () {
    return !this.msrcProductListWrapper
  }

  render () {
    return this.loadDependency().then(async msrc => {
      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      msrc.components.articles.productList(this.msrcProductListWrapper, this.config)
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcProductListWrapper, getStylesReturn[0]]
    })
  }

  renderCSS () {
    this.css = /* css */`
    :host {}
    @media only screen and (max-width: _max-width_) {}
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/fonts.css`, // no variables for this reason no namespace
        namespace: false
      }

    ]
    switch (this.getAttribute('namespace')) {
      case 'product-list-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
