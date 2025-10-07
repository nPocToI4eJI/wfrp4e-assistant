//Этот файл не несёт никакой функции, он только демонстрирует скрипт макроса "Придумать ругательство"

let swear1 = (await game.wfrp4e.tables.findTable("swearing", "a").roll()).results[0];
if (swear1.description) {swear1 = `<span data-tooltip="${swear1.description}" style="text-decoration: underline;">${swear1.name}</span>`}
else {swear1 = `<span>${swear1.name}</span>`};
let swear2 = (await game.wfrp4e.tables.findTable("swearing", "b").roll()).results[0];
if (swear2.description) {swear2 = `<span data-tooltip="${swear2.description}" style="text-decoration: underline;">${swear2.name}</span>`}
else {swear2 = `<span>${swear2.name}</span>`};
let swear3 = (await game.wfrp4e.tables.findTable("swearing", "c").roll()).results[0];
if (swear3.description) {swear3 = `<span data-tooltip="${swear3.description}" style="text-decoration: underline;">${swear3.name}</span>`}
else {swear3 = `<span>${swear3.name}</span>`};

let speaker;
if (game.user.character) {speaker = {actor: game.user.character}}
else {speaker = {alias: `${game.user.name}`}};
let chatData = { 
	speaker: speaker,
	flavor: "Придумал оскорбление",
	content: `<p><i>${swear1}, ${swear2}, ${swear3}.</i></p>`
};
ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
ChatMessage.create(chatData);