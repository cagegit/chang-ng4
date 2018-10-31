export class Cube {
	uniqueName: string;
	name: string;
	connection: string;
	catalog: string;
	schema: string;
	caption: string;
	visible: boolean;
}

export class Schema {
	uniqueName: string;
	name: string;
	cubes: Cube[];
}

export class Catalog {
	uniqueName: string;
	name: string;
	schemas: Schema[];
}

export class DataConnection {
	uniqueName: string;
	name: string;
	catalogs: Catalog[];
}
