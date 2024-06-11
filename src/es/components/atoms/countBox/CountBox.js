// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global self */

/**
 * WORK IN PROGRESS !!!
 * DO NOT USE FOR PRODUCTION !!!
 */
export default class CountBox extends Intersection() {
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      intersectionObserverInit: { rootMargin: '0px 0px -25% 0px' },
      ...options
    }, ...args)
    this.requestAnimationFrameID = null
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  intersectionCallback (entries, observer) {
    if ((this.isIntersecting = entries && entries[0] && entries[0].isIntersecting)) {
      this.startCounter(this.root.getElementById(this.tag))
    } else {
      this.stopCounter()
    }
  }

  startCounter (counter, currentValue, targetValue, duration = Number(this.getAttribute('speed')) || 3300, steps, startTime = Date.now()) {
    if (currentValue !== undefined && currentValue === targetValue) return // target reached
    if (currentValue === undefined) currentValue = Number(this.getAttribute('start'))
    if (targetValue === undefined) targetValue = Number(this.getAttribute('target'))
    if (!steps) {
      // @ts-ignore
      self.cancelAnimationFrame(this.requestAnimationFrameID) // cancel other loops on a new request
      const step = Math.abs(currentValue - targetValue) / duration // the amount of one step
      const func = targetValue > currentValue ? (curr, i) => Math.ceil(currentValue + step * i) : (curr, i) => Math.floor(currentValue - step * i)
      steps = Array.from(Array(duration)).map(func)
    }
    // find the step in the steps array by passed milliseconds... if that is exceeded take the targetValue instead
    counter.textContent = String(currentValue = steps[Date.now() - startTime] ?? targetValue)
    if (currentValue !== targetValue) this.requestAnimationFrameID = self.requestAnimationFrame(timeStamp => this.startCounter(counter, currentValue, targetValue, duration, steps, startTime))
  }

  stopCounter () {
    // @ts-ignore
    self.cancelAnimationFrame(this.requestAnimationFrameID)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return this.hasAttribute('id') ? !this.root.querySelector(`:host > style[_css], #${this.getAttribute('id')} > style[_css]`) : !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host .card {
        background:red;
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      } 
    }
    `
  }

  get tag () {
    return this.getAttribute('tag')
  }
}
