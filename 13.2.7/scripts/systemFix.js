Hooks.on("createActor", async (actor, options) => {
	if (game.user.isGM && game.modules.get("babele") && game.settings.get("wfrp4e-assistant", "translateImportedActors") && options.fromCompendium) {
		let items = actor.items.contents.length;
		let updates = [];
		for (let idx = 0; idx < items; idx++) {
			let item = actor.items.contents[idx];
			let data = item.toObject();

			let pack = game.babele.packs.find(pack => pack.translated && pack.hasTranslation(data));
			if (pack) {
				let translatedData = pack.translate(data, true);
				updates.push(foundry.utils.mergeObject(translatedData, {_id: item.id}));
			};
		};
		if (updates.length) {await actor.updateEmbeddedDocuments("Item", updates)};
	};
});

Hooks.on("ready", async () => {
	if (game.modules.has("wfrp4e-archives2")) {
		WFRP4E.magicLores["greatMaw"] = game.i18n.localize("WFRP4E.MagicLores.greatMaw");
		WFRP4E.magicWind["greatMaw"] = game.i18n.localize("WFRP4E.MagicWind.greatMaw");
		WFRP4E.loreEffectDescriptions["greatMaw"] = game.i18n.localize("WFRP4E.greatMaw.descriptions");
	};

	if (game.modules.has("wfrp4e-tribes")) {
		WFRP4E.magicLores["little-waaagh"] = game.i18n.localize("WFRP4E.MagicLores.little-waaagh");
		WFRP4E.magicWind["little-waaagh"] = game.i18n.localize("WFRP4E.MagicWind.little-waaagh");
		WFRP4E.loreEffectDescriptions["little-waaagh"] = game.i18n.localize("WFRP4E.little-waaagh.descriptions");

		WFRP4E.magicLores["big-waaagh"] = game.i18n.localize("WFRP4E.MagicLores.big-waaagh");
		WFRP4E.magicWind["big-waaagh"] = game.i18n.localize("WFRP4E.MagicWind.big-waaagh");
		WFRP4E.loreEffectDescriptions["big-waaagh"] = game.i18n.localize("WFRP4E.big-waaagh.descriptions");
	};

	systemConfig().effectScripts["s6eZXfZkC1My6EXl"] = `let lore = warhammer.utility.findKey(this.effect.name.split(" ")[2], game.wfrp4e.config.magicLores);
if (args.item.type == "spell" && args.item.system.lore.value == lore) {args.item.system.cn.value = Math.max(0, args.item.system.cn.value - 1)};`;
	systemConfig().effectScripts["R6SnyF3y4Vsq6oga"] = `let lore = warhammer.utility.findKey(this.effect.name.split("(")[1].split(")")[0], game.wfrp4e.config.magicLores);
if (args.type == "channelling" && args.spell.system.lore.value == lore) {
	args.prefillModifiers.slBonus  += 1;
} else if (args.spell.system.lore.value != lore && args.spell.system.lore.value != "petty") {
	args.prefillModifiers.slBonus  -= 1;
};`;
	systemConfig().effectScripts["UsuwsmU1TUQLQVM2"] = `let lore = warhammer.utility.findKey(this.effect.name.split("(")[1].split(")")[0], game.wfrp4e.config.magicLores);
return !args.spell || (args.type == "cast" && ["petty", lore].includes(args.spell.system.lore.value));`;

	let defensive = {
		"img": "modules/wfrp4e-assistant/icons/conditions/defensive.png",
		"id": "defensive",
		"statuses": ["defensive"],
		"name": game.i18n.localize("EFFECT.OnDefensive"),
		"description": "WFRP4E.Assistant.systemFix.Defensive.Description",
		"system": {
			"condition": {
				"value": null,
				"numbered": false
			},
			"scriptData": [
				{
					"label": "@effect.name",
					"trigger": "immediate",
					"script": `let array;
if (game.settings.get("wfrp4e-assistant", "defensiveList") == 1) {
	array = this.actor.itemTypes.skill.filter(s => s.name.includes(game.i18n.localize("NAME.Melee")) || s.name.includes("Melee")|| s.name.includes(game.i18n.localize("NAME.Dodge"))|| s.name.includes("Dodge"));
} else if (game.settings.get("wfrp4e-assistant", "defensiveList") == 2) {
	array = this.actor.itemTypes.skill;
} else if (game.settings.get("wfrp4e-assistant", "defensiveList") == 3) {
	array = this.actor.itemTypes.skill.filter(s => game.settings.get("wfrp4e-assistant", "defensiveSkillsList").some(sl => s.name.includes(sl.replace(" ()", ""))));
};
if (array.length) {
	let choice;
	if (array.length == 1) {choice = array}
	else {
		choice = await ItemDialog.create(array.sort((a, b) => a.name > b.name ? 1 : -1), 1, {text: game.i18n.localize("WFRP4E.Assistant.systemFix.Defensive.Hint"), title: game.i18n.localize("WFRP4E.Assistant.systemFix.Defensive.Label")});
	};
	this.effect.updateSource({name: this.effect.name + " [" +  choice[0]?.name + "]"});
} else {ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Defensive.Undefined"))};`
				},
				{
					"label": "@effect.name",
					"trigger": "startTurn",
					"script": `if (game.settings.get("wfrp4e-assistant", "defensiveRemove")) {this.effect.delete()}`
				},
				{
					"label": "@effect.name",
					"trigger": "dialog",
					"script": "args.prefillModifiers.modifier += 20",
					"options": {
						"hideScript": "return !this.actor.isOpposing",
						"activateScript": `let skillName = this.effect.name.substring(this.effect.name.indexOf("[") + 1, this.effect.name.indexOf("]"));
return args.skill?.name == skillName;`
					}
				}
			]
		}
	};
	game.wfrp4e.config.systemEffects.defensive = defensive;
	CONFIG.statusEffects.push(defensive);
});

