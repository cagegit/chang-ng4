import { ResponseDTO } from "../dto/ResponseDTO";
export class Error {
  status: number;
  errorMsg: string;
  errMsg: string;
  data: string;
  constructor(status?: number, errorMsg?: string, data?: string) {
    this.status = status;
    this.errorMsg = errorMsg;
    this.errMsg = errorMsg;
    this.data = data;
  }

  static buildFromResponseDTO(response: ResponseDTO){
    // console.log("buildFromResponseDTO", response);
    let temp = new Error();
    console.log(response);
    // temp.status=response.status;
    // temp.errorMsg=response.errorMsg;
    temp.status = response['status'];
    const err =  (response['error'] && response['errorMsg']) || response['message'];
    temp.errorMsg = err;
    temp.errMsg = err;
    return temp;
  }
}
