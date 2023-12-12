import GameMain from './GameMain.js'

export default class BoardManager {
    #stage
    #cols // 横のマス目の数
    #rows // 縦のマス目の数
    #boardNode
    #cellArr = []
    #lastOpened
    static #instance
    constructor(initialSettings = {}) {
        this.#stage = initialSettings.stage ?? 1
        this.#cols = initialSettings.cols ?? 10
        this.#rows = initialSettings.rows ?? 17
        this.#boardNode = document.querySelector(initialSettings.selector ?? '#board')
        this.#makeCellArr()
        BoardManager.#instance = this
        GameMain.instance.displayInfo()
    }
    static get instance() {
        return BoardManager.#instance
    }
    static cellText = {
        BLANK: '',
        MINE: '💣',
        MINE_EXPLODED: '💥',
        FLAG: '🚩',
        MONEY: '💰',
        ITEM: '⭐',
    }
    // マスの中身を作成
    #makeCellArr() {
        // 初期化
        for (let y = 0; y < this.#rows; y++) {
            this.#cellArr[y] ??= []
            for (let x = 0; x < this.#cols; x++) {
                this.#cellArr[y][x] ??= { x, y, type: 'BLANK', isCanOpen: false, isOpened: false, isFlagged: false }
            }
        }
        // 地雷設置
        const mineDensity = 0.05
        const mineMax = (this.#cols * this.#rows) / 3
        const mineNum = Math.floor(Math.min(mineMax, this.#stage * 0.7 + 10))
        let mineSetCnt = 0
        mainLoop: while (true) {
            for (let y = 0; y < this.#rows; y++) {
                for (let x = 0; x < this.#cols; x++) {
                    const cell = this.#cellArr[y][x]
                    const isMine = mineDensity > Math.random()
                    // 最下段には地雷を設置しない
                    if (y === this.#rows - 1) continue
                    // 既に地雷が設置されている場合は何もしない
                    // 新規で地雷を設置したときのみカウントを増やす
                    if (isMine && cell.type !== 'MINE') {
                        cell.type = 'MINE'
                        mineSetCnt++
                    }
                    const adjacentArr = this.#getAdjacentArr(x, y)
                    const isFullMine = !adjacentArr.some((a) => a.type !== 'MINE')
                    // 隣接するマスが地雷で埋め尽くされている場合、ランダムで一つ地雷を撤去する
                    if (isFullMine) {
                        const rnd = Math.floor(Math.random() * adjacentArr.length)
                        adjacentArr[rnd].type = 'BLANK'
                        mineSetCnt--
                    }
                    if (mineSetCnt >= mineNum) {
                        break mainLoop
                    }
                }
            }
        }
        // お金orアイテム設置
        this.#setItems()
    }

    // 安全なマスにお金orアイテムを2～3個設置する
    // 一番上のマスは除外する
    #setItems() {
        const cells = this.#getCellsByCond('safe').filter((cell) => cell.y > 0)
        let setNum = Math.floor(Math.random() * 2) + 2
        // 特殊アイテムを持っている場合は2個増加
        if (GameMain.instance.findItem(5)?.holdNum) {
            setNum += 2
        }
        const randomCells = [...Array(setNum)].map((_) => cells[Math.floor(Math.random() * cells.length)])
        randomCells.forEach((cell) => {
            const type = ['MONEY', 'ITEM'][Math.floor(Math.random() * 2)]
            cell.type = type
        })
    }

    // 隣接するマスを取得
    #getAdjacentArr(x, y) {
        return [
            this.#cellArr?.[y + 1]?.[x - 1], // 左斜め上
            this.#cellArr?.[y + 1]?.[x], // 上
            this.#cellArr?.[y + 1]?.[x + 1], // 右斜め上
            this.#cellArr?.[y]?.[x - 1], // 左
            this.#cellArr?.[y]?.[x + 1], // 右
            this.#cellArr?.[y - 1]?.[x - 1], // 左斜め下
            this.#cellArr?.[y - 1]?.[x], // 下
            this.#cellArr?.[y - 1]?.[x + 1], // 右斜め下
        ].filter(Boolean)
    }

    // マスを描画する
    #drawBoard() {
        let hasTouchScreen = false
        if ('ontouchstart' in window && navigator.maxTouchPoints > 0) {
            hasTouchScreen = true
        }
        const wrapper = document.createElement('div')
        const fragment = document.createDocumentFragment()
        for (let y = 0; y < this.#rows; y++) {
            const div = document.createElement('div')
            div.className = 'flex flex-row justify-center'
            for (let x = 0; x < this.#cols; x++) {
                const cell = this.#cellArr[y][x]
                const btn = document.createElement('button')
                const color = (x + y) % 2 == 0 ? 'bg-sky-300' : 'bg-sky-400'
                btn.className = `${color}`
                btn.id = `x${x}-y${y}`
                // お金orアイテムは絵文字を表示する
                if (['MONEY', 'ITEM'].includes(cell.type)) {
                    btn.textContent = BoardManager.cellText[cell.type]
                }
                // タッチデバイスは長押しでフラグをセット
                if (hasTouchScreen) {
                    btn.ontouchstart = (event) => {
                        this.#onMouseOver(x, y, event)
                        let count = 0
                        const timer = setInterval(() => {
                            count++
                            // 長押し時
                            if (count >= 3) {
                                this.#setFlag(x, y, event)
                                cancel()
                            }
                        }, 100)
                        const onTouchEnd = (event) => {
                            clearTimeout(timer)
                            this.#onMouseUp(x, y, event)
                        }
                        const cancel = () => {
                            btn.removeEventListener('touchend', onTouchEnd)
                            this.#onMouseOut(event)
                            clearTimeout(timer)
                        }
                        btn.addEventListener('touchend', onTouchEnd, { once: true })
                        btn.addEventListener('touchmove', cancel, { once: true })
                    }
                } else {
                    btn.onmouseup = this.#onMouseUp.bind(this, x, y)
                    btn.onmouseover = this.#onMouseOver.bind(this, x, y)
                    btn.onmouseout = this.#onMouseOut
                }
                btn.oncontextmenu = (event) => event.preventDefault()
                btn.appendChild(document.createElement('span'))
                div.appendChild(btn)
            }
            fragment.appendChild(div)
        }
        wrapper.appendChild(fragment)
        this.#boardNode.querySelector('div').replaceWith(wrapper)
    }
    get drawBoard() {
        return this.#drawBoard
    }

