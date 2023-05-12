export type Project =
	| {
			type: 'library';
			modules: string[];
	  }
	| {
			type: 'app';
			modules: string[];
			dependencies: string[];
			main: string;
	  };
