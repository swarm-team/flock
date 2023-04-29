import { abort } from './abort.ts';

export type FlockDirectory = {
	children: Record<string, FlockDirectory>;
	src: string;
	dependencies: string[];
};

export async function readFlockDirectory(path: string) {
	try {
		const directory: FlockDirectory = {
			children: {},
			src: '',
			dependencies: [],
		};
		console.log(`Loading ${path}`);
		// read index.js
		try {
			directory.src = await Deno.readTextFile(`${path}/index.js`);
		} catch {
			abort(`Directory "${path}" does not contain an index.js file.`);
		}
		// read deps
		try {
			directory.dependencies = JSON.parse(
				await Deno.readTextFile(`${path}/deps.json`),
			);
		} catch {
			// who cares
		}
		// read subdirectories
		for await (const subdir of Deno.readDir(path)) {
			if (subdir.isDirectory) {
				// FIXME: Use a proper path operation instead of concatenation
				directory.children[subdir.name] = await readFlockDirectory(
					`${path}/${subdir.name}`,
				);
			}
		}
		return directory;
	} catch {
		abort(`Directory "${path}" does not exist. :/`);
		throw new Error('Unreachable but typescript doesnt know that');
	}
}
