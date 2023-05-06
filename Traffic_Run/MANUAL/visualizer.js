class Visualizer {
  static drawNetwork(context, network) {
    const margin = 50;
    const left = margin;
    const top = margin;
    const width = context.canvas.width - margin * 2;
    const height = context.canvas.height - margin * 2;

    const levelHeight = height / network.levels.length;
    //Visualizer.drawLevel(context, network.levels[0], left, top, width, height);

    //we need to draw the intermediate levels in reverse so that bias of intermediate levels is also visible
    for (let i = network.levels.length - 1; i >= 0; i--) {
      //we interpolate b/w [height - levelHeight] because we want the bottom most level to start at y-coorinate that can fit in the screen

      //defining the number of levels using linear interpolation
      const levelTop =
        top +
        linear_interpolation(
          height - levelHeight,
          0,
          network.levels.length == 1 ? 0.5 : i / (network.levels.length - 1)
        );
      context.setLineDash([7, 3]); //line of 7pixels and spacing = 3
      Visualizer.drawLevel(
        context,
        network.levels[i],
        left,
        levelTop,
        width,
        levelHeight,
        i == network.levels.length - 1 ? ["🠉", "🠈", "🠊", "🠋"] : [] //draw the arrow key symbols on the final output layer only
      );
    }
  }

  static drawLevel(context, level, left, top, width, height, outputLabels) {
    const right = left + width;
    const bottom = top + height;
    const { inputs, outputs, weights, biases } = level; //extracting inputs and outputs of the level separtely

    //drawing connections between input & output layer neurons
    for (let i = 0; i < inputs.length; i++) {
      for (let j = 0; j < outputs.length; j++) {
        context.beginPath();
        context.moveTo(Visualizer.#getNeuron_X(inputs, i, left, right), bottom);
        context.lineTo(Visualizer.#getNeuron_X(outputs, j, left, right), top);
        context.lineWidth = 2;
        const value = weights[i][j];

        context.strokeStyle = getRGBA(value);
        context.stroke();
      }
    }

    const neuronRadius = 18;
    //drawing input neurons
    for (let i = 0; i < inputs.length; i++) {
      //computing x-coordinates for the neurons in the level using linear interpolation
      const x = Visualizer.#getNeuron_X(inputs, i, left, right);
      context.beginPath();
      context.arc(x, bottom, neuronRadius, 0, Math.PI * 2);
      context.fillStyle = getRGBA(inputs[i]);
      context.fill();
    }
    //Drawing output neurons
    for (let i = 0; i < outputs.length; i++) {
      //computing x-coordinates for the neurons in the level using linear interpolation
      const x = Visualizer.#getNeuron_X(outputs, i, left, right);
      context.beginPath();
      context.arc(x, top, neuronRadius, 0, Math.PI * 2);
      context.fillStyle = getRGBA(outputs[i]);
      context.fill();

      //drawing biases as a contour over output neurons in dotted lines
      context.beginPath();
      context.lineWidth = 2;
      context.arc(x, top, neuronRadius * 1.3, 0, Math.PI * 2);
      context.strokeStyle = getRGBA(biases[i]);
      context.setLineDash([3, 3]);
      context.stroke();
      context.setLineDash([]);

      if (outputLabels[i]) {
        context.beginPath();
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "black";
        context.strokeStyle = "white";
        context.font = neuronRadius * 1.5 + "px Arial";
        context.fillText(outputLabels[i], x, top);
        context.lineWidth = 0.5;
        context.strokeText(outputLabels[i], x, top);
      }
    }
  }
  static #getNeuron_X(neurons, index, left, right) {
    return linear_interpolation(
      left,
      right,
      neurons.length == 1 ? 0.5 : index / (neurons.length - 1)
    );
  }
}
