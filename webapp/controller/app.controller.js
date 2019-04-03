"use strict";
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel"
], (Controller, MessageBox, Fragment, JSONModel) => {
    return Controller.extend("fritz_friends.view.app", {
        purchaseRequest(count) {
            return new Promise((res, rej) => {
                this.getView().getModel().read("/NutzerSet('_current')", {
                    success(oData) {
                        if(oData.Diet.getTime() > Date.now())
                            rej("Nice try ;)");
                    },
                    error(oError) {
                        rej(oError.message);
                    }
                })
                this.getView().getModel().create("/TransaktionSet", {
                    Uname: "_current",
                    Pcount: count
                }, {
                    success(oData) {
                        res(oData);
                    },
                    error(oError) {
                        rej(oError.message);
                    }
                });
            });
        },

        handlePurchase(count) {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let msg = (count === 1 ? oBundle.getText("buyOneConf") : `${oBundle.getText("buyMultipleConf1")} ${count} ${oBundle.getText("buyMultipleConf2")}`) + ` (${count}€)`;
            MessageBox.confirm(msg, {
                title: oBundle.getText("pConfTitle"),
                onClose: async res => {
                    if(res == MessageBox.Action.OK) {
                        try {
                            await this.purchaseRequest(count);
                            this.getView().getModel().refresh();
                            MessageBox.success(oBundle.getText("purchaseSuccess"));
                        } catch(msg) {
                            MessageBox.error(oBundle.getText("purchaseError") + ":\n" + msg);
                        }
                    }
                }
            });
        },

        dietRequest(days) {
            return new Promise((res, rej) => {
                let timestamp = Date.now() + days * 86400000;
                this.getView().getModel().update("/NutzerSet('_current')", {
                    Diet: `/Date(${timestamp})/`
                }, {
                    success(oData) {
                        res(oData);
                    },
                    error(oError) {
                        rej(oError.message);
                    }
                });
            });
        },

        handleDiet(days) {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let msg = (days === 1 ? oBundle.getText("oneDietConf") : `${oBundle.getText("dietConf1")} ${days} ${oBundle.getText("dietConf2")}`);
            MessageBox.confirm(msg, {
                title: oBundle.getText("dietConfTitle"),
                onClose: async res => {
                    if(res == MessageBox.Action.OK) {
                        try {
                            await this.dietRequest(days);
                            MessageBox.success(oBundle.getText("dietSuccess"));
                        } catch(msg) {
                            MessageBox.error(oBundle.getText("purchaseError") + ":\n" + msg);
                        }
                    }
                }
            });
        },

        // Event handlers
        async onInit() {
            if(!this.purchaseDialog || !this.dietDialog) {
                let res = await Promise.all([
                    Fragment.load({
                        name: "fritz_friends.view.dietdialog",
                        controller: this
                    }),
                    Fragment.load({
                        name: "fritz_friends.view.purchasedialog",
                        controller: this
                    })
                ]);
                this.getView().addDependent(this.dietDialog = res[0]);
                this.getView().addDependent(this.purchaseDialog = res[1]);

                this.getView().bindElement("/NutzerSet('_current')");
            }

            this.getView().setModel(new JSONModel({
                numBottles: 1,
                numDays: 1
            }), "view");
        },
        onOpenPurchaseDialog: function() {
            this.purchaseDialog.open();
        },
        onPurchaseDialogClose: function() {
            this.purchaseDialog.close();
        },
        onBuy: function() {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            console.log("bought a bottle");

            this.handlePurchase(1, oBundle);
        },
        onBuyMultiple: function() {
            this.purchaseDialog.close();
            let count = this.getView().getModel("view").oData.numBottles
            this.handlePurchase(count);
        },


        onDietDialogOpen: function() {
            this.dietDialog.open();
        },
        onDietDialogClose: function() {
            this.dietDialog.close();
        },
        onDiet() {
            this.dietDialog.close();
            let days = this.getView().getModel("view").oData.numDays
            this.handleDiet(days);
        },
        formatBalanceColor(balance) {
            return balance < 0 ? "Critical" : "Neutral";
        }
    });
});