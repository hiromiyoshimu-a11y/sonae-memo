import { ChecklistItem } from '../types';

export const DEFAULT_CHECKLIST_ITEMS: Omit<ChecklistItem, 'checked'>[] = [
  // 飲料・食料
  {
    id: 'chk-water',
    category: '飲料・食料',
    name: '飲料水（保存水）',
    recommendedQty: '1人1日3L × 3日〜1週間分',
    description: '飲用だけでなく調理用も兼ねて多めに備蓄。',
  },
  {
    id: 'chk-rice',
    category: '飲料・食料',
    name: 'レトルトご飯・アルファ米・乾パン',
    recommendedQty: '1人3日〜1週間分',
    description: 'お湯や水で戻せるアルファ米やパックご飯。',
  },
  {
    id: 'chk-can',
    category: '飲料・食料',
    name: '缶詰・レトルト食品（肉・魚・野菜）',
    recommendedQty: '人数分 × 数日分',
    description: 'そのまま食べられるものが便利。プルトップ式が安心。',
  },
  {
    id: 'chk-snack',
    category: '飲料・食料',
    name: '栄養補助食品・お菓子・飴',
    recommendedQty: '適量',
    description: 'カロリーメイトやようかん、チョコレートなど手軽にエネルギー補給できるもの。',
  },
  {
    id: 'chk-seasoning',
    category: '飲料・食料',
    name: 'インスタント味噌汁・フリーズドライ',
    recommendedQty: '適量',
    description: '温かい汁物は災害時のストレス緩和に役立ちます。',
  },

  // 衛生・トイレ
  {
    id: 'chk-toilet',
    category: '衛生・トイレ',
    name: '携帯トイレ・簡易トイレ（凝固剤付き）',
    recommendedQty: '1人1日5回 × 7日分（35回分〜）',
    description: '断水時に最も困るのがトイレです。必ず多めに用意。',
  },
  {
    id: 'chk-tissue',
    category: '衛生・トイレ',
    name: 'トイレットペーパー・ティッシュ',
    recommendedQty: '普段より1〜2パック多め',
    description: 'ローリングストックの基本。少し多めに在庫を持つ。',
  },
  {
    id: 'chk-wetwipe',
    category: '衛生・トイレ',
    name: 'ウェットティッシュ・体拭きシート',
    recommendedQty: '大判タイプ数個',
    description: '入浴できない時の清拭や手拭きに必須。',
  },
  {
    id: 'chk-mask',
    category: '衛生・トイレ',
    name: 'マスク・アルコール消毒液',
    recommendedQty: '1箱・1本以上',
    description: '避難所での感染症対策や粉塵対策に。',
  },
  {
    id: 'chk-oral',
    category: '衛生・トイレ',
    name: '歯磨きシート・マウスウォッシュ',
    recommendedQty: '1〜2個',
    description: '水が貴重な時でも口腔ケアができます。',
  },
  {
    id: 'chk-trashbag',
    category: '衛生・トイレ',
    name: 'ゴミ袋（大・小）・ポリ袋',
    recommendedQty: '各1〜2ロール',
    description: 'ゴミ処理のほか、防寒や給水袋のカバーにも使えます。',
  },
  {
    id: 'chk-wrap',
    category: '衛生・トイレ',
    name: '食品用ラップ・アルミホイル',
    recommendedQty: '各1〜2本',
    description: 'お皿に敷いて使えば洗い物を減らし節水できます。',
  },

  // 救急・常備薬
  {
    id: 'chk-firstaid',
    category: '救急・常備薬',
    name: '救急セット（絆創膏・包帯・ガーゼ・消毒薬）',
    recommendedQty: '1セット',
    description: 'ケガの応急処置用。ピンセットやハサミもあると便利。',
  },
  {
    id: 'chk-medicine',
    category: '救急・常備薬',
    name: '常備薬・処方薬・お薬手帳のコピー',
    recommendedQty: '1週間分以上',
    description: '持病の薬や鎮痛剤、胃腸薬。お薬手帳はスマホ撮影も推奨。',
  },
  {
    id: 'chk-thermo',
    category: '救急・常備薬',
    name: '体温計・冷却シート',
    recommendedQty: '各1つ',
    description: '体調管理のために。',
  },

  // 情報・電源・明かり
  {
    id: 'chk-battery',
    category: '情報・電源・明かり',
    name: 'モバイルバッテリー・充電ケーブル',
    recommendedQty: '1〜2台（満充電で保管）',
    description: 'スマホの電源確保は命綱。乾電池式もあると安心。',
  },
  {
    id: 'chk-radio',
    category: '情報・電源・明かり',
    name: '手回し充電ラジオ・防災ラジオ',
    recommendedQty: '1台',
    description: '停電・通信障害時の正確な情報収集に。',
  },
  {
    id: 'chk-light',
    category: '情報・電源・明かり',
    name: '懐中電灯・ヘッドライト・ランタン',
    recommendedQty: '1人1本＋部屋用ランタン',
    description: 'ヘッドライトは両手が空くので夜間避難に非常に有効。',
  },
  {
    id: 'chk-drycell',
    category: '情報・電源・明かり',
    name: '乾電池（単3・単4など）',
    recommendedQty: '各サイズ1パック以上',
    description: 'ライトやラジオの規格に合わせて備蓄。',
  },

  // 防寒・安全・工具
  {
    id: 'chk-cassette',
    category: '防寒・安全・工具',
    name: 'カセットコンロ・カセットボンベ',
    recommendedQty: 'コンロ1台・ボンベ6〜12本',
    description: '停電・ガス停止時の調理や湯沸かしに必須。',
  },
  {
    id: 'chk-blanket',
    category: '防寒・安全・工具',
    name: 'アルミブランケット（防寒シート）・カイロ',
    recommendedQty: '人数分',
    description: '軽量でコンパクト。冬の停電・避難時の低体温症予防に。',
  },
  {
    id: 'chk-gloves',
    category: '防寒・安全・工具',
    name: '軍手・厚手の手袋・スリッパ',
    recommendedQty: '人数分',
    description: '割れたガラスやガレキからの保護に。底が厚いスリッパが安全。',
  },
  {
    id: 'chk-rain',
    category: '防寒・安全・工具',
    name: 'レインコート・ポンチョ',
    recommendedQty: '人数分',
    description: '傘と違い両手が空くため避難時に安全です。',
  },
  {
    id: 'chk-whistle',
    category: '防寒・安全・工具',
    name: '防犯ブザー・ホイッスル（笛）',
    recommendedQty: '1人1個',
    description: '閉じ込められた際に居場所を知らせるために必要。',
  },

  // 貴重品・その他
  {
    id: 'chk-cash',
    category: '貴重品・その他',
    name: '現金（千円札・10円玉などの小銭）',
    recommendedQty: '1〜3万円＋小銭',
    description: '停電時はキャッシュレス決済やATMが使えません。公衆電話用の10円玉も。',
  },
  {
    id: 'chk-id',
    category: '貴重品・その他',
    name: '身分証明書・通帳・保険証のコピー',
    recommendedQty: '1セット（防水袋へ）',
    description: '家族の連絡先メモも紙で用意しておくと安心。',
  },
  {
    id: 'chk-note',
    category: '貴重品・その他',
    name: '油性マジック・メモ帳・養生テープ',
    recommendedQty: '各1つ',
    description: '安否伝言や物資の名前書き、応急補修に役立ちます。',
  },

  // 乳幼児・高齢者・ペット
  {
    id: 'chk-baby',
    category: '乳幼児・高齢者・ペット',
    name: 'おむつ・おしりふき・液体ミルク・離乳食',
    recommendedQty: '1週間分',
    description: '乳幼児がいるご家庭。液体ミルクは調乳不要で衛生的。',
  },
  {
    id: 'chk-senior',
    category: '乳幼児・高齢者・ペット',
    name: '大人用おむつ・介護食・予備の眼鏡や補聴器電池',
    recommendedQty: '1週間分',
    description: 'ご高齢の方・要介護の方がいるご家庭。',
  },
  {
    id: 'chk-pet',
    category: '乳幼児・高齢者・ペット',
    name: 'ペットフード・ペットシーツ・予備リード・鑑札',
    recommendedQty: '5〜7日分',
    description: 'ペットと同行避難するための備え。',
  },
];
