import type { Region, RegionId } from '../types'

/**
 * 千葉県の地域区分（県の地域振興事務所の区分に準拠）。
 * color は地図の塗り分け用パステルカラー。
 */
export const REGIONS: readonly Region[] = [
  { id: 'higashikatsushika', label: '東葛飾', kana: 'ひがしかつしか', hint: '千葉県のいちばん北のほう、東京のおとなりだよ', color: '#C7B8F5' },
  { id: 'katsunan', label: '葛南', kana: 'かつなん', hint: '東京のすぐおとなり、東京湾ぞいの北のほうだよ', color: '#FFC2D1' },
  { id: 'chiba', label: '千葉', kana: 'ちば', hint: '千葉県のまんなかあたり、東京湾ぞいだよ', color: '#FFA3A3' },
  { id: 'inba', label: '印旛', kana: 'いんば', hint: '北のほうのまんなか、空港や沼があるあたりだよ', color: '#FFE28A' },
  { id: 'katori', label: '香取', kana: 'かとり', hint: '北東のはし、利根川ぞいだよ', color: '#B5E8B0' },
  { id: 'kaiso', label: '海匝', kana: 'かいそう', hint: '東のいちばんはし、太平洋に出っぱっているところだよ', color: '#9AD9F5' },
  { id: 'sanbu', label: '山武', kana: 'さんぶ', hint: '東がわ、九十九里浜の北のほうだよ', color: '#B8E4FF' },
  { id: 'chosei', label: '長生', kana: 'ちょうせい', hint: '東がわ、九十九里浜の南のほうだよ', color: '#A8E6CF' },
  { id: 'isumi', label: '夷隅', kana: 'いすみ', hint: '南東のほう、太平洋がわだよ', color: '#FFD6A5' },
  { id: 'awa', label: '安房', kana: 'あわ', hint: '千葉県のいちばん南のはしだよ', color: '#FFB3A7' },
  { id: 'kimitsu', label: '君津', kana: 'きみつ', hint: '南西のほう、東京湾ぞいの南のほうだよ', color: '#CDEAA6' },
  { id: 'ichihara', label: '市原', kana: 'いちはら', hint: 'まんなかよりすこし南、東京湾ぞいだよ', color: '#FFF1B8' },
]

export const REGION_BY_ID: Record<RegionId, Region> = Object.fromEntries(
  REGIONS.map((r) => [r.id, r]),
) as Record<RegionId, Region>
