/**
 * Created by fengjj on 2016/9/23.
 */
const BASE_URL = "http://192.168.6.157:9763/csdn-das-usermgt/demo";
//tenantEmailUrl  创建一个账号 post
//setPasswordUrl 设置密码 post
//emailActiveUrl  让后台发送激活邮件 get
//emailActiveUrl  设置密码页面  用临时id 获取真实用户信息的接口
export const URLS ={
  tenantEmailUrl:BASE_URL+"/tenants",
  setPasswordUrl:BASE_URL+ "/users",
  emailActiveUrl:"http://192.168.25.11:9008/tenant/sendMail",
  tenantInfoUrl:BASE_URL+"/users/uuid",
  setDomainUrl:BASE_URL+"/tenants"
}
