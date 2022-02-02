// @ts-check
import { Mutation } from '../../prototypes/Mutation.js'

/* global CustomEvent */
/* global Image */

/**
 * Details (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) aka. Bootstrap accordion
 * Example at: /src/es/components/molecules/NavigationClassics.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Details
 * @type {CustomElementConstructor}
 * @css {
 *  --text-align, center
 *  --margin, 0
 *  --padding, 0
 *  --marker-display, none
 *  --marker-content, ""
 *  --summary-cursor, pointer
 *  --summary-text-decoration, underline
 *  --summary-outline, none
 *  --summary-margin, 0
 *  --summary-padding, 0
 *  --summary-text-decoration-open, none
 *  --summary-child-margin, 0
 *  --summary-child-padding, 0
 *  --summary-child-margin-open, 0
 *  --summary-child-padding-open, 0
 *  --child-margin, 0
 *  --child-padding, 0
 *  --animation, 0.1s ease
 *  --child-margin-open, 0
 *  --child-padding-open, 0
 *  --a-color, var(--color)
 *  --close-cursor, pointer
 *  --close-display, block
 *  --close-text-decoration, underline
 *  --close-text-transform, uppercase
 * }
 * @attribute {
 *  {boolean} [open=false] opens the details
 *  {string} [openEventName='open'] the event to which it listens on body
 *  {has} [scroll-into-view=n.a.] scrolls into view if set
 *  {has} [icon-image=n.a] add open/close icon
 * }
 */

