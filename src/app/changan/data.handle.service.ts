/**
 *
 * 长安 数据分析接口
 *
 */
import { Injectable } from "@angular/core";
import { Observable,Subject } from 'rxjs';
import { HttpClient } from "@angular/common/http";
import {CHANG} from './CFG_CHANG';
import { catchError,tap,map,timeout,switchMap} from 'rxjs/operators';
import { AppNotification } from '../app.notification';
import { QueryTemplate } from '../common/model/card/card.query.template';
import { Cube } from '../common/model/card/schema.cube';
import { Dashboard, SelectParam } from '../common/model/dashboard.model';
import { DashboardService } from '../common/service/dashboard.service';
import { OlapUtil } from '../module/card/card.olap.util';
import {QueryUtil} from "../module/card/card.query.util";

interface DataResponse {
  "data": any;
  "error": any;
  "errorMsg": "string";
  "status": boolean | number;
}

@Injectable()
export class DataHandleService {
  dashboardIdSubject = new Subject();
  dashboardIdSubject$ = this.dashboardIdSubject.asObservable();
  constructor(private http:HttpClient,private appNotification: AppNotification,private dashboardService: DashboardService) {
      // console.log(this.appNotification);
  }
  // 无返回错误处理
  handleError = (err) =>{
    console.error(err);
    let errMsg = '数据查询出错！';
    if(err && err.error && err.error.errorMsg) {
      errMsg = err.error.errorMsg;
    }
    this.appNotification.error(errMsg);
    return Observable.empty();
  };
  /**
   * 获取数据集
   */
  getDatasetList():Observable<any> {
    return this.http.get(CHANG.API.DATASET+'').pipe(catchError(this.handleError));
  }
  /**
   * 获取连接
   */
  getDataSource(connection:string):Observable<any> {
    return this.http.get(CHANG.API.OLAP + '/connection/' + connection).pipe(catchError(this.handleError));
  }

