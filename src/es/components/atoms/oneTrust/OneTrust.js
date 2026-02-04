// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global window */
/* global self */

/**
* @export
* @class OneTrust
* @type {CustomElementConstructor}
*/
export default class OneTrust extends Shadow() {

  /**
   * @param {any} args
   */
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, mode: 'false', tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderHTML()) {
      this.renderHTML().then(() => {
        if (this.settingsLink) this.settingsLink.addEventListener('click', this.settingsLinkListener)
      })
    } else if (this.settingsLink) this.settingsLink.addEventListener('click', this.settingsLinkListener)
  }

  disconnectedCallback () {
    if (this.settingsLink) this.settingsLink.removeEventListener('click', this.settingsLinkListener)
  }

  settingsLinkListener = () => {
    // @ts-ignore
    if (typeof window !== 'undefined' && window.OneTrust) {
      try {
        // @ts-ignore
        window.OneTrust.ToggleInfoDisplay()
      } catch (err) {
        console.error('Failed to open Info Display:', err)
      }
    }
  }

  /**
   * evaluates if a render is necessary
   */
  shouldRenderHTML() {
    // if snippet exists: deduplicate primarily via data-domain-script (if included in snippet)
    const domainId = this.domainScriptIdFromSnippet
    if (domainId) {
      return !document.head.querySelector(`script[data-domain-script="${this.cssAttrEscape(domainId)}"]`)
    }

    // fallback: old behaviour
    return !document.head.querySelector('#one-trust-cookie-law') &&
      !document.head.querySelector('script[src*="cdn.cookielaw.org/scripttemplates/otSDKStub.js"]')
  }

  /**
   * Render HTML
   * OneTrust loads its settings and we check whether we should display the link or not.
   * The link opens the cookie settings in a modal window
   */
  async renderHTML() {
    await this.renderScripts()
    const span = document.createElement('span')
    span.classList.add('ot-sdk-show-settings')
    span.setAttribute('style', 'display: none !important;')
    document.body.appendChild(span)

    // only render link if OneTrust sets it to ‘visible’
    if (self.getComputedStyle(span).getPropertyValue('visibility') === 'visible') {
      this.html = `<a class="ot-sdk-show-settings">${this.linkText}</a>`
    }

    // cleanup
    span.remove()
  }

  async renderScripts () {
    const snippet = this.snippet
    if (snippet) {
      await this.injectSnippetIntoHead(snippet)
      return
    }

    // fallback: previous path via id
    await this.loadCookieLawDependency(this.id)
    await this.loadCookieLawScriptTemplates(this.id)
    await this.callOptanonWrapper()
  }

  /**
   * Snippet preferably comes from <template> (inert), 
   * optionally from attribute "snippet"
   */
  get snippet() {
    const attr = this.getAttribute('snippet')
    if (attr && attr.trim()) return attr

    const tpl = this.querySelector('template')
    return tpl ? tpl.innerHTML : ''
  }

  get domainScriptIdFromSnippet() {
    const snippet = this.snippet
    if (!snippet) return null
    const t = document.createElement('template')
    t.innerHTML = snippet
    const s = t.content.querySelector('script[data-domain-script]')
    return s ? s.getAttribute('data-domain-script') : null
  }

  // @ts-ignore
  async injectSnippetIntoHead(snippet) {
    const t = document.createElement('template')
    t.innerHTML = snippet.trim()

    // only accept <script> (the typical OneTrust snippet)
    const scripts = Array.from(t.content.querySelectorAll('script'))

    const loadPromises = []

    for (const original of scripts) {
      const src = original.getAttribute('src')
      const dataDomain = original.getAttribute('data-domain-script')
      const inlineText = (original.textContent || '').trim()

      if (src) {
        // same src (+ optional same data-domain-script) => skip
        const selector =
          dataDomain
            ? `script[src="${this.cssAttrEscape(src)}"][data-domain-script="${this.cssAttrEscape(dataDomain)}"]`
            : `script[src="${this.cssAttrEscape(src)}"]`

        if (document.head.querySelector(selector)) continue
      } else if (inlineText) {
        // same inline definition => skip
        const already = Array.from(document.head.querySelectorAll('script:not([src])'))
          .some(s => (s.textContent || '').trim() === inlineText)
        if (already) continue
      }

      // create new script element 
      const s = document.createElement('script')
      for (const { name, value } of Array.from(original.attributes)) {
        s.setAttribute(name, value)
      }

      if (src) {
        loadPromises.push(new Promise((resolve, reject) => {
          s.onload = () => resolve(true)
          s.onerror = reject
        }))
      } else {
        s.textContent = original.textContent || ''
      }

      document.head.appendChild(s)
    }

    await Promise.all(loadPromises)
  }

  // little helper for escaping in attribute selectors
  cssAttrEscape(value = '') {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
  }

  // existing fallback code remains unchanged
  // @ts-ignore
  async loadCookieLawDependency (id) {
    return this.loadCookieLawDependencyPromise || (this.loadCookieLawDependencyPromise = new Promise((resolve, reject) => {
      const cookieLawScript = document.createElement('script')
      cookieLawScript.setAttribute('async', '')
      cookieLawScript.setAttribute('type', 'text/javascript')
      cookieLawScript.setAttribute('id', 'one-trust-cookie-law')
      try {
        // @ts-ignore
        cookieLawScript.setAttribute('src', `https://cdn.cookielaw.org/consent/${id}/OtAutoBlock.js`)
        document.getElementsByTagName('head')[0].appendChild(cookieLawScript)
        cookieLawScript.onload = () => resolve('cookie law loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * Loads a script template for a cookie law script.
   * @param {string} id
   * @returns a promise.
   */
  async loadCookieLawScriptTemplates (id) {
    return this.loadCookieLawScriptTemplatesPromise || (this.loadCookieLawScriptTemplatesPromise = new Promise((resolve, reject) => {
      const cookieLawScriptTemplatesScript = document.createElement('script')
      cookieLawScriptTemplatesScript.setAttribute('async', '')
      cookieLawScriptTemplatesScript.setAttribute('type', 'text/javascript')
      cookieLawScriptTemplatesScript.setAttribute('id', 'one-trust-cookie-law-script-templates')
      cookieLawScriptTemplatesScript.setAttribute('data-domain-script', id)
      cookieLawScriptTemplatesScript.setAttribute('data-document-language', 'true')
      try {
        // @ts-ignore
        cookieLawScriptTemplatesScript.setAttribute('src', 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js')
        document.getElementsByTagName('head')[0].appendChild(cookieLawScriptTemplatesScript)
        cookieLawScriptTemplatesScript.onload = () => resolve('cookie law script templates loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  /**
   * Loads a script dependency called "optanon wrapper"
   * @returns a promise.
   */
  async callOptanonWrapper () {
    return this.loadScriptDependencyPromise || (this.loadScriptDependencyPromise = new Promise((resolve, reject) => {
      const optanonWrapperScript = document.createElement('script')
      optanonWrapperScript.setAttribute('id', 'one-trust-optanon-wrapper')
      optanonWrapperScript.type = 'text/javascript'
      const fn = 'function OptanonWrapper() { }'
      try {
        optanonWrapperScript.appendChild(document.createTextNode(fn))
        document.getElementsByTagName('head')[0].append(optanonWrapperScript)
        return resolve('optanon wrapper loaded')
      } catch (e) {
        return reject(e)
      }
    }))
  }

  get id () {
    return this.getAttribute('id')
  }

  get settingsLink () {
    return this.root.querySelector('a')
  }

  get linkText () {
    return this.getAttribute('link-text') || 'Cookie Settings'
  }
}
