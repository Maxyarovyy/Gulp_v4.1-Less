/* Підключення модулей*/
const gulp = require('gulp')
const less = require('gulp-less')
const del = require('del')
const cleanCSS = require('gulp-clean-css')
const rename = require('gulp-rename')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const concat = require('gulp-concat')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const imagemin = require('gulp-imagemin')
const htmlmin = require('gulp-htmlmin')
const size = require('gulp-size')
const newer = require('gulp-newer')
const browserSync = require('browser-sync').create()
const gulppug = require('gulp-pug')
const stylus = require('gulp-stylus')
const sass = require('gulp-sass')(require('sass'))
const ts = require('gulp-typescript')
const coffee = require('gulp-coffee')

/* Створення константи з шляхами до папок*/
const paths = {
  html: {
    src: 'src/*.html',
    dest: 'dist/',
  },
  pug: {
    src: 'src/*.pug',
    dest: 'dist/',
  },
  styles: {
    src: [
      'src/styles/**/*.styl',
      'src/styles/**/*.less',
      'src/styles/**/*.sass',
      'src/styles/**/*.scss',
    ],
    dest: 'dist/css/',
  },
  scripts: {
    src: [
      'src/scripts/**/*.js',
      'src/scripts/**/*.ts',
      'src/scripts/**/*.coffee',
    ],
    dest: 'dist/js/',
  },
  images: {
    src: 'src/img/**',
    dest: 'dist/img/',
  },
}

/* Очищення фінальної папки окрім папки img*/
function clean() {
  return del(['dist/*', '!dist/img'])
}

/* Перетворення sass, scss, less, stylus в css (в залежності з яким препроцесором ми працюємо вибрати потрібний а інші закоментувати). Відображення в панелі розробника саме те, що ми працюємо з файлом style.less а не з main.min.css (sourcemaps). Мініфікація файла css і його переіменування (cleanCSS) з рівнем стиснення 2. Збір всіх файлів lessі їх переіменування можна було зробити і за допомогою concat - модуля який ми використали в scripts для JS). Також показ розміру наскільки вони сжалися. Синхронізація з браузером*/
function styles() {
  return (
    gulp
      .src(paths.styles.src)
      .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
      // .pipe(less())          //синтаксис less
      // .pipe(stylus())        //синтаксис stylus
      .pipe(
        autoprefixer({
          cascade: false,
        })
      )
      .pipe(
        cleanCSS({
          level: 2,
        })
      )
      .pipe(
        rename({
          basename: 'main',
          suffix: '.min',
        })
      )
      .pipe(sourcemaps.write('.'))
      .pipe(size({ showFiles: true }))
      .pipe(gulp.dest(paths.styles.dest))
      .pipe(browserSync.stream())
  )
}

/* Відстежування змін в робочих папках і запуск LiveServer для HTML*/
function watch() {
  browserSync.init({
    server: './dist/',
  })
  gulp.watch(paths.html.dest).on('change', browserSync.reload)
  gulp.watch(paths.html.src, html)
  gulp.watch(paths.styles.src, styles)
  gulp.watch(paths.scripts.src, scripts)
  gulp.watch(paths.images.src, img)
}

/* Робота з файлами js type script coffee script (непотрібне розширення закоментувати а потрібне лишити). Робота з файлом саму main.js а не main.min.js (sourcemaps). Їх компіляція під старі версії JS (babel). Мініфікація файлів (uglify). Якщо є декілька файлів js в папці то їх обєднання в один і переіменування останнього (concat). Також показ розміру наскільки вони сжалися. Синхронізація з браузером*/
function scripts() {
  return (
    gulp
      .src(paths.scripts.src)
      .pipe(sourcemaps.init())
      // .pipe(coffee({ bare: true }))     //синтаксис coffee
      // .pipe(                            //cсинтаксис type script
      //   ts({
      //     noImplicitAny: true,
      //     outFile: 'main.min.js',
      //   })
      // )
      .pipe(
        babel({
          presets: ['@babel/env'],
        })
      )
      .pipe(uglify())
      .pipe(concat('main.min.js'))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest(paths.scripts.dest))
      .pipe(size({ showFiles: true }))
      .pipe(browserSync.stream())
  )
}

/* Зменшення розміру картинок. Сжимаються тільки нові картинки а старі не сжимаються бо вони і так вже сжаті (newer) Також показ розміру наскільки вони сжалися*/
function img() {
  return gulp
    .src(paths.images.src)
    .pipe(newer(paths.images.dest))
    .pipe(imagemin({ progressive: true }))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(paths.images.dest))
}

/* Мініфікація файлу html. Також показ розміру наскільки він сжався. Синхронізація з браузером*/
function html() {
  return gulp
    .src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.stream())
}

/* Мініфікація і конвертація в HTML PUG файлу (дане розширення не підключено в watch, тобто він не відслідковужсбся і не добавлений в таск. Якщо птрібно то потрібно добавити вручну*/
function pug() {
  return gulp
    .src(paths.pug.src)
    .pipe(gulppug())
    .pipe(size({ showFiles: true }))
    .pipe(gulp.dest(paths.pug.dest))
    .pipe(browserSync.stream())
}

/* Створення послідовності виконання операцій і також їх запаралелення*/
const build = gulp.series(
  clean,
  html,
  gulp.parallel(styles, scripts, img),
  watch
)

exports.clean = clean
exports.styles = styles
exports.watch = watch
exports.scripts = scripts
exports.img = img
exports.html = html
exports.pug = pug
exports.build = build

/* Створення дефолтної команди (gulp = gulp build*/
exports.default = build
