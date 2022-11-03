// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class ProductList extends Shadow() {

  constructor(...args) {
    super(...args)
    this.loadEvent = event => {
      debugger
      console.log("load event")
    }
  }

  connectedCallback() {
    document.addEventListener("DOMContentLoaded", this.loadEvent)





    this.loadDependency().then(d => {
      console.log("loaded", d)
      this.render().then(h => {
        console.log("h", h)
        this.html = h
      }).then(r => {

       
        const styles3 = document.createElement('link');
        styles3.rel = 'stylesheet';
        styles3.type = 'text/css';
        styles3.href = 'https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/styles.template.css'
        this.html = styles3
      
        const styles4 = document.createElement('link');
        styles4.rel = 'stylesheet';
        styles4.type = 'text/css';
        styles4.href = 'https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css'        
        this.html = styles4


        const styles5 = document.createElement('link');
        styles5.rel = 'stylesheet';
        styles5.type = 'text/css';
        styles5.href = 'https://fonts.googleapis.com/css?family=PT+Sans:700'
        this.html = styles5
      

      

        const styleCheck = setInterval(() => {
          //let st = this.getStyles()
          //console.log(st)
          //this.css = st

          let componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))
          console.log("componentStyles", componentStyles)

          const l2 = componentStyles[0].sheet.rules.length
          console.log("l2", l2)
          

          let cssText = ''
          if (componentStyles.length) {
            console.log("2222", componentStyles)
            componentStyles.forEach(componentStyle => {
              console.log("ööö", componentStyle.sheet.rules.length)
              if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
                Array.from(componentStyle.sheet.rules).forEach(rule => {
                  //console.log(rule.cssText)
                  cssText += rule.cssText
                })
              }
            })
          }



          this.css = cssText
          // // st += cssText
          // //this.css = st
          // const sty = this.getStyles(document.createElement('style'))
          // console.log(".....",sty)
          // this.html = sty




        }, 5000)
      })




    })
  }

  // shouldComponentRender() {
  //   return !this.msrcProductListWrapper
  // }

  render() {
    return new Promise(resolve => {
      console.log("render start")
      this.msrcWrapper = this.root.querySelector('div') || document.createElement('div')
      this.msrcWrapper.className = "ui-js-product-list"
      this.msrcWrapper.setAttribute('id', "msrc-options")
      this.msrcWrapper.setAttribute('data-setup', '{"colCount":["2","2","2","4","4"],"fallbackEmptyComponent":"Es wurde kein Produkt gefunden. Bitte versuchen Sie es später noch einmal.","filterOptions":{"additionalQueryParams":{"limit":999,"view":"browseallretailers"},"category":["BeSS_97"],"fo":{"anchor_target":"_blank","link_target":"/de/produkte/{productSlug}.html","target":"alnatura"},"region":"gmzh"},"hideAddToShoppingList":true,"hideRating":false,"order":"asc","sort":"updated_at","theme":"mgb"}')

      this.widget = this.root.querySelector('div') || document.createElement('div')
      this.widget.setAttribute("id", "msrc-widget")

      this.msrcWrapper.appendChild(this.widget)
      
      
      //this.html = this.msrcWrapper
      
      const setup = JSON.parse(this.msrcWrapper.dataset.setup)
      setup.webAPIKey = 'ZDsjzNwaw9AxGQWhzqMCsnjwYzwpQ7dzigdKXeuuiXeR97ao4phWLRwe2WrZRoPe'
      setup.environment = 'production'
      setup.mode = 'default'
      window.msrc.components.articles.productList(this.widget, setup)
      
      resolve(this.msrcWrapper)

    })





  }



  loadDependency() {
    return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
      const isMsrcLoaded = () => 'msrc' in self === true && 'utilities' in self.msrc === true && 'login' in self.msrc.utilities === true
      if (isMsrcLoaded()) {
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
        console.log("llllll", componentStyle.sheet.rules.length)
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
        //console.log("in", cssText)
        return style
      }
      console.log("out", style)
      return cssText
    }
    return false
  }

}
