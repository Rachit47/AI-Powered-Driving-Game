function linear_interpolation(A, B, t) {
  return A + (B - A) * t; //constructs a new data points within the range of a discrete set of known data points [here range is given by the laneCount]
}
function getIntersection(A, B, C, D) {
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      return {
        x: linear_interpolation(A.x, B.x, t),
        y: linear_interpolation(A.y, B.y, t),
        offset: t,
      };
    }
  }

  return null;
}

function polysIntersect(poly1, poly2) {
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      );
      if (touch) {
        return true;
      }
    }
  }
  return false; //if vehicle polygon does not touch the road borders at any po
}
function getRGBA(value) {
  const alpha = Math.abs(value); //we are setting the opacity of a neuron w.r.t weight assigned to it, weights that are close to zero, will make the connection invisible with max transparency
  const R = value < 0 ? 0 : 255; //if weight is -ve then we want completely transparent colour red or no color
  const G = R; //Red and green make the colour yellow
  const B = value > 0 ? 0 : 255;
  return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

function getRandomColor() {
  const hue = 290 + Math.random() * 260;
  //hsl stands for hue, saturation & lightness
  return "hsl(" + hue + ",100%,60%)";
}
