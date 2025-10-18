Hooks.once("init", function () {
    game.settings.register("wfrp4e-assistant", "enableArcane", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.enableArcane.Hint"),
		scope: "world",
		config: true,
		default: true,
		type: Boolean
	});
	game.settings.register("wfrp4e-assistant", "grimoiresFolder", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
        onChange: value => {
            value = value.replace("Folder.", "");
            if (!game.items.folders.get(value) && value != "") {
                ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.grimoiresFolder.Error"));
                game.settings.set("wfrp4e-assistant", "grimoiresFolder", "");
            } else {game.settings.set("wfrp4e-assistant", "grimoiresFolder", value)};
        }
	});
	game.settings.register("wfrp4e-assistant", "scrollsFolder", {
		name: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Name"),
		hint: game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Hint"),
		scope: "world",
		config: true,
		default: "",
		type: String,
        onChange: value => {
            value = value.replace("Folder.", "");
            if (!game.items.folders.get(value) && value != "") {
                ui.notifications.error(game.i18n.localize("WFRP4E.Assistant.systemFix.Settings.scrollsFolder.Error"));
                game.settings.set("wfrp4e-assistant", "scrollsFolder", "");
            } else {game.settings.set("wfrp4e-assistant", "scrollsFolder", value)};
        }
	});

    if (game.modules.has("wfrp4e-archives2")) {
        WFRP4E.magicLores["greatMaw"] = game.i18n.localize("WFRP4E.MagicLores.greatmaw");
        WFRP4E.magicWind["greatMaw"] = game.i18n.localize("WFRP4E.MagicWind.greatmaw");
        WFRP4E.loreEffectDescriptions["greatMaw"] = game.i18n.localize("WFRP4E.greatmaw.descriptions");
    };

    systemConfig().effectScripts["s6eZXfZkC1My6EXl"] = `let lore = Object.keys(game.wfrp4e.config.magicLores)[Object.values(game.wfrp4e.config.magicLores).indexOf(this.effect.name.split(" ")[2])];
if (args.item.type == "spell" && args.item.system.lore.value == lore) {args.item.system.cn.value = Math.max(0, args.item.system.cn.value - 1)};`;
});