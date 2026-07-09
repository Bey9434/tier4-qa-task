// 画面の表示文言と完全一致させる値（1文字でも違うとテストが落ちる）
export const LOGIN_ERROR_MESSAGES = {
  emailRequired: "Email is required",
  emailFormatInvalid: "Email format is invalid",
  passwordRequired: "Password is required",
  passwordLengthInvalid: "Password length is invalid",
  invalidCredentials: "Invalid email or password",
} as const;

export const MY_ACCOUNT_HEADING = "My account";
