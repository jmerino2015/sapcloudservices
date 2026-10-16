sap.ui.define([
    "sap/crm/customerportal/controller/BaseController",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/Input",
    "sap/m/TextArea",
    "sap/m/Select",
    "sap/m/Label",
    "sap/m/VBox",
    "sap/m/HBox",
    "sap/m/Text",
    "sap/m/Title",
    "sap/m/List",
    "sap/m/FeedListItem",
    "sap/m/FeedInput",
    "sap/ui/core/Item"
], function (
    BaseController, MessageToast, MessageBox, Dialog, Button,
    Input, TextArea, Select, Label, VBox, HBox, Text, Title,
    List, FeedListItem, FeedInput, Item
) {
    "use strict";

    return BaseController.extend("sap.crm.customerportal.controller.Community", {

        onInit: function () {
            // Community initialized
        },

        onTabSelect: function (oEvent) {
            var sKey = oEvent.getParameter("key");
            this.recordActivity("Navegación a pestaña de Comunidad: " + sKey, "Comunidad & Colaboración", "CommunityNav");
        },

        onOpenNewPostDialog: function () {
            var oInpTitle = new Input({ placeholder: "Título de la consulta o aporte técnico..." });
            var oInpContent = new TextArea({ rows: 4, placeholder: "Describe el contexto, maquinaria, parámetros técnicos o duda..." });
            var oSelCat = new Select({
                width: "100%",
                items: [
                    new Item({ key: "Eficiencia Energética", text: "Eficiencia Energética" }),
                    new Item({ key: "Mantenimiento Mecánico", text: "Mantenimiento Mecánico" }),
                    new Item({ key: "Automatización & VFD", text: "Automatización & VFD" }),
                    new Item({ key: "Buenas Prácticas PRM", text: "Buenas Prácticas PRM" })
                ]
            });

            var oDialog = new Dialog({
                title: "Crear Nuevo Tema en el Foro B2B",
                contentWidth: "500px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Label({ text: "Título del Debate", required: true }),
                            oInpTitle,
                            new Label({ text: "Categoría del Foro", class: "sapUiTinyMarginTop" }),
                            oSelCat,
                            new Label({ text: "Contenido del Aporte", required: true, class: "sapUiTinyMarginTop" }),
                            oInpContent
                        ]
                    })
                ],
                beginButton: new Button({
                    text: "Publicar (+25 pts)",
                    type: "Emphasized",
                    icon: "sap-icon://paper-plane",
                    press: function () {
                        var sTitle = oInpTitle.getValue();
                        var sCont = oInpContent.getValue();
                        if (!sTitle || !sCont) {
                            MessageBox.error("Por favor completa el título y el contenido.");
                            return;
                        }

                        var aForums = this.getModel().getProperty("/communityForums") || [];
                        var oSession = this.getModel("session").getProperty("/currentUser");

                        aForums.unshift({
                            id: "POST-0" + (aForums.length + 1),
                            title: sTitle,
                            category: oSelCat.getSelectedKey(),
                            author: oSession.name,
                            authorRank: "Master B2B",
                            date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                            likes: 1,
                            repliesCount: 0,
                            solved: false,
                            content: sCont,
                            comments: []
                        });

                        this.getModel().setProperty("/communityForums", aForums);

                        // Reward user points
                        var oGam = this.getModel().getProperty("/gamification");
                        if (oGam) {
                            oGam.userPoints += 25;
                            this.getModel().setProperty("/gamification", oGam);
                        }

                        this.recordActivity("Publicación de debate en Foro: " + sTitle + " (+25 pts)", "Comunidad", "ForumPost");

                        oDialog.close();
                        MessageToast.show("¡Tema publicado con éxito! Has ganado +25 puntos de reputación.");
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancelar",
                    press: function () { oDialog.close(); }
                })
            });

            oDialog.open();
        },

        onViewForumThread: function (oEvent) {
            var oPost = oEvent.getSource().getBindingContext().getObject();
            var oSession = this.getModel("session").getProperty("/currentUser");

            var oFeedList = new List({
                items: (oPost.comments || []).map(function (c) {
                    return new FeedListItem({
                        sender: c.author,
                        timestamp: c.date,
                        text: c.text
                    });
                })
            });

            var oFeedInput = new FeedInput({
                placeholder: "Escribe una respuesta técnica o sugerencia...",
                post: function (oEvt) {
                    var sVal = oEvt.getParameter("value");
                    if (!sVal) { return; }

                    var oNewComment = {
                        author: oSession.name,
                        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                        text: sVal
                    };

                    oPost.comments = oPost.comments || [];
                    oPost.comments.push(oNewComment);
                    oPost.repliesCount = oPost.comments.length;
                    this.getModel().refresh(true);

                    oFeedList.addItem(new FeedListItem({
                        sender: oNewComment.author,
                        timestamp: oNewComment.date,
                        text: oNewComment.text
                    }));

                    MessageToast.show("Respuesta publicada (+15 pts)");
                }.bind(this)
            });

            var oThreadDialog = new Dialog({
                title: oPost.title,
                contentWidth: "680px",
                content: [
                    new VBox({
                        class: "sapUiSmallMargin",
                        items: [
                            new Text({ text: "Categoría: " + oPost.category + " | Autor: " + oPost.author, class: "sapUiTinyText sapUiLightText" }),
                            new Text({ text: oPost.content, class: "sapUiSmallMarginTopBottom sapUiBoldText" }),
                            new Title({ text: "Respuestas de la Comunidad", level: "H4", class: "sapUiSmallMarginTopBottom" }),
                            oFeedList,
                            oFeedInput
                        ]
                    })
                ],
                endButton: new Button({
                    text: "Cerrar",
                    press: function () { oThreadDialog.close(); }
                })
            });

            oThreadDialog.open();
        },

        onPostChatter: function (oEvent) {
            var sVal = oEvent.getParameter("value");
            if (!sVal) { return; }

            var aFeeds = this.getModel().getProperty("/chatterFeeds") || [];
            var oSession = this.getModel("session").getProperty("/currentUser");

            aFeeds.unshift({
                recordId: "GENERAL-B2B",
                recordType: "Portal Chatter",
                author: oSession.name,
                avatar: "sap-icon://customer",
                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                text: sVal,
                likes: 0
            });

            this.getModel().setProperty("/chatterFeeds", aFeeds);
            MessageToast.show("Publicado en el feed de Chatter");
        }
    });
});
