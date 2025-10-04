sap.ui.define([
	"sap/ui/core/Messaging",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/model/SimpleType",
	"sap/ui/model/ValidateException",
	"sap/m/MessageBox",
	"ui5/walkthrough/utils/Utilities"
], (Messaging, Controller, JSONModel, MessageToast, SimpleType, ValidateException, MessageBox, Utilities) => {
	"use strict";

	return Controller.extend("ui5.walkthrough.controller.CheckoutPanel", {
		onInit: function () {
			var oView = this.getView(),
				oMM = Messaging;

			oView.setModel(new JSONModel({ name: "", email: "" }));

			// attach handlers for validation errors
			oMM.registerObject(oView.byId("fname"), true);
			oMM.registerObject(oView.byId("lname"), true);
			oMM.registerObject(oView.byId("email"), true);
		},

		onShowHello() {
			// read msg from i18n model
			const oBundle = this.getView().getModel("i18n").getResourceBundle();
			const sRecipient = this.getView().getModel().getProperty("/recipient/name");
			const sMsg = oBundle.getText("helloMsg", [sRecipient]);

			// show message
			MessageToast.show(sMsg);
		},

		async onOpenDialog() {
			this.oDialog ??= await this.loadFragment({
				name: "ui5.walkthrough.view.HelloDialog"
			});

			this.oDialog.open();
		},

		onCloseDialog() {
			// note: We don't need to chain to the pDialog promise, since this event-handler
			// is only called from within the loaded dialog itself.
			this.byId("helloDialog").close();
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
		},

		onNameChange: function(oEvent) {
			var oInput = oEvent.getSource();
			this._validateInput(oInput);
		},

		/**
		* Custom model type for validating an E-Mail address
		* @class
		* @extends sap.ui.model.SimpleType
		*/
		customEMailType: SimpleType.extend("email", {
			formatValue: function (oValue) {
						return oValue;
			},
		
			parseValue: function (oValue) {
				//parsing step takes place before validating step, value could be altered here
				return oValue;
			},
		
			validateValue: function (oValue) {
				// The following Regex is only used for demonstration purposes and does not cover all variations of email addresses.
				// It's always better to validate an address by simply sending an e-mail to it.
				var rexMail = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
				if (!oValue.match(rexMail)) {
					throw new ValidateException("'" + oValue + "' is not a valid e-mail address");
				}
			}
		}),

		onCheckout(oEvent) {
			var json = {};
	        var klant = {};
            var jsonstring;

			// Collect input controls
			var oView = this.getView(),
				aInputs = [
				oView.byId("fname"),
				oView.byId("lname"),
				oView.byId("email")
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

            
			// Get item count
			var sItemCount = this.getOwnerComponent().getModel("Mand").getProperty("/count");
			if ( sItemCount < 1 ) {
				MessageToast.show("Broodmand is leeg");
				return;
			}
		
			// Get input values
			var sFName = this.getView().byId("fname").mProperties.value;
			var sLName = this.getView().byId("lname").mProperties.value;
            var sEmail = this.getView().byId("email").mProperties.value;
			var sRemark = this.getView().byId("remark").mProperties.value;
			var sCarrier = this.getView().byId("carrier").getSelectedKey();
			var sPayment = this.getView().byId("payment").getSelectedKey();

			// Call backend basket endpoint
	        klant.registered = "";
			klant.voornaam = sFName;
			klant.naam = sLName;
			klant.email = sEmail;

			json.action = "broodmand_update";
			json.mandid = sessionStorage.getItem("mandid");
			json.klant = klant;
			json.carrier = sCarrier;
			json.betaalmethode = sPayment;
			json.opmerking = sRemark;

			var that = this;
			var myData = Utilities.returnCallBasket(json);
			myData.then(function (data) {
				// Success handling
				//MessageToast.show(data.status);
			}).catch(function (oError) {
				// Error handling
				MessageToast.show(oError);
			})
            
            json.action="broodmand_checkout";
			json.mandid=sessionStorage.getItem("mandid");
            jsonstring=JSON.stringify(json);	
            
			var that = this;
			myData = Utilities.returnCallBasket(json);
			myData.then(function (data) {
				// Success handling

				// Message status
				MessageToast.show(data.status);

				// Clear mandid
				sessionStorage.removeItem("mandid");
				sessionStorage.removeItem("itemcount");

				// Delete mand model
				that.getOwnerComponent().getModel("Mand").setData(null)

				// Reload model + update bindings
				//var oModel = that.getOwnerComponent().getModel("broodaanbod");
				//oModel.loadData("https://www.brood34.be/data/getdata.php?entity=broodaanbod");
				//that.getView().byId("productDetailsList").updateBindings();
				that.getOwnerComponent().getModel("broodaanbod").loadData("https://www.brood34.be/data/getdata.php?entity=broodaanbod");
        
			}).catch(function (oError) {
				// Error handling
				MessageToast.show(oError);
			})

		}
	});
});
