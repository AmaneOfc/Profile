import './style.css';

const loader = document.querySelector('#loader');
const lightningCanvas = document.querySelector('#lightning');
const lctx = lightningCanvas.getContext('2d');
const percent = document.querySelector('.loader-percent');
const progress = document.querySelector('.loader-progress i');
const flash = document.querySelector('.loader-flash');

let lw = 0, lh = 0, dpr = 1, bolts = [], lastStrike = -1000, startTime = performance.now();

function resizeLightning() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  lw = Math.floor(innerWidth * dpr);
  lh = Math.floor(innerHeight * dpr);
  lightningCanvas.width = lw;
  lightningCanvas.height = lh;
  lightningCanvas.style.width = `${innerWidth}px`;
  lightningCanvas.style.height = `${innerHeight}px`;
  lctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function makeBolt() {
  const points = [];
  let x = innerWidth * (0.34 + Math.random() * 0.32);
  let y = -35;
  const target = innerHeight * (0.60 + Math.random() * 0.28);
  points.push({ x, y });

  while (y < target) {
    const progressY = y / target;
    x += (Math.random() - 0.5) * (70 - progressY * 30);
    y += 18 + Math.random() * 32;
    points.push({ x, y });
  }

  const branches = [];
  for (let i = 4; i < points.length - 2; i += 3 + Math.floor(Math.random() * 3)) {
    if (Math.random() > 0.6) continue;
    const origin = points[i];
    const branch = [{ x: origin.x, y: origin.y }];
    let bx = origin.x, by = origin.y;
    const length = 3 + Math.floor(Math.random() * 5);
    for (let j = 0; j < length; j++) {
      bx += (Math.random() - 0.5) * 65;
      by += 18 + Math.random() * 28;
      branch.push({ x: bx, y: by });
    }
    branches.push(branch);
  }
  return { points, branches, life: 1 };
}

function strokePath(points, width, alpha) {
  if (!points.length) return;
  lctx.beginPath();
  lctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) lctx.lineTo(points[i].x, points[i].y);
  lctx.strokeStyle = `rgba(121, 190, 255, ${alpha})`;
  lctx.lineWidth = width;
  lctx.stroke();
}

function drawBolt(bolt) {
  lctx.save();
  lctx.globalCompositeOperation = 'lighter';
  lctx.shadowColor = '#3f8fff';
  lctx.shadowBlur = 26;
  strokePath(bolt.points, 12, 0.08 * bolt.life);
  strokePath(bolt.points, 2.2, 0.95 * bolt.life);
  bolt.branches.forEach(branch => {
    strokePath(branch, 7, 0.06 * bolt.life);
    strokePath(branch, 1.2, 0.75 * bolt.life);
  });
  lctx.restore();
}

function strike() {
  bolts.push(makeBolt());
  flash.classList.remove('hit');
  void flash.offsetWidth;
  flash.classList.add('hit');
}

function lightningFrame(now) {
  if (loader.classList.contains('hide')) return;
  lctx.clearRect(0, 0, innerWidth, innerHeight);
  if (now - lastStrike > 520) {
    strike();
    lastStrike = now;
  }
  bolts.forEach(b => {
    drawBolt(b);
    b.life -= 0.075;
  });
  bolts = bolts.filter(b => b.life > 0);

  const elapsed = Math.min(now - startTime, 2850);
  const value = Math.min(100, Math.round((elapsed / 2850) * 100));
  percent.textContent = `${String(value).padStart(2, '0')}%`;
  progress.style.width = `${value}%`;
  requestAnimationFrame(lightningFrame);
}

resizeLightning();
addEventListener('resize', resizeLightning);
requestAnimationFrame(lightningFrame);

setTimeout(() => {
  loader.classList.add('hide');
}, 3000);

/* Ambient starfield */
const starsCanvas = document.querySelector('#stars');
const sctx = starsCanvas.getContext('2d');
let stars = [];

function resizeStars() {
  const ratio = Math.min(devicePixelRatio || 1, 2);
  starsCanvas.width = innerWidth * ratio;
  starsCanvas.height = innerHeight * ratio;
  starsCanvas.style.width = `${innerWidth}px`;
  starsCanvas.style.height = `${innerHeight}px`;
  sctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  stars = Array.from({ length: Math.min(180, Math.floor(innerWidth / 7)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.25 + 0.15,
    v: Math.random() * 0.18 + 0.035,
    a: Math.random() * 0.5 + 0.08
  }));
}
function drawStars() {
  sctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const star of stars) {
    star.y += star.v;
    if (star.y > innerHeight + 4) { star.y = -4; star.x = Math.random() * innerWidth; }
    sctx.beginPath();
    sctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    sctx.fillStyle = `rgba(157, 202, 255, ${star.a})`;
    sctx.fill();
  }
  requestAnimationFrame(drawStars);
}
resizeStars();
drawStars();
addEventListener('resize', resizeStars);

/* Pointer atmosphere */
const glow = document.querySelector('.cursor-glow');
addEventListener('pointermove', event => {
  glow.style.left = `${event.clientX}px`;
  glow.style.top = `${event.clientY}px`;
});

/* Scroll reveal */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('show');
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* Active navigation */
const navLinks = [...document.querySelectorAll('nav a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-42% 0px -48% 0px' });
sections.forEach(section => navObserver.observe(section));
