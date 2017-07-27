'use strict';

module.exports = function (grunt) {
  // init config
  grunt.initConfig({
    // default package
    pkg       : grunt.file.readJSON('package.json'),

    /**
     * Uglify permit to minify javascript file
     */
    uglify    : {
      api : {
        files : [{
          expand  : true,
          cwd     : 'src/',
          src     : [ '**/*.js' ],
          dest    : 'dist/',
          exceptionsFiles : [ 'converter.json' ]
        }]
      }
    },
    /**
     * Copy needed file to correct dist directory
     */
    copy      : {
      json  : {
        files : [
          // makes all src relative to cwd
          {
            expand  : true,
            cwd     : 'src/',
            src     : [ '**/*.json' ],
            dest    : 'dist/'
          }
        ]
      }
    },
    /**
     * Mocah unit test
     */
    mochacli  : {
      options : {
        'reporter'       : 'spec',
        'inline-diffs'   : false,
        'no-exit'        : true,
        'force'          : false,
        'check-leaks'    : true,
        'bail'           : false
      },
      all     : [ 'test/*.js' ]
    },
    yoctohint : {
      all : [ 'Gruntfile.js', 'src/**/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-cli');
  //grunt.loadNpmTasks('yocto-hint');

  // register tasks
  grunt.registerTask('hint', 'yoctohint');
  grunt.registerTask('test', 'mochacli');
  grunt.registerTask('build', [ 'uglify', 'copy' ]);
  grunt.registerTask('default', [ 'build', 'test' ]);
};
