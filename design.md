# Design

## Problem description and constraints

### Problem

I would like to have a solution to build nodejs applications that use arbitrary npm packages without having to worry about malicious behaviors or bugs in any of these package

### Constraints

From [Jake's post](https://jakearchibald.com/2018/when-packages-go-bad/) : 

> Perhaps apps that deal with user data, especially passwords and finances should audit every package, and every change to those packages. Perhaps we need some kind of chain-of-trust for audited packages. But we don't have that, and for most of us, auditing all packages is a non-starter.

> For sites with a server component and database, it feels negligent to use packages you haven't audited. With Copay, we've seen that attacks like this aren't theoretical, yet the auditing task feels insurmountable.

The suggested solution here is to audit all packages. As explained, this is a massive amount of manual work to be performed by humans. 
Not only this doesn't feel sustainable for one person or small team to do this work, but it may fail, because when facing a large amount of work, people get lazy, tired, make mistakes. Auditing does not scale in quantity or quality.

**A solution should not require massive human work**

**A solution should not rely on blind trust of others (whether it's the code they wrote or their opinion on the security of package)**

Additionnally, a solution should require minimal effort to install (for devs) and deploy (in the npm ecosystem)

**A solution should not require to rewrite or even modify existing packages** (compability with the existing npm ecosystem)



## Proposal

The heart of the proposal is:
- each package has a declaration of what it wants to access (only what the own package code wants, not its dependencies)
- a custom module loader which 1) reads the declared wanted capabilities before loading the package modules 2) loads the package modules with these capabilities and **no other**


### This is a solution

From package.json (or package-lock.json), you know all the packages being loaded and from each package, know what each want to access. The idea doesn't end here, but for a start, it's easier to audit this list (on a per-package basis or aggregated) than it is to audit the entire source code. It is also easier to catch notable changes

This declaration must be machine-readable for the custom loader to do anything useful, so tooling can also be built around it so it's even easier to review, to flag changes to the declaration you consider dangerous, etc.


### A package declarating what it wants to access

One can think of this declaration as an eslint config file or CSP or a manifest of Android/iOS app permissions or a docker configuration file

The specifics of this declaration are not clear yet and works needs to be done to design the "language" of this declaration and specifically the granularity of what can be declared to be accessible or not by a package\
Should a package be only able to declare whether it wants to access `fs` (all functions, all files)? or should it have to list all files it wants to access to? list functions in the package? should there be special keywords around accessing other files in `node_modules`, `package.json`, etc? If a list of files, what about OS compatiblity?
Pretty much same idea for the `net` module (per-protocol declarations? per-IP/domain/url declarations? etc.)

Anyway, this is non-trivial and will require work for this solution to be useful

Sometimes, you don't know at development time what the packages will need precisely since it's decided at runtime. There are two solutions that can work : 
- declare a bit more than needed (like declare a directory instead of listing files in it)
- [dependency injection](https://en.wikipedia.org/wiki/Dependency_injection), that is a "parent" package module with more access shares the access to the "child" package module via a function call

The first solution reduces the security a bit but requires no rewrite. The second solution might require a minor rewrite


## Conclusion

We have the design for a solution and lots was intentionnally left aside to keep this post short

Now let's see what the [implementation](./implementation.md) of this solution would need today (end of 2018)

We'll then see how this can be [deployed](./deployment.md)