#!/bin/sh

setup_git() {
  git config --global user.email "jordhuff@gmail.com"
  git config --global user.name "Justice Warrior"
}

commit_website_files() {
  git checkout -b gh-pages
  git add rtl-architect/dist
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git push --quiet --set-upstream origin gh-pages:master
}

setup_git
commit_website_files
upload_files
