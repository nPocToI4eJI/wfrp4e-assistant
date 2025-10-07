//Этот файл не несёт никакой функции, он только демонстрирует скрипт макроса "Создать свиток заклинания"

function selectLore(label, icon) {
    new Promise(resolve => {
        new Dialog({
            title: game.i18n.localize("NAME.Lore"),
            content: `
                <div class="systemFix" style="height: 25px;">
                    <select id="lore" style="width: 100%; text-align: center; color: white; background-color: black;">
                        <option value="rand">${game.i18n.localize("WFRP4E.Assistant.systemFix.Randomize")}</option>
                        <option value="petty">${game.i18n.localize("WFRP4E.MagicLores.petty")}</option>
                        <option value="arcane">${game.i18n.localize("WFRP4E.MagicLores.arcane")}</option>
                        <option value="beasts">${game.i18n.localize("WFRP4E.MagicLores.beasts")}</option>
                        <option value="death">${game.i18n.localize("WFRP4E.MagicLores.death")}</option>
                        <option value="fire">${game.i18n.localize("WFRP4E.MagicLores.fire")}</option>
                        <option value="heavens">${game.i18n.localize("WFRP4E.MagicLores.heavens")}</option>
                        <option value="metal">${game.i18n.localize("WFRP4E.MagicLores.metal")}</option>
                        <option value="life">${game.i18n.localize("WFRP4E.MagicLores.life")}</option>
                        <option value="light">${game.i18n.localize("WFRP4E.MagicLores.light")}</option>
                        <option value="shadow">${game.i18n.localize("WFRP4E.MagicLores.shadow")}</option>
                        <option value="hedgecraft">${game.i18n.localize("WFRP4E.MagicLores.hedgecraft")}</option>
                        <option value="witchcraft">${game.i18n.localize("WFRP4E.MagicLores.witchcraft")}</option>
                        <option value="daemonology">${game.i18n.localize("WFRP4E.MagicLores.daemonology")}</option>
                        <option value="necromancy">${game.i18n.localize("WFRP4E.MagicLores.necromancy")}</option>
                        ${game.modules.has("wfrp4e-archives2") ? `<option value="greatMaw" title="${game.i18n.localize("WFRP4E.Assistant.systemFix.NoRand")}">${game.i18n.localize("WFRP4E.MagicLores.greatmaw")}*</option>` : ""}
                        <option value="undivided">${game.i18n.localize("WFRP4E.MagicLores.undivided")}</option>
                    </select>
                </div>
            `,
            default: "roll",
            buttons: {
                roll: {
                    icon: icon,
                    label: label,
                    callback: html => resolve(generateItem(html.find('[id=lore]')[0].value))
                },
            },
            close: () => resolve(null)
        }).render(true);
    });
};

//Функция тасования Фишера—Йетса
function shuffle(array) {
	for (let i = array.length - 1; i > 0; i--) {
		let j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	};
	return array;
};

