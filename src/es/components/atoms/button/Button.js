// @ts-check

/* global self */

import { Shadow } from '../../web-components/src/es/components/prototypes/Shadow.js'

/**
 * Creates an MSWC Button by the blueprints of:
 * TODO: update the buttons.html with last changes (include colors.css, variables.css, fonts, remove unneeded sizes... find figma stuff)
 * https://components.migros.ch/components/atoms/buttons.html
 * https://github.com/DannyMoerkerke/material-webcomponents/blob/master/src/material-button.js
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Button extends Shadow() {
  static get observedAttributes () {
    return ['label']
  }

  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'open' }), ...args)

    this.clickListener = event => {
      this.button.classList.add('active')
      if (this.hasAttribute('href')) {
        event.stopPropagation()
        self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
      }
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    this.animationendListener = event => this.button.classList.remove('active')
    if (!this.children.length) this.labelText = this.textContent // allow its initial textContent to become the label if there are no nodes but only text
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    this.button.addEventListener('click', this.clickListener)
    this.ripple.addEventListener('animationend', this.animationendListener)
  }

  disconnectedCallback () {
    this.button.removeEventListener('click', this.clickListener)
    this.ripple.removeEventListener('animationend', this.animationendListener)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'label') {
      this.labelText = newValue
      if (this.label) {
        this.label.textContent = this.labelText || ''
        this.label.classList[this.labelText ? 'remove' : 'add']('hide')
      }
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.button || !this.label || !this.ripple
  }

  renderCSS () {
    this.css = /* css */`
      :host {
        --default-border-color-disabled: var(--m-orange-300, #FFDAC2);
        --default-border-radius: 8px;
        --default-button-color-active: var(--m-orange-900, #803300);
        --default-button-color-hover: var(--m-orange-800, #B24800);
        --default-button-color: var(--m-orange-600, #FF6600);
        --default-button-width: auto;
        --default-font-color-active: white;
        --default-font-color-hover: white;
        --default-font-color: white;
        --default-font-family: text, Helvetica, Arial, sans-serif;;
        --default-font-size: 16px;
        --default-icon-size: 24px;
        --default-line-height: 1.5em;
        --default-padding: 10px 24px;
        display: block;
      }
      button {
        align-items: center;
        background-color: var(--button-color, var(--default-button-color));
        border: none;
        border-radius: var(--border-radius, var(--default-border-radius));
        color: var(--font-color, var(--default-font-color));
        cursor: pointer;
        display: flex;
        justify-content: center;
        letter-spacing: .5px;
        line-height: var(--line-height, var(--default-line-height));
        outline: none;
        overflow: hidden;
        margin: var(--margin, 0);
        padding: var(--padding, var(--default-padding));
        position: relative;
        touch-action: manipulation;
        transition: background-color 0.3s ease-out, border-bottom-color 0.3s ease-out, color 0.3s ease-out;
        width: var(--button-width, var(--default-button-width));
      }
      button:hover {
        background-color: var(--button-color-hover, var(--default-button-color-hover));
        color: var(--font-color-hover, var(--default-font-color-hover));
      }
      button:active {
        background-color: var(--button-color-active, var(--default-button-color-active));
        color: var(--font-color-active, var(--default-font-color-active));
      }
      button.active .ripple {
        animation-duration: 0.4s;
        animation-name: ripple;
        animation-timing-function: ease-out;
        background-color: #808080;
        border-radius: 50%;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      :host([disabled]) button {
        cursor: not-allowed;
        opacity: 0.5;
        transition: opacity 0.3s ease-out;
      }
      :host([disabled]) button:hover {
        opacity: 0.3;
      }
      :host([disabled]) button .ripple {
        display: none;
      }
      :host([circle]) button {
        padding: 8px;
        border-radius: 50%;
      }
      :host([small]) button {
        padding: 6px 10px 4px;
      }
      :host([large]) button {
        padding: 16px 20px 14px;
      }
      :host([outline]) button {
        background-color: transparent;
        border: 2px solid var(--button-color, var(--default-button-color));
        color: var(--button-color, var(--default-button-color));
        transition: border-color 0.3s ease-out, color 0.3s ease-out;
      }
      :host([outline]) button:hover {
        border-color: var(--button-color-hover, var(--default-button-color-hover));
        color: var(--button-color-hover, var(--default-button-color-hover));
      }
      :host([outline]) button:active {
        border-color: var(--button-color-active, var(--default-button-color-active));
        color: var(--button-color-active, var(--default-button-color-active));
      }
      :host([raised]) button {
        background-color: var(--button-color, var(--default-button-color));
        border: none;
        box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
      }
      :host([raised]) button:hover {
        background-color: var(--button-color-hover, var(--default-button-color-hover));
      }
      :host([raised]) button:active {
        background-color: var(--button-color-active, var(--default-button-color-active));
      }
      :host([raised]) button[disabled]:hover {
        background-color: var(--button-color, var(--default-button-color));
      }
      #label {
        display: inline-block;
        font-family: var(--font-family, var(--default-font-family));
        font-size: var(--font-size, var(--default-font-size));
        font-weight: 700;
        position: relative;
      }
      #label.hide {
        display: none;
      }
      ::slotted([slot="left-icon"]) {
        font-size: var(--icon-size, var(--default-icon-size)) !important;
      }
      :host([label]) ::slotted([slot="left-icon"]) {
        margin-right: 8px;
      }
      ::slotted([slot="right-icon"]) {
        font-size: var(--icon-size, var(--default-icon-size)) !important;
      }
      :host([label]) ::slotted([slot="right-icon"]) {
        margin-left: 8px;
      }
      ::slotted([slot="file-input"]) {
        bottom: 0;
        cursor: pointer;
        left: 0;
        opacity: 0;
        position: absolute;
        right: 0;
        top: 0;
        width: 100%;
        z-index: 9;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        button {
          margin: var(--margin-mobile, var(--margin, 0));
        }
        #label {
          font-size: var(--font-size-mobile, var(--font-size, var(--default-font-size)));
        }
        ::slotted([slot="left-icon"]) {
          font-size: var(--icon-size-mobile, var(--icon-size, var(--default-icon-size))) !important;
        }
        ::slotted([slot="right-icon"]) {
          font-size: var(--icon-size-mobile, var(--icon-size, var(--default-icon-size))) !important;
        }
      }
      @keyframes ripple {
        from {
          height: 0;
          opacity: 0.8;
          width: 0;
        }
        to {
          height: 100px;
          opacity: 0.1;
          width: 100px;
        }
      }
    `
  }

  renderHTML () {
    this.html = /* html */`
      <button type="button">
        <div class="ripple"></div>
        <slot name="file-input"></slot>
        <slot name="left-icon"></slot>
        <span id="label"${!this.labelText ? ' class="hide"' : ''}>${this.labelText || ''}</span>
        <slot name="right-icon"></slot>
      </button>
    `
  }

  get disabled () {
    return this.hasAttribute('disabled')
  }

  set disabled (isDisabled) {
    this.button.disabled = isDisabled
    isDisabled ? this.setAttribute('disabled', '') : this.removeAttribute('disabled')
  }

  get button () {
    return this.root.querySelector('button')
  }

  get label () {
    return this.root.querySelector('#label')
  }

  get ripple () {
    return this.root.querySelector('.ripple')
  }
}
