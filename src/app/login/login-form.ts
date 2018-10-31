export class LoginForm {

  constructor(
    public userDomain : string,
    public userName : string,
    public userPw : string
  ){}

  get mailServer() : string {
    let mailServer='';
    try{
      mailServer='http://mail.'+this.userName.split("@")[1];
    }catch(e){
      console.warn("邮箱错误:",e);
      mailServer='javascript:void(0)';
    }
    return mailServer;
  }
}
