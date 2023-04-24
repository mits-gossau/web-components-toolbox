// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'


export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {
 
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
