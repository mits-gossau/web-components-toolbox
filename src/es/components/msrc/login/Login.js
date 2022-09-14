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
 *  {"large"|"medium"|"small"} [size="medium"]
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
 * @css {
 * --color, black
 * --font-size, 0.73em
 * --line-height, normal
 * --font-weight, normal
 * --background-color, white
 * --box-shadow-color, white
 * --button-background-color, --color-secondary, orange
 * --button-border-color, --color-secondary, orange
 * --button-color, --background-color, white
 * --color-a, --color-secondary, white
 * }
 */
export default class Login extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args) // disabling shadow-DOM to have msrc styles flow into the node
  }

  connectedCallback () {
    if (this.getAttribute('timeout') && this.getAttribute('timeout') !== null) {
      setTimeout(() => {
        if (this.shouldComponentRenderHTML()) this.render()
      }, Number(this.getAttribute('timeout')))
    } else if (this.shouldComponentRenderHTML()) this.render()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.msrcLoginButton
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  render () {
    this.css = /* css */`
      :host > button {
        background: 0;
        border: 0;
        margin: 0;
        padding: 0;
      }
    `
    this.msrcLoginButton = this.root.querySelector('button') || document.createElement('button')
    this.loadDependency().then(async msrc => {
      // Setup OIDC login configuration
      await msrc.utilities.login.setup({/* ... */})
      // Trigger autologin
      await msrc.utilities.login.autologin()
      // Initialize the login button
      await msrc.components.login.button(this.msrcLoginButton, {
        language: this.getAttribute('language') || 'de',
        theme: this.getAttribute('theme') || 'alnatura',
        size: this.getAttribute('size') || 'medium',
        loginReturnTo: this.getAttribute('loginReturnTo') || '',
        logoutReturnTo: this.getAttribute('logoutReturnTo') || '',
        config: this.constructor.parseAttribute(this.getAttribute('config') || '{"env": "local"}'),
      })
    })
    this.html = this.msrcLoginButton
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
        vendorsMainScript.setAttribute('src', '//cdn.migros.ch/msrc/20201012123840/vendors~main.js')
        vendorsMainScript.onload = () => {
          scriptCount++
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }
        const mainScript = document.createElement('script')
        mainScript.setAttribute('type', 'text/javascript')
        mainScript.setAttribute('async', '')
        mainScript.setAttribute('src', '//cdn.migros.ch/msrc/20201012123840/main.js')
        mainScript.onload = () => {
          scriptCount++
          if (isMsrcLoaded() && scriptCount >= 2) resolve(self.msrc) // eslint-disable-line
        }
        this.html = [vendorsMainScript, mainScript]
      }
    }))
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }
}
