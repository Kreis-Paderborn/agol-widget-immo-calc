define([
	'dojo/_base/declare',
	"dojo/_base/lang",
	'jimu/BaseWidget'],
	function (
		declare,
		lang,
		BaseWidget
	) {
		return declare([BaseWidget], {

			baseClass: 'jimu-widget-widget-kpb-serach-listener',
			lastResult: null,

			startup: function () {
				this.inherited(arguments);

			},

			/**
			 * Hier wird auf Nachrichten anderer Widgets gelauscht.
			 * 
			 * @param {*} name 
			 * @param {*} widgetId 
			 * @param {*} data 
			 * @param {*} historyData 
			 */
			onReceiveData: function (name, widgetId, data, historyData) {

				// Wenn das Widget der Adresssuche (Widgetname ist "Search") ein Adressergebnis sendet,
				// merken wir uns dieses als letztes Ergebnis.
				if (name === "Search") {

					if (data.selectResult
						&& data.selectResult.result
						&& data.selectResult.result.feature
						&& data.selectResult.result.feature.attributes) {

						this.lastResult = data.selectResult.result.feature.attributes;
					}
				} 
				
				// Wenn unser Hauptwidget nach den Adressergebnissen fragt, senden wir diese zurück.
				// Wir fragen hier bewusst nicht den aktuellen Namen "kpb-immo-calc" ab, da sich der ändern kann.
				// Das Vorhandensein des Request-Objektes mit dem Inhalt "getSearchResults" ist Beseis genug, dass es sich
				// um unsere Abfrage aus dem Hauptwidget handelt.
				else if (data
					&& data.request
					&& data.request === "getSearchResults") {

					this.publishData({
						'searchResults': this.lastResult
					});
				}
			}



			// onOpen: function () {
			// },

			// onClose: function () {
			// },

			// onMinimize: function () {
			// },

			// onMaximize: function(){
			//   console.log('onMaximize');
			// },

			// onSignIn: function(credential){
			//   /* jshint unused:false*/
			//   console.log('onSignIn');
			// },

			// onSignOut: function(){
			//   console.log('onSignOut');
			// }

			// onPositionChange: function(){
			//   console.log('onPositionChange');
			// },

			// resize: function(){
			//   console.log('resize');
			// }

			//methods to communication between widgets:

		});
	});