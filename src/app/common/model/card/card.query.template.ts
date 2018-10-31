import {Cube} from "./schema.cube";
export class QueryTemplate {
  queryModel: QueryModel;
  queryType: string;
  type: string;
  name: string;
  properties: any;
  cube: Cube;
  parameters: any;
  mdx: string;
}
export class QueryModel {
  axes: Sections;//Map<string, Section>;
  visualTotals: boolean;
  visualTotalsPattern: any;
  lowestLevelsOnly: boolean;
  details: Detail;
  calculatedMeasures: any[];
  calculatedMembers: any[];
}
export class Sections {
  FILTER: Section;
  ROWS: Section;
  COLUMNS: Section;
}
export class Section {
  mdx: string;
  filters: any[];
  sortOrder: any;
  sortEvaluationLiteral: any;
  hierarchizeMode: any;
  location: string;
  hierarchies: Hierarchy[];
  nonEmpty: boolean;
}
export class Hierarchy {
  mdx: any;
  filters: any[];
  sortOrder: any;
  sortEvaluationLiteral: any;
  hierarchizeMode: any;
  name: string;
  caption: string;
  dimension: string;
  levels: any;// HashMap<string, Level>;
  // cmembers: any;
}
export class Level {
  aggregators: string[];
  caption: string;
  filters: any[];
  mdx: string;
  name: string;
  selection: Selection;
}

export class Selection {
  members: Member[];
  parameter: string;
  type: string;
}
//纬度成员
export class Member {
  caption: string;
  uniqueName: string;
  name: string;
}

export class Detail {
  axis: string;
  location: string;
  measures: Measure[];
}
//查询model指标
export class Measure {
  name: string;
  uniqueName: string;
  caption: string;
  type: string;
}
export class HashMap<K extends String, V> {
  private list: any;

  constructor() {
    this.list = {};
  }

  get(key: string): any {
    for (let k in this.list) {
      if (k == key) {
        return this.list[k];
      }
    }
  }

  add(key: string, value: V) {
    this.list[key] = value;
    // this.list=Object.assign(this.list, {key : value});
    // Object.assign(this.list, {key : value});
    // this.list[key]=value;
  }

  allValues(): Array<V> {
    let allValue = new Array();
    for (let v in this.list) {
      allValue.push(this.list[v]);
    }
    return allValue;
  }

  hasKey(key: string): boolean {
    for (let k in this.list) {
      if (k == key)
        return true;
    }
    return false;
  }

  allKeys(): any {
    let allKey = [];
    for (let k in this.list) {
      allKey.push(k);
    }
    return allKey;
  }

  del(key: string) {
    for (let k in this.list) {
      if (k == key) {
        delete this.list[k];
      }
    }
  }

  clear() {
    for (let k in this.list) {
      delete this.list[k];
    }
  }

  // forEach():any{
  //   let all=new Array();
  //   for(let a in this.list){
  //     let cell=[];
  //     cell.push(a);
  //     cell.push(this.list[a]);
  //     all.push(cell);
  //   }
  //   return all;
  // }
  // [Symbol.iterator](): IterableIterator<K,V>;
  // keys(): IterableIterator<K>;
  // values(): IterableIterator<V>;
}
export class FilterCondition {
  name: string;
  showName: string;
  values: string = '';
}
