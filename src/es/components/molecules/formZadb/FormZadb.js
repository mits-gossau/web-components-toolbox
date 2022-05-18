// @ts-check
import Form from '../form/Form.js'

/* global self */
/* global fetch */

/**
 * As a molecule, this component shall hold Atoms
 * Umbraco Forms Styling
 * Example at: http://localhost:4200/src/es/components/pages/Formularbestellung.html
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @return {CustomElementConstructor | *}
 */

export default class FormZadb extends Form {
  constructor (...args) {
    super(...args)
    this.zipResults = []
    this.streetResults = []
    this.hideLoader(this.zipLoader)
    this.keydownListener = async event => {
      const inputVal = this.root.querySelector(':focus')

      if (inputVal?.list) {
        if (inputVal.getAttribute('list') === 'zip-list') {
          if (inputVal?.value.length >= 2) {
            this.showLoader(this.zipLoader)
            this.zipResults = await this.searchCities(inputVal.value)
            this.hideLoader(this.zipLoader)
          } else {
            this.zipResults = []
          }
          this.cleanDataList('street-list')
          this.clearFieldValues([this.city, this.street])
          this.showDataList(this.zipResults, 'zip-list', 'zip')
        }

        if (inputVal.getAttribute('list') === 'street-list') {
          if (inputVal?.value.length >= 1) {
            this.streetResults = await this.searchStreets(inputVal.value, this.zip.value)
            this.showDataList(this.streetResults, 'street-list', 'name')
          } else {
            this.streetResults = []
          }
        }
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    document.addEventListener('keyup', this.keydownListener)
    this.initForm()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.removeEventListener('keyup', this.keydownListener)
  }

  initForm () {
    if (this.city) this.setFieldAttributes(this.city, { disabled: true, readonly: true })
    if (this.street) this.setFieldAttributes(this.street, { disabled: true })
    this.setupListFields(this.allListFields)
  }

  setFieldAttributes (field, attributes) {
    for (const key in attributes) {
      field.setAttribute(key, attributes[key])
    }
  }

  setupListFields (fields) {
    if (!fields.length) {
      // TODO reset all FN
      return
    }

    Array.from(fields).forEach(field => {
      this.attachDataList(field, field.getAttribute('list'))
      this.setOnChangeListener(field, field.getAttribute('list'))
    })
  }

  setOnChangeListener (field, listAttributeName) {
    switch (listAttributeName) {
      case 'zip-list':
        field.onchange = (e) => this.zipChangeListener(e)
        return
      case 'street-list':
        field.onchange = (e) => this.streetChangeListener(e)
        return
      default:
        console.log('No field with list attribute found')
    }
  }

  cleanDataList (listName) {
    const container = this.root.querySelector(`#${listName}`)
    container.innerHTML = ''
  }

  clearFieldValues (fields) {
    fields.forEach(field => {
      field.value = ''
      return field
    })
  }

  zipChangeListener (e) {
    if(!this.zipResults.length) return
    this.enableFields([this.street, this.city])
    this.setCityValue(this.city, this.zipResults, e.target.value)
  }

  streetChangeListener (e) {
    console.log('STREET selected', e.target.value)
  }

  setCityValue (cityField, zipList, zipValue) {
    if (!zipList.length) return
    cityField.value = zipList.find(city => city.zip === zipValue).name
  }

  enableFields (fields) {
    fields.forEach(field => field.removeAttribute('disabled'))
  }

  async searchCities (str) {
    console.log('SEARCH CITY:', str)
    const allCities = await this.getCities(str)
    if(!allCities) return;
    return allCities.cities.filter(city => city.zip.startsWith(str))
  }

  async searchStreets (str, zip) {
    console.log('SEARCH STREET:', str)
    const allStreets = await this.getStreets(zip)
    return allStreets.streets.filter(street => street.name.startsWith(str))
  }

  showDataList (results, listName, value) {
    if(!results) return
    const container = this.root.querySelector(`#${listName}`)
    container.innerHTML = ''
    results.forEach(element => {
      const option = document.createElement('option')
      option.value = element[value]
      container.appendChild(option)
    })
  }

  attachDataList (field, idName) {
    const dl = document.createElement('datalist')
    this.setFieldAttributes(dl, { id: idName, class: 'suggestion' })
    field.after(dl)
  }

  async getCities (zip) {
    try {
      // @ts-ignore
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetCitiesByZip?zip=${zip}`)
      const cities = await response.json()
      console.log('...', cities)
      return cities
    } catch (error) {
      console.log('There was a problem: ', error)
      this.abortAll()
    }
  }

  async getStreets (zip) {
    try {
      // @ts-ignore
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetStreetsByZip?zip=${zip}`)
      const cities = await response.json()
      console.log('...', cities)
      return cities
    } catch (error) {
      console.log('There was a problem: ', error)
      this.abortAll()
    }
  }

  abortAll(){
    this.hideLoader(this.zipLoader)
    this.enableFields([this.street, this.city])
    this.city.removeAttribute('readonly')
    document.removeEventListener('keyup', this.keydownListener)
  }

  get zip () {
    return this.root.querySelector('#zip') || null
  }

  get city () {
    return this.root.querySelector('#city') || null
  }

  get street () {
    return this.root.querySelector('#street') || null
  }

  get zipLoader () {
    return this.root.querySelector('.loader') || null
  }

  get allListFields () {
    return this.root.querySelectorAll('input[list]') || []
  }

  hideLoader (loader) {
    if (!loader) return
    loader.style.visibility = 'hidden'
  }

  showLoader (loader) {
    if (!loader) return
    loader.style.visibility = 'visible'
  }
}
