export class Pagination{
  pageSize : number=10;
  current: number=0;
  total : number=0;
  gotoPage : number=1;
  maxShowPage : number=10;
  constructor(pageSize?:number, current?:number, total?:number) {
      this.pageSize = pageSize;
      this.current = current;
      this.total = total;
   }

  /**
   * 根据简单对象构建
   * @param simpleObj
   */
  static build(simpleObj : any) : Pagination{
    return new Pagination(simpleObj.per_page,simpleObj.page,simpleObj.total);
  }

}
