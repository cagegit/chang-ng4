//card编辑页使用
export class Dimension {
    name: string;
    uniqueName: string;
    caption: string;
    description: string;
    visible: boolean=true;
    hierarchies: Hierarchy[];
}
export class Hierarchy {
    caption: string;
    description: string;
    dimensionUniqueName: string;
    levels: Level[];
    name: string;
    rootMembers: rootMember[];
    uniqueName: string;
    visible: boolean;
}
export class Level {
    annotations: string;
    caption: string;
    description: string;
    dimensionUniqueName: string;
    hierarchyUniqueName: string;
    levelType: string;
    name: string;
    uniqueName: string;
    visible: boolean;
}
export class rootMember {
    calculated: boolean;
    caption: string;
    description: null
    dimensionUniqueName: string;
    hierarchyUniqueName: string;
    levelUniqueName: string;
    name: string;
    uniqueName: string;
}
export class Measure {
  calculated: boolean;
  caption: string;
  description: string;
  dimensionUniqueName: string;
  hierarchyUniqueName: string;
  levelUniqueName: string;
  measureGroup: string;
  name: string;
  uniqueName: string;
  visible:boolean=true;
}
