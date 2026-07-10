// エラー文言・見出しは画面の表示と完全一致させる（1 文字違えばテストが落ちる）。
// 請求書番号のように動的な値が続く文言は、全文一致だと毎回変わる部分で落ちるため先頭の固定部分だけを持つ
export const LOGIN_ERROR_MESSAGES = {
  emailRequired: "Email is required",
  emailFormatInvalid: "Email format is invalid",
  passwordRequired: "Password is required",
  passwordLengthInvalid: "Password length is invalid",
  invalidCredentials: "Invalid email or password",
} as const;

export const MY_ACCOUNT_HEADING = "My account";

export const ORDER_CONFIRMATION_MESSAGE =
  "Thanks for your order! Your invoice number is";
