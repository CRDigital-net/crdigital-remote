# CRDigital Remote – Betriebshandbuch

## 1. Erstinbetriebnahme

### 1.1 Server

Eigene VM oder eigener LXC auf dem Proxmox, nicht der Proxmox-Host selbst. Ubuntu 22.04 oder 24.04, 1 vCPU, 1 GB RAM, 8 GB Platte.

Am schnellsten legt ein Skript die VM auf dem Proxmox-Knoten an und richtet sie ein. Erstes Argument ist die ID einer vorhandenen VM im Zielnetz (z. B. nginx), von ihr werden Bridge und Speicher übernommen:

```bash
# auf dem Proxmox-Knoten als root
wget https://raw.githubusercontent.com/CRDigital-net/crdigital-remote/main/server/proxmox-create-vm.sh
bash proxmox-create-vm.sh 101 10.77.10.60
```

Von Hand auf einer vorhandenen Ubuntu-VM:

```bash
# Ordner server/ auf die VM kopieren, dann:
cd server && sudo ./install.sh
```

Das Skript installiert Docker, startet beide Dienste unter `/opt/crd-remote`, prüft die Ports und zeigt den öffentlichen Schlüssel. Ein zweiter Lauf aktualisiert nur.

### 1.2 Netz

| Was | Wert |
|---|---|
| pfSense-Portweiterleitung auf die VM | TCP 21115–21117, UDP 21116 |
| DNS | A-Eintrag `remote.cr-digital.net` → öffentliche IP |
| Nicht über den nginx-Reverse-Proxy | Das Protokoll ist kein HTTP |

Prüfung von außen: `nc -vz remote.cr-digital.net 21116`

### 1.3 Schlüssel

- Öffentlicher Schlüssel (`/opt/crd-remote/data/id_ed25519.pub`): als Secret `CRD_KEY` im GitHub-Repository eintragen.
- Privater Schlüssel: `sudo /opt/crd-remote/backup-key.sh` erzeugt ein verschlüsseltes Archiv. Auf den Sicherungsserver kopieren, Passwort getrennt aufbewahren.

Geht der private Schlüssel verloren, müssen alle Clients neu gebaut und bei allen Kunden neu verteilt werden.

### 1.4 Client bauen und freigeben

1. GitHub: *Actions → „CRDigital Remote bauen“ → Run workflow* (rund eine Stunde).
2. `CRDigitalRemote-Support.exe` aus dem Release `latest` auf einem Testrechner starten. Unten im Fenster muss „Bereit“ stehen.
3. Von einem zweiten Rechner aus mit ID und Passwort verbinden.
4. Auf der Website-VM im Ordner der Website: `./update-fernwartung.sh`. Erst jetzt bekommen Kunden die Version.

## 2. Alltag

### Spontane Hilfe

1. Kunde meldet die Störung (Formular oder E-Mail).
2. Rückruf. Der Kunde klickt in seiner Anwendung oder auf cr-digital.net/support/fernwartung/ auf „Fernwartung starten“ und öffnet die Datei.
3. Er nennt ID und Passwort am Telefon. In deinem CRDigital Remote die ID eingeben und verbinden.
4. Braucht eine Arbeit Administratorrechte, erscheint beim Kunden eine Abfrage, die er bestätigt.
5. Der Kunde schließt das Programm. Damit ist kein Zugriff mehr möglich.

### Dauerhafter Zugang (nur mit schriftlicher Vereinbarung)

1. `CRDigitalRemote-Setup.msi` auf dem Kundensystem installieren.
2. In den Einstellungen unter *Sicherheit* ein festes Passwort setzen. Langes, je Gerät eigenes Passwort verwenden und im Passwortmanager ablegen.
3. Optional die Zwei-Faktor-Anmeldung einschalten.
4. Gerät im eigenen Client als Favorit speichern.

### Dein eigener Arbeitsplatz

Dieselbe MSI installieren. Es gibt kein getrenntes Techniker-Programm.

## 3. Neue Version

Bei Änderungen am Code oder für eine nummerierte Version:

```bash
git tag v1.0.1 && git push origin v1.0.1     # baut das Release v1.0.1
# oder ohne Tag: Actions → Run workflow → aktualisiert das Release "latest"
```

Danach testen und mit `./update-fernwartung.sh` (oder `./update-fernwartung.sh v1.0.1`) auf der Website freigeben. Installierte Clients aktualisieren sich nicht selbst: bei Dauerkunden die neue MSI über die Fernwartung einspielen.

Der Server-Schlüssel bleibt gleich, deshalb funktionieren alte Clients weiter.

## 4. Störungen

| Anzeichen | Ursache und Abhilfe |
|---|---|
| Client zeigt „Nicht bereit. Bitte überprüfen Sie Ihre Netzwerkverbindung“ | Server nicht erreichbar: `docker ps` auf der VM, Portweiterleitung, DNS prüfen |
| „Schlüssel stimmen nicht überein“ | Client wurde mit anderem Schlüssel gebaut: `CRD_KEY` mit `id_ed25519.pub` vergleichen, neu bauen |
| Verbindung steht, Bild ruckelt stark | Vermutlich läuft sie über das Relay statt direkt: prüfen, ob UDP 21116 in der pfSense weitergeleitet wird |
| Build bricht sofort ab | Secret `CRD_KEY` fehlt |
| Download auf der Website liefert 404 | `./update-fernwartung.sh` wurde noch nicht ausgeführt |
| Windows blockiert den Start | SmartScreen: „Weitere Informationen“ → „Trotzdem ausführen“; dauerhaft hilft nur Code-Signing |

Logs: `docker logs crd-remote-hbbs` und `docker logs crd-remote-hbbr`.

## 5. Datenschutz

Der Server speichert je Gerät ID, öffentlichen Schlüssel und zuletzt verwendete IP-Adresse in `/opt/crd-remote/data/db_v2.sqlite3`. Eintrag eines Geräts löschen:

```bash
sudo apt-get install -y sqlite3   # einmalig
cd /opt/crd-remote && docker compose stop hbbs
sqlite3 data/db_v2.sqlite3 "delete from peer where id='GERÄTE-ID';"
docker compose start hbbs
```

Die Container-Logs sind auf 5 × 10 MB begrenzt und überschreiben sich.

## 6. Offene Entscheidungen

- **Code-Signing-Zertifikat:** ohne Signatur warnt Windows jeden Kunden. Für ein Einzelunternehmen kommt ein OV-Zertifikat oder Microsoft Trusted Signing in Frage. Der Build ist dafür vorbereitet (`SIGN_BASE_URL`, `SIGN_SECRET_KEY`), braucht dann aber einen eigenen Signierdienst.
- **Vertrag zur Auftragsverarbeitung:** die Fernwartung in die AVV-Vorlage aufnehmen.
- **Überwachung:** Port 21116 der VM in Checkmk aufnehmen.
