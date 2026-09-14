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
      <div class="stage4-reel-window" aria-hidden="true">
        <span class="stage4-reel stage4-reel-left"><i></i></span>
        <span class="stage4-tape-path"></span>
        <span class="stage4-reel stage4-reel-right"><i></i></span>
        <b class="stage4-window-screw s1"></b><b class="stage4-window-screw s2"></b><b class="stage4-window-screw s3"></b><b class="stage4-window-screw s4"></b>
      </div>
      <div class="stage4-tuner-head">
        <div><p>SONOTÉCNICA BRASILEIRA LTDA.</p><h3>SINTONIZADOR DE QUATRO CANAIS</h3></div>
        <div class="stage4-tuner-meta"><span>Nº SÉRIE 08-1925</span><i class="stage4-led" aria-label="Indicador desligado"></i></div>
      </div>
      <div class="stage4-switch-row">
        <button class="stage4-lever" type="button" aria-pressed="false" aria-label="Alavanca desligada"><span class="stage4-lever-track"><span class="stage4-lever-on">ON</span><span class="stage4-lever-stick"></span><span class="stage4-lever-off">OFF</span></span></button>
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
    let rotations = [-160, -160, -160, -160];
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
      if (!next) {
        panel.classList.remove('is-playing', 'is-error');
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
      knob.querySelector('.stage4-knob-pointer').style.transform = `rotate(${rotations[index]}deg)`;
      knob.querySelectorAll('.stage4-knob-scale-number').forEach(number => {
        number.classList.toggle('is-selected', Number(number.textContent) === value);
      });
      knob.setAttribute('aria-label', `Canal ${['I', 'II', 'III', 'IV'][index]}, valor ${value}. Arraste para girar; a roda do mouse também ajusta.`);
    }

    function adjust(index, direction) {
      if (on) return;
      values[index] = ((values[index] - 1 + direction + 9) % 9) + 1;
      rotations[index] += direction * 40;
      updateKnob(index);
      playEffect(AUDIO.potentiometer);
      status.textContent = `CANAL ${['I', 'II', 'III', 'IV'][index]} AJUSTADO`;
    }

    function selectValue(index, value) {
      if (on || values[index] === value) return;
      let steps = value - values[index];
      if (steps > 4) steps -= 9;
      if (steps < -4) steps += 9;
      values[index] = value;
      rotations[index] += steps * 40;
      updateKnob(index);
      playEffect(AUDIO.potentiometer);
      status.textContent = `CANAL ${['I', 'II', 'III', 'IV'][index]} AJUSTADO`;
    }

    ['I', 'II', 'III', 'IV'].forEach((label, index) => {
      const knob = document.createElement('button');
      knob.className = 'stage4-knob';
      knob.type = 'button';
      const scale = Array.from({ length: 9 }, (_, value) => {
        const angle = value * 40 - 160;
        return `<span class="stage4-knob-scale-number" data-value="${value + 1}" style="--scale-angle:${angle}deg">${value + 1}</span>`;
      }).join('');
      knob.innerHTML = `<span class="stage4-knob-label">${label}</span><span class="stage4-knob-dial"><span class="stage4-knob-face"><span class="stage4-knob-pointer"></span></span>${scale}</span>`;
      let activePointer = null;
      let lastAngle = 0;
      let accumulated = 0;
      let lastStep = 0;
      let lastWheelStep = 0;
      const dial = knob.querySelector('.stage4-knob-dial');
      const pointerAngle = event => {
        const bounds = dial.getBoundingClientRect();
        return Math.atan2(event.clientY - (bounds.top + bounds.height / 2), event.clientX - (bounds.left + bounds.width / 2)) * 180 / Math.PI;
      };
      knob.addEventListener('pointerdown', event => {
        if (on) return;
        activePointer = event.pointerId;
        lastAngle = pointerAngle(event);
        accumulated = 0;
        knob.setPointerCapture(event.pointerId);
        knob.classList.add('is-turning');
        event.preventDefault();
      });
      knob.addEventListener('pointermove', event => {
        if (activePointer !== event.pointerId || on) return;
        const currentAngle = pointerAngle(event);
        let difference = currentAngle - lastAngle;
        if (difference > 180) difference -= 360;
        if (difference < -180) difference += 360;
        lastAngle = currentAngle;
        accumulated += difference;
        const now = Date.now();
        if (Math.abs(accumulated) >= 18 && now - lastStep >= 110) {
          adjust(index, accumulated > 0 ? 1 : -1);
          accumulated -= Math.sign(accumulated) * 18;
          lastStep = now;
        }
      });
      const finishTurn = event => {
        if (activePointer !== event.pointerId) return;
        activePointer = null;
        knob.classList.remove('is-turning');
        if (knob.hasPointerCapture(event.pointerId)) knob.releasePointerCapture(event.pointerId);
      };
      knob.addEventListener('pointerup', finishTurn);
      knob.addEventListener('pointercancel', finishTurn);
      knob.addEventListener('wheel', event => {
        event.preventDefault();
        const now = Date.now();
        if (now - lastWheelStep < 110) return;
        lastWheelStep = now;
        adjust(index, event.deltaY < 0 ? 1 : -1);
      }, { passive: false });
      knob.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowRight') { event.preventDefault(); adjust(index, 1); }
        if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') { event.preventDefault(); adjust(index, -1); }
      });
      knob.querySelectorAll('.stage4-knob-scale-number').forEach(number => {
        number.addEventListener('pointerdown', event => {
          event.preventDefault();
          event.stopPropagation();
          selectValue(index, Number(number.dataset.value));
        });
      });
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
      rotations = initial.map(value => (value - 1) * 40 - 160);
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

  const interactionStyle = document.createElement('style');
  interactionStyle.textContent = `
    .stage4-knob{min-height:168px;padding:9px 2px 7px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}.stage4-knob.is-turning{cursor:grabbing}.stage4-knob-dial{position:relative;display:block;width:126px;height:126px;margin:6px auto 3px}.stage4-knob-face{position:absolute;inset:22px;width:auto;height:auto;margin:0;border-width:6px}.stage4-knob-pointer{top:9px;left:calc(50% - 1px);height:33px;transform-origin:50% 38px}.stage4-knob-scale-number{position:absolute;top:50%;left:50%;width:17px;margin:-8px 0 0 -8.5px;color:#949b8c;font-size:9px;font-weight:700;line-height:16px;transform:rotate(var(--scale-angle)) translateY(-54px) rotate(calc(-1 * var(--scale-angle)));transition:color .12s ease,text-shadow .12s ease}.stage4-knob-scale-number.is-selected{color:#efffa5;text-shadow:0 0 6px #b8e74e}.stage4-knob-hint{margin-top:1px;color:#bdc7ad;font-size:7px;letter-spacing:.07em}.stage4-tuner.is-on .stage4-knob{pointer-events:none}@media(max-width:390px){.stage4-knob{min-height:151px}.stage4-knob-dial{width:112px;height:112px}.stage4-knob-face{inset:20px}.stage4-knob-scale-number{transform:rotate(var(--scale-angle)) translateY(-48px) rotate(calc(-1 * var(--scale-angle)))}}
  `;
  document.head.appendChild(interactionStyle);

  const visualStyle = document.createElement('style');
  visualStyle.textContent = `
    .stage4-tuner{position:relative;margin:22px 0 4px;padding:13px 13px 15px;border:2px solid #070605;border-radius:19px;background:radial-gradient(ellipse at 18% 4%,rgba(126,91,57,.2),transparent 35%),repeating-linear-gradient(120deg,rgba(255,255,255,.018) 0 1px,transparent 1px 5px),#171311;box-shadow:inset 0 0 0 1px #4b4038,inset 0 -16px 22px #080706,0 16px 26px rgba(0,0,0,.42);color:#d7b77d}.stage4-tuner:after{content:"";position:absolute;right:12px;bottom:10px;width:34px;height:3px;border-radius:99px;background:#574939;box-shadow:0 -2px #090807}.stage4-reel-window{position:relative;display:flex;align-items:center;justify-content:space-around;height:113px;margin:0 2px 13px;padding:10px 18px;border:4px solid #0a0908;border-radius:11px;background:linear-gradient(135deg,rgba(156,180,168,.36),rgba(10,12,11,.92) 23%,rgba(10,9,8,.92) 75%,rgba(151,177,161,.18)),#151412;box-shadow:inset 0 0 0 1px #748277,inset 0 0 22px #000,0 3px 0 #0a0908}.stage4-reel{position:relative;z-index:1;width:78px;height:78px;border:7px solid #8f632e;border-radius:50%;background:repeating-radial-gradient(circle,#b88a4d 0 2px,#6a421e 3px 5px);box-shadow:inset 0 0 0 2px #d0a25f,inset 0 0 11px #2a1609,0 3px 5px #000}.stage4-reel:before{content:"";position:absolute;inset:16px;border-radius:50%;background:radial-gradient(circle,#c99c5c 0 12%,#382014 14% 28%,#c4914d 30% 35%,transparent 36%);box-shadow:0 0 0 2px #54351b}.stage4-reel:after{content:"";position:absolute;inset:7px;border-radius:50%;background:conic-gradient(transparent 0 15%,rgba(40,21,11,.8) 15% 27%,transparent 27% 48%,rgba(40,21,11,.8) 48% 60%,transparent 60% 82%,rgba(40,21,11,.8) 82% 94%,transparent 94%)}.stage4-reel i{position:absolute;z-index:2;top:33px;left:33px;width:6px;height:6px;border-radius:50%;background:#1b120b;box-shadow:0 0 0 2px #d0a25f}.stage4-tape-path{position:absolute;z-index:0;left:23%;right:23%;top:53px;height:8px;border-radius:8px;background:linear-gradient(#2b160d,#75411e,#2b160d);box-shadow:0 0 5px #000}.stage4-window-screw{position:absolute;z-index:3;width:7px;height:7px;border:1px solid #211b16;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#9c9482 35%,#34302a 40%)}.stage4-window-screw.s1{top:7px;left:8px}.stage4-window-screw.s2{top:7px;right:8px}.stage4-window-screw.s3{bottom:7px;left:8px}.stage4-window-screw.s4{right:8px;bottom:7px}.stage4-tuner-head{position:relative;padding:7px 9px 8px;border:1px solid #5c4632;border-radius:4px 4px 0 0;background:linear-gradient(110deg,#18120e,#342719 50%,#120f0d);box-shadow:inset 0 1px rgba(255,222,162,.12)}.stage4-tuner-head p{color:#a98351;font-size:7px}.stage4-tuner-head h3{color:#e2c188;font-family:Georgia,serif;font-size:11px;letter-spacing:.09em}.stage4-tuner-meta{color:#b89360;font-size:7px}.stage4-led{width:13px;height:13px;border:2px solid #260b06;background:#42110a;box-shadow:inset 0 0 3px #000}.stage4-tuner.is-playing .stage4-led{background:#9ed15b;box-shadow:0 0 10px #a8eb52,inset 0 0 3px #efffa5}.stage4-switch-row{position:relative;margin:0;padding:11px 12px 7px;border:1px solid #5c4632;border-top:0;background:linear-gradient(112deg,#261d16,#13100e 72%)}.stage4-switch-row p{color:#c6a675;font-family:Georgia,serif;font-size:10px}.stage4-switch-row small{color:#8e704b;font-family:"IBM Plex Mono",monospace}.stage4-lever{width:68px;color:#d8b780;font-family:Georgia,serif;font-size:11px}.stage4-lever-track{width:38px;height:57px;border:4px solid #8d7458;border-radius:50%;background:radial-gradient(circle,#1a120d 0 34%,#5d4a37 36% 44%,#211914 46%);box-shadow:inset 0 0 8px #000,0 2px 3px #000}.stage4-lever-stick{left:14px;bottom:8px;width:8px;height:34px;background:linear-gradient(90deg,#3a2e23,#f0d2a0 45%,#604a35 54%,#1c1510);box-shadow:0 0 0 2px #19120d;border-radius:6px}.stage4-knobs{gap:4px;padding:9px 8px 5px;border:1px solid #5c4632;border-top:0;border-radius:0 0 6px 6px;background:linear-gradient(118deg,#30241b,#17120f 68%,#261b13)}.stage4-knob{min-height:159px;border:0;border-radius:0;background:transparent;color:#c5a373}.stage4-knob-label{color:#e4bf82;font-family:Georgia,serif;font-size:22px;font-style:italic;text-shadow:1px 1px #000}.stage4-knob-dial{width:118px;height:118px;margin:0 auto}.stage4-knob-face{inset:25px;border:6px solid #1b120b;background:radial-gradient(circle at 36% 29%,#f0cb84,#a66f35 31%,#513217 42%,#1b120d 52%,#070605 57%);box-shadow:inset 0 0 0 1px #edc785,inset 0 0 10px #150b05,0 3px 5px #000}.stage4-knob-pointer{top:8px;left:calc(50% - 1px);height:34px;background:#2b180c;box-shadow:0 0 0 1px #f5d58e;transform-origin:50% 39px}.stage4-knob-scale-number{color:#a77d4a;font-family:Georgia,serif;font-size:11px;text-shadow:1px 1px #080604;transform:rotate(var(--scale-angle)) translateY(-51px) rotate(calc(-1 * var(--scale-angle)))}.stage4-knob-scale-number.is-selected{color:#ffe0a0;text-shadow:0 0 7px #e5a94e}.stage4-knob-hint{color:#8c6a45;font-size:6px}.stage4-tuner-status{margin:9px 8px 0;min-height:29px;padding:9px 4px 2px;border-top:1px solid #624a32;color:#d3aa69;font-size:8px;text-shadow:1px 1px #000}.stage4-tuner.is-on .stage4-knob{opacity:.56}@media(max-width:390px){.stage4-reel-window{height:99px}.stage4-reel{width:67px;height:67px}.stage4-reel i{top:28px;left:28px}.stage4-reel:before{inset:13px}.stage4-tape-path{top:47px}.stage4-knobs{padding-left:3px;padding-right:3px}.stage4-knob-dial{width:108px;height:108px}.stage4-knob-face{inset:23px}.stage4-knob-scale-number{transform:rotate(var(--scale-angle)) translateY(-47px) rotate(calc(-1 * var(--scale-angle)))}}
  `;
  document.head.appendChild(visualStyle);

  const detailStyle = document.createElement('style');
  detailStyle.textContent = `
    .stage4-knob-pointer{top:8px;left:calc(50% - 2px);width:4px;height:17px;border-radius:4px;background:#f5dcab;box-shadow:0 0 0 1px #2c190c,0 0 3px rgba(255,235,189,.6);transform-origin:50% 26px;transition:transform .12s linear}.stage4-lever{width:76px}.stage4-lever-track{position:relative;width:60px;height:73px;border:0;border-radius:0;background:linear-gradient(90deg,#13100e,#55463a 22%,#17110e 52%,#665b50 76%,#18130f);box-shadow:inset 0 0 0 2px #82725f,inset 0 0 9px #000,0 2px 3px #000}.stage4-lever-track:before{content:"";position:absolute;z-index:1;left:13px;top:19px;width:33px;height:33px;border:4px solid #b9aa95;border-radius:50%;background:radial-gradient(circle,#16100c 0 31%,#625243 33% 42%,#211913 44%);box-shadow:0 0 0 2px #33271f,0 2px 3px #000}.stage4-lever-on,.stage4-lever-off{position:absolute;z-index:3;left:2px;width:27px;padding:2px 0;color:#d8d1c5;font-family:Georgia,serif;font-size:10px;font-style:italic;line-height:1;text-align:center}.stage4-lever-on{top:2px;background:#47191a}.stage4-lever-off{bottom:2px;background:#1b1b1c}.stage4-tuner.is-on .stage4-lever-on{background:#a82b32;color:#fff1e5;text-shadow:0 0 3px #fff}.stage4-lever-stick{z-index:4;left:26px;bottom:10px;width:9px;height:44px;border-radius:7px;background:linear-gradient(90deg,#2c2119,#f3d6a4 43%,#7b6045 58%,#19120d);box-shadow:0 0 0 2px #18110c,2px 2px 3px #000;transform:translateY(0);transform-origin:50% 100%;transition:transform .18s ease}.stage4-tuner.is-on .stage4-lever-stick{transform:translateY(-19px)}.stage4-tuner.is-playing .stage4-reel-left{animation:stage4-reel-spin 1.35s linear infinite}.stage4-tuner.is-playing .stage4-reel-right{animation:stage4-reel-spin 1.05s linear infinite reverse}@keyframes stage4-reel-spin{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.stage4-tuner.is-playing .stage4-reel{animation:none}}
  `;
  document.head.appendChild(detailStyle);

  const switchStyle = document.createElement('style');
  switchStyle.textContent = `
    .stage4-tuner{display:grid;grid-template-columns:88px minmax(0,1fr);column-gap:8px}.stage4-reel-window,.stage4-tuner-head,.stage4-tuner-status{grid-column:1/-1}.stage4-switch-row{grid-column:1;grid-row:3;align-self:stretch;min-height:328px;margin:0!important;padding:10px 7px!important;border:1px solid #80664b!important;border-radius:5px;background:linear-gradient(105deg,#1a1511,#3a2d21 50%,#110e0c)!important;box-shadow:inset 0 0 0 2px #0b0908,inset 0 0 12px #000}.stage4-knobs{grid-column:2;grid-row:3;padding:5px 0!important;border:0!important;background:transparent!important}.stage4-lever{width:100%;height:100%;justify-content:flex-start;gap:7px;color:#b69261}.stage4-lever-track{width:64px;height:246px;border:1px solid #8a7258;border-radius:3px;background:linear-gradient(90deg,#17120e,#4b3c2e 48%,#17120e);box-shadow:inset 0 0 0 2px #0a0807,inset 0 0 10px #000}.stage4-lever-track:before{left:14px;top:55px;width:32px;height:126px;border:0;border-radius:15px;background:#090807;box-shadow:inset 0 0 0 1px #75614c,inset 0 0 8px #000}.stage4-lever-track:after{content:"";position:absolute;z-index:2;left:20px;top:60px;width:20px;height:116px;border-radius:12px;background:linear-gradient(90deg,#050403,#31261c 48%,#050403);box-shadow:inset 0 0 4px #000}.stage4-lever-on,.stage4-lever-off{left:7px;width:48px;padding:5px 0;font-family:"IBM Plex Mono",monospace;font-size:10px;font-style:normal;letter-spacing:.06em}.stage4-lever-on{top:7px;border:1px solid #8b3431;border-radius:2px;background:#451918}.stage4-lever-off{bottom:7px;color:#b9a791;border-top:1px solid #665744;background:transparent}.stage4-lever-stick{z-index:4;left:25px;bottom:72px;width:11px;height:55px;border-radius:7px;background:linear-gradient(90deg,#29211a,#f2d8a6 44%,#776047 60%,#1d1711);box-shadow:0 0 0 2px #17110c,2px 2px 4px #000;transform:translateY(0)!important;transition:transform .16s cubic-bezier(.2,.9,.35,1.35)}.stage4-tuner.is-on .stage4-lever-stick{transform:translateY(-88px)!important}.stage4-tuner.is-on .stage4-lever-on{background:#b62f32;color:#fff4e8;box-shadow:0 0 8px rgba(229,64,57,.65)}.stage4-lever>strong{font-size:8px;letter-spacing:.12em}.stage4-tuner-status{margin-top:10px!important}@media(max-width:390px){.stage4-tuner{grid-template-columns:76px minmax(0,1fr);column-gap:4px}.stage4-switch-row{min-height:298px;padding:7px 4px!important}.stage4-lever-track{width:58px;height:225px}.stage4-lever-track:before{left:13px;top:50px;height:113px}.stage4-lever-track:after{left:19px;top:55px;height:102px}.stage4-lever-stick{left:23px;bottom:64px}.stage4-tuner.is-on .stage4-lever-stick{transform:translateY(-78px)!important}}
  `;
  document.head.appendChild(switchStyle);

  const lightStyle = document.createElement('style');
  lightStyle.textContent = `
    .stage4-lever-on{border-color:#80602a!important;background:linear-gradient(135deg,#553b15,#a46e22 52%,#3c290f)!important;color:#f0d79a!important;text-shadow:0 1px #2b1c08}.stage4-tuner.is-on .stage4-lever-on{background:linear-gradient(135deg,#79551b,#d79a36 52%,#5b3d12)!important;color:#fff2c8!important;box-shadow:0 0 8px rgba(210,150,48,.42)!important}.stage4-led{width:18px!important;height:18px!important;border:2px solid #160e0a!important;background:radial-gradient(circle at 35% 30%,#7b3322,#35100b 58%,#160805)!important;box-shadow:inset 0 0 5px #000,0 0 2px rgba(130,40,22,.35)!important}.stage4-tuner.is-error .stage4-led{background:radial-gradient(circle at 35% 30%,#c04b35,#5b170f 58%,#210805)!important;box-shadow:inset 0 0 5px #170401,0 0 7px rgba(158,45,29,.48)!important}.stage4-tuner.is-playing .stage4-led{background:radial-gradient(circle at 35% 30%,#9aaf5f,#405124 58%,#111908)!important;box-shadow:inset 0 0 5px #081003,0 0 7px rgba(120,151,60,.42)!important}
  `;
  document.head.appendChild(lightStyle);

  const directSelectStyle = document.createElement('style');
  directSelectStyle.textContent = `.stage4-knob-scale-number{cursor:pointer;pointer-events:auto}.stage4-knob-scale-number:active{color:#fff1c8!important;text-shadow:0 0 9px #e8af52!important}`;
  document.head.appendChild(directSelectStyle);
})();
