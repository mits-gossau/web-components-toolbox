// @ts-check
/* global self */
/* global CustomEvent */
/* global location */
/* global DOMParser */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Pagination extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
    this.pagination = this.root.querySelector('div') || document.createElement('div')

    this.answerEventNameListener = event => {
      event.detail.fetch.then((data) => {
        let { total, limit, skip } = data
        const urlParams = new URLSearchParams(location.search)
        const pageParam = urlParams.get('page') || 1
        const page = Number(pageParam)
        const calcSkipPage = (page - 1) * data.limit
        if (calcSkipPage !== skip) {
          skip = calcSkipPage
        }
        const pages = Math.ceil(total / limit)
        const compactMode = this.hasAttribute('compact') && pages > 5
        this.renderHTML(pages, limit, skip, compactMode)
      }
      )
    }

    this.clickListener = event => {
      event.preventDefault()
      if (!event.target || event.target.tagName !== 'A' || event.target.hasAttribute('placeholder')) return false
      const page = event.target.hasAttribute('page') ? event.target.getAttribute('page') : event.target.textContent
      this.dispatchRequestNewsEvent(page - 1)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    self.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.pagination.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.pagination.removeEventListener('click', this.clickListener)
    self.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
  }

  dispatchRequestNewsEvent (page) {
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-event-name') || 'request-event-name', {
      detail: {
        skip: page,
        textContent: String(page + 1),
        pageName: this.getAttribute('page-name') || 'Page'
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * Render HTML View
   * @param {Number} pages
   * @param {Number} limit
   * @param {Number} skip
   * @param {Boolean} compactMode
   */
  renderHTML (pages, limit, skip, compactMode) {
    this.html = ''
    this.hidden = !pages // hide if there are no 'pages' available
    const pageItems = compactMode ? this.renderCompactHTML(skip, limit, pages) : this.renderAllPagesHTML(pages, skip, limit)
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
 * Render Pages as 'Compact' View - Ex. 1,2,3 ... 8,9,10
 * @param {Number} skip
 * @param {Number} limit
 * @param {Number} pages
 * @returns {string}
 */
  renderCompactHTML (skip, limit, pages) {
    const START_RANGE = 2
    const END_RANGE = pages - 2
    const selectedPage = (skip / limit)
    let pageItems = ''

    if (selectedPage > START_RANGE && selectedPage < END_RANGE) {
      pageItems += `
        <li class="page-item"><a page=${selectedPage}>&larr;</a></li>
        <li class="page-item" page="1"><a target="_self" class="page-link">1</a></li>
        <li class="page-item"><a placeholder>...</a></li>
        <li class="page-item active" page="${selectedPage + 1}" ><a target="_self" class="page-link active">${selectedPage + 1}</a></li>
        <li class="page-item"><a placeholder>...</a></li>
        <li class="page-item" page="${pages}"><a target="_self" class="page-link">${pages}</a></li>
        <li class="page-item"><a page=${selectedPage + 2} next>&rarr;</a></li>
        `
    } else if (selectedPage >= END_RANGE) {
      pageItems += `
        <li class="page-item"><a page=${selectedPage}>&larr;</a></li>
        <li class="page-item" page="1"><a target="_self" class="page-link">1</a></li>
        <li class="page-item"><a placeholder>...</a></li>
        <li class="page-item ${pages - 3 === selectedPage ? 'active' : ''}" page="${pages - 2}"><a target="_self" class="page-link ${pages - 3 === selectedPage ? 'active' : ''}">${pages - 2}</a></li>
        <li class="page-item ${pages - 2 === selectedPage ? 'active' : ''}" page="${pages - 1}"><a target="_self" class="page-link ${pages - 2 === selectedPage ? 'active' : ''}">${pages - 1}</a></li>
        <li class="page-item ${pages - 1 === selectedPage ? 'active' : ''}" page="${pages}"><a target="_self" class="page-link ${pages - 1 === selectedPage ? 'active' : ''}">${pages}</a></li>
        `
    } else {
      // first 3
      for (let i = 0; i < 3; ++i) {
        pageItems += `<li class="page-item ${i === selectedPage ? 'active' : ''}" page="${i + 1}" ><a target="_self" class="page-link ${i === selectedPage ? 'active' : ''}">${i + 1}</a></li>`
      }
      pageItems += '<li class="page-item"><a placeholder>...</a></li>'
      // last 3
      for (let i = pages - 3; i < pages; i++) {
        pageItems += `<li class="page-item ${i === selectedPage ? 'active' : ''}" page="${i + 1}" ><a target="_self" class="page-link ${i === selectedPage ? 'active' : ''}">${i + 1}</a></li>`
      }
      pageItems += `<li class="page-item"><a page=${selectedPage + 2} next>&rarr;</a></li>`
    }
    return pageItems
  }

  /**
   * Render all Pages
   * @param {Number} pages
   * @param {Number} skip
   * @param {Number} limit
   * @returns {string}
   */
  renderAllPagesHTML (pages, skip, limit) {
    let pageItems = ''
    for (let i = 0; i < pages; ++i) {
      const active = (skip / limit)
      pageItems += `<li class="page-item ${i === active ? 'active' : ''} " page="${i + 1}" ><a target="_self" class="page-link ${i === active ? 'active' : ''}">${i + 1}</a></li>`
    }
    return pageItems
  }

  /**
   * Set "rel" attribute to previous and next link
   * @param {string} items
   * @return {string}
   */
  setRel (items) {
    const childNodes = new DOMParser().parseFromString(items, 'text/html').body.childNodes
    const nodes = Array.from(childNodes).filter(node => node.nodeType !== 3) // filter out text nodes
    if (nodes.length === 1) {
      // @ts-ignore
      return nodes[0].outerHTML
    }
    const url = location.href
    const pageParam = url.substring(url.lastIndexOf('page='))
    const updateNodes = nodes.reduce((acc, cur, index, nodes) => {
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
      display: inherit;
    }
    :host > div {
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
      border-top:var(--li-border-top, 1px solid black);
      display:var(--li-display, inline-block);
      font-size:var(--li-font-size, 1em);
      height:var(--li-height, 5em); 
      width:var(--li-width, 5em);
    }
    :host li.active {
      background:var(--li-background-active, white);
    }
    :host nav ul li:hover {
      border-top: var(--li-border-top-hover, 1px solid red);
    }
    :host nav ul li > a {
      align-items:var(--li-a-align-items, center);
      border-left:var(--li-a-border-left, 1px var(--li-background-active, var(--background-color)) solid);
      display:var(--li-a-display, flex);
      height:var(--li-a-height, 100%);
      justify-content:var(--li-a-justify-content, center);
      margin:var(--li-a-margin, 0);
      text-decoration:var(--li-a-text-decoration, none);
    }
    :host nav ul li > a.active {
      color:var(--li-a-color-active, black);
    }
    :host nav ul li:has(> a.active) + li > a {
      border-left:var(--li-hover-a-active-border-left, 1px transparent solid);
    }
    @media only screen and (max-width: _max-width_) {
      :host li {
        font-size:var(--li-font-size-mobile, var(--li-font-size, 1em));
        height:var(--li-height-mobile, var(--li-height, 5em));
        width:var(--li-width-mobile, var(--li-width, 2.5em));
      }
      :host nav ul li:has(> a.active) + li > a {
        border-left:var(--li-hover-a-active-border-left-mobile, var(--li-hover-a-active-border-left, 1px var(--li-background-active, var(--background-color)) solid));
      }
    }`

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
      case 'pagination-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }
}
