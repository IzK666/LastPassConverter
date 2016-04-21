var array = new Array();

document.getElementById('file').addEventListener('change', function() {
	var file = this.files[0];
	var input = document.getElementById("input");
	input.value = "Name: "+file.name;
	var reader = new FileReader();
	reader.onload = function(e) {
		var content = e.target.result;
		input.value = content;
		conversion();
	};
	reader.readAsText(file, "ISO-8859-1");
}, false);

document.getElementById('Clear').addEventListener('click', function() {
	document.getElementById("input").value = "";
	conversion();
}, false);

document.getElementById('input').addEventListener('change', function() {
conversion();
}, false);

function conversion() {
	var input = document.getElementById("input");
	var output = document.getElementById("output");
	var content = input.value;
	output.value = "";

	var morelines = 0;

	var index = -1; // number of passwords converted
	var field = 0; // To know the current field (url, user, pass...)
	var start = 0; // Position of first character for current field
	var find = "";

	var lines = content.replace("\r\n", "\n").split("\n");

	if (lines[0] != "url,username,password,extra,name,grouping,fav") {
		output.value = "Not a Lastpass file";
		output.value+=lines[0];
	} else {
		output.value += '"url","username","password","extra","name","grouping","fav"' + "\n";
		//output.value += lines[0] + "\n";

		for (j=1; j < lines.length; j++) {

			if (field == 0 || field > 6) {
				if (lines[j].trim() == "")
					continue;
				index++;
				field = parser(lines[j], array[index] = new Array(), "", 0);

			} else { // Multiline
				field--;
				array[index][field] += "\n";
				field = parser(lines[j], array[index], find, field);
			}

		}
	}
	for (i = 0; i < index; i++) {
		if (array[i].length == 7)
			for (k = 0; k < array[i].length-1; k++) {
				output.value += '"' + array[i][k] + '",';
			}
			output.value += '"' + array[i][array[i].length-1] + '"\n';
	}
}	

document.getElementById('Download').addEventListener('click', function() {
	download(array);
}, false);

function parser (line, value, find, field) {
	var start = 0;
	if (find == "") {
		if (line[0] == '"') {
			var find = '"';
			start++;
		} else {
			var find = ",";
		}
	}
	for (i = start; i < line.length; i++) {
		if (find == "") {
			if (line[i] == '"') {
				find = '"';
				start += 1;
			} else if (line[i] == ",") {
				value[field] = "";
				field++;
				start++;
			} else {				
				find = ",";
			}
		} else {
			if (line[i] == find) {
				if (find == '"') {
					if (line[i+1] == find) {
						i++;
						continue;
					}
						setValue(value, field, escapeValue(line.substring(start, i)));
					start = i + 1;
				} else {
					setValue(value, field, escapeValue(line.substring(start, i)));
					start = i;
				}
				field++;
				find = "";
				i = start++;
			}
		}
	}
	setValue(value, field++, escapeValue(line.substring(start, line.length)));
	return field;
}

function setValue (array, index, value) {
	if (array[index])
		array[index] += value;
	else
		array[index] = value;
}

function escapeValue (value) {
	return value.replace(/\\/g, "\\\\").replace(/""/g, '\\"');
}

function download(array) {
	var i, k;
	var text = "\"url\",\"username\",\"password\",\"extra\",\"name\",\"group\",\"fav\"\r\n";
	for (i = 0; i < array.length; i++) {
		if (array[i].length == 7)
			for (k = 0; k < array[i].length-1; k++) {
				text += '"' + array[i][k] + '",';
			}
			text += '"' + array[i][array[i].length-1] + '"\r\n';
	}

	var textFileAsBlob = new Blob([text], {type:'text/plain'}); 

	var fileNameToSaveAs = 'output.csv';

	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs; 
	downloadLink.innerHTML = "Download File";
				
	if (window.webkitURL != null) {
		// Chrome allows the link to be clicked
		// without actually adding it to the DOM.
		downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
	} else {
		// Firefox requires the link to be added to the DOM
		// before it can be clicked.
		downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
//		downloadLink.onclick = destroyClickedElement;
		downloadLink.style.display = "none";
		document.body.appendChild(downloadLink);
	}

	downloadLink.click();
	downloadLink = '';
}
