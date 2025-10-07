//Этот файл не несёт никакой функции, он только демонстрирует скрипты эффектов

//Черта:
    //Эффект:
        //Скрипт [Триггер]:
        {
            //Тело скрипта
        }

//Генератор имени:
    //Генератор имени:
        //Генерация [Create Token]:
        {
            let name = this.actor.name;
            if (this.actor.Species.includes("Человек")) {
                let gender = this.actor.details.gender.value;
                if (!gender || gender == "???") {
                    let choice = await ItemDialog.create([{name: "Мужчина"}, {name: "Женщина"}], 1, {text: "Выберите пол для генерации имени:", title: game.i18n.localize("Gender")});
                    gender = choice[0].name;
                    this.actor.update({"system.details.gender.value": gender});
                };
                if (gender.includes("Женщина")) {
                    name = (await game.wfrp4e.tables.findTable("name", "human_female_forenames").roll()).results[0].name + " " + (await game.wfrp4e.tables.findTable("name", "human_surnames").roll()).results[0].name;
                } else if (gender.includes("Мужчина")) {
                    name = (await game.wfrp4e.tables.findTable("name", "human_male_forenames").roll()).results[0].name + " " + (await game.wfrp4e.tables.findTable("name", "human_surnames").roll()).results[0].name;
                };
            } else if (this.actor.Species.includes("Гоблин")) {
                name = (await game.wfrp4e.tables.findTable("name", "goblin").roll()).results[0].name;
            };
            this.actor.update({"name": name});
            this.actor.token.update({"name": name.split(" ")[0]});
            this.item.delete();
        }

//Изменение размера:
    //Изменение размера:
        //Увеличить [Manually Invoked]:
        {
            if (this.actor.token) {
                let trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
                if (!trait) {
                    for (let pack of game.wfrp4e.tags.getPacksWithTag("trait")) {
                        const index = pack.indexed ? pack.index : await pack.getIndex();
                        let indexResult = index.find(t => t.type == "trait" && t.name == game.i18n.localize("NAME.Size"));
                        if (indexResult) {
                            let item = (await pack.getDocument(indexResult._id)).toObject();
                            item.system.specification.value = game.i18n.localize("SPEC.Average");
                            this.actor.createEmbeddedDocuments("Item", [item]);
                        };
                    };
                    trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
                };
                let sizeSpecifiers = Object.values(game.wfrp4e.config.actorSizes);
                if (sizeSpecifiers.indexOf(trait.system.specification.value) < sizeSpecifiers.length - 1) {
                    trait.update({"system.specification.value": sizeSpecifiers[sizeSpecifiers.indexOf(trait.system.specification.value) + 1]});
                    let value = (parseInt(this.item.system.specification.value) || 0) + 1;
                    if (value > 0) {
                        this.effect.update({
                            "changes": [
                                {
                                    "key": "system.characteristics.s.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.t.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.ag.initial",
                                    "mode": 2,
                                    "value": -5 * value,
                                    "priority": null
                                }
                            ]
                        });
                        value = "+" + value;
                    } else if (value < 0) {
                        this.effect.update({
                            "changes": [
                                {
                                    "key": "system.characteristics.s.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.t.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.ag.initial",
                                    "mode": 2,
                                    "value": -5 * value,
                                    "priority": null
                                }
                            ]
                        });
                    } else {
                        this.effect.update({"changes": []});
                    };
                    this.item.update({"system.specification.value": value});
                };
            };
        }
        //Уменьшить [Manually Invoked]:
        {
            if (this.actor.token) {
                let trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
                if (!trait) {
                    for (let pack of game.wfrp4e.tags.getPacksWithTag("trait")) {
                        const index = pack.indexed ? pack.index : await pack.getIndex();
                        let indexResult = index.find(t => t.type == "trait" && t.name == game.i18n.localize("NAME.Size"));
                        if (indexResult) {
                            let item = (await pack.getDocument(indexResult._id)).toObject();
                            item.system.specification.value = game.i18n.localize("SPEC.Average");
                            this.actor.createEmbeddedDocuments("Item", [item]);
                        };
                    };
                    trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
                };
                let sizeSpecifiers = Object.values(game.wfrp4e.config.actorSizes);
                if (sizeSpecifiers.indexOf(trait.system.specification.value) > 0) {
                    trait.update({"system.specification.value": sizeSpecifiers[sizeSpecifiers.indexOf(trait.system.specification.value) - 1]});
                    let value = (parseInt(this.item.system.specification.value) || 0) - 1;
                    if (value > 0) {
                        this.effect.update({
                            "changes": [
                                {
                                    "key": "system.characteristics.s.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.t.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.ag.initial",
                                    "mode": 2,
                                    "value": -5 * value,
                                    "priority": null
                                }
                            ]
                        });
                        value = "+" + value;
                    } else if (value < 0) {
                        this.effect.update({
                            "changes": [
                                {
                                    "key": "system.characteristics.s.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.t.initial",
                                    "mode": 2,
                                    "value": 10 * value,
                                    "priority": null
                                },
                                {
                                    "key": "system.characteristics.ag.initial",
                                    "mode": 2,
                                    "value": -5 * value,
                                    "priority": null
                                }
                            ]
                        });
                    } else {
                        this.effect.update({"changes": []});
                    };
                    this.item.update({"system.specification.value": value});
                };
            };
        }
    //Настройка:
        //Настройка [Add Items]:
        {
            let trait = this.actor.items.find(i => i.name.includes(game.i18n.localize("NAME.Size")));
            if (!trait) {
                for (let pack of game.wfrp4e.tags.getPacksWithTag("trait")) {
                    const index = pack.indexed ? pack.index : await pack.getIndex();
                    let indexResult = index.find(t => t.type == "trait" && t.name == game.i18n.localize("NAME.Size"));
                    if (indexResult) {
                        let item = (await pack.getDocument(indexResult._id)).toObject();
                        item.system.specification.value = game.i18n.localize("SPEC.Average");
                        this.actor.createEmbeddedDocuments("Item", [item])
                    };
                };
            };
            this.effect.delete();
        }

