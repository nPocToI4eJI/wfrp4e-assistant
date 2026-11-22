<div align="center">

  # WFRP4e - Assistant

  <p>
    <a href="https://foundryvtt.com/packages/wfrp4e-assistant" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Assistant-FoundryVTT-orange?labelColor=darkred" alt="FoundryVTT"></a>
    <a href="https://foundryvtt.com/" rel="nofollow"><img src="https://img.shields.io/badge/V13-Совместимо-darkgreen?labelColor=orange" alt="Совместимость"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases" rel="nofollow"><img src="https://img.shields.io/github/v/release/nPocToI4eJI/wfrp4e-assistant?display_name=release&label=%D0%92%D0%B5%D1%80%D1%81%D0%B8%D1%8F&labelColor=darkgreen" alt="Последняя версия"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases/latest" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-assistant/latest/wfrp4e-assistant.zip?displayAssetName=false&label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D0%B9&labelColor=blue&color=darkgreen" alt="Скачивания"></a>
    <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-assistant/wfrp4e-assistant.zip?displayAssetName=false&label=%D0%92%D1%81%D0%B5%D0%B3%D0%BE&labelColor=darkgreen&color=darkred" alt="Скачиваний всего"></a>
  </p>

  <p>
    <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>
    <a href="https://www.youtube.com/@nPocTo_4eJI" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-black?logo=youtube&logoColor=%23FF0000" alt="Youtube"></a>
    <a href="https://boosty.to/npocto_4eji" rel="nofollow"><img src="https://img.shields.io/badge/Boosty-black?logo=boosty&logoColor=%23F15F2C" alt="Boosty"></a>
  </p>

  **[🇷🇺 Русский](#-русский) | [🇬🇧 English](#-english)**

</div>

---

<a id="-русский"></a>

**WFRP4e - Assistant** - модуль автоматизации и оживления НИП для системы **Warhammer Fantasy Roleplay 4th Edition** в Foundry VTT. Он позволяет Мастеру разнообразить противников и их отыгрыш при размещении токенов на сцене, управлять пресетами расстановки токенов, сортировать заклинания на листах персонажей и автоматически фиксировать полученные ранения.

> [!IMPORTANT]
> Для работы этого модуля **обязательно** требуется установленный и включённый базовый модуль **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)**.

