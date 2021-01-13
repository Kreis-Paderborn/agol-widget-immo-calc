define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'dijit/form/SimpleTextarea',
    'dijit/form/NumberSpinner',
    'dijit/Dialog',
    'dijit/form/Button',
    'dijit/form/ComboBox',
    'dijit/layout/BorderContainer',
    'dijit/layout/ContentPane',
    'dijit/layout/TabContainer',
    'dojo/domReady!',
    'dojox/form/BusyButton'
], function (
    declare,
    lang,
    Memory,
    dijitSimpleTextarea,
    dijitNumberSpinner,
    dijitDialog,
    dijitFormButton,
    FormComboBox,
    LayoutBorderContainer,
    LayoutContentPane,
    LayoutTabContainer,
    dijitReady,
    BusyButton
) {

        return declare(null, {

            dummyOption: null,
            engine: null,

            constructor: function (engine, options) {

                this.engine = engine;

                if (options)
                    this.dummyOption = options.dummyOption;

                var me = this;
                var startButton = new BusyButton({
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
                }, "startButton");
                startButton.startup();
                
                var aValueStore = new Memory({
                    data: [
                        {name:"sehr gut", id:"1"},
                        {name:"gut", id:"2"},
                        {name:"befriedigend", id:"3"},
                        {name:"ausreichend", id:"4"},
                        {name:"mangelhaft", id:"5"},
                        {name:"ungenügend", id:"6"}
                    ]
                });

                var aOrteStore = new Memory({
                    data: [
                        {name:"Bad Lippspringe", id:"1"},
                        {name:"Borchen", id:"2"},
                        {name:"Delbrück", id:"3"},
                        {name:"Hövelhof", id:"4"},
                        {name:"Salzkotten", id:"5"},
                        {name:"Süd", id:"6"}
                    ]
                });

                var initForm = Array(8);

                initForm[0] = [['text',''],['text','NORM'],['text','BWO'],['text','IRW und UF']];
                initForm[1] = [['text','Zone'],['text',''],['comboBox',aOrteStore],['text','aus DB']];
                initForm[2] = [['text','BRW'],['text','aus DB'],['inputSpinner'],['text','aus DB']];
                initForm[3] = [['text','Anzahl'],['text','aus DB'],['inputSpinner'],['text','aus DB']];
                initForm[4] = [['text','Wohnfläche'],['text','aus DB'],['inputSpinner'],['text','aus DB']];
                initForm[5] = [['text','WES'],['text','aus DB'],['inputSpinner'],['text','aus DB']];
                initForm[6] = [['text',''],['text',''],['text','angepasster IRW'],['text','aus DB']];
                initForm[7] = [['text',''],['text','geschätzter wert'],['text','aus DB'],['text','aus DB']];

                var count = 0;
                for (const aLineItem of initForm) {
                    for (const item of aLineItem) {
                        count += 1;
                        aName = "myarea"+count; 
                        switch (item[0]) {
                            case 'text':
                                
                                var textarea = new dijitSimpleTextarea({
                                    name: aName,
                                    rows: "1",
                                    cols: "15",
                                    style: "width:150px",
                                    value: item[1]
                                }, aName).startup();
                                break;
                            case 'inputSpinner':
                                var mySpinner = new dijitNumberSpinner({
                                    value: 1000,
                                    smallDelta: 20,
                                    constraints: { min:9, max:1550, places:0 },
                                    id: aName,
                                    style: "width:150px"
                                    }, aName).startup();
                                break;
                            case 'comboBox':
                                var aComboBox = new FormComboBox({
                                    id: aName,
                                    name: aName,
                                    value: "Bitte wählen",
                                    store: item[1],
                                    searchAttr: "name",
                                    style: "width:150px"
                                }, aName).startup();
                                break;
                        }
                    }
                }

            }
        });
    }
);
