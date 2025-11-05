/**
 * API エラーのタイプを定義
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  /**
   * 404 Not Found エラーかどうかを判定
   */
  isNotFound(): boolean {
    return this.status === 404;
  }

  /**
   * 400 Bad Request エラーかどうかを判定
   */
  isBadRequest(): boolean {
    return this.status === 400;
  }

  /**
   * 500 Internal Server Error エラーかどうかを判定
   */
  isServerError(): boolean {
    return this.status >= 500;
  }
}

/**
 * Fetch レスポンスからApiErrorを作成するヘルパー関数
 */
export async function createApiError(response: Response): Promise<ApiError> {
  let errorMessage = "APIエラーが発生しました";
  let errorCode: string | undefined;

  try {
    const errorData = await response.json();
    errorMessage = errorData.error || errorData.message || errorMessage;
    errorCode = errorData.code;
  } catch {
    // JSON パースに失敗した場合はデフォルトメッセージを使用
    errorMessage = `HTTPエラー: ${response.status} ${response.statusText}`;
  }

  return new ApiError(errorMessage, response.status, errorCode);
}
