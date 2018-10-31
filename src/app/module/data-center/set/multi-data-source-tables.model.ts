import {DataSource} from "../../../common/model/data-source.model";
import {Subject} from "rxjs/Subject";
import {Observable} from "rxjs/Observable";
import {DataSourceTable} from "../../../common/model/data-source-table.model";

/**
 * 多数据源选表模型
 */
export class MultiDataSourceTablesModel{
  get origList(): DataSource[] {
    return this._origList;
  }

  set origList(value: DataSource[]) {
    this._origList = value;
  }
  /**
   * 搜索筛选项
   */
  filterSearch : string;
  /**
   * 原始列表
   * @type {Array}
   */
  private _origList : DataSource[]=[];
  /**
   * 展示列表
   * @type {Array}
   */
  showList : DataSource[]=[];
  /**
   * 排除列表
   * @type {Array}
   */
  excludeTables : DataSourceTable[]=[];

  searchTermStream = new Subject<any>();

  constructor(){
    this.searchTermStream.debounceTime(500).distinctUntilChanged()
      .switchMap((keyword : string) => {
        return Observable.of(keyword);
      }).subscribe((keyword : string) => {
      this.filter(keyword);
    });
  }

  selectedTables():string[]{
    let arr=[];
    this.origList.forEach((dataSource : DataSource)=>{
      dataSource.tables.forEach((table : DataSourceTable)=>{
        arr.push(table.tableName);
      });
    });
    return arr;
  }

  /**
   * 重新渲染并展示数据
   */
  refresh(){
      console.log("重新渲染数据","origList",this.origList);
      this.showList=this.origList.map((dataSource : DataSource)=>{
        let tables=dataSource.tables.filter((table : DataSourceTable)=>{
          return (this.filterSearch? new RegExp(this.filterSearch.toLowerCase()).test(table.tableName.toLowerCase()) : true)&&
            (!DataSourceTable.containsTable(this.excludeTables,table));
        });
        let newDataSource=DataSource.build(dataSource);
        newDataSource.tables=tables;
        return newDataSource;
      });
      console.warn("origList",this.origList);
  }

  /**
   * 搜索
   * @param item
   */
  search(keyword : string) {
    this.searchTermStream.next(keyword);
  }

  filter(keyword : string){
    this.filterSearch=keyword;
    this.refresh();
  }

  /**
   * 添加数据源,以及相关的table
   * @param dataSources
   */
  addDataSourceAndTables(dataSources : DataSource[]){
    console.log("addDataSourceAdnTables:",dataSources);
    dataSources.forEach((dataSource : DataSource)=>{
      let targetDataSource=this.origList.find((temp:DataSource)=>{
        return temp.match(dataSource);
      })
      if(!targetDataSource){
        //目标父节点不存在,则直接拼接父子节点
        console.log("父节点不存在:")
        this.origList.push(dataSource);
      }else{

        //目标父节点存在,则追加子节点
        dataSource.tables.forEach((table : DataSourceTable)=>{
          if(!targetDataSource.tables.find((oldTable : DataSourceTable)=>{
              return oldTable.tableName==table.tableName;})){
            targetDataSource.tables.push(table);
          }
        });
        DataSourceTable.sort(dataSource.tables);
      }
    });
    DataSource.sort(this.origList);
    this.clearInvalidDataSource();
    this.refresh();
  }

  filterChecked():DataSource[]{
    return this.origList.map((dataSource : DataSource)=>{
      let tables=dataSource.tables.filter((table : DataSourceTable)=>{
        return table.checked;
      });
      let newDataSource=dataSource.clone();
      newDataSource.tables=tables;
      return newDataSource;
    });
  }

  removeDataSource(dataSource : DataSource){
    this._origList=this._origList.filter((temp:DataSource)=>{
      return temp.dataSourceID!=dataSource.dataSourceID;
    });
    this.refresh();
  }


  /**
   * 清除table的数据源节点
   */
  clearInvalidDataSource(){
    this._origList=this._origList.filter((dataSource : DataSource)=>{
      return dataSource.tables.length>0;
    });
  }

  /**
   * 清除全部数据
   */
  clearAll(){
    this.origList=[];
    this.refresh();
  }

  /**
   * 清除已选中
   */
  clearChecked(){
    this.origList=this.origList.map((dataSource : DataSource)=>{
      dataSource.tables=dataSource.tables.filter((table : DataSourceTable)=>{
        return !table.checked;
      });
      return dataSource;
    });
    this.clearInvalidDataSource();
    this.refresh();
  }



}
