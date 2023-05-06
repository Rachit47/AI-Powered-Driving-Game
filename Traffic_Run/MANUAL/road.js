class Road {
  constructor(x, width, laneCount = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;
    this.left = x - width / 2;
    this.right = x + width / 2;
    const infinity = 1000000;
    this.top = -infinity;
    this.bottom = infinity;

    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    //considering only single way roadway
    this.borders = [
      [topLeft, bottomLeft],
      [topRight, bottomRight],
    ];
  }

  //method that tells the center of each lane
  getLaneCenter(laneIndex) {
    const laneWidth = this.width / this.laneCount;
    return (
      this.left +
      laneWidth / 2 +
      Math.min(laneIndex, this.laneCount - 1) * laneWidth
    );
  }

  draw(context) {
    context.lineWidth = 5;
    context.strokeStyle = "white";
    //drawing a line on left side of the screen
    for (let i = 1; i <= this.laneCount - 1; i++) {
      //compute the x-coordinate of each of the vertical lines (lanes) that are to be drawn, depending upon the laneCount
      //we get the x-values using linear interpolation
      const x = linear_interpolation(this.left, this.right, i / this.laneCount);
      context.setLineDash([20, 20]); //making the inner lanes in the form of dashed lines with length of 20 pixels and a break of 20 pixels
      context.beginPath();
      context.moveTo(x, this.top);
      context.lineTo(x, this.bottom);
      context.stroke();
    }
    context.setLineDash([]);
    this.borders.forEach((border) => {
      context.beginPath();
      context.moveTo(border[0].x, border[0].y);
      context.lineTo(border[1].x, border[1].y);
      context.stroke();
    });
  }
}
