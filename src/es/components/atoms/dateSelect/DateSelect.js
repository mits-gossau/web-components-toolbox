// @ts-check
import { Shadow } from "../../prototypes/Shadow.js";

/**
 * DateSelect
 * An example at: default-/default-.html
 *
 * @export
 * @class DateSelect
 * @type {CustomElementConstructor}
 */

export default class DateSelect extends Shadow() {
  static get observedAttributes() {
    return ["label", "disabled"];
  }

  constructor(options = {}, ...args) {
    super(
      { hoverInit: undefined, importMetaUrl: import.meta.url, ...options },
      ...args
    );

    this.inputEventListener = (event) => {
      console.log("changed");
      if (this.hasAttribute("disabled")) event.preventDefault();
      if (this.getAttribute("request-event-name")) {
        event.preventDefault();
        /*this.dateInput.classList.toggle('active')
        this.dateInput.setAttribute(
          'aria-pressed',
          String(this.dateInput.classList.contains('active'))
        )*/
        this.dispatchEvent(
          new CustomEvent(this.getAttribute("request-event-name"), {
            detail: this.getEventDetail(event),
            bubbles: true,
            cancelable: true,
            composed: true,
          })
        );
      }
    };

    this.clickEventListener = (event) => {
      // this.root.querySelector('input').showPicker()
    };

    this.answerEventListener = async (event) => {
      let tags = event.detail.tags;
      if (this.getAttribute("active-detail-property-name")) {
        tags = await this.getAttribute("active-detail-property-name")
          .split(":")
          .reduce(async (accumulator, propertyName) => {
            // @ts-ignore
            propertyName = propertyName.replace(/-([a-z]{1})/g, (match, p1) =>
              p1.toUpperCase()
            );
            if (accumulator instanceof Promise) accumulator = await accumulator;
            return accumulator[propertyName];
          }, event.detail);
      }
      if (tags) {
        const tagsIncludesTag = this.hasAttribute("tag-search")
          ? tags.some((tag) => tag.includes(this.getAttribute("tag-search")))
          : tags.includes(this.getAttribute("tag"));
        //this.dateInput.classList[tagsIncludesTag ? 'add' : 'remove']('active')
      }
      /*
      this.dateInput.setAttribute(
        'aria-pressed',
        String(this.dateInput.classList.contains('active'))
      )
      */
    };
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.shouldRenderCSS()) {
      this.renderCSS();
    }
    if (this.shouldRenderHTML()) {
      this.renderHTML();
    }
    this.addEventListener("input", this.inputEventListener);
    this.addEventListener("click", this.clickEventListener);
    if (this.getAttribute("answer-event-name")) {
      document.body.addEventListener(
        this.getAttribute("answer-event-name"),
        this.answerEventListener
      );
    }
  }

  disconnectedCallback() {
    this.removeEventListener("input", this.inputEventListener);
    this.removeEventListener("click", this.clickEventListener);
    if (this.getAttribute("answer-event-name")) {
      document.body.removeEventListener(
        this.getAttribute("answer-event-name"),
        this.answerEventListener
      );
    }
  }

  // @ts-ignore
  attributeChangedCallback() {
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
  shouldRenderCSS() {
    return !this.root.querySelector("style[_css]");
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.root.querySelector("select");
  }

  renderCSS() {
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
    `;
    return this.fetchTemplate();
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate() {
    switch (this.getAttribute("namespace")) {
      case "date-select-primary-":
        return this.fetchCSS([
          {
            // @ts-ignore
            path: `${this.importMetaUrl}./primary-/primary-.css`,
            namespace: false,
          },
        ]);
      case "date-select-secondary-":
        return this.fetchCSS([
          {
            // @ts-ignore
            path: `${this.importMetaUrl}./secondary-/secondary-.css`,
            namespace: false,
          },
        ]);
      default:
        return Promise.resolve();
    }
  }

  renderHTML() {
    const dateMin = this.hasAttribute("min") ? new Date(this.getAttribute("min")) : new Date();
    const dateMax = this.hasAttribute("max") ? new Date(this.getAttribute("max")) : new Date();
    const calendarIndicator = this.hasAttribute("calendarIndicator")
      ? this.getAttribute("calendarIndicator")
      : "";
    const placeholder = this.hasAttribute("placeholder")
      ? this.getAttribute("placeholder")
      : "";

    const yearMin = dateMin.getFullYear();
    const yearMax = dateMax.getFullYear();
    console.log(yearMin, yearMax)

    const monthMin = String(dateMin.getMonth() + 1).padStart(2, '0');
    const monthMax = String(dateMax.getMonth() + 1).padStart(2, '0');
    console.log(monthMin, monthMax)

    const dayMin = String(dateMin.getDate()).padStart(2, '0');
    const dayMax = String(dateMax.getDate()).padStart(2, '0');
    console.log(dayMin, dayMax)

    const dateSelectPicker = document.createElement("label");
    dateSelectPicker.setAttribute("for", "monthSelect");
    dateSelectPicker.setAttribute("id", "dateSelectPicker");
    dateSelectPicker.setAttribute("class", "date-select");




// Function to generate the options for a select element
function generateOptions(selectElement, options) {
  console.log({selectElement})
  console.log({options})
  options.forEach((option) => {
    const { value, text, disabled } = option;
    const optionElement = document.createElement('option');
    optionElement.value = value;
    optionElement.textContent = text;
    if (disabled) {
      optionElement.disabled = true;
      optionElement.selected = true;
    }
    if (selectElement) {
      selectElement.appendChild(optionElement);
    }
  });
  console.log({selectElement})
}

// Get the minimum and maximum dates
const minDate = dateMin;
const maxDate = dateMax;

// Get the minimum and maximum years
const minYear = minDate.getFullYear();
const maxYear = maxDate.getFullYear();

// Generate options for year select element
// const yearSelect = document.getElementById('yearSelect');
const yearSelect = document.createElement('select');
yearSelect.setAttribute("id", "yearSelect");
const yearOptions = [];
for (let year = minYear; year <= maxYear; year++) {
  yearOptions.push({
    value: year,
    text: year,
    disabled: year === minYear || year === maxYear
  });
}
generateOptions(yearSelect, yearOptions);

// Function to generate options for month select element
function generateMonthOptions() {
  const monthSelect = document.createElement('select');
  monthSelect.setAttribute("id", "monthSelect");
  const selectedYear = parseInt(yearSelect.value);
  console.log({selectedYear});

  // Get the minimum and maximum months based on the selected year
  console.log({minDate})
  console.log({maxDate})
  let minMonth = 1;
  let maxMonth = 12;
  if (selectedYear === minYear) {
    minMonth = minDate.getMonth();
  } else if (selectedYear === maxYear) {
    maxMonth = maxDate.getMonth();
  }
  console.log({minMonth})
  console.log({maxMonth})

  // Generate options for month select element
  const monthOptions = [];
  for (let month = minMonth; month <= maxMonth; month++) {
    const monthName = new Date(selectedYear, month).toLocaleString('default', { month: 'long' });
    monthOptions.push({
      value: month,
      text: monthName,
      disabled: month === minMonth || month === maxMonth
    });
  }
  generateOptions(monthSelect, monthOptions);
}

const monthSelect = document.createElement('select');
monthSelect.setAttribute("id", "monthSelect");
// generateMonthOptions();

// Generate options for day select element
function generateDayOptions() {
  const daySelect = document.getElementById('daySelect');
  const selectedYear = parseInt(yearSelect.value);
  const selectedMonth = parseInt(monthSelect.value);

  // Get the minimum and maximum days based on the selected year and month
  let minDay = 1;
  let maxDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  if (selectedYear === minYear && selectedMonth === minDate.getMonth()) {
    minDay = minDate.getDate();
  } else if (selectedYear === maxYear && selectedMonth === maxDate.getMonth()) {
    maxDay = maxDate.getDate();
  }

  // Generate options for day select element
  const dayOptions = [];
  for (let day = minDay; day <= maxDay; day++) {
    dayOptions.push({
      value: day,
      text: day,
      disabled: day === minDay || day === maxDay
    });
  }
  generateOptions(daySelect, dayOptions);
}

const daySelect = document.createElement('select');
daySelect.setAttribute("id", "daySelect");
// generateDayOptions();

// Add event listeners to year and month select elements
yearSelect.addEventListener('change', generateMonthOptions);
monthSelect.addEventListener('change', generateDayOptions);

// Generate initial options for month and day select elements
generateMonthOptions();
generateDayOptions();

dateSelectPicker.append(daySelect);
dateSelectPicker.append(monthSelect);
dateSelectPicker.append(yearSelect);



    // function getPossibleMonthsAndDays(minDate, maxDate) {
    //   const possibleMonthsAndDays = [];
    
    //   const startDate = new Date(minDate);
    //   const endDate = new Date(maxDate);
    
    //   let currentDate = startDate;
    
    //   while (currentDate <= endDate) {
    //     const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    //     const currentDay = currentDate.getDate();
    
    //     possibleMonthsAndDays.push({ month: currentMonth, day: currentDay });
    
    //     currentDate.setDate(currentDate.getDate() + 1);
    //   }
    
    //   return possibleMonthsAndDays;
    // }

    // const monthsAndDays = getPossibleMonthsAndDays(dateMin, dateMax);
    // console.log(JSON.stringify(monthsAndDays));

    // const uniqueMonths = new Set();
    // const uniqueDays = new Set();

    // monthsAndDays.forEach((item) => {
    //   const { month, day } = item;
    //   uniqueMonths.add(month);
    //   uniqueDays.add(day);
    // });

    // const sortedMonths = Array.from(uniqueMonths);
    // const sortedDays = Array.from(uniqueDays);

    // console.log(sortedMonths);
    // console.log(sortedDays);

    // if (sortedDays.length) {
    //   const selectElement = document.createElement("select");
    //   selectElement.setAttribute("id", "daySelect");
    //   selectElement.setAttribute("class", "select-date");
    //   for (let i = 0; i < sortedDays.length; i++) {
    //     const day = sortedDays[i];
    //     const dayOption = document.createElement("option");
    //     dayOption.value = day;
    //     dayOption.textContent = day;
    //     selectElement.append(dayOption);
    //   }
    //   dateSelectPicker.append(selectElement);
    // }

    // if (sortedMonths.length) {
    //   const selectElement = document.createElement("select");
    //   selectElement.setAttribute("id", "monthSelect");
    //   selectElement.setAttribute("class", "select-date");
    //   for (let i = 0; i < sortedMonths.length; i++) {
    //     const month = sortedMonths[i];
    //     const monthOption = document.createElement("option");
    //     monthOption.value = month;
    //     monthOption.textContent = month;
    //     selectElement.append(monthOption);
    //   }
    //   dateSelectPicker.append(selectElement);
    // }

    // if (yearMin && yearMax) {
    //   const selectElement = document.createElement("select");
    //   selectElement.setAttribute("id", "yearSelect");
    //   selectElement.setAttribute("class", "select-date");
    //   if (yearMin === yearMax){
    //     selectElement.setAttribute("disabled", "");
    //   } 
    //   for (let value = yearMin; value <= yearMax; value++) {
    //     const option = document.createElement("option");
    //     option.value = String(value).padStart(2, '0');
    //     option.textContent = String(value).padStart(2, '0');
    //     selectElement.append(option);
    //   }
    //   dateSelectPicker.append(selectElement);
    // }

  
    this.html = dateSelectPicker;
  }
}
