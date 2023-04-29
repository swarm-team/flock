import { ModuleTreeNode } from "./module-tree.ts";

export function build(root:ModuleTreeNode, included: string[], userSource:string) {
	function shouldInclude(dependents:string[]) {
		for (const dependant of dependents) {
			if (included.includes(dependant)) {
				return true;
			}
		}
		return false;
	}

	function buildModule(module:ModuleTreeNode) {
		let o = '';

		o += `((async()=>{`;

		o += `const base = await((async()=>{`;
		o += module.javascript;
		o += `})());`;

		for (const subModule in module.subNodes) {
			if (shouldInclude(module.subNodes[subModule].dependents)) {
				o += `base.${subModule} = await ${buildModule(module.subNodes[subModule])};`;
			}
		}

		o += 'return base;';

		o += `})())`;

		return o;
	}

	return `void ((async()=>{window.swarm = await ${buildModule(root)};(async ()=>{${userSource}})()})())`;
}