async function generateItem(lore) {
	let img;
	if (lore == "rand") {
		lore = (await game.wfrp4e.tables.findTable("scroll", "lore").roll()).results[0].description;
		switch (lore.substring(lore.indexOf("#") + 1, lore.lastIndexOf("]"))) {
			case "petty-spells":            lore = "petty";         break;
            case "arcane-spells":           lore = "arcane";        break;
            case "the-lore-of-beasts":      lore = "beasts";        break;
            case "the-lore-of-death":       lore = "death";         break;
            case "the-lore-of-fire":        lore = "fire";          break;
            case "the-lore-of-heavens":     lore = "heavens";       break;
            case "the-lore-of-metal":       lore = "metal";         break;
            case "the-lore-of-life":        lore = "life";          break;
            case "the-lore-of-light":       lore = "light";         break;
            case "the-lore-of-shadow":      lore = "shadow";        break;
            case "the-lore-of-hedgecraft":  lore = "hedgecraft";    break;
            case "the-lore-of-witchcraft":  lore = "witchcraft";    break;
            case "the-lore-of-daemonology": lore = "daemonology";   break;
            case "the-lore-of-necromancy":  lore = "necromancy";    break;
            case "chaos-magic":             lore = "undivided";     break;
		};
	};
    switch (lore) {
        case "petty":       img = "icons/sundries/scrolls/scroll-rolled-brown.webp";               break;
        case "arcane":      img = "icons/sundries/scrolls/scroll-bound-sealed-red.webp";              break;
        case "beasts":      img = "icons/sundries/scrolls/scroll-bound-gold-brown.webp";              break;
        case "death":       img = "icons/sundries/scrolls/scroll-bound-tan-grey.webp";                    break;
        case "fire":        img = "icons/sundries/scrolls/scroll-bound-red-tan.webp";         break;
        case "heavens":     img = "icons/sundries/scrolls/scroll-bound-blue-white.webp";    break;
        case "metal":       img = "icons/sundries/scrolls/scroll-bound-sealed-gold-red.webp";                break;
        case "life":        img = "icons/sundries/scrolls/scroll-bound-green.webp";              break;
        case "light":       img = "icons/sundries/scrolls/scroll-bound-white-tan.webp";                   break;
        case "shadow":      img = "icons/sundries/scrolls/scroll-bound-black-brown.webp";                      break;
        case "hedgecraft":  img = "icons/sundries/scrolls/scroll-bound-brown-tan.webp";                    break;
        case "witchcraft":  img = "icons/sundries/scrolls/scroll-rolled-wrap.webp";                      break;
        case "daemonology": img = "icons/sundries/scrolls/scroll-bound-skull-blue.webp";                      break;
        case "necromancy":  img = "icons/sundries/scrolls/scroll-bound-skull-brown.webp";               break;
        case "greatMaw":    img = "icons/sundries/scrolls/scroll-bound-skull-white.webp";                 break;
        case "undivided":   lore = ["tzeentch", "nurgle", "slaanesh"][Math.floor(CONFIG.Dice.randomUniform() * 3)];
        case "nurgle":
        case "slaanesh":
        case "tzeentch":    img = `icons/sundries/scrolls/scroll-${["bound-diamond-brown", "bound-grey-tan", "bound-sealed-red-green", "bound-ruby-red"][Math.floor(CONFIG.Dice.randomUniform() * 4)]}.webp`; break;
    };
	let cn = (await game.wfrp4e.tables.findTable("scroll", "cn").roll()).results[0].description.replace(/<[^>]*>/g, "");
    let rolledCN = cn;
	let spells = await game.wfrp4eAssistant.utility.findAllSpells(lore, game.settings.get("wfrp4e-assistant", "enableArcane"));
	spells = shuffle(spells).filter(s => s.system.cn.value <= rolledCN);
    let spell;
	for (let i = rolledCN; i >= 0; i--) {
		let CNSpells = spells.filter(s => s.system.cn.value == cn);
        if (CNSpells.length) {
            let result = Math.floor(CONFIG.Dice.randomUniform() * CNSpells.length);
            spell = CNSpells[result];
            break;
        } else {cn--};
	};
	if (spell) {
        let folder = "";
        if (game.items.folders.get(game.settings.get("wfrp4e-assistant", "scrollsFolder")) || game.settings.get("wfrp4e-assistant", "scrollsFolder") == "") {folder = game.settings.get("wfrp4e-assistant", "scrollsFolder")}
        else {
            ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Error"));
            game.settings.set("wfrp4e-assistant", "scrollsFolder", "");
        };
		await Item.implementation.create({
			type: "trapping", 
			name: `${game.i18n.localize("WFRP4E.Assistant.systemFix.Generate.Scroll")} (${spell.name})`, 
			img: img,
			folder: folder,
			system: {
				trappingType: {
					value: "booksAndDocuments",
				},
			    encumbrance: {value: 0},
				description: {
					value: `<h4>@UUID[${spell.uuid}]</h4>`
				},
				gmdescription: {
					value: `<p><b data-tooltip="${game.i18n.localize('NAME.Lore')}">${game.i18n.localize(`WFRP4E.MagicLores.${lore}`)}</b>: <i data-tooltip="${game.i18n.localize('SHEET.CN')}">${cn}</i></p>`
				}
			}
		}, {renderSheet: true});
	} else {
		ui.notifications.notify(game.i18n.format("WFRP4E.Assistant.systemFix.Generate.ScrollError", {lore: game.i18n.localize(`WFRP4E.MagicLores.${lore}`), cn: rolledCN}));
		generateItem(lore);
	};
};

selectLore(game.i18n.format("WFRP4E.Assistant.systemFix.Generate.Title", {name: game.i18n.localize("WFRP4E.Assistant.systemFix.Generate.Scroll")}), "<i class='fas fa-scroll'></i>");