define([
	'dojo/_base/declare',
	"dojo/_base/lang",
	'dojo/store/Memory',
	'jimu/BaseWidget',
	'esri/layers/FeatureLayer',
	'./classes/ImmoCalcEngine',
	'./classes/ImmoCalcView',
	'dijit/layout/TabContainer',
	'dijit/layout/ContentPane'
],
	function (
		declare,
		lang,
		Memory,
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

				// var aFeatureLayer = new FeatureLayer("https://giscloud.gkdpb.de/geodienste/rest/services/open/KPB_Gebietsgrenzen/MapServer/2");
				// this.map.on('click', function (mouseEvent) {
				// 	var query = new esri.tasks.Query();
				// 	query.geometry = mouseEvent.mapPoint;
				// 	query.outFields = ["*"];

				// 	aFeatureLayer.queryFeatures(query, function (featureSet) {
				// 		test = featureSet.features[0].attributes;
				// 	});
				// });

				this.engine = new ImmoCalcEngine({});
				this.view = new ImmoCalcView(this.engine);

				this.readDefinitionsFromFeatureLayers();

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


			readDefinitionsFromFeatureLayers: function () {

				this.readExternalFieldnames();

				this.readDisplayNames(
					this.readCoefficientsHandler(
						this.readZonesHandler(
							this.readyHandler()
						)
					)
				);

			},

			readExternalFieldnames: function () {
				var extFieldArray = new Array();

				for (const field of this.featureLayers.IRW_ZONEN.fields) {
					var obj = {};
					obj["name"] = field.name;
					obj["alias"] = field.alias;
					extFieldArray.push(obj);
				}

				this.engine.setExternalFieldNames(extFieldArray);
			},


			readDisplayNames: function (callback) {
				var displayNameArray = new Array();
				var aQuery = new esri.tasks.Query();
				var aAnzeigeFeatureLayer = this.featureLayers.IRW_ANZEIGEWERTE;
				var me = this;

				// Frage die Anzeigenamen für "category" ab
				aQuery.where = "VERWENDET = 'ja'";
				aQuery.outFields = ["*"];
				if (aAnzeigeFeatureLayer !== undefined) {
					aAnzeigeFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							var obj = {};
							obj["EIGN_BORIS"] = feature.attributes.EIGN_BORIS;
							obj["WERT_BORIS"] = feature.attributes.WERT_BORIS;
							obj["TXT_REAL"] = feature.attributes.TXT_REAL;
							displayNameArray.push(obj);
						}
						me.engine.setDisplayNames(displayNameArray);
						callback();
					})
				}
			},


			readCoefficients: function (callback) {
				var coeffArray = new Array();
				var aQuery = new esri.tasks.Query();
				var aKoeffFeatureLayer = this.featureLayers.IRW_IMMOCALC_KOEFFIZIENTEN;
				var me = this;

				// Frage alle Koeffizienten ab
				aQuery.where = "GASL is not null";
				aQuery.outFields = ["*"];
				if (aKoeffFeatureLayer !== undefined) {
					aKoeffFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							var obj = {};
							obj["WERT_AKS"] = feature.attributes.WERT_AKS;
							obj["EIGN_AKS"] = feature.attributes.EIGN_AKS;
							obj["WERT_BORIS"] = feature.attributes.WERT_BORIS;
							obj["EIGN_BORIS"] = feature.attributes.EIGN_BORIS;
							obj["KOEFF"] = feature.attributes.KOEFF;
							obj["GASL"] = feature.attributes.GASL;
							obj["IRWTYP"] = feature.attributes.IRWTYP;
							obj["TEILMA"] = feature.attributes.TEILMA;
							obj["STAG"] = me.engine.convertDate(feature.attributes.STAG);
							obj["STEUERELEM"] = feature.attributes.STEUERELEM;
							obj["NUMZ"] = feature.attributes.NUMZ;
							coeffArray.push(obj);
						}

						me.engine.coefficients = coeffArray;
						callback();

					})
				}
			},
			readCoefficientsHandler: function (callback) {
				me = this;
				return function () { me.readCoefficients(callback) }
			},


			readZones: function (callback) {
				var zonesArray = new Array();
				var aQuery = new esri.tasks.Query();
				var aZonesLayer = this.featureLayers.IRW_ZONEN;
				var me = this;

				// Wir bestimmen hier den Feldnamne für die Where-Abfrage
				// dynamisch, da dieser an dem Klassennamen hängt, der sich 
				// ändern kann.
				var whereFieldName;
				for (const field of aZonesLayer.fields) {
					if(field.name.endsWith("TEILMA")) {
						whereFieldName = field.name;
						break;
					}
				}

				// Frage alle Koeffizienten ab
				aQuery.where = whereFieldName + " is not null";
				aQuery.outFields = ["*"];
				if (aZonesLayer !== undefined) {
					aZonesLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							zonesArray.push(feature.attributes);
						}

						me.engine.setZones(zonesArray);
						callback();

					})
				}
			},
			readZonesHandler: function (callback) {
				me = this;
				return function () { me.readZones(callback) }
			},

			ready: function () {
				console.log("Fertig!");
				gEngine = this.engine;

				this.view.initialiseHeader();

				this.view.showTable(
					"01.01.2021", 		   // Stichtag
					2,  			       // Teilmarkt
					"Altenbeken",          // Zone
					true                   // Steuerelemente auf Norm?
				)
			},
			readyHandler: function () {
				me = this;
				return function () { me.ready() }
			},


			


			// onReceiveData: function (name, widgetId, data, historyData) {

			// 	if (name === "Search"
			// 		&& data.selectResult
			// 		&& data.selectResult.result
			// 		&& data.selectResult.result.name) {
			// 		console.log(data.selectResult.result.name);
			// 		console.log(data.selectResult.result.feature.geometry);
			// 	}
			// },


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
