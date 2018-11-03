import { CFG } from '../common/CFG';
let ChangPreFix = 'dataForwardConfig/';// 长安数据转发接口前缀
let DashConf = 'dashConf/';//长安可配置报表接口前缀
let ActivityPreFix = 'queryapi/'; //活跃度前缀
let CHANG;
if (ENV === "production") {
  CHANG = {
    API: {
      //协议相关接口
      PROTOCOL: CFG.API_SERVER.DEFAULT + ChangPreFix + "protocol",
      //协议数据项相关接口
      DATAITEM: CFG.API_SERVER.DEFAULT + ChangPreFix + "dataItem",
      //平台配置相关接口
      PLATFROM: CFG.API_SERVER.DEFAULT + ChangPreFix + "platform",
      //任务相关接口
      TASK: CFG.API_SERVER.DEFAULT + ChangPreFix + "task",
      //数据字典接口
      SYS_DICT: CFG.API_SERVER.DEFAULT + ChangPreFix + "sysDict",
      //转发日志接口
      FORWARD_LOG: CFG.API_SERVER.DEFAULT + ChangPreFix + "forwardLog",
      //任务车辆相关接口
      FORWARDVEHICLE: CFG.API_SERVER.DEFAULT + ChangPreFix + "forwardVehicle",
      //文件相关接口
      FILE: CFG.API_SERVER.DEFAULT + ChangPreFix + "file",
      // 车辆
      ForwardVehicle: CFG.API_SERVER.DEFAULT + ChangPreFix + "forwardVehicle",
      // 日志
      ForwardLog: CFG.API_SERVER.DEFAULT + ChangPreFix + "forwardLog",
      // 新转发日志
      ForwardNewLog: CFG.API_SERVER.DEFAULT +'queryapi/' + "forward",
      // 菜单
      // MENU: CFG.API_SERVER.DEFAULT + ChangPreFix + "menu",
      // // 表格
      // TABLE: CFG.API_SERVER.DEFAULT + ChangPreFix + "table",
      // 数据源
      DATASOURCE: CFG.API_SERVER.DEFAULT  + "datasource",
      // 数据集
      DATASET: CFG.API_SERVER.DEFAULT  + "dataset",
      //仪表盘
      DASHBOARD: CFG.API_SERVER.DEFAULT  + "dashboard",
      //报表
      CARD: CFG.API_SERVER.DEFAULT  + "card",
      MENU: CFG.API_SERVER.DEFAULT + DashConf+ 'menu',
      // 表格
      TABLE: CFG.API_SERVER.DEFAULT + DashConf+ 'table',
      //OLAP
      OLAP: CFG.API_SERVER.DEFAULT + 'olap',
      //活跃度
      EV: CFG.API_SERVER.DEFAULT + ActivityPreFix + 'ev',
    }
  };
} else {
  CHANG = {
    API: {
      //协议相关接口
      PROTOCOL: CFG.API_SERVER.DEFAULT + "protocol",
      //协议数据项相关接口
      DATAITEM: CFG.API_SERVER.DEFAULT + "dataItem",
      //平台配置相关接口
      PLATFROM: CFG.API_SERVER.DEFAULT + "platform",
      //任务相关接口
      TASK: CFG.API_SERVER.DEFAULT + "task",
      //数据字典接口
      SYS_DICT: CFG.API_SERVER.DEFAULT + "sysDict",
      //转发日志接口
      FORWARD_LOG: CFG.API_SERVER.DEFAULT + "forwardLog",
      //任务车辆相关接口
      FORWARDVEHICLE: CFG.API_SERVER.DEFAULT + "forwardVehicle",
      //文件相关接口
      FILE: CFG.API_SERVER.DEFAULT + "file",
      // 车辆
      ForwardVehicle: CFG.API_SERVER.DEFAULT + "forwardVehicle",
      // 日志
      ForwardLog: CFG.API_SERVER.DEFAULT + "forwardLog",
      // 新转发日志
      ForwardNewLog: CFG.API_SERVER.DEFAULT + "forward",
      // 菜单
      MENU: CFG.API_SERVER.DEFAULT + "menu",
      // 表格
      TABLE: CFG.API_SERVER.DEFAULT + "table",
      // 数据源
      DATASOURCE: CFG.API_SERVER.DEFAULT + "datasource",
      // 数据集
      DATASET: CFG.API_SERVER.DEFAULT + "dataset",
      //仪表盘
      DASHBOARD: CFG.API_SERVER.DEFAULT  + "dashboard",
      //报表
      CARD: CFG.API_SERVER.DEFAULT  + "card",
      //OLAP
      OLAP: CFG.API_SERVER.DEFAULT + 'olap',
      //活跃度
      EV: CFG.API_SERVER.DEFAULT + 'ev',
    },
    CHARTTYPE: [
      { id: 0, name: "无" },
      { id: 1, name: "折线图", type: "line" },
      { id: 2, name: "柱状图", type: "bar" },
      { id: 3, name: "饼图", type: "pie" },
      { id: 4, name: "散点图", type: "scatter" },
      { id: 5, name: "中国地图", type: "map" },
      // { id: 6, name: "热力图", type: "heatmap" },
      { id: 7, name: "雷达图", type: "redar" },
      { id: 8, name: "漏斗图", type: "funnel" },
      { id: 9, name: "仪表盘", type: "gauge" }
    ]
  };
}
// 导出图形列表
export const CHART_TYPE_LIST = [
  { id: 1, name: "折线图", type: "line" },
  { id: 2, name: "柱状图", type: "bar" },
  { id: 3, name: "饼图", type: "pie" },
  { id: 4, name: "散点图", type: "scatter" },
  { id: 5, name: "中国地图", type: "map" },
  // { id: 6, name: "热力图", type: "heatmap" },
  { id: 7, name: "雷达图", type: "redar" },
  { id: 8, name: "漏斗图", type: "funnel" },
  { id: 9, name: "仪表盘", type: "gauge" }
];

export {CHANG};
