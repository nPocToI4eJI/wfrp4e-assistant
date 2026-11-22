let debugMessage = ["%cWFRP4e - Assistant %c[debug]%c.", "font-weight: bold;", "color: orange;", ""];
//Шаблоны Помощника
class presets extends ApplicationV2 {
	async render() {
		await presets.choice();
		return this;
	};

	static async choice() {
		let debug = game.settings.get("wfrp4e-tools", "debug");
		let preset = await ItemDialog.create(
			[{name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Create"), value: "create", img: "systems/wfrp4e/icons/buildings/cross.png"}]
				.concat(game.wfrp4e.tools.assistant.presets.all.map(p => ({name: p.name + (debug ? " [" + p.id + "]" : ""), value: p.id, img: p.img || "systems/wfrp4e/icons/buildings/scroll.png"}))),
			1,
			{text: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Tooltip.Edit"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title")}
		);
		if (!preset?.length) {return};
		if (preset[0].value == "create") {
			preset = {
				name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title"),
				id: foundry.utils.randomID(),
				flags: {assistant: normalizeParams()},
				isPreset: true
			};
			preset.uuid = preset.id;
			await game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").concat(preset));
		} else {
			let found = game.wfrp4e.tools.assistant.presets.all.find(p => p.id == preset[0].value);
			if (!found) {return};
			preset = foundry.utils.deepClone(found);
			//Дополнение параметров шаблонов. Будет удалено в Foundry 14
			if (!preset.uuid) {
				preset.uuid = preset.id;
				await game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => p.id == preset.id ? preset : p));
			};
			if (debug) {
				preset.flags = {assistant: normalizeParams(preset?.flags?.assistant)};
			};
		};
		if (debug) {
			console.debug(...debugMessage, "presets choice \"preset\"");
			console.debug(preset);
		};
		game.wfrp4e.tools.AssistantMenu.create(preset);
	};
};

class AssistantUtility {
	/**
	 * Этот метод генерирует случайное имя.
	 *
	 * @param {string} species Ключ народа. Ключи находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.GenerateName.Species.
	 * @param {Array} keys Ключи локализации для Народа. Ключи находятся по следующему пути локализации: WFRP4E.Assistant.Helpers.GenerateName.Keys["species"].
	 *                      Если ключ не был определён, он указывается как есть.
	 * @returns {string} Сгенерированное по параметрам имя. Возвращает "ничего", если имя не было сгенерировано.
	 */
	static generateName(species, keys) {
		let name = [];
		if (!game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[species]) {
			name = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Nothing");
		} else {
			let speciesKeys = Array.isArray(keys) ? keys : String(keys || "").split(",");
			speciesKeys.forEach(k => {
				if (k.includes("|")) {
					k = game.wfrp4e.tools.randomArrayElement(k.split("|"));
				};
				let list = game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[species][k];
				if (Array.isArray(list)) {
					if (list.length) {name.push(game.wfrp4e.tools.randomArrayElement(list))};
				} else if (k) {
					name.push(k);
				};
			});
			name = name.filter(Boolean).join(" ");
		};
		if (game.settings.get("wfrp4e-tools", "debug")) {
			console.debug(...debugMessage, "AssistantUtility generateName \"name\"");
			console.debug(name);
		};
		return name || game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Nothing");
	};

	/**
	 * Этот метод возвращает токены, принадлежащие актёру.
	 *
	 * @param {ActorWFRP4e} actor Актёр.
	 * @returns {Array} Токены, принадлежащие актёру.
	 */
	static getActorTokens(actor) {
		if (!actor || !game.scenes.current) {return []};
		if (actor.token) {return actor.token.parent === game.scenes.current ? [actor.token] : []};
		return actor.getDependentTokens().filter(t => t.parent === game.scenes.current);
	};

