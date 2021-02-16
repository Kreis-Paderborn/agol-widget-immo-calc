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

        constructor: function (options) {
            this.handleError = options.handleError;
        },

        getHeaderConfig() {

            var headerConfig = this._headerConfig;

            if (headerConfig === null) {
                headerConfig = {
                    "STAG": [ // sortiert nach ID
                        {
                            name: "01.01.2021",     // STAG als String
                            id: 2021                // Jahr aus STAG
                        }
                    ],
                    "TEILMA": {
                        "01.01.2021": [ // Sortiert nach ID
                            {
                                name: "[TEILMA:1]", // TEILMA_TXT
                                id: 1                       // TEILMA
                            },
                            {
                                name: "[TEILMA:2]",  // TEILMA_TXT
                                id: 2                                             // TEILMA
                            }
                        ]
                    },
                    "ZONEN": {
                        "01.01.2021": {
                            "[TEILMA:1]": [  // Sortiert nach NAME
                                {
                                    name: "Bad Lippspringe",        // IRW_NAME
                                    id: 2                           // NUMZ
                                },
                                {
                                    name: "Altenbeken",              // IRW_NAME
                                    id: 1                           // NUMZ
                                }
                            ],
                            "[TEILMA:2]": [
                                {
                                    name: "Delbrück",       // IRW_NAME
                                    id: 6                   // NUMZ
                                },
                                {
                                    name: "Altenbeken",      // IRW_NAME
                                    id: 1                   // NUMZ
                                }
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
                    "GSTAND": {
                        "Typ": "AUSWAHL",
                        "Liste": [
                            { "name": "Toll", "id": 1, "value:": 1.856 },
                            { "name": "Mies", "id": 2, "value:": 0.856 }
                        ]
                    }
                };

                tableConfig = {
                    "01.01.2021": { // Aus IRW_KOEFF (Komplett) mit DISTINCT auf JAHR + Ableitung von 2020 --> "01.01.2021"
                        "[TEILMA:1]": { // Aus IRW_KOEFF (Jahr=2020) mit DISTINCT auf TEILMA, dann über IRW_ANZEIGENAMEN (EIGN_BORIS=Teilma AND WERT_BORIS=1)
                            "Bad Lippspringe": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                                "zonenIrw": 1550, // Aus IRW_ZONEN IRWE
                                "zonenIrw_txt": "1550 €/m²", // Aus IRW_ZONEN IRWE_TXT
                                "Eigenschaften": {
                                    "BJ": { // Aus IRW_KOEFF 
                                        "Titel": "Baujahr",
                                        "Richtwert": 1995,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1995,
                                        "RichtwertKoeffizient": 1.9554
                                    }
                                }
                            },
                            "Altenbeken": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                                "zonenIrw": 1750, // Aus IRW_ZONEN IRWE
                                "zonenIrw_txt": "1750 €/m²", // Aus IRW_ZONEN IRWE_TXT
                                "Eigenschaften": {
                                    "BJ": { // Aus IRW_KOEFF 
                                        "Titel": "Baujahr",
                                        "Richtwert": 1955,
                                        "Steuerelement": uiControls["BJ"],
                                        "WertInSteuerelement": 1955,
                                        "RichtwertKoeffizient": 1.7845
                                    }
                                }
                            }

                        },
                        "[TEILMA:2]": { // Aus IRW_KOEFF (Jahr=2020) mit DISTINCT auf TEILMA, dann über IRW_ANZEIGENAMEN (EIGN_BORIS=Teilma AND WERT_BORIS=2
                            "Delbrück": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                                "zonenIrw": 1750, // Aus IRW_ZONEN IRWE
                                "zonenIrw_txt": "1750 €/m²", // Aus IRW_ZONEN IRWE_TXT
                                "Eigenschaften": {
                                    "BJ": { // Aus IRW_KOEFF 
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
                            "Altenbeken": { // AUS IRW_ZONEN (STAG=01.01.2021 AND TEILMA=1) GENA
                                "zonenIrw": 1750, // Aus IRW_ZONEN IRWE
                                "zonenIrw_txt": "1750 €/m²", // Aus IRW_ZONEN IRWE_TXT
                                "Eigenschaften": {
                                    "BJ": { // Aus IRW_KOEFF 
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
         * FIXME AT: Wir sollten hier einmal alle UIs erstellen und dann nur die 
         *           für STAG und TEILMA zurückgeben.
         * 
         * 
         * @param {*} stag 
         * @param {*} teilma 
         */
        deriveUiControlConfig: function (stag, teilma) {

            if (this._coefficients !== null) {
                var config = {};

                for (const row of this._coefficients) {
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
            }

            return config;
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
            if (this._coefficients !== null) {

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

                    // die dritte Ebene ist der IRW-Name mit hrere Richtwertzonen-ID.
                    // Damit ist die Header-Config auch schon komplett
                    var irwName = fieldsObj["NAME_IRW"];
                    var numz = fieldsObj["NUMZ"];
                    if (this._tableConfig[stag][teilmaTxt][irwName] === undefined) {
                        this._headerConfig["ZONEN"][stag][teilmaTxt].push({ "name": irwName, "id": numz });
                        this._headerConfig["ZONEN"][stag][teilmaTxt].sort(function (a, b) { return a.name.localeCompare(b.name); });

                        // Hier werden nun die Bestandteile für alle vier Spalten der Tabelle festgelegt.
                        this._tableConfig[stag][teilmaTxt][irwName] = this.deriveZoneDetails(fieldsObj, stag, teilma);
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
                    var internalValue = fieldsObj[eign];
                    var valueInControl = null;

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
                    internalValue = (range.Max + range.Min) / 2;
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
        mapValueToCoeff: function (internalValue, uiControlConfig) {
            var type = uiControlConfig.Typ;
            var returnVal;

            if (type === "ZAHLENEINGABE") {

                // Hier wird der Koeffizient anhand der hinterlegen Spannen ermittelt.
                // Es wird angenommen, das der Wert vom Typ Number ist.
                for (const range of uiControlConfig.Spannen) {
                    if (internalValue >= range.Min && internalValue <= range.Max) {
                        returnVal = range.Koeffizient;
                        break;
                    }
                }

            } else if (type === "AUSWAHL") {

                // Hier wird der Koeffizient anhand der Auswahl-Listeneinträge ermittelt.
                // Ob der Typ des Wertes ein String oder eine Number ist, sollte ignoriert werden.
                // Das ist wichtig, da die ID mal so mal so belegt ist.
                for (const listEntry of uiControlConfig.Liste) {
                    if (listEntry.id.toString() === internalValue.toString()) {
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
