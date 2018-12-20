# Contained Node packages

Minimal Valuable Product for [Safe JavaScript Modules](https://docs.google.com/document/d/1pPiu3cjBT5OqEgqtsdDJcW5g1QsgmxvIHQjdkrPej3U/edit#)

[Safe JavaScript Modules](https://docs.google.com/document/d/1pPiu3cjBT5OqEgqtsdDJcW5g1QsgmxvIHQjdkrPej3U/edit#) describes an ideal eventual situation. However, it does not provide a rollout plan.

This repo aims at describing a minimal version that simultenouly:
- provides actual security benefits
- demonstrates the benefits and potential of the approach
- can be built today with minimal effort

This repo also explains a path from this minimal product to the ideal situation or at least how it does not get in the way


## Reduced threat model

The MVP must prevent another "[event-stream incident](https://blog.npmjs.org/post/180565383195/details-about-the-event-stream-incident)"

As a reduction, the MVP will **only target Node.js apps**
Other environments (client-side JavaScript, Electron, etc.) can be added later

Part of what makes the attack bootstrap was that the malicious `flatmap-stream@0.1.1` was requiring `fs` while the package did not need it. So it looks like reducing capabilities at the **node.js built-in modules granularity** would already be a good start

npm packages can leak capabilities directly, so preventing a module from a package P to load another module from a package not listed in P's package.json would be a good addition to come right after

npm packages can be led to leak capabilities via a prototype poisonning attack which is easy to write and likely to be very effective. Protecting against prototype poisonning attacks also feels to need to come right after 

The MVP must be deployable **without asking anyone's permission**. It must work **without change** to Node.js or npm and work on currently supported versions of [Node.js](https://github.com/nodejs/Release#release-schedule) and corresponding npm versions

The MVP should not require anyone to rewrite any code for security to be improved


## Proposal

### Design

#### Constraints

From [Jake's post](https://jakearchibald.com/2018/when-packages-go-bad/) : 

> Perhaps apps that deal with user data, especially passwords and finances should audit every package, and every change to those packages. Perhaps we need some kind of chain-of-trust for audited packages. But we don't have that, and for most of us, auditing all packages is a non-starter.

> For sites with a server component and database, it feels negligent to use packages you haven't audited. With Copay, we've seen that attacks like this aren't theoretical, yet the auditing task feels insurmountable.

The suggested solution here is to audit all packages. As explained, this is a massive amount of manual work to be performed by humans. 
Not only this doesn't feel sustainable for one person or small team to do this work, but it may fail, because when facing a large amount of work, people get lazy, tired, make mistakes. Auditing does not scale in quantity or quality.

**A solution should not require massive human work**

**Ideally, it would increase security (or rather decrease insecurity) with zero effort to most people most of the time**

(here "effort" = rewrite of modify existing packages)


#### Proposal

The heart of the proposal is:
- **each package has a declaration** of what it wants to access (only what the own package code wants, not its dependencies)
- **a custom module loader** which 1) reads the declared wanted capabilities before loading the package modules 2) loads the package modules with these capabilities and **no other**

The "package" granularity is chosen as **"module group"** for now, but does not close the door for a different definition of "module group" later


##### A package declarating what it wants to access

**For the MVP**, let's have per-package declarations for:
- Node.js built-in modules
- direct dependencies (already in `package.json`)
- in what sort of realms the package should be loaded (share-nothing frozen primordials default)
    - some existing packages may only work without rewrite if they can alter primorials
    - until the "override mistake" is [fixed](https://github.com/tc39/ecma262/pull/1320), freezing the primordials won't be possible. Probably do the thing with the getter/setters in the built-in prototypes


Finer grain granularity can be added at a later time if needed:
- per built-in function
- file limitations to `fs`
    - maybe special keywords for project files, other dependency files, package.json, /home, /tmp, /dev, /proc, etc.
- protocol/IP address/DNS domain whitelists/blacklists to `net` functions
- grant to a direct dependency less authority than it asks (like it asks for `fs` on the entire filesystem and you grant it only access to the project files)


### Implementation

Let's try to build this minial version on top of the [realm shim](https://github.com/tc39/proposal-realms)


### Deployment

#### Who does package declaration?

> each package has a declaration of what it wants to access

Writing the declaration is going to take some work

I see this situation being equivalent to [TypeScript declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html):
- [either the package author documents it](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- or there is a [community effort](https://github.com/DefinitelyTyped/DefinitelyTyped) to create declarations(https://github.com/DefinitelyTyped/DefinitelyTyped) for packages that have none

The custom module loader prefers the package own declaration over the community one, tooling can help find mismatches

With the declaration following versionning, tooling can find declaration changes and notify the package users

If a package goes unmaintained, the community can still write its capability declaration without coordination with the gone-maintainer

Very much like typescipt type declarations, the community effort can happen gradually. Outside contributors can also contribute declarations as a pull request to open source packages of maintained projects


##### Helping package maintainers maintain their declarations

A tool could do static analysis and help maintainers generate a first version of their declarations as well as tell them when they have change their code in a way that requires changing the declaration to keep working

It is anticipated that packages that have a clearly defined purpose (most npm modules) should have their declaration fairly stable : you wouldn't expect lodash to ask for `fs` in version 1, then `fs`+`net` in version 2 then `net`+`child_process` in version 3


#### What if a package has no declaration?

There is a balance to be found between security and ergonomics and this balance can evolve over time and be different from context to context

Running no-declaration packages with zero privilege offers maximum security but will make them often useless and prevent our app from running
Running no-declaration packages with all privileges allows for apps that depend on it to run with no different preserves the risks of today

To create as little friction as possible, the loader would run the package with full access\
An opt-in could run the same package with zero capabilities, or a default set considered safe (safer than the current full-access situation)

This would still be better than the current situation since there would be less security risks from package that declare what they want to access

Tooling like `npm audit` could analyse all the dependency tree of a project and alert about packages that have no declaration

Likewise, tooling could warn the user if a package is asking for suspicious permissions and that's what would remain of the auditing work


#### Custom loader deployment

An open source node module loader can be deployed and used by everyone without needing Node.js or npm permission. A bit like `esm`

If there is interest, this work can be embedded in node.js or npm/tink as default behavior. npm could display on its website whether a package has a declaration and the permission it asks for. On the CLI, before a package is published, they could emit a warning to the package author when they have no declaration


## Roadmap

### Raw demo

- Implement test cases of fake but clearly demonstrated minimal attacks that are aimed to be prevented by the MVP
- Implement the custom loader for CommonJS specifically (ESMs will come later) that limits what can be loaded at the package/node built-in module granularity + frozen primorials
- Show that it works


### Actual attacks demo

- Find 3 actual attacks that happened and made the news and demonstrate that the system we provide would have prevented them
    - flatmap-stream
    - ?
    - ?


### Scale

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


## Licence

Everything in this repo is CC0 licenced, because i love you

but that's cool if you credit the people who worked on it too
