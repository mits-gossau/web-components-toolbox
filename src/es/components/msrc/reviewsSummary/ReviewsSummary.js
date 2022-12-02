// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */

/**
 * ReviewsSummary https://react-components.migros.ch/?path=/story/msrc-community-04-widgets-ratings-reviews--reviews-summary
 * Example at: https://mits-gossau.github.io/web-components-toolbox-alnatura/src/es/components/web-components-toolbox/docs/Template.html?rootFolder=src&css=./src/css/variablesCustom.css&login=./src/es/components/web-components-toolbox/src/es/components/msrc/login/default-/default-.html&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/web-components-toolbox/src/es/components/molecules/navigation/alnatura-/alnatura-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/pages/ProductDetail.html
 * https://github.com/mits-gossau/web-components-toolbox-alnatura/blob/master/src/es/components/pages/ProductDetail.html
 *
 * @export
 * @class ReviewsSummary
 * @type {CustomElementConstructor}
 * @attribute {
 *  {"local"|"development"|"test"|"production"} [env="local"] (required)
 *  {string} [web-api-key=""] (required)
 *  {string} [origin-ssr=""]
 *  {string | TokenProvider} [user-token=""]
 *  {"AUTHENTICATION_STARTED" | "AUTHENTICATION_FINISHED"} [authentication-status=""]
 *  {string} [target-identifier=""] (required)
 *  {"BOARD" | "CHAT" | "CROWDSOURCING" | "MANIA_CAMPAIGN" | "MANIA_ITEM" | "MIGROS_ENGAGEMENT_ARTICLE" | "MIGROS_SERVICE_PRODUCT" | "MIGUSTO_ARTICLE" | "MIGUSTO_RECIPE" | "PRODUCT" | "VOTING" | "VOTING_OPTION"} [target-type="PRODUCT"]
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
 *  {string} [link="#reviews"]
 *  {boolean} [show-average-rating=true]
 *  {boolean} [show-count=true]
 *  {boolean} [show-count-short=false]
 *  {"tiny" | "small" | "normal" | "large"} [rating-size="normal"]
 *  {any} initial-state (GraphQL hook)
 * }
 */
export default class ReviewsSummary extends Prototype() {
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
      // Initialize the reviewsSummary button
      await msrc.components.community.ratingsReviews.reviewsSummary(this.msrcContainer, {
        env: this.getAttribute('env') || 'local',
        webAPIKey: this.getAttribute('web-api-key') || '',
        originSSR: this.getAttribute('origin-ssr') || null,
        userToken: this.getAttribute('user-token') || '',
        authenticationStatus: this.getAttribute('authentication-status') || '',
        targetIdentifier: this.getAttribute('target-identifier') || '',
        targetType: this.getAttribute('target-type') || 'PRODUCT',
        language: this.getAttribute('language') || self.Environment.language,
        theme: this.getAttribute('theme') || 'alnatura',
        link: this.getAttribute('link') || '#reviews',
        showAverageRating: this.getAttribute('show-average-rating') || true,
        showCount: this.getAttribute('show-count') || true,
        showCountShort: this.getAttribute('show-count-short') || false,
        ratingSize: this.getAttribute('rating-size') || 'normal',
        initialState: this.getAttribute('initial-state') || null
      })
      const getStylesReturn = this.getStyles(document.createElement('style'))
      this.html = [this.msrcContainer, getStylesReturn[0]]
      return getStylesReturn[1] // use this line if css build up should be avoided
    })
  }
}
