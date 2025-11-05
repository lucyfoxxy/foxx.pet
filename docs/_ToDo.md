# ✅ Erledigt
- [x] Frames schreiben korrekt nach `album/frames/{sfw,nsfw}/`
- [x] Vereinheitlichtes Schema (`section`, `category`, `slug`, `title`, `date`, …) in `config.ts`
- [x] Blog-Chapters: rechter Content zeigt ausgewähltes Kapitel
- [x] `initBlogChapters` als separate JS + sauberes Inline-Bootstrapping
- [x] Overlay-Logik: Mobile fix (kein klebendes `:hover`, `data-show` Steuerung)
- [x] Logo auf Mobile ausgeblendet → Sticky-Header-Sprung behoben
- [x] Back-Button falsches Label im EntryView
- [x] Navigation: Hover/Active-Zustände konsistent (Desktop & Mobile „aktueller Tab“)
- [x] Footer-Layout vereinheitlicht (Mobile 1 Spalte, Desktop 3 Spalten)
  - [ ] Ausnahme-Regel für unsichtbaren Button-Padding wieder entfernen (Teil des Button-Style-Refactors)

# 🐞 Offene Bugs


# 🎨 UX / Polish
- [ ] Buttons/Badges vereinheitlichen (inkl. Back-Button-Style)

# 🖼️ Gallery / Home Intro (neu)
- [ ] Mini-Intro-Gallery auf Startseite auf Basis der Album-Entry-Ansicht (Overlay-Stil, **ohne** Thumbs-Bar)
- [ ] JS vereinheitlichen: EntryAlbum-Viewer und Intro-Gallery nutzen **eine** gemeinsame Logik (Feature-Flags: `withThumbs` etc.)
- [ ] Best-Of entfernen → stattdessen zufälliges Album (z. B. aus `frames/{sfw,nsfw}` oder konfigurierbarer Pool)
- [ ] Direktlink: Klick auf Intro-Gallery öffnet die gewählte Galerie (kein modaler Viewer)
- [ ] Overlay-Auto-Hide auch für Intro-Gallery übernehmen (Touch kurz ein/aus)

# 📦 Content / Assets
- [ ] Gallery: Category-Covers (jetzt, wo Kategorien stabil sind)
- [ ] Fehlende Section-Covers ergänzen
- [ ] Platzhalter entfernen
- [ ] E2E-Test: 1 Story + 1 Rezept wirklich veröffentlichen (mit neuer Pipeline)

# 🧱 Tech-Schulden (klein, optional)
- [ ] `slug` in alten MD-Files ggf. harmonisieren (falls noch Pfad-Slugs liegen)
- [ ] Entry-Overlays: `no-hover`-Klassenschalter global setzen (robust
