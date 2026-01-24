export function menuGiveItem(characters, itemID) {
	let count = 1;
	let optionsCharacter = "";
	let item = game.items.get(itemID)
	for (let i = 0; i < characters.length; i++) {
		optionsCharacter += `<option value="${characters[i].id}">${characters[i].name}</option>`;
	}
	new Promise(resolve => {
		new Dialog({
			title: game.i18n.localize("WFRP4E.Assistant.GiveItem.Title") + ": " + item.name,
			content: `
				<div>
					<select id="actor" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Player")}">${optionsCharacter}</select>
					<input id="count" type="number" step="1" min="1" value="${item.system.quantity.value}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Quantity")}">
					<input id="count" type="number" step="1" min="1" value="${count}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Count")}">
				</div>
				<div>
					<a data-link="" data-uuid="${item.uuid}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.URL")}">${item.name}</a>
					<input id="gc" type="number" step="1" min="0" value="${item.price.gc}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Price")}">
					<span title="${game.i18n.localize("NAME.GC")}">${game.i18n.localize("MARKET.Abbrev.GC")}</span>
					<input id="ss" type="number" step="1" min="0" value="${item.price.ss}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Price")}">
					<span title="${game.i18n.localize("NAME.SS")}">${game.i18n.localize("MARKET.Abbrev.SS")}</span>
					<input id="bp" type="number" step="1" min="0" value="${item.price.bp}" title="${game.i18n.localize("WFRP4E.Assistant.GiveItem.Price")}">
					<span title="${game.i18n.localize("NAME.BP")}">${game.i18n.localize("MARKET.Abbrev.BP")}</span>
				</div>
				<style>
					div.dialog-content>div:nth-child(1) {
						display: grid;
						grid-template-columns: 60% 20% 20%;
					}
					div.dialog-content>div:nth-child(2) {
						display: grid;
						grid-template-columns: 40% repeat(6, 10%);
						align-items: center;
					}
					div.dialog-content>div>a,
					div.dialog-content>div>input,
					div.dialog-content>div>select {
						text-align: center;
						border: 2px solid gray;
						background: #33272C;
						color: wheat;
						box-shadow: inset 0px 0px 10px 2px gray;
						border-radius: 5px;
						margin: 2px;
						font-size: 14px;
						font-weight: bold;
						height: auto;
						padding: 3px;
						text-shadow: 1px 1px 2px black,
						-1px 1px 2px black,
						1px -1px 2px black,
						-1px -1px 2px black;
					}
					div.dialog-content>div>input:hover,
					div.dialog-content>div>select:hover {
						border: 2px solid silver;
						box-shadow: inset 0px 0px 7px 2px silver;
					}
					div.dialog-content>div>span {
						text-align: center;
						color: wheat;
					}
				</style>
			`,
			default: "roll",
			buttons: {
				roll: {
					icon: "<i class=\"fas fa-dice\"></i>",
					label: game.i18n.localize("WFRP4E.Assistant.GiveItem.Give"),
					callback: html => resolve(giveItem(html.find("[id=actor]")[0].value, itemID, html.find("[id=name]")[0].value, {gc: Number(html.find("[id=gc]")[0].value), ss: Number(html.find("[id=ss]")[0].value), bp: Number(html.find("[id=bp]")[0].value)}, Number(html.find("[id=count]")[0].value)))
				},
			},
			close: () => resolve(null)
		}).render(true);
	});
}

export async function giveItem(actor, item, name, price, count) {
	actor = game.actors.get(actor);
	item = game.items.get(item);
	if (actor.itemTypes[item.type].some(i => i.name == name)) {
		item = actor.itemTypes[item.type].find(i => i.name == name);
		let newItem = foundry.utils.mergeObject(item.toObject(), {system: {quantity: {value: item.system.quantity.value + count}}});
		await actor.updateEmbeddedDocuments("Item", [newItem]);
	}
	else {
		item = foundry.utils.duplicate(item);
		let newItem = foundry.utils.mergeObject(item, {name: name, system: {price: price, quantity: {value: count}}});
		await actor.createEmbeddedDocuments("Item", [newItem]);
	};
	ui.notifications.notify(game.i18n.format("MARKET.ItemAdded", {item: name + " (" + count + ")", actor: actor.name}));
};