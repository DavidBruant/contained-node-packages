# Implementation

This discusses how to implement the [design described elsewhere](./design.md)

## Solution design

- each package has a declaration of what it wants to access
- a custom module loader which 1) reads the declared wanted capabilities before loading the package modules 2) loads the package modules with these capabilities and **no other**


### Declaration of capabilities

As suggested in the [design](./design.md), work will need to be done to properly design the language of what can be declared, its granualrity and ergonomics\
But this is a space where lots of examples exist (ESLint, docker-compose, CSP, permission manifest in Android/iOS apps, etc.)

At the stage we are at, even a language that limits access on a per-node module (`fs`, `net`, `child_process`, etc.) would already be a good start to improve security. Improvements could be added gradually

This declaration could be provided as a new `package.json` field or as a separate file

Nothing technically hard in finding declared information and reading it


### A custom confining module loader

There is previous work with custom module loaders in Node
- [esm](https://www.npmjs.com/package/esm)
- [tink](https://github.com/npm/tink)
- [yarn Plug and Play](https://github.com/yarnpkg/pnp-sample-app)

Even if this is still experimental, the [Node.js support for ESM allows for hooks](https://nodejs.org/api/esm.html#esm_loader_hooks) (not the good ones yet, but it could come)

On the side of confinment, there exists things like [Caja](https://developers.google.com/caja/) which loads an arbitrary JS, but with reduced capabilities

For an MVP, i would start with forking `esm` and write a custom [loader](https://github.com/standard-things/esm/blob/53e209aac5b8de8e6d54bcd6e5dcd8b7ff8bfa50/src/module/cjs/loader.js) that loads the declaration of a package and loads it confined Caja-style. Maybe something based on [`vm`'s `runInContext`](https://nodejs.org/dist/latest-v10.x/docs/api/vm.html#vm_script_runincontext_contextifiedsandbox_options)

This work would need to be careful that modules in a package cannot escalate privileges and gain access to things it's not supposed to

There might be a minor performance cost to this that should be measured. JS implementations might help optimize these scenarios


#### In the future

There was [a standard effort](https://whatwg.github.io/loader/) but this work seems to have stalled. I'm not sure why yet

On the standard front too, [realms](https://github.com/tc39/proposal-realms) seem to be a promising idea, but do not exist yet in Node


## Conclusion

It does not seem like an MVP for this solution would require a lot of work

In any case, the technical parts of the loader are not the only concern. There are thousands of npm packages out there, what is the transition between the current situation and the more secure situation going to look like?

Let's discuss [deployment](./deployment.md)
