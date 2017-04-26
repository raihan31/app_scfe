'use strict';

module.exports = function(grunt) {

  // Configurable paths for the application
  var appConfig = {
    app: 'app',
    name: 'SOLshare_solcontrol_app',
    dist: 'build'
  };

  // configure the tasks
  grunt.initConfig({

    // Project settings
    appConfig: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json']
      },
      js: {
        files: ['<%= appConfig.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all', 'newer:jscs:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'newer:jscs:test', 'karma']
      },
      less: {
        files: ['<%= appConfig.app %>/styles/**/*.less'],
        tasks: ['less:compileCoreDev']
      },
      styles: {
        files: ['<%= appConfig.app %>/styles/{,*/}*.css']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= appConfig.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= appConfig.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use(
                '/app/styles',
                connect.static('./app/styles')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= appConfig.dist %>'
        }
      }
    },

     // Make sure there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/scripts/{,*/}*.js'
        ]
      }
    },

    jscs: {
      options: {
        config: '.jscsrc',
        verbose: true
      },
      all: {
        src: [
          'Gruntfile.js',
          '<%= appConfig.app %>/scripts/{,*/}*.js'
        ]
      }
    },

    // grunt-ng-constant: dynamic generation of angular constant
    ngconstant: {
      options: {
        space: '  ',
        wrap: '\'use strict\';\n\n {%= __ngModule %}',
        name: 'Constants',
        dest: 'app/scripts/env-constants.js'
      },
      development: {
        constants: {
          ENV: {
            name: 'development',
            apiEndpoint: 'https://api-dev.me-solshare.com/api/v1'
          }
        }
      },
      production: {
        constants: {
          ENV: {
            name: 'production',
            apiEndpoint: 'https://api.me-solshare.com/api/v1/'
          }
        }
      }
    },

    copy: {
      build: {
        cwd: 'app',
        src: [ '**' ],
        dest: 'build',
        expand: true
      },
    },

    clean: {
      build: {
        src: [ 'build' ]
      },
      stylesheets: {
        src: [ 'build/styles/*.css', 'build/styles/less', '!build/styles/app.min.css' ]
      },
      scripts: {
        src: [ 'build/scripts/*.js', '!build/scripts/app.min.js', 'build/scripts/directives', '!build/scripts/services', '!build/scripts/controllers' ]
      },
    },

    less: {
      compileCore: {
        options: {
          strictMath: true
        },
        src: 'build/styles/less/urban.less',
        dest: 'build/styles/SOLshare_solcontrol_app.css'
      },
      compileCoreDev: {
        options: {
          strictMath: true
        },
        src: 'app/styles/less/urban.less',
        dest: 'app/styles/SOLshare_solcontrol_app.css'
      }
    },

    concat: {
      generated: {
        files: [
          {
            dest: '.tmp/concat/js/app.js',
            src: [
              'app/scripts/*.js',
              'app/scripts/directives/*.js'
            ]
          }
        ]
      }
    },

    uglify: {
      options: {
        mangle: false
      },
      generated: {
        files: [
          {
            dest: 'build/scripts/app.min.js',
            src: [ '.tmp/concat/js/app.js' ]
          }
        ]
      }
    },

    cssmin: {
      generated: {
        files: [
          {
            'build/styles/app.min.css': [ '.tmp/concat/styles/app.min.css' ]
          }
        ]
      }
    },

    useminPrepare: {
      html: 'build/index.html',
      options: {
        dest: 'build'
      }
    },

    usemin: {
      html: 'build/index.html',
      options: {
        assetsDirs: ['build', 'build/styles', 'build/scripts']
      }
    }

  });

  // load the tasks
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadNpmTasks('grunt-ng-constant');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-usemin');

  // define the tasks
  grunt.registerTask('less-compile', ['less:compileCore']);
  grunt.registerTask('less-compile-dev', ['less:compileCoreDev']);


  grunt.registerTask('serve', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
        'ngconstant:development',
        'less-compile-dev',
        'connect:livereload',
        'watch'
      ]);
  });

 grunt.registerTask('serve-prod', 'Compile then start a connect web server', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'connect:dist:keepalive']);
    }

    grunt.task.run([
        'ngconstant:production',
        'less-compile',
        'connect:livereload',
        'watch'
      ]);
  });

  grunt.registerTask(
    'build-dev',
    'Compiles all of the assets and copies the files to the build directory.',
    [
      'clean:build',
      'ngconstant:development',
      'copy',
      'less-compile',
      'useminPrepare',
      'concat:generated',
      'uglify:generated',
      'cssmin:generated',
      'clean:stylesheets',
      'clean:scripts',
      'usemin'
    ]
  );

  grunt.registerTask(
    'build',
    'Compiles all of the assets and copies the files to the build directory.',
    [
      'clean:build',
      'ngconstant:production',
      'copy',
      'less-compile',
      'useminPrepare',
      'concat:generated',
      'uglify:generated',
      'cssmin:generated',
      'clean:stylesheets',
      'clean:scripts',
      'usemin'
    ]
  );
};
