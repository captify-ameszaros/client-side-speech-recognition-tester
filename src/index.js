import "./styles.css";

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SR();

const transcript = document.getElementById("transcript");
const audioFileInput = document.getElementById("audio_file");
var audioFiles = null;
var audioFileIndex = 0;

const audio = new Audio();
var results = [];

const renderResult = result => {
  return `<dt>${result.name}</dt><dd><pre>${result.transcript ||
    result.error}</pre></dd>`;
};
const renderResults = () => {
  const renderedResults = results.map(result => renderResult(result)).join("");
  transcript.innerHTML = `<dl>${renderedResults}</dl>`;
};
renderResults();
const next = () => {
  audioFileIndex++;
  if (audioFileIndex < audioFiles.length) {
    processNextAudio();
  }
};
recognition.continuous = true;
recognition.interimResults = true;
recognition.onresult = function(event) {
  if (event.results[0].isFinal) {
    results.push({
      name: audioFiles[audioFileIndex].name,
      transcript: event.results[0][0].transcript
    });
    renderResults();
    recognition.stop();
    next();
  }
};

recognition.onaudiostart = e => {
  console.log("audio capture started");
  audio.play();
};

recognition.onaudioend = e => {
  console.log("audio capture ended");
};

const processNextAudio = () => {
  audio.src = URL.createObjectURL(audioFiles[audioFileIndex]);
  audio.oncanplay = () => {
    console.log("audio loaded");
    recognition.start();
  };

  audio.onerror = ev => {
    results.push({
      name: audioFiles[audioFileIndex].name,
      error: "error"
    });
    next();
  };
};

audioFileInput.onchange = ev => {
  audioFiles = ev.target.files;
  transcript.innerHTML = "";
  console.log("new file loaded", audioFiles);
  if (audioFiles.length > 0) {
    audioFileIndex = 0;
    processNextAudio();
  }
};

audio.onended = () => {
  recognition.stop();
};
