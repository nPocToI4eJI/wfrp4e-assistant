class assistantUtility {
	//Этот метод генерирует случайное название для книги в стилистике сеттинга. Варианты названий взяты у Paco's Miscellaneous Stuff и переведены мной на русский.
	//https://github.com/nPocToI4eJI/wfrp4e-assistant/blob/main/README.md#generateBookTitletype
	static generateBookTitle(type) {
		let title = game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Adjetive.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Adjetive).length) + 1}`) + " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Main.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Main).length) + 1}`);
		if (!type || type == "Random") {
			let randType = Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types)[Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types).length)];
			let values = Object.values(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${randType}`]);
			title += " " + values[Math.floor(CONFIG.Dice.randomUniform() * values.length)];
		}
		else {
			let values = Object.values(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${type}`]);
			title += " " + values[Math.floor(CONFIG.Dice.randomUniform() * values.length)];
		};
	
		return title;
	};
	
	//Этот метод принимает полный UUID и возвращает актёра. Принимает UUID в формате "Scene.*id*.Token.*id*.Actor.*id*" или "Actor.*id*"
	//https://github.com/nPocToI4eJI/wfrp4e-assistant/blob/main/README.md#getActorFromUUIDuuid
	static getActorFromUUID(uuid) {
		uuid = uuid.split(".")
		let id = {actor: uuid.splice(-2, 2)[1], token: uuid.splice(-2, 2)[1] || "", scene: uuid.splice(-2, 2)[1] || ""};
		let actor;
		if (id.token) {
			if (game.scenes.get(id.scene).tokens.get(id.token).actorLink) {
				actor = game.actors.get(id.actor);
			} else {
				actor = game.scenes.get(id.scene).tokens.get(id.token).actor;
			};
		} else {
			actor = game.actors.get(id.actor);
		};
		return actor;
	};
	
	//Этот метод принимает полный UUID и возвращает актёра. Принимает UUID в формате "Scene.*id*.Token.*id*.Actor.*id*" или "Actor.*id*"
	//https://github.com/nPocToI4eJI/wfrp4e-assistant/blob/main/README.md#getReaction
	static async getReaction(actor, opponent, action) {
		if (actor.tokens[0] && actor.species && !Array.from(canvas.hud.bubbles.element.children).filter(e => actor.tokens.some(t => t.id == e.dataset.tokenId)).length) {
			let phrases = game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.List[actor.species][action];
			let reactionsList = Object.values(phrases.All || []);
			if (actor.subspecies && phrases.hasOwnProperty(actor.subspecies)) {
				reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies] || []));
			};

			if (opponent) {
				reactionsList = reactionsList.concat(Object.values(phrases.Opponent.All?.All || []));
				if (opponent.species && phrases.Opponent.All.hasOwnProperty(opponent.species)) {
					reactionsList = reactionsList.concat(Object.values(phrases.Opponent.All[opponent.species]?.All || []));
					if (opponent.subspecies && phrases.Opponent.All[opponent.species].hasOwnProperty(opponent.subspecies)) {
						reactionsList = reactionsList.concat(Object.values(phrases.Opponent.All[opponent.species][opponent.subspecies] || []));
					};
				};

				if (actor.subspecies && phrases.Opponent.hasOwnProperty(actor.subspecies)) {
					reactionsList = reactionsList.concat(Object.values(phrases.Opponent[actor.subspecies]?.All || []));
					if (opponent.species && phrases.Opponent[actor.subspecies].hasOwnProperty(opponent.species)) {
						reactionsList = reactionsList.concat(Object.values(phrases.Opponent[actor.subspecies][opponent.species]?.All || []));
						if (opponent.subspecies && phrases.Opponent[actor.subspecies][opponent.species].hasOwnProperty(opponent.subspecies)) {
							reactionsList = reactionsList.concat(Object.values(phrases.Opponent[actor.subspecies][opponent.species][opponent.subspecies] || []));
						};
					};
				};
			};

			if (actor.to && phrases?.To.hasOwnProperty(actor.to)) {
				reactionsList = reactionsList.concat(Object.values(phrases.To[actor.to].All || []));
				if (actor.subspecies && phrases.To[actor.to].hasOwnProperty(actor.subspecies)) {
					reactionsList = reactionsList.concat(Object.values(phrases.To[actor.to][actor.subspecies] || []));
				};
			};

			if (opponent.to && phrases?.To.hasOwnProperty(opponent.to)) {
				reactionsList = reactionsList.concat(Object.values(phrases.To[opponent.to].All || []));
				if (phrases.To[opponent.to].hasOwnProperty(actor.species)) {
					reactionsList = reactionsList.concat(Object.values(phrases.To[opponent.to][actor.species].All || []));
					if (actor.subspecies && phrases.To[opponent.to][actor.species].hasOwnProperty(actor.subspecies)) {
						reactionsList = reactionsList.concat(Object.values(phrases.To[opponent.to][actor.species][actor.subspecies] || []));
					};
				};
			};

			for (let i = 0; i < reactionsList.length; i++) {
				if (reactionsList[i][0] == "#") {
					reactionsList[i] = game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.List." + reactionsList[i].slice(1));
				};
			};

			let phrase = reactionsList[(await new Roll(`1d${reactionsList.length}`).roll()).result - 1];

			if (phrase) {
				for (let i = 0; i < actor.tokens.length; i++) {
					canvas.hud.bubbles.broadcast(actor.tokens[i], `<em><strong>${phrase}</strong></em><span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}<span>`);
				};
				if (game.settings.get("wfrp4e-assistant", "reactionsInChat")) {
					ChatMessage.create({
						speaker: {alias: actor.name},
						content: `<em><strong>${phrase}</strong></em>`
					});
				};
			};
		};
	};
};

