define([
	'dojo/_base/declare',
	"dojo/_base/lang",
	'jimu/BaseWidget',
	'jimu/PanelManager',
	'./classes/ImmoCalcEngine',
	'./classes/ImmoCalcView',
	'dijit/layout/TabContainer',
	'dijit/layout/ContentPane'
],
	function (
		declare,
		lang,
		BaseWidget,
		PanelManager,
		ImmoCalcEngine,
		ImmoCalcView
	) {

		return declare([BaseWidget], {

			baseClass: 'jimu-widget-widget-kpb-immo-calc',
			engine: null,
			view: null,
			featureLayers: null,
			currentAddress: null,
			started: null,
			supportedStag: null,

			modes: {
				"PRODUCTION": "1",
				"TEST": "2",
				"DEVELOPMENT": "3",
			},
			mode: null,

			startup: function () {
				this.inherited(arguments);
				this.featureLayers = this.collectFeatureLayersFromMap();
				this.mode = this.config.applicationMode;
				this.started = false;

				// Um zu verhindern, dass Eingaben über den Nummernblock im Widget 
				// die Kartennavigation triggert (passiert, wenn der Mauszeiger über der Karte steht)
				// wird hier die Keyboard-Navigation der Karte deaktiviert.
				this.map.disableKeyboardNavigation();

				this.engine = new ImmoCalcEngine({

					// Wir übergeben hier den ErrorHandler, um der Engine die Möglichkeit zu geben,
					// auf den zentral eingestellten MODE zuzugreifen und über die aktuelle VIEW einen Dialog zu schalten.
					"handleError": this.errorHandler(),

					// Zeitpunkt des Builds, um in der Anwendung prüfen zu können, um welchen Build es sich handelt.
					"buildTimestamp": this.config.buildTimestamp,

					// Bei STAG=NULL muss ein Wert für die Oberfläche gesetzt werden. Dieser wird in der environment.bar festgelegt.
					"useStagNullAs": this.config.useStagNullAs

				});

				this.view = new ImmoCalcView(
					this.engine,
					this.id,
					this.config.fmeServerBaseUrl,
					this.getCopyrightFromMap()
				);

				// Die Abfrage der aktuellen Adresse wird immer beantwortet.
				// Zur Not mit NULL, wenn keine Adresse vorliegt.
				// Daher können wir das in "onReceiveData" als Trigger für den Start des Kalkulators nehmen.
				this.publishData({
					'request': "getSearchResults"
				});


			},

			onReceiveData: function (name, widgetId, data, historyData) {

				if (data
					&& data.searchResults
					&& data.searchResults.Match_addr) {

					this.currentAddress = data.searchResults;
				}

				this.readDefinitionsFromFeatureLayers();
			},

			/**
			 * Die Map enthält in der Variablen "attribution" alle Quellenangeben der enthaltenen Dienste.
			 * Aus diesen suchen wir uns anhand des serviceNames unseres zentralen Layers IRW_ZONEN
			 * den Quellenvermerk für die IRW-Dienste raus.
			 */
			getCopyrightFromMap: function () {

				var returnVal = "";
				var serviceName = this.config.featureLayersFromMap.IRW_ZONEN.serviceName;

				if (this.map.attribution && this.map.attribution._attributions) {

					var allCopyights = this.map.attribution._attributions;
					for (key in allCopyights) {

						// Die Key der Attributions besteht aus dem Dienstnamen ergänzt
						// um eine temporäre System-ID. Daher suchen wir hier mit "startWith".
						if (key.startsWith(serviceName)) {
							returnVal = allCopyights[key];
						}
					}
				}
				return returnVal;
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

				// Auch wenn mehrmals der Trigger über die Adresssuche kommt, 
				// wenn der IPK schon gestartet war, wird er nicht nochmals gestartet.
				if (!this.started) {
					this.started = true;

					this.readExternalFieldnames();

					this.readSupportedStagFromMap();

					if (this.supportedStag.length > 0) {
						this.readDisplayNames(
							this.readCoefficientsHandler(
								this.readZonesHandler(
									this.readyHandler()
								)
							)
						);
					} else {
						this.handleError("0007", "Layer in Map falsch benannt", "Die Layer der Immobilienrichtwerte müssen das Muster <br><b>'Immobilienrichtwerte - [STAG]'</b><br> aufweisen. Das ist für keinen Layer der Fall.", true);
					}

				}
			},

			/**
			 * In der verwendeten WebMap müssen MapImageLayer mit dem Namen "Immobilienrichtwerte - XXX" enthalten sein.
			 * XXX ist dabei der Stichtag des Immobilienrichtwertes (STAG). 
			 * Dieser wird an dieser Stelle extrahiert und als Grundlage für die auszulesenden STAG verwendet.
			 * Damit wird sichergestellt, dass im Kalkulator nicht mehr Daten zu sehen sind, als die WebMAp als Layer anzeigt.
			 */
			readSupportedStagFromMap: function () {

				this.supportedStag = new Array();

				for (const aLayerId in this.map.layerIds) {
					var aLayer = this.map.getLayer(this.map.layerIds[aLayerId]);
					var aLayerTitle = aLayer.arcgisProps.title;

					if (aLayerTitle.startsWith("Immobilienrichtwerte")) {
						var lastSpace = aLayerTitle.lastIndexOf(" ");
						if (lastSpace > -1) {
							var supportedStag = aLayerTitle.substring(lastSpace + 1);
							this.supportedStag.push(supportedStag);
						}
					}
				}
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

					// Frage alle Koeffizienten ab
					aQuery.where = "GASL is not null";
					aQuery.outFields = ["*"];
					aKoeffFeatureLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {
							var obj = {};

							// Wir ermitteln hier den Anzeigewerte für STAG. In der DB steht ein Datumswert in Millisec oder NULL	
							var searchStag = me.config.useStagNullAs;
							if (feature.attributes.STAG !== null) {
								searchStag = me.engine.convertDate(feature.attributes.STAG);
							}

							// Wenn der Anzeigewert für STAG in der Map als Immobilienrichtwert-Layer enthalten
							// ist, wird dieser auch im Kalkulator berücksichtigt Siehe readSupportedStagFromMap().
							if (me.supportedStag.includes(searchStag)) {
								obj["WERT_AKS"] = feature.attributes.WERT_AKS;
								obj["EIGN_AKS"] = feature.attributes.EIGN_AKS;
								obj["WERT_BORIS"] = feature.attributes.WERT_BORIS;
								obj["EIGN_BORIS"] = feature.attributes.EIGN_BORIS;
								obj["KOEFF"] = feature.attributes.KOEFF;
								obj["GASL"] = feature.attributes.GASL;
								obj["IRWTYP"] = feature.attributes.IRWTYP;
								obj["TEILMA"] = feature.attributes.TEILMA;
								obj["STAG"] = searchStag;
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
					var stagTextFieldName;
					for (const field of aZonesLayer.fields) {
						if (field.name.endsWith("TEILMA")) {
							whereFieldName = field.name;
						}
						if (field.name.endsWith("STAG")) {
							stagFieldName = field.name;
						}
						if (field.name.endsWith("STAG_TXT")) {
							stagTextFieldName = field.name;
						}
					}

					// Frage alle Zonen ab
					aQuery.where = whereFieldName + " is not null";
					aQuery.outFields = ["*"];
					aZonesLayer.queryFeatures(aQuery, function (featureSet) {

						for (const feature of featureSet.features) {

							// Wir ermitteln hier den Anzeigewerte für STAG. 
							var searchStag = me.config.useStagNullAs;
							if (feature.attributes[stagTextFieldName] !== null) {
								searchStag = feature.attributes[stagTextFieldName];
							}

							// Wenn der Anzeigewert für STAG in der Map als Immobilienrichtwert-Layer enthalten
							// ist, wird dieser auch im Kalkulator berücksichtigt Siehe readSupportedStagFromMap().
							if (me.supportedStag.includes(searchStag)) {
								if (feature.attributes[stagFieldName] === null) {
									feature.attributes[stagFieldName] = me.config.useStagNullAs;
								}
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
				console.log("");
				console.log("---------------------------------");
				console.log("Kalkulator erfolgreich gestartet!");
				console.log("---------------------------------");
				console.log("");

				gEngine = this.engine;
				var me = this;

				var startCalculator = function (startSTAG, startTEILMA, startZONE) {
					me.view.initialiseHeader();
					me.view.initialiseAddressLocation(me.currentAddress);
					me.view.showTable(
						startSTAG, 		   // Stichtag
						startTEILMA,  	   // Teilmarkt
						startZONE,         // Zone
						true               // Steuerelemente auf Norm?
					)

				}

				// Ermittle den aktuellsten STAG
				var stagLength = me.supportedStag.length;
				me.supportedStag.sort();

				var startSTAG = me.supportedStag[stagLength - 1];
				var startTEILMA = 2;
				var startZONE = "Borchen";

				// Start mit Standard-Einstellung, wenn DB nicht geladen werden konnte.
				// FIXME-AT: Ein zentrales FLAG auf der engine, was anzeigt, 
				//           ob DB Daten vorhanden sind, wäre hilfreich.
				if (this.engine._coefficients === null) {
					startCalculator(startSTAG, startTEILMA, startZONE);
				} else {

					// Starte mit der Zone, die zuletzt im Popup aktiv war
					if (this.map.infoWindow !== undefined
						&& this.map.infoWindow.getSelectedFeature() !== undefined

						// Wenn das Popup weggeklickt wurde, berücksichtigen wir es nicht
						// Dann würde die CSS-Klasse "esriPopupHidden" enthalten sein.
						&& this.map.infoWindow.domNode.className.includes("esriPopupVisible")

						// Sicherstellen, dass es sich nicht um das Popup der Adresssuche handelt.
						&& this.map.infoWindow.getSelectedFeature().attributes["Addr_type"] === undefined) {

						// Da das Präfix bei den Feldnamen veränderlich ist, suchen wir hier zunächst
						// die relevanten Feldnamen nach der Endung.
						var featureFromPopup = this.map.infoWindow.getSelectedFeature();
						var teilmaFieldName = null;
						var stagFieldName = null;
						var irwnameName = null;
						for (const fullFieldname in featureFromPopup.attributes) {
							if (fullFieldname.endsWith("TEILMA")) {
								teilmaFieldName = fullFieldname;
							}
							if (fullFieldname.endsWith("STAG_TXT")) {
								stagFieldName = fullFieldname;
							}
							if (fullFieldname.endsWith("NAME_IRW")) {
								irwnameName = fullFieldname;
							}
						}

						if (teilmaFieldName !== null
							&& stagFieldName !== null
							&& irwnameName !== null) {

							startSTAG = featureFromPopup.attributes[stagFieldName];
							if (startSTAG === null) {
								startSTAG = me.config.useStagNullAs;
							}
							startTEILMA = featureFromPopup.attributes[teilmaFieldName];
							startZONE = featureFromPopup.attributes[irwnameName];

							startCalculator(startSTAG, startTEILMA, startZONE);
							return;
						}
					}

					// Start bei der Zone, die am Mittelpunkt der Karte liegt
					if (this.map.getZoom() > 0
						&& this.map.extent !== undefined
						&& this.map.extent.getCenter() !== undefined) {

						var centerPoint = this.map.extent.getCenter();
						var query = new esri.tasks.Query();
						var now = Date.now();
						query.geometry = centerPoint;
						query.outFields = ["*"];
						var anAreaFeatureLayer = this.featureLayers.IRW_ZONEN_AREA;

						if (anAreaFeatureLayer !== undefined) {

							anAreaFeatureLayer.queryFeatures(query, function (featureSet) {

								if (featureSet.features.length > 0) {

									var zoneArray = me.engine.getZones();
									var hits = new Array();

									for (const feature of featureSet.features) {
										var numz = feature.attributes["NUMZ"];
										var gesl = feature.attributes["GESL"];

										// Der Sonderfall "Paderborn" ist solange gültig, wie es von dort noch keine Daten gibt.
										if (gesl === "05774032") {
											var pm = PanelManager.getInstance();
											pm.destroyPanel(me.id + "_panel");
											me.view.showDialog("Position im Stadtgebiet Paderborn", "Für den Bereich des Stadtgebietes Paderborn liegen in unserem System keine Immobilienrichtwerte vor.<br><br>Der Kalkulator kann daher in diesem Bereich nicht gestartet werden.");
											return;
										}

										// alle anderen Gemeinden/Städte
										else {

											// Wir suchen über NUMZ von unserer getroffenen Fläche aus die Zonen.
											// Denn es muss nicht zu jeder in der DB vorhandenen Fläche einen Jahrgang / Teilmarkt geben.
											for (const zone of zoneArray) {

												// Für die Zonen, die mit der getroffenen Fläche verbunden sind...
												if (zone.NUMZ === numz) {

													// Wenn das Datum numerisch ist, nehmen wir es auf jeden Fall für die weitere Betrachtung mit.	
													// Denn das sind die veröffentlichten Jahrgänge-											
													if (!isNaN(zone.STAG)) {
														hits.push(zone);
													}

													// Wenn nicht numerisch, handelt es sich im den Bearbeitungslayer.
													// Dann muss der Text zu dem konfigurierten Wert in "useStagNullAs" passen.
													else {
														if (zone.STAG === me.config.useStagNullAs) {
															zone.STAG_TXT = zone.STAG;
															zone.STAG = now;
															hits.push(zone);
														}
													}
												}

											}
										}
									}

									// Sortiere den aktuellsten STAG nach oben. Wenn gleich dann nach TEILAMA.
									// Somit nehmen wir standardmäßig den TEILMA=2. 
									// Falls es TEILMA=2 für einen Bereich nicht gäbe, würde auf die vorhandenen Werte zurückgegriffen.
									hits.sort(function (a, b) {
										if (b.STAG === a.STAG) {
											return b.TEILMA - a.TEILMA
										} else {
											return b.STAG - a.STAG
										}
									});

									// Wir nehmen alle drei Werte aus der tatsächlich vorhandenen Zone.
									// Somit stellen wir sicher, dass es die Konstellation auch wirklich gibt.
									startZONE = hits[0].NAME_IRW;
									startSTAG = hits[0].STAG_TXT;
									startTEILMA = hits[0].TEILMA;

									startCalculator(startSTAG, startTEILMA, startZONE);
								}

								else {
									var continueAfterError = me.handleError("0005", "Zonenflächen nicht verfügbar", "FeatureLayer IRW_ZONEN_AREA ist vorhanden, enthält aber keine Daten.", true);
									if (continueAfterError) {
										startCalculator(startSTAG, startTEILMA, startZONE);
									}
								}
							});
							return;
						} else {
							var continueAfterError = this.handleError("0005", "Zonenflächen nicht verfügbar", "FeatureLayer IRW_ZONEN_AREA nicht verfügbar.", true);
							if (continueAfterError) {
								startCalculator(startSTAG, startTEILMA, startZONE);
								return;
							}
						}


					}

					// Rückfallebene: Start mit Standardwert "Borchen"
					startCalculator(startSTAG, startTEILMA, startZONE);
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
						+ "Wenn das Problem weiterhin besteht, wenden Sie sich bitte an<br><a href=\"mailto:GIS@Kreis-Paderborn.de\">GIS@Kreis-Paderborn.de</a>.<br><br>Fehlercode: " + errorCode;

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

				// Um zu verhindern, dass Eingaben über den Nummernblock im Widget 
				// die Kartennavigation triggert (passiert, wenn der Mauszeiger über der Karte steht)
				// wurde beim Start des Widget die Keyboard-Navigation der Karte deaktiviert.
				// Diese kann nun wieder aktiviert werden.
				this.map.enableKeyboardNavigation();
			},

			onMinimize: function () {
				//console.log('onMinimize');
			},

			onMaximize: function () {
				//console.log('onMaximize');
			},

			onSignIn: function (credential) {
				//console.log('onSignIn');
			},

			onSignOut: function () {
				//console.log('onSignOut');
			},

			onPositionChange: function () {
				//console.log('onPositionChange');
			},

			resize: function () {
				// console.log('resize');
			}

			//methods to communication between widgets:

		});
	});
