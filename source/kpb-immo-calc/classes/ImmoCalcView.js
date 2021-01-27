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
    "dijit/_Container"
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
    _Container
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
                    // onChange: function(newValue){alert(newValue);},
                    onChange: function(newValue){
                        var AnbauweiseElement = document.getElementById('rowAnbauweise');
                        var FlaecheElement = document.getElementById('rowFlaeche');
                        var StandardElement = document.getElementById('rowStandard');
                        var AnzahlElement = document.getElementById('rowAnzahl');
                                                    if (newValue) {
                                                        AnbauweiseElement.style = "display: none;";
                                                        FlaecheElement.style = "display: none;";
                                                        StandardElement.style = "display: none;";
                                                        AnzahlElement.style = "display: true;";
                                                    } else {
                                                        AnbauweiseElement.style = "display: true;";
                                                        FlaecheElement.style = "display: true;";
                                                        StandardElement.style = "display: true;";
                                                        AnzahlElement.style = "display: none;";
                                                    };
                                                },
                }, "tmEIRadioButton").startup();

                var zoneBWO = new FormComboBox({
                    id: zoneBWO,
                    name: zoneBWO,
                    value: "Aus Karte vorbelegt",
                    store: this.engine.getOrte(),
                    searchAttr: "name",
                    cols: "20",
                    style: "width:150px"
                }, "zoneBWO").startup();


                var anbWNorm = new dijitSimpleTextarea({
                                        id: anbWNorm,
                                        name: anbWNorm,
                                        rows: "1",
                                        cols: "20",
                                        style: "width:150px",
                                        value: "freistehendes EFH"
                                    }, "anbWNorm").startup();

                var anbWStore = new Memory({
                                        data: [
                                            {name:"freistehendes EFH", id:"1"},
                                            {name:"DoppelHH/Reihenhaus", id:"2"}
                                        ]
                    });
                var anbWBWO = new FormComboBox({
                                        id: anbWBWO,
                                        name: anbWBWO,
                                        value: "Bitte wählen",
                                        store: anbWStore,
                                        searchAttr: "name",
                                        cols: "20",
                                        style: "width:150px"
                                    }, "anbWBWO").startup();


                var anbWIRWundUF = new dijitSimpleTextarea({
                                        id: anbWIRWundUF,
                                       name: anbWIRWundUF,
                                       rows: "1",
                                       cols: "15",
                                       style: "width:150px",
                                       value: 'aus DB'
                                    }, "anbWIRWundUF").startup();


                var baujNorm = new dijitSimpleTextarea({
                                        id: baujNorm,
                                        name: baujNorm,
                                        rows: "1",
                                        cols: "15",
                                        style: "width:150px",
                                        value: '1-1959'
                                    }, "baujNorm").startup();

                
                var baujBWO = new dijitNumberSpinner({
                                        value: 2020,
                                        smallDelta: 1,
                                        constraints: { min:0, max:2021, places:0 },
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

            
                var brwBWO = new dijitSimpleTextarea({
                                id: brwBWO,
                                name: brwBWO,
                                rows: "1",      
                                cols: "15",
                                style: "width:150px",
                                value: 'aus Karte abgeleitet'
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
                                    constraints: { min:0, max:100, places:0 },
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

                // var flaecheStore = new Memory({
                //                     data: [
                //                         {name:"(499,649]", id:"1"},
                //                         {name:"(649,799]", id:"2"},
                //                         {name:"(799,10000]", id:"3"}
                //                         ]
                //                     });

                // var flaecheBWO = aComboBox = new FormComboBox({
                //                     id: flaecheBWO,
                //                     name: flaecheBWO,
                //                     value: "Bitte wählen",
                //                     store: flaecheStore,
                //                     searchAttr: "name",
                //                     style: "width:150px"
                //                 }, "flaecheBWO").startup();

                var flaecheBWO = new dijitNumberSpinner({
                                    value: 500,
                                    smallDelta: 10,
                                    constraints: { min:0, max:10000, places:0 },
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


                var stdNorm = new dijitSimpleTextarea({
                                id: stdNorm,
                                name: stdNorm,
                                rows: "1",
                                cols: "15",
                                style: "width:150px",
                                value: 'normal'
                            }, "stdNorm").startup();

                var stdStore = new Memory({
                                data: [
                                    {name:"sehr einfach", id:"1"},
                                    {name:"einfach", id:"2"},
                                    {name:"normal", id:"3"},
                                    {name:"gehoben/Neubau", id:"4"}
                                    ]
                                });

                var stdBWO = new FormComboBox({
                                id: stdBWO,
                                name: stdBWO,
                                value: "Bitte wählen",
                                store: stdStore,
                                searchAttr: "name",
                                style: "width:150px"
                            }, "stdBWO").startup();

            
                var stdIRWundUF = new dijitSimpleTextarea({
                            id: stdIRWundUF,
                            name: stdIRWundUF,
                            rows: "1",
                            cols: "15",
                            style: "width:150px",
                            value: 'aus DB'
                        }, "stdIRWundUF").startup();

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
                                constraints: { min:25, max:300, places:0 },
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

                var wesNorm = new dijitSimpleTextarea({
                            id: wesNorm,
                            name: wesNorm,
                            rows: "1",
                            cols: "15",
                            style: "width:150px",
                            value: '2021'
                        }, "wesNorm").startup();

    
                var wesBWO = new dijitNumberSpinner({
                            value: 2021,
                            smallDelta: 1,
                            constraints: { min:2021, max:2021, places:0 },
                            id: wesBWO,
                            style: "width:150px"
                            }, "wesBWO").startup();


                var wesIRWundUF = new dijitSimpleTextarea({
                            id: wesIRWundUF,
                            name: wesIRWundUF,
                            rows: "1",
                            cols: "15",
                            style: "width:150px",
                            value: 'aus DB'
                        }, "wesIRWundUF").startup();

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

                console.log(this.engine.getFeatureLayer());

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
            }
        });
    }
);
