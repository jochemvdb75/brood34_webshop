sap.ui.define([
    "ui5/walkthrough/utils/Formatter",
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
    "sap/m/MessageBox",
    "ui5/walkthrough/utils/Utilities"
], (Formatter, Controller, MessageToast, MessageBox, Utilities) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.ProductPanel", {
        formatter: Formatter,

        onInit: function( ) {
            sap.ui.getCore().getMessageManager().registerObject(this.getView(), true);
            
        },

        onProductSelect(oEvent) {
            const oSelectedItem = oEvent.getSource();
			const oContext = oSelectedItem.getBindingContext("broodaanbod");
			const sPath = oContext.getPath();
			const oProductDetailPanel = this.byId("productDetailsPanel");
			oProductDetailPanel.bindElement({ path: sPath, model: "broodaanbod" });
		},

		onAddtoBasket(oEvent) {
            var json = {};
            var jsonstring;
            var sCut = "";

            // Collect input controls
			var oView = this.getView(),
            aInputs = [
              oView.byId("productOfferId")
            ],
            bValidationError = false;

            // Check that inputs are not empty.
            // Validation does not happen during data binding as this is only triggered by user actions.
            aInputs.forEach(function (oInput) {
            bValidationError = this._validateInput(oInput) || bValidationError;
            }, this);

            if (bValidationError) {
                //MessageBox.alert("A validation error has occurred. Complete your input first.");
                return;
            }

            // Get input values
            var sOfferDate = this.getView().byId("productOfferDate").mProperties.value;
            var sDetailsId = this.getView().byId("productDetailsId").mProperties.value;
            var sOfferId = this.getView().byId("productOfferId").mProperties.value;
            var sQuantity = this.getView().byId("productDetailsQuantity").mProperties.value;
            if ( this.getView().byId("productDetailsCut").mProperties.selected ) {
                sCut = "gesneden";
            } else {
                sCut = "ongesneden";
            }
            
            // Call backend basket endpoint
            json.selectie={bakdatum: sOfferDate, keuze: sDetailsId, broodaanbodid: sOfferId, aantal: sQuantity, broodprijs: '',gesneden: sCut};
            json.mandid=sessionStorage.getItem("mandid");
            json.action="broodmand_add";
            jsonstring=JSON.stringify(json);	

            // Call backend basket endpoint
			var that = this;
			var myData = Utilities.returnCallBasket(json);
            myData.then(function (data) {
                // Message status
                MessageToast.show(data.status);

                // Save mandid to localstorage
                sessionStorage.setItem("mandid", data.mandid);

                // Save itemcount to localstorage
                sessionStorage.setItem("itemcount", data.itemcount);

                // Remove binding selection + clear input fields
                const oProductDetailPanel = that.byId("productDetailsPanel");
                oProductDetailPanel.unbindElement("broodaanbod");
                that.getView().byId("productDetailsQuantity").setValue("1");
                that.getView().byId("productDetailsCut").setSelected(false)

                // Update mand properties
                that.getOwnerComponent().getModel("Mand").loadData("https://www.brood34.be/data/getdata.php?entity=mand&filter=mandid eq " + data.mandid);
           		}
			).catch(function (oError) {
				// Error handling
				MessageToast.show(oError);
			})
        },

        _validateInput: function (oInput) {
			var sValueState = "None";
			var bValidationError = false;
			var oBinding = oInput.getBinding("value");

			try {
				oBinding.getType().validateValue(oInput.getValue());
			} catch (oException) {
				sValueState = "Error";
				bValidationError = true;
			}

			oInput.setValueState(sValueState);

			return bValidationError;
		}
	});
});
