const vehicleCanvas = document.getElementById("vehicleCanvas");
vehicleCanvas.width = 300;

const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 400;

// const mode = document.getElementById("Mode").value;
// console.log(mode);
const vehicleContext = vehicleCanvas.getContext("2d");
const networkContext = networkCanvas.getContext("2d");
const road = new Road(vehicleCanvas.width / 2, vehicleCanvas.width * 0.9); //road centred at half the width of the vehicleCanvas
//const vehicle = new Vehicle(road.getLaneCenter(1), 30, 60, 100, "KEYS", 5);

const gameOverInitiator = () => {
  const gameOverDisplay = document.createElement("div");
  const gameOverBtn = document.createElement("button");

  //insert text to replay button
  gameOverBtn.innerHTML = "Retry";
  gameOverDisplay.appendChild(gameOverBtn);

  //http://127.0.0.1:5500/front.html
  //Reload when retry button is clicked
  gameOverBtn.onclick = () => {
    // window.location.reload();
    window.location.href = "../front.html";
  };
  gameOverDisplay.classList.add("gameover");

  document.querySelector("body").appendChild(gameOverDisplay);
};

const PlayAgainInitiator = () => {
  const playAgainDisplay = document.createElement("div");
  const playAgainBtn = document.createElement("button");

  playAgainBtn.innerHTML = "YOU WIN 🎖 ⚡Play Again⚡";
  playAgainDisplay.appendChild(playAgainBtn);
  playAgainBtn.onclick = () => {
    window.location.href = "../front.html";
  };

  playAgainDisplay.classList.add("playAgain");
  document.querySelector("body").appendChild(playAgainDisplay);
};

const N = 1;
const vehicles = generateVehicles(N);
let bestVehicle = vehicles[0];
const best = localStorage.getItem("bestBrain");
if (localStorage.getItem("bestBrain")) {
  //NOTE: localStorage only works with string
  for (let i = 0; i < vehicles.length; i++) {
    vehicles[i].brain = JSON.parse(localStorage.getItem("bestBrain"));

    //brain kept in local storage is for i=0, best car initialization
    if (i != 0) {
      NeuralNetwork.mutate(vehicles[i].brain, 0.2);
    }
  }
}

let traffic = [];
let j = 0;
for (let i = -100; i >= -7000; i -= 100) {
  let traffic_object = new Vehicle(
    road.getLaneCenter(Math.floor(Math.random() * 3)),
    i,
    30,
    60,
    "TRAFFIC",
    2,
    getRandomColor()
  );
  traffic.push(traffic_object);
}
animate();

//function to save the best vehicle into local storage
function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestVehicle.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

//function to make new vehicles
function generateVehicles(N) {
  const vehicles = [];
  //let mode = getMode();
  for (let i = 1; i <= N; i++) {
    vehicles.push(new Vehicle(road.getLaneCenter(1), 100, 30, 60, "ANN"));
  }
  return vehicles;
}

function animate() {
  let animationID;
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].update(road.borders, []);
  }

  for (let i = 0; i < vehicles.length; i++) {
    vehicles[i].update(road.borders, traffic);
  }

  // Vehicle with y-value smaller than all the other vehicles' y-values is
  bestVehicle = vehicles.find(
    (v) => v.y == Math.min(...vehicles.map((v) => v.y))
  );

  console.log(bestVehicle.y);
  //Resizing the vehicleCanvas in this way, clears the vehicleCanvas after every recursive call to this function,
  //Also it prevents the vehicle object from leaving a trail behind
  vehicleCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  vehicleContext.save();
  vehicleContext.translate(0, -bestVehicle.y + vehicleCanvas.height * 0.7); //translating or moving the vehicleCanvas by specific vertical position everytime animate() function is called
  road.draw(vehicleContext);

  //to draw each of the traffic vehicles
  for (let i = 0; i < traffic.length; i++) {
    traffic[i].draw(vehicleContext, getRandomColor());
  }

  console.log("last traffic", traffic[traffic.length - 1].y);
  //drawing the vehicles to be semi-transparent
  vehicleContext.globalAlpha = 0.2;

  for (let i = 0; i < vehicles.length; i++) {
    vehicles[i].draw(vehicleContext);
  }
  vehicleContext.globalAlpha = 1;
  //putting more emphasis on the first vehicle in the array and applying sensors only on this car
  bestVehicle.draw(vehicleContext, true);
  if (bestVehicle.y < traffic[traffic.length - 1].y - 800) {
    cancelAnimationFrame(animationID);
    return PlayAgainInitiator();
  }
  vehicleContext.restore();
  Visualizer.drawNetwork(networkContext, bestVehicle.brain);
  animationID = requestAnimationFrame(animate);
  if (bestVehicle.damaged === true) {
    cancelAnimationFrame(animationID);
    return gameOverInitiator();
  }
  //RequestaAnimationFrame() calls the animate function again and again many times per second
  //It gives the illusion of the movement that we desire
}
