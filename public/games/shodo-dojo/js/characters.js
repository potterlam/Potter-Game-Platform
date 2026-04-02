// ============================================================
// 書道場 - 字庫（粵語版）
// 66 個繁體字，分 3 個級別，附粵拼及廣東話提示
// ============================================================

const CHARACTER_DB = {
  // ──────────────────────────────────────────────────────────
  // Level 1: 初級 — 基本部首同簡單字
  // ──────────────────────────────────────────────────────────
  level1: {
    name: '初級',
    nameEn: 'Beginner',
    subtitle: '基礎筆畫',
    subtitleEn: 'Basic Strokes',
    description: '學識基本部首同簡單漢字嘅寫法',
    descriptionEn: 'Learn basic radicals and simple character writing',
    requiredScore: 0,
    passScore: 1200,
    characters: [
      { char: '一', jyutping: 'jat1', meaning: 'One', meaningZh: '數字一', radical: '一', radicalName: '一部（橫部）', strokeCount: 1, emoji: '1️⃣',
        hints: ['淨係得一筆：橫', '由左到右，起筆稍重收筆頓', '保持水平，不要向上或向下傾斜'] },
      { char: '二', jyutping: 'ji6', meaning: 'Two', meaningZh: '數字二', radical: '二', radicalName: '二部', strokeCount: 2, emoji: '2️⃣',
        hints: ['先短橫後長橫', '上橫短，下橫長約 1.5 倍', '兩橫之間留均勻間距'] },
      { char: '三', jyutping: 'saam1', meaning: 'Three', meaningZh: '數字三', radical: '一', radicalName: '一部', strokeCount: 3, emoji: '3️⃣',
        hints: ['三橫由上而下寫，長度不同', '上橫中等、中間橫最短、底橫最長', '三橫間距均勻，保持平行'] },
      { char: '十', jyutping: 'sap6', meaning: 'Ten', meaningZh: '數字十', radical: '十', radicalName: '十部', strokeCount: 2, emoji: '🔟',
        hints: ['先橫後豎', '橫在中間偏上，豎穿過橫的中點', '豎要筆直，與橫垂直相交'] },
      { char: '人', jyutping: 'jan4', meaning: 'Person', meaningZh: '人、人類', radical: '人', radicalName: '人部', strokeCount: 2, emoji: '🧑',
        hints: ['先撇後捺', '撇向左下，捺從撇的頂點向右下展開', '撇捺交點在頂部，下方展開如人站立'] },
      { char: '大', jyutping: 'daai6', meaning: 'Big', meaningZh: '大嘅、巨大', radical: '大', radicalName: '大部', strokeCount: 3, emoji: '🔺',
        hints: ['筆順：橫→撇→捺', '橫在上方，撇捺從橫的中點向兩側展開', '撇捺角度對稱，左右均衡'] },
      { char: '小', jyutping: 'siu2', meaning: 'Small', meaningZh: '細嘅、微小', radical: '小', radicalName: '小部', strokeCount: 3, emoji: '🔹',
        hints: ['筆順：豎鉤→左點→右點', '中間豎鉤最長，是主筆', '兩邊點對稱，高度一致'] },
      { char: '上', jyutping: 'soeng5', meaning: 'Up / Above', meaningZh: '上面、向上', radical: '一', radicalName: '一部', strokeCount: 3, emoji: '⬆️',
        hints: ['筆順：豎→短橫→長橫', '豎在左側，短橫接在豎中間偏上', '底部長橫是最後一筆，要寬過短橫'] },
      { char: '下', jyutping: 'haa5', meaning: 'Down / Below', meaningZh: '下面、向下', radical: '一', radicalName: '一部', strokeCount: 3, emoji: '⬇️',
        hints: ['筆順：橫→豎→點', '橫在最上方，豎從橫中點向下', '最後一筆是右下方的點'] },
      { char: '中', jyutping: 'zung1', meaning: 'Middle / China', meaningZh: '中間、中國', radical: '丨', radicalName: '豎部', strokeCount: 4, emoji: '🎯',
        hints: ['先寫口字框，最後一豎貫穿', '口字框：豎→橫折→底橫', '豎由上穿到下，擺在口字正中間'] },
      { char: '山', jyutping: 'saan1', meaning: 'Mountain', meaningZh: '山、山脈', radical: '山', radicalName: '山部', strokeCount: 3, emoji: '⛰️',
        hints: ['筆順：中豎→左豎折→右豎', '中間豎最高，左右豎短一些', '三豎底部對齊，頂部高低不同'] },
      { char: '水', jyutping: 'seoi2', meaning: 'Water', meaningZh: '水、液體', radical: '水', radicalName: '水部（氵）', strokeCount: 4, emoji: '💧',
        hints: ['筆順：豎鉤→橫撇→左撇→右捺', '豎鉤是中心骨架，先寫', '做偏旁時寫成三點水（氵）：兩點加一提'] },
      { char: '火', jyutping: 'fo2', meaning: 'Fire', meaningZh: '火、火焰', radical: '火', radicalName: '火部（灬）', strokeCount: 4, emoji: '🔥',
        hints: ['筆順：左上點→右上撇→撇→捺', '先寫上面兩個短筆，再寫下面人字', '做偏旁時寫成四點底（灬）'] },
      { char: '木', jyutping: 'muk6', meaning: 'Wood / Tree', meaningZh: '木頭、樹木', radical: '木', radicalName: '木部', strokeCount: 4, emoji: '🌳',
        hints: ['筆順：橫→豎→撇→捺', '橫在上、豎在中、撇捺從橫豎交叉處展開', '做偏旁時捺變成點'] },
      { char: '土', jyutping: 'tou2', meaning: 'Earth / Soil', meaningZh: '土地、泥土', radical: '土', radicalName: '土部', strokeCount: 3, emoji: '🟤',
        hints: ['筆順：橫→豎→長橫', '上橫短，底橫長，豎連接兩橫中點', '和「士」的區別：土是上短下長，士是上長下短'] },
      { char: '日', jyutping: 'jat6', meaning: 'Sun / Day', meaningZh: '太陽、日子', radical: '日', radicalName: '日部', strokeCount: 4, emoji: '☀️',
        hints: ['筆順：豎→橫折→中橫→底橫封口', '外框略窄長，不是正方形', '中間橫將框分成上下兩部分'] },
      { char: '月', jyutping: 'jyut6', meaning: 'Moon / Month', meaningZh: '月亮、月份', radical: '月', radicalName: '月部', strokeCount: 4, emoji: '🌙',
        hints: ['筆順：撇→橫折鉤→內部兩橫', '整體略向左傾斜，不是完全垂直', '內部兩橫不觸右邊框'] },
      { char: '口', jyutping: 'hau2', meaning: 'Mouth', meaningZh: '嘴巴、口', radical: '口', radicalName: '口部', strokeCount: 3, emoji: '👄',
        hints: ['筆順：豎→橫折→底橫封口', '上方開口，由左邊開始寫', '方正但略略上闊下窄'] },
      { char: '手', jyutping: 'sau2', meaning: 'Hand', meaningZh: '手、手掌', radical: '手', radicalName: '手部（扌）', strokeCount: 4, emoji: '✋',
        hints: ['筆順：短撇→兩橫→豎鉤貫穿', '豎鉤從上穿過各橫，末端帶鉤', '做偏旁時寫成提手旁（扌）'] },
      { char: '目', jyutping: 'muk6', meaning: 'Eye', meaningZh: '眼睛', radical: '目', radicalName: '目部', strokeCount: 5, emoji: '👁️',
        hints: ['筆順：豎→橫折→兩橫→底橫封口', '外框要窄長（似眼睛），不是方形', '內部兩橫將框分成三層'] },
      { char: '田', jyutping: 'tin4', meaning: 'Field', meaningZh: '田地、農田', radical: '田', radicalName: '田部', strokeCount: 5, emoji: '🌾',
        hints: ['先寫外框（豎→橫折→底橫），再寫十字', '外框方正，內部十字將框分四格', '先寫內部豎，再寫內部橫，最後封底'] },
      { char: '王', jyutping: 'wong4', meaning: 'King', meaningZh: '國王、王者', radical: '王', radicalName: '王部（玉部）', strokeCount: 4, emoji: '👑',
        hints: ['筆順：橫→橫→豎→橫', '先寫上兩橫，豎穿過後寫底橫', '底橫最長，和「玉」的區別是有無右下點'] }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // Level 2: 中級 — 自然同四季
  // ──────────────────────────────────────────────────────────
  level2: {
    name: '中級',
    nameEn: 'Intermediate',
    subtitle: '自然萬物',
    subtitleEn: 'Nature & World',
    description: '學寫同自然四季相關嘅繁體字',
    descriptionEn: 'Write nature and seasonal traditional characters',
    requiredScore: 1200,
    passScore: 1200,
    characters: [
      { char: '竹', jyutping: 'zuk1', meaning: 'Bamboo', meaningZh: '竹子', radical: '竹', radicalName: '竹部（⺮）', strokeCount: 6, emoji: '🎋',
        hints: ['左右對稱：先寫左三筆，再寫右三筆', '每邊筆順：撇→橫→豎', '竹字頭（⺮）的橫要略向下斜'] },
      { char: '花', jyutping: 'faa1', meaning: 'Flower', meaningZh: '花朵', radical: '艸', radicalName: '草字頭（艹）', strokeCount: 8, emoji: '🌸',
        hints: ['上下結構：草字頭（艹）加下方「化」', '草字頭先寫，橫加兩豎', '下方「化」：先人旁（撇→豎），再匕（撇→豎彎鉤）'] },
      { char: '草', jyutping: 'cou2', meaning: 'Grass', meaningZh: '草、草地', radical: '艸', radicalName: '草字頭（艹）', strokeCount: 9, emoji: '🌿',
        hints: ['上下結構：草字頭加「早」', '草字頭表示同植物有關', '下方「早」：日加十'] },
      { char: '風', jyutping: 'fung1', meaning: 'Wind', meaningZh: '風、微風', radical: '風', radicalName: '風部', strokeCount: 9, emoji: '💨',
        hints: ['外框似「几」：先撇再橫折彎鉤', '先寫外框，再寫內部結構', '內部是「虫」字，筆畫較密'] },
      { char: '雨', jyutping: 'jyu5', meaning: 'Rain', meaningZh: '落雨、雨水', radical: '雨', radicalName: '雨部', strokeCount: 8, emoji: '🌧️',
        hints: ['先一橫，再門字框，最尾四點', '上橫代表天空', '內部四點：左上→右上→左下→右下'] },
      { char: '雪', jyutping: 'syut3', meaning: 'Snow', meaningZh: '雪、落雪', radical: '雨', radicalName: '雨部', strokeCount: 11, emoji: '❄️',
        hints: ['上下結構：雨字頭加下方「彐」', '先寫完雨字頭再寫下面', '雨字頭表示同天氣有關'] },
      { char: '春', jyutping: 'ceon1', meaning: 'Spring', meaningZh: '春天', radical: '日', radicalName: '日部', strokeCount: 9, emoji: '🌱',
        hints: ['上下結構：上部三橫一撇一捺，下部日', '上部似「夫」但多一橫', '先寫上部，最後寫日'] },
      { char: '夏', jyutping: 'haa6', meaning: 'Summer', meaningZh: '夏天', radical: '夊', radicalName: '夂部', strokeCount: 10, emoji: '☀️',
        hints: ['由上到下：橫→自→夂', '中間「自」字要寫得緊湊', '下方「夂」：撇→橫撇→捺（共三筆）'] },
      { char: '秋', jyutping: 'cau1', meaning: 'Autumn', meaningZh: '秋天', radical: '禾', radicalName: '禾部', strokeCount: 9, emoji: '🍂',
        hints: ['左右結構：禾字旁加火', '先寫左邊禾，再寫右邊火', '禾旁的捺變成點'] },
      { char: '冬', jyutping: 'dung1', meaning: 'Winter', meaningZh: '冬天', radical: '冫', radicalName: '冰部（冫）', strokeCount: 5, emoji: '⛄',
        hints: ['上部折文，下部兩點', '上部：撇→橫撇→捺', '下方兩點左右對稱，似冰晶'] },
      { char: '海', jyutping: 'hoi2', meaning: 'Sea / Ocean', meaningZh: '大海、海洋', radical: '水', radicalName: '三點水（氵）', strokeCount: 10, emoji: '🌊',
        hints: ['左右結構：三點水加「每」', '先寫左邊三點水，佔左三分一', '右邊「每」：先撇再母'] },
      { char: '河', jyutping: 'ho4', meaning: 'River', meaningZh: '河流', radical: '水', radicalName: '三點水（氵）', strokeCount: 8, emoji: '🏞️',
        hints: ['左右結構：三點水加「可」', '三點水偏旁佔左邊三分之一', '右邊「可」：橫→口→豎鉤'] },
      { char: '林', jyutping: 'lam4', meaning: 'Forest', meaningZh: '樹林、森林', radical: '木', radicalName: '木部', strokeCount: 8, emoji: '🌲',
        hints: ['左右結構：兩個「木」並排', '左木的捺變成點', '左右各佔一半，結構均衡'] },
      { char: '星', jyutping: 'sing1', meaning: 'Star', meaningZh: '星星、星辰', radical: '日', radicalName: '日部', strokeCount: 9, emoji: '⭐',
        hints: ['上下結構：日加生', '先寫上方「日」，再寫下方「生」', '生的筆順：撇→橫→橫→豎→橫'] },
      { char: '馬', jyutping: 'maa5', meaning: 'Horse', meaningZh: '馬', radical: '馬', radicalName: '馬部', strokeCount: 10, emoji: '🐴',
        hints: ['上部似馬頭：橫→豎折折鉤→橫', '中部四點似馬蹄', '繁體寫法同簡體（马）差異大'] },
      { char: '鳥', jyutping: 'niu5', meaning: 'Bird', meaningZh: '雀鳥', radical: '鳥', radicalName: '鳥部', strokeCount: 11, emoji: '🐦',
        hints: ['上部似雀仔頭同身', '中部有橫和口字框', '底部四點似雀爪，同灬一樣'] },
      { char: '魚', jyutping: 'jyu4', meaning: 'Fish', meaningZh: '魚類', radical: '魚', radicalName: '魚部', strokeCount: 11, emoji: '🐟',
        hints: ['上部有刀加田的結構，底部四點', '中間田字部代表魚鱗', '底部四點（灬）代表魚尾擺動'] },
      { char: '門', jyutping: 'mun4', meaning: 'Door / Gate', meaningZh: '門、大門', radical: '門', radicalName: '門部', strokeCount: 8, emoji: '🚪',
        hints: ['左右對稱結構', '先寫左半部，再寫右半部', '繁體寫法每邊：豎→橫折鉤→內部筆畫'] },
      { char: '金', jyutping: 'gam1', meaning: 'Gold / Metal', meaningZh: '金屬、黃金', radical: '金', radicalName: '金部（釒）', strokeCount: 8, emoji: '🥇',
        hints: ['上部人字形，中橫，下部兩豎兩點', '做偏旁時寫成「釒」', '下部筆順：豎→點→豎→點'] },
      { char: '食', jyutping: 'sik6', meaning: 'Food / Eat', meaningZh: '食物、食嘢', radical: '食', radicalName: '食部（飠）', strokeCount: 9, emoji: '🍚',
        hints: ['上部人字蓋，下部「良」的變形', '做偏旁時寫成「飠」', '先寫上撇捺，再寫下部'] },
      { char: '光', jyutping: 'gwong1', meaning: 'Light', meaningZh: '光芒、光明', radical: '儿', radicalName: '兒部', strokeCount: 6, emoji: '💡',
        hints: ['上部兩小橫加豎，下部兒字底', '上部似火苗，下部似人', '兒字底筆順：撇→豎彎鉤'] },
      { char: '夜', jyutping: 'je6', meaning: 'Night', meaningZh: '夜晚', radical: '夕', radicalName: '夕部', strokeCount: 8, emoji: '🌙',
        hints: ['上部「亠」，中人，右下撇捺', '由上到下寫', '包含「夕」部表示黃昏'] }
    ]
  },

  // ──────────────────────────────────────────────────────────
  // Level 3: 高級 — 抽象概念同武道
  // ──────────────────────────────────────────────────────────
  level3: {
    name: '高級',
    nameEn: 'Master',
    subtitle: '武道精神',
    subtitleEn: 'Way of the Warrior',
    description: '挑戰複雜繁體字，體悟武道精神',
    descriptionEn: 'Master complex characters embodying the warrior spirit',
    requiredScore: 1200,
    passScore: 1400,
    characters: [
      { char: '道', jyutping: 'dou6', meaning: 'Way / Path', meaningZh: '道路、道理', radical: '辶', radicalName: '走之底（辶）', strokeCount: 13, emoji: '☯️',
        hints: ['先寫內部「首」，最後寫走之底', '走之底（辶）筆順：點→橫折折撇→捺', '「首」：先兩點→橫→再寫下方「自」'] },
      { char: '義', jyutping: 'ji6', meaning: 'Righteousness', meaningZh: '正義、道義', radical: '羊', radicalName: '羊部', strokeCount: 13, emoji: '⚖️',
        hints: ['上下結構：上「羊」下「我」', '羊筆順：點→撇→三橫→豎', '我筆順：撇→橫→豎→提→斜鉤→撇→點'] },
      { char: '禮', jyutping: 'lai5', meaning: 'Ritual / Politeness', meaningZh: '禮貌、禮儀', radical: '示', radicalName: '示部（礻）', strokeCount: 18, emoji: '🙏',
        hints: ['左右結構：示字旁（礻）加右邊「豊」', '示字旁筆順：點→橫撇→豎→點', '筆畫多，右邊要寫得緊湊'] },
      { char: '智', jyutping: 'zi3', meaning: 'Wisdom', meaningZh: '智慧、聰明', radical: '日', radicalName: '日部', strokeCount: 12, emoji: '🧠',
        hints: ['上下結構：上「知」下「日」', '知 = 左「矢」（撇→橫→橫→撇→點）加右「口」', '下方日字居中，略窄於上方'] },
      { char: '勇', jyutping: 'jung5', meaning: 'Courage / Brave', meaningZh: '勇敢、勇氣', radical: '力', radicalName: '力部', strokeCount: 9, emoji: '💪',
        hints: ['上下結構：上「甬」下「力」', '甬筆順：豎→橫折→口→豎→橫', '下方「力」：橫折鉤→撇'] },
      { char: '德', jyutping: 'dak1', meaning: 'Virtue / Morality', meaningZh: '品德、道德', radical: '彳', radicalName: '雙人旁（彳）', strokeCount: 15, emoji: '🌟',
        hints: ['左右結構：雙人旁加右邊', '雙人旁筆順：撇→撇', '右邊由「十」「目」「一」「心」組成，由上而下'] },
      { char: '師', jyutping: 'si1', meaning: 'Master / Teacher', meaningZh: '老師、師傅', radical: '巾', radicalName: '巾部', strokeCount: 10, emoji: '👨‍🏫',
        hints: ['左右結構：左邊偏旁加右邊「帀」「巾」', '左邊筆順：撇→橫→橫→豎', '右邊上「帀」下「巾」，由上到下'] },
      { char: '學', jyutping: 'hok6', meaning: 'Study / Learn', meaningZh: '學習、學問', radical: '子', radicalName: '子部', strokeCount: 16, emoji: '📚',
        hints: ['上下結構：上部複雜，下部「子」', '上部兩手捧住「爻」，中有「冖」', '下部「子」：橫鉤→豎→橫'] },
      { char: '愛', jyutping: 'oi3', meaning: 'Love', meaningZh: '愛、鍾意', radical: '心', radicalName: '心部', strokeCount: 13, emoji: '❤️',
        hints: ['由上到下：爪字蓋→冖→心→夂', '中間有「心」，繁體「愛」有心', '底部「夂」：撇→橫撇→捺（共三筆）'] },
      { char: '夢', jyutping: 'mung6', meaning: 'Dream', meaningZh: '夢想、發夢', radical: '夕', radicalName: '夕部', strokeCount: 14, emoji: '💭',
        hints: ['上下結構：草字頭→目→冖→夕', '原理：草→目→夕 = 夜晚閉眼所見', '各部分由上到下依次書寫'] },
      { char: '劍', jyutping: 'gim3', meaning: 'Sword', meaningZh: '寶劍、劍術', radical: '刀', radicalName: '立刀旁（刂）', strokeCount: 15, emoji: '⚔️',
        hints: ['左右結構：左邊複雜，右邊立刀旁（刂）', '立刀旁最後寫：豎→豎鉤', '左邊由上而下，結構緊湊'] },
      { char: '書', jyutping: 'syu1', meaning: 'Book / Writing', meaningZh: '書法、書本', radical: '曰', radicalName: '曰部', strokeCount: 10, emoji: '📖',
        hints: ['上部「聿」（筆），下部「曰」', '聿筆順：撇→兩橫→豎→橫', '最後寫下部「曰」字框'] },
      { char: '畫', jyutping: 'waa2', meaning: 'Painting / Drawing', meaningZh: '繪畫、圖畫', radical: '田', radicalName: '田部', strokeCount: 12, emoji: '🎨',
        hints: ['由上到下：橫→田→一→凵', '中部「田」字內多一橫', '繁體畫比簡體（画）多幾筆'] },
      { char: '龍', jyutping: 'lung4', meaning: 'Dragon', meaningZh: '龍、神龍', radical: '龍', radicalName: '龍部', strokeCount: 16, emoji: '🐉',
        hints: ['左右結構：左邊立加月，右邊複雜', '左邊先寫「立」再寫「月」', '右邊由上而下，要寫得緊湊'] },
      { char: '武', jyutping: 'mou5', meaning: 'Martial / Military', meaningZh: '武術、武道', radical: '止', radicalName: '止部', strokeCount: 8, emoji: '🥋',
        hints: ['上下結構：上「橫加弋」，下「止」', '上部筆順：橫→橫→撇→斜鉤→點', '下部「止」：豎→短橫→長橫'] },
      { char: '藝', jyutping: 'ngai6', meaning: 'Art / Skill', meaningZh: '藝術、技藝', radical: '艸', radicalName: '草字頭（艹）', strokeCount: 19, emoji: '🎭',
        hints: ['上下結構：草字頭→埶→云', '筆畫最多，保持各部分緊湊', '由上到下依次書寫，不要跳筆'] },
      { char: '戰', jyutping: 'zin3', meaning: 'Battle / War', meaningZh: '戰鬥、挑戰', radical: '戈', radicalName: '戈部', strokeCount: 16, emoji: '⚔️',
        hints: ['左右結構：左「單」右「戈」', '先寫左邊「單」，再寫右邊「戈」', '戈筆順：橫→斜鉤→撇→點'] },
      { char: '練', jyutping: 'lin6', meaning: 'Practice / Train', meaningZh: '練習、訓練', radical: '糸', radicalName: '絲旁（糹）', strokeCount: 15, emoji: '🔄',
        hints: ['左右結構：絲旁（糹）加「柬」', '絲旁筆順：撇折→撇折→提→點→點→提', '右邊「柬」：木字加束的變形'] },
      { char: '國', jyutping: 'gwok3', meaning: 'Country / Nation', meaningZh: '國家', radical: '囗', radicalName: '國字框（囗）', strokeCount: 11, emoji: '🏯',
        hints: ['外框「囗」包住內部「或」', '先寫外框三邊，再寫內部，最後封底', '「或」筆順：橫→戈→口'] },
      { char: '寶', jyutping: 'bou2', meaning: 'Treasure', meaningZh: '寶物、珍寶', radical: '宀', radicalName: '寶蓋頭（宀）', strokeCount: 20, emoji: '💎',
        hints: ['寶蓋頭（宀）加下方複雜結構', '寶蓋頭（宀）：點→左點→橫鉤（共三筆）', '下部含「缶」「貝」，由上而下寫'] },
      { char: '心', jyutping: 'sam1', meaning: 'Heart / Mind', meaningZh: '心臟、心靈', radical: '心', radicalName: '心部', strokeCount: 4, emoji: '💗',
        hints: ['筆順：左點→臥鉤→上點→右點', '臥鉤要圓潤有力，是主筆', '三點位置：左點低、上點高、右點中'] },
      { char: '力', jyutping: 'lik6', meaning: 'Power / Strength', meaningZh: '力量、力氣', radical: '力', radicalName: '力部', strokeCount: 2, emoji: '⚡',
        hints: ['兩筆：橫折鉤→撇', '橫折鉤從左上向右再向下勾鉤', '撇從右上方向左下方撥出'] }
    ]
  }
};

// 筆順通則（顯示為小貼士）
const STROKE_RULES = [
  { rule: '先橫後豎', ruleEn: 'Horizontal before vertical', example: '十' },
  { rule: '先撇後捺', ruleEn: 'Left-falling before right-falling', example: '人' },
  { rule: '由上到下', ruleEn: 'Top to bottom', example: '三' },
  { rule: '由左到右', ruleEn: 'Left to right', example: '林' },
  { rule: '先外後內', ruleEn: 'Outside before inside', example: '月' },
  { rule: '先入後關', ruleEn: 'Enter then close', example: '國' },
  { rule: '先中間後兩邊', ruleEn: 'Middle before sides', example: '小' }
];

// 基本筆畫（粵拼版）
const STROKE_TYPES = {
  waang4: { zh: '橫', en: 'Horizontal', desc: '由左到右嘅水平筆畫' },
  syu6: { zh: '豎', en: 'Vertical', desc: '由上到下嘅垂直筆畫' },
  pit3: { zh: '撇', en: 'Left-falling', desc: '由右上到左下嘅斜筆' },
  naat6: { zh: '捺', en: 'Right-falling', desc: '由左上到右下嘅斜筆' },
  dim2: { zh: '點', en: 'Dot', desc: '短促嘅點按筆畫' },
  zit3: { zh: '折', en: 'Turning', desc: '方向改變嘅折筆' },
  ngau1: { zh: '鉤', en: 'Hook', desc: '筆畫末端嘅鉤形轉折' },
  tai4: { zh: '提', en: 'Rising', desc: '由左下到右上嘅短斜筆' }
};
