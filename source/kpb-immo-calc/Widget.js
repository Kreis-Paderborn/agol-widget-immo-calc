define([
	'dojo/_base/declare',
	"dojo/_base/lang",
	'dojo/store/Memory',
	'jimu/BaseWidget',
	'jimu/PanelManager',
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
		PanelManager,
		FeatureLayer,
		ImmoCalcEngine,
		ImmoCalcView
	) {

		return declare([BaseWidget], {

			baseClass: 'jimu-widget-widget-kpb-immo-calc',
			engine: null,
			view: null,
			featureLayers: null,

			modes: {
				"PRODUCTION": 1,
				"TEST": 2,
				"DEVELOPMENT": 3,
			},
			mode: 3,

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

				this.engine = new ImmoCalcEngine({

					// Wir übergeben hier den ErrorHandler, um der Engine die Möglichkeit zu geben,
					// auf den zentral eingestellten MODE zuzugreifen und über die aktuelle VIEW einen Dialog zu schalten.
					"handleError": this.errorHandler()
				});
				this.view = new ImmoCalcView(this.engine,this.id);

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
				var aZonesLayer = this.featureLayers.IRW_ZONEN;

				if (aZonesLayer !== undefined) {
					for (const field of this.featureLayers.IRW_ZONEN.fields) {
						var obj = {};
						obj["name"] = field.name;
						obj["alias"] = field.alias;
						extFieldArray.push(obj);
					}
				}

				this.engine.setExternalFieldNames(extFieldArray);

			},


			readDisplayNames: function (callback) {
				var displayNameArray = new Array();
				var aQuery = new esri.tasks.Query();
				var aAnzeigeFeatureLayer = this.featureLayers.IRW_ANZEIGEWERTE;
				var me = this;

				if (aAnzeigeFeatureLayer !== undefined) {

					// Frage die Anzeigenamen für "category" ab
					aQuery.where = "VERWENDET = 'ja'";
					aQuery.outFields = ["*"];
					aAnzeigeFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							var obj = {};
							obj["EIGN_BORIS"] = feature.attributes.EIGN_BORIS;
							obj["WERT_BORIS"] = feature.attributes.WERT_BORIS;
							obj["TXT_REAL"] = feature.attributes.TXT_REAL;
							displayNameArray.push(obj);
						}

						if (displayNameArray.length === 0) {
							var continueAfterError = me.handleError("0003", "Leere Datenbank-Tabelle", "FeatureLayer IRW_ANZEIGEWERTE enthält keine Daten.", true);
							if (continueAfterError) {
								me.engine.setDisplayNames(displayNameArray);
								callback();
							}
						} else {
							me.engine.setDisplayNames(displayNameArray);
							callback();
						}
					})
				} else {
					var continueAfterError = this.handleError("0001", "Fehlende Datenanbindung", "FeatureLayer IRW_ANZEIGEWERTE nicht verfügbar.", true);
					if (continueAfterError) {
						callback();
					}
				}
			},


			readCoefficients: function (callback) {
				var coeffArray = new Array();
				var aQuery = new esri.tasks.Query();
				var aKoeffFeatureLayer = this.featureLayers.IRW_IMMOCALC_KOEFFIZIENTEN;
				var me = this;

				if (aKoeffFeatureLayer !== undefined) {

					var myDateInMillisecs = new Date(me.config.maxSTAG).getTime();

					// Frage alle Koeffizienten ab
					aQuery.where = "GASL is not null";
					aQuery.outFields = ["*"];
					aKoeffFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							var obj = {};
							
							if (me.config.maxSTAG === undefined || feature.attributes.STAG <= myDateInMillisecs) {
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
						}

						if (coeffArray.length === 0) {
							var continueAfterError = me.handleError("0003", "Leere Datenbank-Tabelle", "FeatureLayer IRW_IMMOCALC_KOEFFIZIENTEN enthält keine Daten.", true);
							if (continueAfterError) {
								me.engine.setCoefficients(coeffArray);
								callback();
							}
						} else {
							me.engine.setCoefficients(coeffArray);
							callback();
						}
					})
				} else {
					var continueAfterError = this.handleError("0001", "Fehlende Datenanbindung", "FeatureLayer IRW_IMMOCALC_KOEFFIZIENTEN nicht verfügbar.", true);
					if (continueAfterError) {
						callback();
					}
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

				if (aZonesLayer !== undefined) {

					// Wir bestimmen hier den Feldnamne für die Where-Abfrage
					// dynamisch, da dieser an dem Klassennamen hängt, der sich 
					// ändern kann.
					var whereFieldName;
					var stagFieldName;
					var myDateInMillisecs = new Date(me.config.maxSTAG).getTime();
					for (const field of aZonesLayer.fields) {
						if (field.name.endsWith("TEILMA")) {
							whereFieldName = field.name;
						}
						if (field.name.endsWith("STAG")) {
							stagFieldName = field.name;
						}
					}

					// Frage alle Zonen ab
					aQuery.where = whereFieldName + " is not null";
					aQuery.outFields = ["*"];
					aZonesLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							if (me.config.maxSTAG === undefined || feature.attributes[stagFieldName] <= myDateInMillisecs) {
							zonesArray.push(feature.attributes);
							}
						}

						if (zonesArray.length === 0) {
							var continueAfterError = me.handleError("0003", "Leere Datenbank-Tabelle", "FeatureLayer IRW_ZONEN enthält keine Daten.", true);
							if (continueAfterError) {
								me.engine.setZones(zonesArray);
								callback();
							}
						} else {
							me.engine.setZones(zonesArray);
							callback();
						}
					})
				} else {
					var continueAfterError = this.handleError("0001", "Fehlende Datenanbindung", "FeatureLayer IRW_ZONEN nicht verfügbar.", true);
					if (continueAfterError) {
						callback();
					}
				}
			},
			readZonesHandler: function (callback) {
				me = this;
				return function () { me.readZones(callback) }
			},

			ready: function () {
				console.log("Fertig!");
				gEngine = this.engine;
				var me = this;

				var startCalculator = function (startSTAG, startTEILMA, startZONE) {
					me.view.initialiseHeader();
					me.view.showTable(
						startSTAG, 		   // Stichtag
						startTEILMA,  	   // Teilmarkt
						startZONE,         // Zone
						true               // Steuerelemente auf Norm?
					)

				}

				var startSTAG = "01.01.2021";
				var startTEILMA = 2;
				var startZONE = "Borchen";

				// Start mit Standard-Einstellung, wenn DB nicht geladen werden konnte.
				// FIXME-AT: Ein zentrales FLAG auf der engine, was anzeigt, 
				//           ob DB Daten vorhandne sind, wäre hilfreich.
				if (this.engine._coefficients === null) {
					startCalculator(startSTAG, startTEILMA, startZONE);
				} else {

					// Starte mit der Zone, die zuletzt im Popup aktiv war
					if (this.map.infoWindow !== undefined
						&& this.map.infoWindow.getSelectedFeature() !== undefined

						// Sicherstellen, dass es sich nicht um das Popup der Adresssuche handelt.
						&& this.map.infoWindow.getSelectedFeature().attributes["Addr_type"] === undefined) {

						var featureFromPopup = this.map.infoWindow.getSelectedFeature();
						for (const fullFieldname in featureFromPopup.attributes) {

							if (fullFieldname.endsWith("STAG_TXT")) {
								startSTAG = featureFromPopup.attributes[fullFieldname];
							}
							if (fullFieldname.endsWith("TEILMA")) {
								startTEILMA = featureFromPopup.attributes[fullFieldname];
							}
							if (fullFieldname.endsWith("NAME_IRW")) {
								startZONE = featureFromPopup.attributes[fullFieldname];
							}
						}
						startCalculator(startSTAG, startTEILMA, startZONE);
					}

					// Start bei der Zone, die am Mittelpunkt der Karte liegt
					else if (this.map.getZoom() > 1
						&& this.map.extent !== undefined
						&& this.map.extent.getCenter() !== undefined) {

						var centerPoint = this.map.extent.getCenter();
						var query = new esri.tasks.Query();
						query.geometry = centerPoint;
						query.outFields = ["*"];
						var aFeatureLayer = this.featureLayers.IRW_ZONEN_AREA;
						aFeatureLayer.queryFeatures(query, function (featureSet) {
							startZONE = featureSet.features[0].attributes["NAME_IRW"];

							// FIXME-AT: STAG und TEILMA wird hier auf Standardwerte gelassen,
							//           ohne zu prüfe, ob es die Komination für die Zone gibt.
							//           Außerdem könnten auch mehrer Zonen an einer Steller vorkommen.
							//           Wie verwenden aber nur das 1. aus den gefundenen Features.
							startCalculator(startSTAG, startTEILMA, startZONE);
						});

					}

					// Rückfallebene: Start mit Standardwert "Borchen"
					else {
						startCalculator(startSTAG, startTEILMA, startZONE);
					}
				}


			},
			readyHandler: function () {
				me = this;
				return function () { me.ready() }
			},


			/**
			 * Regelt die Behandlung von Fehlern in Abhängigkeit des im Widget gesetzten MODE.
			 * Im Produktionsmodus sollen bei Fehlern dem Anwender ein Meldung und ein Code angezeigt werden.
			 * Damit hat diese die Möglichkeit bei Bedarf eine Info an GIS@Kreis-Paderborn.de zu senden.
			 * Der ErrorCode hilft dabei den Fehler zu identifizieren.
			 * 
			 * @param {*} errorCode Identifikator, der in errorCodes.txt zu finden sein muss.
			 * @param {*} dialogTitle Titel der Meldung.
			 * @param {*} dialogMessage Inhalt der Meldung.
			 * @param {*} destroyPanel (Optional) Wenn der Fehler so schwerwiegend ist, dass man nicht weiterarbeiten kann, sollte hier TRUE gesetzt werden. Standard: FALSE
			 */
			handleError: function (errorCode, dialogTitle, dialogMessage, destroyPanel) {
				var continueAfterError = true;

				// In jedem FAall wird eine Meldung an der Browser-Konsole ausgegeben.				
				console.error(errorCode + ": " + dialogTitle + " - " + dialogMessage);

				// Da der Tester vielleicht nicht die Konsole im Blick hat, wird ihm eine
				// Meldung an der Oberfläche mit Fehlerinhalt angezeigt.
				if (this.mode === this.modes["TEST"]) {
					dialogMessage = "Es ist ein Fehler aufgetreten:<br><br>" + dialogMessage;
					dialogMessage += "<br><br>Fehlercode: " + errorCode;
					this.view.showDialog(dialogTitle, dialogMessage);

					// Im Produktionsbetrieb sollen die Fehlerdetails nicht an der Oberfläche erscheinen.
					// Der Anwender wird nur informiert, dass es Fehler vorliegt. Mittels eines
					// Fehlercodes kann er uns einen Tipp geben wo es hakt.
				} else if (this.mode === this.modes["PRODUCTION"]) {
					continueAfterError = false;

					prodTitle = "Es ist ein Fehler aufgetreten";
					prodMessage = "Aktuell besteht ein Problem mit der Anzeige des Immobilien-Preis-Kalkulators.<br><br>"
						+ "Bitte versuchen Sie es später noch einmal.<br>"
						+ "Wenn das Problem weiterhin besteht, wenden Sie sich bitte an<br>GIS@Kreis-Paderborn.de.<br><br>Fehlercode: " + errorCode;

					this.view.showDialog(prodTitle, prodMessage);

					if (destroyPanel) {
						// Zerstören der Panel-Instanz, damit beim
						// nächsten Start sicher alles zurück gesetzt ist.
						var pm = PanelManager.getInstance();
						pm.destroyPanel(this.id + "_panel");
					}
				}
				return continueAfterError;

			},
			errorHandler: function () {
				me = this;
				return function (errorCode, dialogTitle, dialogMessage, destroyPanel) {
					me.handleError(errorCode, dialogTitle, dialogMessage, destroyPanel)
				}
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

				// Zerstören der Panel-Instanz, damit beim
				// nächsten Start sicher alles zurück gesetzt ist.
				var pm = PanelManager.getInstance();
				pm.destroyPanel(this.id + "_panel");
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
