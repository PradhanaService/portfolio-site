// Pleasant Ambient Logo Bouncing Arena (Expertise Hero)
// - DVD diagonal gliding motion for 11 digital marketing badges
// - Continuous, resilient 60fps loop that never freezes or gets stuck

// Track the global RAF handle so re-runs can cancel the old loop
let _ppGlobalRaf = null;

function initPleasantLogoPingPong() {
  // Cancel any existing animation loop from a previous page visit
  if (_ppGlobalRaf) {
    cancelAnimationFrame(_ppGlobalRaf);
    _ppGlobalRaf = null;
  }
  const box = document.querySelector('[data-pingpong]');
  if (!box) return;

  const canvas = box.querySelector('.pp-ambient-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const logos = [...box.querySelectorAll('.pp-logo')];
  if (logos.length === 0) return;

  const SPEED_X = 52;
  const SPEED_Y = 42;
  const TARGET_SPEED = Math.hypot(SPEED_X, SPEED_Y);

  let W = 360, H = 280, R = 22, dpr = 1;
  let balls = [];
  let ripples = [];
  let last = performance.now();
  let raf = null;

  function measure() {
    const rect = box.getBoundingClientRect();
    const w = rect.width || box.clientWidth || 360;
    const h = rect.height || box.clientHeight || 280;

    W = Math.max(w, 280);
    H = Math.max(h, 220);
    R = W < 340 ? 19 : 22;
    dpr = window.devicePixelRatio || 1;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    logos.forEach(el => {
      el.style.width = (R * 2) + 'px';
      el.style.height = (R * 2) + 'px';
    });
  }

  function spawnRipple(x, y) {
    if (ripples.length > 8) ripples.shift();
    ripples.push({
      x,
      y,
      radius: 3,
      maxRadius: 20,
      alpha: 0.32,
      life: 0,
      maxLife: 0.55
    });
  }

  function triggerWallTouch(b, hitX, hitY) {
    b.el.classList.add('is-pulsing');
    clearTimeout(b.pulseTimer);
    b.pulseTimer = setTimeout(() => {
      b.el.classList.remove('is-pulsing');
    }, 380);

    b.scale = 0.94;
    spawnRipple(hitX, hitY);
  }

  function spawnBalls() {
    measure();

    const cols = 4;
    const rows = 3;
    balls = logos.map((el, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const cx = ((col + 0.5) / cols) * W + (Math.random() - 0.5) * 8;
      const cy = ((row + 0.5) / rows) * H + (Math.random() - 0.5) * 8;

      const signX = (i % 2 === 0) ? 1 : -1;
      const signY = (Math.floor(i / 2) % 2 === 0) ? 1 : -1;

      const minX = R + 4;
      const maxX = Math.max(W - R - 4, minX + 1);
      const minY = R + 4;
      const maxY = Math.max(H - R - 4, minY + 1);

      return {
        el,
        x: Math.min(Math.max(cx, minX), maxX),
        y: Math.min(Math.max(cy, minY), maxY),
        vx: signX * (SPEED_X + (Math.random() - 0.5) * 6),
        vy: signY * (SPEED_Y + (Math.random() - 0.5) * 6),
        scale: 1,
        rotation: (Math.random() - 0.5) * 6,
        rotSpeed: (Math.random() - 0.5) * 4,
        pulseTimer: null
      };
    });

    draw();
  }

  function update(dt) {
    if (balls.length === 0) return;

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;

      b.rotation += b.rotSpeed * dt;
      if (Math.abs(b.rotation) > 7) b.rotSpeed = -b.rotSpeed;

      b.scale += (1.0 - b.scale) * Math.min(dt * 10, 1);

      if (b.x <= R) {
        b.x = R;
        b.vx = Math.abs(b.vx);
        triggerWallTouch(b, R, b.y);
      } else if (b.x >= W - R) {
        b.x = W - R;
        b.vx = -Math.abs(b.vx);
        triggerWallTouch(b, W - R, b.y);
      }

      if (b.y <= R) {
        b.y = R;
        b.vy = Math.abs(b.vy);
        triggerWallTouch(b, b.x, R);
      } else if (b.y >= H - R) {
        b.y = H - R;
        b.vy = -Math.abs(b.vy);
        triggerWallTouch(b, b.x, H - R);
      }
    }

    const min = R * 2;
    for (let i = 0; i < balls.length; i++) {
      for (let j = i + 1; j < balls.length; j++) {
        const a = balls[i];
        const c = balls[j];
        const dx = c.x - a.x;
        const dy = c.y - a.y;
        const distSq = dx * dx + dy * dy;

        if (distSq >= min * min || distSq === 0) continue;

        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;

        const overlap = (min - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        c.x += nx * overlap;
        c.y += ny * overlap;

        const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rel < 0) {
          a.vx += rel * nx;
          a.vy += rel * ny;
          c.vx -= rel * nx;
          c.vy -= rel * ny;
        }
      }
    }

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const s = Math.hypot(b.vx, b.vy) || 1;
      b.vx = (b.vx / s) * TARGET_SPEED;
      b.vy = (b.vy / s) * TARGET_SPEED;
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.life += dt;
      const progress = r.life / r.maxLife;
      r.radius = 4 + progress * (r.maxRadius - 4);
      r.alpha = Math.max(0, 0.32 * (1 - progress));

      if (r.life >= r.maxLife) {
        ripples.splice(i, 1);
      }
    }
  }

  function draw() {
    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      b.el.style.transform = `translate3d(${b.x - R}px, ${b.y - R}px, 0) rotate(${b.rotation.toFixed(1)}deg) scale(${b.scale.toFixed(3)})`;
    }

    ctx.clearRect(0, 0, W, H);

    for (let i = 0; i < balls.length; i++) {
      const b = balls[i];
      const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, R * 1.35);
      grad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      grad.addColorStop(0.6, 'rgba(56, 189, 248, 0.04)');
      grad.addColorStop(1, 'rgba(56, 189, 248, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(b.x, b.y, R * 1.35, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < ripples.length; i++) {
      const r = ripples[i];
      ctx.strokeStyle = `rgba(56, 189, 248, ${r.alpha.toFixed(3)})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function loop(now) {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    update(dt);
    draw();
    raf = requestAnimationFrame(loop);
    _ppGlobalRaf = raf;
  }

  function start() {
    if (balls.length === 0) spawnBalls();
    draw();

    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(loop);
    }
  }

  // Force setup & continuous start
  spawnBalls();
  start();

  const ro = new ResizeObserver(() => {
    measure();
    if (balls.length === 0) {
      spawnBalls();
    } else {
      balls.forEach(b => {
        b.x = Math.min(Math.max(b.x, R), Math.max(W - R, R));
        b.y = Math.min(Math.max(b.y, R), Math.max(H - R, R));
      });
      draw();
    }
  });
  ro.observe(box);

  window.addEventListener('pageshow', start);
  window.addEventListener('load', start);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) start();
  });
}

window.initLogoPingPong = initPleasantLogoPingPong;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPleasantLogoPingPong);
} else {
  initPleasantLogoPingPong();
}
