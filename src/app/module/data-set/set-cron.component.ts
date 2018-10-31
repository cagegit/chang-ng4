/**
 * Created by houxh on 2017-2-10.
 */
import {Component, ViewChild, Input} from "@angular/core"
import {DataSetService} from "../../common/service/data-set.service";
import {ModalDirective} from "ng2-bootstrap";
@Component({
  selector: 'set-cron',
  templateUrl: './set-cron.component.html',
  styleUrls: ['./set-cron.component.css']
})
export class SetCronComponent {
  @ViewChild('cronBox') cronBox:ModalDirective;
  @Input() dataSetID:string;
  cronDay=[1,2,3,4,5,6,7,8,9,10,15,30];
  cornStartTime=[0,1,2,3,4,5,6,7,8,9,10];
  intervalDay:number=1;
  startTime:number=0;
  intervalHour:number=1;
  cronType:number=1;
  constructor(private dataSetService:DataSetService) {

  }

  showModal() {
    this.dataSetService.getDataSetSchedule(this.dataSetID).subscribe(rep=>{
      let cronExpress =rep.cronExpression;
      if(cronExpress!='disabled'){
        let arrCron=cronExpress.split(' ');
        if(arrCron[2].length>=3){
          this.intervalHour=parseInt(arrCron[2].split('/')[1]);
          this.cronType=2;
        }else if(arrCron[3].length>=3){
          if(arrCron[3].length>=3) {
            let dayArr = arrCron[3].split('/');
            this.intervalDay = dayArr[1];
            this.startTime = arrCron[2];
            this.cronType = 1;
          }
        }else{
          this.cronType=3;
        }
      }else{
        this.cronType=3;
      }
    })
    this.cronBox.show();
  }

  closeModal() {
    this.cronBox.hide();
  }
  changeDay(e:any){
    let target = e.target;
    let index = target.selectedIndex;
    let val = target.options[index].value;
    this.intervalDay=parseInt(val);
  }
  changeStartTime(e:any){
    let target = e.target;
    let index = target.selectedIndex;
    let val = target.options[index].value;
    this.startTime=parseInt(val);
  }
  changeHour(e:any){
    let target = e.target;
    let index = target.selectedIndex;
    let val = target.options[index].value;
    this.intervalHour=parseInt(val);
  }
  cronTypeFn(type:number){
    this.cronType=type;
  }
  save(){
    let cronExpress='';
    if(this.cronType==1){
      cronExpress=`0 0 ${this.startTime} 1/${this.intervalDay} * ?`;
    }else if(this.cronType==2){
      cronExpress=`0 0 0/${this.intervalHour} * * ?`;
    }else if(this.cronType==3){
      cronExpress=``;
    }
    let $this=this;
    if(cronExpress!=''){
      this.dataSetService.updateDataSetSchedule(this.dataSetID,cronExpress).subscribe(rep=>{
        $this.cronBox.hide();
      })
    }else{
      this.dataSetService.deleteDataSetSchedule(this.dataSetID).subscribe(rep=>{
        $this.cronBox.hide();
      })
    }

  }
}
