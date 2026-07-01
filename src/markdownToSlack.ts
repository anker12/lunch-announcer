export function markdownToSlack(markdown: string): string {
    return markdown.replace(/\*\*(.*?)\*\*/g, "*$1*");
}

export function removeBeforeSeparator(text: string): string {
    return text.replace(/^.*?==========\s*/s, "");
}