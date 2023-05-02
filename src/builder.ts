import { ModuleTreeNode } from './module-tree.ts';

export function build(
	modules:{mod: ModuleTreeNode,name:string}[],
	included: string[],
	userSource: string,
) {
	function shouldInclude(dependents: string[]) {
		for (const dependant of dependents) {
			if (included.includes(dependant)) {
				return true;
			}
		}
		return false;
	}

	function buildModule(module: ModuleTreeNode) {
		let o = '';

		o += `((async()=>{`;

		if (module.css) {
			o += `const css=document.createElement("style");`;
			o += `css.appendChild(document.createTextNode(${JSON.stringify(
				module.css,
			)}));`;
			o += `document.body.appendChild(css);`;
		}

		o += `const base = await((async()=>{`;
		o += module.javascript;
		o += `})());`;

		for (const subModule in module.subNodes) {
			if (shouldInclude(module.subNodes[subModule].dependents)) {
				o += `base.${subModule} = await ${buildModule(
					module.subNodes[subModule],
				)};`;
			}
		}

		o += 'return base;';

		o += `})())`;

		return o;
	}

	return `void ((${modules.map((mod=>`async()=>{window.${mod.name} = await ${buildModule(
		mod.mod,
	)}`)).join(";")};(async ()=>{${userSource}})()})())`;
}
