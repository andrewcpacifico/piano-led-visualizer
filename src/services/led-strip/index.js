const bluebird = require('bluebird');
const SerialPort = require('serialport');

const BAUD_RATE = 2000000;

const CMD_KEY_ON = 0x1;
const CMD_KEY_OFF = 0x2;
const CMD_CHANGE_COLOR = 0x3;

const RES_OK = 0x0;

const messageQueue = [];
let freeQueue = true;

const port = new SerialPort('COM4', {
  baudRate: BAUD_RATE,
  autoOpen: false,
});

function enqueue(msg) {
  messageQueue.push(msg);
}

async function dequeue() {
  if (freeQueue && messageQueue.length > 0) {
    freeQueue = false;

    const msg = messageQueue.shift();
    port.write(msg);
  }
}

function openSerial() {
  return new Promise((resolve, reject) => {
    port.on('close', () => {
      console.log('serial port closed');
    });

    port.on('data', (data) => {
      const res = data.readUInt8(0);

      if (res === RES_OK) {
        freeQueue = true;
        dequeue();
      }
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
  setPixelColor(pixel, r, g, b) {
    enqueue(Buffer.from([pixel, r, g, b]));
    dequeue();
  },

  async demo() {
    for (let i = 0; i < 175; i += 1) {
      setTimeout(() => this.setPixelColor(i, 0, 0, 255));
    }

    for (let i = 0; i < 175; i += 1) {
      setTimeout(() => this.setPixelColor(i, 0, 0, 0));
    }
  },

  async init() {
    await openSerial();
    await bluebird.delay(3000);
    this.demo();
  },
};

module.exports = LedStripService;
