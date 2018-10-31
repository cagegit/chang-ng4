import * as query from "../../common/model/card/card.query.template";
import {HashMap} from "../../common/model/card/card.query.template";
import {SelectParam} from "../../common/model/dashboard.model";
/**
 * Created by houxh on 2016-11-24.
 */

export class TemplateHelper {

  public queryTemplate:query.QueryTemplate;
  hierarchLevels:HashMap<string,SortLevel[]> = new HashMap<string,SortLevel[]>();

  constructor() {
    let OlapQueryTemplate = {
      "queryModel": {
        "axes": {
          "FILTER": {
            "mdx": null,
            "filters": [],
            "sortOrder": null,
            "sortEvaluationLiteral": null,
            "hierarchizeMode": null,
            "location": "FILTER",
            "hierarchies": [],
            "nonEmpty": false
          },
          "COLUMNS": {
            "mdx": null,
            "filters": [],
            "sortOrder": null,
            "sortEvaluationLiteral": null,
            "hierarchizeMode": null,
            "location": "COLUMNS",
            "hierarchies": [],
            "nonEmpty": true
          },
          "ROWS": {
            "mdx": null,
            "filters": [],
            "sortOrder": null,
            "sortEvaluationLiteral": null,
            "hierarchizeMode": null,
            "location": "ROWS",
            "hierarchies": [],
            "nonEmpty": true
          }
        },
        "visualTotals": false,
        "visualTotalsPattern": null,
        "lowestLevelsOnly": false,
        "details": {
          "axis": "COLUMNS",
          "location": "BOTTOM",
          "measures": []
        },
        "calculatedMeasures": [],
        "calculatedMembers": []
      },
      "properties": {
        "saiku.olap.query.automatic_execution": true,
        "saiku.olap.query.nonempty": true,
        "saiku.olap.query.nonempty.rows": true,
        "saiku.olap.query.nonempty.columns": true,
        "saiku.ui.render.mode": "table",
        "saiku.olap.query.filter": true,
        "saiku.olap.result.formatter": "flattened",
        "org.saiku.query.explain": true,
        "saiku.olap.query.drillthrough": true,
        "org.saiku.connection.scenario": false
      },
      "queryType": "OLAP",
      "type": "QUERYMODEL"
    };
    this.queryTemplate = OlapQueryTemplate as query.QueryTemplate;
  }

  model():query.QueryTemplate {
    return this.queryTemplate;
  };

  clearAxis(axisName:string) {
    for (let hierarchy of this.model().queryModel.axes[axisName].hierarchies) {
      if (this.hierarchLevels.get(hierarchy.name)) {
        this.hierarchLevels.del(hierarchy.name);
      }
    }
    this.model().queryModel.axes[axisName].hierarchies = [];
  };

  clearAggs(){
    for(let axisName in this.model().queryModel.axes){
      this.queryTemplate.queryModel.axes[axisName].filters=[];
      this.queryTemplate.queryModel.axes[axisName].sortEvaluationLiteral=null;
      this.queryTemplate.queryModel.axes[axisName].sortOrder=null;
      this.queryTemplate.queryModel.axes[axisName].aggs=[];
    }
  }
  getHierarchyLevels() {
    for (let h of this.model().queryModel.axes.COLUMNS.hierarchies) {
      let sls = new Array<SortLevel>();
      let i = 0;
      for (let l of Object.keys(h.levels)) {
        let sl = new SortLevel();
        sl.caption = h.levels[l].caption;
        sl.name = h.levels[l].name;
        sl.index = i;
        i++;
        sls.push(sl);
      }
      this.hierarchLevels.add(h.name, sls);
    }
    for (let h of this.model().queryModel.axes.ROWS.hierarchies) {
      let sls = new Array<SortLevel>();
      let i = 0;
      for (let l of Object.keys(h.levels)) {
        let sl = new SortLevel();
        sl.caption = h.levels[l].caption;
        sl.name = h.levels[l].name;
        sl.index = i;
        i++;
        sls.push(sl);
      }
      this.hierarchLevels.add(h.name, sls);
    }
    for (let h of this.model().queryModel.axes.FILTER.hierarchies) {
      let sls = new Array<SortLevel>();
      let i = 0;
      for (let l of Object.keys(h.levels)) {
        let sl = new SortLevel();
        sl.caption = h.levels[l].caption;
        sl.name = h.levels[l].name;
        sl.index = i;
        i++;
        sls.push(sl);
      }
      this.hierarchLevels.add(h.name, sls);
    }
  }

