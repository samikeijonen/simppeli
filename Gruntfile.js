module.exports = function(grunt) {

// Load multiple grunt tasks using globbing patterns
require('load-grunt-tasks')(grunt);

// Project configuration.
grunt.initConfig({
  pkg: grunt.file.readJSON('package.json'),

    makepot: {
      target: {
        options: {
          domainPath: '/languages/',     // Where to save the POT file.
          exclude: ['build/.*'],         // Exlude build folder.
          potFilename: 'simppeli.pot',   // Name of the POT file.
          type: 'wp-theme',              // Type of project (wp-plugin or wp-theme).
          updateTimestamp: true,         // Whether the POT-Creation-Date should be updated without other changes.
          processPot: function( pot, options ) {
            pot.headers['report-msgid-bugs-to'] = 'https://foxland.fi/contact/';
			pot.headers['language'] = 'en_US';
            return pot;
          }
        }
      }
    },
	
	// Transife setup
	exec: {
		txpull: { // Pull Transifex translation - grunt exec:txpull
			cmd: 'tx pull -a --minimum-perc=80' // Change the percentage with --minimum-perc=yourvalue
		},
		txpush_s: { // Push pot to Transifex - grunt exec:txpush_s
			cmd: 'tx push -s'
		},
    },

	dirs: {
		lang: 'languages',
	},
	
	// .po to .mo
	potomo: {
		dist: {
			options: {
				poDel: false
			},
			files: [{
				expand: true,
				cwd: '<%= dirs.lang %>',
				src: ['*.po'],
				dest: '<%= dirs.lang %>',
				ext: '.mo',
				nonull: true
			}]
		}
	},

	// Right to left styles
	rtlcss: {
		options: {
			// rtlcss options  
			config:{
				swapLeftRightInUrl: false,
				swapLtrRtlInUrl: false,
				autoRename: false,
				preserveDirectives: true,
				stringMap: [
					{
						name: 'import-rtl-stylesheet',
						search: [ '.css' ],
						replace: [ '-rtltest.css' ],
						options: {
							scope: 'url',
							ignoreCase: false
						}
					}
				]
			},
			// extend rtlcss rules
			//rules:[],
			// extend rtlcss declarations
			//declarations:[],
			// extend rtlcss properties
			//properties:[],
			// generate source maps
			//map: false,
			// save unmodified files
			saveUnmodified: true,
		},
		theme: {
			expand : true,
			//cwd    : '/',
			//dest   : '/',
			ext    : '-rtl.css',
			src    : [
				'style.css'
			]
		}
	},
	
	// Minify files
	uglify: {
		settigns: {
			files: {
				'js/customizer.min.js': ['js/customizer.js'],
				'js/skip-link-focus-fix.min.js': ['js/skip-link-focus-fix.js']
			}
		}
	},
	
	// Minify css
	cssmin : {
		css: {
			src: 'style.css',
			dest: 'style.min.css'
		}
	},

    // Clean up build directory
    clean: {
      main: ['build/<%= pkg.name %>']
    },

    // Copy the theme into the build directory
    copy: {
      main: {
        src:  [
          '**',
          '!node_modules/**',
          '!build/**',
          '!.git/**',
          '!Gruntfile.js',
          '!package.json',
          '!.gitignore',
          '!.gitmodules',
          '!.tx/**',
          '!**/Gruntfile.js',
          '!**/package.json',
          '!**/*~',
		  '!style-rtl.css',
		  '!tx.exe'
        ],
        dest: 'build/<%= pkg.name %>/'
      }
    },
	
	// Replace text
	replace: {
		styleVersion: {
			src: [
				'style.css',
			],
			overwrite: true,
			replacements: [ {
				from: /^.*Version:.*$/m,
				to: 'Version: <%= pkg.version %>'
			} ]
		},
		functionsVersion: {
			src: [
				'functions.php'
			],
			overwrite: true,
			replacements: [ {
				from: /^define\( 'SIMPPELI_VERSION'.*$/m,
				to: 'define( \'SIMPPELI_VERSION\', \'<%= pkg.version %>\' );'
			} ]
		}
	},

    // Compress build directory into <name>.zip and <name>-<version>.zip
    compress: {
      main: {
        options: {
          mode: 'zip',
          archive: './build/<%= pkg.name %>_v<%= pkg.version %>.zip'
        },
        expand: true,
        cwd: 'build/<%= pkg.name %>/',
        src: ['**/*'],
        dest: '<%= pkg.name %>/'
      }
    },

});

// Default task.
grunt.registerTask( 'default', [ 'makepot', 'rtlcss', 'uglify', 'cssmin' ] );

// Makepot and push it on Transifex task(s).
grunt.registerTask( 'makandpush', [ 'makepot', 'exec:txpush_s' ] );

// Pull from Transifex and create .mo task(s).
grunt.registerTask( 'tx', [ 'exec:txpull', 'potomo' ] );

// Build task(s).
grunt.registerTask( 'build', [ 'clean', 'replace:styleVersion', 'replace:functionsVersion', 'copy', 'compress' ] );

};