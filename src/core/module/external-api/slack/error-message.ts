export class ErrorMessage<T> {
  private readonly date: Date;
  private readonly error: T;

  constructor({ date, error }: { date: Date; error: T }) {
    this.date = date;
    this.error = error;
  }

  public parseToStringForSlack() {
    return `*에러 발생 [ ${this.date.toLocaleString("ko-KR")} ]* \n\n` + `${JSON.stringify(this.error)}`;
  }
}
