// @ts-check
/* global customElements */
/* global CustomEvent */
/* global DocumentFragment */
/* global location */
/* global self */
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class News extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.RESOLVE_MSG = 'LOADED'
    this.ERROR_MSG = 'Error. News could not be displayed.'
    this.clickListener = event => {
      const url = new URL(document.referrer)
      if (url.searchParams.has('page')) {
        window.history.back()
      } else {
        const windowOpenTarget = event.target.tagName === 'A-BUTTON' ? '_self' : '_blank'
        self.open(this.newsListUrl, windowOpenTarget)
      }
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    const renderedHTML = () => {
      this.backBtn.addEventListener('click', this.clickListener)
      sessionStorage.setItem('news-viewed', 'TRUE')
    }
    if (!this.getNews()) {
      // @ts-ignore
      showPromises.push(new Promise(resolve => document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', event => event.detail.fetch.then(data => {
        resolve(this.renderHTML(data).then(renderedHTML).catch(() => this.handleError()))
      }), { once: true })))
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
        detail: { limit: 0 },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    } else {
      showPromises.push(this.renderHTML().then(renderedHTML).catch(() => this.handleError()))
    }
    Promise.all(showPromises).then(() => {
      this.hidden = false
    })
  }

  disconnectedCallback () {
    this.backBtn.removeEventListener('click', this.clickListener)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * Load news from session storage
   * @param {*} self
   * @param {*} sessionStorage
   * @return {{slug: string, news: string}}
   * @memberof News
   */
  loadNews (self, sessionStorage) {
    const queryString = self.location.search
    const urlParams = new URLSearchParams(queryString)
    const slug = urlParams.get(this.getAttribute('slug-name') || 'news') || ''
    const news = sessionStorage.getItem(this.getAttribute('slug-name') || 'news')
    return { slug, news }
  }

  /**
   * Get current news data based on slug name
   * @param {string | undefined} [slug=undefined]
   * @param {string | undefined} [news=undefined]
   * @return {any | false}
   */
  getNews (slug, news) {
    if (!news || !slug) {
      const data = this.loadNews(self, sessionStorage)
      if (!slug) slug = data.slug
      if (!news) news = data.news
    }
    if (!news) return false
    const newsData = typeof news === 'string' ? JSON.parse(news) : news
    const { items } = (newsData.data && newsData.data.newsEntryCollection) || newsData
    news = items.find(item => item.slug === slug)
    return news
  }

  /**
   * @param {undefined | any} [data=undefined]
   * @return {Promise<void>}
   */
  renderHTML (data) {
    return Promise.all([
      this.getAttribute('namespace') === 'news-alnatura-'
        ? this.fetchHTML([this.importMetaUrl + './alnatura-/alnatura-.html'])
        : this.fetchHTML([this.importMetaUrl + './default-/default-.html']),
      this.loadChildComponents(),
      this.loadScriptDependency(),
      this.loadDependency()
    ]).then((htmls) => {
      /* eslint-disable  no-unused-vars */
      const { date, tags, introHeadline, introImage, location, introText, contentOne, imageOne, contentTwo, imageTwo, contentThree, imageThree, contentFour, imageFour, linkListCollection, metaDescription, metaKeywords, metaTitle } = this.getNews(undefined, data)
      /* eslint-disable  no-unused-vars */
      const linkRenderOptions = {
        renderNode: {
          hyperlink: (node) => `<a href=${node.data.uri} target=${node.data.uri.startsWith(self.location.origin) ? '_self' : '_blank'} rel=${node.data.uri.startsWith(self.location.origin) ? '' : 'noopener noreferrer'}>${node.content[0].value}</a>`
        }
      }
      this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
      this.newsWrapper.innerHTML = eval('`' + htmls[0] + '`')// eslint-disable-line no-eval

      this.setMetaTags({ description: metaDescription, keywords: metaKeywords, title: metaTitle }).then(() => {
        document.title = metaTitle
        this.html = this.newsWrapper
      })
    })
  }

  setMetaTags (metaTags) {
    return /** @type {Promise<void>} */(new Promise((resolve) => {
      for (const [key, value] of Object.entries(metaTags)) {
        if (document.getElementsByTagName('meta').namedItem(key)) {
          // @ts-ignore
          document.getElementsByTagName('meta').namedItem(key).setAttribute('content', value)
        }
      }
      resolve()
    }))
  }

  renderLinkListCollection (collection) {
    const items = collection.map(item => {
      if (item.downloadItem) {
        return `<p><a target="_blank" href="${item.downloadItem.url}">${item.downloadItem.title}</a></p>`
      } else {
        return `<p><a target="_blank" href="${item.linkUrl}">${item.linkText}</a></p>`
      }
    })
    return items.join('')
  }

  /**
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
    :host news  {
      display:var(--display, flex);
      flex-direction:var(--flex-direction,  column);
      align-items:var(--align-items, flex-start);
      align-content:var(--align-content, flex-start);
    }
    :host news > * {
      max-width:100%;
    }
    :host ul li {
      position: var(--li-position, relative);
      padding-left: var(--li-padding-left, 2em);
    }
    :host ul li::before {
      position:var(--li-before-position,  absolute);
      top:var(--li-before-top, 10px);
      left:var(--li-before-left, 8px);
      display:var(--li-before-display, block);
      width:var(--li-before-width, 5px);
      height:var(--li-before-height, 5px);
      background-color:var(--li-before-background-color, #97A619);
      border-radius:var(--li-before-radius, 50%);
      content: var(--li-before-content, '');
    }
    :host .back-btn-wrapper {
      padding:var(--back-btn-padding, 5em);
      text-align:var(--back-btn-text-align, center);
      width:var(--back-btn-width, 100%);
    }
    :host .link-collection {
      padding:var(--link-collection-padding, 2em 0);
    }
    :host .intro {
      font-size:var(--intro-font-size, 1em);
    }
    :host p {
      /* contenful renderer bug: https://github.com/contentful/rich-text/issues/96 */
      white-space:var(--p-white-space, normal);
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
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'news-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'news-alnatura-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./alnatura-/alnatura-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  loadScriptDependency () {
    return this.loadScriptDependencyPromise || (this.loadScriptDependencyPromise = new Promise((resolve, reject) => {
      if (document.getElementById('contentful-module-export')) resolve(this.RESOLVE_MSG)
      const moduleExportScript = document.createElement('script')
      moduleExportScript.setAttribute('id', 'contentful-module-export')
      moduleExportScript.type = 'text/javascript'
      const code = 'var exports = { "__esModule": true };'
      try {
        moduleExportScript.appendChild(document.createTextNode(code))
        document.body.appendChild(moduleExportScript)
        return resolve(this.RESOLVE_MSG)
      } catch (e) {
        return reject(e)
      }
    }))
  }

  loadDependency () {
    return this.loadDependencyPromise || (this.loadDependencyPromise = new Promise((resolve, reject) => {
      if (document.getElementById('contentful-renderer')) resolve(this.RESOLVE_MSG)
      const contentfulRenderer = document.createElement('script')
      contentfulRenderer.setAttribute('type', 'text/javascript')
      contentfulRenderer.setAttribute('id', 'contentful-renderer')
      try {
        // @ts-ignore
        contentfulRenderer.setAttribute('src', `${this.importMetaUrl}../../controllers/contentful/rich-text-html-renderer.es5.min.js`)
        document.body.appendChild(contentfulRenderer)
        contentfulRenderer.onload = () => resolve(this.RESOLVE_MSG)
      } catch (e) {
        return reject(e)
      }
    }))
  }

  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../../atoms/picture/Picture.js').then(
        module => ['a-picture', module.default]
      ),
      import('../../atoms/button/Button.js').then(
        module => ['a-button', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  /**
   * If 'error-url' attribute is set, redirect to corresponding page
   * otherwise show error message on current page
   */
  handleError () {
    if (this.errorURL) {
      location.href = this.errorURL
    } else {
      this.html = this.ERROR_MSG
    }
  }

  get errorURL () {
    return this.getAttribute('error-url')
  }

  get newsListUrl () {
    return this.getAttribute('news-list-url') || ''
  }

  get backBtn () {
    return this.root.querySelector('a-button') || new DocumentFragment()
  }

  get backBtnLabel () {
    return this.getAttribute('back-btn-label') || 'Back'
  }
}
