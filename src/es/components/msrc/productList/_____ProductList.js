// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'



/* global self */

/**
 * Product List https://react-components.migros.ch/?path=/docs/msrc-articles-06-widgets--product-list
 * Example at: alnatura Products.html
 *
 * @export
 * @class ProductList
 * @type {CustomElementConstructor}
 * @attribute {}
 */
export default class ProductList extends Shadow() {

  #config = {
    environment: 'production',
    language: 'de',
    webAPIKey: 'ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe',
    colCount: ['2', '2', '2', '4', '4'],
    //colCount: ['3'],
    articlesPerPage: 10,
    filterOptions: {
      additionalQueryParams: {
        limit: 9,
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
    theme: 'alnatura'
  }

  connectedCallback() {

    fetch("https://web-api.migros.ch/widgets/product_fragments_json?order=asc&sort=updated_at&region=gmzh&is_variant=false&lang=de&fo%5Banchor_target%5D=_blank&fo%5Blink_target%5D=%2Fde%2Fprodukte%2F%7BproductSlug%7D.html&fo%5Btarget%5D=alnatura&facets%5Bcategory%5D=BeSS_97&limit=9&view=browseallretailers&key=ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe").then(m => {
      debugger
      console.log("m", m)
    })

    if (document.readyState == "loading") {
      document.addEventListener('DOMContentLoaded', () => console.log("loooooooooooaded"));
    }
    this.loadDependency().then(dep => {

      //https://web-api.migros.ch/widgets/product_fragments_json?order=asc&sort=updated_at&region=gmzh&is_variant=false&lang=de&fo%5Banchor_target%5D=_blank&fo%5Blink_target%5D=%2Fde%2Fprodukte%2F%7BproductSlug%7D.html&fo%5Btarget%5D=alnatura&facets%5Bcategory%5D=BeSS_97&limit=9&view=browseallretailers&key=ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe
      console.log("dependency", dep)
      const node = document.createElement('div')
      node.id = 'msrc-widget'
      this.injectMsrc(node, this.#config).then(wrapper => {
        console.log("wrapper", wrapper)
        const wait = new Promise(resolve => setTimeout(() => resolve('done'), 5000))
        wait.then(r => {
          console.log("r", r)
          const data = Array.from(document.querySelectorAll('style[data-styled]'))
          console.log(data.length)
          const styleLength = this.getHeadStyles(data)
          console.log("style length", styleLength)
        })
      })
    })
  }

  // shouldComponentRender() {
  //   return !this.msrcProductListWrapper
  // }

  render(node) {
    node = this.root.querySelector('div') || document.createElement('div')


    // return this.loadDependency().then(async msrc => {
    //   console.log("widged wrapper", msrc)

    //   this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
    //   this.msrcProductListWrapper.id = 'msrc-widget'

    //   return this.msrcProductListWrapper
    // })
  }

  isMsrcLoaded() {
    return 'msrc' in self === true && 'utilities' in self.msrc === true && 'login' in self.msrc.utilities === true
  }

  loadDependency() {
    console.log("load dependency")
    return new Promise(resolve => {
      let scriptCount = 0
      let resolved = null
      const vendorsMainScript = document.createElement('script')
      vendorsMainScript.setAttribute('type', 'text/javascript')
      vendorsMainScript.setAttribute('async', '')
      vendorsMainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/vendors~main.js')
      vendorsMainScript.onload = () => {
        scriptCount++
        if (scriptCount >= 2) {
          resolve(self.msrc) // eslint-disable-line
        }
      }
      const mainScript = document.createElement('script')
      mainScript.setAttribute('type', 'text/javascript')
      mainScript.setAttribute('async', '')
      mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/main.js')
      mainScript.onload = () => {
        scriptCount++
        if (scriptCount >= 2) {
          resolve(self.msrc) // eslint-disable-line
          resolved = "best"
        }
      }
      this.html = [vendorsMainScript, mainScript]
    })
  }

  getStyles(style) {
    console.log("getStyle fn()", style)
    let cssText = ''
    const componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))
    if (componentStyles.length) {
      console.log("cccc", componentStyles)
      componentStyles.forEach(componentStyle => {
        console.log(componentStyle.sheet.rules.length)
        if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
          Array.from(componentStyle.sheet.rules).forEach(rule => {
            //console.log(rule.cssText)
            cssText += rule.cssText
          })
        }
      })

      if (style) {
        style.textContent = cssText
        style.setAttribute('_css-msrc', '')
        style.setAttribute('protected', 'true') // this will avoid deletion by html=''
        console.log("in", cssText)
        return style
      }
      console.log("out", style)
      return cssText
    }
    return false
  }

  getCSSStyles() {
    return new Promise((resolve, reject) => {
      if (Array.from(document.querySelectorAll('style[data-styled]')).length) {
        console.log("style", document.querySelectorAll('style[data-styled]'))
        console.log("ready to load")
        setTimeout(() => {
          resolve(this.getStyles(document.createElement('style')));
        }, 500);
      }
    });


  }

  async injectMsrc(node, config) {

    // @ts-ignore
    console.log("inject done....")
    return await msrc.components.articles.productList(node, config)
    //return node
  }

  getHeadStyles(componentStyles) {
    console.log("get head styles")
    let count = 0
    componentStyles.forEach(componentStyle => {
      console.log(componentStyle.sheet.rules.length)
      count = componentStyle.sheet.rules.length
    })
    //console.log("cssText", cssText)
    return count
  }

}
