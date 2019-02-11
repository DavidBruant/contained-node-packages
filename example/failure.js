/*
    Given an access declaration of "access": ["fs","process"], the following should throw when trying to import 'path' because it's not part of what's declared as wanted
*/

const path = require('path')

console.log(path.normalize('./package.json'))
