export class ErrorMessage<T> {
  private readonly date: Date;
  private readonly exception: T;

  constructor({ date, exception }: { date: Date; exception: T }) {
    this.date = date;
    this.exception = exception;
  }

  public parseToStringForSlack() {
    return (
      `*에러 발생 [ ${this.date.toLocaleString('ko-KR')} ]* \n\n` +
      `${JSON.stringify(this.exception)}`
    );
  }
}
