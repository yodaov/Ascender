(() => {
  const targetWord = "Subida";
  const startZone = document.getElementById('startZone');
  const lettersContainer = document.getElementById('letters');
  const secretLink = document.getElementById('secretLink');
  const letters = Array.from(document.querySelectorAll('.letter'));

  function setAbs(el, x, y) {
    el.style.left = (x - el.offsetWidth / 2) + 'px';
    el.style.top  = (y - el.offsetHeight / 2) + 'px';
  }
  function getCenter(el) {
    const r = el.getBoundingClientRect();
    const parent = startZone.getBoundingClientRect();
    return { x: r.left - parent.left + r.width / 2, y: r.top - parent.top + r.height / 2 };
  }

  function layoutInitial() {
    const rect = startZone.getBoundingClientRect();
    const spacing = Math.min(80, rect.width / 8);
    const startX = rect.width / 2 - ((letters.length - 1) * spacing) / 2;
    const y = rect.height / 2;
    letters.forEach((el, i) => {
      const x = startX + i * spacing;
      setAbs(el, x, y);
    });
  }

  letters.forEach(el => {
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('keydown', onKeyDrag);
  });

  function onDown(e) {
    e.preventDefault();
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    const parentRect = startZone.getBoundingClientRect();
    const center = getCenter(el);
    const offsetX = e.clientX - (parentRect.left + center.x);
    const offsetY = e.clientY - (parentRect.top + center.y);

    function onMove(ev) {
      const x = ev.clientX - parentRect.left - offsetX;
      const y = ev.clientY - parentRect.top - offsetY;
      setAbs(el, x, y);
    }
    function onUp() {
      el.releasePointerCapture(e.pointerId);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      checkSolved();
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
  }

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
    const withPos = letters.map(el => ({ el, c: getCenter(el) }));
    const yVals = withPos.map(p => p.c.y);
    const ySpread = Math.max(...yVals) - Math.min(...yVals);
    if (ySpread > 60) return;

    const ordered = [...withPos].sort((a,b) => a.c.x - b.c.x)
                                .map(p => p.el.dataset.letter).join('');
    if (ordered === targetWord) {
      secretLink.classList.add('show');
      startZone.animate([{ filter:'brightness(1)' }, { filter:'brightness(1.6)' }, { filter:'brightness(1)' }],
                        { duration: 500, easing:'ease-out' });
      // temporarily disable letter drags right after solve
      letters.forEach(el => el.style.pointerEvents = 'none');
      setTimeout(() => letters.forEach(el => el.style.pointerEvents = ''), 600);
    }
  }

  function onResize() { layoutInitial(); }
  window.addEventListener('resize', onResize);
  window.addEventListener('load', layoutInitial);
})();
