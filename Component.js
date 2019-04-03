"use strict";

const ODATA_SERVICE_URL = "https://fritz-friends-backend.herokuapp.com/";

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel"
], (UIComponent, ODataModel, JSONModel) => {
    function getUser() {
        return new Promise((res, rej) => {
            const req = new XMLHttpRequest();
            req.open("GET", "./backend_sim/user.json");
            req.addEventListener("loadend", () => {
                if (req.status == 200) { res(JSON.parse(req.response)); } else { rej(req.statusText); }
            });
            req.send();
        });
    }

    return UIComponent.extend("fritz_friends.Component", {
        metadata: {
            manifest: "json"
        },

        init: function() {
            UIComponent.prototype.init.apply(this, arguments);

            // Set OData-Model
            var oDataUser = new ODataModel(ODATA_SERVICE_URL + "UserSet", {
                json: true
            });
            var oDataTransaction = new ODataModel(ODATA_SERVICE_URL + "TransactionSet", {
                json: true
            });
            
            this.getView().setModel(oDataUser);
            this.getView().setModel(oDataTransaction);
        }
    });
});
