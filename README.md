# Contained Node packages

Minimal Valuable Product for [Safe JavaScript Modules](https://docs.google.com/document/d/1pPiu3cjBT5OqEgqtsdDJcW5g1QsgmxvIHQjdkrPej3U/edit#)

[Safe JavaScript Modules](https://docs.google.com/document/d/1pPiu3cjBT5OqEgqtsdDJcW5g1QsgmxvIHQjdkrPej3U/edit#) describes an ideal eventual situation. However, it does not yet provide a rollout plan.

This repo aims at describing a minimal version that simultenously:
- provides actual security benefits
- demonstrates the benefits and potential of the approach
- can be built today with minimal effort

This repo also explains a path from this minimal product to the ideal situation or at least how it does not get in the way


## Reduced threat model

The MVP must prevent another "[event-stream incident](https://blog.npmjs.org/post/180565383195/details-about-the-event-stream-incident)"

As a reduction, the MVP will **only target Node.js apps**
Other environments (client-side JavaScript, Electron, etc.) can be added later

Part of what makes the attack bootstrap was that the malicious `flatmap-stream@0.1.1` was requiring `fs` while the package did not need it. So it looks like reducing capabilities at the **node.js built-in modules granularity** would already be a good start.
Finer graularity can be added later

npm packages can leak capabilities directly, so **preventing a module from a package P to load another module from a package not listed in P's package.json** will be part of the MVP as well

npm packages can be led to leak capabilities via a prototype poisonning attack which is easy to write and likely to be very effective. **Protecting against prototype poisonning attacks will also be part of the MVP**

The MVP must be deployable **without asking anyone's permission**. It must work **without change** to Node.js or npm and work on currently supported versions of [Node.js](https://github.com/nodejs/Release#release-schedule) and corresponding npm versions

The MVP **should not require anyone to rewrite any code for security to be improved**


## Proposal

### Design

The heart of the proposal is:
- **each (package, version) has a static declaration** of what it wants to access (only what the own package code wants, not its dependencies)
- **a custom module loader** which 1) reads the declared wanted capabilities before loading the package modules 2) loads the package modules with these capabilities and **no other**

The "package" granularity is chosen as **"module group"** for now, but does not close the door for a different definition of "module group" later


#### A package declarating what it wants to access

**For the MVP**, let's have per-package declarations for:
- Node.js built-in modules
- direct dependencies (already in `package.json`)
- in what sort of realms the package should be loaded (share-nothing frozen primordials default)
    - some existing packages may only work without rewrite if they can alter primorials
    - until the "override mistake" is [fixed](https://github.com/tc39/ecma262/pull/1320), freezing the primordials won't be possible. Probably do the thing with the getter/setters in the built-in prototypes


### Implementation

Let's try to build this minimal version on top of the [realm shim](https://github.com/tc39/proposal-realms)

CommonJS's `require` function in modules will:
- lookup which package this module belongs to
    - if there is no declaration
        - load the module with full authority
    - if there is a declaration
        - act normal is the dependency is listed in the declaration
        - throw if it isn't
- a module is loaded in a realm corresponding to the one declared in the declaration




### Deployment

The loader implementation is a matter of writing and maintaining code which should take little time to a team with knowledge in this area

The per-(package, version) declarations provide a different challenge. Writing the declaration for all or even most npm packages is going to take some work

One idea is to have the author of a package to do it alongside the package, but they may ask extraneous authority that a dependent user may not want to grant\
The author may also not consent to do this work

The situation looks similar to [TypeScript declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
In this situation, an elegant solution was found: an [open source community-contributed github repository](https://github.com/DefinitelyTyped/DefinitelyTyped)

We can start like this too. The people who care about this sort of security maintain an open source resource with declarations.

Among the benefits:
- full-history of changes (git) + high resistance to history rewrites (git)
- community reviews (github pull requests and email notification)
- easy fork in case of disagreement (git)
- contribution process already well-known to lots of developers
- declarations can be added gradually per-package. Security is increased with each new declaration. When finer-granularity comes, it can be added gradually by the community too

For the MVP, let's create **one repo and hardcode its location in the loader**. Let's make the **loader configurable** as to which source of declarations it uses (local or remote) later though


#### Amount of work for a security audit

For an Node.js app developer, the amount of security review needed falls from "having to review all code of every dependency in the dependency DAG" to "review all declarations for which packages have dangerous permissions (which can be automated) and code review of the few packages which do have dangerous authority being granted"

When doing updating dependencies, a new tool to assess whether changing of version will increase permissions. They can have a chance to review the new permissions if they want to. This can be coupled to something like `greenkeeper` as well


#### (beyond MVP) Automated declarations

As long as the granularity of permissions declared is the Node built-in module, it should be possible to write a static analysis tool that outputs a package declaration automatically



## Roadmap

### MPV

#### Raw demo

- Implement test cases of fake but clearly demonstrated minimal attacks that are aimed to be prevented by the MVP
- Implement the custom loader for CommonJS specifically that limits what can be loaded at the package/node built-in module granularity + frozen primorials
- Define minimal declaration language
- Write the declarations of the fake attack

- reproduce event-stream incident
- create declaration repo
- modify loader to use the repo
- prevent event-stream as it was deployed


### Beyond MPV

#### Actual attacks demo

- Find 2 other actual attacks that happened and made the news and demonstrate that the system described here would have prevented them
    - ?
    - ?


#### Scale

- Protect literally every deep dependency used by the work in the previous phases
    - Proves that the MVP works at scale
- Maybe perform the same work on the latest `npm` CLI tool
- Maybe look at every npm advisory to see which attack is prevent and which still works

- Make stats about how many packages ask for what
    - evaluate how much of this is abusive


### Developer ergonomics

- Static analysis tool that generates the access manifest automatically + checks if package.json is not listing unused dependencies
- Write a Visual Studio Code plugin that warns developers when code they write asks for more permissions than declared and helps them fix the manifest
- Tool to assess dependency DAG of an JS project
    - deps that have no declarations
    - deps that ask for large dependencies
    - Assess changes before doing an `npm update` (à la `greenkeeper`?)


### Wait and see

...



## Future work


Finer grain granularity can be added at a later time if needed:
- per built-in function
- file limitations to `fs`
    - maybe special keywords for project files, other dependency files, package.json, /home, /tmp, /dev, /proc, etc.
- protocol/IP address/DNS domain whitelists/blacklists to `net` functions
- grant to a direct dependency less authority than it asks (like it asks for `fs` on the entire filesystem and you grant it only access to the project files)


## Licence

Everything in this repo is CC0 licenced, because i love you

but that's cool if you credit the people who worked on it too
