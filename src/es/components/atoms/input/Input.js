// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */
/* global location */

/**
 * Creates an MSWC Textarea by the blueprints of:
 * https://components.migros.ch/components/atoms/inputs.html
 * https://github.com/DannyMoerkerke/material-webcomponents/blob/master/src/material-textfield.js
 *
 * @export
 * @attribute {namespace} namespace
 * @attribute {any-key-listener} listens to any change by key stroke with a 1s delay
 * @attribute {change-listener} native change event listener listens on blur
 * @attribute {delete-listener} listens click on this and figures native delete cross click
 * @type {CustomElementConstructor}
 */
export default class Input extends Shadow() {
  static get observedAttributes () {
    return ['readonly', 'disabled', 'error']
  }

  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'open' }), ...args)

    this.allowedTypes = ['text', 'number', 'email', 'password', 'tel', 'url', 'search']
    this.setAttribute('role', this.inputType)
    this.setAttribute('aria-label', this.inputType)
    if (!this.children.length) this.labelText = this.textContent

    this.lastValue = ''
    this.clickListener = (event, retry = true) => {
      if (this.lastValue === this.inputField.value) {
        // when delete native icon is pushed the value is not updated when the event hits here
        if (retry && event.composedPath()[0] === this.inputField) setTimeout(() => this.clickListener(event, false), 50)
        return
      }
      this.lastValue = this.inputField.value
      if (this.getAttribute('search')) {
        if (!this.inputField.value) return
        location.href = `${this.getAttribute('search')}${encodeURIComponent(this.inputField.value)}`
      } else {
        this.dispatchEvent(new CustomEvent(this.getAttribute('submit-search') || 'submit-search', {
          bubbles: true,
          cancelable: true,
          composed: true,
          detail: {
            key: this.inputId,
            value: this.inputField.value
          }
        }))
      }
    }
    this.changeListener = event => this.clickListener(event)
    this.keydownTimeoutId = null
    this.keydownListener = event => {
      if (this.root.querySelector(':focus') !== this.inputField) return
      if (!this.hasAttribute('any-key-listener') && event.keyCode !== 13) return
      clearTimeout(this.keydownTimeoutId)
      this.keydownTimeoutId = setTimeout(() => this.clickListener(event), event.keyCode === 13 ? 0 : 1000) // no timeout on enter
    }
    this.answerEventListener = async event => {
      let searchTerm = event.detail.searchTerm

      if (this.getAttribute('active-detail-property-name')) {
        searchTerm = await this.getAttribute('active-detail-property-name').split(':').reduce(async (accumulator, propertyName) => {
          propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())
          if (accumulator instanceof Promise) accumulator = await accumulator
          return accumulator[propertyName]
        }, event.detail)
      }
      if (searchTerm) {
        this.inputField.value = searchTerm
        this.lastValue = this.inputField.value
      } else {
        this.inputField.value = ''
      }
    }
  }

  connectedCallback () {
    // render template
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.shouldRenderCSS()) this.renderCSS()

    // init configuration
    this.disabled = this.hasAttribute('disabled')
    this.readonly = this.hasAttribute('readonly')
    this.error = this.hasAttribute('error')

    if (this.placeholder && this.inputField) this.inputField.setAttribute('placeholder', this.placeholder)
    if (this.autocomplete && this.inputField) this.inputField.setAttribute('autocomplete', this.autocomplete)

    if (this.search && this.searchButton && !this.readonly && !this.disabled && !this.error) {
      if (this.hasAttribute('delete-listener')) {
        this.addEventListener('click', this.clickListener)
      } else {
        this.searchButton.addEventListener('click', this.clickListener)
      }
      if (this.hasAttribute('change-listener')) this.inputField.addEventListener('change', this.changeListener)
      document.addEventListener('keydown', this.keydownListener)
      if (this.getAttribute('search') && location.href.includes(this.getAttribute('search'))) this.inputField.value = decodeURIComponent(location.href.split(this.getAttribute('search'))[1])
      if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    }
  }

  disconnectedCallback () {
    if (this.search && this.searchButton && !this.readonly && !this.disabled && !this.error) {
      if (this.hasAttribute('delete-listener')) {
        this.removeEventListener('click', this.clickListener)
      } else {
        this.searchButton.removeEventListener('click', this.clickListener)
      }
      if (this.hasAttribute('change-listener')) this.inputField.removeEventListener('change', this.changeListener)
      document.removeEventListener('keydown', this.keydownListener)
      if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    }
  }

  attributeChangedCallback (name) {
    this[name] = this.hasAttribute(name)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.inputField
  }

  renderCSS () {
    this.css = /* css */`
      *,
      *::before,
      *::after {
        box-sizing: border-box;
      }

      :host {
        display: block;
      }

      .mui-form-group {
        font-family: var(--font-family);
        margin-bottom: var(--margin-bottom, var(--content-spacing));
        max-width: var(--max-width, none);
      }

      label {
        font-size: var(--font-size);
        font-weight: 700;
        letter-spacing: 0.03em;
        line-height: 1;
        color: var(--color);
        display: block;
        margin-bottom: 0.625em;
      }

      input {
        caret-color: var(--caret-color, var(--input-color, var(--color-secondary, var(--color))));
        display: block;
        padding: 0.625em 1em;
        width: 100%;
        font-family: inherit;
        font-size: var(--input-font-size, var(--font-size));
        line-height: 1.4;
        color: var(--input-color, var(--color));
        appearance: none;
        background: var(--input-bg-color, var(--m-gray-200));
        border: var(--border, 1px solid transparent);
        transition: background ease-out .3s, border-color ease-out .3s;
      }

      input::placeholder {
        color: var(--placeholder-color, var(--m-gray-500));
        opacity: 1;
      }

      input:focus {
        outline: none;
        box-shadow: none;
      }

      input:focus:not(:read-only):not(:invalid) {
        background: #fff;
        border: var(--border-focus, var(--border, 1px solid transparent));
        border-color: var(--border-color-focus, var(--border-color, var(--m-gray-500)));
      }

      input:visited {
        text-decoration: none;
      }

      input:disabled,
      input:read-only {
        cursor: not-allowed;
      }

      :host([search]) .mui-form-group {
        position: relative;
      }

      :host([search]) input {
        border-color: var(--search-input-border-color, var(--m-gray-300));
        padding: var(--search-input-padding, 0.75em var(--content-spacing));
        padding-right: max(2.5em, 35px);
        border-radius: var(--search-input-border-radius, var(--border-radius, 0.5em));
        width: var(--search-input-width-big, var(--search-input-width, 100%));
        min-width: 9.7em;
      }

      :host([search]) input::-webkit-search-cancel-button {
        margin-right: 0.5em;
      }

      :host([search]) button {
        position: absolute;
        bottom: 0.5em;
        right: 0.47em;
        padding: 0;
        border: 0;
        background: transparent;
        outline: none;
        appearance: none;
        box-shadow: none;
        font-family: inherit;
        font-size: var(--input-font-size, var(--font-size));
        line-height: var(--input-line-height, 0.5em);
        color: var(--icon-color, var(--color-secondary, var(--color)));
        font-style: normal;
        cursor: pointer;
        transition: color ease-out .3s;
      }

      :host([search]) button svg {
        height: var(--svg-size, 2em);
        width: var(--svg-size, 2em);
      }

      :host([disabled]) button,
      :host([readonly]) button {
        cursor: not-allowed;
      }

      :host([error]) label,
      :host([error]) input::placeholder,
      :host([search]) button.error,
      label.error {
        color: var(--color-error, var(--m-red-700));
      }

      :host([error]) input,
      :host([error]) input:focus,
      input:invalid {
        border-color: var(--color-error, var(--m-red-700));
        color: var(--color-error, var(--m-red-700));
        background: var(--input-color-bg-error, var(--m-yellow-300));
      }

      @media (hover: hover) {
        input:hover:not(:disabled):not(:read-only):not(:invalid) {
          border-color: var(--border-color-hover, var(--border-color, var(--m-gray-500)));
          caret-color: var(--caret-color-hover, var(--input-color-hover, var(--color-hover, var(--color))));
        }

        :host([search]) input:hover {
          border-color: var(--search-input-border-color-hover, var(--search-input-border-color, var(--m-gray-300)));
        }

        :host([search]:hover) button {
          color: var(--icon-color-hover, var(--color-hover, var(--color)));
        }

        :host([error]) input:hover:not(:disabled):not(:read-only) {
          border-color: var(--color-error-hover, var(--color-error, var(--m-red-700)));
        }
      }

      @media only screen and (max-width: _max-width_) {
        :host([search]) input {
          padding: var(--search-input-padding-mobile, var(--search-input-padding, 0.75em var(--content-spacing-mobile)));
          border-radius: var(--search-input-border-radius-mobile, var(--search-input-border-radius, var(--border-radius-mobile, var(--border-radius, 0.571em))));
        }
        :host([search]) button {
          right: var(--content-spacing-mobile);
        }
        .mui-form-group {
          max-width: var(--max-width-mobile, var(--max-width, none));
        }
        :host([search]) input::-webkit-search-cancel-button {
          margin-right: 2.5em;
        }
        label, input, :host([search]) button {
          font-size: var(--font-size-mobile, var(--font-size));
        }
      }
    `
  }

  renderHTML () {
    this.html = /* html */`
      <div class="mui-form-group">
        ${this.renderLabelHTML()}
        <input id="${this.inputId}" name="${this.inputId}" type="${this.inputType}" />
        ${this.renderSearchHTML()}
      </div>
    `
    this.inputField.setAttribute('enterkeyhint', this.hasAttribute('enterkeyhint') ? this.getAttribute('enterkeyhint') : 'search')
  }

  renderLabelHTML () {
    return this.labelText ? `<label for="${this.inputId}">${this.labelText}</label>` : ''
  }

  renderSearchHTML () {
    return this.search
      ? `
    <button type="button" title="Search">
      <svg width="100%" height="100%" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
      <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" class="icon-stroke-width" stroke-linecap="round" stroke-linejoin="round"></path>
      <path d="M21 21L16.65 16.65" class="icon-stroke-width" stroke-linecap="round" stroke-linejoin="round"></path>
      </svg>
    </button>`
      : ''
  }

  get inputId () {
    return this.getAttribute('inputId')
  }

  get inputType () {
    return (this.hasAttribute('type') && this.allowedTypes.includes(this.getAttribute('type'))) ? this.getAttribute('type') : 'text'
  }

  get labelField () {
    return this.root.querySelector('label')
  }

  get inputField () {
    return this.root.querySelector('input')
  }

  get searchButton () {
    return this.root.querySelector('button')
  }

  get placeholder () {
    return this.getAttribute('placeholder')
  }

  get autocomplete () {
    return this.getAttribute('autocomplete')
  }

  get search () {
    return this.hasAttribute('search')
  }

  get disabled () {
    return this.hasAttribute('disabled')
  }

  set disabled (isDisabled) {
    if (!this.inputField) return

    isDisabled ? this.inputField.setAttribute('disabled', '') : this.inputField.removeAttribute('disabled')
  }

  get readonly () {
    return this.hasAttribute('readonly')
  }

  set readonly (isReadOnly) {
    if (!this.inputField) return

    isReadOnly ? this.inputField.setAttribute('readonly', '') : this.inputField.removeAttribute('readonly')
  }

  get error () {
    return this.hasAttribute('error')
  }

  set error (isInvalid) {
    if (this.labelField) {
      isInvalid ? this.labelField.classList.add('error') : this.labelField.classList.remove('error')
    }

    if (this.textareaField) {
      isInvalid ? this.textareaField.setAttribute('aria-invalid', 'true') : this.textareaField.removeAttribute('aria-invalid')
    }

    if (this.searchButton) {
      isInvalid ? this.searchButton.classList.add('error') : this.searchButton.classList.remove('error')
    }
  }
}
