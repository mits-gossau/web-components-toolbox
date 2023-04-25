// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'

/**
 * Hover is a helper which sets up a new Hover in the context of a web component
 *
 * @export
 * @function Hover
 * @param {Function | *} ChosenClass
 * @attribute {'string'} [hoverInit=`{
      'level': undefined
      'className': '',
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
      hover,
      hoverInit,
      mutationCallback,
      mutationObserveStart,
      mutationObserveStop
    }
 * @return {CustomElementConstructor | *}
 */
export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {
  /**
   * Creates an instance of Hover. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{hoverInit: HoverInit | undefined}} [options = {hoverInit: undefined}]
   * @param {*} args
   */
  constructor (options = { hoverInit: undefined }, ...args) {
    super(options, ...args)

    this.hoverInit = typeof options.hoverInit === 'object' ? options.hoverInit : {
      level: this.getAttribute('hover-level') || 1, // number or function (id===34 | tagName==='span')
      className: this.getAttribute('hover-class-name') || 'active'
      /* node?: recursively found node on connected callback */
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    // attach mouse events (over/out)
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    // detach mouse events
  }
}
