var verInc = function (dir, version, branch) {
    if (!dir || dir == 'help') {
        console.log('Usage: qrelease <repository> [major|minor|hotfix] <branch>');
        console.log('Script for create release\n');
        console.log('  major|minor|hotfix                Which number of version will be incremented. Default value is minor.');
        console.log('\n');
        console.log('Note:');
        console.log("If version file doesn't exist, it will be created");
        console.log('\n');
        console.log('Example:');
        console.log('qver C:\\Sites\\calculator ');
        console.log('qver git@github.com:user/calculator  hotfix');
        console.log('qver https://github.com/calculator.git  major');
        return;
    }


    var repo_path = dir;
    var branch = branch;
    if (!branch) {
        console.error('branch is null')
        return;
    }

    var exec = require('child_process').exec;
    var fs = require('fs-extra');
    var tempory_folder = null;


    if (repo_path.indexOf('git@') != -1 || repo_path.indexOf('https://') != -1) {

        var repo = repo_path;
        var repdir = 'repo-' + Math.round(Math.random() * 100000);
        repo_path = __dirname + '/temp/' + repdir;
        tempory_folder = repo_path;
        fs.mkdirsSync(repo_path);

        console.log('Prepare. Cloning repository to temp folder...');
        exec('git clone ' + repo + ' ' + repo_path, function (error) {
            if (error == null) {
                process.chdir(repo_path);
                step1();
            } else {
                console.log('exec error: ' + error);
            }
        });


    } else {
        process.chdir(repo_path);
        step1();
    }
    var version_created = false;

    function step1() {

        var main_branch;
        if (version == 'hotfix') {
            main_branch = 'master';
        } else {
            main_branch = 'develop';
        }
        console.log('Step 1. Checking to develop and pulling updates...');
        exec('git checkout ' + main_branch,
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git fetch',
                        function (error, stdout, stderr) {
                            if (error == null) {
                                exec('git reset --hard origin/' + main_branch, function () {
                                    if (error == null) {
                                        step2();
                                    } else {
                                        console.log('exec error: ' + error);
                                    }
                                });
                            } else {
                                console.log('exec error: ' + error);
                            }

                        });
                } else {
                    console.log('exec error: ' + error);
                }

            });
    }


    function step2() {
        console.log('Step 2. Create release branch...');

        exec('git checkout -b "' + branch + '"',
            function (error, stdout, stderr) {
                if (error == null) {
                    step3();
                } else {
                    console.log('exec error: ' + error);
                }

            });
    }

    function step3() {
        console.log('Step 3. Pushing...');
        exec('git push origin "' + branch + '"',
            function (error, stdout, stderr) {
                if (error == null) {
                    step4();
                } else {
                    console.log('exec error: ' + error);
                }

            });
    }

    function step4() {
        if (tempory_folder) {
            console.log('Step 4. Cleaning...');
            process.chdir(__dirname);
            tempory_folder = tempory_folder.replace(/\\/g, '/');
            fs.remove(tempory_folder, function (err) {
                if (err) return console.error(err);
                console.log('Done!');
            })
        } else {
            console.log('Done!');
        }

    }
};

exports.verInc = verInc;