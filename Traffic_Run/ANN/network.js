class NeuralNetwork {
  //neuronCounts = number of neurons on each layer
  constructor(neuronCounts) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }
  static feedForward(givenInputs, network) {
    //calling feedForward() from Ist level to produce its outputs
    let outputs = Level.feedForward(givenInputs, network.levels[0]);
    //loop through the remaining levels, updating the outputs with feedForward() result from ith level
    //putting the output of the previous level as the input to the next level
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs; //final outputs will decide in which direction vehicle should move
  }

  //Genetic mutation of out network
  //if the amount = 0, then biases & weights donot change
  static mutate(network, amount = 1) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        //interpolating current bias with current value of any random values b/w -1 & 1
        level.biases[i] = linear_interpolation(
          level.biases[i],
          Math.random() * 2 - 1,
          amount
        );
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          //interpolating current weight with current value of any random values b/w -1 & 1
          level.weights[i][j] = linear_interpolation(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          );
        }
      }
    });
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }
    Level.#randomize(this);
  }

  //random initialization of weights and biases
  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        //for every input-output pair we have set weight to a random value b/w -1 & 1
        level.weights[i][j] = Math.random() * 2 - 1; //weights are initialized with random values in range: [-1,1]
      }
    }
    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  static feedForward(givenInputs, level) {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i]; //all of the level inputs are initialized to the given input values that are captured using the sensors
    }
    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }
      //implementing activation function
      //check if the weighted sum of inputs is larger than bias of the output neuron, we set the output neuron ON or activate it
      if (sum > level.biases[i]) {
        level.outputs[i] = 1;
      } else {
        level.outputs[i] = 0;
      }
    }
    return level.outputs;
  }
}
