/*----------------------------------------------------
 * Module Setting
 *-----------------------------------------------------*/
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        // concat: {
        //     options: {
        //         separator: ';'
        //     },
        //     dist: {
        //         src: ['gConfig.js','gClass.js','gUtil.js','gControl.js','gMarker.js','gHeatmap.js','gLayer.js','gMap.js','gGraph.js','gGeometry.js','gFeature.js','gWebSQL.js','gWebSQLScript.js','gWebFeatureGeojson.js','gDrawFeature.js','gEdit.js','gStyle.js','gExport.js','gUpload.js','gFileServer.js','gDynLayerStyle.js','gGrid.js','gDrawgrid.js','gGeoCoding.js'],
        //         dest: 'dist/<%= pkg.name %>-<%=pkg.version%>.js'
        //     }
        // },
        // // Task jsmin
        // uglify: {
        //     options: {
        //         banner: '/*!  <%=pkg.name%>-<%=pkg.version%>.js  <%= grunt.template.today("dd-mm-yyyy") %> */\n'
        //     },
        //     dist: {
        //         src: '<%= concat.dist.dest %>',
        //         dest: 'dist/<%=pkg.name%>-<%=pkg.version%>.min.js'
        //     }
        // },
        jsdoc : {
            dist : {
                src: ['gFileServer.js'],
                options: {
                    destination: 'doc'
                }
            }
        }
    });
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    //grunt.loadNpmTasks('grunt-contrib-concat');
    //grunt.registerTask('default', [ 'concat', 'uglify']);    
    
    grunt.loadNpmTasks('grunt-jsdoc');
    grunt.registerTask('default', [ 'jsdoc']);   
};