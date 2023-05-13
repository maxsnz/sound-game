import Obstacle from "./Obstacle.js";
import { analyser, audioContext } from "./audioContext.js";
import { autoCorrelate } from "./autoCorrelate.js";

// const canvasWidth = 800;
const canvasHeight = 600;

class Game {
  public onEnd: () => void;
  public canvas: HTMLCanvasElement | undefined;
  public ctx: CanvasRenderingContext2D | undefined;
  public audioContext: AudioContext | undefined;
  public analyser: AnalyserNode | undefined;
  public player: {
    x: number;
    y: number;
    dy: number;
    size: number;
    color: string;
  };
  public obstacles: Obstacle[];
  public isPlaying: boolean;
  public updateInterval: number;
  public voldiff: number;

  constructor() {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.onEnd = () => {};
    this.canvas = undefined;
    this.ctx = undefined;
    this.audioContext = undefined;
    this.analyser = undefined;

    this.player = {
      x: 50,
      y: canvasHeight / 2,
      dy: 5,
      size: 20,
      color: "blue",
    };
    this.obstacles = [];
    this.isPlaying = false;
    this.onKeyDown = this.onKeyDown.bind(this);
    this.updateInterval = 0;
    this.voldiff = 0;
  }

  createObstacle() {
    const obstacle = new Obstacle();
    this.obstacles.push(obstacle);
    if (this.isPlaying) setTimeout(() => this.createObstacle(), 2000);
  }

  move(dy: number) {
    this.player.y += dy;
    if (this.player.y < 0) this.player.y = 0;
    if (this.player.y + this.player.size > canvasHeight) {
      this.player.y = canvasHeight - this.player.size;
    }
  }

  update() {
    if (!this.ctx || !this.canvas) throw Error();

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw Player
    this.ctx.fillStyle = this.player.color;
    this.ctx.fillRect(
      this.player.x,
      this.player.y,
      this.player.size,
      this.player.size
    );

    // Update and draw Obstacles
    for (let i = 0; i < this.obstacles.length; i++) {
      const obstacle = this.obstacles[i];
      obstacle.x += obstacle.dx;
      this.ctx.fillStyle = obstacle.color;
      this.ctx.fillRect(
        obstacle.x,
        obstacle.y,
        obstacle.width,
        obstacle.height
      );

      // Collision detection
      if (
        this.player.x < obstacle.x + obstacle.width &&
        this.player.x + this.player.size > obstacle.x &&
        this.player.y < obstacle.y + obstacle.height &&
        this.player.y + this.player.size > obstacle.y
      ) {
        // alert("Game Over");
        // document.location.reload();
        this.finishGame();
      }

      // Remove off-screen obstacles
      if (obstacle.x + obstacle.width < 0) {
        this.obstacles.splice(i, 1);
        i--;
      }
    }
  }

  onKeyDown(e: KeyboardEvent) {
    if (e.key == "w" || e.key == "W") {
      this.move(-this.player.dy);
    } else if (e.key == "s" || e.key == "S") {
      this.move(this.player.dy);
    }
  }

  startGame(voldiff: number, onEnd: () => void) {
    this.voldiff = voldiff;
    this.onEnd = onEnd;
    this.audioContext = audioContext;
    this.analyser = analyser;
    this.canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
    const context = this.canvas.getContext("2d");
    if (context === null) {
      throw new Error(
        "This browser does not support 2-dimensional canvas rendering contexts."
      );
    }
    this.ctx = context;
    this.isPlaying = true;
    this.startSound();

    this.player = {
      x: 50,
      y: canvasHeight / 2,
      dy: 10,
      size: 20,
      color: "blue",
    };

    this.obstacles = [];

    this.createObstacle();

    this.updateInterval = setInterval(() => this.update(), 20);

    window.addEventListener("keydown", this.onKeyDown, false);
  }

  finishGame() {
    clearInterval(this.updateInterval);
    this.isPlaying = false;
    this.onEnd();
  }

  visualize() {
    let previousValueToDisplay = 0;
    let smoothingCount = 0;
    let smoothingThreshold = 5;
    let smoothingCountThreshold = 5;

    const drawNote = () => {
      if (this.isPlaying) requestAnimationFrame(drawNote);
      if (!analyser || !audioContext) return;

      const noteEl = document.getElementById("note");
      const smoothingEl = document.querySelector(
        'input[name="smoothing"]:checked'
      ) as HTMLInputElement;

      const bufferLength = analyser.fftSize;
      const buffer = new Float32Array(bufferLength);
      analyser.getFloatTimeDomainData(buffer);
      const autoCorrelateValue = autoCorrelate(buffer, audioContext.sampleRate);

      // Handle rounding
      let valueToDisplay = autoCorrelateValue;

      valueToDisplay = Math.round(valueToDisplay);

      const smoothingValue = smoothingEl.value;

      if (autoCorrelateValue === -1) {
        if (noteEl) noteEl.innerText = "0";
        return;
      }
      if (smoothingValue === "none") {
        smoothingThreshold = 99999;
        smoothingCountThreshold = 0;
      } else if (smoothingValue === "basic") {
        smoothingThreshold = 10;
        smoothingCountThreshold = 5;
      } else if (smoothingValue === "very") {
        smoothingThreshold = 5;
        smoothingCountThreshold = 10;
      }
      function noteIsSimilarEnough() {
        // Check threshold for number, or just difference for notes.
        if (typeof valueToDisplay == "number") {
          return (
            Math.abs(valueToDisplay - previousValueToDisplay) <
            smoothingThreshold
          );
        } else {
          return valueToDisplay === previousValueToDisplay;
        }
      }
      // Check if this value has been within the given range for n iterations
      if (noteIsSimilarEnough()) {
        if (smoothingCount < smoothingCountThreshold) {
          smoothingCount++;
          return;
        } else {
          previousValueToDisplay = valueToDisplay;
          smoothingCount = 0;
        }
      } else {
        previousValueToDisplay = valueToDisplay;
        smoothingCount = 0;
        return;
      }
      if (typeof valueToDisplay == "number") {
        valueToDisplay = valueToDisplay - this.voldiff;
      }

      if (noteEl) noteEl.innerText = valueToDisplay.toString();
      if (valueToDisplay > 0) this.move(-this.player.dy);
      if (valueToDisplay < 0) this.move(this.player.dy);
    };

    drawNote();
  }

  startSound() {
    if (!this.audioContext || !this.analyser) throw Error();
    let source;

    this.analyser.minDecibels = -100;
    this.analyser.maxDecibels = -10;
    this.analyser.smoothingTimeConstant = 0.85;
    if (!navigator?.mediaDevices?.getUserMedia) {
      // No audio allowed
      alert("Sorry, getUserMedia is required for the app.");
      return;
    } else {
      const constraints = { audio: true };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          if (!audioContext || !analyser) throw Error();
          // Initialize the SourceNode
          source = audioContext.createMediaStreamSource(stream);
          // Connect the source node to the analyzer
          source.connect(analyser);
          this.visualize();
        })
        .catch(function (err) {
          console.log(err);
          alert("Error");
        });
    }
  }
}

export default Game;
