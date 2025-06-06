const distance = (x1, y1, x2, y2) => {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(xDist * xDist + yDist * yDist);
};

const randomIntFromRange = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

const randomColor = (colors) =>
  colors[Math.floor(Math.random() * colors.length)];
