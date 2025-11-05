// ProfilZeichner Klasse
class ProfilZeichner {
    constructor() {
                                                                                                                                            // ====================================================================
                                                                                                                                            // KONFIGURATION & KONSTANTEN
                                                                                                                                            // ====================================================================
                                                                                                                                            this.CONFIG = {
                                                                                                                                                // Versionsnummer - wird automatisch verwaltet
                                                                                                                                                version: '1.2.2',
                                                                                                                                                
                                                                                                                                                // Umrechnung & Skalierung
                                                                                                                                                defaultDpi: 96,
                                                                                                                                                mmPerInch: 25.4,
                                                                                                                                                // mmToPx wird nach CONFIG-Erstellung berechnet: 96 / 25.4 ≈ 3.7795 px/mm
                                                                                                                                                
                                                                                                                                                // Canvas-Dimensionen
                                                                                                                                                menuBarHeight: 80, // px - Abzug für Menüleiste
                                                                                                                                                
                                                                                                                                                // Zoom-Einstellungen
                                                                                                                                                zoomMin: 10, // % - Minimaler Zoom-Level
                                                                                                                                                zoomMax: 500, // % - Maximaler Zoom-Level
                                                                                                                                                zoomDefault: 100, // % - Standard Zoom-Level
                                                                                                                                                zoomStep: 5, // % - Schrittweite für Zoom-Slider
                                                                                                                                                
                                                                                                                                                // Bemaßungen
                                                                                                                                                dimensionLineSpacing: 7, // mm - Abstand zwischen Bemaßungslinien
                                                                                                                                                dimensionOffset: 10, // mm - Erste Bemaßungslinie vom Nullpunkt
                                                                                                                                                dimensionArrowSize: 6, // px - Größe der Bemaßungspfeile
                                                                                                                                                dimensionLineWidth: 0.5, // px - Dicke der Bemaßungslinien
                                                                                                                                                dimensionFontSize: 12, // px - Schriftgröße für Bemaßungstexte
                                                                                                                                                dimensionFontFamily: 'Arial', // Schriftart für Bemaßungen
                                                                                                                                                
                                                                                                                                                // Titelblock
                                                                                                                                                titleBlockWidth: 90, // mm - Breite des Titelblocks
                                                                                                                                                titleBlockHeight: 40, // mm - Höhe des Titelblocks
                                                                                                                                                titleBlockPadding: 8, // px - Padding innerhalb des Titelblocks
                                                                                                                                                titleBlockFontSize: 10, // px - Schriftgröße im Titelblock
                                                                                                                                                titleBlockFontFamily: 'sans-serif', // Schriftart im Titelblock
                                                                                                                                                titleBlockOffset: 10, // mm - Abstand vom Profil
                                                                                                                                                
                                                                                                                                                // Standard-Werte für Profilelemente
                                                                                                                                                defaultBohneHeight: 4, // mm - Standard-Höhe für Bohne
                                                                                                                                                defaultLochWidth: 8, // mm - Standard-Breite für Löcher
                                                                                                                                                defaultLochHeight: 4, // mm - Standard-Höhe für Löcher
                                                                                                                                                defaultLochPositionFromTop: 2, // mm - Abstand unter Profil-Oberkante
                                                                                                                                                
                                                                                                                                                // Skizze
                                                                                                                                                skizzeDefaultWidth: 40, // mm - Standard-Breite für Skizzen
                                                                                                                                                skizzeDefaultHeight: 30, // mm - Standard-Höhe für Skizzen
                                                                                                                                                
                                                                                                                                                // State Management
                                                                                                                                                maxHistorySize: 50, // Maximale Anzahl Undo/Redo-Schritte
                                                                                                                                                
                                                                                                                                                // Farben
                                                                                                                                                colors: {
                                                                                                                                                    profile: '#333', // Hauptfarbe für Profil-Linien
                                                                                                                                                    highlight: '#0066cc', // Farbe für Hover-Effekte
                                                                                                                                                    drag: '#ff6600', // Farbe beim Ziehen
                                                                                                                                                    dimension: '#333', // Farbe für Bemaßungen
                                                                                                                                                    background: '#ffffff', // Canvas-Hintergrund
                                                                                                                                                    titleBlockText: '#222', // Textfarbe im Titelblock
                                                                                                                                                    titleBlockHighlight: 'rgba(255,255,0,0.10)', // Hover-Hintergrund Titelblock
                                                                                                                                                    titleBlockBackground: 'rgba(255,255,255,0.95)' // Standard-Hintergrund Titelblock
                                                                                                                                                },
                                                                                                                                                
                                                                                                                                                // Kerben-Snap-Schritte
                                                                                                                                                kerbeSnapStep: 5 // mm - Schrittweite beim Verschieben von Kerben
                                                                                                                                            };
                                                                                                                                            
                                                                                                                                            // Berechne mmToPx basierend auf CONFIG
                                                                                                                                            this.CONFIG.mmToPx = this.CONFIG.defaultDpi / this.CONFIG.mmPerInch;
                                                                                                                                            
                                                                                                                                            // Versionsnummer für Kompatibilität
                                                                                                                                            this.version = this.CONFIG.version;
                                                                                                                                            
        this.init();
    }
                                                                                                                                        
                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DATENBANK (Zeichnungen-DB)
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        openZeichnungenDb() {
                                                                                                                                            if (!this.zdb) this.zdb = { version: '1.0', projects: [] };
                                                                                                                                            // Stelle sicher, dass Modal im normalen Zustand ist
                                                                                                                                            this.restoreZeichnungenDbSize();
                                                                                                                                            if (this.zeichnungsdbModal) {
                                                                                                                                                this.zeichnungsdbModal.classList.remove('hidden');
                                                                                                                                            }
                                                                                                                                            if (this.zdbFileInfo) {
                                                                                                                                                this.zdbFileInfo.textContent = this.zdbFileName ? this.zdbFileName : 'Keine Datei geladen';
                                                                                                                                            }
                                                                                                                                            this.zdbRender();
                                                                                                                                        }

                                                                                                                                        drawTitleBlock() {
                                                                                                                                            if (!this.currentRect) return;
                                                                                                                                            const rect = this.currentRect;
                                                                                                                                            // Initialposition: rechts unten neben Profil
                                                                                                                                            if (this.titleBlock.x == null || this.titleBlock.y == null) {
                                                                                                                                                this.titleBlock.x = rect.x + rect.width + this.CONFIG.titleBlockOffset * this.mmToPx;
                                                                                                                                                this.titleBlock.y = rect.y + rect.height - this.titleBlock.height;
                                                                                                                                            }
                                                                                                                                            const { x, y, width: w, height: h } = this.titleBlock;
                                                                                                                                            const ctx = this.ctx;
                                                                                                                                            ctx.save();
                                                                                                                                            ctx.setLineDash([]);
                                                                                                                                            ctx.lineWidth = 1;
                                                                                                                                            ctx.strokeStyle = this.titleBlock.dragging 
                                                                                                                                                ? this.CONFIG.colors.drag 
                                                                                                                                                : (this.hoveredTitleBlock ? this.CONFIG.colors.highlight : this.CONFIG.colors.profile);

                                                                                                                                            // Hintergrund
                                                                                                                                            ctx.fillStyle = (this.hoveredTitleBlock || this.titleBlock.dragging)
                                                                                                                                                ? this.CONFIG.colors.titleBlockHighlight
                                                                                                                                                : this.CONFIG.colors.titleBlockBackground;
                                                                                                                                            ctx.beginPath();
                                                                                                                                            ctx.rect(x, y, w, h);
                                                                                                                                            ctx.fill();
                                                                                                                                            ctx.stroke();

                                                                                                                                            // Spalten- und Zeilenmaße berechnen
                                                                                                                                            const leftColX = x + this.CONFIG.titleBlockPadding;
                                                                                                                                            const rightColX = x + w * 0.5 + this.CONFIG.titleBlockPadding;
                                                                                                                                            const totalRows = Math.max(this.titleBlock.layout[0].length, this.titleBlock.layout[1].length);
                                                                                                                                            const rowH = h / totalRows;

                                                                                                                                            // Spaltentrenner
                                                                                                                                            ctx.beginPath();
                                                                                                                                            ctx.moveTo(x + w * 0.5, y);
                                                                                                                                            ctx.lineTo(x + w * 0.5, y + h);
                                                                                                                                            ctx.stroke();

                                                                                                                                            // Zeilentrenner
                                                                                                                                            for (let i = 1; i < totalRows; i++) {
                                                                                                                                                const yy = y + rowH * i;
                                                                                                                                                ctx.beginPath();
                                                                                                                                                ctx.moveTo(x, yy);
                                                                                                                                                ctx.lineTo(x + w, yy);
                                                                                                                                                ctx.stroke();
                                                                                                                                            }

                                                                                                                                            // Text - alle Eigenschaften explizit setzen für Stabilität
                                                                                                                                            ctx.fillStyle = this.CONFIG.colors.titleBlockText;
                                                                                                                                            ctx.font = `${this.CONFIG.titleBlockFontSize}px ${this.CONFIG.titleBlockFontFamily}`;
                                                                                                                                            ctx.textBaseline = 'top';
                                                                                                                                            ctx.textAlign = 'left';
                                                                                                                                            ctx.setLineDash([]); // Nochmal sicherstellen (nach Text-Eigenschaften)

                                                                                                                                            const drawColumn = (colData, colX) => {
                                                                                                                                                colData.forEach((item, i) => {
                                                                                                                                                    const value = this.titleBlock.fields[item.field] || '';
                                                                                                                                                    const text = `${item.label}: ${value}${item.suffix || ''}`;
                                                                                                                                                    const yy = y + rowH * i + rowH * 0.25;
                                                                                                                                                    // Explizite Koordinaten verwenden (gerundet)
                                                                                                                                                    const textX = Math.round(colX);
                                                                                                                                                    const textY = Math.round(yy);
                                                                                                                                                    ctx.fillText(text, textX, textY);
                                                                                                                                                });
                                                                                                                                            };

                                                                                                                                            drawColumn(this.titleBlock.layout[0], leftColX);
                                                                                                                                            drawColumn(this.titleBlock.layout[1], rightColX);

                                                                                                                                            ctx.restore();
                                                                                                                                        }

                                                                                                                                        openTitleBlockModal() {
                                                                                                                                            if (!this.titleblockModal) return;
                                                                                                                                            // Vorbelegen
                                                                                                                                            this.tbProject.value = this.titleBlock.fields.project || '';
                                                                                                                                            this.tbVariant.value = this.titleBlock.fields.variant || '';
                                                                                                                                            this.tbReference.value = this.titleBlock.fields.reference || '';
                                                                                                                                            this.tbZeichnungsnummer.value = this.titleBlock.fields.zeichnungsnummer || '';
                                                                                                                                            this.tbRevision.value = this.titleBlock.fields.revision || '';
                                                                                                                                            this.tbSpsNummer.value = this.titleBlock.fields.spsNummer || '';
                                                                                                                                            this.tbMaterial.value = this.titleBlock.fields.material || '';
                                                                                                                                            this.tbSupplier.value = this.titleBlock.fields.supplierNumber || '';
                                                                                                                                            this.tbDate.value = this.titleBlock.fields.date || '';
                                                                                                                                            this.titleblockModal.classList.remove('hidden');
                                                                                                                                        }
                                                                                                                                        closeTitleBlockModal() {
                                                                                                                                            if (this.titleblockModal) this.titleblockModal.classList.add('hidden');
                                                                                                                                        }
                                                                                                                                        confirmTitleBlock() {
                                                                                                                                            this.titleBlock.fields.project = this.tbProject.value.trim();
                                                                                                                                            this.titleBlock.fields.variant = this.tbVariant.value.trim();
                                                                                                                                            this.titleBlock.fields.reference = this.tbReference.value.trim();
                                                                                                                                            this.titleBlock.fields.zeichnungsnummer = this.tbZeichnungsnummer.value.trim();
                                                                                                                                            this.titleBlock.fields.revision = this.tbRevision.value.trim();
                                                                                                                                            this.titleBlock.fields.spsNummer = this.tbSpsNummer.value.trim();
                                                                                                                                            this.titleBlock.fields.material = this.tbMaterial.value.trim();
                                                                                                                                            this.titleBlock.fields.supplierNumber = this.tbSupplier.value.trim();
                                                                                                                                            this.titleBlock.fields.date = this.tbDate.value;
                                                                                                                                            this.closeTitleBlockModal();
                                                                                                                                            this.saveState();
                                                                                                                                            this.draw();
                                                                                                                                        }
                                                                                                                                        titleBlockFillFromDb() {
                                                                                                                                            // Versuche, Namen aus aktueller Auswahl zu übernehmen
                                                                                                                                            try {
                                                                                                                                                const proj = (this.zdb && this.zdb.projects || []).find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                                const variant = proj && (proj.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                                const ref = variant && (variant.references || []).find(r => r.id === this.zdbSelectedReferenceId);
                                                                                                                                                if (proj) this.tbProject.value = proj.name || this.tbProject.value;
                                                                                                                                                if (variant) this.tbVariant.value = variant.name || this.tbVariant.value;
                                                                                                                                                if (ref) this.tbReference.value = ref.number || this.tbReference.value;
                                                                                                                                            } catch (e) {
                                                                                                                                                console.warn('Fehler beim Befüllen des Titelblocks aus DB:', e);
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        titleBlockSaveToDb() {
                                                                                                                                            // Optional: könnte Metadaten in ein Profil-Objekt schreiben; vorerst nur Hinweis
                                                                                                                                            alert('Metadaten im Titelblock gespeichert. (DB-Sync optional)');
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        // Einstellungen Modal
                                                                                                                                        openEinstellungenModal() {
                                                                                                                                            if (!this.einstellungenModal) return;
                                                                                                                                            // Aktuelle Werte anzeigen
                                                                                                                                            const fontSizeSpan = this.settingsDimensionFontSize.parentElement.querySelector('span');
                                                                                                                                            if (fontSizeSpan) fontSizeSpan.textContent = `Aktuell: ${this.CONFIG.dimensionFontSize}px`;
                                                                                                                                            // Stelle sicher, dass der Wert als String gesetzt wird
                                                                                                                                            this.settingsDimensionFontSize.value = String(this.CONFIG.dimensionFontSize);
                                                                                                                                            
                                                                                                                                            const widthSpan = this.settingsTitleblockWidth.parentElement.querySelector('span');
                                                                                                                                            if (widthSpan) widthSpan.textContent = `Aktuell: ${this.CONFIG.titleBlockWidth}mm`;
                                                                                                                                            this.settingsTitleblockWidth.value = String(this.CONFIG.titleBlockWidth);
                                                                                                                                            
                                                                                                                                            const heightSpan = this.settingsTitleblockHeight.parentElement.querySelector('span');
                                                                                                                                            if (heightSpan) heightSpan.textContent = `Aktuell: ${this.CONFIG.titleBlockHeight}mm`;
                                                                                                                                            this.settingsTitleblockHeight.value = String(this.CONFIG.titleBlockHeight);
                                                                                                                                            
                                                                                                                                            this.einstellungenModal.classList.remove('hidden');
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        closeEinstellungenModal() {
                                                                                                                                            if (this.einstellungenModal) this.einstellungenModal.classList.add('hidden');
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        confirmEinstellungen() {
                                                                                                                                            let hasChanges = false;
                                                                                                                                            
                                                                                                                                            // Textgröße für Bemaßungen
                                                                                                                                            const fontSizeValue = this.settingsDimensionFontSize.value.trim();
                                                                                                                                            if (fontSizeValue !== '') {
                                                                                                                                                const newFontSize = parseInt(fontSizeValue);
                                                                                                                                                if (!isNaN(newFontSize) && newFontSize >= 8 && newFontSize <= 24) {
                                                                                                                                                    if (this.CONFIG.dimensionFontSize !== newFontSize) {
                                                                                                                                                        this.CONFIG.dimensionFontSize = newFontSize;
                                                                                                                                                        hasChanges = true;
                                                                                                                                                        console.log('Textgröße aktualisiert auf:', newFontSize, 'px');
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    alert('Bitte eine gültige Textgröße zwischen 8 und 24 px eingeben.');
                                                                                                                                                    return; // Nicht speichern wenn ungültig
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Titelblock-Größe
                                                                                                                                            const widthValue = this.settingsTitleblockWidth.value.trim();
                                                                                                                                            if (widthValue !== '') {
                                                                                                                                                const newWidth = parseFloat(widthValue);
                                                                                                                                                if (!isNaN(newWidth) && newWidth >= 60 && newWidth <= 150) {
                                                                                                                                                    if (this.CONFIG.titleBlockWidth !== newWidth) {
                                                                                                                                                        this.CONFIG.titleBlockWidth = newWidth;
                                                                                                                                                        // Aktualisiere Titelblock-Größe
                                                                                                                                                        if (this.titleBlock) {
                                                                                                                                                            this.titleBlock.width = newWidth * this.mmToPx;
                                                                                                                                                        }
                                                                                                                                                        hasChanges = true;
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    alert('Bitte eine gültige Breite zwischen 60 und 150 mm eingeben.');
                                                                                                                                                    return;
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            const heightValue = this.settingsTitleblockHeight.value.trim();
                                                                                                                                            if (heightValue !== '') {
                                                                                                                                                const newHeight = parseFloat(heightValue);
                                                                                                                                                if (!isNaN(newHeight) && newHeight >= 30 && newHeight <= 80) {
                                                                                                                                                    if (this.CONFIG.titleBlockHeight !== newHeight) {
                                                                                                                                                        this.CONFIG.titleBlockHeight = newHeight;
                                                                                                                                                        // Aktualisiere Titelblock-Größe
                                                                                                                                                        if (this.titleBlock) {
                                                                                                                                                            this.titleBlock.height = newHeight * this.mmToPx;
                                                                                                                                                        }
                                                                                                                                                        hasChanges = true;
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    alert('Bitte eine gültige Höhe zwischen 30 und 80 mm eingeben.');
                                                                                                                                                    return;
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Nur speichern und neuzeichnen wenn Änderungen vorgenommen wurden
                                                                                                                                            if (hasChanges) {
                                                                                                                                                this.closeEinstellungenModal();
                                                                                                                                                this.saveState();
                                                                                                                                                this.draw(); // Neuzeichnen mit neuen Einstellungen
                                                                                                                                                this.autoZoom();
                                                                                                                                            } else {
                                                                                                                                                // Keine Änderungen, einfach Modal schließen
                                                                                                                                                this.closeEinstellungenModal();
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        // ============================================================================
                                                                                                                                        // TITELBLOCK
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        // (Die drawTitleBlock() Funktion ist bereits weiter oben definiert)
                                                                                                                                        
                                                                                                                                        // ============================================================================
                                                                                                                                        // DXF EXPORT (R12 Format)
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        exportToDXF() {
                                                                                                                                            if (!this.currentRect) {
                                                                                                                                                alert('Bitte zuerst ein Profil erstellen.');
                                                                                                                                                return;
                                                                                                                                            }
                                                                                                                                            const lines = [];
                                                                                                                                            const arcs = [];
                                                                                                                                            const circles = [];
                                                                                                                                            const texts = [];

                                                                                                                                            // Helper: push line
                                                                                                                                            const addLine = (x1,y1,x2,y2,layer) => lines.push({x1,y1,x2,y2,layer});
                                                                                                                                            const addArc = (cx,cy,r,startDeg,endDeg,layer) => arcs.push({cx,cy,r,startDeg,endDeg,layer});
                                                                                                                                            const addCircle = (cx,cy,r,layer) => circles.push({cx,cy,r,layer});
                                                                                                                                            const addText = (x,y,height,value,layer) => texts.push({x,y,height,value,layer});

                                                                                                                                            // Profile (als Rechteck-Kontur)
                                                                                                                                            const rect = this.currentRect;
                                                                                                                                            const x1 = rect.x, y1 = rect.y, x2 = rect.x + rect.width, y2 = rect.y + rect.height;
                                                                                                                                            addLine(x1,y1,x2,y1,'PROFILE');
                                                                                                                                            addLine(x2,y1,x2,y2,'PROFILE');
                                                                                                                                            addLine(x2,y2,x1,y2,'PROFILE');
                                                                                                                                            addLine(x1,y2,x1,y1,'PROFILE');

                                                                                                                                            // Nahtlinie (als Linie im Innenbereich)
                                                                                                                                            if (this.nahtlinie) {
                                                                                                                                                const nx = rect.x + (this.nahtlinie.distance || 0) * this.mmToPx; // distance ist von links in mm; falls px, bitte anpassen
                                                                                                                                                addLine(nx, y1, nx, y2, 'NAHT');
                                                                                                                                            }

                                                                                                                                            // Ausschnitte (Rechtecke)
                                                                                                                                            (this.ausschnitte || []).forEach(a => {
                                                                                                                                                const top = a.positionType === 'oben';
                                                                                                                                                const ax = rect.x + a.position * this.mmToPx;
                                                                                                                                                const aw = a.length * this.mmToPx;
                                                                                                                                                const ah = a.height * this.mmToPx;
                                                                                                                                                const ay = top ? rect.y : (rect.y + rect.height - ah);
                                                                                                                                                addLine(ax,ay,ax+aw,ay,'CUTOUTS');
                                                                                                                                                addLine(ax+aw,ay,ax+aw,ay+ah,'CUTOUTS');
                                                                                                                                                addLine(ax+aw,ay+ah,ax,ay+ah,'CUTOUTS');
                                                                                                                                                addLine(ax,ay+ah,ax,ay,'CUTOUTS');
                                                                                                                                            });

                                                                                                                                            // Crimping (Rechtecke)
                                                                                                                                            (this.crimping || []).forEach(c => {
                                                                                                                                                if (!this.bohnen || this.bohnen.length === 0) return;
                                                                                                                                                const b = this.bohnen[0];
                                                                                                                                                const totalWidth = rect.width - (this.cutoutWidth ? this.cutoutWidth * this.mmToPx : 0);
                                                                                                                                                const bohneX = rect.x + (this.cutoutWidth ? this.cutoutWidth * this.mmToPx : 0);
                                                                                                                                                const bohneY = rect.y - (b.height * this.mmToPx);
                                                                                                                                                const x = bohneX + c.position * this.mmToPx;
                                                                                                                                                const w = c.length * this.mmToPx;
                                                                                                                                                const h = b.height * this.mmToPx;
                                                                                                                                                addLine(x,bohneY,x+w,bohneY,'CRIMPING');
                                                                                                                                                addLine(x+w,bohneY,x+w,bohneY+h,'CRIMPING');
                                                                                                                                                addLine(x+w,bohneY+h,x,bohneY+h,'CRIMPING');
                                                                                                                                                addLine(x,bohneY+h,x,bohneY,'CRIMPING');
                                                                                                                                            });

                                                                                                                                            // Bohne (als Rechteck - wie im SVG und Canvas)
                                                                                                                                            if (this.bohnen && this.bohnen.length > 0) {
                                                                                                                                                const b = this.bohnen[0];
                                                                                                                                                // Berechne die Breite der Bohne (angepasst an Cut-out, wie in drawBohnen)
                                                                                                                                                let bohneWidth = rect.width;
                                                                                                                                                if (this.cutoutWidth > 0) {
                                                                                                                                                    bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
                                                                                                                                                }
                                                                                                                                                const bohneHeight = b.height * this.mmToPx;
                                                                                                                                                const bohneX = rect.x + (rect.width - bohneWidth) / 2; // Zentriert
                                                                                                                                                const bohneY = rect.y - bohneHeight; // Direkt über dem Profil
                                                                                                                                                
                                                                                                                                                // Rechteck mit 4 Linien (ohne runde Enden)
                                                                                                                                                const leftX = bohneX;
                                                                                                                                                const rightX = bohneX + bohneWidth;
                                                                                                                                                const topY = bohneY;
                                                                                                                                                const bottomY = bohneY + bohneHeight;
                                                                                                                                                
                                                                                                                                                // 4 Linien für das Rechteck
                                                                                                                                                addLine(leftX, topY, rightX, topY, 'BOHNE');      // Oben
                                                                                                                                                addLine(rightX, topY, rightX, bottomY, 'BOHNE'); // Rechts
                                                                                                                                                addLine(rightX, bottomY, leftX, bottomY, 'BOHNE'); // Unten
                                                                                                                                                addLine(leftX, bottomY, leftX, topY, 'BOHNE');    // Links
                                                                                                                                            }

                                                                                                                                            // Löcher
                                                                                                                                            (this.loecher || []).forEach(loch => {
                                                                                                                                                const cx = rect.x + loch.distance * this.mmToPx;
                                                                                                                                                const w = loch.width * this.mmToPx;
                                                                                                                                                const h = loch.height * this.mmToPx;
                                                                                                                                                const topY = rect.y - (loch.positionFromTop ? loch.positionFromTop * this.mmToPx : (2 * this.mmToPx));
                                                                                                                                                const cy = topY + h/2;
                                                                                                                                                if (Math.abs(w - h) < 1e-6) {
                                                                                                                                                    // rund
                                                                                                                                                    addCircle(cx, cy, w/2, 'LOECHER');
                                                                                                                                                } else {
                                                                                                                                                    // Kapsel (rounded rect) via 4 Lines + 2 Arcs
                                                                                                                                                    const R = Math.min(w,h)/2;
                                                                                                                                                    const left = cx - w/2 + R;
                                                                                                                                                    const right = cx + w/2 - R;
                                                                                                                                                    const top = cy - h/2 + R;
                                                                                                                                                    const bottom = cy + h/2 - R;
                                                                                                                                                    // Seitenlinien
                                                                                                                                                    addLine(left, top - R, left, bottom + R, 'LOECHER');
                                                                                                                                                    addLine(right, top - R, right, bottom + R, 'LOECHER');
                                                                                                                                                    // horizontale Linien oben/unten (zwischen den Bogenenden)
                                                                                                                                                    addLine(left, top - R, right, top - R, 'LOECHER');
                                                                                                                                                    addLine(left, bottom + R, right, bottom + R, 'LOECHER');
                                                                                                                                                    // obere/untere Halbkreise (ARC)
                                                                                                                                                    addArc(cx, top, R, 180, 360, 'LOECHER');
                                                                                                                                                    addArc(cx, bottom, R, 0, 180, 'LOECHER');
                                                                                                                                                }
                                                                                                                                            });

                                                                                                                                            // Kerben
                                                                                                                                            const kerbeDepthMm = parseFloat(this.kerbeDepthInput ? this.kerbeDepthInput.value : '4') || 4;
                                                                                                                                            const kerbeWidthMm = parseFloat(this.kerbeWidthInput ? this.kerbeWidthInput.value : '6') || 6;
                                                                                                                                            (this.kerben || []).forEach(k => {
                                                                                                                                                const xCenter = rect.x + k.distance * this.mmToPx;
                                                                                                                                                const depth = kerbeDepthMm * this.mmToPx;
                                                                                                                                                const halfW = (kerbeWidthMm * this.mmToPx) / 2;
                                                                                                                                                if (k.type === 'triangle') {
                                                                                                                                                    if (k.position === 'oben') {
                                                                                                                                                        // Dreieck mit Basis auf der oberen Profilkante
                                                                                                                                                        const yBase = rect.y;
                                                                                                                                                        const yApex = rect.y + depth;
                                                                                                                                                        const xL = xCenter - halfW;
                                                                                                                                                        const xR = xCenter + halfW;
                                                                                                                                                        addLine(xL, yBase, xR, yBase, 'KERBEN');
                                                                                                                                                        addLine(xL, yBase, xCenter, yApex, 'KERBEN');
                                                                                                                                                        addLine(xCenter, yApex, xR, yBase, 'KERBEN');
                                                                                                                                                    } else {
                                                                                                                                                        // Dreieck mit Basis auf der unteren Profilkante
                                                                                                                                                        const yBase = rect.y + rect.height;
                                                                                                                                                        const yApex = yBase - depth;
                                                                                                                                                        const xL = xCenter - halfW;
                                                                                                                                                        const xR = xCenter + halfW;
                                                                                                                                                        addLine(xL, yBase, xR, yBase, 'KERBEN');
                                                                                                                                                        addLine(xL, yBase, xCenter, yApex, 'KERBEN');
                                                                                                                                                        addLine(xCenter, yApex, xR, yBase, 'KERBEN');
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    // Strichmarkierung (kurze Linie)
                                                                                                                                                    const len = depth;
                                                                                                                                                    if (k.position === 'oben') {
                                                                                                                                                        addLine(xCenter, rect.y, xCenter, rect.y - len, 'KERBEN');
                                                                                                                                                    } else {
                                                                                                                                                        addLine(xCenter, rect.y + rect.height, xCenter, rect.y + rect.height + len, 'KERBEN');
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            });

                                                                                                                                            // Texte (nur einfache TEXT Entities)
                                                                                                                                            (this.texts || []).forEach(t => {
                                                                                                                                                addText(t.x, t.y, (t.size || 16) * 0.264583, t.content || '', 'TEXT'); // 16px ~ 4.23mm
                                                                                                                                            });

                                                                                                                                            // Detail-Indikatoren (gestrichelte Kreise um Kerben/Löcher)
                                                                                                                                            // Gestrichelter Kreis um eine Kerbe (nur die erste) - nur bei Dreieck-Kerben
                                                                                                                                            if (this.kerben && this.kerben.length > 0) {
                                                                                                                                                const kerbe = this.kerben[0];
                                                                                                                                                let type = 'triangle';
                                                                                                                                                let widthPx, depthPx;
                                                                                                                                                
                                                                                                                                                if (kerbe.kerbenTypeId) {
                                                                                                                                                    const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                                                                                                                                                    if (kerbenType) {
                                                                                                                                                        type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
                                                                                                                                                        widthPx = kerbenType.width * this.mmToPx;
                                                                                                                                                        depthPx = kerbenType.depth * this.mmToPx;
                                                                                                                                                    }
                                                                                                                                                } else {
                                                                                                                                                    type = kerbe.type || 'triangle';
                                                                                                                                                    widthPx = (kerbe.width || 6) * this.mmToPx;
                                                                                                                                                    depthPx = (kerbe.depth || 4) * this.mmToPx;
                                                                                                                                                }
                                                                                                                                                
                                                                                                                                                if (type === 'triangle') {
                                                                                                                                                    const distancePx = kerbe.distance * this.mmToPx;
                                                                                                                                                    let kerbeCenterX, kerbeCenterY;
                                                                                                                                                    
                                                                                                                                                    if (kerbe.position === 'oben') {
                                                                                                                                                        kerbeCenterX = rect.x + distancePx;
                                                                                                                                                        kerbeCenterY = rect.y;
                                                                                                                                                    } else {
                                                                                                                                                        kerbeCenterX = rect.x + distancePx;
                                                                                                                                                        kerbeCenterY = rect.y + rect.height;
                                                                                                                                                    }
                                                                                                                                                    
                                                                                                                                                    const radius = Math.max(widthPx, depthPx) * 1.4; // 40% größer als Kerbe
                                                                                                                                                    // DXF unterstützt keine gestrichelten Kreise direkt, aber wir können einen Kreis hinzufügen
                                                                                                                                                    // Hinweis: Gestrichelt müsste in CAD-Software manuell auf Layer gesetzt werden
                                                                                                                                                    addCircle(kerbeCenterX, kerbeCenterY, radius, 'DETAIL_INDICATORS');
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Gestrichelter Kreis um ein Loch (nur das erste)
                                                                                                                                            if (this.loecher && this.loecher.length > 0) {
                                                                                                                                                const loch = this.loecher[0];
                                                                                                                                                const distancePx = loch.distance * this.mmToPx;
                                                                                                                                                const widthPx = loch.width * this.mmToPx;
                                                                                                                                                const heightPx = loch.height * this.mmToPx;
                                                                                                                                                const positionPx = (loch.positionFromTop || 2) * this.mmToPx;
                                                                                                                                                
                                                                                                                                                const lochCenterX = rect.x + distancePx;
                                                                                                                                                const lochCenterY = rect.y + positionPx + (heightPx / 2);
                                                                                                                                                
                                                                                                                                                const radius = Math.max(widthPx, heightPx) * 1.4; // 40% größer als Loch
                                                                                                                                                addCircle(lochCenterX, lochCenterY, radius, 'DETAIL_INDICATORS');
                                                                                                                                            }

                                                                                                                                            // Bounding Box bestimmen (für Y-Invert & Verschiebung ins positive)
                                                                                                                                            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                                                                                                                                            const considerPoint = (x,y)=>{minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);};
                                                                                                                                            lines.forEach(l=>{considerPoint(l.x1,l.y1);considerPoint(l.x2,l.y2);});
                                                                                                                                            circles.forEach(c=>{considerPoint(c.cx-c.r,c.cy-c.r);considerPoint(c.cx+c.r,c.cy+c.r);});
                                                                                                                                            arcs.forEach(a=>{considerPoint(a.cx-a.r,a.cy-a.r);considerPoint(a.cx+a.r,a.cy+a.r);});
                                                                                                                                            texts.forEach(tx=>considerPoint(tx.x,tx.y));
                                                                                                                                            if (!isFinite(minX)) { minX = 0; minY = 0; maxX = 0; maxY = 0; }

                                                                                                                                            // Koordinaten transformieren: DXF-Y nach oben: y' = (maxY - y); und nach 0,0 verschieben
                                                                                                                                            const TX = -minX;
                                                                                                                                            const TY = 0; // wir nutzen y' = (maxY - (y + 0))
                                                                                                                                            const toDXF = (x,y)=>({x: x+TX, y: (maxY - y)});

                                                                                                                                            // DXF Builder
                                                                                                                                            const sec = [];
                                                                                                                                            const push = (...args)=>sec.push(...args.map(String));
                                                                                                                                            const layer = (name)=>(['8',name]);

                                                                                                                                            // Header (mm Einheiten)
                                                                                                                                            push('0','SECTION','2','HEADER','9','$INSUNITS','70','4','0','ENDSEC');
                                                                                                                                            // Tables (nur Layer)
                                                                                                                                            push('0','SECTION','2','TABLES','0','TABLE','2','LAYER','70','7');
                                                                                                                                            const layers = ['PROFILE','CUTOUTS','KERBEN','LOECHER','NAHT','CRIMPING','TEXT','BOHNE','TITLEBLOCK','DETAIL_INDICATORS'];
                                                                                                                                            layers.forEach((ln,i)=>{
                                                                                                                                                push('0','LAYER','2',ln,'70','0','62', String((i%7)+1),'6','CONTINUOUS');
                                                                                                                                            });
                                                                                                                                            push('0','ENDTAB','0','ENDSEC');

                                                                                                                                            // ENTITIES
                                                                                                                                            push('0','SECTION','2','ENTITIES');
                                                                                                                                            // Linien
                                                                                                                                            lines.forEach(l=>{
                                                                                                                                                const p1 = toDXF(l.x1,l.y1); const p2 = toDXF(l.x2,l.y2);
                                                                                                                                                push('0','LINE',...layer(l.layer),'10',p1.x,'20',p1.y,'11',p2.x,'21',p2.y);
                                                                                                                                            });
                                                                                                                                            // Kreise
                                                                                                                                            circles.forEach(c=>{
                                                                                                                                                const p = toDXF(c.cx,c.cy);
                                                                                                                                                push('0','CIRCLE',...layer(c.layer),'10',p.x,'20',p.y,'40',c.r);
                                                                                                                                            });
                                                                                                                                            // Bögen
                                                                                                                                            arcs.forEach(a=>{
                                                                                                                                                const p = toDXF(a.cx,a.cy);
                                                                                                                                                push('0','ARC',...layer(a.layer),'10',p.x,'20',p.y,'40',a.r,'50',a.startDeg,'51',a.endDeg);
                                                                                                                                            });
                                                                                                                                            // Texte
                                                                                                                                            texts.forEach(t=>{
                                                                                                                                                const p = toDXF(t.x,t.y);
                                                                                                                                                push('0','TEXT',...layer(t.layer),'10',p.x,'20',p.y,'40',t.height,'1',t.value||'');
                                                                                                                                            });
                                                                                                                                            // Titelblock als Rechteck + TEXT
                                                                                                                                            if (this.titleBlock && this.titleBlock.x != null) {
                                                                                                                                                const bx = this.titleBlock.x, by = this.titleBlock.y, bw = this.titleBlock.width, bh = this.titleBlock.height;
                                                                                                                                                const p1 = toDXF(bx,by), p2 = toDXF(bx+bw,by), p3 = toDXF(bx+bw,by+bh), p4 = toDXF(bx,by+bh);
                                                                                                                                                // Rahmen
                                                                                                                                                push('0','LINE',...layer('TITLEBLOCK'),'10',p1.x,'20',p1.y,'11',p2.x,'21',p2.y);
                                                                                                                                                push('0','LINE',...layer('TITLEBLOCK'),'10',p2.x,'20',p2.y,'11',p3.x,'21',p3.y);
                                                                                                                                                push('0','LINE',...layer('TITLEBLOCK'),'10',p3.x,'20',p3.y,'11',p4.x,'21',p4.y);
                                                                                                                                                push('0','LINE',...layer('TITLEBLOCK'),'10',p4.x,'20',p4.y,'11',p1.x,'21',p1.y);
                                                                                                                                                // Texte (klein)
                                                                                                                                                const th = 3; // 3mm Texthöhe
                                                                                                                                                const tx = bx + 5, tyBase = by + 10;
                                                                                                                                                const entries = [
                                                                                                                                                    `Projekt: ${this.titleBlock.fields.project||''}`,
                                                                                                                                                    `Variante: ${this.titleBlock.fields.variant||''}`,
                                                                                                                                                    `Bezug: ${this.titleBlock.fields.reference||''}`,
                                                                                                                                                    `Zeichnungsnummer: ${this.titleBlock.fields.zeichnungsnummer||''}`,
                                                                                                                                                    `Revision: ${this.titleBlock.fields.revision||''}`,
                                                                                                                                                    `SPS Nummer: ${this.titleBlock.fields.spsNummer||''}`,
                                                                                                                                                    `Material: ${this.titleBlock.fields.material||''}`,
                                                                                                                                                    `Lieferant: ${this.titleBlock.fields.supplierNumber||''}`,
                                                                                                                                                    `Datum: ${this.titleBlock.fields.date||''}`
                                                                                                                                                ];
                                                                                                                                                entries.forEach((txt, idx)=>{
                                                                                                                                                    const py = toDXF(tx, by + 8 + idx* (bh/8)).y;
                                                                                                                                                    const px = toDXF(tx, by).x;
                                                                                                                                                    push('0','TEXT',...layer('TITLEBLOCK'),'10',px,'20',py,'40',th,'1',txt);
                                                                                                                                                });
                                                                                                                                            }
                                                                                                                                            push('0','ENDSEC','0','EOF');

                                                                                                                                            const blob = new Blob([sec.join('\n')], { type: 'application/dxf' });
                                                                                                                                            const url = URL.createObjectURL(blob);
                                                                                                                                            const a = document.createElement('a');
                                                                                                                                            a.href = url;
                                                                                                                                            a.download = 'Zeichnung.dxf';
                                                                                                                                            a.click();
                                                                                                                                            URL.revokeObjectURL(url);
                                                                                                                                        }
                                                                                                                                        closeZeichnungenDb() {
                                                                                                                                            if (this.zeichnungsdbModal) {
                                                                                                                                                this.zeichnungsdbModal.classList.add('hidden');
                                                                                                                                            }
                                                                                                                                            // Stelle ursprüngliche Größe wieder her
                                                                                                                                            this.restoreZeichnungenDbSize();
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DB: UI & Modal-Verwaltung
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        toggleZeichnungenDbMaximize() {
                                                                                                                                            if (!this.zeichnungsdbModal) return;
                                                                                                                                            
                                                                                                                                            // Toggle zwischen maximiert und normal
                                                                                                                                            if (this.isZeichnungenDbMaximized) {
                                                                                                                                                this.restoreZeichnungenDbSize();
                                                                                                                                            } else {
                                                                                                                                                this.maximizeZeichnungenDb();
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        
                                                                                                                                        maximizeZeichnungenDb() {
                                                                                                                                            if (!this.zeichnungsdbModal) return;
                                                                                                                                            
                                                                                                                                            // Speichere ursprüngliche Größe beim ersten Mal
                                                                                                                                            if (!this.originalZeichnungenDbStyle) {
                                                                                                                                                const modalContent = this.zeichnungsdbModal.querySelector('.bg-white');
                                                                                                                                                this.originalZeichnungenDbStyle = {
                                                                                                                                                    modalContentClass: modalContent ? modalContent.className : ''
                                                                                                                                                };
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Setze Modal auf volle Bildschirmgröße
                                                                                                                                            this.zeichnungsdbModal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]';
                                                                                                                                            this.zeichnungsdbModal.classList.remove('hidden');
                                                                                                                                            
                                                                                                                                            // Setze Modal-Content auf volle Größe
                                                                                                                                            const modalContent = this.zeichnungsdbModal.querySelector('.bg-white');
                                                                                                                                            if (modalContent) {
                                                                                                                                                modalContent.className = 'bg-white rounded-none shadow-2xl w-full h-full flex flex-col overflow-hidden';
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Aktualisiere Button
                                                                                                                                            if (this.zeichnungsdbModalMaximize) {
                                                                                                                                                this.zeichnungsdbModalMaximize.textContent = '⧉';
                                                                                                                                                this.zeichnungsdbModalMaximize.classList.add('bg-green-500');
                                                                                                                                                this.zeichnungsdbModalMaximize.classList.remove('bg-gray-500');
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            this.isZeichnungenDbMaximized = true;
                                                                                                                                        }

                                                                                                                                        restoreZeichnungenDbSize() {
                                                                                                                                            if (!this.zeichnungsdbModal) return;
                                                                                                                                            
                                                                                                                                            // Stelle ursprüngliche Größe wieder her
                                                                                                                                            this.zeichnungsdbModal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                                                                                                                                            
                                                                                                                                            // Stelle Modal-Content wieder her
                                                                                                                                            const modalContent = this.zeichnungsdbModal.querySelector('.bg-white');
                                                                                                                                            if (modalContent && this.originalZeichnungenDbStyle) {
                                                                                                                                                modalContent.className = this.originalZeichnungenDbStyle.modalContentClass || 'bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden';
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            // Aktualisiere Button
                                                                                                                                            if (this.zeichnungsdbModalMaximize) {
                                                                                                                                                this.zeichnungsdbModalMaximize.textContent = '□';
                                                                                                                                                this.zeichnungsdbModalMaximize.classList.remove('bg-green-500');
                                                                                                                                                this.zeichnungsdbModalMaximize.classList.add('bg-gray-500');
                                                                                                                                            }
                                                                                                                                            
                                                                                                                                            this.isZeichnungenDbMaximized = false;
                                                                                                                                        }

                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DB: Datenverwaltung
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        zdbLoad() {
                                                                                                                                            try {
                                                                                                                                                const raw = localStorage.getItem(this.zdbKey);
                                                                                                                                                if (!raw) return { version: '1.0', projects: [] };
                                                                                                                                                const parsed = JSON.parse(raw);
                                                                                                                                                if (!parsed.projects) parsed.projects = [];
                                                                                                                                                return parsed;
                                                                                                                                            } catch (e) {
                                                                                                                                                return { version: '1.0', projects: [] };
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        zdbSave() {
                                                                                                                                            localStorage.setItem(this.zdbKey, JSON.stringify(this.zdb));
                                                                                                                                        }

                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DB: Rendering & Anzeige
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        zdbRender() {
                                                                                                                                            this.zdbRenderProjects();
                                                                                                                                            this.zdbRenderVariants();
                                                                                                                                            this.zdbRenderReferences();
                                                                                                                                            this.zdbRenderProfiles();
                                                                                                                                        }

                                                                                                                                        zdbRenderProjects() {
                                                                                                                                            if (!this.zdbProjectList) return;
                                                                                                                                            this.zdbProjectList.innerHTML = '';
                                                                                                                                            this.zdb.projects.forEach(p => {
                                                                                                                                                const li = document.createElement('li');
                                                                                                                                                li.className = 'flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 rounded mb-1';
                                                                                                                                                if (this.zdbSelectedProjectId === p.id) li.className += ' bg-blue-100 font-semibold';
                                                                                                                                                const left = document.createElement('div');
                                                                                                                                                left.className = 'flex-1';
                                                                                                                                                left.textContent = p.name;
                                                                                                                                                const del = document.createElement('button');
                                                                                                                                                del.className = 'w-5 h-5 flex items-center justify-center text-red-600 hover:bg-red-100 rounded text-sm';
                                                                                                                                                del.title = 'Projekt löschen';
                                                                                                                                                del.textContent = '×';
                                                                                                                                                del.addEventListener('click', (e) => {
                                                                                                                                                    e.stopPropagation();
                                                                                                                                                    this.zdbDeleteProject(p.id);
                                                                                                                                                });
                                                                                                                                                li.addEventListener('click', () => {
                                                                                                                                                    this.zdbSelectedProjectId = p.id;
                                                                                                                                                    this.zdbSelectedVariantId = null;
                                                                                                                                                    this.zdbSelectedReferenceId = null;
                                                                                                                                                    this.zdbRender();
                                                                                                                                                });
                                                                                                                                                li.appendChild(left);
                                                                                                                                                li.appendChild(del);
                                                                                                                                                this.zdbProjectList.appendChild(li);
                                                                                                                                            });
                                                                                                                                        }

                                                                                                                                        zdbRenderVariants() {
                                                                                                                                            if (!this.zdbVariantList) return;
                                                                                                                                            this.zdbVariantList.innerHTML = '';
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            (project.varianten || []).forEach(v => {
                                                                                                                                                const li = document.createElement('li');
                                                                                                                                                li.className = 'flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 rounded mb-1';
                                                                                                                                                if (this.zdbSelectedVariantId === v.id) li.className += ' bg-blue-100 font-semibold';
                                                                                                                                                const left = document.createElement('div');
                                                                                                                                                left.className = 'flex-1';
                                                                                                                                                left.textContent = v.name;
                                                                                                                                                const del = document.createElement('button');
                                                                                                                                                del.className = 'w-5 h-5 flex items-center justify-center text-red-600 hover:bg-red-100 rounded text-sm';
                                                                                                                                                del.title = 'Variante löschen';
                                                                                                                                                del.textContent = '×';
                                                                                                                                                del.addEventListener('click', (e) => {
                                                                                                                                                    e.stopPropagation();
                                                                                                                                                    this.zdbDeleteVariant(v.id);
                                                                                                                                                });
                                                                                                                                                li.addEventListener('click', () => {
                                                                                                                                                    this.zdbSelectedVariantId = v.id;
                                                                                                                                                    this.zdbSelectedReferenceId = null;
                                                                                                                                                    this.zdbRenderReferences();
                                                                                                                                                    this.zdbRenderProfiles();
                                                                                                                                                    this.zdbRenderVariants();
                                                                                                                                                });
                                                                                                                                                li.appendChild(left);
                                                                                                                                                li.appendChild(del);
                                                                                                                                                this.zdbVariantList.appendChild(li);
                                                                                                                                            });
                                                                                                                                        }

                                                                                                                                        zdbRenderReferences() {
                                                                                                                                            if (!this.zdbRefList) return;
                                                                                                                                            this.zdbRefList.innerHTML = '';
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                            if (!variant) return;
                                                                                                                                            // Migration: falls altes Schema (profiles) existiert, in Default-Referenz migrieren
                                                                                                                                            if (variant.profiles && variant.profiles.length) {
                                                                                                                                                variant.references = variant.references || [];
                                                                                                                                                const def = { id: this.zdbUuid(), number: 'REF-1', createdAt: new Date().toISOString(), profiles: variant.profiles };
                                                                                                                                                variant.references.push(def);
                                                                                                                                                delete variant.profiles;
                                                                                                                                                this.zdbSave();
                                                                                                                                            }
                                                                                                                                            (variant.references || []).forEach(ref => {
                                                                                                                                                const li = document.createElement('li');
                                                                                                                                                li.className = 'flex items-center justify-between px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 rounded mb-1';
                                                                                                                                                if (this.zdbSelectedReferenceId === ref.id) li.className += ' bg-blue-100 font-semibold';
                                                                                                                                                const left = document.createElement('div');
                                                                                                                                                left.className = 'flex-1';
                                                                                                                                                left.textContent = ref.number;
                                                                                                                                                const del = document.createElement('button');
                                                                                                                                                del.className = 'w-5 h-5 flex items-center justify-center text-red-600 hover:bg-red-100 rounded text-sm';
                                                                                                                                                del.title = 'Bezügenummer löschen';
                                                                                                                                                del.textContent = '×';
                                                                                                                                                del.addEventListener('click', (e) => {
                                                                                                                                                    e.stopPropagation();
                                                                                                                                                    this.zdbDeleteReference(ref.id);
                                                                                                                                                });
                                                                                                                                                li.addEventListener('click', () => {
                                                                                                                                                    this.zdbSelectedReferenceId = ref.id;
                                                                                                                                                    this.zdbRenderProfiles();
                                                                                                                                                    this.zdbRenderReferences();
                                                                                                                                                });
                                                                                                                                                li.appendChild(left);
                                                                                                                                                li.appendChild(del);
                                                                                                                                                this.zdbRefList.appendChild(li);
                                                                                                                                            });
                                                                                                                                        }

                                                                                                                                        zdbRenderProfiles() {
                                                                                                                                            if (!this.zdbProfileGrid) return;
                                                                                                                                            this.zdbProfileGrid.innerHTML = '';
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                            if (!variant) return;
                                                                                                                                            const ref = (variant.references || []).find(r => r.id === this.zdbSelectedReferenceId);
                                                                                                                                            const profiles = ref ? (ref.profiles || []) : [];
                                                                                                                                            profiles.forEach(pr => {
                                                                                                                                                const card = document.createElement('div');
                                                                                                                                                card.className = 'relative border border-gray-200 rounded-lg p-2 bg-white hover:shadow-md transition-all cursor-pointer';
                                                                                                                                                const del = document.createElement('button');
                                                                                                                                                del.className = 'absolute top-1 right-1 w-5 h-5 flex items-center justify-center text-red-600 hover:bg-red-100 rounded text-sm z-10';
                                                                                                                                                del.title = 'Profil löschen';
                                                                                                                                                del.textContent = '×';
                                                                                                                                                del.addEventListener('click', (e) => {
                                                                                                                                                    e.stopPropagation();
                                                                                                                                                    this.zdbDeleteProfile(pr.id);
                                                                                                                                                });
                                                                                                                                                const img = document.createElement('img');
                                                                                                                                                img.src = pr.previewImage || '';
                                                                                                                                                img.className = 'w-full max-h-[50px] object-contain object-center mb-2';
                                                                                                                                                const title = document.createElement('div');
                                                                                                                                                title.className = 'text-xs font-semibold text-gray-800 mb-1 truncate';
                                                                                                                                                title.textContent = pr.name;
                                                                                                                                                const meta = document.createElement('div');
                                                                                                                                                meta.className = 'text-xs text-gray-600 truncate';
                                                                                                                                                meta.textContent = pr.supplierNumber ? `Lieferant: ${pr.supplierNumber}` : '—';
                                                                                                                                                card.appendChild(del);
                                                                                                                                                card.appendChild(img);
                                                                                                                                                card.appendChild(title);
                                                                                                                                                card.appendChild(meta);
                                                                                                                                                // Single-Click: visuelle Auswahl (optional)
                                                                                                                                                card.addEventListener('click', () => {
                                                                                                                                                    // Auswahlzustand setzen
                                                                                                                                                    Array.from(this.zdbProfileGrid.children).forEach(el => {
                                                                                                                                                        el.classList.remove('border-blue-500', 'bg-blue-50');
                                                                                                                                                    });
                                                                                                                                                    card.classList.add('border-blue-500', 'bg-blue-50');
                                                                                                                                                });
                                                                                                                                                // Doppelklick: sofort öffnen
                                                                                                                                                card.addEventListener('dblclick', () => this.zdbOpenProfile(pr));
                                                                                                                                                this.zdbProfileGrid.appendChild(card);
                                                                                                                                            });
                                                                                                                                        }

                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DB: CRUD-Operationen (Löschen)
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        zdbDeleteProject(projectId) {
                                                                                                                                            const ix = this.zdb.projects.findIndex(p => p.id === projectId);
                                                                                                                                            if (ix >= 0 && confirm('Projekt inklusive Varianten und Bezügenummern löschen?')) {
                                                                                                                                                this.zdb.projects.splice(ix, 1);
                                                                                                                                                this.zdbSelectedProjectId = null;
                                                                                                                                                this.zdbSelectedVariantId = null;
                                                                                                                                                this.zdbSelectedReferenceId = null;
                                                                                                                                                this.zdbSave();
                                                                                                                                                this.zdbRender();
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        zdbDeleteVariant(variantId) {
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            const ix = (project.varianten || []).findIndex(v => v.id === variantId);
                                                                                                                                            if (ix >= 0 && confirm('Variante inklusive Bezügenummern löschen?')) {
                                                                                                                                                project.varianten.splice(ix, 1);
                                                                                                                                                this.zdbSelectedVariantId = null;
                                                                                                                                                this.zdbSelectedReferenceId = null;
                                                                                                                                                this.zdbSave();
                                                                                                                                                this.zdbRender();
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        zdbDeleteReference(referenceId) {
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                            if (!variant) return;
                                                                                                                                            const ix = (variant.references || []).findIndex(r => r.id === referenceId);
                                                                                                                                            if (ix >= 0 && confirm('Bezügenummer und zugehörige Profile löschen?')) {
                                                                                                                                                variant.references.splice(ix, 1);
                                                                                                                                                this.zdbSelectedReferenceId = null;
                                                                                                                                                this.zdbSave();
                                                                                                                                                this.zdbRenderReferences();
                                                                                                                                                this.zdbRenderProfiles();
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        zdbDeleteProfile(profileId) {
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return;
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                            if (!variant) return;
                                                                                                                                            const ref = (variant.references || []).find(r => r.id === this.zdbSelectedReferenceId);
                                                                                                                                            if (!ref) return;
                                                                                                                                            const ix = (ref.profiles || []).findIndex(pr => pr.id === profileId);
                                                                                                                                            if (ix >= 0 && confirm('Profil löschen?')) {
                                                                                                                                                ref.profiles.splice(ix, 1);
                                                                                                                                                this.zdbSave();
                                                                                                                                                this.zdbRenderProfiles();
                                                                                                                                            }
                                                                                                                                        }

                                                                                                                                        // ============================================================================
                                                                                                                                        // ZEICHNUNGEN-DB: Helper-Funktionen
                                                                                                                                        // ============================================================================
                                                                                                                                        
                                                                                                                                        zdbUuid() {
                                                                                                                                            return 'id-' + Math.random().toString(36).slice(2, 10);
                                                                                                                                        }

                                                                                                                                        zdbEnsureDefault() {
                                                                                                                                            if (!this.zdb.projects.length) {
                                                                                                                                                this.zdb.projects.push({ id: this.zdbUuid(), name: 'Allgemein', createdAt: new Date().toISOString(), varianten: [] });
                                                                                                                                            }
                                                                                                                                            const project = this.zdb.projects[0];
                                                                                                                                            if (!project.varianten || !project.varianten.length) {
                                                                                                                                                project.varianten = [{ id: this.zdbUuid(), name: 'Allgemein', createdAt: new Date().toISOString(), profiles: [] }];
                                                                                                                                            }
                                                                                                                                            this.zdbSelectedProjectId = project.id;
                                                                                                                                            this.zdbSelectedVariantId = project.varianten[0].id;
                                                                                                                                        }

                                                                                                                                        zdbAddProject() {
                                                                                                                                            const name = prompt('Projektname eingeben:', 'Neues Projekt');
                                                                                                                                            if (!name) return;
                                                                                                                                            this.zdb.projects.push({ id: this.zdbUuid(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), varianten: [] });
                                                                                                                                            this.zdbSave();
                                                                                                                                            this.zdbSelectedProjectId = this.zdb.projects[this.zdb.projects.length - 1].id;
                                                                                                                                            this.zdbSelectedVariantId = null;
                                                                                                                                            this.zdbRender();
                                                                                                                                        }

                                                                                                                                        zdbAddVariant() {
                                                                                                                                            if (!this.zdb.projects.length) this.zdbEnsureDefault();
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId) || this.zdb.projects[0];
                                                                                                                                            const name = prompt('Variantenname eingeben:', 'Neue Variante');
                                                                                                                                            if (!name) return;
                                                                                                                                            project.varianten = project.varianten || [];
                                                                                                                                            const v = { id: this.zdbUuid(), name, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), references: [] };
                                                                                                                                            project.varianten.push(v);
                                                                                                                                            this.zdbSave();
                                                                                                                                            this.zdbSelectedVariantId = v.id;
                                                                                                                                            this.zdbRender();
                                                                                                                                        }

                                                                                                                                        zdbAddReference() {
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId);
                                                                                                                                            if (!project) return alert('Bitte zuerst ein Projekt wählen.');
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId);
                                                                                                                                            if (!variant) return alert('Bitte zuerst eine Variante wählen.');
                                                                                                                                            const number = (this.zdbRefInput && this.zdbRefInput.value.trim()) || prompt('Bezügenummer eingeben:', 'REF-001');
                                                                                                                                            if (!number) return;
                                                                                                                                            variant.references = variant.references || [];
                                                                                                                                            const ref = { id: this.zdbUuid(), number, createdAt: new Date().toISOString(), profiles: [] };
                                                                                                                                            variant.references.push(ref);
                                                                                                                                            this.zdbSave();
                                                                                                                                            this.zdbSelectedReferenceId = ref.id;
                                                                                                                                            if (this.zdbRefInput) this.zdbRefInput.value = '';
                                                                                                                                            this.zdbRenderReferences();
                                                                                                                                            this.zdbRenderProfiles();
                                                                                                                                        }

                                                                                                                                        async zdbSaveCurrentProfile() {
                                                                                                                                            // Sicherstellen, dass Ziel existiert
                                                                                                                                            if (!this.zdb.projects.length) this.zdbEnsureDefault();
                                                                                                                                            const project = this.zdb.projects.find(p => p.id === this.zdbSelectedProjectId) || this.zdb.projects[0];
                                                                                                                                            const variant = (project.varianten || []).find(v => v.id === this.zdbSelectedVariantId) || project.varianten[0];
                                                                                                                                            if (!variant.references || !variant.references.length) return alert('Bitte zuerst eine Bezügenummer anlegen und auswählen.');
                                                                                                                                            const ref = (variant.references || []).find(r => r.id === this.zdbSelectedReferenceId) || null;
                                                                                                                                            if (!ref) return alert('Bitte eine Bezügenummer auswählen.');
                                                                                                                                            const name = prompt('Profilname eingeben:', 'Neue Zeichnung');
                                                                                                                                            if (!name) return;
                                                                                                                                            const supplierNumber = prompt('Lieferantennummer (optional):', '') || '';

                                                                                                                                            // Screenshot erzeugen (skaliertes Bild der sichtbaren Canvas)
                                                                                                                                            const previewImage = this.canvas.toDataURL('image/png');

                                                                                                                                            // Zustand speichern
                                                                                                                                            const data = this.getCurrentStateForExport ? this.getCurrentStateForExport() : this.createStateSnapshotForExport();

                                                                                                                                            const profile = {
                                                                                                                                                id: this.zdbUuid(),
                                                                                                                                                name,
                                                                                                                                                supplierNumber,
                                                                                                                                                previewImage,
                                                                                                                                                data,
                                                                                                                                                version: this.version,
                                                                                                                                                createdAt: new Date().toISOString(),
                                                                                                                                                updatedAt: new Date().toISOString()
                                                                                                                                            };
                                                                                                                                            ref.profiles = ref.profiles || [];
                                                                                                                                            ref.profiles.push(profile);
                                                                                                                                            this.zdbSave();
                                                                                                                                            this.zdbRenderProfiles();
                                                                                                                                            alert('Zeichnung gespeichert.');
                                                                                                                                        }

                                                                                                                                        // Export der aktuellen Zeichen-State-Struktur
                                                                                                                                        createStateSnapshotForExport() {
                                                                                                                                            // Reuse saveState logic without pushing to history
                                                                                                                                            return {
                                                                                                                                                currentRect: this.currentRect ? { ...this.currentRect } : null,
                                                                                                                                                bohnen: this._deepClone(this.bohnen || []),
                                                                                                                                                kerben: this._deepClone(this.kerben || []),
                                                                                                                                                loecher: this._deepClone(this.loecher || []),
                                                                                                                                                ausschnitte: this._deepClone(this.ausschnitte || []),
                                                                                                                                                nahtlinie: this.nahtlinie ? { ...this.nahtlinie } : null,
                                                                                                                                                crimping: this._deepClone(this.crimping || []),
                                                                                                                                                titleBlock: this._deepClone(this.titleBlock || null),
                                                                                                                                                zoom: this.zoom,
                                                                                                                                                offsetX: this.offsetX,
                                                                                                                                                offsetY: this.offsetY,
                                                                                                                                            };
                                                                                                                                        }

                                                                                                                                        zdbOpenProfile(profile) {
                                                                                                                                            if (!profile || !profile.data) return;
                                                                                                                                            // Bestehendes auf dem Canvas entfernen und dann laden
                                                                                                                                            this.clearCanvas();
                                                                                                                                            this.saveState();
                                                                                                                                            this.restoreState(profile.data);
                                                                                                                                            this.updateProfileInputs(); // Aktualisiere Eingabefelder mit geladenen Werten
                                                                                                                                            this.draw();
                                                                                                                                            this.autoZoom();
                                                                                                                                            this.closeZeichnungenDb();
                                                                                                                                        }

                                                                                                                                        // Import/Export
                                                                                                                                        zdbExport() {
                                                                                                                                            const blob = new Blob([JSON.stringify(this.zdb)], { type: 'application/json' });
                                                                                                                                            const url = URL.createObjectURL(blob);
                                                                                                                                            const a = document.createElement('a');
                                                                                                                                            a.href = url;
                                                                                                                                            const fileName = this.zdbFileName || 'Zeichnungen.json';
                                                                                                                                            a.download = fileName;
                                                                                                                                            a.click();
                                                                                                                                            URL.revokeObjectURL(url);
                                                                                                                                            // Anzeige aktualisieren
                                                                                                                                            if (!this.zdbFileName) {
                                                                                                                                                this.zdbFileName = 'Zeichnungen.json';
                                                                                                                                            }
                                                                                                                                            if (this.zdbFileInfo) this.zdbFileInfo.textContent = this.zdbFileName;
                                                                                                                                        }

                                                                                                                                        zdbHandleImport(e) {
                                                                                                                                            const file = e.target.files && e.target.files[0];
                                                                                                                                            if (!file) return;
                                                                                                                                            const reader = new FileReader();
                                                                                                                                            reader.onload = () => {
                                                                                                                                                try {
                                                                                                                                                    const data = JSON.parse(reader.result);
                                                                                                                                                    if (data && data.projects) {
                                                                                                                                                        this.zdb = data;
                                                                                                                                                        this.zdbSave();
                                                                                                                                                        this.zdbSelectedProjectId = null;
                                                                                                                                                        this.zdbSelectedVariantId = null;
                                                                                                                                                        this.zdbRender();
                                                                                                                                                        this.zdbFileName = file.name || 'Zeichnungen.json';
                                                                                                                                                        if (this.zdbFileInfo) this.zdbFileInfo.textContent = this.zdbFileName;
                                                                                                                                                    } else {
                                                                                                                                                        alert('Ungültiges Datei-Format.');
                                                                                                                                                    }
                                                                                                                                                } catch (err) {
                                                                                                                                                    alert('Import fehlgeschlagen.');
                                                                                                                                                }
                                                                                                                                            };
                                                                                                                                            reader.readAsText(file);
                                                                                                                                            e.target.value = '';
                                                                                                                                        }
                                                                                                                                        // ============================================================================
                                                                                                                                        // INITIALISIERUNG
                                                                                                                                        // ============================================================================
    
    init() {
        // Canvas-Elemente
        this.canvas = document.getElementById('main-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.widthInput = document.getElementById('width-input');
        this.heightInput = document.getElementById('height-input');
        this.drawButton = document.getElementById('draw-button');
        this.clearButton = document.getElementById('clear-button');
                                                                                                                                            this.undoButton = document.getElementById('undo-button');
                                                                                                                                            this.redoButton = document.getElementById('redo-button');
        this.zoomLevel = document.getElementById('zoom-level');
                                                                                                                                            this.zoomSlider = document.getElementById('zoom-slider');
        
        // Profil-Element Buttons
        this.bohneButton = document.getElementById('bohne-button');
        this.cutoutButton = document.getElementById('cutout-button');
        this.kerbeButton = document.getElementById('kerbe-button');
        this.nahtlinieButton = document.getElementById('nahtlinie-button');
        this.lochButton = document.getElementById('loch-button');
        this.ausschnittButton = document.getElementById('ausschnitt-button');
        this.crimpingButton = document.getElementById('crimping-button');
        this.bemaßungButton = document.getElementById('bemaßung-button');
        this.textButton = document.getElementById('text-button');
        this.bildButton = document.getElementById('bild-button');
        this.databaseButton = document.getElementById('database-button');
                                                                                                                                            this.zeichnungsdbButton = document.getElementById('zeichnungsdb-button');
                                                                                                                                            this.titleblockButton = document.getElementById('titleblock-button');
        
        // File Input für Bild-Upload (versteckt)
        this.bildFileInput = document.createElement('input');
        this.bildFileInput.type = 'file';
        this.bildFileInput.accept = 'image/*';
        this.bildFileInput.style.display = 'none';
        document.body.appendChild(this.bildFileInput);
        
        // Untere Button-Leiste
        this.autoZoomButton = document.getElementById('auto-zoom-button');
        this.panButton = document.getElementById('pan-button');
        this.pdfButton = document.getElementById('pdf-button');
        this.svgButton = document.getElementById('svg-button');
                                                                                                                                            this.dxfButton = document.getElementById('dxf-button');
        this.einstellungenButton = document.getElementById('einstellungen-button');
        
        // Email Confirmation Modal (für zukünftige Order-Funktion)
        this.emailConfirmationModal = document.getElementById('email-confirmation-modal');
        this.emailConfirmationClose = document.getElementById('email-confirmation-close');
        this.emailConfirmationClose2 = document.getElementById('email-confirmation-close2');
        this.emailTextPreview = document.getElementById('email-text-preview');
        this.freelancerEmail = document.getElementById('freelancer-email');
        
        // Einstellungen Modal
        this.einstellungenModal = document.getElementById('einstellungen-modal');
        this.einstellungenModalClose = document.getElementById('einstellungen-modal-close');
        this.einstellungenCancel = document.getElementById('einstellungen-cancel');
        this.einstellungenConfirm = document.getElementById('einstellungen-confirm');
        this.settingsDimensionFontSize = document.getElementById('settings-dimension-font-size');
        this.settingsTitleblockWidth = document.getElementById('settings-titleblock-width');
        this.settingsTitleblockHeight = document.getElementById('settings-titleblock-height');
        
        
        // Modal-Elemente
        this.bohneModal = document.getElementById('bohne-modal');
        this.bohneHeightInput = document.getElementById('bohne-height');
        this.bohneCancelButton = document.getElementById('bohne-cancel');
        this.bohneConfirmButton = document.getElementById('bohne-confirm');
                                                                                                                                            this.bohneRemoveButton = document.getElementById('bohne-remove');
        
        this.cutoutModal = document.getElementById('cutout-modal');
        this.cutoutWidthInput = document.getElementById('cutout-width');
        this.cutoutHeightInput = document.getElementById('cutout-height');
        this.cutoutCancelButton = document.getElementById('cutout-cancel');
        this.cutoutConfirmButton = document.getElementById('cutout-confirm');
                                                                                                                                            this.cutoutRemoveButton = document.getElementById('cutout-remove');
        
        this.kerbeModal = document.getElementById('kerbe-modal');
        this.kerbeTypeSelect = document.getElementById('kerbe-type');
        this.kerbeDepthInput = document.getElementById('kerbe-depth');
        this.kerbeWidthInput = document.getElementById('kerbe-width');
        this.kerbeWidthGroup = document.getElementById('kerbe-width-group');
        this.kerbeCancelButton = document.getElementById('kerbe-cancel');
        this.kerbeConfirmButton = document.getElementById('kerbe-confirm');
        this.kerbeTable = document.getElementById('kerbe-table');
        this.kerbeTbody = document.getElementById('kerbe-tbody');
        this.addKerbeBtn = document.getElementById('add-kerbe-btn');
                                                                                                                                            this.kerbenTypesList = document.getElementById('kerben-types-list');
                                                                                                                                            this.addKerbenTypeBtn = document.getElementById('add-kerben-type-btn');
                                                                                                                                            this.openKerbenTypesModalBtn = document.getElementById('open-kerben-types-modal-btn');
                                                                                                                                            this.kerbenTypesModal = document.getElementById('kerben-types-modal');
                                                                                                                                            this.kerbenTypesModalClose = document.getElementById('kerben-types-modal-close');
                                                                                                                                            this.kerbenTypesCancel = document.getElementById('kerben-types-cancel');
                                                                                                                                            this.kerbenTypesConfirm = document.getElementById('kerben-types-confirm');
        
        this.nahtlinieModal = document.getElementById('nahtlinie-modal');
        this.nahtlinieDistanceInput = document.getElementById('nahtlinie-distance');
        this.nahtlinieTypeSelect = document.getElementById('nahtlinie-type');
        this.nahtlinieCancelButton = document.getElementById('nahtlinie-cancel');
        this.nahtlinieConfirmButton = document.getElementById('nahtlinie-confirm');
                                                                                                                                            this.nahtlinieRemoveButton = document.getElementById('nahtlinie-remove');
        
        this.lochModal = document.getElementById('loch-modal');
        this.lochWidthInput = document.getElementById('loch-width');
        this.lochHeightInput = document.getElementById('loch-height');
        this.lochPositionInput = document.getElementById('loch-position');
        this.lochCancelButton = document.getElementById('loch-cancel');
        this.lochConfirmButton = document.getElementById('loch-confirm');
        this.lochTable = document.getElementById('loch-table');
        this.lochTbody = document.getElementById('loch-tbody');
        this.addLochBtn = document.getElementById('add-loch-btn');
                                                                                                                                            this.lochUseKerbenPositionsCheckbox = document.getElementById('loch-use-kerben-positions');
                                                                                                                                            this.lochKerbenCheckboxGroup = document.getElementById('loch-kerben-checkbox-group');
        
        // Ausschnitt Modal
        this.ausschnittModal = document.getElementById('ausschnitt-modal');
        this.ausschnittModalClose = document.getElementById('ausschnitt-modal-close');
        this.ausschnittCancelButton = document.getElementById('ausschnitt-cancel');
        this.ausschnittConfirmButton = document.getElementById('ausschnitt-confirm');
        this.ausschnittTable = document.getElementById('ausschnitt-table');
        this.ausschnittTbody = document.getElementById('ausschnitt-tbody');
        this.addAusschnittRowBtn = document.getElementById('add-ausschnitt-row');
                                                                                                                                            
                                                                                                                                            // Crimping Modal
                                                                                                                                            this.crimpingModal = document.getElementById('crimping-modal');
                                                                                                                                            this.crimpingModalClose = document.getElementById('crimping-modal-close');
                                                                                                                                            this.crimpingCancelButton = document.getElementById('crimping-cancel');
                                                                                                                                            this.crimpingConfirmButton = document.getElementById('crimping-confirm');
                                                                                                                                            this.crimpingTable = document.getElementById('crimping-table');
                                                                                                                                            this.crimpingTbody = document.getElementById('crimping-tbody');
                                                                                                                                            this.addCrimpingRowBtn = document.getElementById('add-crimping-row');
                                                                                                                                            this.crimpingNoBohneWarning = document.getElementById('crimping-no-bohne-warning');
        
        this.textModal = document.getElementById('text-modal');
        this.textContentInput = document.getElementById('text-content');
        this.textSizeInput = document.getElementById('text-size');
        this.textCancelButton = document.getElementById('text-cancel');
        this.textConfirmButton = document.getElementById('text-confirm');
        this.textModalClose = document.getElementById('text-modal-close');
        // Modal Close Buttons
        this.bohneModalClose = document.getElementById('bohne-modal-close');
        this.cutoutModalClose = document.getElementById('cutout-modal-close');
        this.kerbeModalClose = document.getElementById('kerbe-modal-close');
        this.nahtlinieModalClose = document.getElementById('nahtlinie-modal-close');
        this.lochModalClose = document.getElementById('loch-modal-close');
        
        this.canvasContainer = document.querySelector('.canvas-container');

                                                                                                                                            // Titelblock Modal
                                                                                                                                            this.titleblockModal = document.getElementById('titleblock-modal');
                                                                                                                                            this.titleblockModalClose = document.getElementById('titleblock-modal-close');
                                                                                                                                            this.titleblockCancel = document.getElementById('titleblock-cancel');
                                                                                                                                            this.titleblockConfirm = document.getElementById('titleblock-confirm');
                                                                                                                                            this.tbProject = document.getElementById('tb-project');
                                                                                                                                            this.tbVariant = document.getElementById('tb-variant');
                                                                                                                                            this.tbReference = document.getElementById('tb-reference');
                                                                                                                                            this.tbZeichnungsnummer = document.getElementById('tb-zeichnungsnummer');
                                                                                                                                            this.tbRevision = document.getElementById('tb-revision');
                                                                                                                                            this.tbSpsNummer = document.getElementById('tb-spsnummer');
                                                                                                                                            this.tbMaterial = document.getElementById('tb-material');
                                                                                                                                            this.tbSupplier = document.getElementById('tb-supplier');
                                                                                                                                            this.tbDate = document.getElementById('tb-date');
                                                                                                                                            this.tbFillFromDb = document.getElementById('tb-fill-from-db');
                                                                                                                                            this.tbSaveToDb = document.getElementById('tb-save-to-db');

                                                                                                                                            // Zeichnungen-DB Elemente
                                                                                                                                            this.zeichnungsdbModal = document.getElementById('zeichnungsdb-modal');
                                                                                                                                            this.zeichnungsdbModalClose = document.getElementById('zeichnungsdb-modal-close');
                                                                                                                                            this.zeichnungsdbClose = document.getElementById('zeichnungsdb-close');
                                                                                                                                            this.zdbAddProjectBtn = document.getElementById('zeichnungsdb-add-project');
                                                                                                                                            this.zdbAddVariantBtn = document.getElementById('zeichnungsdb-add-variant');
                                                                                                                                            this.zdbSaveCurrentBtn = document.getElementById('zeichnungsdb-save-current');
                                                                                                                                            this.zdbExportBtn = document.getElementById('zeichnungsdb-export');
                                                                                                                                            this.zdbImportBtn = document.getElementById('zeichnungsdb-import');
                                                                                                                                            this.zdbFileInput = document.getElementById('zeichnungsdb-file-input');
                                                                                                                                            this.zdbProjectList = document.getElementById('zeichnungsdb-project-list');
                                                                                                                                            this.zdbVariantList = document.getElementById('zeichnungsdb-variant-list');
                                                                                                                                            this.zdbRefList = document.getElementById('zeichnungsdb-ref-list');
                                                                                                                                            this.zdbRefInput = document.getElementById('zeichnungsdb-ref-input');
                                                                                                                                            this.zdbAddRefBtn = document.getElementById('zeichnungsdb-add-ref');
                                                                                                                                            this.zdbProfileGrid = document.getElementById('zeichnungsdb-profile-grid');
                                                                                                                                            this.zdbFileInfo = document.getElementById('zeichnungsdb-file-info');
        
        // Canvas-Einstellungen
        this.canvasWidth = window.innerWidth;
                                                                                                                                            this.canvasHeight = window.innerHeight - this.CONFIG.menuBarHeight;
                                                                                                                                            this.zoom = this.CONFIG.zoomDefault / 100; // Konvertiere % zu Faktor (100% = 1.0)
        this.offsetX = this.canvasWidth / 2; // Koordinatensystem in der Mitte
        this.offsetY = this.canvasHeight / 2; // Koordinatensystem in der Mitte
                                                                                                                                            // Umrechnung Millimeter zu Pixel aus CONFIG
                                                                                                                                            this.mmToPx = this.CONFIG.mmToPx;
        
        // Zeichenzustand
        this.currentRect = null;
        this.bohnen = [];
        this.kerben = [];
                                                                                                                                            this.kerbenTypes = []; // Verschiedene Kerben-Typen mit eigenen Maßen
        this.loecher = [];
        this.ausschnitte = [];
                                                                                                                                            this.crimping = [];
        this.nahtlinie = null;
        this.texts = [];
        this.images = []; // Array für alle eingefügten Bilder
        this.showDimensions = false;
                                                                                                                                            // Titelblock State
                                                                                                                                            this.titleBlock = {
                                                                                                                                                x: null,
                                                                                                                                                y: null,
                                                                                                                                                width: this.CONFIG.titleBlockWidth * this.mmToPx,
                                                                                                                                                height: this.CONFIG.titleBlockHeight * this.mmToPx,
                                                                                                                                                locked: false,
                                                                                                                                                dragging: false,
                                                                                                                                                fields: {
                                                                                                                                                    project: '', variant: '', reference: '', zeichnungsnummer: '',
                                                                                                                                                    revision: '', spsNummer: '', material: '', supplierNumber: '', date: ''
                                                                                                                                                },
                                                                                                                                                layout: [
                                                                                                                                                    // Linke Spalte
                                                                                                                                                    [
                                                                                                                                                        { label: 'Projekt', field: 'project', suffix: '' },
                                                                                                                                                        { label: 'Variante', field: 'variant', suffix: '' },
                                                                                                                                                        { label: 'Bezug', field: 'reference', suffix: '' },
                                                                                                                                                        { label: 'Zeichnungsnummer', field: 'zeichnungsnummer', suffix: '' }
                                                                                                                                                    ],
                                                                                                                                                    // Rechte Spalte
                                                                                                                                                    [
                                                                                                                                                        { label: 'Revision', field: 'revision', suffix: '' },
                                                                                                                                                        { label: 'SPS Nummer', field: 'spsNummer', suffix: '' },
                                                                                                                                                        { label: 'Material', field: 'material', suffix: '' },
                                                                                                                                                        { label: 'Lieferant', field: 'supplierNumber', suffix: '' },
                                                                                                                                                        { label: 'Datum', field: 'date', suffix: '' }
                                                                                                                                                    ]
                                                                                                                                                ]
                                                                                                                                            };
                                                                                                                                            this.hoveredTitleBlock = false;
                                                                                                                                            this.titleBlockDragOffset = { x: 0, y: 0 };
        this.selectedFormat = 'a4';
        this.showFormatBorder = false;
        this.loadedProfileSkizze = null;
        this.loadedSkizzeImage = null;
                                                                                                                                            this.skizzeX = null; // Position der Skizze (X)
                                                                                                                                            this.skizzeY = null; // Position der Skizze (Y)
                                                                                                                                            this.skizzeWidth = this.CONFIG.skizzeDefaultWidth * this.mmToPx;
        this.skizzeHeight = this.CONFIG.skizzeDefaultHeight * this.mmToPx;
        
        // Bild-Einfügen (vom Rechner)
        this.bildImage = null; // Das geladene Bild
        this.bildX = null; // Position des Bildes (X)
        this.bildY = null; // Position des Bildes (Y)
        this.bildWidth = 60 * this.mmToPx; // Standard-Breite
        this.bildHeight = 40 * this.mmToPx; // Standard-Höhe
        
        // Drag-and-Drop für Modals
        this.draggedModal = null;
        this.dragOffset = { x: 0, y: 0 };
        
        // Text-Drag-and-Drop
        this.draggedText = null;
        this.textDragOffset = { x: 0, y: 0 };
        this.hoveredText = null; // Aktueller Text über dem die Maus schwebt
        this.selectedTextForEdit = null; // Text der bearbeitet wird
        
        // Kerben-Drag-and-Drop
        this.draggedKerbe = null;
        this.kerbeDragOffset = { x: 0, y: 0 };
        this.hoveredKerbe = null; // Aktueller Kerbe über dem die Maus schwebt
        
        // Löcher-Drag-and-Drop
        this.draggedLoch = null;
        this.lochDragOffset = { x: 0, y: 0 };
        this.hoveredLoch = null; // Aktuelles Loch über dem die Maus schwebt
        
        // Bemaßungslinien-Drag-and-Drop
        this.draggedDimension = null; // { type: 'horizontal'|'vertical', index: number }
        this.dimensionDragOffset = { x: 0, y: 0 };
        this.hoveredDimension = null; // Aktuelle Bemaßungslinie über der die Maus schwebt
        this.dimensionOffsets = {
            horizontal: [], // Array von Y-Offsets für horizontale Linien (oben/unten)
            vertical: []   // Array von X-Offsets für vertikale Linien (rechts)
        };
        
        // Skizze-Drag-and-Resize
        this.draggedSkizze = false;
        this.skizzeDragOffset = { x: 0, y: 0 };
        this.resizingSkizze = false;
        this.resizeHandle = null; // 'nw', 'ne', 'sw', 'se' für die Ecken
        this.resizeStartPos = { x: 0, y: 0 };
        this.resizeStartSize = { width: 0, height: 0 };
        this.resizeStartPosSkizze = { x: 0, y: 0 };
        this.hoveredSkizze = false;
        
        // Bild-Drag-and-Resize
        this.draggedBild = false;
        this.bildDragOffset = { x: 0, y: 0 };
        this.resizingBild = false;
        this.bildResizeHandle = null; // 'nw', 'ne', 'sw', 'se' für die Ecken
        this.bildResizeStartPos = { x: 0, y: 0 };
        this.bildResizeStartSize = { width: 0, height: 0 };
        this.bildResizeStartPosBild = { x: 0, y: 0 };
        this.hoveredBild = false;
        
        // Pan-Modus
        this.panMode = false;
        this.isPanning = false;
        this.panStartX = 0;
        this.panStartY = 0;
        this.panStartOffsetX = 0;
        this.panStartOffsetY = 0;
        
        // Undo/Redo-History
        this.history = [];
        this.historyIndex = -1;
        this.maxHistorySize = this.CONFIG.maxHistorySize; // Maximale Anzahl von Undo-Schritten
        
        
        this.setupCanvas();
        this.setupEventListeners();
        this.resizeCanvas();
        this.updateVersionDisplay();
        
        // Speichere den initialen Zustand
        this.saveState();
    }
    
    // Versionsnummer in der Anzeige aktualisieren
    updateVersionDisplay() {
        const versionElement = document.getElementById('version-info');
        if (versionElement) {
            versionElement.textContent = `Version ${this.version}`;
        }
    }
    
    // ============================================================================
    // CANVAS SETUP & RESIZE
    // ============================================================================
    
    setupCanvas() {
        // Setze die Canvas-Auflösung für scharfe Darstellung
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvasWidth * dpr;
        this.canvas.height = this.canvasHeight * dpr;
        this.canvas.style.width = this.canvasWidth + 'px';
        this.canvas.style.height = this.canvasHeight + 'px';
        this.ctx.scale(dpr, dpr);
        
        this.draw();
    }
    
    // ============================================================================
    // EVENT LISTENER SETUP
    // ============================================================================
    
    setupEventListeners() {
        // Canvas Event Listeners
        this.canvas.addEventListener('dblclick', (e) => this.handleCanvasDoubleClick(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        
        // Tastatur-Events für Bild-Löschen
        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Window Event Listeners
        window.addEventListener('resize', () => this.resizeCanvas());
        window.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        window.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        
        // Button Event Listeners
        this.drawButton.addEventListener('click', () => this.drawRectangle());
        this.clearButton.addEventListener('click', () => this.clearCanvas());
        this.undoButton.addEventListener('click', () => this.undo());
        this.redoButton.addEventListener('click', () => this.redo());
        
        // Zoom Slider Event Listener
        if (this.zoomSlider) {
            this.zoomSlider.addEventListener('input', (e) => {
                const zoomPercent = parseInt(e.target.value);
                this.zoom = zoomPercent / 100;
                this.updateZoomLevel();
                this.draw();
            });
        }
        
        this.bohneButton.addEventListener('click', () => this.openBohneModal());
        this.cutoutButton.addEventListener('click', () => this.openCutoutModal());
        this.kerbeButton.addEventListener('click', () => this.openKerbeModal());
        this.nahtlinieButton.addEventListener('click', () => this.openNahtlinieModal());
        this.lochButton.addEventListener('click', () => this.openLochModal());
        this.ausschnittButton.addEventListener('click', () => this.openAusschnittModal());
        this.crimpingButton.addEventListener('click', () => this.openCrimpingModal());
        this.textButton.addEventListener('click', () => this.openTextModal());
        this.bildButton.addEventListener('click', () => this.openBildDialog());
        this.databaseButton.addEventListener('click', () => this.openDatabaseModal());
        if (this.zeichnungsdbButton) {
            this.zeichnungsdbButton.addEventListener('click', () => this.openZeichnungenDb());
        }
        if (this.titleblockButton) this.titleblockButton.addEventListener('click', () => this.openTitleBlockModal());

        // Zeichnungen-DB Events
        if (this.zeichnungsdbModalClose) {
            this.zeichnungsdbModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeZeichnungenDb();
            });
        }
        if (this.zeichnungsdbClose) {
            this.zeichnungsdbClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeZeichnungenDb();
            });
        }
        if (this.zdbAddProjectBtn) this.zdbAddProjectBtn.addEventListener('click', () => this.zdbAddProject());
        if (this.zdbAddVariantBtn) this.zdbAddVariantBtn.addEventListener('click', () => this.zdbAddVariant());
        if (this.zdbSaveCurrentBtn) this.zdbSaveCurrentBtn.addEventListener('click', () => this.zdbSaveCurrentProfile());
        // Umbenannte Datei-Buttons: Öffnen/Speichern
        this.zdbOpenFileBtn = document.getElementById('zeichnungsdb-open-file');
        this.zdbSaveFileBtn = document.getElementById('zeichnungsdb-save-file');
        if (this.zdbSaveFileBtn) this.zdbSaveFileBtn.addEventListener('click', () => this.zdbExport());
        if (this.zdbOpenFileBtn) this.zdbOpenFileBtn.addEventListener('click', () => this.zdbFileInput && this.zdbFileInput.click());
        // Maximize/Minimize
        this.zeichnungsdbModalMaximize = document.getElementById('zeichnungsdb-modal-maximize');
        this.zeichnungsdbModalMinimize = document.getElementById('zeichnungsdb-modal-minimize');
        if (this.zeichnungsdbModalMaximize) this.zeichnungsdbModalMaximize.addEventListener('click', () => this.toggleZeichnungenDbMaximize());
        if (this.zeichnungsdbModalMinimize) this.zeichnungsdbModalMinimize.addEventListener('click', () => this.restoreZeichnungenDbSize());
        if (this.zdbFileInput) this.zdbFileInput.addEventListener('change', (e) => this.zdbHandleImport(e));
        if (this.zdbAddRefBtn) this.zdbAddRefBtn.addEventListener('click', () => this.zdbAddReference());

        // Zeichnungen-DB State
        this.zdbKey = 'pz.zeichnungsdb.v1';
        this.isZeichnungenDbMaximized = false;
        this.originalZeichnungenDbStyle = null;
        this.zdb = this.zdbLoad();
        this.zdbSelectedProjectId = null;
        this.zdbSelectedVariantId = null;
        this.zdbSelectedReferenceId = null;
        this.zdbFileName = null;
        
        // Untere Button-Leiste Event Listeners
        if (this.autoZoomButton) {
            this.autoZoomButton.addEventListener('click', () => this.autoZoom());
        }
        if (this.panButton) {
            this.panButton.addEventListener('click', () => this.togglePanMode());
        }
        if (this.pdfButton) {
            console.log('PDF-Button gefunden, Event Listener wird hinzugefügt');
            this.pdfButton.addEventListener('click', () => {
                console.log('PDF-Button geklickt!');
                this.exportToPDF();
            });
        } else {
            console.error('PDF-Button nicht gefunden! Button-ID: pdf-button');
        }
        if (this.svgButton) this.svgButton.addEventListener('click', () => this.exportToSVG());
                                                                                                                                            if (this.dxfButton) this.dxfButton.addEventListener('click', () => this.exportToDXF());
        if (this.einstellungenButton) this.einstellungenButton.addEventListener('click', () => this.openEinstellungenModal());
        
        // Einstellungen Modal Events
        // Email Confirmation Modal Events (für zukünftige Order-Funktion)
        if (this.emailConfirmationClose) this.emailConfirmationClose.addEventListener('click', () => this.closeEmailConfirmationModal());
        if (this.emailConfirmationClose2) this.emailConfirmationClose2.addEventListener('click', () => this.closeEmailConfirmationModal());
        
        if (this.einstellungenModalClose) this.einstellungenModalClose.addEventListener('click', () => this.closeEinstellungenModal());
        if (this.einstellungenCancel) this.einstellungenCancel.addEventListener('click', () => this.closeEinstellungenModal());
        if (this.einstellungenConfirm) this.einstellungenConfirm.addEventListener('click', () => this.confirmEinstellungen());
        
        this.bemaßungButton.addEventListener('click', () => {
            this.toggleDimensions();
        });
        
        // Enter-Taste für Eingabefelder
        this.widthInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.drawRectangle();
            }
        });
        
        this.heightInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.drawRectangle();
            }
        });
        
        // Modal Event Listeners
        this.bohneCancelButton.addEventListener('click', () => this.closeBohneModal());
        this.bohneConfirmButton.addEventListener('click', () => this.confirmBohne());
        if (this.bohneRemoveButton) {
            this.bohneRemoveButton.addEventListener('click', () => this.removeBohne());
        }
        this.bohneModalClose.addEventListener('click', () => this.closeBohneModal());

        // Titelblock Events
        if (this.titleblockModalClose) this.titleblockModalClose.addEventListener('click', () => this.closeTitleBlockModal());
        if (this.titleblockCancel) this.titleblockCancel.addEventListener('click', () => this.closeTitleBlockModal());
        if (this.titleblockConfirm) this.titleblockConfirm.addEventListener('click', () => this.confirmTitleBlock());
        if (this.tbFillFromDb) this.tbFillFromDb.addEventListener('click', () => this.titleBlockFillFromDb());
        if (this.tbSaveToDb) this.tbSaveToDb.addEventListener('click', () => this.titleBlockSaveToDb());
        
        this.cutoutCancelButton.addEventListener('click', () => this.closeCutoutModal());
        this.cutoutConfirmButton.addEventListener('click', () => this.confirmCutout());
        if (this.cutoutRemoveButton) {
            this.cutoutRemoveButton.addEventListener('click', () => this.removeCutout());
        }
        this.cutoutModalClose.addEventListener('click', () => this.closeCutoutModal());
        
        this.kerbeCancelButton.addEventListener('click', () => this.closeKerbeModal());
        this.kerbeConfirmButton.addEventListener('click', () => this.confirmKerbe());
        this.kerbeModalClose.addEventListener('click', () => this.closeKerbeModal());
        
        // Kerben-Typ Event Listener
        if (this.kerbeTypeSelect) {
            this.kerbeTypeSelect.addEventListener('change', () => this.updateKerbeTypeDisplay());
        }
        
        // Kerben-Tabelle Event Listeners
        if (this.addKerbeBtn) {
            this.addKerbeBtn.addEventListener('click', () => this.addKerbeRow());
        }
        if (this.openKerbenTypesModalBtn) {
            this.openKerbenTypesModalBtn.addEventListener('click', () => this.openKerbenTypesModal());
        }
        if (this.addKerbenTypeBtn) {
            this.addKerbenTypeBtn.addEventListener('click', () => this.addKerbenType());
        }
        if (this.kerbenTypesModalClose) {
            this.kerbenTypesModalClose.addEventListener('click', () => this.closeKerbenTypesModal());
        }
        if (this.kerbenTypesCancel) {
            this.kerbenTypesCancel.addEventListener('click', () => this.closeKerbenTypesModal());
        }
        if (this.kerbenTypesConfirm) {
            this.kerbenTypesConfirm.addEventListener('click', () => this.confirmKerbenTypes());
        }
        
        this.nahtlinieCancelButton.addEventListener('click', () => this.closeNahtlinieModal());
        this.nahtlinieConfirmButton.addEventListener('click', () => this.confirmNahtlinie());
        if (this.nahtlinieRemoveButton) {
            this.nahtlinieRemoveButton.addEventListener('click', () => this.removeNahtlinie());
        }
        this.nahtlinieModalClose.addEventListener('click', () => this.closeNahtlinieModal());
        
        this.lochCancelButton.addEventListener('click', () => this.closeLochModal());
        this.lochConfirmButton.addEventListener('click', () => this.confirmLoch());
        this.lochModalClose.addEventListener('click', () => this.closeLochModal());
        
        // Löcher-Tabelle Event Listeners
        if (this.addLochBtn) {
            this.addLochBtn.addEventListener('click', () => this.addLochRow());
        }
        
        // Checkbox-Event Listener für Kerben-Positionen
        if (this.lochUseKerbenPositionsCheckbox) {
            this.lochUseKerbenPositionsCheckbox.addEventListener('change', () => {
                // Wenn aktiviert, aktualisiere automatisch die Tabelle
                if (this.lochUseKerbenPositionsCheckbox.checked && this.kerben && this.kerben.length > 0) {
                    // Leere die Tabelle und füge alle Kerben-Positionen hinzu
                    const width = parseFloat(this.lochWidthInput.value) || 8;
                    const height = parseFloat(this.lochHeightInput.value) || 4;
                    const position = parseFloat(this.lochPositionInput.value) || 2;
                    
                    // Erstelle temporäre Liste mit allen Kerben-Positionen
                    const kerbenDistances = this.kerben.map(kerbe => kerbe.distance);
                    
                    // Entferne alle Löcher die nicht zu Kerben gehören (optional - oder behalte sie)
                    // Hier behalten wir alle und fügen nur neue hinzu
                    const existingDistances = this.loecher.map(loch => loch.distance);
                    
                    // Füge fehlende Kerben-Positionen hinzu
                    kerbenDistances.forEach(dist => {
                        if (!existingDistances.includes(dist)) {
                            this.loecher.push({
                                distance: dist,
                                width: width,
                                height: height,
                                position: position
                            });
                        }
                    });
                    
                    // Sortiere nach Position
                    this.loecher.sort((a, b) => a.distance - b.distance);
                    
                    this.refreshLochTable();
                }
            });
        }
        
        // Ausschnitt Modal Event Listeners
        this.ausschnittCancelButton.addEventListener('click', () => this.closeAusschnittModal());
        this.ausschnittConfirmButton.addEventListener('click', () => this.confirmAusschnitt());
        this.ausschnittModalClose.addEventListener('click', () => this.closeAusschnittModal());
        if (this.addAusschnittRowBtn) {
            this.addAusschnittRowBtn.addEventListener('click', () => this.addAusschnittRow());
        }
        
        // Crimping Modal Event Listeners
        this.crimpingCancelButton.addEventListener('click', () => this.closeCrimpingModal());
        this.crimpingConfirmButton.addEventListener('click', () => this.confirmCrimping());
        this.crimpingModalClose.addEventListener('click', () => this.closeCrimpingModal());
        if (this.addCrimpingRowBtn) {
            this.addCrimpingRowBtn.addEventListener('click', () => this.addCrimpingRow());
        }
        
        // Ausschnitt-Tabelle Event Listeners (bereits vorhanden)
        if (this.addAusschnittRowBtn) {
            this.addAusschnittRowBtn.addEventListener('click', () => this.addAusschnittRow());
        }
        
        this.textCancelButton.addEventListener('click', () => this.closeTextModal());
        this.textConfirmButton.addEventListener('click', () => this.confirmText());
        this.textModalClose.addEventListener('click', () => this.closeTextModal());
        
        // Format Modal Event Listeners
        if (this.formatApplyButton) {
            this.formatApplyButton.addEventListener('click', () => {
            });
        }
        
        if (this.formatExportPdfButton) {
            this.formatExportPdfButton.addEventListener('click', () => {
                this.exportToPdf();
            });
        }
        
        // Drag-and-Drop für Modals
        this.setupModalDragAndDrop();
    }
    
    handleCanvasDoubleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Prüfe ob auf Text geklickt wurde
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            const textWidth = this.ctx.measureText(text.content).width;
            const textHeight = parseInt(text.size);
            
            // Berechne die Bildschirmposition des Textes (mit Zoom und Offset)
            const screenX = text.x * this.zoom + this.offsetX;
            const screenY = text.y * this.zoom + this.offsetY;
            
            // Erweiterte Hitbox (+10 Pixel)
            if (mouseX >= screenX - 10 && mouseX <= screenX + textWidth + 10 &&
                mouseY >= screenY - textHeight - 10 && mouseY <= screenY + 10) {
                // Text wurde doppelgeklickt - öffne Modal zum Bearbeiten
                this.selectedTextForEdit = text;
                this.textContentInput.value = text.content;
                this.textSizeInput.value = text.size;
                this.openTextModal();
                return;
            }
        }
    }
    
    handleCanvasClick(e) {
        // Einfacher Klick - verhindere, wenn Text gerade gedraggt wurde
        // (um Konflikt zwischen click und mousedown zu vermeiden)
        if (this.draggedText) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    
    // ============================================================================
    // EVENT HANDLING (Maus & Tastatur)
    // ============================================================================
    
    handleWheel(e) {
        e.preventDefault();
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        const newZoom = Math.max(0.1, Math.min(5, this.zoom * zoomFactor));
        
        // Zoom um das Canvas-Zentrum (Koordinatensystem bleibt zentriert)
        this.offsetX = this.canvasWidth / 2;
        this.offsetY = this.canvasHeight / 2;
        
        this.zoom = newZoom;
        this.updateZoomLevel();
        this.draw();
    }
    
    handleMouseDown(e) {
        if (this.draggedText || this.draggedSkizze || this.resizingSkizze || this.draggedKerbe || this.draggedLoch || this.draggedDimension || this.draggedBild || this.resizingBild) {
            // Element wird bereits gedraggt
            return;
        }
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Pan-Modus aktiviert
        if (this.panMode) {
            this.isPanning = true;
            this.panStartX = mouseX;
            this.panStartY = mouseY;
            this.panStartOffsetX = this.offsetX;
            this.panStartOffsetY = this.offsetY;
            this.canvas.style.cursor = 'grabbing';
            return;
        }
        
        // Prüfe ob auf Skizze-Resize-Handle geklickt wurde (höchste Priorität)
        if (this.loadedProfileSkizze && this.skizzeX !== null && this.skizzeY !== null) {
            const screenSkizzeX = this.skizzeX * this.zoom + this.offsetX;
            const screenSkizzeY = this.skizzeY * this.zoom + this.offsetY;
            const screenSkizzeWidth = this.skizzeWidth * this.zoom;
            const screenSkizzeHeight = this.skizzeHeight * this.zoom;
            
            const handleSize = 8;
            const handles = [
                { x: screenSkizzeX, y: screenSkizzeY, type: 'nw' },
                { x: screenSkizzeX + screenSkizzeWidth, y: screenSkizzeY, type: 'ne' },
                { x: screenSkizzeX, y: screenSkizzeY + screenSkizzeHeight, type: 'sw' },
                { x: screenSkizzeX + screenSkizzeWidth, y: screenSkizzeY + screenSkizzeHeight, type: 'se' }
            ];
            
            for (const handle of handles) {
                if (mouseX >= handle.x - handleSize/2 && mouseX <= handle.x + handleSize/2 &&
                    mouseY >= handle.y - handleSize/2 && mouseY <= handle.y + handleSize/2) {
                    this.resizingSkizze = true;
                    this.resizeHandle = handle.type;
                    this.resizeStartPos = { x: mouseX, y: mouseY };
                    this.resizeStartSize = { width: this.skizzeWidth, height: this.skizzeHeight };
                    this.resizeStartPosSkizze = { x: this.skizzeX, y: this.skizzeY };
                    e.preventDefault();
                    this.canvas.style.cursor = this.getResizeCursor(handle.type);
                    this.draw();
                    return;
                }
            }
            
            // Prüfe ob auf Skizze geklickt wurde (zum Verschieben)
            if (mouseX >= screenSkizzeX - 5 && mouseX <= screenSkizzeX + screenSkizzeWidth + 5 &&
                mouseY >= screenSkizzeY - 5 && mouseY <= screenSkizzeY + screenSkizzeHeight + 5) {
                this.draggedSkizze = true;
                this.skizzeDragOffset.x = mouseX - screenSkizzeX;
                this.skizzeDragOffset.y = mouseY - screenSkizzeY;
                e.preventDefault();
                this.canvas.style.cursor = 'grabbing';
                this.draw();
                return;
            }
        }
        
        // Prüfe ob auf Bild geklickt wurde (Resize-Handles oder Drag)
        if (this.bildImage && this.bildImage.complete && this.bildX !== null && this.bildY !== null) {
            const screenBildX = this.bildX * this.zoom + this.offsetX;
            const screenBildY = this.bildY * this.zoom + this.offsetY;
            const screenBildWidth = this.bildWidth * this.zoom;
            const screenBildHeight = this.bildHeight * this.zoom;
            
            const handleSize = 8;
            const handles = [
                { x: screenBildX, y: screenBildY, type: 'nw' },
                { x: screenBildX + screenBildWidth, y: screenBildY, type: 'ne' },
                { x: screenBildX, y: screenBildY + screenBildHeight, type: 'sw' },
                { x: screenBildX + screenBildWidth, y: screenBildY + screenBildHeight, type: 'se' }
            ];
            
            for (const handle of handles) {
                if (mouseX >= handle.x - handleSize/2 && mouseX <= handle.x + handleSize/2 &&
                    mouseY >= handle.y - handleSize/2 && mouseY <= handle.y + handleSize/2) {
                    this.resizingBild = true;
                    this.bildResizeHandle = handle.type;
                    this.bildResizeStartPos = { x: mouseX, y: mouseY };
                    this.bildResizeStartSize = { width: this.bildWidth, height: this.bildHeight };
                    this.bildResizeStartPosBild = { x: this.bildX, y: this.bildY };
                    e.preventDefault();
                    this.canvas.style.cursor = this.getResizeCursor(handle.type);
                    this.draw();
                    return;
                }
            }
            
            // Prüfe ob auf Bild geklickt wurde (zum Verschieben)
            if (mouseX >= screenBildX - 5 && mouseX <= screenBildX + screenBildWidth + 5 &&
                mouseY >= screenBildY - 5 && mouseY <= screenBildY + screenBildHeight + 5) {
                this.draggedBild = true;
                this.bildDragOffset.x = mouseX - screenBildX;
                this.bildDragOffset.y = mouseY - screenBildY;
                e.preventDefault();
                this.canvas.style.cursor = 'grabbing';
                this.draw();
                return;
            }
        }
        
        // Prüfe ob auf Text geklickt wurde (mit erweiterter Hitbox)
        for (let i = this.texts.length - 1; i >= 0; i--) {
            const text = this.texts[i];
            const textWidth = this.ctx.measureText(text.content).width;
            const textHeight = parseInt(text.size);
            
            // Berechne die Bildschirmposition des Textes (mit Zoom und Offset)
            const screenX = text.x * this.zoom + this.offsetX;
            const screenY = text.y * this.zoom + this.offsetY;
            
            // Erweiterte Hitbox (+10 Pixel in alle Richtungen) für einfacheres Greifen
            if (mouseX >= screenX - 10 && mouseX <= screenX + textWidth + 10 &&
                mouseY >= screenY - textHeight - 10 && mouseY <= screenY + 10) {
                this.draggedText = text;
                this.textDragOffset.x = mouseX - screenX;
                this.textDragOffset.y = mouseY - screenY;
                e.preventDefault(); // Verhindere weitere Events
                this.canvas.style.cursor = 'grabbing'; // Zeige Greif-Cursor
                this.draw(); // Sofort aktualisieren
                return; // Sofort beenden
            }
        }
        
        // Prüfe ob auf Loch geklickt wurde (vor Kerben, da Löcher kleiner sind)
        if (this.currentRect && this.loecher.length > 0) {
            for (let i = this.loecher.length - 1; i >= 0; i--) {
                const loch = this.loecher[i];
                const distancePx = loch.distance * this.mmToPx;
                const widthPx = loch.width * this.mmToPx;
                const heightPx = loch.height * this.mmToPx;
                const positionPx = (loch.position || this.CONFIG.defaultLochPositionFromTop) * this.mmToPx;
                
                const rect = this.currentRect;
                const lochX = rect.x + distancePx;
                const lochY = rect.y + positionPx + (heightPx / 2); // Mittelpunkt des Lochs
                
                // Berechne die Bildschirmposition (mit Zoom und Offset)
                const screenX = lochX * this.zoom + this.offsetX;
                const screenY = lochY * this.zoom + this.offsetY;
                const screenWidth = widthPx * this.zoom;
                const screenHeight = heightPx * this.zoom;
                
                // Erweiterte Hitbox (ca. 10 Pixel in alle Richtungen für besseres Greifen)
                const hitboxSize = 10;
                const minX = screenX - screenWidth/2 - hitboxSize;
                const maxX = screenX + screenWidth/2 + hitboxSize;
                const minY = screenY - screenHeight/2 - hitboxSize;
                const maxY = screenY + screenHeight/2 + hitboxSize;
                
                if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
                    this.draggedLoch = loch;
                    this.lochDragOffset.x = mouseX - screenX;
                    this.hoveredLoch = null; // Reset hover beim Dragging
                    e.preventDefault();
                    this.canvas.style.cursor = 'grabbing';
                    this.draw();
                    return;
                }
            }
        }

        // Prüfe ob auf Kerbe geklickt wurde
        if (this.currentRect && this.kerben.length > 0) {
            for (let i = this.kerben.length - 1; i >= 0; i--) {
                const kerbe = this.kerben[i];
                const distancePx = kerbe.distance * this.mmToPx;
                
                // Hole Maße aus dem Kerben-Typ (Rückwärtskompatibilität für alte Kerben)
                let widthPx, depthPx, type;
                if (kerbe.kerbenTypeId) {
                    // Neue Struktur: Hole Maße aus Kerben-Typ
                    const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                    if (!kerbenType) continue; // Überspringe wenn Typ nicht gefunden
                    widthPx = kerbenType.width * this.mmToPx;
                    depthPx = kerbenType.depth * this.mmToPx;
                    type = kerbenType.type || 'triangle';
                } else {
                    // Alte Struktur: Direkt aus Kerbe (für Rückwärtskompatibilität)
                    widthPx = (kerbe.width || 6) * this.mmToPx;
                    depthPx = (kerbe.depth || 4) * this.mmToPx;
                    type = kerbe.type || 'triangle';
                }
                
                const rect = this.currentRect;
                const kerbeX = rect.x + distancePx;
                
                // Berechne Y-Position der Kerbe
                let kerbeY;
                if (kerbe.position === 'oben') {
                    kerbeY = rect.y;
                } else {
                    kerbeY = rect.y + rect.height;
                }
                
                // Berechne die Bildschirmposition (mit Zoom und Offset)
                const screenX = kerbeX * this.zoom + this.offsetX;
                const screenY = kerbeY * this.zoom + this.offsetY;
                const screenWidth = widthPx * this.zoom;
                const screenDepth = depthPx * this.zoom;
                
                // Erweiterte Hitbox (ca. 15 Pixel in alle Richtungen)
                // Für Strichmarkierung: kleinere Hitbox (nur Höhe relevant)
                const hitboxSize = 15;
                const hitboxWidth = (type === 'marker') ? 10 : screenWidth/2; // Bei Marker: kleinere Breite
                
                if (kerbe.position === 'oben') {
                    // Kerbe oben - Hitbox geht von Kerbe nach unten
                    if (mouseX >= screenX - hitboxWidth - hitboxSize && mouseX <= screenX + hitboxWidth + hitboxSize &&
                        mouseY >= screenY - hitboxSize && mouseY <= screenY + screenDepth + hitboxSize) {
                        this.draggedKerbe = kerbe;
                        this.kerbeDragOffset.x = mouseX - screenX;
                        this.hoveredKerbe = null; // Reset hover beim Dragging
                        e.preventDefault();
                        this.canvas.style.cursor = 'grabbing';
                        this.draw();
                        return;
                    }
                } else {
                    // Kerbe unten - Hitbox geht von Kerbe nach oben
                    if (mouseX >= screenX - hitboxWidth - hitboxSize && mouseX <= screenX + hitboxWidth + hitboxSize &&
                        mouseY >= screenY - screenDepth - hitboxSize && mouseY <= screenY + hitboxSize) {
                        this.draggedKerbe = kerbe;
                        this.kerbeDragOffset.x = mouseX - screenX;
                        this.hoveredKerbe = null; // Reset hover beim Dragging
                        e.preventDefault();
                        this.canvas.style.cursor = 'grabbing';
                        this.draw();
                        return;
                    }
                }
            }
        }

        // Prüfe ob auf Bemaßungslinie geklickt wurde (nur wenn Bemaßungen aktiv)
        if (this.showDimensions && this.currentRect) {
            // Konvertiere Mausposition zu Weltkoordinaten
            const worldX = (mouseX - this.offsetX) / this.zoom;
            const worldY = (mouseY - this.offsetY) / this.zoom;
            
            const hitboxSize = 5 * this.mmToPx; // 5mm Hitbox um die Linie
            
            // Prüfe horizontale Bemaßungen (oben)
            if (this.horizontalDimensionsTop && this.horizontalDimensionsTop.length > 0) {
                for (let i = this.horizontalDimensionsTop.length - 1; i >= 0; i--) {
                    const dim = this.horizontalDimensionsTop[i];
                    const minX = Math.min(dim.startX, dim.endX) - hitboxSize;
                    const maxX = Math.max(dim.startX, dim.endX) + hitboxSize;
                    const minY = dim.y - hitboxSize;
                    const maxY = dim.y + hitboxSize;
                    
                    if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                        this.draggedDimension = { type: 'horizontal', index: dim.index, location: 'top' };
                        this.dimensionDragOffset.y = mouseY - (dim.y * this.zoom + this.offsetY);
                        this.hoveredDimension = null;
                        e.preventDefault();
                        this.canvas.style.cursor = 'ns-resize'; // Vertikaler Resize-Cursor
                        this.draw();
                        return;
                    }
                }
            }
            
            // Prüfe horizontale Bemaßungen (unten)
            if (this.horizontalDimensionsBottom && this.horizontalDimensionsBottom.length > 0) {
                for (let i = this.horizontalDimensionsBottom.length - 1; i >= 0; i--) {
                    const dim = this.horizontalDimensionsBottom[i];
                    const minX = Math.min(dim.startX, dim.endX) - hitboxSize;
                    const maxX = Math.max(dim.startX, dim.endX) + hitboxSize;
                    const minY = dim.y - hitboxSize;
                    const maxY = dim.y + hitboxSize;
                    
                    if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                        this.draggedDimension = { type: 'horizontal', index: dim.index, location: 'bottom' };
                        this.dimensionDragOffset.y = mouseY - (dim.y * this.zoom + this.offsetY);
                        this.hoveredDimension = null;
                        e.preventDefault();
                        this.canvas.style.cursor = 'ns-resize'; // Vertikaler Resize-Cursor
                        this.draw();
                        return;
                    }
                }
            }
            
            // Prüfe vertikale Bemaßungen (rechts)
            if (this.verticalDimensions && this.verticalDimensions.length > 0) {
                for (let i = this.verticalDimensions.length - 1; i >= 0; i--) {
                    const dim = this.verticalDimensions[i];
                    const minX = dim.x - hitboxSize;
                    const maxX = dim.x + hitboxSize;
                    const minY = Math.min(dim.startY, dim.endY) - hitboxSize;
                    const maxY = Math.max(dim.startY, dim.endY) + hitboxSize;
                    
                    if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                        this.draggedDimension = { type: 'vertical', index: dim.index, location: 'right' };
                        this.dimensionDragOffset.x = mouseX - (dim.x * this.zoom + this.offsetX);
                        this.hoveredDimension = null;
                        e.preventDefault();
                        this.canvas.style.cursor = 'ew-resize'; // Horizontaler Resize-Cursor
                        this.draw();
                        return;
                    }
                }
            }
        }

        // Prüfe Titelblock-Klick (Drag)
        if (this.titleBlock && this.titleBlock.x != null) {
            const tbX1 = this.titleBlock.x * this.zoom + this.offsetX;
            const tbY1 = this.titleBlock.y * this.zoom + this.offsetY;
            const tbX2 = (this.titleBlock.x + this.titleBlock.width) * this.zoom + this.offsetX;
            const tbY2 = (this.titleBlock.y + this.titleBlock.height) * this.zoom + this.offsetY;
            if (mouseX >= tbX1 && mouseX <= tbX2 && mouseY >= tbY1 && mouseY <= tbY2) {
                this.titleBlock.dragging = true;
                this.titleBlockDragOffset.x = (mouseX - this.offsetX) / this.zoom - this.titleBlock.x;
                this.titleBlockDragOffset.y = (mouseY - this.offsetY) / this.zoom - this.titleBlock.y;
                e.preventDefault();
                this.canvas.style.cursor = 'grabbing';
                this.draw();
                return;
            }
        }
    }
    
    getResizeCursor(handleType) {
        switch(handleType) {
            case 'nw': return 'nw-resize';
            case 'ne': return 'ne-resize';
            case 'sw': return 'sw-resize';
            case 'se': return 'se-resize';
            default: return 'default';
        }
    }
    
    handleMouseMove(e) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
        if (this.resizingBild) {
            // Resize-Modus für Bild
            const deltaX = (mouseX - this.bildResizeStartPos.x) / this.zoom;
            const deltaY = (mouseY - this.bildResizeStartPos.y) / this.zoom;
            
            const minSize = 10 * this.mmToPx; // Minimale Größe
            
            switch(this.bildResizeHandle) {
                case 'nw':
                    this.bildWidth = Math.max(minSize, this.bildResizeStartSize.width - deltaX);
                    this.bildHeight = Math.max(minSize, this.bildResizeStartSize.height - deltaY);
                    this.bildX = this.bildResizeStartPosBild.x + (this.bildResizeStartSize.width - this.bildWidth);
                    this.bildY = this.bildResizeStartPosBild.y + (this.bildResizeStartSize.height - this.bildHeight);
                    break;
                case 'ne':
                    this.bildWidth = Math.max(minSize, this.bildResizeStartSize.width + deltaX);
                    this.bildHeight = Math.max(minSize, this.bildResizeStartSize.height - deltaY);
                    this.bildX = this.bildResizeStartPosBild.x;
                    this.bildY = this.bildResizeStartPosBild.y + (this.bildResizeStartSize.height - this.bildHeight);
                    break;
                case 'sw':
                    this.bildWidth = Math.max(minSize, this.bildResizeStartSize.width - deltaX);
                    this.bildHeight = Math.max(minSize, this.bildResizeStartSize.height + deltaY);
                    this.bildX = this.bildResizeStartPosBild.x + (this.bildResizeStartSize.width - this.bildWidth);
                    this.bildY = this.bildResizeStartPosBild.y;
                    break;
                case 'se':
                    this.bildWidth = Math.max(minSize, this.bildResizeStartSize.width + deltaX);
                    this.bildHeight = Math.max(minSize, this.bildResizeStartSize.height + deltaY);
                    this.bildX = this.bildResizeStartPosBild.x;
                    this.bildY = this.bildResizeStartPosBild.y;
                    break;
            }
            this.draw();
        } else if (this.resizingSkizze) {
            // Resize-Modus
            const deltaX = (mouseX - this.resizeStartPos.x) / this.zoom;
            const deltaY = (mouseY - this.resizeStartPos.y) / this.zoom;
            
            const minSize = 10 * this.mmToPx; // Minimale Größe
            
            switch(this.resizeHandle) {
                case 'nw':
                    this.skizzeWidth = Math.max(minSize, this.resizeStartSize.width - deltaX);
                    this.skizzeHeight = Math.max(minSize, this.resizeStartSize.height - deltaY);
                    this.skizzeX = this.resizeStartPosSkizze.x + (this.resizeStartSize.width - this.skizzeWidth);
                    this.skizzeY = this.resizeStartPosSkizze.y + (this.resizeStartSize.height - this.skizzeHeight);
                    break;
                case 'ne':
                    this.skizzeWidth = Math.max(minSize, this.resizeStartSize.width + deltaX);
                    this.skizzeHeight = Math.max(minSize, this.resizeStartSize.height - deltaY);
                    this.skizzeX = this.resizeStartPosSkizze.x;
                    this.skizzeY = this.resizeStartPosSkizze.y + (this.resizeStartSize.height - this.skizzeHeight);
                    break;
                case 'sw':
                    this.skizzeWidth = Math.max(minSize, this.resizeStartSize.width - deltaX);
                    this.skizzeHeight = Math.max(minSize, this.resizeStartSize.height + deltaY);
                    this.skizzeX = this.resizeStartPosSkizze.x + (this.resizeStartSize.width - this.skizzeWidth);
                    this.skizzeY = this.resizeStartPosSkizze.y;
                    break;
                case 'se':
                    this.skizzeWidth = Math.max(minSize, this.resizeStartSize.width + deltaX);
                    this.skizzeHeight = Math.max(minSize, this.resizeStartSize.height + deltaY);
                    this.skizzeX = this.resizeStartPosSkizze.x;
                    this.skizzeY = this.resizeStartPosSkizze.y;
                    break;
            }
            this.draw();
        } else if (this.draggedBild) {
            // Verschiebe Bild
            const newX = (mouseX - this.bildDragOffset.x - this.offsetX) / this.zoom;
            const newY = (mouseY - this.bildDragOffset.y - this.offsetY) / this.zoom;
            this.bildX = newX;
            this.bildY = newY;
            this.draw();
        } else if (this.draggedSkizze) {
            // Verschiebe Skizze
            const newX = (mouseX - this.skizzeDragOffset.x - this.offsetX) / this.zoom;
            const newY = (mouseY - this.skizzeDragOffset.y - this.offsetY) / this.zoom;
            this.skizzeX = newX;
            this.skizzeY = newY;
            this.draw();
        } else if (this.draggedText) {
            // Berechne die neue Position in Weltkoordinaten
            const newX = (mouseX - this.textDragOffset.x - this.offsetX) / this.zoom;
            const newY = (mouseY - this.textDragOffset.y - this.offsetY) / this.zoom;
            
            this.draggedText.x = newX;
            this.draggedText.y = newY;
            
            this.draw();
        } else if (this.draggedLoch) {
            // Berechne neue X-Position in Weltkoordinaten (nur X, nicht Y)
            const worldX = (mouseX - this.offsetX - this.lochDragOffset.x) / this.zoom;
            
            // Berechne neue Distance basierend auf Profil-Start
            if (this.currentRect) {
                let newDistance = (worldX - this.currentRect.x) / this.mmToPx;
                
                // Begrenze auf sinnvolle Werte (0 bis Profilbreite)
                const maxDistance = this.currentRect.width / this.mmToPx;
                newDistance = Math.max(0, Math.min(maxDistance, newDistance));
                
                // Runde auf 5mm-Schritte (Snapping)
                newDistance = Math.round(newDistance / this.CONFIG.kerbeSnapStep) * this.CONFIG.kerbeSnapStep;
                newDistance = Math.max(0, Math.min(maxDistance, newDistance)); // Nochmal begrenzen nach Runden
                
                this.draggedLoch.distance = newDistance;
            }
            
            this.draw();
        } else if (this.draggedKerbe) {
            // Berechne neue X-Position in Weltkoordinaten (nur X, nicht Y)
            const worldX = (mouseX - this.offsetX - this.kerbeDragOffset.x) / this.zoom;
            
            // Berechne neue Distance basierend auf Profil-Start
            if (this.currentRect) {
                let newDistance = (worldX - this.currentRect.x) / this.mmToPx;
                
                // Begrenze auf sinnvolle Werte (0 bis Profilbreite)
                const maxDistance = this.currentRect.width / this.mmToPx;
                newDistance = Math.max(0, Math.min(maxDistance, newDistance));
                
                // Runde auf 5mm-Schritte (Snapping)
                newDistance = Math.round(newDistance / this.CONFIG.kerbeSnapStep) * this.CONFIG.kerbeSnapStep;
                newDistance = Math.max(0, Math.min(maxDistance, newDistance)); // Nochmal begrenzen nach Runden
                
                this.draggedKerbe.distance = newDistance;
            }
            
            this.draw();
        } else if (this.draggedDimension) {
            // Bemaßungslinie wird verschoben
            if (this.draggedDimension.type === 'horizontal') {
                // Horizontale Linie: Verschiebe in Y-Richtung
                const worldY = (mouseY - this.offsetY - this.dimensionDragOffset.y) / this.zoom;
                
                // Finde die ursprüngliche Y-Position (ohne Offset)
                let baseY;
                if (this.draggedDimension.location === 'top') {
                    const dim = this.horizontalDimensionsTop && this.horizontalDimensionsTop.find(d => d.index === this.draggedDimension.index);
                    if (dim) {
                        // Berechne baseY ohne Offset (subtract current offset)
                        const currentOffset = this.dimensionOffsets.horizontal[this.draggedDimension.index] || 0;
                        baseY = dim.y - currentOffset;
                    } else {
                        this.draw();
                        return;
                    }
                } else {
                    const dim = this.horizontalDimensionsBottom && this.horizontalDimensionsBottom.find(d => d.index === this.draggedDimension.index);
                    if (dim) {
                        const currentOffset = this.dimensionOffsets.horizontal[this.draggedDimension.index] || 0;
                        baseY = dim.y - currentOffset;
                    } else {
                        this.draw();
                        return;
                    }
                }
                
                // Setze neuen Offset direkt (nicht kumulativ)
                this.dimensionOffsets.horizontal[this.draggedDimension.index] = worldY - baseY;
            } else if (this.draggedDimension.type === 'vertical') {
                // Vertikale Linie: Verschiebe in X-Richtung
                const worldX = (mouseX - this.offsetX - this.dimensionDragOffset.x) / this.zoom;
                
                // Finde die ursprüngliche X-Position (ohne Offset)
                const dim = this.verticalDimensions && this.verticalDimensions.find(d => d.index === this.draggedDimension.index);
                if (dim) {
                    const currentOffset = this.dimensionOffsets.vertical[this.draggedDimension.index] || 0;
                    const baseX = dim.x - currentOffset;
                    
                    // Setze neuen Offset direkt (nicht kumulativ)
                    this.dimensionOffsets.vertical[this.draggedDimension.index] = worldX - baseX;
                }
            }
            
            this.draw();
        } else if (this.titleBlock && this.titleBlock.dragging) {
            // Titelblock drag
            const worldX = (mouseX - this.offsetX) / this.zoom;
            const worldY = (mouseY - this.offsetY) / this.zoom;
            this.titleBlock.x = worldX - this.titleBlockDragOffset.x;
            this.titleBlock.y = worldY - this.titleBlockDragOffset.y;
            this.canvas.style.cursor = 'grabbing';
            this.draw();
        } else if (this.isPanning) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            // Berechne die Verschiebung
            const deltaX = mouseX - this.panStartX;
            const deltaY = mouseY - this.panStartY;
            
            // Update Offset
            this.offsetX = this.panStartOffsetX + deltaX;
            this.offsetY = this.panStartOffsetY + deltaY;
            
            this.draw();
        } else {
            // Hover-Tracking für Texte
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            let foundHover = false;
            for (let i = this.texts.length - 1; i >= 0; i--) {
                const text = this.texts[i];
                const textWidth = this.ctx.measureText(text.content).width;
                const textHeight = parseInt(text.size);
                
                // Berechne die Bildschirmposition des Textes (mit Zoom und Offset)
                const screenX = text.x * this.zoom + this.offsetX;
                const screenY = text.y * this.zoom + this.offsetY;
                
                // Erweiterte Hitbox (+10 Pixel in alle Richtungen)
                if (mouseX >= screenX - 10 && mouseX <= screenX + textWidth + 10 &&
                    mouseY >= screenY - textHeight - 10 && mouseY <= screenY + 10) {
                    if (this.hoveredText !== text) {
                        this.hoveredText = text;
            this.draw();
                    }
                    foundHover = true;
                    break;
                }
            }
            
            if (!foundHover && this.hoveredText) {
                this.hoveredText = null;
                this.draw();
            }
            
            // Hover-Tracking für Löcher
            if (this.currentRect && this.loecher.length > 0 && !this.draggedLoch) {
                let foundLochHover = false;
                
                for (let i = this.loecher.length - 1; i >= 0; i--) {
                    const loch = this.loecher[i];
                    const distancePx = loch.distance * this.mmToPx;
                    const widthPx = loch.width * this.mmToPx;
                    const heightPx = loch.height * this.mmToPx;
                    const positionPx = (loch.position || this.CONFIG.defaultLochPositionFromTop) * this.mmToPx;
                    
                    const rect = this.currentRect;
                    const lochX = rect.x + distancePx;
                    const lochY = rect.y + positionPx + (heightPx / 2); // Mittelpunkt des Lochs
                    
                    // Berechne die Bildschirmposition (mit Zoom und Offset)
                    const screenX = lochX * this.zoom + this.offsetX;
                    const screenY = lochY * this.zoom + this.offsetY;
                    const screenWidth = widthPx * this.zoom;
                    const screenHeight = heightPx * this.zoom;
                    
                    // Erweiterte Hitbox (ca. 10 Pixel in alle Richtungen)
                    const hitboxSize = 10;
                    const minX = screenX - screenWidth/2 - hitboxSize;
                    const maxX = screenX + screenWidth/2 + hitboxSize;
                    const minY = screenY - screenHeight/2 - hitboxSize;
                    const maxY = screenY + screenHeight/2 + hitboxSize;
                    
                    if (mouseX >= minX && mouseX <= maxX && mouseY >= minY && mouseY <= maxY) {
                        if (this.hoveredLoch !== loch) {
                            this.hoveredLoch = loch;
                            this.draw();
                        }
                        foundLochHover = true;
                        this.canvas.style.cursor = 'grab';
                        break;
                    }
                }
                
                if (!foundLochHover && this.hoveredLoch) {
                    this.hoveredLoch = null;
                    this.canvas.style.cursor = 'default';
                    this.draw();
                }
            }
            
            // Hover-Tracking für Kerben
            if (this.currentRect && this.kerben.length > 0 && !this.draggedKerbe) {
                let foundKerbeHover = false;
                
                for (let i = this.kerben.length - 1; i >= 0; i--) {
                    const kerbe = this.kerben[i];
                    const distancePx = kerbe.distance * this.mmToPx;
                    
                    // Hole Maße aus dem Kerben-Typ (Rückwärtskompatibilität für alte Kerben)
                    let widthPx, depthPx;
                    if (kerbe.kerbenTypeId) {
                        // Neue Struktur: Hole Maße aus Kerben-Typ
                        const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                        if (!kerbenType) continue; // Überspringe wenn Typ nicht gefunden
                        widthPx = kerbenType.width * this.mmToPx;
                        depthPx = kerbenType.depth * this.mmToPx;
                    } else {
                        // Alte Struktur: Direkt aus Kerbe (für Rückwärtskompatibilität)
                        widthPx = (kerbe.width || 6) * this.mmToPx;
                        depthPx = (kerbe.depth || 4) * this.mmToPx;
                    }
                    
                    const rect = this.currentRect;
                    const kerbeX = rect.x + distancePx;
                    
                    // Berechne Y-Position der Kerbe
                    let kerbeY;
                    if (kerbe.position === 'oben') {
                        kerbeY = rect.y;
                    } else {
                        kerbeY = rect.y + rect.height;
                    }
                    
                    // Berechne die Bildschirmposition (mit Zoom und Offset)
                    const screenX = kerbeX * this.zoom + this.offsetX;
                    const screenY = kerbeY * this.zoom + this.offsetY;
                    const screenWidth = widthPx * this.zoom;
                    const screenDepth = depthPx * this.zoom;
                    
                    // Hole Typ für Hitbox-Anpassung
                    let kerbenType;
                    if (kerbe.kerbenTypeId) {
                        kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                    }
                    const kerbenTypeType = kerbenType ? (kerbenType.type || 'triangle') : (kerbe.type || 'triangle');
                    
                    // Erweiterte Hitbox (ca. 15 Pixel in alle Richtungen)
                    // Für Strichmarkierung: kleinere Hitbox (nur Höhe relevant)
                    const hitboxSize = 15;
                    const hitboxWidth = (kerbenTypeType === 'marker') ? 10 : screenWidth/2; // Bei Marker: kleinere Breite
                    
                    if (kerbe.position === 'oben') {
                        // Kerbe oben - Hitbox geht von Kerbe nach unten
                        if (mouseX >= screenX - hitboxWidth - hitboxSize && mouseX <= screenX + hitboxWidth + hitboxSize &&
                            mouseY >= screenY - hitboxSize && mouseY <= screenY + screenDepth + hitboxSize) {
                            if (this.hoveredKerbe !== kerbe) {
                                this.hoveredKerbe = kerbe;
                                this.draw();
                            }
                            foundKerbeHover = true;
                            this.canvas.style.cursor = 'grab';
                            break;
                        }
                    } else {
                        // Kerbe unten - Hitbox geht von Kerbe nach oben
                        if (mouseX >= screenX - hitboxWidth - hitboxSize && mouseX <= screenX + hitboxWidth + hitboxSize &&
                            mouseY >= screenY - screenDepth - hitboxSize && mouseY <= screenY + hitboxSize) {
                            if (this.hoveredKerbe !== kerbe) {
                                this.hoveredKerbe = kerbe;
                                this.draw();
                            }
                            foundKerbeHover = true;
                            this.canvas.style.cursor = 'grab';
                            break;
                        }
                    }
                }
                
                if (!foundKerbeHover && this.hoveredKerbe) {
                    this.hoveredKerbe = null;
                    this.canvas.style.cursor = 'default';
                    this.draw();
                }
            }
            
            // Hover-Tracking für Bemaßungslinien (nur wenn Bemaßungen aktiv)
            if (this.showDimensions && this.currentRect && !this.draggedDimension) {
                const worldX = (mouseX - this.offsetX) / this.zoom;
                const worldY = (mouseY - this.offsetY) / this.zoom;
                const hitboxSize = 5 * this.mmToPx;
                let foundDimensionHover = false;
                
                // Prüfe horizontale Bemaßungen (oben)
                if (this.horizontalDimensionsTop && this.horizontalDimensionsTop.length > 0) {
                    for (let i = this.horizontalDimensionsTop.length - 1; i >= 0; i--) {
                        const dim = this.horizontalDimensionsTop[i];
                        const minX = Math.min(dim.startX, dim.endX) - hitboxSize;
                        const maxX = Math.max(dim.startX, dim.endX) + hitboxSize;
                        const minY = dim.y - hitboxSize;
                        const maxY = dim.y + hitboxSize;
                        
                        if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                            const hoverKey = `horizontal-top-${dim.index}`;
                            if (this.hoveredDimension !== hoverKey) {
                                this.hoveredDimension = hoverKey;
                                this.canvas.style.cursor = 'ns-resize';
                                this.draw();
                            }
                            foundDimensionHover = true;
                            break;
                        }
                    }
                }
                
                // Prüfe horizontale Bemaßungen (unten)
                if (!foundDimensionHover && this.horizontalDimensionsBottom && this.horizontalDimensionsBottom.length > 0) {
                    for (let i = this.horizontalDimensionsBottom.length - 1; i >= 0; i--) {
                        const dim = this.horizontalDimensionsBottom[i];
                        const minX = Math.min(dim.startX, dim.endX) - hitboxSize;
                        const maxX = Math.max(dim.startX, dim.endX) + hitboxSize;
                        const minY = dim.y - hitboxSize;
                        const maxY = dim.y + hitboxSize;
                        
                        if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                            const hoverKey = `horizontal-bottom-${dim.index}`;
                            if (this.hoveredDimension !== hoverKey) {
                                this.hoveredDimension = hoverKey;
                                this.canvas.style.cursor = 'ns-resize';
                                this.draw();
                            }
                            foundDimensionHover = true;
                            break;
                        }
                    }
                }
                
                // Prüfe vertikale Bemaßungen (rechts)
                if (!foundDimensionHover && this.verticalDimensions && this.verticalDimensions.length > 0) {
                    for (let i = this.verticalDimensions.length - 1; i >= 0; i--) {
                        const dim = this.verticalDimensions[i];
                        const minX = dim.x - hitboxSize;
                        const maxX = dim.x + hitboxSize;
                        const minY = Math.min(dim.startY, dim.endY) - hitboxSize;
                        const maxY = Math.max(dim.startY, dim.endY) + hitboxSize;
                        
                        if (worldX >= minX && worldX <= maxX && worldY >= minY && worldY <= maxY) {
                            const hoverKey = `vertical-right-${dim.index}`;
                            if (this.hoveredDimension !== hoverKey) {
                                this.hoveredDimension = hoverKey;
                                this.canvas.style.cursor = 'ew-resize';
                                this.draw();
                            }
                            foundDimensionHover = true;
                            break;
                        }
                    }
                }
                
                if (!foundDimensionHover && this.hoveredDimension) {
                    this.hoveredDimension = null;
                    this.canvas.style.cursor = 'default';
                    this.draw();
                }
            }
            
            // Hover-Tracking für Bild
            if (this.bildImage && this.bildImage.complete && this.bildX !== null && this.bildY !== null && !this.draggedBild && !this.resizingBild) {
                const screenBildX = this.bildX * this.zoom + this.offsetX;
                const screenBildY = this.bildY * this.zoom + this.offsetY;
                const screenBildWidth = this.bildWidth * this.zoom;
                const screenBildHeight = this.bildHeight * this.zoom;
                
                if (mouseX >= screenBildX - 5 && mouseX <= screenBildX + screenBildWidth + 5 &&
                    mouseY >= screenBildY - 5 && mouseY <= screenBildY + screenBildHeight + 5) {
                    if (!this.hoveredBild) {
                        this.hoveredBild = true;
                        this.draw();
                    }
                    
                    // Cursor für Resize-Handles
                    const handleSize = 8;
                    const handles = [
                        { x: screenBildX, y: screenBildY, type: 'nw' },
                        { x: screenBildX + screenBildWidth, y: screenBildY, type: 'ne' },
                        { x: screenBildX, y: screenBildY + screenBildHeight, type: 'sw' },
                        { x: screenBildX + screenBildWidth, y: screenBildY + screenBildHeight, type: 'se' }
                    ];
                    
                    let overHandle = false;
                    for (const handle of handles) {
                        if (mouseX >= handle.x - handleSize/2 && mouseX <= handle.x + handleSize/2 &&
                            mouseY >= handle.y - handleSize/2 && mouseY <= handle.y + handleSize/2) {
                            this.canvas.style.cursor = this.getResizeCursor(handle.type);
                            overHandle = true;
                            break;
                        }
                    }
                    if (!overHandle) {
                        this.canvas.style.cursor = 'move';
                    }
                } else {
                    if (this.hoveredBild) {
                        this.hoveredBild = false;
                        this.canvas.style.cursor = 'default';
                        this.draw();
                    }
                }
            } else {
                if (this.hoveredBild) {
                    this.hoveredBild = false;
                    this.canvas.style.cursor = 'default';
                    this.draw();
                }
            }
            
            // Hover-Tracking für Skizze
            if (this.loadedProfileSkizze && this.skizzeX !== null && this.skizzeY !== null) {
                const screenSkizzeX = this.skizzeX * this.zoom + this.offsetX;
                const screenSkizzeY = this.skizzeY * this.zoom + this.offsetY;
                const screenSkizzeWidth = this.skizzeWidth * this.zoom;
                const screenSkizzeHeight = this.skizzeHeight * this.zoom;
                
                // Prüfe ob Maus über Skizze ist
                if (mouseX >= screenSkizzeX - 5 && mouseX <= screenSkizzeX + screenSkizzeWidth + 5 &&
                    mouseY >= screenSkizzeY - 5 && mouseY <= screenSkizzeY + screenSkizzeHeight + 5) {
                    if (!this.hoveredSkizze) {
                        this.hoveredSkizze = true;
                        this.draw();
                    }
                } else {
                    if (this.hoveredSkizze) {
                        this.hoveredSkizze = false;
                        this.canvas.style.cursor = 'default';
                        this.draw();
                    }
                }
                
                // Cursor für Resize-Handles
                if (this.hoveredSkizze) {
                    const handleSize = 8;
                    const handles = [
                        { x: screenSkizzeX, y: screenSkizzeY, type: 'nw' },
                        { x: screenSkizzeX + screenSkizzeWidth, y: screenSkizzeY, type: 'ne' },
                        { x: screenSkizzeX, y: screenSkizzeY + screenSkizzeHeight, type: 'sw' },
                        { x: screenSkizzeX + screenSkizzeWidth, y: screenSkizzeY + screenSkizzeHeight, type: 'se' }
                    ];
                    
                    let overHandle = false;
                    for (const handle of handles) {
                        if (mouseX >= handle.x - handleSize/2 && mouseX <= handle.x + handleSize/2 &&
                            mouseY >= handle.y - handleSize/2 && mouseY <= handle.y + handleSize/2) {
                            this.canvas.style.cursor = this.getResizeCursor(handle.type);
                            overHandle = true;
                            break;
                        }
                    }
                    if (!overHandle) {
                        this.canvas.style.cursor = 'move';
                    }
                }
            } else {
                if (this.hoveredSkizze) {
                    this.hoveredSkizze = false;
                    this.canvas.style.cursor = 'default';
                    this.draw();
                }
            }
            // Hover-Tracking für Titelblock
            this.hoveredTitleBlock = false;
            if (this.titleBlock && this.titleBlock.x != null) {
                const tbX1 = this.titleBlock.x * this.zoom + this.offsetX;
                const tbY1 = this.titleBlock.y * this.zoom + this.offsetY;
                const tbX2 = (this.titleBlock.x + this.titleBlock.width) * this.zoom + this.offsetX;
                const tbY2 = (this.titleBlock.y + this.titleBlock.height) * this.zoom + this.offsetY;
                if (mouseX >= tbX1 && mouseX <= tbX2 && mouseY >= tbY1 && mouseY <= tbY2) {
                    this.hoveredTitleBlock = true;
                    if (!this.draggedKerbe && !this.draggedLoch && !this.draggedSkizze && !this.resizingSkizze && !this.draggedBild && !this.resizingBild) {
                        this.canvas.style.cursor = 'grab';
                    }
                    this.draw();
                }
            }
        }
    }
    
    handleMouseUp(e) {
        if (this.resizingBild) {
            this.resizingBild = false;
            this.bildResizeHandle = null;
            this.canvas.style.cursor = 'default';
            this.saveState();
            this.draw();
        }
        
        if (this.draggedBild) {
            this.draggedBild = false;
            this.bildDragOffset = { x: 0, y: 0 };
            this.canvas.style.cursor = 'default';
            this.saveState();
            this.draw();
        }
        
        if (this.resizingSkizze) {
            this.resizingSkizze = false;
            this.resizeHandle = null;
            this.canvas.style.cursor = 'default';
            this.saveState();
            this.draw();
        }
        
        if (this.draggedSkizze) {
            this.draggedSkizze = false;
            this.skizzeDragOffset = { x: 0, y: 0 };
            this.canvas.style.cursor = 'default';
            this.saveState();
            this.draw();
        }
        
        if (this.draggedLoch) {
            // Speichere State nach Verschiebung
            this.saveState();
            
            // Aktualisiere Tabelle im Modal, wenn es geöffnet ist
            if (this.lochModal && this.lochModal.style.display === 'block') {
                this.refreshLochTable();
            }
            
            this.draggedLoch = null;
            this.lochDragOffset = { x: 0, y: 0 };
            this.hoveredLoch = null; // Reset hover beim Loslassen
            this.canvas.style.cursor = 'default';
            this.draw();
        }
        
        if (this.draggedKerbe) {
            // Speichere State nach Verschiebung
            this.saveState();
            
            // Aktualisiere Tabelle im Modal, wenn es geöffnet ist
            // keepUserInputs = false, damit die neuen Positionen aus this.kerben angezeigt werden
            if (this.kerbeModal && !this.kerbeModal.classList.contains('hidden')) {
                this.refreshKerbeTable(false);
            }
            
            this.draggedKerbe = null;
            this.kerbeDragOffset = { x: 0, y: 0 };
            this.hoveredKerbe = null; // Reset hover beim Loslassen
            this.canvas.style.cursor = 'default';
            this.draw();
        }
        
        if (this.draggedDimension) {
            // Speichere State nach Verschiebung der Bemaßungslinie
            this.saveState();
            
            this.draggedDimension = null;
            this.dimensionDragOffset = { x: 0, y: 0 };
            this.hoveredDimension = null;
            this.canvas.style.cursor = 'default';
            this.draw();
        }
        
        if (this.draggedText) {
        this.draggedText = null;
        this.textDragOffset = { x: 0, y: 0 };
            this.canvas.style.cursor = 'default'; // Cursor zurücksetzen
            this.saveState(); // Speichere Position nach dem Verschieben
            this.draw();
        }
        
        if (this.isPanning) {
            this.isPanning = false;
            if (this.panMode) {
                this.canvas.style.cursor = 'grab';
            }
        }

        if (this.titleBlock && this.titleBlock.dragging) {
            this.titleBlock.dragging = false;
            this.titleBlockDragOffset = { x: 0, y: 0 };
            this.canvas.style.cursor = 'default';
            this.saveState();
            this.draw();
        }
    }
    
    resizeCanvas() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight - this.CONFIG.menuBarHeight;
        
        // Stelle sicher, dass die Canvas-Größe gleichmäßig ist
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        // Setze die Canvas-Auflösung für scharfe Darstellung
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = this.canvasWidth * dpr;
        this.canvas.height = this.canvasHeight * dpr;
        this.canvas.style.width = this.canvasWidth + 'px';
        this.canvas.style.height = this.canvasHeight + 'px';
        this.ctx.scale(dpr, dpr);
        
        this.draw();
    }
    
    updateZoomLevel() {
        const zoomPercent = Math.round(this.zoom * 100);
        this.zoomLevel.textContent = zoomPercent + '%';
        
        // Aktualisiere auch den Slider
        if (this.zoomSlider) {
            this.zoomSlider.value = zoomPercent;
        }
    }
    
    // ============================================================================
    // PROFIL-ERSTELLUNG & LÖSCHEN
    // ============================================================================
    
    drawRectangle() {
        const width = parseFloat(this.widthInput.value);
        const height = parseFloat(this.heightInput.value);
        
        if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
            alert('Bitte gültige Breite und Höhe eingeben!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Zeichnen
        
        // Berechne die Pixel-Dimensionen
        const widthPx = width * this.mmToPx;
        const heightPx = height * this.mmToPx;
        
        // Prüfe ob bereits ein Profil existiert
        const hasExistingProfile = this.currentRect !== null;
        
        // Aktualisiere oder erstelle das Rechteck
        if (hasExistingProfile) {
            // Aktualisiere das bestehende Profil
            // Speichere die alten Werte
            const oldY = this.currentRect.y;
            const oldHeightPx = this.currentRect.height;
            
            // Aktualisiere Breite und Höhe
            this.currentRect.width = widthPx;
            this.currentRect.height = heightPx;
            
            // Y-Position anpassen, wenn sich die Höhe ändert, um Zentrierung beizubehalten
            const heightDiff = heightPx - oldHeightPx;
            this.currentRect.y = oldY - (heightDiff / 2);
        } else {
            // Erstelle neues Profil
        this.currentRect = {
            x: 0, // Start bei x=0 für korrekte Bemaßungen
            y: -heightPx / 2, // Zentriert in Y-Richtung
            width: widthPx,
            height: heightPx,
            scale: 1
        };
        }
        
        this.updateZoomLevel();
        this.draw();
        this.autoZoom();
        
        // Aktualisiere die Eingabefelder NACH draw() und autoZoom()
        // damit die Werte nicht überschrieben werden
        this.widthInput.value = width;
        this.heightInput.value = height;
    }
    
    // Aktualisiere die Eingabefelder mit den aktuellen Profilwerten
    // WICHTIG: Diese Funktion sollte nur aufgerufen werden, wenn ein Profil geladen wird,
    // nicht nach dem Ändern der Werte durch den Benutzer
    updateProfileInputs() {
        if (this.currentRect && this.widthInput && this.heightInput) {
            const widthMm = this.currentRect.width / this.mmToPx;
            const heightMm = this.currentRect.height / this.mmToPx;
            // Verwende die exakten Werte ohne Rundung, um Benutzereingaben nicht zu überschreiben
            this.widthInput.value = widthMm;
            this.heightInput.value = heightMm;
        }
    }
    
    clearCanvas() {
        this.saveState(); // Speichere Zustand vor dem Löschen
        this.currentRect = null;
        this.bohnen = [];
        this.kerben = [];
        this.kerbenTypes = [];
        this.loecher = [];
        this.ausschnitte = [];
        this.crimping = [];
        this.nahtlinie = null;
        this.texts = [];
        this.showDimensions = false;
        this.showFormatBorder = false;
        this.loadedProfileSkizze = null;
        this.loadedSkizzeImage = null;
        this.skizzeX = null;
        this.skizzeY = null;
        this.bildImage = null;
        this.bildX = null;
        this.bildY = null;
        this.draw();
    }
    
    // Hilfsfunktion für tiefe Kopie (Deep Clone)
    // Verwendet structuredClone() wenn verfügbar (moderne Browser), sonst JSON-Fallback
    _deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (typeof structuredClone !== 'undefined') {
            return structuredClone(obj);
        }
        // Fallback für ältere Browser
        return JSON.parse(JSON.stringify(obj));
    }
    
    // ============================================================================
    // STATE MANAGEMENT (Undo/Redo)
    // ============================================================================
    
    // Speichert den aktuellen Zustand in die History
    saveState() {
        const state = {
            currentRect: this.currentRect ? { ...this.currentRect } : null,
            bohnen: this._deepClone(this.bohnen),
            kerben: this._deepClone(this.kerben),
            kerbenTypes: this._deepClone(this.kerbenTypes),
            loecher: this._deepClone(this.loecher),
            ausschnitte: this._deepClone(this.ausschnitte),
            crimping: this._deepClone(this.crimping),
            nahtlinie: this.nahtlinie ? { ...this.nahtlinie } : null,
            texts: this._deepClone(this.texts),
            showDimensions: this.showDimensions,
            showFormatBorder: this.showFormatBorder,
            zoom: this.zoom,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            skizzeX: this.skizzeX,
            skizzeY: this.skizzeY,
            skizzeWidth: this.skizzeWidth,
            skizzeHeight: this.skizzeHeight,
            bildX: this.bildX,
            bildY: this.bildY,
            bildWidth: this.bildWidth,
            bildHeight: this.bildHeight,
            bildImageSrc: this.bildImage && this.bildImage.src ? this.bildImage.src : null,
            titleBlock: this._deepClone(this.titleBlock),
            dimensionOffsets: this._deepClone(this.dimensionOffsets)
        };
        
        // Lösche alle Zustände nach dem aktuellen Index (wenn wir nach einem Undo neue Aktionen machen)
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Füge neuen Zustand hinzu
        this.history.push(state);
        this.historyIndex++;
        
        // Begrenze die History-Größe
        if (this.history.length > this.CONFIG.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }
    
    // Stellt einen gespeicherten Zustand wieder her
    restoreState(state) {
        this.currentRect = state && state.currentRect ? { ...state.currentRect } : null;
        this.bohnen = state && state.bohnen ? this._deepClone(state.bohnen) : [];
        this.kerben = state && state.kerben ? this._deepClone(state.kerben) : [];
        this.kerbenTypes = state && state.kerbenTypes ? this._deepClone(state.kerbenTypes) : [];
        this.loecher = state && state.loecher ? this._deepClone(state.loecher) : [];
        this.ausschnitte = state && state.ausschnitte ? this._deepClone(state.ausschnitte) : [];
        this.crimping = state && state.crimping ? this._deepClone(state.crimping) : [];
        this.nahtlinie = state && state.nahtlinie ? { ...state.nahtlinie } : null;
        this.texts = state && state.texts ? this._deepClone(state.texts) : [];
        this.titleBlock = state && state.titleBlock ? this._deepClone(state.titleBlock) : this.titleBlock;
        this.showDimensions = state && typeof state.showDimensions === 'boolean' ? state.showDimensions : this.showDimensions || false;
        this.showFormatBorder = state && typeof state.showFormatBorder === 'boolean' ? state.showFormatBorder : false;
        this.zoom = state && typeof state.zoom === 'number' ? state.zoom : this.zoom || 1;
        this.offsetX = state && typeof state.offsetX === 'number' ? state.offsetX : this.offsetX || (this.canvasWidth / 2);
        this.offsetY = state && typeof state.offsetY === 'number' ? state.offsetY : this.offsetY || (this.canvasHeight / 2);
        this.skizzeX = state.skizzeX !== undefined ? state.skizzeX : null;
        this.skizzeY = state.skizzeY !== undefined ? state.skizzeY : null;
        this.skizzeWidth = state.skizzeWidth !== undefined ? state.skizzeWidth : (40 * this.mmToPx);
        this.skizzeHeight = state.skizzeHeight !== undefined ? state.skizzeHeight : (30 * this.mmToPx);
        this.bildX = state.bildX !== undefined ? state.bildX : null;
        this.bildY = state.bildY !== undefined ? state.bildY : null;
        this.bildWidth = state.bildWidth !== undefined ? state.bildWidth : (60 * this.mmToPx);
        this.bildHeight = state.bildHeight !== undefined ? state.bildHeight : (40 * this.mmToPx);
        // Lade Bild neu wenn vorhanden
        if (state.bildImageSrc) {
            const img = new Image();
            img.onload = () => {
                this.bildImage = img;
                this.draw();
            };
            img.src = state.bildImageSrc;
        } else {
            this.bildImage = null;
        }
        this.dimensionOffsets = state.dimensionOffsets ? this._deepClone(state.dimensionOffsets) : { horizontal: [], vertical: [] };
        
        // Aktualisiere die Eingabefelder mit den wiederhergestellten Werten
        this.updateProfileInputs();
        
        this.draw();
    }
    
    // Macht die letzte Aktion rückgängig
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            this.updateUndoRedoButtons();
        }
    }
    
    // Wiederholt eine rückgängig gemachte Aktion
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.restoreState(state);
            this.updateUndoRedoButtons();
        }
    }
    
    // Aktualisiert die Aktivierungszustände der Undo/Redo-Buttons
    updateUndoRedoButtons() {
        // Aktiviere/Deaktiviere Undo-Button
        if (this.historyIndex > 0) {
            this.undoButton.disabled = false;
            this.undoButton.style.opacity = '1';
            this.undoButton.style.cursor = 'pointer';
        } else {
            this.undoButton.disabled = true;
            this.undoButton.style.opacity = '0.5';
            this.undoButton.style.cursor = 'not-allowed';
        }
        
        // Aktiviere/Deaktiviere Redo-Button
        if (this.historyIndex < this.history.length - 1) {
            this.redoButton.disabled = false;
            this.redoButton.style.opacity = '1';
            this.redoButton.style.cursor = 'pointer';
        } else {
            this.redoButton.disabled = true;
            this.redoButton.style.opacity = '0.5';
            this.redoButton.style.cursor = 'not-allowed';
        }
    }
    
    // ============================================================================
    // CANVAS & ZEICHNUNGEN (Haupt-Zeichenfunktionen)
    // ============================================================================
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        
        // Zeichne Gitter (immer gleich groß, unabhängig vom Zoom)
        this.drawGrid();
        
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Zeichne Koordinatenkreuz (immer sichtbar)
        this.drawCoordinateCross();
        
        if (this.currentRect) {
            // Zeichne Hauptprofil
            this.drawProfile();
            
            // Zeichne Bohne
            this.drawBohnen();
            
            // Zeichne Kerben
            this.drawKerben();
            
            // Zeichne Löcher
            this.drawLoecher();
            
            // Zeichne Nahtlinie
            this.drawNahtlinie();
            
            // Zeichne Ausschnitte
            this.drawAusschnitte();
            
            // Zeichne Crimping
            this.drawCrimping();
            
            // Zeichne Profil-Skizze (falls geladen)
            this.drawSkizze();
            
            // Zeichne Bild (falls geladen)
            this.drawBild();
            
            // Zeichne Bemaßungen
            if (this.showDimensions) {
                this.drawDimensions();
            }
            
            // Zeichne Detail-Indikatoren
            this.drawDetailIndicators();
        }
        
        // Zeichne Texte am Ende (immer im Vordergrund)
        this.drawTexts();
        // Zeichne Titelblock (immer im Vordergrund)
        this.drawTitleBlock();
        
        this.ctx.restore();
        
        // Zeichne Format-Rand (außerhalb der Transformation)
        this.drawFormatBorder();
    }
    
    drawGrid() {
        // Immer weißer Hintergrund
        this.ctx.fillStyle = this.CONFIG.colors.background;
        this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
    
    drawCoordinateCross() {
        // Koordinatensystem NUR anzeigen wenn KEIN Profil existiert
        if (this.currentRect) return;
        
        // Koordinatenkreuz in der Canvas-Mitte anzeigen
        const centerX = 0;
        const centerY = 0;
        
        const axisLength = 50;
        
        // Stil für Koordinatenkreuz - Grün mit dünnen Linien
        this.ctx.strokeStyle = '#00AA00'; // Grün
        this.ctx.fillStyle = '#00AA00'; // Grün
        this.ctx.lineWidth = 0.5; // Sehr dünne Linien
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // X-Achse (horizontal)
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + axisLength, centerY);
        this.ctx.stroke();
        
        // X-Achse Pfeil
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + axisLength, centerY);
        this.ctx.lineTo(centerX + axisLength - 8, centerY - 4);
        this.ctx.lineTo(centerX + axisLength - 8, centerY + 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // X-Label
        this.ctx.fillText('X', centerX + axisLength + 15, centerY);
        
        // Y-Achse (vertikal)
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX, centerY - axisLength);
        this.ctx.stroke();
        
        // Y-Achse Pfeil
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY - axisLength);
        this.ctx.lineTo(centerX - 4, centerY - axisLength + 8);
        this.ctx.lineTo(centerX + 4, centerY - axisLength + 8);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Y-Label
        this.ctx.fillText('Y', centerX, centerY - axisLength - 15);
    }
    
    drawProfile() {
        if (!this.currentRect) return;
        
        const rect = this.currentRect;
        
        // Prüfe ob Cut-out angewendet wurde
        if (this.cutoutWidth > 0) {
            this.drawCutoutProfile();
        } else {
            // Profil mit Berücksichtigung von Kerben zeichnen
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = '#E0E0E0'; // Hellgrau
            
            // Sammle alle Kerben sortiert nach Position (nur Dreieck-Typ, nicht Marker)
            const kerbenOben = this.kerben.filter(k => k.position === 'oben' && (k.type !== 'marker')).sort((a, b) => a.distance - b.distance);
            const kerbenUnten = this.kerben.filter(k => k.position === 'unten' && (k.type !== 'marker')).sort((a, b) => a.distance - b.distance);
            
            // Zeichne Profil als Pfad mit Unterbrechungen bei Kerben
            this.ctx.beginPath();
            
            // Startpunkt: oben links
            this.ctx.moveTo(rect.x, rect.y);
            
            // Obere Kante mit Unterbrechungen bei Kerben oben
            let currentX = rect.x;
            for (const kerbe of kerbenOben) {
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                // Nur wenn Kerbe innerhalb der oberen Kante liegt
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width) {
                    // Linie bis zur Kerbe (nur wenn es noch Platz gibt)
                    if (kerbeStartX > currentX) {
                        this.ctx.lineTo(kerbeStartX, rect.y);
                    }
                    // Kerbe überspringen - wir setzen nur currentX weiter, zeichnen aber keine Linie
                    currentX = Math.max(currentX, kerbeEndX);
                }
            }
            
            // Rest der oberen Kante
            if (currentX < rect.x + rect.width) {
                this.ctx.lineTo(rect.x + rect.width, rect.y);
            }
            
            // Rechte Kante (nach unten)
            this.ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            
            // Untere Kante mit Unterbrechungen bei Kerben unten (von rechts nach links)
            currentX = rect.x + rect.width;
            for (const kerbe of kerbenUnten) {
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                // Nur wenn Kerbe innerhalb der unteren Kante liegt
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width) {
                    // Linie bis zur Kerbe (von rechts nach links)
                    if (kerbeEndX < currentX) {
                        this.ctx.lineTo(kerbeEndX, rect.y + rect.height);
                    }
                    // Kerbe überspringen
                    currentX = Math.min(currentX, kerbeStartX);
                }
            }
            
            // Rest der unteren Kante
            if (currentX > rect.x) {
                this.ctx.lineTo(rect.x, rect.y + rect.height);
            }
            
            // Linke Kante (nach oben zurück)
            this.ctx.lineTo(rect.x, rect.y);
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    drawCutoutProfile() {
        if (!this.currentRect) return;
        
        const rect = this.currentRect;
        const cutoutWidthPx = this.cutoutWidth * this.mmToPx;
        const cutoutHeightPx = this.cutoutHeight * this.mmToPx;
        
        // Berechne die Eckpunkte des Cut-out-Profils
        const x1 = rect.x + cutoutWidthPx; // Ecke 1 nach rechts verschoben
        const y1 = rect.y;
        const x2 = rect.x + rect.width - cutoutWidthPx; // Ecke 2 nach links verschoben
        const y2 = rect.y;
        const x3 = rect.x + rect.width; // Ecke 3 unverändert
        const y3 = rect.y + rect.height;
        const x4 = rect.x; // Ecke 4 unverändert
        const y4 = rect.y + rect.height;
        
        // Wenn Höhe angegeben ist, füge zusätzliche Punkte hinzu
        let points = [
            { x: x1, y: y1 },
            { x: x2, y: y2 },
            { x: x3, y: y3 },
            { x: x4, y: y4 }
        ];
        
        if (this.cutoutHeight > 0) {
            // Punkt zwischen Ecke 2 und 3 (von Ecke 3 aus vertikal nach oben)
            const x5 = x3;
            const y5 = y3 - cutoutHeightPx;
            
            // Punkt zwischen Ecke 4 und 1 (von Ecke 4 aus vertikal nach oben)
            const x6 = x4;
            const y6 = y4 - cutoutHeightPx;
            
            points = [
                { x: x1, y: y1 },
                { x: x2, y: y2 },
                { x: x5, y: y5 },
                { x: x3, y: y3 },
                { x: x4, y: y4 },
                { x: x6, y: y6 }
            ];
        }
        
        // Zeichne das Cut-out-Profil (Kerben werden separat überzeichnet)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#E0E0E0'; // Hellgrau
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawBohnen() {
        if (!this.currentRect || this.bohnen.length === 0) return;
        
        const rect = this.currentRect;
        const bohne = this.bohnen[0]; // Nur eine Bohne
        
        // Berechne die Breite der Bohne (angepasst an Cut-out)
        let bohneWidth = rect.width;
        if (this.cutoutWidth > 0) {
            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
        }
        
        const bohneHeight = bohne.height * this.mmToPx;
        const bohneX = rect.x + (rect.width - bohneWidth) / 2; // Zentriert
        const bohneY = rect.y - bohneHeight; // Direkt über dem Profil
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.fillStyle = '#36454F'; // Anthrazit
        
        this.ctx.beginPath();
        this.ctx.rect(bohneX, bohneY, bohneWidth, bohneHeight);
        this.ctx.fill();
        this.ctx.stroke();
    }
    
    drawKerben() {
        if (!this.currentRect || this.kerben.length === 0) return;
        
        const rect = this.currentRect;
        
        this.kerben.forEach(kerbe => {
            const distancePx = kerbe.distance * this.mmToPx;
            
            // Hole Maße aus dem Kerben-Typ (Rückwärtskompatibilität für alte Kerben)
            let widthPx, depthPx, type;
            
            if (kerbe.kerbenTypeId) {
                // Neue Struktur: Hole Maße aus Kerben-Typ
                const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                if (!kerbenType) return; // Überspringe wenn Typ nicht gefunden
                widthPx = kerbenType.width * this.mmToPx;
                depthPx = kerbenType.depth * this.mmToPx;
                // WICHTIG: Hole den Typ explizit, mit Fallback
                type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
            } else {
                // Alte Struktur: Direkt aus Kerbe (für Rückwärtskompatibilität)
                widthPx = (kerbe.width || 6) * this.mmToPx;
                depthPx = (kerbe.depth || 4) * this.mmToPx;
                type = kerbe.type || 'triangle';
            }
            
            // Hervorhebung wenn gehovered oder gedraggt
            const isHovered = this.hoveredKerbe === kerbe;
            const isDragged = this.draggedKerbe === kerbe;
            
            let kerbeX, kerbeY;
            
            if (kerbe.position === 'oben') {
                kerbeX = rect.x + distancePx;
                kerbeY = rect.y;
            } else {
                kerbeX = rect.x + distancePx;
                kerbeY = rect.y + rect.height;
            }
            
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = 'white';
            
            if (type === 'marker') {
                // Hervorhebung wenn gehovered oder gedraggt
                if (isHovered || isDragged) {
                    this.ctx.strokeStyle = isDragged ? '#ff6600' : '#0066cc';
                    this.ctx.lineWidth = 3;
                } else {
                    this.ctx.strokeStyle = '#333';
                    this.ctx.lineWidth = 1;
                }
                
                // Strich-Markierung: Senkrecht zur Profillinie ins Profil rein ragen
                const lineLength = depthPx; // Höhe der Markierung
                
                this.ctx.beginPath();
                if (kerbe.position === 'oben') {
                    // Markierung oben: Senkrechte Linie nach unten ins Profil
                    this.ctx.moveTo(kerbeX, kerbeY);
                    this.ctx.lineTo(kerbeX, kerbeY + lineLength);
                } else {
                    // Markierung unten: Senkrechte Linie nach oben ins Profil
                    this.ctx.moveTo(kerbeX, kerbeY);
                    this.ctx.lineTo(kerbeX, kerbeY - lineLength);
                }
                this.ctx.stroke();
            } else {
                // Dreieck (Standard): Spitze nach innen - als weißer Ausschnitt
                // Hervorhebung wenn gehovered oder gedraggt
                if (isHovered || isDragged) {
                    // Zeichne Rahmen um die Kerbe
                    this.ctx.strokeStyle = isDragged ? '#ff6600' : '#0066cc'; // Orange wenn gedraggt, Blau wenn gehovered
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([]);
                    const highlightSize = 8;
                this.ctx.beginPath();
                if (kerbe.position === 'oben') {
                        this.ctx.rect(kerbeX - widthPx/2 - highlightSize, kerbeY - highlightSize, 
                                     widthPx + 2*highlightSize, depthPx + 2*highlightSize);
                    } else {
                        this.ctx.rect(kerbeX - widthPx/2 - highlightSize, kerbeY - depthPx - highlightSize, 
                                     widthPx + 2*highlightSize, depthPx + 2*highlightSize);
                    }
                    this.ctx.stroke();
                }
                
                // Zuerst: Die durchgehende Profillinie an dieser Stelle mit Hintergrundfarbe überdecken
                this.ctx.strokeStyle = '#E0E0E0'; // Gleiche Farbe wie Profil-Hintergrund
                this.ctx.lineWidth = 2; // Etwas dicker, um sicher zu überdecken
                this.ctx.lineCap = 'butt';
                this.ctx.beginPath();
                if (kerbe.position === 'oben') {
                    this.ctx.moveTo(kerbeX - widthPx/2, kerbeY);
                    this.ctx.lineTo(kerbeX + widthPx/2, kerbeY);
                } else {
                    this.ctx.moveTo(kerbeX - widthPx/2, kerbeY);
                    this.ctx.lineTo(kerbeX + widthPx/2, kerbeY);
                }
                this.ctx.stroke();
                
                // Dann: Die Kerbe als Dreieck zeichnen
                this.ctx.strokeStyle = '#333'; // Zurück zu schwarz für Umriss
                this.ctx.lineWidth = 1;
                this.ctx.fillStyle = 'white';
                this.ctx.beginPath();
                if (kerbe.position === 'oben') {
                    // Kerbe oben: Spitze in der Mitte der Kerbe nach unten
                    this.ctx.moveTo(kerbeX - widthPx/2, kerbeY); // Links oben
                    this.ctx.lineTo(kerbeX, kerbeY + depthPx); // Spitze nach unten
                    this.ctx.lineTo(kerbeX + widthPx/2, kerbeY); // Rechts oben
                    this.ctx.closePath();
                } else {
                    // Kerbe unten: Spitze in der Mitte der Kerbe nach oben
                    this.ctx.moveTo(kerbeX - widthPx/2, kerbeY); // Links unten
                    this.ctx.lineTo(kerbeX, kerbeY - depthPx); // Spitze nach oben
                    this.ctx.lineTo(kerbeX + widthPx/2, kerbeY); // Rechts unten
                this.ctx.closePath();
                }
                this.ctx.fill();
                this.ctx.stroke();
            }
        });
    }
    
    drawLoecher() {
        if (!this.currentRect || this.loecher.length === 0) return;
        
        const rect = this.currentRect;
        
        this.loecher.forEach(loch => {
            const distancePx = loch.distance * this.mmToPx;
            const widthPx = loch.width * this.mmToPx;
            const heightPx = loch.height * this.mmToPx;
            const positionPx = (loch.position || this.CONFIG.defaultLochPositionFromTop) * this.mmToPx;
            
            const lochX = rect.x + distancePx;
            // Position ist Abstand von oben (Standard 2mm)
            // lochY ist Mittelpunkt des Lochs
            const lochY = rect.y + positionPx + (heightPx / 2);
            
            // Hervorhebung wenn gehovered oder gedraggt
            const isHovered = this.hoveredLoch === loch;
            const isDragged = this.draggedLoch === loch;
            
            // Zeichne Highlight-Rahmen wenn gehovered oder gedraggt
            if (isHovered || isDragged) {
                this.ctx.strokeStyle = isDragged ? this.CONFIG.colors.drag : this.CONFIG.colors.highlight;
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([]);
                const highlightSize = 5;
                const x = lochX - widthPx/2 - highlightSize;
                const y = lochY - heightPx/2 - highlightSize;
                const w = widthPx + 2*highlightSize;
                const h = heightPx + 2*highlightSize;
                this.ctx.beginPath();
                if (Math.abs(widthPx - heightPx) < 0.1) {
                    // Kreis
                    this.ctx.arc(lochX, lochY, widthPx/2 + highlightSize, 0, 2 * Math.PI);
                } else {
                    // Kapsel - rechteckiger Rahmen
                    this.ctx.rect(x, y, w, h);
                }
                this.ctx.stroke();
            }
            
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.fillStyle = 'white';
            
            // Kreis
            if (Math.abs(widthPx - heightPx) < 0.1) {
            this.ctx.beginPath();
                this.ctx.arc(lochX, lochY, widthPx / 2, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.stroke();
                return;
            }
            
            // Kapsel (Stadion-Form) über gerundetes Rechteck
            const radius = Math.min(widthPx, heightPx) / 2;
            const x = lochX - widthPx / 2;
            const y = lochY - heightPx / 2;
            
            this.ctx.beginPath();
            if (typeof this.ctx.roundRect === 'function') {
                this.ctx.roundRect(x, y, widthPx, heightPx, radius);
            } else {
                // Fallback für ältere Browser: generisches Rounded-Rect
                const r = radius;
                const rRight = x + widthPx - r;
                const rBottom = y + heightPx - r;
                this.ctx.moveTo(x + r, y);
                this.ctx.lineTo(rRight, y);
                this.ctx.arc(rRight, y + r, r, -Math.PI / 2, 0, false);
                this.ctx.lineTo(x + widthPx, rBottom);
                this.ctx.arc(rRight, rBottom, r, 0, Math.PI / 2, false);
                this.ctx.lineTo(x + r, y + heightPx);
                this.ctx.arc(x + r, rBottom, r, Math.PI / 2, Math.PI, false);
                this.ctx.lineTo(x, y + r);
                this.ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2, false);
            }
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });
    }
    
    drawNahtlinie() {
        if (!this.currentRect || !this.nahtlinie) return;
        
        const rect = this.currentRect;
        const distancePx = this.nahtlinie.distance * this.mmToPx;
        const y = rect.y + rect.height - distancePx;
        
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 1;
        
        if (this.nahtlinie.type === 'dashed') {
            // Gestrichelte Linie
            this.ctx.setLineDash([10, 5]);
            this.ctx.beginPath();
            this.ctx.moveTo(rect.x, y);
            this.ctx.lineTo(rect.x + rect.width, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
        } else if (this.nahtlinie.type === 'holes') {
            // Linie mit kleinen Löchern (1mm Durchmesser)
            const holeDiameter = 1 * this.mmToPx; // 1mm in Pixel
            const holeSpacing = 3 * this.mmToPx; // 3mm Abstand zwischen Löchern
            
            this.ctx.fillStyle = '#333';
            
            for (let x = rect.x; x <= rect.x + rect.width; x += holeSpacing) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, holeDiameter / 2, 0, 2 * Math.PI);
                this.ctx.fill();
            }
        }
    }
    
    drawTexts() {
        this.texts.forEach(text => {
            const textWidth = this.ctx.measureText(text.content).width;
            const textHeight = parseInt(text.size);
            
            // Prüfe ob Text gehovert wird
            const isHovered = text === this.hoveredText;
            
            // Unsichtbarer Hintergrund für bessere Trefferchance (erweitert)
            if (isHovered) {
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)'; // Gelber Hintergrund beim Hover
            } else {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0)'; // Unsichtbar, aber vorhanden für Hitbox
            }
            this.ctx.fillRect(text.x - 10, text.y - textHeight - 10, textWidth + 20, textHeight + 20);
            
            // Text zeichnen
            this.ctx.fillStyle = '#333';
            this.ctx.font = `${text.size}px Arial`;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText(text.content, text.x, text.y);
            
            // Rahmen beim Hover
            if (isHovered) {
                this.ctx.strokeStyle = '#ffaa00'; // Orange-gelber Rahmen
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(text.x - 10, text.y - textHeight - 10, textWidth + 20, textHeight + 20);
            }
        });
    }
    
    drawSkizze() {
        if (!this.loadedProfileSkizze || !this.currentRect) return;
        
        const rect = this.currentRect;
        
        // Initialisiere Position wenn noch nicht gesetzt
        if (this.skizzeX === null || this.skizzeY === null) {
        const skizzeOffset = 40 * this.mmToPx; // 40mm Abstand vom Profil
            this.skizzeX = rect.x + rect.width + skizzeOffset;
            this.skizzeY = rect.y; // Oben bündig mit dem Profil
        }
        
        // Zeichne Hintergrund-Frame (erweitert für Hover-Effekt)
        if (this.hoveredSkizze && !this.draggedSkizze && !this.resizingSkizze) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.1)'; // Gelber Hintergrund beim Hover
            this.ctx.fillRect(this.skizzeX - 5, this.skizzeY - 5, this.skizzeWidth + 10, this.skizzeHeight + 10);
        }
        
        // Zeichne Rahmen um die Skizze
        this.ctx.strokeStyle = (this.hoveredSkizze || this.draggedSkizze || this.resizingSkizze) ? '#ffaa00' : '#666';
        this.ctx.lineWidth = (this.hoveredSkizze || this.draggedSkizze || this.resizingSkizze) ? 2 : 1;
        this.ctx.strokeRect(this.skizzeX, this.skizzeY, this.skizzeWidth, this.skizzeHeight);
        
        // Prüfe ob Skizze bereits als Image-Objekt geladen ist
        if (this.loadedSkizzeImage && this.loadedSkizzeImage.complete) {
            // Skizze ist bereits geladen, zeichne sie direkt
            this.drawLoadedSkizze(this.skizzeX, this.skizzeY, this.skizzeWidth, this.skizzeHeight);
        } else if (this.loadedProfileSkizze.startsWith('data:image')) {
            // Lade Skizze erstmalig
            this.loadSkizzeImage(this.skizzeX, this.skizzeY, this.skizzeWidth, this.skizzeHeight);
        }
        
        // Zeichne Resize-Handles an den Ecken (wenn gehovered oder während Resize)
        if (this.hoveredSkizze || this.resizingSkizze) {
            const handleSize = 8;
            this.ctx.fillStyle = this.resizingSkizze ? '#ff6600' : '#0066cc';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1.5;
            
            // Ecken: oben links (nw), oben rechts (ne), unten links (sw), unten rechts (se)
            const handles = [
                { x: this.skizzeX, y: this.skizzeY, type: 'nw' }, // nw
                { x: this.skizzeX + this.skizzeWidth, y: this.skizzeY, type: 'ne' }, // ne
                { x: this.skizzeX, y: this.skizzeY + this.skizzeHeight, type: 'sw' }, // sw
                { x: this.skizzeX + this.skizzeWidth, y: this.skizzeY + this.skizzeHeight, type: 'se' } // se
            ];
            
            handles.forEach((handle) => {
                // Highlight aktives Handle
                if (this.resizingSkizze && this.resizeHandle === handle.type) {
                    this.ctx.fillStyle = '#ff6600';
                } else {
                    this.ctx.fillStyle = '#0066cc';
                }
                this.ctx.beginPath();
                this.ctx.rect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
                this.ctx.fill();
                this.ctx.stroke();
            });
        }
        
        // Zeichne Beschriftung unter der Skizze
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        this.ctx.fillText('Profil-Skizze', this.skizzeX + this.skizzeWidth / 2, this.skizzeY + this.skizzeHeight + 5);
    }
    
    loadSkizzeImage(skizzeX, skizzeY, skizzeWidth, skizzeHeight) {
        if (this.loadedSkizzeImage) {
            this.loadedSkizzeImage.onload = null; // Entferne alte Event Listener
        }
        
        this.loadedSkizzeImage = new Image();
        this.loadedSkizzeImage.onload = () => {
            this.drawLoadedSkizze(skizzeX, skizzeY, skizzeWidth, skizzeHeight);
            // Neuzeichnen nach dem Laden
            this.draw();
        };
        this.loadedSkizzeImage.src = this.loadedProfileSkizze;
    }
    
    drawLoadedSkizze(skizzeX, skizzeY, skizzeWidth, skizzeHeight) {
        if (!this.loadedSkizzeImage) return;
        
        // Skizze skalieren und zentrieren
        const aspectRatio = this.loadedSkizzeImage.width / this.loadedSkizzeImage.height;
        let drawWidth = skizzeWidth;
        let drawHeight = skizzeHeight;
        
        // Behalte Seitenverhältnis bei
        if (aspectRatio > skizzeWidth / skizzeHeight) {
            drawHeight = skizzeWidth / aspectRatio;
        } else {
            drawWidth = skizzeHeight * aspectRatio;
        }
        
        // Zentriere die Skizze
        const centerX = skizzeX + (skizzeWidth - drawWidth) / 2;
        const centerY = skizzeY + (skizzeHeight - drawHeight) / 2;
        
        this.ctx.drawImage(this.loadedSkizzeImage, centerX, centerY, drawWidth, drawHeight);
    }
    
    // Bild-Einfügen Funktionen
    openBildDialog() {
        // Öffne File-Dialog
        this.bildFileInput.click();
        this.bildFileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    this.loadBild(event.target.result);
                };
                reader.readAsDataURL(file);
            }
        };
    }
    
    loadBild(imageDataUrl) {
        // Erstelle neues Image-Objekt
        if (this.bildImage) {
            this.bildImage.onload = null;
        }
        
        this.bildImage = new Image();
        this.bildImage.onload = () => {
            // Initialisiere Position wenn noch nicht gesetzt
            if (this.bildX === null || this.bildY === null) {
                // Zentriere auf Canvas
                const centerX = this.canvas.width / 2 / this.zoom - (this.bildWidth / 2);
                const centerY = this.canvas.height / 2 / this.zoom - (this.bildHeight / 2);
                this.bildX = centerX;
                this.bildY = centerY;
            }
            
            // Berechne Seitenverhältnis basierend auf Original-Bild
            const aspectRatio = this.bildImage.width / this.bildImage.height;
            if (aspectRatio > this.bildWidth / this.bildHeight) {
                // Bild ist breiter
                this.bildHeight = this.bildWidth / aspectRatio;
            } else {
                // Bild ist höher
                this.bildWidth = this.bildHeight * aspectRatio;
            }
            
            this.saveState();
            this.draw();
            this.autoZoom();
        };
        this.bildImage.src = imageDataUrl;
    }
    
    drawBild() {
        if (!this.bildImage || !this.bildImage.complete || this.bildX === null || this.bildY === null) return;
        
        // Zeichne Hintergrund-Frame (erweitert für Hover-Effekt)
        if (this.hoveredBild && !this.draggedBild && !this.resizingBild) {
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.1)'; // Gelber Hintergrund beim Hover
            this.ctx.fillRect(this.bildX - 5, this.bildY - 5, this.bildWidth + 10, this.bildHeight + 10);
        }
        
        // Zeichne Rahmen um das Bild
        this.ctx.strokeStyle = (this.hoveredBild || this.draggedBild || this.resizingBild) ? '#ffaa00' : '#666';
        this.ctx.lineWidth = (this.hoveredBild || this.draggedBild || this.resizingBild) ? 2 : 1;
        this.ctx.strokeRect(this.bildX, this.bildY, this.bildWidth, this.bildHeight);
        
        // Zeichne das Bild
        this.ctx.drawImage(this.bildImage, this.bildX, this.bildY, this.bildWidth, this.bildHeight);
        
        // Zeichne Resize-Handles an den Ecken (wenn gehovered oder während Resize)
        if (this.hoveredBild || this.resizingBild) {
            const handleSize = 8;
            this.ctx.fillStyle = this.resizingBild ? '#ff6600' : '#0066cc';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 1.5;
            
            // Ecken: oben links (nw), oben rechts (ne), unten links (sw), unten rechts (se)
            const handles = [
                { x: this.bildX, y: this.bildY, type: 'nw' },
                { x: this.bildX + this.bildWidth, y: this.bildY, type: 'ne' },
                { x: this.bildX, y: this.bildY + this.bildHeight, type: 'sw' },
                { x: this.bildX + this.bildWidth, y: this.bildY + this.bildHeight, type: 'se' }
            ];
            
            handles.forEach((handle) => {
                // Highlight aktives Handle
                if (this.resizingBild && this.bildResizeHandle === handle.type) {
                    this.ctx.fillStyle = '#ff6600';
                } else {
                    this.ctx.fillStyle = '#0066cc';
                }
                this.ctx.beginPath();
                this.ctx.rect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
                this.ctx.fill();
                this.ctx.stroke();
            });
        }
    }
    
    // Tastatur-Event-Handler
    handleKeyDown(e) {
        // Entf oder Backspace zum Löschen des Bildes - nur wenn Hover-Effekt aktiv ist
        if ((e.key === 'Delete' || e.key === 'Backspace') && this.bildImage && this.bildImage.complete && this.hoveredBild) {
            // Prüfe ob ein Modal offen ist - dann nicht löschen
            const openModals = document.querySelectorAll('.modal[style*="display: block"]');
            if (openModals.length > 0) return;
            
            // Prüfe ob ein Input-Feld aktiv ist - dann nicht löschen
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
                return;
            }
            
            // Lösche das Bild
            this.bildImage = null;
            this.bildX = null;
            this.bildY = null;
            this.hoveredBild = false;
            this.draggedBild = false;
            this.resizingBild = false;
            
            this.saveState();
            this.draw();
            e.preventDefault();
        }
    }
    
    drawDimensions() {
        if (!this.currentRect) return;
        
        this.ctx.save(); // Canvas-Status isolieren
        
        const rect = this.currentRect;
        const dimensionOffset = this.CONFIG.dimensionLineSpacing * this.mmToPx;
        let currentYOffset = this.CONFIG.dimensionOffset * this.mmToPx;
        
        // Stil für Bemaßungen
        this.ctx.strokeStyle = this.CONFIG.colors.dimension;
        this.ctx.fillStyle = this.CONFIG.colors.dimension;
        this.ctx.lineWidth = this.CONFIG.dimensionLineWidth;
        this.ctx.font = `${this.CONFIG.dimensionFontSize}px ${this.CONFIG.dimensionFontFamily}`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Ecke 4 Position (unten links) - Nullpunkt
        const corner4X = rect.x;
        const corner4Y = rect.y + rect.height;
        
        // Sammle alle Elemente mit Positionen für einheitliche Bemaßung
        const allElements = [];
        
        // Kerben hinzufügen
        this.kerben.forEach(kerbe => {
            allElements.push({
                type: 'kerbe',
                position: kerbe.distance,
                positionType: kerbe.position, // 'oben' oder 'unten'
                element: kerbe
            });
        });
        
        // Ausschnitte hinzufügen
        this.ausschnitte.forEach(ausschnitt => {
            allElements.push({
                type: 'ausschnitt',
                position: ausschnitt.position,
                positionType: ausschnitt.positionType,
                element: ausschnitt
            });
        });
        
        // Löcher hinzufügen
        this.loecher.forEach(loch => {
            allElements.push({
                type: 'loch',
                position: loch.distance,
                element: loch
            });
        });
        
        // Crimping hinzufügen
        this.crimping.forEach(crimpingItem => {
            allElements.push({
                type: 'crimping',
                position: crimpingItem.position,
                length: crimpingItem.length,
                element: crimpingItem
            });
        });
        
        // Sortiere alle Elemente nach Position
        allElements.sort((a, b) => a.position - b.position);
        
        // Trenne nach oben/unten für separate Bemaßungsbereiche
        const elementsOben = allElements.filter(el => 
            (el.type === 'kerbe' && el.positionType === 'oben') ||
            (el.type === 'ausschnitt' && el.positionType === 'oben') ||
            el.type === 'loch' ||
            el.type === 'crimping'
        );
        const elementsUnten = allElements.filter(el => 
            (el.type === 'kerbe' && el.positionType === 'unten') ||
            (el.type === 'ausschnitt' && el.positionType === 'unten')
        );
        
        // Bemaßung oberhalb des Profils (Löcher + Ausschnitte oben)
        let obenOffset = 0;
        // Initialisiere Arrays für horizontale Bemaßungen (oben)
        this.horizontalDimensionsTop = [];
        if (elementsOben.length > 0) {
            // Berechne Y-Position für obere Bemaßungen
            let obenDimensionY;
            if (this.bohnen.length > 0) {
                const bohneHeight = this.bohnen[0].height * this.mmToPx;
                obenDimensionY = rect.y - bohneHeight - (8 * this.mmToPx);
            } else {
                obenDimensionY = rect.y - (8 * this.mmToPx);
            }
            
            elementsOben.forEach((element, index) => {
                const positionPx = element.position * this.mmToPx;
                // Nutze Offset aus dimensionOffsets falls vorhanden
                const customOffset = this.dimensionOffsets.horizontal[index] || 0;
                const dimensionY = obenDimensionY - obenOffset + customOffset;
                
                // Speichere Dimension für Hit-Detection
                this.horizontalDimensionsTop.push({
                    y: dimensionY,
                    startX: corner4X,
                    endX: rect.x + positionPx,
                    index: index
                });
                
                // Für Cutouts und Crimping nur Pfeil auf der linken Seite
                if (element.type === 'ausschnitt') {
                    this.drawHorizontalDimensionLeftArrowOnly(
                        corner4X,
                        dimensionY,
                        rect.x + positionPx,
                        dimensionY,
                        `${element.position}mm`
                    );
                } else if (element.type === 'crimping') {
                    // Berechne Position relativ zur Bohne (wenn vorhanden)
                    let crimpingPositionX = rect.x + positionPx;
                    if (this.bohnen.length > 0) {
                        const bohne = this.bohnen[0];
                        let bohneWidth = rect.width;
                        if (this.cutoutWidth > 0) {
                            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
                        }
                        const bohneX = rect.x + (rect.width - bohneWidth) / 2;
                        crimpingPositionX = bohneX + positionPx;
                    }
                    
                    this.drawHorizontalDimensionLeftArrowOnly(
                        corner4X,
                        dimensionY,
                        crimpingPositionX,
                        dimensionY,
                        `${element.position}mm`
                    );
                } else {
                this.drawHorizontalDimensionFromZero(
                    corner4X,
                    dimensionY,
                    rect.x + positionPx,
                    dimensionY,
                    `${element.position}mm`
                );
                }
                
                obenOffset += dimensionOffset;
            });
        }
        
        // Bemaßung unterhalb des Profils (Kerben + Ausschnitte unten)
        // Initialisiere Array für horizontale Bemaßungen (unten)
        this.horizontalDimensionsBottom = [];
        const baseIndexBottom = elementsOben.length; // Startindex für unten
        elementsUnten.forEach((element, index) => {
            const positionPx = element.position * this.mmToPx;
            // Nutze Offset aus dimensionOffsets falls vorhanden
            const customOffset = this.dimensionOffsets.horizontal[baseIndexBottom + index] || 0;
            const dimensionY = corner4Y + currentYOffset + customOffset;
            
            // Speichere Dimension für Hit-Detection
            this.horizontalDimensionsBottom.push({
                y: dimensionY,
                startX: corner4X,
                endX: rect.x + positionPx,
                index: baseIndexBottom + index
            });
            
            // Für Cutouts nur Pfeil auf der linken Seite
            if (element.type === 'ausschnitt') {
                this.drawHorizontalDimensionLeftArrowOnly(
                    corner4X,
                    dimensionY,
                    rect.x + positionPx,
                    dimensionY,
                    `${element.position}mm`
                );
            } else {
            this.drawHorizontalDimensionFromZero(
                corner4X,
                dimensionY,
                rect.x + positionPx,
                dimensionY,
                `${element.position}mm`
            );
            }
            
            currentYOffset += dimensionOffset;
        });
        
        // Rechte Bemaßungen organisieren (7mm Abstand zwischen allen)
        let rightDimensionX = rect.x + rect.width + (20 * this.mmToPx); // Startposition rechts vom Profil
        const rightDimensionSpacing = 7 * this.mmToPx; // 7mm Abstand zwischen Bemaßungen
        
        // Initialisiere Array für vertikale Bemaßungen
        this.verticalDimensions = [];
        let verticalIndex = 0;
        
        // Höhenbemaßungen als Kettenbemaßung (nebeneinander)
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            
            // Teil 1: Bohne-Höhe (von Bohne-Oberkante bis Profil-Oberkante)
            const bohneTopY = rect.y - bohneHeight;
            const customOffsetX1 = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX1 = rightDimensionX + customOffsetX1;
            this.drawVerticalDimensionFromZero(
                bohneTopY, // Start oben bei der Bohne
                dimensionX1,
                rect.y, // Ende oben beim Profil
                dimensionX1,
                `${bohne.height}mm` // Bohne-Höhe anzeigen
            );
            
            // Speichere Dimension für Hit-Detection
            this.verticalDimensions.push({
                x: dimensionX1,
                startY: bohneTopY,
                endY: rect.y,
                index: verticalIndex++
            });
            
            rightDimensionX += rightDimensionSpacing; // Nächste Bemaßung
            
            // Teil 2: Profil-Höhe (von Profil-Oberkante bis Profil-Unterkante)
            const customOffsetX2 = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX2 = rightDimensionX + customOffsetX2;
            this.drawVerticalDimensionFromZero(
                rect.y, // Start oben beim Profil
                dimensionX2,
                rect.y + rect.height, // Ende unten beim Profil
                dimensionX2,
                `${(rect.height / this.mmToPx).toFixed(1)}mm` // Profil-Höhe anzeigen
            );
            
            // Speichere Dimension für Hit-Detection
            this.verticalDimensions.push({
                x: dimensionX2,
                startY: rect.y,
                endY: rect.y + rect.height,
                index: verticalIndex++
            });
        } else {
            // Nur Gesamthöhe (wenn keine Bohne)
            const customOffsetX = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX = rightDimensionX + customOffsetX;
            this.drawVerticalDimensionFromZero(
                rect.y, // Start oben beim Profil
                dimensionX,
                rect.y + rect.height, // Ende unten beim Profil
                dimensionX,
                `${(rect.height / this.mmToPx).toFixed(1)}mm` // Gesamthöhe anzeigen
            );
            
            // Speichere Dimension für Hit-Detection
            this.verticalDimensions.push({
                x: dimensionX,
                startY: rect.y,
                endY: rect.y + rect.height,
                index: verticalIndex++
            });
        }
        
        rightDimensionX += rightDimensionSpacing; // Nächste Position für weitere Bemaßungen
        
        // Cutout-Bemaßungen (rechts vom Profil, wenn Cutout vorhanden)
        if (this.cutoutWidth > 0 || this.cutoutHeight > 0) {
            const cutoutWidthPx = this.cutoutWidth * this.mmToPx;
            const cutoutHeightPx = this.cutoutHeight * this.mmToPx;
            
            // Cutout-Breite bemaßen (oberhalb des Profils)
            if (this.cutoutWidth > 0) {
                const cutoutX1 = rect.x + cutoutWidthPx; // Cutout-Stelle links
                const cutoutX2 = rect.x + rect.width - cutoutWidthPx; // Cutout-Stelle rechts
                
                // Horizontal-Bemaßung für Cutout-Breite (oberhalb des Profils)
                let cutoutDimY;
        if (this.bohnen.length > 0) {
                    const bohneHeight = this.bohnen[0].height * this.mmToPx;
                    cutoutDimY = rect.y - bohneHeight - (8 * this.mmToPx); // Oberhalb der Bohne
                } else {
                    cutoutDimY = rect.y - (8 * this.mmToPx); // Oberhalb des Profils
                }
                
                // Nutze Offset falls vorhanden (Cutout-Bemaßung oben ist zusätzliche Dimension)
                const cutoutIndex = elementsOben.length; // Index nach allen oberen Elementen
                const customOffsetCutout = this.dimensionOffsets.horizontal[cutoutIndex] || 0;
                cutoutDimY += customOffsetCutout;
            
            this.drawHorizontalDimensionFromZero(
                    rect.x, // Start bei Ecke 4 (oben links)
                    cutoutDimY,
                    cutoutX1, // Ende bei Cutout-Stelle links
                    cutoutDimY,
                    `${this.cutoutWidth}mm`
                );
                
                // Speichere auch Cutout-Bemaßung für Hit-Detection
                this.horizontalDimensionsTop.push({
                    y: cutoutDimY,
                    startX: rect.x,
                    endX: cutoutX1,
                    index: cutoutIndex
                });
            }
            
            // Cutout-Höhe bemaßen (von unten bis Cutout-Höhe, rechts)
            if (this.cutoutHeight > 0) {
                const cutoutBottomY = rect.y + rect.height; // Unten beim Profil
                const cutoutTopY = cutoutBottomY - cutoutHeightPx; // Cutout-Höhe nach oben
                const customOffsetX = this.dimensionOffsets.vertical[verticalIndex] || 0;
                const dimensionX = rightDimensionX + customOffsetX;
                
            this.drawVerticalDimensionFromZero(
                    cutoutTopY, // Start oben bei Cutout-Höhe
                dimensionX,
                    cutoutBottomY, // Ende unten beim Profil
                dimensionX,
                    `${this.cutoutHeight}mm`
            );
            
            // Speichere Dimension für Hit-Detection
            this.verticalDimensions.push({
                x: dimensionX,
                startY: cutoutTopY,
                endY: cutoutBottomY,
                index: verticalIndex++
            });
            
            rightDimensionX += rightDimensionSpacing; // Nächste Position
            }
        }
        
        // Nahtlinie bemaßen (innerhalb des Profils, 30mm von links)
        if (this.nahtlinie && this.nahtlinie.distance > 0) {
            const nahtlinieY = rect.y + rect.height - (this.nahtlinie.distance * this.mmToPx);
            const insideX = rect.x + 30 * this.mmToPx; // Innerhalb des Profils, 30mm von links
            
            this.drawVerticalDimensionFromZero(
                nahtlinieY, // Start bei Nahtlinie
                insideX, // Position 30mm von links innerhalb des Profils
                rect.y + rect.height, // Ende unten beim Profil
                insideX,
                `${this.nahtlinie.distance}mm` // Abstand von unten anzeigen
            );
        }
        
        // Gesamtbreite bemaßen (ganz unten, ganz außen)
        const totalWidthYOffset = (elementsUnten.length * dimensionOffset) + (this.nahtlinie && this.nahtlinie.distance > 0 ? dimensionOffset : 0);
        const totalWidthIndex = baseIndexBottom + elementsUnten.length;
        const customOffsetTotalWidth = this.dimensionOffsets.horizontal[totalWidthIndex] || 0;
        const totalWidthY = corner4Y + currentYOffset + totalWidthYOffset + customOffsetTotalWidth;
        
        this.drawHorizontalDimensionFromZero(
            corner4X,
            totalWidthY,
            rect.x + rect.width,
            totalWidthY,
            `${(rect.width / this.mmToPx).toFixed(1)}mm`
        );
        
        // Speichere auch Gesamtbreite für Hit-Detection
        this.horizontalDimensionsBottom.push({
            y: totalWidthY,
            startX: corner4X,
            endX: rect.x + rect.width,
            index: totalWidthIndex
        });
        
        // Beschriftungsfeld wird nicht mehr automatisch bei Bemaßungen gezeichnet
        // Es wird nur noch als verschiebbares Element angezeigt, wenn es hinzugefügt wurde
        
        // Detailzeichnungen
        const startY = totalWidthY + (40 * this.mmToPx); // 40mm unter der letzten Bemaßungslinie für mehr Abstand
        this.drawDetailDrawings(rect, startY);
        
        this.ctx.restore(); // Canvas-Status wiederherstellen
    }
    
    
    drawHorizontalDimensionFromZero(startX, y, endX, dimensionY, text) {
        const arrowSize = this.CONFIG.dimensionArrowSize;
        const lineWidth = this.CONFIG.dimensionLineWidth;
        
        // Berechne den Abstand der Bemaßungslinie vom Profil
        const rect = this.currentRect;
        const dimDistance = Math.abs(y - (rect ? (rect.y + rect.height) : y)); // Abstand von der unteren Kante
        
        let elementTopY = rect ? (rect.y + rect.height) : y; // Standard: Obere Kante des Profils
        
        if (rect) {
            // Gestrichelte Linie geht bis zum Profil
            if (y > rect.y + rect.height) {
                // Bemaßung ist unterhalb des Profils - Linie geht nach oben zum Profil
                elementTopY = rect.y + rect.height; // Bis zur unteren Profilkante
            } else {
                // Bemaßung ist oberhalb des Profils - Linie geht nach unten zum Profil
                elementTopY = rect.y; // Bis zur oberen Profilkante
            }
        }
        
        // Gestrichelte Hilfslinien zum Element (an den Enden der Bemaßungslinie) - BLAU
        if (rect) {
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = this.CONFIG.colors.highlight; // Blau für gestrichelte Hilfslinien
            this.ctx.lineWidth = lineWidth;
            
            // Gestrichelte Linie am Anfang (zum Element)
        this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(startX, elementTopY);
        this.ctx.stroke();
        
            // Gestrichelte Linie am Ende (zum Element)
            this.ctx.beginPath();
            this.ctx.moveTo(endX, y);
            this.ctx.lineTo(endX, elementTopY);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]); // Zurück zu durchgezogen
            this.ctx.strokeStyle = '#333'; // Zurück zu schwarz
        }
        
        // Hauptbemaßungslinie mit dünnerer Linie
        this.ctx.lineWidth = lineWidth;
            this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(endX, y);
            this.ctx.stroke();
        
        // Pfeil am Anfang
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(startX + arrowSize, y - arrowSize/2);
        this.ctx.lineTo(startX + arrowSize, y + arrowSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pfeil am Ende
        this.ctx.beginPath();
        this.ctx.moveTo(endX, y);
        this.ctx.lineTo(endX - arrowSize, y - arrowSize/2);
        this.ctx.lineTo(endX - arrowSize, y + arrowSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Text
        this.ctx.fillText(text, (startX + endX) / 2, y - 10);
    }
    
    // Bemaßungslinie mit nur einem Pfeil auf der linken Seite (für Cutouts)
    drawHorizontalDimensionLeftArrowOnly(startX, y, endX, dimensionY, text) {
        const arrowSize = 6;
        const lineWidth = 0.5;
        
        // Berechne den Abstand der Bemaßungslinie vom Profil
        const rect = this.currentRect;
        const dimDistance = Math.abs(y - (rect ? (rect.y + rect.height) : y));
        
        let elementTopY = rect ? (rect.y + rect.height) : y; // Standard: Obere Kante des Profils
        
        if (rect) {
            if (y > rect.y + rect.height) {
                // Bemaßung ist unterhalb des Profils - Linie geht nach oben zum Profil
                elementTopY = rect.y + rect.height; // Bis zur unteren Profilkante
            } else {
                // Bemaßung ist oberhalb des Profils - Linie geht nach unten zum Profil
                elementTopY = rect.y; // Bis zur oberen Profilkante
            }
        }
        
        // Gestrichelte Hilfslinien zum Element - BLAU
        if (rect) {
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = '#0066cc';
            this.ctx.lineWidth = lineWidth;
            
            // Gestrichelte Linie am Anfang (links)
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(startX, elementTopY);
            this.ctx.stroke();
            
            // Gestrichelte Linie am Ende (rechts)
            this.ctx.beginPath();
            this.ctx.moveTo(endX, y);
            this.ctx.lineTo(endX, elementTopY);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = '#333';
        }
        
        // Hauptbemaßungslinie
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(endX, y);
        this.ctx.stroke();
        
        // Nur Pfeil am Anfang (links)
        this.ctx.beginPath();
        this.ctx.moveTo(startX, y);
        this.ctx.lineTo(startX + arrowSize, y - arrowSize/2);
        this.ctx.lineTo(startX + arrowSize, y + arrowSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Text
        this.ctx.fillText(text, (startX + endX) / 2, y - 10);
    }
    
    drawVerticalDimensionFromZero(startY, x, endY, dimensionX, text) {
        const arrowSize = this.CONFIG.dimensionArrowSize;
        const lineWidth = this.CONFIG.dimensionLineWidth; // Dünnere Linie
        
        // Berechne den Abstand der Bemaßungslinie vom Profil
        const rect = this.currentRect;
        const dimDistance = Math.abs(x - (rect ? (rect.x + rect.width) : x)); // Abstand von der rechten Kante
        
        let elementRightX = rect ? (rect.x + rect.width) : x; // Standard: Rechte Kante des Profils
        
        // Gestrichelte Hilfslinien zum Element (an den Enden der Bemaßungslinie) - BLAU
        if (rect) {
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = this.CONFIG.colors.highlight; // Blau für gestrichelte Hilfslinien
            this.ctx.lineWidth = lineWidth;
            
            // Gestrichelte Linie am Anfang (oben) - horizontal bis zum Profil
            this.ctx.beginPath();
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(elementRightX, startY);
            this.ctx.stroke();
            
            // Gestrichelte Linie am Ende (unten) - horizontal bis zum Profil
            this.ctx.beginPath();
            this.ctx.moveTo(x, endY);
            this.ctx.lineTo(elementRightX, endY);
            this.ctx.stroke();
            
            this.ctx.setLineDash([]); // Zurück zu durchgezogen
            this.ctx.strokeStyle = '#333'; // Zurück zu schwarz
        }
        
        // Hauptbemaßungslinie mit dünnerer Linie
        this.ctx.lineWidth = lineWidth;
        this.ctx.beginPath();
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x, endY);
        this.ctx.stroke();
        
        // Pfeil am Anfang
        this.ctx.beginPath();
        this.ctx.moveTo(x, startY);
        this.ctx.lineTo(x - arrowSize/2, startY - arrowSize);
        this.ctx.lineTo(x + arrowSize/2, startY - arrowSize);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pfeil am Ende
        this.ctx.beginPath();
        this.ctx.moveTo(x, endY);
        this.ctx.lineTo(x - arrowSize/2, endY + arrowSize);
        this.ctx.lineTo(x + arrowSize/2, endY + arrowSize);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Text
        this.ctx.save();
        this.ctx.translate(x + 10, (startY + endY) / 2);
        this.ctx.rotate(-Math.PI / 2);
        this.ctx.fillText(text, 0, 0);
        this.ctx.restore();
    }
    
    drawDetailIndicators() {
        if (!this.currentRect || (!this.kerben.length && !this.loecher.length)) return;
        
        const rect = this.currentRect;
        
        // Stil für Detail-Indikatoren
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]); // Gestrichelte Linie
        
        // Gestrichelter Kreis um eine Kerbe (nur die erste) - nur bei Dreieck-Kerben
        if (this.kerben.length > 0) {
            const kerbe = this.kerben[0]; // Nur die erste Kerbe
            
            // Hole Kerben-Typ für neue Struktur
            let type = 'triangle';
            let widthPx, depthPx;
            
            if (kerbe.kerbenTypeId) {
                const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                if (kerbenType) {
                    type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
                    widthPx = kerbenType.width * this.mmToPx;
                    depthPx = kerbenType.depth * this.mmToPx;
                }
            } else {
                // Alte Struktur: Direkt aus Kerbe (für Rückwärtskompatibilität)
                type = kerbe.type || 'triangle';
                widthPx = (kerbe.width || 6) * this.mmToPx;
                depthPx = (kerbe.depth || 4) * this.mmToPx;
            }
            
            // Nur Detail-Indikator bei Dreieck-Kerben (nicht bei Strich-Markierung)
            if (type === 'triangle') {
                const distancePx = kerbe.distance * this.mmToPx;
                
                let kerbeCenterX, kerbeCenterY;
                
                if (kerbe.position === 'oben') {
                    kerbeCenterX = rect.x + distancePx;
                    kerbeCenterY = rect.y;
                } else {
                    kerbeCenterX = rect.x + distancePx;
                    kerbeCenterY = rect.y + rect.height;
                }
                
                // Kreis um Kerbe zeichnen - Radius basierend auf Kerben-Größe
                const radius = Math.max(widthPx, depthPx) * 1.4; // 40% größer als Kerbe
                this.ctx.beginPath();
                this.ctx.arc(kerbeCenterX, kerbeCenterY, radius, 0, 2 * Math.PI);
                this.ctx.stroke();
            }
        }
        
        // Gestrichelter Kreis um ein Loch (nur das erste)
        if (this.loecher.length > 0) {
            const loch = this.loecher[0]; // Nur das erste Loch
            const distancePx = loch.distance * this.mmToPx;
            const widthPx = loch.width * this.mmToPx;
            const heightPx = loch.height * this.mmToPx;
            const positionPx = (loch.positionFromTop || 2) * this.mmToPx; // Korrigiert: positionFromTop statt position
            
            const lochCenterX = rect.x + distancePx;
            // Position ist Abstand von oben (Standard 2mm)
            const lochCenterY = rect.y + positionPx + (heightPx / 2);
            
            // Kreis um Loch zeichnen - Radius basierend auf Loch-Größe
            const radius = Math.max(widthPx, heightPx) * 1.4; // 40% größer als Loch
            this.ctx.beginPath();
            this.ctx.arc(lochCenterX, lochCenterY, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
        }
        
        // LineDash zurücksetzen für andere Zeichnungen
        this.ctx.setLineDash([]);
    }
    
    drawDetailDrawings(rect, startY) {
        if (this.kerben.length === 0 && this.loecher.length === 0) return;
        
        const scale = 2; // Doppelt so groß
        const detailSpacing = 30 * this.mmToPx; // Abstand zwischen Kerbe und Loch
        let currentX = rect.x; // Startposition links
        
        // Stil für Detailzeichnungen - Dunkelgrau
        this.ctx.strokeStyle = '#555'; // Dunkelgrau
        this.ctx.fillStyle = '#555'; // Dunkelgrau
        this.ctx.lineWidth = 1;
        this.ctx.font = `${10}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Kerbe Detailzeichnung - Zeige alle verschiedenen Kerben-Typen
        const usedKerbenTypes = [];
        this.kerben.forEach(kerbe => {
            const kerbenTypeId = kerbe.kerbenTypeId || (this.kerbenTypes.length > 0 ? this.kerbenTypes[0].id : null);
            const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbenTypeId);
            if (kerbenType && !usedKerbenTypes.find(ukt => ukt.id === kerbenType.id)) {
                usedKerbenTypes.push(kerbenType);
            }
        });
        
        usedKerbenTypes.forEach(kerbenType => {
            // WICHTIG: Hole den Typ explizit, mit Fallback
            const type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
            const kerbeWidth = kerbenType.width * this.mmToPx * scale;
            const kerbeDepth = kerbenType.depth * this.mmToPx * scale;
            const labelOffset = 40 * this.mmToPx; // Abstand für Bemaßungen rechts
            
            if (type === 'marker') {
                // Strichmarkierung zeichnen - Einfacher Strich
                this.ctx.strokeStyle = '#555';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(currentX, startY - kerbeDepth/2); // Oben
                this.ctx.lineTo(currentX, startY + kerbeDepth/2); // Unten
                this.ctx.stroke();
                
                // Bemaßung für Strich - direkt daneben mit Pfeilinien
                this.drawDetailDimensionLine(
                    currentX, // Start
                    currentX, // Ende
                    startY - kerbeDepth/2, // Y1 oben
                    startY + kerbeDepth/2, // Y2 unten
                    startY // Label position
                );
                // Text für Höhe
                this.ctx.fillStyle = '#555';
                this.ctx.fillText(`${kerbenType.depth}mm`, currentX + 15, startY + kerbeDepth/2 + 15);
            } else {
                // Dreieck-Kerbe zeichnen - zentriert auf startY
            this.ctx.beginPath();
            this.ctx.moveTo(currentX, startY + kerbeDepth/2); // Links, zentriert
            this.ctx.lineTo(currentX + kerbeWidth/2, startY - kerbeDepth/2); // Spitze nach oben
            this.ctx.lineTo(currentX + kerbeWidth, startY + kerbeDepth/2); // Rechts, zentriert
            this.ctx.closePath();
            this.ctx.fillStyle = 'white';
            this.ctx.fill();
                this.ctx.strokeStyle = '#555';
            this.ctx.stroke();
            
                // Bemaßung für Breite - direkt daneben mit Pfeillinien
                this.drawDetailDimensionLine(
                    currentX, // Start links
                    currentX + kerbeWidth, // Ende rechts
                    startY + kerbeDepth/2 + 15, // Y Position unterhalb
                    startY + kerbeDepth/2 + 15, // Y Position unterhalb
                    startY + kerbeDepth/2 + 15 // Label position
                );
                this.ctx.fillStyle = '#555';
                this.ctx.fillText(`${kerbenType.width}mm`, currentX + kerbeWidth/2, startY + kerbeDepth/2 + 25);
                
                // Bemaßung für Tiefe - seitlich mit Pfeillinien
                this.drawDetailDimensionLine(
                    currentX + kerbeWidth + 15, // Start rechts
                    currentX + kerbeWidth + 15, // Ende rechts
                    startY - kerbeDepth/2, // Y1 oben
                    startY + kerbeDepth/2, // Y2 unten
                    startY // Label position
                );
                this.ctx.fillStyle = '#555';
                this.ctx.fillText(`${kerbenType.depth}mm`, currentX + kerbeWidth + 25, startY);
            }
            
            // Label für Kerben-Typ-Name
            this.ctx.fillStyle = '#555';
            this.ctx.font = `${9}px Arial`;
            this.ctx.fillText(kerbenType.name, currentX + kerbeWidth/2, startY + kerbeDepth/2 + 25);
            
            currentX += Math.max(kerbeWidth, 10) + detailSpacing; // Minimum Breite für Strich
        });
        
        // Loch Detailzeichnung
        if (this.loecher.length > 0) {
            const loch = this.loecher[0]; // Erstes Loch als Beispiel
            const lochWidth = loch.width * this.mmToPx * scale;
            const lochHeight = loch.height * this.mmToPx * scale;
            
            // Loch zeichnen (Kapsel-Form) - zentriert auf startY
            this.ctx.strokeStyle = '#555'; // Dunkelgrau
            this.ctx.fillStyle = 'white'; // Weiß gefüllt
            
            this.ctx.beginPath();
            
            // Prüfe ob Breite und Höhe gleich sind -> Kreis
            if (Math.abs(lochWidth - lochHeight) < 0.1) {
                // Perfekter Kreis
                this.ctx.arc(currentX + lochWidth/2, startY, lochWidth / 2, 0, 2 * Math.PI);
            } else {
                // Kapsel (Stadion-Form) über gerundetes Rechteck
                const radius = Math.min(lochWidth, lochHeight) / 2;
                const x = currentX;
                const y = startY - lochHeight / 2;
                
                if (typeof this.ctx.roundRect === 'function') {
                    this.ctx.roundRect(x, y, lochWidth, lochHeight, radius);
                } else {
                    // Fallback für ältere Browser: generisches Rounded-Rect
                    const r = radius;
                    const rRight = x + lochWidth - r;
                    const rBottom = y + lochHeight - r;
                    this.ctx.moveTo(x + r, y);
                    this.ctx.lineTo(rRight, y);
                    this.ctx.arc(rRight, y + r, r, -Math.PI / 2, 0, false);
                    this.ctx.lineTo(x + lochWidth, rBottom);
                    this.ctx.arc(rRight, rBottom, r, 0, Math.PI / 2, false);
                    this.ctx.lineTo(x + r, y + lochHeight);
                    this.ctx.arc(x + r, rBottom, r, Math.PI / 2, Math.PI, false);
                    this.ctx.lineTo(x, y + r);
                    this.ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2, false);
                }
            }
            
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Bemaßung für Loch - Breite mit Pfeillinien
            this.drawDetailDimensionLine(
                currentX, // Start links
                currentX + lochWidth, // Ende rechts
                startY + lochHeight/2 + 15, // Y Position unterhalb
                startY + lochHeight/2 + 15, // Y Position unterhalb
                startY + lochHeight/2 + 15 // Label position
            );
            this.ctx.fillStyle = '#555';
            this.ctx.fillText(`${loch.width}mm`, currentX + lochWidth/2, startY + lochHeight/2 + 25);
            
            // Bemaßung für Loch - Höhe mit Pfeillinien
            this.drawDetailDimensionLine(
                currentX + lochWidth + 15, // Start rechts
                currentX + lochWidth + 15, // Ende rechts
                startY - lochHeight/2, // Y1 oben
                startY + lochHeight/2, // Y2 unten
                startY // Label position
            );
            this.ctx.fillStyle = '#555';
            this.ctx.fillText(`${loch.height}mm`, currentX + lochWidth + 25, startY);
        }
    }
    
    // Bemaßungslinien für Detailzeichnungen
    drawDetailDimensionLine(startX, endX, y1, y2, labelY) {
        const arrowSize = 4;
        const lineWidth = 0.5;
        
        this.ctx.strokeStyle = '#555';
        this.ctx.fillStyle = '#555';
        this.ctx.lineWidth = lineWidth;
        
        // Hauptlinie
        this.ctx.beginPath();
        if (y1 === y2) {
            // Horizontale Bemaßung
            this.ctx.moveTo(startX, y1);
            this.ctx.lineTo(endX, y1);
        } else {
            // Vertikale Bemaßung
            this.ctx.moveTo(startX, y1);
            this.ctx.lineTo(startX, y2);
        }
        this.ctx.stroke();
        
        // Pfeil am Start
        this.ctx.beginPath();
        if (y1 === y2) {
            this.ctx.moveTo(startX, y1);
            this.ctx.lineTo(startX + arrowSize, y1 - arrowSize/2);
            this.ctx.lineTo(startX + arrowSize, y1 + arrowSize/2);
        } else {
            this.ctx.moveTo(startX, y1);
            this.ctx.lineTo(startX - arrowSize/2, y1 - arrowSize);
            this.ctx.lineTo(startX + arrowSize/2, y1 - arrowSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
        
        // Pfeil am Ende
        this.ctx.beginPath();
        if (y1 === y2) {
            this.ctx.moveTo(endX, y1);
            this.ctx.lineTo(endX - arrowSize, y1 - arrowSize/2);
            this.ctx.lineTo(endX - arrowSize, y1 + arrowSize/2);
        } else {
            this.ctx.moveTo(startX, y2);
            this.ctx.lineTo(startX - arrowSize/2, y2 + arrowSize);
            this.ctx.lineTo(startX + arrowSize/2, y2 + arrowSize);
        }
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawFormatBorder() {
        if (!this.showFormatBorder || !this.selectedFormat) return;
        
        // Format-Dimensionen in mm
        const formatDimensions = {
            'A4': { width: 297, height: 210 }, // Querformat
            'A3': { width: 297, height: 420 }
        };
        
        const format = formatDimensions[this.selectedFormat];
        if (!format) return;
        
        // Berechne Format-Größe in Pixel
        const formatWidthPx = format.width * this.mmToPx;
        const formatHeightPx = format.height * this.mmToPx;
        
        // Format-Rand zentriert im Canvas zeichnen
        const formatX = (this.canvasWidth - formatWidthPx) / 2;
        const formatY = (this.canvasHeight - formatHeightPx) / 2;
        
        // Gestrichelter roter Rahmen
        this.ctx.strokeStyle = '#FF0000'; // Rot
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]); // Gestrichelte Linie
        
        this.ctx.beginPath();
        this.ctx.rect(formatX, formatY, formatWidthPx, formatHeightPx);
        this.ctx.stroke();
        
        // LineDash zurücksetzen
        this.ctx.setLineDash([]);
        
        // Format-Bezeichnung
        this.ctx.fillStyle = '#FF0000'; // Rot
        this.ctx.font = `${12}px Arial`;
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`${this.selectedFormat.toUpperCase()} Format`, formatX + 5, formatY - 5);
    }
    
    toggleDimensions() {
        this.showDimensions = !this.showDimensions;
        this.updateBemaßungButton();
        this.draw();
    }
    
    togglePanMode() {
        this.panMode = !this.panMode;
        this.updatePanButton();
        
        if (this.panMode) {
            this.canvas.style.cursor = 'grab';
        } else {
            this.canvas.style.cursor = 'default';
            this.isPanning = false;
        }
    }
    
    updatePanButton() {
        if (this.panButton) {
            if (this.panMode) {
                this.panButton.className = 'px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium';
            } else {
                this.panButton.className = 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium';
            }
        }
    }
    
    setFormat(format) {
        // Toggle-Funktionalität: Wenn bereits gewählt, dann deaktivieren
        if (this.selectedFormat === format && this.showFormatBorder) {
            this.selectedFormat = null;
            this.showFormatBorder = false;
            this.updateFormatButtons();
            this.draw();
            return;
        }
        
        this.selectedFormat = format;
        this.showFormatBorder = true;
        
        // Aktualisiere Button-Farben
        this.updateFormatButtons();
        
        // Skaliere und zentriere die Zeichnung für das gewählte Format
        this.scaleForFormat(format);
        
        this.draw();
    }
    
    updateFormatButtons() {
        // Format-Buttons aktualisieren - Buttons wurden entfernt
        // Diese Funktion bleibt für Kompatibilität, aber macht nichts
    }
    
    scaleForFormat(format) {
        if (!this.currentRect) {
            alert('Bitte erst ein Profil zeichnen!');
            return;
        }
        
        // Format-Dimensionen in mm
        const formatDimensions = {
            'A4': { width: 297, height: 210 }, // Querformat
            'A3': { width: 297, height: 420 }
        };
        
        const formatData = formatDimensions[format];
        if (!formatData) return;
        
        // Berechne die Gesamtausdehnung aller Elemente
        let minX = this.currentRect.x;
        let maxX = this.currentRect.x + this.currentRect.width;
        let minY = this.currentRect.y;
        let maxY = this.currentRect.y + this.currentRect.height;
        
        // Bohne berücksichtigen
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            minY = Math.min(minY, this.currentRect.y - bohneHeight);
        }
        
        // Bemaßungen berücksichtigen (wenn aktiv)
        if (this.showDimensions) {
            const dimensionOffset = 20 * this.mmToPx; // Extra Platz für Bemaßungen
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            const detailHeight = 100 * this.mmToPx; // Extra Platz für Detailzeichnungen
            maxY += detailHeight;
        }
        
        // Berechne die benötigte Größe der Zeichnung
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Berechne den optimalen Zoom für das Format (mit 10mm Rand)
        const margin = 10 * this.mmToPx; // 10mm Rand für Druck
        const availableWidth = (formatData.width * this.mmToPx) - (2 * margin);
        const availableHeight = (formatData.height * this.mmToPx) - (2 * margin);
        
        const zoomX = availableWidth / totalWidth;
        const zoomY = availableHeight / totalHeight;
        this.zoom = Math.min(zoomX, zoomY);
        
        // Zentriere die Zeichnung im Format
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        this.offsetX = this.canvasWidth / 2 - centerX * this.zoom;
        this.offsetY = this.canvasHeight / 2 - centerY * this.zoom;
        
        this.updateZoomLevel();
    }
    
    autoZoom() {
        if (!this.currentRect) {
            alert('Bitte erst ein Profil zeichnen!');
            return;
        }
        
        // Wenn A4 oder A3 Format gewählt ist, zeige das ganze Format
        if (this.selectedFormat && this.showFormatBorder) {
            this.showFullFormat();
            return;
        }
        
        // Berechne die Gesamtausdehnung aller Elemente
        let minX = this.currentRect.x;
        let maxX = this.currentRect.x + this.currentRect.width;
        let minY = this.currentRect.y;
        let maxY = this.currentRect.y + this.currentRect.height;
        
        // Bohne berücksichtigen
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            minY = Math.min(minY, this.currentRect.y - bohneHeight);
        }
        
        // Bemaßungen berücksichtigen (wenn aktiv)
        if (this.showDimensions) {
            const dimensionOffset = 20 * this.mmToPx; // Extra Platz für Bemaßungen
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        let detailHeight = 0;
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            detailHeight = 100 * this.mmToPx; // Extra Platz für Detailzeichnungen
            maxY += detailHeight;
        }
        
        // Beschriftungsfeld berücksichtigen (wenn Bemaßungen aktiv)
        if (this.showDimensions) {
            const blockWidth = 100 * this.mmToPx; // 100mm Breite des Beschriftungsfeldes
            const blockHeight = 40 * this.mmToPx; // 40mm Höhe des Beschriftungsfeldes
            
            // Beschriftungsfeld steht rechts neben dem Profil
            const blockX = this.currentRect.x + this.currentRect.width + (20 * this.mmToPx);
            const blockY = maxY - detailHeight; // Auf gleicher Höhe wie Detailzeichnungen
            
            // Erweitere die Grenzen um das Beschriftungsfeld
            maxX = Math.max(maxX, blockX + blockWidth);
            maxY = Math.max(maxY, blockY + blockHeight);
        }
        
        // Berechne die benötigte Größe
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Berechne den optimalen Zoom
        const zoomX = (this.canvasWidth * 0.8) / totalWidth;
        const zoomY = (this.canvasHeight * 0.8) / totalHeight;
        this.zoom = Math.min(zoomX, zoomY);
        
        // Zentriere die Ansicht
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        this.offsetX = this.canvasWidth / 2 - centerX * this.zoom;
        this.offsetY = this.canvasHeight / 2 - centerY * this.zoom;
        
        this.updateZoomLevel();
        this.draw();
    }
    
    showFullFormat() {
        if (!this.selectedFormat) return;
        
        // Format-Dimensionen in mm
        const formatDimensions = {
            'A4': { width: 297, height: 210 }, // Querformat
            'A3': { width: 297, height: 420 }
        };
        
        const format = formatDimensions[this.selectedFormat];
        if (!format) return;
        
        // Berechne Format-Größe in Pixel
        const formatWidthPx = format.width * this.mmToPx;
        const formatHeightPx = format.height * this.mmToPx;
        
        // Berechne Zoom so dass das ganze Format sichtbar ist
        const zoomX = (this.canvasWidth * 0.9) / formatWidthPx;
        const zoomY = (this.canvasHeight * 0.9) / formatHeightPx;
        this.zoom = Math.min(zoomX, zoomY);
        
        // Zentriere das Format im Canvas
        this.offsetX = this.canvasWidth / 2;
        this.offsetY = this.canvasHeight / 2;
        
        this.updateZoomLevel();
        this.draw();
    }
    
    updateBemaßungButton() {
        if (this.bemaßungButton) {
        if (this.showDimensions) {
                this.bemaßungButton.className = 'w-10 h-10 bg-green-500 border border-gray-300 rounded-lg shadow-md hover:bg-green-600 hover:shadow-lg transition-all flex items-center justify-center text-lg';
        } else {
                this.bemaßungButton.className = 'w-10 h-10 bg-white border border-gray-300 rounded-lg shadow-md hover:bg-gray-50 hover:shadow-lg transition-all flex items-center justify-center text-lg';
            }
        }
    }
    
    async exportToPDF() {
        console.log('exportToPDF aufgerufen (vektorbasiert)');
        
        if (!this.currentRect) {
            alert('Bitte erst ein Profil zeichnen!');
            return;
        }
        
        console.log('Profil vorhanden, starte vektorbasierten PDF-Export...');
        
        try {
            // Berechne Bounding Box (wie in exportToSVG)
            console.log('Berechne Bounding Box für vektorbasierten PDF-Export...');
            let minX = this.currentRect.x;
            let maxX = this.currentRect.x + this.currentRect.width;
            let minY = this.currentRect.y;
            let maxY = this.currentRect.y + this.currentRect.height;
            
            // Bohne berücksichtigen
            if (this.bohnen.length > 0) {
                const bohne = this.bohnen[0];
                const bohneHeight = bohne.height * this.mmToPx;
                minY = Math.min(minY, this.currentRect.y - bohneHeight);
            }
            
            // Kerben, Löcher, Ausschnitte, Crimping, Nahtlinie, Skizze, Titelblock, Texte, Bilder berücksichtigen
            // (vereinfacht - verwende die gleiche Logik wie in exportToSVG)
            if (this.showDimensions) {
                const dimensionOffset = 60 * this.mmToPx;
                minY -= dimensionOffset;
                maxY += dimensionOffset;
                minX -= dimensionOffset;
                maxX += dimensionOffset;
            }
            
            // Detailzeichnungen berücksichtigen
            if (this.kerben.length > 0 || this.loecher.length > 0) {
                const detailHeight = 100 * this.mmToPx;
                maxY += detailHeight;
            }
            
            // Titelblock berücksichtigen
            if (this.titleBlock && this.titleBlock.x != null) {
                maxX = Math.max(maxX, this.titleBlock.x + this.titleBlock.width);
                maxY = Math.max(maxY, this.titleBlock.y + this.titleBlock.height);
            }
            
            // Sicherheitsabstand
            const padding = 20 * this.mmToPx;
            minX -= padding;
            minY -= padding;
            maxX += padding;
            maxY += padding;
            
            const totalWidth = maxX - minX;
            const totalHeight = maxY - minY;
            
            // Berechne Größe in mm (1mm = 1mm - korrekte Skalierung!)
            const contentWidthMm = totalWidth / this.mmToPx;
            const contentHeightMm = totalHeight / this.mmToPx;
            console.log('Content Größe in mm:', { contentWidthMm, contentHeightMm });
            
            // A4 Format-Dimensionen in mm
            const a4WidthPortrait = 210; // mm (Hochformat)
            const a4HeightPortrait = 297; // mm
            const a4WidthLandscape = 297; // mm (Querformat)
            const a4HeightLandscape = 210; // mm
            
            const margin = 5; // mm Rand
            
            // Entscheide automatisch, ob Hoch- oder Querformat besser passt
            const aspectRatio = contentWidthMm / contentHeightMm;
            console.log('Seitenverhältnis:', aspectRatio);
            
            let isLandscape;
            let a4Width, a4Height;
            
            if (aspectRatio > 1) {
                isLandscape = true;
                a4Width = a4WidthLandscape;
                a4Height = a4HeightLandscape;
                console.log('Verwende Querformat');
            } else {
                isLandscape = false;
                a4Width = a4WidthPortrait;
                a4Height = a4HeightPortrait;
                console.log('Verwende Hochformat');
            }
            
            const usableWidth = a4Width - (2 * margin);
            const usableHeight = a4Height - (2 * margin);
            console.log('Nutzbare A4 Größe:', { usableWidth, usableHeight });
            
            // Berechne Skalierung
            const scaleX = usableWidth / contentWidthMm;
            const scaleY = usableHeight / contentHeightMm;
            const scale = Math.min(scaleX, scaleY); // Verwende den kleineren Wert
            console.log('Skalierung:', { scaleX, scaleY, scale });
            
            // Erstelle SVG (wie in exportToSVG)
            console.log('Erstelle SVG...');
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            // SVG in mm (1mm = 1mm)
            svg.setAttribute('width', `${contentWidthMm}mm`);
            svg.setAttribute('height', `${contentHeightMm}mm`);
            // ViewBox in px (Canvas-Koordinaten)
            svg.setAttribute('viewBox', `${minX} ${minY} ${totalWidth} ${totalHeight}`);
            
            // Defs für Pfeile
            const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
            arrowMarker.setAttribute('id', 'arrowhead');
            arrowMarker.setAttribute('markerWidth', '10');
            arrowMarker.setAttribute('markerHeight', '10');
            arrowMarker.setAttribute('refX', '9');
            arrowMarker.setAttribute('refY', '3');
            arrowMarker.setAttribute('orient', 'auto');
            const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
            arrowPath.setAttribute('fill', '#333');
            arrowMarker.appendChild(arrowPath);
            defs.appendChild(arrowMarker);
            svg.appendChild(defs);
            
            // Erstelle Gruppe für Zeichnung
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            
            // Zeichne Elemente als SVG
            this.drawToSVG(g);
            
            svg.appendChild(g);
            
            // Konvertiere SVG zu String
            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svg);
            console.log('SVG erstellt, Länge:', svgString.length);
            
            // Prüfe ob jsPDF verfügbar ist
            if (!window.jspdf) {
                alert('Fehler: jsPDF Bibliothek nicht geladen. Bitte Seite neu laden.');
                console.error('jsPDF nicht gefunden');
                return;
            }
            
            // Erstelle PDF mit jsPDF
            let jsPDFClass;
            try {
                if (window.jspdf.jsPDF) {
                    jsPDFClass = window.jspdf.jsPDF;
                } else if (window.jspdf.default && window.jspdf.default.jsPDF) {
                    jsPDFClass = window.jspdf.default.jsPDF;
                } else {
                    throw new Error('jsPDF nicht gefunden');
                }
            } catch (e) {
                alert('Fehler: jsPDF konnte nicht gefunden werden. Bitte Seite neu laden.');
                console.error('jsPDF Fehler:', e);
                return;
            }
            
            console.log('Erstelle PDF-Objekt...');
            const pdf = new jsPDFClass({
                orientation: isLandscape ? 'landscape' : 'portrait',
                unit: 'mm',
                format: 'a4'
            });
            console.log('PDF-Objekt erstellt');
            
            // Berechne Position und Größe für SVG im PDF
            const scaledWidth = contentWidthMm * scale;
            const scaledHeight = contentHeightMm * scale;
            
            // Zentriere auf A4 (mittig)
            const xOffset = (a4Width - scaledWidth) / 2;
            const yOffset = (a4Height - scaledHeight) / 2;
            
            console.log('Füge SVG zum PDF hinzu...', { xOffset, yOffset, scaledWidth, scaledHeight, scale });
            
            // Füge SVG zum PDF hinzu (vektorbasiert!)
            try {
                // Prüfe ob svg2pdf verfügbar ist (als Plugin oder globale Funktion)
                let svg2pdfAvailable = false;
                let svg2pdfFunction = null;
                
                // Versuche verschiedene Möglichkeiten, svg2pdf zu finden
                if (typeof window.svg2pdf !== 'undefined') {
                    svg2pdfFunction = window.svg2pdf;
                    svg2pdfAvailable = true;
                } else if (typeof window.svg2pdfjs !== 'undefined') {
                    svg2pdfFunction = window.svg2pdfjs.svg;
                    svg2pdfAvailable = true;
                } else if (typeof pdf.svg === 'function') {
                    // jsPDF hat möglicherweise eine eingebaute svg() Methode
                    svg2pdfAvailable = true;
                }
                
                if (svg2pdfAvailable) {
                    // Nutze das bereits erstellte SVG-Element direkt (nicht neu erstellen)
                    console.log('Nutze vektorbasierten SVG-Export...');
                    
                    // Versuche verschiedene Methoden der SVG-Einbindung
                    if (svg2pdfFunction && typeof svg2pdfFunction === 'function') {
                        // Methode 1: svg2pdf als Funktion (mit SVG-Element)
                        try {
                            // Verwende das bereits erstellte SVG-Element direkt
                            svg2pdfFunction(svg, pdf, {
                                xOffset: xOffset,
                                yOffset: yOffset,
                                width: scaledWidth,
                                height: scaledHeight
                            });
                            console.log('SVG zum PDF hinzugefügt (vektorbasiert mit svg2pdf.js Funktion)');
                        } catch (e1) {
                            // Versuche mit SVG-String
                            try {
                                svg2pdfFunction(svgString, pdf, {
                                    xOffset: xOffset,
                                    yOffset: yOffset,
                                    width: scaledWidth,
                                    height: scaledHeight
                                });
                                console.log('SVG zum PDF hinzugefügt (vektorbasiert mit svg2pdf.js String)');
                            } catch (e2) {
                                throw e2;
                            }
                        }
                    } else if (typeof pdf.svg === 'function') {
                        // Methode 2: jsPDF's eingebaute svg() Methode
                        console.log('Nutze jsPDF svg() Methode...');
                        pdf.svg(svgString, {
                            x: xOffset,
                            y: yOffset,
                            width: scaledWidth,
                            height: scaledHeight
                        });
                        console.log('SVG zum PDF hinzugefügt (vektorbasiert mit jsPDF svg())');
                    } else {
                        throw new Error('SVG-Export Funktion nicht verfügbar');
                    }
                } else {
                    throw new Error('SVG-Export nicht verfügbar - bitte svg2pdf.js Plugin laden');
                }
            } catch (e) {
                console.warn('Vektorbasierter SVG-Export fehlgeschlagen, verwende Fallback:', e);
                // Fallback: Konvertiere SVG zu DataURL und nutze addImage
                // (Dies ist nicht vektorbasiert, aber besser als nichts)
                const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
                const svgUrl = URL.createObjectURL(svgBlob);
                const img = new Image();
                img.onload = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        canvas.width = scaledWidth * 10; // Hohe Auflösung
                        canvas.height = scaledHeight * 10;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                        const imgData = canvas.toDataURL('image/png');
                        pdf.addImage(imgData, 'PNG', xOffset, yOffset, scaledWidth, scaledHeight);
                        URL.revokeObjectURL(svgUrl);
                        this.finishPDFExport(pdf, isLandscape);
                    } catch (err) {
                        alert('Fehler beim Fallback-Export: ' + err.message);
                        URL.revokeObjectURL(svgUrl);
                    }
                };
                img.onerror = () => {
                    alert('Fehler: SVG konnte nicht geladen werden.');
                    URL.revokeObjectURL(svgUrl);
                };
                img.src = svgUrl;
                return; // Warte auf img.onload
            }
            
            // Speichere PDF
            this.finishPDFExport(pdf, isLandscape);
            
        } catch (error) {
            console.error('Fehler beim PDF-Export:', error);
            alert('Fehler beim PDF-Export: ' + error.message);
        }
    }
    
    finishPDFExport(pdf, isLandscape) {
        const orientationStr = isLandscape ? 'Querformat' : 'Hochformat';
        const fileName = `ProfilZeichner_A4_${orientationStr}_${new Date().toISOString().slice(0,10)}.pdf`;
        console.log('Speichere PDF als:', fileName);
        try {
            pdf.save(fileName);
            console.log('PDF gespeichert (vektorbasiert)');
            alert(`PDF wurde als vektorbasiertes A4 ${orientationStr} exportiert!`);
        } catch (e) {
            alert('Fehler beim Speichern des PDF: ' + e.message);
            console.error('save Fehler:', e);
        }
    }
    
    // SVG-Export Funktion
    exportToSVG() {
        if (!this.currentRect) {
            alert('Bitte erst ein Profil zeichnen!');
            return;
        }
        
        // Berechne Bounding Box (ähnlich wie PDF)
        let minX = this.currentRect.x;
        let maxX = this.currentRect.x + this.currentRect.width;
        let minY = this.currentRect.y;
        let maxY = this.currentRect.y + this.currentRect.height;
        
        // Bohne berücksichtigen
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            minY = Math.min(minY, this.currentRect.y - bohneHeight);
        }
        
        // Bemaßungen berücksichtigen
        if (this.showDimensions) {
            const dimensionOffset = 60 * this.mmToPx;
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            const detailHeight = 80 * this.mmToPx;
            maxY += detailHeight;
        }
        
        // Titelblock berücksichtigen
        if (this.titleBlock && this.titleBlock.x != null) {
            maxX = Math.max(maxX, this.titleBlock.x + this.titleBlock.width);
            maxY = Math.max(maxY, this.titleBlock.y + this.titleBlock.height);
        }
        
        // Sicherheitsabstand
        const padding = 20 * this.mmToPx;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Erstelle SVG-Element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', `${totalWidth}px`);
        svg.setAttribute('height', `${totalHeight}px`);
        svg.setAttribute('viewBox', `${minX} ${minY} ${totalWidth} ${totalHeight}`);
        
        // Defs für Pfeile
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        arrowMarker.setAttribute('id', 'arrowhead');
        arrowMarker.setAttribute('markerWidth', '10');
        arrowMarker.setAttribute('markerHeight', '10');
        arrowMarker.setAttribute('refX', '9');
        arrowMarker.setAttribute('refY', '3');
        arrowMarker.setAttribute('orient', 'auto');
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#333');
        arrowMarker.appendChild(arrowPath);
        defs.appendChild(arrowMarker);
        svg.appendChild(defs);
        
        // Erstelle Gruppe für Zeichnung
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Zeichne Elemente als SVG
        this.drawToSVG(g);
        
        svg.appendChild(g);
        
        // Konvertiere zu String und Download
        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svg);
        const blob = new Blob([svgString], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ProfilZeichner_${new Date().toISOString().slice(0,10)}.svg`;
        link.click();
        URL.revokeObjectURL(url);
    }
    
    // Zeichne alle Elemente als SVG
    drawToSVG(svgGroup) {
        const ns = 'http://www.w3.org/2000/svg';
        const rect = this.currentRect;
        if (!rect) return;
        
        // 1. Profil mit Kerben-Unterbrechungen
        this.drawProfileToSVG(svgGroup, rect);
        
        // 2. Bohnen
        this.drawBohnenToSVG(svgGroup, rect);
        
        // 3. Kerben
        this.drawKerbenToSVG(svgGroup, rect);
        
        // 4. Löcher
        this.drawLoecherToSVG(svgGroup, rect);
        
        // 5. Ausschnitte
        this.drawAusschnitteToSVG(svgGroup, rect);
        
        // 6. Crimping
        this.drawCrimpingToSVG(svgGroup, rect);
        
        // 7. Nahtlinie
        this.drawNahtlinieToSVG(svgGroup, rect);
        
        // 8. Texte
        this.drawTextsToSVG(svgGroup);
        
        // 9. Bemaßungen (wichtig für Textqualität)
        if (this.showDimensions) {
            this.drawDimensionsToSVG(svgGroup, rect);
        }
        
        // 10. Detailzeichnungen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            // Berechne Startposition für Detailzeichnungen (wie in draw)
            let detailStartY = rect.y + rect.height;
            if (this.showDimensions) {
                // Wenn Bemaßungen aktiv sind, Detailzeichnungen nach den Bemaßungen
                const dimensionOffset = 7 * this.mmToPx;
                let currentYOffset = 10 * this.mmToPx;
                
                // Zähle Bemaßungen unten
                const elementsUnten = [];
                this.kerben.forEach(kerbe => {
                    if (kerbe.position === 'unten') elementsUnten.push({ position: kerbe.distance });
                });
                this.ausschnitte.forEach(ausschnitt => {
                    if (ausschnitt.positionType === 'unten') elementsUnten.push({ position: ausschnitt.position });
                });
                
                elementsUnten.sort((a, b) => a.position - b.position);
                currentYOffset += elementsUnten.length * dimensionOffset;
                
                detailStartY = rect.y + rect.height + currentYOffset + (10 * this.mmToPx);
            } else {
                detailStartY = rect.y + rect.height + (50 * this.mmToPx);
            }
            
            this.drawDetailDrawingsToSVG(svgGroup, rect, detailStartY);
        }
        
        // 11. Detail-Indikatoren (gestrichelte Kreise um Kerben/Löcher)
        this.drawDetailIndicatorsToSVG(svgGroup, rect);
        
        // 12. Titelblock
        if (this.titleBlock && this.titleBlock.x != null) {
            this.drawTitleBlockToSVG(svgGroup);
        }
    }
    
    // Profil als SVG (mit Kerben-Unterbrechungen)
    drawProfileToSVG(svgGroup, rect) {
        const ns = 'http://www.w3.org/2000/svg';
        
        // Prüfe ob Cut-out angewendet wurde
        if (this.cutoutWidth > 0) {
            // Profil mit Cut-out zeichnen (wie in drawCutoutProfile)
            const cutoutWidthPx = this.cutoutWidth * this.mmToPx;
            const cutoutHeightPx = this.cutoutHeight * this.mmToPx;
            
            // Berechne die Eckpunkte des Cut-out-Profils
            const x1 = rect.x + cutoutWidthPx; // Ecke 1 nach rechts verschoben
            const y1 = rect.y;
            const x2 = rect.x + rect.width - cutoutWidthPx; // Ecke 2 nach links verschoben
            const y2 = rect.y;
            const x3 = rect.x + rect.width; // Ecke 3 unverändert
            const y3 = rect.y + rect.height;
            const x4 = rect.x; // Ecke 4 unverändert
            const y4 = rect.y + rect.height;
            
            const path = document.createElementNS(ns, 'path');
            let pathData = `M ${x1} ${y1}`; // Start bei Ecke 1 (oben links verschoben)
            pathData += ` L ${x2} ${y2}`; // Zu Ecke 2 (oben rechts verschoben)
            
            if (this.cutoutHeight > 0) {
                // Punkt zwischen Ecke 2 und 3 (von Ecke 3 aus vertikal nach oben)
                const x5 = x3;
                const y5 = y3 - cutoutHeightPx;
                // Punkt zwischen Ecke 4 und 1 (von Ecke 4 aus vertikal nach oben)
                const x6 = x4;
                const y6 = y4 - cutoutHeightPx;
                
                pathData += ` L ${x5} ${y5}`; // Schräge rechts oben nach oben
                pathData += ` L ${x3} ${y3}`; // Zu Ecke 3 (unten rechts)
                pathData += ` L ${x4} ${y4}`; // Zu Ecke 4 (unten links)
                pathData += ` L ${x6} ${y6}`; // Schräge links oben nach oben
            } else {
                pathData += ` L ${x3} ${y3}`; // Direkt zu Ecke 3 (unten rechts)
                pathData += ` L ${x4} ${y4}`; // Zu Ecke 4 (unten links)
            }
            
            pathData += ` Z`; // Zurück zu Start (schließt den Pfad)
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', '#E0E0E0');
            path.setAttribute('stroke', '#333');
            path.setAttribute('stroke-width', '1');
            svgGroup.appendChild(path);
        } else {
            // Normales Profil mit Kerben-Unterbrechungen
            const kerbenOben = this.kerben.filter(k => {
                if (k.kerbenTypeId) {
                    const kt = this.kerbenTypes.find(kt => kt.id === k.kerbenTypeId);
                    return kt && kt.type !== 'marker' && k.position === 'oben';
                }
                return k.type !== 'marker' && k.position === 'oben';
            }).sort((a, b) => a.distance - b.distance);
            
            const kerbenUnten = this.kerben.filter(k => {
                if (k.kerbenTypeId) {
                    const kt = this.kerbenTypes.find(kt => kt.id === k.kerbenTypeId);
                    return kt && kt.type !== 'marker' && k.position === 'unten';
                }
                return k.type !== 'marker' && k.position === 'unten';
            }).sort((a, b) => a.distance - b.distance);
            
            const path = document.createElementNS(ns, 'path');
            let pathData = `M ${rect.x} ${rect.y}`;
            
            // Obere Kante mit Unterbrechungen
            let currentX = rect.x;
            for (const kerbe of kerbenOben) {
                const distancePx = kerbe.distance * this.mmToPx;
                let widthPx;
                if (kerbe.kerbenTypeId) {
                    const kt = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                    widthPx = kt ? kt.width * this.mmToPx : 6 * this.mmToPx;
                } else {
                    widthPx = (kerbe.width || 6) * this.mmToPx;
                }
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width && kerbeStartX > currentX) {
                    pathData += ` L ${kerbeStartX} ${rect.y}`;
                }
                currentX = Math.max(currentX, kerbeEndX);
            }
            if (currentX < rect.x + rect.width) {
                pathData += ` L ${rect.x + rect.width} ${rect.y}`;
            }
            
            // Rechte Kante
            pathData += ` L ${rect.x + rect.width} ${rect.y + rect.height}`;
            
            // Untere Kante mit Unterbrechungen
            currentX = rect.x + rect.width;
            for (const kerbe of kerbenUnten) {
                const distancePx = kerbe.distance * this.mmToPx;
                let widthPx;
                if (kerbe.kerbenTypeId) {
                    const kt = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                    widthPx = kt ? kt.width * this.mmToPx : 6 * this.mmToPx;
                } else {
                    widthPx = (kerbe.width || 6) * this.mmToPx;
                }
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width && kerbeEndX < currentX) {
                    pathData += ` L ${kerbeEndX} ${rect.y + rect.height}`;
                }
                currentX = Math.min(currentX, kerbeStartX);
            }
            if (currentX > rect.x) {
                pathData += ` L ${rect.x} ${rect.y + rect.height}`;
            }
            
            // Linke Kante
            pathData += ` Z`;
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', '#E0E0E0');
            path.setAttribute('stroke', '#333');
            path.setAttribute('stroke-width', '1');
            svgGroup.appendChild(path);
        }
    }
    
    // Bohnen als SVG
    drawBohnenToSVG(svgGroup, rect) {
        if (this.bohnen.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        const bohne = this.bohnen[0];
        
        let bohneWidth = rect.width;
        if (this.cutoutWidth > 0) {
            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
        }
        
        const bohneHeight = bohne.height * this.mmToPx;
        const bohneX = rect.x + (rect.width - bohneWidth) / 2;
        const bohneY = rect.y - bohneHeight;
        
        const rectEl = document.createElementNS(ns, 'rect');
        rectEl.setAttribute('x', bohneX.toString());
        rectEl.setAttribute('y', bohneY.toString());
        rectEl.setAttribute('width', bohneWidth.toString());
        rectEl.setAttribute('height', bohneHeight.toString());
        rectEl.setAttribute('fill', '#36454F');
        rectEl.setAttribute('stroke', '#333');
        rectEl.setAttribute('stroke-width', '1');
        svgGroup.appendChild(rectEl);
    }
    
    // Kerben als SVG
    drawKerbenToSVG(svgGroup, rect) {
        if (this.kerben.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        
        this.kerben.forEach(kerbe => {
            const distancePx = kerbe.distance * this.mmToPx;
            
            let widthPx, depthPx, type;
            if (kerbe.kerbenTypeId) {
                const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                if (!kerbenType) return;
                widthPx = kerbenType.width * this.mmToPx;
                depthPx = kerbenType.depth * this.mmToPx;
                type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
            } else {
                widthPx = (kerbe.width || 6) * this.mmToPx;
                depthPx = (kerbe.depth || 4) * this.mmToPx;
                type = kerbe.type || 'triangle';
            }
            
            const kerbeX = rect.x + distancePx;
            const kerbeY = kerbe.position === 'oben' ? rect.y : rect.y + rect.height;
            
            if (type === 'marker') {
                // Strich-Markierung
                const line = document.createElementNS(ns, 'line');
                if (kerbe.position === 'oben') {
                    line.setAttribute('x1', kerbeX.toString());
                    line.setAttribute('y1', kerbeY.toString());
                    line.setAttribute('x2', kerbeX.toString());
                    line.setAttribute('y2', (kerbeY + depthPx).toString());
                } else {
                    line.setAttribute('x1', kerbeX.toString());
                    line.setAttribute('y1', kerbeY.toString());
                    line.setAttribute('x2', kerbeX.toString());
                    line.setAttribute('y2', (kerbeY - depthPx).toString());
                }
                line.setAttribute('stroke', '#333');
                line.setAttribute('stroke-width', '1');
                svgGroup.appendChild(line);
            } else {
                // Dreieck
                const path = document.createElementNS(ns, 'path');
                let pathData;
                if (kerbe.position === 'oben') {
                    pathData = `M ${kerbeX - widthPx/2} ${kerbeY}`;
                    pathData += ` L ${kerbeX} ${kerbeY + depthPx}`;
                    pathData += ` L ${kerbeX + widthPx/2} ${kerbeY} Z`;
                } else {
                    pathData = `M ${kerbeX - widthPx/2} ${kerbeY}`;
                    pathData += ` L ${kerbeX} ${kerbeY - depthPx}`;
                    pathData += ` L ${kerbeX + widthPx/2} ${kerbeY} Z`;
                }
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'white');
                path.setAttribute('stroke', '#333');
                path.setAttribute('stroke-width', '1');
                svgGroup.appendChild(path);
            }
        });
    }
    
    // Löcher als SVG
    drawLoecherToSVG(svgGroup, rect) {
        if (this.loecher.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        
        this.loecher.forEach(loch => {
            const distancePx = loch.distance * this.mmToPx;
            const widthPx = loch.width * this.mmToPx;
            const heightPx = loch.height * this.mmToPx;
            const positionPx = (loch.position || this.CONFIG.defaultLochPositionFromTop) * this.mmToPx;
            
            const lochX = rect.x + distancePx;
            const lochY = rect.y + positionPx + (heightPx / 2);
            
            // Kreis
            if (Math.abs(widthPx - heightPx) < 0.1) {
                const circle = document.createElementNS(ns, 'circle');
                circle.setAttribute('cx', lochX.toString());
                circle.setAttribute('cy', lochY.toString());
                circle.setAttribute('r', (widthPx / 2).toString());
                circle.setAttribute('fill', 'white');
                circle.setAttribute('stroke', '#333');
                circle.setAttribute('stroke-width', '1');
                svgGroup.appendChild(circle);
            } else {
                // Kapsel (Stadion-Form)
                const radius = Math.min(widthPx, heightPx) / 2;
                const x = lochX - widthPx / 2;
                const y = lochY - heightPx / 2;
                
                const path = document.createElementNS(ns, 'path');
                const r = radius;
                const rRight = x + widthPx - r;
                const rBottom = y + heightPx - r;
                let pathData = `M ${x + r} ${y}`;
                pathData += ` L ${rRight} ${y}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x + widthPx} ${y + r}`;
                pathData += ` L ${x + widthPx} ${rBottom}`;
                pathData += ` A ${r} ${r} 0 0 1 ${rRight} ${y + heightPx}`;
                pathData += ` L ${x + r} ${y + heightPx}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x} ${rBottom}`;
                pathData += ` L ${x} ${y + r}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
                
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'white');
                path.setAttribute('stroke', '#333');
                path.setAttribute('stroke-width', '1');
                svgGroup.appendChild(path);
            }
        });
    }
    
    // Ausschnitte als SVG
    drawAusschnitteToSVG(svgGroup, rect) {
        if (this.ausschnitte.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        
        this.ausschnitte.forEach(ausschnitt => {
            const positionPx = ausschnitt.position * this.mmToPx;
            const widthPx = ausschnitt.width * this.mmToPx;
            const heightPx = ausschnitt.height * this.mmToPx;
            
            let x, y;
            if (ausschnitt.positionType === 'oben') {
                x = rect.x + positionPx;
                y = rect.y;
            } else {
                x = rect.x + positionPx;
                y = rect.y + rect.height - heightPx;
            }
            
            // Schräglinien für Ausschnitt
            const g = document.createElementNS(ns, 'g');
            g.setAttribute('stroke', '#333');
            g.setAttribute('stroke-width', '1');
            
            // Linie 1: oben links nach unten rechts
            const line1 = document.createElementNS(ns, 'line');
            line1.setAttribute('x1', x.toString());
            line1.setAttribute('y1', y.toString());
            line1.setAttribute('x2', (x + widthPx).toString());
            line1.setAttribute('y2', (y + heightPx).toString());
            g.appendChild(line1);
            
            // Linie 2: oben rechts nach unten links
            const line2 = document.createElementNS(ns, 'line');
            line2.setAttribute('x1', (x + widthPx).toString());
            line2.setAttribute('y1', y.toString());
            line2.setAttribute('x2', x.toString());
            line2.setAttribute('y2', (y + heightPx).toString());
            g.appendChild(line2);
            
            svgGroup.appendChild(g);
        });
    }
    
    // Crimping als SVG
    drawCrimpingToSVG(svgGroup, rect) {
        if (this.crimping.length === 0 || this.bohnen.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        const bohne = this.bohnen[0];
        
        let bohneWidth = rect.width;
        if (this.cutoutWidth > 0) {
            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
        }
        const bohneX = rect.x + (rect.width - bohneWidth) / 2;
        const bohneY = rect.y - (bohne.height * this.mmToPx);
        
        this.crimping.forEach(crimpingItem => {
            const positionPx = crimpingItem.position * this.mmToPx;
            const lengthPx = crimpingItem.length * this.mmToPx;
            const heightPx = bohne.height * this.mmToPx;
            
            // Berechne tatsächliche Position innerhalb der Bohne
            let actualX = bohneX + positionPx;
            let actualWidth = lengthPx;
            
            // Begrenze auf Bohne-Grenzen
            if (actualX < bohneX) {
                actualWidth -= (bohneX - actualX);
                actualX = bohneX;
            }
            if (actualX + actualWidth > bohneX + bohneWidth) {
                actualWidth = bohneX + bohneWidth - actualX;
            }
            
            if (actualWidth <= 0) return;
            
            // Rechteck mit Schraffur
            const rectEl = document.createElementNS(ns, 'rect');
            rectEl.setAttribute('x', actualX.toString());
            rectEl.setAttribute('y', bohneY.toString());
            rectEl.setAttribute('width', actualWidth.toString());
            rectEl.setAttribute('height', heightPx.toString());
            rectEl.setAttribute('fill', '#808080');
            rectEl.setAttribute('stroke', '#666');
            rectEl.setAttribute('stroke-width', '1');
            svgGroup.appendChild(rectEl);
            
            // Schraffur (diagonale Linien)
            const hatchGroup = document.createElementNS(ns, 'g');
            hatchGroup.setAttribute('stroke', '#666');
            hatchGroup.setAttribute('stroke-width', '0.5');
            
            const spacing = 3 * this.mmToPx;
            for (let i = 0; i < actualWidth; i += spacing) {
                const line = document.createElementNS(ns, 'line');
                line.setAttribute('x1', (actualX + i).toString());
                line.setAttribute('y1', bohneY.toString());
                line.setAttribute('x2', (actualX + i - heightPx).toString());
                line.setAttribute('y2', (bohneY + heightPx).toString());
                hatchGroup.appendChild(line);
            }
            svgGroup.appendChild(hatchGroup);
        });
    }
    
    // Nahtlinie als SVG
    drawNahtlinieToSVG(svgGroup, rect) {
        if (!this.nahtlinie) return;
        const ns = 'http://www.w3.org/2000/svg';
        const distancePx = this.nahtlinie.distance * this.mmToPx;
        const y = rect.y + rect.height - distancePx;
        
        if (this.nahtlinie.type === 'dashed') {
            const line = document.createElementNS(ns, 'line');
            line.setAttribute('x1', rect.x.toString());
            line.setAttribute('y1', y.toString());
            line.setAttribute('x2', (rect.x + rect.width).toString());
            line.setAttribute('y2', y.toString());
            line.setAttribute('stroke', '#333');
            line.setAttribute('stroke-width', '1');
            line.setAttribute('stroke-dasharray', '10,5');
            svgGroup.appendChild(line);
        } else if (this.nahtlinie.type === 'holes') {
            const holeDiameter = 1 * this.mmToPx;
            const holeSpacing = 3 * this.mmToPx;
            
            for (let x = rect.x; x <= rect.x + rect.width; x += holeSpacing) {
                const circle = document.createElementNS(ns, 'circle');
                circle.setAttribute('cx', x.toString());
                circle.setAttribute('cy', y.toString());
                circle.setAttribute('r', (holeDiameter / 2).toString());
                circle.setAttribute('fill', '#333');
                svgGroup.appendChild(circle);
            }
        }
    }
    
    // Texte als SVG
    drawTextsToSVG(svgGroup) {
        if (this.texts.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        
        this.texts.forEach(text => {
            const textEl = document.createElementNS(ns, 'text');
            textEl.setAttribute('x', text.x.toString());
            textEl.setAttribute('y', text.y.toString());
            textEl.setAttribute('font-size', text.size.toString());
            textEl.setAttribute('font-family', 'Arial');
            textEl.setAttribute('fill', '#333');
            textEl.setAttribute('text-anchor', 'start');
            textEl.setAttribute('dominant-baseline', 'baseline');
            textEl.textContent = text.content;
            svgGroup.appendChild(textEl);
        });
    }
    
    // Bemaßungen als SVG (vollständige Implementierung)
    drawDimensionsToSVG(svgGroup, rect) {
        const ns = 'http://www.w3.org/2000/svg';
        const fontSize = this.CONFIG.dimensionFontSize;
        const corner4X = rect.x;
        const corner4Y = rect.y + rect.height;
        const dimensionOffset = this.CONFIG.dimensionLineSpacing * this.mmToPx;
        let currentYOffset = this.CONFIG.dimensionOffset * this.mmToPx;
        
        // Sammle alle Elemente
        const allElements = [];
        this.kerben.forEach(kerbe => {
            allElements.push({
                type: 'kerbe',
                position: kerbe.distance,
                positionType: kerbe.position,
                element: kerbe
            });
        });
        this.ausschnitte.forEach(ausschnitt => {
            allElements.push({
                type: 'ausschnitt',
                position: ausschnitt.position,
                positionType: ausschnitt.positionType,
                element: ausschnitt
            });
        });
        this.loecher.forEach(loch => {
            allElements.push({
                type: 'loch',
                position: loch.distance,
                element: loch
            });
        });
        this.crimping.forEach(crimpingItem => {
            allElements.push({
                type: 'crimping',
                position: crimpingItem.position,
                length: crimpingItem.length,
                element: crimpingItem
            });
        });
        
        allElements.sort((a, b) => a.position - b.position);
        
        const elementsOben = allElements.filter(el => 
            (el.type === 'kerbe' && el.positionType === 'oben') ||
            (el.type === 'ausschnitt' && el.positionType === 'oben') ||
            el.type === 'loch' ||
            el.type === 'crimping'
        );
        const elementsUnten = allElements.filter(el => 
            (el.type === 'kerbe' && el.positionType === 'unten') ||
            (el.type === 'ausschnitt' && el.positionType === 'unten')
        );
        
        // Bemaßungen oberhalb
        let obenOffset = 0;
        if (elementsOben.length > 0) {
            let obenDimensionY;
            if (this.bohnen.length > 0) {
                const bohneHeight = this.bohnen[0].height * this.mmToPx;
                obenDimensionY = rect.y - bohneHeight - (8 * this.mmToPx);
            } else {
                obenDimensionY = rect.y - (8 * this.mmToPx);
            }
            
            elementsOben.forEach((element, index) => {
                const positionPx = element.position * this.mmToPx;
                const customOffset = this.dimensionOffsets.horizontal[index] || 0;
                const dimensionY = obenDimensionY - obenOffset + customOffset;
                
                if (element.type === 'ausschnitt' || element.type === 'crimping') {
                    this.drawHorizontalDimensionLeftArrowOnlySVG(svgGroup, corner4X, dimensionY, rect.x + positionPx, dimensionY, `${element.position}mm`, fontSize);
                } else {
                    this.drawHorizontalDimensionFromZeroSVG(svgGroup, corner4X, dimensionY, rect.x + positionPx, dimensionY, `${element.position}mm`, fontSize);
                }
                obenOffset += dimensionOffset;
            });
        }
        
        // Bemaßungen unterhalb
        elementsUnten.forEach((element, index) => {
            const positionPx = element.position * this.mmToPx;
            const baseIndexBottom = elementsOben.length;
            const customOffset = this.dimensionOffsets.horizontal[baseIndexBottom + index] || 0;
            const dimensionY = corner4Y + currentYOffset + customOffset;
            
            if (element.type === 'ausschnitt') {
                this.drawHorizontalDimensionLeftArrowOnlySVG(svgGroup, corner4X, dimensionY, rect.x + positionPx, dimensionY, `${element.position}mm`, fontSize);
            } else {
                this.drawHorizontalDimensionFromZeroSVG(svgGroup, corner4X, dimensionY, rect.x + positionPx, dimensionY, `${element.position}mm`, fontSize);
            }
            currentYOffset += dimensionOffset;
        });
        
        // Vertikale Bemaßungen (rechts)
        let rightDimensionX = rect.x + rect.width + (20 * this.mmToPx);
        const rightDimensionSpacing = 7 * this.mmToPx;
        let verticalIndex = 0;
        
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            const bohneTopY = rect.y - bohneHeight;
            
            const customOffsetX1 = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX1 = rightDimensionX + customOffsetX1;
            this.drawVerticalDimensionFromZeroSVG(svgGroup, bohneTopY, dimensionX1, rect.y, dimensionX1, `${bohne.height}mm`, fontSize);
            verticalIndex++;
            rightDimensionX += rightDimensionSpacing;
            
            const customOffsetX2 = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX2 = rightDimensionX + customOffsetX2;
            this.drawVerticalDimensionFromZeroSVG(svgGroup, rect.y, dimensionX2, rect.y + rect.height, dimensionX2, `${(rect.height / this.mmToPx).toFixed(1)}mm`, fontSize);
            verticalIndex++;
        } else {
            const customOffsetX = this.dimensionOffsets.vertical[verticalIndex] || 0;
            const dimensionX = rightDimensionX + customOffsetX;
            this.drawVerticalDimensionFromZeroSVG(svgGroup, rect.y, dimensionX, rect.y + rect.height, dimensionX, `${(rect.height / this.mmToPx).toFixed(1)}mm`, fontSize);
        }
        
        // Cutout-Bemaßungen
        if (this.cutoutWidth > 0) {
            const cutoutWidthPx = this.cutoutWidth * this.mmToPx;
            const cutoutHeightPx = this.cutoutHeight * this.mmToPx;
            
            // Cutout-Breite bemaßen (oberhalb des Profils)
            let cutoutDimY;
            if (this.bohnen.length > 0) {
                const bohneHeight = this.bohnen[0].height * this.mmToPx;
                cutoutDimY = rect.y - bohneHeight - (8 * this.mmToPx);
            } else {
                cutoutDimY = rect.y - (8 * this.mmToPx);
            }
            
            const cutoutX1 = rect.x + cutoutWidthPx; // Cutout-Stelle links
            const cutoutX2 = rect.x + rect.width - cutoutWidthPx; // Cutout-Stelle rechts
            // Nutze Offset falls vorhanden
            const cutoutIndex = elementsOben.length;
            const customOffsetCutout = this.dimensionOffsets.horizontal[cutoutIndex] || 0;
            cutoutDimY += customOffsetCutout;
            
            // Cutout-Breite-Bemaßung (von links bis rechts)
            this.drawHorizontalDimensionLeftArrowOnlySVG(
                svgGroup,
                cutoutX1, // Start bei Cutout-Stelle links
                cutoutDimY,
                cutoutX2, // Ende bei Cutout-Stelle rechts
                cutoutDimY,
                `${this.cutoutWidth}mm`,
                fontSize
            );
            
            // Cutout-Höhe bemaßen (rechts, von oben bis unten)
            if (this.cutoutHeight > 0) {
                const cutoutBottomY = rect.y + rect.height;
                const cutoutTopY = cutoutBottomY - cutoutHeightPx;
                const cutoutDimensionX = rightDimensionX;
                const customOffsetX = this.dimensionOffsets.vertical[verticalIndex] || 0;
                const dimensionX = cutoutDimensionX + customOffsetX;
                
                this.drawVerticalDimensionFromZeroSVG(
                    svgGroup,
                    cutoutTopY,
                    dimensionX,
                    cutoutBottomY,
                    dimensionX,
                    `${this.cutoutHeight}mm`,
                    fontSize
                );
            } else {
                // Nur Breite bemaßen (wenn keine Höhe)
                const cutoutDimensionX = rightDimensionX;
                const customOffsetX = this.dimensionOffsets.vertical[verticalIndex] || 0;
                const dimensionX = cutoutDimensionX + customOffsetX;
                
                this.drawVerticalDimensionFromZeroSVG(
                    svgGroup,
                    rect.y + cutoutWidthPx,
                    dimensionX,
                    rect.y + rect.height - cutoutWidthPx,
                    dimensionX,
                    `${this.cutoutWidth}mm`,
                    fontSize
                );
            }
        }
        
        // Crimping-Bemaßungen
        if (this.crimping.length > 0 && this.bohnen.length > 0) {
            this.crimping.forEach((crimpingItem, index) => {
                const lengthPx = crimpingItem.length * this.mmToPx;
                const positionPx = crimpingItem.position * this.mmToPx;
                let bohneWidth = rect.width;
                if (this.cutoutWidth > 0) {
                    bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
                }
                const bohneX = rect.x + (rect.width - bohneWidth) / 2;
                const crimpingX = bohneX + positionPx;
                const crimpingDimensionY = rect.y - (this.bohnen[0].height * this.mmToPx) - (15 * this.mmToPx);
                
                const widthLine = document.createElementNS(ns, 'line');
                widthLine.setAttribute('x1', crimpingX.toString());
                widthLine.setAttribute('y1', crimpingDimensionY.toString());
                widthLine.setAttribute('x2', (crimpingX + lengthPx).toString());
                widthLine.setAttribute('y2', crimpingDimensionY.toString());
                widthLine.setAttribute('stroke', '#555');
                widthLine.setAttribute('stroke-width', '0.5');
                svgGroup.appendChild(widthLine);
                
                // Pfeile
                const arrow1 = document.createElementNS(ns, 'path');
                arrow1.setAttribute('d', `M ${crimpingX} ${crimpingDimensionY} L ${crimpingX + 6} ${crimpingDimensionY - 3} L ${crimpingX + 6} ${crimpingDimensionY + 3} Z`);
                arrow1.setAttribute('fill', '#555');
                svgGroup.appendChild(arrow1);
                
                const arrow2 = document.createElementNS(ns, 'path');
                arrow2.setAttribute('d', `M ${crimpingX + lengthPx} ${crimpingDimensionY} L ${crimpingX + lengthPx - 6} ${crimpingDimensionY - 3} L ${crimpingX + lengthPx - 6} ${crimpingDimensionY + 3} Z`);
                arrow2.setAttribute('fill', '#555');
                svgGroup.appendChild(arrow2);
                
                // Text
                const textEl = document.createElementNS(ns, 'text');
                textEl.setAttribute('x', (crimpingX + lengthPx / 2).toString());
                textEl.setAttribute('y', (crimpingDimensionY - 5).toString());
                textEl.setAttribute('font-size', fontSize.toString());
                textEl.setAttribute('font-family', this.CONFIG.dimensionFontFamily);
                textEl.setAttribute('fill', '#555');
                textEl.setAttribute('text-anchor', 'middle');
                textEl.setAttribute('dominant-baseline', 'baseline');
                textEl.textContent = `${crimpingItem.length}mm`;
                svgGroup.appendChild(textEl);
            });
        }
        
        // Nahtlinie-Bemaßung (innerhalb des Profils, 30mm von links)
        if (this.nahtlinie) {
            const nahtDistancePx = this.nahtlinie.distance * this.mmToPx;
            const nahtY = rect.y + rect.height - nahtDistancePx;
            const insideX = rect.x + (30 * this.mmToPx); // 30mm von links innerhalb des Profils
            
            this.drawVerticalDimensionFromZeroSVG(svgGroup, nahtY, insideX, rect.y + rect.height, insideX, `${this.nahtlinie.distance}mm`, fontSize);
        }
        
        // Gesamtbreite-Bemaßung (ganz unten, ganz außen)
        const totalWidthYOffset = (elementsUnten.length * dimensionOffset) + (this.nahtlinie && this.nahtlinie.distance > 0 ? dimensionOffset : 0);
        const totalWidthIndex = elementsOben.length + elementsUnten.length;
        const customOffsetTotalWidth = this.dimensionOffsets.horizontal[totalWidthIndex] || 0;
        const totalWidthY = corner4Y + currentYOffset + totalWidthYOffset + customOffsetTotalWidth;
        
        this.drawHorizontalDimensionFromZeroSVG(
            svgGroup,
            corner4X,
            totalWidthY,
            rect.x + rect.width,
            totalWidthY,
            `${(rect.width / this.mmToPx).toFixed(1)}mm`,
            fontSize
        );
    }
    
    // Hilfsfunktionen für Bemaßungen als SVG
    drawHorizontalDimensionFromZeroSVG(svgGroup, startX, y, endX, y2, label, fontSize) {
        const ns = 'http://www.w3.org/2000/svg';
        const arrowSize = this.CONFIG.dimensionArrowSize;
        const rect = this.currentRect;
        
        // Berechne Zielpunkt für gestrichelte Linien (zum Profil)
        let elementTopY = rect ? (rect.y + rect.height) : y;
        if (rect) {
            if (y > rect.y + rect.height) {
                // Bemaßung ist unterhalb des Profils - Linie geht nach oben zum Profil
                elementTopY = rect.y + rect.height; // Bis zur unteren Profilkante
            } else {
                // Bemaßung ist oberhalb des Profils - Linie geht nach unten zum Profil
                elementTopY = rect.y; // Bis zur oberen Profilkante
            }
        }
        
        // Gestrichelte Hilfslinien zum Element (an den Enden der Bemaßungslinie) - BLAU
        if (rect) {
            // Gestrichelte Linie am Anfang (zum Element)
            const dashLine1 = document.createElementNS(ns, 'line');
            dashLine1.setAttribute('x1', startX.toString());
            dashLine1.setAttribute('y1', y.toString());
            dashLine1.setAttribute('x2', startX.toString());
            dashLine1.setAttribute('y2', elementTopY.toString());
            dashLine1.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine1.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
            dashLine1.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine1);
            
            // Gestrichelte Linie am Ende (zum Element)
            const dashLine2 = document.createElementNS(ns, 'line');
            dashLine2.setAttribute('x1', endX.toString());
            dashLine2.setAttribute('y1', y.toString());
            dashLine2.setAttribute('x2', endX.toString());
            dashLine2.setAttribute('y2', elementTopY.toString());
            dashLine2.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine2.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
            dashLine2.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine2);
        }
        
        // Hauptlinie
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', startX.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', endX.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', this.CONFIG.colors.dimension);
        line.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
        svgGroup.appendChild(line);
        
        // Pfeil links
        const arrow1 = document.createElementNS(ns, 'path');
        arrow1.setAttribute('d', `M ${startX} ${y} L ${startX + arrowSize} ${y - arrowSize/2} L ${startX + arrowSize} ${y + arrowSize/2} Z`);
        arrow1.setAttribute('fill', this.CONFIG.colors.dimension);
        svgGroup.appendChild(arrow1);
        
        // Pfeil rechts
        const arrow2 = document.createElementNS(ns, 'path');
        arrow2.setAttribute('d', `M ${endX} ${y} L ${endX - arrowSize} ${y - arrowSize/2} L ${endX - arrowSize} ${y + arrowSize/2} Z`);
        arrow2.setAttribute('fill', this.CONFIG.colors.dimension);
        svgGroup.appendChild(arrow2);
        
        // Text (wie Canvas: y - 10)
        const textEl = document.createElementNS(ns, 'text');
        textEl.setAttribute('x', ((startX + endX) / 2).toString());
        textEl.setAttribute('y', (y - 10).toString());
        textEl.setAttribute('font-size', fontSize.toString());
        textEl.setAttribute('font-family', this.CONFIG.dimensionFontFamily);
        textEl.setAttribute('fill', this.CONFIG.colors.dimension);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'baseline');
        textEl.textContent = label;
        svgGroup.appendChild(textEl);
    }
    
    drawHorizontalDimensionLeftArrowOnlySVG(svgGroup, startX, y, endX, y2, label, fontSize) {
        const ns = 'http://www.w3.org/2000/svg';
        const arrowSize = 6; // Wie im Canvas (fest für Cutouts)
        const rect = this.currentRect;
        
        // Berechne Zielpunkt für gestrichelte Linien (zum Profil)
        let elementTopY = rect ? (rect.y + rect.height) : y;
        if (rect) {
            if (y > rect.y + rect.height) {
                // Bemaßung ist unterhalb des Profils - Linie geht nach oben zum Profil
                elementTopY = rect.y + rect.height; // Bis zur unteren Profilkante
            } else {
                // Bemaßung ist oberhalb des Profils - Linie geht nach unten zum Profil
                elementTopY = rect.y; // Bis zur oberen Profilkante
            }
        }
        
        // Gestrichelte Hilfslinien zum Element - BLAU
        if (rect) {
            // Gestrichelte Linie am Anfang (links)
            const dashLine1 = document.createElementNS(ns, 'line');
            dashLine1.setAttribute('x1', startX.toString());
            dashLine1.setAttribute('y1', y.toString());
            dashLine1.setAttribute('x2', startX.toString());
            dashLine1.setAttribute('y2', elementTopY.toString());
            dashLine1.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine1.setAttribute('stroke-width', '0.5');
            dashLine1.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine1);
            
            // Gestrichelte Linie am Ende (rechts)
            const dashLine2 = document.createElementNS(ns, 'line');
            dashLine2.setAttribute('x1', endX.toString());
            dashLine2.setAttribute('y1', y.toString());
            dashLine2.setAttribute('x2', endX.toString());
            dashLine2.setAttribute('y2', elementTopY.toString());
            dashLine2.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine2.setAttribute('stroke-width', '0.5');
            dashLine2.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine2);
        }
        
        // Hauptlinie
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', startX.toString());
        line.setAttribute('y1', y.toString());
        line.setAttribute('x2', endX.toString());
        line.setAttribute('y2', y.toString());
        line.setAttribute('stroke', this.CONFIG.colors.dimension);
        line.setAttribute('stroke-width', '0.5');
        svgGroup.appendChild(line);
        
        // Pfeil links
        const arrow = document.createElementNS(ns, 'path');
        arrow.setAttribute('d', `M ${startX} ${y} L ${startX + arrowSize} ${y - arrowSize/2} L ${startX + arrowSize} ${y + arrowSize/2} Z`);
        arrow.setAttribute('fill', this.CONFIG.colors.dimension);
        svgGroup.appendChild(arrow);
        
        // Text (wie Canvas: y - 10)
        const textEl = document.createElementNS(ns, 'text');
        textEl.setAttribute('x', ((startX + endX) / 2).toString());
        textEl.setAttribute('y', (y - 10).toString());
        textEl.setAttribute('font-size', fontSize.toString());
        textEl.setAttribute('font-family', this.CONFIG.dimensionFontFamily);
        textEl.setAttribute('fill', this.CONFIG.colors.dimension);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('dominant-baseline', 'baseline');
        textEl.textContent = label;
        svgGroup.appendChild(textEl);
    }
    
    drawVerticalDimensionFromZeroSVG(svgGroup, startY, x, endY, x2, label, fontSize) {
        const ns = 'http://www.w3.org/2000/svg';
        const arrowSize = this.CONFIG.dimensionArrowSize;
        const rect = this.currentRect;
        
        // Berechne Zielpunkt für gestrichelte Linien (zum Profil)
        let elementRightX = rect ? (rect.x + rect.width) : x; // Rechte Kante des Profils
        
        // Gestrichelte Hilfslinien zum Element (an den Enden der Bemaßungslinie) - BLAU
        if (rect) {
            // Gestrichelte Linie am Anfang (oben) - horizontal bis zum Profil
            const dashLine1 = document.createElementNS(ns, 'line');
            dashLine1.setAttribute('x1', x.toString());
            dashLine1.setAttribute('y1', startY.toString());
            dashLine1.setAttribute('x2', elementRightX.toString());
            dashLine1.setAttribute('y2', startY.toString());
            dashLine1.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine1.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
            dashLine1.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine1);
            
            // Gestrichelte Linie am Ende (unten) - horizontal bis zum Profil
            const dashLine2 = document.createElementNS(ns, 'line');
            dashLine2.setAttribute('x1', x.toString());
            dashLine2.setAttribute('y1', endY.toString());
            dashLine2.setAttribute('x2', elementRightX.toString());
            dashLine2.setAttribute('y2', endY.toString());
            dashLine2.setAttribute('stroke', this.CONFIG.colors.highlight); // Blau
            dashLine2.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
            dashLine2.setAttribute('stroke-dasharray', '5,5');
            svgGroup.appendChild(dashLine2);
        }
        
        // Hauptlinie
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', x.toString());
        line.setAttribute('y1', startY.toString());
        line.setAttribute('x2', x.toString());
        line.setAttribute('y2', endY.toString());
        line.setAttribute('stroke', this.CONFIG.colors.dimension);
        line.setAttribute('stroke-width', this.CONFIG.dimensionLineWidth.toString());
        svgGroup.appendChild(line);
        
        // Pfeil oben (wie Canvas: nach oben zeigend)
        const arrow1 = document.createElementNS(ns, 'path');
        arrow1.setAttribute('d', `M ${x} ${startY} L ${x - arrowSize/2} ${startY - arrowSize} L ${x + arrowSize/2} ${startY - arrowSize} Z`);
        arrow1.setAttribute('fill', this.CONFIG.colors.dimension);
        svgGroup.appendChild(arrow1);
        
        // Pfeil unten (wie Canvas: nach unten zeigend)
        const arrow2 = document.createElementNS(ns, 'path');
        arrow2.setAttribute('d', `M ${x} ${endY} L ${x - arrowSize/2} ${endY + arrowSize} L ${x + arrowSize/2} ${endY + arrowSize} Z`);
        arrow2.setAttribute('fill', this.CONFIG.colors.dimension);
        svgGroup.appendChild(arrow2);
        
        // Text (rotiert um -90 Grad, wie Canvas: x + 10)
        const textEl = document.createElementNS(ns, 'text');
        textEl.setAttribute('x', (x + 10).toString());
        textEl.setAttribute('y', ((startY + endY) / 2).toString());
        textEl.setAttribute('font-size', fontSize.toString());
        textEl.setAttribute('font-family', this.CONFIG.dimensionFontFamily);
        textEl.setAttribute('fill', this.CONFIG.colors.dimension);
        textEl.setAttribute('text-anchor', 'start');
        textEl.setAttribute('dominant-baseline', 'middle');
        textEl.setAttribute('transform', `rotate(-90 ${x + 10} ${(startY + endY) / 2})`);
        textEl.textContent = label;
        svgGroup.appendChild(textEl);
    }
    
    // Detailzeichnungen als SVG
    drawDetailDrawingsToSVG(svgGroup, rect, startY) {
        if (this.kerben.length === 0 && this.loecher.length === 0) return;
        const ns = 'http://www.w3.org/2000/svg';
        
        const scale = 2; // Doppelt so groß
        const detailSpacing = 30 * this.mmToPx; // Abstand zwischen Kerbe und Loch
        let currentX = rect.x; // Startposition links
        
        // Kerbe Detailzeichnung - Zeige alle verschiedenen Kerben-Typen
        const usedKerbenTypes = [];
        this.kerben.forEach(kerbe => {
            const kerbenTypeId = kerbe.kerbenTypeId || (this.kerbenTypes.length > 0 ? this.kerbenTypes[0].id : null);
            const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbenTypeId);
            if (kerbenType && !usedKerbenTypes.find(ukt => ukt.id === kerbenType.id)) {
                usedKerbenTypes.push(kerbenType);
            }
        });
        
        usedKerbenTypes.forEach(kerbenType => {
            const type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
            const kerbeWidth = kerbenType.width * this.mmToPx * scale;
            const kerbeDepth = kerbenType.depth * this.mmToPx * scale;
            
            if (type === 'marker') {
                // Strichmarkierung zeichnen
                const line = document.createElementNS(ns, 'line');
                line.setAttribute('x1', currentX.toString());
                line.setAttribute('y1', (startY - kerbeDepth/2).toString());
                line.setAttribute('x2', currentX.toString());
                line.setAttribute('y2', (startY + kerbeDepth/2).toString());
                line.setAttribute('stroke', '#555');
                line.setAttribute('stroke-width', '2');
                svgGroup.appendChild(line);
                
                // Bemaßung für Strich - seitlich
                this.drawDetailDimensionLineSVG(svgGroup, currentX, currentX, startY - kerbeDepth/2, startY + kerbeDepth/2, startY);
                
                // Text für Höhe
                const textEl = document.createElementNS(ns, 'text');
                textEl.setAttribute('x', (currentX + 15).toString());
                textEl.setAttribute('y', (startY + kerbeDepth/2 + 15).toString());
                textEl.setAttribute('font-size', '10');
                textEl.setAttribute('font-family', 'Arial');
                textEl.setAttribute('fill', '#555');
                textEl.setAttribute('text-anchor', 'start');
                textEl.setAttribute('dominant-baseline', 'baseline');
                textEl.textContent = `${kerbenType.depth}mm`;
                svgGroup.appendChild(textEl);
            } else {
                // Dreieck-Kerbe zeichnen
                const path = document.createElementNS(ns, 'path');
                let pathData = `M ${currentX} ${startY + kerbeDepth/2}`;
                pathData += ` L ${currentX + kerbeWidth/2} ${startY - kerbeDepth/2}`;
                pathData += ` L ${currentX + kerbeWidth} ${startY + kerbeDepth/2} Z`;
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'white');
                path.setAttribute('stroke', '#555');
                path.setAttribute('stroke-width', '1');
                svgGroup.appendChild(path);
                
                // Bemaßung für Breite
                this.drawDetailDimensionLineSVG(svgGroup, currentX, currentX + kerbeWidth, startY + kerbeDepth/2 + 15, startY + kerbeDepth/2 + 15, startY + kerbeDepth/2 + 15);
                
                // Text für Breite
                const textWidth = document.createElementNS(ns, 'text');
                textWidth.setAttribute('x', (currentX + kerbeWidth/2).toString());
                textWidth.setAttribute('y', (startY + kerbeDepth/2 + 25).toString());
                textWidth.setAttribute('font-size', '10');
                textWidth.setAttribute('font-family', 'Arial');
                textWidth.setAttribute('fill', '#555');
                textWidth.setAttribute('text-anchor', 'middle');
                textWidth.setAttribute('dominant-baseline', 'baseline');
                textWidth.textContent = `${kerbenType.width}mm`;
                svgGroup.appendChild(textWidth);
                
                // Bemaßung für Tiefe
                this.drawDetailDimensionLineSVG(svgGroup, currentX + kerbeWidth + 15, currentX + kerbeWidth + 15, startY - kerbeDepth/2, startY + kerbeDepth/2, startY);
                
                // Text für Tiefe
                const textDepth = document.createElementNS(ns, 'text');
                textDepth.setAttribute('x', (currentX + kerbeWidth + 25).toString());
                textDepth.setAttribute('y', startY.toString());
                textDepth.setAttribute('font-size', '10');
                textDepth.setAttribute('font-family', 'Arial');
                textDepth.setAttribute('fill', '#555');
                textDepth.setAttribute('text-anchor', 'start');
                textDepth.setAttribute('dominant-baseline', 'middle');
                textDepth.textContent = `${kerbenType.depth}mm`;
                svgGroup.appendChild(textDepth);
            }
            
            // Label für Kerben-Typ-Name
            const nameText = document.createElementNS(ns, 'text');
            nameText.setAttribute('x', (currentX + kerbeWidth/2).toString());
            nameText.setAttribute('y', (startY + kerbeDepth/2 + 25).toString());
            nameText.setAttribute('font-size', '9');
            nameText.setAttribute('font-family', 'Arial');
            nameText.setAttribute('fill', '#555');
            nameText.setAttribute('text-anchor', 'middle');
            nameText.setAttribute('dominant-baseline', 'baseline');
            nameText.textContent = kerbenType.name;
            svgGroup.appendChild(nameText);
            
            currentX += Math.max(kerbeWidth, 10) + detailSpacing;
        });
        
        // Loch Detailzeichnung
        if (this.loecher.length > 0) {
            const loch = this.loecher[0]; // Erstes Loch als Beispiel
            const lochWidth = loch.width * this.mmToPx * scale;
            const lochHeight = loch.height * this.mmToPx * scale;
            
            // Loch zeichnen (Kapsel-Form)
            if (Math.abs(lochWidth - lochHeight) < 0.1) {
                // Perfekter Kreis
                const circle = document.createElementNS(ns, 'circle');
                circle.setAttribute('cx', (currentX + lochWidth/2).toString());
                circle.setAttribute('cy', startY.toString());
                circle.setAttribute('r', (lochWidth / 2).toString());
                circle.setAttribute('fill', 'white');
                circle.setAttribute('stroke', '#555');
                circle.setAttribute('stroke-width', '1');
                svgGroup.appendChild(circle);
            } else {
                // Kapsel (Stadion-Form)
                const radius = Math.min(lochWidth, lochHeight) / 2;
                const x = currentX;
                const y = startY - lochHeight / 2;
                
                const path = document.createElementNS(ns, 'path');
                const r = radius;
                const rRight = x + lochWidth - r;
                const rBottom = y + lochHeight - r;
                let pathData = `M ${x + r} ${y}`;
                pathData += ` L ${rRight} ${y}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x + lochWidth} ${y + r}`;
                pathData += ` L ${x + lochWidth} ${rBottom}`;
                pathData += ` A ${r} ${r} 0 0 1 ${rRight} ${y + lochHeight}`;
                pathData += ` L ${x + r} ${y + lochHeight}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x} ${rBottom}`;
                pathData += ` L ${x} ${y + r}`;
                pathData += ` A ${r} ${r} 0 0 1 ${x + r} ${y} Z`;
                
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'white');
                path.setAttribute('stroke', '#555');
                path.setAttribute('stroke-width', '1');
                svgGroup.appendChild(path);
            }
            
            // Bemaßung für Loch - Breite
            this.drawDetailDimensionLineSVG(svgGroup, currentX, currentX + lochWidth, startY + lochHeight/2 + 15, startY + lochHeight/2 + 15, startY + lochHeight/2 + 15);
            
            // Text für Breite
            const textWidth = document.createElementNS(ns, 'text');
            textWidth.setAttribute('x', (currentX + lochWidth/2).toString());
            textWidth.setAttribute('y', (startY + lochHeight/2 + 25).toString());
            textWidth.setAttribute('font-size', '10');
            textWidth.setAttribute('font-family', 'Arial');
            textWidth.setAttribute('fill', '#555');
            textWidth.setAttribute('text-anchor', 'middle');
            textWidth.setAttribute('dominant-baseline', 'baseline');
            textWidth.textContent = `${loch.width}mm`;
            svgGroup.appendChild(textWidth);
            
            // Bemaßung für Loch - Höhe
            this.drawDetailDimensionLineSVG(svgGroup, currentX + lochWidth + 15, currentX + lochWidth + 15, startY - lochHeight/2, startY + lochHeight/2, startY);
            
            // Text für Höhe
            const textHeight = document.createElementNS(ns, 'text');
            textHeight.setAttribute('x', (currentX + lochWidth + 25).toString());
            textHeight.setAttribute('y', startY.toString());
            textHeight.setAttribute('font-size', '10');
            textHeight.setAttribute('font-family', 'Arial');
            textHeight.setAttribute('fill', '#555');
            textHeight.setAttribute('text-anchor', 'start');
            textHeight.setAttribute('dominant-baseline', 'middle');
            textHeight.textContent = `${loch.height}mm`;
            svgGroup.appendChild(textHeight);
        }
    }
    
    // Detail-Indikatoren als SVG (gestrichelte Kreise um Kerben/Löcher)
    drawDetailIndicatorsToSVG(svgGroup, rect) {
        if (!rect || (!this.kerben.length && !this.loecher.length)) return;
        
        const ns = 'http://www.w3.org/2000/svg';
        
        // Gestrichelter Kreis um eine Kerbe (nur die erste) - nur bei Dreieck-Kerben
        if (this.kerben.length > 0) {
            const kerbe = this.kerben[0]; // Nur die erste Kerbe
            
            // Hole Kerben-Typ für neue Struktur
            let type = 'triangle';
            let widthPx, depthPx;
            
            if (kerbe.kerbenTypeId) {
                const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbe.kerbenTypeId);
                if (kerbenType) {
                    type = (kerbenType.type === 'marker' || kerbenType.type === 'triangle') ? kerbenType.type : 'triangle';
                    widthPx = kerbenType.width * this.mmToPx;
                    depthPx = kerbenType.depth * this.mmToPx;
                }
            } else {
                // Alte Struktur
                type = kerbe.type || 'triangle';
                widthPx = (kerbe.width || 6) * this.mmToPx;
                depthPx = (kerbe.depth || 4) * this.mmToPx;
            }
            
            // Nur Detail-Indikator bei Dreieck-Kerben (nicht bei Strich-Markierung)
            if (type === 'triangle') {
                const distancePx = kerbe.distance * this.mmToPx;
                
                let kerbeCenterX, kerbeCenterY;
                
                if (kerbe.position === 'oben') {
                    kerbeCenterX = rect.x + distancePx;
                    kerbeCenterY = rect.y;
                } else {
                    kerbeCenterX = rect.x + distancePx;
                    kerbeCenterY = rect.y + rect.height;
                }
                
                // Kreis um Kerbe zeichnen - Radius basierend auf Kerben-Größe
                const radius = Math.max(widthPx, depthPx) * 1.4; // 40% größer als Kerbe
                
                const circle = document.createElementNS(ns, 'circle');
                circle.setAttribute('cx', kerbeCenterX.toString());
                circle.setAttribute('cy', kerbeCenterY.toString());
                circle.setAttribute('r', radius.toString());
                circle.setAttribute('fill', 'none');
                circle.setAttribute('stroke', '#666');
                circle.setAttribute('stroke-width', '1');
                circle.setAttribute('stroke-dasharray', '5,5'); // Gestrichelt
                svgGroup.appendChild(circle);
            }
        }
        
        // Gestrichelter Kreis um ein Loch (nur das erste)
        if (this.loecher.length > 0) {
            const loch = this.loecher[0]; // Nur das erste Loch
            const distancePx = loch.distance * this.mmToPx;
            const widthPx = loch.width * this.mmToPx;
            const heightPx = loch.height * this.mmToPx;
            const positionPx = (loch.positionFromTop || 2) * this.mmToPx;
            
            const lochCenterX = rect.x + distancePx;
            // Position ist Abstand von oben (Standard 2mm)
            const lochCenterY = rect.y + positionPx + (heightPx / 2);
            
            // Kreis um Loch zeichnen - Radius basierend auf Loch-Größe
            const radius = Math.max(widthPx, heightPx) * 1.4; // 40% größer als Loch
            
            const circle = document.createElementNS(ns, 'circle');
            circle.setAttribute('cx', lochCenterX.toString());
            circle.setAttribute('cy', lochCenterY.toString());
            circle.setAttribute('r', radius.toString());
            circle.setAttribute('fill', 'none');
            circle.setAttribute('stroke', '#666');
            circle.setAttribute('stroke-width', '1');
            circle.setAttribute('stroke-dasharray', '5,5'); // Gestrichelt
            svgGroup.appendChild(circle);
        }
    }
    
    // Bemaßungslinien für Detailzeichnungen als SVG
    drawDetailDimensionLineSVG(svgGroup, startX, endX, y1, y2, labelY) {
        const ns = 'http://www.w3.org/2000/svg';
        const arrowSize = 4;
        const lineWidth = 0.5;
        
        // Hauptlinie
        const line = document.createElementNS(ns, 'line');
        line.setAttribute('x1', startX.toString());
        line.setAttribute('y1', y1.toString());
        line.setAttribute('x2', endX.toString());
        line.setAttribute('y2', y2.toString());
        line.setAttribute('stroke', '#555');
        line.setAttribute('stroke-width', lineWidth.toString());
        svgGroup.appendChild(line);
        
        // Pfeil am Start
        const arrow1 = document.createElementNS(ns, 'path');
        if (y1 === y2) {
            // Horizontale Bemaßung
            arrow1.setAttribute('d', `M ${startX} ${y1} L ${startX + arrowSize} ${y1 - arrowSize/2} L ${startX + arrowSize} ${y1 + arrowSize/2} Z`);
        } else {
            // Vertikale Bemaßung
            arrow1.setAttribute('d', `M ${startX} ${y1} L ${startX - arrowSize/2} ${y1 - arrowSize} L ${startX + arrowSize/2} ${y1 - arrowSize} Z`);
        }
        arrow1.setAttribute('fill', '#555');
        svgGroup.appendChild(arrow1);
        
        // Pfeil am Ende
        const arrow2 = document.createElementNS(ns, 'path');
        if (y1 === y2) {
            // Horizontale Bemaßung
            arrow2.setAttribute('d', `M ${endX} ${y1} L ${endX - arrowSize} ${y1 - arrowSize/2} L ${endX - arrowSize} ${y1 + arrowSize/2} Z`);
        } else {
            // Vertikale Bemaßung
            arrow2.setAttribute('d', `M ${startX} ${y2} L ${startX - arrowSize/2} ${y2 + arrowSize} L ${startX + arrowSize/2} ${y2 + arrowSize} Z`);
        }
        arrow2.setAttribute('fill', '#555');
        svgGroup.appendChild(arrow2);
    }
    
    // Titelblock als SVG
    drawTitleBlockToSVG(svgGroup) {
        const ns = 'http://www.w3.org/2000/svg';
        
        // Rahmen
        const tbRect = document.createElementNS(ns, 'rect');
        tbRect.setAttribute('x', this.titleBlock.x.toString());
        tbRect.setAttribute('y', this.titleBlock.y.toString());
        tbRect.setAttribute('width', this.titleBlock.width.toString());
        tbRect.setAttribute('height', this.titleBlock.height.toString());
        tbRect.setAttribute('fill', 'rgba(255,255,255,0.95)');
        tbRect.setAttribute('stroke', '#333');
        tbRect.setAttribute('stroke-width', '1');
        svgGroup.appendChild(tbRect);
        
        // Text
        const leftColX = this.titleBlock.x + 8;
        const rightColX = this.titleBlock.x + this.titleBlock.width * 0.5 + 8;
        const totalRows = Math.max(this.titleBlock.layout[0].length, this.titleBlock.layout[1].length);
        const rowH = this.titleBlock.height / totalRows;
        
        this.titleBlock.layout[0].forEach((item, i) => {
            const value = this.titleBlock.fields[item.field] || '';
            const text = `${item.label}: ${value}${item.suffix || ''}`;
            const textEl = document.createElementNS(ns, 'text');
            textEl.setAttribute('x', leftColX.toString());
            textEl.setAttribute('y', (this.titleBlock.y + rowH * i + rowH * 0.25).toString());
            textEl.setAttribute('font-size', this.CONFIG.titleBlockFontSize.toString());
            textEl.setAttribute('font-family', this.CONFIG.titleBlockFontFamily);
            textEl.setAttribute('fill', '#222');
            textEl.textContent = text;
            svgGroup.appendChild(textEl);
        });
        
        this.titleBlock.layout[1].forEach((item, i) => {
            const value = this.titleBlock.fields[item.field] || '';
            const text = `${item.label}: ${value}${item.suffix || ''}`;
            const textEl = document.createElementNS(ns, 'text');
            textEl.setAttribute('x', rightColX.toString());
            textEl.setAttribute('y', (this.titleBlock.y + rowH * i + rowH * 0.25).toString());
            textEl.setAttribute('font-size', this.CONFIG.titleBlockFontSize.toString());
            textEl.setAttribute('font-family', this.CONFIG.titleBlockFontFamily);
            textEl.setAttribute('fill', '#222');
            textEl.textContent = text;
            svgGroup.appendChild(textEl);
        });
    }
    
    // Zeichne alle Elemente auf einen gegebenen Kontext (für PDF-Export)
    drawToContext(ctx, forPDF = false) {
        const rect = this.currentRect;
        if (!rect) return;
        
        // Zeichne Hauptprofil
        this.drawProfileToContext(ctx, rect);
        
        // Zeichne Bohne
        this.drawBohnenToContext(ctx, rect);
        
        // Zeichne Kerben
        this.drawKerbenToContext(ctx, rect);
        
        // Zeichne Löcher
        this.drawLoecherToContext(ctx, rect);
        
        // Zeichne Nahtlinie
        this.drawNahtlinieToContext(ctx, rect);
        
        // Zeichne Ausschnitte
        this.drawAusschnitteToContext(ctx, rect);
        
        // Zeichne Skizze
        if (this.loadedProfileSkizze && this.skizzeX !== null && this.skizzeY !== null) {
            this.drawSkizzeToContext(ctx);
        }
        
        // Zeichne Bemaßungen
        if (this.showDimensions) {
            this.drawDimensionsToContext(ctx, rect, forPDF);
        }
        
        // Zeichne Detail-Indikatoren
        this.drawDetailIndicatorsToContext(ctx, rect);
        
        // Zeichne Texte
        this.drawTextsToContext(ctx);
        
        // Zeichne Detailzeichnungen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            const detailStartY = rect.y + rect.height + (50 * this.mmToPx);
            this.drawDetailDrawingsToContext(ctx, rect, detailStartY);
        }
    }
    
    // Hilfsfunktionen zum Zeichnen auf beliebigen Kontext
    drawProfileToContext(ctx, rect) {
        // Kopie der drawProfile Logik
        if (this.cutoutWidth > 0) {
            // Cutout-Profil zeichnen (vereinfacht für PDF)
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.fillStyle = '#E0E0E0';
            // TODO: Cutout-Profil zeichnen
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        } else {
            // Normales Profil mit Kerben-Unterbrechungen
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.fillStyle = '#E0E0E0';
            
            const kerbenOben = this.kerben.filter(k => k.position === 'oben' && (k.type !== 'marker')).sort((a, b) => a.distance - b.distance);
            const kerbenUnten = this.kerben.filter(k => k.position === 'unten' && (k.type !== 'marker')).sort((a, b) => a.distance - b.distance);
            
            ctx.beginPath();
            ctx.moveTo(rect.x, rect.y);
            
            let currentX = rect.x;
            for (const kerbe of kerbenOben) {
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width) {
                    if (kerbeStartX > currentX) {
                        ctx.lineTo(kerbeStartX, rect.y);
                    }
                    currentX = Math.max(currentX, kerbeEndX);
                }
            }
            
            if (currentX < rect.x + rect.width) {
                ctx.lineTo(rect.x + rect.width, rect.y);
            }
            
            ctx.lineTo(rect.x + rect.width, rect.y + rect.height);
            
            currentX = rect.x + rect.width;
            for (const kerbe of kerbenUnten) {
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const kerbeStartX = rect.x + distancePx - widthPx/2;
                const kerbeEndX = rect.x + distancePx + widthPx/2;
                
                if (kerbeStartX >= rect.x && kerbeEndX <= rect.x + rect.width) {
                    if (kerbeEndX < currentX) {
                        ctx.lineTo(kerbeEndX, rect.y + rect.height);
                    }
                    currentX = Math.min(currentX, kerbeStartX);
                }
            }
            
            if (currentX > rect.x) {
                ctx.lineTo(rect.x, rect.y + rect.height);
            }
            
            ctx.lineTo(rect.x, rect.y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
        }
    }
    
    drawBohnenToContext(ctx, rect) {
        if (this.bohnen.length === 0) return;
        const bohne = this.bohnen[0];
        let bohneWidth = rect.width;
        if (this.cutoutWidth > 0) {
            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
        }
        const bohneHeight = bohne.height * this.mmToPx;
        const bohneX = rect.x + (rect.width - bohneWidth) / 2;
        const bohneY = rect.y - bohneHeight;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.fillStyle = '#36454F';
        ctx.fillRect(bohneX, bohneY, bohneWidth, bohneHeight);
        ctx.strokeRect(bohneX, bohneY, bohneWidth, bohneHeight);
    }
    
    drawKerbenToContext(ctx, rect) {
        if (this.kerben.length === 0) return;
        this.kerben.forEach(kerbe => {
            const distancePx = kerbe.distance * this.mmToPx;
            const widthPx = kerbe.width * this.mmToPx;
            const depthPx = kerbe.depth * this.mmToPx;
            const type = kerbe.type || 'triangle';
            const kerbeX = rect.x + distancePx;
            const kerbeY = kerbe.position === 'oben' ? rect.y : rect.y + rect.height;
            
            if (type === 'marker') {
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.beginPath();
                if (kerbe.position === 'oben') {
                    ctx.moveTo(kerbeX, kerbeY);
                    ctx.lineTo(kerbeX, kerbeY + depthPx);
                } else {
                    ctx.moveTo(kerbeX, kerbeY);
                    ctx.lineTo(kerbeX, kerbeY - depthPx);
                }
                ctx.stroke();
            } else {
                ctx.strokeStyle = '#E0E0E0';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(kerbeX - widthPx/2, kerbeY);
                ctx.lineTo(kerbeX + widthPx/2, kerbeY);
                ctx.stroke();
                
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 1;
                ctx.fillStyle = 'white';
                ctx.beginPath();
                if (kerbe.position === 'oben') {
                    ctx.moveTo(kerbeX - widthPx/2, kerbeY);
                    ctx.lineTo(kerbeX, kerbeY + depthPx);
                    ctx.lineTo(kerbeX + widthPx/2, kerbeY);
                } else {
                    ctx.moveTo(kerbeX - widthPx/2, kerbeY);
                    ctx.lineTo(kerbeX, kerbeY - depthPx);
                    ctx.lineTo(kerbeX + widthPx/2, kerbeY);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
            }
        });
    }
    
    drawLoecherToContext(ctx, rect) {
        if (this.loecher.length === 0) return;
        this.loecher.forEach(loch => {
            const distancePx = loch.distance * this.mmToPx;
            const widthPx = loch.width * this.mmToPx;
            const heightPx = loch.height * this.mmToPx;
            const positionPx = loch.position * this.mmToPx;
            const lochX = rect.x + distancePx;
            const lochY = rect.y + positionPx + (heightPx / 2);
            
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.fillStyle = 'white';
            
            if (Math.abs(widthPx - heightPx) < 0.1) {
                ctx.beginPath();
                ctx.arc(lochX, lochY, widthPx / 2, 0, 2 * Math.PI);
                ctx.fill();
                ctx.stroke();
            } else {
                const radius = Math.min(widthPx, heightPx) / 2;
                const x = lochX - widthPx / 2;
                const y = lochY - heightPx / 2;
                if (typeof ctx.roundRect === 'function') {
                    ctx.roundRect(x, y, widthPx, heightPx, radius);
                } else {
                    const r = radius;
                    const rRight = x + widthPx - r;
                    const rBottom = y + heightPx - r;
                    ctx.beginPath();
                    ctx.moveTo(x + r, y);
                    ctx.lineTo(rRight, y);
                    ctx.arc(rRight, y + r, r, -Math.PI / 2, 0, false);
                    ctx.lineTo(x + widthPx, rBottom);
                    ctx.arc(rRight, rBottom, r, 0, Math.PI / 2, false);
                    ctx.lineTo(x + r, y + heightPx);
                    ctx.arc(x + r, rBottom, r, Math.PI / 2, Math.PI, false);
                    ctx.lineTo(x, y + r);
                    ctx.arc(x + r, y + r, r, Math.PI, -Math.PI / 2, false);
                    ctx.closePath();
                }
                ctx.fill();
                ctx.stroke();
            }
        });
    }
    
    drawNahtlinieToContext(ctx, rect) {
        if (!this.nahtlinie) return;
        const nahtlinieY = rect.y + this.nahtlinie.distance * this.mmToPx;
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(rect.x, nahtlinieY);
        ctx.lineTo(rect.x + rect.width, nahtlinieY);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    drawAusschnitteToContext(ctx, rect) {
        if (this.ausschnitte.length === 0) return;
        this.ausschnitte.forEach(ausschnitt => {
            const distancePx = ausschnitt.distance * this.mmToPx;
            const widthPx = ausschnitt.width * this.mmToPx;
            const heightPx = ausschnitt.height * this.mmToPx;
            const ausschnittX = rect.x + distancePx;
            const ausschnittY = rect.y + (rect.height - heightPx) / 2;
            
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 1;
            ctx.fillStyle = 'white';
            ctx.fillRect(ausschnittX, ausschnittY, widthPx, heightPx);
            ctx.strokeRect(ausschnittX, ausschnittY, widthPx, heightPx);
        });
    }
    
    drawSkizzeToContext(ctx) {
        if (!this.loadedProfileSkizze || !this.loadedSkizzeImage || !this.loadedSkizzeImage.complete) return;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.skizzeX, this.skizzeY, this.skizzeWidth, this.skizzeHeight);
        
        const aspectRatio = this.loadedSkizzeImage.width / this.loadedSkizzeImage.height;
        let drawWidth = this.skizzeWidth;
        let drawHeight = this.skizzeHeight;
        if (aspectRatio > this.skizzeWidth / this.skizzeHeight) {
            drawHeight = this.skizzeWidth / aspectRatio;
        } else {
            drawWidth = this.skizzeHeight * aspectRatio;
        }
        const centerX = this.skizzeX + (this.skizzeWidth - drawWidth) / 2;
        const centerY = this.skizzeY + (this.skizzeHeight - drawHeight) / 2;
        ctx.drawImage(this.loadedSkizzeImage, centerX, centerY, drawWidth, drawHeight);
    }
    
    drawTextsToContext(ctx) {
        this.texts.forEach(text => {
            ctx.fillStyle = '#333';
            ctx.font = `${text.size}px Arial`;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            ctx.fillText(text.content, text.x, text.y);
        });
    }
    
    drawDimensionsToContext(ctx, rect, forPDF) {
        if (!this.showDimensions) return;
        
        // Speichere originalen Context
        const originalCtx = this.ctx;
        
        // Verwende temporären Context
        this.ctx = ctx;
        
        // Zeichne Dimensions mit dem temporären Context
        try {
            // Rufe die normale drawDimensions auf, die aber jetzt auf ctx zeichnet
            this.drawDimensions();
        } catch (e) {
            console.error('Fehler beim Zeichnen der Bemaßungen für PDF:', e);
        }
        
        // Stelle originalen Context wieder her
        this.ctx = originalCtx;
    }
    
    drawDetailIndicatorsToContext(ctx, rect) {
        // Vereinfacht - nur wenn nötig
    }
    
    drawDetailDrawingsToContext(ctx, rect, startY) {
        // Speichere originalen Context
        const originalCtx = this.ctx;
        
        // Verwende temporären Context
        this.ctx = ctx;
        
        // Zeichne Detailzeichnungen mit dem temporären Context
        try {
            this.drawDetailDrawings(rect, startY);
        } catch (e) {
            console.error('Fehler beim Zeichnen der Detailzeichnungen für PDF:', e);
        }
        
        // Stelle originalen Context wieder her
        this.ctx = originalCtx;
    }
    
    // Beschriftungsfeld Modal
    
    applyFormat() {
        const selectedFormat = document.querySelector('input[name="format"]:checked');
        if (selectedFormat) {
            this.selectedFormat = selectedFormat.value;
            this.showFormatBorder = true;
            this.draw();
        }
    }
    
    exportToPdf() {
        // Einfacher PDF-Export über Browser-Druckfunktion
        window.print();
    }
    
    // Bohne Modal
    openBohneModal() {
        if (this.bohneModal) {
            this.bohneModal.classList.remove('hidden');
        }
    }
    
    closeBohneModal() {
        if (this.bohneModal) {
            this.bohneModal.classList.add('hidden');
        }
    }
    
    removeBohne() {
        this.saveState(); // Speichere Zustand vor dem Entfernen
        
        this.bohnen = [];
        
        this.closeBohneModal();
        this.draw();
        this.autoZoom();
    }
    
    confirmBohne() {
        const height = parseFloat(this.bohneHeightInput.value);
        
        if (isNaN(height) || height <= 0) {
            alert('Bitte gültige Höhe eingeben!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Erstelle oder aktualisiere Bohne
        this.bohnen = [{
            height: height
        }];
        
        this.closeBohneModal();
        this.draw();
        this.autoZoom();
    }
    
    // Cut-out Modal
    openCutoutModal() {
        if (this.cutoutModal) {
            this.cutoutModal.classList.remove('hidden');
        }
    }
    
    closeCutoutModal() {
        if (this.cutoutModal) {
            this.cutoutModal.classList.add('hidden');
        }
    }
    
    removeCutout() {
        this.saveState(); // Speichere Zustand vor dem Entfernen
        
        this.cutoutWidth = 0;
        this.cutoutHeight = 0;
        
        this.closeCutoutModal();
        this.draw();
        this.autoZoom();
    }
    
    confirmCutout() {
        const width = parseFloat(this.cutoutWidthInput.value);
        const height = parseFloat(this.cutoutHeightInput.value);
        
        if (isNaN(width) || width < 0) {
            alert('Bitte gültige Breite eingeben!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        if (isNaN(height) || height < 0) {
            alert('Bitte gültige Höhe eingeben!');
            return;
        }
        
        this.cutoutWidth = width;
        this.cutoutHeight = height;
        
        this.closeCutoutModal();
        this.draw();
        this.autoZoom();
    }
    
    // Kerbe Modal
    openKerbeModal() {
        // Erstelle Standard-Kerben-Typ, falls keiner vorhanden
        if (this.kerbenTypes.length === 0) {
            this.kerbenTypes.push({
                id: 'kerbe1',
                name: 'Kerbe 1',
                type: 'triangle',
                depth: 4,
                width: 6
            });
        } else {
            // Stelle sicher, dass alle Kerben-Typen fortlaufend nummeriert sind (1, 2, 3)
            // Maximal 3 Kerben-Typen
            this.kerbenTypes = this.kerbenTypes.slice(0, 3); // Begrenze auf max. 3
            this.kerbenTypes.forEach((kt, idx) => {
                kt.name = `Kerbe ${idx + 1}`;
            });
        }
        
        // Aktualisiere die Tabelle mit den aktuellen Werten aus this.kerben
        // (inklusive verschobene Positionen)
        if (this.kerbeModal) {
            this.kerbeModal.classList.remove('hidden');
        }
        this.refreshKerbeTable(false); // Keine User-Inputs übernehmen beim Öffnen
    }
    
    openKerbenTypesModal() {
        // Öffne das separate Modal für Kerben-Typ-Verwaltung
        if (this.kerbenTypesModal) {
            // Stelle sicher, dass alle Typen-Werte korrekt sind
            this.saveCurrentKerbenTypesInputs();
            this.refreshKerbenTypesList();
            this.kerbenTypesModal.classList.remove('hidden');
        }
    }
    
    closeKerbenTypesModal() {
        if (this.kerbenTypesModal) {
            this.kerbenTypesModal.classList.add('hidden');
        }
    }
    
    confirmKerbenTypes() {
        // Die Werte werden bereits durch Event-Listener gespeichert, aber zur Sicherheit nochmal speichern
        // Speichere alle aktuellen Werte aus den Input-Feldern (falls noch nicht gespeichert)
        this.saveCurrentKerbenTypesInputs();
        
        // Stelle sicher, dass alle Typen korrekt gespeichert sind
        const typeDivs = this.kerbenTypesList.querySelectorAll('div');
        typeDivs.forEach((div, index) => {
            if (this.kerbenTypes[index]) {
                const typeSelect = div.querySelector('.kerben-type-select');
                if (typeSelect) {
                    const selectedType = typeSelect.value || 'triangle';
                    // WICHTIG: Speichere den Typ explizit
                    this.kerbenTypes[index].type = selectedType;
                    
                    // Bei Strichmarkierung: Breite auf 0.1 setzen
                    if (selectedType === 'marker') {
                        this.kerbenTypes[index].width = 0.1;
                    } else if (this.kerbenTypes[index].width === 0.1) {
                        // Wenn von Marker zu Dreieck gewechselt wird, setze Standard-Breite
                        this.kerbenTypes[index].width = 6;
                    }
                }
            }
        });
        
        // WICHTIG: Speichere den State, damit die Änderungen persistent sind
        this.saveState();
        
        // Zeichne neu, damit die Änderungen sofort sichtbar werden
        this.draw();
        
        // Aktualisiere die Kerben-Tabelle, damit neue Typen angezeigt werden
        this.refreshKerbeTable(false);
        
        this.closeKerbenTypesModal();
    }
    
    refreshKerbenTypesList() {
        if (!this.kerbenTypesList) return;
        
        this.kerbenTypesList.innerHTML = '';
        
        // Begrenze auf maximal 3 Kerben-Typen
        const limitedKerbenTypes = this.kerbenTypes.slice(0, 3);
        
        // Deaktiviere den "Hinzufügen"-Button, wenn bereits 3 Typen vorhanden sind
        if (this.addKerbenTypeBtn) {
            if (this.kerbenTypes.length >= 3) {
                this.addKerbenTypeBtn.disabled = true;
                this.addKerbenTypeBtn.className = 'w-auto px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed opacity-50';
            } else {
                this.addKerbenTypeBtn.disabled = false;
                this.addKerbenTypeBtn.className = 'w-auto px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors';
            }
        }
        
        limitedKerbenTypes.forEach((kerbenType, index) => {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'flex items-center gap-3 p-3 mb-2 bg-white rounded-lg border border-gray-200';
            
            const isMarker = kerbenType.type === 'marker';
            const depthValue = (kerbenType.depth !== undefined && kerbenType.depth !== null) ? kerbenType.depth : 4;
            const widthValue = (kerbenType.width !== undefined && kerbenType.width !== null && kerbenType.width !== 0.1) ? kerbenType.width : 6;
            
            typeDiv.innerHTML = `
                <input type="text" class="kerben-type-name flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 cursor-default" value="${kerbenType.name || `Kerbe ${index + 1}`}" data-index="${index}" readonly>
                <select class="kerben-type-select px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" data-index="${index}">
                    <option value="triangle" ${kerbenType.type === 'triangle' ? 'selected' : ''}>Dreieck</option>
                    <option value="marker" ${kerbenType.type === 'marker' ? 'selected' : ''}>Strichmarkierung</option>
                </select>
                <input type="number" class="kerben-type-depth w-20 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${depthValue}" data-index="${index}" step="0.1" min="0.1">
                <span class="text-xs text-gray-600">mm Tiefe/Höhe</span>
                <div class="kerben-type-width-container ${isMarker ? 'hidden' : 'flex'} items-center gap-2">
                    <input type="number" class="kerben-type-width w-20 px-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${widthValue}" data-index="${index}" step="0.1" min="0.1">
                    <span class="text-xs text-gray-600">mm Breite</span>
                </div>
                <button class="remove-kerben-type-btn px-3 py-1.5 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm" onclick="profilZeichner.removeKerbenType(${index})">✕</button>
            `;
            
            this.kerbenTypesList.appendChild(typeDiv);
            
            // Event-Listener für sofortiges Speichern beim Tippen
            const nameInput = typeDiv.querySelector('.kerben-type-name');
            const typeSelect = typeDiv.querySelector('.kerben-type-select');
            const depthInput = typeDiv.querySelector('.kerben-type-depth');
            const widthInput = typeDiv.querySelector('.kerben-type-width');
            
            // Name speichern - aber nur wenn manuell geändert (nicht automatisch)
            if (nameInput) {
                // Entferne die Möglichkeit, den Namen manuell zu ändern, da er automatisch vergeben wird
                nameInput.readOnly = true;
                nameInput.className = 'flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 cursor-default';
            }
            
            // Typ speichern - sofort beim Ändern
            if (typeSelect) {
                typeSelect.addEventListener('change', () => {
                    if (this.kerbenTypes[index]) {
                        const selectedType = typeSelect.value || 'triangle';
                        // WICHTIG: Speichere den Typ explizit
                        this.kerbenTypes[index].type = selectedType;
                        
                        // Bei Strichmarkierung: Breite auf 0.1 setzen
                        if (selectedType === 'marker') {
                            this.kerbenTypes[index].width = 0.1;
                        } else if (this.kerbenTypes[index].width === 0.1) {
                            // Wenn von Marker zu Dreieck gewechselt wird, setze Standard-Breite
                            this.kerbenTypes[index].width = 6;
                        }
                        
                        // Aktualisiere Breite-Anzeige sofort
                        const widthContainer = typeDiv.querySelector('.kerben-type-width-container');
                        if (widthContainer) {
                            if (selectedType === 'marker') {
                                widthContainer.classList.add('hidden');
                                widthContainer.classList.remove('flex');
                            } else {
                                widthContainer.classList.remove('hidden');
                                widthContainer.classList.add('flex');
                            }
                        }
                        
                        // Speichere State sofort
                        this.saveState();
                        
                        // Zeichne neu, damit die Änderung sofort sichtbar wird
                        this.draw();
                    }
                });
            }
            
            // Tiefe/Höhe speichern
            if (depthInput) {
                depthInput.addEventListener('input', () => {
                    if (this.kerbenTypes[index]) {
                        const depthValue = parseFloat(depthInput.value);
                        if (!isNaN(depthValue) && depthValue > 0) {
                            this.kerbenTypes[index].depth = depthValue;
                        }
                    }
                });
                depthInput.addEventListener('blur', () => {
                    if (this.kerbenTypes[index]) {
                        const depthValue = parseFloat(depthInput.value);
                        if (!isNaN(depthValue) && depthValue > 0) {
                            this.kerbenTypes[index].depth = depthValue;
                        } else {
                            // Wenn ungültig, setze auf Standard oder aktuellen Wert
                            depthInput.value = this.kerbenTypes[index].depth || 4;
                        }
                    }
                });
            }
            
            // Breite speichern
            if (widthInput && typeSelect && typeSelect.value !== 'marker') {
                widthInput.addEventListener('input', () => {
                    if (this.kerbenTypes[index] && typeSelect.value !== 'marker') {
                        const widthValue = parseFloat(widthInput.value);
                        if (!isNaN(widthValue) && widthValue > 0) {
                            this.kerbenTypes[index].width = widthValue;
                        }
                    }
                });
                widthInput.addEventListener('blur', () => {
                    if (this.kerbenTypes[index] && typeSelect.value !== 'marker') {
                        const widthValue = parseFloat(widthInput.value);
                        if (!isNaN(widthValue) && widthValue > 0) {
                            this.kerbenTypes[index].width = widthValue;
                        } else {
                            // Wenn ungültig, setze auf Standard oder aktuellen Wert
                            widthInput.value = this.kerbenTypes[index].width || 6;
                        }
                    }
                });
            }
        });
    }
    
    addKerbenType() {
        // Maximal 3 Kerben-Typen erlauben
        if (this.kerbenTypes.length >= 3) {
            alert('Maximal 3 Kerben-Typen sind möglich!');
            return;
        }
        
        // Die Werte werden bereits durch Event-Listener gespeichert, aber zur Sicherheit nochmal speichern
        // WICHTIG: Speichere zuerst alle aktuellen Werte aus den Input-Feldern, bevor die Liste neu gerendert wird
        this.saveCurrentKerbenTypesInputs();
        
        // Finde die nächste verfügbare Nummer für den Namen
        let nextNumber = 1;
        const existingNumbers = this.kerbenTypes.map(kt => {
            const match = kt.name.match(/^Kerbe (\d+)$/);
            return match ? parseInt(match[1]) : 0;
        }).filter(n => n > 0);
        
        if (existingNumbers.length > 0) {
            nextNumber = Math.max(...existingNumbers) + 1;
        }
        
        const newId = 'kerbe' + nextNumber;
        this.kerbenTypes.push({
            id: newId,
            name: `Kerbe ${nextNumber}`,
            type: 'triangle',
            depth: 4,
            width: 6
        });
        this.refreshKerbenTypesList();
    }
    
    // Speichere alle aktuellen Werte aus den Input-Feldern in this.kerbenTypes
    saveCurrentKerbenTypesInputs() {
        if (!this.kerbenTypesList) return;
        
        const typeDivs = this.kerbenTypesList.querySelectorAll('div');
        typeDivs.forEach((div, index) => {
            if (this.kerbenTypes[index]) {
                const nameInput = div.querySelector('.kerben-type-name');
                const typeSelect = div.querySelector('.kerben-type-select');
                const depthInput = div.querySelector('.kerben-type-depth');
                const widthInput = div.querySelector('.kerben-type-width');
                
                // Name wird automatisch vergeben, nicht manuell speichern
                // Der Name wird beim Erstellen des Kerben-Typs gesetzt und bleibt unverändert
                
                // Speichere Typ - IMMER, auch wenn nicht geändert
                if (typeSelect) {
                    const selectedType = typeSelect.value || 'triangle';
                    this.kerbenTypes[index].type = selectedType;
                    
                    // Bei Strichmarkierung: Breite auf 0.1 setzen
                    if (selectedType === 'marker') {
                        this.kerbenTypes[index].width = 0.1;
                    } else if (this.kerbenTypes[index].width === 0.1) {
                        // Wenn von Marker zu Dreieck gewechselt wird, setze Standard-Breite
                        this.kerbenTypes[index].width = 6;
                    }
                }
                
                // Speichere Tiefe/Höhe - IMMER wenn Input vorhanden
                if (depthInput) {
                    // Prüfe ob ein Wert eingegeben wurde (auch wenn gerade getippt wird)
                    const inputValue = depthInput.value.trim();
                    if (inputValue !== '') {
                        const depthValue = parseFloat(inputValue);
                        if (!isNaN(depthValue) && depthValue > 0) {
                            // Speichere den eingegebenen Wert - IMMER, auch während des Tippens
                            this.kerbenTypes[index].depth = depthValue;
                        }
                    }
                    // Wenn leer, behalte den aktuellen Wert (nicht überschreiben)
                    // Der Wert wird nur gesetzt, wenn tatsächlich etwas eingegeben wurde
                }
                
                // Speichere Breite - nur wenn nicht Strichmarkierung
                if (typeSelect && typeSelect.value !== 'marker' && widthInput) {
                    // Prüfe ob ein Wert eingegeben wurde (auch wenn gerade getippt wird)
                    const inputValue = widthInput.value.trim();
                    if (inputValue !== '') {
                        const widthValue = parseFloat(inputValue);
                        if (!isNaN(widthValue) && widthValue > 0) {
                            // Speichere den eingegebenen Wert - IMMER, auch während des Tippens
                            this.kerbenTypes[index].width = widthValue;
                        }
                    }
                    // Wenn leer, behalte den aktuellen Wert (nicht überschreiben)
                    // Der Wert wird nur gesetzt, wenn tatsächlich etwas eingegeben wurde
                }
            }
        });
    }
    
    removeKerbenType(index) {
        if (this.kerbenTypes.length <= 1) {
            alert('Mindestens ein Kerben-Typ muss vorhanden sein!');
            return;
        }
        
        // Maximal 3 Kerben-Typen - diese Prüfung ist hier nicht nötig, da wir bereits prüfen dass mindestens 1 vorhanden ist
        
        // Speichere zuerst alle aktuellen Werte aus den Input-Feldern
        this.saveCurrentKerbenTypesInputs();
        
        const removedType = this.kerbenTypes[index];
        
        // Entferne alle Kerben, die diesen Typ verwenden
        this.kerben = this.kerben.filter(kerbe => kerbe.kerbenTypeId !== removedType.id);
        
        // Entferne den Typ
        this.kerbenTypes.splice(index, 1);
        
        // Aktualisiere die Namen, damit sie fortlaufend sind (1, 2, 3, ...)
        this.kerbenTypes.forEach((kt, idx) => {
            kt.name = `Kerbe ${idx + 1}`;
        });
        
        this.refreshKerbenTypesList();
        this.refreshKerbeTable(true);
    }
    
    updateKerbenTypeWidthDisplay(index) {
        // Aktualisiere die Breite-Anzeige basierend auf dem Typ
        const typeDivs = this.kerbenTypesList.querySelectorAll('div');
        if (typeDivs[index]) {
            const typeSelect = typeDivs[index].querySelector('.kerben-type-select');
            const widthContainer = typeDivs[index].querySelector('.kerben-type-width-container');
            
            if (typeSelect && widthContainer) {
                const isMarker = typeSelect.value === 'marker';
                widthContainer.style.display = isMarker ? 'none' : 'flex';
                
                // Aktualisiere auch den Typ im Array
                if (this.kerbenTypes[index]) {
                    this.kerbenTypes[index].type = typeSelect.value;
                    // Bei Strichmarkierung: Breite auf 0.1 setzen
                    if (isMarker) {
                        this.kerbenTypes[index].width = 0.1;
                    }
                }
            }
        }
    }
    
    closeKerbeModal() {
        if (this.kerbeModal) {
            this.kerbeModal.classList.add('hidden');
        }
    }
    
    refreshKerbeTable(keepUserInputs = false) {
        if (!this.kerbeTbody) return;
        
        // Lese zuerst die aktuellen Werte aus der Tabelle, falls Modal bereits geöffnet war
        // UND wir die Benutzereingaben beibehalten wollen (nicht nach Verschiebung)
        // WICHTIG: Die Position (distance) wird IMMER aus this.kerben genommen, nicht aus der Tabelle!
        // Nur Typ und Position (oben/unten) werden aus der Tabelle übernommen, wenn keepUserInputs = true
        const existingRows = this.kerbeTbody.querySelectorAll('tr');
        if (keepUserInputs && existingRows.length > 0 && !this.kerbeModal.classList.contains('hidden')) {
            // Aktualisiere die Werte basierend auf der Reihenfolge (Index)
            // WICHTIG: Verwende Index, damit die Positionen nicht zurückgesetzt werden
            existingRows.forEach((row, rowIndex) => {
                if (rowIndex < this.kerben.length) {
                    const kerbe = this.kerben[rowIndex];
                    const distanceInput = row.querySelector('.kerbe-distance-input');
                    const kerbenTypeSelect = row.querySelector('.kerbe-kerben-type-select');
                    const positionSelect = row.querySelector('.kerbe-position-select');
                    
                    // Aktualisiere Typ und Position aus der Tabelle
                    if (kerbenTypeSelect) {
                        kerbe.kerbenTypeId = kerbenTypeSelect.value;
                    }
                    if (positionSelect) {
                        kerbe.position = positionSelect.value;
                    }
                    // Die distance wird NICHT überschrieben, da sie möglicherweise verschoben wurde!
                    // Nur wenn explizit geändert wurde, übernehme den Wert
                    if (distanceInput) {
                        const tableDistance = parseFloat(distanceInput.value);
                        if (!isNaN(tableDistance) && Math.abs(kerbe.distance - tableDistance) > 0.1) {
                            // Nur wenn der Wert tatsächlich geändert wurde, übernehme ihn
                            kerbe.distance = tableDistance;
                        }
                    }
                }
            });
        }
        
        this.kerbeTbody.innerHTML = '';
        
        // Hole den Standard-Typ aus dem oberen Dropdown
        const defaultType = this.kerbeTypeSelect ? this.kerbeTypeSelect.value : 'triangle';
        
        // Zeige immer die aktuellen Werte aus this.kerben an (inklusive verschobene Positionen)
        // NICHT sortieren - neue Kerben erscheinen immer als nächste in der Liste
        this.kerben.forEach((kerbe, originalIndex) => {
            const row = document.createElement('tr');
            
            // Finde den Kerben-Typ für diese Kerbe
            const kerbenTypeId = kerbe.kerbenTypeId || (this.kerbenTypes.length > 0 ? this.kerbenTypes[0].id : null);
            const kerbenType = this.kerbenTypes.find(kt => kt.id === kerbenTypeId);
            
            // Erstelle Dropdown für Kerben-Typen
            let kerbenTypeOptions = '';
            this.kerbenTypes.forEach(kt => {
                kerbenTypeOptions += `<option value="${kt.id}" ${kerbenTypeId === kt.id ? 'selected' : ''}>${kt.name}</option>`;
            });
            
            row.className = 'border-b border-gray-100 hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3">
                    <select class="kerbe-kerben-type-select w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        ${kerbenTypeOptions}
                    </select>
                </td>
                <td class="px-4 py-3"><input type="number" value="${kerbe.distance}" min="0" step="5" class="kerbe-distance-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></td>
                <td class="px-4 py-3">
                    <select class="kerbe-position-select w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="oben" ${kerbe.position === 'oben' ? 'selected' : ''}>Oben</option>
                        <option value="unten" ${kerbe.position === 'unten' ? 'selected' : ''}>Unten</option>
                    </select>
                </td>
                <td class="px-4 py-3"><button class="remove-kerbe-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="profilZeichner.removeKerbeRow(${originalIndex})">Entfernen</button></td>
            `;
            this.kerbeTbody.appendChild(row);
        });
    }
    
    addKerbeRow() {
        // WICHTIG: Speichere zuerst alle aktuellen Werte aus der Tabelle, bevor eine neue Zeile hinzugefügt wird
        // Dies verhindert, dass Positionen zurückgesetzt werden
        const rows = this.kerbeTbody.querySelectorAll('tr');
        
        // Speichere alle Werte in einem temporären Array, um sie zu erhalten
        const savedValues = [];
        rows.forEach((row, rowIndex) => {
            if (rowIndex < this.kerben.length) {
                const distanceInput = row.querySelector('.kerbe-distance-input');
                const kerbenTypeSelect = row.querySelector('.kerbe-kerben-type-select');
                const positionSelect = row.querySelector('.kerbe-position-select');
                
                if (distanceInput && kerbenTypeSelect && positionSelect) {
                    const tableDistance = parseFloat(distanceInput.value);
                    if (!isNaN(tableDistance)) {
                        // Aktualisiere die Werte in this.kerben direkt über den Index
                        const kerbe = this.kerben[rowIndex];
                        if (kerbe) {
                            kerbe.distance = tableDistance;
                            kerbe.kerbenTypeId = kerbenTypeSelect.value;
                            kerbe.position = positionSelect.value;
                        }
                    }
                }
            }
        });
        
        // Berechne automatisch eine Position (Mitte des Profils oder nach der letzten Kerbe)
        let suggestedDistance = 0;
        
        if (this.currentRect && this.currentRect.width) {
            // Profil-Länge in mm berechnen
            const profileLengthMm = this.currentRect.width / this.mmToPx;
            // Exakt die Hälfte, auf 1 Dezimalstelle gerundet
            suggestedDistance = Math.round((profileLengthMm / 2) * 10) / 10;
        } else if (this.kerben.length > 0) {
            // Falls schon Kerben existieren, nimm den letzten Wert + 20mm
            const sortedKerben = [...this.kerben].sort((a, b) => a.distance - b.distance);
            const lastDistance = sortedKerben[sortedKerben.length - 1].distance;
            suggestedDistance = lastDistance + 20;
        }
        
        // Verwende den ersten Kerben-Typ als Standard
        const defaultKerbenTypeId = this.kerbenTypes.length > 0 ? this.kerbenTypes[0].id : null;
        
        this.kerben.push({
            distance: suggestedDistance,
            position: 'unten',
            kerbenTypeId: defaultKerbenTypeId
        });
        
        // Aktualisiere die Tabelle, OHNE die Werte zu überschreiben
        // Die gespeicherten Werte bleiben erhalten
        this.refreshKerbeTable(false);
    }
    
    removeKerbeRow(index) {
        // Entferne die Kerbe
        this.kerben.splice(index, 1);
        // Aktualisiere die Tabelle ohne User-Inputs zu übernehmen
        this.refreshKerbeTable(false);
    }
    
    updateKerbeTypeDisplay() {
        const type = this.kerbeTypeSelect.value;
        
        if (type === 'marker') {
            // Bei Strich-Markierung: Breite ausblenden
            if (this.kerbeWidthGroup) {
                this.kerbeWidthGroup.classList.add('hidden');
                this.kerbeWidthGroup.classList.remove('block');
            }
            // Label ändern
            const depthLabel = document.querySelector('label[for="kerbe-depth"]');
            const widthLabel = document.querySelector('label[for="kerbe-width"]');
            if (depthLabel) depthLabel.textContent = 'Höhe:';
            if (widthLabel) widthLabel.textContent = 'Breite:';
        } else {
            // Bei Dreieck: Breite anzeigen
            if (this.kerbeWidthGroup) {
                this.kerbeWidthGroup.classList.remove('hidden');
                this.kerbeWidthGroup.classList.add('block');
            }
            // Label ändern
            const depthLabel = document.querySelector('label[for="kerbe-depth"]');
            const widthLabel = document.querySelector('label[for="kerbe-width"]');
            if (depthLabel) depthLabel.textContent = 'Tiefe:';
            if (widthLabel) widthLabel.textContent = 'Breite:';
        }
    }
    
    confirmKerbe() {
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Aktualisiere Kerben-Daten aus der Tabelle
        const rows = this.kerbeTbody.querySelectorAll('tr');
        this.kerben = [];
        
        rows.forEach(row => {
            const kerbenTypeSelect = row.querySelector('.kerbe-kerben-type-select');
            const distanceInput = row.querySelector('.kerbe-distance-input');
            const positionSelect = row.querySelector('.kerbe-position-select');
            
            if (distanceInput && positionSelect && kerbenTypeSelect) {
                const distance = parseFloat(distanceInput.value);
                const position = positionSelect.value;
                const kerbenTypeId = kerbenTypeSelect.value;
                
                if (!isNaN(distance) && distance >= 0) {
                    this.kerben.push({
                        distance: distance,
                        position: position,
                        kerbenTypeId: kerbenTypeId
                    });
                }
            }
        });
        
        this.closeKerbeModal();
        this.draw();
        this.autoZoom();
    }
    
    // Nahtlinie Modal
    openNahtlinieModal() {
        if (this.nahtlinieModal) {
            this.nahtlinieModal.classList.remove('hidden');
        }
    }
    
    closeNahtlinieModal() {
        if (this.nahtlinieModal) {
            this.nahtlinieModal.classList.add('hidden');
        }
    }
    
    removeNahtlinie() {
        this.saveState(); // Speichere Zustand vor dem Entfernen
        
        this.nahtlinie = null;
        
        this.closeNahtlinieModal();
        this.draw();
        this.autoZoom();
    }
    
    confirmNahtlinie() {
        const distance = parseFloat(this.nahtlinieDistanceInput.value);
        const type = this.nahtlinieTypeSelect.value;
        
        if (isNaN(distance) || distance < 0) {
            alert('Bitte gültigen Abstand eingeben!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        this.nahtlinie = {
            distance: distance,
            type: type
        };
        
        this.closeNahtlinieModal();
        this.draw();
        this.autoZoom();
    }
    
    // Loch Modal
    openLochModal() {
        // Zeige Checkbox-Gruppe nur wenn Kerben vorhanden sind
        if (this.kerben && this.kerben.length > 0) {
            this.lochKerbenCheckboxGroup.classList.remove('hidden');
        } else {
            this.lochKerbenCheckboxGroup.classList.add('hidden');
            this.lochUseKerbenPositionsCheckbox.checked = false;
        }
        
        if (this.lochModal) {
            this.lochModal.classList.remove('hidden');
        }
        this.refreshLochTable();
    }
    
    closeLochModal() {
        if (this.lochModal) {
            this.lochModal.classList.add('hidden');
        }
    }
    
    refreshLochTable() {
        if (!this.lochTbody) return;
        
        // Lese zuerst die aktuellen Werte aus der Tabelle, bevor wir sie neu aufbauen
        const rows = this.lochTbody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (index < this.loecher.length) {
                const distanceInput = row.querySelector('.loch-distance-input');
                
                if (distanceInput) {
                    const distance = parseFloat(distanceInput.value);
                    if (!isNaN(distance)) {
                        this.loecher[index].distance = distance;
                    }
                }
            }
        });
        
        this.lochTbody.innerHTML = '';
        
        this.loecher.forEach((loch, index) => {
            const row = document.createElement('tr');
            row.className = 'border-b border-gray-100 hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-4 py-3"><input type="number" value="${loch.distance}" min="0" step="0.1" class="loch-distance-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"></td>
                <td class="px-4 py-3"><button class="remove-loch-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="profilZeichner.removeLochRow(${index})">Entfernen</button></td>
            `;
            this.lochTbody.appendChild(row);
        });
    }
    
    addLochRow() {
        // Prüfe ob Checkbox aktiviert ist und Kerben vorhanden sind
        if (this.lochUseKerbenPositionsCheckbox && this.lochUseKerbenPositionsCheckbox.checked && 
            this.kerben && this.kerben.length > 0) {
            // Übernehme alle Kerben-Positionen
            const width = parseFloat(this.lochWidthInput.value) || 8;
            const height = parseFloat(this.lochHeightInput.value) || 4;
            const position = parseFloat(this.lochPositionInput.value) || 2;
            
            // Sammle alle vorhandenen Loch-Positionen
            const existingDistances = this.loecher.map(loch => loch.distance);
            
            // Füge Löcher für jede Kerbe hinzu, die noch nicht existiert
            this.kerben.forEach(kerbe => {
                if (!existingDistances.includes(kerbe.distance)) {
        this.loecher.push({
                        distance: kerbe.distance,
            width: width,
            height: height,
            position: position
                    });
                    existingDistances.push(kerbe.distance);
                }
            });
            
            // Sortiere nach Position
            this.loecher.sort((a, b) => a.distance - b.distance);
            
            this.refreshLochTable();
            return;
        }
        
        // Normale Logik: Berechne automatisch eine Position (nach dem letzten Loch + 25mm)
        let suggestedDistance = 0;
        
        if (this.loecher.length > 0) {
            // Falls schon Löcher existieren, nimm den letzten Wert + 25mm
            const lastDistance = this.loecher[this.loecher.length - 1].distance;
            suggestedDistance = lastDistance + 25;
        } else if (this.currentRect && this.currentRect.width) {
            // Falls es das erste Loch ist, setze es auf 25mm vom Anfang
            suggestedDistance = 25;
        }
        
        // Neues Loch mit Vorschlag hinzufügen
        const width = parseFloat(this.lochWidthInput.value) || 8;
        const height = parseFloat(this.lochHeightInput.value) || 4;
        const position = parseFloat(this.lochPositionInput.value) || 2;
        
        this.loecher.push({
            distance: suggestedDistance,
            width: width,
            height: height,
            position: position
        });
        
        this.refreshLochTable();
    }
    
    removeLochRow(index) {
        this.loecher.splice(index, 1);
        this.refreshLochTable();
    }
    
    confirmLoch() {
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Aktualisiere Löcher-Daten aus der Tabelle
        const rows = this.lochTbody.querySelectorAll('tr');
        this.loecher = [];
        
        rows.forEach(row => {
            const distanceInput = row.querySelector('.loch-distance-input');
            
            if (distanceInput) {
                const distance = parseFloat(distanceInput.value);
                const width = parseFloat(this.lochWidthInput.value) || 5;
                const height = parseFloat(this.lochHeightInput.value) || 5;
                const position = parseFloat(this.lochPositionInput.value) || 2; // Standard: 2mm von oben
                
                if (!isNaN(distance) && distance >= 0) {
                    this.loecher.push({
                        distance: distance,
                        width: width,
                        height: height,
                        position: position
                    });
                }
            }
        });
        
        this.closeLochModal();
        this.draw();
        this.autoZoom();
    }
    
    // Ausschnitt-Funktionen
    openAusschnittModal() {
        if (this.ausschnittModal) {
            this.ausschnittModal.classList.remove('hidden');
        }
        this.refreshAusschnittTable();
    }
    
    closeAusschnittModal() {
        if (this.ausschnittModal) {
            this.ausschnittModal.classList.add('hidden');
        }
    }
    
    refreshAusschnittTable() {
        if (!this.ausschnittTbody) return;
        
        // Hole alle bestehenden Zeilen
        const rows = this.ausschnittTbody.querySelectorAll('tr');
        
        // Setze alle Inputs auf 0
        rows.forEach(row => {
            const positionInput = row.querySelector('.ausschnitt-position-input');
            const lengthInput = row.querySelector('.ausschnitt-length-input');
            const heightInput = row.querySelector('.ausschnitt-height-input');
            const positionSelect = row.querySelector('.ausschnitt-position-select');
            
            if (positionInput) positionInput.value = '0';
            if (lengthInput) lengthInput.value = '0';
            if (heightInput) heightInput.value = '0';
            if (positionSelect) positionSelect.value = 'oben';
        });
        
        // Fülle die ersten Zeilen mit gespeicherten Ausschnitten
        this.ausschnitte.forEach((ausschnitt, index) => {
            if (index < rows.length) {
                const row = rows[index];
                const positionInput = row.querySelector('.ausschnitt-position-input');
                const lengthInput = row.querySelector('.ausschnitt-length-input');
                const heightInput = row.querySelector('.ausschnitt-height-input');
                const positionSelect = row.querySelector('.ausschnitt-position-select');
                
                if (positionInput) positionInput.value = ausschnitt.position;
                if (lengthInput) lengthInput.value = ausschnitt.length;
                if (heightInput) heightInput.value = ausschnitt.height;
                if (positionSelect) positionSelect.value = ausschnitt.positionType || 'oben';
            }
        });
    }
    
    addAusschnittRow() {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3"><input type="number" class="ausschnitt-position-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" step="0.1"></td>
            <td class="px-4 py-3"><input type="number" class="ausschnitt-length-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" step="0.1"></td>
            <td class="px-4 py-3"><input type="number" class="ausschnitt-height-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" step="0.1"></td>
            <td class="px-4 py-3">
                <select class="ausschnitt-position-select w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="oben">Oben</option>
                    <option value="unten">Unten</option>
                </select>
            </td>
            <td class="px-4 py-3"><button class="remove-row-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="removeAusschnittRow(this)">✕</button></td>
        `;
        this.ausschnittTbody.appendChild(row);
    }
    
    removeAusschnittRow(index) {
        if (typeof index === 'number') {
            this.ausschnitte.splice(index, 1);
            this.refreshAusschnittTable();
        } else {
            // Wenn ein Button-Element übergeben wurde - leere die Zeile
            const row = index.parentNode.parentNode;
            const positionInput = row.querySelector('.ausschnitt-position-input');
            const lengthInput = row.querySelector('.ausschnitt-length-input');
            const heightInput = row.querySelector('.ausschnitt-height-input');
            const positionSelect = row.querySelector('.ausschnitt-position-select');
            
            if (positionInput) positionInput.value = '0';
            if (lengthInput) lengthInput.value = '0';
            if (heightInput) heightInput.value = '0';
            if (positionSelect) positionSelect.value = 'oben';
        }
    }
    
    confirmAusschnitt() {
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Aktualisiere Ausschnitte-Daten aus der Tabelle
        const rows = this.ausschnittTbody.querySelectorAll('tr');
        this.ausschnitte = [];
        
        rows.forEach(row => {
            const positionInput = row.querySelector('.ausschnitt-position-input');
            const lengthInput = row.querySelector('.ausschnitt-length-input');
            const heightInput = row.querySelector('.ausschnitt-height-input');
            const positionSelect = row.querySelector('.ausschnitt-position-select');
            
            if (positionInput && lengthInput && heightInput && positionSelect) {
                const position = parseFloat(positionInput.value);
                const length = parseFloat(lengthInput.value);
                const height = parseFloat(heightInput.value);
                const positionType = positionSelect.value;
                
                if (!isNaN(position) && !isNaN(length) && !isNaN(height) && 
                    position >= 0 && length > 0 && height > 0) {
                    this.ausschnitte.push({
                        position: position,
                        length: length,
                        height: height,
                        positionType: positionType
                    });
                }
            }
        });
        
        this.closeAusschnittModal();
        this.draw();
        this.autoZoom();
    }
    
    drawAusschnitte() {
        if (!this.currentRect || this.ausschnitte.length === 0) return;
        
        const rect = this.currentRect;
        
        this.ausschnitte.forEach(ausschnitt => {
            const x = rect.x + (ausschnitt.position * this.mmToPx);
            const width = ausschnitt.length * this.mmToPx;
            const height = ausschnitt.height * this.mmToPx;
            
            // Bestimme Y-Position basierend auf positionType
            let y;
            if (ausschnitt.positionType === 'unten') {
                // Unten bündig mit der unteren Linie des Profils
                y = rect.y + rect.height - height;
            } else {
                // Oben bündig (Standard)
                let topY = rect.y;
                if (this.bohnen.length > 0) {
                    const bohne = this.bohnen[0];
                    topY = rect.y - (bohne.height * this.mmToPx);
                }
                y = topY;
            }
            
            // Zeichne weißen Ausschnitt (Loch) mit spezieller Rahmen-Logik
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.lineWidth = 1;
            
            // Fülle den Ausschnitt
            this.ctx.beginPath();
            this.ctx.rect(x, y, width, height);
            this.ctx.fill();
            
            // Zeichne Rahmen mit spezieller Logik
            this.ctx.strokeStyle = '#333'; // Schwarzer Rahmen für alle Linien
            
            // Zeichne alle 4 Linien einzeln
            this.ctx.beginPath();
            
            // Obere Linie
            if (ausschnitt.positionType === 'oben') {
                this.ctx.strokeStyle = '#FFFFFF'; // Weiß für bündige Linie oben
            } else {
                this.ctx.strokeStyle = '#333'; // Schwarz für normale Linie
            }
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + width, y);
            this.ctx.stroke();
            
            // Rechte Linie
            this.ctx.strokeStyle = '#333';
            this.ctx.beginPath();
            this.ctx.moveTo(x + width, y);
            this.ctx.lineTo(x + width, y + height);
            this.ctx.stroke();
            
            // Untere Linie
            if (ausschnitt.positionType === 'unten') {
                this.ctx.strokeStyle = '#FFFFFF'; // Weiß für bündige Linie unten
            } else {
                this.ctx.strokeStyle = '#333'; // Schwarz für normale Linie
            }
            this.ctx.beginPath();
            this.ctx.moveTo(x + width, y + height);
            this.ctx.lineTo(x, y + height);
            this.ctx.stroke();
            
            // Linke Linie
            this.ctx.strokeStyle = '#333';
            this.ctx.beginPath();
            this.ctx.moveTo(x, y + height);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            
            // Zeichne Breite-Text dezent im Ausschnitt
            if (width > 20 && height > 15) { // Nur wenn Ausschnitt groß genug ist
                this.ctx.fillStyle = '#666';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const textX = x + width / 2;
                const textY = y + height / 2;
                this.ctx.fillText(`${ausschnitt.length}mm`, textX, textY);
            }
        });
    }
    
    // Crimping Modal
    openCrimpingModal() {
        // Prüfe ob Bohne vorhanden ist
        if (!this.bohnen || this.bohnen.length === 0) {
            // Zeige Warnung
            if (this.crimpingNoBohneWarning) {
                this.crimpingNoBohneWarning.classList.remove('hidden');
            }
            // Modal trotzdem öffnen, aber Button deaktivieren?
        } else {
            if (this.crimpingNoBohneWarning) {
                this.crimpingNoBohneWarning.classList.add('hidden');
            }
        }
        
        if (this.crimpingModal) {
            this.crimpingModal.classList.remove('hidden');
        }
        this.refreshCrimpingTable();
    }
    
    closeCrimpingModal() {
        if (this.crimpingModal) {
            this.crimpingModal.classList.add('hidden');
        }
    }
    
    refreshCrimpingTable() {
        if (!this.crimpingTbody) return;
        
        // Hole alle bestehenden Zeilen
        const rows = this.crimpingTbody.querySelectorAll('tr');
        
        // Setze alle Inputs auf 0
        rows.forEach(row => {
            const positionInput = row.querySelector('.crimping-position-input');
            const lengthInput = row.querySelector('.crimping-length-input');
            
            if (positionInput) positionInput.value = '0';
            if (lengthInput) lengthInput.value = '0';
        });
        
        // Fülle die ersten Zeilen mit gespeicherten Crimping-Elementen
        this.crimping.forEach((crimpingItem, index) => {
            if (index < rows.length) {
                const row = rows[index];
                const positionInput = row.querySelector('.crimping-position-input');
                const lengthInput = row.querySelector('.crimping-length-input');
                
                if (positionInput) positionInput.value = crimpingItem.position;
                if (lengthInput) lengthInput.value = crimpingItem.length;
            }
        });
    }
    
    addCrimpingRow() {
        const row = document.createElement('tr');
        row.className = 'border-b border-gray-100 hover:bg-gray-50';
        row.innerHTML = `
            <td class="px-4 py-3"><input type="number" class="crimping-position-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" step="0.1"></td>
            <td class="px-4 py-3"><input type="number" class="crimping-length-input w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0" step="0.1"></td>
            <td class="px-4 py-3"><button class="remove-row-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="removeCrimpingRow(this)">✕</button></td>
        `;
        this.crimpingTbody.appendChild(row);
    }
    
    removeCrimpingRow(index) {
        if (typeof index === 'number') {
            this.crimping.splice(index, 1);
            this.refreshCrimpingTable();
        } else {
            // Wenn ein Button-Element übergeben wurde - leere die Zeile
            const row = index.parentNode.parentNode;
            const positionInput = row.querySelector('.crimping-position-input');
            const lengthInput = row.querySelector('.crimping-length-input');
            
            if (positionInput) positionInput.value = '0';
            if (lengthInput) lengthInput.value = '0';
        }
    }
    
    confirmCrimping() {
        // Prüfe ob Bohne vorhanden ist
        if (!this.bohnen || this.bohnen.length === 0) {
            alert('Bitte erstellen Sie zuerst eine Bohne, bevor Sie Crimping hinzufügen können!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Aktualisiere Crimping-Daten aus der Tabelle
        const rows = this.crimpingTbody.querySelectorAll('tr');
        this.crimping = [];
        
        rows.forEach(row => {
            const positionInput = row.querySelector('.crimping-position-input');
            const lengthInput = row.querySelector('.crimping-length-input');
            
            if (positionInput && lengthInput) {
                const position = parseFloat(positionInput.value);
                const length = parseFloat(lengthInput.value);
                
                if (!isNaN(position) && !isNaN(length) && 
                    position >= 0 && length > 0) {
                    this.crimping.push({
                        position: position,
                        length: length
                    });
                }
            }
        });
        
        this.closeCrimpingModal();
        this.draw();
        this.autoZoom();
    }
    
    drawCrimping() {
        if (!this.currentRect || this.crimping.length === 0 || !this.bohnen || this.bohnen.length === 0) return;
        
        const rect = this.currentRect;
        const bohne = this.bohnen[0];
        
        // Berechne Bohne-Position (wie in drawBohnen)
        let bohneWidth = rect.width;
        if (this.cutoutWidth > 0) {
            bohneWidth = rect.width - (2 * this.cutoutWidth * this.mmToPx);
        }
        
        const bohneHeight = bohne.height * this.mmToPx;
        const bohneX = rect.x + (rect.width - bohneWidth) / 2; // Zentriert
        const bohneY = rect.y - bohneHeight; // Direkt über dem Profil
        
        // Zeichne jedes Crimping-Element
        this.crimping.forEach(crimpingItem => {
            const x = bohneX + (crimpingItem.position * this.mmToPx);
            const width = crimpingItem.length * this.mmToPx;
            const height = bohneHeight; // Höhe = Bohne-Höhe
            
            // Prüfe ob innerhalb der Bohne - aber nur warnen, nicht überspringen
            // Begrenze die Position auf die Bohne, falls außerhalb
            let actualX = x;
            let actualWidth = width;
            
            if (x < bohneX) {
                // Zu weit links - beginne an der linken Kante der Bohne
                actualX = bohneX;
                actualWidth = width - (bohneX - x);
            }
            if (x + width > bohneX + bohneWidth) {
                // Zu weit rechts - begrenze auf rechte Kante der Bohne
                actualWidth = (bohneX + bohneWidth) - actualX;
            }
            
            // Nur zeichnen wenn noch Breite übrig ist
            if (actualWidth <= 0) {
                return; // Überspringen wenn keine Breite mehr
            }
            
            // Zeichne Rechteck mit grauer Füllung und Schraffur
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            
            // Fülle Rechteck mit grauer Farbe
            this.ctx.fillStyle = '#CCCCCC'; // Hellgrau
            this.ctx.beginPath();
            this.ctx.rect(actualX, bohneY, actualWidth, height);
            this.ctx.fill();
            
            // Zeichne Rahmen
            this.ctx.beginPath();
            this.ctx.rect(actualX, bohneY, actualWidth, height);
            this.ctx.stroke();
            
            // Zeichne Schraffur (diagonale Linien)
            this.ctx.strokeStyle = '#666';
            this.ctx.lineWidth = 0.5;
            
            // Schraffur-Parameter
            const hatchSpacing = 4; // Abstand zwischen Schraffur-Linien in Pixel
            
            // Einfache diagonale Schraffur: Linien von oben links nach unten rechts
            // Durchlaufe die Breite und Höhe
            const maxDim = Math.max(width, height);
            
            for (let i = -maxDim; i <= maxDim; i += hatchSpacing) {
                this.ctx.beginPath();
                
                // Berechne Start- und Endpunkt der diagonalen Linie
                // Linie: y = bohneY + (x - (x + i))
                let x1 = actualX + i;
                let y1 = bohneY;
                let x2 = actualX + i + height;
                let y2 = bohneY + height;
                
                // Schneide mit Rechteck-Kanten
                let startX, startY, endX, endY;
                
                // Startpunkt: linke oder obere Kante
                if (x1 < actualX) {
                    startX = actualX;
                    startY = bohneY - i;
                } else if (y1 < bohneY) {
                    startX = actualX - i;
                    startY = bohneY;
                } else {
                    startX = x1;
                    startY = y1;
                }
                
                // Endpunkt: rechte oder untere Kante
                if (x2 > actualX + actualWidth) {
                    endX = actualX + actualWidth;
                    endY = bohneY + (actualX + actualWidth - (actualX + i));
                } else if (y2 > bohneY + height) {
                    endX = actualX + i + height;
                    endY = bohneY + height;
                } else {
                    endX = x2;
                    endY = y2;
                }
                
                // Zeichne nur wenn Linie innerhalb des Rechtecks
                if (startX >= actualX && startX <= actualX + actualWidth && startY >= bohneY && startY <= bohneY + height &&
                    endX >= actualX && endX <= actualX + actualWidth && endY >= bohneY && endY <= bohneY + height) {
                    this.ctx.moveTo(startX, startY);
                    this.ctx.lineTo(endX, endY);
                    this.ctx.stroke();
                }
            }
            
            // Zeichne Breite-Text direkt im Crimping-Rechteck (nur wenn Bemaßungen aktiviert)
            if (this.showDimensions && actualWidth > 20 && height > 15) { // Nur wenn Bemaßungen aktiv und Rechteck groß genug ist
                this.ctx.fillStyle = '#333';
                this.ctx.font = '10px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                
                const textX = actualX + actualWidth / 2;
                const textY = bohneY + height / 2;
                this.ctx.fillText(`${crimpingItem.length}mm`, textX, textY);
            }
        });
    }
    
    // Text Modal
    openTextModal() {
        if (this.textModal) {
            this.textModal.classList.remove('hidden');
        }
    }
    
    closeTextModal() {
        if (this.textModal) {
            this.textModal.classList.add('hidden');
        }
        this.selectedTextForEdit = null; // Zurücksetzen beim Schließen
        this.textContentInput.value = '';
        this.textSizeInput.value = '12';
    }
    
    confirmText() {
        const content = this.textContentInput.value.trim();
        const size = parseInt(this.textSizeInput.value);
        
        if (!content) {
            alert('Bitte Text eingeben!');
            return;
        }
        
        if (isNaN(size) || size <= 0) {
            alert('Bitte gültige Schriftgröße eingeben!');
            return;
        }
        
        this.saveState(); // Speichere Zustand vor dem Ändern/Hinzufügen
        
        // Prüfe ob Text bearbeitet wird oder neu erstellt wird
        if (this.selectedTextForEdit) {
            // Text bearbeiten
            this.selectedTextForEdit.content = content;
            this.selectedTextForEdit.size = size;
            this.selectedTextForEdit = null;
        } else {
            // Neuen Text erstellen (zentriert)
        this.texts.push({
            content: content,
            size: size,
            x: this.canvasWidth / 2,
            y: this.canvasHeight / 2
        });
        }
        
        this.closeTextModal();
        this.draw();
        this.autoZoom();
    }
    
    // Drag-and-Drop für Modals
    setupModalDragAndDrop() {
        const modals = [this.bohneModal, this.cutoutModal, this.kerbeModal, this.nahtlinieModal, this.textModal, this.lochModal, this.formatModal];
        
        modals.forEach(modal => {
            if (!modal) return;
            
            const header = modal.querySelector('.modal-header');
            if (!header) return;
            
            header.addEventListener('mousedown', (e) => {
                if (e.target.classList.contains('modal-close')) return;
                
                this.draggedModal = modal;
                const rect = modal.getBoundingClientRect();
                this.dragOffset.x = e.clientX - rect.left;
                this.dragOffset.y = e.clientY - rect.top;
                
                modal.style.position = 'fixed';
                modal.style.left = rect.left + 'px';
                modal.style.top = rect.top + 'px';
                modal.style.margin = '0';
                
                document.addEventListener('mousemove', this.handleModalDrag);
                document.addEventListener('mouseup', this.handleModalDragEnd);
            });
        });
    }
    
    handleModalDrag = (e) => {
        if (this.draggedModal) {
            this.draggedModal.style.left = (e.clientX - this.dragOffset.x) + 'px';
            this.draggedModal.style.top = (e.clientY - this.dragOffset.y) + 'px';
        }
    }
    
    // Datenbank-Funktionalität
    initDatabase() {
        this.databaseModal = document.getElementById('database-modal');
        this.databaseModalClose = document.getElementById('database-modal-close');
        this.databaseModalMinimize = document.getElementById('database-modal-minimize');
        this.databaseModalMaximize = document.getElementById('database-modal-maximize');
        
        // KI Foto-Erkennung wurde entfernt
        this.databaseCancelButton = document.getElementById('database-cancel');
        this.databaseSaveButton = document.getElementById('database-save');
        this.databaseSearchInput = document.getElementById('database-search');
        this.addProfileButton = document.getElementById('add-profile-btn');
        this.loadProfileButton = document.getElementById('load-profile-btn');
        this.databaseTable = document.getElementById('database-table');
        this.databaseTbody = document.getElementById('database-tbody');
        this.openDatabaseButton = document.getElementById('open-database-btn');
        this.saveDatabaseButton = document.getElementById('save-database-btn');
        this.clearLastDatabaseButton = document.getElementById('clear-last-database-btn');
        this.databaseFileInput = document.getElementById('database-file-input');
        this.databaseFileInfo = document.getElementById('database-file-info');
        
        this.profiles = [];
        this.selectedProfileId = null;
        this.isDatabaseMaximized = false;
        this.originalModalStyle = null;
        this.currentDatabaseFile = null;
        this.currentDatabaseFileName = null;
        this.lastDatabaseKey = 'profilZeichner_lastDatabase';
        
        // Event Listeners
        if (this.databaseModalClose) {
            this.databaseModalClose.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeDatabaseModal();
            });
        }
        if (this.databaseModalMinimize) {
            this.databaseModalMinimize.addEventListener('click', () => this.minimizeDatabaseModal());
        }
        if (this.databaseModalMaximize) {
            this.databaseModalMaximize.addEventListener('click', () => this.toggleMaximizeDatabaseModal());
        }
        if (this.databaseCancelButton) {
            this.databaseCancelButton.addEventListener('click', () => this.closeDatabaseModal());
        }
        if (this.databaseSaveButton) {
            this.databaseSaveButton.addEventListener('click', () => this.saveDatabase());
        }
        if (this.addProfileButton) {
            this.addProfileButton.addEventListener('click', () => this.addNewProfile());
        }
        if (this.loadProfileButton) {
            this.loadProfileButton.addEventListener('click', () => this.loadSelectedProfile());
        }
        if (this.databaseSearchInput) {
            this.databaseSearchInput.addEventListener('input', () => this.filterProfiles());
        }
        if (this.openDatabaseButton) {
            this.openDatabaseButton.addEventListener('click', () => this.openDatabaseFile());
        }
        if (this.saveDatabaseButton) {
            this.saveDatabaseButton.addEventListener('click', () => this.saveDatabaseFile());
        }
        if (this.clearLastDatabaseButton) {
            this.clearLastDatabaseButton.addEventListener('click', () => this.clearLastDatabaseConfirm());
        }
        if (this.databaseFileInput) {
            this.databaseFileInput.addEventListener('change', (e) => this.loadDatabaseFile(e));
        }
        
        // Lade Datenbank beim Start
        this.loadDatabase();
        
        // Initialisiere Spaltenbreite-Anpassung
        this.initColumnResize();
    }
    
    openDatabaseModal() {
        // Stelle sicher, dass Modal im normalen Zustand ist
        this.restoreOriginalSize();
        if (this.databaseModal) {
            this.databaseModal.classList.remove('hidden');
        }
        // Warte kurz, damit das Modal gerendert wird
        setTimeout(() => {
        this.refreshDatabaseTable();
        }, 50);
    }
    
    openZeichnungenDbModal() {
        // Stelle sicher, dass Modal im normalen Zustand ist
        this.restoreZeichnungenDbSize();
        if (this.zeichnungsdbModal) {
            this.zeichnungsdbModal.classList.remove('hidden');
        }
    }
    
    closeDatabaseModal() {
        if (this.databaseModal) {
            this.databaseModal.classList.add('hidden');
        }
        // Stelle ursprüngliche Größe wieder her
        this.restoreOriginalSize();
    }
    
    minimizeDatabaseModal() {
        if (this.databaseModal) {
            this.databaseModal.classList.add('hidden');
        }
        // Minimiertes Modal als kleines Icon in der Ecke
        this.showMinimizedIcon();
    }
    
    toggleMaximizeDatabaseModal() {
        if (this.isDatabaseMaximized) {
            this.restoreOriginalSize();
        } else {
            this.maximizeDatabaseModal();
        }
    }
    
    maximizeDatabaseModal() {
        const modalContent = this.databaseModal.querySelector('.bg-white');
        
        // Speichere ursprüngliche Größe beim ersten Mal
        if (!this.originalModalStyle) {
            this.originalModalStyle = {
                modalContentClass: modalContent ? modalContent.className : ''
            };
        }
        
        // Setze Modal auf volle Bildschirmgröße
        this.databaseModal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]';
        this.databaseModal.classList.remove('hidden');
        
        // Setze Modal-Content auf volle Größe
        if (modalContent) {
            modalContent.className = 'bg-white rounded-none shadow-2xl w-full h-full flex flex-col overflow-hidden';
        }
        
        // Aktualisiere Button
        if (this.databaseModalMaximize) {
            this.databaseModalMaximize.textContent = '⧉';
            this.databaseModalMaximize.classList.add('bg-green-500');
            this.databaseModalMaximize.classList.remove('bg-gray-500');
        }
        
        this.isDatabaseMaximized = true;
        
        // Passe Tabellen-Container an für maximierte Ansicht
        const tableContainer = this.databaseModal.querySelector('.border.border-gray-200');
        if (tableContainer) {
            tableContainer.className = 'border border-gray-200 rounded-lg overflow-hidden max-h-[calc(100vh-250px)] overflow-y-auto';
        }
        
        // Stelle sicher, dass der Body scrollbar ist
        const modalBody = this.databaseModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.className = 'modal-body flex-1 overflow-y-auto p-6';
        }
    }
    
    restoreOriginalSize() {
        if (!this.databaseModal) return;
        
        // Stelle ursprüngliche Modal-Klassen wieder her
        this.databaseModal.className = 'modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Stelle Modal-Content wieder her
        const modalContent = this.databaseModal.querySelector('.bg-white');
        if (modalContent && this.originalModalStyle) {
            modalContent.className = this.originalModalStyle.modalContentClass || 'bg-white rounded-2xl shadow-2xl w-[90%] max-w-6xl max-h-[90vh] flex flex-col overflow-hidden';
        }
        
        // Aktualisiere Button
        if (this.databaseModalMaximize) {
            this.databaseModalMaximize.textContent = '□';
            this.databaseModalMaximize.classList.remove('bg-green-500');
            this.databaseModalMaximize.classList.add('bg-gray-500');
        }
        
        this.isDatabaseMaximized = false;
        
        // Stelle Tabellen-Container wieder her
        const tableContainer = this.databaseModal.querySelector('.border.border-gray-200');
        if (tableContainer) {
            tableContainer.className = 'border border-gray-200 rounded-lg overflow-hidden max-h-[500px] overflow-y-auto';
        }
        
        // Stelle Modal-Body wieder her
        const modalBody = this.databaseModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.className = 'modal-body flex-1 overflow-y-auto p-6';
        }
    }
    
    showMinimizedIcon() {
        // Erstelle minimiertes Icon (optional)
        let minimizedIcon = document.getElementById('database-minimized-icon');
        if (!minimizedIcon) {
            minimizedIcon = document.createElement('div');
            minimizedIcon.id = 'database-minimized-icon';
            minimizedIcon.innerHTML = '🗃️';
            minimizedIcon.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 50px;
                height: 50px;
                background: #007bff;
                color: white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 20px;
                z-index: 10000;
                box-shadow: 0 4px 8px rgba(0,0,0,0.3);
                transition: transform 0.2s ease;
            `;
            minimizedIcon.addEventListener('click', () => {
                this.openDatabaseModal();
                minimizedIcon.remove();
            });
            minimizedIcon.addEventListener('mouseenter', () => {
                minimizedIcon.style.transform = 'scale(1.1)';
            });
            minimizedIcon.addEventListener('mouseleave', () => {
                minimizedIcon.style.transform = 'scale(1)';
            });
            document.body.appendChild(minimizedIcon);
        }
    }
    
    loadDatabase() {
        // Versuche zuerst die letzte Datenbank zu laden
        if (this.loadLastDatabase()) {
            console.log('Letzte Datenbank erfolgreich geladen');
            return;
        }
        
        // Falls keine letzte Datenbank vorhanden, verwende Standard-Daten
        console.log('Keine letzte Datenbank gefunden, verwende Standard-Daten');
        this.profiles = [
            {
                id: 1,
                spsNummer: "SPS-001",
                lieferant: "OKE",
                lieferantNummer: "OKE-001",
                hoehe: 20,
                material: "Aluminium",
                projekt: "Van.Ea",
                skizze: "Standard-Profil 20mm hoch"
            },
            {
                id: 2,
                spsNummer: "SPS-002",
                lieferant: "OKE",
                lieferantNummer: "OKE-002",
                hoehe: 25,
                material: "Stahl",
                projekt: "Porsche",
                skizze: "Profil mit Bohne 5mm"
            },
            {
                id: 3,
                spsNummer: "SPS-003",
                lieferant: "OKE",
                lieferantNummer: "OKE-003",
                hoehe: 30,
                material: "Kunststoff",
                projekt: "VW",
                skizze: "Profil mit Kerben"
            },
            {
                id: 4,
                spsNummer: "SPS-004",
                lieferant: "OKE",
                lieferantNummer: "OKE-004",
                hoehe: 35,
                material: "Aluminium",
                projekt: "Van.Ea",
                skizze: "Profil mit Ausschnitten"
            },
            {
                id: 5,
                spsNummer: "SPS-005",
                lieferant: "OKE",
                lieferantNummer: "OKE-005",
                hoehe: 40,
                material: "Stahl",
                projekt: "Porsche",
                skizze: "Komplexes Profil mit allen Features"
            }
        ];
        
        this.currentDatabaseFileName = 'Standard-Datenbank';
        this.refreshDatabaseTable();
        this.updateFileInfo();
        
        // Optional: Versuche trotzdem profiles.json zu laden (falls über HTTP-Server)
        fetch('profiles.json')
            .then(response => response.json())
            .then(data => {
                if (data.profiles && data.profiles.length > 0) {
                    this.profiles = data.profiles;
                    this.currentDatabaseFileName = 'profiles.json';
                    this.refreshDatabaseTable();
                    this.updateFileInfo();
                    console.log('Profiles aus profiles.json geladen');
                }
            })
            .catch(error => {
                console.log('Profiles.json nicht verfügbar, verwende Standard-Daten');
            });
    }
    
    saveDatabase() {
        // Erstelle JSON-Datei zum Download
        const data = {
            profiles: this.profiles
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentDatabaseFileName || 'profiles.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert(`Datenbank als ${this.currentDatabaseFileName || 'profiles.json'} gespeichert!`);
    }
    
    openDatabaseFile() {
        this.databaseFileInput.click();
    }
    
    loadDatabaseFile(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.name.toLowerCase().endsWith('.json')) {
            alert('Bitte wählen Sie eine JSON-Datei aus!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.profiles && Array.isArray(data.profiles)) {
                    this.profiles = data.profiles;
                    this.currentDatabaseFile = file;
                    this.currentDatabaseFileName = file.name;
                    this.updateFileInfo();
                    this.refreshDatabaseTable();
                    
                    // Speichere als letzte Datenbank
                    this.saveLastDatabase(data);
                    
                    alert(`Datenbank "${file.name}" erfolgreich geladen!`);
                } else {
                    alert('Ungültiges Datenbankformat! Die Datei muss ein "profiles" Array enthalten.');
                }
            } catch (error) {
                alert('Fehler beim Laden der Datei: ' + error.message);
            }
        };
        reader.readAsText(file);
    }
    
    saveDatabaseFile() {
        if (this.profiles.length === 0) {
            alert('Keine Profile zum Speichern vorhanden!');
            return;
        }
        
        const data = {
            profiles: this.profiles,
            lastModified: new Date().toISOString(),
            version: "1.0"
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentDatabaseFileName || 'profiles.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        // Speichere als letzte Datenbank
        this.saveLastDatabase(data);
        
        alert(`Datenbank als "${this.currentDatabaseFileName || 'profiles.json'}" gespeichert!`);
    }
    
    saveLastDatabase(data) {
        try {
            localStorage.setItem(this.lastDatabaseKey, JSON.stringify(data));
            console.log('Letzte Datenbank gespeichert');
        } catch (error) {
            console.log('Konnte letzte Datenbank nicht speichern:', error);
        }
    }
    
    loadLastDatabase() {
        try {
            const savedData = localStorage.getItem(this.lastDatabaseKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                if (data.profiles && Array.isArray(data.profiles)) {
                    this.profiles = data.profiles;
                    this.currentDatabaseFileName = 'Letzte Datenbank';
                    this.updateFileInfo();
                    this.refreshDatabaseTable();
                    console.log('Letzte Datenbank geladen:', data.profiles.length, 'Profile');
                    return true;
                }
            }
        } catch (error) {
            console.log('Konnte letzte Datenbank nicht laden:', error);
        }
        return false;
    }
    
    clearLastDatabaseConfirm() {
        if (confirm('Möchten Sie die letzte gespeicherte Datenbank wirklich löschen?\n\nDies kann nicht rückgängig gemacht werden!')) {
            this.clearLastDatabase();
            this.currentDatabaseFileName = null;
            this.updateFileInfo();
            alert('Letzte Datenbank wurde gelöscht!');
        }
    }
    
    clearLastDatabase() {
        try {
            localStorage.removeItem(this.lastDatabaseKey);
            console.log('Letzte Datenbank gelöscht');
        } catch (error) {
            console.log('Konnte letzte Datenbank nicht löschen:', error);
        }
    }
    
    updateFileInfo() {
        if (this.currentDatabaseFileName) {
            this.databaseFileInfo.textContent = `Geladen: ${this.currentDatabaseFileName} (${this.profiles.length} Profile)`;
            this.databaseFileInfo.style.color = '#28a745';
        } else {
            this.databaseFileInfo.textContent = 'Keine Datei geladen';
            this.databaseFileInfo.style.color = '#666';
        }
    }
    
    initColumnResize() {
        const table = this.databaseTable;
        if (!table) return;
        
        const headers = table.querySelectorAll('th');
        let isResizing = false;
        let currentHeader = null;
        let startX = 0;
        let startWidth = 0;
        
        headers.forEach(header => {
            header.addEventListener('mousedown', (e) => {
                if (e.target === header || e.target.parentElement === header) {
                    isResizing = true;
                    currentHeader = header;
                    startX = e.clientX;
                    startWidth = header.offsetWidth;
                    document.body.style.cursor = 'col-resize';
                    e.preventDefault();
                }
            });
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isResizing && currentHeader) {
                const newWidth = startWidth + (e.clientX - startX);
                if (newWidth > 50) { // Mindestbreite
                    currentHeader.style.width = newWidth + 'px';
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                currentHeader = null;
                document.body.style.cursor = '';
            }
        });
    }
    
    createSkizzePreview(skizzeData) {
        const container = document.createElement('div');
        container.className = 'relative w-full h-full flex items-center justify-center';
        
        if (skizzeData && skizzeData.startsWith('data:image')) {
            const img = document.createElement('img');
            img.className = 'max-w-full max-h-full object-contain cursor-pointer hover:opacity-80 transition-opacity';
            img.src = skizzeData;
            img.title = 'Klicken für Vollansicht';
            
            // Klick für Vollansicht
            img.addEventListener('click', () => {
                this.showSkizzeFullscreen(skizzeData);
            });
            
            container.appendChild(img);
        } else {
            const uploadArea = document.createElement('div');
            uploadArea.className = 'w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer';
            uploadArea.innerHTML = `
                <div class="text-center">
                    <div class="text-2xl mb-1">📷</div>
                    <div class="text-xs text-gray-600">Skizze</div>
                </div>
            `;
            container.appendChild(uploadArea);
        }
        
        return container;
    }
    
    showSkizzeFullscreen(skizzeData) {
        // Erstelle Vollbild-Modal für Skizze
        const fullscreenModal = document.createElement('div');
        fullscreenModal.className = 'fixed inset-0 bg-black/90 z-[10001] flex items-center justify-center cursor-pointer';
        
        const img = document.createElement('img');
        img.src = skizzeData;
        img.className = 'max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl';
        
        fullscreenModal.appendChild(img);
        document.body.appendChild(fullscreenModal);
        
        // Schließen bei Klick
        fullscreenModal.addEventListener('click', () => {
            document.body.removeChild(fullscreenModal);
        });
        
        // Schließen bei ESC
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(fullscreenModal);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }
    
    refreshDatabaseTable() {
        this.databaseTbody.innerHTML = '';
        
        this.profiles.forEach(profile => {
            const row = document.createElement('tr');
            row.dataset.profileId = profile.id;
            
            // Skizze-Zelle mit Upload-Funktionalität
            const skizzeCell = this.createSkizzeCell(profile);
            
            row.className = 'border-b border-gray-100 hover:bg-gray-50';
            row.innerHTML = `
                <td class="px-2 py-2"><input type="text" class="w-full px-2 py-1 text-xs border border-gray-300 rounded bg-gray-50 cursor-default" value="${profile.id}" readonly></td>
                <td class="px-2 py-2"><input type="text" class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${profile.spsNummer}" data-field="spsNummer"></td>
                <td class="px-2 py-2"><input type="text" class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${profile.lieferant}" data-field="lieferant"></td>
                <td class="px-2 py-2"><input type="text" class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${profile.lieferantNummer}" data-field="lieferantNummer"></td>
                <td class="px-2 py-2"><input type="number" class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${profile.hoehe}" data-field="hoehe" step="0.1"></td>
                <td class="px-2 py-2"><input type="text" class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" value="${profile.material}" data-field="material"></td>
                <td class="px-2 py-2">
                    <select class="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" data-field="projekt">
                        <option value="Van.Ea" ${profile.projekt === 'Van.Ea' ? 'selected' : ''}>Van.Ea</option>
                        <option value="Porsche" ${profile.projekt === 'Porsche' ? 'selected' : ''}>Porsche</option>
                        <option value="VW" ${profile.projekt === 'VW' ? 'selected' : ''}>VW</option>
                    </select>
                </td>
                <td class="px-2 py-2">${skizzeCell}</td>
                <td class="px-2 py-2">
                    <button class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors mr-1" onclick="profilZeichner.selectProfile(${profile.id})">Laden</button>
                    <button class="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors" onclick="profilZeichner.deleteProfile(${profile.id})">Löschen</button>
                </td>
            `;
            
            // Event Listeners für Eingabefelder
            const inputs = row.querySelectorAll('input[data-field], select[data-field]');
            inputs.forEach(input => {
                if (input.type === 'number' || input.tagName === 'SELECT') {
                    const eventType = input.tagName === 'SELECT' ? 'change' : 'input';
                    input.addEventListener(eventType, (e) => {
                    const field = e.target.dataset.field;
                        const value = input.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                    profile[field] = value;
                });
                } else {
                    input.addEventListener('input', (e) => {
                    const field = e.target.dataset.field;
                    const value = e.target.value;
                    profile[field] = value;
                });
                }
            });
            
            // Skizze-Upload Event Listeners
            this.setupSkizzeUpload(row, profile);
            
            this.databaseTbody.appendChild(row);
        });
    }
    
    createSkizzeCell(profile) {
        const hasSkizze = profile.skizze && profile.skizze.startsWith('data:image');
        
        if (hasSkizze) {
            // Escape quotes für onclick
            const escapedSkizze = profile.skizze.replace(/'/g, "\\'");
            return `
                <div class="relative w-[30px] h-[20px] flex items-center justify-center cursor-pointer group">
                    <div class="w-6 h-[18px] flex items-center justify-center text-sm border border-gray-300 rounded bg-blue-50 hover:bg-blue-100 hover:border-blue-500 transition-all" title="Skizze vorhanden - Klicken für Vollansicht" onclick="profilZeichner.showSkizzeFullscreen('${escapedSkizze}')">
                        📷
                    </div>
                    <div class="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 z-[1000] hidden group-hover:block bg-white border-2 border-blue-500 rounded p-1 shadow-lg pointer-events-none">
                        <img src="${profile.skizze}" alt="Skizze Vorschau" class="max-w-[200px] max-h-[200px] block">
                    </div>
                    <div class="absolute top-full left-0 mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-200" onclick="profilZeichner.openSkizzeUpload(${profile.id}); event.stopPropagation();" title="Hochladen">📁</button>
                        <button class="px-1.5 py-0.5 bg-red-100 border border-red-300 text-red-700 rounded text-xs hover:bg-red-200" onclick="profilZeichner.deleteSkizze(${profile.id}); event.stopPropagation();" title="Löschen">🗑️</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="w-[30px] h-[20px] flex items-center justify-center border border-gray-300 rounded bg-gray-50 hover:bg-gray-100 cursor-pointer" data-profile-id="${profile.id}" title="Klicken zum Hochladen">
                    <span class="text-sm">📷</span>
                    <input type="file" class="skizze-file-input hidden" accept="image/*">
                </div>
            `;
        }
    }
    
    setupSkizzeUpload(row, profile) {
        const skizzeContainer = row.querySelector('[data-profile-id], .group');
        const fileInput = row.querySelector('.skizze-file-input');
        
        if (skizzeContainer) {
            // Drag & Drop Events
            skizzeContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                skizzeContainer.classList.add('drag-over');
            });
            
            skizzeContainer.addEventListener('dragleave', (e) => {
                e.preventDefault();
                skizzeContainer.classList.remove('drag-over');
            });
            
            skizzeContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                skizzeContainer.classList.remove('border-blue-500', 'bg-blue-50');
                
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleSkizzeUpload(files[0], profile);
                }
            });
            
            // Click to upload
            skizzeContainer.addEventListener('click', () => {
                if (fileInput) {
                    fileInput.click();
                }
            });
            
            // File input change
            if (fileInput) {
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files.length > 0) {
                        this.handleSkizzeUpload(e.target.files[0], profile);
                    }
                });
            }
        }
    }
    
    handleSkizzeUpload(file, profile) {
        if (!file.type.startsWith('image/')) {
            alert('Bitte wählen Sie eine Bilddatei aus!');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            profile.skizze = e.target.result;
            this.refreshDatabaseTable();
        };
        reader.readAsDataURL(file);
    }
    
    openSkizzeUpload(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.handleSkizzeUpload(e.target.files[0], profile);
            }
        };
        input.click();
    }
    
    deleteSkizze(profileId) {
        const profile = this.profiles.find(p => p.id === profileId);
        if (!profile) return;
        
        if (confirm('Skizze wirklich löschen?')) {
            profile.skizze = '';
            this.refreshDatabaseTable();
        }
    }
    
    addNewProfile() {
        const newId = Math.max(...this.profiles.map(p => p.id), 0) + 1;
        const newProfile = {
            id: newId,
            spsNummer: `SPS-${newId.toString().padStart(3, '0')}`,
            lieferant: "OKE",
            lieferantNummer: `OKE-${newId.toString().padStart(3, '0')}`,
            hoehe: 20,
            material: "Aluminium",
            projekt: "Van.Ea",
            skizze: "Neues Profil"
        };
        
        this.profiles.push(newProfile);
        this.refreshDatabaseTable();
    }
    
    deleteProfile(id) {
        if (confirm('Profil wirklich löschen?')) {
            this.profiles = this.profiles.filter(p => p.id !== id);
            this.refreshDatabaseTable();
        }
    }
    
    selectProfile(id) {
        // Entferne vorherige Auswahl
        const rows = this.databaseTbody.querySelectorAll('tr');
        rows.forEach(row => row.classList.remove('selected'));
        
        // Markiere ausgewählte Zeile
        const selectedRow = this.databaseTbody.querySelector(`tr[data-profile-id="${id}"]`);
        if (selectedRow) {
            selectedRow.classList.add('selected');
            this.selectedProfileId = id;
        }
    }
    
    loadSelectedProfile() {
        if (!this.selectedProfileId) {
            alert('Bitte wählen Sie zuerst ein Profil aus!');
            return;
        }
        
        const profile = this.profiles.find(p => p.id === this.selectedProfileId);
        if (!profile) {
            alert('Profil nicht gefunden!');
            return;
        }
        
        // Lade Profil-Daten in die Anwendung
        this.loadProfileData(profile);
        this.closeDatabaseModal();
    }
    
    loadProfileData(profile) {
        // Setze Breite und Höhe
        document.getElementById('width-input').value = 100; // Standard-Breite
        document.getElementById('height-input').value = profile.hoehe;
        
        // Speichere Profil-Skizze für Anzeige
        this.loadedProfileSkizze = profile.skizze;
        // Reset Skizze-Position beim Laden eines neuen Profils
        this.skizzeX = null;
        this.skizzeY = null;
        this.skizzeWidth = 40 * this.mmToPx;
        this.skizzeHeight = 30 * this.mmToPx;
        console.log('Skizze geladen:', this.loadedProfileSkizze ? 'Ja' : 'Nein');
        console.log('Skizze-Typ:', typeof this.loadedProfileSkizze);
        console.log('Skizze-Inhalt:', this.loadedProfileSkizze ? this.loadedProfileSkizze.substring(0, 50) + '...' : 'Keine Skizze');
        
        // Zeichne neues Profil
        this.drawRectangle();
        
        // Optional: Setze weitere Parameter basierend auf Skizze
        if (profile.skizze.includes('Bohne')) {
            // Automatisch Bohne hinzufügen
            setTimeout(() => {
                this.openBohneModal();
            }, 100);
        }
        
        alert(`Profil ${profile.spsNummer} geladen!`);
    }
    
    filterProfiles() {
        const searchTerm = this.databaseSearchInput.value.toLowerCase();
        const rows = this.databaseTbody.querySelectorAll('tr');
        
        rows.forEach(row => {
            const spsNummer = row.querySelector('input[data-field="spsNummer"]').value.toLowerCase();
            const lieferant = row.querySelector('input[data-field="lieferant"]').value.toLowerCase();
            
            if (spsNummer.includes(searchTerm) || lieferant.includes(searchTerm)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    handleModalDragEnd = () => {
        this.draggedModal = null;
        this.dragOffset = { x: 0, y: 0 };
        
        document.removeEventListener('mousemove', this.handleModalDrag);
        document.removeEventListener('mouseup', this.handleModalDragEnd);
    }
    
    // KI Foto-Erkennung Funktionen wurden entfernt
    /*
    initAiPhotoRecognition() {
        // Event Listeners für KI Modal
        this.aiPhotoModalClose.addEventListener('click', () => this.closeAiPhotoModal());
        this.aiPhotoCancelButton.addEventListener('click', () => this.closeAiPhotoModal());
        this.aiPhotoAnalyzeButton.addEventListener('click', () => this.startAiAnalysis());
        this.aiPhotoApplyButton.addEventListener('click', () => this.applyAiResults());
        
        // Foto-Upload Event Listeners
        this.photoUploadArea.addEventListener('click', () => this.photoFileInput.click());
        this.photoFileInput.addEventListener('change', (e) => this.handlePhotoUpload(e));
        this.removePhotoBtn.addEventListener('click', () => this.removePhoto());
        
        // Drag & Drop für Foto-Upload
        this.photoUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.photoUploadArea.classList.add('drag-over');
        });
        
        this.photoUploadArea.addEventListener('dragleave', () => {
            this.photoUploadArea.classList.remove('drag-over');
        });
        
        this.photoUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.photoUploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handlePhotoUpload({ target: { files: files } });
            }
        });
        
        // Gesamtlänge Input Event Listener
        this.totalLengthInput.addEventListener('input', () => this.updateButtonStates());
        
        // KI-Analyse Ergebnisse
        this.aiDetectedData = null;
    }
    
    openAiPhotoModal() {
        this.aiPhotoModal.style.display = 'block';
        this.resetAiPhotoModal();
    }
    
    closeAiPhotoModal() {
        this.aiPhotoModal.style.display = 'none';
        this.resetAiPhotoModal();
    }
    
    resetAiPhotoModal() {
        // Reset alle Felder
        this.photoFileInput.value = '';
        this.totalLengthInput.value = '';
        this.photoPreview.style.display = 'none';
        this.photoUploadArea.style.display = 'flex';
        this.aiAnalysisStatus.style.display = 'none';
        this.aiResults.style.display = 'none';
        this.aiDetectedData = null;
        
        // Reset Button States
        this.updateButtonStates();
    }
    
    handlePhotoUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Validiere Dateityp
        if (!file.type.startsWith('image/')) {
            alert('Bitte wählen Sie eine gültige Bilddatei aus!');
            return;
        }
        
        // Zeige Foto-Vorschau
        const reader = new FileReader();
        reader.onload = (e) => {
            this.photoPreviewImg.src = e.target.result;
            this.photoPreview.style.display = 'block';
            this.photoUploadArea.style.display = 'none';
            this.updateButtonStates();
        };
        reader.readAsDataURL(file);
    }
    
    removePhoto() {
        this.photoFileInput.value = '';
        this.photoPreview.style.display = 'none';
        this.photoUploadArea.style.display = 'flex';
        this.aiAnalysisStatus.style.display = 'none';
        this.aiResults.style.display = 'none';
        this.aiDetectedData = null;
        this.updateButtonStates();
    }
    
    updateButtonStates() {
        const hasPhoto = this.photoPreview.style.display !== 'none';
        const hasLength = this.totalLengthInput.value && parseFloat(this.totalLengthInput.value) > 0;
        
        this.aiPhotoAnalyzeButton.disabled = !hasPhoto || !hasLength;
        this.aiPhotoApplyButton.disabled = !this.aiDetectedData;
    }
    
    async startAiAnalysis() {
        if (!this.photoPreviewImg.src || !this.totalLengthInput.value) {
            alert('Bitte laden Sie ein Foto hoch und geben Sie die Gesamtlänge ein!');
            return;
        }
        
        // Zeige Loading-Status
        this.aiAnalysisStatus.style.display = 'block';
        this.aiResults.style.display = 'none';
        this.aiPhotoAnalyzeButton.disabled = true;
        
        try {
            // Simuliere KI-Analyse (hier würde die echte OpenAI API aufgerufen werden)
            await this.simulateAiAnalysis();
            
            // Zeige Ergebnisse
            this.displayAiResults();
            this.updateButtonStates();
            
        } catch (error) {
            console.error('KI-Analyse Fehler:', error);
            alert('Fehler bei der KI-Analyse. Bitte versuchen Sie es erneut.');
        } finally {
            this.aiAnalysisStatus.style.display = 'none';
        }
    }
    
    async simulateAiAnalysis() {
        // Simuliere API-Aufruf mit Delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simuliere erkannte Elemente basierend auf der Gesamtlänge
        const totalLength = parseFloat(this.totalLengthInput.value);
        const detectedElements = [];
        
        // Simuliere verschiedene Elemente
        if (totalLength > 50) {
            detectedElements.push({
                type: 'Kerbe',
                position: totalLength * 0.2,
                size: { width: 6, height: 4 },
                confidence: 0.85
            });
        }
        
        if (totalLength > 80) {
            detectedElements.push({
                type: 'Loch',
                position: totalLength * 0.6,
                size: { width: 8, height: 8 },
                confidence: 0.92
            });
        }
        
        if (totalLength > 100) {
            detectedElements.push({
                type: 'Kerbe',
                position: totalLength * 0.8,
                size: { width: 6, height: 4 },
                confidence: 0.78
            });
        }
        
        this.aiDetectedData = {
            elements: detectedElements,
            totalLength: totalLength,
            profileHeight: 20 // Standard-Höhe
        };
    }
    
    displayAiResults() {
        if (!this.aiDetectedData) return;
        
        this.aiDetectedElements.innerHTML = '';
        
        this.aiDetectedData.elements.forEach((element, index) => {
            const elementDiv = document.createElement('div');
            elementDiv.className = 'ai-detected-element';
            elementDiv.innerHTML = `
                <div class="ai-element-info">
                    <div class="ai-element-type">${element.type}</div>
                    <div class="ai-element-position">Position: ${element.position.toFixed(1)}mm</div>
                    <div class="ai-element-size">Größe: ${element.size.width}×${element.size.height}mm</div>
                </div>
                <div style="color: #28a745; font-weight: bold;">
                    ${Math.round(element.confidence * 100)}%
                </div>
            `;
            this.aiDetectedElements.appendChild(elementDiv);
        });
        
        this.aiResults.style.display = 'block';
    }
    
    applyAiResults() {
        if (!this.aiDetectedData) return;
        
        // Setze Profil-Dimensionen
        document.getElementById('width-input').value = this.aiDetectedData.totalLength;
        document.getElementById('height-input').value = this.aiDetectedData.profileHeight;
        
        // Erstelle Profil
        this.drawRectangle();
        
        // Füge erkannte Elemente hinzu
        this.aiDetectedData.elements.forEach(element => {
            if (element.type === 'Kerbe') {
                this.kerben.push({
                    position: element.position,
                    positionType: 'unten',
                    width: element.size.width,
                    height: element.size.height
                });
            } else if (element.type === 'Loch') {
                this.loecher.push({
                    position: element.position,
                    width: element.size.width,
                    height: element.size.height
                });
            }
        });
        
        // Zeichne alles neu
        this.draw();
        
        // Schließe Modal
        this.closeAiPhotoModal();
        
        alert(`KI-Analyse erfolgreich! ${this.aiDetectedData.elements.length} Elemente wurden erkannt und hinzugefügt.`);
    }
    */
    
    // ============================================================================
    // ORDER SYSTEM - CAD-ZEICHNER BESTELLUNG
    // ============================================================================
    
    // Order-Funktion entfernt - wird in Version 2.0 wieder implementiert
    // Die folgenden Funktionen sind vorbereitet, aber aktuell nicht aktiv:
    // - openCustomRequestModal()
    // - closeCustomRequestModal()
    // - createFiverrRequest()
    // - generateEmailText()
    // - showEmailConfirmation()
    // - saveCustomRequestForTracking()
    // - downloadSVGAndOpenEmail()
    
    handleAttachmentPreview(event) {
        const files = event.target.files;
        const preview = document.getElementById('attachment-preview');
        if (!preview) return;
        
        preview.innerHTML = '';
        
        Array.from(files).forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100px';
                    img.style.height = '100px';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '4px';
                    img.style.border = '1px solid #ddd';
                    img.title = file.name;
                    preview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    getRequirements() {
        const requirementInputs = document.querySelectorAll('.requirement-input');
        const requirements = [];
        requirementInputs.forEach(input => {
            const value = input.value.trim();
            if (value) requirements.push(value);
        });
        return requirements;
    }
    
    validateRequest(request) {
        // Prüfe ob Zeichnung vorhanden
        if (!this.currentRect) {
            alert('Bitte erstellen Sie zuerst eine Zeichnung, die als SVG- und PDF-Anhang gesendet werden soll.');
            return false;
        }
        
        return true;
    }
    
    createFiverrRequest() {
        // Sammle Formular-Daten
        const plmCheckbox = document.getElementById('plm-upload-checkbox');
        const plmUpload = plmCheckbox ? plmCheckbox.checked : false;
        
        const request = {
            plmUpload: plmUpload
        };
        
        // Validiere
        if (!this.validateRequest(request)) {
            return;
        }
        
        // Generiere E-Mail-Text
        const emailText = this.generateEmailText(request);
        
        // Zeige Bestätigungs-Modal
        this.showEmailConfirmation(request, emailText);
    }
    
    generateEmailText(request) {
        let text = `Hallo,\n\n`;
        text += `bitte dieses Profil zeichnen und zur Kontrolle zurückschicken.\n\n`;
        text += `Ergänze einen Kontroll-Kasten "im PLM hochladen".\n\n`;
        
        // Wenn PLM-Upload aktiviert ist, ergänze den Text
        if (request.plmUpload) {
            text += `Die Zeichnung soll auch im System hochgeladen werden.\n\n`;
        }
        
        text += `Das Profil ist als SVG- und PDF-Datei angehängt.\n\n`;
        text += `Vielen Dank!`;
        
        return text;
    }
    
    showEmailConfirmation(request, emailText) {
        // Speichere Request für Tracking
        this.saveCustomRequestForTracking(request);
        
        // Zeige Bestätigungs-Modal
        if (this.emailTextPreview) {
            this.emailTextPreview.value = emailText;
        }
        
        if (this.emailConfirmationModal) {
            this.emailConfirmationModal.classList.remove('hidden');
        }
        
        // Schließe Request-Modal
        this.closeCustomRequestModal();
    }
    
    closeEmailConfirmationModal() {
        if (this.emailConfirmationModal) this.emailConfirmationModal.classList.add('hidden');
    }
    
    saveCustomRequestForTracking(request) {
        const tracking = {
            id: this.generateId ? this.generateId() : 'req_' + Date.now(),
            request: request,
            status: 'created',
            createdAt: new Date().toISOString()
        };
        
        // In localStorage speichern
        try {
            const existing = JSON.parse(localStorage.getItem('customRequests') || '[]');
            existing.push(tracking);
            localStorage.setItem('customRequests', JSON.stringify(existing));
        } catch (e) {
            console.warn('Konnte Custom-Request nicht speichern:', e);
        }
    }
    
    generateSVGForEmail() {
        if (!this.currentRect) return null;
        
        // Berechne Bounding Box (wie in exportToSVG)
        let minX = this.currentRect.x;
        let maxX = this.currentRect.x + this.currentRect.width;
        let minY = this.currentRect.y;
        let maxY = this.currentRect.y + this.currentRect.height;
        
        // Bohne berücksichtigen
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            minY = Math.min(minY, this.currentRect.y - bohneHeight);
        }
        
        // Bemaßungen berücksichtigen
        if (this.showDimensions) {
            const dimensionOffset = 60 * this.mmToPx;
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            const detailHeight = 80 * this.mmToPx;
            maxY += detailHeight;
        }
        
        // Titelblock berücksichtigen
        if (this.titleBlock && this.titleBlock.x != null) {
            maxX = Math.max(maxX, this.titleBlock.x + this.titleBlock.width);
            maxY = Math.max(maxY, this.titleBlock.y + this.titleBlock.height);
        }
        
        // Sicherheitsabstand
        const padding = 20 * this.mmToPx;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Erstelle SVG-Element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svg.setAttribute('width', `${totalWidth}px`);
        svg.setAttribute('height', `${totalHeight}px`);
        svg.setAttribute('viewBox', `${minX} ${minY} ${totalWidth} ${totalHeight}`);
        
        // Defs für Pfeile
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const arrowMarker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        arrowMarker.setAttribute('id', 'arrowhead');
        arrowMarker.setAttribute('markerWidth', '10');
        arrowMarker.setAttribute('markerHeight', '10');
        arrowMarker.setAttribute('refX', '9');
        arrowMarker.setAttribute('refY', '3');
        arrowMarker.setAttribute('orient', 'auto');
        const arrowPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        arrowPath.setAttribute('d', 'M0,0 L0,6 L9,3 z');
        arrowPath.setAttribute('fill', '#333');
        arrowMarker.appendChild(arrowPath);
        defs.appendChild(arrowMarker);
        svg.appendChild(defs);
        
        // Erstelle Gruppe für Zeichnung
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Zeichne Elemente als SVG
        this.drawToSVG(g);
        
        svg.appendChild(g);
        
        // Konvertiere zu String
        const serializer = new XMLSerializer();
        return serializer.serializeToString(svg);
    }
    
    async downloadSVGAndOpenEmail() {
        // Generiere SVG
        const svgString = this.generateSVGForEmail();
        if (!svgString) {
            alert('Fehler beim Generieren der SVG-Datei.');
            return;
        }
        
        // Download SVG
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const svgLink = document.createElement('a');
        svgLink.href = svgUrl;
        const dateStr = new Date().toISOString().slice(0,10);
        svgLink.download = `ProfilZeichner_${dateStr}.svg`;
        svgLink.click();
        URL.revokeObjectURL(svgUrl);
        
        // Warte kurz und generiere dann PDF
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Generiere und Download PDF
        try {
            await this.generatePDFForEmail(dateStr);
        } catch (error) {
            console.warn('PDF-Generierung fehlgeschlagen:', error);
            // Weiter mit E-Mail auch wenn PDF fehlschlägt
        }
        
        // Warte kurz damit Downloads starten
        setTimeout(() => {
            this.openEmail();
        }, 500);
    }
    
    async generatePDFForEmail(dateStr) {
        // Nutze die bestehende exportToPDF Logik, aber mit angepasstem Dateinamen
        if (!this.currentRect) return;
        
        // Speichere aktuelle Canvas-Einstellungen
        const originalZoom = this.zoom;
        const originalOffsetX = this.offsetX;
        const originalOffsetY = this.offsetY;
        
        // Berechne Bounding Box (wie in exportToPDF)
        let minX = this.currentRect.x;
        let maxX = this.currentRect.x + this.currentRect.width;
        let minY = this.currentRect.y;
        let maxY = this.currentRect.y + this.currentRect.height;
        
        // Bohne berücksichtigen
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            minY = Math.min(minY, this.currentRect.y - bohneHeight);
        }
        
        // Bemaßungen berücksichtigen
        if (this.showDimensions) {
            const dimensionOffset = 60 * this.mmToPx;
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            const rect = this.currentRect;
            const corner4Y = rect.y + rect.height;
            let detailStartY = corner4Y;
            
            if (this.showDimensions) {
                const dimensionOffset = 7 * this.mmToPx;
                let currentYOffset = 10 * this.mmToPx;
                
                const elementsUnten = [];
                this.kerben.forEach(kerbe => {
                    if (kerbe.position === 'unten') elementsUnten.push({ position: kerbe.distance });
                });
                this.ausschnitte.forEach(ausschnitt => {
                    if (ausschnitt.positionType === 'unten') elementsUnten.push({ position: ausschnitt.position });
                });
                
                currentYOffset += elementsUnten.length * dimensionOffset;
                detailStartY = corner4Y + currentYOffset + (10 * this.mmToPx);
            } else {
                detailStartY = corner4Y + (50 * this.mmToPx);
            }
            
            const detailHeight = 80 * this.mmToPx;
            maxY = Math.max(maxY, detailStartY + detailHeight);
        }
        
        // Titelblock berücksichtigen
        if (this.titleBlock && this.titleBlock.x != null) {
            maxX = Math.max(maxX, this.titleBlock.x + this.titleBlock.width);
            maxY = Math.max(maxY, this.titleBlock.y + this.titleBlock.height);
        }
        
        // Sicherheitsabstand
        const padding = 20 * this.mmToPx;
        minX -= padding;
        minY -= padding;
        maxX += padding;
        maxY += padding;
        
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Berechne Zoom für PDF
        const zoomX = (this.canvasWidth * 0.8) / totalWidth;
        const zoomY = (this.canvasHeight * 0.8) / totalHeight;
        this.zoom = Math.min(zoomX, zoomY);
        
        // Zentriere die Ansicht
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        this.offsetX = this.canvasWidth / 2 - centerX * this.zoom;
        this.offsetY = this.canvasHeight / 2 - centerY * this.zoom;
        
        // Zeichne für Screenshot
        this.draw();
        
        // Warte kurz damit alles gerendert ist
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Erstelle Screenshot vom Canvas
        const imgData = this.canvas.toDataURL('image/png', 1.0);
        
        // Stelle ursprünglichen Zustand wieder her
        this.zoom = originalZoom;
        this.offsetX = originalOffsetX;
        this.offsetY = originalOffsetY;
        this.draw();
        
        // Erstelle PDF mit jsPDF
        if (typeof window.jspdf !== 'undefined') {
            const { jsPDF } = window.jspdf;
            
            // Berechne PDF-Dimensionen in mm
            const contentWidthMm = totalWidth / this.mmToPx;
            const contentHeightMm = totalHeight / this.mmToPx;
            
            // A4 Dimensionen
            const a4Width = 210; // mm
            const a4Height = 297; // mm
            
            // Berechne Skalierung für A4
            const scale = Math.min(a4Width / contentWidthMm, a4Height / contentHeightMm);
            const pdfWidth = contentWidthMm * scale;
            const pdfHeight = contentHeightMm * scale;
            
            // Erstelle PDF
            const pdf = new jsPDF({
                orientation: pdfWidth > pdfHeight ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight]
            });
            
            // Füge Bild hinzu (skaliert)
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            
            // Download PDF
            pdf.save(`ProfilZeichner_${dateStr}.pdf`);
        } else {
            // Fallback: Nutze bestehende exportToPDF Funktion
            this.exportToPDF();
        }
    }
    
    openEmail() {
        // Sammle E-Mail-Daten
        const emailText = this.emailTextPreview ? this.emailTextPreview.value : '';
        const freelancerEmail = this.freelancerEmail ? this.freelancerEmail.value.trim() : '';
        
        // E-Mail-Text
        const subject = encodeURIComponent('Custom-Anforderung für ProfilZeichner Tool');
        const body = encodeURIComponent(emailText);
        
        // Mailto-Link
        let mailtoLink = `mailto:${freelancerEmail || ''}?subject=${subject}&body=${body}`;
        
        // Öffne E-Mail
        window.location.href = mailtoLink;
        
        // Schließe Modal nach kurzer Verzögerung
        setTimeout(() => {
            this.closeEmailConfirmationModal();
        }, 1000);
    }
    
    generateId() {
        return 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

// Globale Funktionen für HTML onclick
function removeAusschnittRow(element) {
    if (profilZeichner) {
        profilZeichner.removeAusschnittRow(element);
    }
}

function addRequirement() {
    const requirementsList = document.getElementById('requirements-list');
    if (!requirementsList) return;
    
    const count = requirementsList.querySelectorAll('.requirement-item').length + 1;
    const item = document.createElement('div');
    item.className = 'requirement-item flex gap-2 mb-2';
    item.innerHTML = `
        <input type="text" class="requirement-input flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Anforderung ${count}">
        <button type="button" class="btn-remove-requirement px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors" onclick="removeRequirement(this)">✕</button>
    `;
    requirementsList.appendChild(item);
}

function removeRequirement(button) {
    const item = button.closest('.requirement-item');
    if (item) {
        const requirementsList = document.getElementById('requirements-list');
        if (requirementsList && requirementsList.querySelectorAll('.requirement-item').length > 1) {
            item.remove();
        } else {
            alert('Mindestens eine Anforderung muss vorhanden sein.');
        }
    }
}

function downloadSVGAndOpenEmail() {
    if (profilZeichner) {
        profilZeichner.downloadSVGAndOpenEmail();
    }
}

function removeCrimpingRow(element) {
    if (profilZeichner) {
        profilZeichner.removeCrimpingRow(element);
    }
}

// App-Start
document.addEventListener('DOMContentLoaded', () => {
    const app = new ProfilZeichner();
    if (typeof app.initDatabase === 'function') {
        app.initDatabase();
    }
    window.profilZeichner = app;
});
