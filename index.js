"use strict";
sap.ui.getCore().attachInit(() => {
    new sap.ui.core.ComponentContainer({
        name: "fritz_friends"
    }).placeAt("content");
});
