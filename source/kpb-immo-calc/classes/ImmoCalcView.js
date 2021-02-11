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
                }
            }, "stagBWO").startup();

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
                // value: headerConfig["TEILMA"][stagBWOValue][0].name,
                searchAttr: "name",
                style: "width:150px",
                store: new Memory({ data: headerConfig["TEILMA"][stagBWOValue] }),
                onChange: function (newValue) {
                    console.log(newValue);
                    var anbauweiseElement = document.getElementById('rowegart');
                    var flaecheElement = document.getElementById('rowflae');
                    var standardElement = document.getElementById('rowgstand');
                    // var anzahlElement = document.getElementById('rowanzegeb');
                    if (newValue === "Eigentumswohnungen") {
                        anbauweiseElement.style = "display: none;";
                        flaecheElement.style = "display: none;";
                        standardElement.style = "display: none;";
                        // anzahlElement.style = "display: true;";
                        me.getValuesGena(newValue);
                    } else {
                        anbauweiseElement.style = "display: true;";
                        flaecheElement.style = "display: true;";
                        standardElement.style = "display: true;";
                        // anzahlElement.style = "display: none;";
                        me.getValuesGstand();
                        me.getValuesEgart();
                        me.getValuesGena(newValue);
                    };
                },
            }, "teilmaBWO").startup();

            // genaLabel
            // zoneBWO
            // zoneIRW

        },

        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);
            // Fixme Hier wird ein fester initialer Wert vorgegeben.
            var genaBWO = dijitRegistry.byId("genaBWO");
            genaBWO.textbox.value = zone;

            var genaIRW = dijitRegistry.byId("genaIRW");
            genaIRW.textbox.value = tableConfig["zonenIrw"];

            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            teilmaBWO.value = teilma;

            // Erzeugen der Gui Elemente auf Basis der tableConfig (Daten aus DB)
            for (value in tableConfig["Eigenschaften"]) {

                var lowerCaseValue = value.toLowerCase();
                this.createHtmlElement(lowerCaseValue);

                elementLabelName = lowerCaseValue + "Label";
                elementLabelValue = tableConfig["Eigenschaften"][value]["Titel"];
                this.generateLabelElement(elementLabelName, elementLabelValue);

                elementNormName = lowerCaseValue + "Norm";
                elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                this.generateTextElement(elementNormName, elementNormValue);

                elementBWOName = lowerCaseValue + "BWO";
                elementBWOValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                elementBWOUIControl = tableConfig["Eigenschaften"][value]["Steuerelement"];
                this.generateBWOElement(elementBWOName, elementBWOValue, elementBWOUIControl);

                elementIRWName = lowerCaseValue + "IRW";
                elementIRWValue = "0%";
                this.generateTextElement(elementIRWName, elementIRWValue);

                // var aHTMLTag = document.getElementById("row"+lowerCaseValue);
                // aHTMLTag.style.display = "true";
            }
            console.log("Table-Config:");
            console.log(tableConfig);

        },

        createHtmlElement: function (value) {
            if (document.getElementById("row" + value) == null){

                var htmlFrag = document.createDocumentFragment();
                var aTr = document.createElement("tr");
                aTr.id = "row" + value;
                aTr.style = "display: true;"
                console.log(aTr);
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
            };
        },

        generateLabelElement: function (elementLabelName, elementLabelValue) {
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
                            me.getKoefForSelection(newValue, elementBWOUIControl, IdIRW);
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

        // getValuesStag: function (newValue) {
        //     var stagBWO = dijitRegistry.byId("stagBWO");
        //     var headerConfig = this.engine.getHeaderConfig();
        //     dataArray = headerConfig["STAG"];

        //     stagBWO.store = new Memory({
        //         data: dataArray
        //     });
        // },

        // Koeffizient für Auswahl in ComboBox bestimmen und in der IRW Spalte eintragen
        // FIXME der Wert muss in die prozentuale Abweichung vom Normkoeffizienten umgerechnet werden. 
        getKoefForSelection: function (newValue, aUIControl, IdIRW) {
            for (aObject in aUIControl["Liste"]) {
                listEntry = aUIControl["Liste"][aObject];
                if (listEntry["name"] == newValue) {
                    newValueId = listEntry["id"];
                }
            }
            aKoef = this.engine.mapValueToCoeff(newValueId, aUIControl);
            var aIRWField = dijitRegistry.byId(IdIRW);
            aIRWField.textbox.value = aKoef;
        }

    });
}
);
