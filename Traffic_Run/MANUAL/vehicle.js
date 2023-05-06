class Vehicle {
  constructor(
    x,
    y,
    width,
    height,
    controlType,
    maxSpeed = 5,
    color = "rgb(26, 171, 255)"
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = 0;
    this.acceleration = 0.12;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false; //initially damaged variable is set to false indicating vehicle is not damaged

    this.useBrain = controlType == "ANN";

    if (controlType != "TRAFFIC") {
      this.sensor = new Sensor(this);
      //this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    } //passing the vehicle into Sensor() constructor
    this.controls = new Controls(controlType);

    this.img = new Image();
    this.img.src = "Daco_4365283.png";
    this.mask = document.createElement("canvas");
    this.mask.height = height;
    this.mask.width = width;

    const maskContext = this.mask.getContext("2d");
    this.img.onload = () => {
      maskContext.fillStyle = color;
      maskContext.rect(0, 0, this.width, this.height);
      maskContext.fill();

      //overlapping the coloured rectangles in mask context on top of the car image s.t it overlaps with the visible pixels of the vehicle image
      maskContext.globalCompositeOperation = "destination-atop";
      maskContext.drawImage(this.img, 0, 0, this.width, this.height);
    };
  }
  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#identifyDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic); //traffic is passed to the sensor also
      //first take out the offsets from the sensor readings
      //for each sensor reading is NULL then return 0
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      //const outputs = NeuralNetwork.feedForward(offsets, this.brain);
      // console.log(outputs);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }

  #identifyDamage(roadBorders, traffic) {
    //to identify the damage occured on the vehicle due to collision with road borders
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) return true; //if vehicle polygon intersect with the road borders, then return true
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) return true; //if vehicle polygon intersect with the road borders, then return true
    }
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }
    if (this.speed != 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += 0.03 * flip;
      }
      if (this.controls.right) {
        this.angle -= 0.03 * flip;
      }
    }
    this.x -= Math.sin(this.angle) * this.speed; //scale by the value of speed, because value of Sin ranges from -1 to 1 only
    this.y -= Math.cos(this.angle) * this.speed;
  }
  draw(context, drawSensor = false) {
    // if (this.sensor && drawSensor) {
    //   this.sensor.draw(context);
    // } //telling the sensor to draw itself

    context.save();
    context.translate(this.x, this.y);
    context.rotate(-this.angle);
    if (!this.damaged) {
      context.drawImage(
        this.mask,
        -this.width / 2,
        -this.height,
        this.width,
        this.height
      );
      context.globalCompositeOperation = "multiply";
    }
    context.drawImage(
      this.img,
      -this.width / 2,
      -this.height,
      this.width,
      this.height
    );
    if (this.damaged) {
      return gameOverInitiator();
    }
    context.restore();
  }
}
