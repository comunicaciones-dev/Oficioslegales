(function () {
  "use strict";

  const form = document.getElementById("oficio-form");

  const fields = {
    logoInput: document.getElementById("logo-input"),
    logoClear: document.getElementById("logo-clear"),
    marginTop: document.getElementById("margin-top"),
    marginRight: document.getElementById("margin-right"),
    marginBottom: document.getElementById("margin-bottom"),
    marginLeft: document.getElementById("margin-left"),
    placeDate: document.getElementById("place-date"),
    oficioNumber: document.getElementById("oficio-number"),
    useRef: document.getElementById("use-ref"),
    refValue: document.getElementById("ref-value"),
    useMat: document.getElementById("use-mat"),
    matValue: document.getElementById("mat-value"),
    useAdj: document.getElementById("use-adj"),
    adjValue: document.getElementById("adj-value"),
    aValue: document.getElementById("a-value"),
    deValue: document.getElementById("de-value"),
    bodyValue: document.getElementById("body-value"),
    signerName: document.getElementById("signer-name"),
    signerTitle: document.getElementById("signer-title"),
  };

  const docNodes = {
    root: document.getElementById("document"),
    padding: document.querySelector(".doc-padding"),
    logo: document.getElementById("doc-logo"),
    placeDate: document.getElementById("doc-place-date"),
    number: document.getElementById("doc-number"),
    meta: document.getElementById("doc-meta"),
    parties: document.getElementById("doc-parties"),
    body: document.getElementById("doc-body"),
    signature: document.getElementById("doc-signature"),
  };

  let logoDataUrl = "";

  // Bind optional fields: enable/disable input when checkbox changes.
  const optionalGroups = [
    { chk: fields.useRef, input: fields.refValue },
    { chk: fields.useMat, input: fields.matValue },
    { chk: fields.useAdj, input: fields.adjValue },
  ];

  optionalGroups.forEach(({ chk, input }) => {
    chk.addEventListener("change", () => {
      input.disabled = !chk.checked;
      if (chk.checked) input.focus();
      render();
    });
  });

  // Form inputs trigger re-render.
  form.addEventListener("input", render);
  form.addEventListener("change", render);

  // Logo upload.
  fields.logoInput.addEventListener("change", (evt) => {
    const file = evt.target.files && evt.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      logoDataUrl = e.target.result;
      render();
    };
    reader.readAsDataURL(file);
  });

  fields.logoClear.addEventListener("click", () => {
    logoDataUrl = "";
    fields.logoInput.value = "";
    render();
  });

  // Reset.
  document.getElementById("btn-reset").addEventListener("click", () => {
    if (!confirm("¿Limpiar todos los campos?")) return;
    form.reset();
    logoDataUrl = "";
    optionalGroups.forEach(({ chk, input }) => {
      input.disabled = !chk.checked;
    });
    render();
  });

  // Download PDF.
  document.getElementById("btn-download").addEventListener("click", downloadPdf);

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function render() {
    // Margins.
    const mt = parseFloat(fields.marginTop.value) || 0;
    const mr = parseFloat(fields.marginRight.value) || 0;
    const mb = parseFloat(fields.marginBottom.value) || 0;
    const ml = parseFloat(fields.marginLeft.value) || 0;
    docNodes.padding.style.padding = `${mt}cm ${mr}cm ${mb}cm ${ml}cm`;

    // Logo.
    if (logoDataUrl) {
      docNodes.logo.src = logoDataUrl;
      docNodes.logo.classList.add("visible");
    } else {
      docNodes.logo.removeAttribute("src");
      docNodes.logo.classList.remove("visible");
    }

    // Place/date and number.
    docNodes.placeDate.textContent = fields.placeDate.value.trim();
    docNodes.number.textContent = fields.oficioNumber.value.trim();

    // Meta (REF, MAT, ADJ).
    const metaRows = [];
    if (fields.useRef.checked) {
      metaRows.push(metaRow("REF:", fields.refValue.value));
    }
    if (fields.useMat.checked) {
      metaRows.push(metaRow("MAT:", fields.matValue.value));
    }
    if (fields.useAdj.checked) {
      metaRows.push(metaRow("ADJ:", fields.adjValue.value));
    }
    docNodes.meta.innerHTML = metaRows.join("");

    // Parties (A, DE).
    const partyRows = [];
    const aVal = fields.aValue.value.trim();
    const deVal = fields.deValue.value.trim();
    if (aVal) partyRows.push(partyRow("A:", aVal));
    if (deVal) partyRows.push(partyRow("DE:", deVal));
    docNodes.parties.innerHTML = partyRows.join("");

    // Body.
    docNodes.body.textContent = fields.bodyValue.value;

    // Signature.
    const signerName = fields.signerName.value.trim();
    const signerTitle = fields.signerTitle.value.trim();
    if (signerName || signerTitle) {
      docNodes.signature.innerHTML =
        `<div class="signer-name">${escapeHtml(signerName)}</div>` +
        (signerTitle
          ? `<div class="signer-title">${escapeHtml(signerTitle)}</div>`
          : "");
    } else {
      docNodes.signature.innerHTML = "";
    }
  }

  function metaRow(label, value) {
    return (
      `<div class="meta-row">` +
      `<span class="meta-label">${escapeHtml(label)}</span>` +
      `<span class="meta-value">${escapeHtml(value)}</span>` +
      `</div>`
    );
  }

  function partyRow(label, value) {
    return (
      `<div class="party-row">` +
      `<span class="party-label">${escapeHtml(label)}</span>` +
      `<span class="party-value">${escapeHtml(value)}</span>` +
      `</div>`
    );
  }

  function downloadPdf() {
    if (typeof html2pdf === "undefined") {
      alert(
        "No se pudo cargar la librería de PDF. Revisa tu conexión a internet."
      );
      return;
    }

    const element = docNodes.root;
    const filename = buildFilename();

    const opt = {
      margin: 0,
      filename,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] },
    };

    html2pdf().set(opt).from(element).save();
  }

  function buildFilename() {
    const num = fields.oficioNumber.value.trim();
    const safe = num
      ? num.replace(/[^\w\-\.]+/g, "_")
      : "oficio";
    return `${safe}.pdf`;
  }

  render();
})();
