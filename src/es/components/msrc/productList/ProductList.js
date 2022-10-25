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
  connectedCallback() {
    const showPromises = []
    if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {

        if (this.shouldComponentRender()) showPromises.push(this.render())
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRender()) {
      showPromises.push(this.render())
    }
    if (showPromises.length) {
      //debugger
      this.hidden = true
      Promise.all(showPromises).then(_ => {
        console.log("show")
        this.hidden = false
      })
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

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render() {
    this.css = /* css */`
    #msrc-widget article {
      padding: 16px;
      border: 1px solid transparent;
      background-color: rgb(255, 255, 255);
      position: relative;
      padding: 10px;
      border-radius: 4px;
      overflow: hidden;
      transition: all 150ms ease 0s;
    }
    #msrc-widget article h2 {
      color: black;
      font-size: 16px;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-weight: 800;
    }
    
    :host {
      font-family: "Helvetica Now Text", "Helvetica Now Text XBold", Helvetica, arial, sans-serif;
    }
    
    :host [data-testid="msrc-articles--article-price"] {
      color: rgb(51, 51, 51);
      font-size: 20px;
      line-height: 1.25;  
      font-weight: 800;
    }

    :host [data-testid="msrc-articles--article-description"] {
      color: rgb(118, 118, 118);
      font-size: 12px;
      line-height: 1.25;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;  
      font-weight: 400;
    }
  }`

    return this.loadDependency().then(async msrc => {
      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      this.msrcProductListWrapper.id = 'msrc-widget'
      await msrc.components.articles.productList(this.msrcProductListWrapper, {
        environment: 'production',
        language: 'de',
        webAPIKey: '',
        colCount: ['2', '2', '2', '4', '4'],
        //colCount: ['3'],
        articlesPerPage:10,
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


      })
      // wait for the styled-component to update the header stylesheet before raping it with getStyles
      await new Promise(resolve => setTimeout(() => resolve(), 150))
      this.html  = [this.msrcProductListWrapper, this.getStyles(document.createElement('style'))]
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency() {
    return this.dependencyPromise || (this.dependencyPromise = new Promise(resolve => {
      const isMsrcLoaded = () => 'msrc' in self === true && 'utilities' in self.msrc === true && 'login' in self.msrc.utilities === true
      // needs markdown
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
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211202125214/main.js')
        mainScript.onload = () => {
          scriptCount++
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }

        // const mainScript1 = document.createElement('script')
        // mainScript1.setAttribute('type', 'text/javascript')
        // mainScript1.setAttribute('async', '')
        // mainScript1.setAttribute('src', 'https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/js/main.min.js')
        // //document.body.appendChild(mainScript1)
        // mainScript1.onload = () => {
        //   scriptCount++
        //   if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        // }

        // const mainScript2 = document.createElement('script')
        // mainScript2.setAttribute('type', 'text/javascript')
        // mainScript2.setAttribute('async', '')
        // //mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20220914135223/main.js')
        // mainScript2.setAttribute('src', 'https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/js/vendor.min.js')
        // //document.body.appendChild(mainScript2)
        // mainScript2.onload = () => {
        //   scriptCount++
        //   if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        // }


        // const mainScript3 = document.createElement('script')
        // mainScript3.setAttribute('type', 'text/javascript')
        // mainScript3.setAttribute('async', '')
        // //mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20220914135223/main.js')
        // mainScript3.setAttribute('src', 'https://cdn.migros.ch/msrc/20211202125214/widget-loader.js')
        // //document.body.appendChild(mainScript2)
        // mainScript3.onload = () => {
        //   scriptCount++
        //   if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        // }


        const styles1 = document.createElement('link');
        styles1.rel = 'stylesheet';
        styles1.type = 'text/css';
        styles1.href = 'https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/styles.template.css'

        const styles2 = document.createElement('link');
        styles2.rel = 'stylesheet';
        styles2.type = 'text/css';
        styles2.href = 'https://www.alnatura.ch/.resources/m5-bk-brand-theme/2.4.2-r84b41_64/css/components.template.css'

        const styles3 = document.createElement('link');
        styles3.rel = 'stylesheet';
        styles3.type = 'text/css';
        styles3.href = 'https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/global/globalTheming.css'

        const styles4 = document.createElement('link');
        styles4.rel = 'stylesheet';
        styles4.type = 'text/css';
        styles4.href = 'https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css'


        //this.html = [vendorsMainScript, mainScript, styles, styles1, styles2, styles3, styles4]
        //this.html = [vendorsMainScript, mainScript, styles1, styles2, styles3, styles4]
        this.html = [vendorsMainScript, mainScript, styles1]

      }
    }))
  }

  /**
   * grab the msrc styles from the head style node with the attribute data-styled
   *
   * @param {HTMLStyleElement} [style=null]
   * @return {string | HTMLStyleElement | false}
   */
  getStyles(style = null) {
    let cssText = ''
    /** @type {HTMLStyleElement[]} */
    let componentStyles
    if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))).length) {
      componentStyles.forEach(componentStyle => {
        console.log(componentStyle.sheet)
        if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
          Array.from(componentStyle.sheet.rules).forEach(rule => {
            console.log(rule.cssText)
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

}
