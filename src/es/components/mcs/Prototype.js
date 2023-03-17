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
        const baseUrl = (self.Environment && self.Environment.mcsBaseUrl) || 'https://digital-campaign-factory.migros.ch'
        // prefetch or pre connect o the iframes src
        if (this.hasAttribute('prefetch') && !document.head.querySelector(`link[href="${baseUrl}"]`)) {
          const link = document.createElement('link')
          link.setAttribute('rel', 'dns-prefetch')
          link.setAttribute('href', baseUrl)
          document.head.appendChild(link)
        }
        // TODO: Should Integrity check? https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        let version = self.Environment && self.Environment.mcsVersion
        if (!version) {
          try {
            version = (await (await fetch(`${baseUrl}/api/version`)).json()).version
          } catch (error) {
            console.warn(`error at ${baseUrl}/api/version fetch, falling back to old version: `, version)
          }
        }
        mainScript.setAttribute('src', `${baseUrl}/static-widgets/${version || 'v1.112.3'}/main.js`)
        mainScript.onload = () => {
          if (isMcsLoaded()) resolve(self.mcs) // eslint-disable-line
        }
        this.html = [mainScript]
      }
    }))
  }
}
