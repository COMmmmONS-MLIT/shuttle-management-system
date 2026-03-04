import { AxiosError } from "axios";

export class ApiErrorHandler {
  private error: AxiosError;

  constructor(error: any) {
    this.error = error;
  }

  public getErrorMessages(): object {
    const errorData: any = this.error?.response?.data;

    let errorMessages: object = {};
    if (errorData?.messages) {
      Object.keys(errorData.messages).forEach((key: string) => {
        const errorMessage = { [key]: errorData.messages[key][0] };
        errorMessages = { ...errorMessages, ...errorMessage };
      });
    }

    return errorMessages;
  }
}
