/* =============================================
   GAME.JS — Basketball Mini-Game
   Canvas-based shoot-the-hoop game
   ============================================= */

(function () {
  const canvas    = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx       = canvas.getContext('2d');

  // ── Game state ────────────────────────────────
  const STATE = { IDLE: 'idle', PLAYING: 'playing', SHOOTING: 'shooting', OVER: 'over' };
  let gameState   = STATE.IDLE;
  let score       = 0;
  let highScore   = parseInt(localStorage.getItem('bbHighScore') || '0');
  let shotsLeft   = 10;
  let streak      = 0;
  let animFrame;

  // ── HUD elements ─────────────────────────────
  const scoreEl     = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const shotsEl     = document.getElementById('shotsLeft');
  const streakEl    = document.getElementById('streak');
  const startBtn    = document.getElementById('startBtn');
  const resetBtn    = document.getElementById('resetBtn');

  highScoreEl.textContent = highScore;

  // ── Ball ──────────────────────────────────────
  const ball = {
    x: 100, y: 370,
    r: 18,
    vx: 0, vy: 0,
    gravity: 0.45,
    inFlight: false,
    trail: [],
    rotation: 0,
  };

  // ── Hoop ──────────────────────────────────────
  const hoop = {
    x: 550, y: 140,
    rimW: 50,
    rimH: 6,
    postH: 120,
    speed: 1.2,
    dir: 1,
    scored: false,
    scoredTimer: 0,
  };

  // ── Particles ─────────────────────────────────
  let particles = [];

  // ── Power / Aim ───────────────────────────────
  let aimMode    = false;
  let mouseX     = 0;
  let mouseY     = 0;
  let power      = 0;
  let powerDir   = 1;
  let powerActive = false;

  // ── Messages ──────────────────────────────────
  let flashMsg   = '';
  let flashTimer = 0;
  const msgs = ['NICE SHOT!', 'SWISH!', 'BUCKETS!', 'MONEY!', 'DRIP!', 'GAME!', 'COLD-BLOODED!'];

  // ── Reset ball to start position ─────────────
  function resetBall() {
    ball.x = 100;
    ball.y = canvas.height - 80;
    ball.vx = 0;
    ball.vy = 0;
    ball.inFlight = false;
    ball.trail = [];
    ball.rotation = 0;
    power = 0;
    powerActive = false;
    aimMode = true;
  }

  // ── Spawn particles ───────────────────────────
  function spawnParticles(x, y, color) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        decay: Math.random() * 0.04 + 0.02,
        r: Math.random() * 5 + 2,
        color,
      });
    }
  }

  // ── Update particles ──────────────────────────
  function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2;
      p.life -= p.decay;
    });
  }

  // ── Draw particles ────────────────────────────
  function drawParticles() {
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.life;
      ctx.fillStyle   = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur  = 8;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  // ── Draw background ───────────────────────────
  function drawBackground() {
    // Court floor
    ctx.fillStyle = '#060610';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.04)';
    ctx.lineWidth   = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Floor line
    const floorY = canvas.height - 55;
    ctx.strokeStyle = 'rgba(255, 107, 0, 0.3)';
    ctx.lineWidth   = 2;
    ctx.shadowColor = 'rgba(255, 107, 0, 0.5)';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(0, floorY);
    ctx.lineTo(canvas.width, floorY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Three-point arc
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(ball.x, floorY, 200, Math.PI, 0);
    ctx.stroke();
  }

  // ── Draw backboard & hoop ─────────────────────
  function drawHoop() {
    const bx = hoop.x + hoop.rimW / 2 + 10;
    const by = hoop.y - 60;

    // Backboard
    ctx.fillStyle   = 'rgba(0, 240, 255, 0.08)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.5)';
    ctx.lineWidth   = 2;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.4)';
    ctx.shadowBlur  = 10;
    ctx.fillRect(bx - 5, by - 40, 10, 70);
    ctx.strokeRect(bx - 5, by - 40, 10, 70);

    // Backboard box
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.6)';
    ctx.lineWidth   = 1.5;
    ctx.strokeRect(bx - 4, by - 15, 8, 20);
    ctx.shadowBlur  = 0;

    // Post
    ctx.fillStyle   = 'rgba(0, 240, 255, 0.15)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
    ctx.lineWidth   = 3;
    ctx.beginPath();
    ctx.moveTo(bx, by + 30);
    ctx.lineTo(bx, canvas.height - 55);
    ctx.stroke();

    // Rim glow
    const rimColor = hoop.scored ? '#39ff14' : '#ff6b00';
    ctx.strokeStyle = rimColor;
    ctx.lineWidth   = hoop.rimH;
    ctx.lineCap     = 'round';
    ctx.shadowColor = rimColor;
    ctx.shadowBlur  = hoop.scored ? 25 : 12;
    ctx.beginPath();
    ctx.moveTo(hoop.x, hoop.y);
    ctx.lineTo(hoop.x + hoop.rimW, hoop.y);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Net
    drawNet();
  }

  function drawNet() {
    const nx = hoop.x;
    const ny = hoop.y + hoop.rimH / 2;
    const nw = hoop.rimW;
    const nh = 35;
    const segments = 6;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth   = 1;

    // Vertical lines
    for (let i = 0; i <= segments; i++) {
      const x = nx + (nw / segments) * i;
      ctx.beginPath();
      ctx.moveTo(x, ny);
      ctx.lineTo(nx + nw / 2 + (x - (nx + nw / 2)) * 0.4, ny + nh);
      ctx.stroke();
    }

    // Horizontal lines
    for (let j = 1; j <= 4; j++) {
      const y = ny + (nh / 4) * j;
      const shrink = j * 0.12;
      ctx.beginPath();
      ctx.moveTo(nx + nw * shrink, y);
      ctx.lineTo(nx + nw * (1 - shrink), y);
      ctx.stroke();
    }
  }

  // ── Draw basketball ───────────────────────────
  function drawBall() {
    // Trail
    ball.trail.forEach((pos, i) => {
      const alpha = (i / ball.trail.length) * 0.3;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle   = '#ff6b00';
      ctx.shadowColor = '#ff6b00';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, ball.r * (i / ball.trail.length), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.save();
    ctx.translate(ball.x, ball.y);
    ctx.rotate(ball.rotation);

    // Ball body
    const grad = ctx.createRadialGradient(-5, -5, 2, 0, 0, ball.r);
    grad.addColorStop(0, '#ff8c30');
    grad.addColorStop(0.6, '#ff6b00');
    grad.addColorStop(1, '#cc4400');
    ctx.fillStyle   = grad;
    ctx.shadowColor = '#ff6b00';
    ctx.shadowBlur  = 15;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Seam lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-ball.r, 0);
    ctx.lineTo(ball.r, 0);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -ball.r);
    ctx.lineTo(0, ball.r);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, ball.r * 0.6, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, ball.r * 0.6, Math.PI - Math.PI * 0.4, Math.PI + Math.PI * 0.4);
    ctx.stroke();

    ctx.restore();
  }

  // ── Draw aim guide ────────────────────────────
  function drawAimGuide() {
    if (!aimMode || ball.inFlight) return;

    const dx = mouseX - ball.x;
    const dy = mouseY - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 10) return;

    // Dotted trajectory preview
    const vx = (dx / dist) * (power / 100) * 18;
    const vy = (dy / dist) * (power / 100) * 18;

    ctx.save();
    ctx.setLineDash([4, 8]);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth   = 1.5;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.3)';
    ctx.shadowBlur  = 5;
    ctx.beginPath();
    ctx.moveTo(ball.x, ball.y);

    let px = ball.x, py = ball.y;
    let pvx = vx, pvy = vy;
    for (let i = 0; i < 25; i++) {
      px  += pvx;
      py  += pvy;
      pvy += ball.gravity;
      if (py > canvas.height - 55) break;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.restore();

    // Arrow at mouse
    ctx.save();
    ctx.fillStyle   = 'rgba(0, 240, 255, 0.7)';
    ctx.shadowColor = 'rgba(0, 240, 255, 0.5)';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.arc(mouseX, mouseY, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Power bar
    drawPowerBar();
  }

  // ── Draw power bar ────────────────────────────
  function drawPowerBar() {
    const bx = 20, by = canvas.height - 40;
    const bw = 150, bh = 12;

    ctx.fillStyle   = 'rgba(0,0,0,0.5)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.4)';
    ctx.lineWidth   = 1;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeRect(bx, by, bw, bh);

    const pct   = power / 100;
    const color = pct < 0.4 ? '#39ff14' : pct < 0.7 ? '#ff6b00' : '#ff0044';
    ctx.fillStyle   = color;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 8;
    ctx.fillRect(bx, by, bw * pct, bh);
    ctx.shadowBlur  = 0;

    ctx.fillStyle   = 'rgba(255,255,255,0.6)';
    ctx.font        = '10px "Share Tech Mono"';
    ctx.fillText('POWER', bx, by - 4);
  }

  // ── Draw flash message ────────────────────────
  function drawFlashMsg() {
    if (flashTimer <= 0) return;
    const alpha = Math.min(1, flashTimer / 30);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font        = 'bold 28px Orbitron, sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillStyle   = '#39ff14';
    ctx.shadowColor = '#39ff14';
    ctx.shadowBlur  = 20;
    ctx.fillText(flashMsg, canvas.width / 2, canvas.height / 2 - 30);
    ctx.restore();
    flashTimer--;
  }

  // ── Draw idle / game over screen ──────────────
  function drawOverlay() {
    if (gameState === STATE.IDLE) {
      ctx.save();
      ctx.fillStyle   = 'rgba(0, 240, 255, 0.85)';
      ctx.font        = 'bold 22px Orbitron, sans-serif';
      ctx.textAlign   = 'center';
      ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
      ctx.shadowBlur  = 20;
      ctx.fillText('PRESS START TO PLAY', canvas.width / 2, canvas.height / 2);
      ctx.font        = '13px "Share Tech Mono"';
      ctx.fillStyle   = 'rgba(255,255,255,0.5)';
      ctx.shadowBlur  = 0;
      ctx.fillText('Click or press SPACE to shoot', canvas.width / 2, canvas.height / 2 + 35);
      ctx.restore();
    }

    if (gameState === STATE.OVER) {
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.textAlign   = 'center';
      ctx.font        = 'bold 30px Orbitron, sans-serif';
      ctx.fillStyle   = '#ff6b00';
      ctx.shadowColor = '#ff6b00';
      ctx.shadowBlur  = 25;
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);

      ctx.font        = '18px Orbitron, sans-serif';
      ctx.fillStyle   = '#00f0ff';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur  = 15;
      ctx.fillText(`FINAL SCORE: ${score}`, canvas.width / 2, canvas.height / 2);

      if (score >= highScore && score > 0) {
        ctx.font        = '14px "Share Tech Mono"';
        ctx.fillStyle   = '#39ff14';
        ctx.shadowColor = '#39ff14';
        ctx.shadowBlur  = 12;
        ctx.fillText('🏆 NEW HIGH SCORE!', canvas.width / 2, canvas.height / 2 + 35);
      }

      ctx.font        = '12px "Share Tech Mono"';
      ctx.fillStyle   = 'rgba(255,255,255,0.4)';
      ctx.shadowBlur  = 0;
      ctx.fillText('Press RESET to play again', canvas.width / 2, canvas.height / 2 + 70);
      ctx.restore();
    }
  }

  // ── Shoot the ball ────────────────────────────
  function shoot() {
    if (!aimMode || ball.inFlight || gameState !== STATE.PLAYING) return;

    const dx   = mouseX - ball.x;
    const dy   = mouseY - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    const speed = (power / 100) * 18;
    ball.vx = (dx / dist) * speed;
    ball.vy = (dy / dist) * speed;
    ball.inFlight = true;
    aimMode = false;
    shotsLeft--;
    shotsEl.textContent = shotsLeft;
    power = 0;
    powerActive = false;
  }

  // ── Check scoring ─────────────────────────────
  function checkScore() {
    const rimLeft  = hoop.x;
    const rimRight = hoop.x + hoop.rimW;
    const rimY     = hoop.y;

    const inX = ball.x > rimLeft + 5 && ball.x < rimRight - 5;
    const inY = Math.abs(ball.y - rimY) < ball.r + 4;
    const movingDown = ball.vy > 0;

    if (inX && inY && movingDown && !hoop.scored) {
      hoop.scored     = true;
      hoop.scoredTimer = 40;
      streak++;
      const pts = streak >= 3 ? 3 : streak >= 2 ? 2 : 1;
      score += pts;
      scoreEl.textContent = score;
      streakEl.textContent = streak;

      if (score > highScore) {
        highScore = score;
        localStorage.setItem('bbHighScore', highScore);
        highScoreEl.textContent = highScore;
      }

      flashMsg   = streak >= 3 ? '🔥 ON FIRE! +3' : streak >= 2 ? '💥 STREAK! +2' : msgs[Math.floor(Math.random() * msgs.length)];
      flashTimer = 60;
      spawnParticles(ball.x, ball.y, '#39ff14');
      spawnParticles(hoop.x + hoop.rimW / 2, hoop.y, '#ff6b00');
    }
  }

  // ── Update game ───────────────────────────────
  function update() {
    if (gameState !== STATE.PLAYING) return;

    // Move hoop
    hoop.x += hoop.speed * hoop.dir;
    if (hoop.x + hoop.rimW > canvas.width - 40 || hoop.x < 200) {
      hoop.dir *= -1;
    }

    if (hoop.scoredTimer > 0) {
      hoop.scoredTimer--;
    } else {
      hoop.scored = false;
    }

    // Power oscillation
    if (powerActive) {
      power += 2 * powerDir;
      if (power >= 100) { power = 100; powerDir = -1; }
      if (power <= 0)   { power = 0;   powerDir =  1; }
    }

    if (!ball.inFlight) return;

    // Physics
    ball.trail.push({ x: ball.x, y: ball.y });
    if (ball.trail.length > 12) ball.trail.shift();

    ball.vy       += ball.gravity;
    ball.x        += ball.vx;
    ball.y        += ball.vy;
    ball.rotation += ball.vx * 0.05;

    // Rim collision
    const rimLeft  = hoop.x;
    const rimRight = hoop.x + hoop.rimW;
    const rimY     = hoop.y;

    // Left rim
    if (Math.abs(ball.x - rimLeft) < ball.r && Math.abs(ball.y - rimY) < ball.r + 4) {
      ball.vx = Math.abs(ball.vx) * 0.5;
      ball.vy *= 0.6;
      streak = 0;
      streakEl.textContent = streak;
      spawnParticles(rimLeft, rimY, '#ff6b00');
    }

    // Right rim
    if (Math.abs(ball.x - rimRight) < ball.r && Math.abs(ball.y - rimY) < ball.r + 4) {
      ball.vx = -Math.abs(ball.vx) * 0.5;
      ball.vy *= 0.6;
      streak = 0;
      streakEl.textContent = streak;
      spawnParticles(rimRight, rimY, '#ff6b00');
    }

    checkScore();

    // Floor bounce / out of bounds
    const floorY = canvas.height - 55;
    if (ball.y + ball.r >= floorY) {
      ball.y  = floorY - ball.r;
      ball.vy = -ball.vy * 0.4;
      ball.vx *= 0.8;
      if (Math.abs(ball.vy) < 1) {
        ball.vy = 0;
        ball.vx = 0;
        ball.inFlight = false;
        streak = 0;
        streakEl.textContent = streak;
        if (shotsLeft <= 0) {
          setTimeout(() => { gameState = STATE.OVER; }, 600);
        } else {
          setTimeout(() => { resetBall(); }, 500);
        }
      }
    }

    // Wall bounce
    if (ball.x - ball.r < 0) { ball.x = ball.r; ball.vx = Math.abs(ball.vx) * 0.7; }
    if (ball.x + ball.r > canvas.width) { ball.x = canvas.width - ball.r; ball.vx = -Math.abs(ball.vx) * 0.7; }

    // Out of top
    if (ball.y + ball.r < 0) {
      ball.inFlight = false;
      streak = 0;
      streakEl.textContent = streak;
      if (shotsLeft <= 0) {
        setTimeout(() => { gameState = STATE.OVER; }, 300);
      } else {
        setTimeout(() => { resetBall(); }, 300);
      }
    }

    updateParticles();
  }

  // ── Draw frame ────────────────────────────────
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawHoop();
    drawBall();
    drawAimGuide();
    drawParticles();
    drawFlashMsg();
    drawOverlay();
  }

  // ── Game loop ─────────────────────────────────
  function loop() {
    update();
    draw();
    animFrame = requestAnimationFrame(loop);
  }

  // ── Start game ────────────────────────────────
  function startGame() {
    score     = 0;
    shotsLeft = 10;
    streak    = 0;
    scoreEl.textContent  = score;
    shotsEl.textContent  = shotsLeft;
    streakEl.textContent = streak;
    particles = [];
    flashTimer = 0;
    gameState  = STATE.PLAYING;
    hoop.x     = 400;
    hoop.dir   = 1;
    resetBall();
    startBtn.textContent = 'PLAYING...';
    startBtn.disabled    = true;
  }

  function resetGame() {
    gameState  = STATE.IDLE;
    score      = 0;
    shotsLeft  = 10;
    streak     = 0;
    scoreEl.textContent  = score;
    shotsEl.textContent  = shotsLeft;
    streakEl.textContent = streak;
    particles  = [];
    flashTimer = 0;
    ball.inFlight = false;
    ball.x = 100;
    ball.y = canvas.height - 80;
    ball.vx = 0; ball.vy = 0;
    ball.trail = [];
    aimMode    = false;
    startBtn.textContent = 'START GAME';
    startBtn.disabled    = false;
  }

  // ── Event listeners ───────────────────────────
  startBtn.addEventListener('click', startGame);
  resetBtn.addEventListener('click', resetGame);

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (e.clientX - rect.left) * scaleX;
    mouseY = (e.clientY - rect.top)  * scaleY;
  });

  canvas.addEventListener('mousedown', (e) => {
    if (gameState !== STATE.PLAYING || ball.inFlight) return;
    powerActive = true;
    powerDir    = 1;
    power       = 0;
  });

  canvas.addEventListener('mouseup', (e) => {
    if (gameState !== STATE.PLAYING || ball.inFlight) return;
    powerActive = false;
    shoot();
  });

  // Touch support
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (gameState !== STATE.PLAYING || ball.inFlight) return;
    const touch = e.touches[0];
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (touch.clientX - rect.left) * scaleX;
    mouseY = (touch.clientY - rect.top)  * scaleY;
    powerActive = true;
    powerDir    = 1;
    power       = 0;
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const rect  = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    mouseX = (touch.clientX - rect.left) * scaleX;
    mouseY = (touch.clientY - rect.top)  * scaleY;
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (gameState !== STATE.PLAYING || ball.inFlight) return;
    powerActive = false;
    shoot();
  }, { passive: false });

  // Space bar to shoot
  document.addEventListener('keydown', (e) => {
    // FIX: Don't trigger game if user is typing in a form
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space') {
      e.preventDefault();
      if (gameState === STATE.IDLE) { startGame(); return; }
      if (gameState === STATE.PLAYING && !ball.inFlight) {
        powerActive = true;
        powerDir    = 1;
        power       = 0;
      }
    }
  });

  document.addEventListener('keyup', (e) => {
    // FIX: Don't trigger game if user is typing in a form
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.code === 'Space' && gameState === STATE.PLAYING && !ball.inFlight) {
      powerActive = false;
      shoot();
    }
  });

  // ── Start loop ────────────────────────────────
  loop();

})();
