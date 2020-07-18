const bluebird = require('bluebird');
const SerialPort = require('serialport');

const BAUD_RATE = 2000000;
const RES_OK = 0x0;
const RES_CONNECTED = 0x1;

const messageQueue = [];
let freeQueue = true;
let serialPort;

function enqueue(msg) {
  messageQueue.push(msg);
}

async function dequeue() {
  if (freeQueue && messageQueue.length > 0) {
    freeQueue = false;

    const msg = messageQueue.shift();
    serialPort.write(msg);
  }
}

function openSerial({ port }) {
  serialPort = new SerialPort(port, {
    baudRate: BAUD_RATE,
    autoOpen: false,
  });

  return new Promise((resolve, reject) => {
    serialPort.on('close', () => {
      console.log('serial port closed');
    });

    serialPort.on('data', (data) => {
      const res = data.readUInt8(0);

      if (res === RES_OK) {
        freeQueue = true;
        dequeue();
      } else if (res === RES_CONNECTED) {
        resolve();
      }
    });

    serialPort.open((err) => {
      if (err) {
        reject();
      }
    });
  });
}

const LedStripService = {
  setPixelColor(pixel, r, g, b) {
    enqueue(Buffer.from([pixel, r, g, b]));
    dequeue();
  },

  demo() {
    for (let i = 0; i < 175; i += 1) {
      this.setPixelColor(i, 0, 0, 255);
    }

    for (let i = 0; i < 175; i += 1) {
      this.setPixelColor(i, 0, 0, 0);
    }
  },

  getDevices() {
    return SerialPort.list();
  },

  async init({ port }) {
    await openSerial({ port });
    console.log(`Connected to led strip on ${port}`);
    this.demo();
  },
};

module.exports = LedStripService;
