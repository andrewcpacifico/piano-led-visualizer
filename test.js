const bluebird = require('bluebird');
const MidiService = require('./src/services/midi');
const LedStripService = require('./src/services/led-strip');

function getPixelByKey(key) {
  let pixel = key * 2;
  if (key > 34) {
    pixel -= 1;
  }

  return pixel;
}

function turnOnKey(key) {
  console.log(`Turning on key: ${key}`);
  const pixel = getPixelByKey(key);

  LedStripService.turnOn([pixel, pixel + 1]);
}

function turnOffKey(key) {
  console.log(`Turning off key: ${key}`);
  const pixel = getPixelByKey(key);

  LedStripService.turnOff([pixel, pixel + 1]);
}

async function start() {
  const delay = Math.floor(Math.random() * 20) + 5;

  for (let i = 0; i < 88; i += 1) {
    turnOnKey(i);
    await bluebird.delay(delay);
    turnOffKey(i);
    await bluebird.delay(delay);
  }

  setTimeout(start);
}

async function main() {
  await LedStripService.init();
  LedStripService.turnOn();
  await bluebird.delay(1000);
  LedStripService.turnOff();

  await start();

  MidiService.listenDevice({
    portId: 0,
    keyOnCallback: (key) => {
      console.log(`Key on: ${key}`);
      console.log(typeof key);

      turnOnKey(key);
    },
    keyOffCallback: (key) => {
      console.log(`Key off: ${key}`);
      console.log(typeof key);

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