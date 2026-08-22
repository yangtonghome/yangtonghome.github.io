(() => {
  const form = document.querySelector("#note-lock");
  const slot = document.querySelector("#note-content");
  const cipherNode = document.querySelector("#note-cipher");
  if (!form || !slot || !cipherNode) return;

  const payload = JSON.parse(cipherNode.textContent);
  const storageKey = `note-unlock:${payload.slug}`;
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const fromB64 = (value) =>
    Uint8Array.from(atob(value), (char) => char.charCodeAt(0));

  async function deriveKey(password, salt) {
    const material = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"],
    );
  }

  async function decrypt(password) {
    const key = await deriveKey(password, fromB64(payload.salt));
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(payload.iv) },
      key,
      fromB64(payload.cipher),
    );
    return decoder.decode(plain);
  }

  function show(html) {
    slot.innerHTML = html;
    window.renderMathInElement?.(slot, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "$", right: "$", display: false },
        { left: "\\(", right: "\\)", display: false },
      ],
      throwOnError: false,
    });
    window.dispatchEvent(new Event("note-unlocked"));
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const error = form.querySelector(".lock-error");
    const password = new FormData(form).get("password") || "";
    try {
      const html = await decrypt(String(password));
      sessionStorage.setItem(storageKey, String(password));
      show(html);
    } catch {
      if (error) error.hidden = false;
    }
  });

  const remembered = sessionStorage.getItem(storageKey);
  if (remembered) {
    decrypt(remembered)
      .then(show)
      .catch(() => sessionStorage.removeItem(storageKey));
  }
})();
