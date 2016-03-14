console.log 'Running benchmarks'

path = require 'path'
Benchmark = require 'benchmark'

sodb = require path.join(__dirname, '..', 'src', 'sodb')

nocache = new sodb({cache: false})

yescache = new sodb({cache: true})

console.log 'adding 1000 records to each'

for i in [1..1000]
  object = {number: i, foo: 'bar', widget: 'foo', more: 'fields', means: 'more loops'}
  nocache.add(object)
  yescache.add(object)

it 'should be faster with a cache', (done) ->
  @timeout(100000)

  suite = new Benchmark.Suite

  suite.add "with cache", ->
    yescache.where({number: 50})

  suite.add "no cache", ->
    nocache.where({number: 50})

  suite.on 'cycle', (event) ->
    console.log(String(event.target));

  suite.on 'complete', ->
    console.log('Fastest is ' + this.filter('fastest').map('name'))
    done()

  suite.run({async: true})
