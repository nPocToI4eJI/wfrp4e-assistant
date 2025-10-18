Hooks.once("init", function () {
    game.settings.register("wfrp4e-assistant", "enableArcane", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Hint"),
		scope: "client",
		config: false,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "grimoiresFolder", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
        onChange: value => {
            value = value.replace("Folder.", "");
            if (!game.items.folders.get(value) && value != "") {
                ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Error"));
                game.settings.set("wfrp4e-assistant", "grimoiresFolder", "");
            } else {game.settings.set("wfrp4e-assistant", "grimoiresFolder", value)};
        }
	});
	game.settings.register("wfrp4e-assistant", "scrollsFolder", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
        onChange: value => {
            value = value.replace("Folder.", "");
            if (!game.items.folders.get(value) && value != "") {
                ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Error"));
                game.settings.set("wfrp4e-assistant", "scrollsFolder", "");
            } else {game.settings.set("wfrp4e-assistant", "scrollsFolder", value)};
        }
	});
    game.settings.register("wfrp4e-assistant", "grimoiresRandName", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresRandName.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresRandName.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
    game.settings.register("wfrp4e-assistant", "defensiveRemove", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveRemove.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveRemove.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "defensiveList", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Hint"),
		scope: "client",
		config: true,
		choices: {
			1: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Combat"),
			2: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.All"),
			3: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Custom.Name")
		},
		default: 1,
		type: Number,
        onChange: async (value) => {
			if (value == 3) {
				let confirm = true;
				if (game.settings.get("wfrp4e-assistant", "defensiveSkillsList").length) {
					confirm = false;
					confirm = await foundry.applications.api.DialogV2.confirm({
						window: {title: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Custom.Confirm.Label")},
						content: `<p>${game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Custom.Confirm.Hint")}</p><p>${game.settings.get("wfrp4e-assistant", "defensiveSkillsList").join(", ")}</p>`
					});
				};
				if (confirm) {
					let array = [];
					if (game.user.character != null) {
						array = game.user.character.itemTypes.skill;
					} else {
						array = await warhammer.utility.findAllItems("skill", game.i18n.localize("WFRP4E.Assistant.systemFix.Search"), true);
					};
					let choice = await ItemDialog.create(array.sort((a, b) => a.name > b.name ? 1 : -1), array.length, {text: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Custom.Hint"), title: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.defensiveList.Custom.Label")});
					array = [];
					for (let i = 0; i < choice.length; i++) {array.push(choice[i].name.replace(" ()", ""))};
					game.settings.set("wfrp4e-assistant", "defensiveSkillsList", array);
				};
            };
        }
	});
	game.settings.register("wfrp4e-assistant", "defensiveSkillsList", {
		scope: "client",
		config: false,
		type: Array,
		default: []
	});
});

class systemFix {
	static async speciesCharacteristics(species, average, subspecies) {
		species = warhammer.utility.findKey(species.split(" ")[0], WFRP4E.species)
		let characteristics = {};
		let characteristicFormulae = game.wfrp4e.config.speciesCharacteristics[species];
		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].characteristics) {
			characteristicFormulae = game.wfrp4e.config.subspecies[species][subspecies].characteristics;
		};

		if (!characteristicFormulae) {
			ui.notifications.info(`${game.i18n.format("ERROR.Species", { name: species })}`);
			warhammer.utility.log("Could not find species " + species + ": " + error, true);
			throw error;
		}

		for (let char in game.wfrp4e.config.characteristics) {
			if (average) {
				characteristics[char] = { value: Roll.safeEval(characteristicFormulae[char].replace("2d10", "10")) , formula: characteristicFormulae[char] };
			} else {
				let roll = await new Roll(characteristicFormulae[char]).roll({allowInteractive : false});
				characteristics[char] = { value: roll.total, formula: characteristicFormulae[char] + ` (${roll.result})` };
			};
		};
		return characteristics;
	};

	static speciesSkillsTalents(species, subspecies) {
		species = warhammer.utility.findKey(species.split(" ")[0], WFRP4E.species)
		let skills, talents, randomTalents, talentReplacement, traits;

		skills = game.wfrp4e.config.speciesSkills[species];
		talents = game.wfrp4e.config.speciesTalents[species];
		randomTalents = game.wfrp4e.config.speciesRandomTalents[species] || {talents: 0};
		talentReplacement = game.wfrp4e.config.speciesTalentReplacement[species] || {};
		traits = game.wfrp4e.config.speciesTraits[species] || [];

		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].skills) {
			skills = game.wfrp4e.config.subspecies[species][subspecies].skills;
		};
		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].talents) {
			talents = game.wfrp4e.config.subspecies[species][subspecies].talents;
		};
		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].randomTalents) {
			randomTalents = game.wfrp4e.config.subspecies[species][subspecies].randomTalents || {talents: 0};
		};
		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].talentReplacement) {
			talentReplacement = game.wfrp4e.config.subspecies[species][subspecies].talentReplacement || {};
		};
		if (subspecies && game.wfrp4e.config.subspecies[species][subspecies].speciesTraits) {
			traits = game.wfrp4e.config.subspecies[species][subspecies].speciesTraits || [];
		};

		return { skills, talents, randomTalents, talentReplacement, traits };
	};

	static speciesMovement(species, subspecies) {
		species = warhammer.utility.findKey(species.split(" ")[0], WFRP4E.species)
		let move = game.wfrp4e.config.speciesMovement[species];
		if (subspecies && game.wfrp4e.config.subspecies[species].movement) {
			move = game.wfrp4e.config.subspecies[species].movement;
		};
		return move;
	};
};

