import { Language, minify } from "https://deno.land/x/minifier/mod.ts";

type FlockDirectory = {
	children:Record<string,FlockDirectory>;
	src:string;
	dependencies:string[];
}

function abort(err:string) {
	console.error(err);
	Deno.exit(1);
}

async function readFlockDirectory(path:string) {
	try {
		const directory: FlockDirectory = {
			children:{},
			src:"",
			dependencies:[]
		};
		console.log(`Loading ${path}`);
		// read index.js
		try {
			directory.src = await Deno.readTextFile(`${path}/index.js`);
		} catch {
			abort(`Directory "${path}" does not contain an index.js file.`)
		}
		// read deps
		try {
			directory.dependencies = JSON.parse(await Deno.readTextFile(`${path}/deps.json`));
		} catch {
			// who cares
		}
		// read subdirectories
		for await (const subdir of Deno.readDir(path)) {
			if (subdir.isDirectory) {
				// FIXME: Use a proper path operation instead of concatenation
				directory.children[subdir.name] = await readFlockDirectory(`${path}/${subdir.name}`);
			}
		}
		return directory;
	} catch {
		abort(`Directory "${path}" does not exist. :/`)
		throw new Error("Unreachable but typescript doesnt know that");
	}
}

function compileAllCode(dir:FlockDirectory):string {
	let output = `(()=>{`;
	output += `const b = (()=>{${dir.src}})();`;
	for (const sub in dir.children) {
		output += `b.${sub} = ${compileAllCode(dir.children[sub])};`;
	}
	output += `return b;`;
	output += `})()`;
	return output;
}

function compile(dir:FlockDirectory) {
	return minify(Language.JS,`void ((()=>{window.swarm = ${compileAllCode(dir)}})())`);
}

class DependencyResolver {
	modules:Record<string,{
		dependencies:string[],
		dependents:string[]
	}> = {};

	depends(module:string,dependsOn:string) {
		if (!this.modules[dependsOn]) {
			abort(`${module} depends on ${dependsOn}, which doesn't exist`);
		}
		if (!this.modules[dependsOn].dependents.includes(module)) {
			this.modules[dependsOn].dependents.push(module);
			// add subdependents
			for (const dependency of this.modules[dependsOn].dependencies) {
				this.depends(module,dependency);
			}
		}
	}

	resolveDependencies(dir:FlockDirectory) {
		this.addModules(dir,"swarm");

		for (const module in this.modules) {
			const modulePathParts = module.split(".");
			modulePathParts.pop();
			this.depends(module,module); // this makes sense
			if (modulePathParts.length > 0) {
				this.depends(module,modulePathParts.join("."));
			}
			for (const dependency of this.modules[module].dependencies) {
				this.depends(module,dependency);
			}
		}
	}

	addModules(dir:FlockDirectory,path:string) {
		this.modules[path] = {
			dependents:[],
			dependencies:dir.dependencies
		};
		for (const sub in dir.children) {
			this.addModules(dir.children[sub],`${path}.${sub}`);
		}
	}
}

class WebBuilderBuilder {
	// programmed by me, the web builder builder builder

	dependencyResolver:DependencyResolver = new DependencyResolver();

	compile(dir:FlockDirectory) {
		this.dependencyResolver.resolveDependencies(dir);

		console.log(this.dependencyResolver.modules);

		let output = ``;

		output += `<!--This file was automatically generated by {flock}-->\n`;
		output += `<!--Although it looks tempting to edit this, don't, for your own sake-->\n`;
	
		output += `<html>`;

		output += `<head>`;

		output += `<title>`;
		output += `Swarm Web Builder`;
		output += `</title>`;

		output += `</head>`;

		output += `<body>`;

		output += '<script>';
		output += `window.onload = () => {setInterval(()=>{
			const dependencies = document.querySelector("#input").value.split("\\n");
			document.querySelector("#output").value = "void ((function(){";
			document.querySelector("#output").value += ${this.generateGenerator(dir,"dependencies")} + ";" + document.querySelector("#src").value;
			document.querySelector("#output").value += "})())";
		})}`;
		output += '</script>';

		output += `<h1>Swarm Web Builder</h1>`;
		output += `<h2>Dependencies</h2>`;
		output += `<textarea id="input">\nswarm\nswarm.ui\n</textarea>`;
		output += `<h2>Your code</h2>`;
		output += `<textarea id="src">alert("this is my really cool app")</textarea>`;
		output += `<h2>Generated output</h2>`;
		output += `<textarea id="output"></textarea>`;
		output += `</body>`;

		output += `</html>`;

		return output;
	}

	generateGenerator(dir:FlockDirectory,dependenciesName:string) {
		const compileDir = (dir:FlockDirectory,requirement:string) => {
			let output = '';

			output += '(function(){';
			output += `let o = '';`;
			output += `o += "(()=>{";`;
			output += `o += ${JSON.stringify(`const b = (()=>{${minify(Language.JS,dir.src)}})();`)};`
			for (const sub in dir.children) {
				output += `if (${this.dependencyResolver.modules[requirement + "." + sub].dependents.map(dependant => `${dependenciesName}.includes(${JSON.stringify(dependant)})`).join(" || ")}) {`;
				output += `o += ${"`" + `b.${sub} = \${${compileDir(dir.children[sub],requirement + "." + sub)}};` + "`"};`;
				output += `}`;
			}
			output += `o += ${JSON.stringify("return b;")};`
			output += `o += "})()";`;
			output += `return o;`;
			output += '})()';

			return output;
		}

		return JSON.stringify("void ((()=>{window.swarm = ") + " + " + compileDir(dir,"swarm") + " + " + JSON.stringify("})())");
	}
}

const swarmDir = await readFlockDirectory("./swarm");
//console.log(compile(swarmDir));
const webBuilder = new WebBuilderBuilder();
await Deno.writeTextFile("./web-builder.html",webBuilder.compile(swarmDir));
