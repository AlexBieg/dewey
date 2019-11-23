# Dewey
An NPM package for testing directory structures. Using a dewey config file you can specify the directory structure of your application and allow it to be tested.

# Choosing a starting directory
By default dewey starts in the same directory as your `package.json`. If you would like the testing to start in a different directory you may speciy that directory by passing the command line argument `--dir` to dewey.

Example:
```
dewey --dir=./my-starting-directory/
```

# Choosing the config
By default the dewey looks for a `dewey.config.js` file in the same directory as your `package.json`. You can overwrite that by passing a path to the command line argument `--config`.

Example:
```
dewey --config=./my-folder/my-dewey-config.js
```

# Setting up the config file
The config file is a javascript file that exports a single config object. This object will contain all information required to determine if the directory structure of that application is in line with what is expected. Config objects are nested to mimic the tree structure of a file system.

## A config object
A config object loosely maps to a single directory and contains all information needed to test that directory. The config object exported from your config file should be set up to test the starting directory you have chosen. The config object has three properties that test the directory. An example config object looks like this:

```
const componentsConfig = {
  files: [
    { name: /scripts[1-9]\.js/}
  ]
}

const config = {
	ignore: [
		'node_modules',
	],
	files: [
		{ name: 'package.json' },
		{ name: () => 'package-lock.json' },
		{ name: /dewey\.config\.js/ },
		{
			name: 'required.js',
			required: true,
		}
	],
	dirs: [
		{
			name: 'scripts',
			config: scriptsConfig,
		},
		{
			name: 'components',
			config: componentsConfig,
		}
	],
};
```

### `files`
The `files` property is an array of objects where each object can test one or more files. There are 2 properties for each file testing object.

- `name`: The property that will test the name of the file. It can take 3 forms
  - string: a string comparison between the name property and file name. The below is an example of a file testing object that will match a file named `myfile.js`:
  ```
  {
    name: 'myfile.js',
  }
  ```
  - regular expression: A regular expression can be used to test one or many files in a directory. The below example will match multiple files with names starting with `script` and a single number after:
  ```
  {
    name: /script[1-9]\.js/,
  }
  ```
  - function: A function can be used for more verstitile file name testing. The function is passed two arguments. An array object representing the current path where the 0th element is the parent folder and the last element is the starting directory. The second argument is the name of the file being tested. The function should return a string that is the name of the file that can be here. The below example will match a file that has the same name as it's parent and is a `.jsx` file.
  ```
  {
    name: (path, name) => return `${path[0]}.jsx`,
  }
  ```
- `required`: A boolean indicating if this file is required to be in the given directory.

### `dirs`
The `dirs` property is an array of objects that that contain the testing information for both the directory and it's files. There are 3 properties for each directory testing object.

- `name`: The property that will test the name of the directory. It can take 3 forms
  - string: a string comparison between the name property and the directory name. The below is an example of a file testing object that will match a file named `myDirectory`:
  ```
  {
    name: 'myDirectory',
  }
  ```
  - regular expression: A regular expression can be used to test one or many directories in a directory. The below example will match multiple directories with names starting with `scripts` and a single number after:
  ```
  {
    name: /scripts[1-9]\/,
  }
  ```
  - function: A function can be used for more verstitile directory name testing. The function is passed two arguments. An array object representing the current path where the 0th element is the parent folder and the last element is the starting directory. The second argument is the name of the directory being tested. The function should return a string that is the name of the directory that can be here. The below example will match a directory that has the same name as it's parent and ends with `scripts`.
  ```
  {
    name: (path, name) => return `${path[0]}-scripts`,
  }
  ````
- `config`: The config that should be used to test this directory. It should be structured the same as every other config objects. While you can nest config objects, in practice it's easier to maintain the config file when each config object is a seperate variable that is merely referenced in the required directory objects. The example config object above shows this
- `required`: A boolean indicating if the directory is required to exist.

### `ignore`
The ignore property is an array of testing objects to specify files and directories that should not be tested. The properties in this array can take three forms and is structured the same way as the name fields for files and directories. The example below shows the three forms:
```
{
  ignore: [
    'ignore-this-file.js',
    /ignoreMe[1-9]\.js/,
    (path) => `${path[0]}-ignore.js`,
  ]
}
```
