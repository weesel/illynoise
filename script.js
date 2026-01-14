const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// SPIELER
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: 40,
    speed: 4,
    color: '#00ff44',
    target: { x: canvas.width / 2, y: canvas.height / 2 }
};

// STATIONEN (Apps & KI)
let stations = [
    { id: 'github', name: 'GitHub Repo', x: 200, y: 200, size: 60, color: '#ff00ff', url: 'https://github.com', active: false },
    { id: 'ai-bot', name: 'Ollama Agent', x: 800, y: 300, size: 60, color: '#00f2ff', isAI: true, active: false }
];

// KLICK-STEUERUNG
canvas.addEventListener('mousedown', (e) => {
    player.target.x = e.clientX - player.size / 2;
    player.target.y = e.clientY - player.size / 2;
    hideDialog();
});

function update() {
    // Bewege Spieler zum Ziel
    const dx = player.target.x - player.x;
    const dy = player.target.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > player.speed) {
        player.x += (dx / dist) * player.speed;
        player.y += (dy / dist) * player.speed;
    } else {
        checkInteraction();
    }
}

function checkInteraction() {
    stations.forEach(s => {
        const sdx = player.x - s.x;
        const sdy = player.y - s.y;
        const sDist = Math.sqrt(sdx*sdx + sdy*sdy);

        if (sDist < 50) {
            if (s.isAI) {
                showDialog("AGENT: Bereit für Befehle. Was soll ich tun?", true);
            } else {
                showDialog(`${s.name} erkannt. Öffne System...`);
                setTimeout(() => openApp(s.url), 1000);
            }
            player.target.x = player.x; // Stop movement
            player.target.y = player.y;
        }
    });
}

function draw() {
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Zeichne Terminals
    stations.forEach(s => {
        ctx.shadowBlur = 15;
        ctx.shadowColor = s.color;
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.size, s.size);
        ctx.fillStyle = "white";
        ctx.fillText(s.name, s.x, s.y - 10);
    });

    // Zeichne Spieler
    ctx.shadowColor = player.color;
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.size, player.size);
    ctx.shadowBlur = 0;

    update();
    requestAnimationFrame(draw);
}

// UI FUNKTIONEN
function showDialog(text, withInput = false) {
    document.getElementById('dialog-box').classList.remove('hidden');
    document.getElementById('dialog-text').innerText = text;
    if (withInput) document.getElementById('ai-controls').classList.remove('hidden');
}

function hideDialog() {
    document.getElementById('dialog-box').classList.add('hidden');
    document.getElementById('ai-controls').classList.add('hidden');
}

function openApp(url) {
    document.getElementById('app-window').classList.remove('hidden');
    document.getElementById('app-frame').src = url;
}

function closeApp() {
    document.getElementById('app-window').classList.add('hidden');
    document.getElementById('app-frame').src = "";
}

// SIMULATION EINES BLOCKLY BEFEHLS
function addTerminal() {
    const newX = Math.random() * (canvas.width - 100);
    const newY = Math.random() * (canvas.height - 100);
    stations.push({ id: 'custom', name: 'Zusatz-Modul', x: newX, y: newY, size: 60, color: '#ffff00', url: 'https://wikipedia.org' });
}

async function sendToAI() {
    const input = document.getElementById('ai-input').value;
    document.getElementById('dialog-text').innerText = "Agent denkt nach...";
    
    // Beispiel: Verbindung zu Ollama (lokal)
    try {
        const res = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            body: JSON.stringify({ model: 'llama3', prompt: input, stream: false })
        });
        const data = await res.json();
        document.getElementById('dialog-text').innerText = "AGENT: " + data.response;
    } catch (e) {
        document.getElementById('dialog-text').innerText = "AGENT: Fehler! Ist Ollama gestartet?";
    }
}

draw();
