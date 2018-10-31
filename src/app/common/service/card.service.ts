import {Injectable} from "@angular/core";
import {Http, Response, Headers} from "@angular/http";
import {Observable} from "rxjs/Rx";

import {CFG} from "../CFG";
import {QueryTemplate} from "../model/card/card.query.template";
import {Cube} from "../model/card/schema.cube";
import {DomainFactory} from "../DomainFactory";
import {Cell} from "../model/card/card.resut";
@Injectable()
export class CardService {
  // private serverUrl = CFG.API_SERVER.DEFAULT;// 'http://datasee.csdn.net/datasee/tzy/';
  constructor(private http:Http) {
  }

  getAllDataSource():Observable<any> {
    return this.http.get(CFG.API.OLAP + '/connection')
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getDataSource(connection:string):Observable<any> {
    return this.http.get(CFG.API.OLAP + '/connection/' + connection)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getAllMetaData(connection:string):Observable<any> {
    let url = CFG.API.OLAP + `/${connection}/metadata`;
    return this.http.get(url)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getMetaData(cube:Cube, isTemplate:boolean = false):Observable<any> {
    let url = CFG.API.OLAP + `/${cube.connection}/${cube.catalog}/${cube.schema}/${cube.name}/metadata?template=${isTemplate}`;
    return this.http.get(url)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getMember(cube:Cube, dimension:string, hierarchy:string, level:string, isTemplate:boolean = false):Observable<any> {
    return this.http.get(`${CFG.API.OLAP}/${cube.connection}/${cube.catalog}/${cube.schema}/${cube.name}/dimensions/${dimension}/hierarchies/[${dimension}].[${hierarchy}]/levels/${level}?template=${isTemplate}`)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
    //return this.http.get(encodeURI(CFG.API.OLAP + `/query/${queryname}/result/metadata/hierarchies/${hierarchy}/levels/${level}`))
  }

  createQuery(model:QueryTemplate):Observable<any> {
    let url = CFG.API.OLAP + '/query/' + model.cube.connection + '/' + model.name;
    var headers = new Headers();
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
    var entry = `json=${JSON.stringify(model)}`;
    return this.http.post(url, entry, {headers: headers}).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  execute(model:QueryTemplate):Observable<any> {
    let url = CFG.API.OLAP + '/query/execute';//0/300/
    var entry = `{"ThinQuery":${JSON.stringify(model)}}`;
    return this.http.post(url, entry).timeout(80000).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  executeForPage(model:QueryTemplate, curPage:number, pageSize:number, isTemplate:boolean = false):Observable<any> {
    // let url=this.serverUrl+'olap/query/execute';//0/300/
    let url = `${CFG.API.OLAP}/query/${curPage}/${pageSize}/execute?template=${isTemplate}`;
    var entry = `{"ThinQuery":${JSON.stringify(model)}}`;
    return this.http.post(url, entry).timeout(80000).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }
  executeSQLForPage(sql:string,dataSetId:string, curPage:number, pageSize:number):Observable<any> {
    // let url=this.serverUrl+'olap/query/execute';//0/300/
    let offset=curPage*pageSize;
    let url = `${CFG.API.SQL}/query`;
    var entry = `{"Query":{"sql":"${sql}","dataSetId":"${dataSetId}","limit":${pageSize},"offset":${offset}}}`;
    return this.http.post(url, entry).timeout(80000).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }
  cancel(queryName:string):Observable<any> {
    return this.http.delete(CFG.API.OLAP + '/query/' + queryName + '/cancel/').catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  save(cardName:string, desc:string, dataSetId:string, renderMode:string, model:any, dataBrief:any,queryType:string):Observable<any> {
    let entry = `{"CardVO":{"cardName":"${cardName}","description":"${desc?desc:''}","dataSetId":"${dataSetId}","renderMode":"${renderMode}","content":${JSON.stringify(JSON.stringify(model))},"dataBrief":${JSON.stringify(dataBrief)},"queryType":"${queryType}"}}`;
    return this.http.post(CFG.API.CARD, entry).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  update(cardName:string, cardId:string, desc:string, dataSetId:string, renderMode:string, model:any, dataBrief:any,queryType:string):Observable<any> {
    let entry = `{"CardVO":{"cardId":"${cardId}", "cardName":"${cardName}","description":"${desc?desc:''}","dataSetId":"${dataSetId}","renderMode":"${renderMode}","content":${JSON.stringify(JSON.stringify(model))},"dataBrief":${JSON.stringify(dataBrief)},"queryType":"${queryType}"}}`;
    return this.http.put(CFG.API.CARD, entry).map(response =>response.json()).catch((response:Response) => {
      let errMsg = DomainFactory.buildError(response.json());
      return Observable.throw(errMsg);
    });
  }

  drillthrough(queryname:string, maxrows:number, position:string, returns:string):Observable<any> {
    let params = {
      maxrows: maxrows,
      position: position,
      returns: returns
    };
    return this.http.get(CFG.API.OLAP + `/query/${queryname}/drillthrough`, {"params":params})
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getCard(dataSetId:string, cardId:string):Observable<any> {
    return this.http.get(`${CFG.API.CARD}/id/${dataSetId}/${cardId}`)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getCardSimple(dataSetId:string, cardId:string):Observable<any> {
    return this.http.get(`${CFG.API.CARD}/abstract/id/${dataSetId}/${cardId}`)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  delCard(dataSetId:string, cardId:string):Observable<any> {
    return this.http.delete(`${CFG.API.CARD}/id/${dataSetId}/${cardId}`)
      .map((response:Response) => response.json()).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  getCards(dataSetId:string):Observable<any> {
    return this.http.get(`${CFG.API.CARD}/id/${dataSetId}`)
      .map((response:Response) => {
        if (response.status != 204)
          return response.json().ArrayList;
        else
          return [];
      }).catch((response:Response) => {
        let errMsg = DomainFactory.buildError(response.json());
        return Observable.throw(errMsg);
      });
  }

  exportExcel(queryName:string,fileName:string) {
    console.log('title:',fileName);
    if(fileName)
    location.href = `${CFG.API.OLAP}/query/${queryName}/export/xls/flattened?exportname=`+fileName+'.xls';
    else
      location.href = `${CFG.API.OLAP}/query/${queryName}/export/xls`;
  }

  exportPDF(queryName:string) {
    location.href = `${CFG.API.OLAP}/query/${queryName}/export/pdf`;
  }
}
