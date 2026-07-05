export class ApiError extends Error {
  statusCode: number;
  userMessage?: string;

  constructor(statusCode: number, technicalMessage: string, userMessage?: string) {
    super(technicalMessage);
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }

  static badRequest(technicalMessage: string, userMessage?: string) {
    return new ApiError(400, technicalMessage, userMessage);
  }

  static unauthorized(technicalMessage: string, userMessage?: string) {
    return new ApiError(401, technicalMessage, userMessage);
  }

  static forbidden(technicalMessage: string, userMessage?: string) {
    return new ApiError(403, technicalMessage, userMessage);
  }

  static notFound(technicalMessage: string, userMessage?: string) {
    return new ApiError(404, technicalMessage, userMessage);
  }

  static conflict(technicalMessage: string, userMessage?: string) {
    return new ApiError(409, technicalMessage, userMessage);
  }

  static internal(technicalMessage: string, userMessage?: string) {
    return new ApiError(500, technicalMessage, userMessage);
  }
}
