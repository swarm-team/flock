# flock

Flock is a custom build system designed for swarm.

Flock currently uses Deno, but I **_might_** port it to the web eventually.

The structure that Flock expects is simple, different objects in the global namespace are represented by folders.

So for example:

-   /swarm becomes `window.swarm`
-   /swarm/ui becomes `window.swarm.ui`

Each directory should have an `index.js` file that has a top level return that provides the "base object"

So for example, /swarm/index.js might look something like this

```js
const onSwarmSetup = new Promise(resolve => {
	// do all the setup junk
});

return {
	onSwarmSetup,
};
```

To run flock as a cli tool run `flok` as _someone_ decided to name the build tool an already existing command.
