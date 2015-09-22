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
          src     : '**/*.js',
          dest    : 'dist/'
        }]
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

    /**
    * Todo process
    */
    todo      : {
      options : {
        marks       : [
          { name : 'TODO', pattern : /TODO/, color : 'yellow' },
          { name : 'FIXME', pattern : /FIXME/, color : 'red' },
          { name : 'NOTE', pattern : /NOTE/, color : 'blue' }
        ],
        file        : 'REPORT.md',
        githubBoxes : true,
        colophon    : true,
        usePackage  : true
      },
      src     : [
        'src/*'
      ]
    },
    yoctohint : {
      all : [ 'Gruntfile.js', 'src/index.js', 'src/modules/*/*.js' ]
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-cli');
  grunt.loadNpmTasks('yocto-hint');
  grunt.loadNpmTasks('grunt-todo');

  // register tasks
  grunt.registerTask('hint', 'yoctohint');
  grunt.registerTask('tests', 'mochacli');
  grunt.registerTask('build', [ 'hint', 'uglify' ]);
  grunt.registerTask('todo', 'todo');
  grunt.registerTask('default', [ 'tests', 'build', 'todo' ]);  
};
