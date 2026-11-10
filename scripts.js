const scoreElement = document.querySelector("#score");
const timeElement = document.querySelector("#time");
const startButton = document.querySelector("#start-button");
const playArea = document.querySelector("#play-area");
const target = document.querySelector("#target");
const message = document.querySelector("#message");

const roundLength = 20;
let score = 0;
let timeLeft = roundLength;
let timerId;

function moveTarget() {
  const maxX = playArea.clientWidth - target.offsetWidth;
  const maxY = playArea.clientHeight - target.offsetHeight;
  target.style.left = `${Math.random() * Math.max(0, maxX)}px`;
  target.style.top = `${Math.random() * Math.max(0, maxY)}px`;
}

function endGame() {
  window.clearInterval(timerId);
  target.hidden = true;
  message.textContent = `Time’s up! You scored ${score}. Press “Play again” to try once more.`;
  message.hidden = false;
  startButton.disabled = false;
  startButton.textContent = "Play again";
}

function startGame() {
  window.clearInterval(timerId);
  score = 0;
  timeLeft = roundLength;
  scoreElement.textContent = score;
  timeElement.textContent = timeLeft;
  message.hidden = true;
  target.hidden = false;
  startButton.disabled = true;
  moveTarget();

  timerId = window.setInterval(() => {
    timeLeft -= 1;
    timeElement.textContent = timeLeft;

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

startButton.addEventListener("click", startGame);

target.addEventListener("click", () => {
  if (timeLeft <= 0) return;

  score += 1;
  scoreElement.textContent = score;
  moveTarget();
});
