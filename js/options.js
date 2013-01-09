
var optionsPage = function() {
	var stationList = null;
	
	// Set variables to elements
	var consumerKey = document.getElementById("consumer-key");
	var startStation = document.getElementById("start-station");
	var endStation = document.getElementById("end-station");
	var saveButton = document.getElementById("save-button");
	var cancelButton = document.getElementById("cancel-button");

	// set actions to the buttons
	saveButton.addEventListener('click', function() {
		
	});
	cancelButton.addEventListener('click', function() {
		
	});
	document.getElementById("refresh-button").addEventListener('click', function() {
		Railtime.setConsumerSecret(consumerKey.value);
		Railtime.retrieveStationList(null, function(status, responseText) {
			if (status === 200) {
				stationList = JSON.parse(responseText);
				chrome.storage.local.set({ "smalltrain.stationlist" : stationList }, function() {
					return;
				});
			} else {
				alert("Retrieve stations DB failed");
			}
		});				
	});
	
	consumerKey.addEventListener("keyup", function () {
		chrome.storage.local.set({"smalltrain.consumerkey" : consumerKey.value}, function() {
			return;
		});
	});	
	

	// Private business processing
	var enableDisable = function() {
		if (consumerKey.value === "") {
			saveButton.disabled = true;
			cancelButton.disabled = true;
			startStation.disabled = true;
			endStation.disabled = true;
		}
		else {
			chrome.storage.local.get("smalltrain.stationlist", function (items) {
				if (items["smalltrain.stationlist"] === undefined) {
					saveButton.disabled = true;
					cancelButton.disabled = true;
					startStation.disabled = true;
					endStation.disabled = true;
				}
				else {
					saveButton.disabled = false;
					cancelButton.disabled = false;
					startStation.disabled = false;
					endStation.disabled = false;					
				}
			});				
		}
	};
	
	var readConfig = function () {
		chrome.storage.local.get("smalltrain.consumerkey", function (items) {
			if (items["smalltrain.consumerkey"] !== undefined){
				consumerKey.value = items["smalltrain.consumerkey"]; 				
			}
			else {
				consumerKey.value = "";
			} 				
		});		
		chrome.storage.local.get("smalltrain.stationlist", function (items) {
			if (items["smalltrain.stationlist"] !== undefined) {
				stationList = items["smalltrain.stationlist"]; 				
			}
			else {
				stationList = null;
			} 				
		});		
	};
	
	// optionsPage.customDomainsTextbox.addEventListener('input', markDirty);
	return {
		initPage: function() {
			readConfig();
			enableDisable();		
		}
	};
}();

document.addEventListener('DOMContentLoaded', function () {
  optionsPage.initPage();
});