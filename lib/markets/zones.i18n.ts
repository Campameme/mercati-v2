// Traduzioni FR/DE/EN di carattere e story delle zone (IT = sorgente in zones.ts).
import type { Lang } from '@/lib/i18n/home'

export interface ZoneI18n {
  carattere: string
  story: string
}

export const ZONES_I18N: Record<string, Partial<Record<Lang, ZoneI18n>>> = {
  'ventimiglia': {
    fr: {
      carattere:
        'Le vendredi, le plus grand marché de Ligurie serpente le long de la Roya : un labyrinthe d’étals où l’on marchande depuis toujours en deux langues, italien et français.',
      story:
        'Le vendredi est le jour que tout le monde connaît : le plus grand marché de Ligurie s’étend le long de la Roya et dans le centre-ville, et depuis toujours on y vient aussi de la Côte d’Azur, en marchandant en italien et en français. Un samedi par mois, dans le centre, reviennent les étals des antiquaires et des collectionneurs.',
    },
    de: {
      carattere:
        'Freitags schlängelt sich der größte Markt Liguriens an der Roia entlang: ein Labyrinth aus Ständen, an denen seit jeher in zwei Sprachen gefeilscht wird, auf Italienisch und Französisch.',
      story:
        'Der Freitag ist der Tag, den alle kennen: Der größte Markt Liguriens erstreckt sich am Fluss Roia entlang und durch die Innenstadt, und seit jeher kommt man auch von der Côte d’Azur herüber, gefeilscht wird auf Italienisch und Französisch. An einem Samstag im Monat kehren dafür die Stände der Antiquitäten- und Sammlerhändler ins Zentrum zurück.',
    },
    en: {
      carattere:
        'On Fridays the largest market in Liguria winds along the Roia: a maze of stalls where people have always haggled in two languages, Italian and French.',
      story:
        'Friday is the day everyone knows: the largest market in Liguria stretches along the Roia river and through the town centre, and people have always come over from the Côte d’Azur too, haggling in Italian and French. One Saturday a month, the antiques and collectors’ stalls return to the centre.',
    },
  },
  'val-nervia': {
    fr: {
      carattere:
        'De l’embouchure de la Nervia aux villages perchés sur les collines : des marchés de village entre mer et arrière-pays, où Perinaldo regarde encore les étoiles de Cassini.',
      story:
        'Des marchés de village, dans une vallée qui monte de la mer aux collines : le mercredi, les étals sont sur la piazza Garibaldi à Camporosso, le week-end on descend le long de la Nervia, à Vallecrosia le lundi. Et tout en haut de la vallée il y a Perinaldo, le village de l’astronome Cassini, qui regarde à la fois les étoiles et la côte.',
    },
    de: {
      carattere:
        'Von der Mündung der Nervia bis zu den Dörfern über den Hügeln: Dorfmärkte zwischen Meer und Hinterland, wo Perinaldo noch immer zu den Sternen Cassinis aufblickt.',
      story:
        'Dorfmärkte in einem Tal, das vom Meer in die Hügel steigt: Mittwochs stehen die Stände auf der Piazza Garibaldi in Camporosso, am Wochenende geht es die Nervia entlang hinunter, in Vallecrosia ist montags Markt. Und ganz oben im Tal liegt Perinaldo, das Dorf des Astronomen Cassini, das zugleich auf die Sterne und auf die Küste blickt.',
    },
    en: {
      carattere:
        'From the mouth of the Nervia to the villages looking out over the hills: village markets between sea and hinterland, where Perinaldo still watches Cassini’s stars.',
      story:
        'Village markets, in a valley that climbs from the sea into the hills: on Wednesdays the stalls are in piazza Garibaldi in Camporosso, at the weekend they move down along the Nervia, in Vallecrosia on Mondays. And at the top of the valley sits Perinaldo, the village of the astronomer Cassini, watching the stars and the coast at once.',
    },
  },
  'bordighera-ospedaletti': {
    fr: {
      carattere:
        'Promenades en bord de mer, palmiers et brocante : de Bordighera, qui depuis 1586 envoie ses palmes blanches au Vatican, aux promenades d’Ospedaletti.',
      story:
        'Le jeudi, les étals s’alignent sur le Lungomare Argentina, la promenade qui enchanta Monet : c’est le marché avec la plus belle vue du Ponente, dans la ville qui depuis 1586 envoie ses palmes au Vatican. Le marché d’Ospedaletti se tient le mercredi ; le premier dimanche du mois, c’est le tour de la petite brocante.',
    },
    de: {
      carattere:
        'Uferpromenaden, Palmen und Brocante: von Bordighera, das seit 1586 seine weißen Palmwedel an den Vatikan schickt, bis zu den Promenaden von Ospedaletti.',
      story:
        'Donnerstags reihen sich die Stände am Lungomare Argentina auf, der Promenade, die Monet verzauberte: Es ist der Markt mit der schönsten Aussicht des Ponente, in der Stadt, die seit 1586 ihre Palmwedel an den Vatikan schickt. Nach Ospedaletti geht man mittwochs; am ersten Sonntag im Monat ist der kleine Antiquitätenmarkt an der Reihe.',
    },
    en: {
      carattere:
        'Seafront promenades, palms and bric-a-brac: from Bordighera, which has been sending its white palm fronds to the Vatican since 1586, to the promenades of Ospedaletti.',
      story:
        'On Thursdays the stalls line up along the Lungomare Argentina, the promenade that enchanted Monet: it is the market with the finest view in the Ponente, in the town that has been sending its palms to the Vatican since 1586. Ospedaletti has its market on Wednesdays; the first Sunday of the month belongs to the small antiques market.',
    },
  },
  'sanremo': {
    fr: {
      carattere:
        'La ville des fleurs change de marché chaque jour : du bihebdomadaire à la petite brocante de San Siro, entre le centre et les hameaux sur les collines.',
      story:
        'Le mardi et le samedi, la piazza Eroi Sanremesi se remplit d’étals au pied de la Pigna, le centre historique qui monte en spirale. Le marché couvert, lui, travaille tous les jours ; le mercredi et le vendredi, c’est le tour du quartier de la Foce, et à tour de rôle le marché arrive aussi dans les hameaux sur les collines.',
    },
    de: {
      carattere:
        'Die Stadt der Blumen wechselt ihren Markt jeden Tag: vom zweimal wöchentlichen Markt bis zum kleinen Antiquitätenmarkt von San Siro, zwischen dem Zentrum und den Ortsteilen in den Hügeln.',
      story:
        'Dienstags und samstags füllt sich die Piazza Eroi Sanremesi mit Ständen, am Fuß der Pigna, der spiralförmig ansteigenden Altstadt. Die überdachte Markthalle arbeitet dagegen jeden Tag; mittwochs und freitags ist das Viertel Foce an der Reihe, und im Wechsel kommt der Markt auch in die Ortsteile in den Hügeln.',
    },
    en: {
      carattere:
        'The city of flowers changes market every day: from the twice-weekly market to the small antiques market of San Siro, between the centre and the hillside hamlets.',
      story:
        'On Tuesdays and Saturdays piazza Eroi Sanremesi fills with stalls at the foot of the Pigna, the old town that climbs in a spiral. The covered food market, meanwhile, works every day; Wednesdays and Fridays belong to the Foce district, and the market takes turns visiting the hillside hamlets too.',
    },
  },
  'taggia-e-costa': {
    fr: {
      carattere:
        'La côte des petits ports et le centre historique de Taggia, avec le marché aux antiquités qui, chaque troisième dimanche, descend le long de l’Argentina.',
      story:
        'Ici, le marché court le long de la côte, toujours à deux pas de la piste cyclable du Parco Costiero : le lundi à Riva Ligure, le mardi à San Lorenzo al Mare, le vendredi sur le front de mer de Santo Stefano. Et à Taggia, patrie de l’olive taggiasca, le troisième dimanche du mois (d’avril à octobre), les étals des antiquaires montent vers le pont ancien.',
    },
    de: {
      carattere:
        'Die Küste der kleinen Häfen und die Altstadt von Taggia, mit dem Antiquitätenmarkt, der an jedem dritten Sonntag die Argentina entlangzieht.',
      story:
        'Hier läuft der Markt die Küste entlang, immer nur wenige Schritte vom Radweg des Parco Costiero entfernt: montags in Riva Ligure, dienstags in San Lorenzo al Mare, freitags an der Uferpromenade von Santo Stefano. Und in Taggia, der Heimat der Taggiasca-Olive, ziehen am dritten Sonntag im Monat (von April bis Oktober) die Antiquitätenstände hinauf zur alten Brücke.',
    },
    en: {
      carattere:
        'The coast of the small harbours and the old town of Taggia, with the little antiques market that comes down along the Argentina every third Sunday.',
      story:
        'Here the market runs along the coast, always a stone’s throw from the Parco Costiero cycle path: Mondays in Riva Ligure, Tuesdays in San Lorenzo al Mare, Fridays on the seafront of Santo Stefano. And in Taggia, home of the Taggiasca olive, on the third Sunday of the month (April to October) the antiques stalls climb towards the old bridge.',
    },
  },
  'imperia': {
    fr: {
      carattere:
        'Deux ports qui appartenaient à deux États, cousus en une seule ville par l’huile et le poisson : Oneglia la marchande et Porto Maurizio perché sur le Parasio.',
      story:
        'Deux villes en une, et au marché ça se sent encore : Porto Maurizio a ses étals le mardi et le jeudi sous la colline du Parasio, Oneglia le mercredi et le samedi entre les places et la calata Cuneo, où l’air sent encore le moulin à huile et le port. C’étaient deux États différents : c’est le commerce qui les a cousus ensemble.',
    },
    de: {
      carattere:
        'Zwei Häfen, die einst zwei Staaten gehörten, von Öl und Fisch zu einer einzigen Stadt zusammengenäht: das kaufmännische Oneglia und das auf dem Parasio thronende Porto Maurizio.',
      story:
        'Zwei Städte in einer, und auf dem Markt spürt man es noch: Porto Maurizio hat seine Stände dienstags und donnerstags unterhalb des Parasio-Hügels, Oneglia mittwochs und samstags zwischen den Plätzen und der Calata Cuneo, wo die Luft noch nach Ölmühle und Hafen riecht. Es waren zwei verschiedene Staaten: Zusammengenäht hat sie der Handel.',
    },
    en: {
      carattere:
        'Two ports that once belonged to two states, stitched into a single city by oil and fish: mercantile Oneglia and Porto Maurizio perched on the Parasio.',
      story:
        'Two cities in one, and you can still feel it at the market: Porto Maurizio has its stalls on Tuesdays and Thursdays below the Parasio hill, Oneglia on Wednesdays and Saturdays between the squares and calata Cuneo, where the air still smells of oil mill and harbour. They were two different states: it was trade that stitched them together.',
    },
  },
  'golfo-dianese': {
    fr: {
      carattere:
        'Le golfe des marchés du soir en été, du solettone du port de Diano jusqu’au village de Cervo suspendu au-dessus de la mer.',
      story:
        'Dans le golfe, il y a un marché presque chaque jour : le lundi à San Bartolomeo al Mare, le mardi et le vendredi à Diano Marina entre corso Roma et via Genala, le jeudi là-haut à Cervo — le village des pêcheurs de corail suspendu au-dessus de la mer, qui l’été devient une scène de musique de chambre.',
    },
    de: {
      carattere:
        'Der Golf der sommerlichen Abendmärkte, vom Solettone am Hafen von Diano bis zum über dem Meer schwebenden Dorf Cervo.',
      story:
        'Im Golf ist fast jeden Tag Markt: montags in San Bartolomeo al Mare, dienstags und freitags in Diano Marina zwischen Corso Roma und Via Genala, donnerstags oben in Cervo — dem über dem Meer schwebenden Dorf der Korallenfischer, das im Sommer zur Bühne für Kammermusik wird.',
    },
    en: {
      carattere:
        'The gulf of summer evening markets, from the solettone at Diano’s harbour to the village of Cervo suspended above the sea.',
      story:
        'In the gulf there is a market almost every day: Mondays in San Bartolomeo al Mare, Tuesdays and Fridays in Diano Marina between corso Roma and via Genala, Thursdays up in Cervo — the coral fishers’ village suspended above the sea, which in summer becomes a stage for chamber music.',
    },
  },
  'entroterra': {
    fr: {
      carattere:
        'La Route du Sel et les villes marchandes : à Pieve di Teco, bourg né comme marché, les antiquaires ambulants perpétuent sous les arcades un geste vieux de huit cents ans.',
      story:
        'C’est d’ici que montait la Route du Sel, et les marchés restent le cœur des villages de la Valle Arroscia : le mardi à Pieve di Teco — bourg fondé en 1233 précisément pour le commerce — les étals se tiennent sous les arcades médiévales ; le vendredi, c’est le tour de Pontedassio, le dimanche on monte au Colle di Nava, entre les champs de lavande.',
    },
    de: {
      carattere:
        'Die Salzstraße und die Marktstädte: In Pieve di Teco, einem als Markt geborenen Ort, setzen die Antiquitätenhändler unter den Arkaden eine achthundert Jahre alte Geste fort.',
      story:
        'Von hier stieg die Salzstraße hinauf, und die Märkte bleiben das Herz der Dörfer der Valle Arroscia: Dienstags in Pieve di Teco — einem 1233 eigens für den Handel gegründeten Ort — stehen die Stände unter den mittelalterlichen Arkaden; freitags ist Pontedassio an der Reihe, sonntags geht es hinauf zum Colle di Nava, zwischen Lavendelfeldern.',
    },
    en: {
      carattere:
        'The Salt Road and the market towns: in Pieve di Teco, a village born as a market, the travelling antiques dealers carry on beneath the arcades a gesture eight hundred years old.',
      story:
        'The Salt Road climbed up from here, and the markets remain the heart of the Valle Arroscia villages: on Tuesdays in Pieve di Teco — a village founded in 1233 precisely for trade — the stalls stand beneath the medieval arcades; Fridays belong to Pontedassio, and on Sundays you climb to Colle di Nava, among the lavender fields.',
    },
  },
  'baia-del-sole': {
    fr: {
      carattere:
        'Le samedi, les étals s’installent à deux pas du “budello” d’Alassio, la rue de la promenade derrière la plage ; à Laigueglia on vendait le corail, aujourd’hui le vendredi on y fait le marché.',
      story:
        'La baie au sable fin a ses rituels : le samedi, le marché d’Alassio à côté du budello et du Muretto aux signatures, le vendredi les étals dans le centre historique de Laigueglia, le lundi Andora le long de via Cavour. Et le premier samedi du mois, sous les arcades de piazza Santa Maria à Andora, reviennent antiquaires et artisans.',
    },
    de: {
      carattere:
        'Samstags stehen die Stände nur wenige Schritte vom “budello” von Alassio entfernt, der Flaniergasse hinter dem Strand; in Laigueglia wurde einst Koralle verkauft, heute ist dort freitags Markt.',
      story:
        'Die Bucht des feinen Sandes hat ihre Rituale: Samstags der Markt von Alassio neben dem budello und dem Muretto mit den Unterschriften, freitags die Stände in der Altstadt von Laigueglia, montags Andora entlang der Via Cavour. Und am ersten Samstag im Monat kehren unter den Arkaden der Piazza Santa Maria in Andora Antiquare und Kunsthandwerker zurück.',
    },
    en: {
      carattere:
        'On Saturdays the stalls arrive a stone’s throw from Alassio’s “budello”, the strolling street behind the beach; Laigueglia once sold coral, today it holds its market on Fridays.',
      story:
        'The bay of fine sand has its rituals: on Saturdays the Alassio market next to the budello and the Muretto with its signatures, on Fridays the stalls in Laigueglia’s old town, on Mondays Andora along via Cavour. And on the first Saturday of the month, under the arcades of piazza Santa Maria in Andora, the antiques dealers and artisans return.',
    },
  },
  'albenganese': {
    fr: {
      carattere:
        'La ville aux cent tours et la plaine des légumes : asperge violette, artichaut et courgettes trombette remplissent chaque matin les étals des producteurs sur la piazza del Popolo.',
      story:
        'Ici, le marché naît dans les champs : la plaine d’Albenga cultive les légumes de la moitié de la Ligurie, et les producteurs vendent chaque matin sur la piazza del Popolo, sous les tours médiévales. Le mercredi le grand marché d’Albenga, le lundi les étals sur le front de mer de Ceriale, le mardi Borghetto, le jeudi Toirano, le village des grottes préhistoriques.',
    },
    de: {
      carattere:
        'Die Stadt der hundert Türme und die Gemüseebene: Violetter Spargel, Artischocken und Trombetta-Zucchini füllen jeden Morgen die Stände der Erzeuger auf der Piazza del Popolo.',
      story:
        'Hier entsteht der Markt auf den Feldern: Die Ebene von Albenga baut das Gemüse für halb Ligurien an, und die Erzeuger verkaufen jeden Morgen auf der Piazza del Popolo, unter den mittelalterlichen Türmen. Mittwochs der große Markt von Albenga, montags die Stände an der Uferpromenade von Ceriale, dienstags Borghetto, donnerstags Toirano, das Dorf der prähistorischen Höhlen.',
    },
    en: {
      carattere:
        'The city of a hundred towers and the vegetable plain: violet asparagus, artichokes and trombetta courgettes fill the growers’ stalls in piazza del Popolo every morning.',
      story:
        'Here the market is born in the fields: the Albenga plain grows vegetables for half of Liguria, and the growers sell every morning in piazza del Popolo, beneath the medieval towers. On Wednesdays the big Albenga market, on Mondays the stalls on Ceriale’s seafront, on Tuesdays Borghetto, on Thursdays Toirano, the village of the prehistoric caves.',
    },
  },
  'loano-pietra': {
    fr: {
      carattere:
        'Des marchés presque chaque jour entre le port des Doria à Loano et la place de la basilique de Pietra ; le dernier dimanche du mois, la brocante envahit le centre historique de Pietra.',
      story:
        'Entre le port de plaisance de Loano et la grande place de San Nicolò à Pietra Ligure, il y a un marché presque chaque jour : le vendredi à Loano, le samedi à Pietra, le mardi à Borgio Verezzi sous les hameaux sarrasins de pierre rose. Le dernier dimanche du mois, la brocante remplit les places et les carruggi de Pietra ; l’été, à Loano, surgit même le petit marché aux livres.',
    },
    de: {
      carattere:
        'Fast jeden Tag Markt zwischen dem Doria-Hafen von Loano und dem Platz der Basilika von Pietra; am letzten Sonntag im Monat erobern die Antiquitätenhändler die Altstadt von Pietra.',
      story:
        'Zwischen dem Jachthafen von Loano und dem großen Platz von San Nicolò in Pietra Ligure ist fast jeden Tag Markt: freitags in Loano, samstags in Pietra, dienstags in Borgio Verezzi unterhalb der sarazenischen Ortsteile aus rosa Stein. Am letzten Sonntag im Monat füllen die Antiquitätenstände Plätze und carruggi von Pietra; im Sommer taucht in Loano sogar ein Büchermarkt auf.',
    },
    en: {
      carattere:
        'Markets almost every day between Loano’s Doria harbour and the basilica square in Pietra; on the last Sunday of the month, antiques take over Pietra’s old town.',
      story:
        'Between Loano’s marina and the great square of San Nicolò in Pietra Ligure there is a market almost every day: Fridays in Loano, Saturdays in Pietra, Tuesdays in Borgio Verezzi below the Saracen hamlets of pink stone. On the last Sunday of the month antiques fill the squares and carruggi of Pietra; in summer, in Loano, even a little book market appears.',
    },
  },
  'finalese': {
    fr: {
      carattere:
        'Le lundi, le marché entre dans les murs de Finalborgo, capitale des Del Carretto ; à Noli, république maritime pendant cinq siècles, les dimanches alternent artisans et antiquaires.',
      story:
        'Chaque quartier a son jour : le lundi le marché entre les murs du XVe siècle de Finalborgo, le jeudi à la Marina et à Noli — qui fut une république maritime indépendante pendant cinq siècles — le mardi à Spotorno face à l’île de Bergeggi. Le premier week-end du mois, Finalborgo se remplit d’antiquités ; à Noli, les dimanches se partagent entre artisans et antiquaires.',
    },
    de: {
      carattere:
        'Montags zieht der Markt hinter die Mauern von Finalborgo, der Hauptstadt der Del Carretto; in Noli, fünf Jahrhunderte lang Seerepublik, wechseln sich an den Sonntagen Kunsthandwerker und Antiquare ab.',
      story:
        'Jedes Viertel hat seinen Tag: Montags der Markt zwischen den Mauern Finalborgos aus dem 15. Jahrhundert, donnerstags an der Marina und in Noli — fünf Jahrhunderte lang unabhängige Seerepublik — dienstags in Spotorno gegenüber der Insel Bergeggi. Am ersten Wochenende im Monat füllt sich Finalborgo mit Antiquitäten; in Noli teilen sich Kunsthandwerker und Antiquare die Sonntage.',
    },
    en: {
      carattere:
        'On Mondays the market moves inside the walls of Finalborgo, capital of the Del Carretto; in Noli, a maritime republic for five centuries, Sundays alternate between artisans and antiques dealers.',
      story:
        'Every quarter has its day: on Mondays the market within Finalborgo’s fifteenth-century walls, on Thursdays at the Marina and in Noli — an independent maritime republic for five centuries — on Tuesdays in Spotorno facing the island of Bergeggi. On the first weekend of the month Finalborgo fills with antiques; in Noli the Sundays are shared between artisans and antiques dealers.',
    },
  },
  'savonese': {
    fr: {
      carattere:
        'Le lundi, les rues du centre de Savona deviennent un marché long d’un kilomètre, à l’ombre du Priamar ; dans les Albisole, patrie de la céramique, les étals côtoient les fours.',
      story:
        'Le lundi, Savona ferme les rues du centre et les livre aux étals, du Priamar à la tour du Brandale : c’est le plus long marché du Ponente. Dans les Albisole — où la céramique cuit depuis le XVIe siècle et où le front de mer est une mosaïque d’artiste — on va le mardi et le mercredi, le vendredi à Celle Ligure. Le premier week-end du mois, la brocante s’installe via Paleocapa, sous les arcades.',
    },
    de: {
      carattere:
        'Montags werden die Straßen im Zentrum von Savona zu einem kilometerlangen Markt, im Schatten des Priamar; in den Albisole, der Heimat der Keramik, stehen die Stände neben den Brennöfen.',
      story:
        'Montags sperrt Savona die Straßen des Zentrums und überlässt sie den Ständen, vom Priamar bis zum Turm des Brandale: Es ist der längste Markt des Ponente. In die Albisole — wo seit dem 16. Jahrhundert Keramik gebrannt wird und die Uferpromenade ein Künstlermosaik ist — geht man dienstags und mittwochs, freitags nach Celle Ligure. Am ersten Wochenende im Monat die Antiquitäten in der Via Paleocapa, unter den Arkaden.',
    },
    en: {
      carattere:
        'On Mondays the streets of central Savona become a market a kilometre long, in the shadow of the Priamar; in the Albisole, home of ceramics, the stalls stand next to the kilns.',
      story:
        'On Mondays Savona closes its centre streets and hands them over to the stalls, from the Priamar to the Brandale tower: it is the longest market in the Ponente. The Albisole — where ceramics have been fired since the sixteenth century and the seafront is an artists’ mosaic — have their markets on Tuesdays and Wednesdays, Celle Ligure on Fridays. On the first weekend of the month, antiques in via Paleocapa, under the arcades.',
    },
  },
  'val-bormida': {
    fr: {
      carattere:
        'Passé le col du Melogno, l’air sent la Langa : marchés de vallée à Cairo et à Millesimo, le village du pont-tour de la Gaietta et de la truffe.',
      story:
        'Ici, la Ligurie regarde vers le Piémont : bois de châtaigniers, cèpes et truffes, et des marchés qui servent les vallées. Le jeudi à Cairo Montenotte, le bourg fortifié de la première victoire de Napoléon ; le samedi à Millesimo, sous le pont-tour de la Gaietta ; le mercredi à Carcare. Le deuxième samedi du mois, à Cairo, les Mercati della Terra des producteurs des vallées ; à Altare, le village des verriers, on va le vendredi.',
    },
    de: {
      carattere:
        'Jenseits des Melogno-Passes riecht die Luft nach Langa: Talmärkte in Cairo und Millesimo, dem Dorf der Turmbrücke der Gaietta und des Trüffels.',
      story:
        'Hier blickt Ligurien Richtung Piemont: Kastanienwälder, Steinpilze und Trüffel, und Märkte, die die Täler versorgen. Donnerstags in Cairo Montenotte, dem ummauerten Ort von Napoleons erstem Sieg; samstags in Millesimo, unter der Turmbrücke der Gaietta; mittwochs in Carcare. Am zweiten Samstag im Monat in Cairo die Mercati della Terra der Erzeuger aus den Tälern; nach Altare, ins Dorf der Glasbläser, geht man freitags.',
    },
    en: {
      carattere:
        'Beyond the Melogno pass the air smells of the Langa: valley markets in Cairo and Millesimo, the village of the Gaietta tower-bridge and of truffles.',
      story:
        'Here Liguria looks towards Piedmont: chestnut woods, porcini and truffles, and markets that serve the valleys. Thursdays in Cairo Montenotte, the walled town of Napoleon’s first victory; Saturdays in Millesimo, beneath the Gaietta tower-bridge; Wednesdays in Carcare. On the second Saturday of the month, in Cairo, the Mercati della Terra of the valley producers; Altare, the glassmakers’ village, has its market on Fridays.',
    },
  },
  'beigua': {
    fr: {
      carattere:
        'Le village des amaretti et les hameaux du parc du Beigua : des marchés d’altitude entre hêtraies et air pur.',
      story:
        'Dans le parc du Beigua, les marchés sont un avant-poste de montagne : le mercredi à Sassello — le village des amaretti moelleux, première Bandiera Arancione d’Italie — le jeudi entre les hameaux d’Urbe, dans la haute vallée de l’Orba. Les derniers dimanches du mois, les étals reviennent sur la piazza San Rocco, et le 15 août la brocante monte à Pontinvrea.',
    },
    de: {
      carattere:
        'Das Dorf der Amaretti und die Weiler des Beigua-Parks: Höhenmärkte zwischen Buchenwäldern und klarer Luft.',
      story:
        'Im Beigua-Park sind die Märkte ein Vorposten in den Bergen: Mittwochs in Sassello — dem Dorf der weichen Amaretti, erste Bandiera Arancione Italiens — donnerstags in den Weilern von Urbe, im oberen Orba-Tal. An den letzten Sonntagen im Monat kehren die Stände auf die Piazza San Rocco zurück, und am 15. August zieht der Antiquitätenmarkt hinauf nach Pontinvrea.',
    },
    en: {
      carattere:
        'The village of amaretti and the hamlets of the Beigua park: mountain markets among beech woods and crisp air.',
      story:
        'Inside the Beigua park the markets are a mountain outpost: Wednesdays in Sassello — the village of soft amaretti, Italy’s first Bandiera Arancione — Thursdays among the hamlets of Urbe, in the upper Orba valley. On the last Sundays of the month the stalls return to piazza San Rocco, and on 15 August the antiques go up to Pontinvrea.',
    },
  },
}
