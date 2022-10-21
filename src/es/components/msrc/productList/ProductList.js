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
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.loadDependency().then(async msrc => {
      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      await msrc.components.articles.productList(this.msrcProductListWrapper, {
        environment: 'production',
        language: 'de',
        webAPIKey: '',
        //colCount: ['2', '2', '2', '4', '4'],
        colCount: ['3'],
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
      await /** @type {Promise<void>} */(new Promise(resolve => setTimeout(() => resolve(), 50)))
      this.html = [this.msrcProductListWrapper, this.getStyles(document.createElement('style'))]
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
        // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
        let scriptCount = 0
        const vendorsMainScript = document.createElement('script')
        vendorsMainScript.setAttribute('type', 'text/javascript')
        vendorsMainScript.setAttribute('async', '')
        vendorsMainScript.setAttribute('src', '//cdn.migros.ch/msrc/20211217102607/vendors~main.js')
        vendorsMainScript.onload = () => {
          scriptCount++
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20220914135223/main.js')
        mainScript.onload = () => {
          scriptCount++
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }


        // const styles = document.createElement('link');
        // styles.rel = 'stylesheet';
        // styles.type = 'text/css';
        // styles.href = '//cdn.migros.ch/ch.migros/v1/resources/css/basics.css';
        //   styles.media = "print"
        //   styles.onload = () => {
        //     styles.media = 'all';
        //     console.log("css loaded")
        //   };

        const styles4 = document.createElement('link');
        styles4.rel = 'stylesheet';
        styles4.type = 'text/css';
        styles4.href = 'https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css'

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

        // const styles5 = document.createElement('link');
        // styles5.rel = 'stylesheet';
        // styles5.type = 'text/css';
        // styles5.href = 'https://www.alnatura.ch/resources/templating-kit/themes/m5-bk-brand/sites/alnatura.css'

        //this.html = [vendorsMainScript, mainScript, styles, styles1, styles2, styles3, styles4]
        this.html = [vendorsMainScript, mainScript, styles4, styles1, styles2, styles3]

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
