// @ts-check
import { Intersection } from '../prototypes/Intersection.js'

/* global self */

/**
* IntersectionScrollEffect
* This component can be used to apply a CSS-Effect to its children based on scroll-position. The type of effect can be defined through attributes.
* Examples:
*   <o-intersection-scroll-effect css-property=filter, effect=brightness, max-value=100%>
*   <o-intersection-scroll-effect css-property=--transform-mobile, effect=translateX, max-value=50px>
*   src/es/components/molecules/NavigationClassics.html
*
* NOTE: When using a CSS-Variable for the css-property, the component where the effect should be applied needs to have a line where the CSS-variable gets used
* => e.g.: filter: var(--filter-mobile, none)
*
* NOTE: Use Css variables for certain values in combination with child web components, since not every css property will propagate to its child web component. eg. transform (filter seems to work though)
*
* The CSS-Effect will be applied at 100% at the edges of the viewport and will increase/decrease while nearing the center,
* at which the effect will be applied at 0%. This behaviour can be inverted by setting the invert attribute to "true"
*
* Possible FUTURE improvement calc into web workers -> https://github.com/mits-gossau/web-components/blob/master/src/es/helpers/WebWorker.js
*
* @export
* @class IntersectionScrollEffect
* @type {CustomElementConstructor}
* @attribute {
  *  {string} [css-property] the name of the css-property (can be a CSS-Variable)
  *  {mobile, desktop} [media=both desktop & mobile] defining when effect should be applied
  *  {string} [mobile-breakpoint=self.Environment.mobileBreakpoint] define custom mobile-breakpoint
  *  {string} [max-value] the maximum value of the set effect e.g. "100%" (including the unit)
  *  {string} [invert] if set to "true" the filter will be applied inverted (default is: 0% filter in the center of the viewport, 100% filter at the edges)
  *  {number} [offset=0] in percentage to self.innerHeight
  *  {string} [transition] set if the effect shall have a transition e.g. "0.2s ease"
  *  {number} [digits=4] for rounding the css value
  * }
  */
