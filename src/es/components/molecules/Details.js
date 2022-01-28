// @ts-check
import { Details as BaseDetails } from '../web-components-cms-template/src/es/components/molecules/Details.js'
import { Mutation } from '../web-components-cms-template/src/es/components/prototypes/Mutation.js'
import Body from '../organisms/Body.js'

/* global self */

/**
 * Details (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) aka. Bootstrap accordion
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Details
 * @type {CustomElementConstructor}
 * @css {

 * }
 * @attribute {

 * }
 */
export default class Details extends BaseDetails(Mutation(Body)) {
  constructor (...args) {
    super(...args)

    this.svgWidth = '1em'
    this.svgHeight = '1em'
    this.svgColor = 'var(--m-gray-400)'
  }

  /**
   * renders the m-Details css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */` 
      :host {
        box-sizing: border-box;
        margin-top: 0 !important;
        margin-bottom: 0 !important;
      }
      :host details summary.bold .icon {
        font-weight: bold;
      }
      :host details summary ~ ul.icons, :host details[open] summary ~ ul.icons {
        margin: var(--ul-icons-margin, 0 0 0 1em);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          margin: 0 5% !important;
          width: 90% !important;
        }
      }
    `
    super.renderCSS()
  }
}
