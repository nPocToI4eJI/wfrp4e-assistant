class WFRP_Assistant_Utility {
    static async findAllSpells(lore, arcane) {
        if (lore == "arcane") {lore = ""};
        let spells = game.items.contents.filter(i => i.type == "spell" && (i.lore.value == lore || (arcane && i.lore.value == "")));
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
                if (!spellsName.includes(packSpell.name) && (packSpell.lore.value == lore || (arcane && packSpell.lore.value == ""))) {
                    spells.push(packSpell);
                    spellsName.push(packSpell.name);
                };
            };
        };

        return spells;
    };

    static generateBookTitle(type) {
        let title = game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Adjetive.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Adjetive).length) + 1}`) + " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Main.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Main).length) + 1}`);
        if (type == "Random") {
            let randType = types[Math.floor(CONFIG.Dice.randomUniform() * types.length)];
            title += " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.${randType}.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${randType}`]).length) + 1}`);
        }
        else {title += " " + game.i18n.localize(`WFRP4E.Assistant.BooksTitle.${type}.${Math.floor(CONFIG.Dice.randomUniform() * Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle[`${type}`]).length) + 1}`)};
    
        return title;
    };
};

Hooks.once("init", function () {
    game.wfrp4eAssistant = {
        utility: WFRP_Assistant_Utility
    };
});