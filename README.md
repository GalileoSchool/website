# GalileoSchool website

This is the source code of the Galileo School new website. If you want to contribute, send pull requests to this repo.

## Overview

This system uses the Handlebars templating engine to build from the source/ directory using components from the components/ directory.

## How to use

Before use, make sure you have `node` and `npm` installed. You can check correctness using these command-line commands:
```
git --version
node --version
npm --version
```

To set up your system for running, install all npm packages:
```
npm install
```

To clean the build folder and then build the website, run:
```
rm -rf build
node build
```

You will then see your website in the build/ folder. After any changes in the source files, run `node build` again.

Don't make changes to the files in the build folder, as they will be overridden by the next build, and so all your changes will be deleted!

You can find all of these in the `Makefile` file which you can use using the `make` command (if you get it installed - this should be done for you on Mac and UNIX systems).

There is also a highly experimental extra build script `Extensions/AboutUsParser.js`. It is by default not part of the automated build script and it is dangerous to use. If you do want to use it, follow these instructions *carefully*:
* uncomment the lines in `build.js`, which refer to `AboutUsParser`
* run `node build` - note that this time it will not run automatically, but will require command line input to complete
* this code is run rarely, so after running very carefully check that it doesn't override any other changes by running `git diff` to highlight all changes made and by opening the built website to check that everything is alright on the affected parts of the website

## Deploying

Once the website is built in the build folder, you can deploy it (which basically means means replacing the public folder with contents of the build folder).

An example way how to do it from console from repo directory (careful, this will irreversibly erase anything in the destination repository):
```
cd build
git init
git add .
git commit -m "Deploy"
git remote add origin git@github.com:galileoschool/galileoschool.github.io.git
git push -fu origin master
cd ..
```

## License

(c) Copyright 2021 GALILEO SCHOOL, s.r.o., all rights reserved.
