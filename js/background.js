/*
 * This is the background JavaScript file
 * It should make a copy of the station database into a local storage
 */

/* Small train object */
var smallTrain = {
	isConfigured: false,
	
	// Initialize the extension
	onInit : function() {
		
	},
	
	// Perform the correct action when an Alarm is inistiated
	onAlarm: function() {
		if (isConfigured) {
			requestTrains();
		}
	}
}

/* Install the event listeners */
chrome.runtime.onInstalled.addListener(smallTrain.onInit);
chrome.alarms.onAlarm.addListener(smallTrain.onAlarm);
