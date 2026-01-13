module.exports = {
    content: [
        "./templates/**/*.html",
        "./parts/**/*.html",
        "./patterns/**/*.{php,html}",
        "./**/*.php",
        "./theme.json",
    ],
    safelist: [
        // spacing
        { pattern: /^(p|px|py|pt|pr|pb|pl|m|mx|my|mt|mr|mb|ml)-\d+$/ , variants: ['sm','md','lg','xl']},
        { pattern: /^gap-\d+$/, variants: ['sm','md','lg','xl'] },

        // layout
        { pattern: /^(flex|grid|block|inline-block|hidden)$/ , variants: ['sm','md','lg','xl']},
        { pattern: /^(items|justify)-(start|end|center|between|around|evenly)$/ , variants: ['sm','md','lg','xl']},

        // size
        { pattern: /^(w|h)-(\d+|full|screen|min|max)$/ , variants: ['sm','md','lg','xl']},

        // typography
        { pattern: /^text-(xs|sm|base|lg|xl|2xl|3xl|4xl)$/ , variants: ['sm','md','lg','xl']},
        { pattern: /^font-(normal|medium|semibold|bold)$/ },

        // colors (最低限。必要に応じて増やす)
        { pattern: /^bg-(white|black|transparent)$/ },
        { pattern: /^text-(white|black)$/ },

        // box
        { pattern: /^rounded(-(none|sm|md|lg|xl|2xl|full))?$/ },
        { pattern: /^shadow(-(sm|md|lg|xl|2xl))?$/ },
        { pattern: /^border(-(0|2|4|8))?$/ }
    ],
    theme: { extend: {} },
    plugins: [],
};
