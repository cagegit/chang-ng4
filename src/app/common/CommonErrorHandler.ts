import {ErrorHandler} from "@angular/core";
export class CommonErrorHandler implements ErrorHandler{
  handleError(error:any):void {
    console.error("自定义异常信息:",error);
  }
}
