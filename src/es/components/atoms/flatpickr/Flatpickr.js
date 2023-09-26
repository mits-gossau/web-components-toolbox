// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
 * Creates an Button
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Flatpickr extends Shadow() {
  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args)

  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSSPromise = this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTMLPromise = this.renderHTML()
  }

  disconnectedCallback () {
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.root.querySelector('script')
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      
      @media only screen and (max-width: _max-width_) {
        
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
    switch (this.getAttribute('namespace')) {
      case 'button-primary-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./primary-/primary-.css`,
          namespace: false
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
    return this.loadDependency().then(([flatpickr]) => {
        const div = document.createElement('div')
        div.textContent = 'pickr'
        flatpickr(div, {
            mode:'range',
            onChange: (selectedDates, dateStr, instance) => {
              div.textContent = dateStr
            },
        })
        this.html = div
        //https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.css 
    })
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<any>}
   */
  loadDependency () {
    // make it global to self so that other components can know when it has been loaded
    return this.flatpickr || (this.flatpickr = Promise.all([
        new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.setAttribute('type', 'text/javascript')
            script.setAttribute('async', '')
            script.setAttribute('src', 'https://cdn.jsdelivr.net/npm/flatpickr')
            script.setAttribute('integrity', 'sha384-5JqMv4L/Xa0hfvtF06qboNdhvuYXUku9ZrhZh3bSk8VXF0A/RuSLHpLsSV9Zqhl6')
            script.setAttribute('crossorigin', 'anonymous')
            // @ts-ignore
            script.onload = () => self.flatpickr
                // @ts-ignore
                ? resolve(self.flatpickr)
                : reject()
            this.html = script
        }),
        new Promise(resolve => {
            const style = document.createElement('link')
            style.setAttribute('rel', 'stylesheet')
            style.setAttribute('href', 'https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.css')
            style.setAttribute('crossorigin', 'anonymous')
            // @ts-ignore
            style.onload = () => resolve()
            document.head.appendChild(style)
        })
    ]))
  }
}
