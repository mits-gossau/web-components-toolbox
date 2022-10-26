// @ts-check
import Form from '../form/Form.js'

/* global self */
/* global fetch */
/* global CustomEvent */

/**
 * @return {CustomElementConstructor | *}
 */

export default class FormZadb extends Form {
  constructor (...args) {
    super(...args)

    this.inputFields = {
      zip: {
        id: 'zip',
        listId: 'zip-list',
        customErrorElement: '#plz-field-validation-error'
      },
      street: {
        id: 'street',
        listId: 'street-list'
      }
    }

    this.zipResults = []
    this.streetResults = []
    this.streetsByZip = {}

    this.hideLoader(this.zipLoader)
    this.hideLoader(this.streetLoader)

    this.keydownListener = async event => {
      const inputField = this.root.querySelector(':focus')

      // TODO: Refactor > Switch
      if (inputField?.getAttribute('id') === this.inputFields.zip.id) {
        this.addListIdAttribute(inputField, this.inputFields.zip.listId)

        if (inputField?.value.length >= 2) {
          this.removeListIdAttribute(inputField)
          this.showLoader(this.zipLoader)
          this.zipResults = await this.searchCities(inputField.value)
          this.hideLoader(this.zipLoader)
          this.showDataList(this.zipResults, this.inputFields.zip.listId, ['zip', 'name_long'], inputField)
        } else {
          this.zipResults = []
          this.cleanDialogList(this.inputFields.zip.listId)
          this.setFieldAttributes(this.city, { disabled: true, readonly: true })
          this.setFieldAttributes(this.street, { disabled: true })
        }
        this.cleanDialogList(this.inputFields.street.listId)
        this.clearFieldValues([this.city, this.street])
      }

      if (inputField.getAttribute('id') === this.inputFields.street.id) {
        this.addListIdAttribute(inputField, this.inputFields.street.listId)
        if (inputField?.value.length >= 1) {
          this.showLoader(this.streetLoader)
          this.streetResults = await this.searchStreets(inputField.value, this.zip.value)
          this.hideLoader(this.streetLoader)
          this.removeListIdAttribute(inputField)
          if (this.streetResults.length) {
            this.showDataList(this.streetResults, this.inputFields.street.listId, ['name'], inputField)
          } else {
            this.cleanDialogList(this.inputFields.street.listId)
          }
        } else {
          this.streetResults = []
          this.cleanDialogList(this.inputFields.street.listId)
        }
      }
    }

    this.clickOutsideListener = (event) => {
      this.cleanDialogList(this.inputFields.zip.listId)
      this.cleanDialogList(this.inputFields.street.listId)
    }

    this.zipSelectedListener = (event) => {
      this.zip.value = event.detail.value
      this.zipChangeListener(event)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    document.addEventListener('keyup', this.keydownListener)
    document.addEventListener('click', this.clickOutsideListener)
    this.addEventListener(this.inputFields.zip.listId, this.zipSelectedListener)
    this.initForm()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.removeEventListener('keyup', this.keydownListener)
    document.removeEventListener('click', this.clickOutsideListener)
    this.removeEventListener(this.inputFields.zip.listId, this.zipSelectedListener)
  }

  initForm () {
    if (this.city) this.setFieldAttributes(this.city, { disabled: true, readonly: true })
    if (this.street) this.setFieldAttributes(this.street, { disabled: true })
    this.setupListFields(this.allListFields)
  }

  cleanDialogList (list) {
    const container = this.root.querySelector(`#${list}`)
    container.innerHTML = ''
    container.style.display = 'none'
  }

  removeListIdAttribute (inputField) {
    inputField.setAttribute('list', '')
  }

  addListIdAttribute (inputField, listId) {
    inputField.setAttribute('list', listId)
  }

  setFieldAttributes (field, attributes) {
    for (const key in attributes) {
      field.setAttribute(key, attributes[key])
    }
  }

  setupListFields (fields) {
    if (!fields.length) {
      this.abortAll()
      return
    }

    Array.from(fields).forEach(field => {
      this.attachDataList(field, field.getAttribute('list'))
      this.setOnChangeListener(field, field.getAttribute('list'))
    })
  }

  setOnChangeListener (field, listAttributeName) {
    switch (listAttributeName) {
      case this.inputFields.zip.listId:
        field.onchange = (e) => this.zipChangeListener(e)
        break
      case this.inputFields.street.listId:
        field.onchange = (e) => this.streetChangeListener(e)
        break
      default:
        console.log('No field with list attribute found')
    }
  }

  clearFieldValues (fields) {
    fields.forEach(field => {
      field.value = ''
      return field
    })
  }

  zipChangeListener (e) {
    if (e instanceof CustomEvent) {
      this.streetsByZip = {}
      if (!this.zipResults.length) return
      this.enableFields([this.street, this.city])
      this.setCityValue(this.city, this.zipResults, e.detail.value, e.detail.name)
    }
  }

  // TODO: Remove?
  streetChangeListener (e) {}

  setCityValue (cityField, zipList, zipValue, cityName) {
    if (!zipList.length) return
    cityField.value = zipList.find(city => city.zip === zipValue && city.name === cityName).name
  }

  enableFields (fields) {
    fields.forEach(field => field.removeAttribute('disabled'))
  }

  async searchCities (str) {
    this.triggerCustomZipError(false)
    if (str.length > 4) return
    const allCities = await this.getCities(str)
    if (!allCities.cities.length && str.length === 4) {
      this.triggerCustomZipError(true)
    }
    return allCities.cities.filter(city => city.zip.startsWith(str))
  }

  async searchStreets (str, zip) {
    if (Object.keys(this.streetsByZip).length === 0) this.streetsByZip = await this.getStreets(zip)
    return this.streetsByZip.streets.filter(street => street.name.toLowerCase().startsWith(str.toLowerCase()))
  }

  showDataList (results, listName, value, inputField) {
    if (!results || !results.length) return
    const container = this.root.querySelector(`#${listName}`)
    container.innerHTML = ''
    container.style.display = 'block'
    results.forEach(element => {
      const option = document.createElement('option')
      option.value = element[value[0]]
      option.text = `${value.map(v => element[v]).join(' ')}`
      option.onclick = (e) => {
        inputField.value = element[value]
        container.style.display = 'none'
        container.innerHTML = ''
        this.dispatchEvent(new CustomEvent(listName, {
          detail: {
            value: element[value[0]],
            name: element[value[1]]
          }
        }))
      }
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
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/GetCitiesByZip?zip=${zip}`)
      const cities = await response.json()
      return cities
    } catch (error) {
      console.error('There was a problem: ', error)
      this.abortAll()
    }
  }

  async getStreets (zip) {
    try {
      // if (this.controller) this.controller.abort()
      // this.streetFetchController = new AbortController();
      // const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetStreetsByZip?zip=${zip}`, { signal: this.streetFetchController.signal })
      // @ts-ignore
      const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/GetStreetsByZip?zip=${zip}`)
      const streets = await response.json()
      return streets
    } catch (error) {
      console.error('There was a problem: ', error)
      this.abortAll()
    }
  }

  abortAll () {
    this.hideLoader(this.zipLoader)
    this.hideLoader(this.streetLoader)
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
    return this.root.querySelector('#zip-loader') || null
  }

  get streetLoader () {
    return this.root.querySelector('#street-loader') || null
  }

  get allListFields () {
    return this.root.querySelectorAll('input[list]') || []
  }

  get getCustomZipErrorElement () {
    return this.root.querySelector(this.inputFields.zip.customErrorElement)
  }

  hideLoader (loader) {
    if (!loader) return
    loader.style.visibility = 'hidden'
  }

  showLoader (loader) {
    if (!loader) return
    loader.style.visibility = 'visible'
  }

  triggerCustomZipError (displayElement) {
    const customError = this.getCustomZipErrorElement
    customError.style.display = displayElement ? 'block' : 'none'
  }
}
