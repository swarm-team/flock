export function abort(err: string) {
	console.error(err);
	Deno.exit(1);
}
