class assistantUtility {
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
    game.settings.register("wfrp4e-assistant", "assistantPreset", {
		scope: "world",
		config: false,
		default: {
            character: {
                addCharacteristics: {
                    value: "0",
                    previousValue: "0"
                },
                deathTint: {
                    color: "#990000",
                    defaultColor: "#ffffff"
                }
            },
            npc: {
                generateName: {
                    status: true,
                    species: "*",
                    keys: "male,surnames"
                },
                randomCharacteristics: {status: true},
                addCharacteristics: {
                    value: "0",
                    previousValue: "0"
                },
                deathTint: {
                    color: "#990000",
                    defaultColor: "#ffffff"
                },
                generateSpells: {
                    status: false,
                    lore: "petty",
                    count: 1,
                    arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
                },
                disposition: "4"
            },
            creature: {
                generateName: {
                    status: true,
                    species: "*",
                    keys: "all"
                },
                randomCharacteristics: {status: true},
                addCharacteristics: {
                    value: "0",
                    previousValue: "0"
                },
                deathTint: {
                    color: "#990000",
                    defaultColor: "#ffffff"
                },
                generateSpells: {
                    status: false,
                    lore: "petty",
                    count: 1,
                    arcane: game.settings.get("wfrp4e-assistant", "enableArcane")
                },
                disposition: "4"
            }
        },
		type: Object
	});

    game.wfrp4e.utility.generateBookTitle = assistantUtility.generateBookTitle;
    game.wfrp4e.utility.getActorFromUUID = assistantUtility.getActorFromUUID;
    
/*Изменение размера
`if (args.item == this.item && false) {
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
};`
*/    

	foundry.utils.mergeObject(game.wfrp4e.config.effectScripts, {
"YRJEOMjZZ7iinnPx":
`let params = this.effect.flags.assistant;
if (params.generateName.status) {
    let name = "";
    let speciesKeys = params.generateName.keys.split(",");
    for (let i = 0; i < speciesKeys.length; i++) {
        if (name) {name += " "};
        let keys = Object.keys(game.i18n.translations.WFRP4E.Assistant.Helpers.GenerateName.List[params.generateName.species][speciesKeys[i]]);
        name += game.i18n.localize("WFRP4E.Assistant.Helpers.GenerateName.List." + params.generateName.species + "." + speciesKeys[i] + "." + keys[Math.floor(CONFIG.Dice.randomUniform() * keys.length)]);
    };
    if (!name) {name = this.actor.name};
    this.actor.update({"name": name});
    this.actor.token.update({"name": name.split(" ")[0]});
    params.generateName.status = false;
};
if (params.randomCharacteristics.status) {
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
if (params.generateSpells.status) {
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
if (params.disposition == "4") {//4 - 
    choice = await ItemDialog.create([{name: game.i18n.localize("TOKEN.DISPOSITION.NEUTRAL"), value: 0}, {name: game.i18n.localize("TOKEN.DISPOSITION.FRIENDLY"), value: 1}, {name: game.i18n.localize("TOKEN.DISPOSITION.HOSTILE"), value: -1}, {name: game.i18n.localize("TOKEN.DISPOSITION.SECRET"), value: -2}], 1, {text: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Tooltip"), title: game.i18n.localize("WFRP4E.Assistant.Helpers.Disposition.Label")});
    this.actor.token.update({"disposition": choice[0]?.value});
} else if (params.disposition == "0") {
    this.actor.token.update({"disposition": 0});
} else if (params.disposition == "1") {
    this.actor.token.update({"disposition": 1});
} else if (params.disposition == "-1") {
    this.actor.token.update({"disposition": -1});
} else if (params.disposition == "-2") {
    this.actor.token.update({"disposition": -2});
};
this.effect.update({
    "flags.assistant": params
});`,
"BJmxXK4ESSTuenLd":
`if (args.data?.flags?.assistant) {
    if (args.item == this.item) {
        let params = this.effect.flags.assistant;
        /*
        this.actor.update({
            "system.characteristics.ws.initial": this.actor.system.characteristics.ws.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.bs.initial": this.actor.system.characteristics.bs.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.s.initial": this.actor.system.characteristics.s.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.t.initial": this.actor.system.characteristics.t.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.i.initial": this.actor.system.characteristics.i.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.dex.initial": this.actor.system.characteristics.dex.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.ag.initial": this.actor.system.characteristics.ag.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.int.initial": this.actor.system.characteristics.int.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.wp.initial": this.actor.system.characteristics.wp.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value),
            "system.characteristics.fel.initial": this.actor.system.characteristics.fel.initial - parseInt(params.addCharacteristics.previousValue) + parseInt(params.addCharacteristics.value)
        });
        */
    };
};`,
"hlbhbwGK9NNmVhsO":
`let params = this.effect.flags.assistant;
if (game.user.isGM && this.actor.token && params.deathTint.color != params.deathTint.defaultColor) {
    if (this.actor.system.status.wounds.value <= 0) {
        this.actor.token.update({"texture.tint": params.deathTint.color});
    } else {
        this.actor.token.update({"texture.tint": params.deathTint.defaultColor});
    };
};`})
});

