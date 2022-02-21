// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

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
        display: block;
      }
      button {
        align-items: center;
        background-color: var(--background-color, #000000);
        border-radius: var(--border-radius, 8px);
        border: var(--border-width, 0) solid var(--border-color, transparent);
        color: var(--color, #FFFFFF);
        cursor: pointer;
        display: flex;
        justify-content: center;
        letter-spacing: var(--letter-spacing, normal);
        line-height: var(--line-height, 1.5em);
        margin: var(--margin, 0);
        outline: var(--outline, none);
        overflow: hidden;
        padding: var(--padding, 12px 24px);
        position: relative;
        touch-action: manipulation;
        transition: background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out;
        width: var(--width, auto);
      }
      button:hover {
        background-color: var(--background-color-hover, #B24800);
        border: var(--border-width-hover, var(--border-width, 0)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
        color: var(--color-hover, #FFFFFF);
      }
      button:active {
        background-color: var(--background-color-active, #803300);
        color: var(--color-active, #FFFFFF);
      }
      button.active .ripple {
        animation-duration: 0.4s;
        animation-name: ripple;
        animation-timing-function: ease-out;
        background-color: var(--background-color-ripple, #808080);
        border-radius: 50%;
        left: 50%;
        position: absolute;
        top: 50%;
        transform: translate(-50%, -50%);
      }
      :host([disabled]) button {
        border: var(--disabled-border-width, var(--border-width, 0)) solid var(--disabled-border-color, var(--border-color, #FFFFFF));
        background-color: var(--disabled-background-color, #FFDAC2);
        color: var(--color, #FFFFFF);
        cursor: not-allowed;
        opacity: 0.5;
        transition: opacity 0.3s ease-out;
      }
      :host([disabled]) button:hover {
        opacity: 0.5;
      }
      :host([disabled]) button .ripple {
        display: none;
      }
      :host([circle]) button {
        padding: 8px;
        border-radius: 50%;
      }
      :host([small]) button {
        padding: var(--small-padding, 6px 10px 4px);
      }
      :host([large]) button {
        padding: var(--large-padding, 16px 20px 14px);
      }
      :host([raised]) button {
        background-color: var(--raised-background-color, #FF6600);
        border: none;
        box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
      }
      :host([raised]) button:hover {
        background-color: var(--raised-background-color-hover, #B24800);
      }
      :host([raised]) button:active {
        background-color: var(--raised-background-color-active, #803300);
      }
      :host([raised]) button[disabled]:hover {
        background-color: var(--raised-background-color-disabled, #FF6600);
      }
      #label {
        display: inline-block;
        font-family: var(--label-font-family, text, Helvetica, Arial, sans-serif);
        font-size: var(--label-font-size, 1em);
        font-weight: var(--label-font-weight, 400);
        position: relative;
      }
      #label.hide {
        display: none;
      }
      ::slotted([slot="left-icon"]) {
        font-size: var(--icon-size, 24px) !important;
      }
      :host([label]) ::slotted([slot="left-icon"]) {
        margin-right: var(--label-left-icon-margin-left, 8px);
      }
      ::slotted([slot="right-icon"]) {
        font-size: var(--icon-size, 24px) !important;
      }
      :host([label]) ::slotted([slot="right-icon"]) {
        margin-left: var(--label-right-icon-margin-left, 8px);
      }
      @media only screen and (max-width: _max-width_) {
        button {
          margin: var(--margin-mobile, var(--margin, 0));
        }
        #label {
          font-size: var(--font-size-mobile, var(--font-size, 14px));
        }
        ::slotted([slot="left-icon"]) {
          font-size: var(--icon-size-mobile, var(--icon-size, 24px)) !important;
        }
        ::slotted([slot="right-icon"]) {
          font-size: var(--icon-size-mobile, var(--icon-size, 24px)) !important;
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
    switch (this.getAttribute('namespace')) {
      case 'button-primary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./primary-/primary-.css`,
          namespace: false
        }])
      case 'button-secondary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./secondary-/secondary-.css`,
          namespace: false
        }])
      case 'button-tertiary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tertiary-/tertiary-.css`,
          namespace: false
        }])
      case 'button-quaternary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./quaternary-/quaternary-.css`,
          namespace: false
        }])
    }
  }

  renderHTML () {
    this.html = /* html */`
      <button type="button">
        <div class="ripple"></div>
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