  getHierarchy(name:string):query.Hierarchy {
    for (let axisName in this.model().queryModel.axes) {
      let axis = this.model().queryModel.axes[axisName];
      let hierarchy = axis.hierarchies.find((h)=> {
        return (h && h.name == name);
      });
      if (hierarchy) {
        return hierarchy;
      }
    }
    return null;
  };

  moveHierarchy(fromAxis:string, toAxis:string, hierarchy:string, position?:number) {
    let h = this.getHierarchy(hierarchy);
    let i = this.model().queryModel.axes[fromAxis].hierarchies.indexOf(h);
    let target = this.model().queryModel.axes[toAxis].hierarchies;
    this.model().queryModel.axes[fromAxis].hierarchies.splice(i, 1);
    if (typeof position != "undefined" && position > -1 && target.length > position) {
      target.splice(position, 0, h);
      return;
    }
    target.push(h);

  };

  removeHierarchy(hierarchy:string):query.Hierarchy {
    let h = this.getHierarchy(hierarchy);
    if (!h) {
      return null;
    }
    let axis = this.findAxisForHierarchy(hierarchy);
    if (axis) {
      this.hierarchLevels.del(hierarchy);
      let i = axis.hierarchies.indexOf(h);
      axis.hierarchies.splice(i, 1);
    }
    return h;
  };

  findAxisForHierarchy(hierarchy:string):query.Section {
    for (let axisName in this.model().queryModel.axes) {
      let axis = this.model().queryModel.axes[axisName];
      if (axis.hierarchies && axis.hierarchies.length > 0) {
        for (let i = 0, len = axis.hierarchies.length; i < len; i++) {
          if (axis.hierarchies[i].name == hierarchy) {
            return axis;
          }
        }
      }
    }
    return null;
  };

  getAxis = function (axisName:string):query.Section {
    if (axisName in this.model().queryModel.axes) {
      return this.model().queryModel.axes[axisName];
    }
    // console.log("Cannot find axis: " + axisName);
  };

  removeFilter(filterable:query.Section, flavour:string) {
    if (flavour && filterable.filters.length > 1) {
      let removeIndex = -1;
      for (let i = 0, len = filterable.filters.length; i < len; i++) {
        if (filterable.filters[i].flavour == flavour) {
          removeIndex = i;
        }
      }
      if (removeIndex && removeIndex >= 0) {
        filterable.filters.splice(removeIndex, 0);
      }
    } else {
      filterable.filters = [];
    }
  };

  // setDefaultFilter(hierarchy:string, hierarchyCaption:string, level:string, levelCaption:string, value:string) {
  //   let strip = level.replace("[", "");
  //   strip = strip.replace("]", "");
  //   this.includeLevel("FILTER", hierarchy, hierarchyCaption, strip, levelCaption);
  //   let h = this.getHierarchy(hierarchy).levels[strip];
  //   h.selection = {"type": "INCLUSION", "members": []};
  //   h.selection["parameterName"] = "default_filter_" + strip;
  //   if (!this.model().parameters) {
  //     this.model().parameters = {};
  //   }
  //   let k = "default_filter_" + strip;
  //   this.model().parameters[k] = value;
  // };

  getLevelForParameter(parameter:string):LevelForParameter {
    let m:LevelForParameter;
    let axes = this.model().queryModel.axes;
    for (let key in axes) {
      let hier = axes[key].hierarchies;
      hier.forEach((h)=> {
        for (let l in h.levels) {
          let lev = h.levels[l];
          if (lev.selection && lev.selection.parameter && lev.selection.parameter === parameter) {
            m.hierarchy = h;
            m.level = lev;
          }
        }
      })
    }

    return m;
  };

  getSelectionsForParameter(parameter:string):query.Member {
    let m:query.Member;
    let axes = this.model().queryModel.axes;
    for (let key in axes) {
      let hier = axes[key];
      hier.forEach(h=> {
        for (let l in h.levels) {
          let lev = h.levels[l];
          if (lev.selection && lev.selection.parameter && lev.selection.parameter === parameter) {
            m = lev.selection.members;
            return false;
          }
        }
      })
    }

    return m;
  };

