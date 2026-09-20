// Conexão pública do jogo com a função protegida de sessões no Supabase.
// A chave abaixo é PUBLICÁVEL. Nunca incluir service_role ou senha de administrador aqui.
(function () {
  "use strict";
  const URL = "https://mbnlnqtuwmukizbezmug.supabase.co/functions/v1/protocol-session";
  const PUBLIC_KEY = "sb_publishable_iCGm-bMY0Z5coie6kHUtLQ_48b7nciY";
  const normalize = (value) => String(value || "").trim().toUpperCase().replace(/\s+/g, " ");
  const tokenKey = (ref) => "delectus:session-token:v1:" + ref;
  const pendingKey = (ref) => "delectus:pending-stage:v1:" + ref;
  const state = { ref: null, token: null, queue: Promise.resolve() };

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
    const result = await request("open", { reference: ref, token });
    if (!result.token || result.reference !== ref)
      throw new Error("Resposta de sessão inválida.");
    localStorage.setItem(tokenKey(ref), result.token);
    state.ref = ref;
    state.token = result.token;
    state.queue = Promise.resolve();
    const saved = typeof loadProgress === "function" ? loadProgress(ref) : 0;
    const pending = Number(localStorage.getItem(pendingKey(ref))) || 0;
    const remote = Number(result.currentStage) || 0;
    if (Math.max(saved, pending) > remote) enqueueStage(ref, Math.max(saved, pending));
    return { reference: ref };
  }
  function reset(ref) {
    if (!ref) return;
    localStorage.removeItem(tokenKey(ref));
    localStorage.removeItem(pendingKey(ref));
    state.ref = null;
    state.token = null;
    state.queue = Promise.resolve();
    // Uma nova sessão representa a tentativa reiniciada.
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
  window.DelectusSync = { open, normalize };
})();
