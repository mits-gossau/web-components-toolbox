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
  connectedCallback () {
    const showPromises = []
    if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldComponentRender()) showPromises.push(this.render())
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRender()) showPromises.push(this.render())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRender () {
    return !this.msrcProductListWrapper
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    this.css = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.loadDependency().then(async msrc => {
      this.msrcProductListWrapper = this.root.querySelector('div') || document.createElement('div')
      
      await msrc.components.articles.productList(this.msrcProductListWrapper, {
        environment: 'local',
        language: 'de',
        webAPIKey: '',
        articlesPerPage: 6
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
  loadDependency () {
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
        this.html = [vendorsMainScript, mainScript]
      }
    }))
  }

  /**
   * grab the msrc styles from the head style node with the attribute data-styled
   *
   * @param {HTMLStyleElement} [style=null]
   * @return {string | HTMLStyleElement | false}
   */
  getStyles (style = null) {
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

  get scripts () {
    return this.root.querySelectorAll('script')
  }
}
