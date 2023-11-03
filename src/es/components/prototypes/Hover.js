// @ts-check

import { Shadow } from './Shadow.js'

export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {
  /**
   * Creates an instance of Shadow. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {{hoverInit: {level?: number|undefined, selector?: string|undefined}|undefined}} options
   * @param {*} args
   */
  constructor (options = { hoverInit: undefined }, ...args) {
    super(options, ...args)
    this.hoverInit = typeof options.hoverInit === 'object'
      ? options.hoverInit
      : {
          level: this.getAttribute('hover-level')
            ? this.getAttribute('hover-level')
            : this.hasAttribute('hover-on-parent-element')
              ? 1
              : undefined,
          selector: this.getAttribute('hover-selector')
            ? this.getAttribute('hover-selector')
            : this.hasAttribute('hover-on-parent-shadow-root-host')
              ? 'hover-on-parent-shadow-root-host'
              : undefined
        }

    this.mouseOverListener = event => {
      this.setAttribute('hover', 'true')
      this.classList.add('hover')
    }

    this.mouseOutListener = event => {
      this.removeAttribute('hover')
      this.classList.remove('hover')
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    if (this.hoverInit.level || this.hoverInit.selector) {
      this.hoverTarget?.addEventListener('mouseover', this.mouseOverListener)
      this.hoverTarget?.addEventListener('mouseout', this.mouseOutListener)
    }
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    if (this.hoverInit.level || this.hoverInit.selector) {
      this.hoverTarget?.removeEventListener('mouseover', this.mouseoverListener)
      this.hoverTarget?.removeEventListener('mouseout', this.mouseoutListener)
      this.hoverTarget = null
    }
  }

  /**
   * @prop {HTMLElement|null} value
   */
  set hoverTarget (value) {
    this._hoverTarget = value
  }

  /**
   * @return {HTMLElement|null}
   */
  get hoverTarget () {
    return this._hoverTarget || (this._hoverTarget = (() => {
      if (this.hoverInit.selector) {
        return this.hoverInit.selector === 'hover-on-parent-shadow-root-host'
          ? Hover.findNextHost(this)
          : Hover.findByQuerySelector(this, this.hoverInit.selector)
      }
      return Hover.findByLevel(this, Number(this.hoverInit.level))
    })())
  }

  /**
   * find html element by id or class
   *
   * @param {HTMLElement | any} el
   * @param {string} selector
   * @return {HTMLElement}
   */
  static findByQuerySelector (el, selector) {
    while ((el = el.parentNode || el.host)) {
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
  static findByLevel (el, level) {
    let currentLevel = 1
    while ((el = el.parentNode || el.host)) {
      if (currentLevel >= level && el.tagName) {
        return el
      }
      currentLevel++
    }
    return el
  }

  /**
   * find next component with a shadowRoot
   *
   * @param {HTMLElement | any} el
   * @return {HTMLElement}
   */
  static findNextHost (el) {
    const searchShadowRoot = el => el.root || el.shadowRoot
      ? el
      : el.parentNode
        ? searchShadowRoot(el.parentNode)
        : el.host
          ? searchShadowRoot(el.host)
          : el
    return searchShadowRoot(el.parentNode || el.host)
  }
}
