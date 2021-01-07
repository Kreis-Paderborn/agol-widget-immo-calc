define([
	'dojo/_base/declare',
	"dojo/_base/lang",
	'jimu/BaseWidget',
	'esri/layers/FeatureLayer',
	'classes/ImmoCalcEngine',
	'classes/ImmoCalcView'
],
	function (
		declare,
		lang,
		BaseWidget,
		FeatureLayer,
		ImmoCalcEngine,
		ImmoCalcView
	) {

		//To create a widget, you need to derive from BaseWidget.
		return declare([BaseWidget], {
			// Custom widget code goes here

			baseClass: 'jimu-widget-widget-kpb-immo-calc',
			engine: null,
			view: null,


			startup: function () {
				this.inherited(arguments);

				var aFeatureLayer = new FeatureLayer("https://giscloud.gkdpb.de/geodienste/rest/services/open/KPB_Gebietsgrenzen/MapServer/2");
				this.map.on('click', function (mouseEvent) {
					var query = new esri.tasks.Query();
					query.geometry = mouseEvent.mapPoint;
					query.outFields = ["*"];

					aFeatureLayer.queryFeatures(query, function (featureSet) {
						alert(featureSet.features[0].attributes.GEMEINDE);
						test = featureSet.features[0].attributes;
						
					});
				});





				this.engine = new ImmoCalcEngine({ dummyOption: "Hello World!" });
				this.view = new ImmoCalcView(this.engine);

				// Definiere eine globale Variable, um festzustellen ob
				// der Anwender ein Gerät mit Touch benutzt. 
				// Achtung: der Wert kann frühestens nach der ersten Benutzerinteraktion
				// auf TRUE gesetzt sein.
				window.userIsTouching = false;
				window.addEventListener('touchstart', function onFirstTouch() {
					// we could use a class
					window.userIsTouching = true;

					// we only need to know once that a human touched the screen, so we can stop listening now
					window.removeEventListener('touchstart', onFirstTouch, false);
				}, false);

			},



			/**
			 * Wird beim Schließen des Panels aufgerufen.
			 * Entweder durch die Schaltfläche in der Toolbar
			 * oder durch das "X" in der Titelleiste des Panels selbst.
			 */
			onClose: function () {
				console.log('onClose');
			},

			onMinimize: function () {
				console.log('onMinimize');
			},

			onMaximize: function () {
				console.log('onMaximize');
			},

			onSignIn: function (credential) {
				/* jshint unused:false*/
				console.log('onSignIn');
			},

			onSignOut: function () {
				console.log('onSignOut');
			},

			onPositionChange: function () {
				console.log('onPositionChange');
			},

			resize: function () {
				console.log('resize');
			}

			//methods to communication between widgets:

		});
	});