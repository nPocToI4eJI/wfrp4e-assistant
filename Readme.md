# <p align="center">WFRP4e - Assistant</p>
<p align="center">
  <a href="https://foundryvtt.com/packages/wfrp4e-assistant" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Assistant-FoundryVTT-orange?labelColor=darkred" alt="FoundryVTT"></a>
  <a href="https://foundryvtt.com/" rel="nofollow"><img src="https://img.shields.io/badge/V13-Совместимо-darkgreen?labelColor=orange" alt="Совместимость"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases" rel="nofollow"><img src="https://img.shields.io/github/v/release/nPocToI4eJI/wfrp4e-assistant?display_name=release&label=%D0%92%D0%B5%D1%80%D1%81%D0%B8%D1%8F&labelColor=darkgreen" alt="Последняя версия"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases/latest" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-assistant/latest/wfrp4e-assistant.zip?displayAssetName=false&label=%D0%A1%D0%BA%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D0%B9&labelColor=blue&color=darkgreen" alt="Скачивания"></a>
  <a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/releases" rel="nofollow"><img src="https://img.shields.io/github/downloads/nPocToI4eJI/wfrp4e-assistant/wfrp4e-assistant.zip?displayAssetName=false&label=%D0%92%D1%81%D0%B5%D0%B3%D0%BE&labelColor=darkgreen&color=darkred" alt="Скачиваний всего"></a>
</p>
<p align="center">
  <a href="https://discord.gg/tPrYvW7" rel="nofollow"><img src="https://img.shields.io/badge/Discord-black?logo=discord&logoColor=%235865F2" alt="Discord"></a>
  <a href="https://www.youtube.com/@nPocTo_4eJI" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-black?logo=youtube&logoColor=%23FF0000" alt="Youtube"></a>
  <a href="https://boosty.to/npocto_4eji" rel="nofollow"><img src="https://img.shields.io/badge/Boosty-black?logo=boosty&logoColor=%23F15F2C" alt="Boosty"></a>
</p>

