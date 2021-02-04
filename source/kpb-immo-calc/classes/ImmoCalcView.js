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
                    // var StandardBWO = dijitRegistry.byId("gstandBWO");

                    if (newValue) {
                        anbauweiseElement.style = "display: none;";
                        flaecheElement.style = "display: none;";
                        standardElement.style = "display: none;";
                        anzahlElement.style = "display: true;";
                    } else {
                        anbauweiseElement.style = "display: true;";
                        flaecheElement.style = "display: true;";
                        standardElement.style = "display: true;";
                        // me.engine.getStdFromFeatureLayer(StandardBWO,"01.01.2021",2,"Altenbeken");
                        // me.showTable("01.01.2021",2,"Altenbeken");
                        me.getValuesGstand();
                        me.getValuesEgart();
                        anzahlElement.style = "display: none;";
                    };
                },
            }, "tmEIRadioButton").startup();

            var zoneBWO = new FormComboBox({
                id: "zoneBWO",
                name: "zoneBWO",
                value: "Aus Karte vorbelegt",
                store: this.engine.getOrte(),
                searchAttr: "name",
                cols: "20",
                style: "width:150px",
                onChange: function (newValue) { console.log("zoneBWO", newValue) }
            }, "zoneBWO").startup();

            var zoneIRW = new dijitSimpleTextarea({
                id: "zoneIRW",
                name: "zoneIRW",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "aValue"
            }, "zoneIRW").startup();

            var egartLabel = new dijitSimpleTextarea({
                id: "egartLabel",
                name: "egartLabel",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "Ergänzende Gebäudeart"
            }, "egartLabel").startup();

            var egartNorm = new dijitSimpleTextarea({
                id: "egartNorm",
                name: "egartNorm",
                rows: "1",
                cols: "20",
                style: "width:150px",
                value: "freistehend"
            }, "egartNorm").startup();

            // var anbWStore = new Memory({
            //     data: [
            //         { name: "freistehendes EFH", id: "1" },
            //         { name: "DoppelHH/Reihenhaus", id: "2" }
            //     ]
            // });
            var egartBWO = new FormComboBox({
                id: "egartBWO",
                name: "egartBWO",
                value: "Bitte wählen",
                // store: anbWStore,
                searchAttr: "name",
                cols: "20",
                style: "width:150px"
            }, "egartBWO").startup();


            var egartIRWundUF = new dijitSimpleTextarea({
                id: "egartIRWundUF",
                name: "egartIRWundUF",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "egartIRWundUF").startup();


            var baujNorm = new dijitSimpleTextarea({
                id: baujNorm,
                name: baujNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'vor 1959'
            }, "baujNorm").startup();


            var baujBWO = new dijitNumberSpinner({
                value: 2020,
                smallDelta: 1,
                constraints: { min: 0, max: 2021, places: 0 },
                id: baujBWO,
                style: "width:150px"
            }, "baujBWO").startup();


            var baujIRWundUF = new dijitSimpleTextarea({
                id: baujIRWundUF,
                name: baujIRWundUF,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "baujIRWundUF").startup();


            var brwNorm = new dijitSimpleTextarea({
                id: brwNorm,
                name: brwNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '51-100'
            }, "brwNorm").startup();


            var brwBWO = new dijitNumberSpinner({
                value: 100,
                smallDelta: 10,
                constraints: { min: 50, max: 1000, places: 0 },
                id: brwBWO,
                style: "width:150px"
            }, "brwBWO").startup();


            var brwIRWundUF = new dijitSimpleTextarea({
                id: brwIRWundUF,
                name: brwIRWundUF,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "brwIRWundUF").startup();

            var anzahlNorm = new dijitSimpleTextarea({
                id: anzahlNorm,
                name: anzahlNorm,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: '6-10'
            }, "anzahlNorm").startup();


            var anzahlBWO = new dijitNumberSpinner({
                value: 5,
                smallDelta: 1,
                constraints: { min: 0, max: 100, places: 0 },
                id: anzahlBWO,
                style: "width:150px"
            }, "anzahlBWO").startup();


            var anzahlIRWundUF = new dijitSimpleTextarea({
                id: anzahlIRWundUF,
                name: anzahlIRWundUF,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "anzahlIRWundUF").startup();


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

            var flaecheIRWundUF = new dijitSimpleTextarea({
                id: flaecheIRWundUF,
                name: flaecheIRWundUF,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "flaecheIRWundUF").startup();

            var gstandLabel = new dijitSimpleTextarea({
                id: "gstandLabel",
                name: "gstandLabel",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: "Gebäudezustand"
            }, "gstandLabel").startup();

            var gstandNorm = new dijitSimpleTextarea({
                id: "gstandNorm",
                name: "gstandNorm",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: "einfach"
            }, "gstandNorm").startup();


            var gstandBWO = new FormComboBox({
                id: "gstandBWO",
                name: "gstandBWO",
                value: "Bitte wählen",
                searchAttr: "name",
                style: "width:150px",
                onChange: function (newValue) {

                    this.store.query({ name: newValue }).forEach(function (object) {
                        console.log(object);
                        // console.log(me.engine.displayNames);
                        // console.log(me.engine.externalFields);
                        // console.log(me.engine.coefficients);

                        var StandardIrw = dijitRegistry.byId("gstandIRWundUF");
                        console.log(StandardIrw);
                        StandardIrw.textbox.value = object.value.toFixed(4);

                    });
                }
            }, "gstandBWO").startup();


            var gstandIRWundUF = new dijitSimpleTextarea({
                id: "gstandIRWundUF",
                name: "gstandIRWundUF",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "gstandIRWundUF").startup();

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


            var wflIRWundUF = new dijitSimpleTextarea({
                id: wflIRWundUF,
                name: wflIRWundUF,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "wflIRWundUF").startup();

            var stagLabel = new dijitSimpleTextarea({
                id: "stagLabel",
                name: "stagLabel",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: "Stichtag des Immobilienrichtwertes"
            }, "stagLabel").startup();

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


            var stagIRWundUF = new dijitSimpleTextarea({
                id: "stagIRWundUF",
                name: "stagIRWundUF",
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'aus DB'
            }, "stagIRWundUF").startup();

            var angIRWBWO = new dijitSimpleTextarea({
                id: angIRWBWO,
                name: angIRWBWO,
                rows: "1",
                cols: "15",
                style: "width:150px",
                value: 'berechneter Wert'
            }, "angIRWBWO").startup();

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
            var ZoneBWO = dijitRegistry.byId("zoneBWO");
            currentZone = ZoneBWO.value;
            console.log("currentZone ", currentZone);
            var dataArray = this.engine.getValuesForStore("GSTAND", currentStag, 2, "Altenbeken");
            StandardBWO.store = new Memory({
                data: dataArray
            });
        },

        getValuesEgart: function () {
            var egartBWO = dijitRegistry.byId("egartBWO");
            var StagBWO = dijitRegistry.byId("stagBWO");
            currentStag = "01.01." + StagBWO.value;
            var ZoneBWO = dijitRegistry.byId("zoneBWO");
            currentZone = ZoneBWO.value;
            console.log("currentZone ", currentZone);
            var dataArray = this.engine.getValuesForStore("EGART", currentStag, 2, "Altenbeken");
            egartBWO.store = new Memory({
                data: dataArray
            });
        }



    });
}
);
