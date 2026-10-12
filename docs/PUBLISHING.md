# Veröffentlichung

Stand der geprüften offiziellen Dokumentation: 12. Oktober 2026. Das Repository und sein Upload-ZIP veröffentlichen die Erweiterung noch nicht im Browser-Store.

## 1. Anbieterangaben und Rechte klären

- Namen des Herausgebers und erreichbare Support-/Datenschutzadresse festlegen.
- Rechte an der bereitgestellten Ausgangsversion und allen Icons bestätigen.
- Lizenz für das öffentliche Repository auswählen. Eine kostenlose Extension und eine Open-Source-Lizenz sind getrennte Entscheidungen. MIT erlaubt auch kommerzielle Weiterverwendung; falls das deinen Zielen nicht entspricht, nicht ungeprüft MIT wählen.
- Im Store die abgefragte Anbieter-/Händler-Einstufung und Identitätsprüfung anhand deiner tatsächlichen Situation ausfüllen. Kostenlos allein entscheidet diese Einstufung nicht.

## 2. Version lokal ausprobieren

Den Ordner `image-format-saver` entpackt in Chrome laden. PNG, JPG, WebP und PDF über das echte Rechtsklick-Menü testen. Transparenz, Dateiendung, Dateiname, Qualitätsregler, Standardformat und beide Speicherdialog-Einstellungen prüfen. Auch einen Speichervorgang abbrechen und eine geschützte/fehlerhafte Bild-URL ausprobieren. Browser und Extension neu starten und prüfen, dass die Einstellungen erhalten bleiben. Für Edge im echten Edge-Browser wiederholen.

```powershell
npm run check
npm test
npm run package
```

Die Datei `dist/image-format-saver-1.2.1.zip` hochladen. Der Repository-Download von GitHub ist kein Store-Paket: Er enthält einen zusätzlichen Ordner und Entwicklungsdateien.

## 3. Datenschutz und Store-Grafiken fertigstellen

- Anbieter und Kontakt in [PRIVACY.md](PRIVACY.md) ergänzen.
- Die vervollständigte Erklärung über eine öffentliche HTTPS-URL erreichbar machen. Bei diesem öffentlichen Repository ist auch eine öffentlich lesbare Datei-URL möglich; eine eigene stabile Datenschutzseite ist übersichtlicher. Nicht den unvollständigen Entwurf einreichen.
- Echte Screenshots und eine kleine Promografik anhand der [Store-Unterlagen](STORE-LISTING-DE.md) erstellen. Das PNG-Icon ist vorhanden.
- Beschreibung, Zweck und Berechtigungsbegründungen aus den Store-Unterlagen übernehmen und gegen die hochgeladene Version prüfen.

## 4. Chrome Web Store

1. Im [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole/) mit dem vorgesehenen Google-Konto anmelden.
2. Als Entwickler registrieren und die einmalige Gebühr bezahlen. Google nennt aktuell 5 US-Dollar; maßgeblich ist der im Registrierungsprozess angezeigte Betrag.
3. Zwei-Faktor-Authentifizierung aktivieren und angeforderte Kontakt-/Identitätsangaben bestätigen.
4. **Add new item / Neues Element hinzufügen** wählen und das erzeugte Extension-ZIP hochladen.
5. Sprache, Beschreibung, Kategorie, Icon, Screenshots, kleine Promografik, Support-Link und Datenschutz-URL eintragen.
6. Im Privacy-Tab den einzigen Zweck und jede Berechtigung begründen. Die tatsächliche Verarbeitung einschließlich Browser-Sync berücksichtigen. Es gibt keine externen Konvertierungsserver und keine Remote-Code-Nachladung.
7. Verfügbarkeit und Verteilung auswählen, kostenlos anbieten, sofern dies deine gewünschte Positionierung ist, und zur Prüfung einreichen. Bei Bedarf zuerst mit eingeschränkter Sichtbarkeit testen.
8. Erst nach Freigabe und tatsächlicher Veröffentlichung den Store-Link im README ergänzen und die Store-Version installieren/testen.

Review-Dauer und Freigabe lassen sich nicht garantieren. Für Updates die Manifest- und Paketversion gemeinsam erhöhen und ein neues ZIP hochladen.

## 5. Microsoft Edge Add-ons

Danach im [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/overview) für das Edge-Extension-Programm registrieren. Microsoft verlangt dafür laut aktueller Dokumentation keine Registrierungsgebühr. Das passende Konto und alle angeforderten Anbieterangaben einrichten, das ZIP nach echtem Edge-Test einreichen und das Edge-Listing mit seinen aktuellen Grafik- und Datenschutzfeldern vervollständigen.

## Offizielle Quellen

- [Chrome: Registrierung](https://developer.chrome.com/docs/webstore/register)
- [Google: aktuelle Erwähnung der 5-Dollar-Registrierungsgebühr](https://developer.chrome.com/docs/extensions/whats-new)
- [Chrome: Zwei-Faktor-Authentifizierung](https://developer.chrome.com/docs/webstore/program-policies/two-step-verification)
- [Chrome: Paket hochladen und veröffentlichen](https://developer.chrome.com/docs/webstore/publish)
- [Chrome: Store-Grafiken](https://developer.chrome.com/docs/webstore/images)
- [Chrome: Datenschutzfelder und Berechtigungen](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome: Händlerprüfung](https://developer.chrome.com/docs/webstore/program-policies/trader-verification-faq)
- [Chrome: activeTab und dessen Origin-Grenze](https://developer.chrome.com/docs/extensions/develop/concepts/activeTab)
- [Chrome: Speicherung und Browser-Synchronisierung](https://developer.chrome.com/docs/extensions/reference/api/storage)
- [Edge: Registrierung](https://learn.microsoft.com/en-us/microsoft-edge/extensions/publish/create-dev-account)
