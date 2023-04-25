// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'


export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {
 
  constructor (options = { hoverInit: {} }, ...args) {
    super(options, ...args)
     
    this.hoverInit = typeof options.hoverInit === 'object' ? options.hoverInit : {
      level: this.getAttribute('hover-level') || 1, // number or function (id===34 | tagName==='span')
      className: this.getAttribute('hover-class-name') || 'active'
      /* node?: recursively found node on connected callback */
    }

    //console.log("HOVER Constructor", this.hoverInit);

    this.mouseOverListener = event => {
     console.log("MOUSE over")
    }
    this.mouseOutListener = event => {
      console.log("mouse OUT")
    }
    
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    // this.hoverTarget.addEventListener('mouseover', this.mouseOverListener)
    console.log("Hover CB", this.findTargetElement(this, this.hoverInit.level, this.hoverInit.className))
    // this.targetElement.addEventListener('mouseover', this.mouseOverListener)
    // this.targetElement.addEventListener('mouseout', this.mouseOutListener)
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    // detach mouse events
    // _hoverTarget = null // TODO 
  }

  get hoverTarget(){
    // TODO: 
    // 1. Find parent from => element
    // 1.1 > based on level => level
    // 1.2 > based on class name set on parent => selector
    // 2. return the parent to attach the listener
    return null
  }

  // findTargetElement(element,level,selector) {
  //   console.log("---", element, level, selector)
    
  //   return "abc"
  // }
}
