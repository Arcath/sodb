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
          reporter: 'mocha-lcov-reporter',
          require: 'coffee-script/register'
          captureFile: 'lib-cov/lcov.txt'
          quiet: true
        },
        src: ['lib-cov/*.js']
      }
    },

    shell: {
        testapp: {
          command: 'node ./tests/app/app.js'
        }

        publish: {
          command: 'npm publish'
        }

        jscover: {
          command: "#{path.join(__dirname, 'node_modules', '.bin', 'jscover')} --format=LCOV lib lib-cov"
        }

        coveralls: {
          command: "cd ./lib-cov && cat ./lcov.txt | #{path.join(__dirname, 'node_modules', '.bin', 'coveralls')}"
        }
    }


  grunt.registerTask 'test', ['coffee:source', 'mochaTest:test']
  grunt.registerTask 'testapp', ['coffee', 'shell:testapp']
  grunt.registerTask 'testci', ['coffee:source', 'shell:jscover', 'mochaTest', 'shell:coveralls']
  grunt.registerTask 'testDocs', ['coffee:source', 'mochaTest:testDocs']
  grunt.registerTask 'publish', ['coffee', 'shell:publish']
