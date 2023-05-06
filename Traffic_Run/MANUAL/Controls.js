class Controls {
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;
    switch (type) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "TRAFFIC": // we don't control the traffic, traffic runs in forward direction
        this.forward = true;
        break;
    }
  }
  #addKeyboardListeners() {
    //Key pressed
    document.onkeydown = (event) => {
      //depending upon the key being pressed we define the movement of vehicle
      switch (event.key) {
        case "ArrowLeft":
          this.left = true;
          break;
        case "ArrowRight":
          this.right = true;
          break;
        case "ArrowUp":
          this.forward = true;
          break;
        case "ArrowDown":
          this.reverse = true;
          break;
      }
      //console.table(this);
    };
    //key released
    document.onkeyup = (event) => {
      switch (event.key) {
        case "ArrowLeft":
          this.left = false;
          break;
        case "ArrowRight":
          this.right = false;
          break;
        case "ArrowUp":
          this.forward = false;
          break;
        case "ArrowDown":
          this.reverse = false;
          break;
      }
    };
  }
}
