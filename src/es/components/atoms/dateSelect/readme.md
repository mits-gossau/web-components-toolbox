# DateSelect

**Path:** `../src/es/components/atoms/dateSelect/DateSelect.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| date-select-primary- | `./primary-/primary-.css` |
| date-select-secondary- | `./secondary-/secondary-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `request-event-name` |  |
| `answer-event-name` |  |
| `namespace` |  |
| `calendarIndicator` |  |
| `placeholder` |  |
| `locale` |  |
| `closeTooltip` |  |
| `min` |  |
| `max` |  |

## CSS Styles

### Selector: `:host`


### Selector: `:host .date-select`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color | transparent |
| border-radius | --border-radius | 0.5em |
| border | --border-width | 0px |
| color | --color | black |
| font-family | --font-family | unset |
| font-size | --font-size | 1em |
| font-weight | --font-weight | 400 |
| justify-content | --justify-content | center |
| letter-spacing | --letter-spacing | normal |
| line-height | --line-height | 1.5em |
| margin | --margin | auto |
| opacity | --opacity | 1 |
| outline | --outline | none |
| padding | --padding | calc(0.75em - var(--border-width |
| text-decoration | --text-decoration | none |
| text-transform | --text-transform | none |
| transition | --transition | background-color 0.3s ease-out |

### Selector: `:host .date-select:hover, :host(.hover) .date-select`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color-hover | var(--background-color |
| border | --border-width-hover | var(--border-width |
| color | --color-hover | var(--color |
| opacity | --opacity-hover | var(--opacity |

### Selector: `:host .date-select:active, :host .date-select.active`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color-active | var(--background-color-hover |
| color | --color-active | var(--color-hover |

### Selector: `:host .date-select[disabled]`

| Property | Variable | Default |
|----------|----------|----------|
| border | --border-width-disabled | var(--border-width |
| background-color | --background-color-disabled | var(--background-color |
| color | --color-disabled | var(--color |
| opacity | --opacity-disabled | var(--opacity |

### Selector: `:host .date-select[disabled] #date-placeholder`

| Property | Variable | Default |
|----------|----------|----------|
| opacity | --opacity-disabled | var(--opacity |

### Selector: `:host .date-select[disabled]:hover, :host(.hover) .date-select[disabled]`

| Property | Variable | Default |
|----------|----------|----------|
| opacity | --opacity-disabled-hover | var(--opacity-disabled |

### Selector: `:host .date-select::placeholder`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color | black |

### Selector: `:host .date-select[disabled]::placeholder`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color-disabled | var(--color |
| opacity | --opacity-disabled | var(--opacity |

### Selector: `:host .date-select::-webkit-calendar-picker-indicator`


### Selector: `:host select`


### Selector: `:host #close-icon`


### Selector: `@media only screen and (max-width: _max-width_)`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --margin-mobile | var(--margin |
| border-radius | --border-radius-mobile | var(--border-radius |

### Selector: `:host .date-select:hover, :host(.hover) .date-select`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color-hover-mobile | var(--background-color-hover |
| color | --color-hover-mobile | var(--color-hover |

### Selector: `:host .date-select:active, :host .date-select.active`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --background-color-active-mobile | var(--background-color-active |
| color | --color-active-mobile | var(--color-active |

