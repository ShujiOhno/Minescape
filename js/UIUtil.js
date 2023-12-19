import GameMain from './GameMain.js'

/* Modal */
export class Modal {
    constructor(stg) {
        // タッチデバイスか否かでリッスンするイベントを変える
        const eventType = GameMain.hasTouchScreen ? 'touchend' : 'click'
        const targetNode = document.querySelector(stg.target ?? 'body')
        // 要素を生成
        let modalWrapper = document.createElement('div')
        modalWrapper.className = 'modalWrapper'
        let modalOverlay = document.createElement('div')
        modalOverlay.className = 'modalOverlay'
        let modalNode = document.createElement('div')
        modalNode.className = 'modal'
        modalNode.innerHTML = stg.html
        let btnWrapper = document.createElement('div')
        btnWrapper.className = 'btnWrapper center'
        stg.buttons.forEach((btnStg) => {
            let btn = document.createElement('button')
            btn.textContent = btnStg.text
            btn.id = btnStg.id ?? ''
            btn.className = `btn ${btnStg.class ?? ''}`
            if (btnStg.onclick) {
                // 誤タップ防止用に300msの遅延を設ける
                setTimeout(() => btn.addEventListener(eventType, btnStg.onclick), 300)
            }
            btnWrapper.appendChild(btn)
        })
        modalNode.appendChild(btnWrapper)
        // 枠外orクラス名closeが付与されたボタンをクリックした際に要素を削除する
        // コールバックの指定がある場合はそれを実行する
        const remove = () => {
            modalWrapper.remove()
            if (stg.callback) {
                stg.callback()
            }
        }
        // 誤タップ防止用に300msの遅延を設ける
        setTimeout(() => {
            modalOverlay.addEventListener(eventType, remove, { once: true })
            btnWrapper.querySelectorAll('.btn.close').forEach((el) => el.addEventListener(eventType, remove, { once: true }))
        }, 300)
        // 要素を追加する
        modalWrapper.appendChild(modalNode)
        modalWrapper.appendChild(modalOverlay)
        targetNode.appendChild(modalWrapper)
        return modalWrapper
    }
}

/* Toast */
export class Toast {
    constructor(stg) {
        const targetNode = document.querySelector(stg.target ?? 'body')
        // 要素を生成
        let toastWrapper = document.createElement('div')
        toastWrapper.className = 'toastWrapper'
        let toastNode = document.createElement('div')
        toastNode.className = 'toast'
        toastNode.innerHTML = stg.html
        // アニメーション
        const keyFrames = [
            { opacity: 0, top: '0px', offset: 0 },
            { opacity: 1, top: '60px', offset: 0.15 },
            { opacity: 1, top: '60px', offset: 0.85 },
            { opacity: 0, top: '0px', offset: 1 },
        ]
        const options = {
            duration: 2000,
        }
        const animation = toastNode.animate(keyFrames, options)
        // クリック時、アニメーション終了時に要素を削除する
        animation.onfinish = () => toastWrapper.remove()
        toastWrapper.onclick = () => toastWrapper.remove()
        // 要素を追加する
        toastWrapper.appendChild(toastNode)
        targetNode.appendChild(toastWrapper)
        return toastWrapper
    }
}
