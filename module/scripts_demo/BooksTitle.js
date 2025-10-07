//Этот файл не несёт никакой функции, он только демонстрирует скрипт макроса "Название книги"

let types = Object.keys(game.i18n.translations.WFRP4E.Assistant.BooksTitle.Types)
let options = `<option value="Random">${game.i18n.localize("WFRP4E.Assistant.BooksTitle.Type.Random")}</option>`;
for (let i = 0; i < types.length; i++) {options += `<option value="${types[i]}">${game.i18n.localize(`WFRP4E.Assistant.BooksTitle.Types.${types[i]}`)}</option>`};
new Promise(resolve => {
    new Dialog({
        title: game.i18n.localize("WFRP4E.Assistant.BooksTitle.Title"),
        content: `
            <div class="booksTitle">
                <input id="count" type="number" step="1" min="1" value="1" title="${game.i18n.localize("WFRP4E.Assistant.BooksTitle.Quantity")}" style="flex: 1;">
                <select id="type" title="${game.i18n.localize("WFRP4E.Assistant.BooksTitle.Type.Title")}" style="flex: 4;">${options}</select>
            </div>
        `,
        default: "roll",
        buttons: {
            roll: {
                icon: "<i class='fas fa-dice'></i>",
                label: game.i18n.localize("WFRP4E.Assistant.BooksTitle.Roll"),
                callback: html => resolve(generateItem(html.find('[id=count]')[0].value, html.find('[id=type]')[0].value))
            },
        },
        close: () => resolve(null)
    }).render(true);
});

function generateItem(count, type) {
	let books = "";
	for (let i = count; i > 0; i--) {
		if (books != "") {books += "<hr>"};
        books += `<p>${game.wfrp4eAssistant.utility.generateBookTitle(type)}</p>`;
	};

    let speaker;
    if (game.user.character) {speaker = {actor: game.user.character}}
    else {speaker = {alias: `${game.user.name}`}};
    let chatData = { 
        speaker: speaker,
        content: `<div class="booksTitleChat">${books}</div>`
    };
    ChatMessage.applyRollMode(chatData, game.settings.get("core", "rollMode"));
    ChatMessage.create(chatData);
};