module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            js: {
                options: {
                    block: true,
                    line: true,
                    stripBanners: true
                },
                files: {
                    './assets/js/dist/main.js': ['./assets/js/libs/*.js']
                }
            }
        },
        uglify: {
            my_target: {
                files: {
                    './assets/js/dist/main.min.js': ['./assets/js/dist/main.js', './assets/js/functions.js']
                }
            },
            options: {
                preserveComments: false,
                report: 'gzip',
                compress: true
            }
        },
        replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: /<!--DEV-START-->/g,
                            replacement: function () {
                                return '<!--DEV-START';
                            }
                        },
                        {
                             match: /<!--DEV-END-->/g,
                             replacement: function () {
                                 return 'DEV-END-->';
                             }
                        },
                        {
                            match: /<!--DIST-START/g,
                            replacement: function () {
                                return '<!--DIST-START-->';
                            }
                        },
                        {
                             match: /DIST-END-->/g,
                             replacement: function () {
                                 return '<!--DIST-END-->';
                             }
                        },
                        {
                            match: /\.\.\/js/g,
                            replacement: function () {
                                return 'assets/js';
                            }
                        },
                        {
                            match: /\.\.\/css/g,
                            replacement: function () {
                                return 'assets/css';
                            }
                        },
                        {
                            match: 'timestamp',
                            replacement: '<%= new Date().getTime() %>'
                        }
                    ]
                },
                files: [
                    {src: ['assets/templates/index.html'], dest: './index.html'},
                    {src: ['assets/templates/qunit.html'], dest: './qunit.html'}
                ]
            }
        },
        'qunit': {
            src: ['./assets/templates/qunit.html']
        },
        'qunit_junit': {
            options: {
                dest: 'output/testresults'
            }
        },
        jshint: {
            options: {
                "curly": true,
                "eqnull": true,
                "eqeqeq": true,
                "undef": true,
                "globals": {
                  "jQuery": true,
                  "CryptoJS": true,
                  "encode": true,
                  "QUnit": true
                },
                reporter: require('jshint-stylish')
            },
            all: ['Gruntfile.js', 'assets/js/*.js']
          }
    });

    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-qunit-junit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-replace');
    grunt.registerTask('default', ['concat', 'uglify', 'replace']);
    grunt.registerTask('test', ['qunit_junit', 'qunit:src']);
};

