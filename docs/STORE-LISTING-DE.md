# Store-Unterlagen (Deutsch)

## Name

Image Format Saver

## Kurzbeschreibung

Speichert Bilder per Rechtsklick lokal als PNG, JPG, WebP oder PDF.

## Beschreibung

Speichere Web-Bilder direkt im gewünschten Format: Rechtsklick auf ein Bild, PNG, JPG, WebP oder PDF auswählen und herunterladen.

Image Format Saver konvertiert Bilder in deinem Browser. Du brauchst keinen Account und keinen externen Konvertierungsdienst.

Funktionen:
- PNG für verlustfreie Ausgabe mit Transparenz.
- JPG mit einstellbarer Qualität und weißem Hintergrund bei transparenten Bildern.
- WebP mit einstellbarer Qualität und Transparenz.
- PDF mit einem Bild pro Seite, als JPG auf weißem Hintergrund eingebettet.
- Standardformat für schnelles Speichern.
- Wahlweise Speicherort abfragen oder direkt in den Downloadordner speichern.

Die Erweiterung enthält kein Tracking, keine Werbung und keine künstliche Nutzungsgrenze. Einstellungen können bei aktivierter Browser-Synchronisierung zwischen deinen Geräten übertragen werden.

Hinweise: Geschützte Bildquellen und seitengebundene Blob-URLs lassen sich möglicherweise nicht abrufen. Animierte Bilder werden statisch gespeichert. SVG wird gerastert, sofern der Browser es decodieren kann. Sehr große Bilder können Browserlimits erreichen.

## Single purpose / einziger Zweck

Vom Nutzer per Bild-Kontextmenü ausgewählte Web-Bilder im Browser in PNG, JPG, WebP oder eine einseitige PDF-Datei umwandeln und auf seinem Gerät speichern.

## Begründung der Berechtigungen

| Berechtigung | Text für die Einreichung |
| --- | --- |
| contextMenus | Fügt ausschließlich für Bilder Kontextmenüeinträge für das Standardformat und die vier Zielformate hinzu. |
| downloads | Speichert die lokal konvertierte Datei über den Browser, unterstützt die Wahl des Speicherorts und prüft Abschluss/Abbruch der eigenen Downloads. |
| storage | Speichert ausschließlich vier Benutzereinstellungen in storage.sync, den letzten Status lokal und Download-ID/Format vorübergehend in storage.session. |
| offscreen | Stellt Canvas, ImageBitmap und FileReader für die lokale Bildkonvertierung bereit, während das Popup geschlossen ist. |
| HTTP-/HTTPS-Hostzugriff | Ruft ausschließlich das durch einen expliziten Rechtsklick ausgewählte Bild von seiner Originalquelle ab. Diese kann auf jeder Website oder einer anderen CDN-Domain liegen. Es gibt keinen Hintergrundscan, keine Inhalts-Skripte und keine Auswertung besuchter Webseiten. activeTab allein deckt fremde CDN-Quellen nicht ab. |

## Remote Code

Nein. Alle ausführbaren JavaScript-Dateien sind Bestandteil des Extension-Pakets. Es werden keine Skripte von einem Server nachgeladen. Netzwerkzugriffe dienen dem Abruf der ausgewählten Bilddaten.

## Datenschutzangaben im Dashboard

Die Extension sendet keine Nutzerdaten an den Entwickler oder einen eigenen Backenddienst. Die bildbezogene Verarbeitung ist lokal; die vier Einstellungen können durch den Browseranbieter synchronisiert werden. Die Originalquelle wird zum nutzerinitiierten Bildabruf kontaktiert. Diese Unterschiede müssen in den Dashboard-Antworten und der veröffentlichten Datenschutzerklärung übereinstimmen. Die aktuellen Formulierungen der Dashboard-Fragen vor Bestätigung lesen; keine pauschale Zusicherung „keinerlei Netzwerkverkehr“ verwenden.

Datenschutz-URL: **[öffentliche URL der vervollständigten Datenschutzerklärung eintragen]**

Support-URL: https://github.com/Rambo8i/image-format-saver/issues

Sprache: Deutsch. Kategorie: eine passende Kategorie für Werkzeuge/Produktivität im aktuellen Dashboard auswählen. Preispositionierung: kostenlos, sofern vom Anbieter bestätigt.

## Noch benötigte Grafiken

- PNG-Icon 128 × 128: vorhanden unter `image-format-saver/icons/icon128.png`.
- Mindestens ein echter Anwendungsscreenshot: 1280 × 800 oder 640 × 400; bis zu fünf.
- Kleine Store-Promografik: 440 × 280.
- Große Promografik: 1400 × 560, optional.

Nur Funktionen und Ausgaben zeigen, die der eingereichten Version entsprechen. Für Screenshots Bilder mit geklärten Nutzungsrechten verwenden.
