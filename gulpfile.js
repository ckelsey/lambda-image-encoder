const gulp = require('gulp')
const exec = require('child_process').exec
const fs = require('fs')
const path = require('path')
const baseDir = path.resolve(__dirname, 'src')
const toWatch = [`${baseDir}/*`]
const pm2 = require('pm2')
const gulpSequence = require('gulp-sequence')
let pm2Process

// MOVES FILES TO ENV FOLDERS
gulp.task('moveFiles', function (done) {
    var total = 0
    var completed = 0
    var envPath = path.resolve(__dirname, 'env')

    fs.readdir(envPath, function (err, dirs) {
        var dirsList = []

        for (var di = 0; di < dirs.length; di++) {
            if (dirs[di] !== `.DS_Store`){
                dirsList.push(dirs[di])
            }
        }

        fs.readdir(baseDir, function (err, items) {

            var itemsList = []

            for (var ii = 0; ii < items.length; ii++) {
                if (items[ii] !== `.DS_Store`) {
                    itemsList.push(items[ii])
                }
            }

            total = itemsList.length * dirsList.length

            for (var d = 0; d < dirsList.length; d++) {
                for (var i = 0; i < itemsList.length; i++) {
                    let srcPath = path.resolve(envPath, dirsList[d], 'src')
                    if (!fs.existsSync(srcPath)) {
                        fs.mkdirSync(srcPath)
                    }

                    exec(`cp ${path.resolve(baseDir, itemsList[i])} ${path.resolve(srcPath, itemsList[i])}`, function (err, stdout, stderr) {
                        completed++

                        if (completed === total) {
                            done()
                        }
                    })
                }
            }
        })


    })
})

// Runs server
gulp.task('devServer', function (done) {
    pm2.connect(true, function () {
        pm2.start({
            name: 'lambdaImageEncoder',
            script: path.resolve(__dirname, 'src', 'app.js')
        }, function () {
            console.log('pm2 started')
            pm2.streamLogs('all', 0)
        })

        done()
    })
})

// reload the server
gulp.task('reload', function (done){
    try{
        pm2.reload(`lambdaImageEncoder`)
    }catch(error){}
    done()
})

// BUILDS FOR LAMBDA
gulp.task("build", function (done) {
    exec(`rm ${path.resolve(__dirname, 'env', 'linux', 'src', 'imageencode.zip')}`, function (err, stdout, stderr) {
        exec(`cd ${path.resolve(__dirname, 'env', 'linux', 'src')} && zip -r imageencode.zip .`, function (err, stdout, stderr) {
            console.log(err, stdout, stderr)
            done()
        })
    })
})

gulp.task("run", function(done){
    gulpSequence("reload", "moveFiles", "build")(done)
})

gulp.task("dev", ["devServer","run"], function () {
    gulp.watch(toWatch, ["run"]);
})

gulp.task("default", [
    "dev"
], function () { })