	/**
	 * Этот метод используется для определения и создания реакций на события для выбранного Актёра.
	 *
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
		let debug = game.settings.get("wfrp4e-tools", "debug");
		if (debug) {
			console.debug(...debugMessage, "AssistantUtility getReaction \"actor\", \"opponent\", \"action\", \"location\"");
			console.debug(actor);
			console.debug(opponent);
			console.debug(action);
			console.debug(location);
		};
		//Проверка на наличие существующего всплывающего облака с реакцией для этого актёра
		//Проверка на включение отображения реакций
		if (!game.wfrp4e.tools.assistant.bubbles.includes(actor.id) && game.wfrp4e.tools.assistant.reactions) {
			//Беру все фразы из файла переводов, принадлежащие actor.species для действия action, если они есть
			let phrases = game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.List?.[actor.species]?.[action];
			if (!phrases) {
				if (debug) {console.debug(...debugMessage, "AssistantUtility getReaction break \"MissList\"")};
				return;
			};
			if (debug) {
				console.debug(...debugMessage, "AssistantUtility getReaction \"phrases\"");
				console.debug(phrases);
			};
			//Массив фраз
			let reactionsList = {
				prefix: [],
				phrases: [],
				postfix: []
			};
			//Если у актёра прописаны общие фразы в настройках реакций
			if (phrases.All) {
				//Добавляю массив All
				reactionsList.prefix = reactionsList.prefix.concat(phrases.All?.Prefix);
				reactionsList.phrases = reactionsList.phrases.concat(phrases.All?.Phrases);
				reactionsList.postfix = reactionsList.postfix.concat(phrases.All?.Postfix);
				//Если есть Противник
				if (opponent && phrases.All.Opponent) {
					//Добавляю массив Opponent
					reactionsList.prefix = reactionsList.prefix.concat(phrases.All.Opponent?.Prefix);
					reactionsList.phrases = reactionsList.phrases.concat(phrases.All.Opponent?.Phrases);
					reactionsList.postfix = reactionsList.postfix.concat(phrases.All.Opponent?.Postfix);
					//Если у Противника указан Народ в настройках реакций
					if (opponent.species != "disabled" && phrases.All.Opponent[opponent.species]) {
						//Добавляю массив Opponent, принадлежащий Народу Противника
						reactionsList.prefix = reactionsList.prefix.concat(phrases.All.Opponent[opponent.species]?.Prefix);
						reactionsList.phrases = reactionsList.phrases.concat(phrases.All.Opponent[opponent.species]?.Phrases);
						reactionsList.postfix = reactionsList.postfix.concat(phrases.All.Opponent[opponent.species]?.Postfix);
						//Если у Противника указана Разновидность Народа в настройках реакций
						if (opponent.subspecies != "Not" && phrases.All.Opponent[opponent.species][opponent.subspecies]) {
							//Добавляю массив Opponent, принадлежащий Народу Противника и Разновидности Народа Противника
							reactionsList.prefix = reactionsList.prefix.concat(phrases.All.Opponent[opponent.species][opponent.subspecies]?.Prefix);
							reactionsList.phrases = reactionsList.phrases.concat(phrases.All.Opponent[opponent.species][opponent.subspecies]?.Phrases);
							reactionsList.postfix = reactionsList.postfix.concat(phrases.All.Opponent[opponent.species][opponent.subspecies]?.Postfix);
						};
					};
				};
				//Если указана зона попадания
				if (location && phrases.All.To && phrases.All.To[location]) {
					//Добавляю массив All
					reactionsList.prefix = reactionsList.prefix.concat(phrases.All.To[location]?.Prefix);
					reactionsList.phrases = reactionsList.phrases.concat(phrases.All.To[location]?.Phrases);
					reactionsList.postfix = reactionsList.postfix.concat(phrases.All.To[location]?.Postfix);
					//Если есть Противник
					if (opponent && phrases.All.To[location].Opponent) {
						//Добавляю массив Opponent
						reactionsList.prefix = reactionsList.prefix.concat(phrases.All.To[location].Opponent?.Prefix);
						reactionsList.phrases = reactionsList.phrases.concat(phrases.All.To[location].Opponent?.Phrases);
						reactionsList.postfix = reactionsList.postfix.concat(phrases.All.To[location].Opponent?.Postfix);
						//Если у Противника указан Народ в настройках реакций
						if (opponent.species != "disabled" && phrases.All.To[location].Opponent[opponent.species]) {
							//Добавляю массив Opponent, принадлежащий Народу Противника
							reactionsList.prefix = reactionsList.prefix.concat(phrases.All.To[location].Opponent[opponent.species]?.Prefix);
							reactionsList.phrases = reactionsList.phrases.concat(phrases.All.To[location].Opponent[opponent.species]?.Phrases);
							reactionsList.postfix = reactionsList.postfix.concat(phrases.All.To[location].Opponent[opponent.species]?.Postfix);
							//Если у Противника указана Разновидность Народа в настройках реакций
							if (opponent.subspecies != "Not" && phrases.All.To[location].Opponent[opponent.species][opponent.subspecies]) {
								//Добавляю массив Opponent, принадлежащий Народу Противника и Разновидности Народа Противника
								reactionsList.prefix = reactionsList.prefix.concat(phrases.All.To[location].Opponent[opponent.species][opponent.subspecies]?.Prefix);
								reactionsList.phrases = reactionsList.phrases.concat(phrases.All.To[location].Opponent[opponent.species][opponent.subspecies]?.Phrases);
								reactionsList.postfix = reactionsList.postfix.concat(phrases.All.To[location].Opponent[opponent.species][opponent.subspecies]?.Postfix);
							};
						};
					};
				};
			};
			//Если у актёра указана Разновидность Народа в настройках реакций
			if (actor.subspecies != "Not" && phrases[actor.subspecies]) {
				//Добавляю массив All для Разновидности Народа
				reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies]?.Prefix);
				reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies]?.Phrases);
				reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies]?.Postfix);
				//Если есть Противник
				if (opponent && phrases[actor.subspecies].Opponent) {
					//Добавляю массив Opponent
					reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].Opponent?.Prefix);
					reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].Opponent?.Phrases);
					reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].Opponent?.Postfix);
					//Если у Противника указан Народ в настройках реакций
					if (opponent.species != "disabled" && phrases[actor.subspecies].Opponent[opponent.species]) {
						//Добавляю массив Opponent, принадлежащий Народу Противника
						reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].Opponent[opponent.species]?.Prefix);
						reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].Opponent[opponent.species]?.Phrases);
						reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].Opponent[opponent.species]?.Postfix);
						//Если у Противника указана Разновидность Народа в настройках реакций
						if (opponent.subspecies != "Not" && phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]) {
							//Добавляю массив Opponent, принадлежащий Народу Противника и Разновидности Народа Противника
							reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]?.Prefix);
							reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]?.Phrases);
							reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].Opponent[opponent.species][opponent.subspecies]?.Postfix);
						};
					};
				};
				//Если указана зона попадания
				if (location && phrases[actor.subspecies].To && phrases[actor.subspecies].To[location]) {
					//Добавляю массив All
					reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].To[location]?.Prefix);
					reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].To[location]?.Phrases);
					reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].To[location]?.Postfix);
					//Если есть Противник
					if (opponent && phrases[actor.subspecies].To[location].Opponent) {
						//Добавляю массив Opponent
						reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].To[location].Opponent?.Prefix);
						reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].To[location].Opponent?.Phrases);
						reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].To[location].Opponent?.Postfix);
						//Если у Противника указан Народ в настройках реакций
						if (opponent.species != "disabled" && phrases[actor.subspecies].To[location].Opponent[opponent.species]) {
							//Добавляю массив Opponent, принадлежащий Народу Противника.
							reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species]?.Prefix);
							reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species]?.Phrases);
							reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species]?.Postfix);
							//Если у Противника указана Разновидность Народа в настройках реакций
							if (opponent.subspecies != "Not" && phrases[actor.subspecies].To[location].Opponent[opponent.species][opponent.subspecies]) {
								//Добавляю массив Opponent, принадлежащий Народу Противника и Разновидности Народа Противника
								reactionsList.prefix = reactionsList.prefix.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species][opponent.subspecies]?.Prefix);
								reactionsList.phrases = reactionsList.phrases.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species][opponent.subspecies]?.Phrases);
								reactionsList.postfix = reactionsList.postfix.concat(phrases[actor.subspecies].To[location].Opponent[opponent.species][opponent.subspecies]?.Postfix);
							};
						};
					};
				};
			};
			reactionsList.prefix = reactionsList.prefix.filter(Boolean);
			reactionsList.phrases = reactionsList.phrases.filter(Boolean);
			reactionsList.postfix = reactionsList.postfix.filter(Boolean);
			if (debug) {
				console.debug(...debugMessage, "AssistantUtility getReaction reactionsList \"prefix\", \"phrases\", \"postfix\"");
				console.debug(reactionsList.prefix);
				console.debug(reactionsList.phrases);
				console.debug(reactionsList.postfix);
			};
			//Прерываю функцию, если по какой-то причине фразы не были подобраны
			if (!reactionsList.prefix.length && !reactionsList.phrases.length && !reactionsList.postfix.length) {return};
			//Определяю итоговую фразу для каждого токена
			for (let i = 0; i < actor.tokens.length; i++) {
				//Итоговая фраза
				let phrase = [];
				//Подбирать фразы, пока не выпадет хотя бы одно значение
				while (!phrase.length) {
					//Добавить случайную фразу из массива Prefix с шансом 20%
					if (Math.floor(CONFIG.Dice.randomUniform() * 10) >= 8) {phrase.push(game.wfrp4e.tools.randomArrayElement(reactionsList.prefix))};
					//Добавить случайную фразу из массива Phrases с шансом 60%
					if (Math.floor(CONFIG.Dice.randomUniform() * 10) >= 4) {phrase.push(game.wfrp4e.tools.randomArrayElement(reactionsList.phrases))};
					//Добавить случайную фразу из массива Postfix с шансом 20%
					if (Math.floor(CONFIG.Dice.randomUniform() * 10) >= 8) {phrase.push(game.wfrp4e.tools.randomArrayElement(reactionsList.postfix))};
					phrase = [...new Set(phrase.filter(Boolean))];
				};
				if (debug) {
					console.debug(...debugMessage, "AssistantUtility getReaction \"phrase\"");
					console.debug(phrase);
				};
				//Преобразование массива фраз в одну
				phrase = phrase.join(" ");
				//Определение типа вывода реакции
				let sendMode = game.settings.get("wfrp4e-assistant", "reactionsSend");
				let bubbleContent = `${phrase}<span style="display: none;">Эта строка нужна только для того, чтобы увеличить длительность отображения облака чата:${" костыль".repeat(Math.max(0, 13 - phrase.split(/\s+/).reduce((n, w) => n + Number(!!w.trim().length), 0) ?? 0))}</span>`;
				let speaker = ChatMessage.getSpeaker({scene: game.scenes.current, token: actor.tokens[i]});
				//Всплывающим облаком (0 — облако и чат, 1 — только облако)
				if (sendMode == 0 || sendMode == 1) {
					canvas.hud.bubbles.broadcast(actor.tokens[i], bubbleContent, {cssClasses: ["wfrp4eAssistant-chat-bubble"]});
				};
				//Сообщением в чат (0 — облако и чат, 2 — только чат)
				if (sendMode == 0 || sendMode == 2) {
					ChatMessage.create({
						speaker,
						content: `<em>${phrase}</em>`
					});
				};
				//Добавление актёра в пул существующих реакций
				game.wfrp4e.tools.assistant.bubbles.push(actor.id);
				setTimeout(() => {
					//Удаление актёра из пула существующих реакций через 5000 мс
					let index = game.wfrp4e.tools.assistant.bubbles.indexOf(actor.id);
					if (index > -1) {game.wfrp4e.tools.assistant.bubbles.splice(index, 1)};
				}, 5000);
			};
		} else if (debug) {
			console.debug(...debugMessage, "AssistantUtility getReaction false");
		};
	};
};

class AssistantMenu extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["wfrp4eAssistant-menu", "wfrp4eTools", "warhammer"],
		window: {
			icon: "fas fa-handshake-angle",
			resizable: true,
			contentClasses: ["standard-form"],
			controls: [{
				icon: "fas fa-list",
				label: "WFRP4E.Assistant.Helpers.Settings.Presets.Add",
				action: "insertPreset"
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
			addGenerateNameKeys: this._onAddGenerateNameKeys,
			removeGenerateNameKeys: this._onRemoveGenerateNameKeys,
			insertPreset: this._onInsertPreset
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-assistant/templates/assistant/app.hbs",
		},
		footer: {
			template: "modules/wfrp4e-tools/templates/form-footer.hbs"
		}
	};

	constructor(actor, debug, options) {
		super(options);
		this.#dragDrop = this.#createDragDropHandlers();
		this.actor = actor;
		this.debug = debug;
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu constructor \"this\"");
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
			console.debug(...debugMessage, "AssistantMenu _onDragStart \"dragData\"");
			console.debug(dragData);
		};
		event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
	};

	async _onDrop(event) {
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onDrop \"event\", \"event.target\"");
			console.debug(event);
			console.debug(event.target);
		};
		let dragData = foundry.applications.ux.TextEditor.implementation.getDragEventData(event);
		if (!dragData) {return};
		let item = await fromUuid(typeof dragData === "string" ? dragData : dragData.uuid);
		if (!item) {return};
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onDrop \"item\"");
			console.debug(item);
		};
		let dropTarget = event.target.closest(".items");
		if (!dropTarget || dropTarget.querySelector(`a[data-uuid='${item.uuid}']`)) {return};
		let dragEl = this.element.querySelector(`a[data-uuid='${item.uuid}']`);
		if (!dragEl) {return};
		dropTarget.appendChild(dragEl);
		this.#dragDrop.forEach((d) => d.bind(this.element));
	};

	async _onFirstRender(context, options) {
		await super._onFirstRender(context, options);
		//Делегирование событий ввода и изменения для всех ключей (и основных, и в наборах)
		this.element.addEventListener("input", (e) => {
			if (e.target.matches("input.key")) {
				e.target.style.width = (e.target.value.length + 2) + "ch";
			};
		});
		this.element.addEventListener("change", (e) => {
			if (e.target.matches("input.key")) {
				this.updateKeys(this.params.generateName.species);
			};
		});
	};

	async _onRender(context) {
		//Проверка указанных ключей на наличие в выбранном народе
		this.updateKeys(this.params.generateName.species);
		//Функция обновления описания для ключей при смене народа
		this.element.querySelector("#generateNameSpecies").addEventListener("change", (e) => {
			this.params.generateName.species = e.target.value;
			this.updateKeys(e.target.value);
		});

		this.checkSubspecies(this.element.querySelector("#reactionsSpecies").value);
		this.element.querySelector("#reactionsSpecies").addEventListener("change", e => this.checkSubspecies(e.target.value));

		this.element.querySelectorAll(".drag-item").forEach(i => {
			i.addEventListener("click", async (e) => {
				let item = await fromUuid(e.currentTarget.dataset.uuid);
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
				this.actor.flags = {
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
			context.token = {
				path: this.actor.prototypeToken.texture.src.substring(0, this.actor.prototypeToken.texture.src.lastIndexOf("/") + 1),
				file: this.actor.prototypeToken.texture.src.split("/").at(-1)
			};
		} else {
			context.items = [];
			context.isUnique = false;
			context.token = {
				path: game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.IsPreset"),
				file: game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.IsPreset")
			};
		};
		this.isUnique = context.isUnique;
		context.buttons = [];
		//Кнопка сохранения для не базовых шаблонов
		if (!this.actor.isDefault) {
			context.buttons.push({
				icon: "fas fa-save",
				action: "save",
				default: true,
				label: "Save"
			});
		};
		//Кнопка назад для шаблонов
		if (this.actor.isPreset) {
			context.buttons.unshift({
				action: "back",
				icon: "fas fa-list",
				label: "WFRP4E.Assistant.Helpers.Settings.Presets.List"
			});
		};
		//Кнопка удаления для шаблонов
		if (this.actor.isPreset && !this.actor.isDefault) {
			context.buttons.unshift({
				action: "delete",
				icon: "fas fa-trash",
				label: "WFRP4E.Assistant.Helpers.Settings.Presets.Delete"
			});
		};
		//Кнопка экспорта для токенов
		if (this.actor.token) {
			context.buttons.unshift({
				action: "export",
				icon: "fas fa-file-export",
				label: "WFRP4E.Assistant.Helpers.Export"
			});
		};
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	static async create(actor, options={}) {
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu create");
		};
		//Проверка на наличие активного окна генератора
		if (document.querySelector("div.wfrp4eTools.wfrp4eAssistant-menu." + actor.uuid.replaceAll(".", "\\."))) {
			document.querySelector("div.wfrp4eTools.wfrp4eAssistant-menu." + actor.uuid.replaceAll(".", "\\.")).style.zIndex = ++ApplicationV2._maxZ;
			return;
		};
		if (!actor.isPreset) {
			//Перенос значений старого эффетка в персонажа. Будет удалено в Foundry 14
			let effect = actor.effects.find(e => e.flags.assistant);
			if (effect) {
				if (game.settings.get("wfrp4e-tools", "debug")) {
					console.debug(...debugMessage, "AssistantMenu create removeEffect \"effect\"");
					console.debug(effect);
				};
				await actor.update({"flags.assistant": normalizeParams(effect.flags.assistant)});
				if (game.settings.get("wfrp4e-tools", "debug")) {
					console.debug(...debugMessage, "AssistantMenu create removeEffect \"actor\"");
					console.debug(actor);
				};
				effect.delete();
			};
			//Преобразование params.generateName.keys из строки в массив, связанный с обновлением 13.3.2. Будет удалено в Foundry 14
			if (actor.flags?.assistant && !Array.isArray(actor.flags?.assistant?.generateName.keys)) {
				let newValue = actor.flags.assistant;
				newValue.generateName.keys = newValue.generateName.keys.split(",").map(k => ({value: k, chance: 100}));
				await actor.update({"flags.assistant": normalizeParams(newValue)});
			};
		};
		//Определение названия шапки шаблона в соответствии с типом
		options.window = {title: actor.name + (this.debug ? " [ID: " + actor.uuid + "]" : "")};
		//Определение класса, содержащего uuid актёра
		options.classes = [actor.uuid];
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu create \"options\"");
			console.debug(options);
		};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(actor, this.debug, options).render({force: true});
		});
	};

	//Функция проверки указанных ключей на наличие в выбранном народе
	updateKeys(species) {
		let inputs = this.element.querySelectorAll("#generateNameKeys, div.replaceKeys");
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu updateKeys \"inputs\"");
			console.debug(inputs);
		};
		let speciesListHtml = this.species[species] || `<li><strong>${game.i18n.localize("No")}</strong></li>`;
		let validKeys = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Keys[species] || {});
		inputs.forEach(input => {
			let keyEls = input.querySelectorAll("input.key");
			keyEls.forEach(w => {w.style.width = (w.value.length + 2) + "ch"});
			let keys = Array.from(keyEls)
				.map(k => k.value)
				.flatMap(k => k.includes("|") ? k.split("|").filter(Boolean) : k)
				.filter(Boolean);
			if (this.debug) {
				console.debug(...debugMessage, "AssistantMenu updateKeys ", input, " \"keys\"");
				console.debug(keys);
			};
			let errors = keys
				.filter(k => !validKeys.includes(k))
				.map(k => `<li><strong>${k}</strong></li>`);

			let prefix = input.classList.contains("replaceKeys") ? game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceKeys") + "<hr>" : "";
			let errorBlock = (errors.length && species != "disabled")
				? `<span>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Error")}<ul>${errors.join("")}</ul></span>`
				: "";
			input.dataset.tooltip = `${prefix}${errorBlock}${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Value")}<ul>${speciesListHtml}</ul>${game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Keys.Hint")}`;
			if (this.debug) {
				console.debug(...debugMessage, "AssistantMenu updateKeys ", input, " \"input.dataset.tooltip\"");
				console.debug(input.dataset.tooltip);
			};
		});
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

	static async _onSave() {
		let params = {};
		if (!this.isUnique) {
			//Случайное имя
			let nameSpecies = this.element.querySelector("#generateNameSpecies").value;
			if (nameSpecies != "disabled") {
				params.generateName = {
					species: nameSpecies,
					keys: Array.from(this.element.querySelectorAll("#generateNameKeys > div")).map(k => ({value: k.children[0].value, chance: Math.min(100, Math.max(1, k.children[1].value || 100))})).filter(k => k.value)
				};
			} else {
				params.generateName = {
					species: "disabled",
					keys: Array.from(this.element.querySelectorAll("#generateNameKeys > div")).map(k => ({value: k.children[0].value, chance: Math.min(100, Math.max(1, k.children[1].value || 100))})).filter(k => k.value)
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
				evenly: this.element.querySelector("#deathTintEvenly").checked,
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
				subspecies: reactionsSpecies != "disabled" ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[reactionsSpecies]?.Subspecies || {}).includes(this.element.querySelector("#reactionsSubspecies").value) ? this.element.querySelector("#reactionsSubspecies").value : "Not" : this.element.querySelector("#reactionsSubspecies").value,
				frequency: this.element.querySelector("#reactionsFrequency").value
			};
			//Шаблоны
			params.presets = [];
			this.element.querySelectorAll("li#presets > ul > li").forEach(p => {
				let preset = {replaceTokens: "", characteristics: {}, weight: "", replaceKeys: [], items: []};
				preset.replaceTokens = p.querySelector("input[name='replaceTokens']").value;
				["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
					preset.characteristics[c] = p.querySelector("input[data-characteristic='" + c + "']").value || 0;
				});
				preset.weight = Math.max(0, p.querySelector("input[name='weight']").value);
				preset.replaceKeys = Array.from(p.querySelectorAll(".replaceKeys > div")).map(k => ({value: k.children[0].value, chance: Math.min(100, Math.max(1, k.children[1].value || 100))})).filter(k => k.value);
				p.querySelectorAll("a.drag-item").forEach(i => {
					let item = fromUuidSync(i.dataset.uuid);
					if (item) {preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.system?.quantity?.value ?? 1}})};
				});
				params.presets.push(preset);
			});
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
				evenly: this.element.querySelector("#deathTintEvenly").checked,
				color: this.element.querySelector("#deathTintValue").value
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
				subspecies: reactionsSpecies != "disabled" ? Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[reactionsSpecies]?.Subspecies || {}).includes(this.element.querySelector("#reactionsSubspecies").value) ? this.element.querySelector("#reactionsSubspecies").value : "Not" : this.element.querySelector("#reactionsSubspecies").value,
				frequency: this.element.querySelector("#reactionsFrequency").value
			};
			//Шаблоны
			params.presets = [];
			this.element.querySelectorAll("li#presets > ul > li").forEach(p => {
				let preset = {replaceTokens: "", characteristics: {}, replaceKeys: [], items: []};
				preset.replaceTokens = p.querySelector("input[name='replaceTokens']").value;
				["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
					preset.characteristics[c] = p.querySelector("input[data-characteristic='" + c + "']").value || 0;
				});
				preset.weight = Math.max(0, p.querySelector("input[name='weight']").value);
				preset.replaceKeys = Array.from(p.querySelectorAll(".replaceKeys > div")).map(k => ({value: k.children[0].value, chance: Math.min(100, Math.max(1, k.children[1].value || 100))})).filter(k => k.value);
				p.querySelectorAll("a.drag-item").forEach(i => {
					let item = fromUuidSync(i.dataset.uuid);
					if (item) {preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.system?.quantity?.value ?? 1}})};
				});
				params.presets.push(preset);
			});
		};
		params.spellsFilter = this.params.spellsFilter;
		this.params = normalizeParams(params);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onSave \"params\"");
			console.debug(params);
		};
		if (this.actor.isPreset) {
			this.actor.name = this.element.querySelector("#presetNameValue").value || game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title");
			this.actor.flags.assistant = this.params;
			await game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").map(p => p.id == this.actor.id ? this.actor : p));
			this.element.querySelector(".window-title").textContent = this.actor.name + (this.debug ? " [ID: " + this.actor.id + "]" : "");
		} else {
			await this.actor.update({"flags.assistant": this.params});
		};
		game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Assistant.Helpers.Saved")}, {color: "green"});
	};

	static async _onExport() {let oldActor = this.actor;
		if (!oldActor?.token?.parent) {return};
		let actorData = oldActor.toObject();
		let scene = oldActor.token.parent;
		actorData.prototypeToken = oldActor.token.toObject();
		actorData.prototypeToken.actorLink = true;
		actorData.prototypeToken.appendNumber = false;
		actorData.prototypeToken.rotation = 0;
		actorData.folder = null;
		this.actor = await Actor.create(actorData);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onExport \"actor\"");
			console.debug(this.actor);
		};
		let tokenData = await this.actor.getTokenDocument({x: oldActor.token.x, y: oldActor.token.y, rotation: oldActor.token.rotation, elevation: oldActor.token.elevation});
		await scene.createEmbeddedDocuments("Token", [tokenData.toObject()]);
		await oldActor.token.delete();
		await this.close();
	};

	static async _onDelete() {
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onDelete \"actor\"");
			console.debug(this.actor);
		};
		await game.settings.set("wfrp4e-assistant", "assistantPresets", game.settings.get("wfrp4e-assistant", "assistantPresets").filter(p => p.id != this.actor.id));
		presets.choice();
		this.close();
	};

	static _onBack() {
		presets.choice();
		this.close();
	};

	static _onAddGenerateNameKeys(button) {
		button.target.closest("div").appendChild(this.addGenerateNameKeys());
		button.target.closest("div").appendChild(button.target.closest("div").querySelector("a[data-action=\"addGenerateNameKeys\"]"));
		this.updateKeys(this.params.generateName.species);
	};

	addGenerateNameKeys() {
		let newKey = document.createElement("div");
		let value = document.createElement("input");
		value.classList.add("key");
		value.type = "text";
		value.value = "key";
		value.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Parameter");
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu addGenerateNameKeys \"value\"");
			console.debug(value);
		};
		let chance = document.createElement("input");
		chance.classList.add("chance");
		chance.type = "number";
		chance.min = 1;
		chance.max = 100;
		chance.step = 1;
		chance.value = 100;
		chance.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Chance");
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu addGenerateNameKeys \"chance\"");
			console.debug(chance);
		};
		let remove = document.createElement("a");
		remove.dataset.action = "removeGenerateNameKeys";
		remove.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Remove");
		remove.innerHTML = "<i class=\"fas fa-xmark\"></i>";
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu addGenerateNameKeys \"remove\"");
			console.debug(remove);
		};
		newKey.append(value, chance, remove);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu addGenerateNameKeys \"newKey\"");
			console.debug(newKey);
		};
		return newKey;
	};

	static _onRemoveGenerateNameKeys(button) {
		//Удаление ключа имени
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onRemovegenerateNameKeys \"PointerEvent\"");
			console.debug(button);
		};
		button.target.closest("div").remove();
		this.updateKeys(this.params.generateName.species);
	};

	static _onAddPreset() {
		this.element.querySelector("li#presets > ul").appendChild(this.createPreset());
		this.updateKeys(this.params.generateName.species);
		this.dragDrop.forEach((d) => d.bind(this.element));
	};

	createPreset() {
		let newPreset = document.createElement("li");
		let replaceTokens = document.createElement("div");
		replaceTokens.classList.add("replaceTokens");
		replaceTokens.dataset.tooltip = game.i18n.format("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.Hint", {path: this.actor.prototypeToken?.texture.src.substring(0, this.actor.prototypeToken.texture.src.lastIndexOf("/") + 1) || game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.IsPreset"), file: this.actor.prototypeToken?.texture.src.split("/").at(-1) || game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.IsPreset")});
		let replaceTokensLabel = document.createElement("label");
		replaceTokensLabel.textContent = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceTokens.Label");
		let replaceTokensInput = document.createElement("input");
		replaceTokensInput.type = "text";
		replaceTokensInput.name = "replaceTokens";
		replaceTokensInput.value = "";
		replaceTokens.append(replaceTokensLabel, replaceTokensInput);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu createPreset \"replaceTokens\"");
			console.debug(replaceTokens);
		};
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
			console.debug(...debugMessage, "AssistantMenu createPreset \"characteristics\"");
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
			console.debug(...debugMessage, "AssistantMenu createPreset \"weight\"");
			console.debug(weight);
		};
		let replaceKeys = document.createElement("div");
		replaceKeys.classList.add("replaceKeys");
		replaceKeys.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.ReplaceKeys");
		let replaceKeysA= document.createElement("a");
		replaceKeysA.dataset.action = "addGenerateNameKeys";
		replaceKeysA.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Add");
		replaceKeysA.innerHTML = "<i class=\"fas fa-plus\"></i>";
		replaceKeys.append(replaceKeysA);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu createPreset \"replaceKeys\"");
			console.debug(replaceKeys);
		};
		let items = document.createElement("div");
		items.classList.add("body", "items");
		items.dataset.drop = true;
		items.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Items.Preset");
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu createPreset \"items\"");
			console.debug(items);
		};
		let a = document.createElement("a");
		a.classList.add("button");
		a.dataset.action = "removePreset";
		a.dataset.tooltip = game.i18n.localize("WFRP4E.Assistant.Helpers.Presets.Remove");
		a.innerHTML = "<i class=\"fas fa-trash\"></i>";
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu createPreset \"a\"");
			console.debug(a);
		};
		newPreset.append(replaceTokens, characteristics, weight, replaceKeys, items, a);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu createPreset \"newPreset\"");
			console.debug(newPreset);
		};
		return newPreset;
	};

	static _onRemovePreset(button) {
		//Удаление шаблона
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onRemovePreset \"PointerEvent\"");
			console.debug(button);
		};
		button.target.closest("li").remove();
	};

	static async _onInsertPreset() {
		if (this.actor.isDefault) {return};
		let preset = await ItemDialog.create(game.wfrp4e.tools.assistant.presets.all.map(p => ({name: p.name + (this.debug ? " [" + p.id + "]" : ""), value: p.id, img: p.img || "systems/wfrp4e/icons/buildings/scroll.png"})), 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Tooltip.Insert"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Title")});
		if (!preset?.length) {return};
		let found = game.wfrp4e.tools.assistant.presets.all.find(p => p.id == preset[0].value);
		if (!found) {return};
		this.params = foundry.utils.deepClone(found.flags.assistant);
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onInsertPreset \"params\"");
			console.debug(this.params);
		};
		let setSelect = (selector, val) => {
			let sel = this.element.querySelector(selector);
			if (!sel) {return};
			sel.value = val;
			sel.querySelectorAll("option").forEach(o => {o.selected = (o.value == val)});
		};
		setSelect("#generateNameSpecies", this.params.generateName.species);
		this.element.querySelectorAll("div#generateNameKeys > div").forEach(k => k.remove());
		this.params.generateName.keys.forEach(k => {
			let div = this.addGenerateNameKeys();
			this.element.querySelector("div#generateNameKeys").appendChild(div);
			div.querySelector("input.key").value = k.value;
			div.querySelector("input.chance").value = k.chance;
		});
		this.element.querySelector("div#generateNameKeys").appendChild(this.element.querySelector("div#generateNameKeys > a[data-action=\"addGenerateNameKeys\"]"));
		this.updateKeys(this.params.generateName.species);
		this.element.querySelector("#randomCharacteristicsStatus").checked = this.params.randomCharacteristics.status;
		this.element.querySelector("#randomTokenSizeStatus").checked = this.params.randomTokenSize.status;
		this.element.querySelector("#deathTintEvenly").checked = this.params.deathTint.evenly;
		this.element.querySelector("#deathTintValue").value = this.params.deathTint.color;
		setSelect("#generateSpellsLore", this.params.generateSpells.lore);
		this.element.querySelector("#generateSpellsCount").value = this.params.generateSpells.count;
		this.element.querySelector("#generateSpellsArcane").checked = this.params.generateSpells.arcane;
		setSelect("#dispositionValue", this.params.disposition.value);
		setSelect("#reactionsSpecies", this.params.reactions.species);
		this.checkSubspecies(this.params.reactions.species);
		setSelect("#reactionsSubspecies", this.params.reactions.subspecies);
		setSelect("#reactionsFrequency", this.params.reactions.frequency);
		//Возвращаем предметы из старых наборов обратно в общий список актёра перед очисткой
		let baseItemsContainer = this.element.querySelector("li#presets > div.body.items");
		if (baseItemsContainer) {
			this.element.querySelectorAll("li#presets > ul a.drag-item").forEach(el => baseItemsContainer.appendChild(el));
		};
		this.element.querySelector("li#presets > ul").innerHTML = "";
		this.params.presets.forEach(p => {
			let li = this.createPreset();
			this.element.querySelector("li#presets > ul").appendChild(li);
			li.querySelector("input[name='replaceTokens']").value = p.replaceTokens;
			["ws", "bs", "s", "t", "i", "ag", "dex", "int", "wp", "fel"].forEach(c => {
				li.querySelector("input[data-characteristic='" + c + "']").value = p.characteristics[c] || 0;
			});
			li.querySelector("input[name='weight']").value = p.weight;
			p.replaceKeys.forEach(k => {
				let div = this.addGenerateNameKeys();
				li.querySelector("div.replaceKeys").appendChild(div);
				div.querySelector("input.key").value = k.value;
				div.querySelector("input.chance").value = k.chance;
			});
			li.querySelector("div.replaceKeys").appendChild(li.querySelector("div.replaceKeys > a[data-action=\"addGenerateNameKeys\"]"));
		});
		this.updateKeys(this.params.generateName.species);
		this.dragDrop.forEach((d) => d.bind(this.element));
		if (this.debug) {
			console.debug(...debugMessage, "AssistantMenu _onInsertPreset \"element\"");
			console.debug(this.element);
		};
	};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
	let debug = game.settings.get("wfrp4e-tools", "debug");
	let actor = sheet.document;
	if (debug) {
		console.debug(...debugMessage, "renderActorSheetV2 \"actor\"");
		console.debug(actor);
	};
	//Списки заклинаний
	if (actor.hasSpells && actor.flags?.assistant?.spellsFilter) {
		let spellsFilter = foundry.utils.deepClone(actor.flags.assistant.spellsFilter);
		let spellsHeader = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-header>.list-name");
		let spellsListContent = html.querySelector("section[data-tab='magic']>.sheet-list.spells>.list-content");
		if (spellsHeader && spellsListContent) {
			//Функция обновления отображения Заклинаний
			function updateSpells(button) {
				if (spellsFilter.page >= spellsFilter.list.length) {spellsFilter.page = -1};
				if (spellsFilter.page == -1) {
					button.innerHTML = "<i class='fas fa-list'></i>";
					button.dataset.tooltip = `<h6 style="text-align: center;">${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.All")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB1")}`;
				} else {
					button.innerHTML = `<i class="${spellsFilter.list[spellsFilter.page]?.icon}"></i>`;
					button.dataset.tooltip = `<h6 style="text-align: center;">${spellsFilter.list[spellsFilter.page]?.name}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}<br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.RMB2")}`;
				};
				let spells = spellsListContent.children;
				for (let i = 0; i < spells.length; i++) {
					if (spellsFilter.page != -1 && !spellsFilter.list[spellsFilter.page]?.spells.includes(spells[i].dataset.uuid)) {spells[i].style.display = "none"}
					else {spells[i].style.display = "flex"};
				};
			};
			//Создание кнопки
			let spellsButton = document.createElement("a");
			spellsButton.classList.add("list-button");
			spellsButton.dataset.action = "spellsFilter";
			spellsButton.dataset.tooltip = "";
			spellsHeader.insertAdjacentElement("afterbegin", spellsButton);
			updateSpells(spellsButton);
			//ЛКМ
			spellsButton.addEventListener("click", function() {
				let page = spellsFilter.page;
				if (page < spellsFilter.list.length - 1) {page++}
				else {page = -1};
				spellsFilter.page = page;
				actor.update({"flags.assistant.spellsFilter.page": page});
				updateSpells(spellsButton);
			});
			//ПКМ
			spellsButton.addEventListener("contextmenu", async function(e) {
				e.preventDefault();
				if (spellsFilter.page != -1) {
					let spellsLists = actor.itemTypes.spell.filter(s => s.lore.value != "petty").map(s => ({name: s.name, img: s.img, uuid: s.uuid}));
					let dialogResult = await ItemDialog.create(spellsLists, spellsLists.length, {text: game.i18n.format("WFRP4E.Assistant.spellsFilter.Description", {name: spellsFilter.list[spellsFilter.page].name}), title: spellsFilter.list[spellsFilter.page].name});
					if (!dialogResult?.length) {return};
					spellsFilter.list[spellsFilter.page].spells = dialogResult.map(s => s.uuid);
					await actor.update({"flags.assistant.spellsFilter.list": spellsFilter.list});
					updateSpells(spellsButton);
				} else {
					let categories = new foundry.applications.api.DialogV2({
						window: {title: game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Title")},
						content: spellsFilter.list.map(c => ""
							+ "<div style='display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgoldenrod;'>"
							+ "\n\t<input style='width: 30%;' type='string' data-tooltip='"
							+ game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon")
							+ "' value='" + foundry.utils.escapeHTML(c.icon) + "'>"
							+ "\n\t<input style='width: 70%;' data-tooltip='"
							+ game.i18n.localize("Name")
							+ "' type='string' data-spells='" + c.spells.join(",")
							+ "' value='" + foundry.utils.escapeHTML(c.name) + "'>"
							+ "\n\t<a data-action='removeCategories' data-tooltip='"
							+ game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Remove")
							+ "'>\n\t\t<i class='fas fa-trash'></i>\n\t</a>\n</div>"
						).join("") + "<a style='width: max-content;' data-action='addCategories' data-tooltip='" + game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Add") + "'><i class='fas fa-plus'></i></a>",
						buttons: [{
							action: "save",
							icon: "fas fa-save",
							label: "Save",
							default: true,
							callback: (event, button, dialog) => {
								let list = [];
								dialog.element.querySelector("div.dialog-content").querySelectorAll("div").forEach(div => {
									let iconInput = div.querySelector("input:nth-child(1)");
									let nameInput = div.querySelector("input:nth-child(2)");
									if (iconInput && nameInput) {
										list.push({name: nameInput.value, icon: iconInput.value, spells: nameInput.dataset.spells ? nameInput.dataset.spells.split(",") : []});
									};
								});
								actor.update({
									"flags.assistant.spellsFilter.page": -1,
									"flags.assistant.spellsFilter.list": list
								});
								spellsFilter.page = -1;
								spellsFilter.list = list;
								updateSpells(spellsButton);
							}
						}]
					});
					await categories.render(true);
					function removeClick(element) {
						element.addEventListener("click", async function() {
							let confirm = await foundry.applications.api.DialogV2.confirm({
								window: {title: game.i18n.localize("Confirm")},
								content: game.i18n.format("WFRP4E.Assistant.spellsFilter.Categories.RemoveConfirm", {name: element.previousElementSibling.value})
							});
							if (confirm) {element.parentElement.remove()};
						});
					};
					categories.element.querySelector("a[data-action='addCategories']").addEventListener("click", function() {
						this.insertAdjacentHTML("beforebegin", ""
							+ "<div style='display: flex; align-items: center; justify-content: space-between; padding: 2px; border-radius: 2px; background: darkgreen;'>"
							+ "\n\t<input style='width: 30%;' data-tooltip='" + game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Icon") + "' type='string' value='fas fa-ellipsis'>"
							+ "\n\t<input style='width: 70%;' data-tooltip='" + game.i18n.localize("Name") + "' type='string' data-spells='' value='" + game.i18n.localize("Name") + "'>"
							+ "\n\t<a data-action='removeCategories' data-tooltip='" + game.i18n.localize("WFRP4E.Assistant.spellsFilter.Categories.Remove") + "'>\n\t\t<i class='fas fa-trash'></i>\n\t</a>\n</div>"
						);
						removeClick(categories.element.querySelector("div.dialog-content > div:last-of-type > a[data-action='removeCategories']"));
					});
					categories.element.querySelectorAll("a[data-action='removeCategories']").forEach(removeClick);
				};
			});
		};
		//Скрытие простейших заклинаний
		let pettyHeader = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-header>.list-name");
		let pettyListContent = html.querySelector("section[data-tab='magic']>.sheet-list.petty>.list-content");
		if (pettyHeader && pettyListContent) {
			function updatePetty(button) {
				if (spellsFilter.petty) {
					button.innerHTML = "<i class='fas fa-eye-slash'></i>";
					button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Hide")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
				} else {
					button.innerHTML = "<i class='fas fa-eye'></i>";
					button.dataset.tooltip = `<h6 style='text-align: center;'>${game.i18n.localize("Show")}</h6><br>${game.i18n.localize("WFRP4E.Assistant.spellsFilter.Hint.LMB")}`;
				};
				let spells = pettyListContent.children;
				for (let i = 0; i < spells.length; i++) {
					spells[i].style.display = spellsFilter.petty ? "flex" : "none";
				};
			};
			pettyHeader.insertAdjacentHTML("afterbegin", `<a class="list-button" data-action="hidePetty"></a>`);
			let pettyButton = pettyHeader.querySelector("a[data-action='hidePetty']");
			updatePetty(pettyButton);
			pettyButton.addEventListener("click", function() {
				spellsFilter.petty = !spellsFilter.petty;
				actor.update({"flags.assistant.spellsFilter.petty": spellsFilter.petty});
				updatePetty(pettyButton);
			});
		};
	};
});

Hooks.on("getHeaderControlsActorSheetV2", async (sheet, controls) => {
	let debug = game.settings.get("wfrp4e-tools", "debug");
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
			onClick: () => {game.wfrp4e.tools.AssistantMenu.create(actor)},
		});
	};
});

function normalizeParams(params) {
	let newParams = {};
	//Случайное имя
	newParams.generateName = {
		species: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.Species).concat("disabled").includes(params?.generateName?.species) ? params?.generateName?.species : "disabled",
		keys: Array.isArray(params?.generateName?.keys) ? params?.generateName?.keys.filter(k => k.value && k.chance > 0) : []
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
		evenly: typeof params?.deathTint?.evenly === "boolean" ? params?.deathTint?.evenly : true,
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
		subspecies: Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species).map(s => Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.Reactions.Species[s]?.Subspecies || {})).flat(1).concat("Not").includes(params?.reactions?.subspecies) ? params?.reactions?.subspecies : "Not",
		frequency: ["0", "25", "50", "75", "100"].includes(params?.reactions?.frequency) ? params?.reactions?.frequency : "75"
	};
	//Шаблоны
	newParams.presets = [];
	if (Array.isArray(params?.presets)) {
		params.presets?.forEach(p => {
			let preset = {
				replaceTokens: typeof p?.replaceTokens === "string" ? p.replaceTokens : "",
				characteristics: {
					ws: !Number.isNaN(Number(p?.characteristics?.ws)) ? String(Number(p.characteristics.ws)) : "0",
					bs: !Number.isNaN(Number(p?.characteristics?.bs)) ? String(Number(p.characteristics.bs)) : "0",
					s: !Number.isNaN(Number(p?.characteristics?.s)) ? String(Number(p.characteristics.s)) : "0",
					t: !Number.isNaN(Number(p?.characteristics?.t)) ? String(Number(p.characteristics.t)) : "0",
					i: !Number.isNaN(Number(p?.characteristics?.i)) ? String(Number(p.characteristics.i)) : "0",
					ag: !Number.isNaN(Number(p?.characteristics?.ag)) ? String(Number(p.characteristics.ag)) : "0",
					dex: !Number.isNaN(Number(p?.characteristics?.dex)) ? String(Number(p.characteristics.dex)) : "0",
					int: !Number.isNaN(Number(p?.characteristics?.int)) ? String(Number(p.characteristics.int)) : "0",
					wp: !Number.isNaN(Number(p?.characteristics?.wp)) ? String(Number(p.characteristics.wp)) : "0",
					fel: !Number.isNaN(Number(p?.characteristics?.fel)) ? String(Number(p.characteristics.fel)) : "0"
				},
				weight: String(Number(p.weight)) != "NaN" ? String(Number(p.weight)) : "1",
				replaceKeys: Array.isArray(p?.replaceKeys) ? p.replaceKeys?.filter(k => k.value && k.chance > 0) : [],
				items: []
			};
			if (Array.isArray(p.items)) {
				p.items?.forEach(i => {
					let item = fromUuidSync(i.uuid) || false;
					if (item) {
						preset.items.push({uuid: item.uuid, name: item.name, quantity: {value: item.system?.quantity?.value ?? 1}});
					};
				});
			} else {preset.items = []};
			newParams.presets.push(preset);
		});
	};
	//Версия
	newParams.version = game.modules.get("wfrp4e-assistant").version;
	return newParams;
};

async function updateToggleReactions(event, active) {
	if (!game.user.isGM) {return};
	let nextState = typeof active === "boolean" ? active : !game.settings.get("wfrp4e-assistant", "reactionsEnabled");
	await game.settings.set("wfrp4e-assistant", "reactionsEnabled", nextState);
	if (game.settings.get("wfrp4e-tools", "debug")) {
		console.debug(...debugMessage, "updateToggleReactions \"reactionsEnabled\"");
		console.debug(game.settings.get("wfrp4e-assistant", "reactionsEnabled"));
	};
};

class TokenPresets extends HandlebarsApplicationMixin(ApplicationV2) {
	static DEFAULT_OPTIONS = {
		classes: ["wfrp4eAssistant-tokenPresets", "wfrp4eTools", "warhammer"],
		window: {
			icon: "fas fa-users",
			resizable: true,
			contentClasses: ["standard-form"]
		},
		actions: {
			save: this._onSave,
			load: this._onLoad,
			remove: this._onRemove,
			delete: this._onDelete
		}
	};

	static PARTS = {
		form: {
			template: "modules/wfrp4e-assistant/templates/tokenPresets/app.hbs",
		},
		footer: {
			template: "modules/wfrp4e-tools/templates/form-footer.hbs"
		}
	};

	constructor(debug, options) {
		super(options);
		this.debug = debug;
		this.scene = game.scenes.current;
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets constructor \"this\"");
			console.debug(this);
		};
	};

	async _onRender(context) {
		this.element.querySelectorAll("li input[type='text']").forEach(i => {
			i.addEventListener("change", async (e) => {
				let preset = this.list.find(p => p.id == i.closest("li").dataset.id);
				preset.name = e.target.value;
				if (this.debug) {
					console.debug(...debugMessage, "TokenPresets preset:change \"preset\"");
					console.debug(preset);
				};
				this.list = this.list.map(p => p.id == i.closest("li").dataset.id ? preset : p);
				if (this.debug) {
					console.debug(...debugMessage, "TokenPresets preset:change \"list\"");
					console.debug(this.list);
				};
				await this.scene.update({"flags.tokenPresets": normalizeTokenPresets({list: this.list})});
				this.render();
			});
		});
	};

	async _prepareContext(options) {
		let context = await super._prepareContext(options);
		context.debug = this.debug;
		context.scene = this.scene;
		this.list = foundry.utils.deepClone(context.scene.flags.tokenPresets?.list || []);
		context.list = this.list;
		if (!context.list?.length || this.debug) {
			await this.scene.update({"flags.tokenPresets": normalizeTokenPresets({list: this.list})});
			context.scene = this.scene;
			this.list = this.scene.flags.tokenPresets?.list || [];
			context.list = this.list;
		};
		context.buttons = [
			{
				icon: "fas fa-refresh",
				action: "remove",
				label: "WFRP4E.Assistant.TokenPresets.Actions.Remove.Title",
				tooltip: "WFRP4E.Assistant.TokenPresets.Actions.Remove.Tooltip"
			},
			{
				icon: "fas fa-plus",
				action: "load",
				label: "WFRP4E.Assistant.TokenPresets.Actions.Load.Title",
				tooltip: "WFRP4E.Assistant.TokenPresets.Actions.Load.Tooltip"
			},
			{
				icon: "fas fa-save",
				action: "save",
				default: true,
				label: "WFRP4E.Assistant.TokenPresets.Actions.Save.Title",
				tooltip: "WFRP4E.Assistant.TokenPresets.Actions.Save.Tooltip"
			}
		];
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets _prepareContext \"context\"");
			console.debug(context);
		};
		return context;
	};

	static async create(options={}) {
		if (!game.scenes.current) {return};
		this.debug = game.settings.get("wfrp4e-tools", "debug");
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets create");
		};
		//Проверка на наличие активного окна генератора
		if (document.querySelector("div.wfrp4eTools.wfrp4eAssistant-tokenPresets." + game.scenes.current.uuid.replaceAll(".", "\\."))) {
			document.querySelector("div.wfrp4eTools.wfrp4eAssistant-tokenPresets." + game.scenes.current.uuid.replaceAll(".", "\\.")).style.zIndex = ++ApplicationV2._maxZ;
			return;
		};
		//Определение названия шапки шаблона в соответствии с типом
		options.window = {title: game.scenes.current.name + (this.debug ? " [ID: " + game.scenes.current.uuid + "]" : "")};
		//Определение класса, содержащего uuid актёра
		options.classes = [game.scenes.current.uuid];
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets create \"options\"");
			console.debug(options);
		};
		return new Promise(resolve => {
			options.resolve = resolve;
			new this(this.debug, options).render({force: true});
		});
	};

	static async _onSave() {
		let name = await foundry.applications.api.DialogV2.prompt({
			window: {title: "WFRP4E.Assistant.TokenPresets.Dialog.SelectName"},
			content: "<input name='name' type='text' autofocus>",
			ok: {
				label: game.i18n.localize("Submit"),
				callback: (event, button, dialog) => {return button.form.elements.name.value}
			}
		});
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets _onSave \"name\"");
			console.debug(name);
		};
		if (!name) {return};
		let list = {name};
		list.tokens = this.scene.tokens.map(t => t.toObject());
		this.list.push(list);
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets _onSave \"list\"");
			console.debug(this.list);
		};
		await this.scene.update({"flags.tokenPresets": normalizeTokenPresets({list: this.list})});
		this.render();
	};

	static async _onLoad(button) {
		let checked = Array.from(this.element.querySelectorAll("li:has(> input[type='checkbox']:checked)"));
		if (!checked.length) {return};
		if (button.altKey) {
			await this.removeTokens();
		} else {
			let choice = await foundry.applications.api.DialogV2.confirm({
				window: {title: "WFRP4E.Assistant.TokenPresets.Actions.Load.Dialog.Title"},
				content: game.i18n.localize("WFRP4E.Assistant.TokenPresets.Actions.Load.Dialog.Tooltip"),
				yes: {
					icon: "fas fa-check",
					label: "WFRP4E.Assistant.TokenPresets.Actions.Load.Dialog.Remove",
					callback: () => "remove"
				},
				no: {
					icon: "fas fa-xmark",
					label: "WFRP4E.Assistant.TokenPresets.Actions.Load.Dialog.NotRemove",
					callback: () => "keep"
				}
			});
			//Если диалог закрыли крестиком — прерываем загрузку
			if (!choice) {return};
			if (choice === "remove") {await this.removeTokens()};
		};
		let presetId = game.wfrp4e.tools.randomArrayElement(checked).dataset.id;
		let preset = this.list.find(p => p.id == presetId);
		if (!preset) {return};
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets _onLoad \"preset\"");
			console.debug(preset);
		};
		let spawnTokens = preset.tokens
			.filter(t => game.actors.get(t.actorId) && game.actors.get(t.actorId).type != "character" && !t.actorLink)
			.map(t => {
				let copy = foundry.utils.deepClone(t);
				delete copy._id;
				return copy;
			});
		if (spawnTokens.length) {await this.scene.createEmbeddedDocuments("Token", spawnTokens)};
		let uniqueTokens = preset.tokens.filter(t => game.actors.get(t.actorId)?.type == "character" || t.actorLink);
		for (let token of uniqueTokens) {
			let sToken = this.scene.tokens.get(token._id);
			if (sToken) {await sToken.update(token)};
		};
	};

	static async _onRemove() {
		let confirm = await foundry.applications.api.DialogV2.confirm({
			window: {title: "WFRP4E.Assistant.TokenPresets.Actions.Remove.Dialog.Title"},
			content: game.i18n.localize("WFRP4E.Assistant.TokenPresets.Actions.Remove.Dialog.Tooltip")
		});
		if (confirm) {await this.removeTokens()};
	};

	async removeTokens() {
		let ids = this.scene.tokens.filter(t => t.actor?.type != "character" && !t.actorLink).map(t => t.id);
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets removeTokens \"ids\"");
			console.debug(ids);
		};
		if (ids.length) {
			await this.scene.deleteEmbeddedDocuments("Token", ids);
		};
	};

	static async _onDelete(button) {
		this.list = this.list.filter(p => p.id != button.target.closest("li").dataset.id);
		if (this.debug) {
			console.debug(...debugMessage, "TokenPresets _onDelete \"list\"");
			console.debug(this.list);
		};
		await this.scene.update({"flags.tokenPresets": normalizeTokenPresets({list: this.list})});
		this.render();
	};

	async close(options) {
		this.options.resolve?.();
		return super.close(options);
	};
};

function normalizeTokenPresets(preset) {
	let debug = game.settings.get("wfrp4e-tools", "debug");
	if (debug) {
		console.debug(...debugMessage, "normalizeTokenPresets \"preset\"");
		console.debug(preset);
	};
	let newPreset = {list: []};
	if (Array.isArray(preset?.list)) {
		let i = 1;
		preset.list?.forEach(p => {
			let elem = {
				name: typeof p.name === "string" ? p.name : game.i18n.localize("WFRP4E.Assistant.TokenPresets.Name"),
				id: typeof p.id === "string" && p.id ? p.id : foundry.utils.randomID(),
				tokens: []
			};
			if (Array.isArray(p.tokens)) {
				p.tokens?.forEach(t => {
					if (typeof t === "object") {
						elem.tokens.push(t);
					};
				});
			};
			newPreset.list.push(elem);
			if (debug) {
				console.debug(...debugMessage, "normalizeTokenPresets ", i, " \"elem\"");
				console.debug(elem);
			};
			i++;
		});
	};
	//Версия
	newPreset.version = game.modules.get("wfrp4e-assistant").version;
	if (debug) {
		console.debug(...debugMessage, "normalizeTokenPresets \"newPreset\"");
		console.debug(newPreset);
	};
	return newPreset;
};

Hooks.on("canvasInit", (canvas) => {
	let currentUuid = game.scenes.current?.uuid;
	for (let app of foundry.applications.instances.values()) {
		if (app instanceof TokenPresets && (!currentUuid || app.scene?.uuid !== currentUuid)) {
			app.close();
		};
	};
});

Hooks.on("createToken", async (token, options, user) => {
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && token.actor?.flags?.assistant && user == game.user.id) {
		let debug = game.settings.get("wfrp4e-tools", "debug");
		if (debug) {
			console.debug(...debugMessage, "createToken \"token\", \"options\", \"user\"");
			console.debug(token);
			console.debug(options);
			console.debug(user);
		};
		let actor = token.actor;
		let data = {
			actor: {},
			token: {
				texture: {}
			},
			texture: ""
		};
		if (debug) {
			console.debug(...debugMessage, "createToken \"actor\"");
			console.debug(actor);
		};
		let params = foundry.utils.deepClone(actor.flags.assistant);
		if (debug) {
			console.debug(...debugMessage, "createToken \"params\"");
			console.debug(params);
		};
		game.wfrp4e.tools.assistant.bubbles.push(actor.uuid);
		if (params?.generateName?.species != "disabled" && !actor.prototypeToken.actorLink) {
			let keys = [];
			let speciesKeys = Array.isArray(params.generateName?.keys)
				? params.generateName.keys
				: (typeof params.generateName?.keys === "string" ? params.generateName.keys.split(",").filter(Boolean).map(v => ({value: v.trim(), chance: 100})) : []);
			for (let i = 0; i < speciesKeys.length; i++) {
				if ((await new Roll("1d100").roll()).total <= speciesKeys[i].chance) {
					keys.push(speciesKeys[i].value);
				};
			};
			if (keys.length) {
				let name = game.wfrp4e.tools.generateName(params.generateName.species, keys.join(","));
				if (name && name !== game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Nothing")) {
					data.actor.name = name;
					data.token.name = name.split(" ")[0];
					if (debug) {
						console.debug(...debugMessage, "createToken generateName \"name\"");
						console.debug(name);
					};
				};
			};
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
			let spells = await warhammer.utility.findAllItems("spell", game.i18n.localize("WFRP4E.Tools.Search"), true, ["uuid", "system.lore.value"]);
			spells = spells.filter(s => s.system.lore.value == params.generateSpells.lore || (params.generateSpells.arcane && s.system.lore.value == ""));
			let resultSpells = [];
			for (let i = Math.min(params.generateSpells.count, spells.length); i > 0; i--) {
				let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
				let spell = await fromUuid(spells[result].uuid);
				resultSpells.push(spell);
				spells.splice(result, 1);
			};
			if (debug) {
				console.debug(...debugMessage, "createToken generateSpells \"resultSpells\"");
				console.debug(resultSpells);
			};
			await actor.createEmbeddedDocuments("Item", resultSpells, {broadcast: false, onReset: true});
			params.generateSpells.lore = "disabled";
		};
		if (params?.disposition) {
			switch (params.disposition.value) {
				case "4": {
					let choice = await ItemDialog.create([{name: game.i18n.localize("TOKEN.DISPOSITION.NEUTRAL"), value: 0}, {name: game.i18n.localize("TOKEN.DISPOSITION.FRIENDLY"), value: 1}, {name: game.i18n.localize("TOKEN.DISPOSITION.HOSTILE"), value: -1}, {name: game.i18n.localize("TOKEN.DISPOSITION.SECRET"), value: -2}], 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Tooltip"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Label")}) || [];
					if (choice.length) {data.token.disposition = choice[0]?.value};
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
						if (params.generateName?.species != "disabled" && preset.replaceKeys.length && !actor.prototypeToken.actorLink) {
							let keys = [];
							let speciesKeys = preset.replaceKeys;
							for (let i = 0; i < speciesKeys.length; i++) {
								if ((await new Roll("1d100").roll()).total <= speciesKeys[i].chance) {
									keys.push(speciesKeys[i].value);
								};
							};
							if (keys.length) {
								let name = game.wfrp4e.tools.generateName(params.generateName.species, keys.join(","));
								if (name && name !== game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.Nothing")) {
									data.actor.name = name;
									data.token.name = name.split(" ")[0];
									if (debug) {
										console.debug(...debugMessage, "createToken presets generateName \"name\"");
										console.debug(name);
									};
								};
							};
						};
						if (preset.replaceTokens) {
							let path = actor.prototypeToken.texture.src.substring(0, actor.prototypeToken.texture.src.lastIndexOf("/") + 1);
							try {
								let res = await foundry.applications.apps.FilePicker.implementation.browse("data", path);
								let pattern = "^" + preset.replaceTokens.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replaceAll("*", ".*") + "$";
								let regex = new RegExp(pattern);
								let files = (res?.files || []).filter(f => regex.test(decodeURIComponent(f.split("/").at(-1))));
								if (files.length) {data.texture = game.wfrp4e.tools.randomArrayElement(files)};
							} catch (e) {
								if (debug) {console.warn(...debugMessage, "createToken presets replaceTokens error:", e)};
							};
						};
						if (data.actor.system?.characteristics) {
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
						let deleteIds = [...new Set(
							params.presets
								.filter(p => p != preset)
								.flatMap(p => p.items.map(i => foundry.utils.parseUuid(i.uuid)?.id))
								.filter(id => id && actor.items.has(id))
						)];
						if (deleteIds.length) {await actor.deleteEmbeddedDocuments("Item", deleteIds, {onReset: true})};
						break;
					};
				};
				params.presets = [];
			};
		};
		params.generateName.species = "disabled";
		if (actor.system.status.wounds.value < actor.system.status.wounds.max) {
			let baseColor = actor.prototypeToken.texture.tint?.css || "#FFFFFF";
			let color = baseColor;
			if (actor.system.status.wounds.value <= 0) {
				color = params.deathTint.color;
			} else if (params.deathTint.evenly && actor.system.status.wounds.max > 0) {
				let ratio = Math.min(1, Math.max(0, (actor.system.status.wounds.max - actor.system.status.wounds.value) / actor.system.status.wounds.max));
				color = game.wfrp4e.tools.colorBetween(baseColor, params.deathTint.color, Math.trunc(ratio * 100) / 100);
			};
			if (debug) {
				console.debug(...debugMessage, "updateActor \"color\"");
				console.debug(color);
			};
			data.token.texture.tint = color;
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
		if (data.texture) {
			data.actor.img = data.texture || token.texture.src || actor.img;
			data.token.texture.src = data.texture;
		};
		await actor.update(data.actor, {onReset: true});
		await token.update(data.token);
		setTimeout(() => {
			let index = game.wfrp4e.tools.assistant.bubbles.indexOf(actor.uuid);
			if (index > -1) {game.wfrp4e.tools.assistant.bubbles.splice(index, 1)};
		}, 2000);
	};
});

Hooks.on("updateActor", async (actor, args, options, user) => {
	if (user == game.user.id && game.settings.get("wfrp4e-assistant", "enableHelpers") && actor.flags.assistant) {
		let debug = game.settings.get("wfrp4e-tools", "debug");
		if (debug) {
			console.debug(...debugMessage, "updateActor \"actor\", \"args\", \"options\", \"user\"");
			console.debug(actor);
			console.debug(args);
			console.debug(options);
			console.debug(user);
		};
		let params = actor.flags.assistant;
		if (debug) {
			console.debug(...debugMessage, "updateActor \"params\"");
			console.debug(params);
		};
		if (args.system?.status?.wounds) {
			let baseColor = actor?.prototypeToken?.texture?.tint?.css || "#FFFFFF";
			let color = baseColor;
			let tokenSort = 0;
			if (actor.system.status.wounds.value <= 0) {
				color = params.deathTint.color;
				tokenSort = -100;
				if (actor.type != "character" && game.modules.get("healthEstimate")?.active && game.healthEstimate?.NPCsJustDie) {
					if (((actor.token && !actor.token?.flags?.healthEstimate?.dontMarkDead) || (!actor.token && !actor.prototypeToken.flags?.healthEstimate?.dontMarkDead)) && !actor.hasCondition("dead")) {
						await actor.addCondition("dead");
					};
				};
			} else {
				if (params.deathTint.evenly && actor.system.status.wounds.max > 0) {
					let ratio = Math.min(1, Math.max(0, (actor.system.status.wounds.max - actor.system.status.wounds.value) / actor.system.status.wounds.max));
					color = game.wfrp4e.tools.colorBetween(baseColor, params.deathTint.color, Math.trunc(ratio * 100) / 100);
				};
				if (actor.hasCondition("dead")) {
					await actor.removeCondition("dead");
				};
			};
			if (debug) {
				console.debug(...debugMessage, "updateActor \"color\"");
				console.debug(color);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).total) {
					if (options.deltaWounds < 0) {
						let actorData = {name: actor.name, id: actor.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
						actorData.tokens = AssistantUtility.getActorTokens(actor);
						let action = actor.system.status.wounds.value <= 0 ? "die" : "takeDamage";
						if (actorData.tokens.length) {await game.wfrp4e.tools.getReaction(actorData, false, action, false)};
					};
				};
			};
			let tokens = AssistantUtility.getActorTokens(actor);
			for (let token of tokens) {
				await token.update({"texture.tint": color, sort: tokenSort});
			};
		};
	};
});

Hooks.on("wfrp4e:opposedTestResult", async (opposedTest, attackerTest, defenderTest) => {
	let debug = game.settings.get("wfrp4e-tools", "debug");
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && attackerTest?.damage != undefined) {
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
		if (attacker?.flags?.assistant) {
			let params = attacker.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).total) {
					let actorData = {name: attacker.name, id: attacker.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = AssistantUtility.getActorTokens(attacker);
					let target = {species: "", subspecies: ""};
					let defActor = defenderTest?.actor || opposedTest.defender?.actor || opposedTest.defender;
					if (defActor?.flags?.assistant) {
						target.species = defActor.flags.assistant.reactions.species || "";
						target.subspecies = defActor.flags.assistant.reactions.subspecies || "";
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
					if (actorData.tokens.length) {await game.wfrp4e.tools.getReaction(actorData, target, action, false)};
				};
			};
		};
		let defender = defenderTest?.actor;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:opposedTestResult \"defender\"");
			console.debug(defender);
		};
		if (defender?.flags?.assistant) {
			let params = defender.flags.assistant;
			if (debug) {
				console.debug(...debugMessage, "wfrp4e:opposedTestResult attacker \"params\"");
				console.debug(params);
			};
			if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
				if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).total) {
					let actorData = {name: defender.name, id: defender.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
					actorData.tokens = AssistantUtility.getActorTokens(defender);
					let target = {species: "", subspecies: ""};
					if (attacker?.flags?.assistant) {
						target.species = attacker.flags.assistant.reactions.species || "";
						target.subspecies = attacker.flags.assistant.reactions.subspecies || "";
					};
					let action;
					if (opposedTest.result.winner == "defender") {action = "opposedDefenderSuccess"}
					else {action = "opposedDefenderFailure"};
					if (debug) {
						console.debug(...debugMessage, "wfrp4e:opposedTestResult defender \"actorData\", \"target\", \"action\"");
						console.debug(actorData);
						console.debug(target);
						console.debug(action);
					};
					if (actorData.tokens.length) {await game.wfrp4e.tools.getReaction(actorData, target, action, false)};
				};
			};
		};
	} else if (debug) {
		console.debug(...debugMessage, "wfrp4e:opposedTestResult false");
	};
});

Hooks.on("wfrp4e:applyDamage", async (args) => {
	let debug = game.settings.get("wfrp4e-tools", "debug");
	if (debug) {
		console.debug(...debugMessage, "wfrp4e:applyDamage \"args\"");
		console.debug(args);
	};
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && args?.attacker?.flags?.assistant) {
		let attacker = args.attacker;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:applyDamage " ," \"attacker\"");
			console.debug(attacker);
		};
		let params = attacker.flags.assistant;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:applyDamage " ," attacker \"params\"");
			console.debug(params);
		};
		if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
			if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).total) {
				let actorData = {name: attacker.name, id: attacker.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
				actorData.tokens = AssistantUtility.getActorTokens(attacker);
				let target = {species: "", subspecies: ""};
				if (args?.actor?.flags?.assistant) {
					target.species = args.actor.flags.assistant.reactions.species || "";
					target.subspecies = args.actor.flags.assistant.reactions.subspecies || "";
				};
				let action;
				let location = false;
				if (args.actor.system.status.wounds.value <= args.totalWoundLoss) {action = "kill"}
				else {
					let hitLoc = (args.opposedTest?.result?.hitloc?.value || args.loc || "").toLowerCase();
					if (hitLoc.includes("head")) {location = "Head"}
					else if (hitLoc.includes("body")) {location = "Body"}
					else if (hitLoc.includes("arm")) {location = "Arm"}
					else if (hitLoc.includes("leg")) {location = "Leg"};
					action = "applyDamage";
				};
				if (debug) {
					console.debug(...debugMessage, "wfrp4e:applyDamage " ," attacker \"actorData\", \"target\", \"action\", \"location\"");
					console.debug(actorData);
					console.debug(target);
					console.debug(action);
					console.debug(location);
				};
				if (actorData.tokens.length) {await game.wfrp4e.tools.getReaction(actorData, target, action, location)};
			};
		};
	} else if (debug) {
		console.debug(...debugMessage, "wfrp4e:applyDamage attacker false");
	};
	if (game.settings.get("wfrp4e-assistant", "enableHelpers") && args?.actor?.flags?.assistant) {
		let defender = args.actor;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:applyDamage " ," \"defender\"");
			console.debug(defender);
		};
		let params = defender.flags.assistant;
		if (debug) {
			console.debug(...debugMessage, "wfrp4e:applyDamage " ," defender \"params\"");
			console.debug(params);
		};
		if (params.reactions.species != "disabled" && parseInt(params.reactions.frequency) != 0) {
			if (parseInt(params.reactions.frequency) >= (await new Roll("1d100").roll()).total) {
				let actorData = {name: defender.name, id: defender.uuid, species: params.reactions.species, subspecies: params.reactions.subspecies};
				actorData.tokens = AssistantUtility.getActorTokens(defender);
				let target = {species: "", subspecies: ""};
				if (args?.attacker?.flags?.assistant) {
					target.species = args.attacker.flags.assistant.reactions.species || "";
					target.subspecies = args.attacker.flags.assistant.reactions.subspecies || "";
				};
				let action;
				let location = false;
				if (defender.system.status.wounds.value <= args.totalWoundLoss) {action = "die"}
				else {
					let hitLoc = (args.opposedTest?.result?.hitloc?.value || args.loc || "").toLowerCase();
					if (hitLoc.includes("head")) {location = "Head"}
					else if (hitLoc.includes("body")) {location = "Body"}
					else if (hitLoc.includes("arm")) {location = "Arm"}
					else if (hitLoc.includes("leg")) {location = "Leg"};
					action = "takeDamage";
				};
				if (debug) {
					console.debug(...debugMessage, "wfrp4e:applyDamage " ," \"actorData\", \"target\", \"action\", \"location\"");
					console.debug(actorData);
					console.debug(target);
					console.debug(action);
					console.debug(location);
				};
				if (actorData.tokens.length) {await game.wfrp4e.tools.getReaction(actorData, target, action, location)};
			};
		};
	} else if (debug) {
		console.debug(...debugMessage, "wfrp4e:applyDamage defender false");
	};
	if (game.settings.get("wfrp4e-assistant", "enableInjuries") && args?.attacker && args.totalWoundLoss > 0 && (game.user.isGM || args.actor?.isOwner)) {
		let injury = {system: {}};
		injury.name = args.attacker.name + (args.sourceItem ? (" - " + args.sourceItem.name) : "") + " (" + args.totalWoundLoss + ")";
		injury.img = args.attacker.img || "modules/wfrp4e-core/icons/injuries/amputatednose.png";
		injury.type = "injury";
		injury.system.location = {
			key: args.loc,
			value: game.wfrp4e.config.locations[args.loc]
		};
		injury.system.duration = {
			active: false,
			permanent: true,
			value: "-1"
		};
		injury.system.description = {value: game.i18n.format("WFRP4E.Assistant.Injuries.Description", {actor: args.attacker.link, weapon: args?.sourceItem?.link || "-", wounds: args.totalWoundLoss})};
		await args.actor.createEmbeddedDocuments("Item", [injury], {onReset: true});
	};
});

Hooks.once("init", async () => {
	game.settings.register("wfrp4e-assistant", "enableArcane", {
		scope: "user",
		config: false,
		default: true,
		type: Boolean
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
			if (game.settings.get("wfrp4e-tools", "debug")) {
				console.debug(...debugMessage, "assistantPresets onChange \"value\"");
				console.debug(value);
			};
			game.wfrp4e.tools.assistant.presets.all = game.settings.get("wfrp4e-assistant", "assistantPresets").concat(game.wfrp4e.tools.assistant.presets.default);
			if (game.settings.get("wfrp4e-tools", "debug")) {
				console.debug(...debugMessage, "assistantPresets onChange \"game.wfrp4e.tools.assistant.presets.all\"");
				console.debug(game.wfrp4e.tools.assistant.presets.all);
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
	game.settings.register("wfrp4e-assistant", "reactionsEnabled", {
		scope: "world",
		config: false,
		default: true,
		type: Boolean,
		onChange: (value) => {
			if (game.wfrp4e.tools?.assistant) {game.wfrp4e.tools.assistant.reactions = value};
			let tool = ui.controls?.controls?.wfrp4eTools?.tools?.toggleReactions;
			if (tool) {
				tool.active = value;
				tool.toolclip.items = [
					{paragraph: value ? game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.On") : game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Off")}
				];
			};
			let button = document.querySelector(".ui-control[data-tool='toggleReactions']");
			if (button) {
				button.ariaPressed = String(value);
				if (button.dataset.tooltipHtml) {
					let wrapper = document.createElement("div");
					wrapper.innerHTML = button.dataset.tooltipHtml;
					let p = wrapper.querySelector("p");
					if (p) {
						p.textContent = value ? game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.On") : game.i18n.localize("WFRP4E.Assistant.Helpers.Reactions.Button.Off");
						button.dataset.tooltipHtml = wrapper.innerHTML;
					};
				};
			};
		}
	});
	game.settings.register("wfrp4e-assistant", "enableInjuries", {
		name: game.i18n.localize("WFRP4E.Assistant.Injuries.Settings.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.Injuries.Settings.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	//Настройки для интеграции с WFRP4e Tools
	game.settings.register("wfrp4e-assistant", "debugData", {
		scope: "world",
		config: false,
		default: [
			{
				form: {id: "importExport", template: "modules/wfrp4e-assistant/templates/debug/importExport.hbs"},
				listener: {
					selector: "a.button[data-action=\"importExportAssistant\"]",
					action: "click",
					func: async () => {
						let action = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Action.Title")},
							content: "",
							yes: {
								icon: "fas fa-file-import",
								label: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Action.Import"),
								callback: () => {return "import"}
							},
							no: {
								icon: "fas fa-file-export",
								label: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Action.Export"),
								callback: () => {return "export"}
							}
						});
						if (action == "import") {
							let file = false;
							await foundry.applications.api.DialogV2.prompt({
								window: {title: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.File")},
								content: `<input name="file" type="file" accept=".txt,.json,text/plain,application/json" autofocus>`,
								ok: {
									label: game.i18n.localize("Submit"),
									callback: (event, button, dialog) => {file = button.form.elements.file.files[0]}
								}
							});
							if (file) {
								let parsed;
								try {parsed = JSON.parse(await foundry.utils.readTextFromFile(file))}
								catch (e) {
									game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Error")}, {color: "red"});
									return;
								};
								if (!Array.isArray(parsed)) {
									game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Error")}, {color: "red"});
									return;
								};
								let replace = game.settings.get("wfrp4e-assistant", "assistantPresets").length ? await foundry.applications.api.DialogV2.confirm({
									window: {title: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Replace.Title")},
									content: `${game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Replace.Content")}<span style="font-size: 0.8rem; font-style: italic;">${game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Replace.Hint")}</span>`
								}) : true;
								if (replace === null) {return};
								if (replace) {await game.settings.set("wfrp4e-assistant", "assistantPresets", parsed)}
								else {
									let existing = game.settings.get("wfrp4e-assistant", "assistantPresets");
									let items = parsed.map(p => {
										let copy = foundry.utils.deepClone(p);
										copy.id = foundry.utils.randomID();
										copy.uuid = copy.id;
										return copy;
									});
									await game.settings.set("wfrp4e-assistant", "assistantPresets", existing.concat(items));
								};
								game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Complete")}, {color: "green"});
							};
						} else if (action == "export") {
							let data = game.settings.get("wfrp4e-assistant", "assistantPresets");
							foundry.utils.saveDataToFile(JSON.stringify(data), "text/plain", `${game.i18n.localize("WFRP4E.Assistant.Name")} (${game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.ImportExport.Name")})` + ".txt");
						};
					}
				}
			},
			{
				listener: {
					selector: "a.button[data-action=\"resetAssistant\"]",
					action: "click",
					func: async () => {
						let confirm = await foundry.applications.api.DialogV2.confirm({
							window: {title: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.Reset.Presets")},
							content: `<p>${game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.Reset.Confirm")}</p>`
						});
						if (!confirm) {return};
						await game.settings.set("wfrp4e-assistant", "assistantPresets", []);
						game.wfrp4e.tools.newNotification({text: game.i18n.localize("WFRP4E.Assistant.Debug.Dialog.Reset.Notify")}, {color: "green"});
					}
				}
			}
		],
		type: Array
	});
	game.settings.register("wfrp4e-assistant", "macrosData", {
		scope: "world",
		config: false,
		default: {
			create: [],
			help: [
				{
					id: "GenerateName",
					name: "WFRP4E.Assistant.Macros.GenerateName.Title",
					icon: "fas fa-dice",
					tooltip: "WFRP4E.Assistant.Macros.GenerateName.Hint",
					visible: true,
					func: "(await import('/modules/wfrp4e-assistant/scripts/GenerateName.js')).default",
					module: {
						id: "wfrp4e-assistant",
						name: "WFRP4e - Assistant"
					}
				}
			]
		},
		type: Object
	});
	game.settings.register("wfrp4e-assistant", "controlButtons", {
		scope: "world",
		config: false,
		default: [
			{
				name: "toggleReactions",
				title: "WFRP4E.Assistant.Helpers.Reactions.Button.Title",
				showToolclip: true,
				toolclip: {
					heading: "WFRP4E.Assistant.Helpers.Reactions.Button.Title",
					items: [
						{paragraph: "WFRP4E.Assistant.Helpers.Reactions.Button.On"}
					]
				},
				icon: "fas fa-thought-bubble",
				visible: "gmOnly",
				active: true,
				toggle: true,
				onChange: "game.wfrp4e.tools.updateToggleReactions(event, active)"
			},
			{
				name: "tokenPresets",
				title: "WFRP4E.Assistant.TokenPresets.Title",
				icon: "fas fa-users",
				visible: "gmOnly",
				button: true,
				onChange: "game.wfrp4e.tools.TokenPresets.create()"
			},
		],
		type: Array
	});
});

Hooks.once("wfrp4e:toolsReady", () => {
	game.wfrp4e.tools.registerModule("wfrp4e-assistant");
	game.wfrp4e.tools.generateName = AssistantUtility.generateName;
	game.wfrp4e.tools.getReaction = AssistantUtility.getReaction;
	game.wfrp4e.tools.AssistantMenu = AssistantMenu;
	game.wfrp4e.tools.TokenPresets = TokenPresets;
	game.wfrp4e.tools.updateToggleReactions = updateToggleReactions;
	game.wfrp4e.tools.assistant = {
		bubbles: [],
		reactions: game.settings.get("wfrp4e-assistant", "reactionsEnabled"),
		presets: {
			default: [
				//HumanEmpire
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.HumanEmpire"),
					id: "HumanEmpire",
					uuid: "HumanEmpire",
					img: "systems/wfrp4e/icons/buildings/sigmar_worship.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Empire",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Empire",
								subspecies: "Reiklander",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//HumanBretonnian
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.HumanBretonnian"),
					id: "HumanBretonnian",
					uuid: "HumanBretonnian",
					img: "systems/wfrp4e/icons/buildings/bretonnia_worship.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Bretonnian",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Bretonnian",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//HumanKislev
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.HumanKislev"),
					id: "HumanKislev",
					uuid: "HumanKislev",
					img: "systems/wfrp4e/icons/buildings/kislev_city1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Kislev",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Kislev",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//HumanKislevGospodar
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.HumanKislevGospodar"),
					id: "HumanKislevGospodar",
					uuid: "HumanKislevGospodar",
					img: "systems/wfrp4e/icons/buildings/kislev_city1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Kislev",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Kislev",
								subspecies: "Gospodar",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "GospodarMale", chance: 100},
										{value: "GospodarSurnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "GospodarFemale", chance: 100},
										{value: "GospodarSurnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//HumanKislevUngol
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.HumanKislevUngol"),
					id: "HumanKislevUngol",
					uuid: "HumanKislevUngol",
					img: "systems/wfrp4e/icons/buildings/kislev_city1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Kislev",
								keys: [
									{value: "Ungol", chance: 100}
								]
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Kislev",
								subspecies: "Ungol",
								frequency: "75"
							},
							presets: []
						}
					}
				},
				//Halfling
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Halfling"),
					id: "Halfling",
					uuid: "Halfling",
					img: "systems/wfrp4e/icons/buildings/food.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Halfling",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Halfling",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//Dwarf
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Dwarf"),
					id: "Dwarf",
					uuid: "Dwarf",
					img: "systems/wfrp4e/icons/buildings/dwarf_hold1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Dwarf",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Dwarf",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100},
										{value: "Moniker", chance: 50}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100},
										{value: "Moniker", chance: 25}
									],
									items: []
								},
							]
						}
					}
				},
				//Elf
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Elf"),
					id: "Elf",
					uuid: "Elf",
					img: "systems/wfrp4e/icons/buildings/welves1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Elf",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Elf",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Surnames", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//Ogre
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Ogre"),
					id: "Ogre",
					uuid: "Ogre",
					img: "systems/wfrp4e/icons/buildings/mountains1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Ogre",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#960000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Ogre",
								subspecies: "Not",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Moniker", chance: 100},
										{value: "BigName", chance: 25}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Moniker", chance: 100},
										{value: "BigName", chance: 25}
									],
									items: []
								},
							]
						}
					}
				},
				//Beast
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Beast"),
					id: "Beast",
					uuid: "Beast",
					img: "systems/wfrp4e/icons/buildings/cave1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Beast",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#4b0000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
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
								species: "Beast",
								subspecies: "Not",
								frequency: "75"
							},
							presets: []
						}
					}
				},
				//Ork
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Ork"),
					id: "Ork",
					uuid: "Ork",
					img: "systems/wfrp4e/icons/buildings/orcs.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Ork",
								keys: [
									{value: "Name", chance: 100},
									{value: "Moniker", chance: 100}
								]
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#009600"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
							},
							disposition: {
								value: "-1"
							},
							spellsFilter: {
								page: -1,
								list: [],
								petty: true
							},
							reactions: {
								species: "Greenskin",
								subspecies: "Ork",
								frequency: "75"
							},
							presets: []
						}
					}
				},
				//Goblin
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Goblin"),
					id: "Goblin",
					uuid: "Goblin",
					img: "systems/wfrp4e/icons/buildings/orc_city.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Goblin",
								keys: [
									{value: "Name", chance: 100},
									{value: "Moniker", chance: 100}
								]
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#009600"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
							},
							disposition: {
								value: "-1"
							},
							spellsFilter: {
								page: -1,
								list: [],
								petty: true
							},
							reactions: {
								species: "Greenskin",
								subspecies: "Goblin",
								frequency: "75"
							},
							presets: []
						}
					}
				},
				//Chaos
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Chaos"),
					id: "Chaos",
					uuid: "Chaos",
					img: "systems/wfrp4e/icons/buildings/chaos_worship.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Chaos",
								keys: []
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#4b0000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
							},
							disposition: {
								value: "-1"
							},
							spellsFilter: {
								page: -1,
								list: [],
								petty: true
							},
							reactions: {
								species: "Chaos",
								subspecies: "Marauders",
								frequency: "75"
							},
							presets: [
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Male", chance: 100},
										{value: "Moniker", chance: 100}
									],
									items: []
								},
								{
									replaceTokens: "",
									characteristics: {ws: "0", bs: "0", s: "0", t: "0", i: "0", ag: "0", dex: "0", int: "0", wp: "0", fel: "0"},
									weight: "1",
									replaceKeys: [
										{value: "Female", chance: 100},
										{value: "Moniker", chance: 100}
									],
									items: []
								},
							]
						}
					}
				},
				//Beastman
				{
					name: game.i18n.localize("WFRP4E.Assistant.Helpers.Settings.Presets.Names.Beastman"),
					id: "Beastman",
					uuid: "Beastman",
					img: "systems/wfrp4e/icons/buildings/beastmen_camp1.png",
					isDefault: true,
					isPreset: true,
					flags: {
						assistant: {
							generateName: {
								species: "Beastman",
								keys: [
									{value: "Name", chance: 100},
									{value: "Moniker", chance: 50},
									{value: "OffMoniker", chance: 25}
								]
							},
							randomCharacteristics: {
								status: true
							},
							randomTokenSize: {
								status: true
							},
							deathTint: {
								evenly: true,
								color: "#4b0000"
							},
							generateSpells: {
								lore: "disabled",
								count: 1,
								arcane: true
							},
							disposition: {
								value: "-1"
							},
							spellsFilter: {
								page: -1,
								list: [],
								petty: true
							},
							reactions: {
								species: "Chaos",
								subspecies: "Beastman",
								frequency: "75"
							},
							presets: []
						}
					}
				}
			]
		}
	};
	game.wfrp4e.tools.assistant.presets.all = game.settings.get("wfrp4e-assistant", "assistantPresets").concat(game.wfrp4e.tools.assistant.presets.default);
	Hooks.on("getSceneControlButtons", (controls) => {
		let tool = controls.wfrp4eTools?.tools?.toggleReactions;
		if (tool) {
			let enabled = game.settings.get("wfrp4e-assistant", "reactionsEnabled");
			tool.active = enabled;
			tool.toolclip.items = [
				{paragraph: enabled ? "WFRP4E.Assistant.Helpers.Reactions.Button.On" : "WFRP4E.Assistant.Helpers.Reactions.Button.Off"}
			];
		};
	});
	if (!game.settings.get("wfrp4e-assistant", "reactionsEnabled")) {ui.controls?.render()};
});