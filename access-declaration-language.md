# Access declaration language

For now, let's say that the access declaration language is versionned


## Declaration format

For now, the access declaration will be in a separate file called `.access.json`


## Example

```json
{
    "version": 0,
    "access": [
        "fs",
        "process"
    ]
}
```


## Specification

`version` MUST be `0`. The version `0` refers to this specification which will be fast-moving for now. Stability will come at a later stage

`access` MUST be an array of strings. Possible strings are the names of Node.js built-in modules. For Node.js v10.14.1, the list is : 

```js
[ 
    'async_hooks',
    'assert',
    'buffer',
    'child_process',
    'console',
    'constants',
    'crypto',
    'cluster',
    'dgram',
    'dns',
    'domain',
    'events',
    'fs',
    'http',
    'http2',
    '_http_agent',
    '_http_client',
    '_http_common',
    '_http_incoming',
    '_http_outgoing',
    '_http_server',
    'https',
    'inspector',
    'module',
    'net',
    'os',
    'path',
    'perf_hooks',
    'process',
    'punycode',
    'querystring',
    'readline',
    'repl',
    'stream',
    '_stream_readable',
    '_stream_writable',
    '_stream_duplex',
    '_stream_transform',
    '_stream_passthrough',
    '_stream_wrap',
    'string_decoder',
    'sys',
    'timers',
    'tls',
    '_tls_common',
    '_tls_wrap',
    'trace_events',
    'tty',
    'url',
    'util',
    'v8',
    'vm',
    'zlib',
    'v8/tools/splaytree',
    'v8/tools/codemap',
    'v8/tools/consarray',
    'v8/tools/csvparser',
    'v8/tools/profile',
    'v8/tools/profile_view',
    'v8/tools/logreader',
    'v8/tools/arguments',
    'v8/tools/tickprocessor',
    'v8/tools/SourceMap',
    'v8/tools/tickprocessor-driver',
    'node-inspect/lib/_inspect',
    'node-inspect/lib/internal/inspect_client',
    'node-inspect/lib/internal/inspect_repl'
]
```

(from `require("module").builtinModules`)


## Semantics

When loading a package with an access declaration, the module loader must load transparently the built-in module in all of the package modules if it's part of the package access declaration or throw an error if it's not part of the list
