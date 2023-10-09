// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * SystemNotification
 * An example at: src/es/components/pages/Checkout.html
 *
 * @export
 * @class SystemNotification
 * @type {CustomElementConstructor}
 */

export default class SystemNotification extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.renderHTML()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS () {
    this.css = /* css */ `
        :host {
            --icon-default-width: 52px;
        }
        :host .system-notification {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin-bottom: var(--margin-bottom, 1rem);
        }
        :host .icon {
            position: relative;
        }
        :host .icon img {
            max-height: var(--icon-max-height, var(--icon-default-width));
            max-width: var(--icon-max-width, var(--icon-default-width));
            height: var(--icon-height, auto);
            width: var(--icon-default-width);
        }
        :host .icon .icon-badge {
            position: absolute;
            top: var(--icon-badge-top, -7px);
            right: var(--icon-badge-right, -16px);
            display: flex;
            align-items: center;
            justify-content: center;
            height: var(--icon-badge-height, 1.5rem);
            width: var(--icon-badge-width, 1.5rem);
            border-radius: var(--icon-badge-border-radius, 50%);
            background-color: var(--icon-badge-background-color, var(--m-red-600));
            color: var(--icon-badge-color, var(--m-white));
            font-size: var(--icon-badge-font-size, 0.75rem);
        }
        :host .title h3 {
            margin: 0 0 var(--margin-bottom, 1rem) 0;
            font-size: var(--font-size-h3, 1.25rem);
            color: var(--color, var(--m-gray-900));
        }
        :host .system-notification .description {
            background-color: var(--system-default-background-color, var(--m-gray-100));
            border-radius: var(--border-radius, 0.5rem);
            padding: var(--padding, 0.5rem 1rem);
            width: 100%;
        }
        :host .system-info .description {
            background-color: var(--system-info-background-color, var(--m-blue-100));
            color: var(--system-info-color, var(--m-blue-800));
        }
        :host .system-error .description {
            background-color: var(--system-error-background-color, var(--m-orange-100));
            color: var(--system-error-color, var(--m-red-600));
        }
        :host .system-success .description {
            background-color: var(--system-success-background-color, var(--m-green-100));
            color: var(--system-success-color, var(--m-green-800));
        }
    `
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    const iconBadge = this.getAttribute('icon-badge') ? `<div class="icon-badge">${this.getAttribute('icon-badge')}</div>` : ''
    const icon = this.getAttribute('icon-src') ? `<div class="icon"><img src="${this.getAttribute('icon-src')}" alt="icon-notification" />${iconBadge}</div>` : ''
    const title = this.getAttribute('title') ? `<div class="title"><h3>${this.getAttribute('title')}</h3></div>` : ''
    const type = this.getAttribute('type') || ''
    const description = `<div class="description">${this.innerHTML}</div>`

    this.html = /* html */`
        <div class="system-notification system-${type}">
            ${icon}
            ${title}
            ${description}
        </div>
    `
  }
}
