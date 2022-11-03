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
    document.addEventListener("DOMContentLoaded", function () {
      console.log("run!!!!!")
    });
  }

  connectedCallback() {

    let stylesLength = 0
    const styleCheck = setInterval(() => {
      const componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))
      console.log("componentStyles", componentStyles)

      const l2 = componentStyles[0].sheet.rules.length
      console.log("l2", l2)

      // if (stylesLength === l2) {

      //   clearInterval(styleCheck);
      //   //this.html = [r, this.getStyles(document.createElement('style'))]
      //   //return 
      // } else {
      //   stylesLength = l2
      // }
      // console.log("sc", stylesLength)


    }, 3000)



    this.render().then(r => {
      console.log("r", r)
      msrc.components.articles.productList(r, this.#config)
      //this.html = [r]

      
     

    })

  }

  // connectedCallback() {
  //   this.render().then(e => {
  //     console.log("loads")
  //     //console.log("cC", e)
  //     this.html = e
  //     return e
  //   }).then(m => {
  //     this.loadDependency().then(d => {
  //       window.msrc.components.articles.productList(m, this.#config)
  //       console.log(d,m)
  //     }).then(x => {
  //     let componentStyles
  //     let i = 0
  //     if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))).length) {
  //       componentStyles.forEach(componentStyle => {
  //         if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
  //           Array.from(componentStyle.sheet.rules).forEach(rule => {
  //             i++
  //             console.log(i, rule.cssText)
  //           })
  //         }
  //       })
  //     }
  //   })
  //   })


  // }

  // async connectedCallback() {

  //   let maxCount = 1
  //   let currentRun = 0
  //   console.log("maxVal", maxCount, currentRun)
  //   debugger



  //   setInterval(() => {
  //     let componentStyles
  //     let i = 0


  //     if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))).length) {
  //       componentStyles.forEach(componentStyle => {
  //         if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {

  //           if (maxCount === currentRun) {
  //             return
  //           } else {
  //             currentRun = 0
  //           }

  //           Array.from(componentStyle.sheet.rules).forEach(rule => {
  //             i++
  //             currentRun = i
  //             if (maxCount < i) {
  //               maxCount = i
  //             }

  //             console.log("run....................")
  //             console.log(i, maxCount, rule.cssText)

  //           })

  //         }
  //       })
  //     }
  //   },500)
  //   // const showPromises = []
  //   // if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
  //   //   setTimeout(() => {
  //   //     if (this.shouldComponentRender()) showPromises.push(this.render())
  //   //   }, Number(this.getAttribute('timeout')))
  //   // } else if (this.shouldComponentRender()) {
  //   //   showPromises.push(this.render())
  //   // }
  //   // if (showPromises.length) {
  //   //   //debugger
  //   //   this.hidden = true
  //   //   Promise.all(showPromises).then((data) => {
  //   //     console.log("show",data)
  //   //     this.hidden = false
  //   //   })
  //   // }


  //   // const showPromises = []
  //   // if (this.shouldComponentRender()) {
  //   //   showPromises.push(this.render())
  //   //   //showPromises.push(this.getCSSStyles())
  //   //   //this.render()
  //   //   // setTimeout(() => {
  //   //   //   showPromises.push(this.getCSSStyles())
  //   //   // }, 5000)
  //   // }
  //   // Promise.all(showPromises).then((data) => {
  //   //   console.log("data", data)
  //   //   const as = this.getCSSStyles()
  //   //   as?.then(x => {
  //   //     console.log("as", x)
  //   //     this.html = x
  //   //     this.html = data
  //   //   })
  //   // })

  //   //this.hidden = true
  //   const r = await this.render()
  //   await msrc.components.articles.productList(this.msrcProductListWrapper, this.#config)
  //   console.log(r)
  //   if (r) {
  //     //  console.log("wrap", wrap)
  //     this.html = r
  //     const styles = await this.getCSSStyles()
  //     console.log("styles", styles)
  //     if (styles) {
  //       this.css = styles.textContent
  //       //this.hidden = false
  //     }
  //   }
  // }

  shouldComponentRender() {
    return !this.msrcProductListWrapper
  }

  render() {
    //this.css = /* css */`{:host {}}`

    return this.loadDependency().then(msrc => {
      console.log("widged wrapper", msrc)

      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      this.msrcProductListWrapper.id = 'msrc-widget'
      

      //await new Promise(resolve => setTimeout(() => resolve(), 50))
      //new Promise(resolve => setTimeout(() => resolve(), 50))
      //this.html = [this.msrcProductListWrapper, this.getStyles(document.createElement('style'))]
      //this.html = this.msrcProductListWrapper

      // wait for the styled-component to update the header stylesheet before raping it with getStyles
      //await new Promise(resolve => setTimeout(() => resolve(), 50))
      //this.html  = [this.msrcProductListWrapper, this.getStyles(document.createElement('style'))]

      // setTimeout(()=>{
      //   this.html = this.getStyles(document.createElement('style'))
      //   this.hidden=false
      // },5000)

      return this.msrcProductListWrapper
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