Hooks.on("renderActorSheetV2", (app, html, sheet) => {
	if (sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature") {
		let button;
		//Определение наличия эффекта
		let effects = sheet.document.effects.filter(e => e.name.includes(game.wfrp4e.utility.getSystemEffects().defensive.name));
		if (effects.length) {
			button = `<a class="list-button" data-tooltip="${effects[0].name}" data-uuid="${sheet.document.uuid}" style="color: var(--color-level-success-bg);" data-action="defensive"><i class="fas fa-shield"></i></a>`;
		} else {
			button = `<a class="list-button" data-tooltip="${game.i18n.localize('EFFECT.OnDefensive')}" data-uuid="${sheet.document.uuid}" style="color: var(--color-level-error-bg);" data-action="defensive"><i class="fas fa-shield"></i></a>`;
		};
		//Добавление кнопки
		html.querySelector("section[data-tab='combat']>.sheet-list>.list-header>.list-name").insertAdjacentHTML("beforeend", button);
		//Добавление события нажатия
		let a = html.querySelector("section[data-tab='combat']>.sheet-list>.list-header>.list-name>a[data-action='defensive']");
		a.addEventListener("click", function() {
			let actor = game.wfrp4e.utility.getActorFromUUID(this.dataset.uuid);
			let effects = actor.effects.filter(e => e.name.includes(game.wfrp4e.utility.getSystemEffects().defensive.name));
			if (effects.length) {
				for (let i = effects.length; i > 0; i--) {actor.deleteEmbeddedDocuments('ActiveEffect', effects.map(i => i.id))};
			} else {
				actor.createEmbeddedDocuments('ActiveEffect', [game.wfrp4e.utility.getSystemEffects().defensive]);	
			};
		});
		//Добавление дополнительной кнопки для существ
		if (sheet.document.type == "creature") {
			html.querySelector("section[data-tab='main']>.sheet-list>.list-header>.list-name").insertAdjacentHTML("beforeend", button);
			//Добавление события нажатия для дополнительной кнопки
			a = html.querySelector("section[data-tab='main']>.sheet-list>.list-header>.list-name>a[data-action='defensive']");
			a.addEventListener("click", function() {
				let actor = game.wfrp4e.utility.getActorFromUUID(this.dataset.uuid);
				let effects = actor.effects.filter(e => e.name.includes(game.wfrp4e.utility.getSystemEffects().defensive.name));
				if (effects.length) {
					for (let i = effects.length; i > 0; i--) {actor.deleteEmbeddedDocuments('ActiveEffect', effects.map(i => i.id))};
				} else {
					actor.createEmbeddedDocuments('ActiveEffect', [game.wfrp4e.utility.getSystemEffects().defensive]);	
				};
			});
		};
	};
});

/* Исправление для ошибок отображения иконок токенов в чате после перезагрузки.
В файле system/wfrp4e/wfrp4e.js	для класса WFRPTestMessageModel в функции getHeaderToken() заменить строку
	let path = token.hidden ? "systems/wfrp4e/tokens/unknown.png" : token.texture.src;
----НА
	let path = token.hidden ? "systems/wfrp4e/tokens/unknown.png" : token.texture.src.replace("*", "1");
*/