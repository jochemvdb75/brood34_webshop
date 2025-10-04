sap.ui.define([], function () {
	"use strict";
	return {
		// put your data functions here

        returnCallBasket: function (json) {
            return new Promise(function (resolve, reject){
                var jsonstring;

			    // Call backend
                jsonstring=JSON.stringify(json);	
            
                var that = this;
                var aData =  $.ajax({
                    url: "https://www.brood34.be/broodmand/basket.php",
                    type: 'POST',
                    data: jsonstring,
                    dataType: 'json',
                    success: function(data){
                        resolve(data);
                    },
                    error: function(oError){
                        reject(oError);
                    }
                });
            }.bind(this));
        }

	};
});