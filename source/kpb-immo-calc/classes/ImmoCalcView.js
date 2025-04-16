define([
    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/store/Memory',
    'dojo/number',
    'dijit/form/TextBox',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/ComboBox',
    'dijit/_WidgetBase',
    'jimu/PanelManager',
    'dojo/dom-style',
    'dijit/_Container',
    'dijit/registry',
    'jimu/loaderplugins/jquery-loader!https://code.jquery.com/jquery-git1.min.js'
], function (
    declare,
    _lang,
    Memory,
    number,
    TextBox,
    NumberSpinner,
    Dialog,
    Button,
    ComboBox,
    _WidgetBase,
    PanelManager,
    _domStyle,
    _Container,
    Registry,
    _$
) {

    return declare(null, {

        engine: null,
        fmeFlowBaseUrl: null,
        fmeFlowTokenKpbGuest: null,
        myPanel: null,
        visElements: new Array(),
        currentZonenIRW: null,
        coeffStore: new Map(),
        rwStore: new Map(),
        changedInput: false,
        currentAddress: null,

        constructor: function (engine, widgetId, fmeFlowBaseUrl, fmeFlowTokenKpbGuest, copyright) {

            this.engine = engine;
            this.fmeFlowBaseUrl = fmeFlowBaseUrl;
            this.fmeFlowTokenKpbGuest = fmeFlowTokenKpbGuest;
            this.copyright = copyright;
            // Gui auf spätere Breite initialisieren
            var pm = PanelManager.getInstance()
            this.myPanel = pm.getPanelById(widgetId + "_panel");
            this.myPanel.resize({ w: 686, h: 540 });

            // Anzeige während des Aufbaus der Gui
            var elementName = "anmerkungLabel";
            var text = "<font size='4'> Hole Daten...</font>";
            document.getElementById(elementName).innerHTML = text;
            document.getElementById("rowStag").style = "display: none";
            document.getElementById("rowTeilma").style = "display: none";
            document.getElementById("rowGena").style = "display: none";
        },

        /**
         * Erzeugt den statischen Teil der Gui
         */
        buildBaseGui: function () {
            var me = this;
            // Überschriften Zeile
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
            this.generateTextElement(elementName, elementValue, "headerTextBoxSmall");

            // Trenner Zeile
            elementName = "seperatorBottom";
            elementValue = "";
            this.generateTextElement(elementName, elementValue, "headerBoxLarge");

            // Ergebnisfelder
            elementName = "angIRWLabel";
            elementValue = "angepasster Richtwert IRW pro m² (gerundet)";
            this.generateTextElement(elementName, elementValue, "textBoxXtraLarge");

            elementName = "angIRWBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue, "textBoxSmall");

            elementName = "wertLabel";
            elementValue = "geschätzter Wert der Immobilie (gerundet)";
            this.generateTextElement(elementName, elementValue, "textBoxXtraLarge");

            elementName = "wertBWO";
            elementValue = "berechneter Wert";
            this.generateTextElement(elementName, elementValue, "textBoxSmall");

            // Trenner Zeile
            elementName = "seperatorBottom2";
            elementValue = "";
            this.generateTextElement(elementName, elementValue, "headerBoxLarge");

            // Anmerkungen
            elementName = "anmerkungLabel";
            text1 = "Der berechnete Immobilienpreis entspricht nicht dem Verkehrswert gem. §194 BauGB. Dieser kann nur duch ein Verkehrswertgutachten ermittelt werden. ";
            text2 = "Erläuterungen zu den Merkmalen und Informationen zu Ansprechpartnern finden Sie auf den ";
            aLink = "<a href='https://www.kreis-paderborn.de/gutachterausschuss/Produkte/Immobilienrichtwerte---Kalkula/immobilienrichtwerte---kalkulator.html' target='_blank'> Internetseiten des Gutachterausschusses</a>.";
            document.getElementById(elementName).innerHTML = text1 + text2 + aLink;

            // Button Zurücksetzen auf Richtwerte
            var standardButton = new Button({
                label: "Zurücksetzen auf Richtwerte",
                onClick: function () {
                    me.resetToRichtwert();
                }
            }, "standardButton").startup();

            // Button PDF esrstellen
            var plotButton = new Button({
                label: "PDF erstellen",
                onClick: function () {
                    me.printPdf();
                }
            }, "plotButton").startup();

            // Copyright Bemerkung
            elementName = "copyrightLabel";
            var yearString = new Date(Date.now()).getFullYear();
            text1 = "© Gutachterausschuss für Grundstückswerte im Kreis Paderborn, " + yearString;
            document.getElementById(elementName).innerHTML = text1;
        },

        /**
         * Das Widget übergibt hier die Adresse, die zuletzt über das Adress-Suche-Widget "Search" gefunden wurde.
         */
        initialiseAddressLocation: function (addressObject) {

            if (addressObject) {
                this.currentAddress = addressObject;
            } else {
                this.currentAddress = null;
            }
        },

        /**
         * genreriert die Headerelemente
         */
        initialiseHeader: function () {
            var me = this;
            // Beschriftung Teilmarkt
            var elementName = "teilmaLabel";
            var elementValue = "Teilmarkt";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            // Auswahlbox Teilmarkt
            var teilmaBWO = new ComboBox({
                id: "teilmaBWO",
                name: "teilmaBWO",
                searchAttr: "name",
                class: "stdInputBoxLarge",
                onChange: function (newValue) {
                    me.refreshTable("teilma");
                },
            }, "teilmaBWO").startup();

            // Beschriftung Zone/Gemeindename 
            elementName = "genaLabel";
            elementValue = "Name der Zone";
            this.generateTextElement(elementName, elementValue, "stdTextBox");

            // Auswahlbox Zone/Gemeindename 
            var genaBWO = new ComboBox({
                id: "genaBWO",
                name: "genaBWO",
                value: "Aus Karte vorbelegt",
                searchAttr: "name",
                class: "stdInputBoxLarge",
                onChange: function (newValue) {
                    me.refreshTable("zone");
                }
            }, "genaBWO").startup();

            // Testbox für IRW
            elementName = "genaIRW";
            elementValue = "aValue";
            this.generateTextElement(elementName, elementValue, "textBoxSmall");

            // Beschriftung Stichtag
            elementName = "stagLabel";
            elementValue = "Stichtag des Immobilienrichtwertes";
            this.generateTextElement(elementName, elementValue, "textBoxLarge");

            // Auswahlbox Stichtag
            var stagBWO = new ComboBox({
                id: "stagBWO",
                name: "stagBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                class: "stdInputBox",
                onChange: function (newValue) {
                    me.refreshTable("stag");
                }
            }, "stagBWO").startup();

            // Sichtbar schalten der Header Elemente
            document.getElementById("rowStag").style = "display: true";
            document.getElementById("rowTeilma").style = "display: true";
            document.getElementById("rowGena").style = "display: true";

            // Erzeugen der statischen GUI Elemente unterhalb des Headers
            this.buildBaseGui();
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
            var genaIRW = Registry.byId("genaIRW");
            genaIRW.set("value", tableConfig["zonenIrw_txt"]);
            this.currentZonenIRW = tableConfig["zonenIrw"];
            // initialer Aufruf der Gui aus dem Widget
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
                    this.generateTextElement(elementIRWName, elementIRWValue, "textBoxSmall");
                } else {
                    // für die bestehenden Zeilen den Richtwert aktualisieren
                    var aNormTextBox = Registry.byId(lowerCaseValue + "Norm");
                    var elementNormValue = tableConfig["Eigenschaften"][value]["Richtwert"];
                    aNormTextBox.set("value", elementNormValue);
                };
                // Anpassen der Auswahlmöglichkeiten und Spannen
                var aComboBox = Registry.byId(lowerCaseValue + "BWO");
                this.getStoreValuesForComboBox(aComboBox, value);

                // Anpassen von InSteuerelement und RichtwertKoeffizient
                if (this.changedInput === false) {
                    var newValue = tableConfig["Eigenschaften"][value]["WertInSteuerelement"];
                    aComboBox.set("value", newValue);
                    aComboBox.set("class", "stdInputBox");
                    this.getCoeffForBWO(newValue, lowerCaseValue);
                } else {
                    newValue = aComboBox.value;
                    this.getCoeffForBWO(newValue, lowerCaseValue);
                    this.markChangedInput();
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
                if (aElement != null) {
                    aElement.style = "display: none;"
                }
            });
            // Ergebnisfelder aktualisieren
            this.calculateIRW()
            // Panel Höhe
            var height = this.visElements.length * 36 + 415;
            this.myPanel.resize({ h: height });
        },

        /**
         * Erzeugt das DOM für den "Standard" Teil des HTML Dokuments
         * @param {*} value Post- bzw Prefix des Elements 
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
            var aTextElement = new TextBox({
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
                    var aBWOElement = new NumberSpinner({
                        value: elementBWOValue,
                        smallDelta: 1,
                        rangeMessage: "Bitte einen Wert zwischen " + elementBWOUIControl["Min"] + " und " + elementBWOUIControl["Max"] + " eingeben.",
                        invalidMessage: "Bitte eine Zahl eingeben.",
                        constraints: {
                            min: elementBWOUIControl["Min"],
                            max: elementBWOUIControl["Max"],
                            places: 0,
                            pattern: "#"
                        },
                        id: elementBWOName,
                        class: "stdInputBox",
                        onChange: function (newValue) {
                            if (this.disabled === false) {
                                me.changeTrigger(newValue, elementPrefix);
                            }
                        },
                        onKeyUp: function (event) {
                            if (this.disabled === false) {
                                var newValue = this.value;
                                me.changeTrigger(newValue, elementPrefix);
                            }
                        },
                        onClick: function (event) {
                            if (this.disabled === false) {
                                var newValue = this.value;
                                me.changeTrigger(newValue, elementPrefix);
                            }
                        }
                    }, elementBWOName).startup();
                    break;
                case "AUSWAHL":
                    var aBWOElement = new ComboBox({
                        id: elementBWOName,
                        name: elementBWOName,
                        value: elementBWOValue.toString(),
                        searchAttr: "name",
                        class: "stdInputBox",
                        onChange: function (newValue) {
                            me.changeTrigger(newValue, elementPrefix);
                        }
                    }, elementBWOName).startup();
                    break;
            }
        },

        /**
         * trigger Methode für Eingaben
         * @param {*} newValue 
         * @param {*} elementPrefix 
         */
        changeTrigger: function (newValue, elementPrefix) {
            var config = this.getCurrentConfig();
            var aSteuerWert = config["Eigenschaften"][elementPrefix.toUpperCase()]["WertInSteuerelement"];
            if (newValue != aSteuerWert) {
                this.changedInput = true;
                this.markChangedInput();
            };
            this.getCoeffForBWO(newValue, elementPrefix);
            this.calculateIRW();
        },

        /**
         * Holt den tableConfig für die im Header einestellten Werte
         */
        getCurrentConfig: function () {
            var StagBWO = Registry.byId("stagBWO");
            var currentStag = StagBWO.value;
            var genaBWO = Registry.byId("genaBWO");
            var currentGena = genaBWO.value;
            var teilmaBWO = Registry.byId("teilmaBWO");
            var currentTeilma = teilmaBWO.item.id;
            return this.engine.getTableConfig(currentStag, currentTeilma, currentGena);
        },

        /**
         * erzeugt die Auswahlliste für ComboBoxen oder definiert den Wertebereich für eine Zahleneingabe
         * @param {*} aDijitElement Eingabeelement
         * @param {*} feld Name des Eingabeelements
         */
        getStoreValuesForComboBox: function (aDijitElement, feld) {
            var config = this.getCurrentConfig();
            var aSteuerelement = config["Eigenschaften"][feld]["Steuerelement"]
            switch (aSteuerelement["Typ"]) {
                case "ZAHLENEINGABE":
                    aDijitElement.set("rangeMessage", "Bitte einen Wert zwischen " + aSteuerelement["Min"] + " und " + aSteuerelement["Max"] + " eingeben.");
                    aDijitElement.set("constraints", {
                        min: aSteuerelement["Min"],
                        max: aSteuerelement["Max"],
                        places: 0,
                        pattern: "#"
                    });
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
            var stagBWO = Registry.byId("stagBWO");
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
            var genaBWO = Registry.byId("genaBWO");
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
            var teilmaBWO = Registry.byId("teilmaBWO");
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
            var stagBWO = Registry.byId("stagBWO");
            var stag = stagBWO.value;

            var teilmaBWO = Registry.byId("teilmaBWO");
            var teilma = teilmaBWO.item.id;

            var genaBWO = Registry.byId("genaBWO");
            var zone = genaBWO.value;

            // Auswahllisten für Headerelemente aktualsieren
            var teilma_txt = this.engine.mapDisplayNames("TEILMA", teilma.toString());
            switch (changedElement) {
                case "stag":
                    var teilmaValue = teilmaBWO.value;
                    var teilmaStore = this.getValuesTeilma(stag);
                    var teilmaValueOk = false;
                    if (teilmaStore != undefined) {
                        teilmaStore.forEach(function (aObject) {
                            if (aObject.name == teilmaValue) {
                                teilmaValueOk = true;
                            };
                        })
                    }
                    var genaValue = genaBWO.value;
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
                        genaBWO.set("disabled", false);
                        teilmaBWO.set("disabled", false);
                        this.disableBWOElements(false);
                        this.showTable(stag, teilma, zone);
                    } else if (teilmaValueOk != true) {
                        teilmaBWO.focus();
                        // disable alle Eingaben ausser stag und teilma
                        this.disableBWOElements(true);
                        genaBWO.set("disabled", true);
                    } else if (genaValueOk != true) {
                        genaBWO.focus();
                        // disable alle Eingaben ausser teilma und gena
                        this.disableBWOElements(true);
                        stagBWO.set("disabled", true);
                    };
                    break;
                case "teilma":
                    var genaValue = genaBWO.value;
                    this.getValuesStag();
                    var genaStore = this.getValuesGena(teilma_txt, stag);
                    var genaValueOk = false;
                    genaStore.forEach(function (aObject) {
                        if (aObject.name == genaValue) {
                            genaValueOk = true;
                        };
                    })

                    if (genaValueOk == true) {
                        genaBWO.set("disabled", false);
                        stagBWO.set("disabled", false);
                        this.disableBWOElements(false);
                        this.showTable(stag, teilma, zone);
                    } else {
                        genaBWO.focus();
                        // disable alle Eingaben ausser teilma und gena
                        this.disableBWOElements(true);
                        stagBWO.set("disabled", true);
                        genaBWO.set("disabled", false);
                    };
                    break;
                case "zone":
                    this.getValuesStag();
                    this.getValuesTeilma(stag);
                    teilmaBWO.set("disabled", false);
                    stagBWO.set("disabled", false);
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
                var aBWOElement = Registry.byId(lowerCaseValue + "BWO");
                aBWOElement.set("disabled", disable);
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
            var genaBWO = Registry.byId("genaBWO");
            genaBWO.set("value", zone);
            var teilma_txt = this.engine.mapDisplayNames("TEILMA", teilma.toString());
            this.getValuesGena(teilma_txt, stag);

            var teilmaBWO = Registry.byId("teilmaBWO");
            teilmaBWO.set("value", teilma_txt);
            teilmaBWO.item = { name: teilma_txt, id: teilma };
            this.getValuesTeilma(stag);

            var stagBWO = Registry.byId("stagBWO");
            stagBWO.set("value", stag);
        },

        /**
         * Koeffizient für Auswahl in ComboBox bestimmen und in der IRW Spalte eintragen
         * @param {*} newValue im Eingabeelement ausgewählter Wert
         * @param {string} elementPrefix Prefix der Elementbezeichnung
         */
        getCoeffForBWO: function (newValue, elementPrefix) {
            var aCoeff;
            var IdIRW = elementPrefix + "IRW";
            var config = this.getCurrentConfig();
            var aUIControl = config["Eigenschaften"][elementPrefix.toUpperCase()]["Steuerelement"]

            aCoeff = this.engine.mapValueToCoeff(newValue, aUIControl);
            aRichtwertCoeff = this.rwStore.get(elementPrefix);
            if (aCoeff != undefined && aRichtwertCoeff != undefined) {
                var aIRWField = Registry.byId(IdIRW);
                aCoeff = Math.round(aCoeff * 1000) / 1000;
                var anpassungFaktor = (aCoeff / aRichtwertCoeff);

                this.coeffStore.set(IdIRW, anpassungFaktor);
                var anpassungProzent = (anpassungFaktor - 1) * 100;

                // negative Werte mit genau 0.5 zur kleineren Zahl runden 
                if (anpassungProzent < 0 && anpassungProzent % 1 == -0.5) {
                    anpassungProzent = anpassungProzent - 0.1;
                }
                var roundAnpassungProzent = Math.round(anpassungProzent)

                aIRWField.set("value", roundAnpassungProzent + "%");
            }
        },

        /**
         * Berechnung der angepassten Werte, gerundeten Werte
         */
        calculateIRW: function () {
            var angIRWBWO = Registry.byId("angIRWBWO");
            var richtwertZone = this.currentZonenIRW;
            var myCoeffs = this.coeffStore;
            this.visElements.forEach(function (prefix) {
                var myName = (prefix + "IRW");
                var myCoeff = myCoeffs.get(myName);
                if (myCoeff != undefined) {
                    richtwertZone = richtwertZone * myCoeff;
                }
            })
            var faktor;
            // Richtwert pro m*m
            if (this.changedInput === true) {
                faktor = 10;
                richtwertZone = Math.round(richtwertZone / faktor) * faktor;
            } else {
                richtwertZone = Math.round(richtwertZone);
            }
            angIRWBWO.set("value", richtwertZone + " €/m²");

            //  Richtwert Immobilie
            var whnflBWO = Registry.byId("whnflBWO");
            var aWertBWOValue = richtwertZone * whnflBWO.value;
            // unter 200000 auf 5k runden, darüber auf 10k
            if (aWertBWOValue < 200000) {
                faktor = 5000;
            } else {
                faktor = 10000;
            }
            aWertBWOValue = Math.round(aWertBWOValue / faktor) * faktor;
            var wertBWO = Registry.byId("wertBWO");
            wertBWO.set("value", number.format(aWertBWOValue) + " €")
        },

        /**
         * Callback des Standard Buttons, setzt alle gewählten werte auf den Richtwert zurück
         */
        resetToRichtwert: function () {
            me = this;
            this.visElements.forEach(function (elementPrefix) {
                var myName = (elementPrefix + "BWO");
                var myBWO = Registry.byId(myName);
                var config = me.getCurrentConfig();
                var richtwertValue = config["Eigenschaften"][elementPrefix.toUpperCase()]["WertInSteuerelement"];
                myBWO.set("value", richtwertValue);
                myBWO.set("class", "stdInputBox");
                me.getCoeffForBWO(richtwertValue, elementPrefix);
            });
            this.changedInput = false;
            this.calculateIRW();
        },

        /**
         * Stezt die Ausprägung für alle sichtbaren Eingabelemente auf stdInputBoxBold
         */
        markChangedInput: function () {
            this.visElements.forEach(function (elementPrefix) {
                var IdBWO = elementPrefix + "BWO";
                var aBWOField = Registry.byId(IdBWO);
                aBWOField.set("class", "stdInputBoxBold");
            })
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
            var dialog = new Dialog({
                title: title,
                style: "width: 250px;text-align:center",
                content: message + "<br/>" + okButtonOnlyHide,
                closable: false
            });
            dialog.show();
        },

        /**
        * Ruft den FME Prozess zum PDF Plot auf.
        *
        */
        printPdf: function () {

            var paramAddress = "param_address=";    
            var paramAddressX = "param_address_x=";    
            var paramAddressY = "param_address_y=";
            var paramAddressStag = "param_address_stag=";
            var paramAddressTeilma = "param_address_teilma=";
            var paramAddressGena = "param_address_gena=";
            var paramHeader = "param_header=";
            var paramFeature = "param_feature=";
            var paramResult = "param_result=";
            var paramCopyright = "param_copyright=";
            var pdfParams = "";
            var seperatorNext = ";;";
            var seperatorNewLine = "~";

            var headerElementList = [["stagLabel", seperatorNext], ["stagBWO", seperatorNewLine],
            ["teilmaLabel", seperatorNext], ["teilmaBWO", seperatorNewLine],
            ["genaLabel", seperatorNext], ["genaBWO", seperatorNext], ["genaIRW", seperatorNewLine]];

            var featurePostfixList = ["Label", "Norm", "BWO", "IRW"];

            var resultElementList = [["angIRWLabel", seperatorNext], ["angIRWBWO", seperatorNewLine],
            ["wertLabel", seperatorNext], ["wertBWO", seperatorNewLine]];

            // Uebergabe Parameter fuer Adresse dem adressObject aufbauen (Addresse, x, y, Zonenname, Stichtag, Teilmarkt), optionaler Parameter
            if (this.currentAddress != null) {
                paramAddress += String(this.currentAddress.Match_addr);
                pdfParams += "&" + encodeURI(paramAddress);
                paramAddressX += this.currentAddress.X; 
                pdfParams += "&" + encodeURI(paramAddressX); 
                paramAddressY += this.currentAddress.Y;
                pdfParams += "&" + encodeURI(paramAddressY); 
            }
            paramAddressGena += document.getElementById("genaBWO").value;
            pdfParams += "&" + encodeURI(paramAddressGena); 
            paramAddressStag += document.getElementById("stagBWO").value;
            pdfParams += "&" + encodeURI(paramAddressStag); 
            paramAddressTeilma += Registry.byId("teilmaBWO").item.id;
            pdfParams += "&" + encodeURI(paramAddressTeilma); 

            // paramHeader aus den Headerelementen zusammenstellen
            headerElementList.forEach(function (aName) {
                var aElement = document.getElementById(aName[0]);
                paramHeader += String(aElement.value + aName[1]);
            });
            pdfParams += "&" + encodeURI(paramHeader);

            // paramFeature aus sichtbaren Elementen zusammenstellen          
            this.visElements.forEach(function (aValue) {
                featurePostfixList.forEach(function (aName) {
                    if (aName == "IRW") {
                        seperator = seperatorNewLine;
                    } else {
                        seperator = seperatorNext;
                    }
                    var aElement = document.getElementById(aValue + aName);
                    paramFeature += String(aElement.value + seperator);
                });
            });
            pdfParams += "&" + encodeURI(paramFeature);

            // paramResult aus berechneten Werten zusammenstellen
            resultElementList.forEach(function (aName) {
                var aElement = document.getElementById(aName[0]);
                paramResult += String(aElement.value + aName[1]);
            });
            // Eingestellte Sprache im Browser kann Tausendertrennpunkt gegen Komma ersetzt haben            
            pdfParams += "&" + encodeURI(paramResult.replace(",","."));

            // paramCopyright zusmmenstellen
            paramCopyright += this.copyright;
            pdfParams += "&" + paramCopyright;
            tokenParam = "&token=" + this.fmeFlowTokenKpbGuest;
            // FME Url mit Parametern aufrufen
            var url = this.fmeFlowBaseUrl + "/fmedatastreaming/Kreis%20PB%20-%20Gutachter%20-%20Gast/0101%20IRW-Berechnung%20als%20PDF%20streamen.fmw";
            // Url an iframe uebergeben
            document.getElementById('pdfDruck').src = url + "?tm_tag=Tagsueber_Kurze_Jobs" + pdfParams + tokenParam;
        }
    })
}
);
