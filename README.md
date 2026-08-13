# Habibi Tour 🐫

<p align="center">
  <img src="https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/gsap-%2388CE02.svg?style=for-the-badge&logo=greensock&logoColor=white" alt="GSAP" />
  <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white" alt="Figma" />
  <img src="https://img.shields.io/badge/license-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" />
</p>

<p align="center">
  💛 Like this project? Give it a star and share it! 🚀
</p>

<p align="center">
  <a href="https://www.linkedin.com/sharing/share-offsite/?url=https://github.com/Janesaraujo/Habibitour-Front-End"><img src="https://img.shields.io/badge/share-0A66C2?logo=linkedin&logoColor=white" alt="Share on LinkedIn" /></a>
  <a href="https://x.com/intent/tweet?text=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/Janesaraujo/Habibitour-Front-End%20%23HTML%20%23TailwindCSS%20%23GSAP"><img src="https://img.shields.io/badge/share-000000?logo=x&logoColor=white" alt="Share on X" /></a>
  <a href="https://www.facebook.com/sharer/sharer.php?u=https://github.com/Janesaraujo/Habibitour-Front-End"><img src="https://img.shields.io/badge/share-1877F2?logo=facebook&logoColor=white" alt="Share on Facebook" /></a>
  <a href="https://www.reddit.com/submit?title=Check%20out%20this%20project%20on%20GitHub:%20https://github.com/Janesaraujo/Habibitour-Front-End%20%23HTML%20%23TailwindCSS%20%23GSAP"><img src="https://img.shields.io/badge/share-FF4500?logo=reddit&logoColor=white" alt="Share on Reddit" /></a>
  <a href="https://t.me/share/url?url=https://github.com/Janesaraujo/Habibitour-Front-End&text=Check%20out%20this%20project%20on%20GitHub%20%23HTML%20%23TailwindCSS%20%23GSAP"><img src="https://img.shields.io/badge/share-0088CC?logo=telegram&logoColor=white" alt="Share on Telegram" /></a>
</p>

A cinematic, single-page travel showcase for Dubai's landmark destinations — **Palm Jumeirah**, **Dubai Marina**, the **Dubai Desert**, and **Burj Khalifa**. Built as a personal portfolio project to explore full-screen hero storytelling, GSAP-driven motion, and a "liquid glass" (frosted, translucent) UI aesthetic.

## 🎨 Design Reference

Built from this Figma Community file, which contains the original design and assets:

[![Figma design cover](assets/figma-cover.jpg)](https://www.figma.com/community/file/1384542229391733447/local-turistico)

<!-- TODO: swap assets/figma-cover.jpg for the real thumbnail once you export it from Figma -->

## 🎬 Beyond the Reference

The Figma file above defines the static look of the hero and its destination cards — it doesn't specify any motion. Everything below was designed and engineered on top of that reference, not copied from it:

- **Rolling text on navigation** — clicking the prev/next arrows rolls the destination title and description upward and back into place, line by line, using GSAP's `SplitText` plugin with its `mask` option (a cinema-marquee / odometer effect), instead of a plain fade. Card clicks and the numeric pagination still use a lighter clip-path/fade swap, so the more dramatic roll stays reserved for intentional "next/prev" browsing
- **Auto-fitting title** — the destination name is forced onto a single line (`white-space: nowrap`) and a small measurement routine (`fitTitleFont()`) shrinks its font size just enough to fit whatever the current name's length is, instead of letting long names wrap onto a second line
- **Grow Shadow hover on cards** — hovering a destination card scales it up (`1.07×`), lifts it (`-14px`) and deepens its shadow (a Hover.css-style "Grow Shadow"), layered on top of the existing 3D tilt; the other two cards in view recede and dim (`scale(0.96)`, `opacity: 0.7`) via a single `:has()` selector, so the hovered card reads as floating above the rest. The cards themselves were also resized ~25% larger than the reference proportions for more visual presence. Getting this to actually render took a real fix, not just CSS: GSAP was leaving `transform`/`opacity` as inline styles on the cards after every animation (entrance + destination swap), and inline styles silently beat `:hover` — so the effect was written but never visually firing until `clearProps` was added to hand control back to CSS once each animation settles

## ✨ Features

- **Cinematic hero slider** — 4 destinations, each with its own full-screen background, title, description and rating
- **Liquid glass UI** — frosted-glass navbar, buttons, cards and controls via `backdrop-filter` blur + translucent borders
- **Smooth GSAP animations** — crossfade background transitions, clip-path title reveal, staggered card entrance/exit
- **Fixed-DOM card slots** — the 3 visible destination cards are created once and only their content is swapped, avoiding layout flashes
- **Minimalist side pagination** — numeric indicator (01–04) with a highlighted active state, clickable to jump directly to a destination
- **Image preloading** — all backgrounds/thumbnails are preloaded so navigation never shows a loading flash
- **Accessible & responsive** — `prefers-reduced-motion` support, visible focus states, and a dedicated 2xl (1536px+) scale-up for large screens

## 🚀 Technologies

Static front-end project, no build tools:

- **HTML5** — semantic structure (`nav`, `section`, `button`)
- **Tailwind CSS** (via CDN) — utility-first styling with a custom theme (`sand`, `dune`, `pearl` colors)
- **Custom CSS** ([css/styles.css](css/styles.css)) — liquid-glass effects, background layering/crossfade, clip-path title reveal
- **JavaScript (vanilla)** ([js/script.js](js/script.js)) — slider logic, DOM updates, navigation state
- **GSAP** — timeline-based entrance sequence and per-navigation animations
- **Google Fonts** — [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans), loaded via `<link>` with `preconnect` for faster loading

## 📁 Folder structure

```
.
├── assets/
│   ├── burj.jpg          # Burj Khalifa background/card image
│   ├── deserto.jpg       # Dubai Desert background/card image
│   ├── marina.jpg        # Dubai Marina background/card image
│   ├── palm.jpg          # Palm Jumeirah background/card image
│   ├── figma-cover.jpg   # Figma design reference thumbnail
│   ├── preview.gif       # README preview — looping screen recording
│   └── preview.mp4       # source recording preview.gif was generated from
├── css/
│   └── styles.css        # all custom CSS (Tailwind utilities stay inline in index.html)
├── js/
│   ├── script.js          # destination data, slider/navigation logic, animations
│   └── tailwind.config.js # Tailwind theme (colors) — loads right after the CDN script
├── index.html             # markup only
├── LICENSE
└── README.md
```

## 🖥️ How to view it

Since this is a static project (plain HTML + Tailwind via CDN), just open `index.html` in your browser — no dependencies or installation needed.

1. Clone the repository:
   ```bash
   git clone https://github.com/Janesaraujo/Habibitour-Front-End.git
   ```
2. Open `index.html` directly in your browser,

   **or**, for hot-reload during development, use the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in VS Code:
   ```bash
   # right-click index.html > "Open with Live Server"
   ```

## 📷 Preview

🔗 **Live preview:** _coming soon (deploy in progress)_

![Habibi Tour preview](assets/preview.gif)

## 👤 Author & 📄 License

Developed by **Janes Araujo**

- GitHub: [@Janesaraujo](https://github.com/Janesaraujo)

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
