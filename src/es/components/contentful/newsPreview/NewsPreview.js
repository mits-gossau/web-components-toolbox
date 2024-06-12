// @ts-check
/* global location */

import { Shadow } from '../../prototypes/Shadow.js'
export default class NewsPreview extends Shadow() {
  constructor (news, options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.news = news || null
    this.ERROR_MSG = 'Error. News could not be displayed.'
  }

  connectedCallback () {
    if (this.shouldRenderHTML()) this.renderHTML()
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  shouldRenderHTML () {
    return !this.newsWrapper
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  renderHTML () {
    if (!this.news) {
      this.html = this.ERROR_MSG
      return
    }
    this.fetchModules([
      {
        path: `${this.importMetaUrl}../../organisms/wrapper/Wrapper.js`,
        name: 'o-wrapper'
      },
      {
        path: `${this.importMetaUrl}../../atoms/picture/Picture.js`,
        name: 'a-picture'
      }
    ])
    this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
    const url = new URL(this.newsUrl, this.newsUrl.charAt(0) === '/' ? location.origin : this.newsUrl.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set(this.getAttribute('slug-name') || 'news', this.news.slug)
    this.newsWrapper.innerHTML = /* html */ `
    <a class="link" href="${url.href}">
    <o-wrapper>
        <div class="image-wrapper" width="30%">
          <a-picture picture-load defaultSource="${this.news.introImage.url}?w=500&q=80&fm=jpg" alt="${this.news.introImage.description !== '' ? this.news.introImage.description : this.news.introImage.title}" query-width="w" query-format="fm" query-quality="q" query-height="h"></a-picture></div>
        </div>
        <div class="text-wrapper">
          <p class="margin-zero">${new Date(this.news.date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
          <h3 class="title">${this.news.introHeadline}</h3>
          <p class="margin-zero">${this.news.introText}</p>
        </div> 
      </o-wrapper>
    </a>
  `
    this.html = this.newsWrapper
  }

  /**
   * renders css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
    :host > div {
      border-width:var(--border-width, 0 0 2px);
      border-image:var(--border-image-source, url(_import-meta-url_./default-/img/border-dotted.png)) var(--border-image-slice, 0 0 2 0) var(--border-image-repeat, repeat);
      border-style:var(--border-style, dotted);
    }

    :host > div > a {
      align-items:var(--preview-a-align-items, flex-start);
      display:flex !important;
      flex-direction:var(--preview-a-flex-direction, row);
      flex-wrap:var(--preview-a-flex-wrap, nowrap);
      gap:var(--preview-a-flex-gap, 2em);
      padding:var(--preview-a-padding, 1em 0);
      text-decoration:var(--preview-a-text-decoration, none);
    }
    ${this.getAttribute('is-on-home') !== null
        ? /* CSS */`
          :host(:first-child) > div {
            border-width: var(--first-child-border-width, 2px 0 2px 0);
          }
        `
        : ''}   
    @media only screen and (max-width: _max-width_) {}
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
      case 'preview-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  get newsUrl () {
    return this.getAttribute('news-url') || null
  }
}
