// Prévia visual reversível da Etapa 06.
// Para voltar ao espelho anterior, remova somente o script deste arquivo do index.html.
(function () {
  const style = document.createElement('style');
  style.textContent = `
    .mirror-procedure{padding-top:14px!important}
    .mirror-question{max-width:340px;margin:0 auto 21px!important;color:#d7c7a5!important}
    .mirror-field{
      --mirror-width:min(72vw,348px);
      position:relative!important;
      width:var(--mirror-width)!important;
      height:calc(var(--mirror-width) * 1.34)!important;
      margin:0 auto 20px!important;
      isolation:isolate;
    }
    .mirror-field:before{
      content:"";
      position:absolute;
      z-index:0;
      left:65%; top:1%;
      width:21%; height:20%;
      border:2px solid #40382f;
      border-radius:48% 55% 30% 25%;
      background:linear-gradient(110deg,#050607,#202526 52%,#020303 56%);
      box-shadow:inset -3px 0 0 #050505,3px 5px 7px rgba(0,0,0,.7);
      transform:rotate(12deg);
    }
    .mirror-field:after{
      content:"";
      position:absolute;
      z-index:0;
      left:4%; right:4%; bottom:0;
      height:17%;
      border:1px solid #222728;
      background:linear-gradient(135deg,#020304,#151a1b 48%,#030405 52%,#0e1112);
      clip-path:polygon(52% 0,100% 72%,56% 100%,0 75%);
      box-shadow:0 16px 18px rgba(0,0,0,.76);
      transform:translateY(13%);
    }
    .mirror-rim{
      z-index:1!important;
      inset:6% 10% 11%!important;
      border-radius:49% 51% 46% 54% / 54% 54% 46% 46%!important;
      clip-path:polygon(13% 95%,3% 78%,3% 50%,10% 29%,27% 15%,61% 7%,69% 2%,80% 5%,86% 15%,87% 27%,92% 46%,91% 68%,83% 86%,66% 96%,38% 99%);
      background:linear-gradient(110deg,#050708 0,#303638 27%,#050606 42%,#111617 61%,#010202 74%,#4a504d 84%,#080a0a 88%)!important;
      box-shadow:0 0 0 1px #727064,0 0 0 4px #111415,0 24px 28px rgba(0,0,0,.88),inset 3px 2px 5px rgba(255,255,255,.12)!important;
    }
    .mirror-surface{
      z-index:2!important;
      inset:10% 15% 15%!important;
      border-radius:50% 50% 47% 53% / 55% 55% 45% 45%!important;
      clip-path:polygon(12% 94%,4% 76%,5% 49%,13% 28%,30% 17%,58% 11%,66% 7%,76% 10%,81% 21%,84% 46%,83% 68%,76% 84%,62% 93%,39% 96%);
      background:radial-gradient(ellipse at 28% 24%,rgba(57,69,67,.62),transparent 15%),radial-gradient(ellipse at 74% 68%,rgba(22,38,37,.35),transparent 26%),linear-gradient(118deg,#161c1d 0,#030708 31%,#000 72%,#111817)!important;
      box-shadow:inset 11px 6px 24px rgba(123,135,127,.14),inset -18px -14px 35px #000,0 0 0 1px #020303!important;
    }
    .mirror-surface:before{opacity:.8!important;transform:translateX(-38%) rotate(-4deg)!important}
    .mirror-surface:after{content:"";position:absolute;inset:8%;border-radius:50%;border:1px solid rgba(168,176,161,.08);box-shadow:inset 0 0 22px rgba(0,0,0,.9)}
    .mirror-surface span{width:59%!important;color:rgba(201,213,194,.38)!important;font-size:11px!important}
    .mirror-rune{z-index:4!important;width:38px!important;height:38px!important;color:rgba(178,149,102,.31)!important;font-size:27px!important;text-shadow:0 1px #020202}
    .is-unlocked .mirror-rune{color:rgba(211,177,118,.72)!important}
    .mirror-rune:nth-of-type(1){left:50%!important;top:4%!important}.mirror-rune:nth-of-type(2){left:69%!important;top:7%!important}.mirror-rune:nth-of-type(3){left:85%!important;top:17%!important}.mirror-rune:nth-of-type(4){left:94%!important;top:34%!important}.mirror-rune:nth-of-type(5){left:94%!important;top:57%!important}.mirror-rune:nth-of-type(6){left:85%!important;top:78%!important}.mirror-rune:nth-of-type(7){left:68%!important;top:93%!important}.mirror-rune:nth-of-type(8){left:50%!important;top:97%!important}.mirror-rune:nth-of-type(9){left:32%!important;top:93%!important}.mirror-rune:nth-of-type(10){left:15%!important;top:78%!important}.mirror-rune:nth-of-type(11){left:6%!important;top:57%!important}.mirror-rune:nth-of-type(12){left:6%!important;top:34%!important}.mirror-rune:nth-of-type(13){left:15%!important;top:17%!important}.mirror-rune:nth-of-type(14){left:31%!important;top:7%!important}
    .mirror-field.is-responding .mirror-rune.is-present,.mirror-field.is-activated .mirror-rune.is-present{color:#e7cb86!important;text-shadow:0 0 8px #e0b361,0 0 20px rgba(201,147,66,.72)!important}
    @media(max-width:420px){.mirror-field{--mirror-width:min(80vw,325px)}.mirror-rune{width:32px!important;height:32px!important;font-size:23px!important}}
  `;
  document.head.appendChild(style);
})();
