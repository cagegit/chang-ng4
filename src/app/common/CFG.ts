// declare const process:any;
/**
 * 系统常量 config
 * 存储系统可能会修改的系统常量,便于同一管理配置
 */
export class CFG{
  // 长安项目api前缀
  public static ChangPreFix = '';
  constructor() {
  }
  //COOKIE NAME
  public static COOKIE_NAME={
    USER : 'CSDN_USER',
    JSESSIONID : 'JSESSIONID'
  }
  //是否有新通知
  public static hasNewNotify=false;
  //读取HTML配置文件
  public static HTML_CFG=JSON.parse(document.querySelector('meta[name=cfg]').attributes["content"].value) as any;
  public static PROTOCOL=window.location.protocol+"//";
  //API服务端
  public static API_SERVER={
    DEFAULT : CFG.PROTOCOL+CFG.HTML_CFG.API_SERVER.DEFAULT,
    //系统超时时间
    TIME_OUT : 5*60*1000
  };

  public static DISPLAY_SWITCH={
    ISOURCE : CFG.HTML_CFG.DISPLAY_SWITCH.ISOURCE,
  }

  public static DEV={
    BASE_URL : CFG.HTML_CFG.BASE_URL,
    //环境变量: dev:开发环境,test:测试环境,prod:生产环境
    ENV : window.location.href.replace(/\//g,"").indexOf(CFG.HTML_CFG.BASE_URL.replace(/\//g,""))>0?"test":"dev",
    //调试账户信息
    DEBUG_USER :  CFG.HTML_CFG.DEBUG_USER as any
  }

  /**
   * 开发环境选项
   * @type {{DEV: string, TEST: string, PROD: string}}
   */
  public static DEV_OPS={
    DEV : 'dev',
    TEST : 'test',
    PROD : 'prod'
  };

  //API网关接口
  public static API={
    //用户相关接口
    USER : CFG.API_SERVER.DEFAULT+'user',
    //租户相关接口
    TENANT : CFG.API_SERVER.DEFAULT+'tenant',
    //协议相关接口
    PROTOCOL : CFG.API_SERVER.DEFAULT + CFG.ChangPreFix +'protocol',
    //协议数据项相关接口
    DATAITEM : CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix+'dataItem',
    //平台配置相关接口
    PLATFROM : CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix+'platform',
    //任务相关接口
    TASK : CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix+'task',
    //数据字典接口
    SYS_DICT: CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix +'sysDict',
    //转发日志接口
    FORWARD_LOG: CFG.API_SERVER.DEFAULT + CFG.ChangPreFix+ 'forwardLog',
    //任务车辆相关接口
    FORWARDVEHICLE: CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix+'forwardVehicle',
    //文件相关接口
    FILE: CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix+'file',
    // 车辆
    ForwardVehicle: CFG.API_SERVER.DEFAULT+ CFG.ChangPreFix +'forwardVehicle',
    // 日志
    ForwardLog: CFG.API_SERVER.DEFAULT + CFG.ChangPreFix+ 'forwardLog',


    //用户组相关接口
    GROUP : CFG.API_SERVER.DEFAULT+'groups',
    //数据源相关接口
    DATA_SOURCE : CFG.API_SERVER.DEFAULT+'datasource',
    //数据集相关接口
    DATA_SET : CFG.API_SERVER.DEFAULT+'dataset',
    DASHBOARD:CFG.API_SERVER.DEFAULT+'dashboard',
    MANIFEST:CFG.API_SERVER.DEFAULT+'manifest',
    TEMPLATE:CFG.API_SERVER.DEFAULT+'template',
    OLAP:CFG.API_SERVER.DEFAULT+'olap',
    IMAGE:CFG.API_SERVER.DEFAULT+'pic',
    LOG:CFG.API_SERVER.DEFAULT+'log',
    CARD:CFG.API_SERVER.DEFAULT+'card',
    SQL:CFG.API_SERVER.DEFAULT+'calcite',
    ROLE:CFG.API_SERVER.DEFAULT+'role',
  }

  //权限列表
  public static PERMISSION = {
    //用户登录
    USER_LOGIN : 'USER_LOGIN',

    /**邀请用户**/
    USER_ADD : 'permissions_users_add',
    //用户删除
    USER_DEL : 'permissions_users_delete',
    //用户更新
    USER_UPDATE : 'permissions_users_edit',
    USER_UPDATE_OTHER : 'permissions_users_edit_other',
    //用户组添加
    GROUP_ADD : 'permissions_groups_add',
    //用户组删除
    GROUP_DEL : 'permissions_groups_delete',
    //用户组删除
    GROUP_DEL_OHTER : 'permissions_groups_delete_other',
    //用户组编辑
    GROUP_UPDATE : 'permissions_groups_delete',
    //用户组编辑
    ROLE_UPDATE : 'permissions_groups_eidt',


    /**数据源创建**/
    DATASOURCE_ADD : 'permissions_datasources_add',
    /**数据集创建**/
    DATASET_ADD : 'permissions_datasets_add',
    /**dashboard创建**/
    DASHBOARD_ADD : 'permissions_dashboards_add'
  }

  //合并全部配置文件
  public static JSON=Object.assign({},CFG.COOKIE_NAME,CFG.API_SERVER,CFG.API);
}
