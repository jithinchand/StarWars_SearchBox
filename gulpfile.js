var gulp  = require('gulp'),
    gutil = require('gulp-util');
liveReload = require('browser-sync').create();

// Live reload when some file is saved.
gulp.task('liveReload', function() {
    liveReload.init({
        port: 8080,
        ui: {
            port: 8585
        },
        server: {
            baseDir: '',
            index: 'index.html'
        }
    })
});

gulp.task('serve', ['liveReload'], function (){
    gulp.watch('*.html', liveReload.reload);
    gulp.watch('js/*.js', liveReload.reload);
    gulp.watch('css/*.css', liveReload.reload);
    gulp.watch('partials/*.html', liveReload.reload);
    gulp.watch('img/*.png', liveReload.reload);
    gulp.watch('img/products/*.jpg', liveReload.reload);
});