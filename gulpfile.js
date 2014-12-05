var gulp = require('gulp');
var mocha = require('gulp-mocha');
var browserify = require('browserify');
var transform = require('vinyl-transform');
var uglify = require('gulp-uglify');
var rename = require("gulp-rename");
var karma = require('karma').server;


gulp.task('test', function() {
  return gulp.src('test/*spec.js', {read: false})
        .pipe(mocha({reporter: 'spec'}));
});

gulp.task('browserify', function () {
  var browserified = transform(function(filename) {
    var b = browserify(filename, {standalone: "Ludo"});
    return b.bundle();
  });

  return gulp.src(['./index.js'])
    .pipe(browserified)
    .pipe(uglify())
    .pipe(rename("ludo.js"))
    .pipe(gulp.dest('./dist'));
});

gulp.task('test-all', function (done) {
  karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, done);
});
