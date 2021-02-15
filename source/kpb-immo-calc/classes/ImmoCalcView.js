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
        visElements: null,
        coeffStore: null,

        constructor: function (engine, options) {

            this.coeffStore = null;

            this.visElements = [];

            this.engine = engine;

            if (options)
                this.dummyOption = options.dummyOption;

            var me = this;

            var normLabel = document.getElementById("normLabel");
            normLabel.innerText = "Richtwert";

            var bwoLabel = document.getElementById("bwoLabel");
            bwoLabel.innerText = "BWO";

            var irwLabel = document.getElementById("irwLabel");
            irwLabel.innerText = "IRW und UF";

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
            // var headerConfig = this.engine.getHeaderConfig();

            // teilmaLabel
            elementLabelName = "teilmaLabel";
            elementLabelValue = "Teilmarkt";
            this.generateLabelElement(elementLabelName, elementLabelValue);

            // teilmaBWO
            var teilmaBWO = new FormComboBox({
                id: "teilmaBWO",
                name: "teilmaBWO",
                searchAttr: "name",
                style: "width:300px",
                onChange: function (newValue) {
                    me.refreshTable();
                },
            }, "teilmaBWO").startup();

            // genaLabel
            var genaLabel = document.getElementById("genaLabel");
            genaLabel.innerText = "Gemeinde";

            // genaBWO
            var genaBWO = new FormComboBox({
                id: "genaBWO",
                name: "genaBWO",
                value: "Aus Karte vorbelegt",
                searchAttr: "name",
                style: "width:300px",
                onChange: function (newValue) {
                    me.refreshTable();
                }
            }, "genaBWO").startup();

            // genaIRW
            var genaIRW = new dijitSimpleTextarea({
                id: "genaIRW",
                name: "genaIRW",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "aValue"
            }, "genaIRW").startup();

            // stagLabel
            var stagLabel = document.getElementById("stagLabel");
            stagLabel.innerText = "Stichtag des Immobilienrichtwertes";

            //  stagNorm
            var stagNorm = new dijitSimpleTextarea({
                id: "stagNorm",
                name: "stagNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '2021'
            }, "stagNorm").startup();

            // stagBWO
            var stagBWO = new FormComboBox({
                id: "stagBWO",
                name: "stagBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                style: "width:150px",
                onChange: function (newValue) {
                    me.refreshTable();
                }
            }, "stagBWO").startup();

        },

        // Baut die Gui auf
        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);
            var genaIRW = dijitRegistry.byId("genaIRW");
            genaIRW.textbox.value = tableConfig["zonenIrw"];
            // initialer Aufruf der Gui
            if (setControlsToNorm) {
                this.setValuesInHeaderGui(stag, teilma, zone);
            };
            // Erzeugen der Gui Elemente auf Basis der tableConfig (Daten aus DB)
            // Kopie des Arrays anlegen
            var oldVisElements = this.visElements.slice();
            // Array leeren
            this.visElements.splice(0);

            for (value in tableConfig["Eigenschaften"]) {
                var lowerCaseValue = value.toLowerCase();
                this.visElements.push(lowerCaseValue);
                if (document.getElementById("row" + lowerCaseValue) == null) {
                    this.createHtmlElement(lowerCaseValue);

                    var elementLabelName = lowerCaseValue + "Label";
                    var elementLabelValue = tableConfig["Eigenschaften"][value]["Titel"];
                    this.generateLabelElement(elementLabelName, elementLabelValue);

                    var elementNormName = lowerCaseValue + "Norm";
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    this.generateTextElement(elementNormName, elementNormValue);

                    var elementBWOName = lowerCaseValue + "BWO";
                    var elementBWOValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                    var elementBWOUIControl = tableConfig["Eigenschaften"][value]["Steuerelement"];
                    var elementBWORwKoeffizient = tableConfig["Eigenschaften"][value]["RichtwertKoeffizient"];
                    this.generateBWOElement(elementBWOName, elementBWOValue, elementBWOUIControl, elementBWORwKoeffizient);

                    var elementIRWName = lowerCaseValue + "IRW";
                    var elementIRWValue = "0%";
                    this.generateTextElement(elementIRWName, elementIRWValue);
                } else {
                    var aNormTextBox = dijitRegistry.byId(lowerCaseValue + "Norm");
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    aNormTextBox.textbox.value = elementNormValue;
                };
                var aComboBox = dijitRegistry.byId(lowerCaseValue + "BWO");
                this.getStoreValuesForComboBox(aComboBox, value);
            }
            // aktuelle Elemente sichtbar schalten
            this.visElements.forEach(function (aValue) {
                var elementId = "row" + aValue;
                var aElement = document.getElementById(elementId);
                aElement.style = "display: true;"
            });

            // Bestimmen der Element die Unsichtbar geschaltet werden müssen
            var visDiff = oldVisElements.filter(x => this.visElements.indexOf(x) === -1);
            visDiff.forEach(function (aValue) {
                var elementId = "row" + aValue;
                var aElement = document.getElementById(elementId);
                aElement.style = "display: none;"
            });
        },

        // Erzeugt das DOM für den "Standard" Teil des HTML Dokuments
        createHtmlElement: function (value) {
            var htmlFrag = document.createDocumentFragment();
            var aTr = document.createElement("tr");
            aTr.id = "row" + value;
            aTr.style = "display: true;"
            var aRow = htmlFrag.appendChild(aTr);
            var col1 = aRow.appendChild(document.createElement("td"));
            var col2 = aRow.appendChild(document.createElement("td"));
            var col3 = aRow.appendChild(document.createElement("td"));
            var col4 = aRow.appendChild(document.createElement("td"));
            col1.innerHTML = "<div id=" + value + "Label></div>";
            col2.innerHTML = "<div id=" + value + "Norm></div>";
            col3.innerHTML = "<div id=" + value + "BWO></div>";
            col4.innerHTML = "<div id=" + value + "IRW></div>";

            var rowAngIRW = document.getElementById("rowAngIRW");
            var parentNode = document.getElementById("tableBody");
            parentNode.insertBefore(htmlFrag, rowAngIRW);
        },

        // Erzeugt ein Label Element, fügt elementLabelValue im Element elementLabelName ein
        generateLabelElement: function (elementLabelName, elementLabelValue) {
            var aLabelElement = document.getElementById(elementLabelName);
            aLabelElement.innerText = elementLabelValue;
        },

        // Erzeugt ein dijit Text Element
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

        // Erzeugt ein dijit Auswahl oder Nummer Element
        generateBWOElement: function (elementBWOName, elementBWOValue, elementBWOUIControl, elementBWORwKoeffizient) {
            me = this;
            switch (elementBWOUIControl["Typ"]) {
                case "ZAHLENEINGABE":
                    var aBWOElement = new dijitNumberSpinner({
                        value: elementBWOValue,
                        smallDelta: 1,
                        constraints: { min: elementBWOUIControl["Min"], max: elementBWOUIControl["Max"], places: 0 },
                        id: elementBWOName,
                        style: "width:150px",
                        onChange: function (newValue) {
                            IdIRW = elementBWOName.replace("BWO", "IRW");
                            me.getCoeffForBWO(newValue, elementBWOUIControl, IdIRW, elementBWORwKoeffizient);
                            me.calculateIRW();
                        }
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
                            me.getCoeffForBWO(newValue, elementBWOUIControl, IdIRW, elementBWORwKoeffizient);
                            me.calculateIRW();
                        }
                    }, elementBWOName).startup();
                    break;
            }

        },

        // erzeugt die Auswahlliste für ComboBoxen
        getStoreValuesForComboBox: function (aComboBox, feld) {
            var StagBWO = dijitRegistry.byId("stagBWO");
            var currentStag = StagBWO.textbox.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            var currentGena = genaBWO.textbox.value;
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            var currentTeilma = teilmaBWO.item.id;
            var config = this.engine.getTableConfig(currentStag, currentTeilma, currentGena);
            var dataArray = config["Eigenschaften"][feld]["Steuerelement"]["Liste"];
            aComboBox.store = new Memory({
                data: dataArray
            });
        },

        // Auswahlliste für Header Element Stichtag erzeugen
        getValuesStag: function (teilma, gena) {
            var headerConfig = this.engine.getHeaderConfig();
            var stagBWO = dijitRegistry.byId("stagBWO");
            var dataArray = headerConfig["STAG"];
            console.log(dataArray);
            stagBWO.store = new Memory({
                data: dataArray
            });
        },

        // Auswahlliste für Header Element Gemeinde/Zone erzeugen
        getValuesGena: function (teilma, stag) {
            var headerConfig = this.engine.getHeaderConfig();
            var genaBWO = dijitRegistry.byId("genaBWO");
            if (stag == false) {
                var stagBWO = dijitRegistry.byId("stagBWO");
                currentStag = stagBWO.textbox.value;
            } else {
                currentStag = stag;
            };
            var dataArray = headerConfig["ZONEN"][currentStag][teilma];
            genaBWO.store = new Memory({
                data: dataArray
            });
        },

        // Auswahlliste für Header Element Teilmarkt erzeugen
        getValuesTeilma: function (stag, zone) {
            var headerConfig = this.engine.getHeaderConfig();
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            if (stag == false) {
                var stagBWO = dijitRegistry.byId("stagBWO");
                currentStag = stagBWO.textbox.value;
            } else {
                currentStag = stag;
            };

            if (zone == undefined) {
                var genaBWO = dijitRegistry.byId("genaBWO");
                currentGena = genaBWO.textbox.value;
            } else {
                currentGena = zone;
            };

            var dataArray = headerConfig["TEILMA"][currentStag];
            var resultArray = [];
            dataArray.forEach(function (aTeilma) {
                headerConfig["ZONEN"][currentStag][aTeilma.name].forEach(function (aObject){
                    if (aObject.name === currentGena){
                        resultArray.push(aTeilma);
                    }
                })
            })
            teilmaBWO.store = new Memory({
                data: resultArray
            });
        },

        // Baut den dynamischen Teil der Gui neu auf, wird bei Änderungen in den Header Elementen Aufgerufen
        refreshTable: function () {
            var genaBWO = dijitRegistry.byId("genaBWO");
            var zone = genaBWO.textbox.value;

            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            var teilma = teilmaBWO.item.id;

            var stagBWO = dijitRegistry.byId("stagBWO");
            var stag = stagBWO.textbox.value;

            // Auswahllisten für headerelemente aktualsieren
            this.getValuesStag();
            this.getValuesTeilma(stag);
            var teilma_txt = this.engine.mapDisplayNames("TEILMA", teilma.toString());
            this.getValuesGena(teilma_txt, stag);

            // check header
            var auswahlOk = false;
            var headerConfig = this.engine.getHeaderConfig();
            var headerSelection = headerConfig["ZONEN"][stag][teilma_txt];
            if (headerSelection == undefined) {
                console.log("Teilmarkt auswahl korrigieren");
                // Auswahl Zone und dynamischen Teil sperren, neuen Teilmarkt bestimmen
            };
            headerSelection.forEach(function (aObject) {
                if (aObject.name == zone) {
                    auswahlOk = true;
                    console.log("Alles ok");
                };
            })
            if (auswahlOk = false) {
                // Auswahl dynamische Elemente sperren, neue Zone bestimmen
                var genaBWO = dijitRegistry.byId("genaBWO");
            };


            this.showTable(stag, teilma, zone);
        },

        // setzt die Werte im Header der Gui
        setValuesInHeaderGui: function (stag, teilma, zone) {
            this.getValuesStag();
            var genaBWO = dijitRegistry.byId("genaBWO");
            genaBWO.textbox.value = zone;
            var teilma_txt = this.engine.mapDisplayNames("TEILMA", teilma.toString());
            this.getValuesGena(teilma_txt, stag);

            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            teilmaBWO.textbox.value = teilma_txt;
            teilmaBWO.item = { name: teilma_txt, id: teilma };
            this.getValuesTeilma(stag);

            var stagBWO = dijitRegistry.byId("stagBWO");
            stagBWO.textbox.value = stag;
        },

        // Koeffizient für Auswahl in ComboBox bestimmen und in der IRW Spalte eintragen
        // FIXME der Wert muss in die prozentuale Abweichung vom Normkoeffizienten umgerechnet werden.
        getCoeffForBWO: function (newValue, aUIControl, IdIRW, elementBWORwKoeffizient) {
            if (aUIControl["Typ"] == "AUSWAHL") {
                aUIControl["Liste"].forEach(function (object) {
                    if (object["name"] == newValue) {
                        aCoeff = object["value"];
                    };
                });
            } else {
                aCoeff = this.engine.mapValueToCoeff(newValue, aUIControl);
            };

            // var res = {key:IdIRW,value:aCoeff};

            // this.coeffStore.push(aCoeff);

            var aIRWField = dijitRegistry.byId(IdIRW);
            // aIRWField.textbox.value = aCoeff / elementBWORwKoeffizient;
            aIRWField.textbox.value = ((aCoeff - 1) * 100).toFixed(2).toString() + "%"
        },

        calculateIRW: function () {
            console.log("calculateIRW");
            // console.log(this.coeffStore);

            // var angIRWBWO = dijitRegistry.byId("angIRWBWO");
            // angIRWBWO.textbox.value = aAngIRWBWOValue;
            // var wertBWO = dijitRegistry.byId("wertBWO");
            // wertBWO.textbox.value = aWertBWOValue;

        },
    })
}
);
