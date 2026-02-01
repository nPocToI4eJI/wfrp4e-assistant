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
	static async getReaction(actor, opponent, action, location) {
		if (!game.wfrp4e.assistant.bubbles.includes(actor.id) && game.wfrp4e.assistant.reactions) {
			let phrases = game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.List[actor.species][action];

			let debug = [{Species: actor.species}];
			if (actor.subspecies != "Not") {debug[0].Subspecies = actor.subspecies};
			debug[0].Action = action;

			let reactionsList = [];
			try {
				reactionsList = reactionsList.concat(Object.values(phrases.All.Base));
				debug.push({
					name: game.i18n.localize("Species"),
					path: "List." + actor.species + "." + action + ".All.Base",
					values: Object.values(phrases.All.Base)
				});
			} catch {
				debug.push({
					name: game.i18n.localize("Species"),
					path: "List." + actor.species + "." + action + ".All.Base",
					values: game.i18n.localize("None")
				});
			};

			if (opponent) {
				try {
					reactionsList = reactionsList.concat(Object.values(phrases.All.Opponent.All));
					debug.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
						path: "List." + actor.species + "." + action + ".All.Opponent.All",
						values: Object.values(phrases.All.Opponent.All)
					});
				} catch {
					debug.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
						path: "List." + actor.species + "." + action + ".All.Opponent.All",
						values: game.i18n.localize("None")
					});
				};
				if (opponent.species != "Disabled") {
					try {
						reactionsList = reactionsList.concat(Object.values(phrases.All.Opponent[opponent.species].All));
						debug.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species})`,
							parh: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + ".All",
							values: Object.values(phrases.All.Opponent[opponent.species].All)
						});
					} catch {
						debug.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species})`,
							path: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + ".All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.subspecies != "Not") {
						try {
							reactionsList = reactionsList.concat(Object.values(phrases.All.Opponent[opponent.species][opponent.subspecies]));
							debug.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
								parh: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + "." + opponent.subspecies,
								values: Object.values(phrases.All.Opponent[opponent.species][opponent.subspecies])
							});
						} catch {
							debug.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
								path: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + "." + opponent.subspecies,
								values: game.i18n.localize("None")
							});
						};
					};
				};
			};

			if (location) {
				try {
					reactionsList = reactionsList.concat(Object.values(phrases.All.To[location].Base));
					debug.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
						parh: "List." + actor.species + "." + action + ".All.To." + location + ".Base",
						values: Object.values(phrases.All.To[location].Base)
					});
				} catch {
					debug.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
						path: "List." + actor.species + "." + action + ".All.To." + location + ".Base",
						values: game.i18n.localize("None")
					});
				};
				if (opponent) {
					try {
						reactionsList = reactionsList.concat(Object.values(phrases.All.To[location].All));
						debug.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
							parh: "List." + actor.species + "." + action + ".All.To." + location + ".All",
							values: Object.values(phrases.All.To[location].All)
						});
					} catch {
						debug.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
							path: "List." + actor.species + "." + action + ".All.To." + location + ".All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.species != "Disabled") {
						try {
							reactionsList = reactionsList.concat(Object.values(phrases.All.To[location][opponent.species].All));
							debug.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
								parh: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + ".All",
								values: Object.values(phrases.All.To[location][opponent.species].All)
							});
						} catch {
							debug.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
								path: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.subspecies != "Not") {
							try {
								reactionsList = reactionsList.concat(Object.values(phrases.All.To[location][opponent.species][opponent.subspecies]));
								debug.push({
									name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
									parh: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + "." + opponent.subspecies + ".All",
									values: Object.values(phrases.All.To[location][opponent.species][opponent.subspecies])
								});
							} catch {
								debug.push({
									name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
									path: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + "." + opponent.subspecies + ".All",
									values: game.i18n.localize("None")
								});
							};
						};
					};
				};
			};

			if (actor.subspecies != "Not") {
				try {
					reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].Base));
					debug.push({
						name: game.i18n.localize("Subspecies"),
						parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Base",
						values: Object.values(phrases[actor.subspecies].Base)
					});
				} catch {
					debug.push({
						name: game.i18n.localize("Subspecies"),
						path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Base",
						values: game.i18n.localize("None")
					});
				};

				if (opponent) {
					try {
						reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].Opponent.All));
						debug.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
							parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent.All",
							values: Object.values(phrases[actor.subspecies].Opponent.All)
						});
					} catch {
						debug.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
							path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent.All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.species != "Not") {
						try {
							reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].Opponent[opponent.species].All));
							debug.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species})`,
								parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + ".All",
								values: Object.values(phrases[actor.subspecies].Opponent[opponent.species].All)
							});
						} catch {
							debug.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species})`,
								path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.subspecies != "Not") {
							try {
								reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]));
								debug.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
									parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + "." + opponent.subspecies,
									values: Object.values(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies])
								});
							} catch {
								debug.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
									path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + "." + opponent.subspecies,
									values: game.i18n.localize("None")
								});
							};
						};
					};
				};

				if (location) {
					try {
						reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].To[location].Base));
						debug.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
							parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".Base",
							values: Object.values(phrases[actor.subspecies].To[location].Base)
						});
					} catch {
						debug.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
							path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".Base",
							values: game.i18n.localize("None")
						});
					};
					if (opponent) {
						try {
							reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].To[location].All));
							debug.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
								parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".All",
								values: Object.values(phrases[actor.subspecies].To[location].All)
							});
						} catch {
							debug.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
								path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.species != "Not") {
							try {
								reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].To[location][opponent.species].All));
								debug.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
									parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + ".All",
									values: Object.values(phrases[actor.subspecies].To[location][opponent.species].All)
								});
							} catch {
								debug.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
									path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + ".All",
									values: game.i18n.localize("None")
								});
							};
							if (opponent.subspecies != "Not") {
								try {
									reactionsList = reactionsList.concat(Object.values(phrases[actor.subspecies].To[location][opponent.species][opponent.subspecies]));
									debug.push({
										name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
										parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + "." + opponent.subspecies,
										values: Object.values(phrases[actor.subspecies].To[location][opponent.species][opponent.subspecies])
									});
								} catch {
									debug.push({
										name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
										path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + "." + opponent.subspecies,
										values: game.i18n.localize("None")
									});
								};
							};
						};
					};
				};
			};

			for (let i = 0; i < reactionsList.length; i++) {
				if (reactionsList[i][0] == "#") {
					reactionsList[i] = game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.List." + reactionsList[i].slice(1));
				};
			};
			if (game.wfrp4e.assistant.reactionsDebugMessage) {console.warn(game.modules.get("wfrp4e-assistant").title + "\n" + game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Label") + ": ", debug)};

			for (let i = 0; i < actor.tokens.length; i++) {
				let phrase = reactionsList[(await new Roll(`1d${reactionsList.length}`).roll()).result - 1];

				if (phrase) {
					if (game.settings.get("wfrp4e-assistant", "reactionsSend") == 0) {
						canvas.hud.bubbles.broadcast(actor.tokens[i], `<em>${phrase}</em><span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}<span>`);
						ChatMessage.create({
							speaker: {scene: game.scenes.current, token: actor.tokens[i]},
							content: `<em>${phrase}</em>`
						});
					} else if (game.settings.get("wfrp4e-assistant", "reactionsSend") == 1) {
						canvas.hud.bubbles.broadcast(actor.tokens[i], `<em>${phrase}</em><span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}<span>`);
					} else if (game.settings.get("wfrp4e-assistant", "reactionsSend") == 2) {
						ChatMessage.create({
							speaker: {scene: game.scenes.current, token: actor.tokens[i]},
							content: `<em>${phrase}</em>`
						});
					};

					game.wfrp4e.assistant.bubbles.push(actor.id);
					setTimeout(() => {
						let index = game.wfrp4e.assistant.bubbles.indexOf(actor.id);
						if (index > -1) {game.wfrp4e.assistant.bubbles.splice(index, 1)};
					}, 2000);
				};
			};
		};
	};
};