Hooks.on("ready", async () => {
    game.wfrp4e.utility.speciesCharacteristics = systemFix.speciesCharacteristics;
    game.wfrp4e.utility.speciesSkillsTalents = systemFix.speciesSkillsTalents;
    game.wfrp4e.utility.speciesMovement = systemFix.speciesMovement;

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
		let onclick = `
			let actor = game.wfrp4e.utility.getActorFromUUID(this.dataset.uuid);
			let effects = actor.effects.filter(e => e.name.includes(game.wfrp4e.utility.getSystemEffects().defensive.name));
			if (effects.length) {
				for (let i = effects.length; i > 0; i--) {actor.deleteEmbeddedDocuments('ActiveEffect', effects.map(i => i.id))};
			} else {
				actor.createEmbeddedDocuments('ActiveEffect', [game.wfrp4e.utility.getSystemEffects().defensive]);	
			};
		`;
		let button;
		let effects = sheet.document.effects.filter(e => e.name.includes(game.wfrp4e.utility.getSystemEffects().defensive.name));
		if (effects.length) {
			button = `<a class="list-button" data-tooltip="${effects[0].name}" data-uuid="${sheet.document.uuid}" style="color: var(--color-level-success-bg);" onclick="${onclick}"><i class="fas fa-shield"></i></a>`;
		} else {
			button = `<a class="list-button" data-tooltip="${game.i18n.localize('EFFECT.OnDefensive')}" data-uuid="${sheet.document.uuid}" style="color: var(--color-level-error-bg);" onclick="${onclick}"><i class="fas fa-shield"></i></a>`;
		};
		if (sheet.document.type == "creature") {
			html.querySelector("section[data-tab='main']>.sheet-list>.list-header>.list-name").insertAdjacentHTML("beforeend", button);
		};
		html.querySelector("section[data-tab='combat']>.sheet-list>.list-header>.list-name").insertAdjacentHTML("beforeend", button);
	};
});

/* Исправление для ошибок отображения иконок токенов в чате. Заменить в файле system/wfrp4e/wfrp4e.js	
class WFRPTestMessageModel extends WarhammerTestMessageModel 
{
    async onRender(html)
    {
      let header = html.querySelector(".message-header");

      let div = document.createElement("div");
      div.classList.add("message-token");
      let image = document.createElement("img");
      image.src = (await this.getHeaderToken()).replace("*", "1");
      image.style.zIndex = 1;
	  image.onerror = function() {
		image.src = "systems/wfrp4e/tokens/unknown.png";
	  };
      div.appendChild(image);
      if (this.test.actor.isMounted && this.test.actor.mount)
      {
        div.classList.add("mounted");
        let mount = document.createElement("img");
        mount.src = (this.test.actor.mount.getActiveTokens()[0]?.document?.texture.src).replace("*", "1");
		mount.onerror = function() {
		  mount.src = "systems/wfrp4e/tokens/unknown.png";
		};
        mount.style.zIndex = 0;
        div.appendChild(mount);
    }
      header.insertBefore(div, header.firstChild);

      warhammer.utility.replacePopoutTokens(html);
    }
};
*/