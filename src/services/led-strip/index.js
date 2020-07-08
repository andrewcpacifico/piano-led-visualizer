const bluebird = require('bluebird');
const SerialPort = require('serialport');

const BAUD_RATE = 1000000;
const CMD_KEY_ON = 0x1;
const CMD_KEY_OFF = 0x2;
const CMD_CHANGE_COLOR = 0x3;

const port = new SerialPort('COM4', {
  baudRate: BAUD_RATE,
  autoOpen: false,
});

function openSerial() {
  return new Promise((resolve, reject) => {
    port.on('close', () => {
      console.log('serial port closed');
    });

    port.on('data', (data) => {
      console.log(data.toString());
    });

    port.open((err) => {
      if (err) {
        reject();
      }

      resolve();
    });
  });
}

const LedStripService = {
  turnOn(key) {
    console.log(`Turning on key: ${key}`);
    setTimeout(() => port.write(Buffer.from([CMD_KEY_ON, key])), 1);
  },

  turnOff(key) {
    console.log(`Turning off key: ${key}`);
    setTimeout(() => port.write(Buffer.from([CMD_KEY_OFF, key])), 1);
  },

  changeColor(r, g, b) {
    console.log(`Changing strip color to: rgb(${r}, ${g}, ${b})`);
    setTimeout(() => port.write(Buffer.from([CMD_CHANGE_COLOR, r, g, b])));
  },

  async demo() {
    let count = 0;
    for (let i = 0; i < 88; i += 1) {
      setTimeout(() => this.turnOn(i), count);
      count += 8;
    }

    for (let i = 0; i < 88; i += 1) {
      setTimeout(() => this.turnOff(i), count);
      count += 8;
    }
  },

  async init() {
    await openSerial();
    await bluebird.delay(3000);
    this.demo();
  },
};

module.exports = LedStripService;
