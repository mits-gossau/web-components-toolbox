// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

export default class ArticlePreview extends Shadow() {
  constructor (article, ...args) {
    super(...args)
    this.article = article || null
    this.ERROR_MSG = 'Error. Article could not be displayed.'
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.shouldComponentRenderCSS()) this.renderCSS()
  }

  shouldComponentRenderHTML () {
    return !this.newsWrapper
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML () {
    if (!this.article) {
      this.html = this.ERROR_MSG
      return
    }
    this.newsWrapper = this.root.querySelector('div') || document.createElement('div')
    const url = new URL(this.articleUrl, this.articleUrl.charAt(0) === '/' ? location.origin : this.articleUrl.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    url.searchParams.set('article', this.article.slug)
    this.newsWrapper.innerHTML = /* html */ `
    <a class="link" href="${url.href}">
    <o-wrapper>
        <div class="image-wrapper" width="30%">
          <a-picture picture-load defaultSource="${this.article.introImage.url}?w=500&q=80&fm=jpg" alt="randomized image" query-width="w" query-format="fm" query-quality="q" query-height="h"></a-picture></div>
        </div>
        <div class="text-wrapper">
          <p class="margin-zero">${new Date(this.article.date).toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' })}</p>
          <h3 class="title">${this.article.introHeadline}</h3>
          <p class="margin-zero">${this.article.introText}</p>
        </div> 
      </o-wrapper>
    </a>
  `
    this.html = this.newsWrapper
  }

  renderCSS () {
    this.css = /* css */`
    :host > div {
      border-width:var(--border-width, 0 0 2px);
      border-image:var(--border-image-source, url(/src/img/border-dotted.png)) var(--border-image-slice, 0 0 2 0) var(--border-image-repeat, repeat);
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

    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'preview-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  get articleUrl () {
    return this.getAttribute('article-url') || null
  }
}
