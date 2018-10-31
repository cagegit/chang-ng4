import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Rx";
import { HttpClient } from "@angular/common/http";
import "rxjs/operators";
import CHANG from "../../../changan/CFG_CHANG";
import { Params } from "@angular/router";

@Injectable()
export class ConfigService {
  constructor(private http: HttpClient) {}

  // 获取菜单列表
  getMenuList(params): Observable<any> {
    return this.http.get(CHANG.API.MENU + "/list?menuName=" + params);
  }

  // 删除菜单列表
  deleteMenuList(params): Observable<any> {
    return this.http.get(CHANG.API.MENU + "/deleteMenu/" + params);
  }

  // 新增菜单列表
  addMenuList(data): Observable<any> {
    return this.http.post(CHANG.API.MENU + "/addMenu", data);
  }

  // 修改菜单列表
  updateMenuList(data): Observable<any> {
    return this.http.post(CHANG.API.MENU + "/updateMenu", data);
  }

  // 获取菜单详情byid
  getMenuDetailById(id): Observable<any> {
    return this.http.get(CHANG.API.MENU + `/id/${id}`);
  }

  // 获取菜单下报表
  getTableByMenuId(id): Observable<any> {
    return this.http.get(CHANG.API.MENU + `/assTables/${id}`);
  }

  // 删除菜单下分配的报表
  deleteMenuTableItem(menuId,tableId): Observable<any> {
    return this.http.get(CHANG.API.MENU + "/deleteAssTable/" + menuId+'/'+tableId);
  }

  // 获取报表列表
  getTableList(params): Observable<any> {
    return this.http.get(CHANG.API.TABLE + "/tableList?tableName=" + params);
  }

  // 删除报表列表
  deleteTableList(params): Observable<any> {
    return this.http.get(CHANG.API.TABLE + "/deleteTable/" + params);
  }

  // 新增报表列表
  addTableList(data): Observable<any> {
    return this.http.post(CHANG.API.TABLE + "/addTable", data);
  }

  // 更新报表列表
  updateTableList(data): Observable<any> {
    return this.http.post(CHANG.API.TABLE + "/updateTable", data);
  }

  //获取表报详情byid
  getTableDetailById(id): Observable<any> {
    return this.http.get(CHANG.API.TABLE + `/id/${id}`);
  }

  //获取报表的菜单
  getMenuByTableId(id): Observable<any> {
    return this.http.get(CHANG.API.TABLE + `/assMenus/${id}`);
  }

  //表格关联菜单
  assMenuAndTableByTableId(data): Observable<any> {
    return this.http.post(CHANG.API.TABLE + `/assTableAndMenu`, data);
  }

  //菜单关联表格
  assMenuAndTableByMenuId(data): Observable<any> {
    return this.http.post(CHANG.API.MENU + `/assMenuAndTable`, data);
  }
}
