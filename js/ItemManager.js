import GameMain from './GameMain.js'
import BoardManager from './BoardManager.js'
import { Modal, Toast } from './UIUtil.js'

export default class ItemManager {
    static #items = [
        {
            id: 0,
            name: '回復薬',
            price: 3000,
            description: 'HPを30回復する。',
            unlockStage: 1,
            isUsable: true,
            isAutoConsume: false,
            maxHoldNum: Infinity,
            dropProbability: 100,
            buyCallback: null,
            useCallback: () => {
                new Toast({
                    target: 'body',
                    html: `<span>HP回復 +<span>30</span></span>`,
                })
                GameMain.instance.updateHp(30)
            },
        },
        {
            id: 1,
            name: 'HP上限UP',
            price: 30000,
            description: 'HPの上限を20増加する。',
            unlockStage: 1,
            isUsable: true,
            isAutoConsume: false,
            maxHoldNum: Infinity,
            dropProbability: 5,
            buyCallback: null,
            useCallback: () => {
                new Toast({
                    target: 'body',
                    html: `<span>HP上限 +<span>20</span></span>`,
                })
                GameMain.instance.updateHp(0, 20)
            },
        },
        {
            id: 2,
            name: 'アーマー',
            price: 30000,
            description: '地雷爆発時のダメージを半減する。(自動消費)',
            unlockStage: 1,
            isUsable: false,
            isAutoConsume: true,
            maxHoldNum: Infinity,
            dropProbability: 5,
            buyCallback: null,
            useCallback: null,
        },
        {
            id: 3,
            name: '地雷探知器',
            price: 10000,
            description: 'マップ上の地雷をランダムで3～4個探知する。',
            unlockStage: 1,
            isUsable: true,
            isAutoConsume: false,
            maxHoldNum: Infinity,
            dropProbability: 5,
            buyCallback: null,
            useCallback: () => {
                const detectNum = Math.floor(Math.random() * 2) + 3
                new Toast({
                    target: 'body',
                    html: `<span>地雷を${detectNum}個探知しました</span>`,
                })
                BoardManager.instance.detectMines(detectNum)
            },
        },
        {
            id: 4,
            name: '？？？',
            price: 30000,
            description: 'ランダムで何かが起こる。',
            unlockStage: 1,
            isUsable: true,
            isAutoConsume: false,
            maxHoldNum: Infinity,
            dropProbability: 5,
            buyCallback: null,
            useCallback: () => {
                const events = [
                    {
                        // HPを1～200回復する
                        effect: () => {
                            const incHp = Math.floor(Math.random() * 200) + 1
                            new Toast({
                                target: 'body',
                                html: `<span>HP回復 +<span>${incHp}</span></span>`,
                            })
                            GameMain.instance.updateHp(+incHp)
                        },
                        probability: 100,
                    },
                    {
                        // HPの上限を1～100増加する
                        effect: () => {
                            const incMaxHp = Math.floor(Math.random() * 100) + 1
                            new Toast({
                                target: 'body',
                                html: `<span>HP上限 +<span>${incMaxHp}</span></span>`,
                            })
                            GameMain.instance.updateHp(0, +incMaxHp)
                        },
                        probability: 20,
                    },
                    {
                        // 所持金がランダムで-30000～90000増加する
                        effect: () => {
                            const amount = Math.floor(Math.random() * 120000) - 30000 + 1
                            new Toast({
                                target: 'body',
                                html: `<span>${BoardManager.cellText.MONEY} ${amount.toLocaleString('ja-JP')}</span>`,
                            })
                            GameMain.instance.updateMoney(+amount)
                        },
                        probability: 20,
                    },
                    {
                        // マップ上の地雷をランダムで1～30個探知する。
                        effect: () => {
                            const detectNum = Math.floor(Math.random() * 30) + 1
                            new Toast({
                                target: 'body',
                                html: `<span>地雷を${detectNum}個探知しました</span>`,
                            })
                            BoardManager.instance.detectMines(detectNum)
                        },
                        probability: 20,
                    },
                    {
                        // 次のステージに飛ぶ
                        effect: () => {
                            GameMain.instance.gotoNextStage()
                        },
                        probability: 20,
                    },
                    {
                        // 残りHPが1になる
                        effect: () => {
                            const currHp = GameMain.instance.getCurrentHp
                            const damage = currHp - 1
                            GameMain.instance.updateHp(-damage)
                            new Toast({
                                target: 'body',
                                html: `残りHPが1になった🥹<span>HP -<span class="red">${damage}</span></span>`,
                            })
                        },
                        probability: 20,
                    },
                ]
                // ランダムで抽選する
                for (const event of events.toReversed()) {
                    const random = Math.floor(Math.random() * 100)
                    if (event.probability > random) {
                        return event.effect()
                    }
                }
            },
        },
        {
            id: 5,
            name: '欲望の石',
            price: 200000,
            description: 'マップ上に出現するアイテムの数が2個増加する。',
            unlockStage: 1,
            isUsable: false,
            isAutoConsume: false,
            maxHoldNum: 1,
            dropProbability: 0,
            buyCallback: null,
            useCallback: null,
        },
        {
            id: 6,
            name: '幸運の石',
            price: 200000,
            description: '致命的ダメージを受けた際に、30%の確率で生き残る。また回復薬以外のドロップ率が3倍になる。',
            unlockStage: 1,
            isUsable: false,
            isAutoConsume: false,
            maxHoldNum: 1,
            dropProbability: 0,
            buyCallback: null,
            useCallback: null,
        },
        {
            id: 7,
            name: '鋼の石',
            price: 200000,
            description: 'ダメージを30%軽減する。',
            unlockStage: 1,
            isUsable: false,
            isAutoConsume: false,
            maxHoldNum: 1,
            dropProbability: 0,
            buyCallback: null,
            useCallback: null,
        },
        {
            id: 8,
            name: '時の石',
            price: 200000,
            description: '残り時間が60秒増加する。',
            unlockStage: 1,
            isUsable: false,
            isAutoConsume: false,
            maxHoldNum: 1,
            dropProbability: 0,
            buyCallback: () => {
                new Toast({
                    target: 'body',
                    html: `<span>残り時間 +60秒</span>`,
                })
                GameMain.instance.updateRemainTime(+60)
            },
            useCallback: null,
        },
    ]
    static get items() {
        return this.#items
    }

    // アイテムのリストからitemIdで検索した結果を返す
    static #findItem(itemId) {
        return this.#items.find((item) => itemId === item.id)
    }
    static get findItem() {
        return this.#findItem
    }

    // アイテム一覧表示
    static #displayItemMenu() {
        // 残り時間のカウントダウンを止める
        GameMain.instance.suspendTimer()
        let modal
        let itemListNode = document.getElementById('itemList')
        // 既に表示されている場合は既存のモーダルを使い回す
        if (itemListNode) {
            modal = itemListNode.closest('.modal')
            itemListNode.outerHTML = this.#makeItemListHtml()
        } else {
            modal = new Modal({
                target: 'body',
                html: this.#makeItemListHtml(),
                buttons: [{ text: '閉じる', class: 'close' }],
                callback: () => {
                    // 残り時間のカウントダウンを再開する
                    GameMain.instance.resumeTimer()
                },
            })
        }
        // マウスオーバーで説明を表示
        modal.querySelectorAll('tr').forEach((element, i) => {
            if (i === 0) return false
            const itemId = Number(element.dataset.itemId)
            const item = this.#items.find((item) => item.id === itemId)
            element.onmouseover = () => {
                modal.querySelector('#itemDescription').textContent = item.description
            }
            // 使う
            const useBtn = element.querySelector('[name=useItem]')
            if (!useBtn.disabled) {
                useBtn.onclick = () => {
                    GameMain.instance.updateItem(itemId, -1)
                    if (item.useCallback) {
                        item.useCallback()
                    }
                    return this.#displayItemMenu()
                }
            }
            // 購入
            const buyBtn = element.querySelector('[name=buyItem]')
            if (!buyBtn.disabled) {
                buyBtn.onclick = () => {
                    GameMain.instance.updateItem(itemId, +1)
                    GameMain.instance.updateMoney(-item.price)
                    if (item.buyCallback) {
                        item.buyCallback()
                    }
                    return this.#displayItemMenu()
                }
            }
        })
    }
    static get displayItemMenu() {
        return this.#displayItemMenu
    }

    // アイテムが解放されているかチェックする
    static #checkUnlocked(itemId) {
        const stage = GameMain.instance.getStage
        const item = this.#items.find((item) => item.id === itemId)
        return stage >= item.unlockStage
    }

    // アイテム一覧ページのHTMLを生成
    static #makeItemListHtml() {
        const thead = `
        <thead>
            <tr>
                <th scope="col">アイテム名</th>
                <th scope="col">保有数</th>
                <th scope="col">価格</th>
                <th scope="col" colspan="2">操作</th>
            </tr>
        </thead>`
        let tbody = '<tbody class="">'
        this.#items.forEach((item, i) => {
            const isEven = i % 2 === 0
            const trClassName = isEven ? 'bg-transparent-black' : ''
            const holdNum = GameMain.instance.findItem(item.id)?.holdNum ?? 0
            const isUsable = holdNum && item.isUsable
            const isUnlocked = this.#checkUnlocked(item.id)
            const isCanBuy = GameMain.instance.getMoney >= item.price && isUnlocked && item.maxHoldNum > holdNum
            tbody += `
            <tr class="${trClassName}" data-item-id="${item.id}">
                <td>
                    <span>${item.name}</span>
                </td>
                <td>
                    <span>${holdNum}個</span>
                </td>
                <td>
                    <span>$ ${item.price.toLocaleString('ja-JP')}</span>
                </td>
                <td>
                    <button name="useItem" class="btn mini" ${isUsable ? '' : 'disabled'}>使う</button>
                </td>
                <td>
                    <button name="buyItem" class="btn mini" ${isCanBuy ? '' : 'disabled'}>購入</button>
                </td>
            </tr>
            `
        })
        tbody += '</tbody>'
        return `
        <div id="itemList">
            <div>
                <table>
                    ${thead}
                    ${tbody}
                </table>
            </div>
        <div id="itemDescription">説明：</div>
        </div>
        `
    }
}
