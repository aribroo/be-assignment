export class ResponseError extends Error {
  constructor(public statusCode: number, msg: string) {
    super(msg);
  }
}
