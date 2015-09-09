'use strict';

var gulp        = require('gulp'),
    plugins
;

plugins = require('gulp-load-plugins')({lazy:false});

gulp.errorLogger = function(error) {
    plugins.util.log(plugins.util.colors.red(error.message));
    this.emit('end');
};

gulp.task('styles', [], function() {
    return gulp.src('src/styles/imagezoom.scss')
        .pipe(plugins.plumber(onError)) // display errors in console, but don't break the watch cycle
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.sass({errLogToConsole: true}))
        .pipe(plugins.sourcemaps.write())

        .pipe(gulp.dest('dist/'))
        .pipe(plugins.livereload())
        .pipe(plugins.minifyCss())
        .pipe(plugins.rename({suffix: '.min'}))
        .pipe(gulp.dest('dist/'));
});

gulp.task('jshinting', function() {
    return gulp.src([packagePaths.app.scripts, '!' + packagePath + 'app/app-templates.js'])
        .pipe(plugins.plumber(onError))
        .pipe(plugins.jshint())
        .pipe(plugins.jshint.reporter(reporter))
        .pipe(plugins.jscs())
        ;
});

gulp.task('scripts', ['jshinting'], function(callback) {
    return gulp.src([
        'src/scripts/*.js'
    ])
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.concat('imagezoom.js'))
    .pipe(plugins.sourcemaps.write())
    .pipe(gulp.dest('dist/imagezoom.js'))
    .pipe(plugins.livereload())
    .pipe(plugins.ngAnnotate())
    .pipe(plugins.uglify({
        sourceMap: false,
        compress: {
            drop_console: true
        },
        mangle: true,
        beautify: false
    }))
    .pipe(plugins.rename({suffix: '.min'}))
    .pipe(gulp.dest('dist/imagezoom.min.js'));
});


gulp.task('build', ['styles', 'scripts'], function(callback) {
        callback();
});


gulp.task('default', ['build']);
gulp.task('dev', ['watch']);
