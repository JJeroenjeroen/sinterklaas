const SINT = "DANK";
const PIET = "BAIE";

const CODEWORDS =  {
    "ROAN": SINT,
    "MARLIES": PIET
}
const LOCATION_LIST = ['VLIEGTUIG', 'PRETORIA', 'KRUGERPARK', 'KAAPSTAD'];
const ANSWERS = {
    ROAN: {
        VLIEGTUIG: 8,
        PRETORIA: 3,
        KRUGERPARK: '3b8',
        KAAPSTAD: 'lekker wijntje hoor',
    },
    MARLIES: {
        VLIEGTUIG: 16,
        PRETORIA: 'zuma',
        KRUGERPARK: 'sawubona',
        KAAPSTAD: 'slurp',
    }
}

const CORRECT_ANSWER_MESSAGES = {
    ROAN: {
        VLIEGTUIG: "Wat een Pret, je hebt zijn eten vergiftigd en de Rus ligt er tijdelijk uit! Nu is het vliegtuig veilig!",
        PRETORIA: "Klik klik BOEM! Je hebt hem in zijn knieschijf geraakt! Die kan niks meer!",
        KRUGERPARK: "YES! Je hebt zijn botten verbrijzeld. De Rus huilt en laat de bevolking met rust.",
        KAAPSTAD: "Die heb je goed te pakken. Nu tijd voor nog een wijntje!",
    },
    MARLIES: {
        VLIEGTUIG: "Fantistisch mooi, de Rus is gespot! Nu kan de geheim agent hem onschadelijk maken!",
        PRETORIA: "Goed gedaan, de regereingsleden vertrouwen je en volgen je naar de Nederlandse ambassade!",
        KRUGERPARK: "Yebo! Dat heb je mooi uitgesproken!",
        KAAPSTAD: "Hoezee, de geheime agent heeft het signaal ontvangen, en weet nu dat het tijd is om in actie te komen",
    }
}



export { SINT, PIET, LOCATION_LIST, ANSWERS, CORRECT_ANSWER_MESSAGES, CODEWORDS };