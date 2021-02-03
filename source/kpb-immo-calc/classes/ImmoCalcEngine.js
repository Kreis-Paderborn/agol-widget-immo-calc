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
                "STAG" : [
                    "01.01.2021"
                ],
                "TEILMA" : {
                    "01.01.2021" : [
                        "Eigentumswohnungen",
                        "Ein- und Zweifamilienhäuser freistehend"
                    ]
                },
                "ZONEN" : {
                    "01.01.2021" : {
                        "Eigentumswohnungen" : [
                            "Bad Lippspringe",
                            "Borchen",
                            "Delbrück",
                            "Hövelhof",
                            "Salzkotten",
                            "Südliches Kreisgebiet"
                        ],
                        "Ein- und Zweifamilienhäuser freistehend" : [
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
                                },
                                "GSTAND": {
                                    "Titel": "Gebäudestandard",
                                    "Norm": "Mittel",
                                    "Steuerelement": uiControls["GSTAND"],
                                    "WertInSteuerelemet": "Mittel"
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
                                "BOWL": { // Aus IRW_KOEFF 

                                }
                            }

                        }

                    }

                }

            };

            gTableConfig = tableConfig;
            return tableConfig[stag][teilma][zone];
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
