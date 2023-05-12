export const isNerdFont =
	Deno.env.get('NERD_FONT')?.toLowerCase() == 'yes' ||
	Deno.env.get('NERD_FONT')?.toLowerCase() == 'true';
