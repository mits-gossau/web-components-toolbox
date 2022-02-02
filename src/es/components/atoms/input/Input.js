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
 * @type {CustomElementConstructor}
 */
export default class Input extends Shadow() {
  static get observedAttributes () {
    return ['readonly', 'disabled', 'error']
  }

  constructor (options = {}, ...args) {
    super(Object.assign(options, { mode: 'open' }), ...args)

    this.allowedTypes = ['text', 'number', 'email', 'password', 'tel', 'url', 'search']
    if (!this.children.length) this.labelText = this.textContent
    this.searchTermWrapper = ['"', '%22']

    this.clickListener = event => {
      if (!this.inputField.value) return
      if (this.getAttribute('search')) {
        location.href = `${this.getAttribute('search')}${this.searchTermWrapper[0]}${this.inputField.value}${this.searchTermWrapper[0]}`
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
    this.keydownListener = event => {
      if (event.keyCode === 13) return this.clickListener(event)
    }
  }

  connectedCallback () {
    // render template
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()

    // init configuration
    this.disabled = this.hasAttribute('disabled')
    this.readonly = this.hasAttribute('readonly')
    this.error = this.hasAttribute('error')

    if (this.placeholder && this.inputField) this.inputField.setAttribute('placeholder', this.placeholder)
    if (this.autocomplete && this.inputField) this.inputField.setAttribute('autocomplete', this.autocomplete)

    if (this.search && this.searchButton && !this.readonly && !this.disabled && !this.error) {
      this.searchButton.addEventListener('click', this.clickListener)
      document.addEventListener('keydown', this.keydownListener)
      if (this.getAttribute('search') && location.href.includes(this.getAttribute('search'))) this.inputField.value = decodeURI(location.href.split(this.getAttribute('search'))[1]).replace(new RegExp(`[${this.searchTermWrapper[0]}${this.searchTermWrapper[1]}]*`, 'g'), '')
    }
  }

  disconnectedCallback () {
    if (this.search && this.searchButton && !this.readonly && !this.disabled && !this.error) {
      this.searchButton.removeEventListener('click', this.clickListener)
      document.removeEventListener('keydown', this.keydownListener)
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
  shouldComponentRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
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
        --default-border-color: #FF6600;
        --default-border-color-disabled: #E9855F;

        --default-input-bg-color: #F1EFEE;
        --default-input-bg-color-focus: #FFF;
        --default-input-bg-color-error: #FFE5E5;
        --default-input-color: #333;
        --default-input-font-size: 18px;

        --default-font-family: text, Helvetica, Arial, sans-serif;
        --default-font-color: #767676;
        --default-font-size: 14px;

        --default-color-error: #F00;

        --default-icon-color: #F60;

        --default-search-input-border-color: #E7E5E3;

        display: block;
      }

      .mui-form-group {
        font-family: var(--font-family, var(--default-font-family));
        margin-bottom: var(--margin-bottom, 30px);
        max-width: var(--max-width, none);
      }

      label {
        font-size: var(--font-size, var(--default-font-size));
        font-weight: 700;
        letter-spacing: .5px;
        text-transform: uppercase;
        line-height: 1;
        color: var(--font-color, var(--default-font-color));
        display: block;
        margin-bottom: 10px;
      }

      input {
        caret-color: var(--caret-color, var(--input-color, var(--default-input-color)));
        display: block;
        padding: 10px 15px;
        width: 100%;
        font-family: inherit;
        font-size: var(--input-font-size, var(--default-input-font-size));
        line-height: 1.5;
        color: var(--input-color, var(--default-input-color));
        appearance: none;
        background: var(--input-bg-color, var(--default-input-bg-color));
        border: var(--border, 2px solid transparent);
        border-bottom-color: var(--border-color, var(--default-border-color));
        transition: background ease-in-out .15s, border-color ease-in-out .15s;
      }

      input::placeholder {
        color: var(--font-color, var(--default-font-color));
        opacity: 1;
      }

      input:focus {
        outline: none;
        box-shadow: none;
      }

      input:focus:not(:read-only):not(:invalid) {
        background: #fff;
        border: var(--border-focus, var(--border, 2px solid transparent));
        border-color: var(--border-color-focus, var(--border-color, var(--default-border-color)));
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
        border-color: var(--search-input-border-color, var(--default-search-input-border-color));
        padding: 10px 15px;
        padding-right: max(2.5em, 35px);
        border-radius: var(--border-radius, 4px);
      }

      :host([search]) button {
        height: max(2.5em, 35px);
        position: absolute;
        bottom: 0.2em;
        right: 0;
        padding: 5px 7.5px;
        border: 0;
        background: transparent;
        outline: none;
        appearance: none;
        box-shadow: none;
        font-family: inherit;
        font-size: var(--input-font-size, var(--default-input-font-size));
        line-height: 1.5;
        color: var(--icon-color, var(--default-icon-color));
        font-style: normal;
        cursor: pointer;
        width: 3em;
      }

      :host([disabled]) button,
      :host([readonly]) button {
        cursor: not-allowed;
      }

      :host([error]) label,
      :host([error]) input::placeholder,
      :host([search]) button.error,
      label.error {
        color: var(--color-error, var(--default-color-error));
      }

      :host([error]) input,
      :host([error]) input:focus,
      input:invalid {
        border-color: var(--color-error, var(--default-color-error));
        color: var(--color-error, var(--default-color-error));
        background: var(--input-color-bg-error, var(--default-input-bg-color-error));
      }

      @media (hover: hover) {
        input:hover:not(:disabled):not(:read-only):not(:invalid) {
          border-color: var(--border-color-hover, var(--border-color, var(--default-border-color)));
        }

        :host([search]) input:hover {
          border-color: var(--search-input-border-color-hover, var(--search-input-border-color, var(--default-search-input-border-color)));
        }

        :host([error]) input:hover:not(:disabled):not(:read-only) {
          border-color: var(--color-error-hover, var(--color-error, var(--default-color-error)));
        }
      }

      @media only screen and (max-width: _max-width_) {
        .mui-form-group {
          max-width: var(--max-width-mobile, var(--max-width, none));
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
