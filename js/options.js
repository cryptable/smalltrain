
var optionsPage = {
	states: {
		FRESH: 0,
		INITIAlIZED: 1
	},
	pageState: 0,
	init: function() {
		if (pageState === FRESH) {
			// Assign object members to page parts
			this.saveButton = document.getElementById("save-button");
			this.cancelButton = document.getElementById("cancel-button");
			
			optionsPage.saveButton.addEventListener('click', optionsPage.save);
			optionsPage.cancelButton.addEventListener('click', init);
			optionsPage.customDomainsTextbox.addEventListener('input', markDirty);
			pageState = this.states.INISTIALIZED;
		}
		markClean();
	}
	initPage: function() {
		
	}
}
document.addEventListener('DOMContentLoaded', function () {
  optionsPage.initPage();
});