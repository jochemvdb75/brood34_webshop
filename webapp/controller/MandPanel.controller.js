sap.ui.define([
	"ui5/walkthrough/utils/Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
    "sap/m/MessageBox",
	"ui5/walkthrough/utils/Utilities"
], (Formatter, Controller, MessageToast, MessageBox, Utilities) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.MandPanel", {
		formatter: Formatter,
        
		onInit: function( ) {
          
        },

		async OnDelete(oEvent) {
			var json = {};
			var jsonstring;

			// Get details selection
			const oSelectedItem = oEvent.getSource();
			const oContext = oSelectedItem.getBindingContext("Mand");
			const sPath = oContext.getPath();
			var sItemId = this.byId("idProductsTable").getModel("Mand").getProperty(sPath + "/bestellingitemid");

			// Construct json string
			json.action="broodmand_deleteitem";
			json.bestellingitemid=sItemId
            json.mandid = sessionStorage.getItem("mandid");

			// Call backend basket endpoint
			var that = this;
			var myData = Utilities.returnCallBasket(json);
            myData.then(function (data) {
                // Reload model + update bindings
				var oModel = that.getOwnerComponent().getModel("Mand");
				oModel.loadData("https://www.brood34.be/data/getdata.php?entity=mand&filter=mandid eq " + json.mandid);
				that.getView().byId("idProductsTable").updateBindings();
           		}
			).catch(function (oError) {
				// Error handling
				MessageToast.show(oError);
			})
		}

	});
});