  getAllParameter():query.FilterCondition[] {
    let conditions = [];
    let axes = this.model().queryModel.axes;
    for (let key in axes) {
      let hier = axes[key].hierarchies;
      if(hier==null)
        break;
      hier.forEach(h=> {
        if(h==null)
          return;
        for (let l in h.levels) {
          // let lev = h.levels[l];
          if (h.levels[l].selection && h.levels[l].selection.parameter && h.levels[l].selection.parameter != '') {
            let condition = new query.FilterCondition();
            condition.name = h.levels[l].selection.parameter;
            condition.showName =h.levels[l].caption;
            let values = '';
            h.levels[l].selection.members.forEach(m=> {
              values += m.name + ',';
            })
            if (values.length > 0) {
              condition.values += values.substr(0, values.length - 1);
            }
            conditions.push(condition);
          }
        }
      })
    }
    return conditions;
  }
  getDefaultParameter():SelectParam[] {
    let conditions = [];
    let axes = this.model().queryModel.axes;
    for (let key in axes) {
      let hier = axes[key].hierarchies;
      hier.forEach(h=> {
        for (let l in h.levels) {
          // let lev = h.levels[l];
          if (h.levels[l].selection && h.levels[l].selection.parameter && h.levels[l].selection.parameter != '') {
            let condition = new SelectParam();
            let valArr=[];
            condition.name = h.levels[l].selection.parameter;
            h.levels[l].selection.members.forEach(m=> {
              valArr.push(m.uniqueName);
            })
            condition.value=valArr;
            conditions.push(condition);
          }
        }
      })
    }
    return conditions;
  }
  addtoSelection(membername:string, level:LevelForParameter) {
    if (level.level.selection.members === undefined) {
      level.level.selection.members = [];
    }
    let found = false;
    level.level.selection.members.forEach(m=> {
      if (m.uniqueName == level.hierarchy.name + ".[" + level.level.name + "].[" + membername + "]") {
        found = true;
      }
    })

    if (!found) {
      level.level.selection.members.push({
        uniqueName: level.hierarchy.name + ".[" + level.level.name + "].[" + membername + "]",
        caption: membername,
        name: membername
      })
    }
  };

  includeCmember(hierarchy:string, level:string) {
    let mHierarchy = this.getHierarchy(hierarchy);
    if (mHierarchy) {
      // mHierarchy.cmembers[level] = level;
      // mHierarchy.cmembers = {};
    }
  }

  includeLevel(axis:string, hierarchyName:string, hierarchyCaption:string, levelName:string, levelCaption:string, dimensionName:string, levelIndex?:number, position?:number) {
    let mHierarchy = this.getHierarchy(hierarchyName);
    let sLevel = new SortLevel();
    sLevel.name = levelName;
    sLevel.caption = levelCaption;
    sLevel.index =levelIndex;
    let sLevels = this.hierarchLevels.get(hierarchyName);
    // console.log('hierarchLevels:', this.hierarchLevels);
    if (sLevels) {
      let sIndex=sLevels.findIndex(sl=>{
          if(sl.name==sLevel.name){
            return true;
          }
        })
      if(sIndex==-1)
        sLevels.push(sLevel);
    } else {
      sLevels = [sLevel];
    }
    sLevels.sort((a, b)=> {
      return a.index-b.index;
      // if (a.index > b.index) {
      //   return 1;
      // } else if (a.index < b.index) {
      //   return -1;
      // }
      // return 0;
    });
    this.hierarchLevels.add(hierarchyName, sLevels);
    if (mHierarchy) {
      let levels = {};
      for (let sl of sLevels) {
        if (Object.keys(mHierarchy.levels).indexOf(sl.name) >= 0) {
          let currentLv = new query.Level();
          currentLv.name = mHierarchy.levels[sl.name].name;
          currentLv.caption = mHierarchy.levels[sl.name].caption;
          currentLv.selection = mHierarchy.levels[sl.name].selection;
          currentLv.aggregators = mHierarchy.levels[sl.name].aggregators;
          currentLv.mdx = mHierarchy.levels[sl.name].mdx;
          currentLv.filters = mHierarchy.levels[sl.name].filters;
          levels[sl.name] = currentLv;
        } else {
          let currentLv = new query.Level();
          currentLv.name = sl.name;
          currentLv.caption = sl.caption;
          currentLv.selection = sl.selection;
          levels[sl.name] = currentLv;
        }
      }
      mHierarchy.levels = levels;

    } else {
      mHierarchy = new query.Hierarchy();
      mHierarchy.name = hierarchyName;
      mHierarchy.caption = hierarchyCaption;
      // mHierarchy.cmembers = [];
      let levels = {};

      for (let sl of sLevels) {
        let currentLv = new query.Level();
        currentLv.name = sl.name;
        currentLv.caption = sl.caption;
        levels[sl.name] = currentLv;
        currentLv.selection = sl.selection;
      }
      mHierarchy.levels = levels;//.add(levelName,currentLv);
      // mHierarchy.cmembers = {};
      mHierarchy.dimension = dimensionName;
    }

    let existingAxis = this.findAxisForHierarchy(hierarchyName);
    if (existingAxis) {
      this.moveHierarchy(existingAxis.location, axis, hierarchyName, position);
    } else {
      let _axis = this.model().queryModel.axes[axis];
      if (_axis) {
        if (typeof position != "undefined" && position > -1 && _axis.hierarchies.length > position) {
          _axis.hierarchies.splice(position, 0, mHierarchy);
          return;
        }
        _axis.hierarchies.push(mHierarchy);
      } else {
        // console.log("Cannot find axis: " + axis + " to include Level: " + levelName);
      }
    }

  }

