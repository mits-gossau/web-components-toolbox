// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global HTMLElement */

/**
 * Prototype is a helper with a few functions for msrc
 *
 * @export
 * @function Prototype
 * @property {
    loadDependency
    getStyles
  }
 * @return {CustomElementConstructor | *}
 */
export const Prototype = (ChosenHTMLElement = HTMLElement) => class Prototype extends Shadow(ChosenHTMLElement) {
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
        // prefetch or pre connect o the iframes src
        if (!document.head.querySelector('link[href="https://cdn.migros.ch"]')) {
          const link = document.createElement('link')
          link.setAttribute('rel', 'prefetch')
          link.setAttribute('href', 'https://cdn.migros.ch')
          document.head.appendChild(link)
        }
        // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20221205123932/main.js')
        mainScript.onload = () => {
          if (isMsrcLoaded()) resolve(self.msrc) // eslint-disable-line
        }
        this.html = [mainScript]
      }
    }))
  }

  /**
   * grab the msrc styles from the head style node with the attribute data-styled
   *
   * @param {HTMLStyleElement} [style=document.createElement('style')]
   * @param {number} repeats
   * @param {number} ms
   * @return {[HTMLStyleElement, Promise<HTMLStyleElement[]>]}
   */
  getStyles (style = document.createElement('style'), repeats = 5, ms = 40) {
    style.setAttribute('_css-msrc', '')
    style.setAttribute('protected', 'true') // this will avoid deletion by html=''
    /** @type {HTMLStyleElement[]} */
    const grabbedStyles = [] // grab styles only once
    /**
     * hook into any function and observe through your func the execution
     *
     * @param {any} obj
     * @param {string} prop
     * @param {()=>void} func
     * @return {boolean}
     */
    const hook = (obj, prop, func) => {
      let isHooked
      obj[`_${prop}_funcs`] = (isHooked = Array.isArray(obj[`_${prop}_funcs`])) ? obj[`_${prop}_funcs`] : [] // eslint-disable-line
      // inject function into array
      obj[`_${prop}_funcs`].push(func)
      if (isHooked) return false
      // setup hook
      obj[`_${prop}`] = obj[prop]
      obj[prop] = (...args) => {
        obj[`_${prop}`](...args) // call original function
        obj[`_${prop}_funcs`].forEach(func => func(...args)) // call hook/subscribed functions
      }
      return true
    }
    /**
     * recursively check for new style[data-styled]
     *
     * @param {string} [lastCssText='']
     * @param {number} [counter=0]
     * @return {Promise<HTMLStyleElement[]>}
     */
    const grabStyles = (lastCssText = '', counter = 0) => {
      return new Promise(resolve => {
        let cssText = ''
        /** @type {any[]} */
        let componentStyles
        if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]')).filter(
          /**
           * @param {HTMLStyleElement} componentStyle
           * @return {boolean}
           */
          componentStyle => !grabbedStyles.includes(componentStyle))).length
        ) {
          componentStyles.forEach(
            /**
              * setup Promise function
              *
              * @param {any} componentStyle
              * @return {void}
              */
            componentStyle => {
              // grab the initial style
              style.textContent += cssText = componentStyle.sheet && componentStyle.sheet.cssRules && componentStyle.sheet.cssRules.length
                ? Array.from(componentStyle.sheet.cssRules).reduce((acc, cssRule) => (acc += cssRule.cssText), '')
                : ''
              // hook/subscribe to new rules set by insertRule commands
              hook(componentStyle.sheet, 'insertRule', rule => { style.textContent += rule })
              grabbedStyles.push(componentStyle)
            }
          )
        }
        // add the initial styles to the stylesheet and keep looping to discover new styles
        if (counter < repeats || lastCssText !== cssText) return setTimeout(() => resolve(grabStyles(cssText, lastCssText === cssText ? counter + 1 : 0)), ms)
        return resolve(grabbedStyles)
      })
    }
    return [style, grabStyles()]
  }
}
