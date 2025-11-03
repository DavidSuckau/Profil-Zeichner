# 🔄 Rollback-Strategie für ProfilZeichner

## Problem
Aktuell gibt es keine Rollback-Strategie für Daten und Versionen. Wenn etwas schiefgeht, gibt es keinen einfachen Weg zurück.

## Pragmatische Lösung (für lokale Anwendung)

### 1. Automatische Daten-Backups in localStorage

**Konzept:**
- Speichere automatisch die letzten N Versionen der Datenbanken im localStorage
- Jeder Speichervorgang erstellt ein timestamped Backup
- Nutzer kann auf frühere Versionen zurückgreifen

**Implementierung:**
```javascript
// In zdbSave() - automatisches Backup
zdbSave() {
    const backupKey = `${this.zdbKey}.backup.${Date.now()}`;
    localStorage.setItem(backupKey, JSON.stringify(this.zdb));
    
    // Behalte nur die letzten 10 Backups
    this.zdbCleanupOldBackups();
}

zdbCleanupOldBackups() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.zdbKey}.backup.`)) {
            backups.push({ key, timestamp: parseInt(key.split('.')[2]) });
        }
    }
    backups.sort((a, b) => b.timestamp - a.timestamp);
    
    // Lösche alle außer den letzten 10
    backups.slice(10).forEach(b => localStorage.removeItem(b.key));
}

// Backup wiederherstellen
zdbRestoreBackup(timestamp) {
    const backupKey = `${this.zdbKey}.backup.${timestamp}`;
    const backup = localStorage.getItem(backupKey);
    if (backup) {
        this.zdb = JSON.parse(backup);
        this.zdbSave(); // Aktuelle Version überschreiben
        this.zdbRender();
    }
}
```

### 2. Versionsverwaltung mit Kompatibilitätsprüfung

**Konzept:**
- Speichere die App-Version zusammen mit den Daten
- Prüfe beim Laden auf Kompatibilität
- Warnung bei inkompatiblen Versionen

**Implementierung:**
```javascript
zdbSave() {
    this.zdb.version = this.CONFIG.version; // App-Version speichern
    this.zdb.lastSaved = new Date().toISOString();
    localStorage.setItem(this.zdbKey, JSON.stringify(this.zdb));
}

zdbLoad() {
    try {
        const raw = localStorage.getItem(this.zdbKey);
        if (!raw) return { version: '1.0', projects: [] };
        const parsed = JSON.parse(raw);
        
        // Versionskompatibilität prüfen
        if (parsed.version && parsed.version !== this.CONFIG.version) {
            console.warn(`Datenbank-Version ${parsed.version}, App-Version ${this.CONFIG.version}`);
            // Optional: Migration oder Warnung anzeigen
        }
        
        if (!parsed.projects) parsed.projects = [];
        return parsed;
    } catch (e) {
        console.error('Fehler beim Laden:', e);
        return { version: '1.0', projects: [] };
    }
}
```

### 3. Manueller Export als Backup

**Konzept:**
- Button "Backup erstellen" in der Zeichnungen-DB
- Exportiert alle Daten als JSON
- Nutzer kann manuell speichern

**UI-Erweiterung:**
```html
<!-- In der Zeichnungen-DB Toolbar -->
<button id="zeichnungsdb-backup" class="btn-icon" title="Backup erstellen">💾</button>
<button id="zeichnungsdb-restore" class="btn-icon" title="Backup wiederherstellen">📥</button>
```

**Funktion:**
```javascript
zdbCreateBackup() {
    const backup = {
        timestamp: new Date().toISOString(),
        appVersion: this.CONFIG.version,
        data: this.zdb,
        type: 'full_backup'
    };
    
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ProfilZeichner-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

zdbRestoreFromFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            if (backup.type === 'full_backup' && backup.data) {
                if (confirm('Backup wird wiederhergestellt. Aktuelle Daten werden überschrieben. Fortfahren?')) {
                    this.zdb = backup.data;
                    this.zdbSave();
                    this.zdbRender();
                    alert('Backup erfolgreich wiederhergestellt!');
                }
            } else {
                alert('Ungültiges Backup-Format!');
            }
        } catch (err) {
            alert('Fehler beim Laden des Backups: ' + err.message);
        }
    };
    reader.readAsText(file);
}
```

### 4. Auto-Save mit Versionshistorie

**Konzept:**
- Speichere wichtige Aktionen automatisch mit Timestamp
- Ermögliche "Rückgängig bis zu bestimmten Zeitpunkt"

**Implementierung:**
```javascript
// Erweitere saveState() um Timestamp
saveState() {
    const state = {
        timestamp: Date.now(),
        version: this.CONFIG.version,
        // ... rest of state
    };
    
    // Speichere auch in localStorage für persistente History
    const historyKey = 'pz.stateHistory';
    let history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    history.push(state);
    
    // Behalte nur die letzten 20 States
    if (history.length > 20) {
        history = history.slice(-20);
    }
    
    localStorage.setItem(historyKey, JSON.stringify(history));
    
    // ... rest of saveState()
}
```

### 5. Rollback-UI in der Zeichnungen-DB

**Konzept:**
- Neue Spalte/Button "Backups" in der Zeichnungen-DB
- Liste aller verfügbaren Backups
- Ein-Klick Wiederherstellung

**UI:**
```html
<!-- Neuer Tab/Button in Zeichnungen-DB Modal -->
<div id="zeichnungsdb-backup-section" style="display:none;">
    <h3>Backups & Wiederherstellung</h3>
    <div id="backup-list">
        <!-- Wird dynamisch gefüllt -->
    </div>
    <button id="create-backup-btn">📦 Backup erstellen</button>
    <input type="file" id="restore-backup-input" accept=".json" style="display:none;">
    <button onclick="document.getElementById('restore-backup-input').click()">📥 Backup importieren</button>
