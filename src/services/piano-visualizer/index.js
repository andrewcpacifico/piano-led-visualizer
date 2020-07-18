const LedStripService = require('../led-strip');

function getPixelByKey(key) {
  return (key <= 34)
    ? key * 2
    : key * 2 - 1;
}

const PianoVisualizerService = {
  color: {
    r: 0,
    g: 0,
    b: 255,
  },

  changeColor(color) {
    this.color = color;
  },

  turnOnKey(key) {
    const pixel = getPixelByKey(key);
    const { r, g, b } = this.color;

    LedStripService.setPixelColor(pixel, r, g, b);
    LedStripService.setPixelColor(pixel + 1, r, g, b);
  },

  turnOffKey(key) {
    const pixel = getPixelByKey(key);

    LedStripService.setPixelColor(pixel, 0, 0, 0);
    LedStripService.setPixelColor(pixel + 1, 0, 0, 0);
  }
};

module.exports = PianoVisualizerService;