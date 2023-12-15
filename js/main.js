import GameMain from './GameMain.js'
import { Modal, Toast } from './UIUtil.js'
import ItemManager from './ItemManager.js'
import RankingManager from './RankingManager.js'
;(() => {
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
    const game = new GameMain(initialSettings)
    // ゲームスタート
    document.getElementById('startBtn').addEventListener('click', (event) => {
        event.target.closest('section').classList.add('hidden')
        document.getElementById('info').closest('section').classList.remove('hidden')
        game.start()
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
            buttons: [{ text: '閉じる', class: 'close' }],
        })
    })

    // アイテム画面
    document.getElementById('item').addEventListener('click', () => {
        ItemManager.displayItemMenu()
    })

    // 自己記録を読み込む
    const record = GameMain.loadMyRecord()
    const stage = record.stage.toString().padStart(2, '0')
    const money = record.money.toLocaleString('ja-JP')
    let dateStr = ''
    if (record.date) {
        dateStr = GameMain.getFormattedDateStr(record.date)
    }
    document.getElementById('stageRecord').textContent = stage
    document.getElementById('moneyRecord').textContent = money
    document.getElementById('recordDate').textContent = dateStr

    // ランキング画面
    document.getElementById('rankingBtn').addEventListener('click', () => {
        RankingManager.displayRanking()
    })
})()
