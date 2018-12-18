# Assessment

See [design](./design.md), [implementation](./implementation.md) and [deployment](./deployment.md) for context

This article discusses whether what's described is a solution to the problem at hand


## What makes current attacks possible

The "event-stream incident" was an attack performed at build time. The npm-packaged build tools are infected and infect the software they build by discretly modifying some of its dependency. 

One issue here is that any package is able to arbitrarily rewrite any other dependency

Why should a package that [only needs access the `stream` module](https://github.com/hugeglass/flatmap-stream/blob/a0d127c1782991a423d106f50038a26d127bbecf/index.js#L1) be allowed to [successfully `require('fs')`](https://gist.github.com/jsoverson/991f18d4ff01ca1e3191ede0bbb08149#file-payload-b-js-L6)?


## Trying the same attack with the proposed idea deployed

In a world with the proposed idea, one of the following would have happened:
- there is no access declaration for `flatmap-stream` and tooling or running no-declaration packages with zero privilege catches lack of declaration
- `flatmap-stream@0.1.0` has an access declaration asking only for the `stream` module. `flatmap-stream@0.1.2` has a different declaration asking for the `stream` and `fs` modules. Automated tooling can catch this change and warn human beings who can decide to audit this package to see whether the `fs` use is legitimate for the intended work of this package


## Amount of human work

### Today

To get a good level of security in the current situation, all the package must be audited by each person using them

To some extent, this work is currently loosely and informally being done by the overall JS community and the npm team, which has the benefits of distributing the work

However, for each module, there is no indication of when someone else assessed it last, or whether you want to trust this person opinion

If you want to be sure for your own app, the only remaining choice is auditing yourself all the dependencies, because any dependency could mess anything up without you noticing. And that's a ridiculous amount of work that will only get harder as apps get more complex


### With the proposed idea


