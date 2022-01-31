// @ts-check

/* global IntersectionObserver */

import { Shadow } from './Shadow.js'

/**
 * IntersectionObserver is a helper which sets up a new IntersectionObserver in the context of a web component
 * NOTE: IntersectionObserver comes with event queues, which use can be overwritten by intersectionCallback if not needed. A full queue web component would make sense with ES6 Proxies aka. Proxify.js to queue not only events but any attribute and function.
 *
 * @export
 * @function IntersectionObserver
 * @param {Function | *} ChosenClass
 * @attribute {'string'} [intersectionObserverInit=`{
      'root': undefined
      'rootMargin': '200px 0px 200px 0px',
      'threshold': 0
    }`]
 * @requires {
      Shadow: {
        connectedCallback,
        disconnectedCallback,
        parseAttribute
      }
    }
 * @property {
      isObserving,
      intersectionCallback,
      intersectionObserveStart,
      intersectionObserveStop
    }
 * @return {CustomElementConstructor | *}
 */
export const Intersection = (ChosenClass = Shadow()) => class Intersection extends ChosenClass {
  /**
   * Creates an instance of IntersectionObserver. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{intersectionObserverInit: IntersectionObserverInit | undefined}} [options = {intersectionObserverInit: undefined}]
   * @param {*} args
   */
  constructor (options = { intersectionObserverInit: undefined }, ...args) {
    super(options, ...args)

    this.isObserving = false
    /**
     * Digest attribute to have IntersectionObservers or not
     * this will trigger this.intersectionCallback and can be extended
     * see => https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver Properties
     *
     * @type {IntersectionObserverInit}
     */
    let intersectionObserverInit = this.getAttribute('intersectionObserverInit') ? Intersection.parseAttribute(this.getAttribute('intersectionObserverInit')) : options.intersectionObserverInit
    try {
      if (intersectionObserverInit) {
        // add default IntersectionObserverInit Props
        intersectionObserverInit = Object.assign({
          root: undefined,
          rootMargin: '200px 0px 200px 0px',
          threshold: 0
        }, intersectionObserverInit)
        /** @type {IntersectionObserver} */
        const intersectionObserver = new IntersectionObserver(this.intersectionCallback.bind(this), intersectionObserverInit)
        /** @return {void} */
        this.intersectionObserveStart = () => {
          if (!this.isObserving) {
            // @ts-ignore
            intersectionObserver.observe(this)
            this.isObserving = true
          }
        }
        /** @return {void} */
        this.intersectionObserveStop = () => {
          if (this.isObserving) {
            intersectionObserver.disconnect()
            this.isObserving = false
          }
        }
      } else {
        /** @return {void} */
        this.intersectionObserveStart = () => {}
        /** @return {void} */
        this.intersectionObserveStop = () => {}
        console.warn('IntersectionObserver got not started, due to missing options.intersectionObserverInit. At least supply an empty object to activate the observer with the default settings!')
      }
    } catch (error) {
      /** @return {void} */
      this.intersectionObserveStart = () => {}
      /** @return {void} */
      this.intersectionObserveStop = () => {}
      console.warn('IntersectionObserver got not started, due to missing support!')
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    this.intersectionObserveStart()
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    this.intersectionObserveStop()
  }

  /**
   * observes intersection with its intersectionObserverInit.root (dom viewport)
   *
   * @param {IntersectionObserverEntry[]} entries
   * @param {IntersectionObserver} observer
   * @return {void}
   */
  intersectionCallback (entries, observer) {}
}
