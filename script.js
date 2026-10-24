
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreText = document.getElementById("score");
const livesText = document.getElementById("lives");
const bestText = document.getElementById("best");
const W = canvas.width;
const H = canvas.height;
const ground = H - 45;

let score = 0;
let lives = 3;
let best = Number(localStorage.getItem("littleGuyBest")) || 0;
let running = false;
let gameOver = false;
let objects = [];
let keys = {};
let frame = 0;
let lastTime = 0;

const player = {
  x: W / 2 - 17,
  y: ground - 34,
  width: 34,
  height: 34,
  speed: 5,
  invincible: 0
};

bestText.textContent = "Best: " + best;

document.addEventListener("keydown", function(e) {
  const key = e.key.toLowerCase();

  if (["arrowleft", "arrowright", "a", "d"].includes(key)) {
    e.preventDefault();
    keys[key] = true;

    if (!running) {
      resetGame();
    }
  }
});

document.addEventListener("keyup", function(e) {
  keys[e.key.toLowerCase()] = false;
});

function resetGame() {
  score = 0;
  lives = 3;
  frame = 0;
  objects = [];

  player.x = W / 2 - player.width / 2;
  player.invincible = 0;

  running = true;
  gameOver = false;

  updateHUD();
}

function updateHUD() {
  scoreText.textContent = "Crumbs: " + score;
  livesText.textContent = "Hearts: " + "❤️".repeat(lives);
  bestText.textContent = "Best: " + best;
}

function spawnObject() {
  const isBoot = Math.random() < 0.35;

  const size = isBoot ? 55 : 20;

  objects.push({
    x: Math.random() * (W - size),
    y: -size,
    width: size,
    height: size,
    type: isBoot ? "boot" : "crumb",
    speed: 2.5 + Math.min(score * 0.08, 4)
  });
}

function collision(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function drawBackground() {
  ctx.fillStyle = "#c9eddf";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#a4d6a0";
  ctx.fillRect(0, ground, W, H - ground);

  ctx.fillStyle = "#7bb27a";
  ctx.fillRect(0, ground, W, 5);
}

function drawPlayer() {
  if (player.invincible > 0 && frame % 10 < 5) {
    return;
  }

  const x = player.x;
  const y = player.y;

  ctx.fillStyle = "#f3c4a5";
  ctx.beginPath();
  ctx.ellipse(x + 17, y + 19, 17, 16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#29221e";
  ctx.beginPath();
  ctx.arc(x + 11, y + 16, 2, 0, Math.PI * 2);
  ctx.arc(x + 23, y + 16, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(x + 17, y + 20, 5, 0.15, Math.PI - 0.15);
  ctx.strokeStyle = "#29221e";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#88664e";
  ctx.fillRect(x + 6, y + 31, 8, 4);
  ctx.fillRect(x + 21, y + 31, 8, 4);
}

function drawCrumb(obj) {
  ctx.fillStyle = "#d9a453";
  ctx.beginPath();
  ctx.arc(
    obj.x + obj.width / 2,
    obj.y + obj.height / 2,
    obj.width / 2,
    0,
    Math.PI * 2
  );
  ctx.fill();

  ctx.strokeStyle = "#9b6b36";
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawBoot(obj) {
  const x = obj.x;
  const y = obj.y;

  ctx.fillStyle = "#57463f";
  ctx.fillRect(x + 22, y, 25, 36);
  ctx.fillRect(x + 3, y + 26, 44, 19);

  ctx.fillStyle = "#302722";
  ctx.fillRect(x, y + 43, 50, 9);
}

function update() {
  if (!running) return;

  frame++;

  if (keys["arrowleft"] || keys["a"]) {
    player.x -= player.speed;
  }

  if (keys["arrowright"] || keys["d"]) {
    player.x += player.speed;
  }

  player.x = Math.max(
    0,
    Math.min(W - player.width, player.x)
  );

  if (player.invincible > 0) {
    player.invincible--;
  }

  if (frame % Math.max(25, 65 - score) === 0) {
    spawnObject();
  }

  for (let i = objects.length - 1; i >= 0; i--) {
    const obj = objects[i];

    obj.y += obj.speed;

    if (collision(player, obj)) {
      if (obj.type === "crumb") {
        score++;

        if (score > best) {
          best = score;
          localStorage.setItem("littleGuyBest", best);
        }

        objects.splice(i, 1);
        updateHUD();
        continue;
      }

      if (obj.type === "boot" && player.invincible === 0) {
        lives--;
        player.invincible = 70;
        objects.splice(i, 1);

        updateHUD();

        if (lives <= 0) {
          running = false;
          gameOver = true;
        }

        continue;
      }
    }

    if (obj.y > H) {
      objects.splice(i, 1);
    }
  }
}

function drawMessage(title, subtitle) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = "#433327";
  ctx.textAlign = "center";

  ctx.font = "bold 30px Arial";
  ctx.fillText(title, W / 2, H / 2 - 15);

  ctx.font = "17px Arial";
  ctx.fillText(subtitle, W / 2, H / 2 + 22);
}

function draw() {
  drawBackground();

  for (const obj of objects) {
    if (obj.type === "boot") {
      drawBoot(obj);
    } else {
      drawCrumb(obj);
    }
  }

  drawPlayer();

  if (!running) {
    if (gameOver) {
      drawMessage("Game Over", "Press ← → or A / D to restart");
    } else {
      drawMessage("Ready?", "Press ← → or A / D to start");
    }
  }
}

function gameLoop(timestamp) {
  if (timestamp - lastTime >= 1000 / 60) {
    update();
    draw();
    lastTime = timestamp;
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
