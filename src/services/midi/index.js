const fs = require('fs');

const { Input } = require('midi');
const { writeMidi } = require('midi-file');

const input = new Input();

const NOTE_ON = 0x90;
const NOTE_OFF = 0x80;
const CONTROLLER_1 = 0xB0;
const CONTROLLER_2 = 0xB1;

// with this definition we can use ms deltaTime unity
const TICKS_PER_BEAT = 500;

let track;

function initTrack() {
  track = [{
    deltaTime: 0,
    meta: true,
    type: 'trackName',
    text: '1 1-Grand Piano\x00'
  }];
}

const MidiService = {
  isRecording: false,

  startRecording() {
    initTrack();
    this.isRecording = true;
    console.log('Recording midi input');
  },

  saveRecording(filename) {
    const out = writeMidi({
      header: { format: 0, numTracks: 1, ticksPerBeat: TICKS_PER_BEAT },
      tracks: [track],
    });
    fs.writeFileSync(filename, Buffer.from(out));
  },

  stopRecording() {
    console.log('Stop recording');
    this.isRecording = false;
  },

  listenDevice({ portId, noteOnCallback, noteOffCallback }) {
    input.on('message', (deltaTime, message) => {
      const [type] = message;

      if (type === NOTE_ON || type === NOTE_OFF) {
        const note = message[1];
        const velocity = message[2];

        if (type === NOTE_ON && typeof noteOnCallback === 'function') {
          noteOnCallback(note);
        } else if (type === NOTE_OFF && typeof noteOffCallback === 'function') {
          noteOffCallback(note);
        }

        if (this.isRecording) {
          track.push({
            deltaTime: deltaTime * 1000,
            channel: 0,
            type: type === NOTE_ON ? 'noteOn' : 'noteOff',
            noteNumber: note,
            velocity,
          });
        }
      } else if (type === CONTROLLER_1 || type === CONTROLLER_2) {
        const controllerType = message[1];
        const value = message[2];

        if (this.isRecording) {
          track.push({
            deltaTime: deltaTime * 1000,
            channel: 0,
            type: 'controller',
            controllerType,
            value,
          });
        }
      }
    });

    initTrack();
    input.openPort(portId);

    console.log('Connecting to midi device');
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

module.exports = MidiService;
