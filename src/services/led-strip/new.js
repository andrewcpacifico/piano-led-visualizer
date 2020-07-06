const bluebird = require('bluebird');
const SerialPort = require('serialport');

const MidiService = require('../midi');

const startMarker = 0x3C;
const endMarker = 0x3E;

const port = new SerialPort('COM4', {
  baudRate: 115200,
});

async function start() {
  for (let i = 0; i < 88; i += 1) {
    turnOnKey(i);
    await bluebird.delay(5);
    turnOffKey(i);
    await bluebird.delay(5);
  }
}

port.on('open', () => {
  console.log('serial port opened');
});

port.on('close', () => {
  console.log('serial port closed');
});

port.on('data', (data) => {
  console.log(data.toString());
});

function turnOnKey(key) {
  console.log(`Turning on key: ${key}`);
  setTimeout(() => port.write(Buffer.from([1, key])));
}

function turnOffKey(key) {
  console.log(`Turning off key: ${key}`);
  setTimeout(() => port.write(Buffer.from([2, key])));
}

async function main() {
  await bluebird.delay(3000);

  await start();

  MidiService.listenDevice({
    portId: 0,
    keyOnCallback: (key) => {
      console.log(`Key on: ${key}`);

      turnOnKey(key);
    },
    keyOffCallback: (key) => {
      console.log(`Key off: ${key}`);

      turnOffKey(key);
    },
  });

  // let isOn = false;
  // setInterval(() => {
  //   if (isOn) {
  //     turnOffKey(5);
  //     isOn = false;
  //   } else {
  //     turnOnKey(5);
  //     isOn = true;
  //   }
  // }, 1000);
}

main();