class assistantMenu extends FormApplication {
	constructor() {
		super({});
	};
	render() {this.close()}
};

Hooks.once("init", function () {
	game.settings.register("wfrp4e-assistant", "enableArcane", {
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
					species: "Disabled",
					subspecies: "Not",
					frequency: "50"
				},
				version: game.modules.get("wfrp4e-assistant").version
			},
			npc: {
				generateName: {
					species: "Disabled",
					keys: ""
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
					lore: "Disabled",
					count: 1,
					arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
				},
				disposition: {
					value: "3"
				},
				spellsFilter: {
					page: -1,
					list: [],
					petty: true
				},
				reactions: {
					species: "Disabled",
					subspecies: "Not",
					frequency: "75"
				},
				version: game.modules.get("wfrp4e-assistant").version
			},
			creature: {
				generateName: {
					species: "Disabled",
					keys: ""
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
					lore: "Disabled",
					count: 1,
					arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
				},
				disposition: {
					value: "3"
				},
				spellsFilter: {
					page: -1,
					list: [],
					petty: true
				},
				reactions: {
					species: "Disabled",
					subspecies: "Not",
					frequency: "75"
				},
				version: game.modules.get("wfrp4e-assistant").version
			}
		},
		type: Object
	});
	/*game.settings.registerMenu("wfrp4e-assistant", "assistantMenu", {
		name: "Меню создания пресетов",
		label: "Тут можно будет делать заранее заготовленные пресеты настроек Помощника, которые потом легко применить к актёрам.",
		hint: "Пока в разработке",
		icon: "fas fa-trash",
		type: assistantMenu
	});*/
	game.settings.register("wfrp4e-assistant", "reactionsSend", {
		name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsSend.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsSend.Hint"),
		scope: "world",
		config: true,
		choices: {
			0: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsSend.Both"),
			1: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsSend.Bubble"),
			2: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.reactionsSend.Chat")
		},
		default: 0,
		type: Number
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
		config: true,
		default: game.modules.get("babele")?.active ? true : false,
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

	foundry.utils.mergeObject(game.wfrp4e.config.effectScripts, {
		//Создание токена
		"YRJEOMjZZ7iinnPx": "if (!this.actor.inCompendium && game.settings.get('wfrp4e-assistant', 'enableHelpers')) {"
			+ "\n\tif (args.created) {"
			+ "\n\t\tlet params = this.effect.flags.assistant;"
			+ "\n\t\tgame.wfrp4e.assistant.bubbles.push(args.actor.uuid);"
			+ "\n\t\tif (params.generateName?.species != 'Disabled' && !this.actor.prototypeToken.actorLink) {"
			+ "\n\t\t\tlet name = [];"
			+ "\n\t\t\tlet speciesKeys = params.generateName.keys.split(',');"
			+ "\n\t\t\tspeciesKeys.forEach(k => {"
			+ "\n\t\t\t\tlet values = Object.values(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params.generateName.species][k] || '');"
			+ "\n\t\t\t\tname.push(values[Math.floor(CONFIG.Dice.randomUniform() * values.length)]);"
			+ "\n\t\t\t});"
			+ "\n\t\t\tif (!name.length) {name = this.actor.name};"
			+ "\n\t\t\tthis.actor.update({'name': name.join(' ')});"
			+ "\n\t\t\targs.update({'name': name[0]});"
			+ "\n\t\t\tparams.generateName.species = 'Disabled';"
			+ "\n\t\t};"
			+ "\n\t\tif (params.randomCharacteristics?.status) {"
			+ "\n\t\t\tthis.actor.update({"
			+ "\n\t\t\t\t'system.characteristics.ws.initial': this.actor.system.characteristics.ws.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.ws.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.bs.initial': this.actor.system.characteristics.bs.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.bs.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.s.initial': this.actor.system.characteristics.s.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.s.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.t.initial': this.actor.system.characteristics.t.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.t.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.i.initial': this.actor.system.characteristics.i.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.i.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.dex.initial': this.actor.system.characteristics.dex.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.dex.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.ag.initial': this.actor.system.characteristics.ag.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.ag.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.int.initial': this.actor.system.characteristics.int.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.int.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.wp.initial': this.actor.system.characteristics.wp.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.wp.initial - 10 + (await new Roll('2d10').roll()).total,"
			+ "\n\t\t\t\t'system.characteristics.fel.initial': this.actor.system.characteristics.fel.initial == 5 ? (await new Roll('1d10').roll()).total : this.actor.system.characteristics.fel.initial - 10 + (await new Roll('2d10').roll()).total"
			+ "\n\t\t\t});"
			+ "\n\t\t\tparams.randomCharacteristics.status = false;"
			+ "\n\t\t};"
			+ "\n\t\tif (params.generateSpells && params.generateSpells?.lore != 'Disabled') {"
			+ "\n\t\t\tlet spells = await warhammer.utility.findAllItems('spell', game.i18n.localize('WFRP4E.Assistant.systemFix.Search'), true, ['uuid', 'system.lore.value']);"
			+ "\n\t\t\tspells = spells.filter(s => s.system.lore.value == params.generateSpells.lore || (params.generateSpells.arcane && s.system.lore.value == ''));"
			+ "\n\t\t\tlet resultSpells = [];"
			+ "\n\t\t\tfor (let i = params.generateSpells.count; i > 0; i--) {"
			+ "\n\t\t\t\tlet result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);"
			+ "\n\t\t\t\tlet spell = await fromUuid(spells[result].uuid);"
			+ "\n\t\t\t\tresultSpells.push(spell);"
			+ "\n\t\t\t\tawait spells.splice(result, 1);"
			+ "\n\t\t\t};"
			+ "\n\t\t\tthis.actor.createEmbeddedDocuments('Item', resultSpells, {broadcast: false})"
			+ "\n\t\t\tparams.generateSpells.lore = 'Disabled';"
			+ "\n\t\t};"
			+ "\n\t\tif (params.disposition) {"
			+ "\n\t\t\tswitch (params.disposition.value) {"
			+ "\n\t\t\t\tcase '4': {"
			+ "\n\t\t\t\t\tchoice = await ItemDialog.create([{name: game.i18n.localize('TOKEN.DISPOSITION.NEUTRAL'), value: 0}, {name: game.i18n.localize('TOKEN.DISPOSITION.FRIENDLY'), value: 1}, {name: game.i18n.localize('TOKEN.DISPOSITION.HOSTILE'), value: -1}, {name: game.i18n.localize('TOKEN.DISPOSITION.SECRET'), value: -2}], 1, {text: game.i18n.localize('WFRP4E.Assistant.Helpers.Disposition.Tooltip'), title: game.i18n.localize('WFRP4E.Assistant.Helpers.Disposition.Label')});"
			+ "\n\t\t\t\t\targs.update({'disposition': choice[0]?.value});"
			+ "\n\t\t\t\t\tbreak;"
			+ "\n\t\t\t\t};"
			+ "\n\t\t\t\tcase '0': args.update({'disposition': 0}); break;"
			+ "\n\t\t\t\tcase '1': args.update({'disposition': 1}); break;"
			+ "\n\t\t\t\tcase '-1': args.update({'disposition': -1}); break;"
			+ "\n\t\t\t\tcase '-2': args.update({'disposition': -2}); break;"
			+ "\n\t\t\t};"
			+ "\n\t\t};"
			+ "\n\t\tsetTimeout(() => {"
			+ "\n\t\t\tlet index = game.wfrp4e.assistant.bubbles.indexOf(args.actor.uuid);"
			+ "\n\t\t\tif (index > -1) {game.wfrp4e.assistant.bubbles.splice(index, 1)};"
			+ "\n\t\t}, 2000);"
			+ "\n\t\tthis.effect.update({'flags.assistant': params});"
			+ "\n\t} else {args.created = true};"
			+ "\n};",
		//Обновление данных актёра
		"BJmxXK4ESSTuenLd": "if (!this.actor.inCompendium) {"
			+ "\n\tif (game.settings.get('wfrp4e-assistant', 'enableHelpers') && args.user == game.user.id) {"
			+ "\n\t\tlet params = this.effect.flags.assistant;"
			+ "\n\t\tif (args.data?.system?.status?.wounds) {"
			+ "\n\t\t\tlet color;"
			+ "\n\t\t\tif (this.actor.status.wounds.value <= 0) {"
			+ "\n\t\t\t\tcolor = params.deathTint.color;"
			+ "\n\t\t\t\tif (game.modules.get('healthEstimate')?.active && game.healthEstimate?.NPCsJustDie && this.actor.type != 'character' && (!this.actor.token?.flags?.healthEstimate.dontMarkDead || (!this.actor.token && !this.actor.prototypeToken.flags?.healthEstimate.dontMarkDead)) && !this.actor.hasCondition('dead')) {"
			+ "\n\t\t\t\t\tawait this.actor.addCondition('dead');"
			+ "\n\t\t\t\t};"
			+ "\n\t\t\t} else {"
			+ "\n\t\t\t\tcolor = this.actor?.prototypeToken.texture.tint || '#FFFFFF';"
			+ "\n\t\t\t\tif (this.actor.hasCondition('dead')) {"
			+ "\n\t\t\t\t\tawait this.actor.removeCondition('dead');"
			+ "\n\t\t\t\t};"
			+ "\n\t\t\t};"
			+ "\n\t\t\tif (!this.actor.prototypeToken.actorLink && this.actor.token) {this.actor.token.update({'texture.tint': color})}"
			+ "\n\t\t\telse {"
			+ "\n\t\t\t\tlet tokens = this.actor.getDependentTokens();"
			+ "\n\t\t\t\tfor (let i = 0; i < tokens.length; i++) {"
			+ "\n\t\t\t\t\ttokens[i].update({'texture.tint': color});"
			+ "\n\t\t\t\t};"
			+ "\n\t\t\t};"
			+ "\n\t\t} else if (args.data?.flags?.assistant?.changeCharacteristics) {"
			+ "\n\t\t\tlet changes = [];"
			+ "\n\t\t\tObject.keys(game.wfrp4e.config.characteristics).forEach(c => {"
			+ "\n\t\t\t\tchanges.push({"
			+ "\n\t\t\t\t\tkey: 'system.characteristics.' + c + '.initial',"
			+ "\n\t\t\t\t\tmode: 2,"
			+ "\n\t\t\t\t\tvalue: parseInt(args.data.flags.assistant.changeCharacteristics.value)"
			+ "\n\t\t\t\t});"
			+ "\n\t\t\t});"
			+ "\n\t\t\tthis.effect.update({changes});"
			+ "\n\t\t\t[this.actor.uuid, ...this.actor.getDependentTokens().map(t => t.actor.uuid)].forEach(uuid => {"
			+ "\n\t\t\t\tgame.wfrp4e.assistant.bubbles.push(uuid);"
			+ "\n\t\t\t\tsetTimeout(() => {"
			+ "\n\t\t\t\t\tlet index = game.wfrp4e.assistant.bubbles.indexOf(uuid);"
			+ "\n\t\t\t\t\tif (index > -1) {game.wfrp4e.assistant.bubbles.splice(index, 1)};"
			+ "\n\t\t\t\t}, 2000);"
			+ "\n\t\t\t});"
			+ "\n\t\t};"
			+ "\n\t\tif (params.reactions.species != 'Disabled' && parseInt(params.reactions.frequency) != 0) {"
			+ "\n\t\t\tif (parseInt(params.reactions.frequency) >= (await new Roll('1d100').roll()).result) {"
			+ "\n\t\t\t\tif (args.options.deltaWounds < 0) {"
			+ "\n\t\t\t\t\tlet actor = {name: this.actor.name, id: this.actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};"
			+ "\n\t\t\t\t\tactor.tokens = this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [this.actor.token];"
			+ "\n\t\t\t\t\tlet action;"
			+ "\n\t\t\t\t\tif (this.actor.system.status.wounds.value <= 0) {action = 'die'}"
			+ "\n\t\t\t\t\telse {action = 'takeDamage'};"
			+ "\n\t\t\t\t\tif (actor.tokens.length) {await game.wfrp4e.utility.getReaction(actor, false, action, false)};"
			+ "\n\t\t\t\t};"
			+ "\n\t\t\t};"
			+ "\n\t\t};"
			+ "\n\t};"
			+ "\n};",
		//Реакции. Получение урона
		"xEEfsTELB5p9qoe0": "if (!this.actor.inCompendium && game.settings.get('wfrp4e-assistant', 'enableHelpers')) {"
			+ "\n\tlet params = this.effect.flags.assistant;"
			+ "\n\tif (params.reactions.species != 'Disabled' && parseInt(params.reactions.frequency) != 0) {"
			+ "\n\t\tif (parseInt(params.reactions.frequency) >= (await new Roll('1d100').roll()).result) {"
			+ "\n\t\t\tlet actor = {name: this.actor.name, id: this.actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};"
			+ "\n\t\t\tactor.tokens = this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [this.actor.token];"
			+ "\n\t\t\tlet attacker = {species: '', subspecies: ''};"
			+ "\n\t\t\tlet attackerEffect = args.attacker.effects.find(e => e.flags.assistant);"
			+ "\n\t\t\tif (attackerEffect) {"
			+ "\n\t\t\t\tattacker.species = attackerEffect.flags.assistant.reactions.species || '';"
			+ "\n\t\t\t\tattacker.subspecies = attackerEffect.flags.assistant.reactions.subspecies || '';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tlet action;"
			+ "\n\t\t\tlet location = false;"
			+ "\n\t\t\tif (this.actor.status.wounds.value <= args.totalWoundLoss) {action = 'die'}"
			+ "\n\t\t\telse {"
			+ "\n\t\t\t\tlet hitLoc = args.opposedTest.result.hitloc.value.toLowerCase();"
			+ "\n\t\t\t\tif (hitLoc.includes('head')) {location = 'Head'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('body')) {location = 'Body'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('arm')) {location = 'Arm'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('leg')) {location = 'Leg'};"
			+ "\n\t\t\t\taction = 'takeDamage';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tif (actor.tokens.length) {await game.wfrp4e.utility.getReaction(actor, attacker, action, location)};"
			+ "\n\t\t};"
			+ "\n\t};"
			+ "\n};",
		//Реакции. Нанесение урона
		"dxZ3pksVILjm0VpQ":"if (!this.actor.inCompendium && game.settings.get('wfrp4e-assistant', 'enableHelpers')) {"
			+ "\n\tlet params = this.effect.flags.assistant;"
			+ "\n\tif (params.reactions.species != 'Disabled' && parseInt(params.reactions.frequency) != 0) {"
			+ "\n\t\tif (parseInt(params.reactions.frequency) >= (await new Roll('1d100').roll()).result) {"
			+ "\n\t\t\tlet actor = {name: this.actor.name, id: this.actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};"
			+ "\n\t\t\tactor.tokens = this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [this.actor.token];"
			+ "\n\t\t\tlet target = {species: '', subspecies: ''};"
			+ "\n\t\t\tlet targetEffect = args.actor.effects.find(e => e.flags.assistant);"
			+ "\n\t\t\tif (targetEffect) {"
			+ "\n\t\t\t\ttarget.species = targetEffect.flags.assistant.reactions.species || '';"
			+ "\n\t\t\t\ttarget.subspecies = targetEffect.flags.assistant.reactions.subspecies || '';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tlet action;"
			+ "\n\t\t\tlet location = false;"
			+ "\n\t\t\tif (args.actor.status.wounds.value <= args.totalWoundLoss) {action = 'kill'}"
			+ "\n\t\t\telse {"
			+ "\n\t\t\t\tlet hitLoc = args.opposedTest.result.hitloc.value.toLowerCase();"
			+ "\n\t\t\t\tif (hitLoc.includes('head')) {location = 'Head'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('body')) {location = 'Body'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('arm')) {location = 'Arm'}"
			+ "\n\t\t\t\telse if (hitLoc.includes('leg')) {location = 'Leg'};"
			+ "\n\t\t\t\taction = 'applyDamage';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tif (actor.tokens.length) {await game.wfrp4e.utility.getReaction(actor, target, action, location)};"
			+ "\n\t\t};"
			+ "\n\t};"
			+ "\n};",
		//Реакции. Защита
		"ycq35CrgN67rlGJZ": "if (!this.actor.inCompendium && game.settings.get('wfrp4e-assistant', 'enableHelpers')) {"
			+ "\n\tlet params = this.effect.flags.assistant;"
			+ "\n\tif (params.reactions.species != 'Disabled' && parseInt(params.reactions.frequency) != 0) {"
			+ "\n\t\tif (parseInt(params.reactions.frequency) >= (await new Roll('1d100').roll()).result) {"
			+ "\n\t\t\tlet actor = {name: this.actor.name, id: this.actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};"
			+ "\n\t\t\tactor.tokens = this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [this.actor.token];"
			+ "\n\t\t\tlet target = {species: '', subspecies: ''};"
			+ "\n\t\t\tlet targetEffect = args.opposedTest.attacker.effects.find(e => e.flags.assistant);"
			+ "\n\t\t\tif (targetEffect) {"
			+ "\n\t\t\t\ttarget.species = targetEffect.flags.assistant.reactions.species || '';"
			+ "\n\t\t\t\ttarget.subspecies = targetEffect.flags.assistant.reactions.subspecies || '';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tlet action;"
			+ "\n\t\t\tif (args.opposedTest.result.winner == 'defender') {action = 'opposedDefenderSuccess'}"
			+ "\n\t\t\telse {action = 'opposedDefenderFailure'};"
			+ "\n\t\t\tif (actor.tokens.length) {await game.wfrp4e.utility.getReaction(actor, target, action, false)};"
			+ "\n\t\t};"
			+ "\n\t};"
			+ "\n};",
		//Реакции. Атака
		"pIr5z44FuRX9Xq6a": "if (!this.actor.inCompendium && game.settings.get('wfrp4e-assistant', 'enableHelpers')) {"
			+ "\n\tlet params = this.effect.flags.assistant;"
			+ "\n\tif (params.reactions.species != 'Disabled' && parseInt(params.reactions.frequency) != 0) {"
			+ "\n\t\tif (parseInt(params.reactions.frequency) >= (await new Roll('1d100').roll()).result) {"
			+ "\n\t\t\tlet actor = {name: this.actor.name, id: this.actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};"
			+ "\n\t\t\tactor.tokens = this.actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [this.actor.token];"
			+ "\n\t\t\tlet target = {species: '', subspecies: ''};"
			+ "\n\t\t\tlet targetEffect = args.opposedTest.defender.effects.find(e => e.flags.assistant);"
			+ "\n\t\t\tif (targetEffect) {"
			+ "\n\t\t\t\ttarget.species = targetEffect.flags.assistant.reactions.species || '';"
			+ "\n\t\t\t\ttarget.subspecies = targetEffect.flags.assistant.reactions.subspecies || '';"
			+ "\n\t\t\t};"
			+ "\n\t\t\tlet action;"
			+ "\n\t\t\tif (args.opposedTest.result.winner == 'attacker') {action = 'opposedAttackerSuccess'}"
			+ "\n\t\t\telse {action = 'opposedAttackerFailure'};"
			+ "\n\t\t\tif (actor.tokens.length) {await game.wfrp4e.utility.getReaction(actor, target, action, false)};"
			+ "\n\t\t};"
			+ "\n\t};"
			+ "\n};"
	});
});

