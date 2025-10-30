// ProfilZeichner Klasse
class ProfilZeichner {
    constructor() {
        // Versionsnummer - wird automatisch verwaltet
        this.version = '1.1.1';
        this.init();
    }
    
    // Zeichnungen-DB: Öffnen/Schließen
    openZeichnungenDb() {
        if (!this.zdb) this.zdb = { version: '1.0', projects: [] };
        this.zeichnungsdbModal.style.display = 'block';
        if (this.zdbFileInfo) {
            this.zdbFileInfo.textContent = this.zdbFileName ? this.zdbFileName : 'Keine Datei geladen';
        }
        this.zdbRender();
    }

    // =============== DXF Export (R12, Geometrie) ===============
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

        // Bohne (als horizontale Kapsel: 2 Linien + 2 Bögen)
        if (this.bohnen && this.bohnen.length > 0) {
            const b = this.bohnen[0];
            const R = (b.height * this.mmToPx) / 2;
            const bohneWidth = rect.width - (this.cutoutWidth ? this.cutoutWidth * this.mmToPx : 0);
            const bohneX = rect.x + (this.cutoutWidth ? this.cutoutWidth * this.mmToPx : 0);
            const bohneY = rect.y - (b.height * this.mmToPx);
            const leftCx = bohneX + R;
            const rightCx = bohneX + bohneWidth - R;
            const cy = bohneY + R;
            const topY = bohneY;
            const bottomY = bohneY + 2*R;
            // horizontale Geraden
            addLine(leftCx, topY, rightCx, topY, 'BOHNE');
            addLine(leftCx, bottomY, rightCx, bottomY, 'BOHNE');
            // linke Halbkreis-Bögen (oben->unten)
            addArc(leftCx, cy, R, 90, 270, 'BOHNE');
            // rechte Halbkreis-Bögen (unten->oben)
            addArc(rightCx, cy, R, 270, 90, 'BOHNE');
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
        const layers = ['PROFILE','CUTOUTS','KERBEN','LOECHER','NAHT','CRIMPING','TEXT','BOHNE'];
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
        if (this.zeichnungsdbModal) this.zeichnungsdbModal.style.display = 'none';
    }

