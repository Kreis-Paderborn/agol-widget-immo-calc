define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'dijit/form/SimpleTextarea',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
    'dijit/form/RadioButton',
    'dijit/form/Button',
    'dijit/form/ComboBox',
    'dijit/layout/TabContainer',
    'dijit/layout/ContentPane',
    'dojo/domReady!',
    'dojox/form/BusyButton',
    "dijit/_WidgetBase",
    "dijit/_Container",
    'dijit/registry',
    'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-git1.min.js'
], function (
    declare,
    lang,
    Memory,
    dijitSimpleTextarea,
    dijitNumberSpinner,
    dijitDialog,
    dijitFormRadioButton,
    dijitFormButton,
    FormComboBox,
    LayoutTabContainer,
    LayoutContentPane,
    dijitReady,
    BusyButton,
    _WidgetBase,
    _Container,
    dijitRegistry,
    $
) {

    return declare(null, {

        dummyOption: null,
        engine: null,

        constructor: function (engine, options) {

            this.engine = engine;

            if (options)
                this.dummyOption = options.dummyOption;

            var me = this;

            var genaLabel = document.getElementById("genaLabel");
            genaLabel.innerText = "Gemeinde";

            var genaBWO = new FormComboBox({
                id: "genaBWO",
                name: "genaBWO",
                value: "Aus Karte vorbelegt",
                searchAttr: "name",
                cols: "20",
                style: "width:150px",
                onChange: function (newValue) { console.log("genaBWO", newValue) }
            }, "genaBWO").startup();


            var genaIRW = new dijitSimpleTextarea({
                id: "genaIRW",
                name: "genaIRW",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "aValue"
            }, "genaIRW").startup();

            var normLabel = document.getElementById("normLabel");
            normLabel.innerText = "Norm";

            var bwoLabel = document.getElementById("bwoLabel");
            bwoLabel.innerText = "BWO";

            var irwLabel = document.getElementById("irwLabel");
            irwLabel.innerText = "IRW und UF";

            var bowlLabel = document.getElementById("bowlLabel");
            bowlLabel.innerText = "Boden/Lagewert";

            // var bowlNorm = new dijitSimpleTextarea({
            //     id: "bowlNorm",
            //     name: "bowlNorm",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: '51-100'
            // }, "bowlNorm").startup();


            // var bowlBWO = new dijitNumberSpinner({
            //     value: 100,
            //     smallDelta: 10,
            //     constraints: { min: 50, max: 1000, places: 0 },
            //     id: "bowlBWO",
            //     style: "width:150px"
            // }, "bowlBWO").startup();


            // var bowlIRW = new dijitSimpleTextarea({
            //     id: "bowlIRW",
            //     name: "bowlIRW",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: 'aus DB'
            // }, "bowlIRW").startup();

            // var anzegebLabel = document.getElementById("anzegebLabel");
            // anzegebLabel.innerText = "Anzahl der Einheiten im Gebäude";

            // var anzegebNorm = new dijitSimpleTextarea({
            //     id: "anzegebNorm",
            //     name: "anzegebNorm",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: '6-10'
            // }, "anzegebNorm").startup();


            // var anzegebBWO = new dijitNumberSpinner({
            //     value: 5,
            //     smallDelta: 1,
            //     constraints: { min: 0, max: 100, places: 0 },
            //     id: "anzegebBWO",
            //     style: "width:150px"
            // }, "anzegebBWO").startup();


            // var anzegebIRW = new dijitSimpleTextarea({
            //     id: "anzegebIRW",
            //     name: "anzegebIRW",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: 'aus DB'
            // }, "anzegebIRW").startup();

            // var flaecheLabel = document.getElementById("flaecheLabel");
            // flaecheLabel.innerText = "Grundstücksgröße";

            // var flaecheNorm = new dijitSimpleTextarea({
            //     id: "flaecheNorm",
            //     name: "flaecheNorm",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: '800-10000'
            // }, "flaecheNorm").startup();


            // var flaecheBWO = new dijitNumberSpinner({
            //     value: 500,
            //     smallDelta: 10,
            //     constraints: { min: 0, max: 10000, places: 0 },
            //     id: "flaecheBWO",
            //     style: "width:150px"
            // }, "flaecheBWO").startup();

            // var flaecheIRW = new dijitSimpleTextarea({
            //     id: "flaecheIRW",
            //     name: "flaecheIRW",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: 'aus DB'
            // }, "flaecheIRW").startup();


            // var wflLabel = document.getElementById("wflLabel");
            // wflLabel.innerText = "Wohnfläche";

            // var wflNorm = new dijitSimpleTextarea({
            //     id: "wflNorm",
            //     name: "wflNorm",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: '120-160'
            // }, "wflNorm").startup();


            // var wflBWO = new dijitNumberSpinner({
            //     value: 75,
            //     smallDelta: 1,
            //     constraints: { min: 25, max: 300, places: 0 },
            //     id: "wflBWO",
            //     style: "width:150px"
            // }, "wflBWO").startup();


            // var wflIRW = new dijitSimpleTextarea({
            //     id: "wflIRW",
            //     name: "wflIRW",
            //     rows: "1",
            //     cols: "15",
            //     style: "width:150px",
            //     value: 'aus DB'
            // }, "wflIRW").startup();


            var stagLabel = document.getElementById("stagLabel");
            stagLabel.innerText = "Stichtag des Immobilienrichtwertes";

            var stagNorm = new dijitSimpleTextarea({
                id: "stagNorm",
                name: "stagNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '2021'
            }, "stagNorm").startup();

            var stagBWO = new FormComboBox({
                id: "stagBWO",
                name: "stagBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                style: "width:150px",
                onChange: function (newValue) {
                    // me.getKoefForSelection(newValue,this,"stagIRW");
                }
            }, "stagBWO").startup();


            var stagIRW = new dijitSimpleTextarea({
                id: "stagIRW",
                name: "stagIRW",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "stagIRW").startup();

            var angIRWLabel = document.getElementById("angIRWLabel");
            angIRWLabel.innerText = "angepasster IRW";

            var angIRWBWO = new dijitSimpleTextarea({
                id: "angIRWBWO",
                name: "angIRWBWO",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'berechneter Wert'
            }, "angIRWBWO").startup();

            var wertLabel = document.getElementById("wertLabel");
            wertLabel.innerText = "geschätzter Wert";

            var wertBWO = new dijitSimpleTextarea({
                id: "wertBWO",
                name: "wertBWO",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'berechneter Wert'
            }, "wertBWO").startup();

        },

        initialiseHeader: function () {
            var me = this;
            var headerConfig = this.engine.getHeaderConfig();

            var stagBWO = dijitRegistry.byId("stagBWO");
            stagBWOValue = headerConfig["STAG"][0].name;
            stagBWO.textbox.value = stagBWOValue;

            // teilmaLabel
            elementLabelName = "teilmaLabel";
            elementLabelValue = "Teilmarkt";
            this.generateLabelElement(elementLabelName, elementLabelValue);

            // teilmaBWO
            var teilmaBWO = new FormComboBox({
                id: "teilmaBWO",
                name: "teilmaBWO",
                value: headerConfig["TEILMA"][stagBWOValue][0].name,
                searchAttr: "name",
                style: "width:150px",
                store: new Memory({ data: headerConfig["TEILMA"][stagBWOValue] }),
                onChange: function (newValue) {
                    var anbauweiseElement = document.getElementById('rowEgart');
                    var flaecheElement = document.getElementById('rowFlaeche');
                    var standardElement = document.getElementById('rowStandard');
                    var anzahlElement = document.getElementById('rowAnzahl');
                    if (newValue === "Eigentumswohnungen") {
                        anbauweiseElement.style = "display: none;";
                        flaecheElement.style = "display: none;";
                        standardElement.style = "display: none;";
                        anzahlElement.style = "display: true;";
                        me.getValuesGena(newValue);
                    } else {
                        anbauweiseElement.style = "display: true;";
                        flaecheElement.style = "display: true;";
                        standardElement.style = "display: true;";
                        me.getValuesGstand();
                        me.getValuesEgart();
                        me.getValuesGena(newValue);
                        anzahlElement.style = "display: none;";
                    };
                },
            }, "teilmaBWO").startup();

            // genaLabel
            // zoneBWO
            // zoneIRW

        },

        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);

            var genaBWO = dijitRegistry.byId("genaBWO");
            genaBWO.textbox.value = "Altenbeken";

            var genaIRW = dijitRegistry.byId("genaIRW");
            genaIRW.textbox.value = tableConfig["zonenIrw"];

            for (value in tableConfig["Eigenschaften"]) {

                elementLabelName = value.toLowerCase() + "Label";
                elementLabelValue = tableConfig["Eigenschaften"][value]["Titel"];
                this.generateLabelElement(elementLabelName, elementLabelValue);

                elementNormName = value.toLowerCase() + "Norm";
                elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                this.generateTextElement(elementNormName, elementNormValue);

                elementBWOName = value.toLowerCase() + "BWO";
                elementBWOValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                elementBWOUIControl = tableConfig["Eigenschaften"][value]["Steuerelement"];
                this.generateBWOElement(elementBWOName, elementBWOValue, elementBWOUIControl);

                elementIRWName = value.toLowerCase() + "IRW";
                elementIRWValue = "0%";
                this.generateTextElement(elementIRWName, elementIRWValue);
            }
            console.log("Table-Config:");
            console.log(tableConfig);

        },

        generateLabelElement: function (elementLabelName, elementLabelValue) {
            console.log(elementLabelName);
            console.log(elementLabelValue);
            var aLabelElement = document.getElementById(elementLabelName);
            aLabelElement.innerText = elementLabelValue;
        },

        generateTextElement: function (elementTextName, elementTextValue) {
            var aTextElement = new dijitSimpleTextarea({
                id: elementTextName,
                name: elementTextName,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: elementTextValue.toString()
            }, elementTextName).startup();
        },

        generateBWOElement: function (elementBWOName, elementBWOValue, elementBWOUIControl) {
            me = this;
            switch (elementBWOUIControl["Typ"]) {
                case "ZAHLENEINGABE":
                    var aBWOElement = new dijitNumberSpinner({
                        value: elementBWOValue,
                        smallDelta: 1,
                        constraints: { min: elementBWOUIControl["Min"], max: elementBWOUIControl["Max"], places: 0 },
                        id: elementBWOName,
                        style: "width:150px"
                    }, elementBWOName).startup();
                    break;
                case "AUSWAHL":
                    var aBWOElement = new FormComboBox({
                        id: elementBWOName,
                        name: elementBWOName,
                        value: elementBWOValue.toString(),
                        searchAttr: "name",
                        style: "width:150px",
                        onChange: function (newValue) {
                            IdIRW = elementBWOName.replace("BWO", "IRW");
                            me.getKoefForSelection(newValue,elementBWOUIControl,IdIRW);
                        }
                    }, elementBWOName).startup();
                    break;
            }

        },

        // Werte zur Auswahl von ComboBoxen bestimmen
        // ComboBox Gebäudestandard 
        getValuesGstand: function () {
            var gstandBWO = dijitRegistry.byId("gstandBWO");
            this.getStoreValuesForComboBox(gstandBWO, "GSTAND");
        },

        // ComboBox Ergänzende Gebäuderart
        getValuesEgart: function () {
            var egartBWO = dijitRegistry.byId("egartBWO");
            this.getStoreValuesForComboBox(egartBWO, "EGART");

        },

        // 
        getStoreValuesForComboBox: function (aComboBox, feld) {
            var StagBWO = dijitRegistry.byId("stagBWO");
            currentStag = StagBWO.textbox.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            currentGena = genaBWO.textbox.value;
            config = this.engine.getTableConfig(currentStag, 2, currentGena);
            dataArray = config["Eigenschaften"][feld]["Steuerelement"]["Liste"];
            aComboBox.store = new Memory({
                data: dataArray
            });
        },
        // Auswahlmöglichkeiten für Gemeinde/Zone bestimmen
        getValuesGena: function (teilmarkt) {
            var genaBWO = dijitRegistry.byId("genaBWO");
            var headerConfig = this.engine.getHeaderConfig();
            var stagBWO = dijitRegistry.byId("stagBWO");
            currentStag = stagBWO.textbox.value;
            dataArray = headerConfig["ZONEN"][currentStag][teilmarkt];
            genaBWO.store = new Memory({
                data: dataArray
            });
        },

        getValuesStag: function (newValue) {
            var stagBWO = dijitRegistry.byId("stagBWO");
            var headerConfig = this.engine.getHeaderConfig();
            dataArray = headerConfig["STAG"];

            stagBWO.store = new Memory({
                data: dataArray
            });
        },

        // Koeffizient für Auswahl in ComboBox bestimmen und in der IRW Spalte eintragen
        // FIXME der Wert muss in die prozentuale Abweichung vom Normkoeffizienten umgerechnet werden. 
        getKoefForSelection: function (newValue, aUIControl, IdIRW) {
            aKoef = this.engine.mapValueToCoeff(newValue,aUIControl);
            console.log(newValue);
            console.log(aKoef);
            var aIRWField = dijitRegistry.byId(IdIRW);
            // aIRWField.textbox.value = object.value.toFixed(4);
            aIRWField.textbox.value = aKoef;
            
        }

    });
}
);
