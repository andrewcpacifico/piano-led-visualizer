const midi = require('midi');

const input = new midi.Input();

const MidiService = {
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
