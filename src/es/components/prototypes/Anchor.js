// @ts-check
import { Shadow } from './Shadow.js'

/* global location */
/* global self */

export const Anchor = (ChosenClass = Shadow()) => class Anchor extends ChosenClass {
  /**
   * Anchor, does fix the default light dom anchor behavior on a specific component.
   * Creates an instance of Shadow. The constructor will be called for every custom element using this class when initially created.
   *
   * @param {*} args
   */
  constructor (...args) {
    super(...args)

    this.anchorTimeout = null
    let isRunning = false
    this.clickAnchorEventListener = event => {
      if (isRunning) return
      isRunning = true
      setTimeout(() => { isRunning = false }, 50)
      let element = null
      try {
        element = this.root.querySelector((event && event.detail && event.detail.selector.replace(/(.*#)(.*)$/, '#$2')) || location.hash || null)
      } catch (error) {}
      if (element) {
        this.dispatchEvent(new CustomEvent(this.getAttribute('scroll-to-anchor') || 'scroll-to-anchor', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {
            child: element
          }
        }))
        element.scrollIntoView({ behavior: 'smooth' })
        // @ts-ignore
        clearTimeout(this.anchorTimeout)
        this.anchorTimeout = setTimeout(() => {
          element.scrollIntoView({ behavior: 'auto' })
          this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
            detail: {
              hasNoScroll: false,
              origEvent: event,
              this: this
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        }, 1000) // lazy loading pics make this necessary to reach target
      }
    }

    this.clickHashEventListener = event => {
      let hash
      if ((hash = event.composedPath().slice(0, this.getAttribute('anchor-depth') || 2).find(node => node.hash)?.hash)) this.clickAnchorEventListener({ detail: { selector: hash } })
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   *
   * @return {void}
   */
  connectedCallback () {
    super.connectedCallback()
    document.body.addEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
    document.body.addEventListener('click', this.clickHashEventListener)
    if (location.hash) {
      self.addEventListener('load', event => this.clickAnchorEventListener({ detail: { selector: location.hash.replace('_scrolled', '') } }), { once: true })
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', event => setTimeout(() => this.clickAnchorEventListener({ detail: { selector: location.hash.replace('_scrolled', '') } }), 1000), { once: true })
    }
    self.addEventListener('hashchange', this.clickAnchorEventListener)
  }

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   *
   * @return {void}
   */
  disconnectedCallback () {
    super.disconnectedCallback()
    document.body.removeEventListener(this.getAttribute('click-anchor') || 'click-anchor', this.clickAnchorEventListener)
    document.body.removeEventListener('click', this.clickHashEventListener)
    self.removeEventListener('hashchange', this.clickAnchorEventListener)
  }
}
