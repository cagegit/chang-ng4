import {Dimension, Hierarchy, Level} from "../../common/model/card/schema.dimension";
import {Measure} from "../../common/model/card/schema.measure";
// import {Measure as queryM} from "../../common/model/card/card.query.template";
import {TemplateHelper} from "./templateHelper";
// import {Member} from "../../common/model/card/card.query.template";
import {Cell} from "../../common/model/card/card.resut";
import * as query from "../../common/model/card/card.query.template";
import {QueryMeta, ShowColumn} from "../../common/model/card/query.model";
/**
 * Created by houxh on 2017-1-6.
 * 主要用于下钻和切片
 */
export class CardUtils{

   checkDimensionStatus(dim:Dimension):boolean {
    // if (dim.hasOwnProperty('visible')) {
    //   return dim.visible;
    // }
    return true;
  }

   checkHierarchyStatus(hi:Hierarchy):boolean {
    if (hi.hasOwnProperty('visible')) {
      return hi.visible;
    }
    return true;
  }
  //创建UUID
  createUUID():string {
    let uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,
      function (c) {
        let r = Math.random() * 16 | 0,
          v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      }).toUpperCase();
    return uuid;
  }
  //设置需要下钻的维度drill属性
  checkDrill(selectDims:any,dimensions:Dimension[]):Dimension[]{
    for(let rowDim of selectDims){
      dimensions.forEach(d=>{
        if(rowDim.dimension==d.name){
          // d['isdrill']=true;
          d.hierarchies.forEach(h=>{
            if(rowDim.hierarchy==h.uniqueName){
              // h['isdrill']=true;
              if(h.levels.length>2) {
                d['isdrill']=true;
                h['isdrill']=true;
                h.levels.forEach(l=> {
                  if (l.uniqueName == rowDim.level) {
                    l['isdrill'] = true;
                  }
                })
              }
            }
          })
        }
      })
    }
    return dimensions;
  }
  //设置需要切片的维度默认选中属性
  checkSection(selectDims:any,dimensions:Dimension[]):Dimension[]{
    for(let rowDim of selectDims){
      if(!dimensions)
        return;
      dimensions.forEach(d=>{
        if(!d)
          return;
        if(rowDim.dimension===d.name){
          d['isdrill']=true;
          d.hierarchies.forEach(h=>{
            if(!h)
              return;
            if(rowDim.hierarchy===h.uniqueName){
              h['isdrill']=true;
                h.levels.forEach(l=> {
                  if(!l)
                    return;
                  if (l.uniqueName === rowDim.level) {
                    l['isdrill'] = true;
                  }
                })
            }
          })
        }
      })
    }
    return dimensions;
  }
  //设置需要切片指标选中属性
  checkSectionMeasures(sectionMeasure:any,measures:Measure[]){
     if(!measures)
       return;
      measures.forEach(m=>{
        if(m.name===sectionMeasure.name){
          m['isSection']=true;
        }
      })
    return measures;
  }
  //检测选中的维度中是否有可以下钻的维度
  static checkDrillDim(selectDims:any,dimensions:Dimension[]):boolean{
    let hasDrill=false;
    for(let rowDim of selectDims){
      if(!dimensions)
        return;
      dimensions.forEach(d=>{
        if(!d)
          return;
        if(rowDim.dimension==d.name){
          d.hierarchies.forEach(h=>{
            if(!h)
              return;
            if(rowDim.hierarchy==h.uniqueName){
              if(h.levels.length>2) {
                hasDrill=true;
                return;
              }
            }
          })
        }
      })
    }
    return hasDrill;
  }
  //深度拷贝所有维度
  deepCloneDim(originDim:Dimension[]):Dimension[] {
    let newarg = [];
    console.log('originDim:',originDim);
    if(!originDim)
      return;
    for (let pro of originDim) {
      let newDim = new Dimension();
      //遍历dimension属性
      for (let attr in pro) {
        if (attr == 'hierarchies') {
          let newHire = []
          //遍历hierarchy
          for (let h of pro[attr]) {
            let newh = new Hierarchy();
            //遍历hierarchy属性
            for (let hAttr in h) {
              if (hAttr == 'levels') {
                //遍历levels
                let newLvs=[];
                for(let l of h[hAttr]){
                  let newLv = new Level();
                  //遍历level属性
                  for (let lAttr in l) {
                    newLv[lAttr] = l[lAttr];
                  }
                  newLv['isSection']=false;
                  newLvs.push(newLv);
                }
                newh[hAttr]=newLvs;
              } else {
                newh[hAttr] = h[hAttr];
              }
            }
            newh['isSection']=false;
            newHire.push(newh);
          }
          newDim[attr]=newHire;
        } else {
          newDim[attr] = pro[attr];
        }
      }
      newarg.push(newDim);
    }
    return newarg;
  }
  deepCloneHierarchies(hierarchies:any):any{
  let newHire = []
  //遍历hierarchy
  for (let h of hierarchies) {
    let newh = new Hierarchy();
    //遍历hierarchy属性
    for (let hAttr in h) {
      if (hAttr == 'levels') {
        //遍历levels
        let newLvs=[];
        for(let l in h[hAttr]){
          let newLv = new Level();
          //遍历level属性
          for (let lAttr in h[hAttr][l]) {
            newLv[lAttr] = h[hAttr][l][lAttr];
          }
          newLvs.push(newLv);
        }
        newh[hAttr]=newLvs;
      } else {
        newh[hAttr] = h[hAttr];
      }
    }
    newHire.push(newh);
  }
 return newHire;
}
  /**
   * 深度拷贝所有指标
   * @param originMeasures 要拷贝的指标数组
   * @returns 拷贝后的指标数组
     */
  deepCloneMeasure(originMeasures:Measure[]):Measure[]{
    let cloneMeasures=[];
    if(!originMeasures)
      return;
    for(let pro of originMeasures){
      let cloneMeasure=new Measure();
      for(let attr in pro){
        cloneMeasure[attr]=pro[attr];
      }
    cloneMeasures.push(cloneMeasure);
    }
    return cloneMeasures;
  }

  simpleCloneQueryHierarchy(obj:query.Hierarchy[]):query.Hierarchy[] {
    let newHier = [];
    for (let h of obj) {
      newHier.push(h);
    }
    return newHier;
  }

  simpleCloneQueryMeasure(obj:query.Measure[]):query.Measure[] {
    let newMeasures = [];
    for (let m of obj) {
      newMeasures.push(m);
    }
    return newMeasures;
  }
  /**
   * 设置下钻时的维度
   * @param selectDim 选中的维度
   * @param showDim 当前Card的维度
   * @param helper TemplateHelper
   * @param cols 下钻时选中的列
   * @param rows 下钻时选中的行
   */
  static setDrillDownDimensions(selectDim:any,showDim:Dimension[],helper:TemplateHelper,cols:any,rows:any):void {
    for (let d of selectDim) {
      let axisName = this.checkAxis(d['dim'],cols,rows);
      let hierarchyName = d['hierarchy'];
      let levels = new Array<Level>();
      for (let dim of showDim) {
        if (dim.name == d['dim']) {
          for (let h of dim.hierarchies) {
            if (h.uniqueName == d['hierarchy']) {
              for (let l = 0; l < h.levels.length; l++) {
                if (l > 0 && l <= d['index']) {
                  let lin = levels.findIndex(lv=> {
                    if (lv.name == h.levels[l].name)
                      return true;
                  })
                  h.levels[l]['index'] = l;
                  if (lin < 0)
                    levels.push(h.levels[l]);
                }
              }
            }
          }
        }
      }
      let curHierarchy = helper.getHierarchy(hierarchyName);
      curHierarchy.levels = {};
      for (let l of levels) {
        helper.includeLevel(axisName, hierarchyName, d['hierarchyCaption'], l.name, l.caption, d['dim'], l['index']);
        let members = new Array<query.Member>();
        if (axisName == 'ROWS') {
          rows.forEach(r=> {
            if (d['dim'] == r.dimension && d['hierarchy'] == r.hierarchy && l.uniqueName == r.level) {
              let meArr = r.uniquename.split('.');
              let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
              let member = new query.Member();
              member.uniqueName = r.uniquename;
              member.name = name;
              member.caption = name;
              members.push(member);
            }
          })

        } else if (axisName == 'COLUMNS') {
          cols.forEach(r=> {
            if (d['dim'] == r.dimension && d['hierarchy'] == r.hierarchy && l.uniqueName == r.level) {
              let meArr = r.uniquename.split('.');
              let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
              let member = new query.Member();
              member.uniqueName = r.uniquename;
              member.name = name;
              member.caption = name;
              members.push(member);
            }
          })
        }

        curHierarchy.levels[l.name]['selection'] = {
          type: "INCLUSION",
          members: members
        };
      }
    }
    //处理 selectDim之外的维度 start
    for (let c of cols) {
      let hasC = selectDim.findIndex(s=> {
        if (s['dim'] == c.dimension)
          return true;
      });
      if (hasC < 0) {
        let ch = helper.getHierarchy(c.hierarchy);
        let level = this.getLevelFromDimensionsByLevelUniqueName(c,showDim);
        if (level) {
          let meArr = c.uniquename.split('.');
          let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
          ch.levels[level.name]['selection'] = {
            type: "INCLUSION",
            members: [{
              uniqueName: c.uniquename,
              name: name,
              caption: name
            }]
          };
        }
      }
    }
    for (let r of rows) {
      let hasR = selectDim.findIndex(s=> {
        if (s['dim'] == r.dimension)
          return true;
      });
      if (hasR < 0) {
        let ch = helper.getHierarchy(r.hierarchy);
        let level = this.getLevelFromDimensionsByLevelUniqueName(r,showDim);
        if (level) {
          let meArr = r.uniquename.split('.');
          let name = meArr[meArr.length - 1].replace(/[\[\]]/g, '');
          ch.levels[level.name]['selection'] = {
            type: "INCLUSION",
            members: [{
              uniqueName: r.uniquename,
              name: name,
              caption: name
            }]
          };
        }
      }
    }

  }
  //根据LevelUniqueName获取Level对象
  static getLevelFromDimensionsByLevelUniqueName(obj:any,dimensions:Dimension[]):Level {
    for (let dim of dimensions) {
      if (obj.dimension == dim.name) {
        for (let h of dim.hierarchies) {
          if (h.uniqueName == obj.hierarchy) {
            for (let l of h.levels) {
              if (l.uniqueName == obj.level) {
                return l;
              }
            }
          }
        }
      }
    }
    return null;
  }

  /**
   * 根据维度Name获取维度所在位置 cols or rows
   * @param dimName 维度名
   * @param cols 下钻或切片时选中的列
   * @param rows 下钻或切片时选中的行
   * @returns COLUMNS or ROWS
     */
  static checkAxis(dimName:string,cols:any,rows:any):string {
    let axisName = 'ROWS';
    for (let col of cols) {
      if (col.dimension == dimName) {
        return axisName = 'COLUMNS';
      }
    }
    for (let row of rows) {
      if (row.dimension == dimName) {
        return axisName = 'ROWS';
      }
    }
  }

  /**
   * 当下钻或切片时，点击table单元格 或 chart point获取当前单元格的维度和指标
   * @param x 在table中的rowIndex
   * @param y 在table中的colIndex
   * @param cellset 当前结果集
   * @returns {measure:measure, rows:rows, cols:cols}
     */
  static getHitCellProperties(x,y,cellset:Array<Cell[]>):any{
    if(!cellset||cellset.length<=0){
      return null;
    }
    //当前列已选维度
    let cols = [];
    //当前行已选维度
    let rows = [];
    //设置当前y轴上的维度
    let measure = new query.Measure();//queryM();
    for (let i = 0; i < cellset.length; i++) {
      if (cellset[i][0].type == 'COLUMN_HEADER') {
        cols.push(cellset[i][y].properties);
      }
      if (cellset[i][0].type == 'ROW_HEADER_HEADER') {
        measure.uniqueName = cellset[i][y].properties['uniquename'];
        measure.name = measure.uniqueName.split('].[')[1].replace(']', '');
        measure.caption = cellset[i][y].value;
        measure.type = "EXACT";
      }
      if (i == x) {
        for (let cell of cellset[i]) {
          if (cell.type == 'ROW_HEADER') {
            rows.push(cell.properties);
          }
        }
      }
    }
    return {measure:measure, rows:rows, cols:cols};
  }

  static getKey(showColumn: ShowColumn, keyCell: QueryMeta, rowData: string,index:number) {
    if (keyCell.columnType == 'DATE') {
      let dateArr = rowData.split('-');
      if (showColumn.showName == '年') {
        return dateArr[0];
      } else if (showColumn.showName == '月') {
        if(index==0)
        return dateArr[1];
        else
          return '-'+dateArr[1];
      } else if (showColumn.showName == '日') {
        if(index==0)
          return dateArr[2];
        else
          return '-'+dateArr[2];
      }
    } else if (keyCell.columnType == 'TIME') {
      let dateArr = rowData.split(':');
      if (showColumn.showName == '时') {
        return dateArr[0];
      } else if (showColumn.showName == '分') {
        if(index==0)
          return  dateArr[1];
        else
          return ':'+ dateArr[1];
      } else if (showColumn.showName == '秒') {
        if(index==0)
          return  dateArr[2];
        else
          return ':'+ dateArr[2];
      }
    } else if (keyCell.columnType == 'TIMESTAMP') {
      let dt = new Date(parseInt(rowData));
      if (showColumn.showName == '年') {
        return dt.getFullYear();
      } else if (showColumn.showName == '月') {
        if(index==0)
        return dt.getMonth() + 1;
        else
          return '-'+(dt.getMonth() + 1);
      } else if (showColumn.showName == '日') {
        if(index==0)
        return dt.getDate();
        else
          return '-'+dt.getDate();
      } else if (showColumn.showName == '时') {
        if(index==0)
        return dt.getHours();
        else
          return ' '+dt.getHours();
      } else if (showColumn.showName == '分') {
        if(index==0)
        return dt.getMinutes();
        else
          return ':'+dt.getMinutes();
      } else if (showColumn.showName == '秒') {
        if(index==0)
        return dt.getSeconds();
        else
          return ':'+dt.getSeconds();
      }
    }
    return rowData;
  }
}