  includeLevelCalculatedMember(axis:string, hierarchy:string, level:string, uniqueName:string, position:number) {
    let mHierarchy = this.getHierarchy(hierarchy);
    if (mHierarchy) {
      // mHierarchy.cmembers[uniqueName] = uniqueName;
    } else {
      mHierarchy.name = hierarchy;
      mHierarchy.levels = null;
      // mHierarchy.cmembers = {};
      // mHierarchy.cmembers[uniqueName] = uniqueName;
    }

    let existingAxis = this.findAxisForHierarchy(hierarchy);
    if (existingAxis) {
      this.moveHierarchy(existingAxis.location, axis, hierarchy, -1);
    } else {
      let _axis = this.model().queryModel.axes[axis];
      if (_axis) {
        if (typeof position != "undefined" && position > -1 && _axis.hierarchies.length > position) {
          _axis.hierarchies.splice(position, 0, mHierarchy);
          return;
        }
        _axis.hierarchies.push(mHierarchy);
      } else {
        console.log("Cannot find axis: " + axis + " to include Level: " + level);
      }
    }
  };

  checkHierarchyStatus(hierarchy:string):boolean {
    let hierarchyObj = this.getHierarchy(hierarchy);
    if (hierarchyObj) {
      return true;
    }
    return false;
  }

  removeLevel(hierarchy:string, level:string) {
    let hierarchyObj = this.getHierarchy(hierarchy);
    if (hierarchyObj && hierarchyObj.levels.hasOwnProperty(level)) {
      delete hierarchyObj.levels[level];
      let lvs = this.hierarchLevels.get(hierarchy);
      for (let l in lvs) {
        if (lvs[l].name == level) {
          this.hierarchLevels.get(hierarchy).splice(l, 1);
        }
      }
      let hasPro = false;
      for (let pro in hierarchyObj.levels) {
        hasPro = true;
        break;
      }
      if (!hasPro) {
        this.hierarchLevels.del(hierarchy);
        this.removeHierarchy(hierarchy);
      }
    }

  };

  removeLevelCalculatedMemberfunction(hierarchy:string, level:string) {
    let hierarchyObj = this.getHierarchy(hierarchy);
    // if (hierarchyObj && hierarchyObj.cmembers.hasOwnProperty(level)) {
    //   delete hierarchyObj.cmembers[level];
    // }
  };

  removeAllLevelCalculatedMember = function (hierarchy:string) {
    let hierarchyObj = this.getHierarchy(hierarchy);
    hierarchyObj.cmembers = {};

  };


  includeMeasure(measure:query.Measure) {
    let measures = this.model().queryModel.details.measures;
    let len = measures.length;
    let i = 0;
    let aux = false;
    if (measures && len > 0) {
      for (i = 0; i < len; i++) {
        if (measures[i].name === measure.name) {
          aux = true;
          break;
        }
        else {
          aux = false;
        }
      }

      if (aux === false) {
        measures.push(measure);
      }
    }
    else {
      measures.push(measure);
    }
  };

  getMeasures():query.Measure[] {
    return this.model().queryModel.details.measures;
  }

