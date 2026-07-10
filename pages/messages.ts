// 画面の表示文言と完全一致させる。
// UI 固有の期待文言はこのファイルに置き、テスト都合の値（アカウント・テストデータ）は config/ に置く
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
