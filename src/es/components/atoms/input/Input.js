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
    if (!this.children.length) this.labelText = this.textContent.trim()

    this.lastValue = ''
    this.clickListener = (event, retry = true, force = false) => {
      if (!force && this.lastValue === this.inputField.value) {
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
    this.focusListener = event => this.clickListener(event, undefined, true)
    this.keydownTimeoutId = null
    this.keydownListener = event => {
      if (this.root.querySelector(':focus') !== this.inputField) return
      if (!this.hasAttribute('any-key-listener') && event.keyCode !== 13) return
      // @ts-ignore
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
    this.hidden = true
    const showPromises = []
    // render template
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    Promise.all(showPromises).then(() => {
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
        if (this.hasAttribute('focus-listener')) this.inputField.addEventListener('focus', this.focusListener)
        document.addEventListener('keydown', this.keydownListener)
        if (this.getAttribute('search') && location.href.includes(this.getAttribute('search'))) this.inputField.value = decodeURIComponent(location.href.split(this.getAttribute('search'))[1])
        if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
      }
      this.hidden = false
    })
  }

  disconnectedCallback () {
    if (this.search && this.searchButton && !this.readonly && !this.disabled && !this.error) {
      if (this.hasAttribute('delete-listener')) {
        this.removeEventListener('click', this.clickListener)
      } else {
        this.searchButton.removeEventListener('click', this.clickListener)
      }
      if (this.hasAttribute('change-listener')) this.inputField.removeEventListener('change', this.changeListener)
      if (this.hasAttribute('focus-listener')) this.inputField.removeEventListener('focus', this.focusListener)
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
    return !this.divWrapper
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
        ${this.getAttribute('icon-size')
          ? `
            --svg-size: ${this.getAttribute('icon-size')};
          `
          : ''
        }
      }

      .mui-form-group {
        font-family: var(--font-family);
        max-width: var(--max-width, none);
      }
      .mui-form-group + .mui-form-group {
        margin-top: var(--margin-top, var(--content-spacing));
      }

      label {
        font-size: var(--label-font-size, var(--font-size));
        font-weight: var(--label-font-weight, 700);
        letter-spacing: var(--label-letter-spacing, 0.03em);
        line-height: var(--label-line-height, 1);
        color: var(--label-color, var(--color));
        display: block;
        margin-bottom: var(--label-margin-bottom, 0.625em);
      }

      input {
        caret-color: var(--caret-color, var(--input-color, var(--color-secondary, var(--color))));
        display: block;
        padding: 0.625em 1em;
        width: 100%;
        font-family: inherit;
        font-size: var(--input-font-size, var(--font-size));
        line-height: var(--input-line-height, 1.4);
        color: var(--input-color, var(--color));
        appearance: none;
        background: var(--input-bg-color, var(--m-gray-200));
        border: var(--border, 1px solid transparent);
        border-radius: var(--border-radius, 0.5em);
        text-overflow: var(--text-overflow, ellipsis);
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
        align-items: center;
        display: flex;
        position: relative;
      }
      :host([search]) label {
        font-family: var(--search-label-font-family, var(--font-family-secondary));
        font-weight: var(--search-label-font-weight, 500);
        font-size: var(--search-label-font-size, var(--font-size));
        line-height: var(--search-label-line-height, 1.5);
        margin-top: 1.25rem;
      }
      :host([search]) input {
        background-color: var(--search-input-background-color, var(--input-bg-color, var(--m-gray-200)));
        border-color: var(--search-input-border-color, var(--m-gray-300));
        color: var(--search-input-color);
        padding: var(--search-input-padding, 0.75em var(--content-spacing));
        padding-right: max(2.5em, 35px);
        border-radius: var(--search-input-border-radius, var(--border-radius, 0.5em));
        width: var(--search-input-width-big, var(--search-input-width, 100%));
        min-width: 9.7em;
      }
      :host([search]) input:hover,
      :host([search]) input:hover:not(:disabled):not(:read-only):not(:invalid) {
        background-color: var(--search-input-background-color-hover, var(--input-bg-color, var(--m-gray-200)));
        border-color: var(--search-input-border-color-hover, var(--m-gray-800));
      }
      :host([search]) input:focus:not(:read-only):not(:invalid) {
        background-color: var(--search-input-background-color-focus, var(--input-bg-color, var(--m-gray-200)));
        border-color: var(--search-input-border-color-focus, var(--m-gray-800));
      }
      :host([search]) input:visited {
        text-decoration: var(--search-input-text-decoration, none);
      }
      :host([search]) input::placeholder {
        color: var(--search-input-placeholder-color);
        text-decoration: var(--search-input-text-decoration, none);
      }
      :host([search]) input::-webkit-search-cancel-button {
        margin-right: 0.5em;
      }

      :host([search]) button {
        position: absolute;
        right: 1em;
        padding: 0;
        border: 0;
        background: transparent;
        outline: none;
        appearance: none;
        box-shadow: none;
        font-family: inherit;
        font-size: var(--input-font-size, var(--font-size));
        color: var(--icon-color, var(--color-secondary, var(--color)));
        font-style: normal;
        cursor: pointer;
        transition: color ease-out .3s;
        ${this.getAttribute('icon-size')
          ? `
            height: ${this.getAttribute('icon-size')};
            width: ${this.getAttribute('icon-size')};
          `
          : ''
      }
      }

      :host([search]) button svg {
        height: var(--svg-size, var(--svg-height, var(--svg-size, 1.5em)));
        width: var(--svg-size, var(--svg-width, var(--svg-size, 1.5em)));
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
        input {
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
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
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const replaces = this.buttonTagName === 'a'
      ? [{
          pattern: '([^-]{1})button',
          flags: 'g',
          replacement: '$1a'
        }]
      : []
    switch (this.getAttribute('namespace')) {
      case 'input-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false,
          replaces
        }], false)
      default:
        return Promise.resolve()
    }
  }

  renderHTML () {
    this.html = '<div class="mui-form-group"></div>'
    return Promise.all([
      this.renderLabelHTML(),
      this.renderSearchHTML()
    ]).then(([labelHtml, searchHtml]) => {
      this.divWrapper.insertAdjacentHTML('beforebegin', labelHtml)
      this.divWrapper.innerHTML += /* html */`
          <input id="${this.inputId}" name="${this.inputId}" type="${this.inputType}" ${this.hasAttribute('autofocus') ? 'autofocus' : ''} />
          ${searchHtml}
      `
      this.inputField.setAttribute('enterkeyhint', this.hasAttribute('enterkeyhint')
        ? this.getAttribute('enterkeyhint')
        : this.search
          ? 'search'
          : 'go'
      )
    })
  }

  renderLabelHTML () {
    return Promise.resolve(this.labelText ? `<label for="${this.inputId}">${this.labelText}</label>` : '')
  }

  renderSearchHTML () {
    if (!this.search) return Promise.resolve('')
    if (!this.iconName) {
      return Promise.resolve(/* html */`
      <button type="button" title="Search">
        <svg width="100%" height="100%" viewBox="0 0 24 24" stroke="currentColor" fill="none" xmlns="http://www.w3.org/2000/svg" fit="" preserveAspectRatio="xMidYMid meet" focusable="false">
        <path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" class="icon-stroke-width" stroke-linecap="round" stroke-linejoin="round"></path>
        <path d="M21 21L16.65 16.65" class="icon-stroke-width" stroke-linecap="round" stroke-linejoin="round"></path>
        </svg>
      </button>
    `)
    }
    return (this.fetch = this.fetchHTML([`${this.getAttribute('base-url') || `${this.importMetaUrl}../../../icons/mdx-main-packages-icons-dist-svg/packages/icons/dist/svg/`}${this.iconName}/Size_24x24.svg`], true).then(htmls => `<button type="button" title="${this.iconName}">${htmls[0]}</button>`))
  }

  focus () {
    this.inputField.focus()
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

  get divWrapper () {
    return this.root.querySelector('div.mui-form-group')
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

  get iconName () {
    return this.getAttribute('icon-name')
  }
}
