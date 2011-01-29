# jQuery Drag and Drop

* [Website](http://https://github.com/jpsullivan/jQuery-drag-and-drop/)
* [Bugtracker & feature requests](https://github.com/jpsullivan/jQuery-drag-and-drop/issues)
* Version: 1.0.0-beta1

## Description

This plugin was created to duplicate the functionality of GMail's drag-and-drop attachment support.  Once your dropzone is defined, simply drag your file(s) to that area and watch the plugin do its magic.

## Usage

    $('selector').filedrop({
        url: 'upload.php',
        error: function(err, file) {
            switch(err) {
                case 'BrowserNotSupported':
                    alert("Sorry! Your browser doesn't support drag and drop.");
                    break;
                case 'TooManyFiles':
                    alert("Sorry! You're trying to upload too many files  at once.");
                    break;
            }
            $('selector').addClass('dropzone').removeClass('dropzone-active');
        },
        dragOver: function() {
            $('selector').removeClass('dropzone').addClass('dropzone-active');
        },
        dragLeave: function() {
            $('selector').addClass('dropzone').removeClass('dropzone-active');
        },
        drop: function() {
            // Hide or show any elements while the file is being uploaded
        },
        uploadStarted: function(index, file, files_count, files_size) {
            CatalogManager.totalBytes = files_size;
        },
        uploadFinished: function(i, file, response) {
            // Completed events
        },
        progressUpdated: function(i, file, bytesLoaded) {
            var percent = Math.round(100*((bytesLoaded+CatalogManager.completedBytes)/CatalogManager.totalBytes));

            if(percent >= 100) {
                percent = 100;
                setTimeout("$('#processing').html('Processing... this may take a minute.').fadeIn();", 2000);
            }

            return percent;
        },
        afterAll: function() {
            // Often times people will have a progress bar which is set to 100% here
        }
    });

## Development Team / Contact Info

* Josh Sullivan - Lead Developer ([https://github.com/jpsullivan](https://github.com/jpsullivan))

## Requirements

This plugin has two dependencies, which should most likely be used in your webapp regardless.

* jQuery 1.4.4+
* [Modernizr.js](http://www.modernizr.com)

## Roadmap

This plugin will eventually be expanded on to show some demo's, tips, and legacy (fallback) support for browsers that do not yet support features such as drag-and-drop (I'm looking at your IE..)
