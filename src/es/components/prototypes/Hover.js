// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'


export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {

  constructor(options = { hoverInit: undefined }, ...args) {
    super(options, ...args)
    this.hoverInit = typeof options.hoverInit === 'object' ? options.hoverInit : {
      level: this.getAttribute('hover-level') || undefined,
      selector: this.getAttribute('hover-selector') || undefined
    }

    this.mouseOverListener = event => {
      console.log("MOUSE over", event.target)
      this.classList.add('hover')
    }

    this.mouseOutListener = event => {
      console.log("mouse OUT", event.target)
      this.classList.remove('hover')
    }

  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback()
    if (this.hoverInit.level || this.hoverInit.selector) {
      console.log("Hover element in CC", this.hoverTarget)
      this.hoverTarget.addEventListener('mouseover', this.mouseOverListener)
      this.hoverTarget.addEventListener('mouseout', this.mouseOutListener)
    }

  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    if (this.hoverInit.level || this.hoverInit.selector) {
      this.hoverTarget.removeEventListener('mouseover', this.mouseoverListener)
      this.hoverTarget.removeEventListener('mouseout', this.mouseoutListener)
      this.hoverTarget = null
    }
  }

  set hoverTarget(value) {
    this._hoverTarget = value
  }

  get hoverTarget() {
    return this._hoverTarget || (this._hoverTarget = (() => {
      if (this.hoverInit.selector) return Hover.findByQuerySelector(this, this.hoverInit.selector)
      return Hover.findByLevel(this, Number(this.hoverInit.level)) 
    })())
  }

  /**
   * find html element by level
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @return {HTMLElement}
   */
  static findByQuerySelector(el, selector) {
    while ((el = el.parentNode || el.host)) {
      console.log({el, parent: (el.parentNode || el.host)});
      const parentNode = el.parentNode || el.host
      if (parentNode && parentNode.querySelector(selector)) {
        return el
      }
    }
    return document.documentElement
  }
 
  /**
   * find html element by level
   *
   * @param {HTMLElement | any} el
   * @param {number} level
   * @return {HTMLElement}
   */
  static findByLevel(el, level) {
    let currentLevel = 1
    while ((el = el.parentNode || el.host)) {
      if (currentLevel >= level && el.tagName) {
        return el
      }
      currentLevel++
    }
    return el
  }
}