- [Русский](#ru)
- [English](#en)

<a name="ru"></a>
Этот модуль поможет Мастеру проводить игры с комфортом. В него включены исправления ошибок и недоработок системы и официальных модулей, а также собственные и адаптированные инструменты.

## Содержание
- [Помощник](#Помощник)
  - [Случайное имя](#1-Случайное-имя)
  - [Случайные характеристики](#2-Случайные-характеристики)
  - [Случайный размер токена](#3-Случайный-размер-токена)
  - [Окраска токена при смерти](#4-Окраска-токена-при-смерти)
  - [Случайные заклинания](#5-Случайные-заклинания)
  - [Отношение токена](#6-Отношение-токена)
  - [Реакции](#7-Реакции)
  - [Наборы](#8-Наборы)
  - [Экспортировать актёра](#Экспортировать-актёра)
- [Исправления и улучшения](#Исправления-и-улучшения)
  - [Уход в защиту](#Уход-в-защиту)
  - [Списки заклинаний](#Списки-заклинаний)
  - [Core Rulebook](#Core-Rulebook)
  - [Winds of Magic](#Winds-of-Magic)
  - [Archives of the Empire: II](#Archives-of-the-Empire-II)
  - [Tribes & Tribulations](#Tribes-&-Tribulations)
- [Макросы](#Макросы)
  - [Придумать ругательство](#Придумать-ругательство)
  - [Название книги](#Название-книги)
  - [Случайное имя](#Случайное-имя)
- [Настройки](#Настройки)
- [Режим Отладки](#Режим-Отладки)
- [Планы](#Планы)
- [Известные ошибки](#Известные-ошибки)
- [Информация для разработчиков](#Информация-для-разработчиков)
- [Особые благодарности](#Особые-благодарности)

## Помощник
_Это универсальный инструмент по индивидуализации Ваших НИП и Существ._

Доступ к Помощнику можно получить через вкладку **"Переключения управления"**:
<p align="center"><img width="250" height="300" alt="Вкладка Переключения управления" src="https://github.com/user-attachments/assets/15430723-b666-4787-b1fe-9c3d1ff987de"/></p>

###### <p align="center">Интерфейс</p>

<p align="center"><img width="1000" height="500" alt="Интерфейс Помощника" src="https://github.com/user-attachments/assets/eb563856-a7cb-4f44-8ddb-7f9bd187d5a2"/></p>

#### 1. Случайное имя
- _Доступность: НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: присвоение случайного имени._
- _Настройка:_
  - В выпадающем меню Народа выберите один из заготовленных.
  - В поле параметров укажите необходимые, через запятую. Список и краткое описание доступных параметров для выбранного Народа можно увидеть, наведя на поле.
    - Если указанные параметры недоступны для выбранного Народа, вы увидите уведомление об этом. В случае сохранения настроек, такие будут добавляться как часть названия.

#### 2. Случайные характеристики
- _Доступность: НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: рандомизация характеристик актёра._
- _Настройка:_
  - Установите флажок в соответствующем пункте Помощника.

Характеристики рандомизируются в соответствии с правилом, описанном в Книге Правил:
> Чтобы задать случайное значение характеристики, вычти из указанного в бестиарии значения 10 пунктов, а затем прибавь 2d10 пунктов. Таким образом, заданное значение характеристики 30 превратится в случайное, равное 20 + 2d10. Если характеристика равна 5, просто брось 1d10 и запиши полученный результат как новое значение этой характеристики.

#### 3. Случайный размер токена
- _Доступность: НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: рандомизация размеров токена ±20%._
- _Настройка:_
  - Установите флажок в соответствующем пункте Помощника.

#### 4. Окраска токена при смерти
- _Доступность: Персонажи, НИП и Существа._
- _Триггер: уменьшение ран до 0._
- _Действие: окрашивание токена._
- _Настройка:_
  - Укажите цвет, в который необходимо окрасить токен.
- _Принцип работы:_
  - При снижении параметра ран актёра до 0, его токен (или все его токены) окрашивается в указанный цвет.
    - Если установлен модуль [Health Estimate](https://foundryvtt.com/packages/healthEstimate), в его настройках включён пункт "NPC мгновенно умирают", в настройках токена не включён пункт "Не отмечать мёртвым", а актёр является НИП или Существом, его токен получит статус "Мёртв".
  - Если параметр ран станет больше 0, цвет его токена (или всех его токенов) изменится на указанный в Прототипе токена актёра.
    - Если у актёра имеется статус "Мёртв", он его лишается.

#### 5. Случайные заклинания
- _Доступность: НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: выдача случайных заклинаний в соответствии с указанными настройками._
- _Настройка:_
  - Установите флажок в соответствующем пункте Помощника.
  - В выпадающем меню Знаний выберите одну из Магических Школ, заклинания которой будут сгенерированы.
  - Укажите количество заклинаний, которое будет сгенерировано.
  - Если желаете, чтобы в список заклинаний могли попасть и те, которые не имеют привязки к Магическим Школам, установите соответствующий флажок.

#### 6. Отношение токена
- _Доступность: НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: переопределение отношения токена._
- _Настройка:_
  - В выпадающем меню выберите необходимое значение:
    - Не изменять.\
    _Применять настройки Прототипа токена._
    - Запрашивать.\
    _Каждый раз, при переносе токена, будет запрашиваться новое значение._
    - Нейтральный.
    - Дружественный.
    - Враждебный.
    - Секрет.

#### 7. Реакции
- _Доступность: Персонажи, НИП и Существа._
- _Триггер: различные события. В основном, в бою._
- _Действие: генерация и создание случайных фраз, соответствующих ситуации._
- _Настройка:_
  - Установите флажок в соответствующем пункте Помощника.
  - В выпадающем меню Народа выберите один из заготовленных.
  - В выпадающем меню Разновидности народа выберите один из заготовленных.
  - В выпадающем меню Шанса выберите, как часто актёр будет реагировать на события.

Если Вы не хотите, чтобы Актёр воспроизводил реакции, всё ещё рекомендуется настроить пункты Народа и Разновидности народа, чтобы другие актёры смогли таргетировать свои реплики по отношению к этому.

#### 8. Наборы
- _Доступность: Персонажи, НИП и Существа._
- _Триггер: перенос токена на сцену._
- _Действие: выбор набора снаряжения и характеристик._
- _Настройка:_
  - Добавьте набор, нажатием кнопки **Добавить**.
  - Впишите необходимые изменения (+ или -) характеристик в соответствующие графы.
  - Перенесите необходимые для набора предметы в соответствующую графу.
  - Укажите Вес набора, который определит вероятность его получения.

#### Экспортировать актёра
_Позволяет сохранить актёра, находящегося на сцене, как отдельный лист._

Если актёр находится на сцене, и данные его токена не привязаны к оригинальному листу, в окне Помощника будет отображена кнопка Экспорта листа.\
Можно заметить, что многие события Помощника срабатывают, когда актёр переносится на сцену, при этом не влияя на оригинальный лист. В случае, если подобный, уже _случайно изменённый_ актёр, настолько всем приглянулся, что Вы захотели его сохранить, поможет Экспорт актёра.\
Экспортированному актёру может потребоваться некоторая последующая настройка, но все сгенерированные Помощником значения сохранятся.

## Исправления и улучшения
_Здесь перечислены исправления и доработки системы и официальных модулей._

#### Уход в защиту
Во вкладке **"Бой"** добавлена кнопка для управления состоянием **"Уход в защиту"**:
<p align="center"><img width="130" height="30" alt="image" src="https://github.com/user-attachments/assets/cfba184f-932d-4a5a-a8e8-10655a54fd34"/> <img width="130" height="30" alt="image" src="https://github.com/user-attachments/assets/666698c6-05cd-4818-9d4c-803b17532288"/></p>

Состояние **"Уход в защиту"** так же доступно через **Выбор статуса**. Отображаемые для действия Навыки можно изменить в Настройках модуля.

#### Списки заклинаний
Это улучшение позволит группировать заклинания по пользовательским группам и отображать в списке только необходимые.

###### <p align="center">Элемент управления отображаемыми Заклинаниями</p>

<p align="center"><img width="700" height="30" alt="image" src="https://github.com/user-attachments/assets/70c949ef-b0c4-43dd-8ffa-05eb96a1771f"/></p>

- При включённой категории **Все**:
  - При нажатии **ЛКМ** списки переключаются на следующую категорию.
  - При нажатии **ПКМ** открывается меню настройки категорий:
    - В первой графе каждого пункта указывается иконка [Font Awesome](https://fontawesome.com/).
    - Во второй графе каждого пункта указывается название категории.
    - Жёлтым цветом обозначены уже существующие категории, а зелёным - новые.
- При другой включённой категории:
  - При нажатии **ЛКМ** списки переключаются на следующую категорию.
  - При нажатии **ПКМ** открывается меню выбора заклинаний для категории:
    - Для выбора отображаемых в категории заклинаний, прожмите их и подтвердите результат.

###### <p align="center">Меню настройки категорий</p>

<p align="center"><img width="400" height="375" alt="image" src="https://github.com/user-attachments/assets/732403ba-7b85-4be6-8b86-c1a8dd8230b4"/></p>

###### <p align="center">Меню выбора заклинаний</p>

<p align="center"><img width="375" height="800" alt="image" src="https://github.com/user-attachments/assets/026a62c2-19cc-475c-989d-3f64c47f943a"/></p>

###### <p align="center">Элемент управления отображаемыми Простейшими Заклинаниями</p>

<p align="center"><img width="700" height="30" alt="image" src="https://github.com/user-attachments/assets/10c258f8-9a5c-4df6-b5a7-ad2e39629430"/></p>

- При нажатии **ЛКМ** скрывает все Простейшие Заклинания.  
- При повторном нажатии **ЛКМ** показывает все Простейшие Заклинания.

#### Core Rulebook
1. Исправлены скрипты эффектов.
  - Новый скрипт Зачарованного посоха позволяет использовать переведённые названия Магических Школ.
  - Новый скрипт магических Одеяний позволяет использовать переведённые названия Магических Школ.

#### Winds of Magic
1. Добавлены новые скрипты на генерацию случайных гримуаров и свитков заклинаний.\
Макросы позволяют генерировать заклинания как случайных Магических Школ, так и выбранных пользователем. Он включает в себя настройки, которые позволят ещё больше оптимизировать процесс использования макросов.

Магические Школы:
- [X] Core Rulebook
- [X] Winds of Magic
- [X] Archives of the Empire: Vol II.
- [X] The Horned Rat
- [X] Tribes & Tribulations

#### Archives of the Empire: II
1. Добавлены ключи локализации для Школы Магии и Ветра Магии "Великой Пасти".

Ключи локализации:
- `WFRP4E.MagicLores.greatMaw` - название Магической Школы "Великой Пасти".
- `WFRP4E.MagicWind.greatMaw` - название Ветра Магии "Великой Пасти".
- `WFRP4E.greatMaw.descriptions` - описание эффекта Магической Школы "Великой Пасти".

#### Tribes & Tribulations
1. Добавлены ключи локализации для Школ Магии и Ветров Магии "Вааагх!".

Ключи локализации:
- `WFRP4E.MagicLores.little-waaagh` - название Магической Школы "Малого Вааагх".
- `WFRP4E.MagicWind.little-waaagh` - название Ветра Магии "Малого Вааагх".
- `WFRP4E.little-waaagh.descriptions` - описание эффекта Магической Школы "Малого Вааагх".
- `WFRP4E.MagicLores.big-waaagh` - название Магической Школы "Большого Вааагх".
- `WFRP4E.MagicWind.big-waaagh` - название Ветра Магии "Большого Вааагх".
- `WFRP4E.big-waaagh.descriptions` - описание эффекта Магической Школы "Большого Вааагх".

## Макросы
_Модуль добавляет несколько собственных макросов для оптимизации игрового процесса._

#### Придумать ругательство
_Этот макрос генерирует оскорбления в фэнтезийном стиле. Хотя, они больше подходят для персонажей-гномов, найти им применение можно везде._

Примеры:
- _Невнятный, гоблинский, плакса._
- _Слащавый, предательский, дикарь._
- _Вонючий, с рвотой вместо мозгов, проходимец._

#### Название книги
_Этот макрос использует метод [generateBookTitle](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype), представляя удобный интерфейс для взаимодействия и выводя результат в чат._

Примеры:
- _Комплексные справки про битву на Перевале Чёрного Огня._
- _Основные лекции о реальных опасностях неизученных трав._
- _Насущные заметки о чудесах Зоологии._

#### Случайное имя
_Этот макрос использует метод [generateName](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#3-generatenametype), представляя удобный интерфейс для взаимодействия и выводя результат в чат._

## Настройки
_Модуль обладает возможностью гибкой настройки._

###### <p align="center">Интерфейс Настроек</p>

<p align="center"><img width="575" height="600" alt="Интерфейс Настроек" src="https://github.com/user-attachments/assets/f63a21cc-cf00-4ee8-99dc-61a48f1746aa"/></p>

Список настраиваемых параметров:
- Меню шаблонов. Позволяет создавать и изменять шаблоны настроек Помощника.
- Помощник. Включить: Включает функционал Помощника.
- Помощник. Способ отображения реакций: Определяет, каким образом будут отображаться Реакции Помощника (Пузырь чата, Сообщение в чат, Оба варианта).
- SF. Уход в защиту до начала хода: Если включено, статус Ухода в защиту будет убираться в начале хода Актёра.
- SF. Навыки для ухода в защиту: Позволяет выбрать, какие Навыки будут предлагаться для Ухода в защиту (Боевые (Уклонение и Рукопашный бой), Все, Определённые пользователем).
- SF. Переводить данные Актёров при импорте: Если включено, при импорте Актёра из Библиотеки, Вам будет предложено перевести его данные. Требуется наличие модуля [Babele](https://foundryvtt.com/packages/babele).
- SF. Случайные названия Гримуаров: Если включено, сгенерированным гримуарам будет присвоено случайное название, используя метод [generateBookTitle](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype).

#### Режим Отладки
_Модуль оборудован режимом отладки, используемым для обнаружения и решения проблем при его использовании._

###### <p align="center">Интерфейс Меню Отладки</p>

<p align="center"><img width="250" height="125" alt="Интерфейс Меню Отладки" src="https://github.com/user-attachments/assets/9d3715a1-1ea9-413b-a5b6-ae4d5fa09db7"/></p>

## Планы
_Дальнейшие планы по обновлению модуля._

- [ ] Починить остальные макросы из "Winds of Magic".
- [ ] Свои предложения по улучшению модуля можете присылать [сюда](https://github.com/nPocToI4eJI/wfrp4e-assistant/issues/1).

## Известные ошибки
_Тут перечислены баги и недоработки, о которых уже известно._

- [ ] Найденные ошибки можете присылать [сюда](https://github.com/nPocToI4eJI/wfrp4e-assistant/issues/2).

## Информация для разработчиков
<a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Assistant-Wiki-blue?labelColor=darkred" alt="Информация для разработчиков"></a>

## Особые благодарности
- **Александр** _(kotofeilove)_, за придумывание реакций для гоблинов. Они цепляют прямо за душу.
- **Bossga**, за тестирование первых версий модулей.

<hr>

<a name="en"></a>
This module will help the Game Master to hold games with comfort. It includes corrections of bugs and shortcomings of the system and official modules, as well as own and adapted tools.

## Contents
- [Assistant](#Assistant)
  - [Random name](#1-Random-name)
  - [Random characteristics](#2-Random-characteristics)
  - [Random token size](#4-Random-token-size)
  - [Token coloration on death](#4-Token-coloration-on-death)
  - [Random spells](#5-Random-spells)
  - [Token disposition](#6-Token-disposition)
  - [Reactions](#7-Reactions)
  - [Sets](#8-Sets)
  - [Export actor](#Export-actor)
- [Fixes and Improvements](#Fixes-and-Improvements)
  - [On The Defensive](#On-The-Defensive)
  - [Spell Filter](#Spell-Filter)
  - [Core Rulebook](#Core-Rulebook)
  - [Winds of Magic](#Winds-of-Magic)
  - [Archives of the Empire: II](#Archives-of-the-Empire-II)
  - [Tribes & Tribulations](#Tribes-&-Tribulations)
- [Macros](#Macros)
  - [Invent a Curse](#Invent-a-Curse)
  - [Book Title](#Book-Title)
  - [Random name](#Random-name)
- [Settings](#Settings)
- [Debug Mode](#Debug-Mode)
- [Plans](#Plans)
- [Known Issues](#Known-Issues)
- [Developer Information](#Developer-Information)
- [Special thanks](#Special-thanks)

## Assistant
_This is a universal tool for customizing your NPCs and Creatures._

You can access the Assistant via the **Control Switching"** tab:
<p align="center"><img width="250" height="300" alt="Control Switching Tab" src="https://github.com/user-attachments/assets/15430723-b666-4787-b1fe-9c3d1ff987de"/></p>

###### <p align="center">Interface</p>

<p align="center"><img width="1000" height="500" alt="Assistant Interface" src="https://github.com/user-attachments/assets/eb563856-a7cb-4f44-8ddb-7f9bd187d5a2"/></p>

#### 1. Random name
- _Availability: NPCs and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: assigning a random name._
- _Setup:_
  - Check the corresponding option in the Assistant.
  - In the Species dropdown menu, select one of the predefined options.
  - In the parameters field, enter the required values separated by commas. You can view a list and brief description of available parameters for the selected Species by hovering over the field.
    - If the specified parameters are not available for the selected Species , you will see a notification about this. If you save the settings, such parameters will not be retained.

#### 2. Random characteristics
- _Availability: NPCs and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: randomizing the actor’s characteristics._
- _Setup:_
  - Check the corresponding option in the Assistant.

The characteristics are randomized according to the rule described in the Rulebook:
> If you wish to randomly create Characteristics, subtract –10, then add 2d10. So, a Characteristic of 30 translates to 2d10+20. If a Characteristic starts at 5, roll just 1d10 to randomise it.

#### 3. Random token size
- _Availability: NPCs and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: randomize the size of the token ±20%._
- _Setup:_
  - Check the box in the corresponding Assistant item.

#### 4. Token coloration on death
- _Availability: Characters, NPCs, and Creatures._
- _Trigger: reducing wounds to 0._
- _Action: coloring the token._
- _Setup:_
  - Specify the color to which the token should be colored.
- _Operation principle:_
  - When the actor’s wound parameter is reduced to 0, their token (or all their tokens) is colored in the specified color.
    - If the [Health Estimate](https://foundryvtt.com/packages/healthEstimate) module is installed, the "NPCs die instantly" option is enabled in its settings, the "Do not mark as dead" option is not enabled in the token settings, and the actor is an NPC or Creature, their token will receive the "Dead" status.
  - If the wound parameter becomes greater than 0, the color of their token (or all their tokens) will change to the one specified in the actor’s Token Prototype.
    - If the actor has the "Dead" status, they will lose it.

#### 5. Random spells
- _Availability: NPCs and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: granting random spells according to the specified settings._
- _Setup:_
  - Check the corresponding option in the Assistant.
  - In the Lore dropdown menu, select one of the Magic Lores whose spells will be generated.
  - Specify the number of spells to be generated.
  - If you want spells that are not tied to Magic Lores to be included in the spell list, check the corresponding option.

#### 6. Token disposition
- _Availability: NPCs and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: redefining the token’s disposition._
- _Setup:_
  - Select the required value from the dropdown menu:
    - Do not change.\
    _Apply the Token Prototype settings._
    - Prompt.\
    _Each time the token is moved, a new value will be requested._
    - Neutral.
    - Friendly.
    - Hostile.
    - Secret.

#### 7. Reactions
- _Availability: Characters, NPCs, and Creatures._
- _Trigger: various events, primarily during combat._
- _Action: generating and creating random phrases appropriate to the situation._
- _Setup:_
  - Check the corresponding option in the Assistant.
  - In the Species dropdown menu, select one of the predefined options.
  - In the Subspecies dropdown menu, select one of the predefined options.
  - In the Chance dropdown menu, select how often the actor will react to events.

If you do not want the Actor to produce reactions, it is still recommended to configure the Species and Subspecies options so that other actors can target their lines toward this one.

#### 8. Sets
- _Availability: Characters, NPCs, and Creatures._
- _Trigger: moving the token onto the scene._
- _Action: Select a set of items and characteristics._
- _Setup:_
  - Add a set by pressing the **Add** button.
  - Enter the necessary changes (+ or -) of the characteristics in the appropriate columns.
  - Move the items needed for the set to the appropriate column.
  - Specify the Weight of the set, which will determine the probability of receiving it.

#### Export actor
_Allows you to save an actor currently on the scene as a separate sheet._

If an actor is on the scene and their token data is not linked to the original sheet, the Export Sheet button will appear in the Assistant window.\
You may notice that many Assistant events trigger when an actor is moved to the scene, without affecting the original sheet. If such a _randomly modified_ actor turns out to be so appealing that you’d like to keep them, the Export Actor feature will help.\
The exported actor may require some further adjustments, but all values generated by the Assistant will be preserved.

## Fixes and Improvements
_This section lists corrections and enhancements to the system and official modules._

#### On The Defensive
A button for managing the **"On The Defensive"** state has been added to the **"Combat"** tab:
<p align="center"><img width="130" height="30" alt="image" src="https://github.com/user-attachments/assets/cfba184f-932d-4a5a-a8e8-10655a54fd34"/> <img width="130" height="30" alt="image" src="https://github.com/user-attachments/assets/666698c6-05cd-4818-9d4c-803b17532288"/></p>

The **"On The Defensive"** state is also accessible via the **Status Selection** menu. The skills displayed for this action can be customized in the module’s settings.

#### Spell Filter
This enhancement allows you to group spells into custom categories and display only the ones you need in the list.

###### <p align="center">Spell Display Control Element</p>

<p align="center"><img width="700" height="30" alt="image" src="https://github.com/user-attachments/assets/70c949ef-b0c4-43dd-8ffa-05eb96a1771f"/></p>

- When the **All** category is enabled:
  - **Left‑click** switches the lists to the next category.
  - **Right‑click** opens the category settings menu:
    - The first column of each item shows an icon from [Font Awesome](https://fontawesome.com/).
    - The second column of each item shows the category name.
    - Existing categories are highlighted in yellow, new ones are highlighted in green.
- When any other category is enabled:
  - **Left‑click** switches the lists to the next category.
  - **Right‑click** opens the spell selection menu for the category:
    - To select spells to be displayed in the category, click them and confirm your selection.

###### <p align="center">Category Settings Menu</p>

<p align="center"><img width="400" height="375" alt="image" src="https://github.com/user-attachments/assets/732403ba-7b85-4be6-8b86-c1a8dd8230b4"/></p>

###### <p align="center">Spell Selection Menu</p>

<p align="center"><img width="375" height="800" alt="image" src="https://github.com/user-attachments/assets/026a62c2-19cc-475c-989d-3f64c47f943a"/></p>

###### <p align="center">Control Element for Displayed Basic Spells</p>

<p align="center"><img width="700" height="30" alt="image" src="https://github.com/user-attachments/assets/10c258f8-9a5c-4df6-b5a7-ad2e39629430"/></p>

- **Left‑click** hides all Petty Spells.  
- **Left‑click** again shows all Petty Spells.

#### Core Rulebook
1. Effect scripts have been fixed.
  - The new Enchanted Staff script now supports translated names of Magic Lores.
  - The new Magical Robes script now supports translated names of Magic Lores.

#### Winds of Magic
1. New scripts for generating random grimoires and spell scrolls have been added.\
The macros allow generating spells from both random Magic Lores and those selected by the user. They include settings that will further optimize the process of using the macros.

Magic Lores:
- [X] Core Rulebook
- [X] Winds of Magic
- [X] Archives of the Empire: Vol II.
- [X] The Horned Rat
- [X] Tribes & Tribulations

#### Archives of the Empire: II
1. Localization keys have been added for the Magic Lores and the Wind of Magic of the "Great Maw".

Localization keys:
- `WFRP4E.MagicLores.greatMaw` - the name of the "Great Maw" Magic Lores.
- `WFRP4E.MagicWind.greatMaw` - the name of the "Great Maw" Wind of Magic.
- `WFRP4E.greatMaw.descriptions` - the description of the effect of the "Great Maw" Magic Lores.

#### Tribes & Tribulations
1. Localization keys have been added for the Magic Lores and the Wind of Magic of the "Waaagh!".

Localization keys:
- `WFRP4E.MagicLores.little-waaagh` - the name of the "Little Waaagh!" Magic Lores.
- `WFRP4E.MagicWind.little-waaagh` - the name of the "Little Waaagh!" Wind of Magic.
- `WFRP4E.little-waaagh.descriptions` - the description of the effect of the "Little Waaagh!" Magic Lores.
- `WFRP4E.MagicLores.big-waaagh` - the name of the "Big Waaagh!" Magic Lores.
- `WFRP4E.MagicWind.big-waaagh` - the name of the "Big Waaagh!" Wind of Magic.
- `WFRP4E.big-waaagh.descriptions` - the description of the effect of the "Big Waaagh!" Magic Lores.

## Macros
_The module adds several custom macros to optimize gameplay._

#### Invent a Curse
_This macro generates fantasy‑style insults. While they’re particularly suited for dwarf characters, they can be used in any context._

Examples (ru):
- _Невнятный, гоблинский, плакса._
- _Слащавый, предательский, дикарь._
- _Вонючий, с рвотой вместо мозгов, проходимец._

#### Book Title
_This macro uses the [generateBookTitle](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype) method, providing a user‑friendly interface for interaction and outputting the result to the chat._

Examples:
- _Finest lessons on the Dwarven Runes in Heraldy._
- _Accumulated studies on the Uglu: the Grey Wind of Illusion._
- _Essential conceptions on the Cross & Skull on Pirate Flags._

#### Random name
_This macro uses the [generateName](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#3-generatenametype) method, providing a user‑friendly interface for interaction and outputting the result to the chat._

## Settings
_The module offers flexible configuration options._

###### <p align="center">Settings Interface</p>

<p align="center"><img width="575" height="600" alt="Settings Interface" src="https://github.com/user-attachments/assets/f63a21cc-cf00-4ee8-99dc-61a48f1746aa"/></p>

List of configurable parameters:
- Presets menu. Allows you to create and edit Assistant settings presets.
- Assistant. Enable: Activates the Assistant functionality.
- Assistant. The way reactions are displayed: Determines how the Assistant’s Reactions will be displayed (Chat Bubble, Message to the chat, Both options).
- SF. Remove Defensive Stance at start of turn: If enabled, the Defensive Stance status will be removed at the start of the Actor's turn.
- SF. Skills for Defensive Stance: Lets you select which Skills will be offered for Defensive Stance (Combat (Dodge and Melee), All, User‑defined).
- SF. Translate Actor data on import: If enabled, when importing an Actor from the Library, you will be prompted to translate its data. Requires the [Babele](https://foundryvtt.com/packages/babele) module.
- SF. Random names for Grimoires: If enabled, generated Grimoires will be assigned a random name, using the [generateBookTitle](https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki/%D0%9C%D0%B5%D1%82%D0%BE%D0%B4%D1%8B#1-generatebooktitletype) method.

#### Debug Mode
_The module includes a debug mode used to detect and resolve issues during its use._

###### <p align="center">Debug Menu Interface</p>

<p align="center"><img width="250" height="125" alt="Debug Menu Interface" src="https://github.com/user-attachments/assets/9d3715a1-1ea9-413b-a5b6-ae4d5fa09db7"/></p>

## Plans
_Upcoming plans for module updates._

- [ ] Fix the remaining macros from "Winds of Magic".
- [ ] You can submit your suggestions for improving the module [here](https://github.com/nPocToI4eJI/wfrp4e-assistant/issues/1).

## Known Issues
_This section lists bugs and shortcomings that are already known._

- [ ] You can report any bugs you find [here](https://github.com/nPocToI4eJI/wfrp4e-assistant/issues/2).

## Developer Information
<a href="https://github.com/nPocToI4eJI/wfrp4e-assistant/wiki" rel="nofollow"><img src="https://img.shields.io/badge/WFRP4e%20--%20Assistant-Wiki%20(ru)-blue?labelColor=darkred" alt="Developer Information (ru)"></a>

## Special thanks
- **Alexander** _(kotofeilove)_ for coming up with the goblins’ reactions. They really touch the heart.
- **Bossga** for testing the early versions of the modules.
