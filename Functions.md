# Методы
_В модуле присутствуют новые методы, которые нужны для работы макросов и скриптов. Тем не менее, они могут быть использованы и извне._

## Содержание
- [generateBookTitle](#generateBookTitletype)
- [getActorFromUUID](#getActorFromUUIDuuid)
- [getReaction](#getReactionactor-opponent-action)

### generateBookTitle(type)
_Этот метод генерирует случайное название для книги в стилистике сеттинга. Варианты названий взяты у [Paco's Miscellaneous Stuff](https://pacomiscelaneousstuff.blogspot.com/2020/02/wfrp4-random-book-generator.html) и переведены мной на русский._
- **type** _(String)_: тема генерируемой книги. Пустое значение или значение **"Random"** выбирают случайную тему.

#### Добавление своих вариантов.
_Метод позволяет добавлять свои варианты к существующим темам, а так же создавать свои темы для генерации._

Темы находятся напрямую в файлах перевода. Существующие можно найти по пути **"WFRP4E.Assistant.BooksTitle.Types"**, а входящие в искомую тему варианты: **"WFRP4E.Assistant.BooksTitle.{Ключ темы}"**.

Для того, чтобы добавить свои варианты к существующей теме, необходимо добавить их по пути **"WFRP4E.Assistant.BooksTitle.{Ключ темы}.{Ключ своего варианта}"**.  
Рекомендуется использовать собственный префикс для **{Ключ своего варианта}**, чтобы избежать перезаписи другими модулями:
```
"Medicine": {
    "my1": "Мой вариант",
    "my2": "Тоже мой вариант",
    "my3": "Это мой вариант?"
}
```
Для добавления своего варианта, необходимо указать его ключ и перевод в **"WFRP4E.Assistant.BooksTitle.Types"**, а варианты вписать в **"WFRP4E.Assistant.BooksTitle.{Ключ темы}"**:
```
"Types": {
    "MyType": "Моя тема"
},
"MyType": {
    "1": "Мой вариант",
    "2": "Тоже мой вариант",
    "3": "Это мой вариант?"
}
```
Пример использования: `game.wfrp4e.utility.generateBookTitle("Medicine")` или `game.wfrp4e.utility.generateBookTitle("MyType")`.

### getActorFromUUID(uuid)
_Этот метод принимает полный UUID и возвращает актёра. Принимает UUID в формате "Scene.*id*.Token.*id*.Actor.*id*" или "Actor.*id*"._
- **uuid** _(String)_: полный UUID, который можно получить, нажав на "Копирование UUID" в шапке актёра.

Пример: `game.wfrp4e.utility.getActorFromUUID("Actor.H1DazXpCBBJ42fsF")` вернёт актёра с id = "H1DazXpCBBJ42fsF".

### getReaction(actor, opponent, action)
_Этот метод используется для определения и создания реакций на события для выбранного Актёра._
- **actor** _(Object)_: данные Актёра.
  - **name** _(String)_: имя Актёра. Используется, если включён параметр "Отправлять реакции в чат".
  - **species** _(String)_: ключ Народа, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: _WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]_.
  - **tokens** _(Array)_: массив, содержащий Токены выбранного Актёра.
  - **to** _(String)_: ключ конечности, для попадания по которой будут определяться реакции. Реакции находятся по следующему пути локализации: _WFRP4E.Assistant.Helpers.Reactions.List["actor.species"].takeDamage.To["actor.to"]_.
- **opponent** _(Object)_: данные противника _(необязательный параметр)_.
  - **species** _(String)_: ключ Народа, для которого будут определяться реакции. Реакции находятся по следующему пути локализации: _WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]."action".Opponent["opponent.species"]_.
  - **to** _(String)_: ключ конечности, для попадания по которой будут определяться реакции. Реакции находятся по следующему пути локализации: _WFRP4E.Assistant.Helpers.Reactions.List["actor.species"].applyDamage.To["opponent.to"]_.
- **action** _(String)_: ключ действия. Реакции находятся по следующему пути локализации: _WFRP4E.Assistant.Helpers.Reactions.List["actor.species"]["action"]_.

Пример: `game.wfrp4e.utility.getReaction({name: "Имя", species: "Human", tokens: [...токены], to: "Arm"}, {species: "Goblin"}, "takeDamage")` создаст облако чата над указанными токенами, в котором будет случайно выбранная из списка реакция. Список будет состоять из реакций для Human, против оппонента Goblin, для действия _Получение урона_, по части тела _Рука_.
