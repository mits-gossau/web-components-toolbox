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
    const minDate = this.hasAttribute("min")
      ? new Date(this.getAttribute("min"))
      : new Date();
    const maxDate = this.hasAttribute("max")
      ? new Date(this.getAttribute("max"))
      : new Date();
    const minYear = minDate.getFullYear();
    const maxYear = maxDate.getFullYear();
    const calendarIndicator = this.hasAttribute("calendarIndicator")
      ? this.getAttribute("calendarIndicator")
      : "";
    const placeholder = this.hasAttribute("placeholder")
      ? this.getAttribute("placeholder")
      : "";

    const dateSelectPicker = document.createElement("label");
    dateSelectPicker.setAttribute("for", "monthSelect");
    dateSelectPicker.setAttribute("id", "dateSelectPicker");
    dateSelectPicker.setAttribute("class", "date-select");

    // Function to remove all options for a select element
    function removeOptions(selectElement) {
      for (let i = selectElement.options.length - 1; i >= 0; i--) {
        selectElement.remove(i);
      }
    }

    // Function to generate the options for a select element
    function generateOptions(selectElement, options) {
      removeOptions(selectElement);

      options.forEach((option) => {
        const { value, text, disabled } = option;
        const optionElement = document.createElement("option");
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
    }

    // Generate options for year select element
    const yearSelect = document.createElement("select");
    yearSelect.setAttribute("id", "yearSelect");
    const yearOptions = [];
    for (let year = minYear; year <= maxYear; year++) {
      yearOptions.push({
        value: year,
        text: year,
        disabled: minYear === maxYear,
      });
    }
    generateOptions(yearSelect, yearOptions);

    const monthSelect = document.createElement("select");
    monthSelect.setAttribute("id", "monthSelect");

    // Function to generate options for month select element
    function generateMonthOptions() {
      const selectedYear = parseInt(yearSelect.value);
      let minMonth = 0;
      let maxMonth = 11;
      console.log(selectedYear, minMonth, maxMonth);
      if (selectedYear === minYear) {
        minMonth = minDate.getMonth();
      }
      if (selectedYear === maxYear) {
        maxMonth = maxDate.getMonth();
      }
      console.log(minMonth, maxMonth);

      // Generate options for month select element
      const monthOptions = [];
      for (let month = minMonth; month <= maxMonth; month++) {
        const monthName = new Date(selectedYear, month).toLocaleString(
          "default",
          { month: "long" }
        );
        monthOptions.push({
          value: month,
          text: monthName,
        });
      }
      generateOptions(monthSelect, monthOptions);
    }

    // Generate options for day select element
    const daySelect = document.createElement("select");
    daySelect.setAttribute("id", "daySelect");

    function generateDayOptions() {
      // Get the minimum and maximum days based on the selected year and month
      const selectedYear = parseInt(yearSelect.value);
      const selectedMonth = parseInt(monthSelect.value);
      let minDay = 1;
      let maxDay = new Date(selectedYear, selectedMonth + 1, 0).getDate();

      if (selectedYear === minYear && selectedMonth === minDate.getMonth()) {
        minDay = minDate.getDate();
      } else if (
        selectedYear === maxYear &&
        selectedMonth === maxDate.getMonth()
      ) {
        maxDay = maxDate.getDate();
      }

      // Generate options for day select element
      const dayOptions = [];
      for (let day = minDay; day <= maxDay; day++) {
        dayOptions.push({
          value: day,
          text: day,
        });
      }
      generateOptions(daySelect, dayOptions);
    }

    // Add event listeners to year and month select elements
    yearSelect.addEventListener("change", () => {
      generateMonthOptions();
      generateDayOptions();
    });
    monthSelect.addEventListener("change", generateDayOptions);

    // Generate initial options for month and day select elements
    generateMonthOptions();
    generateDayOptions();

    dateSelectPicker.append(daySelect);
    dateSelectPicker.append(monthSelect);
    dateSelectPicker.append(yearSelect);

    this.html = dateSelectPicker;
  }
}
