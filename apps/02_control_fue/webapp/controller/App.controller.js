sap.ui.define([
  "fue/control/controller/BaseController",
  "sap/ui/core/mvc/XMLView"
], function (BaseController, XMLView) {
  "use strict";

  var mViewMap = {
    "home":      "fue.control.view.Home",
    "dashboard": "fue.control.view.Dashboard",
    "fueList":   "fue.control.view.FUEList",
    "auditTool": "fue.control.view.AuditTool"
  };

  return BaseController.extend("fue.control.controller.App", {
    
    _oLoadedViews: {},

    onInit: function () {
      // Subscribe to global navigation
      sap.ui.getCore().getEventBus().subscribe(
        "fue.control", "navigate", this._onNavigateEvent, this
      );

      // Populate mock dataset immediately on init so views render with full model data
      this.updatePivotAndKpis();

      // Load data from server async
      this._loadInitialData();

      // Navigate to home by default
      this._navigateTo("home");
    },

    onExit: function () {
      sap.ui.getCore().getEventBus().unsubscribe(
        "fue.control", "navigate", this._onNavigateEvent, this
      );
    },

    _onNavigateEvent: function (sChannel, sEvent, oData) {
      if (oData && oData.route) {
        this._navigateTo(oData.route);
        var oSideNav = this.byId("sideNav");
        if (oSideNav) {
          oSideNav.setSelectedKey(oData.route);
        }
      }
    },

    onToggleNav: function () {
      var oAppModel = this.getModel("app");
      if (oAppModel) {
        var bExpanded = oAppModel.getProperty("/sideNavExpanded");
        oAppModel.setProperty("/sideNavExpanded", !bExpanded);
      }
    },

    onNavSelect: function (oEvent) {
      var sKey = oEvent.getParameter("item").getKey();
      this._navigateTo(sKey);
    },

    _navigateTo: function (sKey) {
      var sActualKey = sKey || "home";
      var oNavCont = this.byId("appNav");
      if (!oNavCont) return;

      if (this._oLoadedViews[sActualKey]) {
        oNavCont.to(this._oLoadedViews[sActualKey].getId());
        var oAppModel = this.getModel("app");
        if (oAppModel) oAppModel.setProperty("/currentView", sActualKey);
        return;
      }

      var sViewName = mViewMap[sActualKey] || mViewMap["home"];
      oNavCont.setBusy(true);

      XMLView.create({ viewName: sViewName })
        .then(function (oView) {
          // Explicitly attach models to newly created view
          var oI18n = this.getModel("i18n");
          var oApp = this.getModel("app");
          var oFue = this.getModel("fueModel");

          if (oI18n) oView.setModel(oI18n, "i18n");
          if (oApp) oView.setModel(oApp, "app");
          if (oFue) oView.setModel(oFue, "fueModel");

          this._oLoadedViews[sActualKey] = oView;
          oNavCont.setBusy(false);
          oNavCont.addPage(oView);
          oNavCont.to(oView.getId());
          if (oApp) oApp.setProperty("/currentView", sActualKey);
        }.bind(this))
        .catch(function (oErr) {
          oNavCont.setBusy(false);
          this.showError("Error cargando la vista: " + oErr.message);
          console.error("View load error:", oErr);
        }.bind(this));
    },

    _loadInitialData: function () {
      fetch('/api/fue')
        .then(function (res) { return res.json(); })
        .then(function (res) {
          if (res.success && res.data && res.data.length > 0) {
            this.updatePivotAndKpis(res.data);
          }
        }.bind(this))
        .catch(function (err) {
          console.warn("Using local mock dataset due to fetch fallback:", err);
        });
    }
  });
});
