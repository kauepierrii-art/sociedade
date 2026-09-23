// Conexão pública do jogo com a função protegida de sessões no Supabase.
// A chave abaixo é PUBLICÁVEL. Nunca incluir service_role ou senha de administrador aqui.
(function () {
  "use strict";
  const URL = "https://mbnlnqtuwmukizbezmug.supabase.co/functions/v1/protocol-session";
  const PUBLIC_KEY = "sb_publishable_iCGm-bMY0Z5coie6kHUtLQ_48b7nciY";
  const normalize = (value) => String(value || "").toUpperCase().replace(/[^A-Z]/g, "");
  const tokenKey = (ref) => "delectus:session-token:v1:" + ref;
  const deviceKey = "delectus:device-id:v1";
  const pendingKey = (ref) => "delectus:pending-stage:v1:" + ref;
  const resetKey = (ref) => "delectus:applied-reset:v1:" + ref;
  const state = { ref: null, token: null, queue: Promise.resolve() };

  function deviceId() {
    let value = localStorage.getItem(deviceKey);
    if (!validBrowserToken(value)) {
      value = [...crypto.getRandomValues(new Uint8Array(32))]
        .map((byte) => byte.toString(16).padStart(2, "0")).join("");
      localStorage.setItem(deviceKey, value);
    }
    return value;
  }
  function validBrowserToken(value) {
    return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
  }

  function dispatchAccessResult(detail) {
    document.dispatchEvent(new CustomEvent("delectus:access-result", { detail }));
  }

  async function request(action, payload) {
    const response = await fetch(URL, {
      method: "POST",
      cache: "no-store",
      headers: { "Content-Type": "application/json", apikey: PUBLIC_KEY },
      body: JSON.stringify({ action, ...payload }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(result.error || "Falha na comunicação com o protocolo.");
      error.status = response.status;
      throw error;
    }
    return result;
  }
  function enqueueStage(ref, stage) {
    if (!ref || !Number.isInteger(stage) || stage < 1 || stage > 7) return;
    const previous = Number(localStorage.getItem(pendingKey(ref))) || 0;
    localStorage.setItem(pendingKey(ref), String(Math.max(previous, stage)));
    state.queue = state.queue.catch(() => {}).then(async () => {
      if (state.ref !== ref || !state.token) return;
      const requested = Number(localStorage.getItem(pendingKey(ref))) || 0;
      if (!requested) return;
      try {
        await request("complete", { token: state.token, stage: requested });
        const latest = Number(localStorage.getItem(pendingKey(ref))) || 0;
        if (latest <= requested) localStorage.removeItem(pendingKey(ref));
      } catch (error) {
        // A progressão local não depende de rede; tentar sincronizar no próximo acesso.
        console.warn("Progresso salvo neste navegador; sincronização pendente.", error.status || "rede");
      }
    });
  }
  async function open(reference) {
    const ref = normalize(reference);
    const token = localStorage.getItem(tokenKey(ref)) || undefined;
    const result = await request("open", { reference: ref, token, deviceId: deviceId() });
    if (!result.token || result.reference !== ref)
      throw new Error("Resposta de sessão inválida.");
    localStorage.setItem(tokenKey(ref), result.token);
    state.ref = ref;
    state.token = result.token;
    state.queue = Promise.resolve();
    if (result.resetRequired && result.resetAt && localStorage.getItem(resetKey(ref)) !== result.resetAt) {
      if (typeof window.DelectusClearLocalAttempt === "function") {
        window.DelectusClearLocalAttempt(ref);
      } else {
        localStorage.removeItem(`progress:${ref}`);
        localStorage.removeItem(`progress:v3:${ref}`);
      }
      localStorage.removeItem(pendingKey(ref));
      localStorage.setItem(resetKey(ref), result.resetAt);
      request("ack-reset", { token: state.token, resetAt: result.resetAt })
        .catch(() => console.warn("O reinício local será confirmado no próximo acesso."));
    }
    const saved = typeof loadProgress === "function" ? loadProgress(ref) : 0;
    const pending = Number(localStorage.getItem(pendingKey(ref))) || 0;
    const remote = Number(result.currentStage) || 0;
    if (Math.max(saved, pending) > remote) enqueueStage(ref, Math.max(saved, pending));
    return { reference: ref, label: result.reference };
  }
  function reset(ref) {
    if (!ref) return;
    localStorage.removeItem(tokenKey(ref));
    localStorage.removeItem(pendingKey(ref));
    state.ref = null;
    state.token = null;
    state.queue = Promise.resolve();
    // Uma nova sessão representa a tentativa reiniciada. O histórico anterior
    // continua preservado no painel administrativo.
    open(ref).catch(() => console.warn("Nova sessão será criada no próximo acesso."));
  }
  const originalSave = saveProgress;
  saveProgress = function (ref, stage) {
    originalSave(ref, stage);
    if (ref === currentRefKey) enqueueStage(ref, stage);
  };
  const originalReset = resetActivities;
  resetActivities = function () {
    const ref = currentRefKey;
    originalReset();
    reset(ref);
  };
  const form = document.querySelector("#accessForm");
  const submitButton = form && form.querySelector('button[type="submit"]');
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (submitButton && submitButton.disabled) return;

      const submittedReference = normalize(referenceInput.value);
      if (!submittedReference) {
        loginMessage.textContent = "REFERÊNCIA NÃO LOCALIZADA.";
        dispatchAccessResult({ accepted: false, invalid: true });
        return;
      }

      if (submitButton) submitButton.disabled = true;
      referenceInput.disabled = true;
      loginMessage.textContent = "VERIFICANDO REFERÊNCIA…";
      try {
        const session = await open(submittedReference);
        accessWithReference(session.reference, session.label);
        dispatchAccessResult({ accepted: true });
      } catch (error) {
        const invalid = error && (error.status === 401 || error.status === 403);
        loginMessage.textContent = invalid
          ? "REFERÊNCIA NÃO LOCALIZADA."
          : "NÃO FOI POSSÍVEL VALIDAR A REFERÊNCIA. TENTE NOVAMENTE.";
        if (invalid) dispatchAccessResult({ accepted: false, invalid: true });
        console.warn("Falha ao abrir sessão do protocolo.", error && (error.status || error.message));
      } finally {
        if (submitButton) submitButton.disabled = false;
        referenceInput.disabled = false;
      }
    });
  }

  window.DelectusSync = { open, normalize };
})();

