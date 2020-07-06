const pixel = require('node-pixel');
const five = require('johnny-five');

const board = new five.Board({ port: 'COM3' });

const NUM_PIXELS = 175;
const STRIP_PIN = 8;

const LedStripService = {
  turnOn(ledIds) {
    if (ledIds) {
      ledIds.forEach((led) => {
        this.strip.pixel(led).color('red');
      });
    } else {
      for (let i = 0; i < NUM_PIXELS; i += 1) {
        this.strip.pixel(i).color('red');
      }
    }

    this.strip.show();
  },

  turnOff(ledIds) {
    if (ledIds) {
      ledIds.forEach((led) => {
        this.strip.pixel(led).off();
      });
    } else {
      this.strip.off();
    }
  },

  changeColor(color) {
    for (let i = 0; i < NUM_PIXELS; i += 1) {
      this.strip.pixel(i).color(color);
    }
    this.strip.show();
  },

  init() {
    return new Promise((resolve) => {
      board.on('ready', () => {
        this.strip = new pixel.Strip({
          board,
          controller: 'FIRMATA',
          strips: [{ pin: STRIP_PIN, length: NUM_PIXELS }], // this is preferred form for definition
          gamma: 2.8, // set to a gamma that works nicely for WS2812
        });

        this.strip.on('ready', () => {
          resolve();
          this.strip.off();
        });
      });
    });
  },
};

module.exports = LedStripService;
