# 🖼️ Logo-Optimierung - Anleitung

## Status

✅ **HTML bereits angepasst** - Unterstützt jetzt WebP mit PNG-Fallback!

## Was noch zu tun ist:

### Schritt 1: Logo optimieren (5 Minuten)

1. **Gehe zu https://squoosh.app/**
2. **Lade `Logo.png` hoch** (aktuell 941KB)
3. **Wähle Format:**
   - **Empfehlung:** WebP (beste Kompression)
   - **Alternative:** PNG (wenn WebP nicht gewünscht)
4. **Einstellungen:**
   - **Qualität:** 80-85% (sieht genauso aus, aber viel kleiner)
   - **Größe:** Beibehalten (1024x1024 ist OK für Logo)
5. **Download:**
   - Als `Logo.webp` speichern
   - Im gleichen Ordner wie `Logo.png` speichern

### Schritt 2: Fertig! ✅

Das war's! Die HTML-Datei ist bereits so eingerichtet, dass:
- Moderne Browser automatisch `Logo.webp` verwenden (kleiner!)
- Alte Browser automatisch `Logo.png` als Fallback nutzen
- **Kein weiterer Code nötig!**

## Erwartetes Ergebnis

- **Vorher:** Logo.png = 941KB
- **Nachher:** Logo.webp ≈ 45-80KB
- **Einsparung:** ~860KB (91-95% kleiner!)

## Alternative Methoden

### Wenn WebP nicht gewünscht:
- Nutze **TinyPNG**: https://tinypng.com/
- Lade Logo.png hoch
- Speichere optimierte Version als `Logo.png` (überschreibt Original)
- HTML funktioniert trotzdem (nutzt dann PNG statt WebP)

### Mit Command Line:
```bash
# Falls imagemin installiert ist:
npm install -g imagemin-cli imagemin-webp
imagemin Logo.png --out-dir=. --plugin=webp
```

## Testen

Nach dem Erstellen von `Logo.webp`:
1. Browser öffnen
2. `index.html` laden
3. Logo sollte identisch aussehen, aber schneller geladen werden!

---

**Tipp:** Die Anwendung funktioniert auch ohne `Logo.webp` - dann wird einfach das PNG verwendet. Aber mit WebP ist es viel schneller!

