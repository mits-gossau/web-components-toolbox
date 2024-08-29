// @ts-check

/**
* @export
* @class DownloadTemplatePreview
* @type {CustomElementConstructor}
*/
export default class DownloadTemplatePreview extends HTMLElement {
  constructor () {
    super()

    this.root = this.attachShadow({ mode: 'open' })
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  disconnectedCallback () {}

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.ul
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.customStyle.textContent = /* css */`
      :host {}
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    const ul = document.createElement('ul')
    this.root.appendChild(ul)
    fetch(`${this.getAttribute('template-uri')}index.json`).then(res => res.json()).then(pageIndexes => {
      pageIndexes.forEach(pageIndex => ul.insertAdjacentHTML('beforeend', `<li><a href="${this.getAttribute('href')}&content=${this.getAttribute('template-uri')}${pageIndex.htmlFileName}">${pageIndex.uri}</a></li>`))
    })
  }

  get customStyle () {
    return (
      this._customStyle ||
        (this._customStyle = (() => {
          const style = document.createElement('style')
          style.setAttribute('_css', '')
          return style
        })())
    )
  }

  get ul () {
    return this.root.querySelector('ul')
  }
}
