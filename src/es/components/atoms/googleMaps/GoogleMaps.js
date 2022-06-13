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
  constructor(...args) {
    super(...args)
    this.MAP_URL = `https://maps.googleapis.com/maps/api/js?key=${this.apiKey}&callback=initMap`
    this.DEFAULT_COORDINATES = { lat: 47.375600, lng: 8.675320 }
    if (!this.iframeUrl) {
      this.googleMapTransport = event => {
        const eventTarget = event.target
        const windowOpen = position => {
          const saddr = position && position.coords ? `&saddr=${position.coords.latitude},${position.coords.longitude}` : ''
          // dirflg driving did not work as expected, it has no id for that reason
          self.open(`https://www.google.com/maps?daddr=${this.lat},${this.lng}${saddr}${eventTarget.id ? `&dirflg=${eventTarget.id}` : eventTarget.parentElement && eventTarget.parentElement.id ? `&dirflg=${eventTarget.parentElement.id}` : ''}`, '_blank')
        }
        navigator.geolocation.getCurrentPosition(windowOpen, windowOpen)
      }
    }
  }

  connectedCallback() {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    if (this.transportIcons) {
      this.transportIcons.forEach(transportIcon => {
        transportIcon.addEventListener('click', this.googleMapTransport)
      })
    }
  }

  disconnectedCallback() {
    this.transportIcons.forEach(transportIcon => {
      transportIcon.removeEventListener('click', this.googleMapTransport)
    })
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML() {
    return !this.scripts.length
  }

  renderCSS() {
    this.css = /* css */` 
    :host {
       display:var(--display, block);
       position:var(--position, relative);
       width: var(--width, 100%) !important;
    }
    :host > #map {
      width: var(--map-width, 100%);
      height: var(--map-height, 75vh);
    }  
    :host > hr {
      display: none;
    }
    :host .control-events {
      background-color: #fff;
      box-shadow: 2px 2px 2px -2px #999;
      height: 81px;
      padding: 0 12px 0 0;
      position: absolute;
      right: 70px;
      top: 455px;
      width: 220px;
      z-index: 1;
    }
    :host .control-events > div {
      margin:6px 0 6px 6px;
    }
    :host iframe {
      border:var(--iframe-border, none);
      width:var(--iframe-width, 100%);
      height:var(--iframe-height, 75vh);
    }
    @media only screen and (max-width: _max-width_) {
      :host {
        display: flex !important;
        flex-direction: column;
      }
      :host > #map {
        height: var(--map-height-mobile, 25vh);
        order: 1;
        width: var(--map-width-mobile, 100%);
      }  
      :host > hr {
        display: block;
        order: 3;
        width: var(--hr-width, 200px);
      }
      :host .control-events{
        box-shadow: none;
        height: 70px;
        order: 2;
        padding: 15px 0 0 0;
        position: static;
        width: 100%;
      }
      :host .control-events > div {
        margin:0 0 6px var(--control-events-div-margin-left-mobile, 0);
      }
    }`

    const styles = [{
      // @ts-ignore
      path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
      namespaceFallback: true
    }]

    switch (this.getAttribute('namespace')) {
      case 'google-maps-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`,
          namespace: false
        }, ...styles], false)
    }

  }

  renderHTML() {
    let element = null 
    if (this.iframeUrl) {
      const iframe = document.createElement("iframe")
      iframe.src = this.iframeUrl
      iframe.name = 'map'
      element = iframe
    } else {
      const mapDiv = document.createElement('div')
      mapDiv.setAttribute('id', 'map')
      this.loadDependency().then(googleMap => {
        const map = this.createMap(googleMap, mapDiv, this.lat, this.lng)
        this.setMarker(googleMap, map, this.lat, this.lng)
      })
      element = mapDiv
    }
    this.html = element
  }

  /**
   * fetch dependency
   *
   * @returns {Promise<{components: any}>}
   */
  loadDependency() {
    // @ts-ignore
    self.initMap = () => { }

    return new Promise(resolve => {
      const googleMapScript = document.createElement('script')
      googleMapScript.setAttribute('type', 'text/javascript')
      googleMapScript.setAttribute('async', '')
      googleMapScript.setAttribute('src', this.MAP_URL)
      googleMapScript.onload = () => {
        // @ts-ignore
        if ('google' in self) resolve(self.google.maps)
      }
      this.html = googleMapScript
    })
  }

  createMap(googleMap, mapTarget, lat, lng) {
    return new googleMap.Map(mapTarget, {
      center: { lat, lng },
      zoom: 15,
      scrollwheel: false,
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

  setMarker(googleMap, map, lat, lng) {
    const marker = new googleMap.Marker({
      position: { lat, lng },
      icon: this.markerIcon
    })
    marker.setMap(map)
    marker.setAnimation(4)
  }

  get scripts() {
    return this.root.querySelectorAll('script')
  }

  get lat() {
    return Number(this.getAttribute('lat')) || this.DEFAULT_COORDINATES.lat
  }

  get lng() {
    return Number(this.getAttribute('lng')) || this.DEFAULT_COORDINATES.lng
  }

  get transportIcons() {
    const wrapper = this.root.querySelector('o-wrapper')
    if (!wrapper) return;
    return wrapper.root ? wrapper.root.querySelectorAll('a') : wrapper.querySelectorAll('a')
  }

  get apiKey() {
    return this.getAttribute('api-key') || ''
  }

  get markerIcon() {
    return this.getAttribute('marker-icon')
  }

  get iframeUrl() {
    return this.getAttribute('iframe-url') || '';
  }
}
