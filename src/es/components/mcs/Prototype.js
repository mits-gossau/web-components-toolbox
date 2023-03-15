// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global HTMLElement */

/**
 * Prototype is a helper with a few functions for mcs digital-campaign-factory
 *
 * @export
 * @function Prototype
 * @property {
    loadDependency
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
    return this.dependencyPromise || (this.dependencyPromise = new Promise(async (resolve) => {
      const isMcsLoaded = () => 'mcs' in self === true
      // needs markdown
      if (isMcsLoaded()) {
        resolve(self.mcs) // eslint-disable-line
      } else {
        // prefetch or pre connect o the iframes src
        if (this.hasAttribute('prefetch') && !document.head.querySelector('link[href="https://digital-campaign-factory.migros.ch"]')) {
          const link = document.createElement('link')
          link.setAttribute('rel', 'dns-prefetch')
          link.setAttribute('href', 'https://digital-campaign-factory.migros.ch')
          document.head.appendChild(link)
        }
        // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        const {version} = await (await fetch('https://digital-campaign-factory.migros.ch/api/version')).json()
        mainScript.setAttribute('src', `https://digital-campaign-factory.migros.ch/static-widgets/${(self.Environment && self.Environment.mcsVersion) || version || 'v1.112.3'}/main.js`)
        mainScript.onload = () => {
          if (isMcsLoaded()) resolve(self.mcs) // eslint-disable-line
        }
        this.html = [mainScript]
      }
    }))
  }
}
