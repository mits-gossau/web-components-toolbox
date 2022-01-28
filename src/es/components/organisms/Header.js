// @ts-check
import BaseHeader from '../web-components-cms-template/src/es/components/organisms/Header.js'

/* global MutationObserver */
/* global self */

/**
 * Header can be sticky and hosts as a flex mostly a logo and a navigation
 * Example at: /src/es/components/pages/Home.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Header
 * @type {CustomElementConstructor}
 * @css {
 * }
 * @attribute {
 * }
 */
export default class Header extends BaseHeader {
  constructor (...args) {
    super(...args)

    this.clickAnimationListener = event => {
      if (this.header.classList.contains('open')) {
        this.mNavigation.classList.add('open')
      } else if (event && event.animationName === 'close') {
        this.mNavigation.classList.remove('open')
      }
    }
    this.mutationCallbackTimeout = null
    this.mutationCallback = mutationsList => {
      clearTimeout(this.mutationCallbackTimeout)
      this.mutationCallbackTimeout = setTimeout(() => {
        // make sure that the sticky header is shown when the menu is open
        if (this.header.classList.contains('open') && !this.classList.contains('show')) this.classList.add('show')
      }, 50)
    }
    this.observer = new MutationObserver(this.mutationCallback)
  }

  connectedCallback () {
    super.connectedCallback()
    this.addEventListener('click', this.clickAnimationListener)
    this.mNavigation.addEventListener('animationend', this.clickAnimationListener)
    self.addEventListener('resize', this.mutationCallback)
    this.observer.observe(this.header, { attributes: true })
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('click', this.clickAnimationListener)
    this.mNavigation.removeEventListener('animationend', this.clickAnimationListener)
    self.removeEventListener('resize', this.mutationCallback)
    this.observer.disconnect()
  }

  /**
   * renders the o-header css
   *
   * @return {void}
   */
  renderCSS () {
    super.renderCSS()
    this.css = /* css */`
      :host([sticky]) {
        position: static;
      }
      :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'} {
        flex-grow: 1;
      }
      :host > header > *:first-child {
        align-self: baseline;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          --header-logo-justify-content: flex-end;
        }
        :host([sticky]) {
          position: sticky;
        }
        :host > header {
          flex-wrap: nowrap;
        }
        :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'} {
          animation: close .4s ease-in;
          left: -100vw;
        }
        :host > header > ${this.getAttribute('m-navigation') || 'm-navigation'}.open {
          display: block;
        }
        :host > header.open > ${this.getAttribute('m-navigation') || 'm-navigation'} {
          animation: open .3s ease-out;
          left: 0;
        }
        :host > header > *:first-child {
          align-self: center;
          padding: var(--a-menu-icon-padding);
        }
      }
      @keyframes open {
        0% {left: -100vw}
        100% {left: 0}
      }
      @keyframes close {
        0% {left: 0}
        100% {left: -100vw}
      }
    `
  }
}
