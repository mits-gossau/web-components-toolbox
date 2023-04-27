// @ts-check
/* global fetch */
/* global AbortController */
/* global location */
/* global sessionStorage */
/* global CustomEvent */
/* global history */

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Recipes are retrieved via the corresponding endpoint as set as an attribute
 * As a controller, this component communicates exclusively through events
 * Example: https://www.alnatura.ch/rezepte
 *
 * @export
 * @class Recipe
 * @type {CustomElementConstructor}
 */
export default class Recipe extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)
    this.origTitle = document.title
    this.abortController = null

    // Recipe Filter Options/Categories
    this.RECIPE_CATEGORIES = Recipe.parseAttribute(this.getAttribute('recipe_categories')) || {
      Drinks: false,
      Appetizers: false,
      MainDishes: false,
      DessertsAndBaking: false,
      DIY: false,
      Vegetarian: false,
      Vegan: false,
      GlutenFree: false,
      LactoseFree: false
    }
    const limit = this.getAttribute('limit')

    this.requestListRecipeListener = async event => {
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      let recipeData = JSON.parse(this.getRecipeSelection())
      if (event.detail) {
        if (event.detail.tags) {
          recipeData[event.detail.tags[0]] = event.detail.isActive
        } else if (event.detail.tag || (!event.detail.page && !event.detail.skip && !event.detail.key)) {
          // when only tag is delivered from pop state reset all props to false and use the popstate props as true
          for (const key in recipeData) {
            recipeData[key] = false
          }
          if (event.detail.tag) recipeData = Object.assign(recipeData, event.detail.tag.split(';').reduce((acc, tag) => {
            acc[tag] = true
            return acc
          }, {}))
        } else if (!event.detail.key && !event.detail.skip) {
          for (const key in recipeData) {
            recipeData[key] = false
          }
        }
      }
      this.setRecipeSelection(recipeData)

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
      if (event.detail && (event.detail.tags !== undefined || event.detail.tag !== undefined)) this.setTitle({detail:{textContent: Object.entries(recipeData).reduce((acc, entry, i) => {
        if (!entry[1]) return acc
        return acc + (i === 0 ? '' : ' ') + entry[0]
      }, '') || this.origTitle}})

      // skip must be set after tags, since it may get reset by new tag parameter
      if (event.detail && event.detail.skip !== undefined) {
        variables.skip = Number(event.detail.skip)
        this.setPage(String(variables.skip + 1), pushHistory)
      } else {
        variables.skip = this.getCurrentPageSkip()
      }

      // set search value from input field
      this.setSearchTerm(event.detail)

      const fetchOptions = {
        method: 'GET',
        signal: this.abortController.signal
      }
      let endpoint = this.getAttribute('endpoint')
      endpoint += `?limit=${variables.limit}&skip=${variables.skip}&${this.createRecipeSelectionPayload(recipeData)}&searchTerm=${this.getSearchTerm()}`
      this.dispatchEvent(new CustomEvent(this.getAttribute('list-recipe') || 'list-recipe', {
        detail: {
          fetch: fetch(endpoint, fetchOptions).then(async response => {
            if (response.status >= 200 && response.status <= 299) {
              const data = await response.json()
              return {
                searchTerm: this.getSearchTerm(),
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
    this.updatePopState = event => {
      if (!event.detail) event.detail = { ...event.state }
      event.detail.pushHistory = false
      this.requestListRecipeListener(event)
    }
  }

  connectedCallback () {
    this.addEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
    self.addEventListener('popstate', this.updatePopState)
  }

  disconnectedCallback () {
    this.removeEventListener(this.getAttribute('request-list-recipe') || 'request-list-recipe', this.requestListRecipeListener)
    self.removeEventListener('popstate', this.updatePopState)
  }

  createRecipeSelectionPayload (recipeSelection) {
    const recipePayload = []
    Object.keys(recipeSelection).forEach(key => {
      const str = `${key}=${recipeSelection[key]}`
      recipePayload.push(str)
    })
    return recipePayload.join('&')
  }

  getRecipeSelection () {
    let recipes = sessionStorage.getItem('recipes')
    if (!recipes) {
      sessionStorage.setItem('recipes', JSON.stringify(this.RECIPE_CATEGORIES))
      recipes = JSON.stringify(this.RECIPE_CATEGORIES)
    }
    return recipes
  }

  setRecipeSelection (recipeSelection) {
    sessionStorage.setItem('recipes', JSON.stringify(recipeSelection))
  }

  setSearchTerm (eventDetail, pushHistory = true) {
    if (eventDetail && eventDetail.key === 'inputSearch') {
      const searchTerm = eventDetail.value
      const url = new URL(location.href, location.href.charAt(0) === '/' ? location.origin : location.href.charAt(0) === '.' ? import.meta.url.replace(/(.*\/)(.*)$/, '$1') : undefined)
      url.searchParams.set('search-term', searchTerm)
      if (pushHistory) history.pushState({ ...history.state, searchTerm }, document.title, url.href)
    }
  }

  getSearchTerm () {
    const urlParams = new URLSearchParams(location.search)
    return urlParams.get('search-term') || ''
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
    // set Page is very difficult and would need more testing, assumption that this wouldn't effect SEO anyways, since pages are proper links in opposite to buttons
    //this.setTitle(event, event.detail && event.detail.pageName ? ` ${event.detail.pageName} ` : ' Page ')
    if (pushHistory) history.pushState({ ...history.state, tag: this.getTags(), page }, document.title, url.href)
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
