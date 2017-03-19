#!/bin/sh

setup_git() {
  git config --global user.email "jordhuff@gmail.com"
  git config --global user.name "Justice Warrior"
}

commit_website_files() {
  git checkout $BRANCH
  git add -f rtl-architect/dist
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
  git status
}

upload_files() {
  git push https://${GH_TOKEN}@github.com/colter5991/rtl-architect.git
}

setup_git
commit_website_files
upload_files
