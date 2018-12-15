# Deployment

See [design](./design.md) and [implementation](./implementation.md) for context


## Who does package declaration?

> each package has a declaration of what it wants to access

Writing the declaration is going to take some work

I see this situation being equivalent to [TypeScript declaration files](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html):
- [either the package author documents it](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)
- or there is a [community effort](https://github.com/DefinitelyTyped/DefinitelyTyped) to create declarations(https://github.com/DefinitelyTyped/DefinitelyTyped) for packages that have none

The custom module loader prefers the package own declaration over the community one, tooling can help find mismatches

With the declaration following versionning, tooling can find declaration changes and notify the package users

If a package goes unmaintained, the community can still write its capability declaration without coordination with the gone-maintainer

Very much like typescipt type declarations, the community effort can happen gradually. Outside contributors can also contribute declarations as a pull request to open source packages of maintained projects


### Helping package maintainers maintain their declarations

A tool could do static analysis and help maintainers generate a first version of their declarations as well as tell them when they have change their code in a way that requires changing the declaration to keep working

It is anticipated that packages that have a clearly defined purpose (most npm modules) should have their declaration fairly stable : you wouldn't expect lodash to ask for `fs` in version 1, then `fs`+`net` in version 2 then `net`+`child_process` in version 3


## What if a package has no declaration?

There is a balance to be found between security and ergonomics and this balance can evolve over time and be different from context to context

Running no-declaration packages with zero privilege offers maximum security but will make them often useless and prevent our app from running
Running no-declaration packages with all privileges allows for apps that depend on it to run with no different preserves the risks of today

To create as little friction as possible, the loader would run the package with full access\
An opt-in could run the same package with zero capabilities, or a default set considered safe (safer than the current full-access situation)

This would still be better than the current situation since there would be less security risks from package that declare what they want to access

Tooling like `npm audit` could analyse all the dependency tree of a project and alert about packages that have no declaration

Likewise, tooling could warn the user if a package is asking for suspicious permissions and that's what would remain of the auditing work


## Custom loader deployment

An open source node module loader can be deployed and used by everyone without needing Node.js or npm permission. A bit like `esm`

If there is interest, this work can be embedded in node.js or npm/tink as default behavior. npm could display on its website whether a package has a declaration and the permission it asks for. On the CLI, before a package is published, they could emit a warning to the package author when they have no declaration


## Timeline

We start with access declarations on zero packages

Over time, more declarations are added (in the packages or as a community effort) and less packages come with no declarations

Declarations can be coarse-grained initially and refined over time

Literally every new declaration or refinment makes everyone a little bit safer, so there is an incentive to even the smallest of efforts

At some point, most of the mostly used npm packages have declarations. Own declarations and dependency-tree declarations


## Malicious package attack

Malicious npm packages have taken advantage of the fact that code changes to npm packages can go unnoticed

With the described solution, to become malicious, the package would have to make itself noticeable, either by having no declaration or by changing the declaration to increase what it has access to, both cases that can be caught easily by automated tooling