    // マウスアップ
    #onMouseUp(x, y, event) {
        const cell = this.#cellArr[y][x]
        if (!cell.isCanOpen) return // 開けられない場合は何もしない
        // タッチデバイス用
        if (event.type === 'touchend') {
            return this.#open(x, y, event)
        }
        switch (event.button) {
            // 左クリック
            case 0:
                this.#open(x, y, event)
                break
            // 右クリック
            case 2:
                const { isFlagged } = cell
                if (isFlagged) {
                    event.target.textContent = ''
                    cell.isFlagged = false
                } else {
                    if (event.target.textContent !== '') {
                        return
                    }
                    event.target.textContent = BoardManager.cellText.FLAG
                    cell.isFlagged = true
                }
                break
        }
    }

    // フラグをセットする
    #setFlag(x, y, event) {
        const cell = this.#cellArr[y][x]
        if (!cell.isCanOpen) return
        const { isFlagged } = cell
        if (isFlagged) {
            event.target.textContent = ''
            cell.isFlagged = false
        } else {
            if (event.target.textContent !== '') {
                return
            }
            event.target.textContent = BoardManager.cellText.FLAG
            cell.isFlagged = true
        }
        this.#onMouseOut(event)
    }

    // マウスオーバー
    #onMouseOver(x, y, event) {
        const adjacentArr = this.#getAdjacentArr(x, y)
        const cell = this.#cellArr[y][x]
        const text = event.target.textContent
        let isCanOpen =
            cell.isCanOpen ||
            (adjacentArr.some((a) => a.isOpened) && (!text.length || [BoardManager.cellText.MONEY, BoardManager.cellText.ITEM].includes(text)))
        // 初手は一番下の段のどこでも開けられる
        if (y === this.#rows - 1 && !this.#lastOpened) {
            isCanOpen = true
        }
        // 開けられる場合はカーソルを合わせた際に枠を表示する
        if (isCanOpen) {
            cell.isCanOpen = true
            event.target.classList.add('cellSelected')
        }
    }
    // マウスアウト
    #onMouseOut(event) {
        event.target.classList.remove('cellSelected')
    }

    // マスを開ける
    #open(x, y, event) {
        const element = event.target
        const isEven = (x + y) % 2 === 0
        const cell = this.#cellArr[y][x]
        element.classList.replace(isEven ? 'bg-sky-300' : 'bg-sky-400', isEven ? 'bg-slate-100' : 'bg-slate-200')
        cell.isOpened = true
        cell.isCanOpen = false
        this.#lastOpened = { x, y }
        // 地雷を踏んだ場合
        if (cell.type === 'MINE') {
            element.textContent = BoardManager.cellText.MINE_EXPLODED
            GameMain.instance.mineExploded()
        } else {
            // 地雷を踏まなかった場合
            // お金を拾った場合
            if (cell.type === 'MONEY') {
                GameMain.instance.collectMoney()
            }
            // アイテムを拾った場合
            else if (cell.type === 'ITEM') {
                GameMain.instance.collectItem()
            }
            // 色分け
            this.#setColorByMineCnt(x, y, element)
            // HP自然回復
            GameMain.instance.updateHp(+1)
            // ステージをクリアすると自動的に次のステージに進む
            if (y === 0) {
                GameMain.instance.gotoNextStage()
            }
        }
        this.#onMouseOut(event)
    }

    // 色分け
    #setColorByMineCnt(x, y, element) {
        const adjacentArr = this.#getAdjacentArr(x, y)
        const mineCnt = adjacentArr.filter((a) => a.type === 'MINE').length
        element.textContent = mineCnt
        const color = [
            'text-black', // 0
            'text-blue-500', // 1
            'text-green-500', // 2
            'text-red-500', // 3
            'text-indigo-700', // 4
            'text-orange-500', // 5
            'text-cyan-500', // 6
            'text-violet-500', // 7
        ][mineCnt]
        element.classList.add(color)
    }

    // 条件にマッチしたマスを取得する
    #getCellsByCond(type) {
        const cells = this.#cellArr.flat().filter((cell) => {
            switch (type) {
                case 'safe':
                    return cell.type !== 'MINE' && !cell.isOpened
                case 'mine':
                    return cell.type === 'MINE' && !cell.isOpened && !cell.isFlagged
            }
        })
        return cells
    }

    // マップ上の地雷を探知する
    #detectMines(detectNum) {
        const cells = this.#getCellsByCond('mine')
        const randomCells = [...Array(detectNum)].map((_) => cells[Math.floor(Math.random() * cells.length)])
        randomCells.forEach((cell) => {
            const { x, y } = cell
            const element = document.querySelector(`#x${x}-y${y}`)
            element.textContent = BoardManager.cellText.MINE
            cell.isCanOpen = false
        })
    }
    get detectMines() {
        return this.#detectMines
    }

    // すべてのマスを開ける
    #allOpen() {
        for (let y = 0; y < this.#rows; y++) {
            for (let x = 0; x < this.#cols; x++) {
                const isEven = (x + y) % 2 === 0
                const cell = this.#cellArr[y][x]
                const element = document.querySelector(`#x${x}-y${y}`)
                element.classList.replace(isEven ? 'bg-sky-300' : 'bg-sky-400', isEven ? 'bg-slate-100' : 'bg-slate-200')
                if (cell.type !== 'MINE') {
                    this.#setColorByMineCnt(x, y, element)
                } else {
                    element.textContent = BoardManager.cellText.MINE
                }
            }
        }
    }
    get allOpen() {
        return this.#allOpen
    }
}
