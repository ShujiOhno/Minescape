import GameMain from './GameMain.js'
import { Modal, Toast } from './UIUtil.js'
import ItemManager from './ItemManager.js'
;(() => {
    // ゲーム開始
    document.getElementById('startBtn').addEventListener('click', (event) => {
        event.target.closest('section').classList.add('hidden')
        document.getElementById('info').closest('section').classList.remove('hidden')
        // 初期設定
        const initialSettings = {
            stage: 1,
            initialRemainTime: 180,
            remainTime: 180,
            money: 0,
            currHp: 100,
            maxHp: 100,
            items: [
                { id: 0, holdNum: 0 },
                { id: 1, holdNum: 0 },
                { id: 2, holdNum: 0 },
                { id: 3, holdNum: 0 },
                { id: 4, holdNum: 0 },
                { id: 5, holdNum: 0 },
                { id: 6, holdNum: 0 },
                { id: 7, holdNum: 0 },
                { id: 8, holdNum: 0 },
            ],
        }
        new GameMain(initialSettings).start()
    })

    // 遊び方を見る
    document.getElementById('howToPlay').addEventListener('click', () => {
        const html = `
        <ul>
            <li>最下段のマスから開けていき、最上段まで到達するとステージクリア</li>
            <li>時間切れ or HPが0になるとゲームオーバー</li>
            <li>マスに書かれている数字は、周囲のマスに埋まっている地雷の数を示します。</li>
            <li>通常のマインスイーパのようにすべて開ける必要はありません。</li>
            <li>最下段には地雷はありません。</li>
            <li>地雷があると思われるマスを右クリック(タッチデバイスはロングタップ)するとマークを付けられます。</li>
            <li>ステージが進むにつれて地雷の数や被ダメージがエグいことになるので、アイテムを上手く活用しましょう。</li>
            <li><s>ゲームバランスは適当です。</s></li>
        </ul>
        `
        new Modal({
            target: 'body',
            html: html,
            buttons: [{ text: 'OK', class: 'close' }],
        })
    })

    // アイテム画面
    document.getElementById('item').addEventListener('click', () => {
        ItemManager.displayItemMenu()
    })

    // 自己記録を読み込む
    const record = JSON.parse(localStorage.myRecord ?? '{}')
    const stage = (record?.stage ?? 1).toString().padStart(2, '0')
    const money = (record?.money ?? 0).toLocaleString('ja-JP')
    let dateStr = ''
    const unixTime = record?.date
    if (unixTime) {
        const date = new Date(unixTime)
        const yyyy = date.getFullYear()
        const MM = (date.getMonth() + 1).toString().padStart(2, '0')
        const dd = date.getDate().toString().padStart(2, '0')
        const hh = date.getHours().toString().padStart(2, '0')
        const mm = date.getMinutes().toString().padStart(2, '0')
        const ss = date.getSeconds().toString().padStart(2, '0')
        dateStr = `${yyyy}/${MM}/${dd} ${hh}:${mm}:${ss}`
    }
    document.getElementById('stageRecord').textContent = stage
    document.getElementById('moneyRecord').textContent = money
    document.getElementById('recordDate').textContent = dateStr
})()
