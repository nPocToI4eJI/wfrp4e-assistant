let debugMessage = ["%cWFRP4e - Assistant %c[debug]%c.", "font-weight: bold;", "color: orange;", ""];

function getID(array) {
	array = array.sort((a, b) => a - b);
	let id = false;
	if (!array.length) {id = 1} else {
		for (let i = 0; i < array.length; i++) {
			if (!array.includes("1")) {
				id = 1;
				break;
			} else if (Number(array[i + 1]) - Number(array[i]) != 1) {
				id = Number(array[i]) + 1;
				break;
			};
		};
		if (!id) {id = Number(array.at(-1)) + 1};
	};
	if (game.settings.get("wfrp4e-assistant", "debug")) {
		console.debug(...debugMessage, "getID \"id\"");
		console.debug(id);
	};
	return id;
};

class presets extends FormApplication {
	constructor() {
		super();
		presets.choice();
	};
	render() {this.close()};

	static async choice() {
		let debug = game.settings.get("wfrp4e-assistant", "debug");
		let preset = await ItemDialog.create([{name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Create"), value: "create"}].concat(game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => ({name: p.name, value: p.id}))), 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Tooltip.Edit"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title")});
		if (preset[0].value == "create") {
			preset = {};
			preset.name = game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title");
			preset.id = "custom-" + getID(game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => p.id.replace("custom-", "")));
			preset.flags= {
				assistant: normalizeParams()
			};
			preset.isPreset = true;
			game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").concat(preset));
		} else {
			preset = game.settings.get("wfrp4e-assistant", "assistantPresets").find(p => p.id == preset[0].value);
			if (debug) {
				preset.flags = {
					assistant: normalizeParams(preset?.flags?.assistant)
				};
			};
		};
		if (debug) {
			console.debug(...debugMessage, "presets choice \"preset\"");
			console.debug(preset);
		};
		warhammer.apps.WFRP4eAssistantMenu.create(preset);
	};
};

class debugMenu extends FormApplication {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.resizable = true;
        options.template = "modules/wfrp4e-assistant/templates/debug.hbs";
        options.classes.push("WFRP4eAssistant-debug", "WFRP4eAssistant", "warhammer");
        options.title = localize("WFRP4E.Assistant.Settings.debugMenu.Name") + ": " + localize("WFRP4E.Assistant.Name");
		if (game.settings.get("wfrp4e-assistant", "debug")) {
			console.debug(...debugMessage, "debugMenu defaultOptions \"options\"");
			console.debug(options);
		};
        return options;
    };

    constructor(options) {
		//Проверка на наличие активного окна отладки
		if (document.querySelector("div.WFRP4eAssistant.WFRP4eAssistant-debug")) {
			document.querySelector("div.WFRP4eAssistant.WFRP4eAssistant-debug").style.zIndex = ++ApplicationV2._maxZ;
			return;
		};
        super(options);
        this.debug = game.settings.get("wfrp4e-assistant", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "debugMenu constructor \"this\"");
			console.debug(this);
		};
    };

	async getData() {
		return {
			debug: this.debug
		};
	};

	activateListeners(html) {
		//Добавление взаимодействия при нажатии на кнопки
		super.activateListeners(html);
		//Переключение режима отладки
		this.element[0].querySelector("a.button[data-action=\"debugMode\"]").addEventListener("click", () => {this.updateDebugMode()});
	};

	async updateDebugMode() {
		if (this.debug) {await game.settings.set("wfrp4e-assistant", "debug", false)}
		else {await game.settings.set("wfrp4e-assistant", "debug", true)};
		this.debug = game.settings.get("wfrp4e-assistant", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "debugMenu updateDebugMode \"this.debug\"");
			console.debug(this.debug);
		};
		this.element[0].querySelector("span#debugMode").textContent = this.debug ? game.i18n.localize("WFRP4E.Assistant.Settings.debugMenu.Dialog.DebugMode.On") : game.i18n.localize("WFRP4E.Assistant.Settings.debugMenu.Dialog.DebugMode.Off");
		this.element[0].querySelector("span#debugMode").style.color = this.debug ? "green" : "red";
	};
};

class WFRP4eAssistantUtility {
	static randomArrayElement(array) {
		array = array[Math.floor(CONFIG.Dice.randomUniform() * array.length)];
		if (game.settings.get("wfrp4e-assistant", "debug")) {
			console.debug(...debugMessage, "WFRP4eAssistantUtility randomArrayElement \"array\"");
			console.debug(array);
		};
		return array;
	};