  removeMeasure(name:string) {
    let measures = this.model().queryModel.details.measures;
    let removeMeasure = measures.find((measure)=> {
      return name == measure.name;
    });
    let rmIndex = measures.indexOf(removeMeasure);
    if (removeMeasure && rmIndex > -1) {
      measures = measures.splice(rmIndex, 1);
    }
  };

  clearMeasures() {
    this.model().queryModel.details.measures = [];
  };

  setMeasures(measures:query.Measure[]) {
    this.model().queryModel.details.measures = measures;
  };

  addCalculatedMeasure(measure:query.Measure) {
    if (measure) {
      this.removeCalculatedMeasure(measure.name);
      this.model().queryModel.calculatedMeasures.push(measure);
    }
  };

  editCalculatedMeasure(name:string, measure:query.Measure) {
    if (measure) {
      this.removeCalculatedMeasure(name);
      this.removeCalculatedMember(name);
      this.model().queryModel.calculatedMeasures.push(measure);
    }
  };

  removeCalculatedMeasure(name:string) {
    let measures = this.model().queryModel.calculatedMeasures;
    let removeMeasure = measures.find(m=> {
      return m && m.name == name;
    });
    let rmIndex = measures.indexOf(removeMeasure);
    if (removeMeasure && rmIndex > -1) {
      measures = measures.splice(rmIndex, 1);
      this.model().queryModel.calculatedMeasures = measures;
      //console.log(measures);
    }
  };

  getCalculatedMeasures():any[] {
    let ms = this.model().queryModel.calculatedMeasures;
    if (ms) {
      return ms;
    }
    return null;
  };

  addCalculatedMember(measure:query.Measure) {
    if (measure) {
      this.removeCalculatedMember(measure.name);
      this.model().queryModel.calculatedMembers.push(measure);
    }
  };

  editCalculatedMember(name:string, measure:query.Measure) {
    if (measure) {
      this.removeCalculatedMeasure(name);
      this.removeCalculatedMember(name);
      this.model().queryModel.calculatedMembers.push(measure);
    }
  };

  removeCalculatedMember(name:string) {
    let measures = this.model().queryModel.calculatedMembers;
    let removeMeasure = measures.find(m=> {
      return m && m.name == name;
    });
    let rmIndex = measures.indexOf(removeMeasure);
    if (removeMeasure && rmIndex > -1) {
      measures = measures.splice(rmIndex, 1);
      this.model().queryModel.calculatedMembers = measures;
      //console.log(measures);
    }
  };

  getCalculatedMembers():any[] {
    let ms = this.model().queryModel.calculatedMembers;
    if (ms) {
      return ms;
    }
    return null;
  };

  setQueryTemplate(data:any) {
    this.queryTemplate = data;
    return this;
  }

  swapAxes() {
    let axes = this.model().queryModel.axes;
    let tmpAxis = axes.ROWS;
    tmpAxis.location = 'COLUMNS';
    axes.ROWS = axes.COLUMNS;
    axes.ROWS.location = 'ROWS';
    axes.COLUMNS = tmpAxis;
  };

  changeSectionHierarchy(axesName:string, hierarchy:query.Hierarchy) {
    let hierarchies = this.model().queryModel.axes[axesName].hierarchies;

    if (hierarchies) {
      let hasIndex = hierarchies.findIndex(h=> {
        if (h.name == hierarchy.name)
          return true;
      });
      if (hasIndex >= 0) {
        hierarchies[hasIndex] = hierarchy;
      } else {
        hierarchies.push(hierarchy);
      }
    } else {
      this.model().queryModel[axesName]['hierarchies'] = [hierarchy];
    }
  }

  getLevelByUniqueName(hierarchyName:string, uniqueName:string):query.Level {
    let h = this.getHierarchy(hierarchyName);
    for (let key of Object.keys(h.levels)) {
      if (h.levels[key].uniqueName == uniqueName)
        return h.levels[key];
    }
    return null;
  }

  nonEmpty(nonEmpty:boolean) {
    if (nonEmpty) {
      this.model().queryModel.axes.ROWS.nonEmpty = true;
      this.model().queryModel.axes.COLUMNS.nonEmpty = true;
    } else {
      this.model().queryModel.axes.ROWS.nonEmpty = false;
      this.model().queryModel.axes.COLUMNS.nonEmpty = false;
    }
  };
}
export class LevelForParameter {
  hierarchy:query.Hierarchy;
  level:query.Level;
}
export class SortLevel {
  name:string;
  caption:string;
  index:number;
}
