# Contained Node packages

## Context

[There is an accurate description of the problem](https://jakearchibald.com/2018/when-packages-go-bad/) by Jake Archibald. You may want to read it first as i'll be quoting from his post

> When a module from a package is executed in a node context it has the same powers as the user that called `node`. This means it can do whatever you can do from the CLI

It is the case, it has been since the beginning, this is inheriting the design of operating system where the OS gives all the powers of a user to any program this user has started. This was a reasonable design at a time any program you would run you was a program you had written all the source code of. It is an unreasonable design at a time where the program you execute on your machine was downloaded from the internet written as thousands of modules and hundreds authors you don't know

> The remaining option is to **treat all npm packages as potentially hostile**, and that's kinda terrifying.

I agree this idea may sound terrifying. However, as far as i'm concerned, this idea is much less terrifying than **treat all npm packages as trusted to read/write any file on my machine and access the network**

> With Copay, we've seen that attacks like this aren't theoretical, yet the auditing task feels insurmountable.

The auditing task is un


## The work

Here, i'll be discussing the idea of what a world with **treat all npm packages as potentially hostile** would look like

I would start with giving every package zero powers except computing math, objects, functions, strings (giving access to roughly  ECMAScript without eval and module loading). Specifically, by default, all packages would not be allowed to:
- read/write files
- access network
- load modules from other packages

I admit this idea is a bit unsettling. In these posts, i'll be breaking common assumptions and then build back up to a state and amount of effort that seems reasonable to me

- [Design](./design.md)
- [Implementation](./implementation.md)
- [Deployment](deployment.md)
- Limitation to Node and expanding this idea to the browser

## Licence

Everything in this repo is CC0 licenced, because i love you

but that's cool if you credit the people who worked on it too



## TODO

Credit Capabilities community and add links