	/**
	 * Этот метод генерирует случайное название для книг, в стилистике сеттинга. Варианты названий взяты у Paco's Miscellaneous Stuff и переведены мной на русский.
	 * https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype
	 * @param {string} type Тема генерируемой книги. Пустое значение или значение "Random" выбирают случайную тему.
	 */
	static generateBookTitle(type) {
		let title = warhammer.apps.randomArrayElement(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Adjetive) + " " + warhammer.apps.randomArrayElement(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Main);
		if (!type || type == "Random") {
			type = warhammer.apps.randomArrayElement(Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types));
		};
		title += " " + warhammer.apps.randomArrayElement(game.i18n.translations.WFRP4E.Assistant.BooksTitle[type]);
		if (game.settings.get("wfrp4e-assistant", "debug")) {
			console.debug(...debugMessage, "WFRP4eAssistantUtility generateBookTitle \"title\"");
			console.debug(title);
		};
		return title;
	};

	/**
	 * Этот метод генерирует случайное имя.
	 * https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype
	 * @param {string} species Ключ народа. Ключи находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.GenerateName.Species.
	 * @param {string} keys Ключи локализации для Народа. Ключи находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.GenerateName.Keys["species"].
	 * Если ключ не был определён, он указывается как есть.
	 */
	static generateName(species, keys) {
		let name = [];
		if (!game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[species]) {
			name = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Nothing");
		} else {
			let speciesKeys = keys.split(",");
			speciesKeys.forEach(k => {
				if (game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[species][k]) {
					name.push(warhammer.apps.randomArrayElement(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[species][k]));
				} else {
					name.push(k);
				};
			});
			name = name.join(" ");
		};
		if (game.settings.get("wfrp4e-assistant", "debug")) {
			console.debug(...debugMessage, "WFRP4eAssistantUtility generateName \"name\"");
			console.debug(name);
		};
		return name;
	}
	
	/**
	 * Этот метод используется для определения и создания реакций на события для выбранного Актёра.
	 * https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#2-getreactionactor-opponent-action
	 * @param {object} actor Данные Актёра.
	 * @param {String} actor.name Имя Актёра. Используется, если включена настройка "Отправлять реакции в чат".
	 * @param {String} actor.species Ключ Народа, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"].
	 * @param {String} actor.subspecies (необязательный) Ключ Этноса, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["actor.subspecies"].
	 * @param {Array} actor.tokens Токены выбранного Актёра.
	 * @param {object} opponent (необязательный) Данные противника. Укажите "false", для использования только Общих реакций, не привязанных к конкретным Народам.
	 * @param {String} opponent.species (необязательный) Ключ Народа, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["action"].Opponent["opponent.species"].
	 * @param {String} opponent.subspecies (необязательный) Ключ Этноса, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["action"].Opponent["opponent.species"]["opponent.subspecies"].
	 * @param {string} action Ключ действия. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["action"].
	 * @param {string} location (необязательный) Ключ конечности, для попадания по которой будут определяться реакции. Реакции находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["action"].To["location"].
	 */
	static async getReaction(actor, opponent, action, location) {
		let debug = game.settings.get("wfrp4e-assistant", "debug");
		if (debug) {
			console.debug(...debugMessage, "WFRP4eAssistantUtility getReaction \"actor\", \"opponent\", \"action\", \"location\"");
			console.debug(actor);
			console.debug(opponent);
			console.debug(action);
			console.debug(location);
		};
		if (!game.wfrp4e.assistant.bubbles.includes(actor.id) && game.wfrp4e.assistant.reactions) {
			let phrases = game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.List[actor.species][action];
			if (debug) {
				console.debug(...debugMessage, "WFRP4eAssistantUtility getReaction \"phrases\"");
				console.debug(phrases);
			};
			let phrasesList = [{Species: actor.species}];
			if (actor.subspecies != "Not") {phrasesList[0].Subspecies = actor.subspecies};
			phrasesList[0].Action = action;
			let reactionsList = [];
			try {
				reactionsList = reactionsList.concat(phrases.All.Base);
				phrasesList.push({
					name: game.i18n.localize("Species"),
					path: "List." + actor.species + "." + action + ".All.Base",
					values: phrases.All.Base
				});
			} catch {
				phrasesList.push({
					name: game.i18n.localize("Species"),
					path: "List." + actor.species + "." + action + ".All.Base",
					values: game.i18n.localize("None")
				});
			};
			if (opponent) {
				try {
					reactionsList = reactionsList.concat(phrases.All.Opponent.All);
					phrasesList.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
						path: "List." + actor.species + "." + action + ".All.Opponent.All",
						values: phrases.All.Opponent.All
					});
				} catch {
					phrasesList.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
						path: "List." + actor.species + "." + action + ".All.Opponent.All",
						values: game.i18n.localize("None")
					});
				};
				if (opponent.species != "disabled") {
					try {
						reactionsList = reactionsList.concat(phrases.All.Opponent[opponent.species].All);
						phrasesList.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species})`,
							parh: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + ".All",
							values: phrases.All.Opponent[opponent.species].All
						});
					} catch {
						phrasesList.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species})`,
							path: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + ".All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.subspecies != "Not") {
						try {
							reactionsList = reactionsList.concat(phrases.All.Opponent[opponent.species][opponent.subspecies]);
							phrasesList.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
								parh: "List." + actor.species + "." + action + ".All.Opponent." + opponent.species + "." + opponent.subspecies,
								values: phrases.All.Opponent[opponent.species][opponent.subspecies]
							});
						} catch {
							phrasesList.push({
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
					reactionsList = reactionsList.concat(phrases.All.To[location].Base);
					phrasesList.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
						parh: "List." + actor.species + "." + action + ".All.To." + location + ".Base",
						values: phrases.All.To[location].Base
					});
				} catch {
					phrasesList.push({
						name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
						path: "List." + actor.species + "." + action + ".All.To." + location + ".Base",
						values: game.i18n.localize("None")
					});
				};
				if (opponent) {
					try {
						reactionsList = reactionsList.concat(phrases.All.To[location].All);
						phrasesList.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
							parh: "List." + actor.species + "." + action + ".All.To." + location + ".All",
							values: phrases.All.To[location].All
						});
					} catch {
						phrasesList.push({
							name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
							path: "List." + actor.species + "." + action + ".All.To." + location + ".All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.species != "disabled") {
						try {
							reactionsList = reactionsList.concat(phrases.All.To[location][opponent.species].All);
							phrasesList.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
								parh: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + ".All",
								values: phrases.All.To[location][opponent.species].All
							});
						} catch {
							phrasesList.push({
								name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
								path: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.subspecies != "Not") {
							try {
								reactionsList = reactionsList.concat(phrases.All.To[location][opponent.species][opponent.subspecies]);
								phrasesList.push({
									name: `${game.i18n.localize("Species")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
									parh: "List." + actor.species + "." + action + ".All.To." + location + "." + opponent.species + "." + opponent.subspecies + ".All",
									values: phrases.All.To[location][opponent.species][opponent.subspecies]
								});
							} catch {
								phrasesList.push({
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
					reactionsList = reactionsList.concat(phrases[actor.subspecies].Base);
					phrasesList.push({
						name: game.i18n.localize("Subspecies"),
						parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Base",
						values: phrases[actor.subspecies].Base
					});
				} catch {
					phrasesList.push({
						name: game.i18n.localize("Subspecies"),
						path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Base",
						values: game.i18n.localize("None")
					});
				};
				if (opponent) {
					try {
						reactionsList = reactionsList.concat(phrases[actor.subspecies].Opponent.All);
						phrasesList.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
							parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent.All",
							values: phrases[actor.subspecies].Opponent.All
						});
					} catch {
						phrasesList.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${game.i18n.localize("Any")})`,
							path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent.All",
							values: game.i18n.localize("None")
						});
					};
					if (opponent.species != "Not") {
						try {
							reactionsList = reactionsList.concat(phrases[actor.subspecies].Opponent[opponent.species].All);
							phrasesList.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species})`,
								parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + ".All",
								values: phrases[actor.subspecies].Opponent[opponent.species].All
							});
						} catch {
							phrasesList.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species})`,
								path: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.subspecies != "Not") {
							try {
								reactionsList = reactionsList.concat(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]);
								phrasesList.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies})`,
									parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".Opponent." + opponent.species + "." + opponent.subspecies,
									values: phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]
								});
							} catch {
								phrasesList.push({
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
						reactionsList = reactionsList.concat(phrases[actor.subspecies].To[location].Base);
						phrasesList.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
							parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".Base",
							values: phrases[actor.subspecies].To[location].Base
						});
					} catch {
						phrasesList.push({
							name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location})`,
							path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".Base",
							values: game.i18n.localize("None")
						});
					};
					if (opponent) {
						try {
							reactionsList = reactionsList.concat(phrases[actor.subspecies].To[location].All);
							phrasesList.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
								parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".All",
								values: phrases[actor.subspecies].To[location].All
							});
						} catch {
							phrasesList.push({
								name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${game.i18n.localize("Any")}).`,
								path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + ".All",
								values: game.i18n.localize("None")
							});
						};
						if (opponent.species != "Not") {
							try {
								reactionsList = reactionsList.concat(phrases[actor.subspecies].To[location][opponent.species].All);
								phrasesList.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
									parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + ".All",
									values: phrases[actor.subspecies].To[location][opponent.species].All
								});
							} catch {
								phrasesList.push({
									name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}).`,
									path: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + ".All",
									values: game.i18n.localize("None")
								});
							};
							if (opponent.subspecies != "Not") {
								try {
									reactionsList = reactionsList.concat(phrases[actor.subspecies].To[location][opponent.species][opponent.subspecies]);
									phrasesList.push({
										name: `${game.i18n.localize("Subspecies")}: ${game.i18n.localize("WFRP4E.LocationsTable")} (${location}); ${game.i18n.localize("Target")} (${opponent.species}, ${opponent.subspecies}).`,
										parh: "List." + actor.species + "." + action + "." + actor.subspecies + ".To." + location + "." + opponent.species + "." + opponent.subspecies,
										values: phrases[actor.subspecies].To[location][opponent.species][opponent.subspecies]
									});
								} catch {
									phrasesList.push({
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
			if (debug) {
				console.debug(...debugMessage, "WFRP4eAssistantUtility getReaction \"reactionsList\", \"phrasesList\"");
				console.debug(reactionsList);
				console.debug(phrasesList);
			};
			for (let i = 0; i < actor.tokens.length; i++) {
				let phrase = warhammer.apps.randomArrayElement(reactionsList);
				if (debug) {
					console.debug(...debugMessage, "WFRP4eAssistantUtility getReaction \"phrase\"");
					console.debug(phrase);
				};
				if (phrase) {
					if (game.settings.get("wfrp4e-assistant", "reactionsSend") == 0) {
						canvas.hud.bubbles.broadcast(actor.tokens[i], `${phrase}<span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}<span>`, {cssClasses: ["WFRP4eAssistant-chat-bubble"]});
						ChatMessage.create({
							speaker: {scene: game.scenes.current, token: actor.tokens[i]},
							content: `<em>${phrase}</em>`
						});
					} else if (game.settings.get("wfrp4e-assistant", "reactionsSend") == 1) {
						canvas.hud.bubbles.broadcast(actor.tokens[i], `${phrase}<span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}<span>`, {cssClasses: ["WFRP4eAssistant-chat-bubble"]});
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
warhammer.apps.randomArrayElement = WFRP4eAssistantUtility.randomArrayElement;
warhammer.apps.generateBookTitle = WFRP4eAssistantUtility.generateBookTitle;
warhammer.apps.generateName = WFRP4eAssistantUtility.generateName;
warhammer.apps.getReaction = WFRP4eAssistantUtility.getReaction;

class WFRP4eAssistantMenu extends HandlebarsApplicationMixin(ApplicationV2) {
    static DEFAULT_OPTIONS = {
        classes: ["WFRP4eAssistant-menu", "WFRP4eAssistant", "warhammer"],
        form: {
            submitOnChange: false,
            closeOnSubmit: true
        },
        window: {
			icon: "fas fa-handshake-angle",
            resizable: true,
			contentClasses: ["standard-form"],
			controls: [{
				icon: "fas fa-list",
				label: "WFRP4E.Assistant.Helpers.Settings.Presets.Add",
				action: "insertPreset",
			}]
        },
		dragDrop: [{ dragSelector: "[data-drag]", dropSelector: "[data-drop]" }],
        actions: {
			save: this._onSave,
			export: this._onExport,
			delete: this._onDelete,
			back: this._onBack,
			addPreset: this._onAddPreset,
			removePreset: this._onRemovePreset,
			insertPreset: this._onInsertPreset
        }
    };

    static PARTS = {
        form: {
            template: "modules/wfrp4e-assistant/templates/assistant/app.hbs",
        },
        footer: {
            template: "templates/generic/form-footer.hbs"
        }
    };

    constructor(actor, debug, options) {
        super(options);
		this.#dragDrop = this.#createDragDropHandlers();
        this.actor = actor;
        this.debug = debug;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu constructor \"this\"");
			console.debug(this);
		};
    };

	#createDragDropHandlers() {
		return this.options.dragDrop.map((d) => {
			d.permissions = {
				dragstart: true,
				drop: true,
			};
			d.callbacks = {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this),
			};
			return new foundry.applications.ux.DragDrop.implementation(d);
		});
	};
	#dragDrop;
	get dragDrop() {return this.#dragDrop};

	_onDragStart(event) {
		let dragData = event.currentTarget.dataset.uuid;
		if (!dragData) {return};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onDragStart \"dragData\"");
			console.debug(dragData);
		};
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	};

	async _onDrop(event) {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onDrop \"event\", \"event.target\"");
			console.debug(event);
			console.debug(event.target);
		};
		let item = await fromUuid(foundry.applications.ux.TextEditor.implementation.getDragEventData(event));
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onDrop \"item\"");
			console.debug(item);
		};
		if (event.target.closest(".items").querySelector("a[data-uuid='" + item.uuid + "']")) {return}
		else {this.element.querySelector("a[data-uuid='" + item.uuid + "']").remove()};
		let data = document.createElement("a");
		data.classList.add("drag-item");
		data.dataset.uuid = item.uuid;
		if (!this.isUnique) {data.dataset.drag = true};
		data.textContent = item.name + (item.quantity.value != 1 ? " (" + item.quantity.value + ")" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onDrop \"data\"");
			console.debug(data);
		};
		event.target.closest(".items").insertAdjacentElement("beforeend", data);
		this.#dragDrop.forEach((d) => d.bind(this.element));
	};

	async _onRender(context) {
		//Проверка указанных ключей на наличии в выбранном народе
		this.updateKeys(this.params.generateName.species);
		//Функция обновления описания для ключей при смене народа
		this.element.querySelector("#generateNameSpecies").addEventListener("change", (e) => {
			this.params.generateName.species = e.target.value;
			e.target.nextElementSibling.dataset.tooltip = `${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${this.species[e.target.value] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
			//Проверка указанных ключей на наличии в выбранном народе
			this.updateKeys(e.target.value);
		});
		this.element.querySelector("#generateNameKeys").addEventListener("change", e => this.updateKeys(this.params.generateName.species));

		this.checkSubspecies(this.element.querySelector("#reactionsSpecies").value);
		this.element.querySelector("#reactionsSpecies").addEventListener("change", e => this.checkSubspecies(e.target.value));

		this.element.querySelectorAll(".drag-item").forEach(i => {
			i.addEventListener("click", async (e) => {
				let item = await fromUuid($(e.currentTarget).attr("data-uuid"));
				if (item) {item.sheet.render(true)};
			});
		});

		this.#dragDrop.forEach((d) => d.bind(this.element));
	};

    async _prepareContext(options) {
        let context = await super._prepareContext(options);
		context.debug = this.debug;
		context.actor = this.actor;
		context.params = this.actor.flags.assistant;
		if (!context.params || this.debug) {
			if (this.actor.isPreset) {
				this.actor.flags= {
					assistant: normalizeParams(this.actor.flags.assistant)
				};
			} else {
				await this.actor.update({"flags.assistant": normalizeParams(context.params)});
			};
			context.actor = this.actor;
			context.params = this.actor.flags.assistant;
		};
		this.params = context.params;
		context.lores = [{value: "arcane", label: game.i18n.localize("WFRP4E.MagicLores.arcane")}];
		for (let i = 0; i < Object.keys(game.wfrp4e.config.magicLores).length; i++) {
			context.lores.push({value: Object.keys(game.wfrp4e.config.magicLores)[i], label: Object.values(game.wfrp4e.config.magicLores)[i]});
		};
		context.species = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species).map(s => ({
			value: s,
			name: game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species[s],
			keys: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[s]).map(k => `<li><strong>${k}</strong>: <em>${game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[s][k]}</em></li>`).join("")
		}));
		this.species = {};
		context.species.forEach(s => this.species[s.value] = s.keys);
		context.reactions = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species).map(s => ({
			value: s,
			name: game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Name,
			subspecies: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Subspecies || []).map(sub => ({
				value: sub,
				name: game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Subspecies[sub]
			}))
		}));
		this.reactions = context.reactions;
		if (!this.actor.isPreset) {
			let items = this.actor.itemTypes;
			context.items = [].concat(items.armour, items["wfrp4e-archives3.armour"] || [], items.weapon, items.ammunition, items.container, items.trapping, items.cargo).filter(i => !this.params.presets.map(p => p.items).flat(1).map(p => p.uuid).includes(i.uuid));
			context.isUnique = this.actor.type == "character" ? true : this.actor.prototypeToken.actorLink ? true : false;
		} else {
			context.items = [];
			context.isUnique = false;
		};
		this.isUnique = context.isUnique;
		context.buttons = [{
			icon: "<i class='fas fa-save'></i>",
			action: "save",
			default: true,
			label: game.i18n.localize("Save")
		}];
		//Кнопка экспорта для токенов
		if (this.actor.token) {
			context.buttons.unshift({
				action: "export",
				icon: "<i class='fas fa-file-export'></i>",
				label: game.i18n.localize("WFRP4E.Assistant.Export")
			});
		};
		//Кнопка удаления для шаблонов
		if (this.actor.isPreset) {
			context.buttons.unshift(
				{
					action: "delete",
					icon: "<i class='fas fa-trash'></i>",
					label: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Delete")
				},
				{
					action: "back",
					icon: "<i class='fas fa-list'></i>",
					label: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.List")
				}
			);
		};
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _prepareContext \"context\"");
			console.debug(context);
		};
        return context;
    };

    static async create(actor, options={}) {
		this.debug = game.settings.get("wfrp4e-assistant", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu create");
		};
		if (!actor.isPreset) {
			//Перенос значений старого эффетка в персонажа. Будет удалено в Foundry 14
			let effect = actor.effects.find(e => e.flags.assistant);
			if (effect) {
				if (game.settings.get("wfrp4e-assistant", "debug")) {
					console.debug(...debugMessage, "WFRP4eAssistantMenu create removeEffect \"effect\"");
					console.debug(effect);
				};
				await actor.update({"flags.assistant": normalizeParams(effect.flags.assistant)});
				if (game.settings.get("wfrp4e-assistant", "debug")) {
					console.debug(...debugMessage, "WFRP4eAssistantMenu create removeEffect \"actor\"");
					console.debug(actor);
				};
				effect.delete();
			};
		};
		//Определение названия шапки шаблона в соответствии с типом
		let title = actor.name + (this.debug ? " [ID: " + actor.id + "]" : "");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu create \"title\"");
			console.debug(title);
		};
        return new Promise(resolve => {
            options.resolve = resolve;
            new this(actor, this.debug, options).render({force: true, window: {title}});
        });
    };

	//Функция проверки указанных ключей на наличие в выбранном народе
	updateKeys(species) {
		let input = this.element.querySelector("#generateNameKeys");
		let keys = input.value.split(",");

		let errors = [];
		keys.forEach(w => {
			if (!Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[species] || false).some(k => k == w)) {errors.push(`<li><strong>${w}</strong></li>`)};
		});

		if (errors.length && species != "disabled") {
			input.dataset.tooltip = `<span>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Error")}<ul>${errors.join("")}</ul></span>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${this.species[species] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
		} else {
			input.dataset.tooltip = `${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${this.species[species] || "<li><strong>" + game.i18n.localize("No") + "</li></strong>"}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
		};
	};

	checkSubspecies(value) {
		let element = this.element.querySelector("#reactionsSubspecies");
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

	static _onSave() {
		let params = {};
		if (!this.isUnique) {
			//Случайное имя
			let nameSpecies = this.element.querySelector("#generateNameSpecies").value;
			if (nameSpecies != "disabled") {
				params.generateName = {
					species: nameSpecies,
					keys: this.element.querySelector("#generateNameKeys").value
				};
			} else {
				params.generateName = {
					species: "disabled",
					keys: this.element.querySelector("#generateNameKeys").value
				};
			};
			//Случайные характеристики
			params.randomCharacteristics = {
				status: this.element.querySelector("#randomCharacteristicsStatus").checked
			};
			//Случайный	размер токена
			params.randomTokenSize = {
				status: this.element.querySelector("#randomTokenSizeStatus").checked
			};
			//Окраска при смерти
			params.deathTint = {
				color: this.element.querySelector("#deathTintValue").value
			};
			//Генерация заклинаний
			params.generateSpells = {
				lore: this.element.querySelector("#generateSpellsLore").value,
				count: Math.max(1, this.element.querySelector("#generateSpellsCount").value) || 1,
				arcane: this.element.querySelector("#generateSpellsArcane").checked
			};
			//Отношение токена
			params.disposition = {
				value: this.element.querySelector("#dispositionValue").value
			};
			//Реакции
			let reactionsSpecies = this.element.querySelector("#reactionsSpecies").value;
			params.reactions = {
				species: reactionsSpecies,
				subspecies: reactionsSpecies != "disabled" ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[reactionsSpecies].Subspecies).includes(this.element.querySelector("#reactionsSubspecies").value) ? this.element.querySelector("#reactionsSubspecies").value : "None" : this.element.querySelector("#reactionsSubspecies").value,
				frequency: this.element.querySelector("#reactionsFrequency").value
			};
			//Шаблоны
			params.presets = [];
			if (!this.actor.isPreset) {
				this.element.querySelectorAll("li#presets > ul > li").forEach(p => {
					let preset = {characteristics: {}, items: []};
					["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
						preset.characteristics[c] = p.querySelector("input[data-characteristic='" + c + "']").value || 0;
					});
					preset.weight = Math.max(0, p.querySelector("input[name='weight']").value);
					p.querySelectorAll("a.drag-item").forEach(i => {
						let item = fromUuidSync(i.dataset.uuid);
						preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.quantity.value}});
					});
					params.presets.push(preset);
				});
			};
		} else {
			//Случайное имя
			params.generateName = {
				species: "disabled",
				keys: ""
			};
			//Случайные характеристики
			params.randomCharacteristics = {
				status: false
			};
			//Случайный	размер токена
			params.randomTokenSize = {
				status: false
			};
			//Окраска при смерти
			params.deathTint = {
				status: this.element.querySelector("#deathTintValue").value
			};
			//Генерация заклинаний
			params.generateSpells = {
				lore: "disabled",
				count: 1,
				arcane: this.element.querySelector("#generateSpellsArcane").checked
			};
			//Отношение токена
			params.disposition = {
				value: 3
			};
			//Реакции
			let reactionsSpecies = this.element.querySelector("#reactionsSpecies").value;
			params.reactions = {
				species: reactionsSpecies,
				subspecies: reactionsSpecies != "disabled" ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[reactionsSpecies].Subspecies).includes(this.element.querySelector("#reactionsSubspecies").value) ? this.element.querySelector("#reactionsSubspecies").value : "None" : this.element.querySelector("#reactionsSubspecies").value,
				frequency: this.element.querySelector("#reactionsFrequency").value
			};
			//Шаблоны
			params.presets = [];
			this.element.querySelectorAll("li#presets > ul > li").forEach(p => {
				let preset = {characteristics: {}, items: []};
				["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
					preset.characteristics[c] = p.querySelector("input[data-characteristic='" + c + "']").value || 0;
				});
				preset.weight = Math.max(0, p.querySelector("input[name='weight']").value);
				p.querySelectorAll("a.drag-item").forEach(i => {
					let item = fromUuidSync(i.dataset.uuid);
					preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.quantity.value}});
				});
				params.presets.push(preset);
			});
		};
		params.spellsFilter = this.params.spellsFilter;
		this.params = normalizeParams(params);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onSave \"params\"");
			console.debug(params);
		};
		if (this.actor.isPreset) {
			this.actor.name = this.element.querySelector("#presetNameValue").value || game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title");
			this.actor.flags.assistant = this.params;
			game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => p.id == this.actor.id ? this.actor : p));
			this.element.querySelector(".window-title").textContent = this.actor.name + (this.debug ? " [ID: " + this.actor.id + "]" : "");
		} else {
			this.actor.update({"flags.assistant": this.params});
		};
	};

	static async _onExport() {
		let oldActor = this.actor;
		let actorData = oldActor.toObject();
		actorData.prototypeToken = oldActor.token.toObject();
		actorData.prototypeToken.actorLink = true;
		actorData.prototypeToken.appendNumber = false;
		actorData.prototypeToken.rotation = 0;
		actorData.folder = null;
		this.actor = await Actor.create(actorData);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onExport \"actor\"");
			console.debug(this.actor);
		};

		let tokenData = await this.actor.getTokenDocument({x: oldActor.token.x, y: oldActor.token.y, rotation: oldActor.token.rotation, elevation: oldActor.token.elevation})
		oldActor.token.delete();
		await canvas.scene.createEmbeddedDocuments("Token", [tokenData.toObject()]);
	};

	static _onDelete() {
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onDelete \"actor\"");
			console.debug(this.actor);
		};
		game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").filter(p => p.id != this.actor.id));
		this.close();
	};

	static _onBack() {
		new presets;
		this.close();
	};

	static _onAddPreset() {
		let li = document.createElement("li");
		let characteristics = document.createElement("div");
		characteristics.classList.add("characteristics");
		["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"].forEach(c => {
			let label = document.createElement("label");
			label.textContent = game.i18n.localize("CHARAbbrev." + c);
			characteristics.append(label);
		});
		["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
			let input = document.createElement("input");
			input.type = "number";
			input.dataset.characteristic = c;
			input.value = "0";
			characteristics.append(input);
		});
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onAddPreset \"characteristics\"");
			console.debug(characteristics);
		};
		let weight = document.createElement("div");
		weight.classList.add("weight");
		weight.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Weight.Hint");
		let label = document.createElement("label");
		label.textContent = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Weight.Label");
		let input = document.createElement("input");
		input.type = "number";
		input.name = "weight";
		input.value = 1;
		weight.append(label, input);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onAddPreset \"weight\"");
			console.debug(weight);
		};
		let items = document.createElement("div");
		items.classList.add("body", "items");
		items.dataset.drop = true;
		items.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Items.Preset");
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onAddPreset \"items\"");
			console.debug(items);
		};
		let a = document.createElement("a");
		a.classList.add("button");
		a.dataset.action = "removePreset";
		a.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Remove");
		a.innerHTML = "<i class=\"fas fa-trash\"></i>";
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onAddPreset \"a\"");
			console.debug(a);
		};
		li.append(characteristics, weight, items, a);
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onAddPreset \"li\"");
			console.debug(li);
		};
		this.element.querySelector("li#presets > ul").append(li);
		this.#dragDrop.forEach((d) => d.bind(this.element));
	};

	static _onRemovePreset(button) {
		//Удаление шаблона
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onRemovePreset \"button\"");
			console.debug(button);
		};
		button.target.closest("li").remove();
	};

	static async _onInsertPreset() {
		let preset = await ItemDialog.create(game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => ({name: p.name, value: p.id})), 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Tooltip.Insert"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title")});
		if (!preset.length) {return};
		this.params = game.settings.get("wfrp4e-assistant", "assistantPresets").find(p => p.id == preset[0].value).flags.assistant;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onInsertPreset \"params\"");
			console.debug(this.params);
		};
		this.element.querySelector("#generateNameSpecies").value = this.params.generateName.species;
		this.element.querySelector("#generateNameSpecies > option:checked").selected = false;
		this.element.querySelector("#generateNameSpecies > option[value='" + this.params.generateName.species + "']").selected = true;
		this.element.querySelector("#generateNameKeys").value = this.params.generateName.keys;
		this.updateKeys(this.params.generateName.species);
		this.element.querySelector("#randomCharacteristicsStatus").checked = this.params.randomCharacteristics.status;
		this.element.querySelector("#randomTokenSizeStatus").checked = this.params.randomTokenSize.status;
		this.element.querySelector("#deathTintValue").value = this.params.deathTint.color;
		this.element.querySelector("#generateSpellsLore").value = this.params.generateSpells.lore;
		this.element.querySelector("#generateSpellsLore > option:checked").selected = false;
		this.element.querySelector("#generateSpellsLore > option[value='" + this.params.generateSpells.lore + "']").selected = true;
		this.element.querySelector("#generateSpellsCount").value = this.params.generateSpells.count;
		this.element.querySelector("#generateSpellsArcane").checked = this.params.generateSpells.arcane;
		this.element.querySelector("#dispositionValue").value = this.params.disposition.value;
		this.element.querySelector("#dispositionValue > option:checked").selected = false;
		this.element.querySelector("#dispositionValue > option[value='" + this.params.disposition.value + "']").selected = true;
		this.element.querySelector("#reactionsSpecies").value = this.params.reactions.species;
		this.element.querySelector("#reactionsSpecies > option:checked").selected = false;
		this.element.querySelector("#reactionsSpecies > option[value='" + this.params.reactions.species + "']").selected = true;
		this.element.querySelector("#reactionsSubspecies").value = this.params.reactions.subspecies;
		this.element.querySelector("#reactionsSubspecies > option:checked").selected = false;
		this.element.querySelector("#reactionsSubspecies > option[value='" + this.params.reactions.subspecies + "']").selected = true;
		this.checkSubspecies(this.params.reactions.species);
		this.element.querySelector("#reactionsFrequency").value = this.params.reactions.frequency;
		this.element.querySelector("#reactionsFrequency > option:checked").selected = false;
		this.element.querySelector("#reactionsFrequency > option[value='" + this.params.reactions.frequency + "']").selected = true;
		if (this.debug) {
			console.debug(...debugMessage, "WFRP4eAssistantMenu _onInsertPreset \"element\"");
			console.debug(this.element);
		};
	};

    close() {
        super.close();
        this.options.resolve();
    };
};
warhammer.apps.WFRP4eAssistantMenu = WFRP4eAssistantMenu;

Hooks.on("createToken", async (token) => {
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && token.actor.flags?.assistant) {
		let debug = game.settings.get("wfrp4e-assistant", "debug");
		let actor = token.actor;
		let data = {
			actor: {},
			token: {}
		};
		if (debug) {
			console.debug(...debugMessage, "createToken \"actor\"");
			console.debug(actor);
		};
		let params = actor.flags.assistant;
		if (debug) {
			console.debug(...debugMessage, "createToken \"params\"");
			console.debug(params);
		};
		game.wfrp4e.assistant.bubbles.push(actor.uuid);
		if (params?.generateName?.species != "disabled" && !actor.prototypeToken.actorLink) {
			let name = [];
			let speciesKeys = params.generateName?.keys.split(",");
			speciesKeys.forEach(k => {
				if (game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params.generateName.species][k]) {
					name.push(warhammer.apps.randomArrayElement(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params.generateName.species][k]));
				} else {
					name.push(k);
				};
			});
			if (!name.length) {name = actor.name};
			if (debug) {
				console.debug(...debugMessage, "createToken generateName \"name\"");
				console.debug(name);
			};
			data.actor.name = name.join(" ");
			data.token.name = name[0];
			params.generateName.species = "disabled";
		};
		if (params?.randomCharacteristics.status) {
			data.actor.system = {
				characteristics: {
					"ws.initial": actor.system.characteristics.ws.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.ws.initial - 10 + (await new Roll("2d10").roll()).total,
					"bs.initial": actor.system.characteristics.bs.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.bs.initial - 10 + (await new Roll("2d10").roll()).total,
					"s.initial": actor.system.characteristics.s.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.s.initial - 10 + (await new Roll("2d10").roll()).total,
					"t.initial": actor.system.characteristics.t.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.t.initial - 10 + (await new Roll("2d10").roll()).total,
					"i.initial": actor.system.characteristics.i.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.i.initial - 10 + (await new Roll("2d10").roll()).total,
					"dex.initial": actor.system.characteristics.dex.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.dex.initial - 10 + (await new Roll("2d10").roll()).total,
					"ag.initial": actor.system.characteristics.ag.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.ag.initial - 10 + (await new Roll("2d10").roll()).total,
					"int.initial": actor.system.characteristics.int.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.int.initial - 10 + (await new Roll("2d10").roll()).total,
					"wp.initial": actor.system.characteristics.wp.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.wp.initial - 10 + (await new Roll("2d10").roll()).total,
					"fel.initial": actor.system.characteristics.fel.initial == 5 ? (await new Roll("1d10").roll()).total : actor.system.characteristics.fel.initial - 10 + (await new Roll("2d10").roll()).total
				}
			};
			params.randomCharacteristics.status = false;
		};
		if (params?.randomTokenSize.status) {
			let size = (Math.floor(CONFIG.Dice.randomUniform() * 41) - 20) / 100;
			data.token.texture = {
				scaleX: token.texture.scaleX + size,
				scaleY: token.texture.scaleY + size
			};
			params.randomTokenSize.status = false;
		};
		if (params?.generateSpells && params?.generateSpells.lore != "disabled") {
			let spells = await warhammer.utility.findAllItems("spell", game.i18n.localize("WFRP4E.Assistant.systemFix.Search"), true, ["uuid", "system.lore.value"]);
			spells = spells.filter(s => s.system.lore.value == params.generateSpells.lore || (params.generateSpells.arcane && s.system.lore.value == ""));
			let resultSpells = [];
			for (let i = params.generateSpells.count; i > 0; i--) {
				let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
				let spell = await fromUuid(spells[result].uuid);
				resultSpells.push(spell);
				spells.splice(result, 1);
			};
			if (debug) {
				console.debug(...debugMessage, "createToken generateSpells \"resultSpells\"");
				console.debug(resultSpells);
			};
			await actor.createEmbeddedDocuments("Item", resultSpells, {broadcast: false});
			params.generateSpells.lore = "disabled";
		};
		if (params?.disposition) {
			switch (params.disposition.value) {
				case "4": {
					choice = await ItemDialog.create([{name: game.i18n.localize("TOKEN.DISPOSITION.NEUTRAL"), value: 0}, {name: game.i18n.localize("TOKEN.DISPOSITION.FRIENDLY"), value: 1}, {name: game.i18n.localize("TOKEN.DISPOSITION.HOSTILE"), value: -1}, {name: game.i18n.localize("TOKEN.DISPOSITION.SECRET"), value: -2}], 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Tooltip"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Label")});
					data.token.disposition = choice[0]?.value;
					break;
				};
				case "0": {
					data.token.disposition = 0;
					break;
				}
				case "1": {
					data.token.disposition = 1;
					break;
				}
				case "-1": {
					data.token.disposition = -1;
					break;
				}
				case "-2": {
					data.token.disposition = -2;
					break;
				}
			};
			params.disposition.value = "3";
		};
		if (params?.presets.length) {
			let weight = params.presets.map(p => Number(p.weight)).reduce((accumulator, currentValue) => accumulator + currentValue, 0);
			if (weight > 0) {
				let value = Math.floor(CONFIG.Dice.randomUniform() * weight) + 1;
				for (let preset of params.presets) {
					value -= preset.weight;
					if (value <= 0) {
						if (debug) {
							console.debug(...debugMessage, "createToken presets \"preset\"");
							console.debug(preset);
						};
						if (data.actor.system.characteristics) {
							data.actor.system.characteristics = {
								"ws.initial": data.actor.system.characteristics["ws.initial"] + Number(preset.characteristics.ws),
								"bs.initial": data.actor.system.characteristics["bs.initial"] + Number(preset.characteristics.bs),
								"s.initial": data.actor.system.characteristics["s.initial"] + Number(preset.characteristics.s),
								"t.initial": data.actor.system.characteristics["t.initial"] + Number(preset.characteristics.t),
								"i.initial": data.actor.system.characteristics["i.initial"] + Number(preset.characteristics.i),
								"dex.initial": data.actor.system.characteristics["dex.initial"] + Number(preset.characteristics.dex),
								"ag.initial": data.actor.system.characteristics["ag.initial"] + Number(preset.characteristics.ag),
								"int.initial": data.actor.system.characteristics["int.initial"] + Number(preset.characteristics.int),
								"wp.initial": data.actor.system.characteristics["wp.initial"] + Number(preset.characteristics.wp),
								"fel.initial": data.actor.system.characteristics["fel.initial"] + Number(preset.characteristics.fel)
							};
						} else {
							data.actor.system = {
								characteristics: {
									"ws.initial": actor.system.characteristics.ws.initial + Number(preset.characteristics.ws),
									"bs.initial": actor.system.characteristics.bs.initial + Number(preset.characteristics.bs),
									"s.initial": actor.system.characteristics.s.initial + Number(preset.characteristics.s),
									"t.initial": actor.system.characteristics.t.initial + Number(preset.characteristics.t),
									"i.initial": actor.system.characteristics.i.initial + Number(preset.characteristics.i),
									"dex.initial": actor.system.characteristics.dex.initial + Number(preset.characteristics.dex),
									"ag.initial": actor.system.characteristics.ag.initial + Number(preset.characteristics.ag),
									"int.initial": actor.system.characteristics.int.initial + Number(preset.characteristics.int),
									"wp.initial": actor.system.characteristics.wp.initial + Number(preset.characteristics.wp),
									"fel.initial": actor.system.characteristics.fel.initial + Number(preset.characteristics.fel)
								}
							};
						};
						await actor.deleteEmbeddedDocuments("Item", params.presets.filter(p => p != preset).map(p => p.items.map(i => foundry.utils.parseUuid(i.uuid).id)).flat(1));
						break;
					};
				};
				params.presets = [];
			};
		};
		if (debug) {
			console.debug(...debugMessage, "createToken \"params\"");
			console.debug(params);
		};
		data.actor.flags = {
			assistant: params
		};
		if (debug) {
			console.debug(...debugMessage, "createToken \"data\"");
			console.debug(data);
		};
		await actor.update(data.actor);
		await token.update(data.token);
		setTimeout(() => {
			let index = game.wfrp4e.assistant.bubbles.indexOf(actor.uuid);
			if (index > -1) {game.wfrp4e.assistant.bubbles.splice(index, 1)};
		}, 2000);
	};
});

Hooks.on("updateActor", async (actor, args, option) => {
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && actor.flags?.assistant) {
		let debug = game.settings.get("wfrp4e-assistant", "debug");
		if (debug) {
			console.debug(...debugMessage, "updateActor \"actor\"");
			console.debug(actor);
		};
		let params = actor.flags.assistant;
		if (debug) {
			console.debug(...debugMessage, "updateActor \"params\"");
			console.debug(params);
		};
		if (args.system?.status?.wounds) {
			let color;
			if (actor.status.wounds.value <= 0) {
				color = params.deathTint.color;
				if (actor.type != "character" && game.modules.get("healthEstimate")?.active && game.healthEstimate?.NPCsJustDie) {
					if (((actor.token && !actor.token?.flags?.healthEstimate?.dontMarkDead) || (!actor.token && !actor.prototypeToken.flags?.healthEstimate?.dontMarkDead)) && !actor.hasCondition("dead")) {
						await actor.addCondition("dead");
					};
				};
			} else {
				color = actor?.prototypeToken.texture.tint || "#FFFFFF";
				if (actor.hasCondition("dead")) {
					await actor.removeCondition("dead");
				};
			};
			if (debug) {
				console.debug(...debugMessage, "updateActor \"color\"");
				console.debug(color);
			};
			if (!actor.prototypeToken.actorLink && actor.token) {
				actor.token.update({"texture.tint": color});
			} else {
				let tokens = actor.getDependentTokens();
				for (let i = 0; i < tokens.length; i++) {
					tokens[i].update({"texture.tint": color});
				};
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
					if (option.deltaWounds < 0) {
						let actorData = {name: actor.name, id: actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
						actorData.tokens = actor.getDependentTokens().filter(t => t.parent == game.scenes.current) || [actor.token];
						let action;
						if (actor.system.status.wounds.value <= 0) {action = "die"}
						else {action = "takeDamage"};
						if (actorData.tokens.length) {await warhammer.apps.getReaction(actorData, false, action, false)};
					};
				};
			};
		};
	};
});

Hooks.on("wfrp4e:opposedTestResult", async (opposedTest, attackerTest, defenderTest) => {
	if (game.settings.get("wfrp4e-assistant", "enableHelpers")) {
		let debug = game.settings.get("wfrp4e-assistant", "debug");
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:opposedTestResult \"opposedTest\", \"attackerTest\", \"defenderTest\"");
			console.debug(opposedTest);
			console.debug(attackerTest);
			console.debug(defenderTest);
		};
		let attacker = attackerTest.actor;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:opposedTestResult \"attacker\"");
			console.debug(attacker);
		};
		if (attacker.flags.assistant) {
			let params = attacker.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
					let actorData = {name: attacker.name, id: attacker.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = attacker.getDependentTokens().filter(t => t.parent == game.scenes.current) || [attacker.token];
					let target = {species: "", subspecies: ""};
					if (opposedTest.defender.flags.assistant) {
						target.species = opposedTest.defender.flags.assistant.reactions.species || "";
						target.subspecies = opposedTest.defender.flags.assistant.reactions.subspecies || "";
					};
					let action;
					if (opposedTest.result.winner == "attacker") {action = "opposedAttackerSuccess"}
					else {action = "opposedAttackerFailure"};
					if (debug) {
						console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"actorData\", \"target\", \"action\"");
						console.debug(actorData);
						console.debug(target);
						console.debug(action);
					};
					if (actorData.tokens.length) {await warhammer.apps.getReaction(actorData, target, action, false)};
				};
			};
		};
		let defender = defenderTest.actor;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:opposedTestResult \"defender\"");
			console.debug(defender);
		};
		if (defender.flags.assistant) {
			let params = defender.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
					let actorData = {name: attacker.name, id: attacker.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = attacker.getDependentTokens().filter(t => t.parent == game.scenes.current) || [attacker.token];
					let target = {species: "", subspecies: ""};
					if (opposedTest.attacker.flags.assistant) {
						target.species = opposedTest.attacker.flags.assistant.reactions.species || "";
						target.subspecies = opposedTest.attacker.flags.assistant.reactions.subspecies || "";
					};
					let action;
					if (opposedTest.result.winner == "defender") {action = "opposedDefenderSuccess"}
					else {action = "opposedDefenderFailure"};
					if (debug) {
						console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"actorData\", \"target\", \"action\"");
						console.debug(actorData);
						console.debug(target);
						console.debug(action);
					};
					if (actorData.tokens.length) {await warhammer.apps.getReaction(actorData, target, action, false)};
				};
			};
		};
	};
});

Hooks.on("wfrp4e:applyDamage", async (args) => {
	let debug = game.settings.get("wfrp4e-assistant", "debug");
	for (let i = 0; i < args.length; i++) {
		if (game.settings.get("wfrp4e-assistant", "enableHelpers") && args[i].attacker.flags.assistant) {
			let attacker = args[i].attacker;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," \"attacker\"");
				console.debug(attacker);
			};
			let params = attacker.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," attacker \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
					let actorData = {name: attacker.name, id: attacker.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = attacker.getDependentTokens().filter(t => t.parent == game.scenes.current) || [attacker.token];
					let target = {species: "", subspecies: ""};
					if (args[i].actor.flags.assistant) {
						target.species = args[i].actor.flags.assistant.reactions.species || "";
						target.subspecies = args[i].actor.flags.assistant.reactions.subspecies || "";
					};
					let action;
					let location = false;
					if (args[i].actor.status.wounds.value <= args[i].totalWoundLoss) {action = "kill"}
					else {
						let hitLoc = args[i].opposedTest.result.hitloc.value.toLowerCase();
						if (hitLoc.includes("head")) {location = "Head"}
						else if (hitLoc.includes("body")) {location = "Body"}
						else if (hitLoc.includes("arm")) {location = "Arm"}
						else if (hitLoc.includes("leg")) {location = "Leg"};
						action = "applyDamage";
					};
					if (debug) {
						console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," attacker \"actorData\", \"target\", \"action\", \"location\"");
						console.debug(actorData);
						console.debug(target);
						console.debug(action);
						console.debug(location);
					};
					if (actorData.tokens.length) {await warhammer.apps.getReaction(actorData, target, action, location)};
				};
			};
		};
		if (game.settings.get("wfrp4e-assistant", "enableHelpers") && args[i].actor.flags.assistant) {
			let defender = args[i].actor;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," \"defender\"");
				console.debug(defender);
			};
			let params = defender.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," defender \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).result) {
					let actorData = {name: defender.name, id: defender.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = defender.getDependentTokens().filter(t => t.parent == game.scenes.current) || [defender.token];
					let target = {species: "", subspecies: ""};
					if (args[i].attacker.flags.assistant) {
						target.species = args[i].attacker.flags.assistant.reactions.species || "";
						target.subspecies = args[i].attacker.flags.assistant.reactions.subspecies || "";
					};
					let action;
					let location = false;
					if (defender.status.wounds.value <= args[i].totalWoundLoss) {action = "die"}
					else {
						let hitLoc = args[i].opposedTest.result.hitloc.value.toLowerCase();
						if (hitLoc.includes("head")) {location = "Head"}
						else if (hitLoc.includes("body")) {location = "Body"}
						else if (hitLoc.includes("arm")) {location = "Arm"}
						else if (hitLoc.includes("leg")) {location = "Leg"};
						action = "takeDamage";
					};
					if (debug) {
						console.debug(...debugMessage, "wfrp4e:applyDamage ", i ," \"actorData\", \"target\", \"action\", \"location\"");
						console.debug(actorData);
						console.debug(target);
						console.debug(action);
						console.debug(location);
					};
					if (actorData.tokens.length) {await warhammer.apps.getReaction(actorData, target, action, location)};
				};
			};
		};
	};
});

Hooks.once("init", () => {
	game.settings.register("wfrp4e-assistant", "debug", {
		scope: "world",
		config: false,
		default: false,
		type: Boolean
	});
    game.settings.registerMenu("wfrp4e-assistant", "debugMenu", {
		restricted: true,
		name: game.i18n.localize("WFRP4E.Assistant.Settings.debugMenu.Name"),
		label: game.i18n.localize("WFRP4E.Assistant.Settings.debugMenu.Label"),
		hint: game.i18n.localize("WFRP4E.Assistant.Settings.debugMenu.Hint"),
		icon: "fas fa-debug",
		type: debugMenu
	});
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
    game.settings.registerMenu("wfrp4e-assistant", "presets", {
		restricted: true,
		name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Name"),
		label: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Label"),
		hint: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Hint"),
		icon: "fas fa-list",
		type: presets
	});
	game.settings.register("wfrp4e-assistant", "assistantPresets", {
		scope: "world",
		config: false,
		default: [],
		type: Array,
		onChange: (value) => {
			if (game.settings.get("wfrp4e-assistant", "debug")) {
				console.debug(...debugMessage, "assistantPresets onChange \"value\"");
				console.debug(value);
			};
		}
	});
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
});

Hooks.once("ready", () => {
	game.wfrp4e.assistant = {
		bubbles: [],
		reactions: true
	};
});

Hooks.on("getHeaderControlsActorSheetV2", async (sheet, controls) => {
	let debug = game.settings.get("wfrp4e-assistant", "debug");
	let actor = sheet.document;
	if (debug) {
		console.debug(...debugMessage, "getHeaderControlsActorSheetV2 \"actor\"");
		console.debug(actor);
	};
	if(["character", "npc", "creature"].includes(actor.type) && sheet.isEditable && game.user.isGM) {
		//Добавление кнопки в шапку листа
		controls.push({
			icon: "fas fa-handshake-angle",
			label: game.i18n.localize("WFRP4E.Assistant.Name"),
			onClick: () => {warhammer.apps.WFRP4eAssistantMenu.create(actor)},
		});
	};
});

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
	let debug = game.settings.get("wfrp4e-assistant", "debug");
	let actor = sheet.document;
	if (debug) {
		console.debug(...debugMessage, "renderActorSheetV2 \"actor\"");
		console.debug(actor);
	};
	//Перенос значений старого эффетка в персонажа. Будет удалено в Foundry 14
	let effect = actor.effects.find(e => e.flags.assistant);
	if (effect && sheet.isEditable) {
		if (debug) {
			console.debug(...debugMessage, "renderActorSheetV2 removeEffect \"effect\"");
			console.debug(effect);
		};
		await actor.update({"flags.assistant": normalizeParams(effect.flags.assistant)});
		if (debug) {
			console.debug(...debugMessage, "renderActorSheetV2 removeEffect \"actor\"");
			console.debug(actor);
		};
		effect.delete();
	};
	//Списки заклинаний
	if (actor.hasSpells && actor.flags?.assistant?.spellsFilter) {
		let spellsFilter = actor.flags.assistant.spellsFilter;
		if (debug) {
			console.debug(...debugMessage, "getHeaderControlsActorSheetV2 \"spellsFilter\"");
			console.debug(spellsFilter);
		};
		//Функция обновления отображения Заклинаний
		function updateSpells(button) {
			//Изменение кнопки
			if (spellsFilter.page == -1) {
				button.innerHTML = "<i class='fas fa-list'></i>";
				button.dataset.tooltip = `<h6 style="text-align: center;">${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB1")}`;
			} else {
				button.innerHTML = `<i class="${spellsFilter.list[spellsFilter.page]?.icon}"></i>`;
				button.dataset.tooltip = `<h6 style="text-align: center;">${spellsFilter.list[spellsFilter.page]?.name}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB2")}`;
			};
			if (debug) {
				console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter updateSpells \"button\"");
				console.debug(button);
			};
			//Изменение отображения Заклинаний
			let spells = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-content").children;
			for (let i = 0; i < spells.length; i++) {
				if (spellsFilter.page != -1 && !spellsFilter.list[spellsFilter.page]?.spells.includes(spells[i].dataset.uuid)) {spells[i].style.display = "none"}
				else {spells[i].style.display = "flex"};
			};
			if (debug) {
				console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter updateSpells \"spells\"");
				console.debug(spells);
			};
		};
		//Создание кнопки
		let spellsButton = document.createElement("a");
		spellsButton.classList.add("list-button");
		spellsButton.dataset.action = "spellsFilter";
		spellsButton.dataset.tooltip = "";
		html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name").insertAdjacentElement("afterbegin", spellsButton);
		//Обновление отображения Заклинаний
		updateSpells(spellsButton);
		//Добавление событий нажатия
		//ЛКМ
		spellsButton.addEventListener("click", function() {
			let page = spellsFilter.page;
			if (debug) {
				console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter spellsButton:click \"page\"");
				console.debug(page);
			};
			//Изменение текущей категории и кнопки
			if (page < spellsFilter.list.length - 1) {page++}
			else {page = -1};
			//Обновление сохранённых параметров
			actor.update({"flags.assistant.spellsFilter.page": page});
			//Обновление отображения Заклинаний
			updateSpells(spellsButton);
		});
		//ПКМ
		spellsButton.addEventListener("contextmenu", async function() {
			if (spellsFilter.page != -1) {
				//Выбор Заклинаний для фильтра
				let spellsLists = actor.itemTypes.spell.filter(s => s.lore.value != "petty").map(s => ({name: s.name, img: s.img, uuid: s.uuid}));
				let choice = (await ItemDialog.create(spellsLists, spellsLists.length, {text: game.i18n.format("WFRP4E.Assistant.spellsFilter.Description", {name: spellsFilter.list[spellsFilter.page].name}), title: spellsFilter.list[spellsFilter.page].name})).map(s => s.uuid);
				//Обновление сохранённых параметров
				let result = spellsFilter.list;
				result[spellsFilter.page].spells = choice;
				if (debug) {
					console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter spellsButton:contextmenu \"result\"");
					console.debug(result);
				};
				actor.update({"flags.assistant.spellsFilter.list": result});
				//Обновление отображения Заклинаний
				updateSpells(spellsButton);
			} else {
				//Окно управления категориями
				let categories = new foundry.applications.api.DialogV2({
					window: {title: game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Title")},
					content: spellsFilter.list.map(c => ""
							+ "<div style='display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgoldenrod;'>"
							+ "\n\t<input style='width: 30%;' type='string' data-tooltip='"
							+ game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon")
							+ "' value='"
							+ c.icon
							+ "'>"
							+ "\n\t<input style='width: 70%;' data-tooltip='"
							+ game.i18n.localize("Name")
							+ "' type='string' data-spells='"
							+ c.spells.join(",")
							+ "' value='"
							+ c.name
							+ "'>"
							+ "\n\t<a data-action='removeCategories' data-tooltip='"
							+ game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Remove")
							+ "'>"
							+ "\n\t\t<i class='fas fa-trash'></i>"
							+ "\n\t</a>"
							+ "\n</div>"
						).join("") + "<a style='width: max-content;' data-action='addCategories' data-tooltip='" + game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Add") + "'><i class='fas fa-plus'></i></a>",
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
							actor.update({
								"flags.assistant.spellsFilter.page": -1,
								"flags.assistant.spellsFilter.list": list
							});
							//Обновление отображения Заклинаний
							updateSpells(spellsButton);
						}
					}]
				});
				await categories.render(true);
				if (debug) {
					console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter spellsButton:contextmenu \"categories\"");
					console.debug(categories);
				};
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
					categories.element.querySelector("a[data-action='addCategories']").insertAdjacentHTML("beforebegin", ""
							+ "<div style='display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgreen;'>"
							+ "\n\t<input style='width: 30%;' data-tooltip='"
							+ game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon")
							+ "' type='string' value='fas fa-ellipsis'>"
							+ "\n\t<input style='width: 70%;' data-tooltip='"
							+ game.i18n.localize("Name")
							+ "' type='string' data-spells='' value='"
							+ game.i18n.localize("Name")
							+ "'>"
							+ "\n\t<a data-action='removeCategories' data-tooltip='"
							+ game.i18n.localize('WFRP4E.Assistant.spellsFilter.Categories.Remove')
							+ "'>"
							+ "\n\t\t<i class='fas fa-trash'></i>"
							+ "\n\t</a>"
							+ "\n</div>"
						);
					//Добавление события удаления для созданной категории
					removeClick(categories.element.querySelector("div:last-of-type>a[data-action='removeCategories']"));
				});
				//Добавление события удаления для существующих категорий
				categories.element.querySelectorAll("a[data-action='removeCategories']").forEach((element) => removeClick(element));
			};
		});
		if (debug) {
			console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter \"spellsButton\"");
			console.debug(spellsButton);
		};
		//Скрытие простейших заклинаний
		//Функция обновления отображения Простейших заклинаний
		function updatePetty(button) {
			if (spellsFilter.petty) {
				button.innerHTML = "<i class='fas fa-eye-slash'></i>";
				button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Hide")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
			} else {
				button.innerHTML = "<i class='fas fa-eye'></i>";
				button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Show")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
			};
			if (debug) {
				console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter updatePetty \"button\"");
				console.debug(button);
			};
			let spells = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-content").children;
			for (let i = 0; i < spells.length; i++) {
				if (spellsFilter.petty) {spells[i].style.display = "flex"}
				else {spells[i].style.display = "none"};
			};
			if (debug) {
				console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter updatePetty \"spells\"");
				console.debug(spells);
			};
		};
		//Создание кнопки
		html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name").insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="hidePetty"></a>`);
		let pettyButton = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name>a[data-action='hidePetty']");
		//Обновление отображения Простейших заклинаний
		updatePetty(pettyButton);
		if (debug) {
			console.debug(...debugMessage, "getHeaderControlsActorSheetV2 spellsFilter \"pettyButton\"");
			console.debug(pettyButton);
		};
		//Добавление события нажатия ЛКМ
		pettyButton.addEventListener("click", function() {
			//Переключение параметра и его обновление
			if (spellsFilter.petty) {actor.update({"flags.assistant.spellsFilter.petty": false})}
			else {actor.update({"flags.assistant.spellsFilter.petty": true})};
			//Обновление отображения Простейших заклинаний
			updatePetty(pettyButton);
		});
	};
});