export default class IntersectionScrollEffect extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'open', intersectionObserverInit: { rootMargin: '0px 0px 0px 0px' } }), ...args)

    /** @type {number} */
    this.elementHeight = 0
    /** @type {number} */
    this.center = 0
    /** @type {number} */
    this.maxDistanceFromCenter = 0
    /** @type {boolean} */
    this.hasRequiredAttributes = this.getAttribute('css-property') && this.getAttribute('effect') && this.getAttribute('max-value')
    /** @type {boolean | null} for saving the media type */
    this.cachedMedia = null
    /** @type {number} for rounding the css value */
    this.digits = this.getAttribute('digits') ? Number(this.getAttribute('digits')) : 4
    /** @type {number | null} */
    this.requestAnimationFrameId = null

    this.css = /* css */`
      :host {
        display: block; /* fix: google chrome wrong measurements */
        overflow: var(--overflow, hidden);
      }
      ${this.getAttribute('transition') && this.getAttribute('css-property') && !this.getAttribute('css-property').includes('--')
        ? /* CSS */`:host > *:not(style) {
          transition: ${this.getAttribute('css-property')} ${this.getAttribute('transition')};
        }`
        : ''
      }
    `
    this.html = this._css = this._css.cloneNode() // set the clone as this.css reference and by that safe the original away to never be overwritten by the this.css setter

    this.scrollListener = event => {
      /*
        // TODO: horizontal (x) transition has not been smooth
        if (this.requestAnimationFrameId) self.cancelAnimationFrame(this.requestAnimationFrameId)
      */
      this.requestAnimationFrameId = self.requestAnimationFrame(timeStamp => {
        const offset = self.innerHeight / 100 * Number(this.checkMedia('mobile') ? this.getAttribute('offset-mobile') || this.getAttribute('offset') : this.getAttribute('offset'))
        const boundingRect = this.getBoundingClientRect()
        const recalculate = this.elementHeight !== boundingRect.height

        // saving measurements in variables to avoid redundant calculations
        if (!this.elementHeight || recalculate) this.elementHeight = this.round(boundingRect.height, 2)
        if (!this.center || recalculate) this.center = this.round(self.innerHeight / 2 - this.elementHeight / 2, 2)
        if (!this.maxDistanceFromCenter || recalculate) this.maxDistanceFromCenter = self.innerHeight - offset - this.center

        // TODO wrong boundingRect.height onload
        // TODO add optional min-value? max(minValue, outputValue * maxValue)

        // get distance from center (abs)
        const difference = this.round(this.center > boundingRect.top ? this.center - boundingRect.top : boundingRect.top - this.center, 2)
        // get output [0..1]
        let outputValue = this.round(difference / this.maxDistanceFromCenter, this.digits)
        // clamp value to avoid inaccuracies from scrolling too fast
        outputValue = this.clamp(outputValue, 0, 1)
        // invert effect behaviour in relation to scroll-position (define where 0% and 100% are)
        outputValue = this.getAttribute('invert') === 'true' ? 1 - outputValue : outputValue
        if (!isNaN(outputValue)) {
          this.css = '' // resets css
          this.css = /* css */ `
              :host > *:not(style) {
                ${this.getAttribute('css-property')}: ${this.getAttribute('effect')}(calc(${outputValue} * ${this.checkMedia('mobile') ? this.getAttribute('max-value-mobile') || this.getAttribute('max-value') : this.getAttribute('max-value')}));
              }
            `
        }
        this.requestAnimationFrameId = null
      })
    }

    this.resizeListener = event => {
      this.cachedMedia = null
      if (this.hasRequiredAttributes) {
        if (this.checkMedia()) {
          this.intersectionObserveStart()
        } else {
          this.intersectionObserveStop()
          self.removeEventListener('scroll', this.scrollListener)
          this.css = '' // resets css
        }
      }
    }
  }

  /**
   *
   *
   * @param {'mobile' | 'desktop'} [media=this.getAttribute('media')]
   * @returns {boolean}
   * @memberof IntersectionScrollEffect
   */
  checkMedia (media = this.getAttribute('media')) {
    if (!media) return true
    if (this.cachedMedia) return this.cachedMedia === media
    // @ts-ignore ignoring self.Environment error
    const breakpoint = this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'
    const isDesktop = self.matchMedia(`(min-width: ${breakpoint})`).matches
    this.cachedMedia = isDesktop ? 'desktop' : 'mobile'
    return this.cachedMedia === media
  }

  connectedCallback () {
    if (this.hasRequiredAttributes) {
      if (this.checkMedia()) {
        super.connectedCallback() // this.intersectionObserveStart()
        this.scrollListener() // write first calculation
        self.addEventListener('load', event => this.scrollListener(), { once: true }) // incase the page is not fully loaded on intersection
        this.addEventListener(this.getAttribute('picture-load') || 'picture-load', event => this.scrollListener(), { once: true }) // adjust when picture is loaded
      }
      self.addEventListener('resize', this.resizeListener)
    }
  }

  disconnectedCallback () {
    if (this.hasRequiredAttributes) {
      if (this.checkMedia()) {
        super.disconnectedCallback() // this.intersectionObserveStop()
        self.removeEventListener('scroll', this.scrollListener)
        this.css = '' // resets css
      }
      self.removeEventListener('resize', this.resizeListener)
    }
  }

  /**
      * rounds number to set amount of decimals (>= 1)
      * @param {number} value
      * @param {number} decimalsAmount
      */
  round (value, decimalsAmount) {
    return value.toFixed(decimalsAmount < 1 ? 1 : decimalsAmount)
  }

  /**
      * clamps number between min & max value
      * @param {number} value
      * @param {number} min
      * @param {number} max
      */
  clamp (value, min, max) {
    return Math.min(Math.max(value, min), max)
  }

  /**
      * callback from the Intersection Observer
      *
      * @return {void}
      */
  intersectionCallback (entries, observer) {
    if (entries && entries[0]) {
      this.scrollListener()
      if (entries[0].isIntersecting) {
        self.addEventListener('scroll', this.scrollListener)
      } else {
        self.removeEventListener('scroll', this.scrollListener)
      }
    }
  }
}
