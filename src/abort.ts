import * as colors from 'https://deno.land/std@0.185.0/fmt/colors.ts';
import { isNerdFont } from './nerd.ts';

export function abort(err: string) {
	if (isNerdFont) {
		const style = colors.red;
		const title = (tx: string) => colors.inverse(colors.red(tx));
		console.log(style('╭───'));
		(`\n${title(' FLOCK COMPILATION ERROR ')}\n\n` + err + '\n')
			.split('\n')
			.forEach(tx => {
				console.log(style(`│  ${tx}`));
			});
		console.log(style('╰───'));
	} else {
		console.error(err);
	}
	Deno.exit(1);
}
