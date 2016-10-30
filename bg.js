chrome.storage.onChanged.addListener(function (changes, areaName) {
	for (key in changes) {
		var storageChange = changes[key];
		if(key == "defaultFolder") {
			localStorage.defaultFolder = storageChange.newValue;
		}else {
			localStorage.rules = storageChange.newValue;
		}
	}
});

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){

		chrome.storage.sync.get('defaultFolder', function (items) {
			if(typeof items.defaultFolder == 'undefined') {
				localStorage.defaultFolder = "default";
				chrome.storage.sync.set({'defaultFolder': "default" });

			}else {
				localStorage.defaultFolder = items.defaultFolder;
			}
		});
		chrome.storage.sync.get('rules', function (items) {
			if(typeof items.rules == 'undefined') {
				localStorage.rules = JSON.stringify([{"extension":"jpg,jpeg,gif,png","foldername":"images"},{"extension":"zip,z7,tar,gz","foldername":"compression"},{"extension":"exe","foldername":"exe"},{"extension":"pdf,hwp,doc,docx","foldername":"document"},{"extension":"z*","foldername":"z_start_all_file"}]);
				chrome.storage.sync.set({'rules': JSON.stringify([{"extension":"jpg,jpeg,gif,png","foldername":"images"},{"extension":"zip,z7,tar,gz","foldername":"compression"},{"extension":"exe","foldername":"exe"},{"extension":"pdf,hwp,doc,docx","foldername":"document"},{"extension":"z*","foldername":"z_start_all_file"}]) });
			}else {
				localStorage.rules = items.rules;
			}
			chrome.tabs.create({url: "options.html"});
		});

    }else if(details.reason == "update"){

		chrome.storage.sync.get('defaultFolder', function (items) {
			if(typeof items.defaultFolder == 'undefined') {
				chrome.storage.sync.set({'defaultFolder': localStorage.defaultFolder});
			}else {
				localStorage.defaultFolder = items.defaultFolder;
			}
		});
		chrome.storage.sync.get('rules', function (items) {
			if(typeof items.rules == 'undefined') {
				chrome.storage.sync.set({'rules': localStorage.rules});
			}else {
				localStorage.rules = items.rules;
			}
			chrome.tabs.create({url: "options.html"});
		});
    }
});

function matches(extension, filename) {
	if(extension == ""){
		return false;
	}
	
	index = -1;
	index = filename.lastIndexOf('.');
	
	if(index != -1){
		type = filename.substring(index+1, filename.len);
	}

	extensionLower = extension.toLowerCase();
	extensionLower = extensionLower.replace(/ /gi, '');

	if(extensionLower.indexOf("*") != -1 || extensionLower.indexOf("|") != -1 || extensionLower.indexOf(",") != -1) {

		extensionLower = extensionLower.replace(/,/gi, '|');

		extensionSplit = extensionLower.split('|');

		temp = "";
		index = 0;
		extensionSplit.forEach(function(element) {
			if(index != 0)
				temp += "|^" + element + "$";
			else
				temp += "^" + element + "$";
			index++;
		});

		extensionLower = temp;

		extensionLower = extensionLower.replace(/\*/gi, "[a-z0-9]*");

		var pattern = new RegExp(extensionLower);

		if(pattern.test(type.toLowerCase())) {
			return true;
		}
	}

	if(type.toLowerCase() == extensionLower) {
		return true;
	}
	
	return false;
}

chrome.downloads.onDeterminingFilename.addListener(function(item, __suggest) {
		
	function suggest(filename, foldername) {
		__suggest({
			filename : foldername + "/" + filename
		});
	}


	var rules = localStorage.rules;

	try {
		rules = JSON.parse(rules);
	} catch (e) {
		localStorage.rules = JSON.stringify([]);
	}

	var found = false;
	for ( var index = 0; index < rules.length; ++index) {
		var rule = rules[index];
		if (matches(rule.extension, item.filename)) {
			suggest(item.filename, rule.foldername);
			found = true;
			break;
		}
	}

	if(!found){
		suggest(item.filename, localStorage.defaultFolder);
	}

});
