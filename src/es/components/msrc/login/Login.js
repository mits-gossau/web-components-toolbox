// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Login https://react-components.migros.ch/?path=/story/msrc-login-03-widgets-login-button--button-large
 * Example at: alnatura Home.html
 *
 * @export
 * @class Login
 * @type {CustomElementConstructor}
 * @attribute {
 *  {"de"|"fr"|"it"|"en"} [language="de"]
 *  {string|DeepPartial<ThemeInterface>|
 *    "melectronics"|
 *    "bikeworld"|
 *    "daily"|
 *    "doitGarden"|
 *    "exlibris"|
 *    "exlibrispickmup"|
 *    "interio"|
 *    "micasa"|
 *    "migrosService"|
 *    "sportxx"|
 *    "migipedia"|
 *    "migrosApp"|
 *    "alnatura"|
 *    "gesundheitsplattform"|
 *    "intercity"|
 *    "famigros"|
 *    "migrosbank"|
 *    "pickmup"|
 *    "voi"|
 *    "fitnesspark"|
 *    "mgb"|
 *    "migusto"} [theme="alnatura"]
 *  {"large"|"medium"|"small"} [size="small"]
 *  {string} [loginReturnTo="self.location"]
 *  {string} [logoutReturnTo="self.location"]
 *  {string|Partial<{
 *    env: 'local|test|production',
 *    oidcClientId: string,
 *    oidcClientSecret: string,
 *    oidcRedirectURI: string,
 *    oidcSilentRedirectURI: string,
 *    oidcScope: string,
 *    oidcLoginUrl: string,
 *    oidcClaims: OIDCClaims,
 *    language: string,
 *    responseType: string,
 *  }>} [config="{'en': 'local'}"]
 * }
 */
export default class Login extends Shadow() {
  connectedCallback () {
    const showPromises = []
    if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldComponentRenderHTML()) showPromises.push(this.render())
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRenderHTML()) showPromises.push(this.render())
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
  shouldComponentRenderHTML () {
    return !this.msrcLoginButtonWrapper
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    return this.loadDependency().then(async msrc => {
      this.msrcLoginButtonWrapper = this.root.querySelector('div') || document.createElement('div')
      // Setup OIDC login configuration
      await msrc.utilities.login.setup({/* ... */})
      // Trigger autologin
      await msrc.utilities.login.autologin()
      // Initialize the login button
      await msrc.components.login.button(this.msrcLoginButtonWrapper, {
        language: this.getAttribute('language') || 'de',
        theme: this.getAttribute('theme') || 'alnatura',
        size: this.getAttribute('size') || 'small',
        loginReturnTo: this.getAttribute('loginReturnTo') || '',
        logoutReturnTo: this.getAttribute('logoutReturnTo') || '',
        config: this.constructor.parseAttribute(this.getAttribute('config') || '{"env": "local"}'),
      })
      // wait for the styled-component to update the header stylesheet before raping it with getStyles
      await new Promise(resolve => setTimeout(() => resolve(), 50))
      this.html = [this.msrcLoginButtonWrapper, this.getStyles(document.createElement('style'))]
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
        if (componentStyle.sheet && componentStyle.sheet.rules && componentStyle.sheet.rules.length ) Array.from(componentStyle.sheet.rules).forEach(rule => {
          cssText += rule.cssText
        })
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
