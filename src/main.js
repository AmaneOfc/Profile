import './style.css';

const loader = document.querySelector('#loader');
window.addEventListener('load', () => setTimeout(() => loader.classList.add('hide'), 700));

const canvas = document.querySelector('#stars');
const ctx = canvas.getContext('2d');
let stars = [];
let w = 0, h = 0;

function resize() {
  w = canvas.width = window.innerWidth * devicePixelRatio;
  h = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
  stars = Array.from({ length: Math.min(180, Math.floor(innerWidth / 7)) }, () => ({
    x: Math.random() * innerWidth,
    y: Math.random() * innerHeight,
    r: Math.random() * 1.3 + .2,
    v: Math.random() * .22 + .04,
    a: Math.random() * .65 + .15
  }));
}
function draw() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const s of stars) {
    s.y += s.v;
    if (s.y > innerHeight + 5) { s.y = -5; s.x = Math.random() * innerWidth; }
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(150,200,255,${s.a})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}
resize(); draw();
addEventListener('resize', resize);

const glow = document.querySelector('.cursor-glow');
addEventListener('pointermove', (e) => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('show'));
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

const links = [...document.querySelectorAll('nav a')];
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-40% 0px -50% 0px' });
sections.forEach(section => navObserver.observe(section));
