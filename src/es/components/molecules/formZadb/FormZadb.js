// @ts-check
import Form from '../form/Form.js'

/* global customElements */
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

  constructor(...args) {
    super(...args)

    this.zipResults = []
    this.streetResults = []

    this.hideLoader(this.zipLoader)

    this.keydownListener = async event => {

      const inputVal = this.root.querySelector(':focus')

      if (inputVal?.['list']) {

        if (inputVal.getAttribute('list') === 'zip-list') {
          if (inputVal?.value.length >= 2) {
            this.showLoader(this.zipLoader)
            this.zipResults = await this.searchCities(inputVal.value);
            this.hideLoader(this.zipLoader)
          } else {
            this.zipResults = []
          }
          this.cleanDataList('street-list')
          this.clearFieldValues([this.city, this.street])
          this.showDataList(this.zipResults, 'zip-list', 'zip')
        }

        if (inputVal.getAttribute('list') === 'street-list') {
          if (inputVal?.value.length >= 2) {
            this.streetResults = await this.searchStreets(inputVal.value, this.zip.value);
            this.showDataList(this.streetResults, 'street-list', 'name')
          } else {
            this.streetResults = []
          }
        }
      }
    }
  }

  connectedCallback() {
    super.connectedCallback()
    document.addEventListener('keyup', this.keydownListener)
    this.initForm()
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('keyup', this.keydownListener)
  }

  initForm() {

    if (this.city) {
      this.city.setAttribute('disabled', true)
      this.city.setAttribute('readonly', true)
    }

    if (this.street) this.street.setAttribute('disabled', true)

    this.makeDataListForListFields(this.listFields)
  }

  makeDataListForListFields(fields) {
   
    if (!fields.length) {
      // TODO reset all FN
      return
    }
   
    Array.from(fields).forEach(field => {
      this.attachDataList(field, field.getAttribute('list'))
      if (field.getAttribute('list') === 'zip-list') {
        field.onchange = this.zipListener
      }
      if (field.getAttribute('list') === 'street-list') {
        field.onchange = this.streetListener
      }
    })
  }


  cleanDataList(listName) {
    const container = this.root.querySelector(`#${listName}`)
    container.innerHTML = ""
  }

  clearFieldValues(fields) {
    fields.forEach(field => field.value = '')
  }

  zipListener = e => {
    this.disableFields([this.street, this.city])
    this.setCityValue(this.city, this.zipResults, e.target.value)
  }

  streetListener = e => {
    console.log("STREET selected")
  }

  setCityValue(cityField, zipList, zipValue) {
    if (!zipList.length) return
    cityField.value = zipList.find(city => city.zip === zipValue).name
  }

  disableFields(fields) {
    fields.forEach(field => field.removeAttribute('disabled'))
  }


  async searchCities(str) {
    console.log("SEARCH CITY:", str)
    const allCities = await this.getCities(str)
    return allCities.cities.filter(city => city.zip.startsWith(str))
  }

  async searchStreets(str, zip) {
    console.log("SEARCH STREET:", str)
    const allStreets = await this.getStreets(zip)
    return allStreets.streets.filter(street => street.name.startsWith(str))
  }

  showDataList(results, listName, value) {
    const container = this.root.querySelector(`#${listName}`)
    container.innerHTML = ""
    results.forEach(element => {
      const option = document.createElement('option');
      option.value = element[value];
      container.appendChild(option);
    });
  }

  attachDataList(field, name) {
    const dl = document.createElement('datalist')
    dl.setAttribute("id", name)
    dl.setAttribute("class", "suggestion")
    field.after(dl)
  }

  async getCities(zip) {
    try {
      // @ts-ignore
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetCitiesByZip?zip=${zip}`)
      const cities = await response.json()
      console.log("...", cities)
      return cities
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }

  async getStreets(zip) {
    try {
      // @ts-ignore
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetStreetsByZip?zip=${zip}`)
      const cities = await response.json()
      console.log("...", cities)
      return cities
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }

  get zip() {
    return this.root.querySelector('#zip') || null
  }

  get city() {
    return this.root.querySelector('#city') || null
  }

  get street() {
    return this.root.querySelector('#street') || null
  }

  get zipLoader() {
    return this.root.querySelector('.loader')
  }

  get listFields() {
    return this.root.querySelectorAll("input[list]") || []
  }

  hideLoader(loader) {
    loader.style.visibility = 'hidden'
  }

  showLoader(loader) {
    loader.style.visibility = 'visible'
  }
}
