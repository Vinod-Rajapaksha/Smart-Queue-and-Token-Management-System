export default class ApiResponse {
  constructor(statusCode, message = 'Success', data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  send(res) {
    return res.status(this.statusCode).json({
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
    });
  }
}