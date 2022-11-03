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
  // constructor(...args) {
  //   super(...args)
  //   console.log("boom")

  //   if (document.readyState == "loading") {
  //     console.log("reaaaaaaaaaaaaaaa")
  //     document.addEventListener('DOMContentLoaded', () => console.log("loooooooooooaded"));
  //   }

  // }

  connectedCallback() {
    document.body.addEventListener('wc-config-load', event => {
      console.log("reaaaaaaaaaaaaaaa")
      this.loadDependency().then(dep => {
        console.log("dependency", dep)
        return dep
      }).then(async e => {
        //const pl = await e.components.articles.productList()
        // console.log("pl", e)
        // console.log("eee", e.components.articles.productList().then(e => console.log("boom")))
        // console.log("wrapper", this.msrcProductListWrapper)
        this.injectMsrc(this.#config).then(wrapper => {
          console.log("rwapp", wrapper)
          if (this.shouldComponentRender()) {
            console.log("should!!!!!")
          }
          //console.log("r", r)
          const data = Array.from(document.querySelectorAll('style[data-styled]'))
          console.log("data length", data.length)
          const styleLength = this.getHeadStyles(data)
          console.log("style length", styleLength)

        })
      })


    })


  }

  shouldComponentRender() {
    return !this.msrcProductListWrapper
  }

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

  async injectMsrc(config) {
    this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
    this.msrcProductListWrapper.id = 'msrc-widget'

    // @ts-ignore
    await msrc.components.articles.productList(this.msrcProductListWrapper, config)
    this.html = this.msrcProductListWrapper
    console.log("inject done....",this.html)
    //return this.msrcProductListWrapper
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
