module.exports = function(grunt) {

    // 1. All configuration goes here 
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        connect:{
            dev:{
                options:{
                    port:9001,
                    base: '.',
                    keepalive:true,
                    onCreateServer:function(server,connect,options){
                        var MailComposer = require("mailcomposer").MailComposer;
                        var mailcomposer = new MailComposer(),
                            fs = require("fs");
                       mailcomposer.setMessageOption({
                        from: "welcome.easymail@gmail.com",
                        to: "welcome.easymail@gmail.com",
                        body: "Hello Xi+",
                        html: "<b>Hello Xi+</b>" 
                    });

                        /*var emailStr = "";
                        var err = "Error Occured";
                        mailcomposer.buildMessage(function(err, emailStr){
                            console.log(err || emailStr);
                        });*/
                        var Buffer = require("buffer");
                        mailcomposer.streamMessage();
                        mailcomposer.pipe(fs.createWriteStream("out.txt"));
                    }
                }
            }
        },
                
        watch: {
            options: {
                livereload:true,
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

    // 4. Where we tell Grunt what to do when we type "grunt" into the terminal.
    grunt.registerTask('dev', ['connect:dev']);

};