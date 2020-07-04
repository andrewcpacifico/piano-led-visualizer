const { Input } = require('midi');

const input = new Input();

const typeMap = {
  noteOn: 144,
  noteOff: 128,
};

const MidiService = {
  listenDevice(portId) {
    input.on('message', (deltaTime, message) => {
      const [type, note] = message;
      const key = 108 - note;

      if (type === typeMap.noteOn) {
        console.log(`Pressed key: ${key}`);
      } else if (type === typeMap.noteOff) {
        console.log(`Released key: ${key}`);
      }
    });

    input.openPort(portId);
    input.ignoreTypes(false, false, false);

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

module.exports = MidiService;
