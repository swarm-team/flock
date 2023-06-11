import { FlockDirectory, readFlockDirectory } from './flock-directory.ts';
import { build } from './builder.ts';
import { ModuleTreeConverter } from './module-tree.ts';
import { delay } from 'https://deno.land/std@0.185.0/async/delay.ts';
import { isNerdFont } from './nerd.ts';
import * as argsParser from 'https://deno.land/std@0.185.0/flags/mod.ts';
import { abort } from './abort.ts';
import { resolveProject } from './project-resolver.ts';
import { Project } from './project.ts';

if (!isNerdFont) {
	console.log(
		'For best look, install a nerd font and set env NERD_FONT to YES',
	);
	await delay(1000);
}

class WebBuilderBuilder {
	converter: ModuleTreeConverter = new ModuleTreeConverter();

	compile(mods: { dir: FlockDirectory; name: string }[]) {
		let output = ``;

		output += `<!--This file was automatically generated by {flock}-->\n`;
		output += `<!--Although it looks tempting to edit this, don't, for your own sake-->\n`;

		output += `<html>`;

		output += `<head>`;

		output += `<title>`;
		output += `Swarm Web Builder`;
		output += `</title>`;

		output += `<style>`;
		output += `body {
			color: #eeeeee;
			background-color: #111111;
			font-family: sans-serif;
			padding: 50px;
		}
		textarea, p {
			width: 100%;
			padding: 20px;
			background-color: rgba(255,255,255,0.1);
			color: white;
			border: 2px solid rgba(255,255,255,0.1);
			border-radius: 5px;
			box-sizing: border-box;
			resize: vertical;
			overflow: hidden;
		}`;
		output += `</style>`;

		output += `</head>`;

		output += `<body>`;

		output += '<script type="module">';
		output += `
		import { minify } from 'https://esm.sh/terser';
		
		${build.toString()};

		window.onload = () => {
			setInterval(async ()=>{
				const dependencies = document.querySelector("#input").value.split("\\n");
				const userSource = document.querySelector("#src").value;

				let output = await minify(build(${JSON.stringify(
					this.converter.convertDirectory(mods),
				)},dependencies,userSource),{ mangle: {
					properties: false,
				}, compress: {booleans_as_integers:true,expression:true,passes:4}});

				output = output.code || output.error;
			
				if (!userSource.includes("await swarm.init")) {
					output = "Please await swarm.init() somewhere in your code.";
				}

				const outputPanel = document.querySelector("#output");

				if (outputPanel.value != output) {
					console.log(output);
					outputPanel.value = output;
				}

				document.querySelector("#quicktest").href = "javascript:" + output;
			});
		}`;
		output += '</script>';

		output += `<h1>Swarm<br>Web<br>Builder</h1>`;
		output += `<h2>Dependencies</h2>`;
		output += `<textarea  id="input">\nswarm\nswarm.ui\n</textarea>`;
		output += `<h2>Your code (make sure to await swarm.init())</h2>`;
		output += `<textarea  id="src">
try { 
	await swarm.init(); 
} catch {} 
document.body.appendChild(
	swarm.ui.getDomNode([
		swarm.ui.button().content("boykisser"),
		swarm.ui.button().content("boykisser"),
		swarm.ui.button().content("boykisser")
	]));
</textarea>`;
		output += `<h2>Generated output</h2>`;
		output += `<textarea  id="output"></textarea>`;
		output += `<a id="quicktest">Quick Test</a>`;
		output += `</body>`;

		output += `</html>`;

		return output;
	}
}

const args = argsParser.parse(Deno.args);
// check if the user's being silly
for (const arg in args) {
	if (arg != '_') {
		abort(`Argument ${arg} doesn't exist.`);
	}
}
// get project name
let projName = resolveProject(args._[0]?.toString());
const project = JSON.parse(await Deno.readTextFile(projName)) as Project;

if (project.type == 'library') {
	const webBuilder = new WebBuilderBuilder();

	const modules: { dir: FlockDirectory; name: string }[] = [];

	for (const module of project.modules) {
		modules.push({
			dir: await readFlockDirectory(module),
			name: module,
		});
	}

	await Deno.writeTextFile('./web-builder.html', webBuilder.compile(modules));
} else if (project.type == 'app') {
	const modules: { dir: FlockDirectory; name: string }[] = [];

	for (const module of project.modules) {
		modules.push({
			dir: await readFlockDirectory(module),
			name: module,
		});
	}

	const resolver = new ModuleTreeConverter();

	const output = build(
		resolver.convertDirectory(modules),
		project.dependencies,
		`await ${project.main}()`,
	);

	await Deno.writeTextFile('./compiled.js', output);
} else {
	abort('Malformed project');
}
