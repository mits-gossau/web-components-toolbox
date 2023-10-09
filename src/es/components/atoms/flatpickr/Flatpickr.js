// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 * Creates a Datepicker
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class Flatpickr extends Shadow() {
  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options, mode: 'false' }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
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
    // TODO: https://npmcdn.com/flatpickr@4.6.13/dist/themes/material_orange.css
    this.setCss(/* css */`
      .flatpickr-day.selected,
      .flatpickr-day.startRange,
      .flatpickr-day.endRange,
      .flatpickr-day.selected.inRange,
      .flatpickr-day.startRange.inRange,
      .flatpickr-day.endRange.inRange,
      .flatpickr-day.selected:focus,
      .flatpickr-day.startRange:focus,
      .flatpickr-day.endRange:focus,
      .flatpickr-day.selected:hover,
      .flatpickr-day.startRange:hover,
      .flatpickr-day.endRange:hover,
      .flatpickr-day.selected.prevMonthDay,
      .flatpickr-day.startRange.prevMonthDay,
      .flatpickr-day.endRange.prevMonthDay,
      .flatpickr-day.selected.nextMonthDay,
      .flatpickr-day.startRange.nextMonthDay,
      .flatpickr-day.endRange.nextMonthDay {
        background: var(--background);
        box-shadow: none;
        color: #fff;
        border-color: #80cbc4;
      }
      @media only screen and (max-width: _max-width_) {
        
      }
    `, undefined, undefined, undefined, this.style, false)
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    switch (this.getAttribute('namespace')) {
      case 'flatpickr-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false,
          styleNode: this.style,
          appendStyleNode: false
        }], false)
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
      div.textContent = 'Datum auswählen → 📅'
      flatpickr(div, {
        mode: 'range',
        dateFormat: 'd.n.Y',
        onChange: (selectedDates, dateStr, instance) => {
          div.textContent = dateStr
          if (this.getAttribute('request-event-name')) {
            this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name'), {
              detail: {
                origEvent: {selectedDates, dateStr, instance},
                tags: [dateStr],
                this: this,
                pushHistory: true
              },
              bubbles: true,
              cancelable: true,
              composed: true
            }))
          }
        }
      })
      this.html = div
      document.head.appendChild(this.style)
      // https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.css
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
          : reject(new Error('Flatpickr does not load into the global scope!'))
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

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('_css', 'components/atoms/flatpickr/Flatpickr.js')
      return style
    })())
  }
}
