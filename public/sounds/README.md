# 効果音について

効果音はすべて Web Audio API で合成しています（`src/lib/audio.ts`）。音声ファイルは使用していません。
音声素材を追加する場合はこのフォルダに置き、`import.meta.env.BASE_URL + 'sounds/...'` で参照してください。
