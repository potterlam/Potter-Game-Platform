/**
 * Word Database - Past Tense (-ed) and Extension (s/es/ies)
 * Easy to modify and extend. Add or remove words as needed.
 */
window.WordDB = {
    /* ── Past Tense -ed pronunciation categories ── */
    pastTense: {
        t: [
            'asked','baked','brushed','crossed','danced','fixed','helped',
            'jumped','kicked','laughed','looked','missed','passed','pushed',
            'stopped','talked','walked','watched','wished','worked',
            'cooked','typed','kissed','washed','finished','liked','mixed',
            'packed','picked','reached','touched','dressed','pressed','blessed'
        ],
        d: [
            'aimed','called','cleaned','closed','filled','gained','joined',
            'lived','moved','opened','played','rained','saved','showed',
            'stayed','tried','used','viewed','waved','yelled',
            'amazed','annoyed','enjoyed','belonged','borrowed','claimed',
            'damaged','delivered','explored','followed','happened','imagined',
            'learned','listened','managed','organized','planned','shared'
        ],
        id: [
            'added','created','decided','divided','ended','folded','guided',
            'hated','invited','landed','needed','painted','rested','started',
            'tasted','visited','waited','wanted','wasted','yielded',
            'accepted','admitted','attended','collected','connected','counted',
            'downloaded','educated','expected','graduated','hunted','imported',
            'insisted','invested','limited','located','printed','protected'
        ]
    },

    /* ── Extension: s / es / ies plural & 3rd-person rules ── */
    extension: {
        s: [
            'cats','dogs','books','cups','desks','lamps','phones','trees',
            'plays','runs','eats','reads','writes','sings','draws','swims',
            'cars','birds','hills','pens','rules','songs','tools','walls'
        ],
        es: [
            'watches','boxes','dishes','buses','classes','glasses','kisses',
            'matches','catches','teaches','pushes','washes','brushes',
            'churches','benches','beaches','peaches','witches','switches','crashes'
        ],
        ies: [
            'babies','cities','stories','parties','families','countries',
            'bodies','copies','ladies','studies','carries','worries',
            'flies','cries','tries','dries','applies','replies','supplies'
        ]
    },

    /* ── Pronunciation / Grammar Rules ── */
    rules: {
        t:   { en: 'When the base verb ends in voiceless sounds: /p/, /k/, /f/, /s/, /ʃ/, /tʃ/, /θ/',
               zh: '當動詞原形以清輔音結尾：/p/, /k/, /f/, /s/, /ʃ/, /tʃ/, /θ/' },
        d:   { en: 'When the base verb ends in voiced sounds or vowels.',
               zh: '當動詞原形以濁輔音或母音結尾。' },
        id:  { en: 'When the base verb ends in /t/ or /d/ sounds.',
               zh: '當動詞原形以 /t/ 或 /d/ 音結尾。' },
        s:   { en: 'Add -s for most nouns / verbs.',
               zh: '大多數名詞/動詞直接加 -s。' },
        es:  { en: 'Add -es after s, x, z, sh, ch sounds.',
               zh: '在 s, x, z, sh, ch 音後加 -es。' },
        ies: { en: 'Change y to i and add -es when y follows a consonant.',
               zh: '子音 + y 結尾時，將 y 改成 i 再加 -es。' }
    },

    /* ── Base form lookup (past tense → base verb) ── */
    baseForms: {
        'asked':'ask','baked':'bake','brushed':'brush','crossed':'cross',
        'danced':'dance','fixed':'fix','helped':'help','jumped':'jump',
        'kicked':'kick','laughed':'laugh','looked':'look','missed':'miss',
        'passed':'pass','pushed':'push','stopped':'stop','talked':'talk',
        'walked':'walk','watched':'watch','wished':'wish','worked':'work',
        'cooked':'cook','typed':'type','kissed':'kiss','washed':'wash',
        'finished':'finish','liked':'like','mixed':'mix','packed':'pack',
        'picked':'pick','reached':'reach','touched':'touch','dressed':'dress',
        'pressed':'press','blessed':'bless',
        'aimed':'aim','called':'call','cleaned':'clean','closed':'close',
        'filled':'fill','gained':'gain','joined':'join','lived':'live',
        'moved':'move','opened':'open','played':'play','rained':'rain',
        'saved':'save','showed':'show','stayed':'stay','tried':'try',
        'used':'use','viewed':'view','waved':'wave','yelled':'yell',
        'amazed':'amaze','annoyed':'annoy','enjoyed':'enjoy','belonged':'belong',
        'borrowed':'borrow','claimed':'claim','damaged':'damage','delivered':'deliver',
        'explored':'explore','followed':'follow','happened':'happen','imagined':'imagine',
        'learned':'learn','listened':'listen','managed':'manage','organized':'organize',
        'planned':'plan','shared':'share',
        'added':'add','created':'create','decided':'decide','divided':'divide',
        'ended':'end','folded':'fold','guided':'guide','hated':'hate',
        'invited':'invite','landed':'land','needed':'need','painted':'paint',
        'rested':'rest','started':'start','tasted':'taste','visited':'visit',
        'waited':'wait','wanted':'want','wasted':'waste','yielded':'yield',
        'accepted':'accept','admitted':'admit','attended':'attend','collected':'collect',
        'connected':'connect','counted':'count','downloaded':'download','educated':'educate',
        'expected':'expect','graduated':'graduate','hunted':'hunt','imported':'import',
        'insisted':'insist','invested':'invest','limited':'limit','located':'locate',
        'printed':'print','protected':'protect'
    },

    /* ── Base form lookup (extension word → base form) ── */
    extensionBaseForms: {
        'cats':'cat','dogs':'dog','books':'book','cups':'cup','desks':'desk',
        'lamps':'lamp','phones':'phone','trees':'tree','plays':'play','runs':'run',
        'eats':'eat','reads':'read','writes':'write','sings':'sing','draws':'draw',
        'swims':'swim','cars':'car','birds':'bird','hills':'hill','pens':'pen',
        'rules':'rule','songs':'song','tools':'tool','walls':'wall',
        'watches':'watch','boxes':'box','dishes':'dish','buses':'bus','classes':'class',
        'glasses':'glass','kisses':'kiss','matches':'match','catches':'catch',
        'teaches':'teach','pushes':'push','washes':'wash','brushes':'brush',
        'churches':'church','benches':'bench','beaches':'beach','peaches':'peach',
        'witches':'witch','switches':'switch','crashes':'crash',
        'babies':'baby','cities':'city','stories':'story','parties':'party',
        'families':'family','countries':'country','bodies':'body','copies':'copy',
        'ladies':'lady','studies':'study','carries':'carry','worries':'worry',
        'flies':'fly','cries':'cry','tries':'try','dries':'dry',
        'applies':'apply','replies':'reply','supplies':'supply'
    },

    /* ── Helper utilities ── */

    /** Return n random words from a category */
    getRandom(category, type, n) {
        const pool = this[category]?.[type];
        if (!pool) return [];
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, n);
    },

    /** Given a word, find which past-tense type it belongs to */
    getPastTenseType(word) {
        const w = word.toLowerCase();
        for (const type of ['t', 'd', 'id']) {
            if (this.pastTense[type].includes(w)) return type;
        }
        return null;
    },

    /** Given a word, find which extension type it belongs to */
    getExtensionType(word) {
        const w = word.toLowerCase();
        for (const type of ['s', 'es', 'ies']) {
            if (this.extension[type].includes(w)) return type;
        }
        return null;
    },

    /** Get base form from past tense using lookup table */
    getBaseForm(pastTense) {
        return this.baseForms[pastTense.toLowerCase()] || pastTense.toLowerCase().replace(/ed$/, '');
    },

    /** Get base form from extension word using lookup table */
    getExtBaseForm(extWord) {
        return this.extensionBaseForms[extWord.toLowerCase()] || extWord.toLowerCase().replace(/(ies|es|s)$/, '');
    },

    /** Get the type of any word (works for both pastTense and extension) */
    getWordType(word) {
        const w = word.toLowerCase();
        for (const type of ['t','d','id']) {
            if (this.pastTense[type].includes(w)) return { type, category: 'pastTense' };
        }
        for (const type of ['s','es','ies']) {
            if (this.extension[type].includes(w)) return { type, category: 'extension' };
        }
        return null;
    },

    /** Get mixed words for a game (returns {word, type, category}) */
    getMixedBatch(n, includeExtension = false) {
        const results = [];
        const ptTypes = ['t', 'd', 'id'];
        const extTypes = includeExtension ? ['s', 'es', 'ies'] : [];

        const perType = Math.ceil(n / (ptTypes.length + extTypes.length));

        ptTypes.forEach(type => {
            this.getRandom('pastTense', type, perType).forEach(word => {
                results.push({ word, type, category: 'pastTense' });
            });
        });

        extTypes.forEach(type => {
            this.getRandom('extension', type, perType).forEach(word => {
                results.push({ word, type, category: 'extension' });
            });
        });

        return results.sort(() => Math.random() - 0.5).slice(0, n);
    }
};
