# MultiLevelNavigation

**Path:** `../src/es/components/molecules/multiLevelNavigation/MultiLevelNavigation.js`

## Summary

Multi-level navigation component with WCAG 2.2 AA compliance. Supports desktop flyout and mobile slide-in navigation patterns with full keyboard accessibility and automatic internationalization (de-CH, fr-CH, it-CH).

## Integration

The component automatically generates invisible headings (h2, h3, h4…) for screen reader navigation and localizes all ARIA labels based on `document.documentElement.lang`.

### Basic Usage

```html
<m-multi-level-navigation>
  <!-- Navigation content -->
</m-multi-level-navigation>
```

### Multilingual Support

Labels werden automatisch anhand von `<html lang="...">` gesetzt. Unterstützt werden `de-CH`, `fr-CH` und `it-CH` (Deutsch ist Default-Fallback).

Die Attribute überschreiben die automatischen Texte bei Bedarf:

```html
<!-- Automatisch: alle Labels werden aus document.documentElement.lang abgeleitet -->
<m-multi-level-navigation>
  <!-- bei lang="de-CH" → "Hauptnavigation", "Unternavigation", etc. -->
  <!-- bei lang="fr-CH" → "Navigation principale", "Sous-navigation", etc. -->
  <!-- bei lang="it-CH" → "Navigazione principale", "Sottonavigazione", etc. -->
</m-multi-level-navigation>

<!-- Manuell: Attribute überschreiben die automatischen Texte -->
<m-multi-level-navigation 
  main-nav-title="Hauptnavigation"
  sub-nav-title="Unternavigation"
  sub-nav-suffix="- Unterbereich"
  mobile-nav-title="Mobile Navigation"
  level-text="Ebene">
</m-multi-level-navigation>
```

#### Automatische Übersetzungen

| Key | de-CH | fr-CH | it-CH |
|-----|-------|-------|-------|
| Hauptnavigation | Hauptnavigation | Navigation principale | Navigazione principale |
| Navigation schliessen | Navigation schliessen | Fermer la navigation | Chiudere la navigazione |
| aufklappen | aufklappen | développer | espandi |
| zuklappen | zuklappen | réduire | comprimi |
| Unternavigation | Unternavigation | Sous-navigation | Sottonavigazione |
| Level | Level | Niveau | Livello |
| Navigationsbereich | Navigationsbereich | Zone de navigation | Area di navigazione |

## Accessibility (WCAG 2.2 AA)

### Heading-Hierarchie

Die Komponente generiert unsichtbare Headings (`.visually-hidden`) für Screenreader:

