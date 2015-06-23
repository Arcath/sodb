console.log 'Running benchmarks'

path = require 'path'

sodb = require path.join(__dirname, '..')

nocache = new sodb({cache: false})

yescache = new sodb({cache: true})

toMS = (time) ->
  time[0]/1000 + time[1]/1000000

resultsFor = (set) ->
  min = 1000000000000
  max = 0
  total = 0
  for time in set
    ms = toMS(time)
    total += ms
    max = ms if max < ms
    min = ms if min > ms

  console.log "Results min:#{min}ms, max:#{max}ms, avg:#{total/set.length}ms"

console.log 'adding 1000 records to each'

for i in [1..1000]
  object = {number: i, foo: 'bar', widget: 'foo', more: 'fields', means: 'more loops'}
  nocache.add(object)
  yescache.add(object)

times = {
  yes: {
    fixed: []
    random: []
    },
  no: {
    fixed: []
    random: []
  }
}

console.log 'running 100 searches for fixed data with no cache'
for i in [0..99]
  start = process.hrtime()
  results = nocache.where({number: 50})
  times.no.fixed.push process.hrtime(start)

resultsFor(times.no.fixed)

console.log 'running 100 searches for fixed data with a cache'
for i in [0..99]
  start = process.hrtime()
  results = yescache.where({number: 50})
  times.yes.fixed.push process.hrtime(start)

resultsFor(times.yes.fixed)

console.log 'running 10000 random searches with no cache'
for i in [0..9999]
  start = process.hrtime()
  results = nocache.where({number: Math.floor((Math.random()*100)+1)})
  times.no.random.push process.hrtime(start)

resultsFor(times.no.random)

console.log 'running 10000 random searches with a cache'
for i in [0..9999]
  start = process.hrtime()
  results = yescache.where({number: Math.floor((Math.random()*100)+1)})
  times.yes.random.push process.hrtime(start)

resultsFor(times.yes.random)
