# 地下的文明｜化糞池歷史研究

繁體中文研究網站，公開於 https://zuestrd20.github.io/septic-tank-history/

包含歷史時間軸、名詞辨析、原創 SVG 四步運作動畫、台灣污水接管背景、九項可查驗參考來源與研究限制。

## 開發

無外部依賴的靜態 HTML/CSS/JavaScript。可在本目錄執行 `python3 -m http.server 8000` 預覽。GitHub Pages 由 `main` 根目錄發布。

## 動畫介紹

首頁或導覽的「動畫介紹」可直達 `#mechanism`。24 秒教學動畫呈現進水、固液分離、部分厭氧分解與後續處理。時間經過為示意，並非工程處理時間；四個過程在實際系統中可同時發生。

- 手動播放／暫停、從頭重播、下一步與任意選步；播放一輪後停止，不自動循環。
- 頁面隱藏或動畫離開畫面時暫停，不自行恢復。
- 尊重 `prefers-reduced-motion`：停用動畫，保留逐步閱讀。
- 未啟用 JavaScript 時保留完整剖面與文字，不顯示失效的播放控制。
- 手機版改為單欄；原始歷史內容、來源及安全說明保留。
- 技術依據：原書目 [5] EPA，另參考 [Iowa DNR](https://www.iowadnr.gov/environmental-protection/water-quality/private-sewage-disposal-and-septage/septic-tank-cleaning) 的厭氧分解及污泥累積說明。

## 檢查

```sh
node --check script.js
node --test tests/animation.test.cjs
python3 tests/check_content.py
```

單元測試涵蓋有限播放、暫停續播、重播與重複點擊、任意選步、減少動態偏好及切換、背景／離屏暫停，以及原時間軸篩選。另應以瀏覽器檢查桌面、窄螢幕、鍵盤操作與實際發布頁面。無建置或第三方套件需求。

## 編輯準則

- 區分古代衛生設施、現代化糞池、Imhoff 槽。
- 年代與技術主張需附來源；不得將過期統計當成現況。
- 不提供入槽、施工或清槽 DIY 指南。
- 網頁示意圖為原創概念圖，不是工程圖。

研究整理日期：2026-10-25。
動畫介紹更新：2026-10-28。
