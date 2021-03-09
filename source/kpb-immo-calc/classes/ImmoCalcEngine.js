define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'esri/layers/FeatureLayer'
], function (
    declare,
    lang,
    Memory,
    FeatureLayer
) {

    return declare(null, {

        _externalFieldNames: null,
        _displayNames: null,
        _headerConfig: null,
        _tableConfig: null,
        _uiControls: null,
        _coefficients: null,

        handleError: null,
        buildTimestamp: null,

        constructor: function (options) {
            this.handleError = options.handleError;
            this.buildTimestamp = options.buildTimestamp;
        },

        getHeaderConfig() {

            var headerConfig = this._headerConfig;

            if (headerConfig === null) {
                headerConfig = {
                    "STAG": [
                        { name: "01.01.2021", id: 2021 },
                        { name: "01.01.2022", id: 2022 },
                        { name: "01.01.2023", id: 2023 }
                    ],
                    "TEILMA": {
                        "01.01.2021": [
                            { name: "[TEILMA:1]", id: 1 },
                            { name: "[TEILMA:2]", id: 2 }
                        ],
                        "01.01.2022": [
                            { name: "[TEILMA:1]", id: 1 },
                            { name: "[TEILMA:2]", id: 2 },
                            { name: "[TEILMA:3]", id: 3 }
                        ],
                        "01.01.2023": [
                            { name: "[TEILMA:3]", id: 3 }
                        ]
                    },
                    "ZONEN": {
                        "01.01.2021": {
                            "[TEILMA:1]": [
                                { name: "Bad Lippspringe", id: 2 },
                                { name: "Borchen", id: 1 }
                            ],
                            "[TEILMA:2]": [
                                { name: "Delbrück", id: 6 },
                                { name: "Borchen", id: 1 }
                            ]
                        },
                        "01.01.2022": {
                            "[TEILMA:1]": [
                                { name: "Bad Lippspringe", id: 2 },
                            ],
                            "[TEILMA:2]": [
                                { name: "Delbrück", id: 6 },
                            ],
                            "[TEILMA:3]": [
                                { name: "Delbrück", id: 6 },
                                { name: "Borchen", id: 1 }
                            ]
                        },
                        "01.01.2023": {
                            "[TEILMA:3]": [
                                { name: "Delbrück", id: 6 },
                                { name: "Borchen", id: 1 }
                            ]
                        }
                    }
                }
            }
            return headerConfig;
        },

        getTableConfig(stag, teilma, zone) {

            var teilma_txt = this.mapDisplayNames("TEILMA", teilma.toString());
            var uiControls = this.deriveUiControlConfig(stag, teilma);
            var tableConfig = this._tableConfig;

            if (uiControls === null || tableConfig === null) {

                uiControls = {
                    "BJ": {
                        "Typ": "ZAHLENEINGABE",
                        "Min": 0,
                        "Max": 2022,
                        "Spannen": [
                            { "Min": 0, "Max": 1990, "Koeffizient": 1.7845 },
                            { "Min": 1990, "Max": 2021, "Koeffizient": 1.9554 }
                        ]
                    },
                    "WHNFL": {
                        "Typ": "ZAHLENEINGABE",
                        "Min": 0,
                        "Max": 1000,
                        "Spannen": [
                            { "Min": 0, "Max": 80, "Koeffizient": 1.234 },
                            { "Min": 80, "Max": 1000, "Koeffizient": 0.987 }
                        ]
                    },
                    "GSTAND": {
                        "Typ": "AUSWAHL",
                        "Liste": [
                            { "name": "Toll", "id": 1, "value": 1.856 },
                            { "name": "Mies", "id": 2, "value": 0.856 }
                        ]
                    },
                    "KELLER": {
                        "Typ": "AUSWAHL",
                        "Liste": [
                            { "name": "nicht vorhanden", "id": 1, "value": 0.6 },
                            { "name": "vorhanden", "id": 2, "value": 1.000 },
                            { "name": "teilunterkellert", "id": 3, "value": 0.8 }
                        ]
                    }
                };

                tableConfig = {
                    "01.01.2021": {
                        "[TEILMA:1]": {
                            "Bad Lippspringe": {
                                "zonenIrw": 1550,
                                "zonenIrw_txt": "1550 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1995,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1995,
                                        "RichtwertKoeffizient": 1.9554
                                    },
                                    "WHNFL": {
                                        "Titel": "Wohnfäche",
                                        "Richtwert": 80,
                                        "Steuerelement": uiControls["WHNFL"],
                                        "WertInSteuerelement": 80,
                                        "RichtwertKoeffizient": 1.026
                                    }
                                }
                            },
                            "Borchen": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "WHNFL": {
                                        "Titel": "Wohnfäche",
                                        "Richtwert": 60,
                                        "Steuerelement": uiControls["WHNFL"],
                                        "WertInSteuerelement": 60,
                                        "RichtwertKoeffizient": 1.111
                                    }
                                }
                            }
                        },
                        "[TEILMA:2]": {
                            "Delbrück": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Toll",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Toll",
                                        "RichtwertKoeffizient": 1.856
                                    },
                                    "WHNFL": {
                                        "Titel": "Wohnfäche",
                                        "Richtwert": 130,
                                        "Steuerelement": uiControls["WHNFL"],
                                        "WertInSteuerelement": 130,
                                        "RichtwertKoeffizient": 1.222
                                    }
                                }
                            },
                            "Borchen": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Mies",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Mies",
                                        "RichtwertKoeffizient": 0.856
                                    },
                                    "WHNFL": {
                                        "Titel": "Wohnfäche",
                                        "Richtwert": 100,
                                        "Steuerelement": uiControls["WHNFL"],
                                        "WertInSteuerelement": 100,
                                        "RichtwertKoeffizient": 1.234
                                    }
                                }
                            }
                        }
                    },
                    "01.01.2022": {
                        "[TEILMA:1]": {
                            "Bad Lippspringe": {
                                "zonenIrw": 1550,
                                "zonenIrw_txt": "1550 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1995,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1995,
                                        "RichtwertKoeffizient": 1.9554
                                    }
                                }
                            }
                        },
                        "[TEILMA:2]": {
                            "Delbrück": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Toll",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Toll",
                                        "RichtwertKoeffizient": 1.856
                                    }
                                }
                            }
                        },
                        "[TEILMA:3]": {
                            "Delbrück": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Toll",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Toll",
                                        "RichtwertKoeffizient": 1.856
                                    }
                                }
                            },
                            "Borchen": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Mies",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Mies",
                                        "RichtwertKoeffizient": 0.856
                                    }
                                }
                            }
                        }
                    },
                    "01.01.2023": {
                        "[TEILMA:3]": {
                            "Delbrück": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Toll",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Toll",
                                        "RichtwertKoeffizient": 1.856
                                    },
                                    "KELLER": {
                                        "Titel": "Keller",
                                        "Richtwert": "vorhanden",
                                        "Steuerelement": uiControls["KELLER"],
                                        "WertInSteuerelement": "vorhanden",
                                        "RichtwertKoeffizient": 1.0
                                    }
                                }
                            },
                            "Borchen": {
                                "zonenIrw": 1750,
                                "zonenIrw_txt": "1750 €/m²",
                                "Eigenschaften": {
                                    "BJ": {
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    },
                                    "GSTAND": {
                                        "Titel": "Gebäudestandard",
                                        "Richtwert": "Mies",
                                        "Steuerelement": uiControls["GSTAND"],
                                        "WertInSteuerelement": "Mies",
                                        "RichtwertKoeffizient": 0.856
                                    }
                                }
                            }
                        }
                    }
                };
            }

            return tableConfig[stag][teilma_txt][zone];

        },


        /**
         * Die Konfiguration der Steuerelemente wird durch die DB-Tabelle IRW_IMMOCALC_KOEFFIZIENTEN
         * bestimmt. Diese Tabelle wird in dieser Methode ausgewertet und die Ergebnisse für weitere
         * Anfragen gecached.
         * 
         * @param {*} stag 
         * @param {*} teilma 
         */
        deriveUiControlConfig: function (stag, teilma) {
            var returnValue;

            // Wenn die Koeffizienten nicht aus der Datenbank geladen werden konnten, 
            // fallen wir auf die statische Dummy-Config zurück. Daher setzen wir hier bewusst "null".
            if (this._coefficients === null) {
                returnValue = null;

            } else {

                // Nach dem ersten Ableiten wird das Ergebnis in 
                // _uiControls gespeichert, sodass die Logik nur einmal
                // durchlaufen werden muss.
                if (this._uiControls === null) {

                    var obj = {};

                    for (const row of this._coefficients) {

                        if (obj[row.STAG] === undefined) {
                            obj[row.STAG] = {};
                        }

                        if (obj[row.STAG][row.TEILMA] === undefined) {
                            obj[row.STAG][row.TEILMA] = {};
                        }

                        if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS] === undefined) {
                            obj[row.STAG][row.TEILMA][row.EIGN_BORIS] = {};
                        }

                        // Behandlung von Zahleneingabe
                        if (row.STEUERELEM.startsWith("ZAHLENEINGABE")) {
                            obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Typ"] = "ZAHLENEINGABE";
                            var range = this.splitRange(row.WERT_BORIS);

                            // Alle Spannen werden gemerkt
                            // Diese kommen dann bei der Anwendung der Koeffizienten zum Einsatz
                            if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Spannen"] === undefined) {
                                obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Spannen"] = new Array();
                            }
                            var rangeObj = {};
                            rangeObj["Min"] = range["Min"];
                            rangeObj["Max"] = range["Max"];
                            rangeObj["Koeffizient"] = row.KOEFF;
                            obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Spannen"].push(rangeObj);

                            // Der niedrigste MIN als Gesamt-Min
                            if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Min"] === undefined) {
                                obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Min"] = range["Min"];
                            } else {
                                if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Min"] > range["Min"]) {
                                    obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Min"] = range["Min"];
                                }
                            }

                            // Der höchste Max als Gesamt-Ma
                            if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Max"] === undefined) {
                                obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Max"] = range["Max"];
                            } else {
                                if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Max"] < range["Max"]) {
                                    obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Max"] = range["Max"];
                                }
                            }
                        }

                        // Behandlung von Auswahlwerten
                        else if (row.STEUERELEM.startsWith("AUSWAHL")) {
                            obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Typ"] = "AUSWAHL";

                            // Alle Listeeinträge werden samt Koeffizienten gemerkt
                            if (obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Liste"] === undefined) {
                                obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Liste"] = new Array();
                            }
                            var rangeObj = {};
                            rangeObj["name"] = this.mapDisplayNames(row.EIGN_BORIS, row.WERT_BORIS);
                            rangeObj["id"] = row.WERT_BORIS;
                            rangeObj["value"] = row.KOEFF;
                            obj[row.STAG][row.TEILMA][row.EIGN_BORIS]["Liste"].push(rangeObj);
                        }
                    }
                    this._uiControls = obj;
                }
                returnValue = this._uiControls[stag][teilma];
            }
            return returnValue;
        },


        mapDisplayNames: function (eignBoris, wertBoris) {
            var returnVal = "[" + eignBoris + ":" + wertBoris + "]"

            // Wenn eine der Haupttabellen nicht von der DB lesbar war, fallen
            // wir auf die statische Dummy-Konfig zurück.
            if (this._displayNames !== null
                && this._coefficients !== null
                && this._tableConfig !== null) {

                var myDisplayNames = this._displayNames[eignBoris];

                if (myDisplayNames !== undefined) {
                    for (const row of myDisplayNames) {
                        if (row.WERT_BORIS === wertBoris) {
                            returnVal = row.TXT_REAL;
                            break;
                        }
                    }
                }
            }

            return returnVal;
        },


        /**
         * Ziel dieser Methode ist, aus dem Array der Anzeigewerte eine
         * einfach zu verwendene Zuordnungstabelle über die Boris-Eigenschaft zu erstellen.
         * 
         * @param {*} displayNameArray 
         */
        setDisplayNames: function (displayNameArray) {
            this._displayNames = {};

            for (const row of displayNameArray) {
                if (this._displayNames[row.EIGN_BORIS] === undefined) {
                    this._displayNames[row.EIGN_BORIS] = new Array();
                }

                var obj = {};
                obj["WERT_BORIS"] = row.WERT_BORIS;
                obj["TXT_REAL"] = row.TXT_REAL;
                this._displayNames[row.EIGN_BORIS].push(obj);
            }
        },


        setCoefficients: function (coefficientsArray) {
            this._coefficients = coefficientsArray;
        },

        /**
         * Ziel dieser Methode ist, aus dem Array der externen Feldnamen (Aliase) eine
         * einfach zu verwendene Zuordnungstabelle über die Boris-Eigenschaft zu erstellen.
         * 
         * Besonderheit bei den externen Feldnamen ist, dass es für viele Felder ein
         * zusätzliches Feld mit der Endung "_TXT" gibt. Diese Zusatzfelder enthalten den Anzeigewert
         * und sind für die BORIS-Datenabgabe wichtig. Sie enthalten den eigentlich zu verwendenden
         * externen Feldnamen.
         * 
         * Beispiel:
         * TEILMA = "Teilmarkt (Schlüssel)" mit Wert 1
         * TEILMA_TXT = "Teilmarkt" mit Wert "Eigentumswohnungen"
         * 
         * Da wir hier einen einfachen Zugriff über die Boris-Eigenschaft anstreben,
         * elemenieren wird hier die Zusatzfelder, übernehmen aber ihren externen Feldnamen
         * für das Ausgangsfeld.
         * 
         * Beispiel:
         * TEILMA = "Teilmarkt"
         * 
         * @param {*} extFieldNameArray 
         */
        setExternalFieldNames: function (extFieldNameArray) {
            var tempExternalFieldNames = {};

            // im ersten Lauf verarbeiten wir alle Angaben
            for (const row of extFieldNameArray) {

                // Das Table-Präfix entfernen und gemappten Wert merken
                var n = row.name;
                var eignBoris = n.substr(n.lastIndexOf('.') + 1);
                tempExternalFieldNames[eignBoris] = row.alias;
            }

            // Nun, wo wir einen einfachen Zugriff über eignBoris haben,
            // sortieren wir die aus, für die es eine "_TXT"-Alternative gibt.
            this._externalFieldNames = {};
            for (const tempExtFieldName in tempExternalFieldNames) {
                if (!tempExtFieldName.endsWith("_TXT")) {
                    var value = tempExternalFieldNames[tempExtFieldName];
                    var alternativeKey = tempExtFieldName + "_TXT";
                    var alternativeValue = tempExternalFieldNames[alternativeKey];

                    if (alternativeValue !== undefined) {
                        this._externalFieldNames[tempExtFieldName] = alternativeValue;
                    } else {
                        this._externalFieldNames[tempExtFieldName] = value;
                    }
                }
            }
        },

        /**
         * Ziel dieser Methode ist, aus dem Array der Zonen einfach zu verwendende Konfig-Objekte
         * für den Header und die Tabellen-Konfiguration zu erstellen.         
         * 
         * @param {*} zonesArray 
         */
        setZones: function (zonesArray) {
            var usedZoneFieldsArray = this.detectUsedZoneFields(zonesArray);

            // Da die Konfiguration nur vollständig aufgebaut werden kann,
            // wenn auch die Koeffizienten geladen wurden, pürfen wir das hier als Erstes.
            if (zonesArray !== null
                && zonesArray !== undefined
                && zonesArray.length > 0
                && this._coefficients !== null) {

                // Initiale Struktur für die Header- und TableConfig.
                this._headerConfig = {
                    "STAG": new Array(),
                    "TEILMA": {},
                    "ZONEN": {}
                };
                this._tableConfig = {};

                for (const fieldsObj of usedZoneFieldsArray) {

                    // Die erste Ebene ist immer STAG. Mit dieser werden 
                    // alle Liste initialisiert.
                    var stagMilliSec = fieldsObj["STAG"];
                    var stagId = new Date(stagMilliSec).getFullYear();
                    var stag = this.convertDate(stagMilliSec);

                    if (this._tableConfig[stag] === undefined) {
                        this._tableConfig[stag] = {};
                        this._headerConfig["STAG"].push({ "name": stag, "id": stagId });
                        this._headerConfig["STAG"].sort(function (a, b) { return a.id - b.id });
                        this._headerConfig["TEILMA"][stag] = new Array();
                        this._headerConfig["ZONEN"][stag] = {};
                    }

                    // die zweite Ebene ist der Teilmarkt.
                    var teilma = fieldsObj["TEILMA"];
                    var teilmaTxt = fieldsObj["TEILMA_TXT"];
                    if (this._tableConfig[stag][teilmaTxt] === undefined) {
                        this._tableConfig[stag][teilmaTxt] = {};
                        this._headerConfig["TEILMA"][stag].push({ "name": teilmaTxt, "id": teilma });
                        this._headerConfig["TEILMA"][stag].sort(function (a, b) { return a.id - b.id });
                        this._headerConfig["ZONEN"][stag][teilmaTxt] = new Array();
                    }

                    // die dritte Ebene ist der IRW-Name mit ihrer Richtwertzonen-ID.
                    // Damit ist die Header-Config auch schon komplett
                    var irwName = fieldsObj["NAME_IRW"];

                    // Da NAME_IRW in der DB kein Pflichtfeld ist, müssen wir hier prüfen, ob es in der Datenbank belegt ist.
                    if (irwName !== undefined) {
                        var numz = fieldsObj["NUMZ"];
                        if (this._tableConfig[stag][teilmaTxt][irwName] === undefined) {
                            this._headerConfig["ZONEN"][stag][teilmaTxt].push({ "name": irwName, "id": numz });
                            this._headerConfig["ZONEN"][stag][teilmaTxt].sort(function (a, b) { return a.name.localeCompare(b.name); });

                            // Hier werden nun die Bestandteile für alle vier Spalten der Tabelle festgelegt.
                            this._tableConfig[stag][teilmaTxt][irwName] = this.deriveZoneDetails(fieldsObj, stag, teilma);
                        }
                    } else {
                        this.handleError("0004", "Benötigtes Feld nicht belegt", "Das Feld 'IRW_ZONEN_AREA.NAME_IRW' ist nicht belegt.", true);
                        this._headerConfig = null;
                        this._tableConfig = null;
                        break;
                    }
                }
            }
        },


        deriveZoneDetails: function (fieldsObj, stag, teilma) {
            var detailsObj = {};
            var uiControls = this.deriveUiControlConfig(stag, teilma);

            if (uiControls !== null) {
                // Setzen des IRWs für die Zone
                detailsObj["zonenIrw"] = fieldsObj.IMRW;
                detailsObj["zonenIrw_txt"] = fieldsObj.IMRW_TXT;

                // Ermitteln und Setzen der Eigenschaften abhängig von STAG und TEILMA
                eignObj = {};

                for (const coeffRow of this._coefficients) {
                    if (coeffRow.STAG === stag && coeffRow.TEILMA === teilma) {
                        var eign = coeffRow.EIGN_BORIS;
                        if (eignObj[eign] === undefined) {
                            eignObj[eign] = {};
                        }
                    }
                }

                for (const eign in eignObj) {
                    var obj = {};
                    var uiControlConfig = uiControls[eign];
                    var internalValue = null;
                    var valueInControl = null;

                    if (fieldsObj[eign] !== undefined) {
                        internalValue = fieldsObj[eign];
                    } else {
                        // Wenn ein Koeffizient hinzugefügt wurde, ohne 
                        // des dafür ein Feld mit Richtwerten auf der Zone gibt,
                        // so bekommen wir hier werder internen noh externen Wert.
                        // Um das System nicht zum Absturz zu bringen wird hier der erste
                        // Wert aus der Auswahlliste verwendet.
                         this.handleError("0006", "Richtwert nicht auf Zone", "Für den Stichtag '"+stag+"' wurden Koeffizienten für das Merkmal '"+eign+"' hochgeladen. Diese sind aber nicht als Richtwerte auf den Zonen vorhanden.", true);
                    }

                    obj["Titel"] = this._externalFieldNames[eign];
                    obj["Steuerelement"] = uiControlConfig;

                    // Wenn ein Anzeigetext verfügbar ist, verwenden wir diesen.
                    var eignTxt = eign + "_TXT";
                    if (fieldsObj[eignTxt] !== undefined) {
                        obj["Richtwert"] = fieldsObj[eignTxt];
                    } else {
                        obj["Richtwert"] = internalValue;
                    }

                    valueInControl = this.detectValueForControl(internalValue, fieldsObj[eignTxt], uiControlConfig);
                    obj["WertInSteuerelement"] = valueInControl;
                    obj["RichtwertKoeffizient"] = this.mapValueToCoeff(valueInControl, uiControlConfig);

                    eignObj[eign] = obj;
                }

                detailsObj["Eigenschaften"] = eignObj;
            }

            return detailsObj;
        },

        /**
         * Wenn es einen internen UND externen Wert gibt hängt es vom Typ des Steuerelementes ab, welcher
         * Wert angezeigt werden soll. Bei einer Spanne, wird als Wert für die Zahleneingabe der Mittelwert verwendet.
         * 
         * @param {*} internalValue 
         * @param {*} uiControlConfig 
         */
        detectValueForControl: function (internalValue, externalValue, uiControlConfig) {
            var type = uiControlConfig.Typ;
            var returnVal;

            if (type === "ZAHLENEINGABE") {

                // Zeichenkette bei Zahleneingabe lässt auf eine Spanne schließen
                if (typeof internalValue === "string") {
                    var range = this.splitRange(internalValue);

                    // Runden auf Mittelwert
                    // ---------------------
                    // Da die Spannen etwas uneinheitlich definiert sind, können
                    // wir nicht immer kaufmännisch runden, um auf saubere 5er-Blöcke zu kommen
                    //
                    //  70-119 --> 94,5 (kaufmännisch auf 95)
                    //  51-100 --> 75,5 (nicht kaufmännisch auf 75, daher Korrekturfaktor)
                    var correction = 0.0;
                    if (range.Min % 2 === 1) {
                        correction = -0.1;
                    }
                    internalValue = Math.round(((range.Max + range.Min) / 2) + correction);
                }
                returnVal = internalValue;

            } else if (type === "AUSWAHL") {
                if (externalValue !== undefined) {
                    returnVal = externalValue;
                } else {
                    returnVal = internalValue;
                }
            }

            return returnVal;
        },


        /**
         * Gibt den Koeffizienten für einen Wert zurück unter Berücksichtigung
         * der übergebenen Konfiguration eines Steuerelementes.
         * 
         * @param {*} internalValue 
         * @param {*} uiControlConfig 
         */
        mapValueToCoeff: function (valueInControl, uiControlConfig) {
            var type = uiControlConfig.Typ;
            var returnVal;

            if (type === "ZAHLENEINGABE") {

                // Hier wird der Koeffizient anhand der hinterlegen Spannen ermittelt.
                // Es wird angenommen, das der Wert vom Typ Number ist.
                for (const range of uiControlConfig.Spannen) {
                    if (valueInControl >= range.Min && valueInControl <= range.Max) {
                        returnVal = range.Koeffizient;
                        break;
                    }
                }

            } else if (type === "AUSWAHL") {

                // Hier wird der Koeffizient anhand der Auswahl-Listeneinträge ermittelt.
                // Ob der Typ des Wertes ein String oder eine Number ist, sollte ignoriert werden.
                // Das ist wichtig, da die ID mal so mal so belegt ist.
                for (const listEntry of uiControlConfig.Liste) {
                    if (listEntry.name.toString() === valueInControl.toString()) {
                        returnVal = listEntry.value;
                        break;
                    }
                }
            } else {
                this.handleError("0002", "Ungültiger Steuerelement-Typ", "Der Typ: '" + uiControlConfig.Typ + "' wird nicht unterstützt", false);
            }

            return returnVal;
        },


        /**
         * In der Datenstruktur der Zonen gibt es viele Reservefelder, die wir,
         * solange sie nicht verwendet werden, nicht weiter betrachten wollen.
         * 
         * Daher werden in dieser Methode die Felder herausgesucht, die auch tatsächlich
         * einen Wert tragen. In dem  Zuge wird noch der Table-Präfix entfernt, der 
         * beim weiteren Arbeiten mit den Feldern hinderlich ist.
         * 
         * @param {*} zonesArray 
         */
        detectUsedZoneFields: function (zonesArray) {
            var usedZoneFieldsArray = new Array();

            for (const fieldsObj of zonesArray) {
                var obj = {};

                for (const fullFieldname in fieldsObj) {
                    var n = fullFieldname;

                    // Entfernen des Table-Präfix.
                    var fieldname = n.substr(n.lastIndexOf('.') + 1);
                    var value = fieldsObj[fullFieldname];

                    // Wir behalten nur die Felder, die gesetzt sind.
                    if (value !== null) {
                        obj[fieldname] = value;
                    }
                }
                usedZoneFieldsArray.push(obj);
            }

            return usedZoneFieldsArray;
        },


        /**
         * Hilfsmethode, die aus einer Spanne in einer Zeichenkette
         * ein Objekt mit zwei echten Integerwerte machen.
         * 
         * Beispiel
         * "10-20" --> {"Min":10, "Max": 20}
         * 
         * @param {*} range 
         */
        splitRange: function (range) {
            var obj = {};

            var stringArray = range.split('-');
            obj["Min"] = parseInt(stringArray[0]);
            obj["Max"] = parseInt(stringArray[1]);

            return obj;
        },


        /**
         * Hilfsmethode, um ein Datum von Millisekunden in die detusche
         * Standardschreibweise zu überführen.
         * 
         * @param {*} DateInMilliseconds 
         */
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

    })

}
);
