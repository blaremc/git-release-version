# Quick flow for git
Scripts for quick release products and update version

##Install

npm install -g git-qflow

###Usage
qflow repository [major|minor|hotfix] 

qver repository [major|minor|hotfix] 

###Steps
##### qflow
For minor and major version

1. Pull new updates from master and develop (Hard reset from repositories)
2. Create release branch
3. Checkout to branch
4. Increment version
5. Merge to master
4. Create tag
5. Merge to develop
6. Pushing

For hotfixes

1. Pull new updates from master and develop (Hard reset from repositories)
2. Checkout to hotfix branch 
3. Increment version if is need
4. Merge to master
5. Create tag
6. Merge to develop
7. Pushing

##### qver
1. Pull new updates from master and develop (Hard reset from repositories)
2. Increment version
3. Push

### Examples
qflow C:\Sites\calculator

qflow git@github.com:user/calculator  hotfix

qflow https://github.com/calculator.git  major

qver https://github.com/calculator.git  minor

qver /var/repository
