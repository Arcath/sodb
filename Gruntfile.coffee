path = require 'path'

module.exports = (grunt) ->
  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-mocha-test')
  grunt.loadNpmTasks('grunt-shell')

  grunt.initConfig
    pkg: grunt.file.readJSON('package.json'),

    coffee: {
      source: {
        expand: true,
        flatten: false,
        cwd: 'src/',
        src: ['**/*.coffee'],
        dest: 'lib/',
        ext: '.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          require: 'coffee-script/register'
        },
        src: ['tests/*.coffee']
      },
      testDocs: {
        options: {
          reporter: 'spec'
        }
        src: ['tests/docs-tests.js']
      }
      coverage: {
        options: {
          reporter: 'mocha-lcov-reporter'
          require: './support/coffee-coverage.js'
          captureFile: './lcov.txt'
          quiet: true
        },
        src: ['tests/*-tests.coffee']
      }
    },

    shell: {
        publish: {
          command: 'npm publish'
        }

        buildDist:{
          command: "#{path.join('.', 'node_modules', '.bin', 'browserify')} support\\build.js -o dist\\sodb.js"
        }

        coveralls: {
          command: "cat ./lcov.txt | #{path.join(__dirname, 'node_modules', '.bin', 'coveralls')}"
        }

        mocha: {
          command: "#{path.join('.', 'node_modules', '.bin', 'mocha')} #{path.join('.', 'tests', '*.coffee')} -r coffee-script/register -c"
        }

        mochaCoverage: {
          command: "#{path.join('.', 'node_modules', '.bin', 'mocha')} #{path.join('.', 'tests', '*.coffee')} -r #{path.join('.', 'support', 'coffee-coverage.js')} -c -R mocha-lcov-reporter"
        }
    }


  grunt.registerTask 'test', ['shell:mocha']
  grunt.registerTask 'coverage', ['mochaTest:coverage', 'shell:coveralls']
  grunt.registerTask 'testDocs', ['coffee:source', 'mochaTest:testDocs']
  grunt.registerTask 'publish', ['coffee', 'shell:publish', 'buildDist']
