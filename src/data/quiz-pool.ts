import type { QuizMunicipality } from '../types'
import { getMunicipality } from './municipalities'

interface PoolEntry {
  code: string
  difficulty: 1 | 2 | 3
  trivia: string
  triviaSource: QuizMunicipality['triviaSource']
}

/**
 * MVP の出題対象 20 市。名称・よみ・地域は municipalities.ts（N03 と整合）から引き、
 * ここでは難易度と出典つきの豆知識だけを持つ。54 市町村への拡張はこの配列に追加するだけでよい。
 */
const POOL: readonly PoolEntry[] = [
  {
    code: '12100', // 千葉市
    difficulty: 1,
    trivia: '千葉市には、日本さいだいきゅうの かいづか「かそりかいづか」があるよ！',
    triviaSource: { title: '千葉市立加曽利貝塚博物館 加曽利貝塚について（概要）', url: 'https://www.city.chiba.jp/kasori/infomation/overview/kasori_index.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12202', // 銚子市
    difficulty: 1,
    trivia: '銚子市の「いぬぼうさき」は、やまや しまを のぞいて 日本で いちばん はやく はつ日の出が 見られるよ！',
    triviaSource: { title: '銚子市公式サイト 観光', url: 'https://www.city.choshi.chiba.jp/kanko/index.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12203', // 市川市
    difficulty: 2,
    trivia: '市川市は なしのまちで、「市川のなし」という ブランドがあるよ！',
    triviaSource: { title: '市川市公式サイト ココがイイよ！いちかわ！ 食・特産', url: 'https://www.city.ichikawa.lg.jp/site/iiyo-ichikawa/30044.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12204', // 船橋市
    difficulty: 2,
    trivia: '船橋市には、花とみどりが いっぱいの「ふなばしアンデルセンこうえん」があるよ！',
    triviaSource: { title: '船橋市公式サイト ふなばしアンデルセン公園 施設紹介', url: 'https://www.city.funabashi.lg.jp/loca/location/001/p036558.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12205', // 館山市
    difficulty: 1,
    trivia: '館山市は、あたたかくて ふゆでも 花が さく「うみと花のまち」だよ！',
    triviaSource: { title: '館山市公式サイト ようこそ！館山へ', url: 'https://www.city.tateyama.chiba.jp/welcome.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12206', // 木更津市
    difficulty: 1,
    trivia: '木更津市は うみの まちで、はるになると しおひがりが たのしめるよ！',
    triviaSource: { title: '木更津市公式サイト 木更津の魅力', url: 'https://www.city.kisarazu.lg.jp/kanko_bunka_sports/8033.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12207', // 松戸市
    difficulty: 2,
    trivia: '松戸市は、「二十せいきなし」という なしが 生まれた まちだよ！',
    triviaSource: { title: '松戸市公式サイト 松戸が二十世紀梨発祥の地です', url: 'https://www.city.matsudo.chiba.jp/miryoku/kankoumiryokubunka/meibutsu/20seikinashihassyou.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12210', // 茂原市
    difficulty: 2,
    trivia: '茂原市は、じめんの 下から 出る「てんねんガス」で まちが 大きく はってんしたよ！',
    triviaSource: { title: '茂原市公式サイト（シティプロモーション） 茂原市の歴史', url: 'https://www.city.mobara.chiba.jp/promotion/0000001347.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12211', // 成田市
    difficulty: 1,
    trivia: '成田市には、日本の そらの げんかんぐち「成田こくさいくうこう」があるよ！',
    triviaSource: { title: '成田市公式サイト 成田市ってどんなまち', url: 'https://www.city.narita.chiba.jp/shisei/page007400.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12212', // 佐倉市
    difficulty: 2,
    trivia: '佐倉市の「佐倉じょうし」は、千葉県で ただひとつの「日本100名城」だよ！',
    triviaSource: { title: '佐倉市公式サイト 佐倉城址のさくら', url: 'https://www.city.sakura.lg.jp/soshiki/sakuranomiryoku/event_kanko/3451.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12216', // 習志野市
    difficulty: 3,
    trivia: '習志野市の「やつひがた」は、日本で はじめて ラムサールじょうやくに とうろくされた ひがただよ！',
    triviaSource: { title: '習志野市公式サイト 谷津干潟がラムサール条約登録30周年を迎えました', url: 'https://www.city.narashino.lg.jp/soshiki/kankyohozen/gyomu/yatuhigata/2508_20181210170052006.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12217', // 柏市
    difficulty: 2,
    trivia: '柏市は、かぶ・ねぎ・ほうれんそうが たくさん とれる やさいの まちだよ！',
    triviaSource: { title: '柏市公式サイト 柏の農産物', url: 'https://www.city.kashiwa.lg.jp/nosei/nousanbutu/kashiwanousanbutu.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12219', // 市原市
    difficulty: 1,
    trivia: '市原市の「ようろうけいこく」は、かんとうで いちばん おそく こうようが 見られるよ！',
    triviaSource: { title: '市原市公式サイト いちはら学 市原市の観光スポット', url: 'https://www.city.ichihara.chiba.jp/ichiharagaku/pageindices/index64.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12220', // 流山市
    difficulty: 3,
    trivia: '流山市は「しろみりん」が 生まれた まちで、しろみりんミュージアムが あるよ！',
    triviaSource: { title: '流山市公式サイト 白みりんミュージアムがオープンしました', url: 'https://www.city.nagareyama.chiba.jp/tourism/1013041/1049110.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12223', // 鴨川市
    difficulty: 2,
    trivia: '鴨川市には、うみの王者シャチに 会える「鴨川シーワールド」があるよ！',
    triviaSource: { title: '鴨川市公式観光サイト 海の世界との出会い「鴨川シーワールド」', url: 'https://www.city.kamogawa.lg.jp/site/kamogawa-kanko/852.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12224', // 鎌ケ谷市
    difficulty: 3,
    trivia: '鎌ケ谷市では、えどじだいの おわりから なしを そだてているよ！',
    triviaSource: { title: '鎌ケ谷市公式サイト 市の紹介 特産物', url: 'https://www.city.kamagaya.chiba.jp/sesakumidashi/shigaiyou_menu/tokusanbutsu.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12225', // 君津市
    difficulty: 2,
    trivia: '君津市の「かめやまこ」は、千葉県で いちばん 大きな ダムこだよ！',
    triviaSource: { title: '君津市公式観光サイト きみつの観光（秋のみどころ 亀山湖）', url: 'https://www.city.kimitsu.lg.jp/site/kanko/', accessedAt: '2026-10-16' },
  },
  {
    code: '12226', // 富津市
    difficulty: 2,
    trivia: '富津市の「富津みさき」は、「かんとうの あまのはしだて」と いわれているよ！',
    triviaSource: { title: '富津市公式サイト 市の紹介', url: 'https://www.city.futtsu.lg.jp/0000000526.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12227', // 浦安市
    difficulty: 3,
    trivia: '浦安市は むかし りょうしの まちで、いまは せかいてきに ゆうめいな ゆうえんちが あるよ！',
    triviaSource: { title: '浦安市公式サイト 【おいでよ浦安】東京ディズニーリゾート', url: 'https://www.city.urayasu.lg.jp/shisei/profile/oideyo/resort/1001514.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12234', // 南房総市
    difficulty: 1,
    trivia: '南房総市は、三ほうを うみに かこまれていて、びわや 花が たくさん とれるよ！',
    triviaSource: { title: '南房総市公式サイト 位置・地勢', url: 'https://www.city.minamiboso.chiba.jp/0000001219.html', accessedAt: '2026-10-16' },
  },
]

export const QUIZ_POOL: readonly QuizMunicipality[] = POOL.map((entry) => ({
  ...getMunicipality(entry.code),
  difficulty: entry.difficulty,
  trivia: entry.trivia,
  triviaSource: entry.triviaSource,
}))

export const QUIZ_POOL_BY_CODE: ReadonlyMap<string, QuizMunicipality> = new Map(
  QUIZ_POOL.map((m) => [m.code, m]),
)
