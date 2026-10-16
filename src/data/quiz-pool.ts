import type { QuizMunicipality } from '../types'
import { getMunicipality } from './municipalities'

interface PoolEntry {
  code: string
  difficulty: 1 | 2 | 3
  trivia: string
  triviaSource: QuizMunicipality['triviaSource']
}

/**
 * 出題対象の全 54 市町村。名称・よみ・地域は municipalities.ts（N03 と整合）から引き、
 * ここでは難易度と出典つきの豆知識だけを持つ。並び順は地方公共団体コード順。
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
    code: '12208', // 野田市
    difficulty: 2,
    trivia: '野田市では、えどじだいから しょうゆづくりが さかんで、キッコーマンが うまれたまちだよ！',
    triviaSource: { title: '野田市公式サイト 野田の醤油発祥地', url: 'https://www.city.noda.chiba.jp/kurashi/kyoiku/bunka/1000550/1003454/1000567.html', accessedAt: '2026-10-16' },
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
    code: '12213', // 東金市
    difficulty: 2,
    trivia: '東金市には、とくがわいえやすが たかがりに くるために つくられた「おなりかいどう」という みちがあるよ！',
    triviaSource: { title: '東金市公式サイト 東金市の概要', url: 'https://www.city.togane.chiba.jp/0000001335.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12215', // 旭市
    difficulty: 2,
    trivia: '旭市では、えどじだいから つづく いわしの「まるぼし」づくりが さかんで、つくる りょうは 日本一だよ！',
    triviaSource: { title: '旭市公式サイト 旭市市勢要覧2018 あさひブランド大集合', url: 'https://www.city.asahi.lg.jp/outline/guide/abland.html', accessedAt: '2026-10-16' },
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
    code: '12218', // 勝浦市
    difficulty: 2,
    trivia: '勝浦市は、えどじだいから つづく カツオの みなとで、「勝浦タンタンメン」も ゆうめいだよ！',
    triviaSource: { title: '勝浦市公式サイト 勝浦名物', url: 'https://www.city.katsuura.lg.jp/site/city-promotion/3885.html', accessedAt: '2026-10-16' },
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
    code: '12221', // 八千代市
    difficulty: 2,
    trivia: '八千代市の「やちよだいだんち」から、日本の おおきな じゅうたくだんちが はじまったよ！',
    triviaSource: { title: '八千代市公式サイト 八千代市の概要', url: 'https://www.city.yachiyo.lg.jp/soshiki/2/1014.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12222', // 我孫子市
    difficulty: 2,
    trivia: '我孫子市の てがぬまの ほとりには、日本で ゆいいつの とりせんもんの はくぶつかんが あるよ！',
    triviaSource: { title: '我孫子市公式サイト 鳥と自然', url: 'https://www.city.abiko.chiba.jp/miryoku/toritoshizen.html', accessedAt: '2026-10-16' },
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
    code: '12228', // 四街道市
    difficulty: 2,
    trivia: '四街道市の なまえは、4つの かいどうが まじわる じゅうじろに たつ せきとうから うまれたよ！',
    triviaSource: { title: '四街道市公式サイト 四街道地名発祥の地', url: 'https://www.city.yotsukaido.chiba.jp/miryoku/smile/rekishi_bunkazai/history/yotsuchimei.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12229', // 袖ケ浦市
    difficulty: 2,
    trivia: '袖ケ浦市の なまえは、おひめさまの きものの そでが ながれついたという いいつたえから ついたよ！',
    triviaSource: { title: '袖ケ浦市公式サイト 市の紹介（プロフィール、人口など）', url: 'https://www.city.sodegaura.lg.jp/soshiki/promotion/si-shoukai.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12230', // 八街市
    difficulty: 2,
    trivia: '八街市は らっかせい（ピーナッツ）の さんちで、とれる りょうは 日本いちだよ！',
    triviaSource: { title: '八街市公式サイト 八街市の紹介', url: 'https://www.city.yachimata.lg.jp/site/iju/21274.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12231', // 印西市
    difficulty: 2,
    trivia: '印西市の「よしたかのおおざくら」は、じゅれい 500ねん いじょうと いわれる おおきな ヤマザクラだよ！',
    triviaSource: { title: '印西市公式サイト 吉高の大桜', url: 'https://www.city.inzai.lg.jp/0000005081.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12232', // 白井市
    difficulty: 3,
    trivia: '白井市は なしの さんちで、なしを つくる はたけの ひろさは 千葉県で いちばんだよ！',
    triviaSource: { title: '白井市公式サイト 白井市について', url: 'https://www.city.shiroi.chiba.jp/soshiki/seisaku/s07/hisyo011/miryoku04/1421160963557.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12233', // 富里市
    difficulty: 3,
    trivia: '富里市は すいかが ゆうめいで、日本で はじめて「すいかじょうれい」を つくったよ！',
    triviaSource: { title: '富里市公式サイト 富里といえば・・・すいか！', url: 'https://www.city.tomisato.lg.jp/0000012162.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12234', // 南房総市
    difficulty: 1,
    trivia: '南房総市は、三ほうを うみに かこまれていて、びわや 花が たくさん とれるよ！',
    triviaSource: { title: '南房総市公式サイト 位置・地勢', url: 'https://www.city.minamiboso.chiba.jp/0000001219.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12235', // 匝瑳市
    difficulty: 3,
    trivia: '匝瑳市は、うえきを そだてる はたけの ひろさが 日本ゆうすうの「うえきのまち」だよ！',
    triviaSource: { title: '匝瑳市公式サイト 日本有数の植木のまち', url: 'https://www.city.sosa.lg.jp/page/page000906.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12236', // 香取市
    difficulty: 2,
    trivia: '香取市には、日本で はじめて そくりょうして 日本ちずを つくった「いのうただたか」の いえが のこっているよ！',
    triviaSource: { title: '香取市公式サイト 香取市の概要・なりたち', url: 'https://www.city.katori.lg.jp/government/profile/profile.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12237', // 山武市
    difficulty: 2,
    trivia: '山武市には 20けん いじょうの いちごえんがあって、12がつから 5がつまで いちごがりが できるよ！',
    triviaSource: { title: '山武市公式サイト いちご狩り', url: 'https://www.city.sammu.lg.jp/kankou/kankou-info/page001158.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12238', // いすみ市
    difficulty: 2,
    trivia: 'いすみ市の うみの いわばでは、イセエビや タコ、サザエ、アワビが そだっているよ！',
    triviaSource: { title: 'いすみ市公式サイト 魅力サイト', url: 'https://www.city.isumi.lg.jp/miryoku/index.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12239', // 大網白里市
    difficulty: 2,
    trivia: '大網白里市は、くろいちごと よばれる いちご「しんくのみすず」が うまれた まちだよ！',
    triviaSource: { title: '大網白里市公式サイト 大網白里市の特産品', url: 'https://www.city.oamishirasato.lg.jp/0000006619.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12322', // 酒々井町
    difficulty: 3,
    trivia: '酒々井町の なまえは、いどの みずが おさけに なったという でんせつから ついたよ！',
    triviaSource: { title: '酒々井町公式サイト 町名の由来', url: 'https://www.town.shisui.chiba.jp/docs/2014021803876/', accessedAt: '2026-10-16' },
  },
  {
    code: '12329', // 栄町
    difficulty: 3,
    trivia: '栄町には、しかくい こふんとして 日本さいだいきゅうの「いわやこふん」があるよ！',
    triviaSource: { title: '栄町公式サイト 地勢と歴史', url: 'https://www.town.sakae.chiba.jp/chosei/profile/page000063.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12342', // 神崎町
    difficulty: 3,
    trivia: '神崎町には、みとこうもんが なまえを たずねたと つたわる 大きな木「なんじゃもんじゃの木」があるよ！',
    triviaSource: { title: '神崎町公式サイト 歴史・文化財', url: 'https://www.town.kozaki.chiba.jp/kanko_iju/kanko/history.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12347', // 多古町
    difficulty: 3,
    trivia: '多古町の まんなかを ながれる くりやまがわの まわりは、おこめ「たこまい」の さんちだよ！',
    triviaSource: { title: '多古町公式サイト 町の概要', url: 'https://www.town.tako.chiba.jp/docs/2017121400082/', accessedAt: '2026-10-16' },
  },
  {
    code: '12349', // 東庄町
    difficulty: 3,
    trivia: '東庄町の「町のとり」は、とねがわの アシはらに すむ せかいてきに めずらしい「コジュリン」だよ！',
    triviaSource: { title: '東庄町公式サイト 東庄町の概要', url: 'https://www.town.tohnosho.chiba.jp/gyoseijoho/tonoshomachinogaiyo/2041.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12403', // 九十九里町
    difficulty: 3,
    trivia: '九十九里町は、日本で はじめて じっそくの 日本ちずを つくった「いのうただたか」が うまれた まちだよ！',
    triviaSource: { title: '九十九里町公式サイト 伊能忠敬記念公園', url: 'https://www.town.kujukuri.chiba.jp/0000000336.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12409', // 芝山町
    difficulty: 3,
    trivia: '芝山町には、「ぼうそうの こふんと はにわ」が テーマの はくぶつかんが あるよ！',
    triviaSource: { title: '芝山町公式サイト 芝山古墳・はにわ博物館', url: 'https://www.town.shibayama.lg.jp/0000001678.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12410', // 横芝光町
    difficulty: 3,
    trivia: '横芝光町には、ここでしか 見られないと いわれる おにの げき「きらいごう」が あるよ！',
    triviaSource: { title: '横芝光町公式サイト 横芝光町ってどんなところ？', url: 'https://www.town.yokoshibahikari.chiba.jp/site/yokoshibahikari-navi/8700.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12421', // 一宮町
    difficulty: 3,
    trivia: '一宮町の「つりがさきかいがん」では、とうきょう2020オリンピックの サーフィンが おこなわれたよ！',
    triviaSource: { title: '一宮町公式サイト サーフィン競技の結果について', url: 'https://www.town.ichinomiya.chiba.jp/kankou/411/22.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12422', // 睦沢町
    difficulty: 3,
    trivia: '睦沢町は、じめんの 下に たくさんの てんねんガスが うまっているのが とくちょうだよ！',
    triviaSource: { title: '睦沢町公式サイト 町のプロフィール', url: 'https://www.town.mutsuzawa.chiba.jp/chousei/shoukai/profile/profile.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12423', // 長生村
    difficulty: 3,
    trivia: '長生村は、千葉県のなかで ただひとつしかない「むら」だよ！',
    triviaSource: { title: '長生村公式移住・定住応援サイト LONG and LIVE', url: 'https://longandlive.com/living/', accessedAt: '2026-10-16' },
  },
  {
    code: '12424', // 白子町
    difficulty: 3,
    trivia: '白子町の「しらこたまねぎ」は、フルーツのように あまくて、4がつの おわりから 5がつにしか とれないよ！',
    triviaSource: { title: '白子町公式サイト 白子町の特産野菜', url: 'https://www.town.shirako.lg.jp/0000001324.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12426', // 長柄町
    difficulty: 3,
    trivia: '長柄町は、ぼうそうはんとうの まんなかに あって、「千葉県の おへそ」と よばれているよ！',
    triviaSource: { title: '長柄町公式サイト 知る（ながらリゾートコミュニティー）', url: 'https://www.town.nagara.chiba.jp/site/naga-life/1905.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12427', // 長南町
    difficulty: 3,
    trivia: '長南町の「かさもりかんのんどう」は、大きな いわの 上に たつ 日本で ただひとつの つくりだよ！',
    triviaSource: { title: '長南町公式サイト 笠森観音堂（国指定重要文化財）', url: 'https://www.town.chonan.chiba.jp/shoukai/kankou/509/', accessedAt: '2026-10-16' },
  },
  {
    code: '12441', // 大多喜町
    difficulty: 2,
    trivia: '大多喜町は、とくがわしてんのうの ひとり「ほんだただかつ」が 大多喜じょうを たてた まちだよ！',
    triviaSource: { title: '大多喜町公式サイト 房総の小江戸大多喜', url: 'https://www.town.otaki.chiba.jp/kanko_iju_bunka/kanko_iju/kanko_jyouho/5/1/1485.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12443', // 御宿町
    difficulty: 3,
    trivia: '御宿町では、1609ねんに スペインの ふねが ざしょうし、むらの 人が 317にんの いのちを たすけたよ！',
    triviaSource: { title: '御宿町公式サイト メキシコ記念公園（日西墨三国交通発祥記念之碑）', url: 'https://www.town.onjuku.chiba.jp/sub4/3/mexico_kinentou1.html', accessedAt: '2026-10-16' },
  },
  {
    code: '12463', // 鋸南町
    difficulty: 3,
    trivia: '鋸南町の なまえは、「のこぎりやま」という やまの みなみに あることから つけられたよ！',
    triviaSource: { title: '鋸南町公式サイト 鋸南町の紹介', url: 'https://www.town.kyonan.chiba.jp/soshiki/6/1541.html', accessedAt: '2026-10-16' },
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
