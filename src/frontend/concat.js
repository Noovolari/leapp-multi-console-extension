function concatHTML(html, concatElement) {
  const parser = new DOMParser();
  const parsed = parser.parseFromString(html, `text/html`);
  const tags = parsed.getElementsByTagName(`body`);
  for (const tag of tags) {
    concatElement.appendChild(tag);
  }
}

module.exports = concatHTML;
