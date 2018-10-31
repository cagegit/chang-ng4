import {MetaData} from "../../common/model/card/schema.metadata";
import {HashMap} from "../../common/model/card/card.query.template";

/**
 * Created by houxh on 2016-12-2.
 */
export class Intersection {
  //获取元数据交集，selectCubeName选中measure和dimension的cube集合，允许重复
  //metaDataMap该schema所有cube的元数据
  constructor(private metaDataMap:HashMap<string,MetaData>) {
  }
  /*
  设置要显示的metadata
   */
  intersect(selectCubeName:HashMap<string,string>):MetaData {
    let cubeNames:Set<string> = new Set<string>();
    selectCubeName.allValues().forEach(cubeName=> {
      cubeNames.add(cubeName);
    });
    let curMeta = new MetaData();
    if(cubeNames.size>0) {
      cubeNames.forEach(cubeName=>{
        let showMeta= this.metaDataMap.get(cubeName);
        if(curMeta.dimensions){
          curMeta.dimensions.concat(showMeta.dimensions);
          curMeta.measures.concat(showMeta.measures);
        }else{
          curMeta.dimensions=showMeta.dimensions;
          curMeta.measures=showMeta.measures;
        }
      })

    }else{
      for(let key of this.metaDataMap.allKeys()){
        let meta=this.metaDataMap.get(key);
        if(meta.visible){
          curMeta.dimensions=meta.dimensions;
          curMeta.measures=meta.measures;
        }
      }
    }
    return curMeta;
  }
  findCubeName(memberName:string, type:string):string[] {
    let cubeName = [];
    for (let key of this.metaDataMap.allKeys()) {
      let metaData = this.metaDataMap.get(key) as MetaData;
      if (!metaData.visible&&type == 'dimension') {
        for (let dim of metaData.dimensions) {
          if (dim.name == memberName) {
            cubeName.push(key);
          }
        }
      } else if (!metaData.visible&&type == 'measure') {
        for (let m of metaData.measures) {
          if (m.name == memberName) {
            cubeName.push(key);
          }
        }
      }
    }
    return cubeName;
  }
}
