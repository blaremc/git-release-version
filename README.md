# Git flow
Scripts for release products and update version

###Usage
node sln.js <repository> [major|minor|hotfix] 

node version.js <repository> [major|minor|hotfix] 

###Steps
##### node sln.js 
For minor and major

1. Pulling new updates from master and develop
2. Creating release branch
3. Incrementing version
4. Creating tag
5. Merging branches
6. Pushing

For hotfixes
...developing...

##### node version.js 
1. Pulling new updates from master and develop
2. Incrementing version
3. Pushing

### Examples
node sln.js C:\Sites\calculator

node sln.js git@github.com:user/calculator  hotfix

node sln.js https://github.com/calculator.git  major