/**
 * @author david
 */
describe("Railtime functions", function() {
	var flag;
	var result = {
		status: 0,
		responseText: ""
	};

	it("Test RetrieveConfig", function() {
		flag = false;

		runs(function () {
			
			railtime.setConsumerSecret(specsConfig.consumerSecret);
		
			railtime.retrieveConfig(function(status, responseText) { 
				result.status = status;
				result.responseText = responseText;
				console.log("Callback called");
				flag = true;
			});
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message of RetrieveConfig is received" , 1000);

		runs(function() {
			expect(result.status).toMatch(200);			
			expect(result.responseText).toMatch("DataValidityDate");			
		});
	});

	it("Test RetrieveStatus", function() {
		flag = false;

		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);
		
			railtime.retrieveStatus(function(status, responseText) { 
				result.status = status;
				result.responseText = responseText;
				console.log("Callback called");
				flag = true;
			});
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveStatus received" , 1000);

		runs(function() {
			expect(result.status).toMatch(200);			
			expect(result.responseText).toMatch("ApplicationEnabled");			
		});
	});

	it("Test RetrieveStationSchedule with all parameters", function() {
		flag = false;

		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);

			beginDate = new Date();
			/* Interval of 180 minutes = 3 hours */
			endDate = new Date(beginDate.getTime() + 180*60000);
			railtime.retrieveStationSchedule(
				6,
				beginDate,
				endDate,
				1,
				15,
				function(status, responseText) { 
					result.status = status;
					result.responseText = responseText;
					console.log("Callback called");
					flag = true;
				}
			);
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveStationSchedule received" , 3000);

		runs(function() {
			expect(result.status).toMatch(200);			
			expect(result.responseText).toMatch("Trains");			
		});
	});
	
	it("Test RetrieveStationList without LastUpdateDate", function() {
		flag = false;

		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);
		
			railtime.retrieveStationList(null, function(status, responseText) { 
				result.status = status;
				result.responseText = responseText;
				console.log("Callback called");
				flag = true;
			});
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveStationList received" , 4000);

		runs(function() {
			expect(result.status).toMatch(200);			
			expect(result.responseText).toMatch("Aliases");			
		});
	});

	it("Test RetrieveStationList with LastUpdateDate", function() {
		var flag = false;
		var lastUpdateDate = new Date((new Date()).getTime() - 604800000); // minus a week
		
		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);
		
			railtime.retrieveStationList(lastUpdateDate, function(status, responseText) { 
				result.status = status;
				result.responseText = responseText;
				console.log("Callback called");
				flag = true;
			});
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveStationList received" , 4000);

		runs(function() {
			expect(result.status).toMatch(200);			
			expect(result.responseText).toMatch("Aliases");			
		});
	});
	
	it("Test RetrieveInfoMessagesForSmartPhone", function() {
		var flag = false;
		
		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);
		
			railtime.retrieveInfoMessagesForSmartPhone(function(status, responseText) { 
				result.status = status;
				result.responseText = responseText;
				console.log("Callback called");
				flag = true;
			});
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveInfoMessagesForSmartPhone received" , 4000);

		runs(function() {
			expect(result.status).toMatch(200);	
		});
	});
	
	it("Test RetrieveRoutes with all parameters", function() {
		var flag = false;
		var toDay = new Date();

		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);

			railtime.retrieveRoutes(
				220,					/* Brussel-Zuid */
				715,					/* Leuven */
				toDay,
				1,
				1000,
				0,
				3,
				function(status, responseText) { 
					result.status = status;
					result.responseText = responseText;
					console.log("Callback called");
					flag = true;
				}
			);
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveRoutes received" , 3000);

		runs(function() {
			expect(result.status).toMatch(200);
		});
	});

	it("Test RetrieveTrainSchedule with all parameters", function() {
		var flag = false;
		var toDay = new Date();

		runs(function () {
			
			railtime.setConsumerKey(specsConfig.consumerKey);
			railtime.setConsumerSecret(specsConfig.consumerSecret);

			railtime.retrieveTrainSchedule(
				2922,					
				toDay,
				1,
				function(status, responseText) { 
					result.status = status;
					result.responseText = responseText;
					console.log("Callback called");
					flag = true;
				}
			);
		
		});
		
		waitsFor(function() {
			return flag;
		}, "The message is RetrieveTrainSchedule received" , 3000);

		runs(function() {
			expect(result.status).toMatch(200);
		});
	});
});
