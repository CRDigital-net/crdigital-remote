<p align="center">
  <img src="docs/crdigital-remote-logo.png" alt="CRDigital Remote" width="360">
</p>

<p align="center"><b>Fernwartung von CRDigital – selbst gehostet, ohne fremde Vermittlungsserver.</b></p>

---

## Was ist das?

CRDigital Remote ist die Fernwartungslösung von [CRDigital](https://cr-digital.net) für Kommunen und Unternehmen. Alle Verbindungen laufen über den eigenen Server `remote.cr-digital.net` in Deutschland. Server-Adresse und Schlüssel sind fest im Programm hinterlegt: Kunden laden es herunter, öffnen es und nennen ID und Passwort am Telefon.

## Aufbau

| Ordner | Inhalt |
|---|---|
| `server/` | Vermittlungs- und Relay-Server: `install.sh`, `docker-compose.yml`, `backup-key.sh` |
| `.github/workflows/crd-build.yml` | Baut den Windows-Client (x64) als EXE und MSI |
| `integration/` | Fernwartungs-Knopf für alle CRDigital-Anwendungen (eine Zeile HTML) |
| `branding/` | Logo und Icons |
| `docs/BETRIEB.md` | Betriebshandbuch: Inbetriebnahme, Alltag, neue Version, Störungen |
| übrige Ordner | Quellcode des Clients (basiert auf RustDesk 1.5.1) |

Die Support-Seiten der Website liegen im Repository `crdigital-web` (`site/pages/support*.html`).

## Inbetriebnahme in fünf Schritten

Ausführlich in [`docs/BETRIEB.md`](docs/BETRIEB.md).

1. **Server:** eigene Ubuntu-VM, Ordner `server/` hinkopieren, `sudo ./install.sh`. Das Skript zeigt am Ende den öffentlichen Schlüssel.
2. **Netz:** pfSense-Portweiterleitung TCP 21115–21117 und UDP 21116 auf die VM, DNS-Eintrag `remote.cr-digital.net`.
3. **Schlüssel:** im Repository unter *Settings → Secrets and variables → Actions* das Secret `CRD_KEY` anlegen (Inhalt: der öffentliche Schlüssel). Privaten Schlüssel mit `backup-key.sh` sichern.
4. **Build:** *Actions → „CRDigital Remote bauen“ → Run workflow*. Nach etwa einer Stunde liegen `CRDigitalRemote-Support.exe` und `CRDigitalRemote-Setup.msi` im Release `latest`.
5. **Freigabe:** auf der Website-VM `./update-fernwartung.sh` ausführen. Erst danach liefert `cr-digital.net/download/…` die neue Version aus.

Ohne das Secret bricht der Build ab, damit kein Client ohne gültigen Schlüssel entsteht.

## Sicherheit

- Der Server läuft mit `-k _`: Er nimmt nur Clients an, die seinen Schlüssel kennen. Ein RustDesk ohne diesen Schlüssel kann ihn nicht benutzen.
- Sitzungen sind Ende-zu-Ende-verschlüsselt. Der Relay-Server kann die Inhalte nicht lesen.
- Der Client sucht keine Updates bei RustDesk und verweist für Datenschutz und Hilfe auf cr-digital.net.
- Die Programme sind nicht signiert. Windows SmartScreen warnt deshalb beim ersten Start. Abhilfe schafft ein Code-Signing-Zertifikat (siehe Betriebshandbuch).

## Design

| Farbe | Hex | Einsatz |
|---|---|---|
| Navy | `#0A1428` | Flächen, Kopfbereiche |
| Blau | `#1A73FF` | Akzent, Schaltflächen |
| Chrom | `#C7D0DD` | Linien, Nebentext auf dunkel |

Logo austauschen: Dateien in `branding/` ersetzen und in die gleichnamigen Ziele unter `res/`, `flutter/assets/` und `flutter/windows/runner/resources/` kopieren. Bilddateien müssen mit `git add -f` hinzugefügt werden, weil `.gitignore` `*.png` und `*.svg` ausschließt.

## Lizenz

CRDigital Remote basiert auf [RustDesk](https://github.com/rustdesk/rustdesk) und steht wie dieses unter der **AGPL-3.0** (siehe `LICENCE`). Der vollständige Quellcode mit allen Anpassungen liegt öffentlich in diesem Repository. CRDigital ist nicht mit dem RustDesk-Projekt verbunden.

Original-README: [`docs/README-RustDesk-original.md`](docs/README-RustDesk-original.md)

---

<p align="center">CRDigital · cr-digital.net</p>
