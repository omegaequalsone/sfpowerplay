/* Powerplay lightbox — standalone, no dependencies.
   Used by the exported case-study pages, which ship as plain HTML and so
   can't use the dc-runtime lightbox that index.html and the case-study-*
   pages get from support.js.

   Markup contract (already present on those pages):
     <div class="pp-card" data-gallery="folio" style="cursor:zoom-in">
       <img class="pp-shot" data-gallery="folio" data-full="<big>" src="<thumb>" alt="...">
     </div>

   Behavior matches the dc lightbox: click to open, arrows / swipe to move
   through the same data-gallery group, Esc or click-outside to close.

   Cards that already carry an inline onclick are left alone, so including
   this file on a dc-driven page is harmless. */
(function () {
  'use strict';

  var SEL_CARD = '.pp-card[data-gallery]';
  var SEL_SHOT = 'img.pp-shot';

  var shots = [];
  var index = -1;
  var overlay, img, counter, prevBtn, nextBtn, closeBtn, lastFocus;
  var touchX = null;

  function fullSrc(el) {
    return el.getAttribute('data-full') || el.currentSrc || el.getAttribute('src') || '';
  }

  function group(el) {
    return el.getAttribute('data-gallery') || '';
  }

  function build() {
    if (overlay) return;

    overlay = document.createElement('div');
    overlay.className = 'pp-lb';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image viewer');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:rgba(1,8,16,.93);' +
      '-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);display:none;' +
      'align-items:center;justify-content:center;padding:56px;';

    var round = 'border-radius:50%;border:1px solid rgba(255,255,255,.28);background:transparent;' +
      'color:#fff;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;' +
      'font-family:inherit;padding:0;';

    closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = 'position:fixed;top:24px;right:28px;width:46px;height:46px;font-size:22px;' + round;

    prevBtn = document.createElement('button');
    prevBtn.type = 'button';
    prevBtn.setAttribute('aria-label', 'Previous');
    prevBtn.innerHTML = '&larr;';
    prevBtn.style.cssText = 'position:fixed;left:28px;top:50%;transform:translateY(-50%);' +
      'width:54px;height:54px;font-size:22px;' + round;

    nextBtn = document.createElement('button');
    nextBtn.type = 'button';
    nextBtn.setAttribute('aria-label', 'Next');
    nextBtn.innerHTML = '&rarr;';
    nextBtn.style.cssText = 'position:fixed;right:28px;top:50%;transform:translateY(-50%);' +
      'width:54px;height:54px;font-size:22px;' + round;

    img = document.createElement('img');
    img.alt = '';
    img.style.cssText = 'max-width:88vw;max-height:84vh;width:auto;height:auto;border-radius:8px;' +
      'box-shadow:0 30px 80px rgba(0,0,0,.6);display:block;';

    counter = document.createElement('div');
    counter.style.cssText = 'position:fixed;bottom:26px;left:50%;transform:translateX(-50%);' +
      "font-family:'Space Mono',monospace;font-size:12px;letter-spacing:.16em;color:rgba(255,255,255,.7);";

    overlay.appendChild(closeBtn);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(img);
    overlay.appendChild(counter);
    document.body.appendChild(overlay);

    var mq = document.createElement('style');
    mq.textContent = '@media (max-width:700px){.pp-lb{padding:16px !important;}' +
      '.pp-lb button{width:40px !important;height:40px !important;}' +
      '.pp-lb img{max-width:94vw !important;max-height:76vh !important;}}';
    document.head.appendChild(mq);

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay || e.target === img) close();
    });
    closeBtn.addEventListener('click', function (e) { e.stopPropagation(); close(); });
    prevBtn.addEventListener('click', function (e) { e.stopPropagation(); step(-1); });
    nextBtn.addEventListener('click', function (e) { e.stopPropagation(); step(1); });

    overlay.addEventListener('touchstart', function (e) {
      touchX = e.touches && e.touches.length === 1 ? e.touches[0].clientX : null;
    }, { passive: true });
    overlay.addEventListener('touchend', function (e) {
      if (touchX === null) return;
      var end = e.changedTouches && e.changedTouches.length ? e.changedTouches[0].clientX : touchX;
      var dx = end - touchX;
      touchX = null;
      if (Math.abs(dx) > 45) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  function show() {
    var s = shots[index];
    if (!s) return;
    img.setAttribute('src', s.src);
    img.alt = s.alt || '';
    counter.textContent = (index + 1) + ' / ' + shots.length;
    var many = shots.length > 1;
    prevBtn.style.display = many ? 'flex' : 'none';
    nextBtn.style.display = many ? 'flex' : 'none';
  }

  function open(shot) {
    build();
    var g = group(shot);
    var all = [].slice.call(document.querySelectorAll(SEL_SHOT)).filter(function (i) {
      return group(i) === g;
    });
    if (!all.length) all = [shot];
    shots = all.map(function (i) {
      return { src: fullSrc(i), alt: i.alt || '' };
    });
    index = Math.max(0, all.indexOf(shot));
    lastFocus = document.activeElement;
    overlay.style.display = 'flex';
    document.documentElement.style.overflow = 'hidden';
    show();
    closeBtn.focus();
  }

  function close() {
    if (!overlay || overlay.style.display === 'none') return;
    overlay.style.display = 'none';
    img.removeAttribute('src');
    document.documentElement.style.overflow = '';
    shots = [];
    index = -1;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  function step(dir) {
    if (!shots.length) return;
    index = (index + dir + shots.length) % shots.length;
    show();
  }

  function isOpen() {
    return !!overlay && overlay.style.display !== 'none';
  }

  document.addEventListener('click', function (e) {
    if (isOpen()) return;
    var card = e.target.closest ? e.target.closest(SEL_CARD) : null;
    if (!card) return;
    // Leave dc-managed cards and linked cards to their own handlers.
    if (card.hasAttribute('onclick') || card.closest('a')) return;
    var shot = card.querySelector(SEL_SHOT) ||
      (e.target.tagName === 'IMG' ? e.target : null);
    if (!shot) return;
    e.preventDefault();
    open(shot);
  });

  document.addEventListener('keydown', function (e) {
    if (!isOpen()) return;
    if (e.key === 'Escape') { close(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // Keyboard access: the cards are plain divs, so give them button semantics.
  function enhance() {
    [].slice.call(document.querySelectorAll(SEL_CARD)).forEach(function (card) {
      if (card.hasAttribute('onclick') || card.closest('a')) return;
      if (card.hasAttribute('data-pp-lb')) return;
      var shot = card.querySelector(SEL_SHOT);
      if (!shot) return;
      card.setAttribute('data-pp-lb', '');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', 'Enlarge image' + (shot.alt ? ': ' + shot.alt : ''));
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(shot); }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
