#!/usr/bin/env bash
# Sichert das Schlüsselpaar des Fernwartungsservers in ein verschlüsseltes Archiv.
# Ohne den privaten Schlüssel müssten nach einem Serverausfall alle Clients neu
# gebaut und bei allen Kunden neu verteilt werden.
#
# Aufruf:  sudo ./backup-key.sh [zielordner]     (Standard: aktueller Ordner)
# Zurück:  gpg -d crd-remote-key-DATUM.tar.gz.gpg | tar -xz -C /opt/crd-remote/data
set -euo pipefail
DIR=/opt/crd-remote/data
OUT="${1:-.}/crd-remote-key-$(date +%F).tar.gz.gpg"
[ -s "$DIR/id_ed25519" ] || { echo "Kein Schlüssel unter $DIR gefunden."; exit 1; }
command -v gpg >/dev/null || DEBIAN_FRONTEND=noninteractive apt-get -o DPkg::Lock::Timeout=600 install -y -qq gnupg
tar -cz -C "$DIR" id_ed25519 id_ed25519.pub | gpg --symmetric --cipher-algo AES256 -o "$OUT"
chmod 600 "$OUT"
echo "Gesichert nach $OUT"
echo "Datei auf den Sicherungsserver kopieren und das Passwort getrennt aufbewahren."
