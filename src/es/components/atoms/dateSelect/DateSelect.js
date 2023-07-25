// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * DateSelect
 * An example at: default-/default-.html
 *
 * @export
 * @class DateSelect
 * @type {CustomElementConstructor}
 */

export default class DateSelect extends Shadow() {
  static get observedAttributes () {
    return ['label', 'disabled']
  }

  constructor (options = {}, ...args) {
    super(
      { hoverInit: undefined, importMetaUrl: import.meta.url, ...options },
      ...args
    )

    this.changeEventListener = (event) => {
      if (this.hasAttribute('disabled')) {
        event.preventDefault()
        return
      }
      if (this.getAttribute('request-event-name')) {
        const day = this.root.querySelector('#day-select').value.padStart(2, '0')
        const month = (parseInt(this.root.querySelector('#month-select').value) + 1).toString().padStart(2, '0')
        const year = this.root.querySelector('#year-select').value
        const date = `${day}.${month}.${year}`

        this.dispatchEvent(
          new CustomEvent(this.getAttribute('request-event-name'), {
            detail: {
              day,
              month,
              year,
              date
            },
            bubbles: true,
            cancelable: true,
            composed: true
          })
        )
      }
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
        // this.dateSelect.classList[tagsIncludesTag ? 'add' : 'remove']('active')
      }
      /*
      this.dateSelect.setAttribute(
        'aria-pressed',
        String(this.dateSelect.classList.contains('active'))
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
    if (this.getAttribute('answer-event-name')) {
      document.body.addEventListener(
        this.getAttribute('answer-event-name'),
        this.answerEventListener
      )
    }
  }

  disconnectedCallback () {
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
    if (this.dateSelect) {
      this.hasAttribute('disabled')
          ? this.dateSelect.setAttribute('disabled', '')
          : this.dateSelect.removeAttribute('disabled')
      this.hasAttribute('aria-disabled')
          ? this.dateSelect.setAttribute('aria-disabled', 'true')
          : this.dateSelect.removeAttribute('aria-disabled')
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
    return !this.root.querySelector('select')
  }

  renderCSS () {
    this.css = /* css */ `
        :host {
            cursor: unset !important;
            display: inline-block;
        }
        :host .date-select {
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
        :host .date-select:hover, :host(.hover) .date-select {
            cursor: pointer;
            background-color: var(--background-color-hover, var(--background-color, #B24800));
            border: var(--border-width-hover, var(--border-width, 0px)) solid var(--border-color-hover, var(--border-color, #FFFFFF));
            color: var(--color-hover, var(--color, #FFFFFF));
            opacity: var(--opacity-hover, var(--opacity, 1));
        }
        :host .date-select:active, :host .date-select.active {
            background-color: var(--background-color-active, var(--background-color-hover, var(--background-color, #803300)));
            color: var(--color-active, var(--color-hover, var(--color, #FFFFFF)));
        }
        :host .date-select[disabled] {
            border: var(--border-width-disabled, var(--border-width, 0px)) solid var(--border-color-disabled, var(--border-color, #FFFFFF));
            background-color: var(--background-color-disabled, var(--background-color, #FFDAC2));
            color: var(--color-disabled, var(--color, #FFFFFF));
            cursor: not-allowed;
            opacity: var(--opacity-disabled, var(--opacity, 1));
            transition: opacity 0.3s ease-out;
        }
        :host .date-select[disabled] #datePlaceholder {
          opacity: var(--opacity-disabled, var(--opacity, 0.7));
        }
        :host .date-select[disabled]:hover, :host(.hover) .date-select[disabled]  {
            opacity: var(--opacity-disabled-hover, var(--opacity-disabled, var(--opacity, 1)));
        }
        :host .date-select::placeholder {
            color: var(--color, black);
        }
        :host .date-select[disabled]::placeholder {
            color: var(--color-disabled, var(--color, #FFFFFF));
            opacity: var(--opacity-disabled, var(--opacity, 0.5));
        }
        :host .date-select::-webkit-calendar-picker-indicator {
            opacity: 0;
        }
        :host select {
          padding: 3px;
        }
        :host #close-icon {
          display: inline-block;
          height: 25px;
          width: 25px;
          text-align: center;
        }
        @media only screen and (max-width: _max-width_) {
            :host .date-select {
                font-size: var(--font-size-mobile, var(--font-size, 1em));
                margin: var(--margin-mobile, var(--margin, auto));
                border-radius: var(--border-radius-mobile, var(--border-radius, 0.571em));
            }
            :host .date-select:hover, :host(.hover) .date-select {
                background-color: var(--background-color-hover-mobile, var(--background-color-hover, var(--background-color, #B24800)));
                color: var(--color-hover-mobile, var(--color-hover, var(--color, #FFFFFF)));
            }
            :host .date-select:active, :host .date-select.active {
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
      case 'date-select-primary-':
        return this.fetchCSS([
          {
            // @ts-ignore
            path: `${this.importMetaUrl}./primary-/primary-.css`,
            namespace: false
          }
        ])
      case 'date-select-secondary-':
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
    const minDate = new Date(this.getAttribute('min')) || new Date()
    const maxDate = new Date(this.getAttribute('max')) || new Date()
    const minYear = minDate.getFullYear()
    const maxYear = maxDate.getFullYear()
    const calendarIndicator = this.getAttribute('calendarIndicator') || ''
    const placeholder = this.getAttribute('placeholder') || ''
    const locale = this.getAttribute('locale') || 'default'
    const disabled = this.hasAttribute('disabled')
    const required = this.hasAttribute('required')
    const closeTooltip = this.getAttribute('closeTooltip') || ''

    const dateSelectPicker = document.createElement('label')
    dateSelectPicker.addEventListener('change', this.changeEventListener)
    dateSelectPicker.setAttribute('for', minYear !== maxYear ? 'year-select' : 'month-select')
    dateSelectPicker.setAttribute('id', 'dateSelectPicker')
    dateSelectPicker.setAttribute('class', 'date-select')
    if (disabled) {
      dateSelectPicker.setAttribute('disabled', '')
      dateSelectPicker.removeEventListener('change', this.changeEventListener)
    }

    const dateSelectPlaceholder = document.createElement('span')
    dateSelectPlaceholder.setAttribute('id', 'datePlaceholder')
    dateSelectPlaceholder.append(placeholder + ' ' + calendarIndicator)
    dateSelectPicker.append(dateSelectPlaceholder)

    const dateSelectWrapper = document.createElement('div')
    dateSelectWrapper.setAttribute('id', 'dateSelectWrapper')

    function generateOptions (selectElement, options) {
      selectElement.innerHTML = ''

      options.forEach((option) => {
        const { value, text, disabled } = option
        const optionElement = document.createElement('option')
        optionElement.value = value
        optionElement.textContent = text
        if (disabled) {
          optionElement.disabled = true
          optionElement.selected = true
        }
        selectElement.appendChild(optionElement)
      })
    }

    const yearSelect = document.createElement('select')
    yearSelect.setAttribute('id', 'year-select')
    yearSelect.setAttribute('name', 'year-select')
    if (minYear !== maxYear && required) {
      yearSelect.setAttribute('required', '')
    }

    const yearOptions = []
    for (let year = minYear; year <= maxYear; year++) {
      yearOptions.push({
        value: year,
        text: year,
        disabled: minYear === maxYear
      })
    }
    generateOptions(yearSelect, yearOptions)

    const monthSelect = document.createElement('select')
    monthSelect.setAttribute('id', 'month-select')
    monthSelect.setAttribute('name', 'month-select')
    if (minYear === maxYear && required) {
      monthSelect.setAttribute('required', '')
    }

    function generateMonthOptions () {
      const selectedYear = parseInt(yearSelect.value)
      let minMonth = 0
      let maxMonth = 11

      if (selectedYear === minYear) {
        minMonth = minDate.getMonth()
      }
      if (selectedYear === maxYear) {
        maxMonth = maxDate.getMonth()
      }

      const monthOptions = []
      for (let month = minMonth; month <= maxMonth; month++) {
        const monthName = new Date(selectedYear, month).toLocaleString(locale, {
          month: 'long'
        })
        monthOptions.push({
          value: month,
          text: monthName
        })
      }
      generateOptions(monthSelect, monthOptions)
    }

    const daySelect = document.createElement('select')
    daySelect.setAttribute('id', 'day-select')
    daySelect.setAttribute('name', 'day-select')

    function generateDayOptions () {
      const selectedYear = parseInt(yearSelect.value)
      const selectedMonth = parseInt(monthSelect.value)
      let minDay = 1
      let maxDay = new Date(selectedYear, selectedMonth + 1, 0).getDate()

      if (selectedYear === minYear && selectedMonth === minDate.getMonth()) {
        minDay = minDate.getDate()
      } else if (
        selectedYear === maxYear &&
        selectedMonth === maxDate.getMonth()
      ) {
        maxDay = maxDate.getDate()
      }

      const dayOptions = []
      for (let day = minDay; day <= maxDay; day++) {
        dayOptions.push({
          value: day,
          text: day
        })
      }
      generateOptions(daySelect, dayOptions)
    }

    yearSelect.addEventListener('change', () => {
      generateMonthOptions()
      generateDayOptions()
    })
    monthSelect.addEventListener('change', generateDayOptions)

    generateMonthOptions()
    generateDayOptions()

    dateSelectWrapper.append(daySelect)
    dateSelectWrapper.append(monthSelect)
    dateSelectWrapper.append(yearSelect)

    const closeIcon = document.createElement('span')
    closeIcon.setAttribute('id', 'close-icon')
    if (closeTooltip) {
      closeIcon.setAttribute('title', closeTooltip)
    }
    closeIcon.innerHTML = '&#x2715;'
    dateSelectWrapper.append(closeIcon)

    if (!disabled) {
      dateSelectPicker.addEventListener('click', (event) => {
        event.stopPropagation()
        event.preventDefault()

        if (dateSelectPicker.children[0] === dateSelectPlaceholder) {
          dateSelectPicker.removeChild(dateSelectPlaceholder)
          dateSelectPicker.appendChild(dateSelectWrapper)
          minYear !== maxYear ? yearSelect.focus() : monthSelect.focus()
        }
      })

      closeIcon.addEventListener('click', (event) => {
        event.stopPropagation()
        event.preventDefault()

        if (dateSelectPicker.children[0] === dateSelectWrapper) {
          dateSelectPicker.removeEventListener(
            'change',
            this.changeEventListener
          )
          dateSelectPicker.removeChild(dateSelectWrapper)
          dateSelectPicker.appendChild(dateSelectPlaceholder)
        }
      })
    }

    this.html = dateSelectPicker
  }
}
