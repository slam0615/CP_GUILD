
import { Achievement, BGM, Holiday, Title } from './types';

export const TITLES: Title[] = [
  { lv: 1, name: "路過的村民", status: "手上只有一把生鏽的鋤頭", rank: "bronze", icon: "fa-user" },
  { lv: 2, name: "除草工", status: "發現這片荒地有點大", rank: "bronze", icon: "fa-scissors" },
  { lv: 3, name: "翻土學徒", status: "學會了如何不把土撒在自己身上", rank: "bronze", icon: "fa-trowel" },
  { lv: 4, name: "種子收集員", status: "口袋裡裝滿了各種奇怪的腦洞", rank: "bronze", icon: "fa-seedling" },
  { lv: 5, name: "萌芽觀察者", status: "盯著空白文檔發呆了一整天", rank: "bronze", icon: "fa-magnifying-glass" },
  { lv: 6, name: "澆水小童", status: "用眼淚灌溉乾涸的糧倉", rank: "bronze", icon: "fa-droplet" },
  { lv: 7, name: "初級農夫", status: "終於長出了一點綠色的東西", rank: "bronze", icon: "fa-plant-wilt" },
  { lv: 8, name: "施肥專家", status: "雖然是玻璃渣但也是養分", rank: "bronze", icon: "fa-poop" },
  { lv: 9, name: "捉蟲大隊", status: "消滅錯字，人人有責", rank: "bronze", icon: "fa-bug" },
  { lv: 10, name: "見習冒險者", status: "終於走出了新手村", rank: "bronze", icon: "fa-person-hiking" },
  { lv: 11, name: "腦洞記錄員", status: "筆記本比作品還厚", rank: "silver", icon: "fa-book-open" },
  { lv: 12, name: "短篇練習生", status: "試著寫了一些沒頭沒尾的東西", rank: "silver", icon: "fa-pencil" },
  { lv: 13, name: "塗鴉愛好者", status: "畫了火柴人並感到驕傲", rank: "silver", icon: "fa-paintbrush" },
  { lv: 14, name: "深夜碼字工", status: "黑眼圈是努力的勳章", rank: "silver", icon: "fa-moon" },
  { lv: 15, name: "北極圈居民", status: "這裡好冷，但我有愛", rank: "silver", icon: "fa-snowflake" },
  { lv: 16, name: "自耕農", status: "自己產糧自己吃，真香", rank: "silver", icon: "fa-utensils" },
  { lv: 17, name: "糧倉管理員", status: "開始有了少量的庫存", rank: "silver", icon: "fa-warehouse" },
  { lv: 18, name: "小有名氣", status: "偶爾會收到路人的點讚", rank: "silver", icon: "fa-thumbs-up" },
  { lv: 19, name: "催更受害者", status: "被讀者追著跑的感覺真好", rank: "silver", icon: "fa-person-running" },
  { lv: 20, name: "熟練工", status: "產糧已經成為肌肉記憶", rank: "silver", icon: "fa-hammer" },
  { lv: 21, name: "純愛戰士", status: "相信愛能戰勝一切OOC", rank: "gold", icon: "fa-heart" },
  { lv: 22, name: "修羅場倖存者", status: "在截稿日前一秒滑壘成功", rank: "gold", icon: "fa-stopwatch" },
  { lv: 23, name: "坑底釘子戶", status: "只要我不走，這坑就是熱的", rank: "gold", icon: "fa-anchor" },
  { lv: 24, name: "同人煉金術師", status: "將妄想轉化為實體的魔術", rank: "gold", icon: "fa-flask" },
  { lv: 25, name: "產糧大戶", status: "餵飽了一群嗷嗷待哺的雛鳥", rank: "gold", icon: "fa-bowl-food" },
  { lv: 26, name: "糖分供給商", status: "你的作品甜到令人蛀牙", rank: "gold", icon: "fa-candy-cane" },
  { lv: 27, name: "刀片批發商", status: "寄來的刀片足以蓋別墅", rank: "gold", icon: "fa-khanda" },
  { lv: 28, name: "開車老司機", status: "車速太快，車門焊死了", rank: "gold", icon: "fa-taxi" },
  { lv: 29, name: "全能創作者", status: "圖文雙修，恐怖如斯", rank: "gold", icon: "fa-layer-group" },
  { lv: 30, name: "圈內大手", status: "名字開始在河道上流傳", rank: "gold", icon: "fa-hand-sparkles" },
  { lv: 31, name: "心靈捕手", status: "精準戳中讀者的XP系統", rank: "plat", icon: "fa-bullseye" },
  { lv: 32, name: "坑王之王", status: "挖坑不填，但是真香", rank: "plat", icon: "fa-person-digging" },
  { lv: 33, name: "肝帝", status: "你的肝是指甲油做的嗎？", rank: "plat", icon: "fa-fire" },
  { lv: 34, name: "人肉印表機", status: "產出速度比官方還快", rank: "plat", icon: "fa-print" },
  { lv: 35, name: "官方逼死同人", status: "原作都沒你懂", rank: "plat", icon: "fa-book-skull" },
  { lv: 36, name: "鎮圈神手", status: "你的ID就是糧食的保證", rank: "plat", icon: "fa-crown" },
  { lv: 37, name: "同人活字典", status: "記得所有冷門設定", rank: "plat", icon: "fa-scroll" },
  { lv: 38, name: "光之顯現", status: "你的作品照亮了黑暗的坑底", rank: "plat", icon: "fa-sun" },
  { lv: 39, name: "信仰中心", status: "已經有人開始為你建立祭壇", rank: "plat", icon: "fa-place-of-worship" },
  { lv: 40, name: "傳奇冒險者", status: "公會裡流傳著你的事蹟", rank: "plat", icon: "fa-dragon" },
  { lv: 41, name: "半神", status: "脫離了低級趣味的存在", rank: "diamond", icon: "fa-cloud" },
  { lv: 42, name: "宇宙觀測者", status: "看透了所有CP的本質", rank: "diamond", icon: "fa-eye" },
  { lv: 43, name: "時間領主", status: "能操控截稿日的流動", rank: "diamond", icon: "fa-hourglass" },
  { lv: 44, name: "因果律兵器", status: "筆下的BE能改變世界線", rank: "diamond", icon: "fa-meteor" },
  { lv: 45, name: "妄想具現化", status: "想什麼就有什麼", rank: "diamond", icon: "fa-wand-magic-sparkles" },
  { lv: 46, name: "愛之化身", status: "本身就是愛的聚合體", rank: "diamond", icon: "fa-heart-pulse" },
  { lv: 47, name: "奇蹟創造者", status: "冷坑復興的希望", rank: "diamond", icon: "fa-star" },
  { lv: 48, name: "永恆的筆尖", status: "只要你還在，圈子就不會死", rank: "diamond", icon: "fa-pen-fancy" },
  { lv: 49, name: "次元觀測者", status: "打破了第四面牆", rank: "diamond", icon: "fa-cube" },
  { lv: 50, name: "創世神", status: "你創造了這個宇宙，你就是規則", rank: "diamond", icon: "fa-infinity" }
];

