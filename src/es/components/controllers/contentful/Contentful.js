// @ts-check
/* global CustomEvent */
/* global history */
/* global fetch */
/* global location */
/* global sessionStorage */
/* global AbortController */
/* global self */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class Contentful
 * @type {CustomElementConstructor}
 */
export default class Contentful extends Shadow() {
  constructor (options = {}, ...args) {
    super({
      ...options,
      importMetaUrl: import.meta.url,
      mode: 'false'
    }, ...args)
    const token = this.getAttribute('token')
    const spaceId = this.getAttribute('space-id')
    // @ts-ignore
    const endpoint = self.Environment.contentfulEndpoint + spaceId
    const limit = this.getAttribute('limit')
    const tag = this.getAttribute('tag') || ''
    this.abortController = null

    this.requestListNewsListener = async (event, useStore = true) => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      const pushHistory = event && event.detail && event.detail.pushHistory
      const variables = {
        tags: [tag, ...this.getTags(undefined, useStore)],
        limit: event.detail && event.detail.limit !== undefined ? Number(event.detail.limit) : Number(limit)
      }
      // set tag resets the page parameter
      if (event.detail && event.detail.tags !== undefined) {
        variables.tags = [tag, ...new Set(event.detail.tags)]
        this.setTag(variables.tags[1] || variables.tags[0], event, pushHistory)
      }
      if (event.detail && (event.detail.tags !== undefined || event.detail.tag !== undefined)) {
        this.setTitle(event)
      } else if (variables.tags && variables.tags[1]) {
        // @ts-ignore
        this.setTitle({ detail: { textContent: variables.tags[1] } })
      }
      // skip must be set after tags, since it may got reset by new tag parameter
      if (event.detail && event.detail.skip !== undefined) {
        const skipValue = Number(event.detail.skip)
        variables.skip = skipValue * 5 // contentful skip value
        this.setPage(String(skipValue + 1), pushHistory) // visual skip value
      } else {
        variables.skip = this.getCurrentPageSkip()
      }
      // tags is expected to only have only one value... Alnatura is the topic selector, Expl.: All: ['Alnatura'] only Interview: ['Alnatura', 'interview']
      let query = null
      try {
        // @ts-ignore
        query = await import('../../../../../../controllers/contenful/Query.js')
        query = query.default
      } catch (e) {
        query = await import('./Query.js')
        query = query.default
      }
      const fetchOptions = {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + token + ' ',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query, variables }),
        signal: this.abortController.signal
      }

      this.dispatchEvent(new CustomEvent(this.getAttribute('list-news') || 'list-news', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              let data = await response.json()
              data = this.injectData(data, 'tag', variables.tags)
              sessionStorage.setItem(this.getAttribute('slug-name') || 'news', JSON.stringify(data))
              if (data.data.newsEntryCollection.tag.length > 1) data.data.newsEntryCollection.tag = data.data.newsEntryCollection.tag.splice(1)
              return data.data.newsEntryCollection
            }
            throw new Error(response.statusText)
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }

    // inform about the url which would result on this filter
    this.requestHrefEventListener = event => {
      if (event.detail && event.detail.resolve) event.detail.resolve(this.setTag(event.detail.tags[1] || event.detail.tags[0], event, event.detail.pushHistory).href)
    }

    this.updatePopState = event => {
      if (!event.detail) event.detail = { ...event.state }
      event.detail.pushHistory = false
      if (event.detail.page) event.detail.skip = event.detail.page - 1
      this.requestListNewsListener(event, false)
    }
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-news') || 'request-list-news', this.requestListNewsListener)
    this.addEventListener('request-href-' + (this.getAttribute('request-list-news') || 'request-list-news'), this.requestHrefEventListener)
    self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-news') || 'request-list-news', this.requestListNewsListener)
    this.removeEventListener('request-href-' + (this.getAttribute('request-list-news') || 'request-list-news'), this.requestHrefEventListener)
    self.removeEventListener('popstate', this.updatePopState)
  }

  /**
   * Inject additional data into newsEntryCollection
   * @param {*} data
   * @param {*} additionalDataKey
   * @param {*} additionalData
   * @return
   */
  injectData (data, additionalDataKey, additionalData) {
    return {
      ...data,
      data: {
        ...data.newsEntryCollection,
        newsEntryCollection: {
          ...data.data.newsEntryCollection,
          [additionalDataKey]: [...additionalData]
        }
      }
    }
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {CustomEvent} event
   * @param {boolean} [pushHistory = true]
   * @return {URL}
   */
  setTag (tag, event, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    url.searchParams.set('tag', tag)
    url.searchParams.set('page', '1')
    if (pushHistory) history.pushState({ ...history.state, textContent: event.detail.textContent, tag, page: '1' }, document.title, url.href)
    return url
  }

  /**
   * Get tag from url else store
   * @param {string} [store=sessionStorage]
   * @param {boolean} [useStore = true]
   * @return [string]
   */
  getTags (store = sessionStorage.getItem(this.getAttribute('slug-name') || 'news') || '{}', useStore = true) {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return [tag]
    if (!useStore) return []
    const newsData = JSON.parse(store)
    return newsData?.data?.newsEntryCollection?.tag || []
  }

  /**
   * Set page in window.history
   * @param {string} page
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setPage (page, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? this.importMetaUrl : undefined)
    if (page === '1') {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', page)
    }
    // set Page is very difficult and would need more testing, assumption that this wouldn't effect SEO anyways, since pages are proper links in opposite to buttons
    // this.setTitle(event, event.detail && event.detail.pageName ? ` ${event.detail.pageName} ` : ' Page ')
    if (pushHistory) history.pushState({ ...history.state, tag: this.getTags()[1] || this.getTags()[0], page }, document.title, url.href)
  }

  /**
   * Get page from url
   * @return [string]
   */
  getPage () {
    const urlParams = new URLSearchParams(location.search)
    return Number(urlParams.get('page') || 1)
  }

  /**
   * Get skip aka. offset for the api request from url else store
   * @param {string} [sessionData=sessionStorage]
   * @return [number]
   */
  getCurrentPageSkip (sessionData = sessionStorage.getItem(this.getAttribute('slug-name') || 'news') || '') {
    sessionStorage.removeItem('news-viewed')
    if (sessionData === '') return 0
    // TODO: strange behavior, since it always returns getPage
    const newsData = JSON.parse(sessionData)
    const { skip, limit } = newsData.data.newsEntryCollection
    const currentPageSkip = skip / limit
    const page = this.getPage()
    if (currentPageSkip !== page - 1) return page - 1
    return currentPageSkip
  }

  /**
   * @param {CustomEvent} event
   * @param {false | string} [addToTitle = false]
   */
  setTitle (event, addToTitle = false) {
    let textContent
    if (event && event.detail && event.detail.textContent && (textContent = event.detail.textContent.trim())) {
      if (addToTitle) {
        document.title = document.title.replace(new RegExp(`(.*)${addToTitle.replace(/\s/g, '\\s').replace(/\|/g, '\\|')}.*`), '$1')
        document.title += addToTitle + textContent
      } else if (document.title.includes('|')) {
        document.title = document.title.replace(/[^|]*(.*)/, textContent + ' $1')
      } else {
        document.title = textContent
      }
    }
  }
}
