// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */
/* global CustomEvent */

/**
 * BackendForFrontend https://react-components.migros.ch/?path=/docs/migros-react-components-01-login-c-backend-for-frontend--documentation
 * Digital Campaign Factory: https://wiki.migros.net/pages/viewpage.action?pageId=790958744&spaceKey=MDCF&title=Digital%2BCampaign%2BFactory%2Bmit%2BBackend%2Bfor%2BFrontend%2BBFF
 *
 * @export
 * @class BackendForFrontend
 * @type {CustomElementConstructor}
 */
export default class BackendForFrontend extends Prototype() {


  connectedCallback () {
    if (this.shouldRender()) this.render()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRender () {
    return !this.rendered
  }

  /**
   * sets up the backend for frontend
   *
   * @return {Promise<void>}
   */
  render () {
    this.rendered = true
    // https://wiki.migros.net/spaces/MDCF/pages/790958744/Digital+Campaign+Factory+mit+Backend+for+Frontend+BFF
    // @ts-ignore
    if (this.hasAttribute('mcs-api-url')) self.MCS_API_URL = this.getAttribute('mcs-api-url')
    return this.loadDependency().then(async msrc => {
      await msrc.utilities.login.backendForFrontendSetup({
        getUser: async () => this.getUser(),
        isLoggedIn: async () => fetch(`${this.getAttribute('endpoint-is-logged-in') || 'https://int.klubschule.ch/umbraco/api/DigitalCampaignFactory/IsLoggedIn'}`, {
          method: 'GET'
        }),
        events: {
          loginEvent: async () => {
            if (this.hasAttribute('login-event')) {
              const func = eval(this.getAttribute('login-event'))
              func()
            }
          }, // triggered when a user clicks on a login button within a MSRC widget
          logoutEvent: async () => {
            if (this.hasAttribute('logout-event')) {
              const func = eval(this.getAttribute('logout-event'))
              func()
            }
          }, // triggered when a user clicks on a logout button within a MSRC widget
          autologinEvent: async () => {
            if (this.hasAttribute('auto-login-event')) {
              const func = eval(this.getAttribute('auto-login-event'))
              func()
            }
          } // triggered at the start. make sure to load the users login status before this callback promise resolves.
        }
      })
    })
  }

  /**
   * fetches the user data and dispatches it for other components
   *
   * @return {Promise<Response>}
   */
  async getUser () {
    const response = await fetch(`${this.getAttribute('endpoint-get-user') || 'https://int.klubschule.ch/umbraco/api/DigitalCampaignFactory/GetUser'}`, {
      method: 'GET'
    })

    this.dispatchUser(response)

    return response
  }

  /**
   * dispatches the user data without consuming the original fetch response
   *
   * @param {Response} response
   * @return {void}
   */
  dispatchUser (response) {
    if (!response.ok) {
      this.dispatchEvent(new CustomEvent('msrc-bff-user-error', {
        detail: {
          response,
          status: response.status,
          statusText: response.statusText
        },
        bubbles: true,
        composed: true
      }))
      return
    }

    response.clone().json().then(user => {
      this.user = user
      this.dispatchEvent(new CustomEvent('msrc-bff-user-loaded', {
        detail: {
          user
        },
        bubbles: true,
        composed: true
      }))
    }).catch(error => {
      this.dispatchEvent(new CustomEvent('msrc-bff-user-error', {
        detail: {
          error,
          response,
          status: response.status,
          statusText: response.statusText
        },
        bubbles: true,
        composed: true
      }))
    })
  }
}
