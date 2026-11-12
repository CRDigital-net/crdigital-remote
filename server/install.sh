#!/usr/bin/env bash
# CRDigital Remote – Server-Einrichtung auf Ubuntu 22.04 / 24.04
# Aufruf auf der neuen VM:   sudo ./install.sh
# Das Skript ist wiederholbar: ein zweiter Lauf aktualisiert nur.
set -euo pipefail

DIR=/opt/crd-remote
HOST="${CRD_REMOTE_HOST:-remote.cr-digital.net}"
HERE="$(cd "$(dirname "$0")" && pwd)"

[ "$(id -u)" -eq 0 ] || { echo "Bitte mit sudo ausführen."; exit 1; }

echo "== 1/5 Docker"
if ! command -v docker >/dev/null; then
  apt-get update -qq
  apt-get install -y -qq docker.io docker-compose-v2
fi
systemctl enable --now docker >/dev/null

echo "== 2/5 Dateien nach $DIR"
mkdir -p "$DIR/data"
chmod 700 "$DIR/data"
cp "$HERE/docker-compose.yml" "$DIR/docker-compose.yml"
cp "$HERE/backup-key.sh" "$DIR/backup-key.sh" && chmod 700 "$DIR/backup-key.sh"
[ -f "$DIR/.env" ] || echo "CRD_REMOTE_HOST=$HOST" > "$DIR/.env"

echo "== 3/5 Firewall auf der VM (ufw)"
if command -v ufw >/dev/null && ufw status | grep -q "Status: active"; then
  ufw allow 21115:21117/tcp comment "CRDigital Remote" >/dev/null
  ufw allow 21116/udp comment "CRDigital Remote" >/dev/null
  echo "   Ports 21115-21117/tcp und 21116/udp freigegeben."
else
  echo "   ufw ist nicht aktiv, nichts geändert."
fi

echo "== 4/5 Server starten"
cd "$DIR"
docker compose pull -q
docker compose up -d
for _ in $(seq 1 20); do [ -s "$DIR/data/id_ed25519.pub" ] && break; sleep 1; done
[ -s "$DIR/data/id_ed25519.pub" ] || { echo "FEHLER: Schlüssel wurde nicht erzeugt. Log: docker logs crd-remote-hbbs"; exit 1; }
chmod 600 "$DIR/data/id_ed25519"

echo "== 5/5 Prüfung"
ok=1
for p in 21115 21116 21117; do
  if ss -ltn | grep -q ":$p "; then echo "   TCP $p lauscht"; else echo "   FEHLER: TCP $p lauscht nicht"; ok=0; fi
done
if ss -lun | grep -q ":21116 "; then echo "   UDP 21116 lauscht"; else echo "   FEHLER: UDP 21116 lauscht nicht"; ok=0; fi
[ "$ok" -eq 1 ] || { echo "Server läuft nicht vollständig. Log: docker logs crd-remote-hbbs"; exit 1; }

cat <<MSG

Fertig. Der Server läuft unter $DIR.

Öffentlicher Schlüssel (als Secret CRD_KEY bei GitHub eintragen):

  $(cat "$DIR/data/id_ed25519.pub")

Noch zu tun:
  1. pfSense: Portweiterleitung auf diese VM
       TCP 21115-21117  und  UDP 21116
  2. DNS: A-Eintrag  $HOST  ->  öffentliche IP
  3. Privaten Schlüssel sichern:  sudo $DIR/backup-key.sh
  4. Von außen prüfen (anderer Rechner):  nc -vz $HOST 21116
MSG
