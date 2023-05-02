import { abort } from './abort.ts';
import { DependencyResolver } from './dependency-resolver.ts';
import { FlockDirectory } from './flock-directory.ts';
import Uglify from 'npm:uglify-js';
import { file } from './formatting.ts';

export type ModuleTreeNode = {
	dependents: string[];
	subNodes: Record<string, ModuleTreeNode>;
	javascript: string;
	css?: string;
	name: string;
};

export class ModuleTreeConverter {
	dependencyResolver: DependencyResolver;

	constructor() {
		this.dependencyResolver = new DependencyResolver();
	}

	convertDirectory(dir: FlockDirectory) {
		this.dependencyResolver.resolveDependencies(dir);
		return this.createDirectory(dir, 'swarm');
	}

	private createDirectory(
		dir: FlockDirectory,
		moduleName: string,
	): ModuleTreeNode {
		abort(`Test failure in ${file("./index.js")}\nPlease ignore`);

		const minified = Uglify.minify(dir.src, {
			mangle: false,
			parse: {
				bare_returns: true,
			},
		});

		if (minified.error) {
			abort(
				`Failed to compile ${moduleName} during minification: ${minified.error}`,
			);
		}

		const output: ModuleTreeNode = {
			dependents: this.dependencyResolver.modules[moduleName].dependents,
			javascript: minified.code,
			subNodes: {},
			css: dir.css,
			name: moduleName,
		};

		for (const subDir in dir.children) {
			output.subNodes[subDir] = this.createDirectory(
				dir.children[subDir],
				`${moduleName}.${subDir}`,
			);
		}

		return output;
	}
}
