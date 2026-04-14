# Dify Chatflow Blueprint（對齊 SiteSpec）

## 節點建議

1. **Start**
   - Input: `query`（LINE 使用者輸入）
2. **LLM - 資訊萃取**
   - 任務：將 `query` 轉成結構化品牌資訊（產業、主打服務、CTA、連結）
3. **Knowledge Retrieval**
   - 知識庫：版型語氣、產業句型、SEO 關鍵字模板
4. **LLM - SiteSpec 組裝**
   - 任務：輸出符合 `@webomate/site-spec` 的 JSON
5. **Answer**
   - `response_mode=blocking`
   - 僅回傳 JSON 字串

## 建議系統 Prompt（可直接貼）

```text
你是 Webomate 的網站規格產生器。你必須輸出單一 JSON 物件，不可輸出 markdown。
規格：
1) 必須包含 slug, brandName, hero, sections, ctas, links, contact, seo, theme。
2) 所有 url 必須是 https:// 開頭。
3) slug 只允許小寫英文、數字與連字號。
4) theme.primaryColor 與 theme.secondaryColor 必須是 #RRGGBB。
5) 至少 1 個 section 與 1 個 cta。
6) hero、seo 文案請使用繁體中文。
7) 嚴禁輸出 schema 之外欄位。
```

## 回應格式範本

請參考 [`site-spec-output-example.json`](./site-spec-output-example.json)。
