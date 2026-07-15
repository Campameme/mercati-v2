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
}
