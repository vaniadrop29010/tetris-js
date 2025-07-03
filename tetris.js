class Tetris {
  constructor(imageX, imageY, template) {
    this.imageY = imageY;
    this.imageX = imageX;
    this.template = template;
    this.x = squareCountX / 2;
    this.y = 0;
  }

  checkBottom() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = i + this.getTruncedPosition().x;
        let realY = j + this.getTruncedPosition().y;
        if (realY + 1 >= squareCountY) {
          return false;
        }
        if (gameMap[realY + 1][realX].imageX != -1) {
          return false;
        }
      }
    }
    return true;
  }

  getTruncedPosition() {
    return { x: Math.trunc(this.x), y: Math.trunc(this.y) };
  }
  checkLeft() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = i + this.getTruncedPosition().x;
        let realY = j + this.getTruncedPosition().y;
        if (realX - 1 < 0) {
          return false;
        }

        if (gameMap[realY][realX - 1].imageX != -1) return false;
      }
    }
    return true;
  }

  checkRight() {
    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = i + this.getTruncedPosition().x;
        let realY = j + this.getTruncedPosition().y;
        if (realX + 1 >= squareCountX) {
          return false;
        }

        if (gameMap[realY][realX + 1].imageX != -1) return false;
      }
    }
    return true;
  }

  moveRight() {
    if (this.checkRight()) {
      this.x += 1;
    }
  }

  moveLeft() {
    if (this.checkLeft()) {
      this.x -= 1;
    }
  }

  moveBottom() {
    if (this.checkBottom()) {
      this.y += 1;
      score += 1;
    }
  }
  changeRotation() {
    let tempTemplate = [];
    for (let i = 0; i < this.template.length; i++)
      tempTemplate[i] = this.template[i].slice();
    let n = this.template.length;
    for (let layer = 0; layer < n / 2; layer++) {
      let first = layer;
      let last = n - 1 - layer;
      for (let i = first; i < last; i++) {
        let offset = i - first;
        let top = this.template[first][i];
        this.template[first][i] = this.template[i][last]; // top = right
        this.template[i][last] = this.template[last][last - offset]; //right = bottom
        this.template[last][last - offset] =
          this.template[last - offset][first];
        //bottom = left
        this.template[last - offset][first] = top; // left = top
      }
    }

    for (let i = 0; i < this.template.length; i++) {
      for (let j = 0; j < this.template.length; j++) {
        if (this.template[i][j] == 0) continue;
        let realX = i + this.getTruncedPosition().x;
        let realY = j + this.getTruncedPosition().y;
        if (
          realX < 0 ||
          realX >= squareCountX ||
          realY < 0 ||
          realY >= squareCountY
        ) {
          this.template = tempTemplate;
          return false;
        }
      }
    }
  }
}

const imageSquareSize = 24;
const framePerSecond = 24;
const gameSpeed = 5;
const canvas = document.getElementById("canvas");
const nextShapeCanvas = document.getElementById("nextShapeCanvas");
const scoreCanvas = document.getElementById("scoreCanvas");
const image = document.getElementById("image");
const ctx = canvas.getContext("2d");
const nctx = nextShapeCanvas.getContext("2d");
const sctx = scoreCanvas.getContext("2d");

// Переменные для полноэкранного режима
let size = 40;
let squareCountX;
let squareCountY;

// Функция для настройки полноэкранного режима
let setupFullscreen = () => {
  // Устанавливаем размеры canvas на весь экран
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  // Вычисляем оптимальный размер блоков
  const maxSquareCountX = 12; // Стандартная ширина Тетриса
  const maxSquareCountY = 20; // Стандартная высота Тетриса
  
  const sizeByWidth = Math.floor(canvas.width / maxSquareCountX);
  const sizeByHeight = Math.floor(canvas.height / maxSquareCountY);
  
  size = Math.min(sizeByWidth, sizeByHeight);
  
  // Вычисляем количество квадратов
  squareCountX = Math.floor(canvas.width / size);
  squareCountY = Math.floor(canvas.height / size);
  
  // Центрируем игровое поле
  const gameAreaWidth = maxSquareCountX * size;
  const gameAreaHeight = maxSquareCountY * size;
  
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.zIndex = '1000';
  canvas.style.backgroundColor = '#000';
  
  // Настраиваем размеры для дополнительных canvas
  nextShapeCanvas.width = size * 6;
  nextShapeCanvas.height = size * 6;
  nextShapeCanvas.style.position = 'fixed';
  nextShapeCanvas.style.top = '20px';
  nextShapeCanvas.style.right = '20px';
  nextShapeCanvas.style.zIndex = '1001';
  nextShapeCanvas.style.border = '2px solid white';
  
  scoreCanvas.width = 300;
  scoreCanvas.height = 100;
  scoreCanvas.style.position = 'fixed';
  scoreCanvas.style.top = '20px';
  scoreCanvas.style.left = '20px';
  scoreCanvas.style.zIndex = '1001';
  scoreCanvas.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
  scoreCanvas.style.borderRadius = '10px';
  
  // Скрываем полосы прокрутки
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
};

