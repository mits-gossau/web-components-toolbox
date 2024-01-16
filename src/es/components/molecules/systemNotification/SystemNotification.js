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
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.isTimedNotification = this.hasAttribute("timed-notification")

    this.renderSystemNotification = event => {
      this.renderHTML(event.detail)
    }
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (!this.isTimedNotification) {
      this.renderHTML()
    }
    if (this.isTimedNotification) {
      document.body.addEventListener("render-timed-system-notification", this.renderSystemNotification)
    }
  }

  disconnectedCallback() {
    if (this.isTimedNotification) {
      document.body.removeEventListener("render-timed-system-notification", this.renderSystemNotification)
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  renderCSS() {
    this.css = /* css */ `
        :host {
            --icon-default-width: 52px;
        }
        :host .system-notification {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: var(--system-notification-flex-direction, column);
            margin: var(--system-notification-margin, 0 0 var(--margin-bottom, 1rem) 0);
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
  renderHTML(timedNotificationData) {
    const iconBadge = this.getAttribute('icon-badge') || timedNotificationData?.iconBadge || ''
    const icon = this.getAttribute('icon-src') || timedNotificationData?.icon || ''
    const title = this.getAttribute('title') || timedNotificationData?.title || ''
    const type = this.getAttribute('type') || timedNotificationData?.type || ''
    const description = timedNotificationData?.description || this.innerHTML || ''

    if (timedNotificationData && this.isTimedNotification) {
      const duration = timedNotificationData.duration
      // ATTENTION! Add px unit for position as a number!
      const position = {
        top: timedNotificationData.position.top ? document.getElementsByTagName("html")[0].scrollTop + timedNotificationData.position.top + "px" : "",
        right: timedNotificationData.position.right ? timedNotificationData.position.right + "px" : "",
        bottom: timedNotificationData.position.bottom ? timedNotificationData.position.bottom + "px" : "",
        left: timedNotificationData.position.left ? timedNotificationData.position.left + "px" : "",
      }
      this.css = this.css + /* css */`
      :host {
        position: absolute;
        top: ${position.top};
        right: ${position.right};
        bottom: ${position.bottom};
        left: ${position.left};
        z-index: 55555;
        width: auto;
        animation: var(--show, show .3s ease-out);
      }
      @keyframes show {
       0%{opacity: 0}
       100%{opacity: 1}
     }`
      this.renderCSS();
      setTimeout(() => {
        this.html = ""
      }, duration)
    }

    this.html = ""
    this.html = /* html */`
      <div class="system-notification system-${type}" role="alert">
        ${icon
        ? /* html */ `<div class="icon">
                          <img src="${icon}" alt="icon-notification" />
                            ${iconBadge
          ? /* html */ `<div class="icon-badge">${iconBadge}</div>`
          : ""}
                        </div>`
        : ""
      }
        ${title
        ? /* html */ `<div class="title"><h3>${title}</h3></div>`
        : ""
      }
        ${description
        ? /* html */ `<div class="description">${description}</div>`
        : ""
      }
      </div>
    `
  }
}

