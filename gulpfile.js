var gulp = require('gulp');
var mocha = require('gulp-mocha');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var karma = require('karma').server;
var jshint = require('gulp-jshint');

var paths = {
  tests: 'test/*spec.js',
  fixtures: 'test/fixtures/*.js',
  index: './index.js',
  src:   'src/*.js'
};

gulp.task('lint', function() {
  return gulp.src([paths.index, paths.src, paths.tests, './gulpfile.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(jshint.reporter('fail'));
});

gulp.task('test', ['lint'], function() {
  return gulp.src(paths.tests, {read: false})
    .pipe(mocha({reporter: 'dot'}));
});

gulp.task('browserify', function() {
  var browserified = transform(function(filename) {
    var b = browserify(filename, {standalone: 'Ludo'});
    return b.bundle();
  });

  return gulp.src(paths.index)
    .pipe(browserified)
    // .pipe(uglify())
    .pipe(rename('Ludo.js'))
    .pipe(gulp.dest('./dist'));
});

gulp.task('test-all', function(done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});

gulp.task('watch', function() {
  gulp.watch([paths.tests, paths.src, paths.fixtures], ['test']);
  gulp.watch([paths.src], ['browserify']);
});

gulp.task('default', ['test', 'browserify']);
