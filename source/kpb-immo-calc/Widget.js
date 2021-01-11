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
			featureLayers: null,


			startup: function () {
				this.inherited(arguments);
				this.featureLayers = this.collectFeatureLayersFromMap();

				// Testweises Ausgeben der Koeffizienten für STST (Standard) mit einem gemappten Daten-Array
				propMap = {
					"KOEFF": "value",
					"INTNAME": "id",
					"EXTNAME": "name"
				}

				this.convertCoeffLayerToDataArray("EFH", 2020, "STST", propMap, function (dataArray) {
					console.log("Koeffizienten für Standard:");
					// Ausgabe von Überschriften und Attributen mit Padding
					console.log("NAME".padStart(8, ' ') + " | " + "INTERNER NAME".padStart(13, ' ') + " | " + "KOEFFIZIENT".padStart(11, ' ') + " | ");
					for (const item of dataArray) {
						console.log(item.name.padStart(8, ' ') + " | " + item.id.padStart(13, ' ') + " | " + item.value.toString().padStart(11, ' ') + " | ");
					}
				})

				// var aFeatureLayer = new FeatureLayer("https://giscloud.gkdpb.de/geodienste/rest/services/open/KPB_Gebietsgrenzen/MapServer/2");
				// this.map.on('click', function (mouseEvent) {
				// 	var query = new esri.tasks.Query();
				// 	query.geometry = mouseEvent.mapPoint;
				// 	query.outFields = ["*"];

				// 	aFeatureLayer.queryFeatures(query, function (featureSet) {
				// 		test = featureSet.features[0].attributes;
				// 	});
				// });

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
			 * Auf Grundlage der konfigurierten Layernamen werden die Layer des Map-Objektes untersucht 
			 * und falls vorhanden die passenden zurück gegeben.
			 */
			collectFeatureLayersFromMap: function () {
				var featureLayers = {};

				for (const configLayerName in this.config.featureLayersFromMap) {

					// Das Konfig-Objekt enthält den Dienstnamen und die Layer-ID aus der REST-Schnittstelle
					var aLayerConfig = this.config.featureLayersFromMap[configLayerName];

					// Wir untersuchen nur die GraphicsLayer der Map, da nur diese FeatureLayer enthalten können.
					for (const graphicsLayerId of this.map.graphicsLayerIds) {
						var aGraphicsLayer = this.map.getLayer(graphicsLayerId);

						// Die ID aus dem GraphicsLayer besteht aus dem Dienstnamen ergänzt
						// um eine temporäre System-ID. Daher suchen wir hier mit "startWith".
						// Da im Dienst auch mehrere Layer enthalten sein können prüfen wir
						// zusätzlich auf die Layer-ID aus der REST-Schnittstelle.
						if (graphicsLayerId.startsWith(aLayerConfig.serviceName)
							&& aGraphicsLayer.layerId === aLayerConfig.layerId) {
							featureLayers[configLayerName] = aGraphicsLayer;
						}
					}

				}

				return featureLayers;
			},

			/**
			 * Die Koeffizienten für den Immobilien-Preis-Rechner werden per FeatureLayer bereitgestellt.
			 * In der Oberfläche werden Sie aber in Form von Daten-Objekten oder Arrays benötigt (z.B. als Auswahlliste für eine Combobox)
			 * Diese Methode soll helfen die Attribute aus dem FeatureLayer in ein Objekt-Array zu wandeln.
			 * 
			 * @param {*} subsegment 
			 * @param {*} year 
			 * @param {*} category 
			 * @param {*} propertyMapping 
			 * @param {*} callback 
			 */
			convertCoeffLayerToDataArray: function (subsegment, year, category, propertyMapping, callback) {
				var dataArray = new Array();

				var aQuery = new esri.tasks.Query();
				aQuery.where = "TEILMA = '" + subsegment + "'" + " AND JAHR = " + year + " AND KAT = '" + category + "'";
				aQuery.outFields = ["*"];
				this.featureLayers.IRW_IMMOCALC_KOEFFIZIENTEN.queryFeatures(aQuery, function (featureSet) {

					// Wir holen uns die Features in ein lokales Array, um sie nach Koeffizent sortieren zu können
					var arr = featureSet.features;
					arr.sort(function (a, b) { return a.attributes.KOEFF - b.attributes.KOEFF });

					for (const feature of arr) {
						var obj = {};
						obj[propertyMapping.EXTNAME] = feature.attributes.EXTNAME;
						obj[propertyMapping.INTNAME] = feature.attributes.INTNAME;
						obj[propertyMapping.KOEFF] = feature.attributes.KOEFF;
						dataArray.push(obj);
					}

					callback(dataArray);
				});
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