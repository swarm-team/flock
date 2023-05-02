# Project Files

## Location

To resolve the path of a project file:

* if a path is provided
	* check in rawPath
	* check in rawPath.json
* check in CWD/project.json
* check in CWD/flock.json
* check in CWD/swarm.json

## Project File Format

Each project can be one of a few types.

### Library

A library is indicated with

```json
{
	"type":"library"
}
```

but for it to ***work*** it should look like this

```jsonc
{
	"type":"library",
	"modules": [
		"swarm" // or whatever other modules you have :)
	]
}
```

Libraries get transformed into a Swarm Web Builder.... Even if they're not a swarm app lol.

### App

An app is indicated with

```json
{
	"type":"app"
}
```

but for it to ***work*** it should look like this

```jsonc
{
	"type":"app",
	"modules": [
		"swarm",
		"reallyCoolApp" // or whatever your app is called
	],
	"dependencies": [
		"swarm.ui",
		"reallyCoolApp"
	],
	"main": "reallyCoolApp" // the function to call to init
}
```
