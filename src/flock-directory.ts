import { abort } from './abort.ts';
import sass from 'npm:sass';
import { dir, file } from './formatting.ts';

export type FlockDirectory = {
	children: Record<string, FlockDirectory>;
	src: string;
	css?: string;
	dependencies: string[];
	depPath: string;
};

export async function readFlockDirectory(path: string) {
	try {
		const directory: FlockDirectory = {
			children: {},
			src: '',
			dependencies: [],
			depPath: path + '/deps.json',
		};
		console.log(`Loading ${dir(path)}\n`);

		// read index.js
		try {
			directory.src = await Deno.readTextFile(`${path}/index.js`);
		} catch {
			directory.src = 'return {}';
		}
		try {
			await Deno.lstat(`${path}/index.scss`);
			try {
				const scss = sass.compile(`${path}/index.scss`);
				directory.css = scss.css;
			} catch (err) {
				abort(
					`Failled to parse ${file(
						`${path}/index.scss`,
					)}: ${JSON.stringify(err)}`,
				);
			}
		} catch {
			// guess there isnt a scss file
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
		abort(
			`Directory ${dir(
				path,
			)} doesn't exist.\nIt is likely that a module that doesn't exist is in your modules list.`,
		);
		throw new Error('Unreachable but typescript doesnt know that');
	}
}
