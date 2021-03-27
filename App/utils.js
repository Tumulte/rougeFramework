/**
 * @param {import('express').Request} req
 * @returns {string} the table name
 */
export function makeTableName(req) {
    return `${req.params.app}_${req.params.table}`;
};

/**
 * Replace the string
 * @param {string} str
 * @returns {string}
 */
export function parseMessage(str) {
    /**
     * @type {Array}
     */
    const args = [].slice.call(arguments, 1);
    let i = 0;

    return str.replace(/%s/g, () => args[i++]);
};

/**
 * Replaces the css syntaxe with JS object compatible syntaxe
 * @param {string} text
 * @returns {string}
 */
export function cssToJson(text) {
    if (text.indexOf(".") === 0) {
        text = text.replace(".", "mkClss");
    }
    text = text.replace(/,/g, "_AND_");
    text = text.replace(" ", "");

    return text.replace(/-([a-z])/g, function (g) {
        return g[1].toUpperCase();
    });
};

/**
 *
 * @param {string} text
 */
export function jsonToCss(text) {
    if (text.indexOf("mkClss") === 0) {
        text = text.replace("mkClss", ".");
    }
    text = text.replace(/_AND_/g, ",");

    return text.replace(/([A-Z])/g, function (el) {
        return `-${el[0].toLowerCase()}`;
    });
};

/**
 *
 * @param {Object} formData a FormData() class
 */
export function urlencodeFormData(formData) {
    let value = "";

    /**
     *
     * @param {string} value
     */
    function encode(value) {
        return encodeURIComponent(value).replace(/%20/g, "+");
    }

    for (let pair of formData.entries()) {
        if (typeof pair[1] === "string") {
            value += `${value ? "&" : ""}${encode(pair[0])}=${encode(pair[1])}`;
        }
    }
    return value;
};

/**
 * @param {string} string
 * @returns {boolean}
 */
export function isHexColor(string) {
    return /^#([0-9a-f]{6})$/i.test(string);
};

export function makeFontFamilyName(name) {
    if (!name) {
        return;
    }
    return name.replace(/.otf/gm, "").replace(/.ttf/gm, "").replace(/.woff/gm, "").replace(/\"/g, "");
};

export function makeRatio(sizes) {
    const ratio = parseFloat(sizes.lineHeight) + parseFloat(sizes.marginTop) + parseFloat(sizes.marginBottom);
    return `${Math.round(ratio * 100) / 100}rem`;
};