</div>
```

## Vorteile dieser Lösung

✅ **Einfach**: Nutzt bestehende localStorage-Infrastruktur  
✅ **Automatisch**: Backups entstehen beim normalen Betrieb  
✅ **Manuell**: Nutzer kann selbst Backups erstellen  
✅ **Rückwärtskompatibel**: Keine Breaking Changes  
✅ **Low-Risk**: Funktioniert auch wenn Code-Updates Probleme machen  

## Implementierungsreihenfolge

1. **Phase 1** (Sofort, ⚡ Niedriges Risiko):
   - Automatische Backups in `zdbSave()`
   - Versionsprüfung in `zdbLoad()`
   - Aufwand: ~1 Stunde

2. **Phase 2** (Mittelfristig, ⚡ Mittleres Risiko):
   - Backup-UI in Zeichnungen-DB
   - Manuelle Export/Import-Funktion
   - Aufwand: ~2-3 Stunden

3. **Phase 3** (Optional, ⚡ Niedriges Risiko):
   - Auto-Save mit Versionshistorie
   - Zeitpunkt-basierte Wiederherstellung
   - Aufwand: ~1-2 Stunden

## Migration von bestehenden Daten

```javascript
// Beim ersten Start nach Update
zdbMigrateIfNeeded() {
    const current = this.zdbLoad();
    if (!current.version || current.version < '1.1.0') {
        // Erstelle Backup der alten Daten
        const backupKey = `${this.zdbKey}.preMigration.${Date.now()}`;
        localStorage.setItem(backupKey, JSON.stringify(current));
        
        // Migriere Datenstruktur falls nötig
        // ... Migrationslogik ...
        
        this.zdbSave();
    }
}
```

## Zusammenfassung

**Für eine lokale Anwendung ist dies eine praktikable Rollback-Strategie:**

- ✅ Automatische Backups verhindern Datenverlust
- ✅ Versionsprüfung warnt vor Inkompatibilitäten  
- ✅ Manuelle Backups geben Nutzern Kontrolle
- ✅ Einfache Implementierung, kein komplexes System nötig

**Keine komplexe CI/CD-Rollback-Strategie nötig**, da die Anwendung:
- Lokal läuft (kein Server-Deployment)
- Statische Dateien sind (HTML/CSS/JS)
- Keine Build-Pipeline benötigt
- Daten in localStorage (Browser-spezifisch)

---

**Nächste Schritte:** Diese Strategie kann schrittweise implementiert werden, ohne bestehende Funktionalität zu beeinträchtigen.

