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
        // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity 
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20221108103958/main.js')
        mainScript.onload = () => {
          if (isMsrcLoaded()) resolve(self.msrc) // eslint-disable-line
        }
        this.html = [mainScript, mainScript]
      }
    }))
  }

  /**
   * grab the msrc styles from the head style node with the attribute data-styled
   *
   * @param {HTMLStyleElement} [style=document.createElement('style')]
   * @return {[HTMLStyleElement, Promise<string>]}
   */
  getStyles (style = document.createElement('style'), repeats = 25, ms = 200) {
    style.setAttribute('_css-msrc', '')
    style.setAttribute('protected', 'true') // this will avoid deletion by html=''
    const grabStyles = (lastCssText = '', counter = 0) => {
      return new Promise(resolve => {
        let cssText = ''
        /** @type {HTMLStyleElement[]} */
        let componentStyles
        if ((componentStyles = Array.from(document.querySelectorAll('style[data-styled]'))).length) {
          componentStyles.forEach(componentStyle => {
            if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length) {
              Array.from(componentStyle.sheet.rules).forEach(rule => (cssText += rule.cssText))
            }
          })
        }
        if (counter < repeats || lastCssText !== cssText) {
          return setTimeout(() => {
            if (lastCssText === cssText) {
              counter++
            } else {
              counter = 0
              style.textContent = cssText
            }
            resolve(grabStyles(cssText, counter))
          }, ms)
        }
        return resolve(style.textContent = cssText)
      })
    }
    return [style, grabStyles()]
  }
}
