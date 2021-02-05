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

            var teilmaLabel = document.getElementById("teilmaLabel");
            teilmaLabel.innerText = "Teilmarkt";

            var tmBBRadioButton = new dijitFormRadioButton({
                checked: false,
                value: "BB",
                name: "teilmarkt",
            }, "tmBBRadioButton").startup();

            var tmEIRadioButton = new dijitFormRadioButton({
                checked: true,
                value: "EI",
                name: "teilmarkt",
                onChange: function (newValue) {
                    var anbauweiseElement = document.getElementById('rowEgart');
                    var flaecheElement = document.getElementById('rowFlaeche');
                    var standardElement = document.getElementById('rowStandard');
                    var anzahlElement = document.getElementById('rowAnzahl');

                    if (newValue) {
                        anbauweiseElement.style = "display: none;";
                        flaecheElement.style = "display: none;";
                        standardElement.style = "display: none;";
                        anzahlElement.style = "display: true;";
                        me.getValuesGena(newValue,false);
                    } else {
                        anbauweiseElement.style = "display: true;";
                        flaecheElement.style = "display: true;";
                        standardElement.style = "display: true;";
                        me.getValuesGstand();
                        me.getValuesEgart();
                        me.getValuesGena(newValue,false);
                        anzahlElement.style = "display: none;";
                    };
                },
            }, "tmEIRadioButton").startup();

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

            var egartLabel = document.getElementById("egartLabel");
            egartLabel.innerText = "Ergänzende Gebäudeart";

            var egartNorm = new dijitSimpleTextarea({
                id: "egartNorm",
                name: "egartNorm",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "freistehend"
            }, "egartNorm").startup();


            var egartBWO = new FormComboBox({
                id: "egartBWO",
                name: "egartBWO",
                value: "Bitte wählen",
                // store: anbWStore,
                searchAttr: "name",
                cols: "20",
                style: "width:150px"
            }, "egartBWO").startup();


            var egartIRW = new dijitSimpleTextarea({
                id: "egartIRW",
                name: "egartIRW",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "egartIRW").startup();


            var bjLabel = document.getElementById("bjLabel");
            bjLabel.innerText = "Baujahr";

            var bjNorm = new dijitSimpleTextarea({
                id: "bjNorm",
                name: "bjNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'vor 1959'
            }, "bjNorm").startup();


            var bjBWO = new dijitNumberSpinner({
                value: 2020,
                smallDelta: 1,
                constraints: { min: 0, max: 2021, places: 0 },
                id: "baujBWO",
                style: "width:150px"
            }, "bjBWO").startup();


            var bjIRW = new dijitSimpleTextarea({
                id: "bjIRW",
                name: "bjIRW",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "bjIRW").startup();

            var bowlLabel = document.getElementById("bowlLabel");
            bowlLabel.innerText = "Boden/Lagewert";

            var bowlNorm = new dijitSimpleTextarea({
                id: "bowlNorm",
                name: "bowlNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '51-100'
            }, "bowlNorm").startup();


            var bowlBWO = new dijitNumberSpinner({
                value: 100,
                smallDelta: 10,
                constraints: { min: 50, max: 1000, places: 0 },
                id: "bowlBWO",
                style: "width:150px"
            }, "bowlBWO").startup();


            var bowlIRW = new dijitSimpleTextarea({
                id: "bowlIRW",
                name: "bowlIRW",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "bowlIRW").startup();

            var anzegebLabel = document.getElementById("anzegebLabel");
            anzegebLabel.innerText = "Anzahl der Einheiten im Gebäude";

            var anzegebNorm = new dijitSimpleTextarea({
                id: anzegebNorm,
                name: anzegebNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '6-10'
            }, "anzegebNorm").startup();


            var anzegebBWO = new dijitNumberSpinner({
                value: 5,
                smallDelta: 1,
                constraints: { min: 0, max: 100, places: 0 },
                id: anzegebBWO,
                style: "width:150px"
            }, "anzegebBWO").startup();


            var anzegebIRW = new dijitSimpleTextarea({
                id: anzegebIRW,
                name: anzegebIRW,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "anzegebIRW").startup();

            var flaecheLabel = document.getElementById("flaecheLabel");
            flaecheLabel.innerText = "Grundstücksgröße";

            var flaecheNorm = new dijitSimpleTextarea({
                id: flaecheNorm,
                name: flaecheNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '800-10000'
            }, "flaecheNorm").startup();


            var flaecheBWO = new dijitNumberSpinner({
                value: 500,
                smallDelta: 10,
                constraints: { min: 0, max: 10000, places: 0 },
                id: flaecheBWO,
                style: "width:150px"
            }, "flaecheBWO").startup();

            var flaecheIRW = new dijitSimpleTextarea({
                id: flaecheIRW,
                name: flaecheIRW,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "flaecheIRW").startup();

            var gstandLabel = document.getElementById("gstandLabel");
            gstandLabel.innerText = "Gebäudezustand";

            var gstandNorm = new dijitSimpleTextarea({
                id: "gstandNorm",
                name: "gstandNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: "einfach",
                readonly: true
            }, "gstandNorm").startup();


            var gstandBWO = new FormComboBox({
                id: "gstandBWO",
                name: "gstandBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                style: "width:150px",
                onChange: function (newValue) {

                    this.store.query({ name: newValue }).forEach(function (object) {
                        var StandardIrw = dijitRegistry.byId("gstandIRW");
                        StandardIrw.textbox.value = object.value.toFixed(4);

                    });
                }
            }, "gstandBWO").startup();


            var gstandIRW = new dijitSimpleTextarea({
                id: "gstandIRW",
                name: "gstandIRW",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "gstandIRW").startup();

            var wflLabel = document.getElementById("wflLabel");
            wflLabel.innerText = "Wohnfläche";

            var wflNorm = new dijitSimpleTextarea({
                id: wflNorm,
                name: wflNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '120-160'
            }, "wflNorm").startup();


            var wflBWO = new dijitNumberSpinner({
                value: 75,
                smallDelta: 1,
                constraints: { min: 25, max: 300, places: 0 },
                id: wflBWO,
                style: "width:150px"
            }, "wflBWO").startup();


            var wflIRW = new dijitSimpleTextarea({
                id: wflIRW,
                name: wflIRW,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "wflIRW").startup();


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


            var stagBWO = new dijitNumberSpinner({
                value: 2021,
                smallDelta: 1,
                constraints: { min: 2021, max: 2021, places: 0 },
                id: "stagBWO",
                style: "width:150px"
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
                id: angIRWBWO,
                name: angIRWBWO,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'berechneter Wert'
            }, "angIRWBWO").startup();

            var wertLabel = document.getElementById("wertLabel");
            wertLabel.innerText = "geschätzter Wert";

            var wertBWO = new dijitSimpleTextarea({
                id: wertBWO,
                name: wertBWO,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'berechneter Wert'
            }, "wertBWO").startup();


            // var StandardBWO = dijitRegistry.byId("stdBWO");
            // console.log(StandardBWO);
            // tc.watch("selectedChildWidget", function(name, oval, nval){
            //     console.log("selected child changed from ", oval, " to ", nval);
            // });

            // var rangeBaujahr = [2020,1979,2021];
            // var rangeBRW = [225,100,1000];
            // var rangeAnzahl = [7,5,100];
            // var rangeWohnflaeche = [75,0,1000];
            // var rangeWES = [2020,2015,2020];


            // var initForm = Array(8);

            // initForm[0] = [['text',''],['text',''],['text','BWO'],['text','IRW und UF']];
            // initForm[1] = [['text','Zone'],['text',''],['comboBox',this.engine.getOrte()],['text','aus DB']];
            // initForm[2] = [['text','Baujahr'],['text','aus DB'],['inputSpinner',rangeBaujahr],['text','aus DB']];
            // initForm[3] = [['text','BRW'],['text','aus Karte?'],['inputSpinner',rangeBRW],['text','aus DB']];
            // initForm[4] = [['text','Anzahl'],['text','aus DB'],['inputSpinner',rangeAnzahl],['text','aus DB']];
            // initForm[5] = [['text','Wohnfläche'],['text','aus DB'],['inputSpinner',rangeWohnflaeche],['text','aus DB']];
            // initForm[6] = [['text','WES'],['text','aus DB'],['inputSpinner',rangeWES],['text','aus DB']];
            // initForm[7] = [['text',''],['text',''],['text','angepasster IRW'],['text','aus DB']];
            // initForm[8] = [['text',''],['text','geschätzter wert'],['text','aus DB'],['text','aus DB']];

            // var count = 0;
            // for (const aLineItem of initForm) {
            //     for (const item of aLineItem) {
            //         count += 1;
            //         aName = "myarea"+count; 
            //         switch (item[0]) {
            //             case 'text':

            //                 var textarea = new dijitSimpleTextarea({
            //                     name: aName,
            //                     rows: "1",
            //                     cols: "15",
            //                     style: "width:150px",
            //                     value: item[1]
            //                 }, aName).startup();
            //                                                 break;
            //             case 'inputSpinner':
            //                 var mySpinner = new dijitNumberSpinner({
            //                     value: item[1][0],
            //                     smallDelta: 1,
            //                     constraints: { min:item[1][1], max:item[1][2], places:0 },
            //                     id: aName,
            //                     style: "width:150px"
            //                     }, aName).startup();
            //                 break;
            //             case 'comboBox':
            //                 var aComboBox = new FormComboBox({
            //                     id: aName,
            //                     name: aName,
            //                     value: "Bitte wählen",
            //                     store: item[1],
            //                     searchAttr: "name",
            //                     style: "width:150px"
            //                 }, aName).startup();
            //                 break;
            //         }
            //     }
            //}

            // var aElement = document.getElementById("immo-calc-frame");

            // aElement.addEventListener("click", function userClick(event){
            //     console.log(event.type + ' : '+ aElement.value);
            //     // startButton.disabled = false
            // }, false); 

            // var anOtherElement = document.getElementById("myarea11");

            // anOtherElement.addEventListener("click", function userClick(event){
            //     console.log(event.type + ' : '+ anOtherElement.value)
            // }, false);

        },

        initialiseHeader: function () {
            var headerConfig = this.engine.getHeaderConfig();

        },

        showTable: function (stag, teilma, zone, setControlsToNorm) {
            var tableConfig = this.engine.getTableConfig(stag, teilma, zone);

            console.log("Table-Config:");
            console.log(tableConfig);

        },

        getValuesGstand: function () {
            var StandardBWO = dijitRegistry.byId("gstandBWO");
            var StagBWO = dijitRegistry.byId("stagBWO");
            currentStag = "01.01." + StagBWO.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            currentGena = genaBWO.value;

            config = this.engine.getTableConfig(currentStag, 2, "Altenbeken");
            dataArray = config["Eigenschaften"]["GSTAND"]["Steuerelement"]["Liste"];

            StandardBWO.store = new Memory({
                data: dataArray
            });
        },

        getValuesEgart: function () {
            var egartBWO = dijitRegistry.byId("egartBWO");
            var StagBWO = dijitRegistry.byId("stagBWO");
            currentStag = "01.01." + StagBWO.value;
            var genaBWO = dijitRegistry.byId("genaBWO");
            currentGena = genaBWO.value;

            config = this.engine.getTableConfig(currentStag, 2, "Altenbeken");
            dataArray = config["Eigenschaften"]["EGART"]["Steuerelement"]["Liste"];
            egartBWO.store = new Memory({
                data: dataArray
            });
        },

        getValuesGena: function (newValue, init) {
            var genaBWO = dijitRegistry.byId("genaBWO");
           
            var headerConfig = this.engine.getHeaderConfig();
            var StagBWO = dijitRegistry.byId("stagBWO");
            currentStag = "01.01." + StagBWO.value;
            if (newValue) {
                teilmarkt = headerConfig["TEILMA"][currentStag][0];
            } else {
                teilmarkt = headerConfig["TEILMA"][currentStag][1];
            };

            dataArray = headerConfig["ZONEN"][currentStag][teilmarkt];
            
            genaBWO.store = new Memory({
                data: dataArray
            });
        }

    });
}
);