function normalizeParams(params) {
	let newParams = {};
	//Случайное имя
	newParams.generateName = {
		species: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species).concat("disabled").includes(params?.generateName?.species) ? params?.generateName?.species : "disabled",
		keys: typeof params?.generateName?.keys === "string" ? params?.generateName?.keys : ""
	};
	//Случайные характеристики
	newParams.randomCharacteristics = {
		status: typeof params?.randomCharacteristics?.status === "boolean" ? params?.randomCharacteristics?.status : false
	};
	//Случайный	размер токена
	newParams.randomTokenSize = {
		status: typeof params?.randomTokenSize?.status === "boolean" ? params?.randomTokenSize?.status : false
	};
	//Окраска при смерти
	newParams.deathTint = {
		color: CSS.supports("color", params?.deathTint?.color) ? params?.deathTint?.color : "#990000"
	};
	//Генерация заклинаний
	newParams.generateSpells = {
		lore: Object.keys(game.wfrp4e.config.magicLores).concat("arcane", "disabled").includes(params?.generateSpells?.lore) ? params?.generateSpells?.lore : "disabled",
		count: typeof params?.generateSpells?.count === "number" ? params?.generateSpells?.count : 1,
		arcane: typeof params?.generateSpells?.arcane === "boolean" ? params?.generateSpells?.arcane : game.settings.get("wfrp4e-assistant", "enableArcane")
	};
	//Отношение токена
	newParams.disposition = {
		value: ["-2", "-1", "0", "1", "2", "3", "4"].includes(params?.disposition?.value) ? params?.disposition?.value : "3"
	};
	//Отношение токена
	newParams.spellsFilter = {
		page: typeof params?.spellsFilter?.page === "number" ? params?.spellsFilter?.page : -1,
		list: Array.isArray(params?.spellsFilter?.list) ? params?.spellsFilter?.list : [],
		petty: typeof params?.spellsFilter?.petty === "boolean" ? params?.spellsFilter?.petty : true
	};
	//Реакции
	newParams.reactions = {
		species: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species).concat("disabled").includes(params?.reactions?.species) ? params?.reactions?.species : "disabled",
		subspecies: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species).map(s => Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s].Subspecies)).flat(1).concat("Not").includes(params?.reactions?.subspecies) ? params?.reactions?.subspecies : "Not",
		frequency: ["0", "25", "50", "75", "100"].includes(params?.reactions?.frequency) ? params?.reactions?.frequency : "75"
	};
	//Шаблоны
	newParams.presets = [];
	if (Array.isArray(params?.presets)) {
		params.presets?.forEach(p => {
			let preset = {
				characteristics: {
					ws: typeof p?.characteristics?.ws === "string" ? String(Number(p?.characteristics?.ws)) : "0",
					bs: typeof p?.characteristics?.bs === "string" ? String(Number(p?.characteristics?.bs)) : "0",
					s: typeof p?.characteristics?.s === "string" ? String(Number(p?.characteristics?.s)) : "0",
					t: typeof p?.characteristics?.t === "string" ? String(Number(p?.characteristics?.t)) : "0",
					i: typeof p?.characteristics?.i === "string" ? String(Number(p?.characteristics?.i)) : "0",
					ag: typeof p?.characteristics?.ag === "string" ? String(Number(p?.characteristics?.ag)) : "0",
					dex: typeof p?.characteristics?.dex === "string" ? String(Number(p?.characteristics?.dex)) : "0",
					int: typeof p?.characteristics?.int === "string" ? String(Number(p?.characteristics?.int)) : "0",
					wp: typeof p?.characteristics?.fel === "string" ? String(Number(p?.characteristics?.wp)) : "0",
					fel: typeof p?.characteristics?.fel === "string" ? String(Number(p?.characteristics?.fel)) : "0"
				},
				items: []
			};
			if (Array.isArray(p.items)) {
				p.items?.forEach(i => {
					let item = fromUuidSync(i.uuid) || false;
					if (item) {
						preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.quantity.value}});
					};
				});
			} else {preset.items = []};
			preset.weight = String(Number(p.weight)) || "1";
			newParams.presets.push(preset);
		});
	} else {newParams.presets = []};
	//Версия
	newParams.version = game.modules.get("wfrp4e-assistant").version;
	return newParams;
};

Hooks.on("getSceneControlButtons", (controls) => {
	controls.tokens.tools.toggleAssistantReactions = {
		name: "toggleAssistantReactions",
		title: game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Title") + " (" + game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.On") + ")",
		icon: "fas fa-thought-bubble",
		button: true,
		toggle: true,
		visible: game.user.isGM,
		onChange: () => {
			if (game.wfrp4e.assistant.reactions) {
				game.wfrp4e.assistant.reactions = false;
				document.querySelector(".ui-control[data-tool='toggleAssistantReactions']").ariaLabel = game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Title") + " (" + game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Off") + ")";
			} else {
				game.wfrp4e.assistant.reactions = true;
				document.querySelector(".ui-control[data-tool='toggleAssistantReactions']").ariaLabel = game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Title") + " (" + game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.On") + ")";
			};
		}
	};
});