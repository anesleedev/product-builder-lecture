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
