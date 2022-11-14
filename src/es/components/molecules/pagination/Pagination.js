// @ts-check
/* global self */
/* global CustomEvent */
/* global sessionStorage */
/* global location */
/* global history */
/* global DOMParser */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Pagination extends Shadow() {
  constructor (...args) {
    super(...args)

    const locationURL = self.location.href
    const title = document.title

    this.pagination = this.root.querySelector('div') || document.createElement('div')

    this.listNewsListener = event => {
      event.detail.fetch.then(() => {
        const news = sessionStorage.getItem('news') || ''
        this.newsData = JSON.parse(news)
        debugger
        const pageParams = Number(location.search.split('page=')[1]) || 1
        let { total, limit, skip } = this.newsData?.data.newsEntryCollection
        const calcSkipPage = (pageParams - 1) * 5
        if (calcSkipPage !== skip) {
          skip = calcSkipPage
        }
        const pages = Math.ceil(total / limit)
        this.renderHTML(pages, limit, skip)
      })
    }

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()
      const url = new URL(locationURL, locationURL.charAt(0) === '/' ? location.origin : locationURL.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
      url.searchParams.set('page', event.target.textContent)
      if (url.searchParams.get('page') === '1') {
        url.searchParams.delete('page')
      }
      history.pushState(event.target.textContent, title, url.href)
      this.dispatchRequestNewsEvent(event.target.textContent - 1)
    }

    this.updatePopState = event => {
      if (!event.state) return
      this.dispatchRequestNewsEvent(event.state - 1)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    self.addEventListener('listNews', this.listNewsListener)
    this.pagination.addEventListener('click', this.clickListener)
    self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.pagination.removeEventListener('click', this.clickListener)
    self.removeEventListener('listNews', this.listNewsListener)
    self.removeEventListener('popstate', this.updatePopState)
  }

  dispatchRequestNewsEvent (page) {
    this.dispatchEvent(new CustomEvent('requestListNews', {
      detail: {
        skip: page,
        tag: this.newsData.data.newsEntryCollection.tag
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML (pages, limit, skip) {
    this.html = ''
    let pageItems = ''
    for (let i = 0; i < pages; ++i) {
      const active = (skip / limit)
      pageItems += `<li class="page-item ${i === active ? 'active' : ''} "page="${i + 1}" ><a target="_self" class="page-link ${i === active ? 'active' : ''}">${i + 1}</a></li>`
    }

    const withRelAttributeOnLinks = this.setRel(pageItems)

    this.pagination.innerHTML =
      `<nav>
        <ul class="pagination">
          ${withRelAttributeOnLinks}
        </ul>
      </nav>
    `
    this.html = this.pagination
  }

  /**
   * Set "rel" attribute to previous and next link
   * @param {string} items
   * @return {string}
   */
  setRel (items) {
    const nodes = new DOMParser().parseFromString(items, 'text/html').body.childNodes
    if (nodes.length === 1) {
      // @ts-ignore
      return nodes[0].outerHTML
    }
    const url = location.href
    const pageParam = url.substring(url.lastIndexOf('page='))
    const updateNodes = Array.from(nodes).reduce((acc, cur, index, nodes) => {
      // @ts-ignore
      if (cur.classList.contains('active')) {
        if (index === 0) {
          // @ts-ignore
          acc[index + 1].firstChild.setAttribute('rel', 'next')
          // @ts-ignore
          acc[index + 1].firstChild.setAttribute('href', `${location.href}?page=${acc[index + 1].getAttribute('page')}`)
        } else if (index + 1 === nodes.length) {
          // @ts-ignore
          const rep = location.href.replace(pageParam, `page=${acc[index - 1].getAttribute('page')}`)
          // @ts-ignore
          acc[index - 1].firstChild.setAttribute('rel', 'prev')
          // @ts-ignore
          acc[index - 1].firstChild.setAttribute('href', rep)
        } else {
          // @ts-ignore
          const curPageNext = location.href
          // @ts-ignore
          const repNext = curPageNext.replace(pageParam, `page=${acc[index + 1].getAttribute('page')}`)
          // @ts-ignore
          acc[index + 1].firstChild.setAttribute('rel', 'next')
          // @ts-ignore
          acc[index + 1].firstChild.setAttribute('href', repNext)
          // @ts-ignore
          const curPagePrev = location.href
          // @ts-ignore
          const repPrev = curPagePrev.replace(pageParam, `page=${acc[index - 1].getAttribute('page')}`)
          // @ts-ignore
          acc[index - 1].firstChild.setAttribute('rel', 'prev')
          // @ts-ignore
          acc[index - 1].firstChild.setAttribute('href', repPrev)
        }
      }
      return acc
    }, nodes)

    // @ts-ignore
    return Array.from(updateNodes).map(item => item.outerHTML).join('')
  }

  renderCSS () {
    this.css = /* css */ `
    :host {
      background-color:var(--background-color, black);
      display: var(--display, block);
      height:var(--height, 100%);
    }
    :host ul {
      display:var(--ul-display, flex);
      float:var(--ul-float, right);
      margin:var(--ul-margin, 0);
    }
    :host li {
      border:var(--li-border, 0);
      display:var(--li-display, inline);
      font-size:var(--li-font-size, 1em);
      height:var(--li-height, 5em);
      padding:var(--li-padding, 0);
      position:var(--li-position, relative);
      width:var(--li-width, 5em);
    }
    :host li::after {
      background-color:var(--li-after-background, red);
      content:var(--li-after-content, '');
      height:var(--li-after-height, 100%);
      left:var(--li-after-left, 0);
      position:var(--li-after-position, absolute);
      top:var(--li-after-top, 1em);
      width:var(--li-after-width, 1px);
    }
    :host li.active {
      background:var(--li-active-background, white);
    }
    :host nav ul li > a {
      align-items:var(--li-a-align-items, center);
      border-top:var(--li-a-border-top, 1px solid black);
      display:var(--li-a-display, flex);
      flex-direction:var(--li-a-flex-direction, row);
      height:var(--li-a-height, 100%);
      justify-content:var(--li-a-justify-content, center);
      margin:var(--li-a-margin, 0);
      text-decoration:var(--li-a-text-decoration, none);
    }
    :host nav ul li > a.active {
      color:var(--li-a-active, black);
    }
    :host nav ul li > a:hover {
      border-top: var(--li-a-border-top-hover, 1px solid red);
    }
     @media only screen and (max-width: _max-width_) {
      :host li {
        font-size:var(--li-font-size-mobile, 1em);
        height:var(--li-height-mobile, 5em);
        width:var(--li-width-mobile, 2.5em);
      }
     }
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
      case 'pagination-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  changeQueryString (searchString, documentTitle) {
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title
    const urlSplit = (self.location.href).split('?')
    const obj = { Title: documentTitle, Url: urlSplit[0] + searchString }
    history.pushState(obj, obj.Title, obj.Url)
  }
}