  /**
   * 获取OLAP meta-data
   * @param datesetId
   */
  getAllMetaData(datesetId): Observable<any> {
    return this.http.get(CHANG.API.OLAP +`/${datesetId}/metadata`).pipe(catchError(this.handleError));
  }
  /**
   * 获取元数据
   */
  getMetaData(cube:Cube, isTemplate:boolean = false):Observable<any> {
    let url = CHANG.API.OLAP + `/${cube.connection}/${cube.catalog}/${cube.schema}/${cube.name}/metadata?template=${isTemplate}`;
    return this.http.get(url).pipe(catchError(this.handleError));
  }
  /**
   * 获取层级等级
   */
  getMember(cube:Cube, dimension:string, hierarchy:string, level:string, isTemplate:boolean = false):Observable<any> {
    return this.http.get(`${CHANG.API.OLAP}/${cube.connection}/${cube.catalog}/${cube.schema}/${cube.name}/dimensions/${dimension}/hierarchies/${hierarchy}/levels/${level}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * 创建查询
   */
  createQuery(model:QueryTemplate):Observable<any> {
    let url = CHANG.API.OLAP + '/query/' + model.cube.connection + '/' + model.name;
    var entry = `?json=${JSON.stringify(model)}`;
    return this.http.post(url+entry, null).pipe(catchError(this.handleError));
  }

  /**
   * 执行查询
   */
  execute(model:QueryTemplate):Observable<any> {
    let url = CHANG.API.OLAP + '/query/execute';//0/300/
    return this.http.post(url, model).pipe(catchError(this.handleError));
  }
  /**
   * 执行分页查询
   *
   */
  executeForPage(model:QueryTemplate, curPage:number, pageSize:number, isTemplate:boolean = false):Observable<any> {
    return this.http.post(CHANG.API.OLAP+`/query/${curPage}/${pageSize}/execute?template=${isTemplate}`,model)
      .pipe(catchError(this.handleError));
  }

  /**
   * 取消请求
   */
  cancel(queryName:string):Observable<any> {
    return this.http.delete(CHANG.API.OLAP + '/query/' + queryName + '/cancel/').pipe(catchError(this.handleError));
  }
  /**
   * 下砖查询
   */
  drillthrough(queryname:string, maxrows:number, position:string, returns:string):Observable<any> {
    const url = `/query/${queryname}/drillthrough?maxrows=${maxrows}&position=${position}&returns=${returns}`;
    return this.http.get(CHANG.API.OLAP + url).pipe(catchError(this.handleError));
  }

  /**
   * 保存模板
   */
  save(cardName:string, desc:string, dataSetId:string, renderMode:string, model:any, dataBrief:any,queryType:string):Observable<any> {
    let entry = {"cardName":cardName,"description":desc?desc:'',"dataSetId":dataSetId,"renderMode":renderMode,
    "content":JSON.stringify(model),"dataBrief":dataBrief,"queryType":queryType};
    return this.http.post(CHANG.API.CARD, entry).pipe(catchError(this.handleError));
  }
  /**
   * 更新模板
   */
  update(cardName:string, cardId:string, desc:string, dataSetId:string, renderMode:string, model:any, dataBrief:any,queryType:string):Observable<any> {
    let entry = {"cardId":cardId, "cardName":cardName,"description":desc?desc:'',
        "dataSetId":dataSetId,"renderMode":renderMode,"content":JSON.stringify(model),
        "dataBrief":dataBrief,"queryType":queryType};
    return this.http.put(CHANG.API.CARD+'/'+cardId, entry).pipe(catchError(this.handleError));
  }

  /**
   * 获取指定报表
   */
  getCard(dataSetId:string, cardId:string):Observable<any> {
    return this.http.get(`${CHANG.API.CARD}/${cardId}`);
  }
  /**
   * 获取简单的报表信息
   */
  getCardSimple(dataSetId:string, cardId:string):Observable<any> {
    return this.http.get(`${CHANG.API.CARD}/abstract/${dataSetId}/${cardId}`).pipe(catchError(this.handleError));
  }
  /**
   * 移除指定报表
   */
  delCard(dataSetId:string, cardId:string):Observable<any> {
    return this.http.delete(`${CHANG.API.CARD}/${cardId}`).pipe(catchError(this.handleError));
  }
  /**
   * 获取数据集中报表列表
   */
  getCards(dataSetId:string):Observable<any> {
    return this.http.get(`${CHANG.API.CARD}/dataSetId/${dataSetId}`);
  }

  /**
   * 导出Excel
   */
  exportExcel(queryName:string,fileName:string) {
    console.log('title:',fileName);
    if(fileName){
      location.href = `${CHANG.API.OLAP}/query/${queryName}/export/xls/flattened?exportname=`+fileName+'.xls';

    } else {
      location.href = `${CHANG.API.OLAP}/query/${queryName}/export/xls`;
    }
  }
  /**
   * 导出PDF
   */
  exportPDF(queryName:string) {
    location.href = `${CHANG.API.OLAP}/query/${queryName}/export/pdf`;
  }


  ////////////////////////////////////////////dashboard 接口 /////////////////////////////////
  /**
   * 获取dashboard列表
   */
  getDashboards(token?:string): Observable<any>{
    let url ='';
    if(token) {
      url = CHANG.API.DASHBOARD +'?token='+token;
    } else {
      url = CHANG.API.DASHBOARD;
    }
    return this.http.get(url).pipe(map((res:DataResponse) => {
      // console.log(res);
      if(res && res.data && Array.isArray(res.data)) {
        let list = res.data as Dashboard[];
        list=list.filter((v) => {
          return (typeof(v.content)==='string' && v.content.indexOf('[')>=0);
        }).map((dashboard:any)=>{
          return Dashboard.build(dashboard);
        });
        // list.sort((x:Dashboard, y:Dashboard)=> {
        //   if(y.dashboardName=="Demo"){
        //     return 1;
        //   }else{
        //     return y.content.length-x.content.length;
        //   }
        // });
        return list;
      } else {
        return [];
      }
    }),
      catchError(this.handleError));
  }

  /**
   * 获取指定dashboard
   * @param id dashboardId
   * @param template 是否模板
   * @param token 验证token
   */
  getDashboardById(id:string,template:boolean=false,token?:string): Observable<any>{
    if(token) {
      return  this.http.get(`${CHANG.API.DASHBOARD}/${id}?token=${token}`).pipe(catchError(this.handleError));
    } else {
      return  this.http.get(`${CHANG.API.DASHBOARD}/${id}`).pipe(catchError(this.handleError));
    }
  }

  /**
   * 获取所有filter的值
   */
  getAllValueOfFilter({connection,catalog,schema,name,dimension,hierarchy,level,fromTemplateList}): Observable<any> {
    return this.http.get(`${CHANG.API.OLAP}/${connection}/${catalog}/${schema}/${name}/dimensions/${dimension}/hierarchies
    /${hierarchy}/levels/${level}?template=${fromTemplateList}`).pipe(catchError(this.handleError));
  }

  /**
   * 保存dashboard
   * @param dashboard dashboard内容
   * @param createFlag  是否创建标记
   */
  saveDashboard(dashboard:Dashboard, createFlag:boolean): Observable<any>{
    console.log('save',dashboard);
    let otherParam = {
      "datasetIds": [],
      "cardIds": [],
      "createUserAvatarUrl": "",
      "createUserDisplayName": "",
      "createUserId":''
    };
    let body = Object.assign(otherParam,dashboard);
    otherParam.datasetIds = dashboard.dataSetIDs;
    delete body.templateID;
    if(createFlag){
      return this.http.post(CHANG.API.DASHBOARD,body)
        .pipe(tap(() => {
          this.dashboardService.dashboardListSubject.next(true);
          this.appNotification.success('保存成功');
      }),catchError(this.handleError));
    }else {
      return this.http.put(CHANG.API.DASHBOARD+'/'+body.dashboardID,body).pipe(tap(() => {
        this.dashboardService.dashboardListSubject.next(true);
        this.appNotification.success('编辑成功');
      }),catchError(this.handleError));
    }
  }

  /**
   * 导出json
   *
   */
  getCellSet(cardID:string,dataSetID:string,params?:SelectParam[],pageParams?:number[],isTemplate?:boolean):Observable<any>{
    let url=`${CHANG.API.OLAP}/query/export/json?cardid=${cardID}&datasetid=${dataSetID}&flattened=false`;
    // if(isTemplate){
    //   url+='&template='+isTemplate
    // }
    // let searchParams=new URLSearchParams();
    // if(params) {
    //   for (let pa of params) {
    //     if(pa.value.length==0){
    //       searchParams.set('param'+pa.name, "");
    //     }else {
    //       searchParams.set('param' + pa.name, pa.value.join(','));
    //     }
    //   }
    // }
    // if(pageParams&&pageParams.length>0){
    //   searchParams.set("pageSize", pageParams[0].toString());
    //   searchParams.set("curPage", pageParams[1].toString());
    // }
    return this.http.get(url).pipe(timeout(60000),catchError(this.handleError));
  }

  /**
   * 删除数据集
   * @param dashboardID
   * @returns Observable<any>
   */
  deleteDashboard(dashboardID : string) : Observable<any>{
    return this.http.delete(CHANG.API.DASHBOARD+`/${dashboardID}`)
      .pipe(map((res:DataResponse) => {
        console.log(res);
        if(res.status ===200) {
          this.dashboardService.dashboardListSubject.next(true);
          return true;
        } else {
          return false;
        }

    }),catchError(this.handleError));
  }

  /////////////////////////获取地图数据接口
  /**
   * 获取地图数据接口
   * @param name 本地资源 assets/mock-data/china.json 或者 assets/mock-data/province/* 省会拼音
   */
  getMapJsonByName(name='china'): Observable<any> {
    let url ='';
    if(name==='china') {
      url = 'assets/mock-data/china.json';
    } else {
      url = 'assets/mock-data/province/'+name+'.json';
    }
    return this.http.get(url);
  }

  /**
   * 获取OLAPd的中国地图JSON
   */
  getOlapChinaJson(): Observable<any> {
    return this.http.get('assets/mock-data/china-meta.json');
  }

  createOlapUtil(options): Observable<any> {
    const chinaData = localStorage.getItem('chinaMapData');
    if(chinaData) {
       const data = JSON.parse(chinaData);
      return Observable.of(new OlapUtil(options,data));
    } else {
      return this.getOlapChinaJson().pipe(switchMap((res) => {
        localStorage.setItem('chinaMapData',JSON.stringify(res['chinaMap']));
        return Observable.of(new OlapUtil(options,res['chinaMap']));
      }));
    }
  }

  createQueryUtil(options): Observable<any> {
    const chinaData = localStorage.getItem('chinaMapData');
    if(chinaData) {
      const data = JSON.parse(chinaData);
      return Observable.of(new QueryUtil(options,data));
    } else {
      return this.getOlapChinaJson().pipe(switchMap((res) => {
        localStorage.setItem('chinaMapData',JSON.stringify(res['chinaMap']));
        return Observable.of(new QueryUtil(options,res['chinaMap']));
      }));
    }
  }
}
