// @ts-check
import { Hover } from '../../prototypes/Hover.js'

/* global CustomEvent */

/**
 * Creates an Button
 * https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Button extends Hover() {
  static get observedAttributes () {
    return ['label', 'disabled']
  }

  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)

    // get the original innerHTML of the component, so that when it rerenders as an a-tag it doesn't loose its content
    let button
    // in case there is already a button, grab the buttons innerHTML, since renderHTML is going to create a new button resp. a-tag instead of the button
    if ((button = this.root.querySelector('button'))) {
      if (this.label) {
        if (this.label.textContent.length && this.label.textContent.trim().length) this.labelText = this.label.textContent.trim()
        this.label.remove()
      }
      this.origInnerHTML = button.innerHTML
      button.remove()
    } else {
      this.origInnerHTML = this.root.innerHTML
    }
    this.clickListener = event => {
      if (this.hasAttribute('disabled')) event.preventDefault()
      if (this.getAttribute('request-event-name')) {
        event.preventDefault()
        if (!this.hasAttribute('click-no-toggle-active')) {
          this.button.classList.toggle('active')
          this.button.setAttribute('aria-pressed', this.button.classList.contains('active')) // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
        }
        this.getAttribute('request-event-name').split(',').forEach(eventName => this.dispatchEvent(new CustomEvent(eventName, {
          detail: this.getEventDetail(event),
          bubbles: true,
          cancelable: true,
          composed: true
        })))
      }
    }
    this.keydownListener = event => {
      if (event.key === 'Enter' || event.key === ' ') this.clickListener(event)
    }
    this.answerEventListener = async event => {
      let tags = event.detail.tags
      if (this.getAttribute('active-detail-property-name')) {
        tags = await this.getAttribute('active-detail-property-name').split(':').reduce(async (accumulator, propertyName) => {
          // @ts-ignore
          propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())
          if (accumulator instanceof Promise) accumulator = await accumulator
          if (!accumulator) return {} // error handling, in case the await on fetch does not resolve
          if (accumulator[propertyName]) return accumulator[propertyName]
          if (Array.isArray(accumulator)) return accumulator.map(obj => obj[propertyName])
          return {} // error handling, in case the await on fetch does not resolve
        }, event.detail)
      }
      if (Array.isArray(tags)) {
        const tagsIncludesTag = this.hasAttribute('tag-search')
          ? tags.some(tag => tag.includes(this.getAttribute('tag-search')))
          : tags.includes(this.getAttribute('tag'))
        this.button.classList[tagsIncludesTag ? 'add' : 'remove']('active')
      } else {
        this.button.classList[tags === this.getAttribute('tag') || tags === this.getAttribute('tag-search') ? 'add' : 'remove']('active')
      }
      this.button.setAttribute('aria-pressed', this.button.classList.contains('active')) // https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    // @ts-ignore
    if (this.textContent.length && this.textContent.trim().length) {
      // @ts-ignore
      this.labelText = this.textContent.trim() // allow its initial textContent to become the label if there are no nodes but only text
      this.textContent = ''
    }
    // request the href which results on a button click from the controller and if answered transfer this button into an a-node to have search engine robots follow the links
    // @ts-ignore
    this.wcConfigLoadListener = event => new Promise(resolve => this.dispatchEvent(new CustomEvent('request-href-' + this.getAttribute('request-event-name'), {
      detail: this.getEventDetail(null, false, resolve),
      bubbles: true,
      cancelable: true,
      composed: true
    }))).then(href => {
      if (href) {
        this.setAttribute('href', href)
        Promise.all([this.renderCSSPromise, this.renderHTMLPromise]).then(() => {
          // reset component to have a instead of button tag
          const oldAttributes = Array.from(this.button.attributes)
          this.disconnectedCallback()
          this.root.innerHTML = this.origInnerHTML
          this.connectedCallback()
          oldAttributes.forEach(attribute => this.button.setAttribute(attribute.name, attribute.value))
        })
      }
    })
  }

  connectedCallback () {
    super.connectedCallback()
    this.buttonTagName = this.hasAttribute('href') ? 'a' : 'button'
    if (this.shouldRenderCSS()) this.renderCSSPromise = this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTMLPromise = this.renderHTML()
    if (this.button) this.button.addEventListener('click', this.clickListener)
    if (this.button) this.button.addEventListener('keydown', this.keydownListener)
    if (this.getAttribute('answer-event-name')) document.body.addEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
    this.attributeChangedCallback('disabled')
    this.connectedCallbackOnce()
    if (this.getAttribute('request-event-name') && this.classList.contains('active')) {
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name'), {
        detail: this.getEventDetail(null),
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallbackOnce () {
    if (document.body.hasAttribute('wc-config-load')) {
      this.wcConfigLoadListener()
    } else {
      document.body.addEventListener(this.getAttribute('wc-config-load') || 'wc-config-load', this.wcConfigLoadListener, { once: true })
    }
    this.connectedCallbackOnce = () => {}
  }

  disconnectedCallback () {
    if (this.button) this.button.removeEventListener('click', this.clickListener)
    if (this.button) this.button.removeEventListener('keydown', this.keydownListener)
    if (this.getAttribute('answer-event-name')) document.body.removeEventListener(this.getAttribute('answer-event-name'), this.answerEventListener)
  }

  // @ts-ignore
  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'label') {
      this.labelText = newValue
      if (this.label) {
        this.label.textContent = this.labelText || ''
        this.label.classList[this.labelText ? 'remove' : 'add']('hide')
      }
    } else if (this.button && name === 'disabled') {
      this.hasAttribute('disabled') ? this.button.setAttribute('disabled', '') : this.button.removeAttribute('disabled')
      this.hasAttribute('aria-disabled') ? this.button.setAttribute('aria-disabled', 'true') : this.button.removeAttribute('aria-disabled')
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.button || !this.label
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: unset !important;
        display: inline-block;
      }
      #label {
        display: inline-block;
        padding: var(--label-padding, 0);
        margin: var(--label-margin, 0);
        ${this.hasAttribute('no-pointer-events') ? 'pointer-events: none;' : ''}
        position: relative;
        text-align: var(--label-text-align, center);
        white-space: var(--label-white-space, inherit);
      }
      #label.hide {
        display: none;
      }
      #label.ellipsis-text {
        overflow: hidden;
        white-space: nowrap;
        display: block;
        text-overflow: ellipsis;
      }
      ${this.buttonTagName} {
        align-items: var(--align-items, center);
        background-color: var(--background-color, transparent);
        border-radius: var(--border-radius, 0.5em);
        border: var(--border-width, 0px) solid var(--border-color, transparent);
        color: var(--color, black);
        cursor: var(--cursor, pointer);
        display: var(--display, flex);
        font-family: var(--font-family, unset);
        font-size: var(--font-size, 1em);
        font-weight: var(--font-weight, 400);
        height: var(--height, auto);
        justify-content: var(--justify-content, center);
        letter-spacing: var(--letter-spacing, normal);
        line-height: var(--line-height, 1.5em);
        margin: var(--margin, auto);
        opacity: var(--opacity, 1);
        outline: var(--outline, none);
        overflow: hidden;
        padding: var(--padding, calc(0.75em - var(--border-width, 0px)) calc(1.5em - var(--border-width, 0px)));
        text-align: var(--text-align, center);
        text-decoration: var(--text-decoration, none);
        text-transform: var(--text-transform, none);
        touch-action: manipulation;
        transform: var(--transform, none);
        transition: var(--transition, background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out);
        width: var(--width, auto);
        visibility: var(--visibility, inherit);
      }
      ${this.buttonTagName}:focus-visible {
        border-radius: var(--outline-border-radius, 0.125em);
        outline-color: var(--outline-color, var(--background-color, var(--color, transparent)));
        outline-style: var(--outline-style, solid);
        outline-width: var(--outline-width, 0.125em);
        outline-offset: var(--outline-offset, 2px);
      }
      ${this.buttonTagName} > *:not(#label) {
        flex-grow: var(--not-label-flex-grow, 1);
      }
      :host a {
        box-sizing: border-box;
        width: var(--width, fit-content);
      }
      ${this.buttonTagName}:hover, :host(.hover) ${this.buttonTagName} {
        background-color: var(--background-color-hover, var(--background-color, #B24800));
        border: var(--border-width-hover, var(--border-width, 0px)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
        color: var(--color-hover, var(--color, #FFFFFF));
        transform: var(--transform-hover, var(--transform, none));
        opacity: var(--opacity-hover, var(--opacity, 1));
      }
      ${this.buttonTagName}:active, ${this.buttonTagName}.active {
        display: var(--display-active, flex); /* allows hiding the button but showing on active or vice versa */
        background-color: var(--background-color-active, var(--background-color-hover, var(--background-color, #803300)));
        border: var(--border-width-active, var(--border-width, 0px)) solid var(--border-color-active, var(--border-color, #FFFFFF));
        color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
        visibility: var(--visibility-active, var(--visibility, inherit));
      }
      :host ${this.buttonTagName}[disabled] {
        border: var(--border-width-disabled, var(--border-width, 0px)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
        background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
        color: var(--color-disabled, var(--color, #FFFFFF));
        cursor: not-allowed;
        opacity: var(--opacity-disabled, var(--opacity, 1));
        transition: opacity 0.3s ease-out;
      }
      :host ${this.buttonTagName}[disabled]:hover, :host(.hover) ${this.buttonTagName}[disabled] {
        opacity: var(--opacity-disabled-hover, var(--opacity-disabled, var(--opacity, 1)));
      }
      :not(a-icon-mdx).icon-left, a-icon-mdx.icon-left::part(svg) {
        margin: var(--icon-left-margin, 0 0.5em 0 0);
      }
      :not(a-icon-mdx).icon-right, a-icon-mdx.icon-right::part(svg) {
        margin: var(--icon-right-margin, 0 0 0 0.5em);
      }
      .icon-left, .icon-right {
        height: var(--icon-height, 1.5em);
        width: var(--icon-width, auto);
      }
      .icon-left, .icon-right {
        flex-shrink: 0;
      }
      ${this.buttonTagName} > #label {
        flex-shrink: 10;
      }
      /* icon aka. a-icon-mdx support */
      ${this.buttonTagName} > * {
        color: var(--color, black);
        transition: var(--transition, background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out);
      }
      ${this.buttonTagName} > a-icon-mdx {
        color:  var(--icon-color, var(--color, black));
        cursor: var(--icon-cursor, var(--cursor, inherit));
      }
      ${this.buttonTagName}:hover > *, :host(.hover) ${this.buttonTagName} > * {
        color: var(--color-hover, var(--color, #FFFFFF));
      }
      ${this.buttonTagName}:active > *, ${this.buttonTagName}.active > * {
        color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
      }
      ${this.buttonTagName}:hover > a-icon-mdx, :host(.hover) ${this.buttonTagName} > a-icon-mdx {
        color:  var(--icon-color-hover, var(--color-hover, var(--color, #FFFFFF)));
      }
      :host ${this.buttonTagName}[disabled] > * {
        color: var(--color-disabled, var(--color, #FFFFFF));
      }
      :host([round]) ${this.buttonTagName} {
        border-radius: 50%;
        padding: 0.75rem;
      }
      @media only screen and (max-width: _max-width_) {
        ${this.buttonTagName} {
          font-size: var(--font-size-mobile, var(--font-size, 1em));
          margin: var(--margin-mobile, var(--margin, auto));
          border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
        }
        ${this.buttonTagName}:hover, :host(.hover) ${this.buttonTagName} {
          background-color: var(--background-color-hover-mobile, var(--background-color-hover, var(--background-color, #B24800)));
          color: var(--color-hover-mobile, var(--color-hover, var(--color, #FFFFFF)));
        }
        ${this.buttonTagName}:active, ${this.buttonTagName}.active {
          background-color: var(--background-color-active-mobile, var(--background-color-active, var(--background-color-hover, var(--background-color, #803300))));
          color: var(--color-active-mobile, var(--color-active, var(--color-hover, var(--color, #FFFFFF))));
        }
        .icon-left {
          margin: var(--icon-left-margin-mobile, var(--icon-left-margin, 0 0.5em 0 0));
        }
        .icon-right {
          margin: var(--icon-right-margin-mobile, var(--icon-right-margin, 0 0 0 0.5em));
        }
        .icon-left, .icon-right {
          height: var(--icon-height-mobile,var(--icon-height, 1.5em));
          width: var(--icon-width-mobile, var(--icon-width, auto));
        }
      }
    `
    return (this.renderCssPromise = this.fetchTemplate())
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
      case 'button-primary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-secondary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./secondary-/secondary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-tertiary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./tertiary-/tertiary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-transparent-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./transparent-/transparent-.css`,
          namespace: false,
          replaces
        }])
      case 'button-quaternary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./quaternary-/quaternary-.css`,
          namespace: false,
          replaces
        }])
      case 'button-download-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./download-/download-.css`,
          namespace: false,
          replaces
        }])
      case 'button-category-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false,
          replaces: replaces.concat([{
            pattern: '--button-primary-',
            flags: 'g',
            replacement: '--button-category-'
          }])
        },
        {
          // @ts-ignore
          path: `${this.importMetaUrl}./category-/category-.css`,
          namespace: false,
          replaces
        }])
      case 'button-category-teaser-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false,
          replaces: replaces.concat([{
            pattern: '--button-primary-',
            flags: 'g',
            replacement: '--button-category-teaser-'
          }])
        },
        {
          // @ts-ignore
          path: `${this.importMetaUrl}./category-/category-.css`,
          namespace: false,
          replaces: replaces.concat([{
            pattern: '--button-category-',
            flags: 'g',
            replacement: '--button-category-teaser-'
          }])
        },
        {
          // @ts-ignore
          path: `${this.importMetaUrl}./category-teaser-/category-teaser-.css`,
          namespace: false,
          replaces
        }])
      case 'button-square-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./square-/square-.css`,
          namespace: false,
          replaces
        }])
      case 'button-action-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./action-/action-.css`,
          namespace: false,
          replaces
        }])
      case 'button-search-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./search-/search-.css`,
          namespace: false,
          replaces
        }])
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    const alreadyIncludedNodes = Array.from(this.root.querySelectorAll(`${this.cssSelector} > :not(style)`))
    this.html = /* html */`
      <${this.buttonTagName}
        part="button"
        ${this.classList.contains('active') ? 'class="active"' : ''}
        ${this.buttonTagName === 'a'
          ? `href="${this.getAttribute('href')}" target="${this.getAttribute('target') || '_self'}" ${this.hasAttribute('rel') ? `rel="${this.getAttribute('rel')}"` : ''}`
          : ''}
        type="${this.hasAttribute('type') ? this.getAttribute('type') : 'button'}">
        <span id="label"${!this.labelText ? ' class="hide"' : ''}>${this.labelText || ''}</span>
      </${this.buttonTagName}>
    `
    if (this.button) {
      alreadyIncludedNodes.forEach(node => {
        if (this.button !== node && !this.button.contains(node) && !node.contains(this.button)) this.button.appendChild(node)
      })
      if (this.getAttribute('namespace') === 'button-download-') {
        this.button.prepend(this.downloadIcon)
      }

      let iconLeft
      if ((iconLeft = this.root.querySelector('.icon-left'))) this.button.prepend(iconLeft)
      let iconRight
      if ((iconRight = this.root.querySelector('.icon-right'))) this.button.append(iconRight)
      return Promise.resolve()
    }
  }

  /**
   * @param {Event | null} event
   * @param {boolean} [pushHistory=undefined]
   * @param {(value: any)=>void} [resolve=undefined]
   * @return {{origEvent: Event | null, tags: [string], isActive: boolean, fetchSubTags: boolean, clearSubTags: boolean, this: Button, textContent: string, pushHistory?: boolean, resolve?: (value: any)=>void}}
   */
  getEventDetail (event, pushHistory, resolve) {
    return {
      origEvent: event,
      tags: [this.getAttribute('tag')],
      isActive: this.button ? this.button.classList.contains('active') : false,
      fetchSubTags: this.hasAttribute('fetch-sub-tags'),
      clearSubTags: this.hasAttribute('clear-sub-tags'),
      this: this,
      textContent: this.label?.textContent,
      pushHistory,
      resolve
    }
  }

  get button () {
    return this.root.querySelector(this.buttonTagName)
  }

  get label () {
    return this.root.querySelector('#label')
  }

  get downloadIcon () {
    let iconImg
    iconImg = document.createElement('div')
    iconImg.innerHTML = /* html */ `
      <svg class="icon-left" width="60px" height="60px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <!-- Generator: Sketch 63.1 (92452) - https://sketch.com -->
        <title>Button Download</title>
        <desc>Created with Sketch.</desc>
        <g id="Button-Download" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="Group-2">
                <circle id="Oval" fill="var(--button-download-background-color)" cx="30" cy="30" r="30"></circle>
                <g id="Group" transform="translate(19.000000, 14.000000)" stroke="var(--button-download-icon-color)" stroke-width="3">
                    <line x1="0" y1="30.5" x2="23" y2="30.5" id="Line-3" stroke-linecap="square"></line>
                    <line x1="11.5" y1="22" x2="11.5" y2="-6.10622664e-16" id="Line-3-Copy" stroke-linecap="square"></line>
                    <polyline id="Path-2" points="0 12.5 11.5 24.5 23 12.5"></polyline>
                </g>
            </g>
        </g>
      </svg>`
    return (iconImg = iconImg.children[0])
  }
}