export const ACHIEVEMENTS: Achievement[] = [
  // 1. 新手起步 (Start)
  { id: 'first_draw', icon: 'fa-pencil', name: '第一筆', desc: '完成首次繪圖' },
  { id: 'first_write', icon: 'fa-pen-nib', name: '新篇章', desc: '完成首次寫作' },
  { id: 'side_starter', icon: 'fa-shoe-prints', name: '試吃員', desc: '完成首次支線' },
  { id: 'streak_3', icon: 'fa-fire', name: '熱身運動', desc: '連續完成任務 3 次' },
  { id: 'level_5', icon: 'fa-star', name: '嶄露頭角', desc: '達到等級 5' },

  // 2. 產量與肝度 (Grind)
  { id: 'draw_10', icon: 'fa-palette', name: '塗鴉愛好者', desc: '繪圖累計 10 次' },
  { id: 'draw_30', icon: 'fa-brush', name: '資深畫師', desc: '繪圖累計 30 次' },
  { id: 'draw_50', icon: 'fa-paintbrush', name: '人肉印表機', desc: '繪圖累計 50 次' },
  { id: 'write_10', icon: 'fa-book', name: '文豪降世', desc: '寫作累計 10 次' },
  { id: 'write_30', icon: 'fa-feather', name: '多產作家', desc: '寫作累計 30 次' },
  { id: 'write_50', icon: 'fa-keyboard', name: '鍵盤鋼琴家', desc: '寫作累計 50 次' },
  { id: 'side_20', icon: 'fa-dice', name: '梗王', desc: '完成 20 個支線' },
  { id: 'total_100', icon: 'fa-layer-group', name: '百人斬', desc: '總產出達到 100 份' },
  { id: 'tentacle_monster', icon: 'fa-spider', name: '觸手怪', desc: '單日完成 3 份以上的產出' },

  // 3. 連續與持久 (Streak & Loyalty)
  { id: 'streak_10', icon: 'fa-fire-flame-curved', name: '肝帝', desc: '連續完成任務 10 次' },
  { id: 'streak_30', icon: 'fa-fire-burner', name: '鐵肝戰士', desc: '連續完成任務 30 次' },
  { id: 'daily_checkin_30', icon: 'fa-calendar-days', name: '公會常駐民', desc: '累計打卡 30 天' },
  { id: 'cp_devoted', icon: 'fa-heart-circle-check', name: '純情派', desc: '連續 5 次產出皆為相同 CP' },
  { id: 'harem_master', icon: 'fa-users-line', name: '博愛黨', desc: '連續 5 次產出皆為不同 CP' },

  // 4. 時間管理 (Time)
  { id: 'early_bird', icon: 'fa-sun', name: '早起鳥', desc: '在清晨 05:00-09:00 產出' },
  { id: 'night_owl', icon: 'fa-moon', name: '修仙黨', desc: '在深夜 22:00-02:00 產出' },
  { id: 'midnight_emo', icon: 'fa-cloud-moon-rain', name: '深夜網抑雲', desc: '在凌晨 02:00-05:00 產出' },
  { id: 'blue_monday', icon: 'fa-face-tired', name: '週一症候群', desc: '在星期一產出以對抗憂鬱' },
  { id: 'happy_friday', icon: 'fa-champagne-glasses', name: 'TGIF', desc: '在星期五產出迎接週末' },
  { id: 'weekend_warrior', icon: 'fa-mug-hot', name: '週末戰士', desc: '在週六或週日產出' },
  { id: 'procrastinator', icon: 'fa-stopwatch-20', name: '死線舞者', desc: '在週日 23:00 後提交當週任務' },

  // 5. 內容屬性 (Content Stats)
  { id: 'r18_driver', icon: 'fa-car', name: '老司機', desc: '發布過 R-18 作品' },
  { id: 'abyss_walker', icon: 'fa-dungeon', name: '深淵行者', desc: '累計發布 10 篇 R-18 作品' },
  { id: 'pure_love', icon: 'fa-dove', name: '純愛戰神', desc: '發布過 5 篇 G 級 (全年齡) 作品' },
  { id: 'saint', icon: 'fa-cross', name: '大聖女', desc: '累計發布 20 篇 G 級 (全年齡) 作品' },
  { id: 'word_count_king', icon: 'fa-scroll', name: '萬字戶', desc: '單篇小說字數超過 10,000 字' },
  { id: 'short_poet', icon: 'fa-feather-pointed', name: '短打詩人', desc: '單篇小說字數少於 500 字' },
  { id: 'word_accumulator', icon: 'fa-sack-dollar', name: '字數大富翁', desc: '生涯總字數突破 50,000 字' },
  { id: 'light_novelist', icon: 'fa-book-open-reader', name: '輕小說家', desc: '作品標題長度超過 15 個字' },
  { id: 'naming_sense_zero', icon: 'fa-font', name: '取名廢', desc: '作品標題為「無題」或「Untitled」' },

  // 6. 節日與特殊 (Special)
  { id: 'holiday_sniper', icon: 'fa-gift', name: '節日狙擊手', desc: '在特殊節日當天產出' },
  { id: 'valentine_lover', icon: 'fa-heart-pulse', name: '情人節專屬', desc: '在 2/14 或 3/14 產出' },
  { id: 'double_kill', icon: 'fa-clone', name: '魔武雙修', desc: '同一天完成繪圖與寫作' },
  { id: 'balanced_diet', icon: 'fa-scale-balanced', name: '營養均衡', desc: '圖文產量皆超過 5 且差距小於 20%' },
  { id: 'retro_gamer', icon: 'fa-clock-rotate-left', name: '時光旅人', desc: '使用補登功能提交 30 天前的作品' },
  { id: 'reset_master', icon: 'fa-rotate-left', name: '洗點大師', desc: '使用過重置任務功能' },

  // 7. 高等級與成就 (High Level)
  { id: 'level_20', icon: 'fa-trophy', name: '獨當一面', desc: '達到等級 20' },
  { id: 'level_30', icon: 'fa-gem', name: '鎮圈之寶', desc: '達到等級 30' },
  { id: 'level_40', icon: 'fa-crown', name: '傳奇人物', desc: '達到等級 40' },
  { id: 'level_50', icon: 'fa-sun', name: '創世神', desc: '達到等級 50' },
  { id: 'achievement_hunter', icon: 'fa-medal', name: '大滿貫', desc: '解鎖 50 個榮譽勳章' },

  // 8. 補充趣味 (Fun / Extra)
  { id: 'speed_runner', icon: 'fa-bolt', name: '光速產糧', desc: '在週一就完成週繪圖任務' },
  { id: 'berserker', icon: 'fa-gavel', name: '狂戰士', desc: '單月總字數突破 30,000' },
  { id: 'archmage', icon: 'fa-hat-wizard', name: '大魔導師', desc: '支線任務累計完成 30 次' },
  { id: 'necromancer', icon: 'fa-skull', name: '死靈法師', desc: '補登了一年前的舊稿' },
  { id: 'bard', icon: 'fa-music', name: '吟遊詩人', desc: '寫作累計 50 次' }, // Reused slot
  { id: 'assassin', icon: 'fa-user-ninja', name: '暗殺者', desc: '在凌晨 03:00-04:00 更新' },
  { id: 'paladin', icon: 'fa-shield', name: '守護者', desc: '連續 10 次產出無 R-18 內容' },
  { id: 'merchant', icon: 'fa-coins', name: '地精商人', desc: '總產出次數達到 88 次' },
  { id: 'legend', icon: 'fa-dragon', name: '傳說', desc: '等級 50 且成就 40 個' },
  { id: 'lunch_break', icon: 'fa-burger', name: '午休摸魚', desc: '在 12:00-13:00 產出' },
  { id: 'workday_hero', icon: 'fa-briefcase', name: '薪水小偷', desc: '平日上班時間 (09-17) 產出' }
];

