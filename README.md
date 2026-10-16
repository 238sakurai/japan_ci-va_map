# チーバくんのど〜こだ？

**千葉県まるごと！ご当地タップクイズ** — チーバくんの体（千葉県の形）をタップして、千葉県の市町村を楽しく覚えるブラウザゲームです。

- 対象: 小学生（保護者・教職員・千葉県民・地理好きの大人も）
- 完全な静的 Web アプリ（サーバー・ログイン・外部 API 不要、スマホ対応）
- 公開 URL: https://238sakurai.github.io/japan_ci-va_map/

> **注意**: 公式のチーバくん画像は含んでいません。利用には千葉県の許諾が必要です。[docs/chibakun-usage-notes.md](docs/chibakun-usage-notes.md) を参照してください。

## あそびかた

| モード | 内容 | ルール |
| --- | --- | --- |
| かんたん「どこにあるかな？」 | 市町村の名前を見て地図をタップ | 10問 / 3回まで回答 / ヒントあり（地域を光らせる） |
| ふつう「ここは何市？」 | 光っている場所の市町村名を4択から選ぶ | 10問 / 1回回答 / ヒントあり（選択肢を2つ消す） / 連続正解ボーナス |
| チャレンジ「千葉県マスター！」 | 60秒タイムアタック（地図タップと4択が混在） | 制限時間内に何問でも / コンボ / ハイスコア保存 |

- 正解 100 点。2 問目以降の連続正解で +20 点ずつ（最大 +100）。ヒント使用や 2 回目以降の正解はボーナスなし。
- 称号（10問モード）: 0〜3問 ちばたまご / 4〜6問 ちばたんけんか / 7〜9問 ちばものしり博士 / 10問 チーバくんマスター！
- 称号（チャレンジ）: スコア 1000 / 2000 / 3000 点でランクアップ。
- 正解した市町村は「ちばずかん」に登録され、地図がカラフルになっていきます（出題対象は千葉県の 54 市町村すべて）。
- 地図は「＋／－」ボタン、ピンチ、マウスホイールで拡大できます。かんたんモードはタップ → 「ここで けってい！」の 2 段階で誤タップを防ぎます。

## 技術スタック

Vite / React 19 / TypeScript (strict) / Tailwind CSS v4 / Motion / SVG / TopoJSON / Web Audio API / localStorage / Vitest / Playwright / GitHub Actions / GitHub Pages

## ディレクトリ構成

```text
├── .github/workflows/deploy.yml   # 型チェック → 単体テスト → ビルド → Pages デプロイ
├── public/
│   ├── data/chiba-municipalities.json  # ゲーム用の市町村ポリゴン（生成物、コミット済み）
│   ├── images/                         # 許諾済み画像を置く場所（README 参照）
│   └── sounds/                         # 音声素材用（現在は未使用、効果音は合成）
├── scripts/
│   ├── fetch-n03.mjs       # 国土数値情報 N03 のダウンロード
│   ├── build-geo.mjs       # 投影・単純化してゲーム用 JSON を生成
│   ├── build-ogp.mjs       # SNS シェア用のアイキャッチ画像（public/og-image.png）を生成
│   ├── build-fonts.mjs     # 使用文字だけのフォントサブセット CSS を生成
│   └── validate-data.mjs   # 生成データの検証
├── src/
│   ├── app/          # App（画面遷移）、AppContext、モード設定
│   ├── components/   # game（HUD・選択肢・フィードバック）/ map（SVG 地図）/ ui / effects
│   ├── screens/      # タイトル・あそびかた・モード選択・クイズ・結果・ちばずかん
│   ├── data/         # 54 市町村マスタ、出題プール（54 市町村の豆知識・出典）、地域区分、称号
│   ├── lib/          # 純粋ロジック: geo（当たり判定・座標変換）、quiz、engine、scoring、storage、timer、share、audio
│   ├── hooks/        # データ読み込み・保存・カウントダウン
│   ├── config/       # キャラクター画像レイヤー設定
│   └── styles/       # Tailwind テーマ・共通スタイル
├── tests/unit/       # Vitest
├── tests/e2e/        # Playwright（PC / iPhone 13）
└── docs/             # チーバくん利用条件の調査メモ
```

ゲームの処理（`src/lib`）は React に依存しない純粋関数で、画面（`src/screens`, `src/components`）と分離しています。

## ローカル起動

```bash
npm ci
npm run dev
```

