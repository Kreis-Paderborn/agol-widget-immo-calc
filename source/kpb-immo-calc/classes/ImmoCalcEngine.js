define([
    'dojo/_base/declare',
	"dojo/_base/lang"
], function (
    declare,
    $) {

        return declare(null, {

            dummyOption: null,
            
            constructor: function (options) {

                this.dummyOption = options.dummyOption;

            },

            calcImmoValue: function () {

                var val = 1;

                if (this.dummyOption) {
                    val = this.dummyOption;
                } 
                return val;
            }
        });
    }
);
