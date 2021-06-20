const acronyms = {
    'I\'m not a lawyer':/ianal/gi,
    'as far as I know':/afaik/gi,
}

export default function process(str){
    let processedString = str;
    for (const [key, value] of Object.entries(acronyms)) {
        processedString = processedString.replace(value, key);
    }
    return processedString;
}
