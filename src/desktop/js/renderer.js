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

async function createStripControllerSelector() {
  const devices = await LedStripService.getDevices();
  const selector = document.querySelector('#strip-controller-selector');

  devices.forEach((device) => {
    const { path, manufacturer } = device;

    const option = document.createElement('option');
    option.value = path;
    option.innerHTML = `${manufacturer} (${path})`;

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

function connectToLedStrip() {
  const selector = document.querySelector('#strip-controller-selector');
  const stripControllerPort = selector.value;

  LedStripService.init({ port: stripControllerPort });
}

function registerEvents() {
  const listenMidiButton = document.querySelector('#btn-listen-midi');
  listenMidiButton.addEventListener('click', () => {
    startListenMidiDevice();
  });

  const connectToStripButton = document.querySelector('#btn-connect-strip');
  connectToStripButton.addEventListener('click', () => {
    connectToLedStrip();
  });

  colorPicker.on('color:change', (color) => {
    const { r, g, b } = color.rgb;
    PianoVisualizerService.changeColor({ r, g, b });
  });
}

createMidiDeviceSelector();
createStripControllerSelector()

registerEvents();
