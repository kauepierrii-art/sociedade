// ETAPA 04 — sintonizador da fita interna
(function () {
  const AUDIO = {
    potentiometer: 'assets/stage4/tuner-potentiometer.mp3',
    lever: 'assets/stage4/tuner-lever.mp3',
    error: 'assets/stage4/tuner-error.mp3',
    success: 'assets/stage4/tuner-success.MP3'
  };

  // Static hosting cannot keep a client-side secret. This verifies a derived
  // digest instead of publishing the four digits as readable source text.
  const expected = '71ff06745a696e1cc0faada1434b219185c0f06e7f5b1ffa9cb1a131a8932fc4';
  const glyphs = [83, 79, 78, 79, 45, 56, 45, 58];

  function digest(value) {
    const input = String.fromCharCode.apply(null, glyphs) + value.split('').reverse().join('');
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(input)).then(buffer =>
      Array.from(new Uint8Array(buffer)).map(byte => byte.toString(16).padStart(2, '0')).join('')
    );
  }

  function randomValues() {
    const values = Array.from({ length: 4 }, () => Math.floor(Math.random() * 9) + 1);
    // Avoid the valid state without storing it alongside the initial values.
    return digest(values.join('')).then(hash => hash === expected ? randomValues() : values);
  }

    function audio(path, preload) {
      const player = new Audio(path);
      player.preload = preload || 'auto';
      return player;
  }

  function renderTuner() {
    const stageName = document.getElementById('stageName');
    if (!stageName || stageName.textContent.trim() !== 'Iniciativa') return;
    const list = document.querySelector('.initiative-material-list');
    if (!list || document.getElementById('stage4Tuner')) return;

    const panel = document.createElement('section');
    panel.id = 'stage4Tuner';
    panel.className = 'stage4-tuner';
    panel.setAttribute('aria-label', 'Sintonizador da fita interna');
    panel.innerHTML = `
      <div class="stage4-tuner-head">
        <div><p>SONOTÉCNICA BRASILEIRA LTDA.</p><h3>SINTONIZADOR DE QUATRO CANAIS</h3></div>
        <div class="stage4-tuner-meta"><span>Nº SÉRIE 08-1925</span><i class="stage4-led" aria-label="Indicador desligado"></i></div>
      </div>
      <div class="stage4-switch-row">
        <button class="stage4-lever" type="button" aria-pressed="false" aria-label="Alavanca desligada"><span class="stage4-lever-track"><span class="stage4-lever-stick"></span></span><strong>OFF</strong></button>
        <p>LEVANTE A ALAVANCA<br><small>APÓS AJUSTAR OS CANAIS</small></p>
      </div>
      <div class="stage4-knobs" aria-label="Controles de sintonia"></div>
      <p class="stage4-tuner-status" role="status">SISTEMA EM ESPERA</p>`;
    list.appendChild(panel);

    const knobs = panel.querySelector('.stage4-knobs');
    const lever = panel.querySelector('.stage4-lever');
    const led = panel.querySelector('.stage4-led');
    const status = panel.querySelector('.stage4-tuner-status');
    const mainAudio = audio(AUDIO.success);
    let values = [1, 1, 1, 1];
    let on = false;
    let returnTimer;

    function playEffect(path) {
      const player = audio(path, 'auto');
      player.currentTime = 0;
      player.play().catch(() => {});
    }

    function setPower(next, withLeverSound) {
      if (on === next) return;
      on = next;
      clearTimeout(returnTimer);
      if (withLeverSound) playEffect(AUDIO.lever);
      panel.classList.toggle('is-on', next);
      lever.setAttribute('aria-pressed', String(next));
      lever.setAttribute('aria-label', next ? 'Alavanca ligada' : 'Alavanca desligada');
      lever.querySelector('strong').textContent = next ? 'ON' : 'OFF';
      if (!next) {
        mainAudio.pause();
        mainAudio.currentTime = 0;
        led.className = 'stage4-led';
        led.setAttribute('aria-label', 'Indicador desligado');
        status.textContent = 'SISTEMA EM ESPERA';
      }
    }

    function updateKnob(index) {
      const knob = knobs.children[index];
      const value = values[index];
      knob.querySelector('.stage4-knob-pointer').style.transform = `rotate(${(value - 1) * 40 - 160}deg)`;
      knob.querySelector('.stage4-knob-value').textContent = value;
      knob.setAttribute('aria-label', `Canal ${['I', 'II', 'III', 'IV'][index]}, valor ${value}. Parte superior aumenta; inferior diminui.`);
    }

    function adjust(index, direction) {
      if (on) return;
      values[index] = ((values[index] - 1 + direction + 9) % 9) + 1;
      updateKnob(index);
      playEffect(AUDIO.potentiometer);
      status.textContent = `CANAL ${['I', 'II', 'III', 'IV'][index]} AJUSTADO`;
    }

    ['I', 'II', 'III', 'IV'].forEach((label, index) => {
      const knob = document.createElement('button');
      knob.className = 'stage4-knob';
      knob.type = 'button';
      knob.innerHTML = `<span class="stage4-knob-label">${label}</span><span class="stage4-knob-face"><span class="stage4-knob-pointer"></span><span class="stage4-knob-value"></span></span><span class="stage4-knob-hint">▲ AUMENTA &nbsp; · &nbsp; DIMINUI ▼</span>`;
      knob.addEventListener('click', event => {
        const bounds = knob.getBoundingClientRect();
        adjust(index, event.clientY < bounds.top + bounds.height / 2 ? 1 : -1);
      });
      knob.addEventListener('wheel', event => {
        event.preventDefault();
        adjust(index, event.deltaY < 0 ? 1 : -1);
      }, { passive: false });
      knobs.appendChild(knob);
    });

    lever.addEventListener('click', async () => {
      if (on) return setPower(false, true);
      setPower(true, true);
      status.textContent = 'VERIFICANDO FREQUÊNCIA…';
      const valid = await digest(values.join('')) === expected;
      if (!on) return;
      if (!valid) {
        playEffect(AUDIO.error);
        panel.classList.add('is-error');
        led.setAttribute('aria-label', 'Indicador de erro');
        status.textContent = 'FREQUÊNCIA NÃO RECONHECIDA';
        returnTimer = setTimeout(() => {
          panel.classList.remove('is-error');
          setPower(false, true);
        }, 800);
        return;
      }
      panel.classList.add('is-playing');
      led.setAttribute('aria-label', 'Sinal estabilizado');
      status.textContent = 'SINAL ESTABILIZADO — REPRODUZINDO FITA';
      mainAudio.currentTime = 0;
      mainAudio.play().catch(() => {
        panel.classList.remove('is-playing');
        status.textContent = 'FITA AGUARDANDO ARQUIVO DE ÁUDIO';
      });
    });

    mainAudio.addEventListener('ended', () => {
      panel.classList.remove('is-playing');
      setPower(false, true);
    });

    randomValues().then(initial => {
      values = initial;
      values.forEach((_, index) => updateKnob(index));
    });
  }

  const previousOpenStage = openStage;
  openStage = function (index) {
    previousOpenStage(index);
    if (stages[index] && stages[index].name === 'Iniciativa') setTimeout(renderTuner, 0);
  };

  const style = document.createElement('style');
  style.textContent = `
    .stage4-tuner{margin:18px 0 2px;padding:13px;border:1px solid #516057;border-radius:5px;background:linear-gradient(145deg,#30362f,#111612 47%,#29312b);box-shadow:inset 0 0 0 2px #0b0e0b,inset 0 0 22px rgba(0,0,0,.66),0 8px 18px rgba(0,0,0,.24);color:#d6d6c5;overflow:hidden}.stage4-tuner-head{display:flex;justify-content:space-between;gap:12px;padding-bottom:10px;border-bottom:1px solid #697166}.stage4-tuner-head p{margin:0 0 4px;color:#babaa6;font-size:8px;letter-spacing:.12em}.stage4-tuner-head h3{margin:0;font-size:10px;letter-spacing:.07em}.stage4-tuner-meta{display:flex;align-items:flex-end;gap:9px;color:#b9b9a5;font-size:8px;letter-spacing:.06em;white-space:nowrap}.stage4-led{display:block;width:10px;height:10px;border:1px solid #161716;border-radius:50%;background:#283128;box-shadow:inset 0 0 4px #000}.stage4-tuner.is-playing .stage4-led{background:#b8e74e;box-shadow:0 0 9px #a9e833,inset 0 0 3px #efffa5}.stage4-tuner.is-error .stage4-led{animation:stage4-error-flash .18s linear 4;background:#ef5046;box-shadow:0 0 9px #ef5046}@keyframes stage4-error-flash{50%{background:#30332d;box-shadow:none}}.stage4-switch-row{display:flex;align-items:center;gap:16px;padding:14px 4px 11px}.stage4-switch-row p{margin:0;color:#c1c1ad;font-size:9px;line-height:1.55;letter-spacing:.06em}.stage4-switch-row small{color:#8f978c;font-size:8px}.stage4-lever{display:flex;flex-direction:column;align-items:center;gap:4px;width:62px;padding:0;border:0;background:transparent;color:#c9c9b6;font-size:9px;font-weight:700;letter-spacing:.12em}.stage4-lever-track{position:relative;display:block;width:30px;height:56px;border:1px solid #7b8074;border-radius:3px;background:#151915;box-shadow:inset 0 0 7px #000}.stage4-lever-stick{position:absolute;left:11px;bottom:5px;width:7px;height:34px;border-radius:4px;background:linear-gradient(90deg,#73776c,#d5d4be,#62675e);transform-origin:50% 100%;transform:rotate(18deg);transition:transform .18s ease;box-shadow:0 0 1px #fff}.stage4-tuner.is-on .stage4-lever-stick{transform:translateY(-13px) rotate(-18deg)}.stage4-knobs{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;padding:12px 4px;border-top:1px solid #4e584d}.stage4-knob{min-height:126px;padding:7px 3px 5px;border:1px solid #62695f;border-radius:4px;background:linear-gradient(135deg,#313830,#1b211c);color:#d8d8c7;text-align:center}.stage4-knob:focus-visible,.stage4-lever:focus-visible{outline:2px solid #c9da6a;outline-offset:2px}.stage4-knob:disabled{opacity:.6}.stage4-knob-label{display:block;font-size:10px;font-weight:700;letter-spacing:.14em}.stage4-knob-face{position:relative;display:grid;width:72px;height:72px;margin:5px auto;border:5px solid #20251f;border-radius:50%;place-items:center;background:radial-gradient(circle at 38% 34%,#5a6156,#252b25 53%,#111511 56%);box-shadow:0 2px 5px #000,inset 0 0 0 1px #7f8879}.stage4-knob-pointer{position:absolute;top:8px;left:33px;width:2px;height:26px;transform-origin:50% 28px;background:#d8d5ae;box-shadow:0 0 2px #fff;transition:transform .14s ease}.stage4-knob-value{position:relative;width:25px;height:19px;border:1px solid #77806b;background:#10130f;color:#e4ecbb;font-size:12px;line-height:17px}.stage4-knob-hint{display:block;color:#aeb3a2;font-size:7px;letter-spacing:.02em}.stage4-tuner-status{min-height:27px;margin:0;padding:9px 4px 2px;border-top:1px solid #4e584d;color:#b9c987;font-size:9px;font-weight:700;letter-spacing:.07em;text-align:center}.stage4-tuner.is-on .stage4-knob{opacity:.68;cursor:not-allowed}@media(max-width:360px){.stage4-tuner{padding:10px}.stage4-tuner-head{gap:6px}.stage4-tuner-meta{font-size:7px}.stage4-knobs{gap:8px}.stage4-knob-face{width:65px;height:65px}.stage4-knob-pointer{left:29px;height:22px;transform-origin:50% 24px}}
  `;
  document.head.appendChild(style);
})();
