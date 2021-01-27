define([
    'dojo/_base/declare',
    "dojo/_base/lang",
    'dojo/store/Memory',
    'esri/layers/FeatureLayer'
], function (
    declare,
    lang,
    Memory,
    FeatureLayer
    ) {

        return declare(null, {

            dummyOption: null,
            
            constructor: function (options) {

                this.dummyOption = options.dummyOption;
                this.myWidget = options.myWidget

            },


            calcImmoValue: function () {

                var val = 1;

                if (this.dummyOption) {
                    val = this.dummyOption;
                } 
                return val;
            },


            getOrte: function() {
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
                return aOrteStore;
            },

            getSchulnote: function() {
                var aSchulnotenStore = new Memory({
                    data: [
                        {name:"sehr gut", id:"1"},
                        {name:"gut", id:"2"},
                        {name:"befriedigend", id:"3"},
                        {name:"ausreichend", id:"4"},
                        {name:"mangelhaft", id:"5"},
                        {name:"ungenügend", id:"6"}
                    ]
                });
                return aSchulnotenStore;
            },

            getStdFromFeatureLayer: function (StandardBWO) {
                var res = this.myWidget.getStdValueFromLayer(StandardBWO);
                console.log("in Engine",res);
               return res;
            //     var stdStore = new Memory({
            //                         data: [
            //                             {name:"sehr einfach", id:"1"},
            //                             {name:"einfach", id:"2"},
            //                             {name:"normal", id:"3"},
            //                             {name:"gehoben/Neubau", id:"4"}
            //                             ]
            //                         });
            //     return stdStore;
            },
        })
        
    }
);