Hooks.once("init", function () {
	game.settings.register("wfrp4e-assistant", "enableArcane", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Hint"),
		scope: "client",
		config: false,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "defensiveSkillsList", {
		scope: "client",
		config: false,
		type: Array,
		default: []
	});
	game.settings.register("wfrp4e-assistant", "enableHelpers", {
		name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.enableHelpers.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.enableHelpers.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "hideHelpersTrait", {
		name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.hideHelpersTrait.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.hideHelpersTrait.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "assistantPreset", {
		scope: "world",
		config: false,
		default: {
			character: {
				deathTint: {
					color: "#990000"
				},
				changeCharacteristics: {
					value: 0
				},
				spellsFilter: {
					page: -1,
					list: [],
					petty: true
				},
				reactions: {
					status: false,
					species: "",
					subspecies: "",
					frequency: "50"
				}
			},
			npc: {
				generateName: {
					status: true,
					species: "",
					subspecies: "",
					keys: "male,surnames"
				},
				changeCharacteristics: {
					value: 0
				},
				randomCharacteristics: {
					status: true
				},
				deathTint: {
					color: "#990000"
				},
				generateSpells: {
					status: false,
					lore: "petty",
					count: 1,
					arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
				},
				disposition: {
					value: "4"
				},
				spellsFilter: {
					page: -1,
					list: [],
					petty: true
				},
				reactions: {
					status: true,
					species: "",
					subspecies: "",
					frequency: "75"
				}
			},
			creature: {
				generateName: {
					status: true,
					species: "",
					subspecies: "",
					keys: "male"
				},
				changeCharacteristics: {
					value: 0
				},
				randomCharacteristics: {
					status: true
				},
				deathTint: {
					color: "#990000"
				},
				generateSpells: {
					status: false,
					lore: "petty",
					count: 1,
					arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
				},
				disposition: {
					value: "4"
				},
				spellsFilter: {
					page: -1,
					list: [],
					petty: true
				},
				reactions: {
					status: true,
					species: "",
					subspecies: "",
					frequency: "75"
				}
			}
		},
		type: Object
	});
	game.settings.register("wfrp4e-assistant", "reactionsInChat", {
		name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsInChat.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsInChat.Hint"),
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
	game.settings.register("wfrp4e-assistant", "translateImportedActors", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.translateImportedActors.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.translateImportedActors.Hint"),
		scope: "world",
		config: game.modules.get("babele") ? true : false,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "grimoiresRandName", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresRandName.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresRandName.Hint"),
		scope: "world",
		config: true,
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

	game.wfrp4e.utility.generateBookTitle = assistantUtility.generateBookTitle;
	game.wfrp4e.utility.getActorFromUUID = assistantUtility.getActorFromUUID;
	game.wfrp4e.utility.getReaction = assistantUtility.getReaction;
});

Hooks.on("ready", function () {
	foundry.utils.mergeObject(game.wfrp4e.config.effectScripts, {
//Создание токена
"YRJEOMjZZ7iinnPx":
`if (game.modules.get("wfrp4e-assistant") && !this.actor.inCompendium && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
	let params = this.effect.flags.assistant;
	if (params.generateName?.status && !this.actor.prototypeToken.actorLink && params.generateName.species) {
		let name = [];
		let speciesKeys = params.generateName.keys.split(",");
		speciesKeys.forEach(k => {
			let values = Object.values(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params.generateName.species][k] || "");
			name.push(values[Math.floor(CONFIG.Dice.randomUniform() * values.length)]);
		});
		if (!name.length) {name = this.actor.name};
		this.actor.update({"name": name.join(" ")});
		this.actor.token.update({"name": name[0]});
		params.generateName.status = false;
	};
	if (params.randomCharacteristics?.status) {
		this.actor.update({
			"system.characteristics.ws.initial": this.actor.system.characteristics.ws.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.ws.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.bs.initial": this.actor.system.characteristics.bs.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.bs.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.s.initial": this.actor.system.characteristics.s.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.s.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.t.initial": this.actor.system.characteristics.t.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.t.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.i.initial": this.actor.system.characteristics.i.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.i.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.dex.initial": this.actor.system.characteristics.dex.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.dex.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.ag.initial": this.actor.system.characteristics.ag.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.ag.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.int.initial": this.actor.system.characteristics.int.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.int.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.wp.initial": this.actor.system.characteristics.wp.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.wp.initial - 10 + (await new Roll("2d10").roll()).total,
			"system.characteristics.fel.initial": this.actor.system.characteristics.fel.initial == 5 ? (await new Roll("1d10").roll()).total : this.actor.system.characteristics.fel.initial - 10 + (await new Roll("2d10").roll()).total
		});
		params.randomCharacteristics.status = false;
	};
	if (params.generateSpells?.status) {
		let spells = await warhammer.utility.findAllItems("spell", game.i18n.localize("WFRP4E.Assistant.systemFix.Search"), true, ["uuid", "system.lore.value"]);
		spells = spells.filter(s => s.system.lore.value == params.generateSpells.lore || (params.generateSpells.arcane && s.system.lore.value == ""));
		let resultSpells = [];
		for (let i = params.generateSpells.count; i > 0; i--) {
			let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
			let spell = await fromUuid(spells[result].uuid);
			resultSpells.push(spell);
			await spells.splice(result, 1)
		};
		this.actor.createEmbeddedDocuments("Item", resultSpells, {broadcast: false})
		params.generateSpells.status = false;
	};
	if (params.disposition.value == "4") {
		choice = await ItemDialog.create([{name: game.i18n.localize("TOKEN.DISPOSITION.NEUTRAL"), value: 0}, {name: game.i18n.localize("TOKEN.DISPOSITION.FRIENDLY"), value: 1}, {name: game.i18n.localize("TOKEN.DISPOSITION.HOSTILE"), value: -1}, {name: game.i18n.localize("TOKEN.DISPOSITION.SECRET"), value: -2}], 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Tooltip"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Label")});
		this.actor.token.update({"disposition": choice[0]?.value});
	} else if (params.disposition.value == "0") {
		this.actor.token.update({"disposition": 0});
	} else if (params.disposition.value == "1") {
		this.actor.token.update({"disposition": 1});
	} else if (params.disposition.value == "-1") {
		this.actor.token.update({"disposition": -1});
	} else if (params.disposition.value == "-2") {
		this.actor.token.update({"disposition": -2});
	};
	this.effect.update({
		"flags.assistant": params
	});
};`,
//Обновление данных актёра
"BJmxXK4ESSTuenLd":
`if (!this.actor.inCompendium) {
	if (game.modules.get("wfrp4e-assistant") && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
		let params = this.effect.flags.assistant;
		//Окраска токена при смерти
		if (args.data?.system?.status?.wounds) {
			let color;
			if (this.actor.status.wounds.value <= 0) {
				color = params.deathTint.color;
				if (game.modules.get("healthEstimate") && game.healthEstimate?.NPCsJustDie && this.actor.type != "character" && (!this.actor.token?.flags?.healthEstimate.dontMarkDead || (!this.actor.token && !this.actor.prototypeToken.flags?.healthEstimate.dontMarkDead)) && !this.actor.hasCondition("dead")) {
					await this.actor.addCondition("dead");
				};
			} else {
				color = this.actor?.prototypeToken.texture.tint || "#FFFFFF"
				if (this.actor.hasCondition("dead")) {
					await this.actor.removeCondition("dead");
				};
			};

			if (!this.actor.prototypeToken.actorLink && this.actor.token) {this.actor.token.update({"texture.tint": color})}
			else {
				let tokens = this.actor.getDependentTokens();
				for (let i = 0; i < tokens.length; i++) {
					tokens[i].update({"texture.tint": color});
				};
			};
		} else if (args.data?.flags?.assistant?.changeCharacteristics) {
			let changes = [];
			Object.keys(game.wfrp4e.config.characteristics).forEach(c => {
				changes.push({
					key: "system.characteristics." + c + ".initial",
					mode: 2,
					value: parseInt(args.data.flags.assistant.changeCharacteristics.value)
				});
			});

			this.effect.update({changes});
		};
		if (params.reactions.status) {
			if (args.options.deltaWounds < 0) {
				let actor = {name: this.actor.name, species: params.reactions.species, subspecies: params.reactions.subspecies};
				actor.tokens = [this.actor.token] || this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current);

				let action;
				if (this.actor.system.status.wounds.value <= 0) {action = "die"}
				else {action = "takeDamage"};

				await game.wfrp4e.utility.getReaction(actor, false, action);
			};
		};
	};
};`,
//Реакции. Получение урона
"xEEfsTELB5p9qoe0":
`if (game.modules.get("wfrp4e-assistant") && !this.actor.inCompendium && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
	let params = this.effect.flags.assistant;

	if (params.reactions.status) {
		if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
			let actor = {name: this.actor.name, species: params.reactions.species, subspecies: params.reactions.subspecies};
			actor.tokens = [this.actor.token] || this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current);
			let attacker = {species: "", subspecies: ""};
			let attackerEffect = args.attacker.effects.find(e => e.flags.assistant);
			if (attackerEffect) {
				attacker.species = attackerEffect.flags.assistant.reactions.species || "";
				attacker.subspecies = attackerEffect.flags.assistant.reactions.subspecies || "";
			};

			let action;
			if (this.actor.status.wounds.value <= args.totalWoundLoss) {
				action = "die"
			} else {
				let hitLoc = args.opposedTest.result.hitloc.value.toLowerCase();
				if (hitLoc.includes("head")) {actor.to = "Head"}
				else if (hitLoc.includes("body")) {actor.to = "Body"}
				else if (hitLoc.includes("arm")) {actor.to = "Arm"}
				else if (hitLoc.includes("leg")) {actor.to = "Leg"};
				action = "takeDamage";
			};

			await game.wfrp4e.utility.getReaction(actor, attacker, action);
		};
	};
};`,
//Реакции. Нанесение урона
"dxZ3pksVILjm0VpQ":
`if (game.modules.get("wfrp4e-assistant") && !this.actor.inCompendium && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
	let params = this.effect.flags.assistant;

	if (params.reactions.status) {
		if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
			let actor = {name: this.actor.name, species: params.reactions.species, subspecies: params.reactions.subspecies};
			actor.tokens = [this.actor.token] || this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current);
			let target = {species: "", subspecies: ""};
			let targetEffect = args.actor.effects.find(e => e.flags.assistant);
			if (targetEffect) {
				target.species = targetEffect.flags.assistant.reactions.species || "";
				target.subspecies = targetEffect.flags.assistant.reactions.subspecies || "";
			};

			let action;
			if (args.actor.status.wounds.value <= args.totalWoundLoss) {
				action = "kill"
			} else {
				let hitLoc = args.opposedTest.result.hitloc.value.toLowerCase();
				if (hitLoc.includes("head")) {target.to = "Head"}
				else if (hitLoc.includes("body")) {target.to = "Body"}
				else if (hitLoc.includes("arm")) {target.to = "Arm"}
				else if (hitLoc.includes("leg")) {target.to = "Leg"};
				action = "applyDamage";
			};

			await game.wfrp4e.utility.getReaction(actor, target, action);
		};
	};
};`,
//Реакции. Защита
"ycq35CrgN67rlGJZ":
`if (game.modules.get("wfrp4e-assistant") && !this.actor.inCompendium && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
	let params = this.effect.flags.assistant;

	if (params.reactions.status) {
		if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
			let actor = {name: this.actor.name, species: params.reactions.species, subspecies: params.reactions.subspecies};
			actor.tokens = [this.actor.token] || this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current);
			let target = {species: "", subspecies: ""};
			let targetEffect = args.opposedTest.attacker.effects.find(e => e.flags.assistant);
			if (targetEffect) {
				target.species = targetEffect.flags.assistant.reactions.species || "";
				target.subspecies = targetEffect.flags.assistant.reactions.subspecies || "";
			};
			let action;
			if (args.opposedTest.result.winner == "defender") {action = "opposedDefenderSuccess"}
			else {action = "opposedDefenderFailure"};

			await game.wfrp4e.utility.getReaction(actor, target, action);
		};
	};
};`,
//Реакции. Атака
"pIr5z44FuRX9Xq6a":
`if (game.modules.get("wfrp4e-assistant") && !this.actor.inCompendium && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
	let params = this.effect.flags.assistant;

	if (params.reactions.status) {
		if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
			let actor = {name: this.actor.name, species: params.reactions.species, subspecies: params.reactions.subspecies};
			actor.tokens = [this.actor.token] || this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current);
			let target = {species: "", subspecies: ""};
			let targetEffect = args.opposedTest.defender.effects.find(e => e.flags.assistant);
			if (targetEffect) {
				target.species = targetEffect.flags.assistant.reactions.species || "";
				target.subspecies = targetEffect.flags.assistant.reactions.subspecies || "";
			};
			let action;
			if (args.opposedTest.result.winner == "attacker") {action = "opposedAttackerSuccess"}
			else {action = "opposedAttackerFailure"};

			await game.wfrp4e.utility.getReaction(actor, target, action);
		};
	};
};`
	});

	//Указание на перевод, сделанный ИИ
	let AITranslations = ["en"];
	if (game.user.isGM && AITranslations.includes(game.i18n.lang)) {ui.notifications.notify(game.i18n.localize("WFRP4E.Assistant.AI"))}
});

//Списки заклинаний
function spellsFilter(html, effect, actor) {
	//Функция обновления отображения Заклинаний
	function updateSpells(button) {
		//Изменение кнопки
		if (effect.flags.assistant.spellsFilter.page == -1) {
			button.innerHTML = "<i class='fas fa-list'></i>";
			button.dataset.tooltip = `<h6 style="text-align: center;">${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB1")}`;
		} else {
			button.innerHTML = `<i class="${effect.flags.assistant.spellsFilter.list[effect.flags.assistant.spellsFilter.page].icon}"></i>`;
			button.dataset.tooltip = `<h6 style="text-align: center;">${effect.flags.assistant.spellsFilter.list[effect.flags.assistant.spellsFilter.page].name}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB2")}`;
		};
		//Изменение отображения Заклинаний
		let spells = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-content").children;
		for (let i = 0; i < spells.length; i++) {
			if (effect.flags.assistant.spellsFilter.page != -1 && !effect.flags.assistant.spellsFilter.list[effect.flags.assistant.spellsFilter.page].spells.includes(spells[i].dataset.uuid)) {spells[i].style.display = "none"}
			else {spells[i].style.display = "flex"};
		};
	};

	//Создание кнопки
	html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name").insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="spellsFilter" data-tooltip=""></a>`);
	let spellsButton = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name>a[data-action='spellsFilter']");
	//Обновление отображения Заклинаний
	updateSpells(spellsButton);

	//Добавление событий нажатия
	//ЛКМ
	spellsButton.addEventListener("click", function() {
		let page = effect.flags.assistant.spellsFilter.page;
		//Изменение текущей категории и кнопки
		if (page < effect.flags.assistant.spellsFilter.list.length - 1) {page++}
		else {page = -1};
		//Обновление сохранённых параметров
		effect.update({"flags.assistant.spellsFilter.page": page});
		//Обновление отображения Заклинаний
		updateSpells(spellsButton);
	});
	//ПКМ
	spellsButton.addEventListener("contextmenu", async function() {
		if (effect.flags.assistant.spellsFilter.page != -1) {
			//Выбор Заклинаний для фильтра
			let spellsLists = actor.itemTypes.spell.filter(s => s.lore.value != "petty").map(s => ({name: s.name, img: s.img, uuid: s.uuid}));
			let choice = (await ItemDialog.create(spellsLists, spellsLists.length, {text: game.i18n.format("WFRP4E.Assistant.spellsFilter.Description", {name: effect.flags.assistant.spellsFilter.list[effect.flags.assistant.spellsFilter.page].name}), title: effect.flags.assistant.spellsFilter.list[effect.flags.assistant.spellsFilter.page].name})).map(s => s.uuid);
			//Обновление сохранённых параметров
			let result = effect.flags.assistant.spellsFilter.list;
			result[effect.flags.assistant.spellsFilter.page].spells = choice;
			effect.update({"flags.assistant.spellsFilter.list": result});
			//Обновление отображения Заклинаний
			updateSpells(spellsButton);
		} else {
			//Окно управления категориями
			let categories = new foundry.applications.api.DialogV2({
				window: {title: game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Title")},
				content: effect.flags.assistant.spellsFilter.list.map(c => `<div style="display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgoldenrod;"><input style="width: 30%;" type="string" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon")}" value="${c.icon}"><input style="width: 70%;" data-tooltip="${game.i18n.localize("Name")}" type="string" data-spells="${c.spells.join(",")}" value="${c.name}"><a data-action="removeCategories" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Remove")}"><i class="fas fa-trash"></i></a></div>`).join("") + `<a style="width: max-content;" data-action="addCategories" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Add")}"><i class="fas fa-plus"></i></a>`,
				buttons: [{
					action: "save",
					icon: "fas fa-save",
					label: "Save",
					default: true,
					callback: (event, button, dialog) => {
						//Сохранение категорий
						let list = [];
						dialog.element.querySelector("div.dialog-content").querySelectorAll("div").forEach(div => {
							list.push({name: div.querySelector("input:nth-child(2)").value, icon: div.querySelector("input:nth-child(1)").value, spells: div.querySelector("input:nth-child(2)").dataset.spells != "" ? div.querySelector("input:nth-child(2)").dataset.spells.split(",") : []});
						});
						//Обновление сохранённых параметров
						effect.update({
							"flags.assistant.spellsFilter.page": -1,
							"flags.assistant.spellsFilter.list": list
						});
						//Обновление отображения Заклинаний
						updateSpells(spellsButton);
					}
				}]
			});
			await categories.render(true);

			//Событие удаления
			function removeClick(element) {
				element.addEventListener("click", async function() {
					//Подтверждение удаления
					let confirm = await foundry.applications.api.DialogV2.confirm({
						window: {title: game.i18n.localize("Confirm")},
						content: game.i18n.format("WFRP4E.Assistant.spellsFilter.Categories.RemoveConfirm", {name: element.previousElementSibling.value})
					});
					if (confirm) {element.parentElement.remove()};
				});
			};

			//Добавление события создания
			categories.element.querySelector("a[data-action='addCategories']").addEventListener("click", async function() {
				categories.element.querySelector("a[data-action='addCategories']").insertAdjacentHTML("beforebegin", `<div style="display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgreen;"><input style="width: 30%;" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon")}" type="string" value="fas fa-ellipsis"><input style="width: 70%;" data-tooltip="${game.i18n.localize("Name")}" type="string" data-spells="" value="${game.i18n.localize("Name")}"><a data-action="removeCategories" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Remove")}"><i class="fas fa-trash"></i></a></div>`);
				//Добавление события удаления для созданной категории
				removeClick(categories.element.querySelector("div:last-of-type>a[data-action='removeCategories']"));
			});
			//Добавление события удаления для существующих категорий
			categories.element.querySelectorAll("a[data-action='removeCategories']").forEach((element) => removeClick(element));
		};
	});

	//Скрытие простейших заклинаний

	//Функция обновления отображения Простейших заклинаний
	function updatePetty(button) {
		if (effect.flags.assistant.spellsFilter.petty) {
			button.innerHTML = "<i class='fas fa-eye-slash'></i>";
			button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Hide")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
		} else {
			button.innerHTML = "<i class='fas fa-eye'></i>";
			button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Show")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
		};
		let spells = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-content").children;
		for (let i = 0; i < spells.length; i++) {
			if (effect.flags.assistant.spellsFilter.petty) {spells[i].style.display = "flex"}
			else {spells[i].style.display = "none"};
		};
	};

	//Создание кнопки
	html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name").insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="hidePetty"></a>`);
	let pettyButton = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name>a[data-action='hidePetty']");
	//Обновление отображения Простейших заклинаний
	updatePetty(pettyButton);

	//Добавление события нажатия ЛКМ
	pettyButton.addEventListener("click", function() {
		//Переключение параметра и его обновление
		if (effect.flags.assistant.spellsFilter.petty) {effect.update({"flags.assistant.spellsFilter.petty": false})}
		else {effect.update({"flags.assistant.spellsFilter.petty": true})};
		//Обновление отображения Простейших заклинаний
		updatePetty(pettyButton);
	});
};

async function createEffect(actor, params) {
	//Проверка на дубликат
	if (!actor.effects.find(e => e.flags.assistant)) {
		return await actor.createEmbeddedDocuments("ActiveEffect", [{
			disabled: false,
			flags: {assistant: params},
			icon: "modules/wfrp4e-assistant/icons/conditions/assistant.png",
			name: game.i18n.localize("WFRP4E.Assistant.Label"),
			count: 1,
			system: {
				scriptData: [
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Create"),
						trigger: "createToken",
						script: `[Script.YRJEOMjZZ7iinnPx]`
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Update"),
						trigger: "update",
						script: `[Script.BJmxXK4ESSTuenLd]`
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.TDamage"),
						trigger: "takeDamage",
						script: `[Script.xEEfsTELB5p9qoe0]`
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.ADamage"),
						trigger: "applyDamage",
						script: `[Script.dxZ3pksVILjm0VpQ]`
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.OpposedD"),
						trigger: "opposedDefender",
						script: `[Script.ycq35CrgN67rlGJZ]`
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.OpposedA"),
						trigger: "opposedAttacker",
						script: `[Script.pIr5z44FuRX9Xq6a]`
					}
				]
			}
		}], {broadcast: false});
	};
};

async function getEffect(actor, html) {
	let effect = actor.effects.find(e => e.flags.assistant);

	if (game.user.isGM && !actor.inCompendium) {
		if (game.settings.get("wfrp4e-assistant", "enableHelpers")) {
			//Проверка на дубликаты
			let effects = actor.effects.filter(e => e.flags.assistant);
			if (effects.length >= 1) {
				for (let i = 1; i < effects.length; i++) {
					//Удаление дублей
					if (effects[i]) {effects[i].delete()};
				};
				effect = effects[0];
			};
			//Проверка на наличие эффекта
			if (!effect) {
				let params;
				//Преобразование старой "черты" в новый "эффект". Будет убрано при обновлении Foundry до версии 14.
				let item = actor.items.find(i => i.type == "trait" && i.name == game.i18n.localize("WFRP4E.Assistant.Label") && i.img == "icons/sundries/documents/document-sealed-signatures-red.webp");
				if (item) {
					let specification = item.system.specification.value.split("|");
					switch (actor.type) {
						case "character": {
							params = {
								deathTint: {
									color: specification[3].split(",")[0]
								},
								changeCharacteristics: {
									value: 0
								},
								spellsFilter: {
									page: -1,
									list: [],
									petty: true
								},
								reactions: {
									status: true,
									species: "",
									subspecies: "",
									frequency: "50"
								}
							};
							break;
						};
						case "npc": {
							params = {
								generateName: {
									status: specification[0].split(",")[0] == "true" ? true : false,
									species: specification[0].split(",")[1],
									keys: specification[0].split(",").slice(2).join(",")
								},
								changeCharacteristics: {
									value: 0
								},
								randomCharacteristics: {
									status: specification[1] == "true" ? true : false
								},
								deathTint: {
									color: specification[3].split(",")[0]
								},
								generateSpells: {
									status: specification[4].split(",")[0] == "true" ? true : false,
									lore: specification[4].split(",")[1],
									count: specification[4].split(",")[2],
									arcane: specification[4].split(",")[3] == "true" ? true : false
								},
								disposition: {
									value: "4"
								},
								spellsFilter: {
									page: -1,
									list: [],
									petty: true
								},
								reactions: {
									status: true,
									species: "",
									subspecies: "",
									frequency: "75"
								}
							};
							break;
						};
						case "creature": {
							params = {
								generateName: {
									status: specification[0].split(",")[0] == "true" ? true : false,
									species: specification[0].split(",")[1],
									keys: specification[0].split(",").slice(2).join(",")
								},
								changeCharacteristics: {
									value: 0
								},
								randomCharacteristics: {
									status: specification[1] == "true" ? true : false
								},
								deathTint: {
									color: specification[3].split(",")[0]
								},
								generateSpells: {
									status: specification[4].split(",")[0] == "true" ? true : false,
									lore: specification[4].split(",")[1],
									count: specification[4].split(",")[2],
									arcane: specification[4].split(",")[3] == "true" ? true : false
								},
								disposition: {
									value: "4"
								},
								spellsFilter: {
									page: -1,
									list: [],
									petty: true
								},
								reactions: {
									status: true,
									species: "",
									subspecies: "",
									frequency: "75"
								}
							};
							break;
						};
					};
					item.delete();
				} else {
					//Присвоение стандартных параметров
					switch (actor.type) {
						case "character": params = game.settings.get("wfrp4e-assistant", "assistantPreset").character; break;
						case "npc": params = game.settings.get("wfrp4e-assistant", "assistantPreset").npc; break;
						case "creature": params = game.settings.get("wfrp4e-assistant", "assistantPreset").creature; break;
					};
				};
				//Создание эффекта
				effect = await createEffect(actor, params);
			//Проверка целостности скриптов
			} else if (!effect.scripts.some(s => s.trigger == "createToken") || !effect.scripts.some(s => s.trigger == "updateDocument") || !effect.scripts.some(s => s.trigger == "takeDamage") || !effect.scripts.some(s => s.trigger == "applyDamage") || !effect.scripts.some(s => s.trigger == "opposedAttacker") || !effect.scripts.some(s => s.trigger == "opposedDefender")) {
				let params = effect.flags.assistant;
				//Удаление "повреждённого" эффекта
				if (effect) {effect.delete()};
				//Нормализация параметров
				switch (actor.type) {
					case "character": {
						params = {
							deathTint: {
								color: params.deathTint?.color || game.settings.get("wfrp4e-assistant", "assistantPreset").character.deathTint.color
							},
							changeCharacteristics: {
								value: params.changeCharacteristics?.value || game.settings.get("wfrp4e-assistant", "assistantPreset").character.changeCharacteristics.value
							},
							spellsFilter: {
								page: params.spellsFilter?.page || game.settings.get("wfrp4e-assistant", "assistantPreset").character.spellsFilter.page,
								list: params.spellsFilter?.list || game.settings.get("wfrp4e-assistant", "assistantPreset").character.spellsFilter.list,
								petty: params.spellsFilter?.petty || game.settings.get("wfrp4e-assistant", "assistantPreset").character.spellsFilter.petty
							},
							reactions: {
								status: params.reactions?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").character.reactions.status,
								species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").character.reactions.species,
								frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").character.reactions.frequency
							}
						};
						break;
					};
					case "npc": {
						params = {
							generateName: {
								status: params.generateName?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateName.status,
								species: params.generateName?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateName.species,
								keys: params.generateName?.keys || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateName.keys
							},
							changeCharacteristics: {
								value: params.changeCharacteristics?.value || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.changeCharacteristics.value
							},
							randomCharacteristics: {
								status: params.randomCharacteristics?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.randomCharacteristics.status
							},
							deathTint: {
								color: params.deathTint?.color || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.deathTint.color
							},
							generateSpells: {
								status: params.generateSpells?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateSpells.status,
								lore: params.generateSpells?.lore || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateSpells.lore,
								count: params.generateSpells?.count || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateSpells.count,
								arcane: params.generateSpells?.arcane || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.generateSpells.arcane
							},
							disposition: {
								value: params.disposition || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.disposition
							},
							spellsFilter: {
								page: params.spellsFilter?.page || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.spellsFilter.page,
								list: params.spellsFilter?.list || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.spellsFilter.list,
								petty: params.spellsFilter?.petty || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.spellsFilter.petty
							},
							reactions: {
								status: params.reactions?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.reactions.status,
								species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.reactions.species,
								frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.reactions.frequency
							}
						};
						break;
					};
					case "creature": {
						params = {
							generateName: {
								status: params.generateName?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateName.status,
								species: params.generateName?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateName.species,
								keys: params.generateName?.keys || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateName.keys
							},
							changeCharacteristics: {
								value: params.changeCharacteristics?.value || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.changeCharacteristics.value
							},
							randomCharacteristics: {
								status: params.randomCharacteristics?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.randomCharacteristics.status
							},
							deathTint: {
								color: params.deathTint?.color || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.deathTint.color,
							},
							generateSpells: {
								status: params.generateSpells?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateSpells.status,
								lore: params.generateSpells?.lore || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateSpells.lore,
								count: params.generateSpells?.count || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateSpells.count,
								arcane: params.generateSpells?.arcane || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.generateSpells.arcane
							},
							disposition: {
								value: params.disposition || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.disposition
							},
							spellsFilter: {
								page: params.spellsFilter?.page || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.spellsFilter.page,
								list: params.spellsFilter?.list || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.spellsFilter.list,
								petty: params.spellsFilter?.petty || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.spellsFilter.petty
							},
							reactions: {
								status: params.reactions?.status || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.reactions.status,
								species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.reactions.species,
								frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.reactions.frequency
							}
						};
						break;
					};
				};
				//Создание эффекта
				effect = await createEffect(actor, params);
			//Удаление несуществующих скриптов
			} else if (effect.system.scriptData.length != effect.system.scriptData.filter(s => game.wfrp4e.config.effectScripts[s.script.substring(s.script.indexOf("[Script.") + 8, s.script.lastIndexOf("]"))]).length) {
				effect.update({"system.scriptData": effect.system.scriptData.filter(s => game.wfrp4e.config.effectScripts[s.script.substring(s.script.indexOf("[Script.") + 8, s.script.lastIndexOf("]"))])});
			//Включение эффекта
			} else {effect.update({
				"disabled": false,
				"count": 1
			})};
		//Выключение эффекта
		} else if (effect) {effect.update({"disabled": true})};
	};

	//Списки заклинаний
	if (html && actor.hasSpells) {spellsFilter(html, effect, actor)};

	if (game.settings.get("wfrp4e-assistant", "hideHelpersTrait")) {
		let element = actor.sheet.form.querySelector(`section[data-tab="effects"]>.effect-lists>.sheet-list>.list-content>div[data-uuid="${effect.uuid}"]`) || false;
		if (element) {element.style.display = "none"};
	};

	return effect;
};

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
	if ((sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature")) {
		await getEffect(sheet.document, html);
	};
});

Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
	if(game.user.isGM && sheet.isEditable && game.settings.get("wfrp4e-assistant", "enableHelpers") && !sheet.document.inCompendium && (sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature")) {
		controls.push({
			icon: "fas fa-handshake-angle",
			label: game.i18n.localize("WFRP4E.Assistant.Label"),
			onClick: () => assistantMenu(sheet.document),
		});
	};
});

async function assistantMenu(actor) {
	let effect = await getEffect(actor);
	let params = effect.flags.assistant;
	let lores = [{value: "arcane", label: game.i18n.localize("WFRP4E.MagicLores.arcane")}];
	for (let i = 0; i < Object.keys(game.wfrp4e.config.magicLores).length; i++) {
		lores.push({value: Object.keys(game.wfrp4e.config.magicLores)[i], label: Object.values(game.wfrp4e.config.magicLores)[i]});
	};
	let buttons = {};
	if (actor.token) {
		buttons.export = {
			icon: "<i class='fas fa-file-export'></i>",
			label: game.i18n.localize("WFRP4E.Assistant.Export"),
			callback: async () => {
				let actorData = actor.toObject();
				actorData.prototypeToken = actor.token.toObject();
				actorData.prototypeToken.actorLink = true;
				actorData.prototypeToken.appendNumber = false;
				actorData.folder = null;
				Actor.create(actorData);
			}
		};
	};
	buttons.save = {
		icon: "<i class='fas fa-save'></i>",
		label: game.i18n.localize("Save"),
		callback: (html) => {
			let newParams = {};
			let element = html[0].querySelector("#WFRP4E_Assistant .dialog-content");
			if (element.querySelector("#generateName")) {
				let species = element.querySelector("#generateNameSpecies").value;
				if (species) {
					newParams.generateName = {
						status: element.querySelector("#generateNameStatus").checked,
						species: species,
						subspecies: element.querySelector("#reactionsSubspecies").value || "",
						keys: element.querySelector("#generateNameKeys").value.split(",").filter(v => Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[species]).includes(v)).join(",")
					};
				} else {
					newParams.generateName = {
						status: false,
						species: "",
						subspecies: "",
						keys: element.querySelector("#generateNameKeys").value
					};
				};
			};
			if (element.querySelector("#changeCharacteristics")) {
				newParams.changeCharacteristics = {
					value: element.querySelector("#changeCharacteristicsValue").value || 0
				};
			};
			if (element.querySelector("#randomCharacteristics")) {
				newParams.randomCharacteristics = {
					status: element.querySelector("#randomCharacteristicsStatus").checked
				};
			};
			if (element.querySelector("#deathTint")) {
				newParams.deathTint = {
					status: element.querySelector("#deathTintValue").value
				};
			};
			if (element.querySelector("#generateSpells")) {
				newParams.generateSpells = {
					status: element.querySelector("#generateSpellsStatus").checked,
					lore: element.querySelector("#generateSpellsLore").value,
					count: Math.max(1, element.querySelector("#generateSpellsCount").value),
					arcane: element.querySelector("#generateSpellsArcane").checked
				};
			};
			if (element.querySelector("#disposition")) {
				newParams.disposition = {
					value: element.querySelector("#dispositionValue").value
				};
			};
			if (element.querySelector("#reactions")) {
				let species = element.querySelector("#reactionsSpecies").value || "";
				newParams.reactions = {
					status: element.querySelector("#reactionsStatus").checked,
					species: species,
					subspecies: species ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[species].Subspecies).includes(element.querySelector("#reactionsSubspecies").value) ? element.querySelector("#reactionsSubspecies").value : "None" : element.querySelector("#reactionsSubspecies").value,
					frequency: element.querySelector("#reactionsFrequency").value
				};
			};
			effect.update({"flags.assistant": newParams});
		}
	};
	let species = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species).map(s => ({
		species: {
			value: s,
			name: game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species[s],
			keys: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[s]).map(k => `<li><strong>${k}</strong>: <em>${game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[s][k]}</em></li>`).join("")
		}
	}));
	let reactions = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species).map(s => ({
		value: s,
		name: game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Name,
		subspecies: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Subspecies || false).map(sub => ({
			value: sub,
			name: game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Subspecies[sub]
		}))
	}));
	new Dialog({
		title: actor.name,
		content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-assistant/templates/assistantMenu.hbs", {params, lores, species, reactions}),
		buttons: buttons,
		default: "save",
		close: () => {}
	}, {id: "WFRP4E_Assistant", width: 500, resizable: true}).render(true);
};