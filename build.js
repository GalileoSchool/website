// this is the build script
// it takes files from source/ and transpiles them into build/
// it takes components from components/ and substitutes them into all .html
//  files that use the handlebar syntax of {{ ... }}
// components can also use this syntax {{ ... }} to place other components inside
//  referred to as 'nested' components
// all non-html files are simply copied

// this program actually transpiles twice, creating two copies of html files, 
//  once using english components and a second time using slovak components
// slovak components are those placed in the components/sk/ folder and 
//  components/en/ for english
// both transpilations can use the shared components inside components/

// components can be 'compound' if they use the appropriate syntax (defined below)
// this acts as if you had multiple components, but put into one file
//  and accessed using {{component.subcomponent}}

const fs = require('fs') // for manipulation of files
const glob = require('glob') // for finding the right files
const Handlebars = require('handlebars') // for using handlebars

// syntax for compound components
const OPENING_SIGNATURE = ':^) ' // notice the space on end
const CLOSING_SIGNATURE = ' :::' // notice the space in front

// getter function for directory name
function getDirname () {
	// replaces backwards slashes with forward slashes (Windows patch)
	return __dirname.replace(/\\/g, '/')
}

// it's basically the old file with /source/ replaced with /build/
function getBuildFilePathFromSourceFilePath (sourceFilePath) {
	// note that replace only replaces the first occurrence if the first argument
	//  is a string
	return sourceFilePath.replace(
		getDirname() + '/source/',
		getDirname() + '/build/'
	)
}

function getFileExtension (filePath) {
	return filePath.split('.').pop()
}

function isHtmlFile (filePath) {
	return getFileExtension(filePath) === 'html'
}

function isCssFile (filePath) {
	return getFileExtension(filePath) === 'css'
}

function makeFolder (folderPath) {
	// console.log('Preparing folder', folderPath)
	// create if it doesn't exists yet
	if (!fs.existsSync(folderPath)) {
		fs.mkdirSync(folderPath)
		console.log('Created folder', folderPath)
	}
}

// creates a dictionary of (filename: sourceFile) for Handlebars
function makeComponentDictionary(globPattern) {
	console.log('Looking for components matching: ' + globPattern)

	const componentSourceFiles = glob.sync(globPattern)
	const components = {}
	// loop over found components matching the glob pattern
	for (const componentSourceFile of componentSourceFiles) {
		const componentName = componentSourceFile
			.split('/').pop() // get the actual filename
			.replace(/\.html$/, '') // remove .html at the end
	
		console.log('Found component', componentName)

		// parse component (separate into subcomponents if it is compound)
		const fileString = fs.readFileSync(componentSourceFile, "utf8")
		if (fileString.indexOf(OPENING_SIGNATURE) == 0) {
			console.log(componentName, 'was identified as a compound component')

			// split by sections / subcomponents
			let sections = fileString.split('\r\n' + OPENING_SIGNATURE)
			sections[0] = sections[0].replace(OPENING_SIGNATURE, '')
			// separate sections into name and content
			sections = sections.map(section => section.split(CLOSING_SIGNATURE + '\r\n'))
			// add component sections to dictionary
			let componentDict = {}
			sections.forEach(
				section => {
					componentDict[section[0]] = new Handlebars.SafeString(section[1])
				}
			)
			// add compound component to main component dictionary
			components[componentName] = componentDict
		}
		else {
			// otherwise if not compound, just add them normally

			// Handlebars escapes the '<' and '>' characters by default, so we need to
			// explain that the strings are safe
			// API reference: http://handlebarsjs.com/reference.html
			components[componentName] = new Handlebars.SafeString(fileString)
		}
		
	}
	return components
}

function transpileUsingNestedHandlebars(fileString, fileToCreate, components) {
	// this is where we transpile!
	// https://github.com/wycats/handlebars.js/#usage
	let template

	// repeated Handlebar replacement to allow for nesting
	while (fileString.indexOf('{{') !== -1) {
		template = Handlebars.compile(fileString)
		fileString = template(components)
	}
	// write output to file
	fs.writeFileSync(fileToCreate, fileString)
	console.log('Transpiled file', fileToCreate)
}

// first we prepare all the folders in the build folder
// create the target build/ folder if it doesn't exist yet
makeFolder('./build/')
// create base html folders (en/sk versions)
makeFolder(getDirname() + '/build/html/')
makeFolder(getDirname() + '/build/html/en/')
makeFolder(getDirname() + '/build/html/sk/')
// the remaining folders are not hardcoded,
//  they are added as they are found in source/
const sourceFolders = glob.sync(getDirname() + '/source/**/', {})
for (const sourceFolder of sourceFolders) {

	// checks if the source folder is in the html folder
	if (sourceFolder.includes('/html/')) {
		// create en and sk copies of the folder
		const enFolderToCreate = sourceFolder.replace(
			getDirname() + '/source/html/',
			getDirname() + '/build/html/en/'
		)
		const skFolderToCreate = sourceFolder.replace(
			getDirname() + '/source/html/',
			getDirname() + '/build/html/sk/'
		)
		makeFolder(enFolderToCreate)
		makeFolder(skFolderToCreate)

	} else {
		// otherwise just make one shared folder (e.g. css/ or js/)
		const folderToCreate = getBuildFilePathFromSourceFilePath(sourceFolder)
		makeFolder(folderToCreate)
	}
}

// second, we prepare all components
const enComponents = makeComponentDictionary(getDirname() + '/components/{*,en/*}.html')
const skComponents = makeComponentDictionary(getDirname() + '/components/{*,sk/*}.html')

// third, we compose all css files into a single one
console.log('Beginning CSS composition into style.css')
// find all css files inside css folder
const cssSourceFiles = glob.sync(getDirname() + '/source/css/*.css', {})
// turn them into strings
const cssString = cssSourceFiles.map(file => fs.readFileSync(file).toString())
// join all strings into one string
const cssConcatenated = cssString.join('\n')
// TODO: remove whitespace?
// write concatenated string to css file
fs.writeFileSync(getDirname() + '/build/css/style.css', cssConcatenated)
console.log('Composed all CSS files into style.css')

// finally, we transpile html files and copy non-html files
let sourceFiles = glob.sync(getDirname() + '/source/**/*', { nodir: true })
for (const sourceFile of sourceFiles) {
	// identifies the new file to be created
	const fileToCreate = getBuildFilePathFromSourceFilePath(sourceFile)

	// note to future contributors: if you're going to use the html folder 
	// for something other than .html files, use filePath.includes('/html/')
	if (isHtmlFile(sourceFile)) {

		// we need a string, so we use .toString()
		const startFile = fs.readFileSync(sourceFile).toString()
		const enFileToCreate = fileToCreate.replace('/html/', '/html/en/')
		const skFileToCreate = fileToCreate.replace('/html/', '/html/sk/')

		// The nested transpilation happens inside a function because
		// it is done twice: once using english components, and then
		// again using slovak components.
		transpileUsingNestedHandlebars(startFile, enFileToCreate, enComponents)
		transpileUsingNestedHandlebars(startFile, skFileToCreate, skComponents)

	} else if (isCssFile(sourceFile)) {
		console.log('Skipped CSS file', sourceFile)

	} else {
		fs.copyFileSync(sourceFile, fileToCreate)
		console.log('Copied file', fileToCreate)
	}
}

console.log('Success! Files built in build/')