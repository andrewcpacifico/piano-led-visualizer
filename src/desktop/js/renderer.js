const { remote } = window;
const { require } = remote;

const MidiService = require('./services/midi');
const LedStripService = require('./services/led-strip');
const PianoVisualizerService = require('./services/piano-visualizer');

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

  MidiService.listenDevice({
    portId: midiPortId,
    keyOnCallback: (key) => {
      PianoVisualizerService.turnOnKey(key);
    },
    keyOffCallback: (key) => {
      PianoVisualizerService.turnOffKey(key);
    },
  });
}

function registerEvents() {
  const startButton = document.querySelector('#btn-start');
  startButton.addEventListener('click', () => {
    startListenMidiDevice();
  });

  colorPicker.on('color:change', (color) => {
    const { r, g, b } = color.rgb;
    PianoVisualizerService.changeColor({ r, g, b });
  });
}

createMidiDeviceSelector();
registerEvents();
LedStripService.init();
