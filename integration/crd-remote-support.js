/*!
 * CRDigital Remote – Fernwartungs-Button für alle CRDigital-Anwendungen
 * Einbinden:
 *   <script src="https://cr-digital.net/assets/crd-remote-support.js" defer></script>
 *   <crd-remote-support product="ProtoKI"></crd-remote-support>
 *
 * Attribute (alle optional):
 *   product        Name der Anwendung, erscheint im Dialog
 *   variant        "button" (Standard), "floating" (unten rechts) oder "link"
 *   download-url   Download der Fernwartung
 *   support-email  Support-Adresse
 *   label          Beschriftung
 */
(() => {
  const DEFAULTS = {
    downloadUrl:
      "https://github.com/CRDigital-net/crdigital-remote/releases/download/latest/CRDigitalRemote-Support.exe",
    supportEmail: "support@cr-digital.net",
    label: "Fernwartung",
  };

  const ICON = `<svg viewBox="0 0 256 256" aria-hidden="true"><polygon points="128,8 232,68 232,188 128,248 24,188 24,68" fill="#0B2545" stroke="#C9D1DB" stroke-width="12" stroke-linejoin="round"/><polygon points="128,30 213,79 213,177 128,226 43,177 43,79" fill="none" stroke="#1F5FAD" stroke-width="7"/><g fill="none" stroke="#C9D1DB" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M125,104 A34,34 0 1 0 125,152"/><path d="M153,94 V162 M153,94 H171 A17,17 0 0 1 171,128 H153 M167,128 L189,162"/></g></svg>`;

  const CSS = `
  :host { --navy:#0B2545; --blue:#1F5FAD; --blue-h:#184C8C; --silver:#C9D1DB; --ink:#0B2545; --muted:#5A6B82; --bg:#fff; --line:#E3E8EF;
          font-family: Inter, "Segoe UI", system-ui, sans-serif; display:inline-block; }
  * { box-sizing:border-box; }
  .btn { display:inline-flex; align-items:center; gap:.55em; border:0; text-decoration:none; cursor:pointer; font-family:inherit; font-size:15px; font-weight:600; line-height:1;
         background:var(--blue); color:#fff; padding:.75em 1.1em; border-radius:10px; transition:background .15s, transform .15s; }
  .btn:hover { background:var(--blue-h); }
  .btn:active { transform:translateY(1px); }
  .btn:focus-visible { outline:3px solid var(--silver); outline-offset:2px; }
  .btn svg { width:1.35em; height:1.35em; flex:none; }
  .link { background:none; color:var(--blue); padding:0; font-weight:600; }
  .link:hover { background:none; text-decoration:underline; }
  :host([variant="floating"]) { position:fixed; right:20px; bottom:20px; z-index:2147483000; }
  :host([variant="floating"]) .btn { border-radius:999px; box-shadow:0 8px 24px rgba(11,37,69,.28); padding:.85em 1.25em; }
  .backdrop { position:fixed; inset:0; background:rgba(11,37,69,.55); display:none; align-items:center; justify-content:center; padding:16px; z-index:2147483001; }
  .backdrop.open { display:flex; }
  .dlg { background:var(--bg); color:var(--ink); width:min(460px,100%); border-radius:16px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,.3); }
  .head { background:var(--navy); color:#fff; padding:18px 20px; display:flex; gap:12px; align-items:center; }
  .head svg { width:40px; height:40px; flex:none; }
  .head h2 { margin:0; font-size:18px; }
  .head p { margin:2px 0 0; font-size:13px; color:var(--silver); }
  .body { padding:20px; }
  ol { margin:0; padding:0; list-style:none; counter-reset:s; }
  li { counter-increment:s; display:flex; gap:12px; margin-bottom:14px; font-size:14.5px; line-height:1.45; }
  li::before { content:counter(s); flex:none; width:26px; height:26px; border-radius:50%; background:#EAF1FA; color:var(--blue);
               font-weight:700; display:flex; align-items:center; justify-content:center; font-size:13px; }
  .note { font-size:13px; color:var(--muted); background:#F5F7FA; border:1px solid var(--line); border-radius:10px; padding:10px 12px; margin-top:6px; }
  .foot { display:flex; gap:8px; justify-content:flex-end; padding:0 20px 18px; flex-wrap:wrap; }
  .ghost { background:#fff; color:var(--ink); border:1px solid var(--line); }
  .ghost:hover { background:#F5F7FA; }
  a { color:var(--blue); }
  @media (prefers-color-scheme: dark) {
    :host { --bg:#121A26; --ink:#E8EDF4; --muted:#A3B0C2; --line:#253246; }
    li::before { background:#1B2A40; color:#8FB3E8; }
    .note { background:#172233; }
    .ghost { background:#172233; color:var(--ink); }
    .ghost:hover { background:#1B2A40; }
    a { color:#8FB3E8; }
  }`;

  class CrdRemoteSupport extends HTMLElement {
    connectedCallback() {
      if (this.shadowRoot) {
        if (this._portal && !this._portal.isConnected) document.body.appendChild(this._portal);
        return;
      }
      const product = this.getAttribute("product") || "";
      const label = this.getAttribute("label") || DEFAULTS.label;
      const variant = this.getAttribute("variant") || "button";
      const email = this.getAttribute("support-email") || DEFAULTS.supportEmail;
      this._url = this.getAttribute("download-url") || DEFAULTS.downloadUrl;
      const isWin = /Windows/i.test(navigator.userAgent);
      const subject = encodeURIComponent(`Fernwartung${product ? " – " + product : ""}`);

      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
        <style>${CSS}</style>
        <button class="btn ${variant === "link" ? "link" : ""}" part="button" type="button">
          ${variant === "link" ? "" : ICON}<span>${label}</span>
        </button>`;

      // Dialog direkt unter <body>, damit kein Stacking-Context der App ihn überdeckt
      this._portal = document.createElement("div");
      this._portal.setAttribute("data-crd-remote-dialog", "");
      document.body.appendChild(this._portal);
      const dlgRoot = this._portal.attachShadow({ mode: "open" });
      dlgRoot.innerHTML = `
        <style>${CSS}</style>
        <div class="backdrop" role="dialog" aria-modal="true" aria-labelledby="t">
          <div class="dlg">
            <div class="head">${ICON}<div><h2 id="t">CRDigital Fernwartung</h2>
              <p>${product ? `Support für ${product}` : "Direkte Hilfe vom CRDigital-Support"}</p></div></div>
            <div class="body">
              ${isWin ? `
              <ol>
                <li><span>Der Download startet automatisch. Öffnen Sie die Datei <b>CRDigitalRemote-Support.exe</b>.</span></li>
                <li><span>Nennen Sie uns die angezeigte <b>ID</b> und das <b>Passwort</b>.</span></li>
                <li><span>Bestätigen Sie die Verbindung. Sie sehen jederzeit, was wir tun, und können die Sitzung beenden.</span></li>
              </ol>
              <div class="note">Keine Installation nötig. Die Verbindung läuft verschlüsselt über unseren Server in Deutschland. Download startet nicht? <a href="${this._url}" data-dl>Hier klicken</a>.</div>
              ` : `
              <div class="note">Die Fernwartung ist derzeit für <b>Windows</b> verfügbar. Bitte öffnen Sie diese Seite an einem Windows-PC oder schreiben Sie uns, wir finden eine Lösung.</div>
              `}
            </div>
            <div class="foot">
              <a class="btn ghost" href="mailto:${email}?subject=${subject}">Support anschreiben</a>
              <button class="btn" type="button" data-close>Schließen</button>
            </div>
          </div>
        </div>`;

      const bd = dlgRoot.querySelector(".backdrop");
      const close = () => bd.classList.remove("open");
      root.querySelector("button.btn[part=button]").addEventListener("click", () => {
        bd.classList.add("open");
        dlgRoot.querySelector("[data-close]").focus();
        if (isWin) this._download();
      });
      dlgRoot.querySelector("[data-close]").addEventListener("click", close);
      bd.addEventListener("click", (e) => { if (e.target === bd) close(); });
      dlgRoot.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
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
