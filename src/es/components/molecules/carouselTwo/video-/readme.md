# CarouselTwo – Video-Only (Museum)

Namespace: `carousel-two-video-museum-`

Zweck: Video-Karussell für mehrere Videos (YouTube + Vimeo). Einheitliche Höhe unabhängig von Video-Ratio.

## Features
- Einheitliche Höhe via `aspect-ratio`-Container auf den Section-Children, Default `--video-aspect: 16/9`
- Pfeile nur an schmalen Randzonen (15% links/rechts) – Mitte bleibt frei für Videointeraktion
- Pfeile erscheinen nur bei Hover über das Carousel (reveal on hover)
- Dots im Museum-Stil mit Abstand nach oben zu den Videos
- Mobile: Pfeile ausgeblendet, Swipen per Touch, Snap-to-Slide via native `scroll-snap`
- Lazy-Load kompatibel mit `<a-iframe>`; normale `<iframe>` funktionieren ebenfalls

## Verwendung

```html
<m-carousel-two namespace="carousel-two-video-museum-" nav-separate nav-align-self="end">
  <section>
    <div>
      <a-iframe>
        <template>
          <iframe src="https://player.vimeo.com/video/1094963536?app_id=122963&&title=0&byline=0&portrait=0&dnt=1&color=000000"
                  width="640" height="360"
                  allow="autoplay; fullscreen; picture-in-picture"
                  title="Vimeo Beispielvideo"></iframe>
        </template>
      </a-iframe>
    </div>
    <div>
      <a-iframe>
        <template>
          <iframe src="https://www.youtube.com/embed/UY9zhdyV9kk"
                  width="640" height="360"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  title="YouTube Beispielvideo"></iframe>
        </template>
      </a-iframe>
    </div>
  </section>
</m-carousel-two>
```

## Konfiguration
- CSS-Variablen pro Instanz:
  - `--video-aspect`: Standard `16/9`, z. B. `4/3` oder `1/1`
  - `--video-max-height`: Standard `70dvh` (Mobile `55dvh` via Media Query)
  - `--carousel-two-video-museum-nav-gap`: Abstand zwischen Dots
  - `--carousel-two-video-museum-nav-margin`: Margin der Dot-Navigation
  - `--carousel-two-video-museum-nav-color`: Farbe der Dots
  - `--carousel-two-video-museum-nav-size`: Grösse der Dots (Default 10px)

## Hinweise
- Videos unterschiedlicher Ratios werden per `aspect-ratio`-Container gleichhoch dargestellt (letterboxed/pillarboxed)
- Pfeile blockieren kein Video-Playback – nur schmale Ränder sind klickbar
