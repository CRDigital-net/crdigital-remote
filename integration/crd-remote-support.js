/*!
 * CRDigital Remote – Fernwartungs-Button für alle CRDigital-Anwendungen
 * Quelle: github.com/CRDigital-net/crdigital-remote (integration/crd-remote-support.js)
 *
 * Einbinden:
 *   <script src="https://cr-digital.net/js/crd-remote-support.js" defer></script>
 *   <crd-remote-support product="ProtoKI"></crd-remote-support>
 *
 * Attribute (alle optional):
 *   product        Name der Anwendung, erscheint im Dialog und in der Störungsmeldung
 *   variant        "button" (Standard), "floating" (unten rechts) oder "link"
 *   label          Beschriftung
 *   theme          "light" (Standard), "dark" oder "auto" (folgt dem Betriebssystem)
 *   download-url   Download der Fernwartung
 *   support-url    Seite für die Störungsmeldung
 *   support-email  Support-Adresse
 */
(() => {
  const DEFAULTS = {
    downloadUrl: "https://cr-digital.net/download/CRDigitalRemote-Support.exe",
    supportUrl: "https://cr-digital.net/kontakt/?thema=support",
    supportEmail: "support@cr-digital.net",
    privacyUrl: "https://cr-digital.net/datenschutz/#fernwartung",
    label: "Fernwartung starten",
  };

  const MARK = "data:image/webp;base64,UklGRlYEAABXRUJQVlA4IEoEAABwFACdASo4ADgAPm0mkEWkIaGXDbaoQAbEtgBOmVU/U+G8zurf3qxJerP8ob1nzE/s96unoL/znp/9S1vJX7melpTSZpy5WWRpkpnvjW+r/YF6UHooN1uZUl3cRvDe4/FLtYXKxrVmWg4AI/wO+rd6hF/aic07ZR/CkxdnT/wdsbM7K4FwWe5O8cXhTHcjuhFR+/bDO4vxvvpmKnigpzRX45gWmoqcNiO79kI8AP7/sRGgZVbkf/cygZW9JpZid0TWc0SXbarttMCrQbwy1MnA67rNfmP6pMGGAVRQTxzN1CUaEPdrliS0c8lPaDxSByrwmhshDYr6xYL32XqHrORIZ7f9PbWbPJX9f+kG5PRgAj1ruLKFRkQfPxxa3a8CTtGRDSoFjOke7MFFyHhxqPePelFatVb7Oc8r51ifomWWKWVr+xYKSjnI22X0ykLqXZ7DYHGfQWz2zJk3QIA0Z7bDPVhVa07rxtn9z3kW6dNBJkh+DGg6hvGpfeHZ9XHm3IWypCW8rlm2X6EIVVv2lF4DxQfa27+3T9L/P7auc5AHWlyNShswBQwGYb9849/3ZcLmb3TTPJ+9+r3lBvkPaBzKyqKnf9S6YC1G1OawGKrPt/zplhcDADjwXApWhXUsmzKLHg6+8ovaLn4WZOBAxMhxduVb1W724PHShS0ho9ll0JMUxOR9LHTTx2qs2SjOLOLmuNK71Em4fky5w35cK9iuDAUv/NjMxgsM1Gs9SRvi0TN266ps1s92nNpZo8nGRhWgmR+5WUhXpl0ZxaYS1IzxPVr/q93QsoWDowHS310eU++34ZwSNTG7no1zY/TFIoQy+xUu904k5MTMSIjzmfp4RGkzLxnY50rbvBgbJeyEat7YRGD/dwrwi8E73ndli5Rcxo+8Y/9q0l9iXL80ZpldEZ463RckQ8bVnrfNh5Q2XLP/acXHVvsZnXqzzsh1wqwAnGKJWlAxLBNejonB2yPaoE99i+N1CIarYp0ne2FZpOIiVp5k/z+PQVLS8KKF9dCpRrn2iVXF4FMD+OwiG3lWkCf7wMcVGFAjY0OTuZHUUiXNHFT68/gAoMszzIwcpJVYW1Q/k6VShdLNScOKAoh2woMrFRl1jtkad7WfjXb6Mk01ygXNU9suGrePg8880LAHaeXwTYSKYi3PHqc6W19vC8pqnj6Itk5crNnYbnnHDR4gpcF0wehb6KDrJaFsfe4OJVQyy6Ew9r8dujqgGD8/+XNY4PXNgHuOnD9OgD1ZiCfPs/574Y04jYS7jCfF38slX80CrZ3cOyLT7EYdLV5XrjBiYiVsgNJpnC8hmk8x7t1NKpA57Feqo7eLzRS6bUP2oW8ZI5qQ98nmnaVj64hG22Px09PFFhNqqnRPwvhxiv+qUtA1aptTvgrPDXqrpP0WbCpmf3044zLPECDoGNKyWaV0WgMUCMa1Ek9US+NK8Y9deBgxHAAAAAA=";

  const CSS = `
  :host { display:inline-block; font-family:var(--crd-font, inherit); }
  * { box-sizing:border-box; }
  .t { --navy:#0a1428; --blue:#1a73ff; --blue-h:#0f5fe0; --chrome:#c7d0dd; --ink:#0e1a2e; --muted:#46556d;
       --bg:#ffffff; --soft:#f3f6fa; --line:#d7dee8; --num-bg:#e8f1ff; --num:#0f4fb3; --link:#0f5fe0; }
  .t.dark { --ink:#e8edf4; --muted:#a9b6c8; --bg:#0f1f3d; --soft:#0a1428; --line:rgba(199,208,221,.2);
            --num-bg:#18305a; --num:#6fb0ff; --link:#6fb0ff; }
  @media (prefers-color-scheme: dark) {
    .t.auto { --ink:#e8edf4; --muted:#a9b6c8; --bg:#0f1f3d; --soft:#0a1428; --line:rgba(199,208,221,.2);
              --num-bg:#18305a; --num:#6fb0ff; --link:#6fb0ff; }
  }
  .btn { display:inline-flex; align-items:center; gap:.6em; border:1px solid transparent; cursor:pointer; text-decoration:none;
         font-family:inherit; font-size:1rem; font-weight:600; line-height:1.2;
         background:var(--blue); color:#fff; padding:.72em 1.15em; border-radius:6px; transition:background .15s; }
  .btn:hover { background:var(--blue-h); }
  .btn:focus-visible { outline:3px solid #6fb0ff; outline-offset:2px; }
  .btn img { width:1.5em; height:1.5em; flex:none; border-radius:4px; }
  .link { background:none; color:var(--link); padding:0; border:0; text-decoration:underline; }
  .link:hover { background:none; }
  :host([variant="floating"]) { position:fixed; right:20px; bottom:20px; z-index:2147483000; }
  :host([variant="floating"]) .btn { border-radius:999px; box-shadow:0 8px 24px rgba(6,11,24,.35); }
  .backdrop { position:fixed; inset:0; background:rgba(6,11,24,.62); display:none; align-items:center; justify-content:center;
              padding:16px; z-index:2147483001; font-family:var(--crd-font, inherit); }
  .backdrop.open { display:flex; }
  .dlg { background:var(--bg); color:var(--ink); width:min(480px,100%); max-height:calc(100vh - 32px); overflow:auto;
         border-radius:10px; box-shadow:0 24px 60px rgba(0,0,0,.35); font-size:1rem; line-height:1.5; }
  .head { background:var(--navy); color:#fff; padding:18px 20px; display:flex; gap:14px; align-items:center; border-radius:10px 10px 0 0; }
  .head img { width:44px; height:44px; flex:none; border-radius:9px; }
  .head h2 { margin:0; font-size:1.15rem; line-height:1.25; font-family:var(--font-display, inherit); color:#fff; }
  .head p { margin:2px 0 0; font-size:.85rem; color:var(--chrome); }
  .body { padding:20px 20px 4px; }
  ol { margin:0; padding:0; list-style:none; counter-reset:s; }
  li { counter-increment:s; display:flex; gap:12px; margin-bottom:14px; font-size:.95rem; }
  li::before { content:counter(s); flex:none; width:26px; height:26px; border-radius:50%; background:var(--num-bg); color:var(--num);
               font-weight:700; display:flex; align-items:center; justify-content:center; font-size:.82rem; }
  .note { font-size:.84rem; color:var(--muted); background:var(--soft); border:1px solid var(--line); border-radius:6px;
          padding:10px 12px; margin:0 0 10px; }
  .note b { color:var(--ink); }
  .legal { font-size:.78rem; color:var(--muted); margin:0 0 12px; }
  .foot { display:flex; gap:8px; justify-content:flex-end; padding:0 20px 18px; flex-wrap:wrap; }
  .ghost { background:transparent; color:var(--ink); border-color:var(--line); }
  .ghost:hover { background:var(--soft); }
  a { color:var(--link); }
  a.btn { color:#fff; } a.btn.ghost { color:var(--ink); }`;

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  class CrdRemoteSupport extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) {
        if (this._portal && !this._portal.isConnected) document.body.appendChild(this._portal);
        return;
      }
      const product = this.getAttribute("product") || "";
      const label = this.getAttribute("label") || DEFAULTS.label;
      const variant = this.getAttribute("variant") || "button";
      const theme = ["dark", "auto"].includes(this.getAttribute("theme")) ? this.getAttribute("theme") : "light";
      const email = this.getAttribute("support-email") || DEFAULTS.supportEmail;
      let supportUrl = this.getAttribute("support-url") || DEFAULTS.supportUrl;
      if (product && !this.hasAttribute("support-url")) supportUrl += "&produkt=" + encodeURIComponent(product);
      this._url = this.getAttribute("download-url") || DEFAULTS.downloadUrl;
      const isWin = /Windows/i.test(navigator.userAgent);

      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>${CSS}</style>
        <span class="t ${theme}"><button class="btn ${variant === "link" ? "link" : ""}" part="button" type="button" aria-haspopup="dialog">
          ${variant === "link" ? "" : `<img src="${MARK}" alt="">`}<span>${esc(label)}</span>
        </button></span>`;

      // Dialog direkt unter <body>, damit kein Stacking-Context der App ihn überdeckt
      this._portal = document.createElement("div");
      this._portal.setAttribute("data-crd-remote-dialog", "");
      document.body.appendChild(this._portal);
      const dlgRoot = this._portal.attachShadow({ mode: "open" });
      dlgRoot.innerHTML = `
        <style>${CSS}</style>
        <div class="backdrop t ${theme}" role="dialog" aria-modal="true" aria-labelledby="t">
          <div class="dlg">
            <div class="head"><img src="${MARK}" alt=""><div><h2 id="t">CRDigital Fernwartung</h2>
              <p>${product ? `Support für ${esc(product)}` : "Direkte Hilfe vom CRDigital-Support"}</p></div></div>
            <div class="body">
              ${isWin ? `
              <ol>
                <li><span>Der Download startet automatisch. Öffnen Sie die Datei <b>CRDigitalRemote-Support.exe</b>.</span></li>
                <li><span>Nennen Sie Ihrem Ansprechpartner <b>am Telefon</b> die angezeigte <b>ID</b> und das <b>Passwort</b>.</span></li>
                <li><span>Sie sehen jederzeit, was geschieht. Mit dem Schließen des Programms ist die Sitzung beendet.</span></li>
              </ol>
              <p class="note"><b>Windows fragt nach?</b> Wählen Sie „Weitere Informationen“ und dann „Trotzdem ausführen“. Eine Installation ist nicht nötig. Download startet nicht? <a href="${esc(this._url)}" data-dl>Hier klicken</a>.</p>
              ` : `
              <p class="note">Die Fernwartung gibt es derzeit für <b>Windows</b>. Bitte öffnen Sie diese Seite an dem Windows-PC, um den es geht, oder melden Sie die Störung über den Knopf unten.</p>
              `}
              <p class="note"><b>Noch nicht verabredet?</b> Melden Sie zuerst die Störung. Der Support ruft Sie für die Fernwartung zurück. Das Passwort bitte nie per E-Mail senden.</p>
              <p class="legal">Die Verbindung läuft verschlüsselt über den CRDigital-Server in Deutschland. <a href="${DEFAULTS.privacyUrl}" target="_blank" rel="noopener">Datenschutzhinweise</a> · <a href="mailto:${esc(email)}">${esc(email)}</a></p>
            </div>
            <div class="foot">
              <a class="btn ghost" href="${esc(supportUrl)}" target="_blank" rel="noopener">Störung melden</a>
              <button class="btn" type="button" data-close>Schließen</button>
            </div>
          </div>
        </div>`;

      const opener = root.querySelector("button");
      const bd = dlgRoot.querySelector(".backdrop");
      const close = () => { bd.classList.remove("open"); opener.focus(); };
      opener.addEventListener("click", () => {
        bd.classList.add("open");
        dlgRoot.querySelector("[data-close]").focus();
        if (isWin) this._download();
      });
      dlgRoot.querySelector("[data-close]").addEventListener("click", close);
      bd.addEventListener("click", (e) => { if (e.target === bd) close(); });
      dlgRoot.addEventListener("keydown", (e) => {
        if (e.key === "Escape") close();
        if (e.key !== "Tab") return;
        const f = dlgRoot.querySelectorAll("a[href],button");
        const first = f[0], last = f[f.length - 1], cur = dlgRoot.activeElement;
        if (e.shiftKey && cur === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && cur === last) { e.preventDefault(); first.focus(); }
      });
      const retry = dlgRoot.querySelector("[data-dl]");
      if (retry) retry.addEventListener("click", (e) => { e.preventDefault(); this._download(); });
    }

    disconnectedCallback() {
      if (this._portal) this._portal.remove();
    }

    _download() {
      const a = document.createElement("a");
      a.href = this._url;
      a.rel = "noopener";
      a.download = "CRDigitalRemote-Support.exe";
      document.body.appendChild(a);
      a.click();
      a.remove();
      this.dispatchEvent(new CustomEvent("crd-remote-download", { bubbles: true, composed: true }));
    }
  }

  if (!customElements.get("crd-remote-support")) customElements.define("crd-remote-support", CrdRemoteSupport);
})();
