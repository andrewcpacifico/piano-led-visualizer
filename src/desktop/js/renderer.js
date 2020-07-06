const { remote } = window;
const { require } = remote;

const MidiService = require('./services/midi');

const { iro } = window;

const colorPicker = new iro.ColorPicker('#picker');

function createMidiDeviceSelector() {
  const devices = MidiService.getDevices();
  const selector = document.querySelector('#midi-device-selector');

  devices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.innerHTML = device;

    selector.appendChild(option);
  });
}

function startListenMidiDevice() {
  const selector = document.querySelector('#midi-device-selector');
  const midiPortId = parseInt(selector.value, 10);

  MidiService.listenDevice(midiPortId);
}

function registerEvents() {
  const startButton = document.querySelector('#btn-start');
  startButton.addEventListener('click', () => {
    startListenMidiDevice();
  });
}

colorPicker.on('color:change', (color) => {
  console.log(color);
});

createMidiDeviceSelector();
registerEvents();