async function assistantDefaultParams(actor) {
    let effect = await actor.effects.find(e => e.flags.assistant);

    if (game.user.isGM && !actor.inCompendium) {
        if (game.settings.get("wfrp4e-assistant", "enableHelpers")) {
            if (!effect) {
                let params;
                
                //Преобразование старой "черты" в новый "эффект".
                let item = await actor.items.find(i => i.type == "trait" && i.name == game.i18n.localize("WFRP4E.Assistant.Label") && i.img == "icons/sundries/documents/document-sealed-signatures-red.webp");
                if (item) {
                    let specification = item.system.specification.value.split("|");
                    if (actor.type == "character") {
                        params = {
                            addCharacteristics: {
                                value: specification[2],
                                previousValue: "0"
                            },
                            deathTint: {
                                color: specification[3].split(",")[0],
                                defaultColor: specification[3].split(",")[1]
                            }
                        };
                    } else if (actor.type == "creature") {
                        params = {
                            generateName: {
                                status: specification[0].split(",")[0] == "true" ? true : false,
                                species: specification[0].split(",")[1],
                                keys: specification[0].split(",").slice(2).join(",")
                            },
                            randomCharacteristics: {status: specification[1] == "true" ? true : false},
                            addCharacteristics: {
                                value: specification[2],
                                previousValue: "0"
                            },
                            deathTint: {
                                color: specification[3].split(",")[0],
                                defaultColor: specification[3].split(",")[1]
                            },
                            generateSpells: {
                                status: specification[4].split(",")[0] == "true" ? true : false,
                                lore: specification[4].split(",")[1],
                                count: specification[4].split(",")[2],
                                arcane: specification[4].split(",")[3] == "true" ? true : false
                            },
                            disposition: "4"
                        };
                    } else {
                        params = {
                            generateName: {
                                status: specification[0].split(",")[0] == "true" ? true : false,
                                species: specification[0].split(",")[1],
                                keys: specification[0].split(",").slice(2).join(",")
                            },
                            randomCharacteristics: {status: specification[1] == "true" ? true : false},
                            addCharacteristics: {
                                value: specification[2],
                                previousValue: "0"
                            },
                            deathTint: {
                                color: specification[3].split(",")[0],
                                defaultColor: specification[3].split(",")[1]
                            },
                            generateSpells: {
                                status: specification[4].split(",")[0] == "true" ? true : false,
                                lore: specification[4].split(",")[1],
                                count: specification[4].split(",")[2],
                                arcane: specification[4].split(",")[3] == "true" ? true : false
                            },
                            disposition: "4"
                        };
                    };
                } else {
                    if (actor.type == "character") {params = game.settings.get("wfrp4e-assistant", "assistantPreset").character}
                    else if (actor.type == "creature") {
                        params = game.settings.get("wfrp4e-assistant", "assistantPreset").creature;
                        params.generateName.species = params.generateName.species.replace("*", warhammer.utility.findKey(actor.Species.split(" ")[0], WFRP4E.species) || "error");
                    }
                    else {
                        params = game.settings.get("wfrp4e-assistant", "assistantPreset").npc;
                        params.generateName.species = params.generateName.species.replace("*", warhammer.utility.findKey(actor.Species.split(" ")[0], WFRP4E.species) || "error");
                    };
                };

                effect = await actor.createEmbeddedDocuments("ActiveEffect", [{
                    disabled: false,
                    flags: {assistant: params},
                    icon: "modules/wfrp4e-assistant/icons/conditions/assistant.png",
                    name: game.i18n.localize("WFRP4E.Assistant.Label"),
                    system: {
                        scriptData: [
                            {
                                label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.Create"),
                                trigger: "createToken",
                                script: `[Script.YRJEOMjZZ7iinnPx]`
                            },
                            {
                                label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.UpdateTrait"),
                                trigger: "update",
                                script: `[Script.BJmxXK4ESSTuenLd]`
                            },
                            {
                                label: game.i18n.localize("WFRP4E.Assistant.Helpers.Scripts.UpdateActor"),
                                trigger: "woundCalc",
                                script: `[Script.hlbhbwGK9NNmVhsO]`
                            }
                        ]
                    }
                }], {broadcast: false});
                if (item) {item.delete()};
            } else {
                effect.update({"disabled": false})
            };
        } else if (effect) {effect.update({"disabled": true})};
    };

    return effect;
};

