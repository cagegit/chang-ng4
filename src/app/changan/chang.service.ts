import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import {CHANG} from "./CFG_CHANG";
import { repeatWhen, find } from "rxjs/operators";
@Injectable()
export class ChangService {
  constructor(
    private http: HttpClient
  ) {}

  // 获取平台列表
  getPlatformList(): Observable<any> {
    return this.http.post(CHANG.API.PLATFROM + "/list", null);
  }

  // 获取协议列表
  getProtocolList(): Observable<any> {
    return this.http.get(CHANG.API.PROTOCOL + "/list");
  }
  // 查询转发车辆列表
  getZfCarList(data, start, limit): Observable<any> {
    // taskId,platformId,protocolId,start,limit,vin,vendor//厂商,licensePlate//车牌号
    return this.http.post(
      CHANG.API.ForwardVehicle +
        `/selectForwardVehicle?start=${start}&limit=${limit}`,
      data
    );
  }
  // 字典表
  getSysDict(type: string): Observable<any> {
    // 001运营公司，厂商002，车辆种类003，地区004
    return this.http.get(CHANG.API.SYS_DICT + "/" + type);
  }
  // 查询转发日志
  // getForwardLogs(data): Observable<any> {
  //   return this.http.post(CHANG.API.FORWARD_LOG+'/select',data);
  // }
  // 下载导入文档
  downloadDoc(): void {
    // return this.http.get(CHANG.API.FILE+'/downloadVehicleImportTemplate');
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.open("get", CHANG.API.FILE + "/downloadVehicleImportTemplate", true);
    xhr.responseType = "blob";
    xhr.onload = function(e) {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const filename = "导入模板_" + Date.now() + ".xlsx";
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
        } else {
          // const a = document.createElement('a');
          const a = document.getElementById("download-tag");
          const url = window.URL.createObjectURL(blob);
          a["href"] = url;
          a["download"] = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    };
    xhr.send(formData);
  }
  // 下载导入文档模板新接口
  downloadNewDoc(): void {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    xhr.open("get", CHANG.API.ForwardNewLog + "/info/demo", true);
    xhr.responseType = "blob";
    xhr.onload = function() {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const filename = "导入查询模板_" + Date.now() + ".csv";
        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
        } else {
          // const a = document.createElement('a');
          const a = document.getElementById("download-tag");
          const url = window.URL.createObjectURL(blob);
          a["href"] = url;
          a["download"] = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }
    };
    xhr.send(formData);
  }
  // 导出车辆查询文档
  exportSelectDoc(
    type: number,
    data: object,
    excelTitle = "导出车辆数据_"
  ): Observable<any> {
    let real_path = "";
    switch (type) {
      case 0:
        real_path = CHANG.API.ForwardVehicle + "/exportForwardVehicles";
        break;
      case 1:
        real_path =
          CHANG.API.ForwardVehicle +
          `/exportFromImportSearchForwardVehicles?key=${data["key"]}`;
        break;
      case 2:
        real_path = CHANG.API.ForwardVehicle + "/exportVehicles";
        break;
      default:
        real_path = CHANG.API.ForwardVehicle + "/exportForwardVehicles";
    }
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = JSON.stringify(data);
      xhr.open("POST", real_path, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function(e) {
        if (xhr.status === 200) {
          const blob = xhr.response;
          let filename = "";
          if (type === 0) {
            filename = excelTitle + Date.now() + ".zip";
          } else {
            filename = excelTitle + Date.now() + ".xlsx";
          }
          resolve(true);
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
          } else {
            // const a = document.createElement('a');
            const a = document.getElementById("download-tag");
            const url = window.URL.createObjectURL(blob);
            a["href"] = url;
            a["download"] = filename;
            a.click();
            window.URL.revokeObjectURL(url);
          }
        } else {
          reject(false);
        }
      };
      if (type === 1) {
        xhr.send();
      } else {
        xhr.send(formData);
      }
    });
    return Observable.fromPromise(p);
    // xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
    // return this.http.post(CHANG.API.ForwardVehicle+`/exportForwardVehicles?start=${start}&limit=${limit}`,data);
  }
  // 获取日志
  getForwardLog(data, start, limit): Observable<any> {
    return this.http.post(
      CHANG.API.ForwardLog + `/select?start=${start}&limit=${limit}`,
      data
    );
  }
  // 获取新日志
  getNewForwardLog(data, start, limit): Observable<any> {
    let params = {
      flag: data.forwardType, // 转入 1 转出 2
      periods: {
        from: new Date(data.startForwardTime).getTime(),
        to: new Date(data.endForwardTime).getTime()
      },
      result: data.forwardResult, // 1 成功 2 失败
      type: data.forwardMode, // 转发方式 1 webservice 2 websocket
      platform: data.forwardPlatform,
      vType: 0,
      vids: [data.vin]
    };
    return this.http.post(
      CHANG.API.ForwardNewLog +
        `/info/paged?pageNumber=${start}&pageSize=${limit}`,
      params
    );
  }
  // 导出查询日志
  exportLogDoc(type: number, data: object): Observable<any> {
    const real_url = type === 0 ? "/exportForwardLog" : "/export";
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = JSON.stringify(data);
      const url = CHANG.API.ForwardLog + real_url;
      xhr.open("POST", url, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const filename = "导出日志数据_" + Date.now() + ".xlsx";
          resolve(true);
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
          } else {
            // const a = document.createElement('a');
            const a = document.getElementById("download-tag");
            const url = window.URL.createObjectURL(blob);
            a["href"] = url;
            a["download"] = filename;
            a.click();
            window.URL.revokeObjectURL(url);
          }
        } else {
          reject(false);
        }
      };
      xhr.send(formData);
    });
    return Observable.fromPromise(p);
  }
  // 新导出查询日志接口
  exportNewLogDoc(data): Observable<any> {
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      let params = {
        flag: data.forwardType, // 转入 1 转出 2
        periods: {
          from: new Date(data.startForwardTime).getTime(),
          to: new Date(data.endForwardTime).getTime()
        },
        result: data.forwardResult, // 1 成功 2 失败
        type: data.forwardMode, // 转发方式 1 webservice 2 websocket
        vType: 0,
        platform: data.forwardPlatform,
        vids: [data.vin]
      };
      const formData = JSON.stringify(params);
      const url = CHANG.API.ForwardNewLog +'/info';
      xhr.open("POST", url, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const filename = "导出日志数据_" + Date.now() + ".csv";
          resolve(true);
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
          } else {
            // const a = document.createElement('a');
            const a = document.getElementById("download-tag");
            const url = window.URL.createObjectURL(blob);
            a["href"] = url;
            a["download"] = filename;
            a.click();
            window.URL.revokeObjectURL(url);
          }
        } else {
          reject(false);
        }
      };
      xhr.send(formData);
    });
    return Observable.fromPromise(p);
  }

  // 移除车辆
  removeCar(data): Observable<any> {
    return this.http.post(CHANG.API.TASK + "/removeVehicle", data);
  }

  /**
   *
   *  可配置报表接口
   *
   */
  // 获取菜单列表
  getMenuList(menuName: string = ""): Observable<any> {
    return this.http.get(CHANG.API.MENU + `/list?ran=${Date.now()}`);
  }
  // 获取菜单关联表信息
  getTablesByMenuId(menuId: string | number): Observable<any> {
    return this.http.get(CHANG.API.MENU + `/id/${menuId}?ran=${Date.now()}`);
  }
  // 获取表格数据
  getDataByTableId(
    tableId: string | number,
    startDate: string,
    endDate: string,
    isWorkDay: number
  ): Observable<any> {
    return this.http.get(
      CHANG.API.TABLE +
        `/info/${tableId}?fromDate=${startDate}&toDate=${endDate}&workDateFlg=${isWorkDay}&ran=${Date.now()}`
    );
  }

  // 公用工具
  formatDate(date, fmt = "yyyy-MM-dd hh:mm:ss"): string {
    const o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "h+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    for (var k in o)
      if (new RegExp("(" + k + ")").test(fmt))
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length == 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
    return fmt;
  }

  /**
   * 轮询获取导入查询结果
   * @param url
   */
  repeatOutput(url: string): Observable<any> {
    return this.http.post(url, null).pipe(
      repeatWhen(() => {
        return Observable.interval(3000);
      }),
      find(item => {
        return item && item["data"] && item["data"].done === true;
      })
    );
  }
  /**
   * 导出Excel
   * @param queryName
   * @param fileName
   */
  exportExcel(queryName: string, fileName: string) {
    console.log("title:", fileName);
    if (fileName) {
      location.href =
        `${
          CHANG.API.OLAP
        }/query/${queryName}/export/xls/flattened?exportname=` +
        fileName +
        ".xls";
    } else {
      location.href = `${CHANG.API.OLAP}/query/${queryName}/export/xls`;
    }
  }
  /**
   * 轮询获取导入查询结果
   * @param queryName
   */
  exportPDF(queryName: string) {
    location.href = `${CHANG.API.OLAP}/query/${queryName}/export/pdf`;
  }

  //车辆功能活跃度查询
  //根据字段搜索任务车辆
  getActivityCarListApi(data): Observable<any> {
    return this.http.post(CHANG.API.EV +`/statistics/measure`, data);
  }
  //功能配置种类
  getConfigTypeApi(): Observable<any> {
    return this.http.get(CHANG.API.EV + "/config/functionType?vehicleModel=S301-18");
  }
  //功能配置名称
  getConfigNameByType(params): Observable<any> {
    return this.http.get(`${CHANG.API.EV}/config/function?vehicleModel=S301-18&functionType=${params}`);
  }

    // 导出查询日志
    exportMeasure(data: object): Observable<any> {
      // const real_url = type === 0 ? "/exportForwardLog" : "/export";
      const p = new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        const formData = JSON.stringify(data);
        const url = CHANG.API.EV + '/statistics/measure/export';
        xhr.open("POST", url, true);
        xhr.responseType = "blob";
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.onload = function() {
          if (xhr.status === 200) {
            const blob = xhr.response;
            const filename = "导出车辆活跃度数据_" + Date.now() + ".csv";
            resolve(true);
            if (window.navigator.msSaveOrOpenBlob) {
              navigator.msSaveBlob(blob, filename);
            } else {
              // const a = document.createElement('a');
              const a = document.getElementById("download-tag");
              const url = window.URL.createObjectURL(blob);
              a["href"] = url;
              a["download"] = filename;
              a.click();
              window.URL.revokeObjectURL(url);
            }
          } else {
            reject(false);
          }
        };
        xhr.send(formData);
      });
      return Observable.fromPromise(p);
    }
}
