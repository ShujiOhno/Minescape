import BoardManager from './BoardManager.js'
import { Modal, Toast } from './UIUtil.js'
import ItemManager from './ItemManager.js'
import RankingManager from './RankingManager.js'

export default class GameMain {
    #gameInfo
    #playerInfo
    #timer
    static #instance
    constructor(initialSettings = {}) {
        this.#gameInfo = {
            stage: initialSettings.stage ?? 1,
            initialRemainTime: initialSettings.remainTime ?? 180, // 3分
            remainTime: initialSettings.remainTime ?? 180, // 3分
        }
        this.#playerInfo = {
            money: initialSettings.money ?? 0,
            currHp: initialSettings.currHp ?? 100,
            maxHp: initialSettings.maxHp ?? 100,
            items: initialSettings.items ?? [],
        }
        GameMain.#instance = this
    }
    static get instance() {
        return GameMain.#instance
    }
    // ゲーム開始
    #start() {
        const initialSettings = {
            stage: this.#gameInfo.stage,
            cols: 10,
            rows: 17,
            selector: '#board',
        }
        // 特殊アイテムを持っている場合は残り時間を60秒追加する
        const extraTime = this.#findItem(8)?.holdNum ? 60 : 0
        const remainTime = this.#gameInfo.initialRemainTime + extraTime
        this.#countdownTimer(remainTime)
        new BoardManager(initialSettings).drawBoard()
    }
    get start() {
        return this.#start
    }

    // 残り時間のカウントダウンタイマー
    #countdownTimer(remainTime) {
        this.#gameInfo.remainTime = remainTime
        this.#timer = setInterval(() => {
            remainTime--
            this.#gameInfo.remainTime = remainTime
            this.#displayInfo()
            if (remainTime === 0) {
                return this.#gameOver()
            }
        }, 1000)
    }
    // 残り時間のカウントダウンを止める
    #suspendTimer() {
        clearInterval(this.#timer)
        this.#timer = null
    }
    get suspendTimer() {
        return this.#suspendTimer
    }
    // 残り時間のカウントダウンを再開する
    #resumeTimer() {
        this.#countdownTimer(this.#gameInfo.remainTime)
    }
    get resumeTimer() {
        return this.#resumeTimer
    }

    // 残り時間の秒数をmin:secの形式に変換
    #convertSecToMin(remainTime) {
        const min = Math.floor(remainTime / 60)
            .toString()
            .padStart(2, '0')
        const sec = (remainTime % 60).toString().padStart(2, '0')
        return `${min}:${sec}`
    }

    // 外部から残り時間を弄る用
    #updateRemainTime(diffRemainTime) {
        this.#gameInfo.remainTime += diffRemainTime
        this.#displayInfo()
    }
    get updateRemainTime() {
        return this.#updateRemainTime
    }

    // 情報を表示
    #displayInfo() {
        const infoNode = document.getElementById('info')
        // 残り時間が30秒未満の場合は文字色を赤、60秒未満の場合はオレンジにする
        const { remainTime } = this.#gameInfo
        const timeColor = 30 > remainTime ? 'text-red-500' : 60 > remainTime ? 'text-orange-500' : ''
        // 残りHPが10%未満の場合は文字色を赤、30%未満の場合はオレンジにする
        const { currHp, maxHp } = this.#playerInfo
        const hpColor = maxHp * 0.1 > currHp ? 'text-red-500' : maxHp * 0.3 > currHp ? 'text-orange-500' : ''
        const html = `
        <div class="mr-5">
            <p>Stage <span id="stage">${this.#gameInfo.stage.toString().padStart(2, '0')}</span></p>
            <p>$ <span id="money">${this.#playerInfo.money.toLocaleString('ja-JP')}</span></p>
        </div>
        <div>
            <p>HP <span id="currHp" class="${hpColor}">${currHp}</span> / <span id="maxHp">${maxHp}</span></p>
            <p>Time <span id="timer" class="${timeColor}">${this.#convertSecToMin(remainTime)}</span></p>
        </div>
        `
        infoNode.innerHTML = html
    }
    get displayInfo() {
        return this.#displayInfo
    }
    // 地雷を踏んだ時
    #mineExploded() {
        // ダメージ計算
        let damage = this.#gameInfo.stage * 3 + 60 + Math.floor(Math.random() * 20)
        let additionalInfo = ''
        // アーマーを持っている場合は消費する
        let armorNum = this.#findItem(2)?.holdNum ?? 0
        if (armorNum) {
            const itemInfo = ItemManager.findItem(2)
            damage = Math.floor(damage / 2)
            this.updateItem(2, -1)
            additionalInfo += `<span>[${itemInfo.name}] 残: ${armorNum - 1}</span>`
        }
        // 特殊アイテムを持っている場合はダメージを軽減する
        if (this.#findItem(7)?.holdNum) {
            const itemInfo = ItemManager.findItem(7)
            damage = Math.floor(damage * 0.7)
            additionalInfo += `<span>[${itemInfo.name}]</span>`
        }
        // 致命的ダメージを受けた場合
        const { currHp } = this.#playerInfo
        if (damage >= currHp) {
            // 特殊アイテムを持っている場合は30%の確率で生還する
            if (this.#findItem(6)?.holdNum) {
                const random = Math.floor(Math.random() * 10)
                if (random >= 7) {
                    const itemInfo = ItemManager.findItem(6)
                    damage = currHp - 1
                    additionalInfo += `<span>[${itemInfo.name}]</span>`
                }
            }
        }
        this.#updateHp(-damage)
        new Toast({
            target: 'body',
            html: `${additionalInfo}<span>HP -<span class="red">${damage}</span></span>`,
        })
    }
    get mineExploded() {
        return this.#mineExploded
    }
    // HPが増減する時の処理
    #updateHp(diffHp, diffMaxHp = 0) {
        const { currHp, maxHp } = this.#playerInfo
        let newHp = Math.max(0, currHp + diffHp)
        newHp = Math.min(newHp, maxHp)
        this.#playerInfo.currHp = newHp
        // HPの上限を上げる場合
        if (diffMaxHp) {
            this.#playerInfo.maxHp += diffMaxHp
        }
        // HPが0になったらゲームオーバー
        if (!newHp) {
            this.#gameOver()
        }
        this.#displayInfo()
    }
    get updateHp() {
        return this.#updateHp
    }
    // お金が増減する時の処理
    #updateMoney(diffMoney) {
        let money = this.#playerInfo.money
        let newMoney = money + diffMoney
        this.#playerInfo.money = newMoney
        this.#displayInfo()
    }
    get updateMoney() {
        return this.#updateMoney
    }
    // アイテムの個数が変動する時の処理
    #updateItem(itemId, diffNum) {
        const item = this.#findItem(itemId)
        if (!item) {
            this.#playerInfo.items.push({ id: itemId, holdNum: diffNum })
        } else {
            item.holdNum += diffNum
        }
    }
    get updateItem() {
        return this.#updateItem
    }
    // 次のステージに進む
    #gotoNextStage() {
        clearInterval(this.#timer)
        // タイムボーナス計算
        const remainTime = this.#gameInfo.remainTime
        const stage = this.#gameInfo.stage
        const bonus = Math.floor(((remainTime * (remainTime / 5)) / 2) * (stage / 10 + 1))
        this.#updateMoney(+bonus)
        this.#gameInfo.stage++
        this.#start()
        new Toast({
            target: 'body',
            html: `<span>タイムボーナス 残り時間${remainTime}秒</span>
            <span class="center">${BoardManager.cellText.MONEY} ${bonus.toLocaleString('ja-JP')}</span>`,
        })
    }
    get gotoNextStage() {
        return this.#gotoNextStage
    }

    // お金を拾った時の処理
    #collectMoney() {
        const stage = this.#gameInfo.stage
        const amount = Math.floor(Math.random() * 2000 + 3000 * (stage / 10 + 1))
        this.#updateMoney(+amount)
        new Toast({
            target: 'body',
            html: `<span>${BoardManager.cellText.MONEY} ${amount.toLocaleString('ja-JP')}</span>`,
        })
    }
    get collectMoney() {
        return this.#collectMoney
    }

    // アイテムを拾った時の処理
    #collectItem() {
        // ドロップアイテムのidを決める
        const itemList = ItemManager.items.toReversed().filter((item) => this.#gameInfo.stage >= item.unlockStage)
        const item = itemList.find((item) => {
            let random = Math.floor(Math.random() * 100)
            // 特殊アイテムを持っている場合はドロップ率を変える
            if (this.#findItem(6)?.holdNum) {
                random /= 3
            }
            if (item.dropProbability > random) {
                return item
            }
        })
        this.#updateItem(item.id, 1)
        new Toast({
            target: 'body',
            html: `<span>${BoardManager.cellText.ITEM} ${item.name}</span>`,
        })
    }
    get collectItem() {
        return this.#collectItem
    }

    // 保有しているアイテムのリストからitemIdで検索した結果を返す
    #findItem(itemId) {
        return this.#playerInfo.items.find((item) => itemId === item.id)
    }
    get findItem() {
        return this.#findItem
    }

    // 所持金を返す
    get getMoney() {
        return this.#playerInfo.money
    }
    // 現在のステージを返す
    get getStage() {
        return this.#gameInfo.stage
    }

    // 現在のHPを返す
    get getCurrentHp() {
        return this.#playerInfo.currHp
    }

    // ゲームオーバー
    #gameOver() {
        clearInterval(this.#timer)
        // 自己記録を保存する
        const record = GameMain.loadMyRecord()
        if (this.#gameInfo.stage > record.stage) {
            record.stage = this.#gameInfo.stage
            record.date = Date.now()
        }
        if (this.#playerInfo.money > record.money) {
            record.money = this.#playerInfo.money
            record.date = Date.now()
        }
        GameMain.saveMyRecord(record)

        const html = `
            <div id="gameOver">
                <p class="center">GAME OVER</p>
                <p class="center">
                    プレイヤー名： <input type="text" id="playerName" value="${record?.name ?? 'no name'}">
                </p>
                <p class="center text-red-500 error font-bold"></p>
            </div>
        `
        new Modal({
            target: 'body',
            html: html,
            buttons: [
                {
                    text: '終了',
                    class: 'close',
                },
                {
                    text: 'ランキング登録',
                    onclick: RankingManager.registerRanking.bind(RankingManager, this.#gameInfo.stage, this.#playerInfo.money),
                },
            ],
            callback: () => {
                location.reload()
            },
        })
    }

    // 自己記録保存
    static #saveMyRecord(record) {
        localStorage.myRecord = JSON.stringify(record)
    }
    static get saveMyRecord() {
        return this.#saveMyRecord
    }

    // 自己記録読み込み
    static #loadMyRecord() {
        const record = localStorage.myRecord
        if (record) {
            return JSON.parse(record)
        } else {
            return {
                date: null,
                stage: 1,
                money: 0,
                name: 'no name',
            }
        }
    }
    static get loadMyRecord() {
        return this.#loadMyRecord
    }

    // UnixTime→フォーマット済み日時
    static #getFormattedDateStr(unixTime) {
        const date = new Date(unixTime)
        const yyyy = date.getFullYear()
        const MM = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')
        const hh = date.getHours().toString().padStart(2, '0')
        const mm = date.getMinutes().toString().padStart(2, '0')
        const ss = date.getSeconds().toString().padStart(2, '0')
        return `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`
    }
    static get getFormattedDateStr() {
        return this.#getFormattedDateStr
    }
}