export const SPICY_QUOTES = {
  // 通用催稿金句 (80句)
  general: [
    "如果不由你寫你的CP，誰還會幫你寫呢？",
    "你的推在哭，因為你還沒寫完他們的 Happy Ending。",
    "坑填了嗎？還敢滑推特啊？",
    "自耕農是沒有休息日的。",
    "官方發糖是官方的，你自己產的才是真的。",
    "看別人的糧是為了活下去，自己產糧是為了證明活過。",
    "截稿日是第一生產力。",
    "為了那碟醋(CP)，包了這頓餃子(產糧)。",
    "不要問官方給了什麼，要問你為CP做了什麼。",
    "用愛發電，全年無休。",
    "R18是人類文明的瑰寶，請多產出。",
    "拖延症是絕症，唯有截稿日可醫。",
    "每一筆都是對CP的告白。",
    "你的CP在冷風中裸奔，因為你還沒畫衣服。",
    "餓死事小，拆逆事大，快去產糧護航！",
    "狼若回頭，必有緣由；不是報恩，就是想吃肉(產糧)。",
    "雖然很冷，但這對CP是真的！",
    "今天的你，產糧了嗎？",
    "你的草稿在哭泣，聽見了嗎？",
    "再不畫完，手感就要離家出走了。",
    "隔壁棚的糧都滿出來了，你還在摸魚？",
    "只要膽子大，每日都是情人節。",
    "清水文雖然健康，但偶爾也想吃肉啊。",
    "你的讀者正在刷F5等你更新。",
    "坑而不填，此恨綿綿無絕期。",
    "今天少寫一行，明天火葬場。",
    "修羅場是檢驗真愛的唯一標準。",
    "熬夜一時爽，一直熬夜...火葬場見。",
    "肝臟在燃燒，那是愛的火花。",
    "不管是BE還是HE，寫出來就是好E。",
    "WIP資料夾裡的檔案已經開始長灰了。",
    "本命都在等你餵食，副CP也餓扁了。",
    "腦洞再大，不動筆也只是空氣。",
    "靈感會逃跑，但deadline不會。",
    "你的繪師/寫手魂正在向你招手(催稿)。",
    "噗浪河道都乾了，還不快去灌溉？",
    "AO3的草稿箱不是養老院。",
    "冷門CP靠你一人扛，不產糧誰產糧？",
    "tag底下只有三篇文，其中兩篇還是你寫的。",
    "同擔們都在嗷嗷待哺，你忍心嗎？",
    "開場前一天趕稿叫刺激，開場當天趕稿叫活該。",
    "印廠不等人，肝也不等你休息。",
    "本子不會自己生出來，快動筆吧。",
    "委託印廠的錢都付了，還不肝嗎？",
    "攤位號碼都拿到了，作品在哪裡？",
    "預售都開了，貨呢？貨在哪？",
    "你的太太人設還在裸奔，快給他穿衣服！",
    "線稿三個月，上色三小時，這樣對嗎？",
    "草稿美如畫，完稿毀所有？不，是你根本沒完稿。",
    "別再說改天了，改天是哪天？",
    "滑推特一小時，寫文五分鐘，很會喔。",
    "看了十篇糧文，自己還是零產出。",
    "別人在產糧，你在生產焦慮。",
    "有時間哭喪著臉說沒靈感，不如現在就寫一句。",
    "摸魚摸到手軟，不如打字打到手痠。",
    "你的肝還健在，CP還沒糖吃。",
    "凌晨三點的你最有才華，醒來看草稿卻想哭。",
    "存稿是什麼？能吃嗎？",
    "有人等著你的更新勝過等發薪日。",
    "筆不會自己動，但deadline會自己到。",
    "你的畫技在退步，因為你三個月沒開檔了。",
    "文筆會生鏽，趁還能寫快點寫。",
    "構思了半年，動筆三分鐘，放棄一瞬間。",
    "Word檔開著，游標閃了三小時，字數還是零。",
    "圖層開了五十個，進度還在草稿階段。",
    "參考資料存了1GB，作品產出0KB。",
    "收藏別人的作品很容易，產出自己的很難，但你必須。",
    "靈感來的時候不寫，現在叫他他不應。",
    "一日不寫，手感全無；三日不畫，神仙難救。",
    "你的讀者分不清是作者棄坑還是詐屍。",
    "更新頻率比官方還慢，這樣真的好嗎？",
    "想要收到讀者留言嗎？先更新再說。",
    "人家都出第三本了，你第一本還在難產。",
    "本子賣不掉是小事，本子生不出來是大事。",
    "場次都報名了，本還沒開始畫，心臟很大顆喔。",
    "創作者最大的敵人不是沒靈感，是不動手。",
    "你永遠可以相信deadline前的爆發力。",
    "沒有廢稿，只有還沒完成的作品。",
    "趁CP還在你心裡，趕快把他們寫出來。",
    "今天的拖延，是明天的加倍奉還。"
  ],
  
  // 寫作專用催稿金句 (20句)
  writing: [
    "字數不會自己長出來，手指動起來！",
    "大綱寫得再精美，正文是零也沒用。",
    "開頭寫了三千字，中間還在難產中。",
    "對話寫了一堆，劇情還沒推進半步。",
    "你的文檔標題比正文字數還多。",
    "「待補」標註了三個月，還要補到何時？",
    "起承轉合只寫了起，後面三個去哪了？",
    "肉文大綱都列好了，正片還在清水階段。",
    "錯字比正文還多，是在寫密碼嗎？",
    "文風不統一沒關係，先寫完再說。",
    "你的CP在Word裡等了半年，連個吻都沒有。",
    "五千字的坑，挖了一萬字的設定。",
    "台詞寫得很溜，心理描寫在哪裡？",
    "標點符號用得很開心，正文呢？",
    "存了二十個標題，一篇都沒開始寫。",
    "AO3草稿箱裡躺了十篇開頭。",
    "PWP寫成了全年齡，你是在搞笑嗎？",
    "番外都構思好了，正文還沒生出來。",
    "寫文不是在寫論文，不用完美主義，先寫再說。",
    "你上次更新是什麼時候？讀者都忘記劇情了。"
  ],
  
  // 繪圖專用催稿金句 (20句)
  drawing: [
    "草稿永遠最好看，因為你不敢描線。",
    "線稿躺了三個月，顏色呢？背景呢？",
    "圖層命名比畫圖還認真。",
    "你的畫筆在哭泣，因為你只會開新檔案。",
    "構圖參考存了一百張，自己還是零產出。",
    "色稿打光打了一週，人物還是白模狀態。",
    "筆刷收集癖又發作了？先畫完一張圖吧。",
    "Pinterest逛了三小時，畫布還是空白的。",
    "圖釘了一堆參考，結果還是畫不出來。",
    "色卡調了五十組，圖還沒開始上色。",
    "你的繪圖軟體都要過期了，還不開工？",
    "手繪板落灰了，它想念你的溫度。",
    "畫技會退步，三個月不畫等於歸零。",
    "臨摹一百張不如原創一張。",
    "別再盯著大觸的圖了，你自己的圖呢？",
    "草稿美如畫，線稿歪如麻，所以你卡在草稿？",
    "你的OC設定圖還沒畫出來，角色都要哭了。",
    "背景不會畫沒關係，先把人物畫出來。",
    "畫到一半就開新圖，你的WIP資料夾要爆炸了。",
    "同人場要到了，封面都還沒開始畫喔？"
  ]
};

