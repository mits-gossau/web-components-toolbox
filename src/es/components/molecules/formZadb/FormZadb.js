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
    this.loader = this.root.querySelector('.loader')
    this.loader.style.visibility = 'hidden'
    console.log(this.loader)  

   
    this.keydownListener = async event => {
      const inputVal = this.root.querySelector(':focus')
      if (inputVal?.['list']) {

        if (inputVal.getAttribute('list') === 'zip-list') {
          if (inputVal?.value.length >= 2) {
            this.loader.style.visibility = 'visible'
            this.zipResults = await this.searchCities(inputVal.value);
            this.loader.style.visibility = 'hidden'
          }else{
            this.zipResults = [] 
          }
          this.cleanDataList('street-list')
          this.city.value = ""
          this.street.value = ""
          this.showDataList(this.zipResults, 'zip-list', 'zip')
          
        }

        if (inputVal.getAttribute('list') === 'street-list') {
          if (inputVal?.value.length >= 2) {
            this.streetResults = await this.searchStreets(inputVal.value);
            this.showDataList(this.streetResults, 'street-list', 'name')
          }else{
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

  cleanDataList(listName){
    const container = this.root.querySelector(`#${listName}`) 
    container.innerHTML = ""
  }

  zipListener = e => {
    this.street.removeAttribute('disabled')
    this.city.removeAttribute('disabled')
    this.city.value = this.zipResults.find(city => city.zip === e.target.value).name
  }


  streetListener = e => {
    console.log("eeeeee STREET")
  }

  async searchCities(str) {
    const allCities = await this.getCities()
    return allCities.filter(city => city.zip.startsWith(str))
  }

  async searchStreets(str) {
    const allStreets = await this.getStreets()
    return allStreets.filter(street => street.name.startsWith(str))
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

  attachDataList(field,name) {
    const dl = document.createElement('datalist')
    dl.setAttribute("id", name)
    dl.setAttribute("class", "suggestion")
    field.after(dl)
  }




  initForm() {
    if ((this.city = this.root.querySelector('#city'))) {
      this.city.setAttribute('disabled', true)
      this.city.setAttribute('readonly', true)
    }
    if ((this.street = this.root.querySelector('#street'))) {
      this.street.setAttribute('disabled', true)
    }
    this.getAllListFields()
  }

  getAllListFields() {
    const fieldsWithList = this.root.querySelectorAll("input[list]")
    Array.from(fieldsWithList).forEach(field => {
      this.attachDataList(field,field.getAttribute('list'))
      if (field.getAttribute('list') === 'zip-list') {
       
        field.onchange = this.zipListener
        //field.onchange = (field) => this.zipListener(field)
        
      }
      if (field.getAttribute('list') === 'street-list') {
        field.onchange = this.streetListener
      }
    })
  }

  async getCities() {
    try {
      // @ts-ignore
      // const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetAllCities`)
      // const cities = await response.json()
      // console.log("...",cities)
      const dummyCities = [
        {
          "id": 3647,
          "name": "Aadorf",
          "name_long": "Aadorf",
          "zip": "8355",
          "zip_extension": "00",
          "municipality_id": 4551,
          "canton": "TG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 43,
          "name": "Aarau",
          "name_long": "Aarau",
          "zip": "8350",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 51,
          "name": "Aarau",
          "name_long": "Aarau",
          "zip": "8351",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 48,
          "name": "Aarau 1",
          "name_long": "Aarau 1",
          "zip": "8001",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 148,
          "name": "AAA",
          "name_long": "AAA",
          "zip": "0001",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        }]
      //return dummyCities.map(city => city.zip)
      return dummyCities
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }

  async getStreets() {
    try {
      // @ts-ignore
      // const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetAllCities`)
      // const cities = await response.json()
      // console.log("...",cities)
      const dummyStreets = [{ "id": 11532, "type_id": 1, "name": "Kartonstrasse", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }, { "id": 82094, "type_id": 1, "name": "Kartonbach", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }, { "id": 82092, "type_id": 1, "name": "Am Mülibach", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }, { "id": 11578, "type_id": 1, "name": "Am Rain", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }, { "id": 11531, "type_id": 1, "name": "Am Steinlibach", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }, { "id": 556472, "type_id": 1, "name": "Am Stutz", "zip": "9425", "zip_extension": "00", "city": "Thal", "city_long": "Thal", "country_iso": "CH" }]
      //return dummyCities.map(city => city.zip)
      return dummyStreets
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }

}
