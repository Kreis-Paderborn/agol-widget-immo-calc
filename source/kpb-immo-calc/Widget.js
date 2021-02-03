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

				// Testweises Ausgeben der Koeffizienten für STST (Standard) mit einem gemappten Daten-Array
				propMap = {
					"KOEFF": "value",
					"INTNAME": "id",
					"EXTNAME": "name"
				}

				this.convertCoeffLayerToDataArray(2, "GSTAND", propMap, function (dataArray) {
					console.log("Koeffizienten für Standard:");
					// Ausgabe von Überschriften und Attributen mit Padding
					console.log("NAME".padStart(12, ' ') + " | " + "INTERNER NAME".padStart(13, ' ') + " | " + "KOEFFIZIENT".padStart(11, ' ') + " | ");
					for (const item of dataArray) {
						console.log(item.name.padStart(12, ' ') + " | " + item.id.padStart(13, ' ') + " | " + item.value.toFixed(7).padStart(11, ' ') + " | ");
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

				this.engine = new ImmoCalcEngine({ dummyOption: "Hello World!", myWidget: this });
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
						this.readyHandler()
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

				this.engine.externalFields = extFieldArray;
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
						me.engine.displayNames = displayNameArray;
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
							obj["STAG"] = me.convertDate(feature.attributes.STAG);
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

			ready: function () {
				console.log("Fertig!");
				gEngine = this.engine;

				this.view.showTable(
					"01.01.2021", 		   // Stichtag
					"Eigentumswohnungen",  // Teilmarkt
					"Altenbeken",          // Zone
					true                   // Steuerelemente auf Norm?
				)
			},
			readyHandler: function () {
				me = this;
				return function () { me.ready() }
			},


			convertDate: function (DateInMilliseconds) {
				var date = new Date(DateInMilliseconds);
				var returnStr = "";

				var day = date.getDate();
				returnStr += day.toString().padStart(2, '0');
				returnStr += '.';

				var month = date.getMonth() + 1;
				returnStr += month.toString().padStart(2, '0');
				returnStr += '.';

				var year = date.getFullYear();
				returnStr += year.toString()

				return returnStr;
			},




			/**
			 * Die Koeffizienten für den Immobilien-Preis-Rechner werden per FeatureLayer bereitgestellt.
			 * In der Oberfläche werden Sie aber in Form von Daten-Objekten oder Arrays benötigt (z.B. als Auswahlliste für eine Combobox)
			 * Diese Methode soll helfen die Attribute aus dem FeatureLayer in ein Objekt-Array zu wandeln.
			 *
			 * @param {*} subsegment
			 * @param {*} category
			 * @param {*} propertyMapping
			 * @param {*} callback
			 */
			convertCoeffLayerToDataArray: function (subsegment, category, propertyMapping, callback) {
				var dataArray = new Array();
				var displayNames = {};
				var aQuery = new esri.tasks.Query();
				var aKoeffFeatureLayer = this.featureLayers.IRW_IMMOCALC_KOEFFIZIENTEN;
				var aAnzeigeFeatureLayer = this.featureLayers.IRW_ANZEIGEWERTE;

				// Frage die Anzeigenamen für "category" ab
				aQuery.where = "EIGN_BORIS = '" + category + "'";
				aQuery.outFields = ["*"];
				if (aAnzeigeFeatureLayer !== undefined) {
					aAnzeigeFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							displayNames[feature.attributes.WERT_BORIS] = feature.attributes.TXT_REAL;
						}

						// Frage die Einstellungen für "category" aus der Koeff-Tabelle ab
						aQuery.where = "EIGN_BORIS = '" + category + "' AND TEILMA = '" + subsegment + "'";
						aQuery.outFields = ["*"];
						if (aKoeffFeatureLayer !== undefined) {
							aKoeffFeatureLayer.queryFeatures(aQuery, function (featureSet) {

								// Wir holen uns die Features in ein lokales Array, um sie nach Koeffizent sortieren zu können
								var arr = featureSet.features;
								arr.sort(function (a, b) { return a.attributes.KOEFF - b.attributes.KOEFF });

								for (const feature of arr) {
									var obj = {};
									obj[propertyMapping.EXTNAME] = displayNames[feature.attributes.WERT_BORIS];
									obj[propertyMapping.INTNAME] = feature.attributes.WERT_BORIS;
									obj[propertyMapping.KOEFF] = feature.attributes.KOEFF;
									dataArray.push(obj);
								}

								callback(dataArray);
							});
						}
					});
				}
			},


			getStdValueFromLayer: function (StandardBWO) {

				propMap = {
					"KOEFF": "value",
					"INTNAME": "id",
					"EXTNAME": "name"
				}

				this.convertCoeffLayerToDataArray(2, "GSTAND", propMap, function (dataArray) {
					console.log(dataArray);
					StandardBWO.store = new Memory({
						data: dataArray
					});
				});
				// console.log(res);			
				// // return res;			
				// var stdStore = new Memory({
				// 	                        data: [
				// 	                            {name:"sehr einfach", id:"1"},
				// 	                            {name:"einfach", id:"2"},
				// 	                            {name:"normal", id:"3"},
				// 	                            {name:"gehoben/Neubau", id:"4"}
				// 	                            ]
				// 	                        });
				// return stdStore;		

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
