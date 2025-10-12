class assistantUtility {
    //Этот метод принимает переведённое название Школы Магии и возвращает ключ, принадлежащий этой Школе.
    //https://github.com/nPocToI4eJI/wfrp4e-assistant/tree/main#getMagicLoreKeylore
    static getMagicLoreKey(lore) {
        return Object.keys(game.wfrp4e.config.magicLores)[Object.values(game.wfrp4e.config.magicLores).indexOf(lore)] || "arcane";
    };

    //Этот метод принимает ключ Школы Магии и возвращает массив, содержащий заклинания, принадлежащие этой Школе.
    //https://github.com/nPocToI4eJI/wfrp4e-assistant/tree/main#findAllSpellslore-includeArcane
    static async findAllSpells(lore, includeArcane) {
        if (lore == "arcane") {lore = ""};
        let spells = game.items.contents.filter(i => i.type == "spell" && (i.lore.value == lore || (includeArcane == "true" && i.lore.value == "")));
        let spellsName = [];
        for (let i = 0; i < spells.length; i++) {spellsName.push(spells[i].name)};

        let packs = game.wfrp4e.tags.getPacksWithTag("spell");
        for (let i = 0; i < packs.length; i++) {
            if (packs[i].metadata.packageName == "wfrp4e-core") {
                packs.push(packs[i]);
                packs.splice(i, 1);
            };
        };
        
        for (let pack of packs) {
            const index = pack.indexed ? pack.index : await pack.getIndex();
            let indexResult = index.filter(i => i.type == "spell");
            for (let i = 0; i < indexResult.length; i++) {
                let packSpell = await pack.getDocument(indexResult[i]._id);
                if (!spellsName.includes(packSpell.name) && (packSpell.lore.value == lore || (includeArcane == "true" && packSpell.lore.value == ""))) {
                    spells.push(packSpell);
                    spellsName.push(packSpell.name);
                };
            };
        };

        return spells;
    };

    //Этот метод генерирует случайное название для книги в стилистике сеттинга. Варианты названий взяты у Paco's Miscellaneous Stuff и переведены мной на русский.
    //https://github.com/nPocToI4eJI/wfrp4e-assistant/tree/main#generateBookTitletype
    static generateBookTitle(type) {
        let title = game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Adjetive.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Adjetive).length) + 1}`) + " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Main.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Main).length) + 1}`);
        if (!type || type == "Random") {
            let randType = Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types)[Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types).length)];
            let keys = Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${randType}`]);
            title += " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.${randType}.${keys[Math.floor(CONFIG.Dice.randomUniform() * keys.length)]}`)
        }
        else {
            let keys = Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${type}`]);
            title += " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.${type}.${keys[Math.floor(CONFIG.Dice.randomUniform() * keys.length)]}`)
        };
    
        return title;
    };
    
    //Этот метод принимает полный UUID и возвращает актёра. Принимает UUID в формате "Scene.*id*.Token.*id*.Actor.*id*" или "Actor.*id*"
    //https://github.com/nPocToI4eJI/wfrp4e-assistant/tree/main#getActorFromUUID
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

    //Этот метод принимает переведённое название Народа и возвращает ключ, принадлежащий этому Народу.
    //https://github.com/nPocToI4eJI/wfrp4e-assistant/tree/main#getSpeciesKey
    static getSpeciesKey(string) {
        let species = string.split(" ")[0]
        return Object.keys(WFRP4E.species)[Object.values(WFRP4E.species).indexOf(species)] || string;
    };
};

