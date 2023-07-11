// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * DateInput
 * An example at: default-/default-.html
 *
 * @export
 * @class DateInput
 * @type {CustomElementConstructor}
 */

export default class DateInput extends Shadow() {
  static get observedAttributes () {
    return ['label', 'disabled']
  }

  constructor (options = {}, ...args) {
    super(
      { hoverInit: undefined, importMetaUrl: import.meta.url, ...options },
      ...args
    )

    this.inputEventListener = (event) => {
      console.log('changed');
      if (this.hasAttribute('disabled')) event.preventDefault()
      if (this.getAttribute('request-event-name')) {
        event.preventDefault()
        /*this.dateInput.classList.toggle('active')
        this.dateInput.setAttribute(
          'aria-pressed',
          String(this.dateInput.classList.contains('active'))
        )*/
        this.dispatchEvent(
          new CustomEvent(this.getAttribute('request-event-name'), {
            detail: this.getEventDetail(event),
            bubbles: true,
            cancelable: true,
            composed: true
          })
        )
      }
    }

    this.clickEventListener = event => {
      this.root.querySelector('input').showPicker()
    }

    this.answerEventListener = async (event) => {
      let tags = event.detail.tags
      if (this.getAttribute('active-detail-property-name')) {
        tags = await this.getAttribute('active-detail-property-name')
          .split(':')
          .reduce(async (accumulator, propertyName) => {
            // @ts-ignore
            propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) =>
              p1.toUpperCase()
            )
            if (accumulator instanceof Promise) accumulator = await accumulator
            return accumulator[propertyName]
          }, event.detail)
      }
      if (tags) {
        const tagsIncludesTag = this.hasAttribute('tag-search')
          ? tags.some((tag) => tag.includes(this.getAttribute('tag-search')))
          : tags.includes(this.getAttribute('tag'))
        //this.dateInput.classList[tagsIncludesTag ? 'add' : 'remove']('active')
      }
      /*
      this.dateInput.setAttribute(
        'aria-pressed',
        String(this.dateInput.classList.contains('active'))
      )
      */
    }
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) {
      this.renderCSS()
    }
    if (this.shouldRenderHTML()) {
      this.renderHTML()
    }
    this.addEventListener('input', this.inputEventListener)
    this.addEventListener('click', this.clickEventListener)
    if (this.getAttribute('answer-event-name')) {
      document.body.addEventListener(
        this.getAttribute('answer-event-name'),
        this.answerEventListener
      )
    }
  }

  disconnectedCallback () {
    this.removeEventListener('input', this.inputEventListener)
    this.removeEventListener('click', this.clickEventListener)
    if (this.getAttribute('answer-event-name')) {
      document.body.removeEventListener(
        this.getAttribute('answer-event-name'),
        this.answerEventListener
      )
    }
  }

  // @ts-ignore
  attributeChangedCallback () {
    /*
    if (this.dateInput) {
      this.hasAttribute('disabled')
          ? this.dateInput.setAttribute('disabled', '')
          : this.dateInput.removeAttribute('disabled')
      this.hasAttribute('aria-disabled')
          ? this.dateInput.setAttribute('aria-disabled', 'true')
          : this.dateInput.removeAttribute('aria-disabled')
    }
    */
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.root.querySelector('input')
  }

  renderCSS () {
    this.css = /* css */ `
        :host {
            cursor: unset !important;
            display: inline-block;
        }
        :host .date-input {
            align-items: center;
            background-color: var(--background-color, transparent);
            border-radius: var(--border-radius, 0.5em);
            border: var(--border-width, 0px) solid var(--border-color, transparent);
            color: var(--color, black);
            cursor: pointer;
            display: flex;
            font-family: var(--font-family, unset);
            font-size: var(--font-size, 1em);
            font-weight: var(--font-weight, 400);
            justify-content: var(--justify-content, center);
            letter-spacing: var(--letter-spacing, normal);
            line-height: var(--line-height, 1.5em);
            margin: var(--margin, auto);
            opacity: var(--opacity, 1);
            outline: var(--outline, none);
            overflow: hidden;
            padding: var(--padding, calc(0.75em - var(--border-width, 0px)) calc(1.5em - var(--border-width, 0px)));
            text-decoration: var(--text-decoration, none);
            text-transform: var(--text-transform, none);
            touch-action: manipulation;
            transition: var(--transition, background-color 0.3s ease-out, border-color 0.3s ease-out, color 0.3s ease-out);
            width: var(--width, auto);
            min-width: var(--min-width, 240px);
        }
        :host .date-input:hover, :host(.hover) .date-input {
            cursor: pointer;
            background-color: var(--background-color-hover, var(--background-color, #B24800));
            border: var(--border-width-hover, var(--border-width, 0px)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
            color: var(--color-hover, var(--color, #FFFFFF));
            opacity: var(--opacity-hover, var(--opacity, 1));
        }
        :host .date-input:active, :host .date-input.active {
            background-color: var(--background-color-active, var(--background-color-hover, var(--background-color, #803300)));
            color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
        }
        :host .date-input[disabled] {
            border: var(--border-width-disabled, var(--border-width, 0px)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
            background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
            color: var(--color-disabled, var(--color, #FFFFFF));
            cursor: not-allowed;
            opacity: var(--opacity-disabled, var(--opacity, 1));
            transition: opacity 0.3s ease-out;
        }
        :host .date-input[disabled]:hover, :host(.hover) .date-input[disabled]  {
            opacity: var(--opacity-disabled-hover, var(--opacity-disabled, var(--opacity, 1)));
        }
        :host .date-input::placeholder {
            color: var(--color, black);
        }
        :host .date-input[disabled]::placeholder {
            color: var(--color-disabled, var(--color, #FFFFFF));
            opacity: var(--opacity-disabled, var(--opacity, 0.5));
        }
        :host .date-input::-webkit-calendar-picker-indicator {
            opacity: 0;
        }
        @media only screen and (max-width: _max-width_) {
            :host .date-input {
                font-size: var(--font-size-mobile, var(--font-size, 1em));
                margin: var(--margin-mobile, var(--margin, auto));
                border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
            }
            :host .date-input:hover, :host(.hover) .date-input {
                background-color: var(--background-color-hover-mobile, var(--background-color-hover, var(--background-color, #B24800)));
                color: var(--color-hover-mobile, var(--color-hover, var(--color, #FFFFFF)));
            }
            :host .date-input:active, :host .date-input.active {
                background-color: var(--background-color-active-mobile, var(--background-color-active, var(--background-color-hover, var(--background-color, #803300))));
                color: var(--color-active-mobile, var(--color-active, var(--color-hover, var(--color, #FFFFFF))));
            }
        }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    switch (this.getAttribute('namespace')) {
      case 'date-input-primary-':
        return this.fetchCSS([
          {
            // @ts-ignore
            path: `${this.importMetaUrl}./primary-/primary-.css`,
            namespace: false
          }
        ])
      case 'date-input-secondary-':
        return this.fetchCSS([
          {
            // @ts-ignore
            path: `${this.importMetaUrl}./secondary-/secondary-.css`,
            namespace: false
          }
        ])
      default:
        return Promise.resolve()
    }
  }

  renderHTML () {
    //this.html = this.dateInput

    const calendarIndicator = this.hasAttribute('calendarIndicator')
      ? this.getAttribute('calendarIndicator')
      : ''
    const input = /* HTML */`
      <label for="date-picker">${new Date(Date.now()).toLocaleDateString('de-CH')}${calendarIndicator}</label>
      <input id="date-picker" name="date-picker" class="date-input" type="date" min="2024-08-20" max="2024-09-12" />
    `
    this.html = input
  }
/*
  get dateInput () {
    const dateInput = document.createElement('input')
    const calendarIndicator = this.hasAttribute('calendarIndicator')
      ? this.getAttribute('calendarIndicator')
      : ''

    dateInput.id = 'date-picker'
    dateInput.className = 'date-input'
    dateInput.name = dateInput.id
    dateInput.type = 'text'
    
    const showDatePicker = () => {
      if (dateInput.value) {
        const dateValue = dateInput.value.replace(calendarIndicator, '')
        const parts = dateValue.split('.')
        const formattedDate = `${parts[2]}-${parts[1].padStart(
          2,
          '0'
        )}-${parts[0].padStart(2, '0')}`
        dateInput.value = formattedDate
      }
      dateInput.type = 'date'
      dateInput.showPicker()
    }

    dateInput.onfocus = () => {
      showDatePicker();
    }

    dateInput.onblur = () => {
      dateInput.type = 'text'
    }

    dateInput.onchange = () => {
      if (dateInput.value) {
        const formattedDate = new Date(dateInput.value).toLocaleDateString('de-CH')
        dateInput.blur()
        dateInput.value = formattedDate + calendarIndicator
      }
      if (!dateInput.value) {
        dateInput.blur()
      }
    }

    if (this.hasAttribute('min')) {
      dateInput.setAttribute('min', this.getAttribute('min'))
    }

    if (this.hasAttribute('max')) {
      dateInput.setAttribute('max', this.getAttribute('max'))
    }

    if (this.hasAttribute('placeholder')) {
      dateInput.setAttribute(
        'placeholder',
        this.getAttribute('placeholder') + calendarIndicator
      )
    }

    if (this.hasAttribute('disabled')) {
        dateInput.setAttribute('disabled', this.getAttribute('disabled'))
    }
    return dateInput
  }
  */
}
