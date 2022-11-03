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
    theme: 'alnatura'
  }


  constructor(...args) {
    super(...args)

  }

  connectedCallback() {
    document.addEventListener("DOMContentLoaded", function () {
      console.log("run!!!!!")
    });
    // this.render()
    const styleTimeout = setInterval(() => {
      let cssText = ''

      if (Array.from(document.querySelectorAll('style[data-styled]'))) {
        Array.from(document.querySelectorAll('style[data-styled]')).forEach(componentStyle => {
          if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
            console.log("l", componentStyle.sheet.rules.length)
            Array.from(componentStyle.sheet.rules).forEach(rule => {
              cssText += rule.cssText
            })
          }
        })
      }
      //this.css = cssText
      //console.log(cssText)
    }, 3000)

    const showPromises = []
    if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldComponentRender()) showPromises.push(this.render())
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRender()) showPromises.push(this.render())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then((result) => {
        console.log("result", result)
        if (result) {
          this.html = this.getStyles(document.createElement('style'))
          this.hidden = false
        }

      })
    }
  }

  shouldComponentRender() {
    return !this.msrcProductListWrapper
  }

  render() {
    return this.loadDependency().then(async msrc => {
      this.msrcLoginButtonWrapper = this.root.querySelector('div') || document.createElement('div')
      await msrc.components.articles.productList(this.msrcLoginButtonWrapper, this.#config)
      //await new Promise(resolve => setTimeout(() => resolve(), 1000))
      //debugger
      this.html = this.msrcLoginButtonWrapper
      return this.html
    })
  }

  isMsrcLoaded() {
    return 'msrc' in self === true && 'utilities' in self.msrc === true && 'login' in self.msrc.utilities === true
  }

  loadDependency() {
    return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
      if (this.isMsrcLoaded()) {
        resolve(self.msrc) // eslint-disable-line
      } else {

        let scriptCount = 0

        const vendorsMainScript = document.createElement('script')
        vendorsMainScript.setAttribute('type', 'text/javascript')
        vendorsMainScript.setAttribute('async', '')
        vendorsMainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/vendors~main.js')
        vendorsMainScript.onload = () => {
          scriptCount++
          if (scriptCount >= 3) {
            resolve(self.msrc) // eslint-disable-line
          }
        }

        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/main.js')
        mainScript.onload = () => {
          scriptCount++
          if (scriptCount >= 3) {
            resolve(self.msrc) // eslint-disable-line
          }
        }

        const productListScript = document.createElement('script')
        productListScript.setAttribute('type', 'text/javascript')
        productListScript.setAttribute('async', '')
        productListScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/msrc-articles/productlist.js')
        productListScript.onload = () => {
          scriptCount++
          if (scriptCount >= 3) {
            resolve(self.msrc) // eslint-disable-line
          }
        }




        this.html = [vendorsMainScript, mainScript, productListScript]


      }
    }))
  }

  getStyles(style = null) {
    let cssText = ''
    /** @type {HTMLStyleElement[]} */
    let componentStyles
    if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))).length) {
      componentStyles.forEach(componentStyle => {
        if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
          Array.from(componentStyle.sheet.rules).forEach(rule => {
            cssText += rule.cssText
          })
        }
      })
      if (style) {
        style.textContent = cssText
        style.setAttribute('_css-msrc', '')
        style.setAttribute('protected', 'true') // this will avoid deletion by html=''
        return style
      }
      return cssText
    }
    return false
  }

  getCSSStyles() {
    //setTimeout(() => {

    //let count = 0;
    //const s = this.getStyles()
    // const ref = window.setInterval(_ => {
    //   console.log("tick, tack", this.getStyles())
    // }, 5000);
    // setTimeout(() => {
    //   return this.getStyles()
    // }, 5000)
    return new Promise((resolve, reject) => {
      if (Array.from(document.querySelectorAll('style[data-styled]')).length) {
        console.log("style", document.querySelectorAll('style[data-styled]'))
        console.log("ready to load")
        setTimeout(() => {
          resolve(this.getStyles(document.createElement('style')));
        }, 500);
      }
    });

    //}, 50)

  }

  setupWidget() {
    console.log("setup")

  }

}
