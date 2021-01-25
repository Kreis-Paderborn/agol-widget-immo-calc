define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'dijit/form/SimpleTextarea',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
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

                var tc = new LayoutTabContainer({
                    style: "height: 100%; width: 100%;"
                }, "immo-calc-frame");

                var MyToolbar = declare([_WidgetBase, _Container], { });
                var toolbarBB = new MyToolbar();
                    toolbarBB.title = "IRW BB";

                    var firstButton = new BusyButton({
                        label: "Position in der Karte bestimmen",
                        busyLabel: "Warte auf Ergebnis ... ",
                        disabled: false,
                        onClick: function () {


                            var testDialog = new dijitDialog({
                                title: "Ergebnis der Berechnung",
                                style: "width: 250px;text-align:center",
                                content: me.engine.calcImmoValue(),
                                closable: true
                            });
                            testDialog.show();
                        }
                    }, "firstButton");

                    firstButton.startup();

                    var cpBBHeader = new LayoutContentPane({
                        content: "Immobilienrichtwert BB"
                        },'cpBBHeader');

                    var cpBBZone = new LayoutContentPane({
                        content: "Zone"
                        },'cpBBZone');
        
                    var cpBBAnW = new LayoutContentPane({
                    content: "Anbauweise"
                    },'cpBBAnW');

                    var cpBBBaujahr = new LayoutContentPane({
                        content: "Baujahr"
                        },'cpBBBaujahr');
        
                    var cpBBBRW = new LayoutContentPane({
                        content: "BRW"
                        },'cpBBBRW');
        
                    var cpBBFlaeche = new LayoutContentPane({
                        content: "Fläche"
                        },'cpBBFlaeche');
        
                    var cpBBStandard = new LayoutContentPane({
                        content: "Standard"
                        },'cpBBStandard');

                    var cpBBWohnfl = new LayoutContentPane({
                        content: "Wohnfläche"
                        },'cpBBWohnfl');
        
                    var cpBBWES = new LayoutContentPane({
                        content: "WES"
                        },'cpBBWES');

                        
                    var BBOrtSelect = new FormComboBox({
                                            id: "BBOrtSelect",
                                            promptMessage:"Zone",
                                            title: "Auswah des Orts",
                                            name: "BBOrtSelect",
                                            value: "Bitte wählen",                            
                                            store: this.engine.getOrte(),
                                            searchAttr: "name",
                                            style: "width:150px"
                                        }, "BBOrtSelect");

                    BBOrtSelect.startup();   

                    var BBNrSpinner = new dijitNumberSpinner({
                                            title:"1 = fEFH /N 4 = DHH, REH, RMH",
                                            value: 1,
                                            smallDelta: 3,
                                            constraints: { min:1,max:4, places:0 },
                                            id: 'BBNrSpinner',
                                            style: "width:150px"
                                        }, 'BBNrSpinner');

                    BBNrSpinner.startup();       
                    
                    var tcZone = new MyToolbar();

                    toolbarBB.addChild(cpBBHeader);
                    tcZone.addChild(cpBBZone);
                    tcZone.addChild(BBOrtSelect);
                    // toolbarBB.addChild(cpBBZone)
                    // toolbarBB.addChild(BBOrtSelect);
                    toolbarBB.addChild(tcZone);
                    toolbarBB.addChild(cpBBAnW);
                    toolbarBB.addChild(BBNrSpinner);
                    toolbarBB.addChild(cpBBBaujahr);
                    toolbarBB.addChild(cpBBBRW);
                    toolbarBB.addChild(cpBBFlaeche);
                    toolbarBB.addChild(cpBBStandard);
                    toolbarBB.addChild(cpBBWohnfl);
                    toolbarBB.addChild(cpBBWES);

                    toolbarBB.addChild(firstButton);
                    tc.addChild(toolbarBB);

                var toolbarEI = new MyToolbar();
                toolbarEI.title = "IRW EI";

                var cpEIHeader = new LayoutContentPane({
                     content: "Immobilienrichtwert EI"
                },'cpEIHeader');
                
                var cpEIZone = new LayoutContentPane({
                    content: "Zone"
                    },'cpEIZone');

                var cpEIBaujahr = new LayoutContentPane({
                    content: "Baujahr"
                    },'cpTEIBaujahr');

                var cpEIBRW = new LayoutContentPane({
                    content: "BRW"
                    },'cpEIBRW');

                var cpEIAnzWhg = new LayoutContentPane({
                    content: "Anzahl"
                    },'cpEIAnzWhg');

                var cpEIWohnfl = new LayoutContentPane({
                    content: "Wohnfläche"
                    },'cpEIWohnfl');
    
                var cpEIWES = new LayoutContentPane({
                    content: "WES"
                    },'cpEIWES');

                var EIOrtSelect = new FormComboBox({
                    id: "EIOrtSelect",
                    promptMessage:"Zone",
                    title: "Auswah des Orts",
                    name: "EIOrtSelect",
                    value: "Bitte wählen",
                    store: this.engine.getOrte(),
                    searchAttr: "name",
                    style: "width:150px"
                }, "EIOrtSelect");

                EIOrtSelect.startup();      

                var startButton = new BusyButton({
                    title: "IRW EI",
                    label: "Einen Button betäigen",
                    busyLabel: "Button wurde betätigt ... ",
                    disabled: false,
                    onClick: function () {


                        var testDialog = new dijitDialog({
                            title: "Ergebnis der Berechnung",
                            style: "width: 250px;text-align:center",
                            content: me.engine.calcImmoValue(),
                            closable: true
                        });
                        testDialog.show();
                    }
                }, "startButton");
                startButton.startup();

                toolbarEI.addChild(cpEIHeader);
                toolbarEI.addChild(cpEIZone);
                toolbarEI.addChild(EIOrtSelect);
                toolbarEI.addChild(cpEIBaujahr);
                toolbarEI.addChild(cpEIBRW);
                toolbarEI.addChild(cpEIAnzWhg);
                toolbarEI.addChild(cpEIWohnfl);
                toolbarEI.addChild(cpEIWES);    
                 
                toolbarEI.addChild(startButton);

                tc.addChild(toolbarEI);
                tc.startup();

                console.log(this.engine.getFeatureLayer());

                tc.watch("selectedChildWidget", function(name, oval, nval){
                    console.log("selected child changed from ", oval, " to ", nval);
                });

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

                var aElement = document.getElementById("immo-calc-frame");
              
                aElement.addEventListener("click", function userClick(event){
                    console.log(event.type + ' : '+ aElement.value);
                    // startButton.disabled = false
                }, false);

                // var anOtherElement = document.getElementById("myarea11");

                // anOtherElement.addEventListener("click", function userClick(event){
                //     console.log(event.type + ' : '+ anOtherElement.value)
                // }, false);
            }
        });
    }
);
