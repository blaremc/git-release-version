var flow = function (dir, version) {
    if (!dir || dir == 'help') {
        console.log('Usage: qflow <repository> [major|minor|hotfix]');
        console.log('Script for release new version\n');
        console.log('  major|minor|hotfix                Which number of version will be incremented. Default value is minor.');
        console.log('\n');
        console.log('Note:');
        console.log("If version file doesn't exist, it will be created");
        console.log('\n');
        console.log('Example:');
        console.log('qflow C:\\Sites\\calculator ');
        console.log('qflow git@github.com:user/calculator  hotfix');
        console.log('qflow https://github.com/calculator.git  major');
        return;
    }


    var repo_path = dir;
    var type = version ? version : 'minor';

    var exec = require('child_process').exec;
    var fs = require('fs-extra');
    var tempory_folder = null;
    var merge_branch;


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
        console.log('Step 2. Checking to develop and pulling updates...');
        exec('git checkout develop',
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git reset --hard origin/develop', function () {
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

    }

    function step3() {
        var old_version = '';
        try {
            version = fs.readFileSync('version', {encoding: 'utf8'});
            old_version = version;
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
        if (type == 'hotfix') {
            merge_branch = 'hotfix-' + version;
            console.log('Step 3. Searching branch ' + merge_branch + '...');

            exec('git checkout ' + merge_branch,
                function (error, stdout, stderr) {
                    if (error == null) {
                        var hotfix_version = fs.readFileSync('version', {encoding: 'utf8'}); //Compare version with hotfix branch
                        if (hotfix_version != version) {
                            step4();
                        } else {
                            step5();
                        }
                    } else {
                        console.log('exec error: ' + error);
                    }
                });
        } else {
            exec('git log -1',
                function (error, stdout, stderr) {

                    if (error == null) {
                        if (stdout.indexOf("Release " + old_version + "") != -1) {
                            console.log('# No changes from Release ' + old_version);
                            console.log('# Aborted');
                            step9();
                            return;
                        }
                        console.log('Step 3. Creating new release branch...');


                        console.log('New version: ' + version);

                        merge_branch = 'release-' + version;
                        exec('git checkout -b ' + merge_branch,
                            function (error, stdout, stderr) {
                                if (error == null) {
                                    step4();
                                } else {
                                    console.log('exec error: ' + error);
                                }
                            });
                    } else {
                        console.log('exec error: ' + error);
                    }
                });
        }
    }

    function step4() {
        console.log('Step 4. Updating version and creating commit...');
        fs.writeFileSync('version', version, {encoding: 'utf8'});
        if (version_created) {
            exec('git add version',
                function (error, stdout, stderr) {
                    if (error == null) {
                        exec('git commit -am "Bump version ' + version + '"',
                            function (error, stdout, stderr) {
                                if (error == null) {
                                    step5();
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
                        step5();
                    } else {
                        console.log('exec error: ' + error);
                    }

                });
        }
    }

    function step5() {
        console.log('Step 6. Merging ' + merge_branch + ' to master...');

        exec('git checkout master',
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git merge ' + merge_branch + ' --no-ff',
                        function (error, stdout, stderr) {
                            if (error == null) {
                                step6();
                            } else {
                                console.log('exec error: ' + error);
                            }

                        });
                } else {
                    console.log('exec error: ' + error);
                }

            });
    }

    function step6() {
        console.log('Step 6. Creating tag and merging to develop...');

        exec('git tag -a v' + version + ' -m "Release ' + version + '"',
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git checkout develop',
                        function (error, stdout, stderr) {
                            if (error == null) {
                                exec('git merge v' + version + ' --no-ff',
                                    function (error, stdout, stderr) {
                                        if (error == null) {
                                            step7();
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


    function step7() {
        console.log('Step 7. Pushing...');
        exec('git push',
            function (error, stdout, stderr) {
                if (error == null) {
                    exec('git push --tag',
                        function (error, stdout, stderr) {
                            if (error == null) {
                                exec('git checkout master',
                                    function (error, stdout, stderr) {
                                        if (error == null) {
                                            exec('git push',
                                                function (error, stdout, stderr) {
                                                    if (error == null) {
                                                        step8();

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
                } else {
                    console.log('exec error: ' + error);
                }

            });
    }

    function step8() {
        console.log('Step 8. Cleaning...');
        if (type != 'hotfix') {
            exec('git branch -d ' + merge_branch,
                function (error, stdout, stderr) {
                    if (error == null) {
                        step9();
                    } else {
                        console.log('exec error: ' + error);
                    }
                });
        } else {
            step9();
        }
    }

    function step9() {
        if (tempory_folder) {
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

exports.flow = flow;