Hooks.once("init", function () {
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

    game.wfrp4e.utility.findAllSpells = assistantUtility.findAllSpells;
    game.wfrp4e.utility.getMagicLoreKey = assistantUtility.getMagicLoreKey;
    game.wfrp4e.utility.generateBookTitle = assistantUtility.generateBookTitle;
    game.wfrp4e.utility.getActorFromUUID = assistantUtility.getActorFromUUID;
    game.wfrp4e.utility.getSpeciesKey = assistantUtility.getSpeciesKey;
    
    /*
    //В планах: добавить уход в защиту как статус, для визуального отображения на токене
	WFRP4E.statusEffects.push(
        {
            img: "systems/wfrp4e/icons/defeated.png",
            id: "defensive",
            statuses: ["defensive"],
            name: "EFFECT.OnDefensive",
            description : "EFFECT.OnDefensive",
            system : {
                condition : {
                    value : null,
                    numbered: false
                },
            }
        }
	);
	WFRP4E.conditions["defensive"] = "EFFECT.OnDefensive";
    */
    game.wfrp4e.config.systemEffects = {
        "helpers": {
            name: game.i18n.localize("WFRP4E.Assistant.Label"),
            img: "icons/sundries/documents/document-official-capital.webp",
            statuses: [],
            system: {
                transferData: {},
                scriptData: [
                    {
                        label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Create"),
                        trigger: "createToken",
                        script: `
let specification = this.item.system.specification.value.split("|");
let params = specification[0].split(",");
if (params[0] == "true") {
    let name = "";
    for (let i = 2; i < params.length; i++) {
        if (name) {name += " "};
        let keys = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params[1]][params[i]]);
        name += game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.List." + params[1] + "." + params[i] + "." + keys[Math.floor(CONFIG.Dice.randomUniform() * keys.length)]);
    };
    if (!name) {name = this.actor.name};
    this.actor.update({"name": name});
    this.actor.token.update({"name": name.split(" ")[0]});
    params[0] = "false";
    specification[0] = params.join(",");
};
params = specification[1];
if (params == "true") {
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
    params = "false";
    specification[1] = params;
};
params = specification[4].split(",");
if (params[0] == "true") {
    let spells = await game.wfrp4e.utility.findAllSpells(params[1], params[3]);
    let resultSpells = [];
    for (let i = params[2]; i > 0; i--) {
        let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
        let spell = spells[result].toObject();
        resultSpells.push(spell);
        await spells.splice(result, 1)
    };
    this.actor.createEmbeddedDocuments("Item", resultSpells, {broadcast: false})
    params[0] = "false";
    specification[4] = params.join(",");
};
this.item.update({"system.specification.value": specification.join("|")});
                        `
                    },
                    {
                        label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.UpdateTrait"),
                        trigger: "prepareItem",
                        script: `
if (args.item == this.item) {
    let specification = this.item.system.specification.value.split("|");
    let params = specification[2];
    this.effect.update({
        "changes": [
            {
                "key": "system.characteristics.ws.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.bs.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.s.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.t.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.i.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.ag.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.dex.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.int.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.wp.initial",
                "mode": 2,
                "value": params,
                "priority": null
            },
            {
                "key": "system.characteristics.fel.initial",
                "mode": 2,
                "value": params,
                "priority": null
            }
        ]
    });
};
                        `
                    },
                    {
                        label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.UpdateActor"),
                        trigger: "woundCalc",
                        script: `
let specification = this.item.system.specification.value.split("|");
let params = specification[3].split(",");
if (game.user.isGM && this.actor.token && params[0] != params[1]) {
	if (this.actor.system.status.wounds.value <= 0) {
		this.actor.token.update({
			texture: {
				tint: params[0]
			}
		});
	} else {
		this.actor.token.update({
			texture: {
				tint: params[1]
			}
		});
	};
};
                        `
                    },
                    {
                        label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.UpdateActor"),
                        trigger: "update",
                        script: `
let specification = this.item.system.specification.value.split("|");
let params = specification[3].split(",");
if (game.user.isGM && args.data?.prototypeToken?.texture?.tint) {
    params[1] = args.data.prototypeToken.texture.tint;
    specification[3] = params.join(",");
    this.item.update({"system.specification.value": specification.join("|")});
};
                        `
                    }/*,
                    //Изменение размера
                    {
                        label: game.i18n.localize("WFRP4E.Assistant.Helpers.Resize.Label"),
                        trigger: "prepareItem",
                        script: `
if (args.item == this.item && false) {
    let specification = this.item.system.specification.value.split("|");
    let params = specification[5].split(",");
    if (params[2] == "true") {
        let size = {new: Object.keys(WFRP4E.actorSizes).indexOf(params[0]), old: Object.keys(WFRP4E.actorSizes).indexOf(params[1])};
        let value = [10 * (size.new - size.old), -5 * (size.new - size.old)];
        let trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
        trait.update({"system.specification.value": WFRP4E.actorSizes[params[0]]});
        trait.effects.find(e => e.name == "Size").update({
            "changes": [
                {
                    "key": "system.characteristics.s.initial",
                    "mode": 2,
                    "value": value[0],
                    "priority": null
                },
                {
                    "key": "system.characteristics.t.initial",
                    "mode": 2,
                    "value": value[0],
                    "priority": null
                },
                {
                    "key": "system.characteristics.ag.initial",
                    "mode": 2,
                    "value": value[1],
                    "priority": null
                }
            ]
        });
        params[2] = "false";
        specification[5] = params.join(",");
        this.item.update({"system.specification.value": specification.join("|")});
    };
};
                        `
                    }*/
                ]
            }
        }
    };
});

