import { abort } from "./abort.ts";
import sass from "https://deno.land/x/denosass/mod.ts";

export type FlockDirectory = {
  children: Record<string, FlockDirectory>;
  src: string;
  css: string;
  dependencies: string[];
};

export async function readFlockDirectory(path: string) {
  try {
    const directory: FlockDirectory = {
      children: {},
      src: "",
      css: "",
      dependencies: [],
    };
    console.log(`Loading ${path}`);
    // read index.js

    try {
      directory.src = await Deno.readTextFile(`${path}/index.js`);
    } catch {
      console.warn(
        `Warning: Directory "${path}" does not contain an index.js file.`,
      );
      directory.src = "return {}";
    }
    try {
      const scss = await Deno.readTextFile(`${path}/index.scss`);
      const compiledSass = sass(scss).to_string();

	  if(typeof compiledSass == "string")
	  {
		directory.css = compiledSass;
	  }
	  else
	  {
		abort("Error parsing SASS");
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
    abort(`Directory "${path}" does not exist. :/`);
    throw new Error("Unreachable but typescript doesnt know that");
  }
}
