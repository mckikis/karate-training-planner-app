Aký problém riešim
- Trénerom karate chýba digitálny nástroj na zapisovanie karate cvikov s vizuálnymi referenciami (obrázkami alebo GIFmi) a na ich jednoduché zostavenie do štruktúrovaných tréningových plánov.

Kto sú moji používatelia
- Tréneri karate, ktorí plánujú vlastné tréningy.

Ako chcem problém vyriešiť (MVP)
- Databáza cvikov
V aplikácii je od začiatku základná sada cvikov, ktoré pridám pri implementácii.
Môžem pridať vlastný cvik: názov, kategória, krátky popis a fotka, GIF alebo krátke video z telefónu.
Cviky sú rozdelené do kategórií: karate údery, karate kopy, reakcia, pohyb, rozcvička, hry, plyometria, silový tréning – vrch, silový tréning – nohy, mobilita, statický strečing, dynamický strečing, taktika.
Môžem pridať vlastnú kategóriu.
- Vytvorenie tréningu
Zaškrtnem cviky, ktoré chcem, a dajú sa do prehľadného zoznamu.
Tréning má názov, dátum, popis a značku typu tréningu (údery, kopy, taktika, kondícia, prípravka, plyometria…).
- Dĺžka tréningu
Pri každom cviku nastavím počet sérií, čas jednej série (alebo počet opakovaní × sekundy na opakovanie) a pauzu.
Aplikácia ukáže čas každého cviku aj celkovú dĺžku tréningu: čas cviku = série × čas série + pauzy medzi sériami + pauza pred ďalším cvikom
- Uložené tréningy – zoznam tréningov, ktoré môžem otvoriť, upraviť alebo zmazať.

Čo v MVP nebude (non-goals)
- Časomiera na celú obrazovku počas tréningu (aktuálny cvik, séria, ďalší cvik, pauza). Dôvod: Prvá verzia rieši plánovanie. Časomiera môže pribudnúť v ďalšej verzii.
- Účty, synchronizácia, zdieľanie tréningov s inými trénermi. Dôvod: Aplikáciu používam sama na jednom telefóne, nie je čo synchronizovať. Pribudol by server a prihlasovanie.
- Zverejnenie v App Store. Dôvod:	Aplikácia je zatiaľ len pre mňa.
- Zmena poradia cvikov ťahaním. Dôvod: Cviky ostanú v poradí, v akom ich zaškrtnem. Na prvú verziu to stačí.
- História tréningov, štatistiky, dochádzka. Dovod:	Nepomáhajú s hlavným problémom.
- Záloha a prenos dát do iného telefónu. Dôvod:	Dáta sú zatiaľ len v jednom telefóne. Export príde, keď bude appku používať viac ľudí.

Aké technológie potrebujem
- Rozhranie: React + TypeScript (obrazovky aplikácie)
- Zostavenie projektu: Vite	(spustenie počas vývoja a zostavenie appky)
- Lokálna databáza:	IndexedDB cez knižnicu Dexie.js	(cviky, tréningy, fotky a videá uložené v telefóne)
- Fotky a videá:	výber súboru z telefónu (médiá k cvikom)
- Nástroje:	VS Code, Node.js, Git + GitHub	(písanie kódu a verzie projektu)
