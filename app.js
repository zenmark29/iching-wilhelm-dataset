let ichingData;

async function initialize() {
    try {
        const module = await import('./data/iching_wilhelm_translation.js');
        ichingData = module.default;
        console.log("I Ching Data Loaded Successfully");

        document.getElementById('consultBtn').addEventListener('click', () => {
            const question = document.getElementById('question').value;
            const lines = castHexagram();
            renderReading(lines, question);
        });
    } catch (err) {
        console.error("Data load failed:", err);
    }
}

initialize();

const yarrowValues = [6, 7, 7, 7, 7, 7, 8, 8, 8, 8, 8, 8, 8, 9, 9, 9];

function castHexagram() {
    let lines = [];
    for (let i = 0; i < 6; i++) {
        let val = yarrowValues[Math.floor(Math.random() * yarrowValues.length)];
        lines.push({
            val: val,
            isMoving: (val === 6 || val === 9),
            type: (val === 7 || val === 9) ? "1" : "0"
        });
    }
    return lines;
}

function renderReading(lines, question) {
    const output = document.getElementById('output');

    // 1. Create binary string (Bottom-to-Top)
    const primaryBinaryStr = lines.map(l => l.type).join('');

    // 2. Find the match (converting the data's number binary to string for comparison)
    const hexData = Object.values(ichingData).find(h => String(h.binary) === primaryBinaryStr);

    if (!hexData) {
        output.innerHTML = `<p>Error: Binary ${primaryBinaryStr} not found.</p>`;
        return;
    }

    let html = '';
    if (question) html += `<p class="section-title">Inquiry</p><div class="content">"${question}"</div>`;

    // 3. Render Hexagram Visual
    html += `<div class="hex-container">`;
    [...lines].reverse().forEach((l) => {
        const lineClass = l.type === "1" ? "yang" : "yin";
        const movingClass = l.isMoving ? "moving" : "";
        html += `<div class="line ${lineClass} ${movingClass}">${l.type === "0" ? '<div></div><div></div>' : ''}</div>`;
    });
    html += `</div>`;

    // 4. Content Pull (Matching your Object keys exactly)
    html += `<h2>${hexData.hex}. ${hexData.english}</h2>`;
    html += `<div class="chinese-char">${hexData.hex_font} ${hexData.trad_chinese}</div>`;

    html += `<p class="section-title">The Judgment</p>`;
    html += `<div class="content">${hexData.wilhelm_judgment.text}</div>`;

    html += `<p class="section-title">The Image</p>`;
    html += `<div class="content">${hexData.wilhelm_image.text}</div>`;

    // 5. Handle Moving Lines
    if (lines.some(l => l.isMoving)) {
        html += `<p class="section-title">The Changes</p>`;
        lines.forEach((l, index) => {
            if (l.isMoving) {
                // The dataset uses "1", "2", etc as keys inside wilhelm_lines
                const movingLineData = hexData.wilhelm_lines[String(index + 1)];
                if (movingLineData) {
                    html += `<div class="moving-line-text"><strong>Line ${index + 1}:</strong> ${movingLineData.text}</div>`;
                }
            }
        });

        // 6. Relating Hexagram
        const relatingBinaryStr = lines.map(l => l.isMoving ? (l.type === "1" ? "0" : "1") : l.type).join('');
        const relatingData = Object.values(ichingData).find(h => String(h.binary) === relatingBinaryStr);

        if (relatingData) {
            html += `<hr style="border: 0; border-top: 1px solid #ddd; margin: 50px 0;">`;
            html += `<p class="section-title">Relating State</p>`;
            html += `<h2>${relatingData.hex}. ${relatingData.english}</h2>`;
            html += `<div class="hex-container">`;
            relatingBinaryStr.split('').reverse().forEach(bit => {
                const lineClass = bit === "1" ? "yang" : "yin";
                html += `<div class="line ${lineClass}">${bit === "0" ? '<div></div><div></div>' : ''}</div>`;
            });
            html += `</div><p class="section-title">The Context</p><div class="content">${relatingData.wilhelm_judgment.text}</div>`;
        }
    }

    output.innerHTML = html;
}
