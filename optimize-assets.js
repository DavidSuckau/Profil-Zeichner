#!/usr/bin/env node

/**
 * Einfaches Asset-Optimierungs-Script
 * Optimiert Bilder und minifiziert CSS/JS ohne komplexe Build-Tools
 */

const fs = require('fs');
const path = require('path');

const ASSETS = {
    images: ['Logo.png'],
    css: ['style.css'],
    js: ['script.js']
};

// Einfache CSS-Minification
function minifyCSS(content) {
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Kommentare entfernen
        .replace(/\s+/g, ' ') // Mehrfache Whitespaces zu einem
        .replace(/;\s*}/g, '}') // `;` vor `}` entfernen
        .replace(/\s*{\s*/g, '{') // Whitespace um `{` entfernen
        .replace(/;\s*/g, ';') // Whitespace nach `;` entfernen
        .replace(/\s*:\s*/g, ':') // Whitespace um `:` entfernen
        .replace(/,\s*/g, ',') // Whitespace nach `,` entfernen
        .trim();
}

// Einfache JS-Minification (vorsichtig, keine Breaking Changes)
function minifyJS(content) {
    // Entferne nur Kommentare und führende/trailing Whitespace in Zeilen
    return content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Block-Kommentare
        .replace(/\/\/.*$/gm, '') // Zeilen-Kommentare
        .replace(/\n\s*\n/g, '\n') // Leere Zeilen reduzieren
        .replace(/^\s+/gm, '') // Führende Whitespaces pro Zeile
        .trim();
}

// Erstellt optimierte Versionen
function optimizeAssets() {
    console.log('🔧 Starte Asset-Optimierung...\n');

    // CSS optimieren
    console.log('📝 CSS optimieren...');
    ASSETS.css.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf8');
            const minified = minifyCSS(content);
            const outputPath = path.join(__dirname, file.replace('.css', '.min.css'));
            fs.writeFileSync(outputPath, minified, 'utf8');
            const saved = content.length - minified.length;
            console.log(`  ✅ ${file} → ${file.replace('.css', '.min.css')} (${(saved/1024).toFixed(1)}KB gespart)`);
        }
    });

    // JS optimieren (nur wenn explizit gewünscht)
    console.log('\n📝 JavaScript optimieren...');
    console.log('  ⚠️  JS-Minification ausgelassen (kann komplex sein, besser manuell oder mit Tools)');
    console.log('  💡 Empfehlung: Nutze online Tools wie https://javascript-minifier.com/');

    // Bilder
    console.log('\n🖼️  Bildoptimierung...');
    ASSETS.images.forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`  ⚠️  ${file}: ${sizeKB}KB - sehr groß!`);
            console.log(`     💡 Empfehlung: Nutze Tools wie:`);
            console.log(`        - Online: https://squoosh.app/ oder https://tinypng.com/`);
            console.log(`        - CLI: npm install -g imagemin-cli`);
            console.log(`        - Ziel: Unter 100KB (aktuell ${sizeKB}KB)`);
            console.log(`        - Format: PNG → WebP oder komprimiertes PNG`);
        }
    });

    console.log('\n✅ Optimierung abgeschlossen!');
    console.log('\n📋 Nächste Schritte:');
    console.log('  1. Bilder manuell optimieren (squoosh.app oder tinypng.com)');
    console.log('  2. CSS minify bereits erstellt (style.min.css)');
    console.log('  3. HTML anpassen um .min.css zu nutzen');
    console.log('  4. Optional: JS manuell minify mit externen Tools');
}

optimizeAssets();

