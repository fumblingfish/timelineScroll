var gulp = require('gulp'),
   sass = require('gulp-sass'),
   autoprefixer = require('gulp-autoprefixer'),
   livereload = require('gulp-livereload'),
   uglify = require('gulp-uglify'),
   concat = require('gulp-concat'),
   rename = require('gulp-rename');

var outputDist = './dist/'

var bundles = [
   {
      src:[
         './src/timelineScroll.js',
      ],
      output:'timelineScroll.js'
   },
   {
      src:[
         './src/timelineScroll.debugger.js',
      ],
      output:'timelineScroll.debugger.js'
   },
]

gulp.task('styles', function () {
   return gulp.src('examples/**/*.scss')
      .pipe(sass())
      .on('error', handleError)
      .pipe(autoprefixer({browsers: ['last 1 version', 'iOS 6'], cascade: false}))
      .pipe(gulp.dest(function (file) {
         return file.base
      }))
})

gulp.task('uncompressed', function () {
   bundles.forEach(function(bundle){
      gulp.src(bundle.src)
         .pipe(concat(bundle.output))
         .pipe(uglify())
         .on('error', handleError)
         .pipe(rename({
            extname: '.min.js'
         }))
         .pipe(gulp.dest(outputDist))
   })
})


gulp.task('compressed', function () {
   bundles.forEach(function(bundle){
      gulp.src(bundle.src)
         .pipe(concat(bundle.output))
         .pipe(gulp.dest(outputDist));
   })

});

gulp.task('build', ['uncompressed', 'compressed'])


// default
///////////////////////////////////////////////////

gulp.task('default', function () {
   livereload.listen();
   gulp.watch(['examples/**/*.scss'], ['styles']);
   gulp.watch(['src/*.js'], ['build']);
   gulp.watch(['examples/**/*.css']).on('change', livereload.changed);
   gulp.watch(['src/*.js']).on('change', livereload.changed);
})


// errors
///////////////////////////////////////////////////

function handleError(err) {
   console.log(err.toString());
   this.emit('end');
}

// Updating prefixes database
// $ npm update caniuse-db