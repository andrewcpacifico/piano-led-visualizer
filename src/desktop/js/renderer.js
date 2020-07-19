const { remote } = window;
const { require, dialog } = remote;

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
    noteOnCallback: (note) => {
      const key = 108 - note;
      PianoVisualizerService.turnOnKey(key);
    },
    noteOffCallback: (note) => {
      const key = 108 - note;
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

  const recordMidiButton = document.querySelector('#btn-record-midi');
  recordMidiButton.addEventListener('click', async (evt) => {
    const button = evt.target;
    const isRecording = button.classList.contains('recording');

    button.innerHTML = isRecording ? 'Record midi' : 'Stop recording';
    button.classList.toggle('recording');

    if (isRecording) {
      const filePath = dialog.showSaveDialogSync(
        remote.getCurrentWindow(),
        {
        defaultPath: 'recording.mid',
        filters: [{ name: 'Midi files', extensions: ['mid'] }]
      });

      MidiService.stopRecording();
      MidiService.saveRecording(filePath);
    } else {
      MidiService.startRecording();
    }
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
