// @ts-check
/* global fetch */
/* global AbortController */
/* global CustomEvent */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class History
 * @type {CustomElementConstructor}
 */
export default class History extends Shadow() {
  constructor(...args) {
    super({ mode: 'false' }, ...args)
    this.requestHistoryPushListener = event => {
      console.log("History Controller Event: ", event.detail)
      history.pushState(event.detail.state, event.detail.title, event.detail.href)
    }
  }

  connectedCallback() {
    this.addEventListener(this.getAttribute('request-history-push') || 'request-history-push', this.requestHistoryPushListener)
  }

  disconnectedCallback() {
    this.removeEventListener(this.getAttribute('request-history-push') || 'request-history-push', this.requestHistoryPushListener)
  }
}
