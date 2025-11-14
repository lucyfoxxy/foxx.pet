# ✅ Erledigt
- [x] Frames schreiben korrekt nach `album/frames/{sfw,nsfw}/`
- [x] Vereinheitlichtes Schema (`section`, `category`, `slug`, `title`, `date`, …) in `config.ts`
- [x] Blog-Chapters: rechter Content zeigt ausgewähltes Kapitel
- [x] `initBlogChapters` als separate JS + sauberes Inline-Bootstrapping
- [x] Overlay-Logik: Mobile fix (kein klebendes `:hover`, `data-show` Steuerung)
- [x] Logo auf Mobile ausgeblendet → Sticky-Header-Sprung behoben
- [x] Footer-Layout vereinheitlicht (Mobile 1 Spalte, Desktop 3 Spalten)
  - [x] Ausnahme-Regel für unsichtbaren Button-Padding wieder entfernen (Teil des Button-Style-Refactors)
- [x] Back-Button falsches Label im EntryView
- [x] Crumb-Link „Album / Blog“ führt zu 404 → gelöst durch direkte Pfade (`frames`, `paws`, `noms`, `tails`)
- [x] Gallery: Category-Covers (jetzt, wo Kategorien stabil sind)
- [x] Fehlende Section-Covers ergänzt

# 🐞 Offene Bugs
*(keine akuten offen)*

# 🎨 UX / Polish
- [x] Navigation: Hover/Active-Zustände konsistent (Desktop & Mobile „aktueller Tab“)
- [x] Buttons/Badges vereinheitlichen (inkl. Back-Button-Style)
- [x] Dezenter Shadow hinter Covern in TileViews (für mehr Tiefe)

# 🖼️ Gallery / Home Intro (neu)
- [x] Mini-Intro-Gallery auf Startseite auf Basis der Album-Entry-Ansicht (Overlay-Stil, **ohne** Thumbs-Bar)
- [x] JS vereinheitlichen: EntryAlbum-Viewer und Intro-Gallery nutzen **eine** gemeinsame Logik (Feature-Flags: `withThumbs` etc.)
- [x] Best-Of entfernen → stattdessen zufälliges Album (z. B. aus `frames/{sfw,nsfw}` oder konfigurierbarer Pool)
- [ ] Direktlink: Klick auf Badge in Intro-Gallery öffnet die gewählte Galerie (kein modaler Viewer)
- [x] Overlay-Auto-Hide auch für Intro-Gallery übernehmen (Touch kurz ein/aus)

# 📦 Content / Assets
- [ ] Platzhalter entfernen
- [ ] E2E-Test: 1 Story + 1 Rezept wirklich veröffentlichen (mit neuer Pipeline)

# 🧱 Tech-Schulden (klein, optional)
- [x] Ausnahme-Regel für unsichtbaren Button-Padding wieder entfernen (Teil des Button-Style-Refactors)
- [x] `slug` in alten MD-Files ggf. harmonisieren (falls noch Pfad-Slugs liegen)
- [x] Entry-Overlays: `no-hover`-Klassenschalter global setzen (robust gegen Emulatoren)
