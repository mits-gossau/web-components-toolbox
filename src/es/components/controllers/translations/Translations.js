// @ts-check

/* global AbortController */
/* global CustomEvent */
/* global fetch */
/* global HTMLElement */

/**
* @export
* @class Translations
* @type {CustomElementConstructor}
*/
export default class Translations extends HTMLElement {
  #translations
  #translationsPromise

  constructor () {
    super()
    this.translations = this.getAttribute('translations') || this.getAttribute('translation')
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-translations') || 'request-translations', this.requestTranslationsListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-translations') || 'request-translations', this.requestTranslationsListener)
  }

  /**
   * Get translations
   * @param {CustomEventInit} event
   */
  requestTranslationsListener = async (event) => {
    const fetchOptions = {
      method: 'GET'
    }
    const endpoint = this.getAttribute('translation-api-url') || ''
    const detail = {
      fetch: (this.#translationsPromise = this.translations
        ? Promise.resolve(this.translations)
        : fetch(endpoint, fetchOptions).then(async response => {
          if (response.status >= 200 && response.status <= 299) {
            this.translations = await response.json()
            return this.translations
          }
          throw new Error(response.statusText)
        })),
      getTranslation: async key => {
        await this.#translationsPromise
        return this.translations[key] || key
      },
      getTranslationSync: key => this.translations[key] || key
    }
    if (event.detail?.resolve) return event.detail.resolve(detail)
    this.dispatchEvent(new CustomEvent(this.getAttribute('translations') || 'translations', {
      detail,
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  set translations (value) {
    this.#translations = value
    if (typeof this.#translations === 'string') {
      // check if each object in translation has "key" and "value" properties
      try {
        this.#translations = JSON.parse(this.#translations)
      } catch (error) {
        console.error('Error parsing translation data', error)
      }
    }
    // if translation is delivered as []enum expl.: [{key: hi, value: 123}]
    if (Array.isArray(this.#translations) && this.#translations[0].key && this.#translations[0].value) {
      this.#translations = this.#translations.reduce((acc, curr) => {
        acc[curr.key] = curr.value
        return acc
      }, {})
    }
  }

  get translations () {
    return this.#translations
  }
}