const shapes = [
  new Tetris(0, 120, [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ]),
  new Tetris(0, 96, [
    [0, 0, 0],
    [1, 1, 1],
    [0, 1, 0],
  ]),
  new Tetris(0, 72, [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 1],
  ]),
  new Tetris(0, 48, [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
  ]),
  new Tetris(0, 24, [
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
    [0, 0, 1, 0],
  ]),
  new Tetris(0, 0, [
    [1, 1],
    [1, 1],
  ]),

  new Tetris(0, 48, [
    [0, 0, 0],
    [1, 1, 0],
    [0, 1, 1],
  ]),
];

let gameMap;
let gameOver;
let gamePaused = false;
let currentShape;
let nextShape;
let score;
let initialTwoDArr;
let whiteLineThickness = 2;
let gameAreaOffsetX;
let gameAreaOffsetY;

let gameLoop = () => {
  setInterval(update, 1000 / gameSpeed);
  setInterval(draw, 1000 / framePerSecond);
};

let deleteCompleteRows = () => {
  for (let i = 0; i < gameMap.length; i++) {
    let t = gameMap[i];
    let isComplete = true;
    for (let j = 0; j < t.length; j++) {
      if (t[j].imageX == -1) isComplete = false;
    }
    if (isComplete) {
      console.log("complete row");
      score += 1000;
      for (let k = i; k > 0; k--) {
        gameMap[k] = gameMap[k - 1];
      }
      let temp = [];
      for (let j = 0; j < 12; j++) { // Стандартная ширина Тетриса
        temp.push({ imageX: -1, imageY: -1 });
      }
      gameMap[0] = temp;
    }
  }
};

let update = () => {
  if (gameOver || gamePaused) return;
  if (currentShape.checkBottom()) {
    currentShape.y += 1;
  } else {
    for (let k = 0; k < currentShape.template.length; k++) {
      for (let l = 0; l < currentShape.template.length; l++) {
        if (currentShape.template[k][l] == 0) continue;
        gameMap[currentShape.getTruncedPosition().y + l][
          currentShape.getTruncedPosition().x + k
        ] = { imageX: currentShape.imageX, imageY: currentShape.imageY };
      }
    }

    deleteCompleteRows();
    currentShape = nextShape;
    nextShape = getRandomShape();
    if (!currentShape.checkBottom()) {
      gameOver = true;
    }
    score += 100;
  }
};

let drawRect = (x, y, width, height, color) => {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, width, height);
};

let drawBackground = () => {
  // Заливаем весь экран черным
  drawRect(0, 0, canvas.width, canvas.height, "#000");
  
  // Вычисляем смещение для центрирования игрового поля
  const gameAreaWidth = 12 * size; // Стандартная ширина Тетриса
  const gameAreaHeight = 20 * size; // Стандартная высота Тетриса
  gameAreaOffsetX = (canvas.width - gameAreaWidth) / 2;
  gameAreaOffsetY = (canvas.height - gameAreaHeight) / 2;
  
  // Рисуем игровое поле
  drawRect(gameAreaOffsetX, gameAreaOffsetY, gameAreaWidth, gameAreaHeight, "#bca0dc");
  
  // Рисуем сетку
  for (let i = 0; i < 13; i++) {
    drawRect(
      gameAreaOffsetX + size * i - whiteLineThickness,
      gameAreaOffsetY,
      whiteLineThickness,
      gameAreaHeight,
      "white"
    );
  }

  for (let i = 0; i < 21; i++) {
    drawRect(
      gameAreaOffsetX,
      gameAreaOffsetY + size * i - whiteLineThickness,
      gameAreaWidth,
      whiteLineThickness,
      "white"
    );
  }
};

let drawCurrentTetris = () => {
  for (let i = 0; i < currentShape.template.length; i++) {
    for (let j = 0; j < currentShape.template.length; j++) {
      if (currentShape.template[i][j] == 0) continue;
      ctx.drawImage(
        image,
        currentShape.imageX,
        currentShape.imageY,
        imageSquareSize,
        imageSquareSize,
        gameAreaOffsetX + Math.trunc(currentShape.x) * size + size * i,
        gameAreaOffsetY + Math.trunc(currentShape.y) * size + size * j,
        size,
        size
      );
    }
  }
};

