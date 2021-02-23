define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'dijit/form/TextBox',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
    "dijit/form/Button",
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
    Button,
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
        currentZonenIRW: null,
        coeffStore: new Map(),
        rwStore: new Map(),
        changedInput: new Array(),

        constructor: function (engine, options) {

            this.visElements = [];

            this.engine = engine;

            if (options)
                this.dummyOption = options.dummyOption;

            var me = this;

            var elementName = "firstLabel";
            var elementValue = "";
            this.generateTextElement(elementName, elementValue, "headerTextBox");
            elementName = "normLabel";
            elementValue = "Richtwert";
            this.generateTextElement(elementName, elementValue, "headerTextBox");
            elementName = "bwoLabel";
            elementValue = "Ihre Immobilie";
            this.generateTextElement(elementName, elementValue, "headerTextBox");
            elementName = "irwLabel";
            elementValue = "Anpassung";
            this.generateTextElement(elementName, elementValue, "headerTextBox");

            elementName = "seperatorBottom";
            elementValue = "";
            this.generateTextElement(elementName, elementValue, "header600TextBox");

            elementName = "angIRWLabel";
            elementValue = "angepasster Richtwert IRW pro m³ (gerundet)";
            this.generateTextElement(elementName, elementValue, "std450TextBox");

            elementName = "angIRWBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            elementName = "wertLabel";
            elementValue = "geschätzter Wert der Immobilie (gerundet)";
            this.generateTextElement(elementName, elementValue, "std450TextBox");

            elementName = "wertBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            elementName = "seperatorBottom2";
            elementValue = "";
            this.generateTextElement(elementName, elementValue, "header600TextBox");

            var standardButton = new Button({
                label: "Standard",
                onClick: function () {
                    me.resetToRichtwert();
                }
            }, "standardButton").startup();

            var plotButton = new Button({
                label: "Drucken",
                onClick: function () {
                    console.log("Drucken...");
                }
            }, "plotButton").startup();

        },

        /**
         * genreriert die Headerelemente
         */
        initialiseHeader: function () {
            var me = this;
            // teilmaLabel
            var elementName = "teilmaLabel";
            var elementValue = "Teilmarkt";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            // teilmaBWO
            var teilmaBWO = new FormComboBox({
                id: "teilmaBWO",
                name: "teilmaBWO",
                searchAttr: "name",
                class: "std300InputBox",
                onChange: function (newValue) {
                    me.refreshTable("teilma");
                },
            }, "teilmaBWO").startup();

            // genaLabel
            elementName = "genaLabel";
            elementValue = "Name der Zone";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            // genaBWO
            var genaBWO = new FormComboBox({
                id: "genaBWO",
                name: "genaBWO",
                value: "Aus Karte vorbelegt",
                searchAttr: "name",
                class: "std300InputBox",
                onChange: function (newValue) {
                    me.refreshTable("zone");
                }
            }, "genaBWO").startup();

            // genaIRW
            elementName = "genaIRW";
            elementValue = "aValue";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            // stagLabel
            elementName = "stagLabel";
            elementValue = "Stichtag des Immobilienrichtwertes";
            this.generateTextElement(elementName, elementValue, "std300TextBox");

            // stagBWO
            var stagBWO = new FormComboBox({
                id: "stagBWO",
                name: "stagBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                class: "stdInputBox",
                onChange: function (newValue) {
                    me.refreshTable("stag");
                }
            }, "stagBWO").startup();

        },

        /**
         * Baut die Gui auf
         * @param {*} stag Stichtag
         * @param {*} teilma Teilmarkt
         * @param {*} zone Zone/Gemeinde
         * @param {*} setControlsToNorm true/false Setzt die headerwerte initial
         */
        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);
            var genaIRW = dijitRegistry.byId("genaIRW");
            genaIRW.textbox.value = tableConfig["zonenIrw_txt"];
            this.currentZonenIRW = tableConfig["zonenIrw"];
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
                this.rwStore.set(lowerCaseValue, tableConfig["Eigenschaften"][value]["RichtwertKoeffizient"]);
                // nur wenn die Zeile noch nicht im DOM ist neu erzeugen
                if (document.getElementById("row" + lowerCaseValue) == null) {
                    this.createHtmlElement(lowerCaseValue);

                    var elementLabelName = lowerCaseValue + "Label";
                    var elementLabelValue = tableConfig["Eigenschaften"][value]["Titel"];
                    this.generateTextElement(elementLabelName, elementLabelValue, "stdTextBox");

                    var elementNormName = lowerCaseValue + "Norm";
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    this.generateTextElement(elementNormName, elementNormValue, "stdTextBox");

                    var elementBWOValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                    var elementBWOUIControl = tableConfig["Eigenschaften"][value]["Steuerelement"];
                    this.generateBWOElement(lowerCaseValue, elementBWOValue, elementBWOUIControl);

                    var elementIRWName = lowerCaseValue + "IRW";
                    var elementIRWValue = "0%";
                    this.generateTextElement(elementIRWName, elementIRWValue, "stdTextBox");
                } else {
                    // für die bestehenden Zeilen den Richtwert aktualisieren
                    var aNormTextBox = dijitRegistry.byId(lowerCaseValue + "Norm");
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    aNormTextBox.textbox.value = elementNormValue;
                };
                // Fixme die Auswahlmöglichkeiten und Spannen müssen nur bei einer Änderung des Teilmarktes angepasst werden.
                var aComboBox = dijitRegistry.byId(lowerCaseValue + "BWO");
                this.getStoreValuesForComboBox(aComboBox, value);

                // Anpassen von InSteuerelement und RichtwertKoeffizient
                if (this.changedInput.includes(lowerCaseValue) === false) {
                    var newValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                    aComboBox.textbox.value = newValue;
                    this.getCoeffForBWO(newValue, lowerCaseValue);
                } else {
                    newValue = aComboBox.value;
                    this.getCoeffForBWO(newValue, lowerCaseValue);
                };

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

            // Ergebnisfelder aktualisieren
            this.calculateIRW()

            // Panel Breite und Höhe
            //  Fixme Widget id hardcodiert
            var pm = PanelManager.getInstance()
            var aPanel = pm.getPanelById("_5_panel");
            var height = this.visElements.length * 35 + 370;
            aPanel.resize({ w: 640, h: height });
        },

        /**
         * Erzeugt das DOM für den "Standard" Teil des HTML Dokuments
         * @param {*} value Post- bzw Prefix des Elemetes 
         */
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

            var rowBottom = document.getElementById("rowBottom");
            var parentNode = document.getElementById("tableBody");
            parentNode.insertBefore(htmlFrag, rowBottom);
        },

        /**
         * Erzeugt ein dijit Text Element zur Anzeige
         * @param {*} elementTextName Name des neuenElements
         * @param {*} elementTextValue Wert des neuen Elementse
         * @param {*} aClass Klasse aus style.css 
         */
        generateTextElement: function (elementTextName, elementTextValue, aClass) {
            var aTextElement = new dijitTextbox({
                id: elementTextName,
                name: elementTextName,
                class: aClass,
                readOnly: true,
                value: elementTextValue.toString()
            }, elementTextName).startup();
        },

        /**
         * Erzeugt ein dijit Auswahl oder Nummer Element
         * @param {*} elementPrefix Prefix des Elementnamens
         * @param {*} elementBWOValue initialer wert des Elements
         * @param {*} elementBWOUIControl Control aus der DB
         */
        generateBWOElement: function (elementPrefix, elementBWOValue, elementBWOUIControl) {
            me = this;
            var elementBWOName = elementPrefix + "BWO";

            switch (elementBWOUIControl["Typ"]) {
                case "ZAHLENEINGABE":
                    var aBWOElement = new dijitNumberSpinner({
                        value: elementBWOValue,
                        smallDelta: 1,
                        // pattern: "###",
                        constraints: { min: elementBWOUIControl["Min"], max: elementBWOUIControl["Max"], places: 0 },
                        id: elementBWOName,
                        class: "stdInputBox",
                        onChange: function (newValue) {
                            me.changedInput.push(elementPrefix);
                            me.getCoeffForBWO(newValue, elementPrefix);
                            me.calculateIRW();
                        },
                        onKeyUp: function (event) {
                            me.changedInput.push(elementPrefix);
                            var newValue = this.textbox.value;
                            me.getCoeffForBWO(newValue, elementPrefix);
                            me.calculateIRW();
                        },
                        onClick: function (event) {
                            me.changedInput.push(elementPrefix);
                            var newValue = this.textbox.value;
                            me.getCoeffForBWO(newValue, elementPrefix);
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
                        class: "stdInputBox",
                        onChange: function (newValue) {
                            me.changedInput.push(elementPrefix);
                            me.getCoeffForBWO(newValue, elementPrefix);
                            me.calculateIRW();
                        }
                    }, elementBWOName).startup();
                    break;
            }

        },

        /**
         * erzeugt die Auswahlliste für ComboBoxen oder definiert den Wertebereich für eine Zahleneingabe
         * @param {*} aDijitElement Eingabeelement
         * @param {*} feld Name des Eingabeelements
         */
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

        /**
         *  Auswahlliste für Header Element Stichtag erzeugen
         */
        getValuesStag: function () {
            var headerConfig = this.engine.getHeaderConfig();
            var stagBWO = dijitRegistry.byId("stagBWO");
            var stagArray = headerConfig["STAG"];
            stagBWO.store = new Memory({
                data: stagArray
            });
            return stagArray;
        },

        /**
         * Auswahlliste für Header Element Gemeinde/Zone erzeugen
         * @param {*} teilma Teilmarkt z.B. "Eigentumswohnung"
         * @param {*} stag Stichtag als Datumstring "01.01.2021"
         */
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

        /**
         * Auswahlliste für Header Element Teilmarkt erzeugen
         * @param {*} stag Stichtag als Datumstring "01.01.2021"
         */
        getValuesTeilma: function (stag) {
            var headerConfig = this.engine.getHeaderConfig();
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            // alle Teilmärkte zu dem Stichtag
            var teilmaArray = headerConfig["TEILMA"][stag];
            teilmaBWO.store = new Memory({
                data: teilmaArray
            });
            return teilmaArray;
        },

        /**
         * Baut den dynamischen Teil der Gui neu auf, wird bei Änderungen in den Header Elementen aufgerufen
         * @param {*} changedElement stag, teilma, zone
         */
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
                    var teilmaStore = this.getValuesTeilma(stag);
                    var teilmaValueOk = false;
                    if (teilmaStore != undefined) {
                        teilmaStore.forEach(function (aObject) {
                            if (aObject.name == teilmaValue) {
                                teilmaValueOk = true;
                            };
                        })
                    }
                    var genaValue = genaBWO.textbox.value;
                    var genaStore = this.getValuesGena(teilma_txt, stag);
                    var genaValueOk = false;
                    if (genaStore != undefined) {
                        genaStore.forEach(function (aObject) {
                            if (aObject.name == genaValue) {
                                genaValueOk = true;
                            };
                        })
                    }

                    if (teilmaValueOk == true && genaValueOk == true) {
                        // enable Eingaben
                        genaBWO.disabled = false;
                        teilmaBWO.disabled = false;
                        this.disableBWOElements(false);
                        this.showTable(stag, teilma, zone);
                    } else if (teilmaValueOk != true) {
                        teilmaBWO.focus();
                        // disable alle Eingaben ausser stag und teilma
                        this.disableBWOElements(true);
                        genaBWO.disabled = true;
                    } else if (genaValueOk != true) {
                        genaBWO.focus();
                        // disable alle Eingaben ausser teilma und gena
                        this.disableBWOElements(true);
                        stagBWO.disabled = true;
                    };
                    break;
                case "teilma":
                    var genaValue = genaBWO.textbox.value;
                    this.getValuesStag();
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
                        // disable alle Eingaben ausser teilma und gena
                        this.disableBWOElements(true);
                        stagBWO.disabled = true;
                    };
                    break;
                case "zone":
                    this.getValuesStag();
                    this.getValuesTeilma(stag);
                    teilmaBWO.disabled = false;
                    stagBWO.disabled = false;
                    this.disableBWOElements(false);
                    this.showTable(stag, teilma, zone);
                    break;
            };

        },

        /**
         * De/aktiviert die Eingabemöglichkeit für alle sichtbaren Gui Elemente im Eingabeteil der Oberfläche
         * @param {*} disable true oder false
         */
        disableBWOElements: function (disable) {
            this.visElements.forEach(function (lowerCaseValue) {
                var aBWOElement = dijitRegistry.byId(lowerCaseValue + "BWO");
                aBWOElement.disabled = disable;
            })
        },

        /**
         * setzt die Werte im Header der Gui
         * @param {string} stag Stichtag
         * @param {string} teilma Teilmarkt
         * @param {string} zone Zone/Gemeinde
         */
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

        /**
         * Koeffizient für Auswahl in ComboBox bestimmen und in der IRW Spalte eintragen
         * @param {*} newValue im Eingabeelement ausgewählter Wert
         * @param {string} elementPrefix Prefix der Elementbezeichnung
         */
        getCoeffForBWO: function (newValue, elementPrefix) {
            var aCoeff;
            var IdIRW = elementPrefix + "IRW";

            var StagBWO = dijitRegistry.byId("stagBWO");
            var currentStag = StagBWO.textbox.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            var currentGena = genaBWO.textbox.value;
            var teilmaBWO = dijitRegistry.byId("teilmaBWO");
            var currentTeilma = teilmaBWO.item.id;
            var config = this.engine.getTableConfig(currentStag, currentTeilma, currentGena);
            var aUIControl = config["Eigenschaften"][elementPrefix.toUpperCase()]["Steuerelement"];

            aCoeff = this.engine.mapValueToCoeff(newValue, aUIControl);
            aRichtwertCoeff = this.rwStore.get(elementPrefix);
            if (aCoeff != undefined && aRichtwertCoeff != undefined) {
                var aIRWField = dijitRegistry.byId(IdIRW);
                var anpassungFaktor = (aCoeff / aRichtwertCoeff);

                this.coeffStore.set(IdIRW, anpassungFaktor);
                var anpassungProzent = (anpassungFaktor - 1) * 100;
                aIRWField.textbox.value = Math.round(anpassungProzent) + "%";
            }
        },

        /**
         * Berechnung der angepasste Werte, gerundete Werte
         */
        calculateIRW: function () {
            var angIRWBWO = dijitRegistry.byId("angIRWBWO");
            var richtwertZone = this.currentZonenIRW;
            var myCoeffs = this.coeffStore;
            this.visElements.forEach(function (prefix) {
                var myName = (prefix + "IRW");
                var myCoeff = myCoeffs.get(myName);
                if (myCoeff != undefined) {
                    richtwertZone = richtwertZone * myCoeff;
                }
            })
            // Richtwert pro m*m
            // auf 10 runden
            var faktor = 10;
            richtwertZone = Math.round(richtwertZone / faktor) * faktor;
            angIRWBWO.textbox.value = richtwertZone + " €/m²";

            //  Richtwert Immobilie
            var whnflBWO = dijitRegistry.byId("whnflBWO");
            var aWertBWOValue = richtwertZone * whnflBWO.textbox.value;
            // auf 10K runden
            faktor = 10000;
            aWertBWOValue = Math.round(aWertBWOValue / faktor) * 10;
            var wertBWO = dijitRegistry.byId("wertBWO");
            if (aWertBWOValue > 0) {
                wertBWO.textbox.value = aWertBWOValue + ".000 €";
            } else {
                wertBWO.textbox.value = "0 €";
            };
        },

        /**
         * Callback des Standard Buttons, setzt alle gewählten werte auf den Richtwert zurück
         */
        resetToRichtwert: function () {
            me = this;
            this.visElements.forEach(function (elementPrefix) {
                var myName = (elementPrefix + "BWO");
                var myBWO = dijitRegistry.byId(myName);
                var StagBWO = dijitRegistry.byId("stagBWO");
                var currentStag = StagBWO.textbox.value;
                var genaBWO = dijitRegistry.byId("genaBWO");
                var currentGena = genaBWO.textbox.value;
                var teilmaBWO = dijitRegistry.byId("teilmaBWO");
                var currentTeilma = teilmaBWO.item.id;
                var config = me.engine.getTableConfig(currentStag, currentTeilma, currentGena);
                var richtwertValue = config["Eigenschaften"][elementPrefix.toUpperCase()]["WertInSteuerelement"];
                myBWO.textbox.value = richtwertValue;
                me.getCoeffForBWO(richtwertValue, elementPrefix);
                me.changedInput.pop(elementPrefix);
            });
            this.calculateIRW();
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
