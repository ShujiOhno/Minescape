import GameMain from './GameMain.js'
import { Modal, Toast } from './UIUtil.js'

export default class RankingManager {
    static #GAS_URL = 'https://script.google.com/macros/s/AKfycbzPh6NYUgJboEUpSAmdzsZPJBbSIByguarSxBUvWCk2qIpvnCEwfbTa-g2ListWUEFf/exec'
    // ランキング表示
    static async #displayRanking() {
        const modal = new Modal({
            target: 'body',
            html: '<cus-loading></cus-loading>', // ローディングアニメーション表示
            buttons: [{ text: '閉じる', class: 'close' }],
        })
        try {
            const response = await fetch(this.#GAS_URL)
            const json = await response.json()
            // それぞれ昇順でソート
            const stageRankingArr = json.toSorted((a, b) => b.stage - a.stage).slice(0, 20)
            const moneyRankingArr = json.toSorted((a, b) => b.money - a.money).slice(0, 20)
            modal.querySelector('cus-loading').outerHTML = `
                <div class="tab-wrap">
                    <input id="tab01" type="radio" name="tab" class="tab-switch" checked="checked">
                    <label class="tab-label" for="tab01">ステージ</label>
                    <div class="tab-content">${this.#makeRankingHtml(stageRankingArr)}</div>
                    <input id="tab02" type="radio" name="tab" class="tab-switch">
                    <label class="tab-label" for="tab02">所持金</label>
                    <div class="tab-content">${this.#makeRankingHtml(moneyRankingArr)}</div>
                </div>
            `
        } catch (error) {
            modal.querySelector('cus-loading').outerHTML = `<span class="center">エラー: ${error}</span>`
        }
    }
    static get displayRanking() {
        return this.#displayRanking
    }

    // ランキング一覧のHTMLを生成
    static #makeRankingHtml(rankingArr) {
        const thead = `
        <thead>
            <tr>
                <th scope="col"></th>
                <th scope="col">日時</th>
                <th scope="col">名前</th>
                <th scope="col">St.</th>
                <th scope="col">所持金</th>
            </tr>
        </thead>`
        let tbody = '<tbody>'
        rankingArr.forEach((ranking, i) => {
            const isEven = i % 2 === 0
            const trClassName = isEven ? 'bg-transparent-black' : ''
            const dateStr = GameMain.getFormattedDateStr(ranking.date)
            tbody += `
            <tr class="${trClassName}">
                <td>
                    <span>${i + 1}</span>
                </td>
                <td>
                    <span>${dateStr}</span>
                </td>
                <td>
                    <span>${ranking.name}</span>
                </td>
                <td>
                    <span>${ranking.stage}</span>
                </td>
                <td>
                    <span>$ ${ranking.money.toLocaleString('ja-JP')}</span>
                </td>
            </tr>
            `
        })
        tbody += '</tbody>'
        return `
        <div id="ranking">
        <div id="">
            <table>
                ${thead}
                ${tbody}
            </table>
        </div>
        </div>
        `
    }

    // ランキング登録
    static async #registerRanking(stage, money, event) {
        const modal = event.target.closest('.modal')
        const playerName = modal.querySelector('#playerName').value
        const errorOutput = modal.querySelector('.error')
        // プレイヤー名のバリデーション
        let errorText = ''
        if (!playerName.length) {
            errorText = 'プレイヤー名を入力してください。'
        } else if (playerName.length > 10) {
            errorText = 'プレイヤー名は10文字以内にしてください。'
        }
        errorOutput.textContent = errorText
        if (errorText) {
            return
        }
        // 名前をLocalStorageに保存
        const record = GameMain.loadMyRecord()
        record.name = playerName
        GameMain.saveMyRecord(record)
        // ローディングアニメーション表示
        modal.querySelector('#gameOver').innerHTML = '<cus-loading></cus-loading>'
        event.target.remove()
        try {
            const headers = { 'Content-Type': 'text/plain' }
            const postData = JSON.stringify({
                date: Date.now(),
                name: playerName,
                stage: stage,
                money: money,
            })
            const response = await fetch(this.#GAS_URL, { method: 'POST', body: postData, headers })
            const json = await response.json()
            // 成功時
            if (json.result === 'OK') {
                location.reload()
            } else {
                throw new Error()
            }
        } catch (error) {
            modal.querySelector('cus-loading').outerHTML = `<span class="center">エラー: ${error}</span>`
        }
    }
    static get registerRanking() {
        return this.#registerRanking
    }
}
