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

  #wStyles = null
  #wWrapper = null

  async connectedCallback() {
    // const showPromises = []
    // if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
    //   setTimeout(() => {
    //     if (this.shouldComponentRender()) showPromises.push(this.render())
    //   }, Number(this.getAttribute('timeout')))
    // } else if (this.shouldComponentRender()) {
    //   showPromises.push(this.render())
    // }
    // if (showPromises.length) {
    //   //debugger
    //   this.hidden = true
    //   Promise.all(showPromises).then((data) => {
    //     console.log("show",data)
    //     this.hidden = false
    //   })
    // }


    // const showPromises = []
    // if (this.shouldComponentRender()) {
    //   showPromises.push(this.render())
    //   //showPromises.push(this.getCSSStyles())
    //   //this.render()
    //   // setTimeout(() => {
    //   //   showPromises.push(this.getCSSStyles())
    //   // }, 5000)
    // }
    // Promise.all(showPromises).then((data) => {
    //   console.log("data", data)
    //   const as = this.getCSSStyles()
    //   as?.then(x => {
    //     console.log("as", x)
    //     this.html = x
    //     this.html = data
    //   })
    // })
    
    const r = await this.render()
    console.log(r)
    if(r){
      const as = await this.getCSSStyles()
      console.log("as", as)
      
      if(as){
        this.css = as.textContent
        this.html = r
        
      }
    }

  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRender() {
    return !this.msrcProductListWrapper
  }


  render() {
    this.css = /* css */`{:host {}}`

    return this.loadDependency().then(async msrc => {
      console.log("widged wrapper", msrc)

      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      this.msrcProductListWrapper.id = 'msrc-widget'
      await msrc.components.articles.productList(this.msrcProductListWrapper, this.#config)

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
          }
        }

        this.html = [vendorsMainScript, mainScript]


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
        }, 5000);
      }
    });

    //}, 50)

  }

  setupWidget() {
    console.log("setup")

  }

}
