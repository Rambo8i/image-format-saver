# Datenschutzerklärung für Image Format Saver

**Entwurf – vor der Store-Einreichung Anbieter und Kontakt ergänzen. Stand: 12. Oktober 2026.**

## Anbieter und Kontakt

Anbieter: **[Vor Veröffentlichung ergänzen]**

Datenschutzkontakt: **[Vor Veröffentlichung ergänzen]**

## Bildverarbeitung

Image Format Saver ruft ein Bild erst ab, wenn du einen Speichereintrag im Bild-Kontextmenü auswählst. Das Bild wird im Browser in PNG, JPG, WebP oder PDF umgewandelt und über die Downloadfunktion des Browsers auf deinem Gerät gespeichert. Es gibt keinen vom Entwickler betriebenen Konvertierungsserver.

Beim Abruf wird eine Verbindung zum ursprünglichen Bildanbieter hergestellt. Dieser erhält übliche technische Verbindungsdaten, etwa deine IP-Adresse und die angeforderte Bild-URL. Die Erweiterung verwendet `credentials: include`; vorhandene Anmeldedaten/Cookies der Bildquelle können nach den Regeln des Browsers mitgesendet werden. Die Erweiterung liest Cookies nicht über eine Cookie-API aus und speichert sie nicht selbst.

Bilddaten und Quell-URLs werden während der Verarbeitung im Arbeitsspeicher verwendet. Image Format Saver legt kein eigenes Archiv deiner Bilder oder besuchten Seiten an. Die gespeicherten Dateien und die Downloadhistorie werden vom Browser und Betriebssystem verwaltet.

## Gespeicherte Einstellungen und Status

Die Erweiterung speichert vier Einstellungen mit der Browser-API `storage.sync`: Standardformat, JPG-Qualität, WebP-Qualität und die Auswahl des Speicherdialogs. Wenn die Browser-Synchronisierung aktiviert ist, kann der Browseranbieter diese Einstellungen über dein Browserkonto auf andere Geräte übertragen. Bei deaktivierter Synchronisierung bleiben sie im lokalen Browserprofil. Für diese Synchronisierung gelten die Datenschutzinformationen des jeweiligen Browseranbieters.

Der letzte Erfolgs- oder Fehlerstatus mit Zeitstempel wird lokal im Browserprofil gespeichert und beim nächsten Vorgang überschrieben. Laufende Download-IDs und Zielformate werden vorübergehend in `storage.session` gespeichert und nach dem Abschluss entfernt. Dieser Sitzungsspeicher wird auch beim Browserneustart oder beim Neuladen/Entfernen der Erweiterung geleert.

Die Extension-Einstellungen und der lokale Status werden beim Deinstallieren aus dem lokalen Browserprofil entfernt. Synchronisierte Daten und die Browser-Downloadhistorie verwaltest du über die Einstellungen des Browsers; bereits heruntergeladene Dateien bleiben erhalten, bis du sie selbst löschst.

## Tracking und Weitergabe

Die Erweiterung enthält keine Werbung, Analyse-SDKs, Tracking-Pixel, Telemetrie oder externe Code-Nachladung. Der Entwickler erhält keine Bilddateien, Quell-URLs, Browserhistorie oder Nutzungsstatistiken über die Erweiterung. Es werden keine Nutzerdaten verkauft oder für Werbung verwendet.

Die Nutzung von Informationen erfolgt ausschließlich für die vom Nutzer ausgelöste Bildkonvertierung und die zugehörigen Einstellungen. Sie entspricht den Limited-Use-Anforderungen der Chrome Web Store User Data Policy.

## Support und gehostete Seiten

Wenn du freiwillig ein GitHub-Issue eröffnest oder den Anbieter kontaktierst, verarbeitet der jeweilige Dienst die von dir übermittelten Informationen. Veröffentliche dort keine vertraulichen Bilder, Zugangsdaten oder privaten Bild-URLs. Die Verarbeitung beim Besuch der GitHub-Projektseite oder einer separat gehosteten Datenschutzseite richtet sich zusätzlich nach den Informationen des jeweiligen Hostinganbieters.