### 📋 Содержание
- [Помощник создания НИП](#ru-helpers)
  - [Генерация имён](#ru-names)
  - [Наборы снаряжения и параметров](#ru-presets)
  - [Реакции НИП](#ru-reactions)
  - [Характеристики, размер, магия и состояние смерти](#ru-other-helpers)
  - [Шаблоны Помощника и экспорт НИП](#ru-templates)
- [Пресеты токенов на сцене](#ru-token-presets)
- [Улучшения листов и боя](#ru-qol)
  - [Фильтр заклинаний](#ru-spells-filter)
  - [Автоматические ранения](#ru-injuries)
  - [Макрос генерации имён](#ru-macro-name)
- [Настройки и Меню отладки](#ru-settings)
- [Связанные модули](#ru-modules)
- [Особые благодарности](#ru-thanks)

---

<a id="ru-helpers"></a>
### 🤝 Помощник создания НИП

Модуль добавляет в заголовок листа актёра кнопку **Помощника**, открывающую гибкое окно настройки. Все выбранные параметры автоматически применяются при каждом перетаскивании непривязанного токена на сцену, делая каждого НИП уникальным.

<details align="center">
<summary>📷 Скриншоты</summary>

![Меню Помощника](https://github.com/user-attachments/assets/eab30e05-1c89-471d-adbd-7531021d3e1d)

</details>

---

<a id="ru-names"></a>
#### 🏷️ Генерация имён
Автоматически подбирает атмосферное имя для каждого нового токена по заданному конструктору ключей.

* **Гибкий конструктор:** комбинируйте любые ключи (имя, фамилия, прозвище, дворянская приставка и т.д.), указывайте шанс срабатывания для каждого элемента (от `1%` до `100%`), альтернативы через `|` (например, `Male|Female`) или произвольные слова.
* **Локализация:** полные базы имён доступны на русском и английском языках.

<details>
<summary>📜 Поддерживаемые народы</summary>

* **Люди:** Империя, Бретонния, Кислев.
* **Старшие и союзные народы:** Гномы, Эльфы, Полурослики, Огры.
* **Зеленокожие:** Орки, Гоблины.
* **Силы Хаоса и разрушения:** Хаос, Зверолюды, Демоны, Скавены.
* **Звери (9 видов):** волк, крыса, паук, птица, змея, кабан, лошадь, медведь, собака.

</details>

---

<a id="ru-presets"></a>
#### 📦 Наборы снаряжения и параметров
Позволяет настроить несколько вариаций одного базового актёра (например, *Стражник с алебардой*, *Стражник со щитом*, *Арбалетчик*), которые будут случайно выбираться с учётом заданной **вероятности**.

* **Снаряжение:** перетащите предметы актёра в нужный набор - при создании токена останутся только предметы выбранного набора, а лишние автоматически удалятся.
* **Замена токена:** поддерживает маски файлов (например, `Spear_*.png`) для автоматического подбора соответствующей картинки токена под выпавший набор.
* **Модификаторы характеристик:** точечные прибавки или штрафы ко всем характеристикам для конкретного набора.
* **Подмена ключей имени:** возможность переопределить правила генерации имени (например, для мужских и женских вариаций).

<details align="center">
<summary>📷 Скриншоты</summary>

![Наборы](https://github.com/user-attachments/assets/7dc06ccb-cac2-4d0b-a933-75e9c26e5487)

</details>

---

<a id="ru-reactions"></a>
#### 💬 Реакции НИП
Оживляет сражения: НИП реагируют репликами на ключевые события боя (атаки, попадания, промахи, получение урона, гибель и встречные проверки).

* **Учёт противника:** реакции подбираются не только по народу и разновидности самого НИП, но и по тому, **против кого** он сражается.
* **Настраиваемый вывод:** всплывающие облака над токеном, сообщения в чат или оба варианта одновременно, а также индивидуальный шанс срабатывания для каждого актёра.
* **Быстрое переключение:** на панели **«Дополнительные инструменты»** (`WFRP4e - Tools`) добавляется кнопка *(только для Мастера)* для мгновенного включения или отключения всех реакций в мире.

<details>
<summary>📜 Поддерживаемые народы реакций и скриншоты</summary>

**Говорящие народы и их разновидности:**
* Империя, Бретонния, Кислев, Гномы, Эльфы, Полурослики, Огры.
* Зеленокожие (орки, гоблины), Хаос (мародёры, зверолюды), Скавены, Демоны, Нежить (скелеты, зомби, призраки, вампиры), Звери.
* Дополнительно предусмотрена категория **«Чудовище»** — без собственных реплик, но распознаваемая другими народами как особый тип противника.

<div align="center">
  
  ![Пример реплик НИП](https://github.com/user-attachments/assets/fee6ee15-a304-468f-a8d3-268511808b73)

</div>
</details>

---

<a id="ru-other-helpers"></a>
#### 🎲 Характеристики, размер, магия и состояние смерти
* **Случайные характеристики:** небольшой случайный разброс базовых характеристик при спавне, чтобы однотипные враги отличались друг от друга.
* **Случайный размер токена:** лёгкое случайное изменение масштаба токена для визуального разнообразия толпы.
* **Генерация заклинаний:** автоматическая выдача случайного числа заклинаний выбранной Школы Магии.
* **Отношение токена:** автоматическая установка отношения токена (Дружелюбный / Нейтральный / Враждебный / Скрытый).
* **Окрашивание при ранениях и смерти:** постепенное или мгновенное окрашивание токена при потере ран и гибели, автоматический перенос мёртвого токена на задний план (чтобы не перекрывать живых) и поддержка статуса смерти для модуля [**Health Estimate**](https://foundryvtt.com/packages/healthEstimate).

<details align="center">
<summary>📷 Скриншоты</summary>

![Пример токенов, сгенерированных Помощником](https://github.com/user-attachments/assets/37d806fe-e74c-4797-80c2-95c528f6f48e)

</details>

---

<a id="ru-templates"></a>
#### 📋 Шаблоны Помощника и экспорт НИП
* **Готовые и пользовательские шаблоны:** сохраняйте настроенные конфигурации Помощника в общую библиотеку шаблонов и применяйте их к другим актёрам в один клик.
* **Экспорт токена в полноценного актёра:** понравившийся случайно сгенерированный НИП прямо со сцены можно одной кнопкой «Экспортировать» превратить в отдельного привязанного персонажа в мире.

---

<a id="ru-token-presets"></a>
### 👥 Пресеты токенов на сцене *(только для Мастера)*

Кнопка на панели **«Дополнительные инструменты»** (`WFRP4e - Tools`) открывает менеджер расстановок для текущей сцены.

* **Сохранение расстановок:** сохраняйте текущее расположение всех токенов на сцене как именованный пресет (например, *«Дневная смена»*, *«Ночная засада»*, *«Праздник в таверне»*).
* **Загрузка и случайный выбор:** можно загрузить один выбранный пресет или отметить сразу несколько галочками - модуль случайно выберет один из них.
* **Аккуратная работа с персонажами:** непривязанные НИП пересоздаются с учётом настроек Помощника, а токены персонажей игроков и уникальных привязанных актёров аккуратно перемещаются на сохранённые позиции без пересоздания.
* **Очистка сцены:** удаление всех непривязанных НИП со сцены одной кнопкой (или через `Alt + ЛКМ` при загрузке пресета).

<details align="center">
<summary>📷 Скриншоты</summary>

![Пресеты токенов](https://github.com/user-attachments/assets/3a81a974-0e7d-4384-a869-9e8e6c583335)

</details>

---

<a id="ru-qol"></a>
### ✨ Улучшения листов и боя

<a id="ru-spells-filter"></a>
#### 📖 Фильтр заклинаний
Добавляет на вкладку **«Магия»** листа персонажа удобные инструменты сортировки:
* **Пользовательские категории:** создавайте собственные списки заклинаний с названием и иконкой [Font Awesome](https://fontawesome.com/) (*ЛКМ* - переключение категорий, *ПКМ* - настройка списка категорий или привязка заклинаний).
* **Скрытие простейших заклинаний:** отдельная кнопка быстрого сворачивания/разворачивания списка простейших заклинаний.

<a id="ru-injuries"></a>
#### 🩸 Автоматические ранения
При включении в настройках каждый раз, когда персонаж или НИП теряет раны от атаки, на его листе автоматически создаётся предмет типа **Ранение** с указанием нападавшего, использованного оружия, зоны попадания и количества потерянных ран.

<a id="ru-macro-name"></a>
#### 💻 Макрос генерации имён
Интегрируется в **Менеджер макросов** модуля `WFRP4e - Tools` и позволяет быстро сгенерировать нужное количество имён в чат по любому настроенному шаблону Помощника.

<details align="center">
<summary>📷 Скриншоты</summary>

![Фильтр заклинаний](https://github.com/user-attachments/assets/00c24cb4-8ff4-4daa-a613-212cce75d1c1)
![Макрос генерации имён](https://github.com/user-attachments/assets/b0651396-dcfd-4920-b733-4577763ce98d)

</details>

---

<a id="ru-settings"></a>
### ⚙️ Настройки и Меню отладки

**Основные настройки модуля:**
* **Помощник** - глобальное включение/отключение автоматизации создания НИП.
* **Шаблоны Помощника** - открытие редактора встроенных и пользовательских шаблонов.
* **Вывод реакций** - *Облако и чат* / *Только облако* / *Только чат*.
* **Автоматические ранения** - включение создания предметов ранений при получении урона.

**Интеграция с Меню отладки (`WFRP4e - Tools`):**
* **Экспорт / Импорт шаблонов** - сохранение пользовательских шаблонов Помощника в `.json` файл и перенос их в другие миры (с выбором замены или объединения).
* **Сброс шаблонов** - очистка всех пользовательских шаблонов.

<details align="center">
<summary>📷 Скриншоты</summary>

![Раздел WFRP4e - Assistant в Меню отладки](https://github.com/user-attachments/assets/5e861b79-ca47-4f38-a584-196564f58234)

</details>

---

<a id="ru-modules"></a>
### 🧩 Связанные модули

* **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** *(обязателен)* - базовый модуль инструментов, улучшений и исправлений для системы **Warhammer Fantasy Roleplay 4th Edition** в Foundry VTT.
* **[WFRP4e - Looting](https://github.com/nPocToI4eJI/wfrp4e-looting)** - этот модуль поможет Мастеру оптимизировать процесс создания уникального лута.
* **[WFRP4e - Sounds](https://github.com/nPocToI4eJI/wfrp4e-sounds)** - этот модуль содержит звуковые файлы, адаптированные для звуковой системы `WFRP4e - Tools`.
* **[WFRP4e - Print sheet](https://github.com/nPocToI4eJI/wfrp4e-print-sheet)** - модуль для экспорта листов персонажей и НИП из **Warhammer Fantasy Roleplay 4th Edition** в автономные редактируемые HTML-файлы.

---

<a id="ru-thanks"></a>
### 🙏 Особые благодарности
- **Александр** _(kotofeilove)_, за придумывание реакций для гоблинов. Они цепляют прямо за душу.
- **Bossga**, за тестирование первых версий модулей.

---

<a id="-english"></a>

**WFRP4e - Assistant** is an NPC automation and roleplay enhancement module for **Warhammer Fantasy Roleplay 4th Edition** on Foundry VTT. It allows the GM to diversify enemies and their roleplay when placing tokens on a scene, manage scene token placement presets, organize spells on character sheets, and automatically record sustained injuries.

> [!IMPORTANT]
> This module **requires** the core **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** module to be installed and enabled.

### 📋 Contents
- [NPC Creation Assistant](#en-helpers)
  - [Name Generation](#en-names)
  - [Equipment & Parameter Presets](#en-presets)
  - [NPC Reactions](#en-reactions)
  - [Characteristics, Size, Magic & Death State](#en-other-helpers)
  - [Assistant Templates & NPC Export](#en-templates)
- [Scene Token Presets](#en-token-presets)
- [Sheet & Combat Improvements](#en-qol)
  - [Spell Filter](#en-spells-filter)
  - [Automatic Injuries](#en-injuries)
  - [Name Generation Macro](#en-macro-name)
- [Settings & Debug Menu](#en-settings)
- [Related Modules](#en-modules)
- [Special Thanks](#en-thanks)

---

<a id="en-helpers"></a>
### 🤝 NPC Creation Assistant

The module adds an **Assistant** button to the actor sheet header, opening a flexible configuration window. All selected parameters are automatically applied each time an unlinked token is dragged onto a scene, making every NPC unique.

<details align="center">
<summary>📷 Screenshots</summary>

![Assistant Menu](https://github.com/user-attachments/assets/eab30e05-1c89-471d-adbd-7531021d3e1d)

</details>

---

<a id="en-names"></a>
#### 🏷️ Name Generation
Automatically picks an atmospheric name for each new token using a configurable key builder.

* **Flexible Builder:** combine any keys (first name, surname, moniker, noble prefix, etc.), set the trigger chance for each element (from `1%` to `100%`), alternatives using `|` (e.g., `Male|Female`), or custom words.
* **Localization:** complete name databases are available in both Russian and English.

<details>
<summary>📜 Supported Species</summary>

* **Humans:** Empire, Bretonnia, Kislev.
* **Elder & Allied Races:** Dwarfs, Elves, Halflings, Ogres.
* **Greenskins:** Orcs, Goblins.
* **Forces of Chaos & Destruction:** Chaos, Beastmen, Daemons, Skaven.
* **Beasts (9 types):** wolf, rat, spider, bird, snake, boar, horse, bear, dog.

</details>

---

<a id="en-presets"></a>
#### 📦 Equipment & Parameter Presets
Allows you to configure multiple variations of a single base actor (e.g., *Halberdier Guard*, *Shield Guard*, *Crossbowman*), which are randomly selected based on their assigned **probability**.

* **Equipment:** drag and drop the actor's items into the desired preset - when a token is created, only the items from the selected preset remain, while the rest are automatically removed.
* **Token Replacement:** supports filename wildcards (e.g., `Spear_*.png`) to automatically match an appropriate token image to the chosen preset.
* **Characteristic Modifiers:** fine-tuned bonuses or penalties to any characteristics for a specific preset.
* **Name Key Override:** option to override name generation rules (e.g., for male and female variations).

<details align="center">
<summary>📷 Screenshots</summary>

![Presets](https://github.com/user-attachments/assets/7dc06ccb-cac2-4d0b-a933-75e9c26e5487)

</details>

---

<a id="en-reactions"></a>
#### 💬 NPC Reactions
Brings combat to life: NPCs react with lines to key combat events (attacks, hits, misses, taking damage, death, and opposed tests).

* **Opponent Awareness:** reactions are chosen not only based on the NPC's own species and subtype, but also on **who** they are fighting.
* **Customizable Output:** chat bubbles above the token, chat messages, or both at once, plus an individual trigger chance per actor.
* **Quick Toggle:** adds a *(GM Only)* button to the **Additional Tools** bar (`WFRP4e - Tools`) to instantly enable or disable all reactions in the world.

<details>
<summary>📜 Supported Reaction Species & Screenshots</summary>

**Speaking Species & Subtypes:**
* Empire, Bretonnia, Kislev, Dwarfs, Elves, Halflings, Ogres.
* Greenskins (Orcs, Goblins), Chaos (Marauders, Beastmen), Skaven, Daemons, Restless Dead (Skeletons, Zombies, Ghosts, Vampires), Beasts.
* Additionally includes a **"Monstrous"** category — without its own lines, but recognized by other species as a distinct enemy type.

<div align="center">
  
  ![NPC Reactions Example](https://github.com/user-attachments/assets/fee6ee15-a304-468f-a8d3-268511808b73)

</div>
</details>

---

<a id="en-other-helpers"></a>
#### 🎲 Characteristics, Size, Magic & Death State
* **Random Characteristics:** slight random variance to base characteristics on spawn so identical enemies differ from one another.
* **Random Token Size:** subtle random token scaling for visual variety in crowds.
* **Spell Generation:** automatically grants a random number of spells from the selected Magic Lore.
* **Token Disposition:** automatically sets the token's disposition (Friendly / Neutral / Hostile / Secret).
* **Wound & Death Tinting:** gradual or instant token tinting upon losing wounds and dying, automatic sending of dead tokens to the background (so they don't overlap living ones), and death status support for the [**Health Estimate**](https://foundryvtt.com/packages/healthEstimate) module.

<details align="center">
<summary>📷 Screenshots</summary>

![Example of tokens generated by Assistant](https://github.com/user-attachments/assets/37d806fe-e74c-4797-80c2-95c528f6f48e)

</details>

---

<a id="en-templates"></a>
#### 📋 Assistant Templates & NPC Export
* **Built-in & Custom Templates:** save configured Assistant setups into a shared template library and apply them to other actors in one click.
* **Export Token to Full Actor:** turn a great randomly generated NPC straight from the scene into a standalone linked actor in the world with a single "Export" button.

---

<a id="en-token-presets"></a>
### 👥 Scene Token Presets *(GM Only)*

A button on the **Additional Tools** bar (`WFRP4e - Tools`) opens the token placement manager for the current scene.

* **Save Layouts:** save the current arrangement of all tokens on the scene as a named preset (e.g., *"Day Shift"*, *"Night Ambush"*, *"Tavern Festival"*).
* **Load & Random Selection:** load a single selected preset or check multiple boxes - the module will randomly pick one of them.
* **Smart Character Handling:** unlinked NPCs are respawned using their Assistant settings, while player characters and unique linked actors are cleanly moved to their saved positions without being recreated.
* **Clear Scene:** remove all unlinked NPCs from the scene with a single button (or via `Alt + LMB` when loading a preset).

<details align="center">
<summary>📷 Screenshots</summary>

![Token Presets](https://github.com/user-attachments/assets/3a81a974-0e7d-4384-a869-9e8e6c583335)

</details>

---

<a id="en-qol"></a>
### ✨ Sheet & Combat Improvements

<a id="en-spells-filter"></a>
#### 📖 Spell Filter
Adds convenient sorting tools to the **Magic** tab of character sheets:
* **Custom Categories:** create your own spell lists with a custom name and [Font Awesome](https://fontawesome.com/) icon (*LMB* - switch categories, *RMB* - edit the category list or assign spells).
* **Hide Petty Spells:** a dedicated toggle button to quickly collapse or expand the Petty Spells list.

<a id="en-injuries"></a>
#### 🩸 Automatic Injuries
When enabled in settings, whenever a character or NPC loses Wounds from an attack, an **Injury** item is automatically created on their sheet recording the attacker, weapon used, hit location, and Wounds lost.

<a id="en-macro-name"></a>
#### 💻 Name Generation Macro
Integrates into the **Macro Manager** of `WFRP4e - Tools`, allowing you to quickly generate any number of names into chat using any configured Assistant template.

<details align="center">
<summary>📷 Screenshots</summary>

![Spell Filter](https://github.com/user-attachments/assets/00c24cb4-8ff4-4daa-a613-212cce75d1c1)
![Name Generation Macro](https://github.com/user-attachments/assets/b0651396-dcfd-4920-b733-4577763ce98d)

</details>

---

<a id="en-settings"></a>
### ⚙️ Settings & Debug Menu

**Main Module Settings:**
* **Assistant** - globally enable/disable NPC creation automation.
* **Assistant Templates** - open the editor for built-in and custom templates.
* **Reactions Output** - *Bubble & Chat* / *Bubble Only* / *Chat Only*.
* **Automatic Injuries** - enable creating injury items when taking damage.

**Debug Menu Integration (`WFRP4e - Tools`):**
* **Export / Import Templates** - save custom Assistant templates to a `.json` file and transfer them to other worlds (with an option to replace or merge).
* **Reset Templates** - clear all custom templates.

<details align="center">
<summary>📷 Screenshots</summary>

![WFRP4e - Assistant section in Debug Menu](https://github.com/user-attachments/assets/5e861b79-ca47-4f38-a584-196564f58234)

</details>

---

<a id="en-modules"></a>
### 🧩 Related Modules

* **[WFRP4e - Tools](https://github.com/nPocToI4eJI/wfrp4e-tools)** *(required)* - core toolkit, quality-of-life, and bugfix module for **Warhammer Fantasy Roleplay 4th Edition** on Foundry VTT.
* **[WFRP4e - Looting](https://github.com/nPocToI4eJI/wfrp4e-looting)** - helps the GM streamline the process of creating unique loot.
* **[WFRP4e - Sounds](https://github.com/nPocToI4eJI/wfrp4e-sounds)** - contains sound files tailored for the `WFRP4e - Tools` audio system.
* **[WFRP4e - Print sheet](https://github.com/nPocToI4eJI/wfrp4e-print-sheet)** - is a module for exporting character and NPC sheets from **Warhammer Fantasy Roleplay 4th Edition** into standalone, editable HTML files.

---

<a id="en-thanks"></a>
### 🙏 Special Thanks
- **Alexander** _(kotofeilove)_, for writing the goblin reactions. They hit right in the feels.
- **Bossga**, for testing the early versions of the modules.
