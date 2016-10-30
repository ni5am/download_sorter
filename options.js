function Rule(data) {
	var rules = $('#rules > tbody');
	this.node = $('#rule-template').clone();
	this.node.removeAttr('id');
	this.node.attr('class', 'rule');
	Rule.next_id++;
	this.node.find('.number').html(Rule.next_id);
	rules.append(this.node);

	if (data) {
		this.node.find('.number').text(Rule.next_id);
		this.node.find('.extension').val(data.extension);
		this.node.find('.foldername').val(data.foldername);
	}
	
	this.node.find('.extension').on('keyup', function(){
		storeRules();
	});
	
	this.node.find('.foldername').on('keyup', function(){
		storeRules();
	});

	this.node.find('.remove').on('click', function(){
		_this = $(this).parent().parent()
		
		_this.nextAll().find('.number').each(function(index, element) {
			number = $(element).text();
			number--;
			$(element).text(number);
		});
		_this.remove();
		Rule.next_id--;
		storeRules();
	});
	
	storeRules();
}

Rule.next_id = 0;

function loadRules() {

	var rules = localStorage.rules;
	try {
		JSON.parse(rules).forEach(function(rule) {
			new Rule(rule);
		});
	} catch (e) {
		//localStorage.rules = JSON.stringify([]);
	}
}

function storeRules() {
	var array = [];
	
	$('.rule').each(function(index, element) {
		array.push({
			extension : $(element).find('.extension').val(),
			foldername : $(element).find('.foldername').val()
		});
	});

	localStorage.rules = JSON.stringify(array);

	chrome.storage.sync.set({'rules': JSON.stringify(array)});

}

function init(){
	$('#defaultFolder').val(localStorage.defaultFolder);

	$('#defaultFolder').on('keyup', function(){

		localStorage.defaultFolder = $('#defaultFolder').val();
		chrome.storage.sync.set({'defaultFolder': $('#defaultFolder').val() });
	});
	
	$('#new').on('click', function() {
		new Rule();
	});
	
	loadRules();
}

window.onload = function() {
	init();
};

