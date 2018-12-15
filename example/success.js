/*
    Given an access declaration of "access": ["fs","process"], the following should work transparently
*/

import fs from 'fs'

fs.createReadStream('./package.json').pipe(process.stdin)
