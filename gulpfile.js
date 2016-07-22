var gulp = require('gulp');
var preprocess = require('gulp-preprocess');
var minify = require('gulp-minify');

gulp.task('scripts-preprocess', function () {
	gulp.src(['./*.js', '!*BACKUP-*.js', '!./node_modules/**', '!**/gulpfile.js', '!**.include.js'])
		.pipe(preprocess({ context: { BUILD: true } }))
//		.pipe(gulp.dest('./dist/'))
		.pipe(minify({
			ext: {
				src: '.js',
				min: '.min.js'
			},
			compress: {
				sequences     : true,  // join consecutive statemets with the “comma operator”
				properties    : false,  // optimize property access: a["foo"] → a.foo
				dead_code     : true,  // discard unreachable code
				drop_debugger : true,  // discard “debugger” statements
				unsafe        : false, // some unsafe optimizations (see below)
				conditionals  : true,  // optimize if-s and conditional expressions
				comparisons   : true,  // optimize comparisons
				evaluate      : true,  // evaluate constant expressions
				booleans      : true,  // optimize boolean expressions
				loops         : true,  // optimize loops
				unused        : true,  // drop unused variables/functions
				hoist_funs    : true,  // hoist function declarations
				hoist_vars    : false, // hoist variable declarations
				if_return     : true,  // optimize if-s followed by return/continue
				join_vars     : true,  // join var declarations
				cascade       : true,  // try to cascade `right` into `left` in sequences
				side_effects  : true,  // drop side-effect-free statements
				warnings      : true,  // warn about potentially dangerous optimizations/code
				global_defs   : {}     // global definitions
			}
		}))
		.pipe(gulp.dest('./dist/'))
});