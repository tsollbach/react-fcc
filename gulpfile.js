const pack = require('./package.json')
const gulp = require('gulp')
const del = require('del')
const tsc = require('gulp-typescript')
const sourcemaps = require('gulp-sourcemaps')
const merge = require('merge2')
const plumber = require('gulp-plumber')
const rollup = require('gulp-better-rollup')
const nodeResolve = require('rollup-plugin-node-resolve')
const commonjs = require('rollup-plugin-commonjs')
const babel = require('rollup-plugin-babel')
const { uglify } = require('rollup-plugin-uglify')

const env = process.env.NODE_ENV || 'development'

const name = 'react-fcc'
const src = 'src'
const dest = env !== 'production' ? 'build' : 'dist'

const srcFiles = `${src}/${name}/**/*.ts*`

const config = {
  production: {
    main: `${dest}/es6/index.js`,
    bundle: dest,
    tsConfig: {
      isolatedModules: false,
      declaration: true,
      module: 'es2015',
      sourceMap: false,
    },
  },
  development: {
    main: `${dest}/${name}/index.js`,
    bundle: `${dest}/${name}/`,
    tsConfig: {
      isolatedModules: false,
    },
  },
}

gulp.task('clean', callback => {
  return del([dest], callback)
})

gulp.task('build:development', () => {
  const tsProject = tsc.createProject('tsconfig.json', config.development.tsConfig)
  const tsResult = gulp
    .src(srcFiles, { base: src })
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(tsProject())
  return tsResult.js
    .pipe(plumber())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(dest))
})

gulp.task('build:production', () => {
  const tsProject = tsc.createProject('tsconfig.json', config.production.tsConfig)
  const tsResult = gulp
    .src(srcFiles)
    .pipe(plumber())
    .pipe(tsProject())
  return merge([
    tsResult.js
      .pipe(plumber())
      .pipe(gulp.dest(`${dest}/es6`)),
    tsResult.dts
      .pipe(plumber())
      .pipe(gulp.dest(`${dest}/dts`)),
  ])
})

gulp.task('build:bundle', () => {
  return gulp
    .src(config[env].main)
    .pipe(plumber())
    .pipe(
      rollup(
        {
          external: Object.keys(pack.dependencies),
          plugins: [
            nodeResolve({
              jsnext: true,
              main: true,
            }),
            commonjs(),
            babel({
              exclude: 'node_modules/**',
            }),
            uglify(),
          ],
        },
        {
          format: 'umd',
          exports: 'named',
          globals: {
            react: 'react',
          },
        },
      ),
    )
    .pipe(gulp.dest(config[env].bundle))
})

gulp.task('build:dts', () => {
  const tsProject = tsc.createProject('tsconfig.json', config.production.tsConfig)
  const tsResult = gulp
    .src(srcFiles)
    .pipe(plumber())
    .pipe(tsProject())
  return tsResult.dts.pipe(plumber()).pipe(gulp.dest(dest))
})

gulp.task('build', gulp.series('clean', `build:${env}`, 'build:bundle'))
gulp.task('default', gulp.series('build'))