`http://localhost:5173/japan_ci-va_map/` で開きます（base パスはリポジトリ名に合わせて `vite.config.ts` の既定値を変更してください）。

## ビルド

```bash
npm run typecheck
npm run build
npm run preview
```

`BASE_PATH=/ npm run build` のようにすると、ルート公開用（`<user>.github.io` リポジトリ）のビルドになります。

### アイキャッチ画像（OGP）

SNS でシェアしたときの画像は `public/og-image.png`（1200×630）です。地図の色や文言を変えたら再生成してコミットしてください。

```bash
npx playwright install chromium   # 初回のみ
npm run ogp
```

`og:image` などの絶対 URL は、ビルド時に `index.html` の `%SITE_URL%` を公開 URL に置き換えて作ります。独自ドメインで公開するときは `SITE_URL=https://example.com/ npm run build` のように指定します。

## テスト

```bash
npm test                      # 単体テスト（データ整合性、当たり判定、出題、採点、保存など）
npx playwright install chromium
npm run test:e2e              # E2E（ビルド → preview サーバー起動 → PC Chrome / Pixel 7 相当のモバイルで実行）
```

E2E では `?seed=<数値>` で出題順を固定しています。

## GitHub Pages への公開

1. リポジトリの **Settings → Pages → Build and deployment → Source** を **GitHub Actions** にする。
2. `main` ブランチに push する（または Actions タブから `Deploy to GitHub Pages` を手動実行する）。
3. ワークフローが型チェック → 単体テスト → ビルド → デプロイを行う。
4. 公開 URL は https://238sakurai.github.io/japan_ci-va_map/ （リポジトリを変えたときはこの README を書き換える）。

### 公開 URL（base パス）の設定

- GitHub Actions 上では `GITHUB_REPOSITORY` からリポジトリ名を読み、`/<リポジトリ名>/` を base にします。`<ユーザー名>.github.io` という名前のリポジトリなら自動で `/` になります。
- 任意の値にしたいときは、ワークフローの Build ステップに `env: BASE_PATH: /任意のパス/` を追加します。
- ローカル既定値は `vite.config.ts` の `resolveBasePath` にあります。

### デプロイ後の確認事項

- [ ] タイトル画面が表示され、地図（`data/chiba-municipalities.json`）が読み込まれる
- [ ] ブラウザの開発者ツールで 404 がない（CSS / JS / フォント / JSON / favicon）
- [ ] スマートフォンでタップ位置と判定がずれない
- [ ] リロードしても「ちばずかん」の進捗とハイスコアが残る
- [ ] 画面遷移は React の状態管理のみ（URL が変わらない）なので、どの状態でリロードしても 404 にならない

## 地理データ

- 出典: 国土数値情報 行政区域データ（N03）国土交通省 https://nlftp.mlit.go.jp/ksj/
- 基準日: **2024年1月1日**（`N03-20240101_12`）
- 加工: 政令市の区を市に統合、所属未定地を除外、Web メルカトル投影、境界の単純化、小離島の除去
- 再生成:

```bash
npm run data:fetch      # data/raw/n03 にダウンロード（git 管理外）
npm run data:geo        # public/data/chiba-municipalities.json を生成
npm run data:validate   # 件数・隣接関係などを検証
```

生成物は小さい（約 130 KB）ためコミットしており、CI でのダウンロードは不要です。

## キャラクター素材の利用条件

- 公式のチーバくんのイラストは**千葉県への事前申込と許諾が必要**です。県のガイドマニュアルには「ゲーム」への新規使用は不可と記載されています（調査メモ: [docs/chibakun-usage-notes.md](docs/chibakun-usage-notes.md)）。
- このリポジトリは公式画像を含まず、公的な地理データから描いた千葉県の形と、オリジナルのマスコット「ピーちゃん」（落花生）だけで構成しています。
- 許諾が得られた場合は `public/images/` に画像を置き、`src/config/character.ts` の `officialImage` を設定すると地図のキャラクターレイヤーに表示されます。
- 名称「チーバくん」をタイトルに使うことについても、県への確認を推奨します。

## 今後の拡張計画

- 「町・村だけ」「地域別」などの出題フィルタ
- 図鑑のコンプリート報酬（称号バッジ、壁紙）
- 文字の読み上げ（Web Speech API）
- PWA 化（オフラインで遊べるようにする）
- 多言語対応（英語）

## ライセンス

MIT（[LICENSE](LICENSE)）。データ・素材の出典は [NOTICE.md](NOTICE.md) を参照してください。
