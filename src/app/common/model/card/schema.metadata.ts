import { Dimension } from "./schema.dimension";
import { Measure } from "./schema.measure";
import {Cube} from "./schema.cube";
export class MetaData {
    connection: string;
    catalog: string;
    schema: string;
    caption: string;
    visible: boolean;
    uniqueName:string;
    name:string;
    dimensions: Dimension[];
    measures: Measure[];
    properties: any;
  cube:Cube;
}
export class MetaGroup{
    connection: string;
    catalog: string;
    schema: string;
    uniqueCubeName:string;
    name:string;
    groups:string[];
}
