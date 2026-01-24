export function rand(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export var characters;
export function updateCharactersList() {
	characters = game.users.filter(user => !user.isGM && user.character != null).map(character => character.character);
}

import {typesRandomBooksTitle, menuRandomBooksTitle} from "./scripts/randomBooksTitle.js";
import {menuGiveItem} from "./scripts/giveItem.js";
import {menuGMPanel, GMPanelPlayersData} from "./scripts/GMPanel.js";

Hooks.on("chatMessage", (html, content, msg) => {
	let regExp;
	regExp = /(\S+)/g;
	let commands = content.match(regExp);
	let command = commands[0];

	if (command === "/rand") {
		if (commands[1].toLowerCase() == "books") {
			let type = 0
			let bookTypes = typesRandomBooksTitle.map(l => l.toLowerCase())
			if (commands[3] != undefined && bookTypes.includes(commands[3].toLowerCase())) {
				type = commands[3];
			}
			let count = 1
			if (!isNaN(commands[2])) {
				count = commands[2];
			}
			menuRandomBooksTitle(count, type);
			return false;
		}
		else {
			let chatData = WFRP_Utility.chatDataSetup(`<p>${game.i18n.format("WFRP4E.Assistant.Commands.Error.Title", {reason: game.i18n.localize("WFRP4E.Assistant.Commands.Error.Reason.Arg")})}</p><p><i>${game.i18n.localize("WFRP4E.Assistant.Commands.Error.Example")}</i></p>`);
			ChatMessage.create(chatData);
		};
	};
});

Hooks.on("getItemSheetHeaderButtons", insertHeaderButtons);

function insertHeaderButtons(itemSheet, headerButtons) {
	if (game.user.isGM && !headerButtons.some((button) => button.class === "giveItem")) {
		headerButtons.unshift({
			class: "giveItem",
			icon: "fas fa-gift",
			onclick: () => {
				updateCharactersList();
				menuGiveItem(characters, itemSheet.object.id);
			},
		});
	};
};

Hooks.on("renderItemSheet", (sheet, html, data) => {
	html.find(".giveItem").attr({"data-tooltip" : game.i18n.localize("WFRP4E.Assistant.GiveItem.Button"), "data-tooltip-direction" : "UP"});
});

window.GMPanel_tab = "details";
Hooks.on("getSceneControlButtons", (buttons) => {
	if (game.user.isGM) {
		buttons.token.tools.players_info = {
			button: true,
			icon: "fas fa-address-book",
			name: "players_info",
			title: game.i18n.localize("WFRP4E.Assistant.GMPanel.Title"),
			onClick: () => {
				let window = document.getElementById("gm-panel");
				if (!!window) {
					window.classList.add("gmPanel_close");
					window.addEventListener("animationend", () => {
						window.remove();
					});
				}
				else {
					let data = GMPanelPlayersData();
					menuGMPanel(data[0], data[1]);
				};
			}
		};
	};
});



//console.log("%cТЕСТ|ТЕСТ|ТЕСТ|ТЕСТ|ТЕСТ", "color: darkreed; font-size: 30px");