// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'


export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {

  constructor(options = { hoverInit: undefined }, ...args) {
    super(options, ...args)
    this.hoverInit = typeof options.hoverInit === 'object' ? options.hoverInit : {
      level: this.getAttribute('hover-level') || undefined,
      className: this.getAttribute('hover-class-name') || undefined
      /* node?: recursively found node on connected callback */
    }

    this.mouseOverListener = event => {
      console.log("MOUSE over", this.hoverElement)
      this.hoverElement.classList.add('hover')
    }

    this.mouseOutListener = event => {
      console.log("mouse OUT", this.hoverElement)
      this.hoverElement.classList.remove('hover')
    }

  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback() {
    super.connectedCallback()
    if (this.hoverInit.level || this.hoverInit.className) {
      this.hoverElement = this.hoverTarget()
      console.log("Hover element in CC", this.hoverElement)
      this.hoverElement.addEventListener('mouseover', this.mouseOverListener)
      this.hoverElement.addEventListener('mouseout', this.mouseOutListener)
    }

  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback() {
    super.disconnectedCallback()
    this._target = null
    this.hoverElement && this.hoverElement.removeEventListener('mouseover', this.mouseoverListener)
    this.hoverElement && this.hoverElement.removeEventListener('mouseout', this.mouseoutListener)
  }

  get hoverTarget() {
    return this._target || (this._target = (() => {
      const classNameElement = this.findByClassName(this, this.hoverInit.className)
      //const classNameElement = this.fancyFindByClassName(this, this.hoverInit.className)
      //console.log("classNameElement", classNameElement)
      const levelElement = this.findByLevel(this, Number(this.hoverInit.level))
      //console.log("levelElement", levelElement);
      return levelElement || classNameElement
    }))
  }

  findByClassName(el, className) {
    while (el.parentNode) {
      el = el.parentNode;
      if (el.classList && el.classList.contains(className)) {
        return el;
      }
    }
    return null;
  }

  fancyFindByClassName(el, className) {
    if (!el || el.classList && el.classList.contains(className)) {
      return el
    } else {
      return this.fancyFindByClassName(el.parentElement, className)
    }
  }

  findByLevel(el, level) {
    let currentLevel = 1
    while (el.parentNode) {
      el = el.parentNode
      if (currentLevel === level) {
        return el
      }
      currentLevel++
    }
  }

}
