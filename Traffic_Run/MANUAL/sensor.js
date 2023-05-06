class Sensor {
  constructor(vehicle) {
    this.vehicle = vehicle;
    this.rayCount = 9; //Sensor will cast rays in different directions
    this.rayLength = 200; //range or coverage area of sensors
    this.raySpread = Math.PI / 2;
    this.rays = [];
    this.readings = []; //values for each array, telling if there is an obstacle or not and how far it is
  }
  update(roadBorders, traffic) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  #getReading(ray, roadBorders, traffic) {
    let touches = [];
    //finding which ray out of the total rays intersect with one or both of the borders along the road and storing the intersection/touch into touches[] array
    //nothing is pushed into touches[], if no intersection is found
    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      if (touch) {
        touches.push(touch);
      }
    }

    //for computing collision points of our vehicle with the traffic
    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygon;
      for (let j = 0; j < poly.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );
        if (value) {
          touches.push(value);
        }
      }
    }
    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset == minOffset); //if offset of touch equals the minOffset then return that particular touch
    }
  }

  #castRays() {
    this.rays = []; //empty the array of rays before generating new rays
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        linear_interpolation(
          +this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.vehicle.angle; //generating n-rays in the range [-22.5,+22.5], vehicle angle is added to syncrhonise the rays with the rotation of the car
      const start = { x: this.vehicle.x, y: this.vehicle.y };
      const end = {
        x: this.vehicle.x - Math.sin(rayAngle) * this.rayLength,
        y: this.vehicle.y - Math.cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
      //road borders are also to be put on the ray segments
    }
  }
  draw(context) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i];
      }
      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "yellow";
      context.moveTo(this.rays[i][0].x, this.rays[i][0].y); //for i=0, ray[0][0] =>start point of first ray,
      //ray[0][0].x => x - coordinate of start point
      //ray[0][0].y => y-coordinate of start point
      context.lineTo(end.x, end.y); // x & y-coordinates of end-point of ith ray i.e ray appears only upto the point where an obstacle occurs
      context.stroke();

      context.beginPath();
      context.lineWidth = 2;
      context.strokeStyle = "black";
      context.moveTo(this.rays[i][1].x, this.rays[i][1].y); //for i=0, ray[0][0] =>start point of first ray,
      context.lineTo(end.x, end.y); // x & y-coordinates of end-point of ith ray i.e ray appears only upto the point where an obstacle occurs
      context.stroke();
    }
  }
}
