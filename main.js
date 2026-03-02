class LottoDisplay extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.innerHTML = `
            <style>
                .lotto-container {
                    display: flex;
                    justify-content: center;
                    gap: 10px;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                }
                .lotto-ball {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.2rem;
                    font-weight: bold;
                    color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                button {
                    padding: 10px 20px;
                    font-size: 1rem;
                    border: none;
                    border-radius: 5px;
                    background-color: #007bff;
                    color: white;
                    cursor: pointer;
                    transition: background-color 0.3s;
                }
                button:hover {
                    background-color: #0056b3;
                }
                @media (max-width: 480px) {
                    .lotto-ball {
                        width: 40px;
                        height: 40px;
                        font-size: 1rem;
                    }
                    h1 {
                        font-size: 1.5rem;
                    }
                }
            </style>
            <div class="lotto-container">
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
                <div class="lotto-ball" style="background-color: #e5e5e5;"></div>
            </div>
            <button id="generator-btn">번호 생성</button>
        `;

        this.generatorBtn = this.shadowRoot.querySelector('#generator-btn');
        this.lottoBalls = this.shadowRoot.querySelectorAll('.lotto-ball');
    }

    connectedCallback() {
        this.generatorBtn.addEventListener('click', () => this.generateNumbers());
    }

    generateNumbers() {
        const numbers = new Set();
        while (numbers.size < 6) {
            const randomNumber = Math.floor(Math.random() * 45) + 1;
            numbers.add(randomNumber);
        }

        const sortedNumbers = Array.from(numbers).sort((a, b) => a - b);
        this.displayNumbers(sortedNumbers);
    }

    displayNumbers(numbers) {
        const colors = ['#fbc400', '#69c8f2', '#ff7272', '#aaaaaa', '#b0d840', '#c7c7c7'];
        this.lottoBalls.forEach((ball, index) => {
            ball.textContent = numbers[index];
            ball.style.backgroundColor = this.getColorForNumber(numbers[index]);
        });
    }

    getColorForNumber(number) {
        if (number <= 10) return '#fbc400'; // 노란색
        if (number <= 20) return '#69c8f2'; // 파란색
        if (number <= 30) return '#ff7272'; // 빨간색
        if (number <= 40) return '#aaaaaa'; // 회색
        return '#b0d840'; // 녹색
    }
}

customElements.define('lotto-display', LottoDisplay);

// 테마 토글
const themeToggle = document.getElementById('theme-toggle');
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
});

// 동물상 테스트
const MODEL_URL = 'https://teachablemachine.withgoogle.com/models/dhB-RSOe3/';
let model, webcam, animationId;

async function initWebcam() {
    const startBtn = document.getElementById('start-btn');
    startBtn.textContent = '로딩 중...';
    startBtn.disabled = true;

    const modelURL = MODEL_URL + 'model.json';
    const metadataURL = MODEL_URL + 'metadata.json';
    model = await tmImage.load(modelURL, metadataURL);

    const flip = true;
    webcam = new tmImage.Webcam(300, 300, flip);
    await webcam.setup();
    await webcam.play();

    document.getElementById('webcam-container').appendChild(webcam.canvas);
    startBtn.style.display = 'none';
    document.getElementById('capture-btn').style.display = 'inline-block';
    document.getElementById('result-container').style.display = 'none';

    animationId = window.requestAnimationFrame(loop);
}

function loop() {
    webcam.update();
    animationId = window.requestAnimationFrame(loop);
}

async function capture() {
    window.cancelAnimationFrame(animationId);
    webcam.update();
    const prediction = await model.predict(webcam.canvas);
    webcam.pause();

    const dogScore = prediction.find(p => p.className === 'dog').probability;
    const catScore = prediction.find(p => p.className === 'cat').probability;

    showResult(dogScore, catScore);

    document.getElementById('capture-btn').style.display = 'none';
    document.getElementById('retry-btn').style.display = 'inline-block';
}

function showResult(dogScore, catScore) {
    const container = document.getElementById('result-container');
    container.style.display = 'block';

    const isDog = dogScore > catScore;
    document.getElementById('result-emoji').textContent = isDog ? '🐶' : '🐱';
    document.getElementById('result-title').textContent = isDog ? '강아지상' : '고양이상';

    const dogPct = Math.round(dogScore * 100);
    const catPct = Math.round(catScore * 100);

    document.getElementById('pct-dog').textContent = dogPct + '%';
    document.getElementById('pct-cat').textContent = catPct + '%';

    setTimeout(() => {
        document.getElementById('bar-dog').style.width = dogPct + '%';
        document.getElementById('bar-cat').style.width = catPct + '%';
    }, 50);

    const descriptions = isDog
        ? [
            '충성스럽고 다정한 성격! 친구들에게 항상 먼저 다가가는 타입이에요.',
            '밝고 에너지 넘치는 당신! 주변 사람들을 행복하게 만드는 매력이 있어요.',
            '순수하고 솔직한 매력의 소유자! 거짓말을 못하는 타입이죠.'
          ]
        : [
            '독립적이고 도도한 매력! 혼자만의 시간을 즐길 줄 아는 타입이에요.',
            '신비로운 분위기의 소유자! 알 수 없는 매력으로 사람들을 끌어당겨요.',
            '깔끔하고 센스있는 당신! 자기만의 확고한 취향이 있어요.'
          ];

    const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
    document.getElementById('result-desc').textContent = desc;
}

async function retry() {
    document.getElementById('result-container').style.display = 'none';
    document.getElementById('bar-dog').style.width = '0';
    document.getElementById('bar-cat').style.width = '0';
    document.getElementById('retry-btn').style.display = 'none';
    document.getElementById('capture-btn').style.display = 'inline-block';

    await webcam.play();
    animationId = window.requestAnimationFrame(loop);
}

// 제휴문의 폼 제출
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = contactForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = '전송 중...';

    const response = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
        formStatus.textContent = '문의가 성공적으로 전송되었습니다!';
        formStatus.style.color = '#28a745';
        contactForm.reset();
    } else {
        formStatus.textContent = '전송에 실패했습니다. 다시 시도해주세요.';
        formStatus.style.color = '#dc3545';
    }

    submitBtn.disabled = false;
    submitBtn.textContent = '문의 보내기';
});
