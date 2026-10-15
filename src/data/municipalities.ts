import type { LgCode, MunicipalityBase } from '../types'

/**
 * 千葉県の全54市町村（2024年1月1日時点）。
 * code は地方公共団体コード（都道府県コード 12 + 3桁、チェックディジットなし）で、
 * 国土数値情報 N03 の N03_007 と一致する。
 */
export const MUNICIPALITIES: readonly MunicipalityBase[] = [
  { id: 'chiba', code: '12100', name: '千葉市', kana: 'ちばし', kind: 'city', region: 'chiba' },
  { id: 'choshi', code: '12202', name: '銚子市', kana: 'ちょうしし', kind: 'city', region: 'kaiso' },
  { id: 'ichikawa', code: '12203', name: '市川市', kana: 'いちかわし', kind: 'city', region: 'katsunan' },
  { id: 'funabashi', code: '12204', name: '船橋市', kana: 'ふなばしし', kind: 'city', region: 'katsunan' },
  { id: 'tateyama', code: '12205', name: '館山市', kana: 'たてやまし', kind: 'city', region: 'awa' },
  { id: 'kisarazu', code: '12206', name: '木更津市', kana: 'きさらづし', kind: 'city', region: 'kimitsu' },
  { id: 'matsudo', code: '12207', name: '松戸市', kana: 'まつどし', kind: 'city', region: 'higashikatsushika' },
  { id: 'noda', code: '12208', name: '野田市', kana: 'のだし', kind: 'city', region: 'higashikatsushika' },
  { id: 'mobara', code: '12210', name: '茂原市', kana: 'もばらし', kind: 'city', region: 'chosei' },
  { id: 'narita', code: '12211', name: '成田市', kana: 'なりたし', kind: 'city', region: 'inba' },
  { id: 'sakura', code: '12212', name: '佐倉市', kana: 'さくらし', kind: 'city', region: 'inba' },
  { id: 'togane', code: '12213', name: '東金市', kana: 'とうがねし', kind: 'city', region: 'sanbu' },
  { id: 'asahi', code: '12215', name: '旭市', kana: 'あさひし', kind: 'city', region: 'kaiso' },
  { id: 'narashino', code: '12216', name: '習志野市', kana: 'ならしのし', kind: 'city', region: 'katsunan' },
  { id: 'kashiwa', code: '12217', name: '柏市', kana: 'かしわし', kind: 'city', region: 'higashikatsushika' },
  { id: 'katsuura', code: '12218', name: '勝浦市', kana: 'かつうらし', kind: 'city', region: 'isumi' },
  { id: 'ichihara', code: '12219', name: '市原市', kana: 'いちはらし', kind: 'city', region: 'ichihara' },
  { id: 'nagareyama', code: '12220', name: '流山市', kana: 'ながれやまし', kind: 'city', region: 'higashikatsushika' },
  { id: 'yachiyo', code: '12221', name: '八千代市', kana: 'やちよし', kind: 'city', region: 'katsunan' },
  { id: 'abiko', code: '12222', name: '我孫子市', kana: 'あびこし', kind: 'city', region: 'higashikatsushika' },
  { id: 'kamogawa', code: '12223', name: '鴨川市', kana: 'かもがわし', kind: 'city', region: 'awa' },
  { id: 'kamagaya', code: '12224', name: '鎌ケ谷市', kana: 'かまがやし', kind: 'city', region: 'higashikatsushika' },
  { id: 'kimitsu', code: '12225', name: '君津市', kana: 'きみつし', kind: 'city', region: 'kimitsu' },
  { id: 'futtsu', code: '12226', name: '富津市', kana: 'ふっつし', kind: 'city', region: 'kimitsu' },
  { id: 'urayasu', code: '12227', name: '浦安市', kana: 'うらやすし', kind: 'city', region: 'katsunan' },
  { id: 'yotsukaido', code: '12228', name: '四街道市', kana: 'よつかいどうし', kind: 'city', region: 'inba' },
  { id: 'sodegaura', code: '12229', name: '袖ケ浦市', kana: 'そでがうらし', kind: 'city', region: 'kimitsu' },
  { id: 'yachimata', code: '12230', name: '八街市', kana: 'やちまたし', kind: 'city', region: 'inba' },
  { id: 'inzai', code: '12231', name: '印西市', kana: 'いんざいし', kind: 'city', region: 'inba' },
  { id: 'shiroi', code: '12232', name: '白井市', kana: 'しろいし', kind: 'city', region: 'inba' },
  { id: 'tomisato', code: '12233', name: '富里市', kana: 'とみさとし', kind: 'city', region: 'inba' },
  { id: 'minamiboso', code: '12234', name: '南房総市', kana: 'みなみぼうそうし', kind: 'city', region: 'awa' },
  { id: 'sosa', code: '12235', name: '匝瑳市', kana: 'そうさし', kind: 'city', region: 'kaiso' },
  { id: 'katori', code: '12236', name: '香取市', kana: 'かとりし', kind: 'city', region: 'katori' },
  { id: 'sanmu', code: '12237', name: '山武市', kana: 'さんむし', kind: 'city', region: 'sanbu' },
  { id: 'isumi', code: '12238', name: 'いすみ市', kana: 'いすみし', kind: 'city', region: 'isumi' },
  { id: 'oamishirasato', code: '12239', name: '大網白里市', kana: 'おおあみしらさとし', kind: 'city', region: 'sanbu' },
  { id: 'shisui', code: '12322', name: '酒々井町', kana: 'しすいまち', kind: 'town', region: 'inba' },
  { id: 'sakae', code: '12329', name: '栄町', kana: 'さかえまち', kind: 'town', region: 'inba' },
  { id: 'kozaki', code: '12342', name: '神崎町', kana: 'こうざきまち', kind: 'town', region: 'katori' },
  { id: 'tako', code: '12347', name: '多古町', kana: 'たこまち', kind: 'town', region: 'katori' },
  { id: 'tonosho', code: '12349', name: '東庄町', kana: 'とうのしょうまち', kind: 'town', region: 'katori' },
  { id: 'kujukuri', code: '12403', name: '九十九里町', kana: 'くじゅうくりまち', kind: 'town', region: 'sanbu' },
  { id: 'shibayama', code: '12409', name: '芝山町', kana: 'しばやままち', kind: 'town', region: 'sanbu' },
  { id: 'yokoshibahikari', code: '12410', name: '横芝光町', kana: 'よこしばひかりまち', kind: 'town', region: 'sanbu' },
  { id: 'ichinomiya', code: '12421', name: '一宮町', kana: 'いちのみやまち', kind: 'town', region: 'chosei' },
  { id: 'mutsuzawa', code: '12422', name: '睦沢町', kana: 'むつざわまち', kind: 'town', region: 'chosei' },
  { id: 'chosei', code: '12423', name: '長生村', kana: 'ちょうせいむら', kind: 'village', region: 'chosei' },
  { id: 'shirako', code: '12424', name: '白子町', kana: 'しらこまち', kind: 'town', region: 'chosei' },
  { id: 'nagara', code: '12426', name: '長柄町', kana: 'ながらまち', kind: 'town', region: 'chosei' },
  { id: 'chonan', code: '12427', name: '長南町', kana: 'ちょうなんまち', kind: 'town', region: 'chosei' },
  { id: 'otaki', code: '12441', name: '大多喜町', kana: 'おおたきまち', kind: 'town', region: 'isumi' },
  { id: 'onjuku', code: '12443', name: '御宿町', kana: 'おんじゅくまち', kind: 'town', region: 'isumi' },
  { id: 'kyonan', code: '12463', name: '鋸南町', kana: 'きょなんまち', kind: 'town', region: 'awa' },
]

export const MUNICIPALITY_BY_CODE: ReadonlyMap<LgCode, MunicipalityBase> = new Map(
  MUNICIPALITIES.map((m) => [m.code, m]),
)

export function getMunicipality(code: LgCode): MunicipalityBase {
  const m = MUNICIPALITY_BY_CODE.get(code)
  if (!m) throw new Error(`Unknown municipality code: ${code}`)
  return m
}
