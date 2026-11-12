#!/usr/bin/env bash
# CRDigital Remote – legt auf einem Proxmox-Knoten die Server-VM an und richtet sie ein.
#
# Auf dem Proxmox-Knoten als root ausführen (dort, wo die Vorlage-VM liegt):
#
#   ./proxmox-create-vm.sh <ID einer vorhandenen VM im Zielnetz> <freie IP>
#   ./proxmox-create-vm.sh 101 10.77.10.60
#
# Bridge, VLAN und Speicher werden von der genannten VM übernommen (z. B. der nginx-VM),
# damit die neue VM im selben Netz und auf demselben Speicher landet.
#
# Was passiert:
#   1. Ubuntu-24.04-Cloud-Image laden (einmalig)
#   2. VM anlegen: 1 vCPU, 1 GB RAM, 8 GB Platte, feste IP
#   3. Beim ersten Start installiert die VM selbst Docker und den Fernwartungsserver
#   4. Am Ende zeigt das Skript den öffentlichen Schlüssel (für das GitHub-Secret CRD_KEY)
set -euo pipefail

REF_VM="${1:?Aufruf: $0 <ID einer vorhandenen VM im Zielnetz> <freie IP>   z. B. $0 101 10.77.10.60}"
IP="${2:?Freie IP-Adresse fehlt, z. B. 10.77.10.60}"

# --- Bei Bedarf anpassen -----------------------------------------------------
NAME="${CRD_VM_NAME:-remote}"
PREFIX="${CRD_PREFIX:-24}"                          # Netzmaske
GATEWAY="${CRD_GATEWAY:-${IP%.*}.1}"                # Standard: .1 im selben Netz (pfSense)
DNS="${CRD_DNS:-$GATEWAY}"
CORES=1; MEMORY=1024; DISK=8G
VM_USER=crd
REMOTE_HOST="${CRD_REMOTE_HOST:-remote.cr-digital.net}"
RAW="https://raw.githubusercontent.com/CRDigital-net/crdigital-remote/main/server"
IMG_URL="https://cloud-images.ubuntu.com/noble/current/noble-server-cloudimg-amd64.img"
IMG="/var/lib/vz/template/iso/noble-server-cloudimg-amd64.img"
# -----------------------------------------------------------------------------

