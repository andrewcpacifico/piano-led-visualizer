const fs = require('fs');

const { Input } = require('midi');
const { parseMidi, writeMidi } = require('midi-file');

const input = new Input();

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const CONTROLLER_1 = 0xB0;
const CONTROLLER_2 = 0xB1;

let track;

function initTrack() {
  track = [{
    deltaTime: 0,
    meta: true,
    type: 'trackName',
    text: '1 1-Grand Piano\x00'
  }];
}

function isValidMessage(message) {
  const [type] = message;

  return type === NOTE_ON
    || type === NOTE_OFF
    || type === CONTROLLER_1
    || type === CONTROLLER_2;
}

const MidiService = {
  listenDevice({ portId, keyOnCallback, keyOffCallback }) {
    input.on('message', (deltaTime, message) => {
      const [type] = message;

      console.log(deltaTime, message);

      if (type === NOTE_ON || type === NOTE_OFF) {
        const note = message[1];
        const velocity = message[2];
        const key = 108 - note;

        if (note === 21) {
          input.closePort();
          console.log('Stopping record...');

          console.dir(track, { depth: null });

          const out = writeMidi({
            header: { format: 0, numTracks: 1, ticksPerBeat: 500 },
            tracks: [track],
          });
          fs.writeFileSync('./recording.mid', Buffer.from(out));

          initTrack();

          return;
        }

        if (type === NOTE_ON && typeof keyOnCallback === 'function') {
          keyOnCallback(key);
        } else if (type === NOTE_OFF && typeof keyOffCallback === 'function') {
          keyOffCallback(key);
        }

        track.push({
          deltaTime: deltaTime * 1000,
          channel: 0,
          type: type === NOTE_ON ? 'noteOn' : 'noteOff',
          noteNumber: note,
          velocity,
        });
      } else if (type === CONTROLLER_1 || type === CONTROLLER_2) {
        const controllerType = message[1];
        const value = message[2];

        track.push({
          deltaTime: deltaTime * 1000,
          channel: 0,
          type: 'controller',
          controllerType,
          value,
        });
      }
    });

    initTrack();
    input.openPort(portId);

    console.log('Starting to record midi...');
  },

  getDevices() {
    const portCount = input.getPortCount();
    const devices = [];

    for (let i = 0; i < portCount; i += 1) {
      devices.push(input.getPortName(i));
    }

    return devices;
  },
};

const inputFile = fs.readFileSync('./swan-lake.mid');
const parsed = parseMidi(inputFile);
console.dir(parsed, { depth: null });

module.exports = MidiService;