export const PROMPTS = [
  // 日常生活系列
  "相擁入眠", "一同外出購物", "半夜一起看恐怖電影", "一方的起床氣", "烹飪/下廚", 
  "大掃除", "瀏覽過往照片", "吐嘈對方的生活習慣", "相隔兩地的電話", "早安吻", 
  "替對方挑衣服", "討論關於寵物話題", "一方臥病在床", "午睡", "幫對方吹頭髮", 
  "出浴後的怦然心動", "慶祝某個紀念日", "接對方回家", "離家出走", "一個驚喜", 
  "屋頂上觀星", "一場飛來橫禍", "討論關於孩子問題", "因惡劣天氣被困在家", "喝醉", 
  "無傷大雅的打打鬧鬧", "穿錯衣服", "一方受輕傷", "意外的求婚", "滾床單",
  
  // 情侶互動系列
  "兩個人一起逛街", "兩個人在沒有空調的房間裡擁抱睡覺", "兩個人打一個小時的電話", 
  "兩個人分別之後見面的第一件事情", "給彼此洗澡", "每天表白一次", "生日那天親自下廚", 
  "辦一場盛大的婚禮", "兩個人的野營", "情敵被兩人共同打退", "信任", "親吻", 
  "床上的情話", "給對方起外號", "一起填滿一整個暑假", "撒嬌", "永遠不被拒絕", 
  "為了對方去做一件事情", "廚房裡的誘惑", "清晨的早安吻", "偷偷定制的戒指", 
  "花粉過敏卻依然會接受的花", "迷路之後的火速到達", "吃寵物的醋", "兩個人的情侶照", 
  "鼓起勇氣帶對方回家", "偶爾的反攻", "一起裝修房子", "在夢裡偷偷遇見", "一直一直在一起",
  
  // 甜蜜場景系列
  "顫動的指尖正微微發燙", "後知後覺的撒嬌", "突如其來的熱視線", "維他命不需要哦！", 
  "你的體溫", "第一次的晚安吻", "既丟臉又害羞的約會", "安靜的幸福進行式", 
  "心跳聲無限放大", "笨拙的我們", "伴隨花束一起送出的心意", "請再說一次吧？", 
  "戀愛ing", "為你寫詩", "紅茶與提拉米蘇", "當呼吸化為喘息", "無法拒絕的可愛請求", 
  "收集不完的溫柔", "挨近了你的唇", "圖書館裡的戀愛習題", "反覆無常的甜蜜刺激", 
  "雨天製造的親密距離", "鼻子蹭過來了！", "耳邊的呢喃", "表情犯規", "桌子下的小動作", 
  "交換日記", "睡顏誘惑", "被窩裡的情歌", "腳趾纏繞",
  
  // 物品道具系列
  "初次拜訪", "冰箱上的留言", "成對的咖啡杯", "購物", "穿用對方的東西", "誤會", 
  "戀人的背影", "故地重游", "拿手菜", "搬家", "合影", "紀念日", "被拒絕的要求", 
  "旅行", "牽手", "手機裡的錄音", "看電影", "用同一副餐具吃東西", "依偎", 
  "心電感應", "小矛盾", "遷就", "燭光晚餐", "遺囑", "裝飾品", "情書", "壞習慣", 
  "第一次心動", "眼淚", "約定",
  
  // 細節描寫系列
  "一杯可樂，兩支吸管", "睡著的貓和他", "遲到五分鐘", "撩起瀏海後落於額上的親吻", 
  "床單要綠色還是藍色？", "領帶歪了", "「我忘了拿浴巾」", "永不忘的手機號碼", 
  "不得已的大掃除", "「猜猜我是誰？」", "路燈下親吻的影子", "十指交扣", "二重奏", 
  "哭泣時覆上眼的手", "小地震時的緊緊相擁", "親手剪髮", "我回來了", "偶爾蹦出的粗口", 
  "只有一間單人房", "在原地等待", "視頻通話中熟悉的笑容", "Yes，I do", 
  "握著手機時轉身看見", "海灣吻痕", "翻閱過去的相冊", "雨後日光下的河", "帶你遠行", 
  "相隔兩地的長途電話", "百年後用時間見證",
  
  // 身體部位/動作描寫
  "眼角的淚痣", "丹鳳眼／眼線", "仰頭喝水時上下滾動的喉結", "微揚起頭時的頸線", 
  "白皙的後頸", "微含著櫻桃／草莓的嘴唇", "曲線美好的後背", "濕漉漉的頭髮", 
  "下雨天貼在身上的襯衫", "露出鎖骨的領口", "隔著衣物挺起的乳頭", "脫衣服時掀起到一半", 
  "伸懶腰時露出的側腰線", "低腰褲和人魚線", "含住冰棒", "幫對方舔去衣服上的冰淇淋／牛奶／蛋糕", 
  "微抿盛著紅酒的高腳杯", "吮吸對方的手指", "酒醉之後潮紅的臉頰", "夾起瀏海的髮夾", 
  "慵懶的陷進沙發", "夾菸的手指", "用牙齒替對方拉開拉鍊", "沐浴後還未擦乾身上的水珠", 
  "處理傷口時壓抑的呻吟", "在耳邊漫語的低音", "貼在曖昧位置的創可貼", 
  "肩上的咬痕／背上的抓痕", "刮得乾淨／略帶鬍渣的下巴", "在大腿內側刺青",
  
  // 秘密戀情系列
  "有鏡頭在", "噓，別出聲", "眼神", "不要再讓我當你們兩個的擋箭牌啦", "天黑才能抱住你", 
  "見光死", "被發現了嗎", "全世界查無此人", "問起你的話，就說你是—--", "把你藏在衣櫃", 
  "只有我能看到你/其他人看不到我", "不要告訴他/他不知道的事", "熟悉的陌生人", 
  "課桌下的牽手", "陌生號碼來電", "敵在明我在暗", "謊言", "雙重人格", "背後", 
  "觸不到的你", "第二身份", "私下約定好在大眾面前做同樣的事，悄悄的，也會滿足", 
  "短信刪除", "私密文件夾", "一前，一後", "在心裡偷笑", "相對全世界大聲介紹你", 
  "臆想症", "我們只是朋友", "你真的存在嗎",
  
  // 心理學主題系列
  "喚醒／刺激", "心流", "淨化／發洩", "情緒", "失憶症（器質性／心因性）", "無意識", 
  "控制感", "決定論／自由意志", "均衡理論（三個人很難相處的構造性問題）", 
  "既視感／記憶錯誤", "防禦機制", "身體型疾患（雖然是生理上的病痛，但導因是心理上的缺陷）", 
  "感官習慣", "雙重情感", "精神分裂", "條件反射", "監獄實驗（Stanford prison experiment）", 
  "感覺剝奪實驗", "刺蝟理論（太靠近而互相傷害）", "胺基酸組合效應（一即一切）", 
  "基爾伯特法則（真正的危險是沒有人跟你提及過他的危險之處）", 
  "弗里德曼定律（越是利益互補，越是相互滿足）", "小池定律（越是沉迷的東西，越是抓住不放）", 
  "磨合效應（為了彼此契合而必須相互割捨）", "皮格瑪利翁（深情得賦予愛生命）", 
  "記憶偏差", "獨特性錯覺（人人都自以為自己獨一無二）", "自我本位偏見", 
  "瀕死體驗／離體現象", "愛（熱情、親密、獻身三要素）",
  
  // 季節場景系列
  "雪水融化而成的溪流", "春櫻（或者其他什麼花）的枝頭", "花香與體香", "候鳥的遷徙", 
  "雪層下潛伏的生命", "去踏青", "風鈴和西瓜", "鋪滿蟬鳴的林蔭道延伸至遠方", 
  "在房頂上仰望星空", "仲夏夜的夢", "夏日祭與煙火", "怪談", "不安定的海", 
  "突如其來的雷雨天氣", "暴風雨之前的原野", "成熟的氣味", "曬被子", "朝露", 
  "撒播希望", "落在湖面的楓葉", "冰層之下的魚", "光雨雪", "暖爐", 
  "冬季有太陽的清晨", "雪上的印記", "新年湖綜合聖誕", "深夜的冰海", 
  "穿越樹葉與髮絲的光", "繁茂的植物", "假期合宿",
  
  // 夢境主題系列
  "墜落", "追逐或被追逐", "殺人或者被殺", "迷宮", "鬼打牆", "不存在于世上的美景", 
  "世界末日", "虛幻的愛人", "好像變了一個人的自己", "變異的日常", "架空世界的生活", 
  "破壞衝動", "無頭尾的悲劇", "死後繼續徘徊在世界上", "旅行", "這是前世吧", 
  "超能力", "永世沉淪", "夢中夢", "獨自一人", "幸福", "閉環", "大冒險", "飛翔", 
  "莫名的懷念感", "被禁錮", "自殺", "充滿象徵和預言般的意味／符號", "本以為早已忘記了的", 
  "名字",
  
  // 英文單字命題 - 情愛與死亡
  "Prologue 序言", "Xanthe 桑席", "Amaranthine 不凋的", "Caress 愛撫", "Toxic 有毒的", 
  "Farewell 再會", "Ash 灰燼", "Misty 淚眼迷蒙", "Kalmia 山月桂", "Miserable 悲慘的", 
  "Tears 眼淚", "Lovebite 愛痕", "Doomsday 世界末日", "illuminati 先覺者", "Lapis 寶石", 
  "Angelfish 神仙魚", "Mirror 鏡子", "Paradise 天堂", "Sheen 發光", "Fever 發燒", 
  "Iris 鳶尾", "Panacea 萬靈藥", "Cageling 籠中鳥", "Zendic 無神論者", "Zephyr 和風", 
  "Zoanthropy 變獸妄想", "ZOE 生命", "Twins 雙子", "Sorrow 悲傷", "Debaucher 墮落者", 
  "Slave 奴隸", "Dear 親愛的", "Virulence 劇毒", "Ashtray 煙灰缸", "Vampire 吸血鬼", 
  "Debonair 無憂無慮的", "Beastliness 獸性", "Grave 墓穴", "Saint 聖徒", "Goodbye 再見",
  
  // 英文單字命題 - 情愛與浪漫
  "Ephemeral 短暫的", "Reverie 幻想", "Serenade 小夜曲", "Rapture 狂喜", "Covenant 誓約", 
  "Euphoria 欣快", "Entwine 纏繞", "Melancholia 憂鬱", "Elegy 輓歌", "Requiem 安魂曲", 
  "Lament 悲嘆", "Oblivion 遺忘", "Revenant 歸來者", "Nocturne 夜曲", "Threnody 悲歌", 
  "Ethereal 空靈的", "Labyrinth 迷宮", "Eclipse 蝕", "Seraphim 熾天使", "Siren 海妖", 
  "Serpent 蛇", "Tempest 暴風雨", "Oleander 夾竹桃", "Belladonna 顛茄", "Dahlia 大理花", 
  "Gossamer 蛛絲", "Nebula 星雲", "Vesper 晚禱", "Crimson 深紅", "Scarlet 猩紅色", 
  "Vermillion 朱紅", "Obsidian 黑曜石", "Amber 琥珀", "Velvet 天鵝絨", 
  "Iridescent 彩虹色的", "Vertigo 眩暈", "Languor 倦怠", "Lunacy 瘋狂", 
  "Lachrymose 愛哭的", "Solace 慰藉",
  
  // 英文單字命題 - 愛與慾望
  "Ardor 熱情", "Adoration 崇拜", "Devotion 奉獻", "Longing 渴望", "Yearning 懷念", 
  "Ecstasy 狂喜", "Intoxicate 使陶醉", "Temptation 誘惑", "Obsession 迷戀", 
  "Mortality 必死性", "Perish 消亡", "Sepulcher 墳墓", "Crypt 地下墓室", "Epitaph 墓誌銘", 
  "Pyre 火葬用的柴堆", "Wither 枯萎", "Decay 腐朽", "Cadaver 屍體", "Elysium 極樂世界", 
  "Arcane 神秘的", "Enigma 謎", "Oracle 神諭", "Chimera 奇想", "Phoenix 鳳凰", 
  "Sphinx 斯芬克斯", "Nymph 仙女", "Succubus 女夢魔",
  
  // 英文單字命題 - 花卉與時間
  "Lotus 蓮花", "Lilac 紫丁香", "Peony 牡丹", "Camellia 山茶花", "Wisteria 紫藤", 
  "Anemone 銀蓮花", "Hyacinth 風信子", "Hemlock 毒芹", "Eternity 永恆", "Infinity 無限", 
  "Perpetual 永久的", "Timeless 永恆的", "Moment 瞬間", "Anguish 極度痛苦", "Despair 絕望", 
  "Bliss 極樂", "Serenity 寧靜", "Turmoil 混亂", "Fragile 脆弱的", "Torment 折磨", 
  "Agony 極度痛苦", "Affliction 苦惱", "Sanctuary 避難所",
  
  // 英文單字命題 - 美與魅惑
  "Enchantment 魔力", "Allure 誘惑力", "Mesmerize 施催眠術", "Captivate 迷住", 
  "Bewitching 迷人的", "Glamour 魅力", "Exquisite 精緻的", "Sublime 崇高的", 
  "Delicate 精緻的", "Radiance 光輝"
];

