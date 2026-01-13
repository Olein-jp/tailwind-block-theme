/**
 * tailwind-editor-live.js
 *
 * 目的:
 * - WordPress 6.9 のブロックエディター / サイトエディターの editor-canvas(iframe) 内に
 *   Tailwind Play CDN（@tailwindcss/browser@4）を注入して、
 *   「追加CSSクラス」に入力した Tailwind クラスを即時プレビューできるようにする。
 *
 * 使い方:
 * - functions.php で enqueue_block_editor_assets からこのJSを読み込む
 * - デバッグしたい時は URL に ?twdebug=1 を付ける
 *
 * 注意:
 * - エディターは iframe が差し替わるので「load のたびに注入」+「doc単位で再注入防止」
 */

(() => {
    const CDN_SRC = "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";

    // ?twdebug=1 のときだけログ
    const debug = new URLSearchParams(location.search).get("twdebug") === "1";
    const log = (...a) => debug && console.log("[tw-live]", ...a);

    // 注入済みドキュメントを保持（iframe差し替えで doc が変われば再注入される）
    const injectedDocs = new WeakSet();

    function getCanvasIframe() {
        return document.querySelector('iframe[name="editor-canvas"]');
    }

    /**
     * class の変化を検知したとき、軽い「再計算のきっかけ」を作る。
     * Tailwind の内部APIに依存しないよう、style を更新するだけに留める。
     */
    function attachClassObserver(iframe) {
        const doc = iframe.contentDocument;
        if (!doc?.documentElement || !doc?.head) return;

        // docごとに一度だけ付与
        if (doc.documentElement.dataset.twClassObs === "1") return;
        doc.documentElement.dataset.twClassObs = "1";

        const bump = () => {
            let st = doc.getElementById("tw-live-bump");
            if (!st) {
                st = doc.createElement("style");
                st.id = "tw-live-bump";
                doc.head.appendChild(st);
            }
            st.textContent = `/* bump ${Date.now()} */`;
        };

        const mo = new doc.defaultView.MutationObserver((muts) => {
            for (const m of muts) {
                if (m.type === "attributes" && m.attributeName === "class") {
                    bump();
                    break;
                }
            }
        });

        mo.observe(doc.documentElement, {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });

        log("class observer attached");
    }

    /**
     * editor-canvas(iframe) 内に Tailwind Play CDN を注入する
     */
    function injectInto(iframe) {
        try {
            const doc = iframe.contentDocument;
            if (!doc?.head) {
                log("no doc/head yet");
                return false;
            }

            // doc単位で多重注入を防止
            if (injectedDocs.has(doc)) {
                return true;
            }

            // すでにscriptがあるなら注入済み扱い
            const existing = doc.head.querySelector(`script[src="${CDN_SRC}"]`);
            if (existing) {
                injectedDocs.add(doc);
                // 念のため observer だけは付ける
                attachClassObserver(iframe);
                log("script already exists");
                return true;
            }

            const s = doc.createElement("script");
            s.src = CDN_SRC;

            s.addEventListener("load", () => {
                log("CDN loaded ✅");
                // CDNロード後に class 監視を付ける（差し替えにも追従）
                attachClassObserver(iframe);
            });

            s.addEventListener("error", (e) => {
                log("CDN failed ❌", e);
            });

            // head先頭に挿入（より確実）
            doc.head.insertBefore(s, doc.head.firstChild);

            injectedDocs.add(doc);
            log("injected");
            return true;
        } catch (e) {
            log("inject exception", e);
            return false;
        }
    }

    /**
     * load 後に少し待ってから注入（差し替え直後の canceled を減らす）
     */
    function scheduleInjectAfterLoad(iframe, delayMs = 300) {
        // 同じloadで多重スケジュールされないように
        if (iframe.dataset.twInjectScheduled === "1") return;
        iframe.dataset.twInjectScheduled = "1";

        setTimeout(() => {
            iframe.dataset.twInjectScheduled = "0";
            log("delayed inject after load");
            injectInto(iframe);
        }, delayMs);
    }

    /**
     * iframe にイベントを張って差し替えに追従
     */
    function bindToIframe(iframe) {
        if (iframe.dataset.twLiveBound === "1") return;
        iframe.dataset.twLiveBound = "1";

        iframe.addEventListener("load", () => {
            log("iframe load");
            scheduleInjectAfterLoad(iframe, 300);
        });

        // 初回は即注入せず少し待つ（差し替え負けを減らす）
        setTimeout(() => {
            log("initial delayed inject");
            injectInto(iframe);
        }, 500);

        log("bound to editor-canvas");
    }

    function boot() {
        const iframe = getCanvasIframe();
        if (!iframe) return false;
        bindToIframe(iframe);
        return true;
    }

    // editor-canvas が出るまで短時間待つ
    let tries = 0;
    const timer = setInterval(() => {
        if (boot() || ++tries > 80) clearInterval(timer);
    }, 250);

    // DOM上で iframe が差し替えられても追従
    const mo = new MutationObserver(() => {
        const iframe = getCanvasIframe();
        if (iframe) bindToIframe(iframe);
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
})();
