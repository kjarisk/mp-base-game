//import "../styles/style.css";
//import { distance, randomIntFromRange, randomColor } from "./utils";
//import { Particle, Effect } from "./classes/ObjectClass";

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

let gradient = ctx.createLinearGradient(
  canvas.width,
  0,
  canvas.width,
  canvas.height
);
gradient.addColorStop(0, 'white');
gradient.addColorStop(0.5, 'magenta');
gradient.addColorStop(1, 'pink');
ctx.fillStyle = gradient;
ctx.strokeStyle = 'white';

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2
};

// Event Listeners
addEventListener('mousemove', (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});
/*
addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  init();
});*/

let effect;
const init = () => {
  effect = new Effect(canvas, ctx, gradient);
};

// Animation Loop
const animate = () => {
  //ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(0,0,0,0.05)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  effect.handleParticles(ctx);
  requestAnimationFrame(animate);
};

init();
animate();
