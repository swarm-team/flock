import { abort } from './abort.ts';

export function resolveProject(path: string | undefined): string {
	let paths: string[] = [];
	if (path) {
		paths = [...paths, path, path + '.json'];
	}
	paths = [...paths, 'project.json', 'swarm.json', 'flock.json'];

	const firstPath = paths.find(path => {
		try {
			return Deno.lstatSync(path).isFile;
		} catch {
			return false;
		}
	});

	if (firstPath) {
		return firstPath;
	}

	if (path) {
		abort(
			`Project ${path} does not exist, nor does project.json, swarm.json, or flock.json`,
		);
	} else {
		abort(
			`Failed to automatically resolve project name.\nproject.json does not exist\nswarm.json does not exist\nflock.json also does not exist.`,
		);
	}
	throw new Error('unreachable but ts dont know');
}
