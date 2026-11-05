# Fernwartung in CRDigital-Anwendungen einbinden

Eine Datei, eine Zeile HTML. Funktioniert in jeder Web-Oberfläche (ProtoKI, Terravo, DMS, Finance, myAllergyAPP, Website) unabhängig vom Framework.

## 1. Skript bereitstellen

`crd-remote-support.js` einmal zentral ablegen, z. B. unter `https://cr-digital.net/assets/crd-remote-support.js`. Alle Apps laden es von dort, Änderungen wirken überall gleichzeitig.

## 2. Einbinden

```html
<script src="https://cr-digital.net/assets/crd-remote-support.js" defer></script>
```

Je nach Platz in der Anwendung:

```html
<!-- Im Hilfe-Menü oder in der Kopfzeile -->
<crd-remote-support product="ProtoKI"></crd-remote-support>

<!-- Schwebender Button unten rechts, immer sichtbar -->
<crd-remote-support product="Terravo" variant="floating"></crd-remote-support>

<!-- Als Textlink, z. B. im Footer -->
<crd-remote-support product="CRDigital DMS" variant="link" label="Fernwartung starten"></crd-remote-support>
```

React/Vue/Angular: Das Element einfach im Template verwenden, es ist ein Standard-Web-Component.

## Was beim Klick passiert

1. Unter Windows startet sofort der Download von `CRDigitalRemote-Support.exe`.
2. Ein Dialog im CRDigital-Design erklärt die drei Schritte (öffnen, ID + Passwort nennen, bestätigen).
3. Auf anderen Systemen erscheint ein Hinweis mit Support-Kontakt.

Das Element löst das Ereignis `crd-remote-download` aus. Damit lässt sich z. B. im Ops-Manager protokollieren, aus welcher App Fernwartung angefordert wurde.

## Attribute

| Attribut | Standard | Zweck |
|---|---|---|
| `product` | – | Name der App im Dialog und im Mail-Betreff |
| `variant` | `button` | `button`, `floating` oder `link` |
| `label` | `Fernwartung` | Beschriftung |
| `download-url` | GitHub-Release `latest` | eigener Download-Pfad |
| `support-email` | `support@cr-digital.net` | Adresse für „Support anschreiben“ |
