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

        externalFields: null,
        displayNames: null,
        coefficients: null,

        constructor: function (options) {
            this.myWidget = options.myWidget;
        },

        getHeaderConfig() {
            var headerConfig = {
                "STAG": [
                    "01.01.2021"
                ],
                "TEILMA": {
                    "01.01.2021": [
                        "Eigentumswohnungen",
                        "Ein- und Zweifamilienhäuser freistehend"
                    ]
                },
                "ZONEN": {
                    "01.01.2021": {
                        "Eigentumswohnungen": [
                            "Bad Lippspringe",
                            "Borchen",
                            "Delbrück",
                            "Hövelhof",
                            "Salzkotten",
                            "Südliches Kreisgebiet"
                        ],
                        "Ein- und Zweifamilienhäuser freistehend": [
                            "Altenbeken",
                            "Bad Lippspringe",
                            "Bad Wünnenberg",
                            "Borchen",
                            "Büren",
                            "Delbrück",
                            "Hövelhof",
                            "Lichtenau",
                            "Salzkotten"
                        ]
                    }
                }
            }
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
                        { "Name": "normal", "id": 1, "Koeffizient:": 1.856 }
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
                                    "Norm": 1955,
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
                                    "Norm": 1955,
                                    "Steuerelement": uiControls["BJ"],
                                    "WertInSteuerelemet": 1955,
                                    "Koeffizient": 1.7845
                                },
                                "GSTAND": {
                                    "Titel": "Gebäudestandard",
                                    "Norm": "Mittel",
                                    "Steuerelement": uiControls["GSTAND"],
                                    "WertInSteuerelemet": "Mittel"
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

        deriveUiControlConfig: function (stag, teilma) {
            var config = {};

            console.log("coefficients");
            console.log(this.coefficients);

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

                    // Behandlung von Zahleneingabe
                    else if (row.STEUERELEM.startsWith("AUSWAHL")) {
                        config[row.EIGN_BORIS]["Typ"] = "AUSWAHL";

                        // Alle Listeeinträge werden samt Koeffizienten gemerkt
                        if (config[row.EIGN_BORIS]["Liste"] === undefined) {
                            config[row.EIGN_BORIS]["Liste"] = new Array();
                        }
                        var rangeObj = {};
                        rangeObj["Name"] = this.mapDisplayNames(row.EIGN_BORIS, row.WERT_BORIS);
                        rangeObj["id"] = row.WERT_BORIS;
                        rangeObj["Koeffizient"] = row.KOEFF;
                        config[row.EIGN_BORIS]["Liste"].push(rangeObj);
                    }

                }
            }

            console.log("uis");
            console.log(config);

            return config;
        },

        mapDisplayNames: function (eignBoris, wertBoris) {

            // FIXME AT: die DisplayNames könnte man auch gleich zu Beginn in eine 
            //           Struktur packen, wo man sie auf EIGN_BORIS aufschlüsselt.
            //           Dann müsste man hier nicht immer über alle einträge loopen.

            for (const row of this.displayNames) {
                if (row.EIGN_BORIS === eignBoris
                    && row.WERT_BORIS === wertBoris) {
                    return row.TXT_REAL;
                }
            }
        },



        splitRange: function (range) {
            var obj = {};

            var stringArray = range.split('-');
            obj["Min"] = parseInt(stringArray[0]);
            obj["Max"] = parseInt(stringArray[1]);

            return obj;
        },


        getOrte: function () {
            var aOrteStore = new Memory({
                data: [
                    { name: "Bad Lippspringe", id: "1" },
                    { name: "Borchen", id: "2" },
                    { name: "Delbrück", id: "3" },
                    { name: "Hövelhof", id: "4" },
                    { name: "Salzkotten", id: "5" },
                    { name: "Süd", id: "6" }
                ]
            });
            return aOrteStore;
        },

        getSchulnote: function () {
            var aSchulnotenStore = new Memory({
                data: [
                    { name: "sehr gut", id: "1" },
                    { name: "gut", id: "2" },
                    { name: "befriedigend", id: "3" },
                    { name: "ausreichend", id: "4" },
                    { name: "mangelhaft", id: "5" },
                    { name: "ungenügend", id: "6" }
                ]
            });
            return aSchulnotenStore;
        },

        getStdFromFeatureLayer: function (StandardBWO) {
            var res = this.myWidget.getStdValueFromLayer(StandardBWO);
            console.log("in Engine", res);
            return res;
            //     var stdStore = new Memory({
            //                         data: [
            //                             {name:"sehr einfach", id:"1"},
            //                             {name:"einfach", id:"2"},
            //                             {name:"normal", id:"3"},
            //                             {name:"gehoben/Neubau", id:"4"}
            //                             ]
            //                         });
            //     return stdStore;
        },
    })

}
);
