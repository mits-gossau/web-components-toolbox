# SystemNotification

**Path:** `../src/es/components/molecules/systemNotification/SystemNotification.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `icon-badge` |  |
| `icon-src` |  |
| `title` |  |
| `type` |  |

## CSS Styles

### Selector: `:host`


### Selector: `:host .system-notification`

| Property | Variable | Default |
|----------|----------|----------|
| flex-direction | --system-notification-flex-direction | column |
| margin | --system-notification-margin | 0 0 var(--margin-bottom |

### Selector: `:host .icon`


### Selector: `:host .icon img,
        :host svg`

| Property | Variable | Default |
|----------|----------|----------|
| max-height | --icon-max-height | var(--icon-default-width |
| max-width | --icon-max-width | var(--icon-default-width |
| height | --icon-height | auto |
| width | --icon-default-width |  |

### Selector: `:host .icon .icon-badge`

| Property | Variable | Default |
|----------|----------|----------|
| top | --icon-badge-top | -7px |
| right | --icon-badge-right | -16px |
| height | --icon-badge-height | 1.5rem |
| width | --icon-badge-width | 1.5rem |
| border-radius | --icon-badge-border-radius | 50% |
| background-color | --icon-badge-background-color | var(--m-red-600 |
| color | --icon-badge-color | var(--m-white |
| font-size | --icon-badge-font-size | 0.75rem |

### Selector: `:host .title h3`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --margin-bottom | 1rem |
| font-size | --font-size-h3 | 1.25rem |
| color | --color | var(--m-gray-900 |

### Selector: `:host .system-notification .description`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --system-default-background-color | var(--m-gray-100 |
| border-radius | --border-radius | 0.5rem |
| padding | --padding | 0.5rem 1rem |

### Selector: `:host .system-info .description`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --system-info-background-color | var(--m-blue-100 |
| color | --system-info-color | var(--m-blue-800 |

### Selector: `:host .system-error .description`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --system-error-background-color | var(--m-orange-100 |
| color | --system-error-color | var(--m-red-600 |

### Selector: `:host .system-success .description`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --system-success-background-color | var(--m-green-100 |
| color | --system-success-color | var(--m-green-800 |

