import {QueryTemplate} from "./card.query.template";
export class CardResult {
	cellset: Array<Cell[]>;
	rowTotalsLists: any;
	colTotalsLists: any;
	runtime: number;
	error: any;
	height: number;
	width: number;
	query: QueryTemplate;
	topOffset: number;
	leftOffset: number;
}
export class Cell{
    value:string;
    type:string;
    properties:Properties;
}
export class Properties{
    hierarchy: string;
	dimension: string;
	level: string;
  position:string;
  raw:string;
}
