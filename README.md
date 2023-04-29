# 🐦 flock

Flock is a custom build system designed for [{swarm}](https://github.com/swarm-team/swarm).

Flock creates a **Web Builder** that can be used to create a {swarm} app.

Flock currently uses Deno, but it **_might_** be ported to the web eventually.

The structure that Flock expects is simple  -- different objects in the global namespace are represented by folders.

So for example:

-   `/swarm` becomes `window.swarm`
-   `/swarm/ui` becomes `window.swarm.ui`

Each directory can have an `index.js` file that has a top level return that provides the "base object"
Each directory can also have an `index.scss` file that is transpiled to CSS and automatically included.

So for example, /swarm/index.js might look something like this

```js
const onSwarmSetup = new Promise(resolve => {
	// do all the setup junk
});

return {
	onSwarmSetup,
};
```

## CLI

To run flock as a cli tool run `flok` as _someone_ decided to name the build tool an already existing command.

## Code Architecture

Flock compilation consists of a few steps

* Directory Hierarchy
* Module Resolution
* Module Hierarchy
* Output Generation

### Directory Hierarchy

During this phase, the `swarm` directory is recursed and all the directories and their JS and CSS is loaded, and it generates an object of type `FlockDirectory`. 🤯

### Module Resolution

In this step, every directory resolves their dependencies, and each directory actually does not get a dependency list, but rather a dependents list, which contains which files depend on it.

## Module Hierarchy

In this step, all the modules are organized into a hierarchial structure, similar to the directories. There's not much to say here.

## Output Generation

In this step, either the output it compiled based on a dependency list and user code, or that same code is put in a Web Builder, along with the Module Hierarchy.