async function assistantDefaultParams(actor) {
    let item = await actor.items.find(i => i.type == "trait" && i.name.includes(game.i18n.localize("WFRP4E.Assistant.Label")));

    if (game.user.isGM) {
        let specification;
        if (item) {
            specification = item.system.specification.value.split("|");
            if (specification[5] != game.modules.get("wfrp4e-assistant").version) {
                specification[5] = game.modules.get("wfrp4e-assistant").version;
                specification = specification.join("|");
                await actor.deleteEmbeddedDocuments("Item", [item.id])
            };
        } else {
            specification = "";
            //generateName
            if (actor.type == "npc" || actor.type == "creature") {
                specification += "true,";
            } else {specification += "false,"};
            specification += `${game.wfrp4e.utility.getSpeciesKey(actor.Species)},${actor.system.details.gender.value == game.i18n.localize("CHARGEN.Details.Female") ? "female" : "male"},surnames|`;
            //randomCharacteristics
            if (actor.type == "npc" || actor.type == "creature") {
                specification += "true|";
            } else {specification += "false|"};
            //addCharacteristics
            specification += "0|";
            //deathTint
            specification += `#990000,${actor.prototypeToken.texture.tint.css}|`;
            //generateSpells
            specification += "false,petty,1,false|";
            //resize
            //specification += `${actor.system.details.size.value},${actor.system.details.size.value},false`;
            //version
            specification += game.modules.get("wfrp4e-assistant").version;
        };

        if (!item) {
            let items = await actor.createEmbeddedDocuments("Item", [
                { 
                    name: game.i18n.localize("WFRP4E.Assistant.Label"),
                    type: "trait",
                    img: "icons/sundries/documents/document-sealed-signatures-red.webp",
                    system: {
                        specification: {
                            value: specification
                        }
                    }
                }
            ], {broadcast: false});
            if (items.length > 1) {
                for (let i = 1; i < items.length; i++) {items[i].delete()};
            };
            item = items[0];
            items[0].createEmbeddedDocuments("ActiveEffect", [game.wfrp4e.config.systemEffects.helpers], {broadcast: false});
        };
    };

    /*
    //Проверка черты "Размер"
    let trait = actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size"))) || "";
    if (!trait) {
        trait = (await game.wfrp4e.utility.findItem(game.i18n.localize("NAME.Size"), "trait")).toObject();
        trait.system.specification.value = WFRP4E.actorSizes[actor.system.details.size.value];
        trait = (await actor.createEmbeddedDocuments("Item", [trait]), {broadcast: false})[0];
    }
    */

    return item;
};

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
    if ((sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature") && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
        let item = await assistantDefaultParams(sheet.document);
        if (game.settings.get("wfrp4e-assistant", "hideHelpersTrait")) {
            if (sheet.document.type == "character" || sheet.document.type == "npc") {
                html.querySelector(`section[data-tab='talents']>.traits>.list-content>div[data-uuid="${item.uuid}"]`).style.display = "none";
            } else if (sheet.document.type == "creature") {
                html.querySelector(`section[data-tab='main']>.creature-overview>.sheet-list>.overview-content>.overview-list>a[data-uuid="${item.uuid}"]`).previousSibling.remove();
                html.querySelector(`section[data-tab='main']>.creature-overview>.sheet-list>.overview-content>.overview-list>a[data-uuid="${item.uuid}"]`).hidden = true;
            };
        };
    };
});

Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
    if(game.user.isGM && sheet.isEditable && (sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature") && game.settings.get("wfrp4e-assistant", "enableHelpers")) {
        controls.push({
            icon: "fas fa-handshake-angle",
            label: game.i18n.localize("WFRP4E.Assistant.Label"),
            onClick: () => assistantMenu(sheet.document),
        });
    };
});