- **h2**: Hauptnavigation
- **h3**: Unternavigation Level 1 (z. B. „Produkte - Unternavigation")
- **h4**: Unternavigation Level 2
- **h5**: Unternavigation Level 3

> `h1` ist dem Seiteninhalt vorbehalten und wird bewusst nicht verwendet.

### Keyboard-Navigation

| Taste | Verhalten |
|-------|-----------|
| **Tab** | Springt zum nächsten fokussierbaren Element |
| **Shift+Tab** | Springt zum vorherigen fokussierbaren Element |
| **Enter / Space** | Öffnet/schliesst Untermenü bei expandierbaren Items (ohne das erste Item zu aktivieren) |
| **Arrow Down** | Nächstes Item in der Liste; vom Hauptmenü ins geöffnete Flyout |
| **Arrow Up** | Vorheriges Item in der Liste; vom ersten Item zurück zum Hauptmenü-Link |
| **Arrow Right** | Nächster Hauptmenü-Punkt (Desktop); öffnet Untermenü (Mobile) |
| **Arrow Left** | Vorheriger Hauptmenü-Punkt (Desktop); Zurück-Navigation (Mobile) |
| **Escape** | Schliesst das aktuelle Flyout/Untermenü und setzt Fokus zurück auf den auslösenden Menüpunkt |

### ARIA-Attribute

- **`aria-expanded`**: Wird dynamisch bei jedem Öffnen/Schliessen aktualisiert
- **`aria-haspopup="true"`**: Auf allen expandierbaren Links gesetzt
- **`aria-controls`**: Verknüpft expandierbare Items mit ihren Untermenüs
- **`aria-current="page"`**: Automatische Erkennung der aktuellen Seite anhand der URL
- **`aria-label`**: Dynamisch aktualisiert bei Zustandswechsel (z. B. „Produkte - aufklappen" → „Produkte - zuklappen")
- **`aria-labelledby`**: `<nav>` referenziert das Hauptnavigation-Heading statt redundantem `aria-label`

### Close-Button

Der Flyout-Schliessen-Button ist als `<button type="button">` implementiert (nicht `<a>`):
- Natives Enter/Space-Handling durch `<button>`
- `aria-label` lokalisiert (z. B. „Navigation schliessen")
- Icon mit `aria-hidden="true"` (dekorativ)
- Fokus wird nach dem Schliessen auf den auslösenden Hauptmenü-Link zurückgesetzt

### Bilder

- Dekorative Bilder: `alt=""` + `aria-hidden="true"`
- Informative Bilder: `alt`-Text wird automatisch aus dem übergeordneten Link-Text abgeleitet
- Dekorative Icons (Chevrons, Arrows): `aria-hidden="true"`

### Erfüllte WCAG-Kriterien

| Kriterium | Beschreibung |
|-----------|-------------|
| **1.1.1** Non-text Content | Alt-Texte für Bilder, aria-hidden für dekorative Elemente |
| **1.3.1** Info and Relationships | Hierarchische Heading-Struktur (h2–h5) |
| **2.1.1** Keyboard | Vollständige Tastaturbedienung inkl. Enter/Space-Guard |
| **2.4.3** Focus Order | Fokus-Management bei Öffnen/Schliessen von Flyouts |
| **2.4.6** Headings and Labels | Beschreibende Headings und lokalisierte Labels |
| **4.1.2** Name, Role, Value | Korrekte ARIA-Rollen, kein `role="banner"` auf Wrapper |

## Attributes

| Attribute | Description | Default |
|-----------|-------------|---------|
| `hover` | Hover-Modus aktivieren | `false` |
| `use-hover-listener` | Hover-Listener statt Click-Listener verwenden | `false` |
| `animation-duration` | Animationsdauer in Millisekunden | `300` |
| `no-scroll` | Verhindert Body-Scroll bei geöffneter Navigation | – |
| `o-nav-wrapper` | Custom-Element-Name für Navigation-Wrapper | `o-nav-wrapper` |
| `navigation-load` | Event-Name bei Navigation-Load | `navigation-load` |
| `close-event-name` | Event-Name zum Schliessen der Navigation | – |
| `close-other-flyout` | Event-Name zum Schliessen anderer Flyouts | – |
| `click-anchor` | Event-Name für Anchor-Link-Klicks | `click-anchor` |
| `load-custom-elements` | Event-Name für Custom-Element-Loading | `load-custom-elements` |
| `namespace` | CSS-Namespace für Styling-Varianten | – |
| `media` | Media-Query-Breakpoint (desktop/mobile) | – |
| `navigation-hover-delay` | Hover-Delay in Millisekunden | `100` |
| `main-nav-title` | Hauptnavigation-Heading (Screenreader) | automatisch lokalisiert |
| `sub-nav-title` | Unternavigation-Basistext | automatisch lokalisiert |
| `sub-nav-suffix` | Suffix für Unternavigation-Titel | automatisch lokalisiert |
| `mobile-nav-title` | Mobile-Navigation-Basistext | Fallback auf `sub-nav-title` |
| `level-text` | Text für Level-Nummerierung | automatisch lokalisiert |

## CSS Custom Properties

### Main Navigation

| Selector | Property | Variable | Default |
|----------|----------|----------|---------|
| `:host > nav > ul` | align-items | `--main-ul-align-items` | `normal` |
| | justify-content | `--main-ul-justify-content` | `normal` |
| | display | `--main-ul-display` | `flex` |
| | flex-wrap | `--flex-wrap` | `nowrap` |
| | flex-direction | `--flex-direction` | `row` |
| | padding | `--padding` | `0` |
| | margin | `--margin` | `0` |
| `:host > nav > ul > li` | padding | `--li-padding` | `0` |
| `:host > nav > ul > li > a` | display | `--a-main-display` | `inline` |
| | color | `--color` | – |
| | padding | `--a-main-content-spacing` | `14px 10px` |
| | font-size | `--a-main-font-size` | `1rem` |
| | font-weight | `--a-main-font-weight` | `400` |
| | line-height | `--a-main-line-height` | – |
| | text-transform | `--a-main-text-transform` | – |
| | font-family | `--a-main-font-family` | `var(--font-family)` |
| | text-align | `--a-text-align` | `left` |
| | width | `--a-width` | `auto` |

### Flyout / Desktop Sub-Navigation

| Selector | Property | Variable | Default |
|----------|----------|----------|---------|
| `o-nav-wrapper` | top | `--o-nav-wrapper-top` | `2em` |
| | border-top | `--desktop-main-wrapper-border-width` | `1px` |
| `wrapper-background` | background-color | `--desktop-main-wrapper-background-color` | `white` |
| | width | `--desktop-main-wrapper-width` | `100vw` |
| | height | `--desktop-main-wrapper-height` | `100%` / `50vh` / `60vh` |
| `section` | padding | `--multi-level-navigation-default-o-nav-wrapper-padding` | `2em 0 1.5em 0` |
| Sub-Navigation div | background-color | `--sub-navigation-wrapper-background-color` | `white` |

### State Colors

| Property | Variable | Description |
|----------|----------|-------------|
| color | `--color` | Default text color |
| color | `--color-hover` | Hover text color |
| color | `--color-active` | Active/current text color |

### Mobile

| Selector | Property | Variable | Default |
|----------|----------|----------|---------|
| `:host > nav > ul > li > a` | font-size | `--a-main-mobile-font-size` | `1rem` |
| | padding | `--a-main-mobile-padding` | – |
| | line-height | `--a-main-mobile-line-height` | – |
| Border | border-top | `--mobile-wrapper-border-width` | `1px` |
| Background | background-color | `--grey-background-color` | `#EDEDED` |

## Templates (Namespace)

| Namespace | Path |
|-----------|------|
| `multi-level-navigation-default-` | `./default-/default-.css` |
| `multi-level-navigation-delica-` | `./delica-/delica-.css` |
