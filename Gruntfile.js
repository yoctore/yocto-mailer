'use strict';

module.exports = function (grunt) {
  // Init config
  grunt.initConfig({
    /**
     * Copy needed file to correct dist directory
     */
    copy : {
      json : {
        files : [
          // Makes all src relative to cwd
          {
            cwd    : 'src/',
            dest   : 'dist/',
            expand : true,
            src    : [ '**/*.json' ]
          }
        ]
      }
    },

    /**
     * Mocah unit test
     */
    mochacli : {
      all     : [ 'test/*.js' ],
      options : {
        bail           : false,
        'check-leaks'  : true,
        force          : false,
        'inline-diffs' : false,
        'no-exit'      : true,
        reporter       : 'spec'
      }
    },

    // Default package
    pkg : grunt.file.readJSON('package.json'),

    /**
     * Uglify permit to minify javascript file
     */
    uglify : {
      api : {
        files : [ {
          cwd             : 'src/',
          dest            : 'dist/',
          exceptionsFiles : [ 'converter.json' ],
          expand          : true,
          src             : [ '**/*.js' ]
        } ]
      }
    },
    yoctohint : {
      json : [
        'package.json',
        'src/**/*.json'
      ],
      node : [
        'Gruntfile.js',
        'src/**/*.js'
      ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('yocto-hint');

  // Register tasks
  grunt.registerTask('hint', 'yoctohint');
  grunt.registerTask('test', 'mochacli');
  grunt.registerTask('build', [ 'uglify', 'copy' ]);
  grunt.registerTask('default', [ 'hint', 'build', 'test' ]);
};
