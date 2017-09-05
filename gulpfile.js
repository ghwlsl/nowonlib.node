const gulp = require('gulp');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-spawn-mocha');


gulp.task('start', () => {
  nodemon({
    script: 'server.js',
    ext: 'html js ejs css',
    ignore: ['node_modules'],
  })
  .on('restart', () => {
    console.log('restarted')
  });
});

gulp.task('test', () => {
  return gulp.src('test/test.js', {read: false})
  .pipe(mocha({
    // report 종류
    R: 'spec',
  }));
});
