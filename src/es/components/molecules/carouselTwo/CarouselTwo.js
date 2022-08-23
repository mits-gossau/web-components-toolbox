// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global customElements */
/* global CustomEvent */

/**
 * https://css-tricks.com/how-to-make-a-css-only-carousel/
 *
 * @attribute {
 * }
 * @css {
 * }
 * @type {CustomElementConstructor}
 */
export default class MacroCarousel extends Shadow() {
  constructor (...args) {
    super(...args)

    // on click scroll to the image with the matching id
    this.clickListener = event => {
      let target
      if ((target = event.composedPath().find(node => typeof node.getAttribute === 'function' && node.getAttribute('href')))) {
        this.root.querySelector(target.getAttribute('href')).scrollIntoView()
        this.scrollListener()
      }
    }
    // on focus scroll to the right element
    this.focusListener = event => {
      let target
      if ((target = event.target) && Array.from(this.section.children).includes(target)) {
        target.scrollIntoView()
        this.scrollListener()
      }
    }
    // on scroll calculate which image is shown and set its and all of its referencing href nodes the class to active
    let scrollTimeoutId = null
    const scrollTolerance = 5
    this.scrollListener = event => {
      clearTimeout(scrollTimeoutId)
      scrollTimeoutId = setTimeout(() => {
        let hostLeft, activeChild
        if ((hostLeft = Math.round(this.getBoundingClientRect().left)) && (activeChild = Array.from(this.section.children).find(node => {
          const nodeLeft = Math.round(node.getBoundingClientRect().left)
          return hostLeft + scrollTolerance > nodeLeft && hostLeft - scrollTolerance < nodeLeft
        }))) {
          Array.from(this.root.querySelectorAll('.active')).forEach(node => node.classList.remove('active'))
          activeChild.classList.add('active')
          Array.from(this.root.querySelectorAll(`[href="#${activeChild.getAttribute('id')}"]`)).forEach(node => node.classList.add('active'))
        }
      }, 50)
    }
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
    this.addEventListener('click', this.clickListener)
    this.section.addEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.addEventListener('focus', this.focusListener))
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
    this.section.removeEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.removeEventListener('focus', this.focusListener))
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return false
  }

  /**
   * renders the css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    this.css = /* css */`
      :host > section {
        overflow: hidden;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
        display: flex;
      
      }
      :host > section > * {
        min-width: 100%;
        scroll-snap-align: start;
      }
      :host > section > *:not(.active) {
        visibility: hidden;
      }
      :host > nav {
        overflow-x: scroll;
        overflow-y: hidden;
        display: flex;
      }
      :host > nav > a {
        display: flex;
        margin-right: 10px;
      }
    `
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    // below do those later and remove this.section getter
    //shouldComponentRenderHTML () {
    //return !this.section
    //
    //this.section = this.root.querySelector('section') || document.createElement('section')
    return Promise.resolve()
  }

  get section () {
    return this.root.querySelector('section')
  }
}
