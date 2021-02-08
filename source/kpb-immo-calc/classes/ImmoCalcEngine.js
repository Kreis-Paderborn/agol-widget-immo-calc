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
        coefficients: null,

        constructor: function (options) {

        },

        getHeaderConfig() {

            return this._headerConfig;

            // var headerConfig = {
            //     "STAG": [ // sortiert nach ID
            //         {
            //             name: "01.01.2021",     // STAG als String
            //             id: 2021                // Jahr aus STAG
            //         }
            //     ],
            //     "TEILMA": {
            //         "01.01.2021": [ // Sortiert nach ID
            //             {
            //                 name: "Eigentumswohnungen", // TEILMA_TXT
            //                 id: 1                       // TEILMA
            //             },
            //             {
            //                 name: "Ein- und Zweifamilienhäuser freistehend",  // TEILMA_TXT
            //                 id: 2                                             // TEILMA
            //             }
            //         ]
            //     },
            //     "ZONEN": {
            //         "01.01.2021": {
            //             "Eigentumswohnungen": [  // Sortiert nach NAME
            //                 {
            //                     name: "Bad Lippspringe",        // IRW_NAME
            //                     id: 2                           // NUMZ
            //                 },
            //                 {
            //                     name: "Borchen",                // IRW_NAME
            //                     id: 4                           // NUMZ         
            //                 },
            //                 { name: "Delbrück", id: 6 },
            //                 { name: "Hövelhof", id: 7 },
            //                 { name: "Salzkotten", id: 9 },
            //                 { name: "Südliches Kreisgebiet", id: 10 }
            //             ],
            //             "Ein- und Zweifamilienhäuser freistehend": [
            //                 { name: "Altenbeken", id: 1 },
            //                 { name: "Bad Lippspringe", id: 2 },
            //                 { name: "Bad Wünnenberg", id: 3 },
            //                 { name: "Borchen", id: 4 },
            //                 { name: "Büren", id: 5 },
            //                 { name: "Delbrück", id: 6 },
            //                 { name: "Hövelhof", id: 7 },
            //                 { name: "Lichtenau", id: 8 },
            //                 { name: "Salzkotten", id: 9 }
            //             ]
            //         }
            //     }
            // }
            // return headerConfig;
        },

        getTableConfig(stag, teilma, zone) {

            var uiControls = {
                "BJ": {
                    "Typ": "ZAHLENEINGABE",
                    "Min": 0,
                    "Max": 2022,
                    "Spannen": [
                        { "Min": 0, "Max": 1959, "Koeffizient": 1.7845 },
                        { "Min": 1960, "Max": 1969, "Koeffizient": 1.8554 }
                    ]
                },
                "GSTAND": {
                    "Typ": "AUSWAHL",
                    "Liste": [
                        { "name": "normal", "id": 1, "value:": 1.856 }
                    ]
                }
            };
            uiControls = this.deriveUiControlConfig(stag, teilma);

            var tableConfig = {
                "01.01.2021": { // Aus IRW_KOEFF (Komplett) mit DISTINCT auf JAHR + Ableitung von 2020 --> "01.01.2021"
                    "Eigentumswohnungen": { // Aus IRW_KOEFF (Jahr=2020) mit DISTINCT auf TEILMA, dann über IRW_ANZEIGENAMEN (EIGN_BORIS=Teilma AND WERT_BORIS=1)
                        "Altenbeken": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                            "zonenIrw": "1550 €/m²", // Aus IRW_ZONEN IRWE_TXT
                            "Eigenschaften": {
                                "BJ": { // Aus IRW_KOEFF 
                                    "Titel": "Baujahr",
                                    "Richtwert": 1955,
                                    "Steuerelement": uiControls["BJ"],
                                    "WertInSteuerelemet": 1955,
                                    "Koeffizient": 1.7845
                                }
                            }
                        },
                        "Bad Lippspringe": {

                        }

                    },
                    "Ein- und Zweifamilienhäuser freistehend": { // Aus IRW_KOEFF (Jahr=2020) mit DISTINCT auf TEILMA, dann über IRW_ANZEIGENAMEN (EIGN_BORIS=Teilma AND WERT_BORIS=2
                        "Altenbeken": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                            "zonenIrw": "1750 €/m²", // Aus IRW_ZONEN IRWE_TXT
                            "Eigenschaften": {
                                "BJ": { // Aus IRW_KOEFF 
                                    "Titel": "Baujahr",
                                    "Richtwert": 1955,
                                    "Steuerelement": uiControls["BJ"],
                                    "WertInSteuerelemet": 1955,
                                    "Koeffizient": 1.7845
                                },
                                "GSTAND": {
                                    "Titel": "Gebäudestandard",
                                    "Richtwert": "Mittel",
                                    "Steuerelement": uiControls["GSTAND"],
                                    "WertInSteuerelemet": "Mittel",
                                    "Koeffizient": 1.0
                                },
                                "EGART": {
                                    "Titel": "Ergänzende Gebäudeart",
                                    "Richtwert": "freistehend",
                                    "Steuerelement": uiControls["EGART"],
                                    "WertInSteuerelemet": "freistehend",
                                    "Koeffizient": 0.865
                                }
                            }

                        }

                    }

                }

            };

            gTableConfig = tableConfig;
            var teilma_txt = this.mapDisplayNames("TEILMA", teilma.toString());
            return tableConfig[stag][teilma_txt][zone];
        },

        
        /**
         * FIXME AT: Wir sollten hier einmal alle UIs erstellen und dann nur die 
         *           für STAG und TEILMA zurückgeben.
         * 
         * 
         * @param {*} stag 
         * @param {*} teilma 
         */
        deriveUiControlConfig: function (stag, teilma) {
            var config = {};

            for (const row of this.coefficients) {
                if (row.STAG === stag && row.TEILMA === teilma) {
                    if (config[row.EIGN_BORIS] === undefined) {
                        config[row.EIGN_BORIS] = {};
                    }

                    // Behandlung von Zahleneingabe
                    if (row.STEUERELEM.startsWith("ZAHLENEINGABE")) {
                        config[row.EIGN_BORIS]["Typ"] = "ZAHLENEINGABE";
                        var range = this.splitRange(row.WERT_BORIS);

                        // Alle Spannen werden gemerkt
                        // Diese kommen dann bei der Anwendung der Koeffizienten zum Einsatz
                        if (config[row.EIGN_BORIS]["Spannen"] === undefined) {
                            config[row.EIGN_BORIS]["Spannen"] = new Array();
                        }
                        var rangeObj = {};
                        rangeObj["Min"] = range["Min"];
                        rangeObj["Max"] = range["Max"];
                        rangeObj["Koeffizient"] = row.KOEFF;
                        config[row.EIGN_BORIS]["Spannen"].push(rangeObj);

                        // Der niedrigste MIN als Gesamt-Min
                        if (config[row.EIGN_BORIS]["Min"] === undefined) {
                            config[row.EIGN_BORIS]["Min"] = range["Min"];
                        } else {
                            if (config[row.EIGN_BORIS]["Min"] > range["Min"]) {
                                config[row.EIGN_BORIS]["Min"] = range["Min"];
                            }
                        }

                        // Der höchste Max als Gesamt-Ma
                        if (config[row.EIGN_BORIS]["Max"] === undefined) {
                            config[row.EIGN_BORIS]["Max"] = range["Max"];
                        } else {
                            if (config[row.EIGN_BORIS]["Max"] < range["Max"]) {
                                config[row.EIGN_BORIS]["Max"] = range["Max"];
                            }
                        }
                    }

                    // Behandlung von Auswahlwerten
                    else if (row.STEUERELEM.startsWith("AUSWAHL")) {
                        config[row.EIGN_BORIS]["Typ"] = "AUSWAHL";

                        // Alle Listeeinträge werden samt Koeffizienten gemerkt
                        if (config[row.EIGN_BORIS]["Liste"] === undefined) {
                            config[row.EIGN_BORIS]["Liste"] = new Array();
                        }
                        var rangeObj = {};
                        rangeObj["name"] = this.mapDisplayNames(row.EIGN_BORIS, row.WERT_BORIS);
                        rangeObj["id"] = row.WERT_BORIS;
                        rangeObj["value"] = row.KOEFF;
                        config[row.EIGN_BORIS]["Liste"].push(rangeObj);
                    }

                }
            }

            return config;
        },

        mapDisplayNames: function (eignBoris, wertBoris) {
            var myDisplayNames = this._displayNames[eignBoris];
            var returnVal = "[" + eignBoris + ":" + wertBoris + "]"

            if (myDisplayNames !== undefined) {
                for (const row of myDisplayNames) {
                    if (row.WERT_BORIS === wertBoris) {
                        returnVal = row.TXT_REAL;
                        break;
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
         * für den Header und die Tabellenansicht zu erstellen.         * 
         * 
         * @param {*} zonesArray 
         */
        setZones: function (zonesArray) {
            var usedZoneFieldsArray = this.detectUsedZoneFields(zonesArray);
            
            // Initiale Struktur für die Header- und TableConfig.
            this._headerConfig = {
                "STAG": new Array(),
                "TEILMA": {},
                "ZONEN": {}
            };
            this._tableConfig = {};

            // Dann gehen wir nochmal über alle Zonen und bauen 
            // damit die Zielstruktur für Table- und HeaderConfig auf.
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

                // die dritte Ebene ist der IRW-Name mit hrere Richtwertzonen-ID.
                // Damit ist die Header-Config auch schon komplett
                var irwName = fieldsObj["NAME_IRW"];
                var numz = fieldsObj["NUMZ"];
                if (this._tableConfig[stag][teilmaTxt][irwName] === undefined) {
                    this._tableConfig[stag][teilmaTxt][irwName] = {};
                    this._headerConfig["ZONEN"][stag][teilmaTxt].push({ "name": irwName, "id": numz });
                    this._headerConfig["ZONEN"][stag][teilmaTxt].sort(function (a, b) { return a.name.localeCompare(b.name); });
                }

                // Setzen der spezifischen Definitionen der
                this._tableConfig[stag][teilmaTxt][irwName] = this.deriveZoneDetails(fieldsObj, stag, teilma);

            }
        },


        deriveZoneDetails: function (fieldsObj, stag, teilma) {
            var detailsObj = {};
            var uiControls = this.deriveUiControlConfig(stag, teilma);

            // Setzen des IRWs für die Zone
            detailsObj["zonenIrw"] = fieldsObj.IMRW_TXT;

            // Ermitteln und Setzen der Eigenschaften abhängig von STAG und TEILMA
            eignObj = {};

            for (const coeffRow of this.coefficients) {
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
                var internalValue = fieldsObj[eign];

                obj["Titel"] = this._externalFieldNames[eign];
                obj["Steuerelement"] = uiControlConfig;
                
                // Wenn eiun Anzeigetext verfügbar ist, verwenden wir diesen.
                var eignTxt = eign + "_TXT";
                if (fieldsObj[eignTxt] !== undefined) {
                    obj["Richtwert"] = fieldsObj[eignTxt];
                } else {
                    obj["Richtwert"] = internalValue;
                }

                // Für den Wert im Steuerelement wird jedenfalls nicht der Anzeigetext verwendet.
                obj["WertInSteuerelement"] = internalValue;
                obj["RichtwertKoeffizient"] = this.mapValueToCoeff(internalValue, uiControlConfig);

                eignObj[eign] = obj;
            }

            detailsObj["Eigenschaften"] = eignObj;



            return detailsObj;
        },


        /**
         * Gibt den Koeffizienten für einen Wert zurück unter berücksichtigung
         * der übergebenen Konfiguration eines Steuerelementes.
         * 
         * @param {*} internalValue 
         * @param {*} uiControlConfig 
         */
        mapValueToCoeff: function (internalValue, uiControlConfig) {
            var type = uiControlConfig.Typ;
            var returnVal; 

            if (type === "ZAHLENEINGABE") {

                // Wenn der Wert eine Spanne ist, müssen wir mit Mittelwert berechnen
                if (typeof internalValue === "string") {
                    var range = this.splitRange(internalValue);
                    internalValue = (range.Max + range.Min) / 2;
                }

                for (const range of uiControlConfig.Spannen) {
                    if (internalValue >= range.Min && internalValue <= range.Max) {
                        returnVal = range.Koeffizient;
                        break;
                    }
                }

            } else if (type === "AUSWAHL") {

                for (const listEntry of uiControlConfig.Liste) {
                    if (listEntry.id.toString() === internalValue.toString()) {
                        returnVal = listEntry.value;
                        break;
                    }
                }
            }

            return returnVal;
        },


        detectUsedZoneFields: function (zonesArray) {
            var existingZoneFieldNames = {};
            var usedZoneFieldsArray = new Array();

            // Im ersten Durchlauf entfernen wir die Table-Präfixe 
            // und merken uns, welche Felder überhaupt gesetzt sind
            for (const fieldsObj of zonesArray) {
                var obj = {};

                for (const fullFieldname in fieldsObj) {
                    var n = fullFieldname;
                    var fieldname = n.substr(n.lastIndexOf('.') + 1);
                    var value = fieldsObj[fullFieldname];

                    if (value !== null) {
                        if (existingZoneFieldNames[fieldname] === undefined) {
                            existingZoneFieldNames[fieldname] = 1;
                        } else {
                            existingZoneFieldNames[fieldname] += 1;
                        }
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
