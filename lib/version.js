var verInc = function (dir, version) {
    if (!dir || dir == 'help') {
        console.log('Usage: qver <repository> [major|minor|hotfix]');
        console.log('Script for increment version\n');
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
    var type = version ? version : 'minor';

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
    var version;
    var version_created = false;

    function step1() {

        console.log('Step 1. Checking to master and pulling updates...');
        exec('git checkout master',
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git fetch',
                        function (error, stdout, stderr) {
                            if (error == null) {
                                exec('git reset --hard origin/master', function () {
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
        console.log('Step 2. Updating version and creating commit...');

        try {
            version = fs.readFileSync('version', {encoding: 'utf8'});
            version = version.split('.');
            switch (type) {
                case 'major':
                    version[0] = parseInt(version[0]) + 1;
                    version[1] = '0';
                    version[2] = '0';
                    break;
                case  'minor':
                    version[1] = parseInt(version[1]) + 1;
                    version[2] = '0';
                    break;
                case 'hotfix':
                    console.log('...developing...');
                    return;
                    version[2] = parseInt(version[2]) + 1;
                    break;
                default :
                    version[1] = parseInt(version[1]) + 1;
                    break;
            }
            version = version.join('.');
        } catch (e) {
            version = '1.0.0';
            version_created = true;
        }
        console.log('New version: ' + version);

        fs.writeFileSync('version', version, {encoding: 'utf8'});
        if (version_created) {
            exec('git add version',
                function (error, stdout, stderr) {
                    if (error == null) {
                        exec('git commit -am "Bump version ' + version + '"',
                            function (error, stdout, stderr) {
                                if (error == null) {
                                    step3();
                                } else {
                                    console.log('exec error: ' + error);
                                }

                            });
                    } else {
                        console.log('exec error: ' + error);
                    }
                });

        } else {
            exec('git commit -am "Bump version ' + version + '"',
                function (error, stdout, stderr) {
                    if (error == null) {
                        step3();
                    } else {
                        console.log('exec error: ' + error);
                    }

                });
        }
    }

    function step3() {
        console.log('Step 3. Pushing...');
        exec('git push',
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