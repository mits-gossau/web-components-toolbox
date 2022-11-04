// @ts-check
import { Prototype } from '../Prototype.js'


export default class ProductList extends Prototype() {

  // constructor(...args) {
  //   super({ mode: 'false' }, ...args)
  // }

  options = {
    "environment": 'production',
    "webAPIKey": 'ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe',
    "colCount": ["2", "2", "2", "4", "4"],
    "fallbackEmptyComponent": "Es wurde kein Produkt gefunden. Bitte versuchen Sie es später noch einmal.",
    "filterOptions": {
      "additionalQueryParams": {
        "limit": 999, "view": "browseallretailers"
      },
      "category": ["BeSS_97"],
      "fo": {
        "anchor_target": "_blank",
        "link_target": "/de/produkte/{productSlug}.html", "target": "alnatura"
      },
      "region": "gmzh"
    },
    "hideAddToShoppingList": true,
    "hideRating": false,
    "order": "asc",
    "sort": "updated_at",
    "theme": "mgb"
  }

  _config = {
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

  connectedCallback() {
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
  }

  shouldComponentRender() {
    return !this.msrcProductListWrapper
  }

  render() {
    this.css = /* css */`
    // @import url("https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/styles.template.css");
    // @import url("https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css");
    :host { }
    // :host [data-testid="msrc-articles--article-list"]{
      //   display:flex !important;
      //   box-sizing: border-box;
      //   list-style: none;
      //   padding: 0px;
      //   margin: 0px;
      //   flex-wrap: wrap;
      // }
      @media only screen and (max-width: _max-width_) {}
    `
    return this.loadDependency().then(async msrc => {
      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      msrc.components.articles.productList(this.msrcProductListWrapper, this._config)
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcProductListWrapper, getStylesReturn[0]]
    })
  }

  // loadCustomStyles() {
  //   const styles3 = document.createElement('style')
  //   styles3.textContent = '@import "https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/styles.template.css"'
  //   styles3.setAttribute('_css-msrc', '')
  //   styles3.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   this.html = styles3

  //   const styles6 = document.createElement('style')
  //   styles6.textContent = '@import "https://fonts.googleapis.com/css?family=PT+Sans:700"'
  //   styles6.setAttribute('_css-msrc', '')
  //   styles6.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   this.html = styles6

  //   const styles4 = document.createElement('style')
  //   styles4.textContent = '@import "https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css"'
  //   styles4.setAttribute('_css-msrc', '')
  //   styles4.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   console.log(styles4)
  //   this.html = styles4
  //   //return [styles3, styles6, styles4]
  // }



}
