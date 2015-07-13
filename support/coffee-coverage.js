require('coffee-coverage').register({
  basePath: process.cwd(),
  path: 'relative',
  exclude: ['/tests', '/node_modules', '/.git', 'Gruntfile.coffee', '/support'],
  coverageVar: '_$jscoverage',
  initAll: true
});
