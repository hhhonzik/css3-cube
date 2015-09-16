/*global module,require*/

module.exports = function (grunt) {

    'use strict';
    require('jit-grunt')(grunt, {
        notify_hooks: 'grunt-notify'
    });
    require('time-grunt')(grunt);

    var modRewrite = require('connect-modrewrite');

    grunt.initConfig({
        htmlmin: {
            dist: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: {
                    'dist/index.html': 'src/static/index.html'
                }
            }
        },
        browserSync: {
            dev: {
                bsFiles: {
                    src : 'dist/assets/*.css'
                },
                options: {
                    watchTask: true // < VERY important
                }
            }
        },
        // html versioning
        replace: {
            dev: {
                options: {
                    patterns: [
                        {
                            match: 'endbody',
                            replacement: '<script type=\'text/javascript\' id=\'__bs_script__\'>document.write(\"<script async src=\'//HOST:3000/browser-sync/browser-sync-client.2.9.3.js\'><\\/script>\".replace(/HOST/g, location.hostname).replace(/PORT\/g, location.port));</script>'
                        },
                        {
                            match: 'timestamp',
                            replacement: 'dev'
                        }
                    ]
                },
                files: [
                    {src: ['dist/index.html'], dest: './'}
                ]
            },
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'endbody',
                            replacement: ''
                        },
                        {
                            match: 'timestamp',
                            replacement: '<%= new Date().getTime() %>'
                        }
                    ]
                },
                files: [
                    {src: ['dist/index.html'], dest: './'}
                ]
            }
        },
        sass: {
            production: {
                options: {
                    outputStyle: 'compressed',
                    sourceMap: false
                },
                files: {
                    'dist/assets/styles.css': 'src/sass/app.scss'
                }
            },
            dev: {
                options: {
//                    outputStyle: 'compressed',
                    sourceMap: true
                },
                files: {
                    'dist/assets/styles.css': 'src/sass/app.scss',
                }
            }
        },
        copy: {
            main: {
                files: [
                    // includes files within path and its sub-directories
                    {expand: true, cwd: "src/static/", src: ['**'], dest: 'dist/'}
                ]
            }
        },
        notify_hooks: {
            options: {
                enabled: true,
                max_js_lint_notifications: 5,
                title: 'Tapdaq Dashboard'
            }
        },
        notify: {
            watch: {
                options: {
                    title: 'Task Complete',
                    message: 'Rebuild complete'
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: ['dist'],
                    middleware: function (connect, options) {
                        var middlewares = [];
                        middlewares.push(modRewrite(['^[^\\.]*$ /index.html [L]'])); //Matches everything that does not contain a '.' (period)
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });
                        return middlewares;
                    }
                }
            }
        },
        autoprefixer: {
            production: {
                files: {
                   'dist/assets/styles.css': 'dist/assets/styles.css'
                }
            }
        },
        watch: {
            htmlmin: {
                files: ['src/templates/*.html'],
                tasks: ['htmlmin', 'replace:dev', 'notify:watch']
            },
            sass: {
                files: ['src/sass/**/*.scss'],
                tasks: ['sass:dev', 'notify:watch']
            },
            copy: {
                files: ['src/static/**'],
                tasks: ['copy', 'replace', 'notify:watch']
            }
        }


    });

    grunt.registerTask('default', ['htmlmin', 'sass:dev', 'browserSync', 'copy', 'connect',  'notify_hooks', 'notify', 'replace:dev', 'watch']);
    grunt.registerTask('build', ['htmlmin', 'sass:production', 'autoprefixer:production', 'copy', 'replace:dist']);
    

};
