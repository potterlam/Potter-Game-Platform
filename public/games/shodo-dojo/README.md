# 🏯 繁中道場 Shodo Dojo

**繁體字書寫修行遊戲 — Traditional Chinese Character Writing Practice Game**

🔗 **[Play Now](https://potterlam.github.io/faan4-zung1-dou6-coeng4/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## 📖 簡介 About

繁中道場係一個以道場為主題嘅繁體字書寫練習遊戲。玩家要挑戰道場入面嘅對手，通過正確書寫繁體字嚟過關。遊戲採用粵語（廣東話）配音同粵拼標注。

Shodo Dojo is a dojo-themed traditional Chinese character writing practice game. Players challenge dojo opponents by correctly writing traditional Chinese characters with proper stroke order. The game features Cantonese (Jyutping) pronunciation and voice output.

## ✨ 功能 Features

- 🎮 **3 個關卡** — 初級（基礎筆畫）、中級（自然萬物）、高級（武道精神），共 66 個繁體字
- ✍️ **筆順練習** — 使用 [HanziWriter](https://hanziwriter.org/) 實現即時筆順示範與互動書寫
- 🗣️ **粵語語音** — zh-HK 粵語 TTS 讀音
- 🀄 **粵拼標注** — 每個字配有粵拼（Jyutping）、意思、部首、筆畫數
- 🤺 **道場對手** — 3 位風格各異嘅對手，用地道廣東話同你對話
- 📝 **自訂題庫** — 自由建立練習題庫，支援匯入匯出
- 🔧 **題庫產生器** — 內建工具頁面，支援 3,000+ 個常用字自動查詢
- 📖 **CUHK 字庫** — 連結中大粵語審音配詞字庫查詢
- 🌐 **中英切換** — 遊戲介面支援中文／英文切換
- 💡 **提示系統** — 粵拼、意思、部首、例詞多層提示
- 🏠 **快捷導航** — 遊戲中可隨時返回大廳

## 🎯 遊戲玩法 How to Play

1. 進入道場，選擇修行階段
2. 觀看筆順示範動畫
3. 跟住筆順用滑鼠／觸控書寫
4. 正確書寫得分，完美零失誤有額外獎勵
5. 達到合格分數即可過關，解鎖下一關

## 🛠️ 自訂題庫 Custom Stages

- 使用內建[題庫產生器](https://potterlam.github.io/faan4-zung1-dou6-coeng4/tools/generate.html)建立自訂練習
- 支援 3,000+ 個常用繁體字自動查詢粵拼、意思、部首
- 可匯出為 `.js` 檔案，或直接載入遊戲
- 自訂關卡永遠以鼓勵方式評分，唔會話你「未通過」

## 📁 專案結構 Project Structure

```
shodo-dojo/
├── index.html          # 主遊戲頁面
├── css/
│   └── style.css       # 道場主題樣式
├── js/
│   ├── app.js          # 遊戲引擎（ShodoDojo class）
│   ├── characters.js   # 66 個繁體字資料庫
│   └── opponents.js    # 對手對話系統
└── tools/
    ├── generate.html   # 題庫產生器工具
    └── js/
        └── char-lookup.js  # 3,000+ 字字典
```

## 🧰 使用技術 Tech Stack

- **HanziWriter 3.5** — 筆順動畫與互動書寫
- **Web Speech API** — 粵語 TTS 語音輸出
- **localStorage** — 進度與自訂題庫儲存
- **Vanilla JS / CSS** — 無框架依賴，直接開瀏覽器即玩

## 📜 License

MIT