let drawSquares = () => {
  for (let i = 0; i < gameMap.length; i++) {
    let t = gameMap[i];
    for (let j = 0; j < t.length; j++) {
      if (t[j].imageX == -1) continue;
      ctx.drawImage(
        image,
        t[j].imageX,
        t[j].imageY,
        imageSquareSize,
        imageSquareSize,
        gameAreaOffsetX + j * size,
        gameAreaOffsetY + i * size,
        size,
        size
      );
    }
  }
};

let drawNextShape = () => {
  nctx.fillStyle = "#bca0dc";
  nctx.fillRect(0, 0, nextShapeCanvas.width, nextShapeCanvas.height);
  for (let i = 0; i < nextShape.template.length; i++) {
    for (let j = 0; j < nextShape.template.length; j++) {
      if (nextShape.template[i][j] == 0) continue;
      nctx.drawImage(
        image,
        nextShape.imageX,
        nextShape.imageY,
        imageSquareSize,
        imageSquareSize,
        size * i,
        size * j + size,
        size,
        size
      );
    }
  }
};

let drawScore = () => {
  sctx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
  sctx.font = "32px Poppins";
  sctx.fillStyle = "black";
  sctx.fillText("Score: " + score, 10, 40);
  sctx.font = "16px Poppins";
  sctx.fillText("P - Pause | F - Fullscreen", 10, 70);
};

let drawGameOver = () => {
  ctx.font = Math.floor(size * 1.5) + "px Poppins";
  ctx.fillStyle = "red";
  ctx.fillText("Game Over!", gameAreaOffsetX + 50, canvas.height / 2);
  ctx.font = Math.floor(size) + "px Poppins";
  ctx.fillText("Press R to restart", gameAreaOffsetX + 50, canvas.height / 2 + 50);
};

let drawPaused = () => {
  ctx.font = Math.floor(size * 1.5) + "px Poppins";
  ctx.fillStyle = "yellow";
  ctx.fillText("PAUSED", gameAreaOffsetX + 50, canvas.height / 2);
  ctx.font = Math.floor(size) + "px Poppins";
  ctx.fillText("Press P to resume", gameAreaOffsetX + 50, canvas.height / 2 + 50);
};

let draw = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawSquares();
  drawCurrentTetris();
  drawNextShape();
  drawScore();
  if (gameOver) {
    drawGameOver();
  } else if (gamePaused) {
    drawPaused();
  }
};

let getRandomShape = () => {
  return Object.create(shapes[Math.floor(Math.random() * shapes.length)]);
};

let resetVars = () => {
  initialTwoDArr = [];
  for (let i = 0; i < 20; i++) { // Стандартная высота Тетриса
    let temp = [];
    for (let j = 0; j < 12; j++) { // Стандартная ширина Тетриса
      temp.push({ imageX: -1, imageY: -1 });
    }
    initialTwoDArr.push(temp);
  }
  score = 0;
  gameOver = false;
  gamePaused = false;
  currentShape = getRandomShape();
  nextShape = getRandomShape();
  gameMap = initialTwoDArr;
  
  // Обновляем squareCount для логики игры
  squareCountX = 12;
  squareCountY = 20;
};

let togglePause = () => {
  if (!gameOver) {
    gamePaused = !gamePaused;
  }
};

let toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().then(() => {
      setTimeout(setupFullscreen, 100);
    });
  } else {
    document.exitFullscreen();
  }
};

let restartGame = () => {
  resetVars();
};

// Обработчик изменения размера окна
window.addEventListener('resize', () => {
  setupFullscreen();
});

// Обработчик выхода из полноэкранного режима
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) {
    // Возвращаем нормальные стили при выходе из полноэкранного режима
    document.body.style.overflow = 'auto';
    canvas.style.position = 'static';
    nextShapeCanvas.style.position = 'static';
    scoreCanvas.style.position = 'static';
  }
});

window.addEventListener("keydown", (event) => {
  if (event.keyCode == 37 && !gamePaused && !gameOver) currentShape.moveLeft(); // Левая стрелка
  else if (event.keyCode == 38 && !gamePaused && !gameOver) currentShape.changeRotation(); // Верхняя стрелка
  else if (event.keyCode == 39 && !gamePaused && !gameOver) currentShape.moveRight(); // Правая стрелка
  else if (event.keyCode == 40 && !gamePaused && !gameOver) currentShape.moveBottom(); // Нижняя стрелка
  else if (event.keyCode == 80) togglePause(); // P - пауза/продолжить
  else if (event.keyCode == 70) toggleFullscreen(); // F - полноэкранный режим
  else if (event.keyCode == 82) restartGame(); // R - перезапуск игры
});

// Инициализация
setupFullscreen();
resetVars();
gameLoop();
