"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.URLSanitizer = void 0;
function URLSanitizer(text) {
    let sanitizedURL = text ? text : "";
    const charsetBefore = "ÄÅÁÂÀÃäáâàãÉÊËÈéêëèÍÎÏÌíîïìÖÓÔÒÕöóôòõÜÚÛüúûùÇç";
    const charsetAfter = "AAAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUuuuuCc";
    for (let i = 0; i < charsetBefore.length; i++) {
        const regex = new RegExp(charsetBefore[i], "g");
        sanitizedURL = sanitizedURL.replace(regex, charsetAfter[i].toString());
    }
    sanitizedURL = sanitizedURL
        .replace(/[^a-zA-Z0-9 ]/g, "")
        .replace(/ /g, "-")
        .toLowerCase();
    return sanitizedURL;
}
exports.URLSanitizer = URLSanitizer;