Hooks.on("renderActorSheetV2", async (app, html, sheet) => {
    if ((sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature")) {
        let effect = await assistantDefaultParams(sheet.document);

        if (game.settings.get("wfrp4e-assistant", "hideHelpersTrait")) {
            sheet.document.sheet.form.querySelector(`section[data-tab="effects"]>.effect-lists>.sheet-list>.list-content>div[data-uuid="${effect.uuid}"]`).style.display = "none";
        };
    };
});

Hooks.on("getHeaderControlsActorSheetV2", (sheet, controls) => {
    if(game.user.isGM && sheet.isEditable && game.settings.get("wfrp4e-assistant", "enableHelpers") && (sheet.document.type == "character" || sheet.document.type == "npc" || sheet.document.type == "creature")) {
        controls.push({
            icon: "fas fa-handshake-angle",
            label: game.i18n.localize("WFRP4E.Assistant.Label"),
            onClick: () => assistantMenu(sheet.document),
        });
    };
});

async function assistantMenu(actor) {
    let effect = await assistantDefaultParams(actor);
    let params = effect.flags.assistant;
    let lores = [{value: "arcane", label: game.i18n.localize("WFRP4E.MagicLores.arcane")}];
    for (let i = 0; i < Object.keys(game.wfrp4e.config.magicLores).length; i++) {
        lores.push({value: Object.keys(game.wfrp4e.config.magicLores)[i], label: Object.values(game.wfrp4e.config.magicLores)[i]});
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
                let newParams = {};
                if (actor.type == "character") {
                    newParams = {
                        addCharacteristics: {
                            value: html.find("[id=addCharacteristics]")[0].value,
                            previousValue: params.addCharacteristics.value
                        },
                        deathTint: {
                            color: html.find("[id=deathTint]")[0].value,
                            defaultColor: html.find("[id=deathTintDefault]")[0].value
                        }
                    };
                } else if (actor.type == "creature") {
                    newParams = {
                        generateName: {
                            status: html.find("[id=generateNameStatus]")[0].checked,
                            species: html.find("[id=generateNameSpecies]")[0].value,
                            keys: html.find("[id=generateNameKeys]")[0].value
                        },
                        randomCharacteristics: {status: html.find("[id=randomCharacteristics]")[0].checked},
                        addCharacteristics: {
                            value: html.find("[id=addCharacteristics]")[0].value,
                            previousValue: params.addCharacteristics.value
                        },
                        deathTint: {
                            color: html.find("[id=deathTint]")[0].value,
                            defaultColor: html.find("[id=deathTintDefault]")[0].value
                        },
                        generateSpells: {
                            status: html.find("[id=generateSpellsStatus]")[0].checked,
                            lore: html.find("[id=generateSpellsLore]")[0].value,
                            count: Math.max(1, html.find("[id=generateSpellsCount]")[0].value),
                            arcane: html.find("[id=generateSpellsArcane]")[0].checked
                        },
                        disposition: html.find("[id=disposition]")[0].value
                    };
                } else {
                    newParams = {
                        generateName: {
                            status: html.find("[id=generateNameStatus]")[0].checked,
                            species: html.find("[id=generateNameSpecies]")[0].value,
                            keys: html.find("[id=generateNameKeys]")[0].value
                        },
                        randomCharacteristics: {status: html.find("[id=randomCharacteristics]")[0].checked},
                        addCharacteristics: {
                            value: html.find("[id=addCharacteristics]")[0].value,
                            previousValue: params.addCharacteristics.value
                        },
                        deathTint: {
                            color: html.find("[id=deathTint]")[0].value,
                            defaultColor: html.find("[id=deathTintDefault]")[0].value
                        },
                        generateSpells: {
                            status: html.find("[id=generateSpellsStatus]")[0].checked,
                            lore: html.find("[id=generateSpellsLore]")[0].value,
                            count: Math.max(1, html.find("[id=generateSpellsCount]")[0].value),
                            arcane: html.find("[id=generateSpellsArcane]")[0].checked
                        },
                        disposition: html.find("[id=disposition]")[0].value
                    };
                };
                effect.update({"flags.assistant": newParams});
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
                Actor.create(actorData);
            }
        };
    };
    new Dialog({
		title: actor.name,
		content: await foundry.applications.handlebars.renderTemplate("modules/wfrp4e-assistant/templates/assistantMenu.hbs", {params, lores, sizes}),
		buttons: buttons,
		default: "save",
		close: () => {}
	}, {id: "WFRP4E_Assistant", width: 500, resizable: true}).render(true);
};