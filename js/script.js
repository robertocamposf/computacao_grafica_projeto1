const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let x = 250;
let y = 150;
let angulo = 0;

function desenhar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();

  // Move a origem
  ctx.translate(x, y);

  // Rotaciona
  ctx.rotate(angulo);

  // Desenha o quadrado
  ctx.fillStyle = "lime";
  ctx.fillRect(-25, -25, 50, 50);

  ctx.restore();
}

function mover() {
  x += 20; // translação no eixo X
  desenhar();
}

function rotacionar() {
  angulo += Math.PI / 8; // rotação
  desenhar();
}

// Desenho inicial
desenhar();
