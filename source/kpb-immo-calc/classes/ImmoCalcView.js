define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'dijit/form/TextBox',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
    'dijit/form/ComboBox',
    "dijit/_WidgetBase",
    "jimu/PanelManager",
    "dojo/dom-style",
    "dijit/_Container",
    'dijit/registry',
    'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-git1.min.js'
], function (
    declare,
    lang,
    Memory,
    dijitTextbox,
    dijitNumberSpinner,
    dijitDialog,
    FormComboBox,
    _WidgetBase,
    PanelManager, 
    domStyle,
    _Container,
    dijitRegistry,
    $
) {

    return declare(null, {

        dummyOption: null,
        engine: null,
        visElements: null,
        coeffStore: null,
        headerStyle150: "width: 150px; height: 25px; background-color: lightblue; color: white; text-align:center",
        stdStyle150: "width: 150px; height: 35px; background-color: white; color: black; text-align:center",
        stdStyle300: "width: 300px; height: 35px; background-color: white; color: black; text-align:center",

        constructor: function (engine, options) {

            this.coeffStore = null;

            this.visElements = [];

            this.engine = engine;

            if (options)
                this.dummyOption = options.dummyOption;

            var me = this;

            var elementName = "firstLabel";
            var elementValue = "";
            this.generateTextElement(elementName, elementValue,this.headerStyle150);
            // this.generateTextElement(elementName, elementValue,"headerTextBox");
            elementName = "normLabel";
            elementValue = "Richtwert";
            this.generateTextElement(elementName, elementValue, this.headerStyle150);
            // this.generateTextElement(elementName, elementValue,"headerTextBox");
            elementName = "bwoLabel";
            elementValue =  "BWO";
            this.generateTextElement(elementName, elementValue,this.headerStyle150);
            // this.generateTextElement(elementName, elementValue,"headerTextBox");
            elementName = "irwLabel";
            elementValue = "IRW und UF";
            this.generateTextElement(elementName, elementValue,this.headerStyle150);
            // this.generateTextElement(elementName, elementValue,"headerTextBox");

            elementName = "angIRWLabel";
            elementValue = "angepasster IRW";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

            elementName = "angIRWBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

            elementName = "wertLabel";
            elementValue = "geschätzter Wert";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

            elementName = "wertBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

        },

        initialiseHeader: function () {
            var me = this;
            // teilmaLabel
            var elementName = "teilmaLabel";
            var elementValue = "Teilmarkt";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

            // teilmaBWO
            var teilmaBWO = new FormComboBox({
                id: "teilmaBWO",
                name: "teilmaBWO",
                searchAttr: "name",
                style: "width: 300px;",
                class: "comboTextAlign",
                onChange: function (newValue) {
                    me.refreshTable("teilma");
                },
            }, "teilmaBWO").startup();

            // genaLabel
            elementName = "genaLabel";
            elementValue = "Name der Zone";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");

            // genaBWO
            var genaBWO = new FormComboBox({
                id: "genaBWO",
                name: "genaBWO",
                value: "Aus Karte vorbelegt",
                searchAttr: "name",
                style: "width: 300px;",
                class: "comboTextAlign",
                onChange: function (newValue) {
                    me.refreshTable("zone");
                }
            }, "genaBWO").startup();

            // genaIRW
            elementName = "genaIRW";
            elementValue = "aValue";
            this.generateTextElement(elementName, elementValue);
            // this.generateTextElement(elementName, elementValue,"stdTextBox");
            
            // stagLabel
            elementName = "stagLabel";
            elementValue = "Stichtag des Immobilienrichtwertes";
            this.generateTextElement(elementName, elementValue,this.stdStyle300);
            // this.generateTextElement(elementName, elementValue,"std300TextBox");

            // stagBWO
            var stagBWO = new FormComboBox({
                id: "stagBWO",
                name: "stagBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                style: "width: 150px;",
                class: "comboTextAlign",
                onChange: function (newValue) {
                    me.refreshTable("stag");
                }
            }, "stagBWO").startup();

        },

        // Baut die Gui auf
        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);
            var genaIRW = dijitRegistry.byId("genaIRW");
            genaIRW.textbox.value = tableConfig["zonenIrw_txt"];
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
                // nur wenn die Zeile noch nicht im DOM ist neu erzeugen
                if (document.getElementById("row" + lowerCaseValue) == null) {
                    this.createHtmlElement(lowerCaseValue);

                    var elementLabelName = lowerCaseValue + "Label";
                    var elementLabelValue = tableConfig["Eigenschaften"][value]["Titel"];
                    this.generateTextElement(elementLabelName, elementLabelValue);
                    // this.generateTextElement(elementLabelName, elementLabelValue,"stdTextBox");

                    var elementNormName = lowerCaseValue + "Norm";
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    this.generateTextElement(elementNormName, elementNormValue);
                    // this.generateTextElement(elementNormName, elementNormValue,"stdTextBox");

                    var elementBWOName = lowerCaseValue + "BWO";
                    var elementBWOValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                    var elementBWOUIControl = tableConfig["Eigenschaften"][value]["Steuerelement"];
                    var elementBWORwKoeffizient = tableConfig["Eigenschaften"][value]["RichtwertKoeffizient"];
                    this.generateBWOElement(elementBWOName, elementBWOValue, elementBWOUIControl, elementBWORwKoeffizient);

                    var elementIRWName = lowerCaseValue + "IRW";
                    var elementIRWValue = "0%";
                    this.generateTextElement(elementIRWName, elementIRWValue);
                    // this.generateTextElement(elementIRWName, elementIRWValue,"stdTextBox");
                } else {
                    // für die bestehenden Zeilen den Richtwert aktualisieren
                    var aNormTextBox = dijitRegistry.byId(lowerCaseValue + "Norm");
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    aNormTextBox.textbox.value = elementNormValue;
                };
                // Fixme die Auswahlmöglichkeiten und Spannen müssen nur bei einer Änderung des Teilmarktes angepasst werden.
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

            // Panel Breite und Höhe
            //  Fixme Widget id hardcodiert
            var pm = PanelManager.getInstance().getPanelById("_5_panel");
            var height = this.visElements.length * 35 + 280; 
            pm.resize({w: 640,h: height});
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

        // Erzeugt ein dijit Text Elementzur Anzeige
        // generateTextElement: function (elementTextName, elementTextValue,aClass) {
        generateTextElement: function (elementTextName, elementTextValue,aStyle) {
            if (aStyle == undefined){
                aStyle = this.stdStyle150;
            };
            var aTextElement = new dijitTextbox({
                id: elementTextName,
                name: elementTextName,
                // class: aClass,
                rows: "1",
                style: aStyle,
                readOnly: true,
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
                        // pattern: "###0",
                        constraints: { min: elementBWOUIControl["Min"], max: elementBWOUIControl["Max"], places: 0 },
                        id: elementBWOName,
                        style: "width: 150px;text-align:center",
                        onChange: function (newValue) {
                            IdIRW = elementBWOName.replace("BWO", "IRW");
                            me.getCoeffForBWO(newValue, elementBWOUIControl, IdIRW, elementBWORwKoeffizient);
                            me.calculateIRW();
                        // },
                        // onKeyDown: function (newValue) {
                        //     IdIRW = elementBWOName.replace("BWO", "IRW");
                        //     me.getCoeffForBWO(newValue, elementBWOUIControl, IdIRW, elementBWORwKoeffizient);
                        //     me.calculateIRW();
                        // },
                        // onUpDown: function (newValue) {
                        //     IdIRW = elementBWOName.replace("BWO", "IRW");
                        //     me.getCoeffForBWO(newValue, elementBWOUIControl, IdIRW, elementBWORwKoeffizient);
                        //     me.calculateIRW();
                        // },
                        // onClick: function (event) {
                        //     console.log(event);
                        }
                    }, elementBWOName).startup();
                    break;
                case "AUSWAHL":
                    var aBWOElement = new FormComboBox({
                        id: elementBWOName,
                        name: elementBWOName,
                        value: elementBWOValue.toString(),
                        searchAttr: "name",
                        style: "width: 150px;",
                        class: "comboTextAlign",
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
        getStoreValuesForComboBox: function (aDijitElement, feld) {
            var StagBWO = dijitRegistry.byId("stagBWO");
            var currentStag = StagBWO.textbox.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            var currentGena = genaBWO.textbox.value;
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            var currentTeilma = teilmaBWO.item.id;
            var config = this.engine.getTableConfig(currentStag, currentTeilma, currentGena);
            var aSteuerelement = config["Eigenschaften"][feld]["Steuerelement"]
            switch (aSteuerelement["Typ"]) {
                case "ZAHLENEINGABE":
                    // aDijitElement.set(value: elementBWOValue);
                    aDijitElement.constraints = { min: aSteuerelement["Min"], max: aSteuerelement["Max"], places: 0 };
                    break;
                case "AUSWAHL":
                    var dataArray = aSteuerelement["Liste"];
                    aDijitElement.store = new Memory({
                        data: dataArray
                    });
                    break;
            }

        },

        // Auswahlliste für Header Element Stichtag erzeugen
        getValuesStag: function (teilma, gena) {
            var headerConfig = this.engine.getHeaderConfig();
            var stagBWO = dijitRegistry.byId("stagBWO");
            var stagArray = headerConfig["STAG"];
            stagBWO.store = new Memory({
                data: stagArray
            });
            return stagArray;
        },

        // Auswahlliste für Header Element Gemeinde/Zone erzeugen
        getValuesGena: function (teilma, stag) {
            var headerConfig = this.engine.getHeaderConfig();
            var genaBWO = dijitRegistry.byId("genaBWO");
            // alle Zonen zu dem Stichtag und Teilmarkt
            var zonenArray = headerConfig["ZONEN"][stag][teilma];
            genaBWO.store = new Memory({
                data: zonenArray
            });
            return zonenArray;
        },

        // Auswahlliste für Header Element Teilmarkt erzeugen
        getValuesTeilma: function (stag, zone) {
            var headerConfig = this.engine.getHeaderConfig();
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            // alle Teilmärkte zu dem Stichtag
            var teilmaArray = headerConfig["TEILMA"][stag];
            teilmaBWO.store = new Memory({
                data: teilmaArray
            });
            return teilmaArray;
        },

        // Baut den dynamischen Teil der Gui neu auf, wird bei Änderungen in den Header Elementen Aufgerufen
        refreshTable: function (changedElement) {
            var stagBWO = dijitRegistry.byId("stagBWO");
            var stag = stagBWO.textbox.value;

            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            var teilma = teilmaBWO.item.id;

            var genaBWO = dijitRegistry.byId("genaBWO");
            var zone = genaBWO.textbox.value;

            // Auswahllisten für Headerelemente aktualsieren
            var teilma_txt = this.engine.mapDisplayNames("TEILMA", teilma.toString());
            switch (changedElement) {
                case "stag":
                    var teilmaValue = teilmaBWO.textbox.value;
                    var teilmaStore = this.getValuesTeilma(stag, zone);
                    this.getValuesGena(teilma_txt, stag);
                    var teilmaValueOk = false;
                    teilmaStore.forEach(function (aObject) {
                        if (aObject.name == teilmaValue) {
                            teilmaValueOk = true;
                        };
                    })
                    if (teilmaValueOk == true) {
                        // enable Eingaben
                        genaBWO.disabled = false;
                        teilmaBWO.disabled = false;
                        this.disableBWOElements(false);
                        this.showTable(stag, teilma, zone);
                    } else {
                        teilmaBWO.focus();
                        // disable alle Eingaben ausser stag und teilma
                        this.disableBWOElements(true);
                        genaBWO.disabled = true;
                    };
                    break;
                case "teilma":
                    var genaValue = genaBWO.textbox.value;
                    this.getValuesStag(teilma_txt, zone);
                    var genaStore = this.getValuesGena(teilma_txt, stag);
                    var genaValueOk = false;
                    genaStore.forEach(function (aObject) {
                        if (aObject.name == genaValue) {
                            genaValueOk = true;
                        };
                    })

                    if (genaValueOk == true) {
                        genaBWO.disabled = false;
                        stagBWO.disabled = false;
                        this.disableBWOElements(false);
                        this.showTable(stag, teilma, zone);
                    } else {
                        genaBWO.focus();
                        // disable alle Eingaben ausser teilma und gema
                        this.disableBWOElements(true);
                        stagBWO.disabled = true;
                    };
                    break;
                case "zone":
                    this.getValuesStag(teilma_txt, zone);
                    this.getValuesTeilma(stag, zone);
                    teilmaBWO.disabled = false;
                    stagBWO.disabled = false;
                    this.disableBWOElements(false);
                    this.showTable(stag, teilma, zone);
                    break;
            };

        },

        disableBWOElements: function (disable) {
            this.visElements.forEach(function (lowerCaseValue) {
                var aBWOElement = dijitRegistry.byId(lowerCaseValue + "BWO");
                aBWOElement.disabled = disable;
            })
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
            this.getValuesTeilma(stag, zone);

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
            // Fixme 
            console.log("calculateIRW");
            // console.log(this.coeffStore);

            // var angIRWBWO = dijitRegistry.byId("angIRWBWO");
            // angIRWBWO.textbox.value = aAngIRWBWOValue;
            // var wertBWO = dijitRegistry.byId("wertBWO");
            // wertBWO.textbox.value = aWertBWOValue;

        },

        /**
         * Zeigt einen DIJIT-Dialog an.
         * Zum Schließen des Dialogs wird ein einfacher OK-Button angeboten.
         *
         *
         * @param {String} title Text, der in der Titelzeile angezeigt wrid.
         * @param {String} message Text der innerhalb des Dialogs angezeigt wird.
         */
        showDialog: function (title, message) {
            var okButtonOnlyHide = "<br><button data-dojo-type=\"dijit/form/Button\" type=\"submit\">OK</button>";
            var dialog = new dijitDialog({
                title: title,
                style: "width: 250px;text-align:center",
                content: message + "<br/>" + okButtonOnlyHide,
                closable: false
            });
            dialog.show();
        }
    })
}
);
