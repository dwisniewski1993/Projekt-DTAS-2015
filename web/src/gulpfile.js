var gulp = require('gulp');
var uglify = require('gulp-uglify');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var del = require('del');

gulp.task('clean', function() {
    return del(['../build/*']);
});

gulp.task('src', function() {
    return browserify('js/main.jsx')
        .transform(babelify, {presets:['es2015', 'react']})
        .bundle().pipe(source('app.js')).pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest('../build'))
});

