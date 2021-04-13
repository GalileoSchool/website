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

To build the website, run:
```
node build
```

You will then see your website in build/. After any changes in the source files, run `node build` again.

Don't make changes to the files in the build folder, as they will be overridden by the next build, and so all your changes will be deleted!

You can find all of these in the `Makefile` file which you can use using the `make` command (if you get it installed - this should be done for you on Mac and UNIX systems).

## License

(c) Copyright 2020 GALILEO SCHOOL, s.r.o., all rights reserved.
