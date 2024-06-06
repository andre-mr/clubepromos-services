function URLSanitizer(text: string) {
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

export { URLSanitizer };