    toggleZeichnungenDbMaximize() {
        if (!this.zeichnungsdbModal) return;
        this.zeichnungsdbModal.classList.add('maximized');
        const modalContent = this.zeichnungsdbModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.width = '100%';
            modalContent.style.maxWidth = '100%';
            modalContent.style.height = '100%';
            modalContent.style.maxHeight = '100%';
            modalContent.style.transform = 'none';
        }
    }

    restoreZeichnungenDbSize() {
        if (!this.zeichnungsdbModal) return;
        this.zeichnungsdbModal.classList.remove('maximized');
        const modalContent = this.zeichnungsdbModal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.width = '90%';
            modalContent.style.maxWidth = '1200px';
            modalContent.style.height = '';
            modalContent.style.maxHeight = '';
            modalContent.style.transform = '';
        }
    }

    // Zeichnungen-DB: Storage
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

    // Zeichnungen-DB: Render
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
            li.className = 'list-item-row';
            const left = document.createElement('div');
            left.textContent = p.name;
            const del = document.createElement('button');
            del.className = 'delete-btn-small';
            del.title = 'Projekt löschen';
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zdbDeleteProject(p.id);
            });
            if (this.zdbSelectedProjectId === p.id) li.classList.add('active');
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
            li.className = 'list-item-row';
            const left = document.createElement('div');
            left.textContent = v.name;
            const del = document.createElement('button');
            del.className = 'delete-btn-small';
            del.title = 'Variante löschen';
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zdbDeleteVariant(v.id);
            });
            if (this.zdbSelectedVariantId === v.id) li.classList.add('active');
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
            li.className = 'list-item-row';
            const left = document.createElement('div');
            left.textContent = ref.number;
            const del = document.createElement('button');
            del.className = 'delete-btn-small';
            del.title = 'Bezügenummer löschen';
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zdbDeleteReference(ref.id);
            });
            if (this.zdbSelectedReferenceId === ref.id) li.classList.add('active');
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
            card.className = 'profile-card';
            const del = document.createElement('button');
            del.className = 'delete-btn-small card-delete';
            del.title = 'Profil löschen';
            del.textContent = '×';
            del.addEventListener('click', (e) => {
                e.stopPropagation();
                this.zdbDeleteProfile(pr.id);
            });
            const img = document.createElement('img');
            img.src = pr.previewImage || '';
            const title = document.createElement('div');
            title.className = 'title';
            title.textContent = pr.name;
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = pr.supplierNumber ? `Lieferant: ${pr.supplierNumber}` : '—';
            card.appendChild(del);
            card.appendChild(img);
            card.appendChild(title);
            card.appendChild(meta);
            // Single-Click: visuelle Auswahl (optional)
            card.addEventListener('click', () => {
                // Auswahlzustand setzen
                Array.from(this.zdbProfileGrid.children).forEach(el => el.classList.remove('active'));
                card.classList.add('active');
            });
            // Doppelklick: sofort öffnen
            card.addEventListener('dblclick', () => this.zdbOpenProfile(pr));
            this.zdbProfileGrid.appendChild(card);
        });
    }

    // Löschfunktionen
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

    // Helpers
    zdbUuid() {
        return 'id-' + Math.random().toString(36).slice(2, 10);
    }

    // CRUD
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
            bohnen: JSON.parse(JSON.stringify(this.bohnen || [])),
            kerben: JSON.parse(JSON.stringify(this.kerben || [])),
            loecher: JSON.parse(JSON.stringify(this.loecher || [])),
            ausschnitte: JSON.parse(JSON.stringify(this.ausschnitte || [])),
            nahtlinie: this.nahtlinie ? { ...this.nahtlinie } : null,
            crimping: JSON.parse(JSON.stringify(this.crimping || [])),
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
        this.databaseButton = document.getElementById('database-button');
        this.zeichnungsdbButton = document.getElementById('zeichnungsdb-button');
        
        // Untere Button-Leiste
        this.autoZoomButton = document.getElementById('auto-zoom-button');
        this.panButton = document.getElementById('pan-button');
        this.pdfButton = document.getElementById('pdf-button');
        this.dxfButton = document.getElementById('dxf-button');
        
        
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
        this.canvasHeight = window.innerHeight - 80; // Abzug für Menüleiste
        this.zoom = 1;
        this.offsetX = this.canvasWidth / 2; // Koordinatensystem in der Mitte
        this.offsetY = this.canvasHeight / 2; // Koordinatensystem in der Mitte
        this.mmToPx = 96 / 25.4; // Standard 96 DPI
        
        // Zeichenzustand
        this.currentRect = null;
        this.bohnen = [];
        this.kerben = [];
        this.loecher = [];
        this.ausschnitte = [];
        this.crimping = [];
        this.nahtlinie = null;
        this.texts = [];
        this.showDimensions = false;
        this.selectedFormat = 'a4';
        this.showFormatBorder = false;
        this.loadedProfileSkizze = null;
        this.loadedSkizzeImage = null;
        this.skizzeX = null; // Position der Skizze (X)
        this.skizzeY = null; // Position der Skizze (Y)
        this.skizzeWidth = 40 * this.mmToPx; // Standard-Breite der Skizze
        this.skizzeHeight = 30 * this.mmToPx; // Standard-Höhe der Skizze
        
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
        
        // Skizze-Drag-and-Resize
        this.draggedSkizze = false;
        this.skizzeDragOffset = { x: 0, y: 0 };
        this.resizingSkizze = false;
        this.resizeHandle = null; // 'nw', 'ne', 'sw', 'se' für die Ecken
        this.resizeStartPos = { x: 0, y: 0 };
        this.resizeStartSize = { width: 0, height: 0 };
        this.resizeStartPosSkizze = { x: 0, y: 0 };
        this.hoveredSkizze = false;
        
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
        this.maxHistorySize = 50; // Maximale Anzahl von Undo-Schritten
        
        
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
    
    setupEventListeners() {
        // Canvas Event Listeners
        this.canvas.addEventListener('dblclick', (e) => this.handleCanvasDoubleClick(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
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
        this.databaseButton.addEventListener('click', () => this.openDatabaseModal());
        if (this.zeichnungsdbButton) {
            this.zeichnungsdbButton.addEventListener('click', () => this.openZeichnungenDb());
        }

        // Zeichnungen-DB Events
        if (this.zeichnungsdbModalClose) this.zeichnungsdbModalClose.addEventListener('click', () => this.closeZeichnungenDb());
        if (this.zeichnungsdbClose) this.zeichnungsdbClose.addEventListener('click', () => this.closeZeichnungenDb());
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
        if (this.pdfButton) this.pdfButton.addEventListener('click', () => this.exportToPDF());
        if (this.dxfButton) this.dxfButton.addEventListener('click', () => this.exportToDXF());
        
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
        if (this.draggedText || this.draggedSkizze || this.resizingSkizze || this.draggedKerbe) {
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
        
        // Prüfe ob auf Kerbe geklickt wurde
        if (this.currentRect && this.kerben.length > 0) {
            for (let i = this.kerben.length - 1; i >= 0; i--) {
                const kerbe = this.kerben[i];
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const depthPx = kerbe.depth * this.mmToPx;
                
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
                const hitboxSize = 15;
                if (kerbe.position === 'oben') {
                    // Kerbe oben - Hitbox geht von Kerbe nach unten
                    if (mouseX >= screenX - screenWidth/2 - hitboxSize && mouseX <= screenX + screenWidth/2 + hitboxSize &&
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
                    if (mouseX >= screenX - screenWidth/2 - hitboxSize && mouseX <= screenX + screenWidth/2 + hitboxSize &&
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
            
        if (this.resizingSkizze) {
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
                newDistance = Math.round(newDistance / 5) * 5;
                newDistance = Math.max(0, Math.min(maxDistance, newDistance)); // Nochmal begrenzen nach Runden
                
                this.draggedKerbe.distance = newDistance;
            }
            
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
            
            // Hover-Tracking für Kerben
            if (this.currentRect && this.kerben.length > 0 && !this.draggedKerbe) {
                let foundKerbeHover = false;
                
                for (let i = this.kerben.length - 1; i >= 0; i--) {
                    const kerbe = this.kerben[i];
                    const distancePx = kerbe.distance * this.mmToPx;
                    const widthPx = kerbe.width * this.mmToPx;
                    const depthPx = kerbe.depth * this.mmToPx;
                    
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
                    const hitboxSize = 15;
                    if (kerbe.position === 'oben') {
                        // Kerbe oben - Hitbox geht von Kerbe nach unten
                        if (mouseX >= screenX - screenWidth/2 - hitboxSize && mouseX <= screenX + screenWidth/2 + hitboxSize &&
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
                        if (mouseX >= screenX - screenWidth/2 - hitboxSize && mouseX <= screenX + screenWidth/2 + hitboxSize &&
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
        }
    }
    
    handleMouseUp(e) {
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
        
        if (this.draggedKerbe) {
            // Speichere State nach Verschiebung
            this.saveState();
            
            // Aktualisiere Tabelle im Modal, wenn es geöffnet ist
            // keepUserInputs = false, damit die neuen Positionen aus this.kerben angezeigt werden
            if (this.kerbeModal && this.kerbeModal.style.display === 'block') {
                this.refreshKerbeTable(false);
            }
            
            this.draggedKerbe = null;
            this.kerbeDragOffset = { x: 0, y: 0 };
            this.hoveredKerbe = null; // Reset hover beim Loslassen
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
    }
    
    resizeCanvas() {
        this.canvasWidth = window.innerWidth;
        this.canvasHeight = window.innerHeight - 80;
        
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
        
        // Positioniere das Rechteck so dass es bei x=0 startet (für korrekte Bemaßungen)
        this.currentRect = {
            x: 0, // Start bei x=0 für korrekte Bemaßungen
            y: -heightPx / 2, // Zentriert in Y-Richtung
            width: widthPx,
            height: heightPx,
            scale: 1
        };
        
        this.updateZoomLevel();
        this.draw();
        this.autoZoom();
    }
    
    clearCanvas() {
        this.saveState(); // Speichere Zustand vor dem Löschen
        this.currentRect = null;
        this.bohnen = [];
        this.kerben = [];
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
        this.draw();
    }
    
    // Speichert den aktuellen Zustand in die History
    saveState() {
        const state = {
            currentRect: this.currentRect ? { ...this.currentRect } : null,
            bohnen: JSON.parse(JSON.stringify(this.bohnen)),
            kerben: JSON.parse(JSON.stringify(this.kerben)),
            loecher: JSON.parse(JSON.stringify(this.loecher)),
            ausschnitte: JSON.parse(JSON.stringify(this.ausschnitte)),
            crimping: JSON.parse(JSON.stringify(this.crimping)),
            nahtlinie: this.nahtlinie ? { ...this.nahtlinie } : null,
            texts: JSON.parse(JSON.stringify(this.texts)),
            showDimensions: this.showDimensions,
            showFormatBorder: this.showFormatBorder,
            zoom: this.zoom,
            offsetX: this.offsetX,
            offsetY: this.offsetY,
            skizzeX: this.skizzeX,
            skizzeY: this.skizzeY,
            skizzeWidth: this.skizzeWidth,
            skizzeHeight: this.skizzeHeight
        };
        
        // Lösche alle Zustände nach dem aktuellen Index (wenn wir nach einem Undo neue Aktionen machen)
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        // Füge neuen Zustand hinzu
        this.history.push(state);
        this.historyIndex++;
        
        // Begrenze die History-Größe
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
            this.historyIndex--;
        }
        
        this.updateUndoRedoButtons();
    }
    
    // Stellt einen gespeicherten Zustand wieder her
    restoreState(state) {
        this.currentRect = state && state.currentRect ? { ...state.currentRect } : null;
        this.bohnen = state && state.bohnen ? JSON.parse(JSON.stringify(state.bohnen)) : [];
        this.kerben = state && state.kerben ? JSON.parse(JSON.stringify(state.kerben)) : [];
        this.loecher = state && state.loecher ? JSON.parse(JSON.stringify(state.loecher)) : [];
        this.ausschnitte = state && state.ausschnitte ? JSON.parse(JSON.stringify(state.ausschnitte)) : [];
        this.crimping = state && state.crimping ? JSON.parse(JSON.stringify(state.crimping)) : [];
        this.nahtlinie = state && state.nahtlinie ? { ...state.nahtlinie } : null;
        this.texts = state && state.texts ? JSON.parse(JSON.stringify(state.texts)) : [];
        this.showDimensions = state && typeof state.showDimensions === 'boolean' ? state.showDimensions : this.showDimensions || false;
        this.showFormatBorder = state && typeof state.showFormatBorder === 'boolean' ? state.showFormatBorder : false;
        this.zoom = state && typeof state.zoom === 'number' ? state.zoom : this.zoom || 1;
        this.offsetX = state && typeof state.offsetX === 'number' ? state.offsetX : this.offsetX || (this.canvasWidth / 2);
        this.offsetY = state && typeof state.offsetY === 'number' ? state.offsetY : this.offsetY || (this.canvasHeight / 2);
        this.skizzeX = state.skizzeX !== undefined ? state.skizzeX : null;
        this.skizzeY = state.skizzeY !== undefined ? state.skizzeY : null;
        this.skizzeWidth = state.skizzeWidth !== undefined ? state.skizzeWidth : (40 * this.mmToPx);
        this.skizzeHeight = state.skizzeHeight !== undefined ? state.skizzeHeight : (30 * this.mmToPx);
        
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
            
            // Zeichne Bemaßungen
            if (this.showDimensions) {
                this.drawDimensions();
            }
            
            // Zeichne Detail-Indikatoren
            this.drawDetailIndicators();
        }
        
        // Zeichne Texte am Ende (immer im Vordergrund)
        this.drawTexts();
        
        this.ctx.restore();
        
        // Zeichne Format-Rand (außerhalb der Transformation)
        this.drawFormatBorder();
    }
    
    drawGrid() {
        // Immer weißer Hintergrund
        this.ctx.fillStyle = '#ffffff';
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
            const widthPx = kerbe.width * this.mmToPx;
            const depthPx = kerbe.depth * this.mmToPx;
            const type = kerbe.type || 'triangle'; // Standard: Dreieck
            
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
            const positionPx = loch.position * this.mmToPx;
            
            const lochX = rect.x + distancePx;
            // Position ist Abstand von oben (Standard 2mm)
            // lochY ist Mittelpunkt des Lochs
            const lochY = rect.y + positionPx + (heightPx / 2);
            
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
    
    drawDimensions() {
        if (!this.currentRect) return;
        
        const rect = this.currentRect;
        const dimensionOffset = 7 * this.mmToPx; // 7mm Abstand zwischen Linien
        let currentYOffset = 10 * this.mmToPx; // Erste Linie bei +10mm (unter Ecke 4)
        
        // Stil für Bemaßungen
        this.ctx.strokeStyle = '#333';
        this.ctx.fillStyle = '#333';
        this.ctx.lineWidth = 1;
        this.ctx.font = `${12}px Arial`;
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
            (el.type === 'ausschnitt' && el.positionType === 'oben') ||
            el.type === 'loch' ||
            el.type === 'crimping'
        );
        const elementsUnten = allElements.filter(el => 
            el.type === 'kerbe' ||
            (el.type === 'ausschnitt' && el.positionType === 'unten')
        );
        
        // Bemaßung oberhalb des Profils (Löcher + Ausschnitte oben)
        let obenOffset = 0;
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
                const dimensionY = obenDimensionY - obenOffset;
                
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
        elementsUnten.forEach((element, index) => {
            const positionPx = element.position * this.mmToPx;
            const dimensionY = corner4Y + currentYOffset;
            
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
        
        // Höhenbemaßungen als Kettenbemaßung (nebeneinander)
        if (this.bohnen.length > 0) {
            const bohne = this.bohnen[0];
            const bohneHeight = bohne.height * this.mmToPx;
            
            // Teil 1: Bohne-Höhe (von Bohne-Oberkante bis Profil-Oberkante)
            const bohneTopY = rect.y - bohneHeight;
            this.drawVerticalDimensionFromZero(
                bohneTopY, // Start oben bei der Bohne
                rightDimensionX,
                rect.y, // Ende oben beim Profil
                rightDimensionX,
                `${bohne.height}mm` // Bohne-Höhe anzeigen
            );
            
            rightDimensionX += rightDimensionSpacing; // Nächste Bemaßung
            
            // Teil 2: Profil-Höhe (von Profil-Oberkante bis Profil-Unterkante)
            this.drawVerticalDimensionFromZero(
                rect.y, // Start oben beim Profil
                rightDimensionX,
                rect.y + rect.height, // Ende unten beim Profil
                rightDimensionX,
                `${(rect.height / this.mmToPx).toFixed(1)}mm` // Profil-Höhe anzeigen
            );
        } else {
            // Nur Gesamthöhe (wenn keine Bohne)
            this.drawVerticalDimensionFromZero(
                rect.y, // Start oben beim Profil
                rightDimensionX,
                rect.y + rect.height, // Ende unten beim Profil
                rightDimensionX,
                `${(rect.height / this.mmToPx).toFixed(1)}mm` // Gesamthöhe anzeigen
            );
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
            
            this.drawHorizontalDimensionFromZero(
                    rect.x, // Start bei Ecke 4 (oben links)
                    cutoutDimY,
                    cutoutX1, // Ende bei Cutout-Stelle links
                    cutoutDimY,
                    `${this.cutoutWidth}mm`
                );
            }
            
            // Cutout-Höhe bemaßen (von unten bis Cutout-Höhe, rechts)
            if (this.cutoutHeight > 0) {
                const cutoutBottomY = rect.y + rect.height; // Unten beim Profil
                const cutoutTopY = cutoutBottomY - cutoutHeightPx; // Cutout-Höhe nach oben
                
            this.drawVerticalDimensionFromZero(
                    cutoutTopY, // Start oben bei Cutout-Höhe
                rightDimensionX,
                    cutoutBottomY, // Ende unten beim Profil
                rightDimensionX,
                    `${this.cutoutHeight}mm`
            );
            
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
        const totalWidthY = corner4Y + currentYOffset + (elementsUnten.length * dimensionOffset) + (this.nahtlinie && this.nahtlinie.distance > 0 ? dimensionOffset : 0);
        this.drawHorizontalDimensionFromZero(
            corner4X,
            totalWidthY,
            rect.x + rect.width,
            totalWidthY,
            `${(rect.width / this.mmToPx).toFixed(1)}mm`
        );
        
        // Beschriftungsfeld wird nicht mehr automatisch bei Bemaßungen gezeichnet
        // Es wird nur noch als verschiebbares Element angezeigt, wenn es hinzugefügt wurde
        
        // Detailzeichnungen
        const startY = totalWidthY + (40 * this.mmToPx); // 40mm unter der letzten Bemaßungslinie für mehr Abstand
        this.drawDetailDrawings(rect, startY);
    }
    
    
    drawHorizontalDimensionFromZero(startX, y, endX, dimensionY, text) {
        const arrowSize = 6;
        const lineWidth = 0.5; // Dünnere Linie
        
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
            this.ctx.strokeStyle = '#0066cc'; // Blau
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
        const arrowSize = 6;
        const lineWidth = 0.5; // Dünnere Linie
        
        // Berechne den Abstand der Bemaßungslinie vom Profil
        const rect = this.currentRect;
        const dimDistance = Math.abs(x - (rect ? (rect.x + rect.width) : x)); // Abstand von der rechten Kante
        
        let elementRightX = rect ? (rect.x + rect.width) : x; // Standard: Rechte Kante des Profils
        
        // Gestrichelte Hilfslinien zum Element (an den Enden der Bemaßungslinie) - BLAU
        if (rect) {
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = '#0066cc'; // Blau
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
            const type = kerbe.type || 'triangle'; // Standard: Dreieck
            
            // Nur Detail-Indikator bei Dreieck-Kerben (nicht bei Strich-Markierung)
            if (type === 'triangle') {
                const distancePx = kerbe.distance * this.mmToPx;
                const widthPx = kerbe.width * this.mmToPx;
                const depthPx = kerbe.depth * this.mmToPx;
                
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
            const positionPx = loch.position * this.mmToPx;
            
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
        
        // Kerbe Detailzeichnung
        if (this.kerben.length > 0) {
            const kerbe = this.kerben[0]; // Erste Kerbe als Beispiel
            const type = kerbe.type || 'triangle'; // Standard: Dreieck
            const kerbeWidth = kerbe.width * this.mmToPx * scale;
            const kerbeDepth = kerbe.depth * this.mmToPx * scale;
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
                this.ctx.fillText(`${kerbe.depth}mm`, currentX + 15, startY + kerbeDepth/2 + 15);
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
                this.ctx.fillText(`${kerbe.width}mm`, currentX + kerbeWidth/2, startY + kerbeDepth/2 + 25);
                
                // Bemaßung für Tiefe - seitlich mit Pfeillinien
                this.drawDetailDimensionLine(
                    currentX + kerbeWidth + 15, // Start rechts
                    currentX + kerbeWidth + 15, // Ende rechts
                    startY - kerbeDepth/2, // Y1 oben
                    startY + kerbeDepth/2, // Y2 unten
                    startY // Label position
                );
                this.ctx.fillStyle = '#555';
                this.ctx.fillText(`${kerbe.depth}mm`, currentX + kerbeWidth + 25, startY);
            }
            
            currentX += Math.max(kerbeWidth, 10) + detailSpacing; // Minimum Breite für Strich
        }
        
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
                this.panButton.style.backgroundColor = '#28a745'; // Grün
                this.panButton.style.color = 'white';
            } else {
                this.panButton.style.backgroundColor = '#f8f9fa'; // Standard
                this.panButton.style.color = '#495057';
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
        if (this.showDimensions) {
            this.bemaßungButton.style.backgroundColor = '#28a745'; // Grün wenn aktiv
        } else {
            this.bemaßungButton.style.backgroundColor = '#6c757d'; // Grau wenn inaktiv
        }
    }
    
    exportToPDF() {
        if (!this.currentRect) {
            alert('Bitte erst ein Profil zeichnen!');
            return;
        }
        
        // Speichere aktuelle Canvas-Einstellungen
        const originalZoom = this.zoom;
        const originalOffsetX = this.offsetX;
        const originalOffsetY = this.offsetY;
        
        // Verwende autoZoom-Logik für korrekte Bounding Box-Berechnung
        // Berechne die Gesamtausdehnung aller Elemente (wie in autoZoom)
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
        
        // Bemaßungen berücksichtigen (mit größerem Offset für Sicherheit)
        if (this.showDimensions) {
            const dimensionOffset = 60 * this.mmToPx; // Mehr Platz für Bemaßungen
            minY -= dimensionOffset;
            maxY += dimensionOffset;
            minX -= dimensionOffset;
            maxX += dimensionOffset;
        }
        
        // Detailzeichnungen berücksichtigen
        // Berechne tatsächliche Position der Detailzeichnungen basierend auf Bemaßungen
        if (this.kerben.length > 0 || this.loecher.length > 0) {
            // Berechne wo die Detailzeichnungen tatsächlich starten
            const rect = this.currentRect;
            const corner4Y = rect.y + rect.height;
            let detailStartY = corner4Y;
            
            // Wenn Bemaßungen aktiv sind, Detailzeichnungen nach den Bemaßungen
            if (this.showDimensions) {
                const dimensionOffset = 7 * this.mmToPx;
                let currentYOffset = 10 * this.mmToPx;
                
                // Zähle Bemaßungen unten
                const elementsUnten = [];
                this.kerben.forEach(kerbe => elementsUnten.push({ position: kerbe.distance }));
                this.ausschnitte.forEach(ausschnitt => {
                    if (ausschnitt.positionType === 'unten') {
                        elementsUnten.push({ position: ausschnitt.position });
                    }
                });
                
                currentYOffset += elementsUnten.length * dimensionOffset;
                if (this.nahtlinie && this.nahtlinie.distance > 0) {
                    currentYOffset += dimensionOffset;
                }
                
                const totalWidthY = corner4Y + currentYOffset;
                detailStartY = totalWidthY + (40 * this.mmToPx); // 40mm unter der letzten Bemaßung
            } else {
                detailStartY = corner4Y + (50 * this.mmToPx); // 50mm unter dem Profil
            }
            
            // Detailzeichnungen sind etwa 80-100mm hoch
            const detailHeight = 100 * this.mmToPx;
            maxY = Math.max(maxY, detailStartY + detailHeight);
        }
        
        // Skizze berücksichtigen
        if (this.loadedProfileSkizze && this.skizzeX !== null && this.skizzeY !== null) {
            minX = Math.min(minX, this.skizzeX - 10);
            maxX = Math.max(maxX, this.skizzeX + this.skizzeWidth + 10);
            minY = Math.min(minY, this.skizzeY - 10);
            maxY = Math.max(maxY, this.skizzeY + this.skizzeHeight + 10);
        }
        
        // Texte berücksichtigen
        this.texts.forEach(text => {
            const textWidth = this.ctx.measureText(text.content).width;
            const textHeight = parseInt(text.size);
            minX = Math.min(minX, text.x - 15);
            maxX = Math.max(maxX, text.x + textWidth + 15);
            minY = Math.min(minY, text.y - textHeight - 15);
            maxY = Math.max(maxY, text.y + 15);
        });
        
        // Zusätzlicher Sicherheitsrand
        const safetyMargin = 20 * this.mmToPx;
        minX -= safetyMargin;
        maxX += safetyMargin;
        minY -= safetyMargin;
        maxY += safetyMargin;
        
        // Berechne die tatsächliche Größe des Zeichnungsinhalts
        const contentWidth = maxX - minX;
        const contentHeight = maxY - minY;
        
        // A4 Format-Dimensionen in mm (Querformat)
        const a4Width = 297; // mm
        const a4Height = 210; // mm
        const margin = 5; // mm Rand
        const usableWidth = a4Width - (2 * margin);
        const usableHeight = a4Height - (2 * margin);
        
        // Berechne Skalierung (in mm)
        const contentWidthMm = contentWidth / this.mmToPx;
        const contentHeightMm = contentHeight / this.mmToPx;
        
        const scaleX = usableWidth / contentWidthMm;
        const scaleY = usableHeight / contentHeightMm;
        const scale = Math.min(scaleX, scaleY);
        
        // Verwende autoZoom-Logik um alles korrekt zu positionieren
        const totalWidth = maxX - minX;
        const totalHeight = maxY - minY;
        
        // Berechne optimalen Zoom (ähnlich wie autoZoom)
        const zoomX = (this.canvasWidth * 0.8) / totalWidth;
        const zoomY = (this.canvasHeight * 0.8) / totalHeight;
        const optimalZoom = Math.min(zoomX, zoomY);
        
        // Zentriere die Ansicht
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        
        // Setze temporäre Zoom/Offset für PDF
        this.zoom = optimalZoom;
        this.offsetX = this.canvasWidth / 2 - centerX * this.zoom;
        this.offsetY = this.canvasHeight / 2 - centerY * this.zoom;
        
        // Zeichne auf den normalen Canvas
        this.draw();
        
        // Screenshot des gesamten Canvas mit hoher Auflösung
        const scaleFactor = 3; // Hohe Auflösung für PDF
        
        // Erstelle temporäres Canvas für hohe Auflösung - verwende gesamten Canvas
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = this.canvasWidth * scaleFactor;
        tempCanvas.height = this.canvasHeight * scaleFactor;
        
        // Kopiere den gesamten Canvas-Inhalt auf hohe Auflösung
        tempCtx.drawImage(
            this.canvas,
            0, 0, this.canvasWidth, this.canvasHeight,
            0, 0, tempCanvas.width, tempCanvas.height
        );
        
        // Verwende tempCanvas für PDF
        const imgData = tempCanvas.toDataURL('image/png', 1.0);
        
        // Erstelle PDF mit jsPDF - A4 Querformat
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4'
        });
        
        // Berechne die sichtbare Welt-Koordinaten-Region auf dem Canvas
        // Der Canvas zeigt den gesamten Bereich von minX bis maxX (dank optimalZoom)
        const visibleWorldWidth = this.canvasWidth / this.zoom;
        const visibleWorldHeight = this.canvasHeight / this.zoom;
        
        // Verwende den gesamten sichtbaren Bereich für PDF
        const finalWidthMm = visibleWorldWidth / this.mmToPx;
        const finalHeightMm = visibleWorldHeight / this.mmToPx;
        
        // Skaliere für A4
        const scaleX2 = usableWidth / finalWidthMm;
        const scaleY2 = usableHeight / finalHeightMm;
        const finalScale = Math.min(scaleX2, scaleY2);
        
        const finalWidth = finalWidthMm * finalScale;
        const finalHeight = finalHeightMm * finalScale;
        
        // Zentriere auf A4
        const xOffset = (a4Width - finalWidth) / 2;
        const yOffset = (a4Height - finalHeight) / 2;
        
        // Füge Bild zum PDF hinzu
        pdf.addImage(imgData, 'PNG', xOffset, yOffset, finalWidth, finalHeight);
        
        // Speichere PDF
        const fileName = `ProfilZeichner_A4_${new Date().toISOString().slice(0,10)}.pdf`;
        pdf.save(fileName);
        
        // Stelle ursprüngliche Einstellungen wieder her
        this.zoom = originalZoom;
        this.offsetX = originalOffsetX;
        this.offsetY = originalOffsetY;
        this.draw();
        
        alert('PDF wurde als A4-Format exportiert!');
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
        this.bohneModal.style.display = 'block';
    }
    
    closeBohneModal() {
        this.bohneModal.style.display = 'none';
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
        this.cutoutModal.style.display = 'block';
    }
    
    closeCutoutModal() {
        this.cutoutModal.style.display = 'none';
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
        // Aktualisiere die Tabelle mit den aktuellen Werten aus this.kerben
        // (inklusive verschobene Positionen)
        this.kerbeModal.style.display = 'block';
        this.refreshKerbeTable(true);
    }
    
    closeKerbeModal() {
        this.kerbeModal.style.display = 'none';
    }
    
    refreshKerbeTable(keepUserInputs = false) {
        if (!this.kerbeTbody) return;
        
        // Lese zuerst die aktuellen Werte aus der Tabelle, falls Modal bereits geöffnet war
        // UND wir die Benutzereingaben beibehalten wollen (nicht nach Verschiebung)
        // WICHTIG: Die Position (distance) wird IMMER aus this.kerben genommen, nicht aus der Tabelle!
        // Nur Typ und Position (oben/unten) werden aus der Tabelle übernommen, wenn keepUserInputs = true
        const existingRows = this.kerbeTbody.querySelectorAll('tr');
        if (keepUserInputs && existingRows.length > 0 && this.kerbeModal.style.display === 'block') {
            // Finde die aktuelle Kerbe anhand der Position (da die Tabelle sortiert ist)
            existingRows.forEach((row) => {
                const distanceInput = row.querySelector('.kerbe-distance-input');
                const typeSelect = row.querySelector('.kerbe-type-select');
                const positionSelect = row.querySelector('.kerbe-position-select');
                
                if (distanceInput) {
                    const tableDistance = parseFloat(distanceInput.value);
                    if (!isNaN(tableDistance)) {
                        // Finde die Kerbe in this.kerben anhand der Position (mit Toleranz wegen Rundung)
                        const matchingKerbe = this.kerben.find(kerbe => 
                            Math.abs(kerbe.distance - tableDistance) < 0.1
                        );
                        
                        if (matchingKerbe) {
                            // Nur Typ und Position (oben/unten) aus Tabelle übernehmen
                            // Die distance wird NICHT überschrieben, da sie möglicherweise verschoben wurde!
                            if (typeSelect) {
                                matchingKerbe.type = typeSelect.value;
                            }
                            if (positionSelect) {
                                matchingKerbe.position = positionSelect.value;
                            }
                        }
                    }
                }
            });
        }
        
        this.kerbeTbody.innerHTML = '';
        
        // Hole den Standard-Typ aus dem oberen Dropdown
        const defaultType = this.kerbeTypeSelect ? this.kerbeTypeSelect.value : 'triangle';
        
        // Zeige immer die aktuellen Werte aus this.kerben an (inklusive verschobene Positionen)
        // Sortiere Kerben nach Position für Anzeige, aber behalte Original-Index
        const sortedKerben = this.kerben.map((kerbe, originalIndex) => ({ kerbe, originalIndex }))
            .sort((a, b) => a.kerbe.distance - b.kerbe.distance);
        
        sortedKerben.forEach((item, displayIndex) => {
            const kerbe = item.kerbe;
            const originalIndex = item.originalIndex;
            const row = document.createElement('tr');
            const currentType = kerbe.type || defaultType;
            row.innerHTML = `
                <td>
                    <select class="kerbe-type-select">
                        <option value="triangle" ${currentType === 'triangle' ? 'selected' : ''}>Dreieck</option>
                        <option value="marker" ${currentType === 'marker' ? 'selected' : ''}>Strichmarkierung</option>
                    </select>
                </td>
                <td><input type="number" value="${kerbe.distance}" min="0" step="5" class="kerbe-distance-input"></td>
                <td>
                    <select class="kerbe-position-select">
                        <option value="oben" ${kerbe.position === 'oben' ? 'selected' : ''}>Oben</option>
                        <option value="unten" ${kerbe.position === 'unten' ? 'selected' : ''}>Unten</option>
                    </select>
                </td>
                <td><button class="remove-kerbe-btn" onclick="profilZeichner.removeKerbeRow(${originalIndex})">Entfernen</button></td>
            `;
            this.kerbeTbody.appendChild(row);
        });
    }
    
    addKerbeRow() {
        // Berechne automatisch eine Position (Mitte des Profils oder nach der letzten Kerbe)
        let suggestedDistance = 0;
        
        if (this.currentRect && this.currentRect.width) {
            // Profil-Länge in mm berechnen
            const profileLengthMm = this.currentRect.width / this.mmToPx;
            // Exakt die Hälfte, auf 1 Dezimalstelle gerundet
            suggestedDistance = Math.round((profileLengthMm / 2) * 10) / 10;
        } else if (this.kerben.length > 0) {
            // Falls schon Kerben existieren, nimm den letzten Wert + 20mm
            const lastDistance = this.kerben[this.kerben.length - 1].distance;
            suggestedDistance = lastDistance + 20;
        }
        
        // Neue Kerbe mit Vorschlag hinzufügen
        const depth = parseFloat(this.kerbeDepthInput.value) || 4;
        const width = parseFloat(this.kerbeWidthInput.value) || 6;
        
        // Typ aus dem oberen Dropdown übernehmen
        const defaultType = this.kerbeTypeSelect ? this.kerbeTypeSelect.value : 'triangle';
        
        this.kerben.push({
            distance: suggestedDistance,
            position: 'unten',
            depth: depth,
            width: width,
            type: defaultType
        });
        
        this.refreshKerbeTable(true);
    }
    
    removeKerbeRow(index) {
        this.kerben.splice(index, 1);
        this.refreshKerbeTable(true);
    }
    
    updateKerbeTypeDisplay() {
        const type = this.kerbeTypeSelect.value;
        
        if (type === 'marker') {
            // Bei Strich-Markierung: Breite ausblenden
            this.kerbeWidthGroup.style.display = 'none';
            // Label ändern
            document.querySelector('label[for="kerbe-depth"]').textContent = 'Höhe:';
            document.querySelector('label[for="kerbe-width"]').textContent = 'Breite:';
        } else {
            // Bei Dreieck: Breite anzeigen
            this.kerbeWidthGroup.style.display = 'block';
            // Label ändern
            document.querySelector('label[for="kerbe-depth"]').textContent = 'Tiefe:';
            document.querySelector('label[for="kerbe-width"]').textContent = 'Breite:';
        }
    }
    
    confirmKerbe() {
        this.saveState(); // Speichere Zustand vor dem Hinzufügen
        
        // Aktualisiere Kerben-Daten aus der Tabelle
        const rows = this.kerbeTbody.querySelectorAll('tr');
        this.kerben = [];
        
        rows.forEach(row => {
            const typeSelect = row.querySelector('.kerbe-type-select');
            const distanceInput = row.querySelector('.kerbe-distance-input');
            const positionSelect = row.querySelector('.kerbe-position-select');
            
            if (distanceInput && positionSelect && typeSelect) {
                const distance = parseFloat(distanceInput.value);
                const position = positionSelect.value;
                const type = typeSelect.value; // Typ aus jeder Zeile einzeln lesen
                const depth = parseFloat(this.kerbeDepthInput.value) || 4;
                const width = parseFloat(this.kerbeWidthInput.value) || 6;
                
                if (!isNaN(distance) && distance >= 0) {
                    this.kerben.push({
                        distance: distance,
                        position: position,
                        depth: depth,
                        width: width,
                        type: type // Typ aus der Zeile übernehmen
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
        this.nahtlinieModal.style.display = 'block';
    }
    
    closeNahtlinieModal() {
        this.nahtlinieModal.style.display = 'none';
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
            this.lochKerbenCheckboxGroup.style.display = 'block';
        } else {
            this.lochKerbenCheckboxGroup.style.display = 'none';
            this.lochUseKerbenPositionsCheckbox.checked = false;
        }
        
        this.lochModal.style.display = 'block';
        this.refreshLochTable();
    }
    
    closeLochModal() {
        this.lochModal.style.display = 'none';
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
            row.innerHTML = `
                <td><input type="number" value="${loch.distance}" min="0" step="0.1" class="loch-distance-input"></td>
                <td><button class="remove-loch-btn" onclick="profilZeichner.removeLochRow(${index})">Entfernen</button></td>
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
        this.ausschnittModal.style.display = 'block';
        this.refreshAusschnittTable();
    }
    
    closeAusschnittModal() {
        this.ausschnittModal.style.display = 'none';
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
        row.innerHTML = `
            <td><input type="number" class="ausschnitt-position-input" placeholder="0" step="0.1"></td>
            <td><input type="number" class="ausschnitt-length-input" placeholder="0" step="0.1"></td>
            <td><input type="number" class="ausschnitt-height-input" placeholder="0" step="0.1"></td>
            <td>
                <select class="ausschnitt-position-select">
                    <option value="oben">Oben</option>
                    <option value="unten">Unten</option>
                </select>
            </td>
            <td><button class="remove-row-btn" onclick="removeAusschnittRow(this)">✕</button></td>
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
                this.crimpingNoBohneWarning.style.display = 'block';
            }
            // Modal trotzdem öffnen, aber Button deaktivieren?
        } else {
            if (this.crimpingNoBohneWarning) {
                this.crimpingNoBohneWarning.style.display = 'none';
            }
        }
        
        this.crimpingModal.style.display = 'block';
        this.refreshCrimpingTable();
    }
    
    closeCrimpingModal() {
        this.crimpingModal.style.display = 'none';
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
        row.innerHTML = `
            <td><input type="number" class="crimping-position-input" placeholder="0" step="0.1"></td>
            <td><input type="number" class="crimping-length-input" placeholder="0" step="0.1"></td>
            <td><button class="remove-row-btn" onclick="removeCrimpingRow(this)">✕</button></td>
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
        this.textModal.style.display = 'block';
    }
    
    closeTextModal() {
        this.textModal.style.display = 'none';
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
        this.databaseModalClose.addEventListener('click', () => this.closeDatabaseModal());
        this.databaseModalMinimize.addEventListener('click', () => this.minimizeDatabaseModal());
        this.databaseModalMaximize.addEventListener('click', () => this.toggleMaximizeDatabaseModal());
        this.databaseCancelButton.addEventListener('click', () => this.closeDatabaseModal());
        this.databaseSaveButton.addEventListener('click', () => this.saveDatabase());
        this.addProfileButton.addEventListener('click', () => this.addNewProfile());
        this.loadProfileButton.addEventListener('click', () => this.loadSelectedProfile());
        this.databaseSearchInput.addEventListener('input', () => this.filterProfiles());
        this.openDatabaseButton.addEventListener('click', () => this.openDatabaseFile());
        this.saveDatabaseButton.addEventListener('click', () => this.saveDatabaseFile());
        this.clearLastDatabaseButton.addEventListener('click', () => this.clearLastDatabaseConfirm());
        this.databaseFileInput.addEventListener('change', (e) => this.loadDatabaseFile(e));
        
        // Lade Datenbank beim Start
        this.loadDatabase();
        
        // Initialisiere Spaltenbreite-Anpassung
        this.initColumnResize();
    }
    
    openDatabaseModal() {
        this.databaseModal.style.display = 'block';
        this.refreshDatabaseTable();
    }
    
    closeDatabaseModal() {
        this.databaseModal.style.display = 'none';
        // Stelle ursprüngliche Größe wieder her
        this.restoreOriginalSize();
    }
    
    minimizeDatabaseModal() {
        this.databaseModal.style.display = 'none';
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
        const modalContent = this.databaseModal.querySelector('.modal-content');
        
        // Speichere ursprüngliche Größe und Position
        if (!this.originalModalStyle) {
            this.originalModalStyle = {
                modalWidth: this.databaseModal.style.width,
                modalHeight: this.databaseModal.style.height,
                modalTop: this.databaseModal.style.top,
                modalLeft: this.databaseModal.style.left,
                modalMargin: this.databaseModal.style.margin,
                modalBorderRadius: this.databaseModal.style.borderRadius,
                modalPosition: this.databaseModal.style.position,
                contentWidth: modalContent ? modalContent.style.width : '',
                contentMaxWidth: modalContent ? modalContent.style.maxWidth : '',
                contentTransform: modalContent ? modalContent.style.transform : ''
            };
        }
        
        // Maximiere Modal - setze explizit alle Eigenschaften
        this.databaseModal.style.position = 'fixed';
        this.databaseModal.style.top = '0';
        this.databaseModal.style.left = '0';
        this.databaseModal.style.right = '0';
        this.databaseModal.style.bottom = '0';
        this.databaseModal.style.width = '100%';
        this.databaseModal.style.height = '100%';
        this.databaseModal.style.margin = '0';
        this.databaseModal.style.padding = '0';
        this.databaseModal.style.borderRadius = '0';
        this.databaseModal.style.zIndex = '10000';
        
        // Setze auch modal-content Styles
        if (modalContent) {
            modalContent.style.width = '100%';
            modalContent.style.height = '100%';
            modalContent.style.maxWidth = 'none';
            modalContent.style.maxHeight = 'none';
            modalContent.style.borderRadius = '0';
            modalContent.style.margin = '0';
            modalContent.style.position = 'absolute';
            modalContent.style.top = '0';
            modalContent.style.left = '0';
            modalContent.style.right = '0';
            modalContent.style.bottom = '0';
            modalContent.style.transform = 'none'; // Wichtig: Transform zurücksetzen
            modalContent.style.display = 'flex';
            modalContent.style.flexDirection = 'column';
        }
        
        // Füge maximized-Klasse hinzu
        this.databaseModal.classList.add('maximized');
        this.databaseModalMaximize.classList.add('maximized');
        this.databaseModalMaximize.textContent = '⧉'; // Restore-Symbol
        this.isDatabaseMaximized = true;
        
        // Passe Tabellen-Container an
        const tableContainer = this.databaseModal.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.style.maxHeight = 'calc(100vh - 250px)';
            tableContainer.style.overflow = 'auto';
        }
        
        // Stelle sicher, dass der Body scrollbar ist
        const modalBody = this.databaseModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.overflow = 'auto';
            modalBody.style.flex = '1';
        }
    }
    
    restoreOriginalSize() {
        // Entferne maximized-Klasse
        this.databaseModal.classList.remove('maximized');
        this.databaseModalMaximize.classList.remove('maximized');
        this.databaseModalMaximize.textContent = '□'; // Maximize-Symbol
        this.isDatabaseMaximized = false;
        
        // Stelle ursprüngliche Styles wieder her
        if (this.originalModalStyle) {
            this.databaseModal.style.position = this.originalModalStyle.modalPosition || '';
            this.databaseModal.style.width = this.originalModalStyle.modalWidth || '';
            this.databaseModal.style.height = this.originalModalStyle.modalHeight || '';
            this.databaseModal.style.top = this.originalModalStyle.modalTop || '';
            this.databaseModal.style.left = this.originalModalStyle.modalLeft || '';
            this.databaseModal.style.right = '';
            this.databaseModal.style.bottom = '';
            this.databaseModal.style.margin = this.originalModalStyle.modalMargin || '';
            this.databaseModal.style.padding = '';
            this.databaseModal.style.borderRadius = this.originalModalStyle.modalBorderRadius || '';
            this.databaseModal.style.zIndex = '';
            
            // Stelle modal-content Styles wieder her
            const modalContent = this.databaseModal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.style.width = this.originalModalStyle.contentWidth || '90%';
                modalContent.style.maxWidth = this.originalModalStyle.contentMaxWidth || '1200px';
                modalContent.style.height = '';
                modalContent.style.borderRadius = '';
                modalContent.style.margin = '';
                modalContent.style.position = '';
                modalContent.style.top = '';
                modalContent.style.left = '';
                modalContent.style.right = '';
                modalContent.style.bottom = '';
                modalContent.style.transform = this.originalModalStyle.contentTransform || 'translateY(-50%)'; // Transform wiederherstellen
                modalContent.style.display = '';
                modalContent.style.flexDirection = '';
            }
        }
        
        // Stelle Tabellen-Container wieder her
        const tableContainer = this.databaseModal.querySelector('.table-container');
        if (tableContainer) {
            tableContainer.style.maxHeight = '500px';
            tableContainer.style.overflow = '';
        }
        
        // Stelle Modal-Body wieder her
        const modalBody = this.databaseModal.querySelector('.modal-body');
        if (modalBody) {
            modalBody.style.overflow = '';
            modalBody.style.flex = '';
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
        container.className = 'skizze-container';
        
        if (skizzeData && skizzeData.startsWith('data:image')) {
            const img = document.createElement('img');
            img.className = 'skizze-preview';
            img.src = skizzeData;
            img.title = 'Klicken für Vollansicht';
            
            // Klick für Vollansicht
            img.addEventListener('click', () => {
                this.showSkizzeFullscreen(skizzeData);
            });
            
            container.appendChild(img);
        } else {
            const uploadArea = document.createElement('div');
            uploadArea.className = 'skizze-upload-area';
            uploadArea.innerHTML = `
                <div class="skizze-upload-placeholder">
                    <div class="skizze-upload-text">📷</div>
                    <div class="skizze-upload-hint">Skizze</div>
                </div>
            `;
            container.appendChild(uploadArea);
        }
        
        return container;
    }
    
    showSkizzeFullscreen(skizzeData) {
        // Erstelle Vollbild-Modal für Skizze
        const fullscreenModal = document.createElement('div');
        fullscreenModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.9);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = skizzeData;
        img.style.cssText = `
            max-width: 90vw;
            max-height: 90vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
        `;
        
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
            
            row.innerHTML = `
                <td><input type="text" class="database-input" value="${profile.id}" readonly></td>
                <td><input type="text" class="database-input" value="${profile.spsNummer}" data-field="spsNummer"></td>
                <td><input type="text" class="database-input" value="${profile.lieferant}" data-field="lieferant"></td>
                <td><input type="text" class="database-input" value="${profile.lieferantNummer}" data-field="lieferantNummer"></td>
                <td><input type="number" class="database-input" value="${profile.hoehe}" data-field="hoehe" step="0.1"></td>
                <td><input type="text" class="database-input" value="${profile.material}" data-field="material"></td>
                <td>
                    <select class="database-select" data-field="projekt">
                        <option value="Van.Ea" ${profile.projekt === 'Van.Ea' ? 'selected' : ''}>Van.Ea</option>
                        <option value="Porsche" ${profile.projekt === 'Porsche' ? 'selected' : ''}>Porsche</option>
                        <option value="VW" ${profile.projekt === 'VW' ? 'selected' : ''}>VW</option>
                    </select>
                </td>
                <td>${skizzeCell}</td>
                <td>
                    <button class="btn-load-profile" onclick="profilZeichner.selectProfile(${profile.id})">Laden</button>
                    <button class="btn-delete-profile" onclick="profilZeichner.deleteProfile(${profile.id})">Löschen</button>
                </td>
            `;
            
            // Event Listeners für Eingabefelder
            const inputs = row.querySelectorAll('.database-input');
            inputs.forEach(input => {
                input.addEventListener('input', (e) => {
                    const field = e.target.dataset.field;
                    const value = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
                    profile[field] = value;
                });
            });
            
            // Event Listeners für Select-Felder
            const selects = row.querySelectorAll('.database-select');
            selects.forEach(select => {
                select.addEventListener('change', (e) => {
                    const field = e.target.dataset.field;
                    const value = e.target.value;
                    profile[field] = value;
                });
            });
            
            // Skizze-Upload Event Listeners
            this.setupSkizzeUpload(row, profile);
            
            this.databaseTbody.appendChild(row);
        });
    }
    
    createSkizzeCell(profile) {
        const hasSkizze = profile.skizze && profile.skizze.startsWith('data:image');
        
        if (hasSkizze) {
            return `
                <div class="skizze-container">
                    <img src="${profile.skizze}" class="skizze-preview" alt="Skizze" title="Klicken für Vollansicht" onclick="profilZeichner.showSkizzeFullscreen('${profile.skizze}')">
                    <div class="skizze-overlay">
                        <button class="btn-skizze-upload" onclick="profilZeichner.openSkizzeUpload(${profile.id})">📁</button>
                        <button class="btn-skizze-delete" onclick="profilZeichner.deleteSkizze(${profile.id})">🗑️</button>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="skizze-upload-area" data-profile-id="${profile.id}">
                    <div class="skizze-upload-placeholder">
                        <span class="skizze-upload-text">📁 Skizze hochladen</span>
                        <span class="skizze-upload-hint">Drag & Drop oder klicken</span>
                    </div>
                    <input type="file" class="skizze-file-input" accept="image/*" style="display: none;">
                </div>
            `;
        }
    }
    
    setupSkizzeUpload(row, profile) {
        const skizzeContainer = row.querySelector('.skizze-container, .skizze-upload-area');
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
                skizzeContainer.classList.remove('drag-over');
                
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
}

// Globale Funktionen für HTML onclick
function removeAusschnittRow(element) {
    if (profilZeichner) {
        profilZeichner.removeAusschnittRow(element);
    }
}

function removeCrimpingRow(element) {
    if (profilZeichner) {
        profilZeichner.removeCrimpingRow(element);
    }
}

// App-Start nach Authentifizierung
function startProfilZeichnerApp() {
    const app = new ProfilZeichner();
    if (typeof app.initDatabase === 'function') {
        app.initDatabase();
    }
    window.profilZeichner = app;
}

document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('auth-overlay');
    const pwdInput = document.getElementById('auth-password');
    const btn = document.getElementById('auth-login-btn');
    const err = document.getElementById('auth-error');
    const REQUIRED_PW = 'TrimShop002=';

    const authenticated = sessionStorage.getItem('pz.auth') === 'ok';
    if (authenticated) {
        if (overlay) overlay.style.display = 'none';
        startProfilZeichnerApp();
        return;
    }
    if (overlay) overlay.style.display = 'flex';
    if (pwdInput) pwdInput.focus();

    function tryLogin() {
        const val = (pwdInput && pwdInput.value) || '';
        if (val === REQUIRED_PW) {
            sessionStorage.setItem('pz.auth', 'ok');
            if (err) err.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
            startProfilZeichnerApp();
        } else {
            if (err) err.style.display = 'block';
            if (pwdInput) pwdInput.select();
        }
    }

    if (btn) btn.addEventListener('click', tryLogin);
    if (pwdInput) pwdInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') tryLogin();
    });
});
