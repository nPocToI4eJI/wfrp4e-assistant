//Этот файл не несёт никакой функции, он только демонстрирует скрипт макроса "Создать случайный гримуар"

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
        case "petty":       img = "icons/sundries/books/book-tooled-gold-brown.webp";               break;
        case "arcane":      img = "icons/sundries/books/book-tooled-gold-purple.webp";              break;
        case "beasts":      img = "icons/sundries/books/book-tooled-blue-yellow.webp";              break;
        case "death":       img = "icons/sundries/books/book-purple-glyph.webp";                    break;
        case "fire":        img = "icons/sundries/books/book-symbol-fire-gold-orange.webp";         break;
        case "heavens":     img = "icons/sundries/books/book-symbol-lightning-silver-blue.webp";    break;
        case "metal":       img = "icons/sundries/books/book-backed-blue-gold.webp";                break;
        case "life":        img = "icons/sundries/books/book-clasp-spiral-green.webp";              break;
        case "light":       img = "icons/sundries/books/book-embossed-blue.webp";                   break;
        case "shadow":      img = "icons/sundries/books/book-black-grey.webp";                      break;
        case "hedgecraft":  img = "icons/sundries/books/book-simple-brown.webp";                    break;
        case "witchcraft":  img = "icons/sundries/books/book-worn-brown.webp";                      break;
        case "daemonology": img = "icons/sundries/books/book-face-black.webp";                      break;
        case "necromancy":  img = "icons/sundries/books/book-symbol-skull-grey.webp";               break;
        case "greatMaw":    img = "icons/sundries/books/book-backed-wood-tan.webp";                 break;
        case "undivided":   {
            lore = ["tzeentch", "nurgle", "slaanesh"][Math.floor(CONFIG.Dice.randomUniform() * 3)];
            img = `icons/sundries/books/book-${["eye-pink", "reye-reptile-brown", "face-blue", "mimic"][Math.floor(CONFIG.Dice.randomUniform() * 4)]}.webp`;
            break;
        };
    };
	let cn = (await game.wfrp4e.tables.findTable("random-grimoire", "cn").roll()).results[0].description;
	let spells = await game.wfrp4eAssistant.utility.findAllSpells(lore, game.settings.get("wfrp4e-assistant", "enableArcane"));
	spells = spells.filter(item => item.system.cn.value <= cn);
	let resultSpells = "";
	for (let i = (await game.wfrp4e.tables.findTable("random-grimoire", "spells").roll()).results[0].description; i > 0; i--) {
		let result = Math.floor(CONFIG.Dice.randomUniform() * spells.length);
		resultSpells += `<li><h6>@UUID[${spells[result].uuid}]</h6></li>`
		await spells.splice(result, 1)
	};
    let folder = "";
	if (game.items.folders.get(game.settings.get("wfrp4e-assistant", "grimoiresFolder")) || game.settings.get("wfrp4e-assistant", "grimoiresFolder") == "") {folder = game.settings.get("wfrp4e-assistant", "grimoiresFolder")}
    else {
        ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Error"));
        game.settings.set("wfrp4e-assistant", "grimoiresFolder", "");
    };
	await Item.implementation.create({
		type: "trapping",
		name: `${game.i18n.localize("WFRP4E.Assistant.systemFix.Generate.Grimoire")} (${game.i18n.localize(`WFRP4E.MagicLores.${lore}`)})`,
		img: img,
		folder: folder,
		system: {
			trappingType: {
				value: "booksAndDocuments",
			},
			encumbrance: {value: 1},
			description: {
				value: `<p><b>${game.i18n.localize("WFRP4E.Assistant.systemFix.Grimoire.Spells")}:</b></p>
				<ul>
					${resultSpells}
				</ul>
				<p><b>${game.i18n.localize("WFRP4E.Assistant.systemFix.Grimoire.Appearance")}:</b> <i>${(await game.wfrp4e.tables.findTable("random-grimoire", "type").roll()).results[0].description}</i></p>
				<p><b>${game.i18n.localize("WFRP4E.Assistant.systemFix.Grimoire.Features")}:</b></p>
				<ul>
  					<li>${(await game.wfrp4e.tables.findTable("random-grimoire", "characteristic1").roll()).results[0].description}</li>
  					<li>${(await game.wfrp4e.tables.findTable("random-grimoire", "characteristic2").roll()).results[0].description}</li>
				</ul>`
			},
			gmdescription: {
				value: `<p><b data-tooltip="${game.i18n.localize('NAME.Lore')}">${game.i18n.localize(`WFRP4E.MagicLores.${lore}`)}</b>: <i data-tooltip="${game.i18n.localize('Max')} ${game.i18n.localize('SHEET.CN')}">${cn}</i></p>`
			}
		}
	}, { renderSheet: true });
};

selectLore(game.i18n.format("WFRP4E.Assistant.systemFix.Generate.Title", {name: game.i18n.localize("WFRP4E.Assistant.systemFix.Generate.Grimoire")}), "<i class='fas fa-book'></i>");