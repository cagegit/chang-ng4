/**
 * 模型处理信息  根据DataSet.schemaHandle==null,判断是否需要预计算
 */
export class SchemaHandle{
  /**状态 0 //READY_FOR_BUILD,BUILDING,READY,ERROR  **/
  static STATUS={
    READY_FOR_BUILD : 'READYFORBUILD',
    BUILDING : 'BUILDING',
    READY : 'READY',
    ERROR : 'ERROR'
  }

  /**
   * 获取最新状态间隔时间
   * @type {number}
     */
  static INTERVAL_TIME : number=10*1000;

  status : string;
  /**开始时间**/
  startTime : number;
  /**结束时间**/
  endTime : number;
  /**预计剩余时间:**/
  remainingTime : number;

  /**页面初始化时的完成率 0--100 **/
  completePercent : number;

  modifyStatus : string;
  createTime : number;



  get statusDesc() : string{
    let text='';
    switch (this.status){
      case SchemaHandle.STATUS.READY_FOR_BUILD :
            text='启动模型';
            break;
      case SchemaHandle.STATUS.BUILDING :
            text='模型构建中';
            break;
      case SchemaHandle.STATUS.READY :
            text='更新数据';
            break;
      case SchemaHandle.STATUS.ERROR :
            text='更新数据';
            break;
    }
    return text;
  }
  /**绿色 green 黄色 yellow 红色 c_ef5350 灰色 self_cancel **/
  get statusColor() : string{
    let text='self_btn schema_compute_btn ';
    switch (this.status){
      case SchemaHandle.STATUS.READY_FOR_BUILD :
        text+='green';
        break;
      case SchemaHandle.STATUS.BUILDING :
        text+='self_cancel';
        break;
      case SchemaHandle.STATUS.READY :{
        if(this.modifyStatus=="NO"){
          text+='green';
        }else{
          text+='yellow';
        }
        break;
      }
      case SchemaHandle.STATUS.ERROR :
        text+='c_ef5350';
        break;
    }
    return text;
  }

  /**
   * kylin模型与datasee模型是否不同
   * @returns {boolean}   true不同,需要重新预计算  false相同,不需要重新预计算
     */
  get schemaDifferent() : boolean{
    if((this.status==SchemaHandle.STATUS.READY)&&(this.status==SchemaHandle.STATUS.ERROR)&&(this.modifyStatus=="YES")){
      return true
    }
    return false;
  }

  get showTips() : boolean{
    if((this.status==SchemaHandle.STATUS.READY)||(this.status==SchemaHandle.STATUS.ERROR)){
      return true
    }
    return false;
  }


  get remainingTimeDesc() : string{
    let str : string='';
    // let remainingSecond=Math.round(this.remainingTime/1000);
    let remainingSecond=this.remainingTime;
    let hour=Math.floor(remainingSecond / 3600);
    let min=Math.floor((remainingSecond-hour * 60 *60) / 60);
    let second=remainingSecond-hour * 60 *60-min * 60;
    if(remainingSecond>0){
      str=`${hour}小时${min}分${second}秒`;
    }
    return str;
  }

    constructor(status:string, startTime:number, endTime:number, remainingTime:number, completePercent:number,modifyStatus : string,createTime : number) {
      this.status = status;
      this.startTime = startTime;
      this.endTime = endTime;
      this.remainingTime = remainingTime;
      this.completePercent = completePercent;
      this.modifyStatus=modifyStatus;
      this.createTime=createTime;
      // setInterval(()=>{
      //   this.remainingTime-=1000;
      // },1000);
    }

    /**
     * 根据简单对象构建
     * @param simpleObj
     */
    static build(simpleObj : SchemaHandle) : SchemaHandle{
      return new SchemaHandle(simpleObj.status,simpleObj.startTime,simpleObj.endTime,simpleObj.remainingTime,simpleObj.completePercent,simpleObj.modifyStatus,simpleObj.createTime);
    }
}
