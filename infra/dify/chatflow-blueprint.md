# Dify Chatflow Blueprint（對齊 SiteSpec）

## 節點建議

1. **Start**
   - Input: `query`（使用者以自然語言描述品牌／頁面需求）
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
你是 Webomate 的網站規格產生器。你必須輸出單一 JSON 物件，不可輸出 markdown 或多餘說明。
規格（對齊 @webomate/site-spec v0.1.1）：
1) 必要頂層欄位：slug, brandName, hero, sections, ctas, links, contact, seo, theme。
2) 所有 url 必須是 https:// 開頭。
3) slug 只允許小寫英文、數字與連字號（^[a-z0-9-]+$）。
4) theme.primaryColor / theme.secondaryColor 必須是 #RRGGBB 格式。
5) theme.tone 必須是 "natural" | "minimal" | "business" 之一。
6) sections / ctas 各至少 1 筆；seo.keywords 至少 1 筆。
7) ctas[].style 只允許 "primary" | "secondary" | "ghost"。
8) links[].icon 只允許 "facebook" | "instagram" | "line" | "linkedin" | "map" | "custom"（可省略）。
9) 若品牌需要多頁，可加入可選的 pages 陣列，每筆需包含 slug、title、hero、sections、seo。
10) hero、seo、sections 文案請使用繁體中文。
11) 嚴禁輸出 schema 之外欄位；嚴禁換行以外的控制字元。
```

## 匯出步驟（Dify DSL YAML）

1. 在 Dify 後台開啟你的 Chatflow 應用
2. 右上角 → **匯出 DSL** → 選擇 YAML
3. 將匯出的 `*.yml` 存放於 `infra/dify/chatflow.yml`
4. 重新匯入指令：  
   ```bash
   # Dify API
   curl -X POST https://<your-dify-host>/v1/apps/import \
     -H "Authorization: Bearer <admin-token>" \
     -F "data=@infra/dify/chatflow.yml"
   ```

## 回應格式範本

請參考 [`site-spec-output-example.json`](./site-spec-output-example.json)。

## 本機驗證流程

Chatflow 輸出後，可用 CLI 快速驗證：

```bash
# 將 Dify 輸出貼入 sites/<slug>/site-spec.json 後執行：
node packages/cli/dist/cli.js validate sites/<slug>/site-spec.json
node packages/cli/dist/cli.js preview sites/<slug>/site-spec.json
```
