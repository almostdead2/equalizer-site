
const canvas = document.getElementById('eq-canvas');
const ctx = canvas.getContext('2d');

const width = canvas.width;
const height = canvas.height;
const bands = 150;
const freqs = Array.from({length: bands}, (_, i) => i);
let gains = new Array(bands).fill(0);

canvas.addEventListener('mousedown', onMouseDown);

function drawEQ() {
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();
    ctx.moveTo(0, height / 2 - gains[0]);
    for (let i = 1; i < bands; i++) {
        const x = (i / (bands - 1)) * width;
        const y = height / 2 - gains[i];
        ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'lime';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function onMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const band = Math.round((x / width) * (bands - 1));
    gains[band] = height / 2 - y;
    drawEQ();

    function onMouseMove(e) {
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const band = Math.round((x / width) * (bands - 1));
        gains[band] = height / 2 - y;
        drawEQ();
    }

    function onMouseUp() {
        canvas.removeEventListener('mousemove', onMouseMove);
        canvas.removeEventListener('mouseup', onMouseUp);
    }

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);
}

function resetEQ() {
    gains.fill(0);
    drawEQ();
}

function saveEQ() {
    const blob = new Blob([gains.join(',')], {type: 'text/plain'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'eq_profile.txt';
    a.click();
}

function loadEQ(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const loaded = text.split(',').map(Number);
        if (loaded.length === bands) {
            gains = loaded;
            drawEQ();
        } else {
            alert('Invalid EQ file');
        }
    };
    reader.readAsText(file);
}

drawEQ();
