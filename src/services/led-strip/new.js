const bluebird = require('bluebird');
const SerialPort = require('serialport');

const MidiService = require('../midi');

const CMD_KEY_ON = 0x1;
const CMD_KEY_OFF = 0x2;
const CMD_CHANGE_COLOR = 0x3;

const port = new SerialPort('COM4', {
  baudRate: 115200,
});

async function start() {
  for (let i = 0; i < 88; i += 1) {
    turnOnKey(i);
    await bluebird.delay(12);
    turnOffKey(i);
    await bluebird.delay(12);
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
  setTimeout(() => port.write(Buffer.from([CMD_KEY_ON, key])));
}

function turnOffKey(key) {
  console.log(`Turning off key: ${key}`);
  setTimeout(() => port.write(Buffer.from([CMD_KEY_OFF, key])));
}

function changeColor(r, g, b) {
  console.log(`Changing strip color to: rgb(${r}, ${g}, ${b})`);
  setTimeout(() => port.write(Buffer.from([CMD_CHANGE_COLOR, r, g, b])));
}

async function main() {
  await bluebird.delay(3000);
  changeColor(255, 255, 0);
  await bluebird.delay(500);

  // await start();

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
