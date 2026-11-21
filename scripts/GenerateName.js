export default async function() {
	let localizeKey = (species, rawValue) => {
		return rawValue.split("|").map(part => {
			let locKey = `WFRP4E.Assistant.Helpers.GenerateName.Keys.${species}.${part}`;
			return game.i18n.has(locKey) ? game.i18n.localize(locKey) : part;
		}).join("/");
	};
	let formatKeysLabel = (species, keys) => {
		return keys.map(k => localizeKey(species, k.value) + (k.chance != 100 ? ` [${k.chance}%]` : "")).join(", ");
	};

	let basePresets = foundry.utils.deepClone(game.wfrp4e.tools.assistant.presets.all);
	let presets = [];
	for (let preset of basePresets) {
		let gn = preset.flags?.assistant?.generateName;
		if (!gn || gn.species == "disabled") {continue};
		if (preset.flags.assistant.presets?.length) {
			for (let p of preset.flags.assistant.presets) {
				let newPreset = foundry.utils.deepClone(preset);
				if (p.replaceKeys?.length) {
					newPreset.flags.assistant.generateName.keys = p.replaceKeys;
				};
				if (!newPreset.flags.assistant.generateName.keys.length) {continue};
				newPreset.name += ` (${formatKeysLabel(gn.species, newPreset.flags.assistant.generateName.keys)})`;
				presets.push(newPreset);
			};
		} else if (gn.keys?.length) {
			preset.name += ` (${formatKeysLabel(gn.species, gn.keys)})`;
			presets.push(preset);
		};
	};
	let options = presets.map((p, i) => `<option value="${i}">${p.name}</option>`).join("");
	await new foundry.applications.api.DialogV2({
		window: {title: "WFRP4E.Assistant.Macros.GenerateName.Title"},
		classes: ["wfrp4eTools"],
		content: `
			<div class="booksTitle" style="display: flex; gap: 1rem; height: 4rem; padding: 1rem;">
				<input id="count" type="number" step="1" min="1" value="1" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.Macros.GenerateName.Quantity")}" style="height: auto; margin: 2px; padding: 3px; text-align: center; flex: 1;">
				<select id="type" data-tooltip="${game.i18n.localize("WFRP4E.Assistant.Macros.GenerateName.Preset")}" style="height: auto; margin: 2px; padding: 3px; text-align: center; flex: 4;">${options}</select>
			</div>
		`,
		buttons: [
			{
				label: "WFRP4E.Assistant.Macros.GenerateName.Roll",
				icon: "fas fa-dice",
				callback: (event, button, dialog) => {
					let html = dialog.element;
					let count = Math.max(1, Math.trunc(Number(html.querySelector("#count").value)) || 1);
					generateItem(count, html.querySelector("#type").value, html.querySelector("#type > option:checked")?.textContent || "");
				}
			}
		]
	}).render(true);

	async function generateItem(count, presetIndex, target) {
		let names = "";
		let preset = presets[presetIndex]?.flags?.assistant?.generateName || false;
		if (!preset) {
			ui.notifications.error(game.i18n.format("WFRP4E.Assistant.Macros.GenerateName.Error", {preset: target}));
			return;
		};
		let speciesKeys = preset.keys;
		for (let i = count; i > 0; i--) {
			let keys = [];
			for (let j = 0; j < speciesKeys.length; j++) {
				if ((await new Roll("1d100").roll()).total <= speciesKeys[j].chance) {
					keys.push(speciesKeys[j].value);
				};
			};
			if (names != "") {names += "<hr>"};
			names += `<p>${game.wfrp4e.tools.generateName(preset.species || "", keys.join(","))}</p>`;
		};

		let speaker = game.user.character ? {actor: game.user.character} : {alias: game.user.name};
		let chatData = {
			speaker,
			flavor: game.i18n.format("WFRP4E.Assistant.Macros.GenerateName.Flavor", {target}),
			content: `<div class="wfrp4eTools booksTitleChat">${names}</div>`
		};
		ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
		ChatMessage.create(chatData);
	};
};