//Изменение характеристик:
    //Изменение характеристик:
        //Изменение [Prepare Item]:
        {
            if (args.item == this.item) {
                this.effect.update({
                    "changes": [
                        {
                            "key": "system.characteristics.ws.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.bs.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.s.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.t.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.i.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.ag.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.dex.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.int.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.wp.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        },
                        {
                            "key": "system.characteristics.fel.initial",
                            "mode": 2,
                            "value": this.item.system.specification.value,
                            "priority": null
                        }
                    ]
                });
            }
        }

//Маг:
    //Маг:
        //Генерация заклинаний [Create Token]:
        {
            let spells = await game.wfrp4eAssistant.utility.findAllSpells(Object.keys(game.wfrp4e.config.magicLores)[Object.values(game.wfrp4e.config.magicLores).indexOf(this.item.system.specification.value.split(",")[0])] || "arcane", this.item.system.specification.value.split(",")[2]);
            for (let i = this.item.system.specification.value.split(",")[1]; i > 0; i--) {
                let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
                let spell = spells[result].toObject();
                this.actor.createEmbeddedDocuments("Item", [spell])
                await spells.splice(result, 1)
            };
        }
        //Изменить Школу магии [Manually Invoked]:
        {
            let specification;
            let lores = ItemDialog.objectToArray(game.wfrp4e.config.magicLores);
            lores = lores.map(l => {l.img = `modules/wfrp4e-core/icons/spells/${l.id}.png` || ""; return l});
            if (game.modules.has("wfrp4e-archives2")) {
                lores[lores.findIndex(l => l.id == "greatMaw")].img = "modules/wfrp4e-archives2/assets/icons/great-maw.png";
            };
            if (game.modules.has("wfrp4e-horned-rat")) {
                lores[lores.findIndex(l => l.id == "plague")].img = "modules/wfrp4e-horned-rat/assets/icons/plague.png";
                lores[lores.findIndex(l => l.id == "ruin")].img = "modules/wfrp4e-horned-rat/assets/icons/ruin.png";
                lores[lores.findIndex(l => l.id == "stealth")].img = "modules/wfrp4e-horned-rat/assets/icons/stealth.png";
            };

            let choice = await ItemDialog.create(lores, 1, {text: "Укажите школу магии:", title: game.i18n.localize("NAME.Lore")});
            if (choice.length) {specification = choice[0].name}
            else {specification = game.i18n.localize("WFRP4E.MagicLores.arcane")};

            let count = await foundry.applications.api.DialogV2.prompt({
                window: {title: "Количество заклинаний"},
                content: '<input name="count" type="number" min="1" step="1" autofocus>',
                ok: {
                    label: "Указать",
                    callback: (event, button, dialog) => button.form.elements.count.valueAsNumber
                }
            });
            if (count && count > 0) {specification += "," + count}
            else {specification += ",1"};

            let arcane = await foundry.applications.api.DialogV2.confirm({yes: {default: true}, content: "Вы хотите добавить Общие заклинания в список для генерации?", window: {title: "Общие заклинания"}});
            if (arcane) {specification += ",true"};

            this.item.update({"system.specification.value": specification});
        }
    //Указать Школу магии:
        //Выбор Школы магии [Add Items]:
        {
            let specification;
            let lores = ItemDialog.objectToArray(game.wfrp4e.config.magicLores);
            lores = lores.map(l => {l.img = `modules/wfrp4e-core/icons/spells/${l.id}.png` || ""; return l});
            if (game.modules.has("wfrp4e-archives2")) {
                lores[lores.findIndex(l => l.id == "greatMaw")].img = "modules/wfrp4e-archives2/assets/icons/great-maw.png";
            };
            if (game.modules.has("wfrp4e-horned-rat")) {
                lores[lores.findIndex(l => l.id == "plague")].img = "modules/wfrp4e-horned-rat/assets/icons/plague.png";
                lores[lores.findIndex(l => l.id == "ruin")].img = "modules/wfrp4e-horned-rat/assets/icons/ruin.png";
                lores[lores.findIndex(l => l.id == "stealth")].img = "modules/wfrp4e-horned-rat/assets/icons/stealth.png";
            };

            let choice = await ItemDialog.create(lores, 1, {text: "Укажите школу магии:", title: game.i18n.localize("NAME.Lore")});
            if (choice.length) {specification = choice[0].name}
            else {specification = game.i18n.localize("WFRP4E.MagicLores.arcane")};

            let count = await foundry.applications.api.DialogV2.prompt({
                window: {title: "Количество заклинаний"},
                content: '<input name="count" type="number" min="1" step="1" autofocus>',
                ok: {
                    label: "Указать",
                    callback: (event, button, dialog) => button.form.elements.count.valueAsNumber
                }
            });
            if (count && count > 0) {specification += "," + count}
            else {specification += ",1"};

            let arcane = await foundry.applications.api.DialogV2.confirm({yes: {default: true}, content: "Вы хотите добавить Общие заклинания в список для генерации?", window: {title: "Общие заклинания"}});
            if (arcane) {specification += ",true"};

            this.item.update({"system.specification.value": specification});
            this.effect.delete();
        }

//Наложение цвета при смерти:
    //Наложение цвета при смерти:
        //Учёт ран [Wound Calculation]:
        {
            if (this.actor.uuid.includes(".Token.")) {
                if (this.actor.system.status.wounds.value <= 0) {
                    this.actor.token.update({
                        texture: {
                            tint: this.item.system.specification.value
                        }
                    });
                } else {
                    this.actor.token.update({
                        texture: {
                            tint: "#FFFFFF"
                        }
                    });
                };
            };
        }

//Случайные значения характеристик:
    //Случайные значения характеристик:
        //Генерация [Create Token]:
        {
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
            this.item.delete();
        }

//Сохранить актёра:
    //Сохранить актёра:
        //Сохранить [Manually Invoked]:
        {
            let actorData = this.actor.toObject();
            actorData.prototypeToken = this.actor.token.toObject();
            await Actor.create(actorData);
            this.item.delete();
        }

//Уход в защиту:
    //Уход в защиту:
        //Изменить навык [Manually Invoked]:
        {
            let choice = await ItemDialog.create(this.actor.itemTypes.skill.sort((a, b) => a.name > b.name ? 1 : -1), 1, {text: "Выберите, какой навык использовать для Ухода в защиту:", title: "Изменить навык"});
            this.item.update({"system.specification.value": choice[0]?.name});
        }
        //@effect.name [Dialog]:
            //Скрипт диалога
            {
                args.prefillModifiers.modifier += 20
            }
            //Скрыть скрипт
            {
                return !this.actor.isOpposing || args.skill?.name != this.item.system.specification.value
            }
            //Активировать скрипт
            {
                return true
            }
            //Скрипт отправки
            {
                
            }
        //Отключить [Manually Invoked]:
        {
            this.item.update({"system.specification.value": ""});
        }