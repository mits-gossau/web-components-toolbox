// @ts-check
/* global self */
/* global CustomEvent */
/* global sessionStorage */

import { Shadow } from '../../prototypes/Shadow.js'

export default class Pagination extends Shadow() {
  constructor(...args) {
    super(...args)

    this.pagination = this.root.querySelector('div') || document.createElement('div')
    this.listArticlesListener = event => {
      event.detail.fetch.then(() => {
        const articles = sessionStorage.getItem('articles') || ''
        const articlesData = JSON.parse(articles)
        const { total, limit, skip } = articlesData?.data.newsEntryCollection
        const pages = Math.ceil(total / limit)
        this.renderHTML(pages, limit, skip)
      })
    }

    this.clickListener = event => {
      if (!event.target || event.target.tagName !== 'A') return false
      event.preventDefault()

      const url1 = window.location.href
      console.log("url1", url1);
      // const urlSplit = url.split("?");
      // console.log("urlSplit", urlSplit);
      // const stateObj = { Title: "New title", Url: urlSplit[0] + "?param1=5" };
      // console.log("stateObj", stateObj);
      // history.pushState(stateObj, stateObj.Title, stateObj.Url);

      // Create the properties
      //let state = window.history.state;
      let title = document.title;
      //let url = window.location.origin + window.location.pathname + '?page='+event.target.textContent;
      let url = url1 + '?page=' + event.target.textContent
      console.log(title, url);
      history.pushState(event.target.textContent, title, url);



      this.dispatchEvent(new CustomEvent('requestListArticles', {
        detail: {
          skip: event.target.textContent - 1
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback() {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    self.addEventListener('listArticles', this.listArticlesListener)
    this.pagination.addEventListener('click', this.clickListener)
    window.addEventListener('popstate', this.changePopState)
  }

  disconnectedCallback() {
    this.pagination.removeEventListener('click', this.clickListener)
    self.removeEventListener('listArticles', this.listArticlesListener)
    window.removeEventListener('popstate', this.changePopState)
  }


  changePopState = (event) => {
    console.log("pop", event.state);
    this.dispatchEvent(new CustomEvent('requestListArticles', {
      detail: {
        skip: event.state - 1
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  };



  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderHTML(pages, limit, skip) {
    let pageItems = ''
    for (let i = 0; i < pages; ++i) {
      const active = (skip / limit)
      pageItems += `<li class="page-item ${i === active ? 'active' : ''} "page="${i + 1}" ><a class="page-link ${i === active ? 'active' : ''}" href="?page=${i + 1}">${i + 1}</a></li>`
    }

    this.pagination.innerHTML =
      `<nav>
        <ul class="pagination">
          ${pageItems}
        </ul>
      </nav>
    `
    this.html = this.pagination
  }

  renderCSS() {
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

  changeQueryString(searchString, documentTitle) {
    documentTitle = typeof documentTitle !== 'undefined' ? documentTitle : document.title;
    var urlSplit = (window.location.href).split("?");
    var obj = { Title: documentTitle, Url: urlSplit[0] + searchString };
    history.pushState(obj, obj.Title, obj.Url);
  }
}
