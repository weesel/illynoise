const canvas = document.getElementById('baseCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let player = { x: 100, y: 100, targetX: 100, targetY: 100, speed: 5 };
let modules = [
    { name: "GitHub", x: 400, y: 300, color: "#f0f", url: "https://github.com" },
    { name: "Ollama KI", x: 700, y: 500, color: "#0ff", isAI: true }
];

// 1. Bewegung per Klick
canvas.addEventListener('mousedown', (e) => {
    player.targetX = e.clientX;
    player.targetY = e.clientY;
});

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Module zeichnen
    modules.forEach(m => {
        ctx.fillStyle = m.color;
        ctx.fillRect(m.x - 25, m.y - 25, 50, 50);
        ctx.fillStyle = "#fff";
        ctx.fillText(m.name, m.x - 20, m.y - 35);
    });

    // Spieler bewegen
    let dx = player.targetX - player.x;
    let dy = player.targetY - player.y;
    let dist = Math.sqrt(dx*dx + dy*dy);

    if (dist > 5) {
        player.x += (dx/dist) * player.speed;
        player.y += (dy/dist) * player.speed;
    } else {
        checkCollision();
    }

    // Spieler zeichnen
    ctx.fillStyle = "#0f0";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI*2);
    ctx.fill();

    requestAnimationFrame(gameLoop);
}

// 2. Interaktion
function checkCollision() {
    modules.forEach(m => {
        let dist = Math.sqrt(Math.pow(player.x - m.x, 2) + Math.pow(player.y - m.y, 2));
        if (dist < 30) {
            if (m.isAI) openAI(); else openApp(m.url);
            player.targetX = player.x; player.targetY = player.y; // Stop
        }
    });
}

function openApp(url) {
    document.getElementById('app-overlay').classList.remove('hidden');
    document.getElementById('app-frame').src = url;
}

function openAI() {
    document.getElementById('chat-bubble').classList.remove('hidden');
}

// 3. Ollama KI Integration
document.getElementById('user-input').addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const prompt = e.target.value;
        document.getElementById('response-text').innerText = "Agent denkt nach...";
        try {
            const res = await fetch('http://localhost:11434/api/generate', {
                method: 'POST',
                body: JSON.stringify({ model: 'llama3', prompt: prompt, stream: false })
            });
            const data = await res.json();
            document.getElementById('response-text').innerText = data.response;
        } catch (err) {
            document.getElementById('response-text').innerText = "Fehler: Ist Ollama gestartet?";
        }
    }
});

function toggleBlockly() {
    document.getElementById('blockly-editor').classList.toggle('hidden');
}

function closeApp() {
    document.getElementById('app-overlay').classList.add('hidden');
}

gameLoop();
