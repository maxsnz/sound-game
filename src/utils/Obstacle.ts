const canvasWidth = 800;
const canvasHeight = 600;

class Obstacle {
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public dx: number;
  public color: string;

  constructor() {
    this.x = canvasWidth;
    this.y = Math.random() * canvasHeight;
    this.width = 10;
    this.height = 100;
    this.dx = -2;
    this.color = "red";
  }
}

export default Obstacle;
