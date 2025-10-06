
(() => {
  const targetWord = "Subida";
  const startZone = document.getElementById('startZone');
  const lettersContainer = document.getElementById('letters');
  const secretLink = document.getElementById('secretLink');

  const letters = Array.from(document.querySelectorAll('.letter'));

  // Layout letters initially centered in the start zone (absolute positions)
  function layoutInitial() {
    const rect = startZone.getBoundingClientRect();
    // Base positions (centered row)
    const spacing = Math.min(40, rect.width / 8);
    const startX = rect.width / 2 - ((letters.length - 1) * spacing) / 2;
    const y = rect.height / 2;

    letters.forEach((el, i) => {
      const x = startX + i * spacing;
      setAbs(el, x, y);
      el.dataset.initX = x;
      el.dataset.initY = y;
    });

    // After positioning, detach from the flex wrapper visuals
    lettersContainer.style.display = 'block';
  }

  function setAbs(el, x, y) {
    el.style.left = (x - el.offsetWidth / 2) + 'px';
    el.style.top  = (y - el.offsetHeight / 2) + 'px';
  }

  function getCenter(el) {
    const r = el.getBoundingClientRect();
    const parent = startZone.getBoundingClientRect();
    return { x: r.left - parent.left + r.width / 2, y: r.top - parent.top + r.height / 2 };
  }

  // Drag mechanics (pointer events)
  letters.forEach(el => {
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('keydown', onKeyDrag);
  });

  function onDown(e) {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);

    const start = getCenter(el);
    const parentRect = startZone.getBoundingClientRect();
    const offsetX = e.clientX - (parentRect.left + start.x);
    const offsetY = e.clientY - (parentRect.top  + start.y);

    function onMove(ev) {
      const x = ev.clientX - parentRect.left - offsetX;
      const y = ev.clientY - parentRect.top  - offsetY;
      setAbs(el, x, y);
    }

    function onUp(ev) {
      el.releasePointerCapture(e.pointerId);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      checkSolved();
    }

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  }

  // Keyboard nudging for accessibility
  function onKeyDrag(e) {
    const step = 8;
    const el = e.currentTarget;
    const center = getCenter(el);
    let moved = false;
    if (e.key === 'ArrowLeft') { setAbs(el, center.x - step, center.y); moved = true; }
    if (e.key === 'ArrowRight'){ setAbs(el, center.x + step, center.y); moved = true; }
    if (e.key === 'ArrowUp')   { setAbs(el, center.x, center.y - step); moved = true; }
    if (e.key === 'ArrowDown') { setAbs(el, center.x, center.y + step); moved = true; }
    if (moved) { e.preventDefault(); checkSolved(); }
  }

  function checkSolved() {
    // Determine order by X position; ensure they are roughly aligned horizontally
    const withPos = letters.map(el => ({ el, c: getCenter(el) }));
    const yVals = withPos.map(p => p.c.y);
    const ySpread = Math.max(...yVals) - Math.min(...yVals);

    // If not aligned within 60px vertically, don't check yet
    if (ySpread > 60) return;

    const ordered = [...withPos].sort((a,b) => a.c.x - b.c.x).map(p => p.el.dataset.letter).join('');
    if (ordered === targetWord) {
      secretLink.classList.add('show');
      // Optional: subtle success flicker
      startZone.animate([{ filter:'brightness(1)' }, { filter:'brightness(1.6)' }, { filter:'brightness(1)' }], { duration: 500, easing:'ease-out' });
    }
  }

  // Re-layout on resize for robustness (but keep current positions ratio)
  let lastW = null, lastH = null;
  function onResize() {
    const rect = startZone.getBoundingClientRect();
    if (lastW === null) {
      layoutInitial();
      lastW = rect.width; lastH = rect.height;
      return;
    }
    const sx = rect.width / lastW;
    const sy = rect.height / lastH;
    letters.forEach(el => {
      const c = getCenter(el);
      setAbs(el, c.x * sx, c.y * sy);
    });
    lastW = rect.width; lastH = rect.height;
  }
  window.addEventListener('resize', onResize);

  // Initialize
  window.addEventListener('load', () => {
    layoutInitial();
    // Move letters container children to startZone so absolute pos works from it
    while (lettersContainer.firstChild) startZone.appendChild(lettersContainer.firstChild);
    lettersContainer.remove();
  });
})();
