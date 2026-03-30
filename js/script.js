
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const FPS = 60;
const ATTRITO = 0.97;
const VELOCIDADE_ROTACAO = 0.07;
const FORCA_MOTOR = 0.10;

const VELOCIDADE_TIRO = 7;
const MAX_TIROS = 10;
const ALCANCE_TIRO_FRAMES = FPS;

const ASTEROIDE_QTDE_INICIAL = 4;
const ASTEROIDE_VERTICES = 12;
const ASTEROIDE_SPEED_MAX = 1.5;
const ASTEROIDE_SPEED_MIN = 0.5;
const ASTEROIDE_TAMANHOS = { GRANDE: 40, MEDIO: 20, PEQUENO: 10 };

let gameOver = false;
let score = 0;

let ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    angle: -Math.PI / 2,
    vx: 0,
    vy: 0,
    raioSeguro: 50
};

let tiros = [];
let asteroides = [];

const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, " ": false };

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.key === " " && !gameOver) atirar();
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

function criarVerticesAsteroide(raio) {
    let vertices = [];
    for (let i = 0; i < ASTEROIDE_VERTICES; i++) {
        let angle = (i / ASTEROIDE_VERTICES) * Math.PI * 2;
        let jag = (Math.random() * 0.4 + 0.8); 
        vertices.push({ x: Math.cos(angle) * raio * jag, y: Math.sin(angle) * raio * jag });
    }
    return vertices;
}

function novoAsteroide(x, y, raio) {
    let angulo = Math.random() * Math.PI * 2;
    let velocidade = Math.random() * (ASTEROIDE_SPEED_MAX - ASTEROIDE_SPEED_MIN) + ASTEROIDE_SPEED_MIN;
    return {
        x: x, y: y,
        vx: Math.cos(angulo) * velocidade,
        vy: Math.sin(angulo) * velocidade,
        raio: raio,
        vertices: criarVerticesAsteroide(raio)
    };
}

function inicializarMundo() {
    tiros = [];
    asteroides = [];
    gameOver = false;
    score = 0;
    for (let i = 0; i < ASTEROIDE_QTDE_INICIAL; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        if (Math.hypot(x - ship.x, y - ship.y) < ship.raioSeguro + ASTEROIDE_TAMANHOS.GRANDE) {
            i--; continue;
        }
        asteroides.push(novoAsteroide(x, y, ASTEROIDE_TAMANHOS.GRANDE));
    }
}

function atirar() {
    if (tiros.length >= MAX_TIROS) return;
    tiros.push({
        x: ship.x + Math.cos(ship.angle) * 15,
        y: ship.y + Math.sin(ship.angle) * 15,
        vx: Math.cos(ship.angle) * VELOCIDADE_TIRO + ship.vx,
        vy: Math.sin(ship.angle) * VELOCIDADE_TIRO + ship.vy,
        vida: ALCANCE_TIRO_FRAMES 
    });
}

function atravesarBordas(entidade) {
    if (entidade.x < 0) entidade.x = canvas.width;
    else if (entidade.x > canvas.width) entidade.x = 0;
    if (entidade.y < 0) entidade.y = canvas.height;
    else if (entidade.y > canvas.height) entidade.y = 0;
}

function update() {
    if (gameOver) return;

    if (keys.ArrowLeft) ship.angle -= VELOCIDADE_ROTACAO;
    if (keys.ArrowRight) ship.angle += VELOCIDADE_ROTACAO;
    if (keys.ArrowUp) {
        ship.vx += Math.cos(ship.angle) * FORCA_MOTOR;
        ship.vy += Math.sin(ship.angle) * FORCA_MOTOR;
    }
    ship.vx *= ATTRITO;
    ship.vy *= ATTRITO;
    ship.x += ship.vx;
    ship.y += ship.vy;
    atravesarBordas(ship);

    for (let i = tiros.length - 1; i >= 0; i--) {
        tiros[i].x += tiros[i].vx;
        tiros[i].y += tiros[i].vy;
        tiros[i].vida--;

        if (tiros[i].x < 0 || tiros[i].x > canvas.width || tiros[i].y < 0 || tiros[i].y > canvas.height) {
            tiros[i].vida = 0;
        }
    }
    tiros = tiros.filter(t => t.vida > 0);

    for (let ast of asteroides) {
        ast.x += ast.vx;
        ast.y += ast.vy;
        atravesarBordas(ast);
    }

    for (let i = asteroides.length - 1; i >= 0; i--) {
        let ast = asteroides[i];
        for (let j = tiros.length - 1; j >= 0; j--) {
            if (Math.hypot(tiros[j].x - ast.x, tiros[j].y - ast.y) < ast.raio) {
                tiros.splice(j, 1); 
                if (ast.raio === ASTEROIDE_TAMANHOS.GRANDE) {
                    score += 20;
                    asteroides.push(novoAsteroide(ast.x, ast.y, ASTEROIDE_TAMANHOS.MEDIO));
                    asteroides.push(novoAsteroide(ast.x, ast.y, ASTEROIDE_TAMANHOS.MEDIO));
                } else if (ast.raio === ASTEROIDE_TAMANHOS.MEDIO) {
                    score += 50;
                    asteroides.push(novoAsteroide(ast.x, ast.y, ASTEROIDE_TAMANHOS.PEQUENO));
                    asteroides.push(novoAsteroide(ast.x, ast.y, ASTEROIDE_TAMANHOS.PEQUENO));
                } else {
                    score += 100;
                }
                asteroides.splice(i, 1);
                break; 
            }
        }
    }

    for (let ast of asteroides) {
        if (Math.hypot(ship.x - ast.x, ship.y - ast.y) < (ast.raio + 10)) { 
            gameOver = true;
        }
    }
}

function desenhar() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "20px Courier New";
    ctx.textAlign = "left";
    ctx.fillText("SCORE: " + score, 20, 30);

    if (!gameOver) {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.beginPath();
        ctx.moveTo(15, 0); ctx.lineTo(-10, 10); ctx.lineTo(-10, -10); ctx.closePath();
        ctx.strokeStyle = '#00ffcc';
        ctx.lineWidth = 2;
        ctx.stroke();
        if (keys.ArrowUp) {
            ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-20, 0); ctx.strokeStyle = '#ff5500'; ctx.stroke();
        }
        ctx.restore();
    }

    ctx.fillStyle = '#ff0000';
    for (let tiro of tiros) {
        ctx.beginPath(); ctx.arc(tiro.x, tiro.y, 2, 0, Math.PI * 2); ctx.fill();
    }

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    for (let ast of asteroides) {
        ctx.save();
        ctx.translate(ast.x, ast.y);
        ctx.beginPath();
        ctx.moveTo(ast.vertices[0].x, ast.vertices[0].y);
        for (let i = 1; i < ast.vertices.length; i++) ctx.lineTo(ast.vertices[i].x, ast.vertices[i].y);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    }

    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Arial";
        ctx.fillText("Pressione F5 para reiniciar", canvas.width / 2, canvas.height / 2 + 40);
    }
}

function gameLoop() {
    update();
    desenhar();
    requestAnimationFrame(gameLoop); 
}

inicializarMundo();
gameLoop();
