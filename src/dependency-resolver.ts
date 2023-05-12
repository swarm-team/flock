import { abort } from './abort.ts';
import { FlockDirectory } from './flock-directory.ts';
import { file } from './formatting.ts';

export class DependencyResolver {
	modules: Record<
		string,
		{
			dependencies: string[];
			dependents: string[];
			dependenciesPath: string;
		}
	> = {};

	depends(module: string, dependsOn: string) {
		if (!this.modules[dependsOn]) {
			abort(
				`${file(
					this.modules[module].dependenciesPath,
				)} depends on ${dependsOn}, which doesn't exist`,
			);
		}
		if (!this.modules[dependsOn].dependents.includes(module)) {
			this.modules[dependsOn].dependents.push(module);
			// add subdependents
			for (const dependency of this.modules[dependsOn].dependencies) {
				this.depends(module, dependency);
			}
		}
	}

	resolveDependencies(modules: { dir: FlockDirectory; name: string }[]) {
		for (const module of modules) {
			this.addModules(module.dir, module.name);
		}

		for (const module in this.modules) {
			const modulePathParts = module.split('.');
			modulePathParts.pop();
			this.depends(module, module); // this makes sense
			if (modulePathParts.length > 0) {
				this.depends(module, modulePathParts.join('.'));
			}
			for (const dependency of this.modules[module].dependencies) {
				this.depends(module, dependency);
			}
		}
	}

	addModules(dir: FlockDirectory, path: string) {
		this.modules[path] = {
			dependents: [],
			dependencies: dir.dependencies,
			dependenciesPath: dir.depPath,
		};
		for (const sub in dir.children) {
			this.addModules(dir.children[sub], `${path}.${sub}`);
		}
	}
}
