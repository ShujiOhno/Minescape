/* Button */
class CustomBtn extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        const colorClass = this.className ?? 'green'
        const colors = {
            'green-n': 'rgb(34,197,94)',
            'green-l': 'rgb(74,222,128)',
            'blue-n': 'rgb(59,130,246)',
            'blue-l': 'rgb(96,165,250)',
            'orange-n': 'rgb(249,115,22)',
            'orange-l': 'rgb(251,146,60)',
            'red-n': 'rgb(239,68,68)',
            'red-l': 'rgb(248,113,113)',
            's-black-n': 'rgba(0,0,0,0.3)',
            's-black-l': 'rgba(0,0,0,0.2)',
        }
        this.shadowRoot.innerHTML = `
        <style>
        button {
            box-sizing: border-box;
            border-width: 0;
            border-style: solid;
            border-color: #e5e7eb;
            cursor: pointer;
            position: relative;
            margin: 0.25rem;
            overflow: hidden;
            border-radius: 0.25rem;
            padding-left: 0.75rem;
            padding-right: 0.75rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            color: rgb(255,255,255);
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 150ms;
            transition-duration: 300ms;
            transition-timing-function: cubic-bezier(0, 0, 0.2, 1);
            &.${colorClass} {
                background-color: ${colors[colorClass + '-n']};
                &:enabled:hover {
                    background-color: ${colors[colorClass + '-l']};
                    box-shadow: 0px 0px 0px 2px #fff, 0 0 0px 4px ${colors[colorClass + '-l']};
                }
            }
            &:disabled {
                border-color: rgb(75,85,99);
                background-color: rgb(75,85,99);
                color: rgb(243,244,246);
            }
            &:disabled:hover {
                cursor: no-drop;
                box-shadow: none;
            }
        }
        span.effect {
            position: absolute;
            right: 0px;
            margin-top: -3rem;
            height: 8rem;
            width: 2rem;
            transform: translateX(3rem) rotate(12deg);
            background-color: rgb(255,255,255);
            opacity: 0.1;
            transition-property: all;
            transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            transition-duration: 1000ms;
        }
        button, span.text {
            position: relative;
        }
        </style>
        <button class="${colorClass}" ${this.disabled ? 'disabled' : ''}>
            <span class="effect"></span>
            <span class="text">${this.innerHTML}</span>
        </button>
        `
        this.addEventListener('click', (e) => {
            if (this.disabled) {
                e.preventDefault()
                e.stopImmediatePropagation()
            }
        })
        this.addEventListener('mouseover', (e) => {
            if (this.disabled) {
                e.preventDefault()
                e.stopImmediatePropagation()
                return
            }
            const width = this.shadowRoot.querySelector('button').clientWidth
            this.shadowRoot.querySelector('.effect').style.transform = `translate(${-width}px, 0) rotate(0) skewX(0) skewY(0) scaleX(1) scaleY(1)`
        })
        this.addEventListener('mouseout', () => {
            this.shadowRoot.querySelector('.effect').style.transform = 'translateX(3rem) rotate(12deg)'
        })
    }
    static get observedAttributes() {
        return ['disabled']
    }
    get disabled() {
        return this.hasAttribute('disabled')
    }
    set disabled(flag) {
        this.toggleAttribute('disabled', Boolean(flag))
        this.shadowRoot.querySelector('button').toggleAttribute('disabled', Boolean(flag))
    }
}
customElements.define('cus-btn', CustomBtn)

/* loading */
class CustomLoading extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
        this.shadowRoot.innerHTML = `
        <style>
        .loading-wrap {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-content: center;
            width: 48px;
            height: 48px;
            margin: 48px auto;
        }
        .loading-1, .loading-2, .loading-3, .loading-4, .loading-5, .loading-6, .loading-7, .loading-8 {
            position: absolute;
            border: 4px solid transparent;
            border-radius: 100%;
        }
        .loading-1 {
            top: 0;
            left: 20px;
            animation: loading 1s infinite;
        }
        .loading-2 {
            top: 5px;
            right: 5px;
            animation: loading 1s infinite 0.125s;
        }
        .loading-3 {
            top: 20px;
            right: 0;
            animation: loading 1s infinite 0.25s;
        }
        .loading-4 {
            bottom: 5px;
            right: 5px;
            animation: loading 1s infinite 0.375s;
        }
        .loading-5 {
            bottom: 0;
            left: 20px;
            animation: loading 1s infinite 0.5s;
        }
        .loading-6 {
            bottom: 5px;
            left: 5px;
            animation: loading 1s infinite 0.625s;
        }
        .loading-7 {
            top: 20px;
            left: 0;
            animation: loading 1s infinite 0.75s;
        }
        .loading-8 {
            top: 5px;
            left: 5px;
            animation: loading 1s infinite 0.875s;
        }
        @keyframes loading {
            0% {border-color:#333;}
            100% {border-color:#fff;}
        }
        </style>
        <div class="loading-wrap">
            <div class="loading-1"></div>
            <div class="loading-2"></div>
            <div class="loading-3"></div>
            <div class="loading-4"></div>
            <div class="loading-5"></div>
            <div class="loading-6"></div>
            <div class="loading-7"></div>
            <div class="loading-8"></div>
	    </div>
        `
    }
}
customElements.define('cus-loading', CustomLoading)
