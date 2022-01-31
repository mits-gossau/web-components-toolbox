// @ts-check

/* global MutationObserver */

import { Shadow } from './Shadow.js'

/**
 * MutationObserver is a helper which sets up a new MutationObserver in the context of a web component
 *
 * @export
 * @function MutationObserver
 * @param {Function | *} ChosenClass
 * @attribute {'string'} [mutationObserverInit=`{
      'attributeFilter': undefined
      'attributes': false,
      'attributeOldValue': true,
      'characterData': false,
      'characterDataOldValue': true,
      'childList': false,
      'subtree': false
    }`]
 * @requires {
      Shadow: {
        connectedCallback,
        disconnectedCallback,
        parseAttribute,
        root,
        shadowRoot
      }
    }
 * @property {
      mutationObserver,
      mutationObserverInit,
      mutationCallback,
      mutationObserveStart,
      mutationObserveStop
    }
 * @return {CustomElementConstructor | *}
 */
export const Mutation = (ChosenClass = Shadow()) => class Mutation extends ChosenClass {
  /**
   * Creates an instance of MutationObserver. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{mutationObserverInit: MutationObserverInit | undefined}} [options = {mutationObserverInit: undefined}]
   * @param {*} args
   */
  constructor (options = { mutationObserverInit: undefined }, ...args) {
    super(options, ...args)

    /**
     * Digest attribute to have MutationObservers or not
     * this will trigger this.mutationCallback and can be extended
     * see => https://developer.mozilla.org/en-US/docs/Web/API/MutationObserverInit Properties
     *
     * @type {MutationObserverInit}
     */
    this.mutationObserverInit = typeof options.mutationObserverInit === 'object' ? options.mutationObserverInit : Mutation.parseAttribute(this.getAttribute('mutationObserverInit'))
    if (this.mutationObserverInit && (this.mutationObserverInit.attributes || this.mutationObserverInit.characterData || this.mutationObserverInit.childList)) {
      /** @type {MutationObserver} */
      this.mutationObserver = new MutationObserver(this.mutationCallback.bind(this))
      // add default MutationObserverInit Props
      this.mutationObserverInit = Object.assign({
        attributeFilter: undefined,
        attributes: false,
        attributeOldValue: this.mutationObserverInit.attributes === true,
        characterData: false,
        characterDataOldValue: this.mutationObserverInit.characterData === true,
        childList: false,
        subtree: false
      }, this.mutationObserverInit)
      // attributes can not be observed on shadow, so we split this observation
      if (this.shadowRoot && this.mutationObserverInit.attributes) {
        const { attributeFilter, attributes, attributeOldValue, ...restObserverInit } = this.mutationObserverInit
        /** @return {void} */
        this.mutationObserveStart = () => {
          // @ts-ignore
          if (restObserverInit.childList || restObserverInit.characterData) this.mutationObserver.observe(this.shadowRoot, restObserverInit)
          // @ts-ignore
          this.mutationObserver.observe(this, { attributeFilter, attributes, attributeOldValue })
        }
      } else {
        /** @return {void} */
        this.mutationObserveStart = () => {
          // @ts-ignore
          this.mutationObserver.observe(this.root, this.mutationObserverInit)
        }
      }
      /** @return {void} */
      this.mutationObserveStop = () => this.mutationObserver.disconnect()
    } else {
      /** @return {void} */
      this.mutationObserveStart = () => {}
      /** @return {void} */
      this.mutationObserveStop = () => {}
      console.warn('MutationObserver got not started, due to missing options.mutationObserverInit. At least supply an empty object to activate the observer with the default settings!')
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    this.mutationObserveStart()
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    this.mutationObserveStop()
  }

  /**
   * observes mutations on this + children changes
   *
   * @param {MutationRecord[]} mutationList
   * @param {MutationObserver} observer
   * @return {void}
   */
  mutationCallback (mutationList, observer) {}
}
