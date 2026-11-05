<p align="center">
  <img src="docs/crdigital-remote-logo.png" alt="CRDigital Remote" width="360">
</p>

<p align="center"><b>Fernwartung von CRDigital – selbst gehostet, ohne fremde Vermittlungsserver.</b></p>

---

## Was ist das?

CRDigital Remote ist die Fernwartungslösung von [CRDigital](https://cr-digital.net) für Kommunen und Unternehmen. Alle Verbindungen laufen ausschließlich über den eigenen Server `remote.cr-digital.net` in Deutschland. Server-Adresse und Schlüssel sind fest im Programm hinterlegt: Kunden laden es herunter, starten es und nennen ID und Passwort.

## Aufbau des Repositorys

| Ordner | Inhalt |
|---|---|
| `server/` | Docker Compose für den Vermittlungs- und Relay-Server |
| `branding/` | Logo, Icons und Wortmarke (Quelldateien als SVG) |
| `.github/workflows/crd-build.yml` | Baut den Windows-Client (x64) |
| übrige Ordner | Quellcode des Clients (basiert auf RustDesk) |

## 1. Server einrichten

Auf einem Linux-System mit Docker (z. B. LXC/VM auf Proxmox):

```bash
mkdir -p /opt/crd-remote && cd /opt/crd-remote
# server/docker-compose.yml hierher kopieren
docker compose up -d
cat data/id_ed25519.pub   # öffentlicher Schlüssel
```

Freizugebende Ports (direkt auf die VM, nicht über einen HTTP-Proxy):

| Port | Protokoll | Zweck |
|---|---|---|
| 21115–21117 | TCP | ID-, NAT- und Relay-Dienst |
| 21116 | UDP | ID-Dienst |
| 21118–21119 | TCP | nur für Web-Client |

DNS: A-Record `remote.cr-digital.net` auf die öffentliche IP.

> **Wichtig:** `data/id_ed25519` (privater Schlüssel) in die Datensicherung aufnehmen. Geht er verloren, müssen alle Clients neu gebaut und verteilt werden.

## 2. Client bauen

1. Unter *Settings → Secrets and variables → Actions* das Secret **`CRD_KEY`** anlegen, Inhalt = `id_ed25519.pub`.
2. Unter *Actions → „CRDigital Remote bauen“ → Run workflow* den Build starten (Dauer ca. 45–60 Minuten).
3. Ergebnis: Release **`latest`** mit EXE und MSI. Für feste Versionen ein Tag `v1.0.0` pushen.

Ohne gesetztes Secret bricht der Build bewusst ab, damit kein Client ohne gültigen Schlüssel entsteht.

## 3. An Kunden verteilen

- **Spontane Hilfe:** EXE auf `cr-digital.net/support` zum Download anbieten, keine Installation nötig.
- **Dauerkunden:** MSI installieren, festes Passwort setzen, unbeaufsichtigter Zugriff.

Unsignierte Programme lösen unter Windows eine SmartScreen-Warnung aus. Abhilfe schafft ein Code-Signing-Zertifikat.

## Design

| Farbe | Hex | Einsatz |
|---|---|---|
| Navy | `#0B2545` | Logo-Fläche, Schrift |
| Blau | `#1F5FAD` | Akzent, Buttons |
| Silber | `#C9D1DB` | Logo-Rahmen, Buchstaben |

Logo austauschen: Dateien in `branding/` ersetzen und in die gleichnamigen Ziele unter `res/`, `flutter/assets/` und `flutter/windows/runner/resources/` kopieren.

## Lizenz

CRDigital Remote basiert auf [RustDesk](https://github.com/rustdesk/rustdesk) und steht wie dieses unter der **AGPL-3.0** (siehe `LICENCE`). Der vollständige Quellcode inklusive aller CRDigital-Anpassungen ist in diesem Repository öffentlich verfügbar. CRDigital ist nicht mit dem RustDesk-Projekt verbunden.

Original-README: [`docs/README-RustDesk-original.md`](docs/README-RustDesk-original.md)

---

<p align="center">CRDigital · cr-digital.net</p>
