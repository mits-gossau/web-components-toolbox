// @ts-check
import { Prototype } from '../Prototype.js'

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
export default class Login extends Prototype() {
  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
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
    return !this.msrcLoginButtonWrapper
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    this.css = /* css */`
      :host {
        display: flex;
        align-items: end;
        justify-content: end;
        gap: calc(var(--content-spacing, 1em) * 2);
        margin: calc(var(--content-spacing, unset) / 2) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: max(calc(_max-width_ - var(--content-spacing) * 2), 55%); /* Environment.js mobileBreakpoint must correspond to the calc 1200px */
      }
      :host .font-size-tiny {
        font-size: calc(0.75 * var(--p-font-size-mobile, var(--p-font-size, 1em)));
        line-height: var(--line-height-mobile, var(--line-height, normal));
      }
      :host > a {
        color: var(--color);
        text-decoration: none;
        font-weight: var(--font-weight-strong, bold);
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          gap: calc(var(--content-spacing-mobile, var(--content-spacing, 1em)) * 2);
          margin: calc(var(--content-spacing-mobile, var(--content-spacing, unset)) / 2) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
        }
        :host .font-size-tiny {
          font-size: calc(0.75 * var(--p-font-size-mobile, var(--p-font-size, 1em)));
          line-height: var(--line-height-mobile, var(--line-height, normal));
        }
      }
    `
    return this.loadDependency().then(async msrc => {
      this.msrcLoginButtonWrapper = this.root.querySelector('div') || document.createElement('div')
      // Setup OIDC login configuration
      await msrc.utilities.login.setup({/* ... */})
      // Trigger autologin
      await msrc.utilities.login.autologin()
      // Initialize the login button
      await msrc.components.login.button(this.msrcLoginButtonWrapper, {
        language: this.getAttribute('language') || self.Environment.language,
        theme: this.getAttribute('theme') || 'alnatura',
        size: this.getAttribute('size') || 'small',
        loginReturnTo: this.getAttribute('loginReturnTo') || '',
        logoutReturnTo: this.getAttribute('logoutReturnTo') || '',
        config: this.constructor.parseAttribute(this.getAttribute('config') || '{"env": "local"}')
      })
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcLoginButtonWrapper,getStylesReturn[0]]
      //return getStylesReturn[1] // use this line if css build up should be avoided
    })
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }
}
