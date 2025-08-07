let audioCtx, sourceNode, eqNodes = [];
let playing = false;
const NUM_BANDS = 500;
let audioBuffer;

const fileInput = document.getElementById("audioFile");
const playPauseBtn = document.getElementById("playPause");
const eqContainer = document.getElementById("eqContainer");

function createEQ() {
  let lastNode;
  for (let i = 0; i < NUM_BANDS; i++) {
    const freq = 20 * Math.pow(2, i * (Math.log2(20000 / 20) / NUM_BANDS));
    const eq = audioCtx.createBiquadFilter();
    eq.type = "peaking";
    eq.frequency.value = freq;
    eq.Q.value = 1.0;
    eq.gain.value = 0;
    if (lastNode) lastNode.connect(eq);
    eqNodes.push(eq);
    lastNode = eq;

    const slider = document.createElement("div");
    slider.className = "eq-slider";
    slider.innerHTML = `
      <input type="range" min="-30" max="30" value="0" step="0.1" data-index="${i}" />
      <small>${Math.round(freq)}Hz</small>
    `;
    eqContainer.appendChild(slider);
  }

  document.querySelectorAll('input[type="range"]').forEach(slider => {
    slider.addEventListener('input', e => {
      const i = e.target.dataset.index;
      const gain = parseFloat(e.target.value);
      eqNodes[i].gain.value = gain;
    });
  });

  return lastNode;
}

async function setupAudio(file) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const arrayBuffer = await file.arrayBuffer();
  audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  sourceNode = audioCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;

  eqNodes = [];
  eqContainer.innerHTML = "";
  const lastEQ = createEQ();

  sourceNode.connect(eqNodes[0]);
  lastEQ.connect(audioCtx.destination);
}

fileInput.addEventListener("change", async () => {
  if (fileInput.files.length > 0) {
    await setupAudio(fileInput.files[0]);
  }
});

playPauseBtn.addEventListener("click", () => {
  if (!audioBuffer) return;

  if (!playing) {
    sourceNode = audioCtx.createBufferSource();
    sourceNode.buffer = audioBuffer;
    sourceNode.connect(eqNodes[0]);
    sourceNode.start();
    playing = true;
    playPauseBtn.textContent = "Stop";

    sourceNode.onended = () => {
      playing = false;
      playPauseBtn.textContent = "Play";
    };
  } else {
    sourceNode.stop();
    playing = false;
    playPauseBtn.textContent = "Play";
  }
});
