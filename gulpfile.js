var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var concat = require('gulp-concat');
var sourcemaps = require('gulp-sourcemaps');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var gls = require('gulp-live-server');
var util = require('gulp-util');

var PATHS = {
    src: './src',
    dist: './dist',
    doc: './doc',
    node_modules: '../node_modules'
};

function onError() {
    return function() {
        this.emit('end');
    };
}

function fileToSrc(filename, string) {
    var src = require('stream').Readable({
        objectMode: true
    });
    src._read = function() {
        this.push(new util.File({
            cwd: "",
            base: "",
            path: filename,
            contents: new Buffer(string)
        }));
        this.push(null);
    };
    return src;
}


var nmssTheme = (util.env.theme ? util.env.theme : 'prototype');
var nmssScssPath = PATHS.node_modules + '/nmss/src/nmss.scss';
var nmssThemePath = PATHS.node_modules + '/nmss-theme-' + nmssTheme + '/theme/nmss-theme-' + nmssTheme + '.scss';
var sassString = '@import "' + nmssThemePath + '"; @import "' + nmssScssPath + '";';


gulp.task('sass', function() {
    fileToSrc('nmss.scss', sassString)
        .pipe(sass({
            outputStyle: 'compressed',
            errLogToConsole: true
        }))
        .pipe(autoprefixer('last 2 version'))
        .pipe(gulp.dest(PATHS.dist))
        .pipe(gulp.dest(PATHS.doc + '/css'));
});


gulp.task('js', function() {
    return bundler.bundle()
        .pipe(plumber(onError()))
        .pipe(source('doc.bundle.js'))
        .pipe(gulp.dest(PATHS.doc + '/'));
});

gulp.task('tpl', function() {
    return gulp.src(PATHS.node_modules + 'nmss/src/**/*.tpl')
        .pipe(plumber(onError()))
        .pipe(concat('nmss.tpl'))
        .pipe(gulp.dest(PATHS.doc + '/tpl'));
});

gulp.task("serve", function() {

    gulp.start('sass');
    gulp.start('tpl');

    var server = gls.new('bin/server.js');
    server.start();

    gulp.watch([PATHS.src + '/**/*.scss', PATHS.src + '/**/*.tpl'], ['scss', 'tpl']);
    gulp.watch(PATHS.doc + '/js/**/*.js', ['tpl']);
});
