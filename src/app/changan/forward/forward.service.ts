import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { Http } from "@angular/http";
import {CHANG} from "../CFG_CHANG";
import { Permission } from "../../../common/model/Permission";
import { platform } from "os";
@Injectable()
export class ForwardService {
  constructor(private http: Http) {}
  //平台接口
  // 获取平台列表
  getListApi(data: any): Observable<any> {
    return this.http.post(CHANG.API.PLATFROM + "/select", data);
  }

  //all平台列表
  getPlatformListApi(): Observable<any> {
    return this.http.post(CHANG.API.PLATFROM + "/list", null);
  }

  //新增平台
  addAPi(data: any): Observable<any> {
    return this.http.post(CHANG.API.PLATFROM + "/add", data);
  }

  //更新平台
  updateAPi(data: any): Observable<any> {
    return this.http.post(CHANG.API.PLATFROM + "/update", data);
  }

  //删除平台
  deleteApi(id: string) {
    return this.http.delete(CHANG.API.PLATFROM + "/" + id);
  }

  //任务接口 all数据/根据名称搜索任务
  getTaskListApi(params: string): Observable<any> {
    return this.http.get(CHANG.API.TASK + "/select?name=" + params);
  }

  //新增任务
  addTaskAPi(data: any): Observable<any> {
    return this.http.post(CHANG.API.TASK + "/add", data);
  }

  //更新任务
  updateTaskAPi(data: any): Observable<any> {
    return this.http.post(CHANG.API.TASK + "/update", data);
  }

  //删除任务
  deleteTaskApi(id: string,platformId:string) {
    return this.http.delete(CHANG.API.TASK + "/" + id  +"/"+platformId);
  }

  //根据字段搜索任务车辆
  getVehiclesListApi(data, start, limit, id): Observable<any> {
    return this.http.post(
      CHANG.API.FORWARDVEHICLE +
        "/selectForwardVehicleByTask" +
        "/" +
        id +
        "?start=" +
        start +
        "&limit=" +
        limit,
      data
    );
  }

  //根据字段搜索车辆
  getVehiclesApi(data, start, limit): Observable<any> {
    return this.http.post(
      CHANG.API.FORWARDVEHICLE +
        `/selectVehicles?start=${start}&limit=${limit}`,
      data
    );
  }

  //删除车辆
  deleteVehiclesApi(data: any) {
    return this.http.post(CHANG.API.TASK + "/removeVehicle", data);
  }

  //根据字段搜索车辆 导出
  exportVehiclesListApi(data, id, taskName, platformName): Observable<any> {
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // const formData = new FormData();
      // formData.append(data);
      // for(let v in data) {
      //   if(v) {
      //     formData.append(v,data[v]);
      //   }
      // }
      const formData = JSON.stringify(data);
      xhr.open(
        "POST",
        CHANG.API.FORWARDVEHICLE +
          `/exportForwardVehiclesByTask/${id}/${taskName}/${platformName}`,
        true
      );
      // xhr.open('POST', url, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.onload = function(e) {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const filename = "导出车辆数据_" + Date.now() + ".zip";
          resolve(true);
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
          } else {
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

  //车辆配置数据
  getConfigDataApi(params: string): Observable<any> {
    return this.http.get(CHANG.API.SYS_DICT + "/" + params);
  }

  //上牌城市
  getCityApi(params: string): Observable<any> {
    return this.http.get(CHANG.API.SYS_DICT + "/city/" + params);
  }

  //添加选中车辆 导出
  getVehicleApi(data: any): Observable<any> {
    return this.http.post(CHANG.API.TASK + "/addVehicle", data);
    // return this.http.post(CHANG.API.TASK + "/addVehicle",data);
  }

  //添加全部车辆 查询方式
  getVehicleAllApiBySearch(data, taskId, platformId): Observable<any> {
    return this.http.post(
      CHANG.API.TASK + `/addAllSelectVehicle/${taskId}/${platformId}`,
      data
    );
  }

  //添加all车辆 callback
  getCallBack(url): Observable<any> {
    return this.http.post(url,'');
  }

  //下载查询模板
  downloadDoc(): void {
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

  //导出重复添加车辆
  exportExistVehicleApi(data): Observable<any> {
    const p = new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      // const formData = new FormData();
      // formData.append(data);
      // for(let v in data) {
      //   if(v) {
      //     formData.append(v,data[v]);
      //   }
      // }
      // const formData = data;
      // xhr.open('POST', CHANG.API.FORWARDVEHICLE+`/exportVehicles`, true);
      const formData = JSON.stringify(data);
      xhr.open("POST", CHANG.API.FORWARDVEHICLE + `/exportVehicles`, true);
      xhr.responseType = "blob";
      xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
      xhr.responseType = "blob";
      xhr.onload = function(e) {
        if (xhr.status === 200) {
          const blob = xhr.response;
          const filename = "导出车辆数据_" + Date.now() + ".xlsx";
          resolve(true);
          if (window.navigator.msSaveOrOpenBlob) {
            navigator.msSaveBlob(blob, filename);
          } else {
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
