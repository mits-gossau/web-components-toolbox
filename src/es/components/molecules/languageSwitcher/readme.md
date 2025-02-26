# LanguageSwitcher

**Path:** `../src/es/components/molecules/languageSwitcher/LanguageSwitcher.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| language-switcher-default- | `./default-/default-.css` |
| language-switcher-delica- | `./delica-/delica-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `namespace` |  |

## CSS Styles

### Selector: `:host`

| Property | Variable | Default |
|----------|----------|----------|
| grid-area | --grid-area | "login" |
| margin | --margin | calc(var(--content-spacing |
| /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
      width | --width | var(--content-width |

### Selector: `:host > ul`

| Property | Variable | Default |
|----------|----------|----------|
| justify-content | --justify-content | end |
| gap | --content-spacing | 1em |

### Selector: `@media only screen and (max-width: _max-width_)`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --content-spacing-mobile | var(--content-spacing |
| /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width | --content-width-mobile | calc(100% - var(--content-spacing-mobile |

### Selector: `:host .font-size-tiny`

| Property | Variable | Default |
|----------|----------|----------|
| font-size | --p-font-size-mobile | var(--p-font-size |
| line-height | --line-height-mobile | var(--line-height |

### Selector: `:host > div div[open]`


