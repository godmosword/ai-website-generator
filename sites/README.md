# `sites/` 靜態產物

- 每個子資料夾代表一個可公開網址：`/<slug>/`。
- 若存在 `site-spec.json`，CI 會在部署前呼叫 `@webomate/renderer` 產生 `index.html`。
- 若已由本機或 webhook 直接寫入 `index.html`，可只提交 HTML（仍可被 CI 覆寫，只要同資料夾也有 `site-spec.json`）。
