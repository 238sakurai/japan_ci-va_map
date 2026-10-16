import type { ReactNode } from 'react'
import { useApp } from '../app/AppContext'
import { Card } from '../components/ui/Card'
import { IconButton } from '../components/ui/IconButton'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Card className="p-4">
    <h3 className="text-base font-black">{title}</h3>
    <div className="mt-1 space-y-1 text-sm leading-relaxed">{children}</div>
  </Card>
)

/** 外部サイトは新しいタブで開く（ゲームの状態を失わないため） */
const Link = ({ href, children }: { href: string; children: ReactNode }) => (
  <a className="font-bold text-ink underline underline-offset-2" href={href} target="_blank" rel="noreferrer noopener">
    {children} ↗
  </a>
)

export function AboutScreen({ onBack }: { onBack: () => void }) {
  const { geo } = useApp()
  return (
    <div className="safe-pad mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-3 pb-6" data-testid="about-screen">
      <div className="flex items-center gap-2 pt-1">
        <IconButton label="タイトルへもどる" onClick={onBack} data-testid="back-button">←</IconButton>
        <h2 className="text-2xl font-black">このゲームについて</h2>
      </div>

      <Section title="チーバくんのど〜こだ？">
        <p>千葉県の形をした地図をタップして、千葉県の 54 市町村を楽しく覚える地理クイズゲームです。</p>
        <p className="font-bold">このゲームは千葉県の公式アプリではありません。個人が制作した非公式の学習ゲームです。</p>
      </Section>

      <Section title="地図データの出典">
        <p>
          <Link href={geo?.source.url ?? 'https://nlftp.mlit.go.jp/ksj/'}>国土数値情報（行政区域データ）</Link>
          （国土交通省）{geo && <>（{geo.source.referenceDate} 時点）</>}を加工して作成しています。
        </p>
        <p className="text-xs text-ink-soft">
          政令市の区を市に統合し、投影・境界の単純化・小さな離島の除去を行っているため、実際の境界とは細部が異なります。
        </p>
      </Section>

      <Section title="まめちしきの出典">
        <p>各市町村の公式サイトの記述にもとづいています。出典は、こたえのカードと「ちばずかん」の各カードからリンクしています。</p>
        <p className="text-xs text-ink-soft">内容は確認した時点のものです。最新の情報は各市町村の公式サイトで確認してください。</p>
      </Section>

      <Section title="チーバくんについて">
        <p>
          「チーバくん」は千葉県のマスコットキャラクターです。公式のイラスト・画像を使うには千葉県の使用許諾が必要なため、このゲームでは使用していません。
          地図の形は公的データから描いたもので、案内役の「ピーちゃん」はこのゲームのオリジナルです。
        </p>
        <p>
          <Link href="https://www.pref.chiba.lg.jp/kouhou/miryoku/chi-ba-kun/index.html">チーバくんの広場（千葉県公式）</Link>
        </p>
      </Section>

      <Section title="プライバシー">
        <p>
          名前・住所・位置情報などの個人情報は収集しません。ハイスコアや「ちばずかん」の進み具合、音の設定は、この端末のブラウザ（localStorage）の中だけに保存され、外部には送信されません。アクセス解析ツールも使っていません。
        </p>
      </Section>

      <Section title="免責事項">
        <p>
          ゲーム内の情報は学習用です。正確さには気をつけていますが、内容を保証するものではありません。このゲームの利用によって生じた損害について、制作者は責任を負いません。
        </p>
      </Section>

      <Section title="ライセンス">
        <p>プログラムは MIT ライセンスで公開しています。フォントは Zen Maru Gothic（SIL Open Font License 1.1）、効果音は Web Audio API で合成した自作音です。</p>
        <p>
          <Link href="https://github.com/238sakurai/japan_ci-va_map">ソースコード（GitHub）</Link>
        </p>
      </Section>
    </div>
  )
}
