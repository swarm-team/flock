import * as colors from 'https://deno.land/std@0.185.0/fmt/colors.ts';
import * as path from 'https://deno.land/std@0.185.0/path/mod.ts';
import { link } from 'https://deno.land/x/ansi@1.0.1/link.ts';
import { isNerdFont } from './nerd.ts';

export function file(pth: string) {
	if (!isNerdFont) {
		return pth;
	}
	const start = ``;
	const end = ``;
	const file = ``;
	const folder = ``;
	const name = path.basename(pth);
	return (
		colors.brightBlue(start) +
		link(
			colors.inverse(
				colors.bgWhite(colors.brightBlue(file + ' ' + name)),
			),
			path.toFileUrl(path.resolve(pth)).toString(),
		) +
		colors.brightBlue(end)
	);
}

export function dir(pth: string) {
	if (!isNerdFont) {
		return pth;
	}
	const start = ``;
	const end = ``;
	const file = ``;
	const folder = ``;
	const name = path.basename(pth);
	return (
		colors.brightRed(start) +
		link(
			colors.inverse(
				colors.bgWhite(colors.brightRed(folder + ' ' + name)),
			),
			path.toFileUrl(path.resolve(pth)).toString(),
		) +
		colors.brightRed(end)
	);
}
