// @ts-check
import { Prototype } from '../Prototype.js'

/* global self */
/* global CustomEvent */

/**
 * digital-campaign-factory Wheel ask niels
 * Example at: klubschule wettbewerb Home.html
 *
 * @export
 * @class Wheel
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string|Partial<{
 *    language: [language=document.documentElement.getAttribute('lang') || 'de'],
 *    wheelId: string
 *  }>} [setup="{}"]
 *
 * }
 */
export default class Wheel extends Prototype() {
  // !IMPORTANT: Must be in the LIGHT DOM for query Selectors to get through!
  constructor (...args) {
    super({ mode: 'false' }, ...args)
  }
  
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
    return !this.mscWrapper
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  render () {
    this.mscWrapper = this.root.querySelector('div') || document.createElement('div')
    this.mscWrapper.innerHTML = '<div id="mdcf-wheel"><style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); }  }</style><div style="width: 100%; height: 100%; min-height: 200px; display: flex; justify-content: center; align-items: center; color: #949494">  <svg width="32px" height="32px" viewBox="0 0 400 400" style="animation: spin 0.75s linear infinite">    <path fill="currentColor" fill-rule="nonzero" d="M200,50V0c110.5,0,200,89.5,200,200h-50C350,117.2,282.8,50,200,50z" />  </svg></div></div>'
    return this.loadDependency().then(msc => {
      msc.wheel(this.mscWrapper, { language: this.getAttribute('language') || self.Environment.language, wheelId: this.getAttribute('wheelId') || 'W1wlwhzIlaCHivyqdvlW' })
      return this.html = this.mscWrapper
    })
  }
}