Hooks.once("ready", () => {
	//Указание на перевод, сделанный ИИ
	if (game.user.isGM && ["en"].includes(game.i18n.lang)) {ui.notifications.notify(game.modules.get("wfrp4e-assistant").title + ": " + game.i18n.localize("WFRP4E.Assistant.AI"))};

	game.wfrp4e.assistant = {
		bubbles: [],
		updateScripts: true,
		updateEffect: false,
		reactions: true,
		reactionsDebugMessage: false
	};
});

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
	let actor = sheet.document;
	let effect = actor.effects.find(e => e.flags.assistant);

	if (game.user.isGM && !actor.inCompendium && ["character", "npc", "creature"].includes(sheet.document.type)) {
		let effectDefault = {
			disabled: game.settings.get("wfrp4e-assistant", "enableHelpers"),
			icon: "modules/wfrp4e-assistant/icons/conditions/assistant.png",
			name: game.i18n.localize("WFRP4E.Assistant.Label"),
			system: {
				scriptData: [
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Create"),
						trigger: "createToken",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.YRJEOMjZZ7iinnPx]}"
							+ "\nelse {console.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "')};"
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Update"),
						trigger: "update",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.BJmxXK4ESSTuenLd]}"
							+ "\nelse {"
							+ "\n\tconsole.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "');"
							+ "\n\tlet changes = [];"
							+ "\n\tObject.keys(game.wfrp4e.config.characteristics).forEach(c => {"
							+ "\n\t\tchanges.push({"
							+ "\n\t\t\tkey: 'system.characteristics.' + c + '.initial',"
							+ "\n\t\t\tmode: 2,"
							+ "\n\t\t\tvalue: 0"
							+ "\n\t\t});"
							+ "\n\t});"
							+ "\n\tthis.effect.update({changes});"
							+ "\n};"
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.TDamage"),
						trigger: "takeDamage",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.xEEfsTELB5p9qoe0]}"
							+ "\nelse {console.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "')};"
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.ADamage"),
						trigger: "applyDamage",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.dxZ3pksVILjm0VpQ]}"
							+ "\nelse {console.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "')};"
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.OpposedD"),
						trigger: "opposedDefender",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.ycq35CrgN67rlGJZ]}"
							+ "\nelse {console.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "')};"
					},
					{
						label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.OpposedA"),
						trigger: "opposedAttacker",
						script: "if (game.modules.get('wfrp4e-assistant')?.active) {[Script.pIr5z44FuRX9Xq6a]}"
							+ "\nelse {console.warn('" + game.i18n.format("WFRP4E.Assistant.Helpers.Scripts.Error", {name: game.modules.get("wfrp4e-assistant").title}) + "')};"
					}
				]
			}
		};

		//Проверка на дубликаты
		if (actor.effects.filter(e => e.flags.assistant).length > 1) {
			actor.effects.filter(e => e.flags.assistant)[1].delete();
			console.warn(game.i18n.format("WFRP4E.Assistant.Helpers.Debug.Duplicates", {name: game.modules.get("wfrp4e-assistant").title}));
			return;
		};

		//Проверка на наличие эффекта
		if (!effect) {
			let params;
			//Присвоение стандартных параметров
			switch (actor.type) {
				case "character": params = game.settings.get("wfrp4e-assistant", "assistantPreset").character; break;
				case "npc": params = game.settings.get("wfrp4e-assistant", "assistantPreset").npc; break;
				case "creature": params = game.settings.get("wfrp4e-assistant", "assistantPreset").creature; break;
			};
			//Создание эффекта
			console.warn(game.i18n.format("WFRP4E.Assistant.Helpers.Debug.Create", {name: game.modules.get("wfrp4e-assistant").title}));
			effect = await actor.createEmbeddedDocuments("ActiveEffect", [{...effectDefault, flags: {assistant: params}}], {broadcast: false});
			return;
		};

		//Проверка целостности скриптов
		if (game.wfrp4e.assistant.updateEffect || (game.wfrp4e.assistant.updateScripts && effect.flags.assistant.version != game.modules.get("wfrp4e-assistant").version)) {
			let params = effect.flags.assistant;
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
							species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").character.reactions.species,
							frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").character.reactions.frequency
						},
						version: game.modules.get("wfrp4e-assistant").version
					};
					break;
				};
				case "npc": {
					params = {
						generateName: {
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
							species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.reactions.species,
							frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").npc.reactions.frequency
						},
						version: game.modules.get("wfrp4e-assistant").version
					};
					break;
				};
				case "creature": {
					params = {
						generateName: {
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
							species: params.reactions?.species || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.reactions.species,
							frequency: params.reactions?.frequency || game.settings.get("wfrp4e-assistant", "assistantPreset").creature.reactions.frequency
						},
						version: game.modules.get("wfrp4e-assistant").version
					};
					break;
				};
			};

			game.wfrp4e.assistant.updateEffect = false;
			console.warn(game.i18n.format("WFRP4E.Assistant.Helpers.Debug.Update", {name: game.modules.get("wfrp4e-assistant").title}));
			//Нормализация эффекта
			effect.update({...effectDefault, flags: {assistant: params}});
			return;
		};

		//Применение настройки вкл/выкл Помощника
		if (game.settings.get("wfrp4e-assistant", "enableHelpers")) {effect.update({"disabled": false})}
		else {effect.update({"disabled": true})};
	};

	//Списки заклинаний
	if (effect && actor.hasSpells) {
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

	//Применение настройки отображения эффекта Помощника
	if (game.settings.get("wfrp4e-assistant", "hideHelpersTrait")) {
		let element = actor.sheet.form.querySelector(`section[data-tab="effects"]>.effect-lists>.sheet-list>.list-content>div[data-uuid="${effect.uuid}"]`) || false;
		if (element) {element.style.display = "none"};
	};
});

Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
	if(game.user.isGM && sheet.isEditable && game.settings.get("wfrp4e-assistant", "enableHelpers") && !sheet.document.inCompendium && ["character", "npc", "creature"].includes(sheet.document.type)) {
		controls.push({
			icon: "fas fa-handshake-angle",
			label: game.i18n.localize("WFRP4E.Assistant.Label"),
			onClick: async () => {
				let actor = sheet.document;
				let effect = actor.effects.find(e => e.flags.assistant);
				if (!effect) {
					console.warn(game.i18n.format("WFRP4E.Assistant.Helpers.Debug.Effect", {name: game.modules.get("wfrp4e-assistant").title}));
					return;
				};
				let params = effect.flags.assistant;

				let lores = [{value: "arcane", label: game.i18n.localize("WFRP4E.MagicLores.arcane")}];
				for (let i = 0; i < Object.keys(game.wfrp4e.config.magicLores).length; i++) {
					lores.push({value: Object.keys(game.wfrp4e.config.magicLores)[i], label: Object.values(game.wfrp4e.config.magicLores)[i]});
				};

				let buttons = [];
				if (actor.token) {
					buttons.push({
						action: "export",
						icon: "fas fa-file-export",
						label: game.i18n.localize("WFRP4E.Assistant.Export"),
						callback: async () => {
							let actorData = actor.toObject();
							actorData.prototypeToken = actor.token.toObject();
							actorData.prototypeToken.actorLink = true;
							actorData.prototypeToken.appendNumber = false;
							actorData.folder = null;
							Actor.create(actorData);
						}
					});
				};
				buttons.push({
					action: "save",
					icon: "fas fa-save",
					label: game.i18n.localize("Save"),
					default: true,
					callback: () => {
						let newParams = {};
						let element = dialog.element;
						if (element.querySelector("#generateName")) {
							let species = element.querySelector("#generateNameSpecies").value;
							if (species != "Disabled") {
								newParams.generateName = {
									species: species,
									keys: element.querySelector("#generateNameKeys").value ? element.querySelector("#generateNameKeys").value.split(",").filter(v => Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[species]).includes(v)).join(",") : ""
								};
							} else {
								newParams.generateName = {
									species: "Disabled",
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
							let species = element.querySelector("#reactionsSpecies").value;
							newParams.reactions = {
								species: species,
								subspecies: species != "Disabled" ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[species].Subspecies).includes(element.querySelector("#reactionsSubspecies").value) ? element.querySelector("#reactionsSubspecies").value : "None" : element.querySelector("#reactionsSubspecies").value,
								frequency: element.querySelector("#reactionsFrequency").value
							};
						};
						effect.update({"flags.assistant": newParams});
					}
				});

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

				let dialog = await new foundry.applications.api.DialogV2({
					window: {title: actor.name},
					content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-assistant/templates/assistantMenu.hbs", {params, lores, species, reactions}),
					buttons: buttons,
					classes: ["WFRP4e_Assistant"]
				}).render(true);

				if (dialog.element.querySelector("#generateName")) {
					//Определение существующих народов и их ключей
					let speciesList = {};
					species.forEach(s => speciesList[s.species.value] = s.species.keys);
					//Определение текущего ключа
					let currentSpecies = params.generateName.species;
					//Проверка указанных ключей на наличии в выбранном народе
					updateKeys(dialog.element.querySelector("#generateNameKeys"));
					//Функция обновления описания для ключей при смене народа
					dialog.element.querySelector("#generateNameSpecies").addEventListener("change", (e) => {
						currentSpecies = e.target.value;
						e.target.nextElementSibling.dataset.tooltip = `${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${speciesList[currentSpecies] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
						//Проверка указанных ключей на наличии в выбранном народе
						updateKeys(dialog.element.querySelector("#generateNameKeys"));
					});
					dialog.element.querySelector("#generateNameKeys").addEventListener("change", e => updateKeys(e.target));
					//Функция проверки указанных ключей на наличие в выбранном народе
					function updateKeys(input) {
						let keys = input.value.split(",");

						let errors = [];
						keys.forEach(w => {
							if (!Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[currentSpecies] || false).some(k => k == w)) {errors.push(`<li><strong>${w}</strong></li>`)};
						});

						if (errors.length && currentSpecies != "Disabled") {
							input.dataset.tooltip = `<span>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Error")}<ul>${errors.join("")}</ul></span>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${speciesList[currentSpecies] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
							if (currentSpecies != "Disabled") {input.classList.add("error")}
							else {input.classList.remove("error")};
						} else {
							input.dataset.tooltip = `${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${speciesList[currentSpecies] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
							input.classList.remove("error");
						};
					};
				};

				checkSubspecies(dialog.element.querySelector("#reactionsSpecies").value);
				dialog.element.querySelector("#reactionsSpecies").addEventListener("change", e => checkSubspecies(e.target.value));
				function checkSubspecies(value) {
					let element = dialog.element.querySelector("#reactionsSubspecies");
					element.querySelectorAll("option").forEach(o => {
						if (![value, "Not"].includes(o.dataset.id)) {
							o.selected = false;
							o.disabled = true;
							o.hidden = true;
						} else {
							o.disabled = false;
							o.hidden = false;
							if (element.value == o.value) {o.selected = true};
						};
					});
				};
			},
		});
	};
});

Hooks.on("getSceneControlButtons", (controls) => {
	controls.tokens.tools.toggleAssistantReactions = {
		name: "toggleAssistantReactions",
		title: game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Title"),
		icon: "fas fa-thought-bubble",
		button: true,
		visible: game.user.isGM,
		onChange: () => {
			if (game.wfrp4e.assistant.reactions) {
				game.wfrp4e.assistant.reactions = false;
				ui.notifications.notify(game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Off"));
			} else {
				game.wfrp4e.assistant.reactions = true;
				ui.notifications.notify(game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.On"));
			};
		}
	};
});