async function assistantMenu(actor) {
    let item = await assistantDefaultParams(actor);
    let specification = item.system.specification.value.split("|");
    let params = {
        generateName: {
            status: specification[0].split(",")[0] == "true" ? true : false,
            species: specification[0].split(",")[1],
            keys: specification[0].split(",").slice(2).join(",")
        },
        randomCharacteristics: specification[1] == "true" ? true : false,
        addCharacteristics: specification[2],
        deathTint: {
            color: specification[3].split(",")[0]
        },
        generateSpells: {
            status: specification[4].split(",")[0] == "true" ? true : false,
            lore: specification[4].split(",")[1],
            count: specification[4].split(",")[2],
            arcane: specification[4].split(",")[3] == "true" ? true : false
        }/*,
        resize: {
            current: specification[5].split(",")[0],
            default: specification[5].split(",")[1]
        }*/
    };
    let lore = [{value: "arcane", label: game.i18n.localize("WFRP4E.MagicLores.arcane")}];
    for (let i = 0; i < Object.keys(game.wfrp4e.config.magicLores).length; i++) {
        lore.push({value: Object.keys(game.wfrp4e.config.magicLores)[i], label: Object.values(game.wfrp4e.config.magicLores)[i]});
    };
    let sizes = [];
    for (let i = 0; i < Object.keys(WFRP4E.actorSizes).length; i++) {
        sizes.push({value: Object.keys(WFRP4E.actorSizes)[i], label: Object.values(WFRP4E.actorSizes)[i]});
    };
    let buttons = {
        save: {
            icon: "<i class='fas fa-save'></i>",
            label: game.i18n.localize("Save"),
            callback: (html) => {
                let newParams = {
                    generateName: {
                        status: html.find('[id=generateNameStatus]')[0].checked,
                        species: html.find('[id=generateNameSpecies]')[0].value,
                        keys: html.find('[id=generateNameKeys]')[0].value
                    },
                    randomCharacteristics: html.find('[id=randomCharacteristics]')[0].checked,
                    addCharacteristics: html.find('[id=addCharacteristics]')[0].value,
                    deathTint: {
                        color: html.find('[id=deathTint]')[0].value,
                        defaultColor: actor.prototypeToken.texture.tint.css
                    },
                    generateSpells: {
                        status: html.find('[id=generateSpellsStatus]')[0].checked,
                        lore: html.find('[id=generateSpellsLore]')[0].value,
                        count: Math.max(1, html.find('[id=generateSpellsCount]')[0].value),
                        arcane: html.find('[id=generateSpellsArcane]')[0].checked
                    }/*,
                    resize: {
                        current: html.find('[id=resizeCurrent]')[0].value,
                        default: html.find('[id=resizeDefault]')[0].value
                    }*/
                };
                window.parent.editAssistantOptions(item, newParams);
            }
        }
    };
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
                let newActor = await Actor.create(actorData);
            }
        };
    };
    new Dialog({
		title: actor.name,
		content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-assistant/templates/assistantMenu.hbs", {params, lore, sizes}),
		buttons: buttons,
		default: "save",
		close: () => {}
	}, {id: "WFRP4E_Assistant", width: 500, resizable:true }).render(true);
};

window.editAssistantOptions = async function editAssistantOptions(item, params) {
    let specification = "";
    //generateName
    specification += `${params.generateName.status},${params.generateName.species},${params.generateName.keys}|`;
    //randomCharacteristics
    specification += params.randomCharacteristics + "|";
    //addCharacteristics
    specification += params.addCharacteristics + "|";
    //deathTint
    specification += `${params.deathTint.color},${params.deathTint.defaultColor}|`;
    //generateSpells
    specification += `${params.generateSpells.status},${params.generateSpells.lore},${params.generateSpells.count},${params.generateSpells.arcane}|`;
    //resize
    //specification += `${params.resize.current},${params.resize.default},true`;
    //version
    specification += game.modules.get("wfrp4e-assistant").version;
    item.update({
        "system.specification.value": specification
    });
};