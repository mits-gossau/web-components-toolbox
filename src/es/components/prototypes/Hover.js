// @ts-check

/* global Hover */

import { Shadow } from './Shadow.js'


export const Hover = (ChosenClass = Shadow()) => class Hover extends ChosenClass {
 
  constructor (options = { hoverInit: {} }, ...args) {
    super(options, ...args)
    
    console.log("THIS", this)
    
    this.hoverInit = typeof options.hoverInit === 'object' ? options.hoverInit : {
      level: this.getAttribute('hover-level') || 1, // number or function (id===34 | tagName==='span')
      className: this.getAttribute('hover-class-name') || 'active'
      /* node?: recursively found node on connected callback */
    }

    console.log("HOVER CB", this.mouseEventElement);

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
    console.log("Hover CB", this.mouseEventElement)
    super.connectedCallback()
    // this.mouseEventElement.addEventListener('mouseover', this.mouseOverListener)
    // this.mouseEventElement.addEventListener('mouseout', this.mouseOutListener)
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

  get mouseEventElement() {
    console.log("---",this.getAttribute('hover-level'))
    debugger
    return "abc"
    //debugger
    //return this[this.hasAttribute('hover-on-parent-element') ? 'parentNode' : this.hasAttribute('hover-on-parent-shadow-root-host') ? 'parentNodeShadowRootHost' : 'svg']
  }
}