die() { echo "FEHLER: $*" >&2; exit 1; }
command -v qm >/dev/null || die "Bitte auf einem Proxmox-Knoten ausführen."
[ "$(id -u)" -eq 0 ] || die "Bitte als root ausführen."
[[ "$IP" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || die "Ungültige IP: $IP"

echo "== 1/6 Netz und Speicher von VM $REF_VM übernehmen"
CFG="$(qm config "$REF_VM" 2>/dev/null)" || die "VM $REF_VM gibt es auf diesem Knoten nicht. Vorhandene VMs: qm list"
NETLINE="$(grep -m1 '^net0:' <<<"$CFG")" || die "VM $REF_VM hat keine Netzwerkkarte net0."
BRIDGE="$(sed -n 's/.*bridge=\([^,]*\).*/\1/p' <<<"$NETLINE")"
VLAN="$(sed -n 's/.*tag=\([0-9]*\).*/\1/p' <<<"$NETLINE")"
STORAGE="$(grep -m1 -E '^(scsi|virtio|sata|ide)[0-9]+: [^,]*:(vm-|[0-9]+/vm-|base-)' <<<"$CFG" | sed -E 's/^[a-z]+[0-9]+: ([^:]+):.*/\1/')"
[ -n "$BRIDGE" ] || die "Bridge von VM $REF_VM nicht erkannt."
[ -n "$STORAGE" ] || die "Speicher von VM $REF_VM nicht erkannt."
NET="virtio,bridge=$BRIDGE${VLAN:+,tag=$VLAN}"
echo "   Bridge $BRIDGE${VLAN:+ (VLAN $VLAN)}, Speicher $STORAGE, IP $IP/$PREFIX, Gateway $GATEWAY"

if ping -c1 -W1 "$IP" >/dev/null 2>&1; then die "Unter $IP antwortet bereits ein Gerät. Bitte eine freie Adresse wählen."; fi

VMID="$(pvesh get /cluster/nextid)"
echo "   Neue VM-ID: $VMID"

echo "== 2/6 Ubuntu-Image"
if [ ! -s "$IMG" ]; then
  mkdir -p "$(dirname "$IMG")"
  wget -q --show-progress -O "$IMG.part" "$IMG_URL" || die "Download des Ubuntu-Images fehlgeschlagen."
  mv "$IMG.part" "$IMG"
else
  echo "   schon vorhanden"
fi

echo "== 3/6 Ablage für die Starteinrichtung (Snippets)"
SNIP_STORE="$(pvesm status --content snippets 2>/dev/null | awk 'NR>1 && $3=="active"{print $1; exit}')"
if [ -z "$SNIP_STORE" ]; then
  CUR="$(pvesh get /storage/local --output-format json | python3 -c 'import sys,json; print(json.load(sys.stdin)["content"])')"
  pvesm set local --content "$CUR,snippets"
  SNIP_STORE=local
  echo "   Inhaltstyp 'Snippets' auf Speicher 'local' eingeschaltet"
fi
SNIP_PATH="$(pvesh get "/storage/$SNIP_STORE" --output-format json | python3 -c 'import sys,json; print(json.load(sys.stdin)["path"])')/snippets"
mkdir -p "$SNIP_PATH"
SNIP_FILE="crd-remote-$VMID.yaml"

PASS="$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)"
HASH="$(openssl passwd -6 "$PASS")"
KEYS=""
if [ -s /root/.ssh/authorized_keys ]; then
  KEYS="$(grep -E '^(ssh-|ecdsa-|sk-)' /root/.ssh/authorized_keys | sed 's/^/      - /')"
fi

umask 077
cat > "$SNIP_PATH/$SNIP_FILE" <<EOF
#cloud-config
hostname: $NAME
manage_etc_hosts: true
timezone: Europe/Berlin
users:
  - name: $VM_USER
    groups: [sudo]
    shell: /bin/bash
    lock_passwd: false
    passwd: '$HASH'
${KEYS:+    ssh_authorized_keys:
$KEYS}
ssh_pwauth: false
package_update: true
packages: [qemu-guest-agent, curl]
write_files:
  - path: /etc/apt/apt.conf.d/20auto-upgrades
    content: |
      APT::Periodic::Update-Package-Lists "1";
      APT::Periodic::Unattended-Upgrade "1";
runcmd:
  - systemctl enable --now qemu-guest-agent
  - mkdir -p /root/crd
  - cd /root/crd && for f in install.sh docker-compose.yml backup-key.sh; do curl -fsSLO --retry 5 $RAW/\$f; done
  - cd /root/crd && chmod +x install.sh backup-key.sh && CRD_REMOTE_HOST=$REMOTE_HOST ./install.sh > /root/crd-install.log 2>&1; echo \$? > /root/crd-install.exit
EOF
umask 022

echo "== 4/6 VM $VMID anlegen"
qm create "$VMID" --name "$NAME" --ostype l26 --cores "$CORES" --memory "$MEMORY" --cpu x86-64-v2-AES \
  --net0 "$NET" --scsihw virtio-scsi-single --agent enabled=1 --onboot 1 --serial0 socket \
  --description "CRDigital Remote – Vermittlungs- und Relay-Server (hbbs/hbbr). Ports TCP 21115-21117, UDP 21116." >/dev/null
# Verzeichnis-Speicher (wie "local"): qcow2, damit Snapshots möglich bleiben
FORMAT=""
case "$(pvesm status --storage "$STORAGE" | awk 'NR>1{print $2}')" in dir|nfs|cifs|glusterfs|btrfs) FORMAT=",format=qcow2";; esac
qm set "$VMID" --scsi0 "$STORAGE:0,import-from=$IMG$FORMAT,discard=on,iothread=1,ssd=1" >/dev/null
qm disk resize "$VMID" scsi0 "$DISK" >/dev/null
qm set "$VMID" --ide2 "$STORAGE:cloudinit" --boot order=scsi0 \
  --ipconfig0 "ip=$IP/$PREFIX,gw=$GATEWAY" --nameserver "$DNS" \
  --cicustom "user=$SNIP_STORE:snippets/$SNIP_FILE" >/dev/null

echo "== 5/6 VM starten und einrichten lassen (dauert 3 bis 6 Minuten)"
qm start "$VMID"
ok=0
for i in $(seq 1 90); do
  sleep 10
  if qm guest exec "$VMID" -- test -f /root/crd-install.exit >/dev/null 2>&1 \
     && qm guest exec "$VMID" -- cat /root/crd-install.exit 2>/dev/null | grep -q '"exitcode" *: *0'; then
    ok=1; break
  fi
  printf '.'
done
echo

echo "== 6/6 Ergebnis"
out() { qm guest exec "$VMID" -- "$@" 2>/dev/null | python3 -c 'import sys,json; print(json.load(sys.stdin).get("out-data","").strip())'; }
if [ "$ok" -eq 1 ] && [ "$(out cat /root/crd-install.exit)" = "0" ]; then
  KEY="$(out cat /opt/crd-remote/data/id_ed25519.pub)"
  cat <<MSG

Fertig. VM $VMID ($NAME) läuft unter $IP.

Anmeldung an der Konsole:  Benutzer $VM_USER   Passwort $PASS
(SSH nur mit Schlüssel${KEYS:+; die Schlüssel aus /root/.ssh/authorized_keys dieses Knotens sind hinterlegt})
Passwort jetzt im Passwortmanager ablegen, es wird nicht noch einmal angezeigt.

Öffentlicher Schlüssel für das GitHub-Secret CRD_KEY:

  $KEY

Noch zu tun:
  1. pfSense: NAT-Portweiterleitung auf $IP   TCP 21115-21117  und  UDP 21116
  2. DNS: A-Eintrag  $REMOTE_HOST  ->  öffentliche IP
  3. Von außen prüfen:  nc -vz $REMOTE_HOST 21116
  4. Privaten Schlüssel sichern (in der VM):  sudo /opt/crd-remote/backup-key.sh
MSG
else
  cat <<MSG

Die VM $VMID wurde angelegt, die Einrichtung ist aber nicht (oder noch nicht) fertig.
Anmeldung an der Konsole:  Benutzer $VM_USER   Passwort $PASS

Prüfen in der VM:
  sudo cat /root/crd-install.log
  sudo cloud-init status --long
Häufigste Ursache: Die VM kommt nicht ins Internet (Gateway $GATEWAY, DNS $DNS, pfSense-Regel für $IP).
Nach der Korrektur in der VM:  cd /root/crd && sudo ./install.sh
VM wieder entfernen:  qm stop $VMID && qm destroy $VMID --purge
MSG
  exit 1
fi
