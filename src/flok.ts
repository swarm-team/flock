import { FlockDirectory, readFlockDirectory } from './flock-directory.ts';
import { build } from './builder.ts';
import { ModuleTreeConverter } from './module-tree.ts';

class WebBuilderBuilder {
	converter:ModuleTreeConverter = new ModuleTreeConverter();

	compile(dir: FlockDirectory) {
		let output = ``;

		output += `<!--This file was automatically generated by {flock}-->\n`;
		output += `<!--Although it looks tempting to edit this, don't, for your own sake-->\n`;

		output += `<html>`;

		output += `<head>`;

		output += `<title>`;
		output += `Swarm Web Builder`;
		output += `</title>`;

		output += `<style>`
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
		}`
		output += `</style>`

		output += `</head>`;

		output += `<body>`;

		output += '<script>';
		output += `
		${build.toString()};

		window.onload = () => {
			setInterval(()=>{
				const dependencies = document.querySelector("#input").value.split("\\n");
				const userSource = document.querySelector("#src").value;

				const output = build(${JSON.stringify(this.converter.convertDirectory(dir))},dependencies,userSource);
			
				const outputPanel = document.querySelector("#output");

				if (outputPanel.innerText != output) {
					outputPanel.innerText = output;
				}
			});
		}`;
		output += '</script>';

		output += `<h1>Swarm Web Builder</h1>`;
		output += `<h2>Dependencies</h2>`;
		output += `<textarea id="input">\nswarm\nswarm.ui\n</textarea>`;
		output += `<h2>Your code</h2>`;
		output += `<textarea id="src">alert("this is my really cool app")</textarea>`;
		output += `<h2>Generated output</h2>`;
		output += `<p id="output"></p>`;
		output += `</body>`;

		output += `</html>`;

		return output;
	}
}

const swarmDir = await readFlockDirectory('./swarm');
//console.log(compile(swarmDir));
const webBuilder = new WebBuilderBuilder();
await Deno.writeTextFile('./web-builder.html', webBuilder.compile(swarmDir));
