module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            // 2. Configuration for concatinating files goes here.
            dist: {
                src: [
                    'js/libs/*.js', // All JS in the libs folder
                    'js/webmaily.js'  // This specific file
                ],
                dest: 'js/build/webmaily.js',
            }
        },
        
        uglify: {
            build: {
                src: 'js/build/webmaily.js',
                dest: 'js/build/webmaily.min.js'
            }
        },
        
        watch: {
            options: {
                livereload:true,
            },
            scripts: {
                files: ['js/*.js'],
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

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('default', ['concat','uglify']);

};