// 統計資訊
// 總計: 500+ 個創作命題
// 分類:
// - 日常生活系列: 30個
// - 情侶互動系列: 30個
// - 甜蜜場景系列: 30個
// - 物品道具系列: 30個
// - 細節描寫系列: 30個
// - 身體部位/動作描寫: 30個
// - 秘密戀情系列: 30個
// - 心理學主題系列: 30個
// - 季節場景系列: 30個
// - 夢境主題系列: 30個
// - 英文單字命題: 140個

export const CHALLENGES = [
  // 原有的15個
  "【限制】全程只使用對話描寫，不使用任何引號。",
  "【視角】從路人/物品(如咖啡杯)的視角旁觀這一切。",
  "【氛圍】將原本溫馨的梗寫成恐怖/懸疑風格。",
  "【AU設定】哨兵嚮導設定，一方正處於結合熱/神游。",
  "【AU設定】花吐症設定，一方隱瞞病情。",
  "【AU設定】ABO設定，在抑制劑失效的時候。",
  "【反轉】故事的結尾必須推翻開頭的認知。",
  "【感官】重點描寫氣味與聲音，忽略視覺描寫。",
  "【時間】發生在分手後/決裂後的重逢時刻。",
  "【時間】倒敘法，從結局開始往前推。",
  "【情境】兩人被手銬/魔法強制銬在一起無法分開。",
  "【情境】一方失憶，另一方試圖喚醒記憶(或隱瞞)。",
  "【情境】一方變成了動物(貓/狗/兔子)。",
  "【情境】只有一個人記得對方，另一個人完全陌生。",
  "【風格】用童話寓言的筆觸來寫這個梗。",
  
  // 新增的50+個挑戰
  
  // AU設定系列
  "【AU設定】Harry Potter世界觀，兩人分屬不同學院。",
  "【AU設定】中世紀騎士與王族/巫師的禁忌之戀。",
  "【AU設定】賽博龐克未來，一方是AI/生化人。",
  "【AU設定】吸血鬼AU，血族與獵人/人類的糾葛。",
  "【AU設定】神話世界，神明與凡人的命定之緣。",
  "【AU設定】遊戲世界NPC設定，一方意識到自己在遊戲中。",
  "【AU設定】Soulmate AU，靈魂伴侶標記/共感/倒計時。",
  "【AU設定】天使惡魔設定，陣營對立但命運交織。",
  "【AU設定】海妖/人魚設定，海陸兩界的跨越。",
  "【AU設定】死神使者設定，一方來收割靈魂。",
  "【AU設定】時間旅行者設定，只有一方能穿越時空。",
  "【AU設定】咒術設定，一方被詛咒/封印需要破解。",
  "【AU設定】賽博格/義體人設定，逐漸失去人性。",
  "【AU設定】異能者學園，能力互補或互相牽制。",
  
  // 限制系列
  "【限制】全文不超過500字，必須包含起承轉合。",
  "【限制】不能使用「愛」「喜歡」「思念」等直接情感詞彙。",
  "【限制】每段必須以同一個字開頭。",
  "【限制】全文採用第二人稱「你」來書寫。",
  "【限制】只能使用單音節詞或疊詞(如：看看、慢慢)。",
  "【限制】全文不出現人名，只用代稱。",
  "【限制】必須包含五種顏色的描寫。",
  "【限制】每句話不超過十個字。",
  
  // 視角系列
  "【視角】上帝視角，能看到兩人內心但無法干預。",
  "【視角】從時間本身的視角觀察跨越時空的相遇。",
  "【視角】從「我們」的角度，兩人共同的第一人稱。",
  "【視角】從照片/信件/日記等載體的視角。",
  "【視角】從命運/緣分這個概念本身的視角。",
  "【視角】從房間/場所本身的視角，見證無數故事。",
  
  // 氛圍系列
  "【氛圍】喜劇荒誕風，將嚴肅情節寫成喜劇效果。",
  "【氛圍】詩意朦朧風，意象大於敘事。",
  "【氛圍】noir黑色電影風，陰鬱的氛圍與命運感。",
  "【氛圍】蒸氣波美學，復古未來主義的疏離感。",
  "【氛圍】純白治癒系，溫暖明亮的筆觸。",
  "【氛圍】哥特式浪漫，華麗黑暗的美學。",
  
  // 時間系列
  "【時間】時間循環設定，重複經歷同一天。",
  "【時間】時間靜止，只有兩人能夠行動。",
  "【時間】平行時空，多個時間線的自己相遇。",
  "【時間】時間差，兩人處於不同的時間流速。",
  "【時間】閃進未來，預見某個註定的結局。",
  "【時間】倒數24小時，世界/生命即將終結。",
  
  // 情境系列
  "【情境】困在電梯/密室/孤島等封閉空間。",
  "【情境】身體互換，靈魂進入對方身體。",
  "【情境】一方是鬼魂，另一方能看見。",
  "【情境】一方正在做夢，另一方闖入夢境。",
  "【情境】假死/詐死/誤以為對方已死。",
  "【情境】身分互換，玩弄對方的生活。",
  "【情境】一見鍾情但語言不通。",
  "【情境】被困在遊戲/虛擬世界中。",
  "【情境】一方是臥底/間諜，身分曝露。",
  "【情境】世界末日前夕的最後告白。",
  "【情境】目睹了不該看到的秘密。",
  "【情境】在婚禮/重要儀式上突然出現阻止。",
  
  // 感官系列
  "【感官】只描寫觸覺，忽略其他感官。",
  "【感官】用溫度的變化來敘事。",
  "【感官】通過味覺記憶來串連情節。",
  "【感官】用音樂/聲音作為時間與情感的座標。",
  
  // 反轉系列
  "【反轉】看似單箭頭實則雙向暗戀。",
  "【反轉】看似浪漫實則是精心設計的騙局。",
  "【反轉】看似主角的人其實只是配角。",
  "【反轉】看似現實實則是夢境/幻覺/臨終回憶。",
  
  // 風格系列
  "【風格】用武俠小說的筆法來寫現代故事。",
  "【風格】採用劇本/舞台劇格式來呈現。",
  "【風格】用詩歌/散文詩的形式書寫。",
  "【風格】模仿經典文學作品的語言風格。",
  "【風格】採用書信往返的形式推進劇情。",
  "【風格】用新聞報導/檔案記錄的格式。",
  "【風格】採用碎片化敘事，跳躍時空拼貼。",
  
  // 特殊設定系列
  "【特殊】禁止使用標點符號或只能用一種標點。",
  "【特殊】必須埋入5個以上的文學/影視梗。",
  "【特殊】採用雙線敘事，兩條故事線交織。",
  "【特殊】一方只能說謊，另一方只能說真話。",
  "【特殊】使用不可靠敘述者，敘述與真相不符。",
];