export const Details = (ChosenHTMLElement = Mutation()) => class Wrapper extends ChosenHTMLElement {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { mutationObserverInit: { attributes: true, attributeFilter: ['open'] } }), ...args)

    this.svgWidth = '1em'
    this.svgHeight = '1em'
    this.svgColor = 'var(--m-gray-400)'
    this.hasRendered = false
    // overwrite default Mutation observer parent function created at super
    this.mutationObserveStart = () => {
      // @ts-ignore
      if (this.details) this.mutationObserver.observe(this.details, this.mutationObserverInit)
    }

    this.openEventListener = event => {
      if (this.details && event.detail.child) {
        if (event.detail.child === this) {
          if (this.hasAttribute('scroll-into-view')) this.details.scrollIntoView({ behavior: 'smooth' })
        } else {
          this.details.removeAttribute('open')
        }
      }
    }

    this.clickEventListener = event => {
      if (this.details && event.target && event.target.classList.contains('close')) {
        event.preventDefault()
        this.details.removeAttribute('open')
        if (this.summary.getBoundingClientRect().top < 0) this.details.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    document.body.addEventListener(this.openEventName, this.openEventListener)
    this.root.addEventListener('click', this.clickEventListener)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.body.removeEventListener(this.openEventName, this.openEventListener)
    this.root.removeEventListener('click', this.clickEventListener)
  }

  mutationCallback (mutationList, observer) {
    mutationList.forEach(mutation => {
      if (mutation.target.hasAttribute('open')) {
        this.dispatchEvent(new CustomEvent(this.openEventName, {
          detail: {
            child: this
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    })
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
    return !this.hasRendered
  }

  /**
   * renders the m-Details css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */` 
      :host {
        border-bottom:var(--border-bottom, 0);
        border-color: var(--border-color, var(--color));
        border-top: var(--border-top, 0);
        box-sizing: border-box;
        display: var(--display, block);
        margin-bottom: 0 !important;
        margin-top: 0 !important;
      }
      :host(:last-of-type) {
        border-bottom:var(--border-bottom-last, var(--border-bottom, 0));
        border-color: var(--border-color-last, var(--border-color, var(--color)));
      }
      :host details {
        text-align: var(--text-align, center);
        margin: var(--margin, 0);
        padding: var(--padding, 0);
      }
      :host details summary::marker, :host details summary::-webkit-details-marker {
        display: var(--marker-display, none);
        content: var(--marker-content, "");
      }
      :host details summary, :host details summary:focus {
        outline: none;
      }
      :host details summary > div {
        cursor: var(--summary-cursor, pointer);
        font-family: var(--summary-font-family, var(--font-family, var(--font-family-bold)));
        font-size:var(--summary-font-size, inherit);
        font-weight: var(--summary-font-weight, var(--font-weight, normal));
        margin: var(--summary-margin, 0);
        outline: var(--summary-outline, none);
        padding: var(--summary-padding, 0);
        text-decoration: var(--summary-text-decoration, var(--a-text-decoration, var(--text-decoration, none)));
        text-transform: var(--summary-text-transform, none);
        text-underline-offset: var(--a-text-underline-offset, unset);
      }
      :host details summary > div:hover, :host details summary > div:active, :host details summary > div:focus {
        text-decoration: var(--summary-text-decoration-hover, var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none)))));
      }
      :host details[open] summary > div {
        text-decoration: var(--summary-text-decoration-open, none);
        font-family: var(--summary-font-family, var(--font-family-bold, var(--font-family)));
      }
      :host details summary > div > * {
        margin: var(--summary-child-margin, 0);
        padding: var(--summary-child-padding, 0);
      }
      :host details[open] summary > div > * {
        margin: var(--summary-child-margin-open, 0);
        padding: var(--summary-child-padding-open, 0);
      }
      :host details summary ~ * {
        margin: var(--child-margin, 0);
        padding: var(--child-padding, 0);
      }
      :host details[open] summary ~ * {
        animation: var(--animation, open 0.2s ease);
        margin: var(--child-margin-open, 0);
        padding: var(--child-padding-open, 0);
      }
      :host details summary ~ ul, :host details[open] summary ~ ul {
        display: var(--ul-display, inline-block);
        margin: var(--ul-margin, 0 0 0 1em);
      }
      :host details .close {
        color: var(--a-color, var(--color));
        cursor: var(--close-cursor, pointer);
        display: var(--close-display, block);
        text-decoration: var(--close-text-decoration, var(--a-text-decoration, var(--text-decoration, none)));
        text-underline-offset: var(--a-text-underline-offset, unset);
        text-transform: var(--close-text-transform, uppercase);
      }
      :host details .close:hover, :host details .close:active, :host details .close:focus {
        text-decoration: var(--close-text-decoration-hover, var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none)))));
      }
      :host details summary.bold .icon {
        font-weight: bold;
      }
      :host details .icon {
        display: var(--icon-display, flex);
        flex-direction: var(--icon-row, row);
        justify-content: var(--icon-justify-content, center);
        align-items: var(--icon-align-items, flex-start);
      }
      :host details .icon > img, :host details .icon > div > svg {
        transition: var(--icon-transition, transform 0.15s ease);
        margin: var(--icon-margin, 0 1rem) !important;
      }
      :host details[open] .icon > img, :host details[open] .icon > div > svg  {
        transform: var(--icon-transform-open, rotate(180deg));
      }
      :host details summary ~ ul.icons, :host details[open] summary ~ ul.icons {
        margin: var(--ul-icons-margin, 0 0 0 1em);
      }
      @keyframes open {
        0% {font-size: 0}
        100% {font-size: inherit}
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          margin: 0 5% !important;
          width: 90% !important;
        }
        :host details .icon > img, :host details .icon > div > svg {
          width: var(--icon-width-mobile, min(1.7rem, 10vw))
        }
        :host details summary ~ * {
          padding: var(--child-padding-mobile, var(--child-padding, 0));
        }
        :host details[open] summary ~ * {
          padding: var(--child-padding-open-mobile, var(--child-padding-open, 0));
        }
        :host details summary > div {
          font-size:var(--summary-font-size-mobile, var(--summary-font-size, inherit));
        }
      }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    this.hasRendered = true
    Array.from(this.summary.childNodes).forEach(node => this.divSummary.appendChild(node))
    if (this.getAttribute('icon-image')) {
      const iconImg = new Image()
      iconImg.src = this.getAttribute('icon-image')
      iconImg.alt = 'close detail'
      this.divSummary.append(iconImg)
      this.divSummary.classList.add('icon')
    } else if (this.hasAttribute('icon-image')) {
      const iconSvg = document.createElement('div')
      iconSvg.innerHTML = `
        <?xml version="1.0" encoding="UTF-8"?>
        <svg width="${this.svgWidth || '35px'}" height="${this.svgHeight || '20px'}" viewBox="0 0 35 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
            <title>Mobile Pfeil</title>
            <desc>Created with Sketch.</desc>
            <g id="Mobile-Pfeil" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <polyline id="Path-2" stroke="${this.svgColor || `var(--color, --${this.namespace}color)`}" stroke-width="3" points="2 3 17 18 32 3"></polyline>
            </g>
        </svg>
      `
      this.divSummary.append(iconSvg)
      this.divSummary.classList.add('icon')
    }
    this.summary.appendChild(this.divSummary)
  }

  get openEventName () {
    return this.getAttribute('open-event-name') || 'open'
  }

  get summary () {
    return this.root.querySelector('summary')
  }

  get details () {
    return this.root.querySelector('details')
  }

  get divSummary () {
    return this._divSummary || (this._divSummary = document.createElement('div'))
  }
}
