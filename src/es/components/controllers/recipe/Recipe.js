// @ts-check
/* global fetch */
/* global AbortController */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class Recipe
 * @type {CustomElementConstructor}
 */
export default class Recipe extends Shadow() {
  constructor(...args) {
    super({ mode: 'false' }, ...args)

    this.abortController = null

    const tag = this.getAttribute('tag') || ''
    const limit = this.getAttribute('limit')
    
    this.requestListRecipeListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      
      console.log("event detail", event.detail)

      const pushHistory = event && event.detail && event.detail.pushHistory
      const variables = {
        tags: [tag, ...this.getTags()].filter(Boolean),
        limit: event.detail && event.detail.limit !== undefined ? Number(event.detail.limit) : Number(limit)
      }

      // set tag resets the page parameter
      if (event.detail && event.detail.tags !== undefined) {
        variables.tags = [tag, ...new Set(event.detail.tags)].filter(Boolean)
        this.setTag(variables.tags[1] || variables.tags[0], pushHistory)
      }

      // skip must be set after tags, since it may got reset by new tag parameter
      if (event.detail && event.detail.skip !== undefined) {
        variables.skip = Number(event.detail.skip)
        this.setPage(String(variables.skip + 1), pushHistory)
      } else {
        variables.skip = this.getCurrentPageSkip()
      }

      const fetchOptions = {
        method: 'GET',
        signal: this.abortController.signal
      }

      variables.tags = variables.tags.map(tag => `&${tag}=true`)
      console.log("vars", variables.tags.toString())

      let endpoint = this.getAttribute('endpoint')
      endpoint += `?limit=${variables.limit}&skip=${variables.skip}${variables.tags.toString()}`

      this.dispatchEvent(new CustomEvent(this.getAttribute('list-recipe') || 'list-recipe', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              console.log(data.data.recipes)
              // return data.data.recipes
              // TODO
              return {
                items: data.data.recipes.results,
                limit: data.data.recipes.limit,
                skip: data.data.recipes.skip,
                tag: [],
                total: data.data.recipes.total
              }
            }
            throw new Error(response.statusText)
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback() {
    this.addEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }

  disconnectedCallback() {
    this.removeEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setTag(tag, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    url.searchParams.set('tag', tag)
    url.searchParams.set('page', '1')
    if (pushHistory) history.pushState({ ...history.state, tag, page: '1' }, document.title, url.href)
  }

  /**
   * Get tag from url else store
   * @param {string} [store=sessionStorage]
   * @return [string]
   */
  getTags(store = sessionStorage.getItem(this.getAttribute('slug-name') || 'news') || '{}') {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return [tag]
    const newsData = JSON.parse(store)
    return newsData?.data?.newsEntryCollection?.tag || []
  }

  /**
   * Set page in window.history
   * @param {string} page
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setPage(page, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    if (page === '1') {
      url.searchParams.delete('page')
    } else {
      url.searchParams.set('page', page)
    }
    if (pushHistory) history.pushState({ ...history.state, tag: this.getTags[1] || this.getTags[0], page }, document.title, url.href)
  }

  /**
   * Get page from url
   * @return [string]
   */
  getPage() {
    const urlParams = new URLSearchParams(location.search)
    return Number(urlParams.get('page') || 1)
  }

  /**
   * Get skip aka. offset for the api request from url else store
   * @param {string} [sessionData=sessionStorage]
   * @return [number]
   */
  getCurrentPageSkip(sessionData = sessionStorage.getItem(this.getAttribute('slug-name') || 'news') || '') {
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
}