export const DEFAULT_HOLIDAYS: Holiday[] = [
  // Jan
  { date: '01-14', name: '日記情人節', type: 'love' }, { date: '01-31', name: '愛妻日', type: 'love' },
  // Feb
  { date: '02-02', name: '雙馬尾之日', type: 'fun' }, { date: '02-14', name: '西洋情人節', type: 'love' }, 
  { date: '02-22', name: '貓咪日', type: 'fun' },
  // Mar
  { date: '03-03', name: '女兒節', type: 'fun' }, { date: '03-14', name: '白色情人節', type: 'love' },
  // Apr
  { date: '04-14', name: '黑色情人節', type: 'fun' }, { date: '04-22', name: '好夫婦日', type: 'love' },
  // May
  { date: '05-10', name: '女僕之日', type: 'fun' }, { date: '05-14', name: '玫瑰情人節', type: 'love' }, 
  { date: '05-23', name: '接吻之日', type: 'love' },
  // Jun
  { date: '06-14', name: '親吻情人節', type: 'love' }, { date: '06-25', name: '百合之日', type: 'love' },
  // Jul
  { date: '07-07', name: '馬尾之日/七夕', type: 'love' }, { date: '07-14', name: '銀色情人節', type: 'love' },
  // Aug
  { date: '08-02', name: '兔女郎之日', type: 'fun' }, { date: '08-09', name: '擁抱之日', type: 'love' }, 
  { date: '08-14', name: '綠色情人節', type: 'love' }, { date: '08-21', name: '兔女郎之日(2)', type: 'fun' },
  // Sep
  { date: '09-06', name: '妹妹之日', type: 'fun' }, { date: '09-14', name: '相片情人節', type: 'love' }, 
  { date: '09-17', name: '告白日', type: 'love' }, { date: '09-29', name: '招財貓日', type: 'fun' },
  // Oct
  { date: '10-01', name: '眼鏡之日', type: 'fun' }, { date: '10-11', name: '眨眼之日', type: 'fun' }, 
  { date: '10-14', name: '紅酒情人節', type: 'love' }, { date: '10-30', name: '初戀之日', type: 'love' }, 
  { date: '10-31', name: '萬聖節', type: 'fun' },
  // Nov
  { date: '11-01', name: '犬之日', type: 'fun' }, { date: '11-02', name: '褲襪之日', type: 'fun' }, 
  { date: '11-11', name: 'Pocky日', type: 'fun' }, { date: '11-14', name: '電影情人節', type: 'love' }, 
  { date: '11-22', name: '好夫婦日', type: 'love' }, { date: '11-28', name: '好膝上襪日', type: 'fun' }, 
  { date: '11-29', name: '好肉日', type: 'fun' },
  // Dec
  { date: '12-14', name: '擁抱情人節', type: 'love' }, { date: '12-25', name: '聖誕節', type: 'love' }
];

