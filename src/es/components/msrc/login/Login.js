// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */
/* global CustomEvent */

/**
 * Login https://react-components.migros.ch/?path=/story/msrc-login-03-widgets-login-button--button-large
 * Example at: alnatura Home.html
 *
 * @export
 * @class Login
 * @type {CustomElementConstructor}
 * @attribute {
 *  {"de"|"fr"|"it"|"en"} [language=document.documentElement.getAttribute('lang') || 'de']
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
 *    authority: string,
 *    language: string,
 *    clientId: string,
 *    clientSecret: string,
 *    redirectURI: string,
 *    scope: string,
 *    claims: { userinfo: { given_name: null, family_name: null, email: null } }
 *  }>} [setup="{}"] (not used!)
 * }
 */
export default class Login extends Prototype() {
  constructor (...args) {
    super(...args)

    this.requestMsrcUserListener = event => {
      if (event.detail.resolve) {
        event.detail.resolve(this.user)
      } else {
        this.dispatchEvent(new CustomEvent(this.getAttribute('msrc-user') || 'msrc-user', {
          detail: {
            origEvent: event,
            user: this.user,
            this: this
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
    Promise.all(showPromises).then(() => (this.hidden = false))
    document.body.addEventListener(this.getAttribute('request-msrc-user') || 'request-msrc-user', this.requestMsrcUserListener)
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('request-msrc-user') || 'request-msrc-user', this.requestMsrcUserListener)
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
      :host > div > button {
        max-width: 50vw;
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
    this.msrcLoginButtonWrapper = this.root.querySelector('div') || document.createElement('div')
    // subscribe to login:authenticate user by calling the getter before starting any msrc stuff
    console.info('msrc user: ', this.user)
    return this.loadDependency().then(async msrc => {
      // Setup OIDC login configuration
      await msrc.utilities.login.setup(this.constructor.parseAttribute(this.getAttribute('setup') || '{}'))
      // Initialize the login button
      await msrc.components.login.button(this.msrcLoginButtonWrapper, {
        language: this.getAttribute('language') || self.Environment.language,
        theme: this.getAttribute('theme') || 'alnatura',
        size: this.getAttribute('size') || 'small',
        loginReturnTo: this.getAttribute('loginReturnTo') || '',
        logoutReturnTo: this.getAttribute('logoutReturnTo') || ''
      })
      const getStylesReturn = this.getStyles(document.createElement('style'))
      getStylesReturn[1].then(() => {
        let button
        if ((button = this.msrcLoginButtonWrapper.querySelector('button'))) button.classList.add('font-size-tiny')
      })
      this.html = [this.msrcLoginButtonWrapper, getStylesReturn[0]]
      return getStylesReturn[1] // use this line if css build up should be avoided
    })
  }

  get user () {
    return this.userPromise || (this.userPromise = new Promise(async resolve => {
      const msrc = await this.loadDependency()
      // https://react-components.migros.ch/?path=/docs/msrc-login-00-readme--page#events
      const instance = await msrc.messenger.getInstance()
      instance.subscribe('login:authenticate', ({ isManualLogin, loggedIn, error }) => resolve(msrc.utilities.login.getUser()))
    }))
  }
}
