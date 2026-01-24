import {updateCharactersList, characters} from "../assistant.js";

export async function menuGMPanel(playersData, skills) {
	let content = await renderTemplate("modules/wfrp4e-assistant/templates/GMPanel.hbs", { data: playersData, skillsList: skills });
	const options = {
		classes: ["gmPanel_dialog", "fade-in"],
		id: "gm-panel",
		width: "unset",
		height: "auto",
        resizable: true,
        tabs: [{navSelector: '.tabs', contentSelector: '.tabs_content', initial: window.GMPanel_tab}]
	};

	new Dialog({
		title: game.i18n.localize("WFRP4E.Assistant.GMPanel.Title"),
		content: content,
		buttons: {},
		close: () => {
			let window = document.getElementById("gm-panel");
			window.classList.add("gmPanel_close");
			window.addEventListener("animationend", () => {
				window.remove();
			});
		}
	}, options).render(true);
}

export function GMPanelPlayersData() {
	let dataExport = [];
	updateCharactersList();
	for (let i = 0; i < characters.length; i++) {
		let dataCharacterExport = {};
		// Main
		dataCharacterExport.id = characters[i].uuid;
		dataCharacterExport.name = characters[i].name;
		dataCharacterExport.shortName = characters[i].name.split(" ")[0];
		dataCharacterExport.image = characters[i].img;
		// Details
		dataCharacterExport.wounds = {current: characters[i].system.status.wounds.value, max: characters[i].system.status.wounds.max};
		dataCharacterExport.fate = {fortune: characters[i].system.status.fortune.value, fate: characters[i].system.status.fate.value};
		dataCharacterExport.resilience = {resolve: characters[i].system.status.resolve.value, resilience: characters[i].system.status.resilience.value};
		dataCharacterExport.move = {movement: characters[i].system.details.move.value, walk: characters[i].system.details.move.walk, run: characters[i].system.details.move.run};
		dataCharacterExport.encumbrance = {max: characters[i].system.status.encumbrance.max, total: characters[i].system.status.encumbrance.current};
		dataCharacterExport.experience = {current: characters[i].system.details.experience.current, spent: characters[i].system.details.experience.spent, total: characters[i].system.details.experience.total};
		dataCharacterExport.ambitions = {personal: {short: characters[i].system.details["personal-ambitions"]["short-term"], long: characters[i].system.details["personal-ambitions"]["long-term"]}, party: {short: characters[i].system.details["party-ambitions"]["short-term"], long: characters[i].system.details["party-ambitions"]["long-term"]}, motivation: characters[i].system.details.motivation.value};
		// More Details
		dataCharacterExport.species = characters[i].Species;
		dataCharacterExport.gender = characters[i].system.details.gender.value;
		dataCharacterExport.age = characters[i].system.details.age.value;
		dataCharacterExport.height = characters[i].system.details.height.value;
		dataCharacterExport.weight = characters[i].system.details.weight.value;
		dataCharacterExport.haircolour = characters[i].system.details.haircolour.value;
		dataCharacterExport.eyecolour = characters[i].system.details.eyecolour.value;
		dataCharacterExport.class = characters[i].system.details.career.system.class.value;
		dataCharacterExport.career = {name: characters[i].system.details.career.name, id: characters[i].system.details.career.uuid};
		dataCharacterExport.careerlevel = characters[i].system.details.career.system.level.value;
		dataCharacterExport.careerpath = "";
		for (let a = 0; a < characters[i].itemTypes.career.length; a++) {
			dataCharacterExport.careerpath = dataCharacterExport.careerpath + characters[i].itemTypes.career[a].name;
			if (a + 1 != characters[i].itemTypes.career.length) {dataCharacterExport.careerpath = dataCharacterExport.careerpath + ", "};
		};
		dataCharacterExport.status = characters[i].system.details.status.value;
		// Characteristics
		dataCharacterExport.characteristics = {
			ws: {
				initial: characters[i].system.characteristics.ws.initial,
				advances: characters[i].system.characteristics.ws.advances,
				modifier: characters[i].system.characteristics.ws.modifier,
				current: characters[i].system.characteristics.ws.value
			},
			bs: {
				initial: characters[i].system.characteristics.bs.initial,
				advances: characters[i].system.characteristics.bs.advances,
				modifier: characters[i].system.characteristics.bs.modifier,
				current: characters[i].system.characteristics.bs.value
			},
			s: {
				initial: characters[i].system.characteristics.s.initial,
				advances: characters[i].system.characteristics.s.advances,
				modifier: characters[i].system.characteristics.s.modifier,
				current: characters[i].system.characteristics.s.value
			},
			t: {
				initial: characters[i].system.characteristics.t.initial,
				advances: characters[i].system.characteristics.t.advances,
				modifier: characters[i].system.characteristics.t.modifier,
				current: characters[i].system.characteristics.t.value
			},
			i: {
				initial: characters[i].system.characteristics.i.initial,
				advances: characters[i].system.characteristics.i.advances,
				modifier: characters[i].system.characteristics.i.modifier,
				current: characters[i].system.characteristics.i.value
			},
			ag: {
				initial: characters[i].system.characteristics.ag.initial,
				advances: characters[i].system.characteristics.ag.advances,
				modifier: characters[i].system.characteristics.ag.modifier,
				current: characters[i].system.characteristics.ag.value
			},
			dex: {
				initial: characters[i].system.characteristics.dex.initial,
				advances: characters[i].system.characteristics.dex.advances,
				modifier: characters[i].system.characteristics.dex.modifier,
				current: characters[i].system.characteristics.dex.value
			},
			int: {
				initial: characters[i].system.characteristics.int.initial,
				advances: characters[i].system.characteristics.int.advances,
				modifier: characters[i].system.characteristics.int.modifier,
				current: characters[i].system.characteristics.int.value
			},
			wp: {
				initial: characters[i].system.characteristics.wp.initial,
				advances: characters[i].system.characteristics.wp.advances,
				modifier: characters[i].system.characteristics.wp.modifier,
				current: characters[i].system.characteristics.wp.value
			},
			fel: {
				initial: characters[i].system.characteristics.fel.initial,
				advances: characters[i].system.characteristics.fel.advances,
				modifier: characters[i].system.characteristics.fel.modifier,
				current: characters[i].system.characteristics.fel.value
			}
		};
		// Skills
		let dataSkillsExport = [];
		for (let a = 0; a < characters[i].itemTypes.skill.length; a++) {
			let dataSkillExport = {characteristic: {}};
			dataSkillExport.id = characters[i].itemTypes.skill[a].uuid;
			dataSkillExport.name = characters[i].itemTypes.skill[a].name;
			dataSkillExport.image = characters[i].itemTypes.skill[a].img;

			switch (characters[i].itemTypes.skill[a].characteristic.key) {
				case "ws": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.WS"); break;
				case "bs": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.BS"); break;
				case "s": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.S"); break;
				case "t": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.T"); break;
				case "i": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.I"); break;
				case "ag": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.Ag"); break;
				case "dex": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.Dex"); break;
				case "int": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.Int"); break;
				case "wp": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.WP"); break;
				case "fel": dataSkillExport.characteristic["name"] = game.i18n.localize("CHAR.Fel"); break;
			};
			dataSkillExport.characteristic.total = characters[i].itemTypes.skill[a].characteristic.value;

			dataSkillExport.advances = characters[i].itemTypes.skill[a].advances.value;
			dataSkillExport.total = characters[i].itemTypes.skill[a].total.value;
			dataSkillExport.advanced = characters[i].itemTypes.skill[a].advanced.value;

			dataSkillsExport.push(dataSkillExport);
		}
		dataCharacterExport.skills = dataSkillsExport;

		dataExport.push(dataCharacterExport);
	};

	// List of Skills
	let skillsList = [];
	for (let i = 0; i < dataExport.length; i++) {
		for (let a = 0; a < dataExport[i].skills.length; a++) {
			if (!skillsList.some(skill => skill.name == dataExport[i].skills[a].name)) {
				skillsList.push({name: dataExport[i].skills[a].name, id: dataExport[i].skills[a].id, image: dataExport[i].skills[a].image});
			};
		};
	};
	return [dataExport, skillsList.sort((a, b) => a.name.localeCompare(b.name))];
};

