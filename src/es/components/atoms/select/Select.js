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
    super(Object.assign(options, { mode: 'open' }), ...args)

    this.allowedTypes = ['text', 'number', 'email', 'password', 'tel', 'url', 'search']
    this.setAttribute('role', 'listbox')

    this.changeListener = event => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('selected') || 'selected', {
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: {
          this: this,
          value: this.selectField.value
        }
      }))
    }

    this.renderEventNameListener = event => {
      event.detail.fetch.then(data => {
        this.html = ''
        this.html = /* HTML */`
          <select ${data.name ? `name="$data.name}"` : ''} ${data.id ? `id="$data.id}"` : ''}>
            ${this.hasAttribute('placeholder') ? /* HTML */`<option value="">${this.getAttribute('placeholder')}</option>` : ''}
            ${data.options ? data.options.map(option => /* HTML */`<option value="${option.value}">${option.textContent}</option>`, '') : ''}
          </select>
        `
        this.selectField.addEventListener('change', this.changeListener)
      })
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    // render template
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    Promise.all(showPromises).then(() => {
      if (this.selectField) this.selectField.addEventListener('change', this.changeListener)
      this.hidden = false
    })
    if (this.hasAttribute('render-event-name')) document.body.addEventListener(this.getAttribute('render-event-name') || 'render-event-name', this.renderEventNameListener)
    if (this.hasAttribute('request-render-event-name')) this.dispatchEvent(new CustomEvent(this.getAttribute('request-render-event-name') || 'request-render-event-name', {
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  disconnectedCallback () {
    this.selectField.removeEventListener('change', this.changeListener)
    if (this.hasAttribute('render-event-name')) document.body.removeEventListener(this.getAttribute('render-event-name') || 'render-event-name', this.renderEventNameListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
    this.css = /* css */`
      select {
        border: var(--select-border, var(--border, 1px solid transparent));
        border-color: var(--select-border-color, var(--border-color, var(--m-gray-300)));
        border-radius: var(--select-border-radius, var(--border-radius, 0.5em));
        color: var(--select-color, var(--color));
        cursor: pointer;
        display: block;
        font-family: inherit;
        font-size: var(--select-font-size, var(--font-size));
        height: 100%;
        line-height: 1.4;
        padding: var(--select-padding, 0.75em var(--content-spacing));
        text-overflow: var(--select-text-overflow, var(--text-overflow, ellipsis));
        width: 100%;
      }
      select:focus {
        outline: none;
        box-shadow: none;
      }
      select > option {
        cursor: pointer;
      }
      @media only screen and (max-width: _max-width_) {
        select {
          border-radius: var(--select-border-radius-mobile, var(--select-border-radius, var(--border-radius-mobile, var(--border-radius, 0.571em))));
          font-size: var(--select-font-size-mobile, var(--select-font-size, var(--font-size-mobile, var(--font-size))));
        }
      }
    `
  }

  get selectField () {
    return this.root.querySelector('select')
  }
}
