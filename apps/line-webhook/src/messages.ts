import type { FlexMessage, TextMessage } from "@line/bot-sdk";

export function createProcessingMessage(): TextMessage {
  return {
    type: "text",
    text: "已收到你的需求，正在生成網站中，約 10-30 秒完成。"
  };
}

export function createPreviewFlex(url: string): FlexMessage {
  return {
    type: "flex",
    altText: "你的網站預覽已完成",
    contents: {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "網站預覽已完成",
            weight: "bold",
            size: "lg"
          },
          {
            type: "text",
            text: "可先檢查內容與版型，若要修改可直接在 LINE 回覆調整需求。",
            wrap: true,
            size: "sm",
            color: "#6B7280"
          }
        ]
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            style: "primary",
            action: {
              type: "uri",
              label: "開啟預覽網站",
              uri: url
            }
          },
          {
            type: "button",
            style: "link",
            action: {
              type: "uri",
              label: "複製連結",
              uri: url
            }
          }
        ]
      }
    }
  };
}

export function createErrorMessage(errorCode: "DIFY_ERROR" | "BUILD_ERROR"): TextMessage {
  const messageMap: Record<typeof errorCode, string> = {
    DIFY_ERROR: "目前 AI 服務忙碌中，請稍後再試一次，或簡化需求後重送。",
    BUILD_ERROR: "網站生成失敗，請確認你提供的連結格式是否為 https:// 開頭後再試。"
  };

  return {
    type: "text",
    text: messageMap[errorCode]
  };
}
