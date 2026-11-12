# Fernwartung in CRDigital-Anwendungen einbinden

Eine Datei, eine Zeile HTML. Funktioniert in jeder Web-Oberfläche (ProtoKI, Terravo, DMS, Finance, myAllergyAPP) unabhängig vom Framework.

## Einbinden

```html
<script src="https://cr-digital.net/js/crd-remote-support.js" defer></script>
```

Das Skript wird zentral von der Website ausgeliefert. Eine Änderung dort wirkt nach spätestens einer Stunde in allen Anwendungen. Die Quelle ist `integration/crd-remote-support.js` in diesem Repository; die Website führt eine Kopie unter `site/static/js/`.

Je nach Platz in der Anwendung:

```html
<!-- Im Hilfe-Menü oder in der Kopfzeile -->
<crd-remote-support product="ProtoKI"></crd-remote-support>

<!-- Schwebender Knopf unten rechts, immer sichtbar -->
<crd-remote-support product="Terravo" variant="floating"></crd-remote-support>

<!-- Als Textlink, z. B. im Footer -->
<crd-remote-support product="CRDigital DMS" variant="link" label="Fernwartung starten"></crd-remote-support>

<!-- In dunklen Oberflächen -->
<crd-remote-support product="CRDigital Finance" theme="dark"></crd-remote-support>
```

React, Vue, Angular: Das Element im Template verwenden, es ist ein Standard-Web-Component.

## Was beim Klick passiert

1. Unter Windows startet der Download von `CRDigitalRemote-Support.exe` (von cr-digital.net).
2. Ein Dialog im CRDigital-Design erklärt die drei Schritte und den SmartScreen-Hinweis.
3. „Störung melden“ öffnet das Kontaktformular der Website, das Produkt ist schon eingetragen.
4. Auf anderen Systemen erscheint statt des Downloads ein Hinweis.

Das Element löst das Ereignis `crd-remote-download` aus. Damit lässt sich protokollieren, aus welcher Anwendung Fernwartung angefordert wurde.

## Attribute

| Attribut | Standard | Zweck |
|---|---|---|
| `product` | – | Name der Anwendung im Dialog und in der Störungsmeldung |
| `variant` | `button` | `button`, `floating` oder `link` |
| `label` | `Fernwartung starten` | Beschriftung |
| `theme` | `light` | `light`, `dark` oder `auto` (folgt dem Betriebssystem) |
| `download-url` | `https://cr-digital.net/download/CRDigitalRemote-Support.exe` | eigener Download-Pfad |
| `support-url` | Kontaktformular der Website | Seite für die Störungsmeldung |
| `support-email` | `support@cr-digital.net` | Adresse im Dialog |

Die Schrift übernimmt der Knopf von der Anwendung. Abweichend setzen: `crd-remote-support { --crd-font: "Inter", sans-serif; }`

## Content-Security-Policy der Anwendung

Setzt die Anwendung eine CSP, braucht sie:

```
script-src https://cr-digital.net;  style-src 'unsafe-inline';  img-src data:;
```
