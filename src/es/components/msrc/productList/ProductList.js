// @ts-check
import { Prototype } from '../Prototype.js'


export default class ProductList extends Prototype() {


  _config = {
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
    return !this.msrcStoreFinderWrapper
  }

  render() {
    this.css = /* css */`
      :host { 
      }
      @media only screen and (max-width: _max-width_) {   
      }
    `
    return this.loadDependency().then(async msrc => {
      this.msrcStoreFinderWrapper = this.root.querySelector('div') || document.createElement('div')
      msrc.components.articles.productList(this.msrcStoreFinderWrapper, this._config)
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcStoreFinderWrapper, getStylesReturn[0]]
    })
  }

  // async loadStyles() {
  //   const styles3 = await document.createElement('style')
  //   styles3.textContent = '@import "https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/styles.template.css"'
  //   styles3.setAttribute('_css-msrc', '')
  //   styles3.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   //this.html = styles3

  //   const styles6 = await document.createElement('style')
  //   styles6.textContent = '@import "https://fonts.googleapis.com/css?family=PT+Sans:700"'
  //   styles6.setAttribute('_css-msrc', '')
  //   styles6.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   //this.html = styles6

  //   const styles4 = await document.createElement('style')
  //   styles4.textContent = '@import "https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css"'
  //   styles4.setAttribute('_css-msrc', '')
  //   styles4.setAttribute('protected', 'true') // this will avoid deletion by html=''
  //   //this.html = styles4
  //   return [styles3, styles6, styles4]
  // }


  // loadDependency() {
  //   return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
  //     const isMsrcLoaded = () => 'msrc' in self === true && 'utilities' in self.msrc === true && 'login' in self.msrc.utilities === true
  //     if (isMsrcLoaded()) {
  //       resolve(self.msrc) // eslint-disable-line
  //     } else {

  //       let scriptCount = 0

  //       const vendorsMainScript = document.createElement('script')
  //       vendorsMainScript.setAttribute('type', 'text/javascript')
  //       vendorsMainScript.setAttribute('async', '')
  //       vendorsMainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/vendors~main.js')
  //       vendorsMainScript.onload = () => {
  //         scriptCount++
  //         if (scriptCount >= 3) {
  //           resolve(self.msrc) // eslint-disable-line
  //         }
  //       }

  //       const mainScript = document.createElement('script')
  //       mainScript.setAttribute('type', 'text/javascript')
  //       mainScript.setAttribute('async', '')
  //       mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/main.js')
  //       mainScript.onload = () => {
  //         scriptCount++
  //         if (scriptCount >= 3) {
  //           resolve(self.msrc) // eslint-disable-line
  //         }
  //       }

  //       const productListScript = document.createElement('script')
  //       productListScript.setAttribute('type', 'text/javascript')
  //       productListScript.setAttribute('async', '')
  //       productListScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/msrc-articles/productlist.js')
  //       productListScript.onload = () => {
  //         scriptCount++
  //         if (scriptCount >= 3) {
  //           resolve(self.msrc) // eslint-disable-line
  //         }
  //       }
  //       this.html = [vendorsMainScript, mainScript, productListScript]
  //     }
  //   }))
  // }
}
