// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */

/**
 *
 * @export
 * @class GoogleMaps
 * @type {CustomElementConstructor}
 * @attribute {}
 * @css {}
 */
export default class GoogleMaps extends Shadow() {
  constructor (...args) {
    super(...args)
    this.MAP_URL = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyC090D7EbD_s04g-_Gn1Fdf5kHtiXZ3V5c&callback=initMap'
    this.DEFAULT_COORDINATES = { lat: 47.375600, lng: 8.675320 }
    this.googleMapTransport = event => {
      const eventTarget = event.target
      const windowOpen = position => {
        const saddr = position && position.coords ? `&saddr=${position.coords.latitude},${position.coords.longitude}` : ''
        // dirflg driving did not work as expected, it has no id for that reason
        console.log('changed', eventTarget, `https://www.google.com/maps?daddr=${this.lat},${this.lng}${saddr}${eventTarget.id ? `&dirflg=${eventTarget.id}` : eventTarget.parentElement && eventTarget.parentElement.id ? `&dirflg=${eventTarget.parentElement.id}` : ''}`);
        self.open(`https://www.google.com/maps?daddr=${this.lat},${this.lng}${saddr}${eventTarget.id ? `&dirflg=${eventTarget.id}` : eventTarget.parentElement && eventTarget.parentElement.id ? `&dirflg=${eventTarget.parentElement.id}` : ''}`, '_blank')
      }
      navigator.geolocation.getCurrentPosition(windowOpen, windowOpen)
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.transportIcons.forEach(transportIcon => {
      transportIcon.addEventListener('click', this.googleMapTransport)
    })
  }

  disconnectedCallback () {
    this.transportIcons.forEach(transportIcon => {
      transportIcon.removeEventListener('click', this.googleMapTransport)
    })
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.scripts.length
  }

  renderCSS () {
    this.css = /* css */` 
    :host {
       width: 100% !important;
       position:relative;
    }
    :host > #map {
      width: 100%;
      height: 560px;
    }  
    :host > hr {
      display: none;
    }
    :host .control-events{
      position: absolute;
      z-index: 1;
      top: 457px;
      right: 70px;
      width: 220px;
      height: 80px;
      padding: 0 12px 0 6px;
      background-color: #fff;
      box-shadow: 2px 2px 2px -2px #999;
    }
    :host .control-events > div {
      margin:6px 0 6px 6px;
    }
    @media only screen and (max-width: _max-width_) {
      :host {
        display: flex !important;
        flex-direction: column;
      }
      :host > #map {
        order: 1;
        width: 100%;
        height: 290px;
      }  
      :host > hr {
        order: 3;
        display: block;
        width: var(--content-width-mobile, calc(100% - var(--content-spacing-mobile, var(--content-spacing)) * 2));
      }
      :host .control-events{
        order: 2;
        position: static;
        width: 100%;
        height: 70px;
        padding-top: 15px;
        box-shadow: none;
      }
      :host .control-events > div {
        margin:0 0 6px var(--content-spacing);
      }
    }`

    const styles = [{
      // @ts-ignore
      path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]
    this.fetchCSS(styles)
  }

  renderHTML () {
    const mapDiv = document.createElement('div')
    mapDiv.setAttribute('id', 'map')
    this.loadDependency().then(googleMap => {
      const map = this.createMap(googleMap, mapDiv, this.lat, this.lng)
      this.setMarker(googleMap, map, this.lat, this.lng)
    })
    this.html = mapDiv
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency () {
    // @ts-ignore
    self.initMap = () => { }

    return new Promise(resolve => {
      const googleMapScript = document.createElement('script')
      googleMapScript.setAttribute('type', 'text/javascript')
      googleMapScript.setAttribute('async', '')
      googleMapScript.setAttribute('src', this.MAP_URL)
      googleMapScript.onload = () => {
        // @ts-ignore
        if ('google' in self === true) resolve(self.google.maps)
      }
      this.html = googleMapScript
    })
  }

  createMap (googleMap, mapTarget, lat, lng) {
    return new googleMap.Map(mapTarget, {
      center: { lat, lng },
      zoom: 15,
      scrollwheel: true,
      mapTypeControl: false,
      streetViewControl: false,
      zoomControl: true,
      panControl: true,
      styles: [{
        featureType: 'landscape',
        stylers: [{ saturation: -100 }, { lightness: 60 }]
      }, {
        featureType: 'road.local',
        stylers: [{ saturation: -100 }, { lightness: 40 }, { visibility: 'on' }]
      }, {
        featureType: 'transit',
        stylers: [{ saturation: -100 }, { visibility: 'simplified' }]
      }, {
        featureType: 'administrative.province',
        stylers: [{ visibility: 'off' }]
      }, {
        featureType: 'water',
        stylers: [{ visibility: 'on' }, { lightness: 30 }]
      }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{ color: '#ef8c25' }, { lightness: 40 }]
      }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{ visibility: 'off' }]
      }, {
        featureType: 'poi.park',
        elementType: 'geometry.fill',
        stylers: [{ color: '#b6c54c' }, { lightness: 40 }, { saturation: -40 }]
      }, {
        featureType: 'poi.business',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }]
    })
  }

  setMarker (googleMap, map, lat, lng) {
    const marker = new googleMap.Marker({
      position: { lat, lng },
      icon: '../src/img/marker.svg'
    })
    marker.setMap(map)
    // marker.setAnimation(googleMap.Animation.DROP);
  }

  get scripts () {
    return this.root.querySelectorAll('script')
  }

  get lat () {
    return Number(this.getAttribute('lat')) || this.DEFAULT_COORDINATES.lat
  }

  get lng () {
    return Number(this.getAttribute('lng')) || this.DEFAULT_COORDINATES.lng
  }

  get transportIcons () {
    const wrapper = this.root.querySelector('o-wrapper')
    return wrapper.root ? wrapper.root.querySelectorAll('a') : wrapper.querySelectorAll('a')
  }
}