Handlebars.registerHelper("contains", function (skillName, playerSkills = []) {
	let element = "";
	let skill = playerSkills.find(skill => skill.name == skillName);
	if (skill != undefined) {
		element = `<span title="${skill.characteristic.name}: ${skill.characteristic.total}&#13;&#10;${game.i18n.localize("Advances")}: ${skill.advances}">${skill.total}</span>`;
	}
	else {element = `<span title="${game.i18n.localize("None")}">-</span>`}
	return new Handlebars.SafeString(element);
});

Hooks.on("updateItem", (item) => {
	if (document.getElementById("gm-panel") != null && item.parent != null) {
		if (item.parent.type == "character") {
			if (item.type == "career") {
				updateActorData(item.parent, {system: {other: "career"}})
			} else {
				updateActorData(item.parent, {system: {other: "encumbrance"}})
			};
		};
	};
});
Hooks.on("updateActor", (actor, data) => {
	if (document.getElementById("gm-panel") != null && actor.type == "character") {updateActorData(actor, data)};
});
function updateActorData(actor, data) {
	if (actor.type == "character") {
		if (data.hasOwnProperty("name")) {
			console.log(data);
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="details"] > #details > .content[data-uuid="${actor.uuid}"] * [data-name='short_name']`).text(actor.name.split(" ")[0]);
			
			let color = $(`.gmPanel_dialog .tabs_content > .tab[data-tab="details"] > #details > .content[data-uuid="${actor.uuid}"] * [data-name='char_name']`).attr("data-tooltip")
			console.log(color);
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="details"] > #details > .content[data-uuid="${actor.uuid}"] * [data-name='char_name']`).attr("data-tooltip", `${actor.name}<br><br>${game.i18n.localize("Species")}: ${actor.Species}<br>${game.i18n.localize("Gender")}: ${actor.system.details.gender.value}<br>${game.i18n.localize("Age")}: ${actor.system.details.age.value}<br>${game.i18n.localize("CharacterHeight")}: ${actor.system.details.height.value}<br>${game.i18n.localize("Weight")}: ${actor.system.details.weight.value}<br>${game.i18n.localize("Hair Colour")}: ${actor.system.details.haircolour.value}<br>${game.i18n.localize("Eye Colour")}: ${actor.system.details.eyecolour.value}`);
			
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="characteristics"] > #characteristics > .content[data-uuid="${actor.uuid}"] * [data-name='short_name']`).text(actor.name.split(" ")[0]);
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="characteristics"] > #characteristics > .content[data-uuid="${actor.uuid}"] * [data-name='char_name']`).attr("data-tooltip", `${actor.name}`);
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="skills"] > #skills > .content[data-uuid="${actor.uuid}"] * [data-name='short_name']`).text(actor.name.split(" ")[0]);
			$(`.gmPanel_dialog .tabs_content > .tab[data-tab="skills"] > #skills > .content[data-uuid="${actor.uuid}"] * [data-name='char_name']`).attr("data-tooltip", `${actor.name}`);
		} else if (data.hasOwnProperty("system")) {
			let path = `.gmPanel_dialog .tabs_content > .tab[data-tab="details"] > #details > .content[data-uuid="${actor.uuid}"] *`;
			if (data.system.hasOwnProperty("status")) {
				if (data.system.status.hasOwnProperty("wounds")) {
					if (data.system.status.wounds.hasOwnProperty("max")) {
						$(path + "[data-name='wounds_max']").text(actor.system.status.wounds.max);
					} else {
						$(path + "[data-name='wounds']").text(actor.system.status.wounds.value);
					};
				} else if (data.system.status.hasOwnProperty("fortune")) {
					$(path + "[data-name='fortune']").text(actor.system.status.fortune.value);
				} else if (data.system.status.hasOwnProperty("fate")) {
					$(path + "[data-name='fate']").text(actor.system.status.fate.value);
				} else if (data.system.status.hasOwnProperty("resolve")) {
					$(path + "[data-name='resolve']").text(actor.system.status.resolve.value);
				} else if (data.system.status.hasOwnProperty("resilience")) {
					$(path + "[data-name='resilience']").text(actor.system.status.resilience.value);
				};
			} else if (data.system.hasOwnProperty("details")) {
				if (data.system.details.hasOwnProperty("move")) {
					$(path + "[data-name='movement']").text(actor.system.details.move.value);
					$(path + "[data-name='walk']").text(actor.system.details.move.walk);
					$(path + "[data-name='run']").text(actor.system.details.move.run);
				} else if (data.system.details.hasOwnProperty("experience")) {
					$(path + "[data-name='experience_tooltip']").attr("data-tooltip", `${game.i18n.localize("Current")}: ${actor.system.details.experience.current}<br>${game.i18n.localize("Spent")}: ${actor.system.details.experience.spent}<br>${game.i18n.localize("Total")}: ${actor.system.details.experience.total}`);
					$(path + "[data-name='experience']").text(actor.system.details.experience.current);
				} else if (data.system.details.hasOwnProperty("motivation")) {
					$(path + "[data-name='motivation']").text(actor.system.details.motivation.value);
				} else if (data.system.details.hasOwnProperty("personal-ambitions") || data.system.details.hasOwnProperty("party-ambitions")) {
					$(path + "[data-name='motivation_tooltip']").attr("data-tooltip", `${game.i18n.localize("Personal Ambitions")}.<br><br>${game.i18n.localize("Short Term")}: ${actor.system.details["personal-ambitions"]["short-term"]}<br>${game.i18n.localize("Long Term")}: ${actor.system.details["personal-ambitions"]["long-term"]}<br><br>${game.i18n.localize("Party Ambitions")}.<br><br>${game.i18n.localize("Short Term")}: ${actor.system.details["party-ambitions"]["short-term"]}<br>${game.i18n.localize("Long Term")}: ${actor.system.details["party-ambitions"]["long-term"]}`);
				} else if (data.system.details.hasOwnProperty("status")) {
					if (actor.system.details.career.value != "") {
						$(path + "[data-name='career']").text(`${actor.system.details.career.name} (${actor.system.details.career.system.level.value})`);
						$(path + "[data-name='career']").attr("data-uuid", actor.system.details.career.uuid);
						let careerpath = "";
						for (let a = 0; a < actor.itemTypes.career.length; a++) {
							careerpath = careerpath + actor.itemTypes.career[a].name;
							if (a + 1 != actor.itemTypes.career.length) {careerpath = careerpath + ", "};
						};
						$(path + "[data-name='career_tooltip']").attr("data-tooltip", `${game.i18n.localize("Status")}: ${actor.system.details.status.value}<br>${game.i18n.localize("Class")}: ${actor.system.details.career.system.class.value}<br>${game.i18n.localize("Careers")}: ${careerpath}`);
					} else {
						$(path + "[data-name='career']").text(`${game.i18n.localize("No")}`);
						let careerpath = "";
						for (let a = 0; a < actor.itemTypes.career.length; a++) {
							careerpath = careerpath + actor.itemTypes.career[a].name;
							if (a + 1 != actor.itemTypes.career.length) {careerpath = careerpath + ", "};
						};
						$(path + "[data-name='career_tooltip']").attr("data-tooltip", `${game.i18n.localize("Status")}: ${game.i18n.localize("No")}<br>${game.i18n.localize("Class")}: ${game.i18n.localize("No")}<br>${game.i18n.localize("Careers")}: ${careerpath}`);
					};
				} else if (data.system.details.hasOwnProperty("species") || data.system.details.hasOwnProperty("gender") || data.system.details.hasOwnProperty("age") || data.system.details.hasOwnProperty("height") || data.system.details.hasOwnProperty("weight") || data.system.details.hasOwnProperty("haircolour") || data.system.details.hasOwnProperty("eyecolour")) {
					$(path + "[data-name='name']").attr("data-tooltip", `${actor.name}<br><br>${game.i18n.localize("Species")}: ${actor.Species}<br>${game.i18n.localize("Gender")}: ${actor.system.details.gender.value}<br>${game.i18n.localize("Age")}: ${actor.system.details.age.value}<br>${game.i18n.localize("CharacterHeight")}: ${actor.system.details.height.value}<br>${game.i18n.localize("Weight")}: ${actor.system.details.weight.value}<br>${game.i18n.localize("Hair Colour")}: ${actor.system.details.haircolour.value}<br>${game.i18n.localize("Eye Colour")}: ${actor.system.details.eyecolour.value}`);
				};
			} else if (data.system.hasOwnProperty("other")) {
				if (data.system.other == "encumbrance") {
					$(path + "[data-name='encumbrance']").text(actor.system.status.encumbrance.current);
					$(path + "[data-name='encumbrance_max']").text(actor.system.status.encumbrance.max);
				} else if (data.system.other == "career") {
					if (actor.system.details.career.value != "") {
						$(path + "[data-name='career']").text(`${actor.system.details.career.name} (${actor.system.details.career.system.level.value})`);
						$(path + "[data-name='career']").attr("data-uuid", actor.system.details.career.uuid);
						let careerpath = "";
						for (let a = 0; a < actor.itemTypes.career.length; a++) {
							careerpath = careerpath + actor.itemTypes.career[a].name;
							if (a + 1 != actor.itemTypes.career.length) {careerpath = careerpath + ", "};
						};
						$(path + "[data-name='career_tooltip']").attr("data-tooltip", `${game.i18n.localize("Status")}: ${actor.system.details.status.value}<br>${game.i18n.localize("Class")}: ${actor.system.details.career.system.class.value}<br>${game.i18n.localize("Careers")}: ${careerpath}`);
					} else {
						$(path + "[data-name='career']").text(`${game.i18n.localize("No")}`);
						let careerpath = "";
						for (let a = 0; a < actor.itemTypes.career.length; a++) {
							careerpath = careerpath + actor.itemTypes.career[a].name;
							if (a + 1 != actor.itemTypes.career.length) {careerpath = careerpath + ", "};
						};
						$(path + "[data-name='career_tooltip']").attr("data-tooltip", `${game.i18n.localize("Status")}: ${game.i18n.localize("No")}<br>${game.i18n.localize("Class")}: ${game.i18n.localize("No")}<br>${game.i18n.localize("Careers")}: ${careerpath}`);
					};
				};
			};
		};
	};
}