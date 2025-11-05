#!/usr/bin/env node
/**
 * Versionsverwaltung für ProfilZeichner
 * 
 * Regeln:
 * - Patch (1.0.X): Kleine Code-Änderungen, Bugfixes
 * - Minor (1.X.0): Funktionen verändert/erweitert
 * - Major (X.0.0): Neue Funktionen hinzugefügt
 */

const fs = require('fs');
const path = require('path');

const VERSION_FILE = path.join(__dirname, 'version.json');
const SCRIPT_FILE = path.join(__dirname, 'script.js');
const HTML_FILE = path.join(__dirname, 'index.html');

function readVersion() {
    try {
        const data = fs.readFileSync(VERSION_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return {
            version: '1.0.0',
            lastUpdate: new Date().toISOString().split('T')[0],
            changelog: {}
        };
    }
}

function writeVersion(versionData) {
    fs.writeFileSync(VERSION_FILE, JSON.stringify(versionData, null, 2), 'utf8');
}

function updateVersionInFiles(version) {
    // Update script.js
    let scriptContent = fs.readFileSync(SCRIPT_FILE, 'utf8');
    scriptContent = scriptContent.replace(
        /this\.version = '[\d.]+';/,
        `this.version = '${version}';`
    );
    fs.writeFileSync(SCRIPT_FILE, scriptContent, 'utf8');
    
    // Update index.html
    let htmlContent = fs.readFileSync(HTML_FILE, 'utf8');
    htmlContent = htmlContent.replace(
        /Version [\d.]+/g,
        `Version ${version}`
    );
    fs.writeFileSync(HTML_FILE, htmlContent, 'utf8');
}

function incrementVersion(currentVersion, type = 'patch') {
    const parts = currentVersion.split('.').map(Number);
    
    if (type === 'major') {
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
    } else if (type === 'minor') {
        parts[1]++;
        parts[2] = 0;
    } else { // patch
        parts[2]++;
    }
    
    return parts.join('.');
}

// Command line interface
const args = process.argv.slice(2);
const command = args[0];
const type = args[1] || 'patch';

if (command === 'increment') {
    const versionData = readVersion();
    const newVersion = incrementVersion(versionData.version, type);
    
    versionData.version = newVersion;
    versionData.lastUpdate = new Date().toISOString().split('T')[0];
    
    writeVersion(versionData);
    updateVersionInFiles(newVersion);
    
    console.log(`✓ Version erhöht von ${versionData.changelog[versionData.version] ? 'alter Version' : ''} auf ${newVersion}`);
} else if (command === 'current') {
    const versionData = readVersion();
    console.log(`Aktuelle Version: ${versionData.version}`);
} else {
    console.log('Verwendung:');
    console.log('  node update-version.js increment [patch|minor|major]  - Version erhöhen');
    console.log('  node update-version.js current                        - Aktuelle Version anzeigen');
}

