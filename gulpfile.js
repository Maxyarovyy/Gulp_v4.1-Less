/* Підключення модулей*/
const gulp = require("gulp");
const less = require("gulp-less");
const del = require("del");
const cleanCSS = require("gulp-clean-css");
const rename = require("gulp-rename");
const babel = require("gulp-babel");
const uglify = require("gulp-uglify")
const concat = require("gulp-concat")

/* Створення константи з шляхами до папок*/
const paths = {
  styles: {
    src: "src/styles/**/*.less",
    dest: "dist/css/",
  },
  scripts: {
    src: "src/scripts/**/*.js",
    dest: "dist/js/",
  },
};

/* Очищення фінальної папки*/
function clean() {
  return del(["dist"]);
}

/* Перетворення less в css, мініфікація файла css і його переіменування (збір всіх файлів sass і їх переіменування можна було зробити і за допомогою concat - модуля який ми використали в scripts для JS*/
function styles() {
  return gulp
    .src(paths.styles.src)
    .pipe(less())
    .pipe(cleanCSS())
    .pipe(
      rename({
        basename: "main",
        suffix: ".min",
      })
    )
    .pipe(gulp.dest(paths.styles.dest));
}

/* Відстежування змін в робочих папках*/
function watch() {
  gulp.watch(paths.styles.src, styles);
  gulp.watch(paths.scripts.src, scripts);
}

/* Робота з файлами js. Їх компіляція під старі версії JS. Мініфікація файлів. Якщо є декілька файлів js в папці то їх обєднання в один і переіменування останнього*/
function scripts() {
  return gulp.src(paths.scripts.src, {
    sourcemaps: true,
  })
	.pipe(babel())
	.pipe(uglify())
	.pipe(concat('main.min.js'))
	.pipe(gulp.dest(paths.scripts.dest))
}

/* Створення послідовності виконання операцій і також їх запаралелення*/
const build = gulp.series(clean, gulp.parallel(styles, scripts), styles, watch);

exports.clean = clean;
exports.styles = styles;
exports.watch = watch;
exports.scripts =scripts;
exports.build = build;

/* Створення дефолтної команди (gulp = gulp build*/
exports.default = build;
