// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */
/* global CustomEvent */

/**
 * RatingsReviews https://react-components.migros.ch/?path=/docs/msrc-community-04-widgets-ratings-reviews--ratings-reviews
 * Example at: https://mits-gossau.github.io/web-components-toolbox-alnatura/src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&login=./src/es/components/web-components-toolbox/src/es/components/msrc/login/default-/default-.html&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/web-components-toolbox/src/es/components/molecules/navigation/alnatura-/alnatura-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/pages/ProductDetail.html
 * https://github.com/mits-gossau/web-components-toolbox-alnatura/blob/master/src/es/components/pages/ProductDetail.html
 *
 * @export
 * @class RatingsReviews
 * @type {CustomElementConstructor}
 * @attribute {
 *  {"local"|"development"|"test"|"production"} [env="local"] (required)
 *  {"local"|"development"|"test"|"production"} [translation-env="local"]
 *  {string} [web-api-key=""] (required)
 *  {string} [origin-ssr=""]
 *  {string} [target-identifier=""] (required)
 *  {string} [root-target-identifier=""]
 *  {"BOARD" | "CHAT" | "CROWDSOURCING" | "MANIA_CAMPAIGN" | "MANIA_ITEM" | "MIGROS_ENGAGEMENT_ARTICLE" | "MIGROS_SERVICE_PRODUCT" | "MIGUSTO_ARTICLE" | "MIGUSTO_RECIPE" | "PRODUCT" | "VOTING" | "VOTING_OPTION"} [target-type="PRODUCT"]
 *  {string | TokenProvider} [user-token=""]
 *  {"AUTHENTICATION_STARTED" | "AUTHENTICATION_FINISHED"} [authentication-status="AUTHENTICATION_FINISHED"]
 *  {string[]} [oidc-scopes=""]
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
 *  {"de"|"fr"|"it"|"en"} [language=document.documentElement.getAttribute('lang') || 'de']
 *  {number} [initial-limit="2"]
 *  {boolean} [form-collapsible=false]
 *  {boolean} [show-target-mentions=false]
 *  {boolean} [show-sorting-options=undefined]
 *  {"h1" | "h2" | "h3" | "h4" | "h5"} [heading-tag="h2"]
 *  {boolean} [with-smart-placeholder=false]
 * }
 */
export default class RatingsReviews extends Prototype() {
  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldComponentRender()) showPromises.push(this.render())
    Promise.all(showPromises).then(() => (this.hidden = false))
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRender () {
    return !this.msrcContainer
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    this.msrcContainer = this.root.querySelector('div') || document.createElement('div')
    return this.loadDependency().then(async msrc => {
      const user = await new Promise(resolve => this.dispatchEvent(new CustomEvent(this.getAttribute('request-msrc-user') || 'request-msrc-user', {
        detail: {
          resolve
        },
        bubbles: true,
        cancelable: true,
        composed: true
      })))
      // Initialize the ratingsReviews button
      await msrc.components.community.ratingsReviews.ratingsReviews(this.msrcContainer, {
        login: () => msrc.utilities.login.login(),
        env: this.getAttribute('env') || 'local',
        translationEnv: this.getAttribute('env') || 'local',
        webAPIKey: this.getAttribute('web-api-key') || '',
        originSSR: this.getAttribute('origin-ssr') || null,
        targetIdentifier: this.getAttribute('target-identifier') || '',
        rootTargetIdentifier: this.getAttribute('root-target-identifier') || '',
        targetType: this.getAttribute('target-type') || 'PRODUCT',
        userToken: this.getAttribute('user-token') || (user && user.access_token) || '',
        authenticationStatus: this.getAttribute('authentication-status') || 'AUTHENTICATION_FINISHED',
        oidcScopes: this.getAttribute('oidc-scopes') || '',
        theme: this.getAttribute('theme') || 'alnatura',
        language: this.getAttribute('language') || self.Environment.language,
        initialLimit: this.getAttribute('initial-limit') || 2,
        formCollapsible: this.getAttribute('form-collapsible') || false,
        showTargetMentions: this.getAttribute('show-target-mentions') || false,
        showSortingOptions: this.getAttribute('show-sorting-options'),
        headingTag: this.getAttribute('heading-tag') || 'h2',
        withSmartPlaceholder: this.getAttribute('with-smart-placeholder') || false
      })
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcContainer, getStylesReturn[0]]
      return getStylesReturn[1] // use this line if css build up should be avoided
    })
  }
}
