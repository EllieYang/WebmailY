module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            // 2. Configuration for concatinating files goes here.
            dist: {
                src: [
                    'js/lib/*.js', // All JS in the libs folder
                    'js/webmaily.js'  // This specific file
                ],
                dest: 'js/build/webmaily.js',
            },
            files:{
                'js/webmailAngular.js':['js/controller/*.js','js/directives/*.js']
            }
        },
        
        uglify: {
            build: {
                src: 'js/build/webmaily.js',
                dest: 'js/build/webmaily.min.js'
            }
        },
        connect:{
            dev:{
                options:{
                    port:9001,
                    base: '.',
                    keepalive:true
                }
            }
        },
        
        coffee:{
            compileWithMaps: {
                options: {
                    sourceMap: true
            },
            files: {
                'js/controller/mailCtrl.js': ['src/controller/*.coffee'],
                'js/directives/mailDir.js': ['src/directives/*.coffee']
            }
            },
        },
        
        watch: {
            options: {
                livereload:true,
            },
            scripts: {
                files: [
                    'js/*.js',
                    'js/controller/*.js',
                    'js/directives/*.js'
                ],
                tasks: ['concat', 'uglify'],
                options: {
                    spawn: false,
                },
            },
            css:{
                files: ['css/*.scss'],
                tasks: ['sass'],
                options:{
                    spawn:false,
                }
            }
        },
        
        sass: {
            dist: {
                options: {
                style: 'compressed'
            },
            files: {
                'css/build/webmaily.css': 'css/webmaily.scss'
            }
            } 
        }

    });

    // 3. Where we tell Grunt we plan to use this plug-in.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-coffee');
    grunt.loadNpmTasks('grunt-base64');

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['coffee','concat']);
    grunt.registerTask('dev', ['connect:dev']);

};