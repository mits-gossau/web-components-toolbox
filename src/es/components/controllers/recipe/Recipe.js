// @ts-check
/* global fetch */
/* global AbortController */
/* global location */
/* global sessionStorage */
/* global CustomEvent */
/* global history */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * TODO
 * @export
 * @class Recipe
 * @type {CustomElementConstructor}
 */
export default class Recipe extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)

    const recipeCat = {
      Drinks: false,
      Appetizers: false,
      MainDishes: false,
      DessertsAndBaking: false,
      DIY: false,
      veg: false
    }

    this.abortController = null

    const limit = this.getAttribute('limit')

    this.requestListRecipeListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()

      const recipes = sessionStorage.getItem('recipes') || JSON.stringify(recipeCat)
      if (recipes !== '') {
        sessionStorage.setItem('recipes', recipes)
      }
      const recipeData = JSON.parse(recipes)
      if (event.detail && event.detail.tags) {
        recipeData[event.detail.tags[0]] = event.detail.isActive
      }
      sessionStorage.setItem('recipes', JSON.stringify(recipeData))

      const pushHistory = event && event.detail && event.detail.pushHistory
      const variables = {
        limit: event.detail && event.detail.limit !== undefined ? Number(event.detail.limit) : Number(limit),
        tags: this.getTags()
      }

      // set tag resets the page parameter
      if (event.detail && event.detail.tags !== undefined) {
        const selected = Object.fromEntries(Object.entries(recipeData).filter(([key]) => recipeData[key]))
        variables.tags = Object.keys(selected).join(';')
        this.setTag(variables.tags, pushHistory)
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

      const recipePayload = []
      Object.keys(recipeData).forEach((key, index) => {
        const str = `${key}=${recipeData[key]}`
        recipePayload.push(str)
      })

      let endpoint = this.getAttribute('endpoint')
      endpoint += `?limit=${variables.limit}&skip=${variables.skip}&${recipePayload.join('&')}`
      this.dispatchEvent(new CustomEvent(this.getAttribute('list-recipe') || 'list-recipe', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              return {
                items: data.data.recipes.results,
                limit: data.data.recipes.limit,
                skip: data.data.recipes.skip,
                tag: variables.tags ? variables.tags.split(';') : [],
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

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
  }

  /**
   * Set tag and page in window.history
   * @param {string} tag
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setTag (tag, pushHistory = true) {
    const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
    url.searchParams.set('tag', tag)
    url.searchParams.set('page', '1')
    if (pushHistory) history.pushState({ ...history.state, tag, page: '1' }, document.title, url.href)
  }

  /**
   * Get tag from url else store
   * @return string
   */
  getTags () {
    const urlParams = new URLSearchParams(location.search)
    const tag = urlParams.get('tag')
    if (tag) return tag
  }

  /**
   * Set page in window.history
   * @param {string} page
   * @param {boolean} [pushHistory = true]
   * @return {void}
   */
  setPage (page, pushHistory = true) {
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
  getPage () {
    const urlParams = new URLSearchParams(location.search)
    return Number(urlParams.get('page') || 1)
  }

  /**
   * Get skip aka. offset for the api request from url else store
   * @return [number]
   */
  getCurrentPageSkip () {
    const page = this.getPage()
    return page - 1
  }
}
