# Renan Toesqui Magalhaes - CV Portfolio Website

A high-performance, responsive single-page CV portfolio built from scratch with pure HTML5, modern vanilla CSS3, and vanilla JavaScript. Removed Jekyll dependencies to allow direct static hosting on GitHub Pages.

---

## 🚀 Key Features

* 🎨 **3-Way Color Theme Switcher**:
  * ☀️ **Light Mode**: Clean, corporate layout with blue/indigo highlights on white.
  * 🌙 **Dark Mode (AMOLED)**: Professional monochromatic silver and white details on a solid black (`#000000`) background.
  * 💻 **Cyber Mode**: The original design featuring high-impact purple and cyan glowing highlights on a deep navy background.
* 🔍 **Combined Search & Tag Filter**:
  * Real-time text search filters the experience timeline.
  * Interactive skills matrix allows clicking badges (e.g., `Kubernetes`, `AWS`, `ISO27001`) to filter experiences and projects simultaneously.
* 🏢 **Role Progression Grouping**:
  * Consolidates multiple positions inside the same company (e.g., SoSafe) into a single card with nested sub-timeline roles, highlighting clear career progression.
* 🖨️ **Print-Ready Stylesheet**:
  * Custom `@media print` rules format the page into a clean, high-contrast, ink-saving black & white layout, hiding web-only elements (navigation, search bar, filters, interactive buttons).
* ✨ **Hobby Micro-Animations**:
  * **Biking**: Sky-blue wind glow and rolling animation.
  * **Gaming**: Purple neon glow and controller rumble vibration.
  * **Reading**: Golden paper glow and book-turning page-tilt.
  * **Martial Arts**: Crimson glow and ninja 360° backflip spin (clicks open the martial arts Tumblr GIF in a new tab).

---

## 🔗 URL Theme Forcing (Query & Hash Endpoints)

You can force the color scheme when sharing a link or embedding the page in an iframe. This bypasses the default system preferences and saved local settings without permanently altering the visitor's storage.

### Method 1: Query Parameters (Recommended for Iframes)
* **Light Theme**: `https://renantmagalhaes.github.io/?theme=light`
* **Dark Theme**: `https://renantmagalhaes.github.io/?theme=dark`
* **Cyber Theme**: `https://renantmagalhaes.github.io/?theme=cyber`

### Method 2: URL Hashes
* **Light Theme**: `https://renantmagalhaes.github.io/#light` (or `#theme-light`)
* **Dark Theme**: `https://renantmagalhaes.github.io/#dark` (or `#theme-dark`)
* **Cyber Theme**: `https://renantmagalhaes.github.io/#cyber` (or `#theme-cyber`)

---

## 💻 Local Development

To run the site locally without compilation steps:

1. Spin up a lightweight server using Python:
   ```bash
   python3 -m http.server 8000
   ```
2. Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
