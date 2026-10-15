import { useApp } from '../app/AppContext'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'
import { Button } from '../components/ui/Button'

export function HowToScreen({ onBack, onPlay }: { onBack: () => void; onPlay: () => void }) {
  const { geo } = useApp()
  return (
    <div className="safe-pad mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3" data-testid="howto-screen">
      <div className="flex items-center gap-2 pt-1">
        <IconButton label="タイトルへもどる" onClick={onBack}>←</IconButton>
        <h2 className="text-2xl font-black">あそびかた</h2>
      </div>

      <Card tone="mint" className="p-4">
        <h3 className="text-lg font-black">🗺️ かんたん「どこにあるかな？」</h3>
        <p className="mt-1 text-sm leading-relaxed">
          市の名前が出るよ。千葉県の地図（チーバくんの体）の中から、その市をさがしてタップ！
          もういちど同じところをタップするか「ここで けってい！」で こたえになるよ。3かいまで こたえられるよ。
        </p>
      </Card>
      <Card tone="sky" className="p-4">
        <h3 className="text-lg font-black">✨ ふつう「ここは何市？」</h3>
        <p className="mt-1 text-sm leading-relaxed">
          地図の どこかが 黄色く ひかるよ。4つの名前から、ひかっている市を えらぼう！
          れんぞくで せいかいすると ボーナスてんが もらえるよ。
        </p>
      </Card>
      <Card tone="cream" className="p-4">
        <h3 className="text-lg font-black">⏱️ チャレンジ「千葉県マスター！」</h3>
        <p className="mt-1 text-sm leading-relaxed">
          60びょうの タイムアタック！ 地図タップと 4たくが まざって出るよ。
          できるだけ たくさん こたえて ハイスコアを めざそう。
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-black">🔍 地図の そうさ</h3>
        <ul className="mt-1 list-disc space-y-1 pl-5 text-sm leading-relaxed">
          <li>小さい市は「＋」ボタンや 2本ゆびで 大きくできるよ</li>
          <li>大きくしたら ゆびで うごかせるよ。「⟲」で もとにもどる</li>
          <li>💡ヒントを つかうと ボーナスは なしになるよ</li>
          <li>せいかいした市は「ちばずかん」に とうろくされるよ</li>
        </ul>
      </Card>

      <Button size="lg" onClick={onPlay} className="mx-auto w-full max-w-xs">あそぶ！</Button>

      <section className="mt-2 rounded-3xl bg-white/70 p-4 text-[11px] leading-relaxed text-ink-soft">
        <h3 className="text-sm font-black text-ink">出典・クレジット</h3>
        <p>
          市町村の境界: 「国土数値情報（行政区域データ）」（国土交通省）
          {geo && <>（{geo.source.referenceDate} 時点、{geo.source.file}）</>}を加工して作成。
          <a className="underline" href="https://nlftp.mlit.go.jp/ksj/" target="_blank" rel="noreferrer noopener">nlftp.mlit.go.jp/ksj</a>
        </p>
        <p className="mt-1">まめちしきは 各市の公式サイトの記述にもとづいています（各カードに出典リンクあり）。</p>
        <p className="mt-1">
          このアプリは千葉県の公式ではなく、公式キャラクターのイラストは使っていません。地図の形は公的データから描いています。
        </p>
      </section>
    </div>
  )
}