export const BGM_LIST: BGM[] = [
  // JP
  { artist: "YOASOBI", title: "Racing Into The Night", type: "JP" }, { artist: "YOASOBI", title: "Idol", type: "JP" },
  { artist: "Ado", title: "Usseewa", type: "JP" }, { artist: "LiSA", title: "Gurenge", type: "JP" },
  { artist: "Kenshi Yonezu", title: "Lemon", type: "JP" }, { artist: "Official HIGE DANdism", title: "Pretender", type: "JP" },
  { artist: "Mrs. GREEN APPLE", title: "Inferno", type: "JP" }, { artist: "Aimer", title: "Kataomoi", type: "JP" },
  { artist: "Aimyon", title: "Marigold", type: "JP" }, { artist: "RADWIMPS", title: "Sparkle", type: "JP" },
  { artist: "King Gnu", title: "Hakujitsu", type: "JP" }, { artist: "Eve", title: "Kaikai Kitan", type: "JP" },
  { artist: "Vaundy", title: "Odoriko", type: "JP" }, { artist: "Fujii Kaze", title: "Shinunoga E-Wa", type: "JP" },
  { artist: "Linked Horizon", title: "Shinzou wo Sasageyo", type: "JP" }, { artist: "TK from Ling tosite sigure", title: "Unravel", type: "JP" },
  { artist: "Hikaru Utada", title: "First Love", type: "JP" }, { artist: "Tatsuro Yamashita", title: "Plastic Love", type: "JP" },
  { artist: "Miki Matsubara", title: "Mayonaka no Door", type: "JP" }, { artist: "Miku Hatsune", title: "World is Mine", type: "JP" },
  { artist: "One OK Rock", title: "The Beginning", type: "JP" }, { artist: "Gen Hoshino", title: "Koi", type: "JP" },
  // KR
  { artist: "NewJeans", title: "Hype Boy", type: "KR" }, { artist: "LE SSERAFIM", title: "ANTIFRAGILE", type: "KR" },
  { artist: "IVE", title: "LOVE DIVE", type: "KR" }, { artist: "aespa", title: "Next Level", type: "KR" },
  { artist: "BTS", title: "Dynamite", type: "KR" }, { artist: "BLACKPINK", title: "DDU-DU DDU-DU", type: "KR" },
  { artist: "TWICE", title: "TT", type: "KR" }, { artist: "Red Velvet", title: "Psycho", type: "KR" },
  { artist: "EXO", title: "Love Shot", type: "KR" }, { artist: "SEVENTEEN", title: "Don't Wanna Cry", type: "KR" },
  { artist: "BIGBANG", title: "BANG BANG BANG", type: "KR" }, { artist: "IU", title: "LILAC", type: "KR" },
  { artist: "Taeyeon", title: "INVU", type: "KR" }, { artist: "Zico", title: "Any Song", type: "KR" },
  // EN
  { artist: "Taylor Swift", title: "Anti-Hero", type: "EN" }, { artist: "Ariana Grande", title: "7 rings", type: "EN" },
  { artist: "Billie Eilish", title: "bad guy", type: "EN" }, { artist: "Olivia Rodrigo", title: "drivers license", type: "EN" },
  { artist: "Dua Lipa", title: "Levitating", type: "EN" }, { artist: "Lady Gaga", title: "Bad Romance", type: "EN" },
  { artist: "Ed Sheeran", title: "Shape of You", type: "EN" }, { artist: "Bruno Mars", title: "Uptown Funk", type: "EN" },
  { artist: "The Weeknd", title: "Blinding Lights", type: "EN" }, { artist: "Harry Styles", title: "As It Was", type: "EN" },
  // Indie
  { artist: "Hitsujibungaku", title: "more than words", type: "JP" }, { artist: "Saucy Dog", title: "Cinderella Boy", type: "JP" },
  { artist: "Yorushika", title: "Spring Thief", type: "JP" }, { artist: "Hyukoh", title: "Wi Ing Wi Ing", type: "KR" },
  { artist: "Se So Neon", title: "Nan Chun", type: "KR" }, { artist: "Arctic Monkeys", title: "505", type: "EN" },
  { artist: "Cigarettes After Sex", title: "Apocalypse", type: "EN" }, { artist: "Men I Trust", title: "Show Me How", type: "EN" }
];