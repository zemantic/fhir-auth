/**
 * Reponse class handles request response
 * Helps to maintain the status, data, message structure
 * Use response class when sending resposne in express
 *
 * @export
 * @class ResponseClass
 */
export class ResponseClass {
  private _status: number;
  public get status(): number {
    return this._status;
  }
  public set status(value: number) {
    this._status = value;
  }
  private _data: any | null;
  public get data(): any | null {
    return this._data;
  }
  public set data(value: any | null) {
    this._data = value;
  }
  private _message: string;
  public get message(): string {
    return this._message;
  }
  public set message(value: string) {
    this._message = value;
  }
  // converts the response to json
  toJSON() {
    return {
      status: this.status,
      data: this.data,
      message: this.message,
    };
  }
}
