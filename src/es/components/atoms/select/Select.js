// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
 * Creates a select options box
 *
 * @export
 * @type {CustomElementConstructor}
 */
export default class Select extends Shadow() {
  constructor (options = {}, ...args) {
    super({ mode: 'open', tabindex: 'no-tabindex', ...options }, ...args)

    this.allowedTypes = ['text', 'number', 'email', 'password', 'tel', 'url', 'search']
    this.setAttribute('role', 'listbox')
    this.isReadonly = this.hasAttribute('readonly') || this.getAttribute('readonly') === 'true'

    this.changeListener = event => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('selected') || 'selected', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          value: this.selectField.value
        }
      }))
    }

    this.answerEventListener = async event => {
      this.selectField.querySelector(`[value="${event.detail.selectedValue || ''}"]`)?.setAttribute('selected', '')
    }

    this.renderEventNameListener = event => {
      event.detail.fetch.then(data => {
        this.html = ''
        /* eslint-disable */
        this.html = /* HTML */`
          <select ${data.name ? `name="$data.name}"` : ''} ${data.id ? `id="$data.id}"` : ''}>
            ${this.hasAttribute('placeholder') ? /* HTML */`<option value="">${this.getAttribute('placeholder')}</option>` : ''}
            ${data.options ? data.options.map(option => /* HTML */`<option value="${option.value}">${option.textContent}</option>`, '') : ''}
          </select>
        `
        this.selectField.addEventListener('change', this.changeListener)
      })
    }

    if (this.isReadonly) {
      this.root.querySelector('select').setAttribute('readonly', '')
    }
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.selectField) this.selectField.addEventListener('change', this.changeListener)
      if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    if (this.hasAttribute('render-event-name')) document.body.addEventListener(this.getAttribute('render-event-name') || 'render-event-name', this.renderEventNameListener)
    if (this.hasAttribute('request-render-event-name')) {
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-render-event-name') || 'request-render-event-name', {
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  disconnectedCallback() {
    this.selectField.removeEventListener('change', this.changeListener)
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    if (this.hasAttribute('render-event-name')) document.body.removeEventListener(this.getAttribute('render-event-name') || 'render-event-name', this.renderEventNameListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  renderCSS() {
    this.css = /* css */`
      :host {
        height: calc(var(--select-line-height, 1.4) * 1em + var(--select-padding-top, 0.75em) + var(--select-padding-bottom, 0.75em)); /* workaround IOS */
      }
      select {
        background-color: var(--select-background-color, var(--background-color, unset));
        border: var(--select-border, var(--border, 1px solid transparent));
        border-color: var(--select-border-color, var(--border-color, var(--m-gray-300)));
        border-radius: var(--select-border-radius, var(--border-radius, 0.5em));
        color: var(--select-color, var(--color));
        cursor: pointer;
        display: block;
        font-family: inherit;
        font-size: var(--select-font-size, var(--font-size));
        height: var(--select-height, 100%);
        line-height: var(--select-line-height, 1.4);
        padding: var(--select-padding, 0.75em var(--content-spacing));
        text-overflow: var(--select-text-overflow, var(--text-overflow, ellipsis));
        width: 100%;
      }
      select:focus-visible {
        outline: none;
        box-shadow: none;
        border: var(--select-border-focus-visible, var(--select-border, var(--border, 1px solid transparent)));
        border-color: var(--select-border-color-focus-visible, var(--outline-color, var(--select-border-color, var(--border-color, var(--m-gray-300)))));
        border-radius: var(--select-border-radius-focus-visible, var(--select-border-radius, var(--border-radius, 0.5em)));
      }
      select > option {
        cursor: pointer;
      }
      select[readonly] {     
        cursor:no-drop;     
        user-select: none;     
        pointer-events: none;     
        opacity: 0.7; 
      } 
      select[readonly] option:not([selected]) {
        display:none; 
      }
      :host([chevron-down]) select {
        appearance: none;
        background-image: url('data:image/svg+xml;utf8,<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>');
        background-repeat: no-repeat;
        background-position: right 1em center;
        background-size: 1.5em;
      }
      @media only screen and (max-width: _max-width_) {
        select {
          border-radius: var(--select-border-radius-mobile, var(--select-border-radius, var(--border-radius-mobile, var(--border-radius, 0.571em))));
          font-size: var(--select-font-size-mobile, var(--select-font-size, var(--font-size-mobile, var(--font-size))));
          padding: var(--select-padding, 0.75em var(--content-spacing-mobile));
          height: var(--select-height-mobile, var(--select-height, 100%));
        }
      }
    `
  }

  get selectField() {
    return this.root.querySelector('select')
  }
}
