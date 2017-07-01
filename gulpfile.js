var gulp = require('gulp');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();
var header = require('gulp-header');
var cleanCSS = require('gulp-clean-css');
var rename = require("gulp-rename");
var uglify = require('gulp-uglify');
var pkg = require('./package.json');
var imagemin = require('gulp-imagemin');
var purify = require('gulp-purifycss');


// Set the banner content
var banner = ['/*!\n',
    ' * Vaudou - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
    ' * Copyright 2014-' + (new Date()).getFullYear(), ' <%= pkg.author %>\n',
    ' */\n',
    ''
].join('');


// Optimize images
gulp.task('img', function () {
    return gulp.src('assets/img/*.jpg')
        .pipe(imagemin())
        .pipe(gulp.dest('assets/img/min'))
});

// Compile LESS files from /less into /css
gulp.task('less', function() {
    return gulp.src('stylesheets/less/style.less')
        .pipe(less())
        .pipe(gulp.dest('assets/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify compiled CSS
gulp.task('minify-css', ['less'], function() {
    return gulp.src('assets/css/style.css')
        .pipe(cleanCSS({ compatibility: 'ie8' }))
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/css/'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

// Minify JS
gulp.task('minify-js', function() {
    return gulp.src('js/*.js')
        .pipe(uglify())
        .pipe(header(banner, { pkg: pkg }))
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('assets/js'))
        .pipe(browserSync.reload({
            stream: true
        }))
});

gulp.task('purify-vendor-css', function() {
    return gulp.src('./vendor/*/css/*.min.css')
        .pipe(purify(['./index.html']))
        .pipe(rename({ suffix: '.purified' }))
        .pipe(gulp.dest('assets/vendor'));
});

// Copy vendor libraries from /node_modules into /vendor
gulp.task('copy', function() {
    gulp.src(['node_modules/bootstrap/dist/**/*', '!**/npm.js', '!**/bootstrap-theme.*', '!**/*.map'])
        .pipe(gulp.dest('vendor/bootstrap'))

    gulp.src(['node_modules/jquery/dist/jquery.js', 'node_modules/jquery/dist/jquery.min.js'])
        .pipe(gulp.dest('vendor/jquery'))

    gulp.src(['node_modules/tether/dist/js/tether.js', 'node_modules/tether/dist/js/tether.min.js'])
        .pipe(gulp.dest('vendor/tether'))

    gulp.src([
            'node_modules/font-awesome/**',
            '!node_modules/font-awesome/**/*.map',
            '!node_modules/font-awesome/.npmignore',
            '!node_modules/font-awesome/*.txt',
            '!node_modules/font-awesome/*.md',
            '!node_modules/font-awesome/*.json'
        ])
        .pipe(gulp.dest('vendor/font-awesome'))
})

// Run everything
gulp.task('default', ['less', 'minify-css', 'minify-js', 'copy']);

// Configure the browserSync task
gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: ''
        }
    })
});

// Dev task with browserSync
gulp.task('dev', ['browserSync', 'less', 'minify-css', 'minify-js'], function() {
    gulp.watch('stylesheets/less/*.less', ['minify-css']);
    gulp.watch('stylesheets/css/*.css', ['minify-css']);
    gulp.watch('js/*.js', ['minify-js']);
    // Reloads the browser whenever HTML or JS files change
    gulp.watch('*.html', browserSync.reload);
    gulp.watch('js/**/*.js', browserSync.reload);
});
