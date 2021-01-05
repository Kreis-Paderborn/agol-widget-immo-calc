define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dijit/Dialog',
    'dijit/form/Button',
    'dojo/domReady!',
    'dojox/form/BusyButton'
], function (
    declare,
    lang,
    dijitDialog,
    dijitFormButton,
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


            }
        });
    }
);
