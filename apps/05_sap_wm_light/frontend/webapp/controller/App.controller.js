sap.ui.define([
  "wm/light/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/ui/core/mvc/XMLView",
  "sap/m/ActionSheet",
  "sap/m/Button",
  "wm/light/service/ApiService",
  "wm/light/service/AssistantService"
], function (BaseController, JSONModel, Fragment, XMLView, ActionSheet, Button, Api, Assistant) {
  "use strict";

  // Map: nav key → view module name
  var mViewMap = {
    "home":           "wm.light.view.Home",
    "transferOrders": "wm.light.view.TransferOrder",
    "goodsReceipt":   "wm.light.view.GoodsReceipt",
    "goodsIssue":     "wm.light.view.GoodsIssue",
    "stock":          "wm.light.view.Stock",
    "materials":      "wm.light.view.Materials",
    "locations":      "wm.light.view.Locations",
    "inventory":      "wm.light.view.Inventory",
    "yard":           "wm.light.view.YardConsole",
    "admin":          "wm.light.view.Admin",
    "configWarehouse":"wm.light.view.ConfigWarehouse",
    "configMovement": "wm.light.view.ConfigMovement",
    "kpi":            "wm.light.view.Kpi",
    "kpiDetail":      "wm.light.view.KpiDetail",
    "lmsDashboard":   "wm.light.view.LmsDashboard",
    "slottingDashboard": "wm.light.view.SlottingDashboard",
    "labelPrint":     "wm.light.view.LabelPrint",
    "senasaPrint":    "wm.light.view.SenasaPrint",
    "dispatchPrint":  "wm.light.view.DispatchPrint",
    "rfMain":         "wm.light.view.RfMain",
    "layout2d":       "wm.light.view.Layout2D"
  };

  return BaseController.extend("wm.light.controller.App", {

    _oLoadedViews: {}, // Cache: key → XMLView instance

    /* ─── Lifecycle ─────────────────────────────────────────── */
    onInit: function () {
      var oApp   = this.getModel("app");
      var sToken = sessionStorage.getItem("wm_token");
      var sRaw   = sessionStorage.getItem("wm_user");

      oApp.setProperty("/loginError", false);
      oApp.setProperty("/chatbotExpanded", false);

      // Initialize ChatModel
      var oChatModel = new JSONModel({
        messages: [this._getBotWelcomeMessage()],
        inputValue: ""
      });
      this.setModel(oChatModel, "chatModel");

      var defaultUser = {
        id: 1,
        username: "admin",
        name: "Administrador SAP WM",
        email: "admin@empresa.com",
        role: "admin",
        initials: "AD",
        warehouses: ["WH001", "WH002"]
      };
      var sToken = sessionStorage.getItem("wm_token") || "mock-jwt-token-admin-wm";
      var sRaw   = sessionStorage.getItem("wm_user");
      var oUser  = defaultUser;
      if (sRaw) {
        try { oUser = JSON.parse(sRaw); } catch (e) { oUser = defaultUser; }
      }
      oUser.initials = this._initials(oUser.name || oUser.username || "AD");
      sessionStorage.setItem("wm_token", sToken);
      sessionStorage.setItem("wm_user",  JSON.stringify(oUser));

      oApp.setProperty("/token", sToken);
      oApp.setProperty("/user",  oUser);
      document.body.classList.remove("login-bg");
      this._navigateTo("home");

      // Listen for SESSION_EXPIRED events from ApiService
      sap.ui.getCore().getEventBus().subscribe(
        "wm.light", "sessionExpired", this._onSessionExpired, this
      );
      // Global navigation listener
      sap.ui.getCore().getEventBus().subscribe(
        "wm.light", "navigate", this._onNavigateEvent, this
      );
    },

    onExit: function () {
      sap.ui.getCore().getEventBus().unsubscribe(
        "wm.light", "sessionExpired", this._onSessionExpired, this
      );
      sap.ui.getCore().getEventBus().unsubscribe(
        "wm.light", "navigate", this._onNavigateEvent, this
      );
    },

    _onSessionExpired: function () {
      sessionStorage.setItem("wm_token", "mock-jwt-token-admin-wm");
      this.getModel("app").setProperty("/token", "mock-jwt-token-admin-wm");
      this._navigateTo("home");
    },

    _onNavigateEvent: function (sChannel, sEvent, oData) {
      if (oData && oData.route) {
        this._navigateTo(oData.route);
      }
    },

    /* ─── Manual Navigation ─────────────────────────────────── */
    _navigateTo: function (sKey) {
      var sActualKey = sKey || "home";
      var oNavCont   = this.byId("appNav");
      if (!oNavCont) { return; }

      if (this._oLoadedViews[sActualKey]) {
        oNavCont.to(this._oLoadedViews[sActualKey].getId());
        this.getModel("app").setProperty("/currentView", sActualKey);
        return;
      }

      var sViewName = mViewMap[sActualKey] || mViewMap["home"];
      oNavCont.setBusy(true);

      XMLView.create({ viewName: sViewName })
        .then(function (oView) {
          var oComp = this.getOwnerComponent();
          oView.setModel(oComp.getModel("i18n"), "i18n");
          oView.setModel(oComp.getModel("app"),  "app");

          this._oLoadedViews[sActualKey] = oView;
          oNavCont.setBusy(false);
          oNavCont.addPage(oView);
          oNavCont.to(oView.getId());
          this.getModel("app").setProperty("/currentView", sActualKey);
        }.bind(this))
        .catch(function (oErr) {
          oNavCont.setBusy(false);
          this.showError("Error cargando vista: " + oErr.message);
          console.error("View load error:", oErr);
        }.bind(this));
    },

    /* ─── Login Dialog (Disabled - Direct Access) ──────────── */
    _openLogin: function () {
      document.body.classList.remove("login-bg");
      this._navigateTo("home");
    },

    onLoginEscapeHandler: function (oPromise) {
      oPromise.reject(); // Cannot close login with Escape
    },

    onLogin: function () {
      var oView  = this.getView();
      var fById  = Fragment.byId.bind(Fragment, oView.getId());
      var oUser  = fById("dlgUser");
      var oPass  = fById("dlgPass");
      var oApp   = this.getModel("app");

      if (!oUser || !oPass) {
        oApp.setProperty("/loginError", true);
        return;
      }

      var sUser = oUser.getValue();
      var sPass = oPass.getValue();

      oApp.setProperty("/loginError", false);

      if (!sUser || !sPass) {
        oApp.setProperty("/loginError", true);
        return;
      }

      if (this._oLoginDialog) this._oLoginDialog.setBusy(true);

      Api.login(sUser, sPass)
        .then(function (oData) {
          var oUserObj      = oData.user || { name: sUser, username: sUser };
          oUserObj.initials = this._initials(oUserObj.name || oUserObj.username || "U");

          sessionStorage.setItem("wm_token", oData.token);
          sessionStorage.setItem("wm_user",  JSON.stringify(oUserObj));

          oApp.setProperty("/token", oData.token);
          oApp.setProperty("/user",  oUserObj);

          document.body.classList.remove("login-bg");

          if (this._oLoginDialog) {
            this._oLoginDialog.setBusy(false);
            this._oLoginDialog.close();
          }
          this._navigateTo("home");
        }.bind(this))
        .catch(function (oErr) {
          if (this._oLoginDialog) this._oLoginDialog.setBusy(false);
          oApp.setProperty("/loginError", true);
          console.error("Login failed:", oErr.message);
        }.bind(this));
    },

    /* ─── Shell Actions ─────────────────────────────────────── */
    onToggleNav: function () {
      var oPage = this.byId("toolPage");
      if (oPage) oPage.setSideExpanded(!oPage.getSideExpanded());
    },

    onGoHome: function () {
      if (window.parent && window.parent.PortalApp && typeof window.parent.PortalApp.closeModal === "function") {
        window.parent.PortalApp.closeModal();
      } else {
        window.location.href = "../../../index.html";
      }
    },

    onNavHome: function () {
      this._navigateTo("home");
    },

    onNavSelect: function (oEvent) {
      var sKey    = oEvent.getParameter("item").getKey();
      var mRoutes = {
        "home":           "home",
        "dashboard":      "home",
        "kpi":            "kpi",
        "goodsReceipt":   "goodsReceipt",
        "goodsIssue":     "goodsIssue",
        "transferOrders": "transferOrders",
        "stock":          "stock",
        "materials":      "materials",
        "locations":      "locations",
        "inventory":      "inventory",
        "yard":           "yard",
        "batches":        "materials",
        "admin":          "admin",
        "configWarehouse":"configWarehouse",
        "configMovement": "configMovement",
        "lmsDashboard":   "lmsDashboard",
        "slottingDashboard":"slottingDashboard",
        "labelPrint":     "labelPrint",
        "senasaPrint":    "senasaPrint",
        "dispatchPrint":  "dispatchPrint",
        "rfMain":         "rfMain",
        "layout2d":       "layout2d"
      };
      this._navigateTo(mRoutes[sKey] || "home");
    },

    onSearch:       function () { /* future */ },
    onNotifications:function () { this.showSuccess("Notificaciones — próximamente"); },
    onSettings:     function () { this._navigateTo("admin"); },

    onUserMenu: function () {
      if (!this._oUserMenu) {
        this._oUserMenu = new ActionSheet({
          title  : this.getModel("app").getProperty("/user/name") || "Usuario",
          buttons: [new Button({
            text : "Cerrar sesión",
            icon : "sap-icon://log",
            press: this.onLogout.bind(this)
          })]
        });
        this.getView().addDependent(this._oUserMenu);
      }
      this._oUserMenu.openBy(this.byId("userAvatar"));
    },

    onLogout: function () {
      if (this._oUserMenu) this._oUserMenu.close();
      sap.m.MessageToast.show("Sesión de usuario activa (Acceso Directo)");
      this._navigateTo("home");
    },

    onToggleChatbot: function () {
      var oApp = this.getModel("app");
      var bExpanded = oApp.getProperty("/chatbotExpanded");
      oApp.setProperty("/chatbotExpanded", !bExpanded);
      if (!bExpanded) {
        this._scrollChatToBottom();
      }
    },

    onQuickQuestion: function (oEvent) {
      var sText = oEvent.getSource().getText();
      var oModel = this.getModel("chatModel");
      if (oModel) {
        oModel.setProperty("/inputValue", sText);
        this.onSendChatMessage();
      }
    },

    _getBotWelcomeMessage: function () {
      var d = new Date();
      var time = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
      return {
        sender: "bot",
        text: "<p>¡Hola! Soy <strong>SAP Joule WMS</strong>, tu asistente virtual de almacén. Pregúntame sobre:</p>" +
          "<p>• <strong>Stock de un material:</strong> <em>'stock de Cable'</em> o <em>'stock de Switch'</em></p>" +
          "<p>• <strong>Órdenes de Traslado:</strong> <em>'¿Qué OTs están abiertas?'</em></p>" +
          "<p>• <strong>Capacidad:</strong> <em>'Ocupación del almacén'</em></p>" +
          "<p>• <strong>Flujos WM:</strong> <em>'¿Cómo hago un inventario?'</em></p>",
        timestamp: time
      };
    },

    onSendChatMessage: async function () {
      var oModel = this.getModel("chatModel");
      var sInput = oModel.getProperty("/inputValue");
      if (!sInput || !sInput.trim()) return;

      var d = new Date();
      var time = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);

      // 1. Agregar mensaje del usuario
      var aMessages = oModel.getProperty("/messages") || [];
      aMessages.push({
        sender: "user",
        text: sInput,
        timestamp: time
      });
      oModel.setProperty("/messages", aMessages);
      oModel.setProperty("/inputValue", "");

      // Scroll a bottom
      this._scrollChatToBottom();

      // 2. Simular "bot escribiendo..."
      aMessages.push({
        sender: "bot",
        text: "<p><i>SAP Joule está escribiendo...</i></p>",
        timestamp: time,
        isTyping: true
      });
      oModel.setProperty("/messages", aMessages);
      this._scrollChatToBottom();

      try {
        // Consultar al asistente
        var sReply = await Assistant.getReply(sInput, Api);
        
        // 3. Remover el "escribiendo" y agregar respuesta real
        aMessages = oModel.getProperty("/messages") || [];
        aMessages = aMessages.filter(function (m) { return !m.isTyping; });
        aMessages.push({
          sender: "bot",
          text: sReply,
          timestamp: time
        });
        oModel.setProperty("/messages", aMessages);
        this._scrollChatToBottom();
      } catch (err) {
        aMessages = oModel.getProperty("/messages") || [];
        aMessages = aMessages.filter(function (m) { return !m.isTyping; });
        aMessages.push({
          sender: "bot",
          text: "Lo siento, ocurrió un error al procesar tu consulta: " + err.message,
          timestamp: time
        });
        oModel.setProperty("/messages", aMessages);
        this._scrollChatToBottom();
      }
    },

    onClearChat: function () {
      var oModel = this.getModel("chatModel");
      if (oModel) {
        oModel.setProperty("/messages", [this._getBotWelcomeMessage()]);
        oModel.setProperty("/inputValue", "");
      }
    },

    _scrollChatToBottom: function () {
      setTimeout(function () {
        var oScroll = this.byId("chatScrollContainer");
        if (oScroll) {
          oScroll.scrollTo(0, 99999, 100);
        }
      }.bind(this), 100);
    },

    /* ─── Utilities ─────────────────────────────────────────── */
    _initials: function (sName) {
      var a = (sName || "U").trim().split(/\s+/);
      return (a[0][0] + (a[1] ? a[1][0] : "")).toUpperCase();
    }
  });
});
