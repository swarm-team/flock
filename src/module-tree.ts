import { DependencyResolver } from "./dependency-resolver.ts";
import { FlockDirectory } from "./flock-directory.ts";
import { Language, minify } from 'https://deno.land/x/minifier/mod.ts';

export type ModuleTreeNode = {
	dependents: string[];
	subNodes: Record<string, ModuleTreeNode>;
	javascript: string;
	name: string;
};

export class ModuleTreeConverter {
	dependencyResolver:DependencyResolver;

	constructor() {
		this.dependencyResolver = new DependencyResolver();
	}

	convertDirectory(dir:FlockDirectory) {
		this.dependencyResolver.resolveDependencies(dir);
		return this.createDirectory(dir,"swarm");
	}

	private createDirectory(dir:FlockDirectory, moduleName:string): ModuleTreeNode {
		const output: ModuleTreeNode = {
			dependents:this.dependencyResolver.modules[moduleName].dependents,
			javascript: minify(Language.JS,dir.src),
			subNodes: {},
			name: moduleName
		};

		for (const subDir in dir.children) {
			output.subNodes[subDir] = this.createDirectory(dir.children[subDir],`${moduleName}.${subDir}`);
		}

		return output;
	}
}
