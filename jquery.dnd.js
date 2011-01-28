(function($){
	var opts = {},
		default_opts = {
			url: '',
			refresh: 1000,
			paramname: 'userfile',
			maxfiles: 1,
			maxfilesize: 10, // MBs
			data: {},
			drop: empty,
			dragEnter: empty,
			dragOver: empty,
			dragLeave: empty,
			docEnter: empty,
			docOver: empty,
			docLeave: empty,
			beforeEach: empty,
			afterAll: empty,
			rename: empty,
			error: function(err, file){ alert(err); },
			uploadStarted: empty,
			uploadFinished: empty,
			progressUpdated: empty,
			speedUpdated: empty
		},
		errors = ["BrowserNotSupported", "TooManyFiles", "FileTooLarge"],
		doc_leave_timer,
		stop_loop = false,
		files_count = 0,
		files_size = 0,
		files;

	$.fn.filedrop = function(options) {
		opts = $.extend( {}, default_opts, options );

        if(Modernizr.draganddrop) {
            this.get(0).addEventListener("drop", drop, true);
            this.bind('dragenter', dragEnter).bind('dragover', dragOver).bind('dragleave', dragLeave);

            document.addEventListener("drop", docDrop, true);
            $(document).bind('dragenter', docEnter).bind('dragover', docOver).bind('dragleave', docLeave);
        }
	};

	function drop(e) {
		e.preventDefault();
		opts.drop(e);

		var dt = e.dataTransfer;
        files = dt.files;
        files_count = files.length;

        var i;
		for(i = 0; i < files_count; i++) {
			files_size += files[i].size;
		}

		upload();

		return false;
	}

	function progress(e) {
		if (e.lengthComputable) {
			var percentage = Math.round((e.loaded * 100) / e.total);
			if (this.currentProgress !== percentage) {

				this.currentProgress = percentage;
				opts.progressUpdated(this.index, this.file, e.loaded);

				var elapsed = new Date().getTime(),
				    diffTime = elapsed - this.currentStart;

				if (diffTime >= opts.refresh) {
					var diffData = e.loaded - this.startData,
					    speed = diffData / diffTime; // KB per second

					opts.speedUpdated(this.index, this.file, speed);
					this.startData = e.loaded;
					this.currentStart = elapsed;
				}
			}
		}
	}

	function upload() {
		stop_loop = false;
		if (!files) {
			opts.error(errors[0]);
			return false;
		}
		var filesDone = 0,
			filesRejected = 0;

		if (files_count > opts.maxfiles) {
		    opts.error(errors[1]);
		    return false;
		}

        var i;
		for (i = 0; i < files_count; i++) {
			if (stop_loop) return false;
			try {
				if (beforeEach(files[i]) != false) {
					if (i === files_count) return;

					var reader        = new FileReader(),
					    max_file_size = 1048576 * opts.maxfilesize;

					reader.index = i;

					if (files[i].size > max_file_size) {
						opts.error(errors[2], files[i]);
						return false;
					}

					if(typeof(FileReader.prototype.addEventListener) === "function") {
						reader.addEventListener("loadend", send, false);
					} else {
						reader.onload = send;
					}

					reader.readAsBinaryString(files[i]);
				} else {
					filesRejected++;
				}
			} catch(err) {
				opts.error(errors[0]);
				return false;
			}
		}

		function send(e) {
			// Sometimes the index is not attached to the
			// event object. Find it by size. Hack for sure.
			if (e.target.index == undefined) {
				e.target.index = getIndexBySize(e.total);
			}

			var xhr = new XMLHttpRequest(),
				upload = xhr.upload,
				file = files[e.target.index],
				index = e.target.index,
				start_time = new Date().getTime();

			upload.index = index;
			upload.file = file;
			upload.downloadStartTime = start_time;
			upload.currentStart = start_time;
			upload.currentProgress = 0;
			upload.startData = 0;
			upload.addEventListener("progress", progress, false);

			xhr.open("POST", opts.url+'&name='+file.name, true);
			xhr.setRequestHeader('UP-FILENAME', file.name);
			xhr.setRequestHeader('UP-SIZE', file.size);
			xhr.setRequestHeader('UP-TYPE', file.type);
			xhr.send(window.btoa(e.target.result));

			opts.uploadStarted(index, file, files_count, files_size);

			if(Modernizr.draganddrop) {
				xhr.onreadystatechange = function() {
					if(xhr.readyState >=3) {
						var result = opts.uploadFinished(index, file, xhr.responseText);

						filesDone++;

						if (filesDone == files_count - filesRejected) {
							afterAll();
						}

						if (result === false) stop_loop = true;
					}
				};
			} else {
				xhr.onload = function() {
					if(xhr.readyState >=3) {
						var result = opts.uploadFinished(index, file, xhr.responseText);

						filesDone++;

						if (filesDone == files_count - filesRejected) {
							afterAll();
						}

						if (result === false) stop_loop = true;
					}
				};
			}
		}
	}

	function getIndexBySize(size) {
		for (var i=0; i < filesCount; i++) {
			if (files[i].size == size) {
				return i;
			}
		}

		return undefined;
	}

	function rename(name) {
		return opts.rename(name);
	}

	function beforeEach(file) {
		return opts.beforeEach(file);
	}

	function afterAll() {
		return opts.afterAll();
	}

	function dragEnter(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.dragEnter(e);
	}

	function dragOver(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docOver(e);
		opts.dragOver(e);
	}

	function dragLeave(e) {
		clearTimeout(doc_leave_timer);
		opts.dragLeave(e);
		e.stopPropagation();
	}

	function docDrop(e) {
		e.preventDefault();
		opts.docLeave(e);
		return false;
	}

	function docEnter(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docEnter(e);
		return false;
	}

	function docOver(e) {
		clearTimeout(doc_leave_timer);
		e.preventDefault();
		opts.docOver(e);
		return false;
	}

	function docLeave(e) {
		doc_leave_timer = setTimeout(function(){
			opts.docLeave(e);
		}, 200);
	}

	function empty(){}

})(jQuery);