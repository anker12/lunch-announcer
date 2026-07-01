import TurndownService from "turndown";

export function markdownToSlack(markdown: string): string {
    return markdown.replace(/\*\*(.*?)\*\*/g, "*$1*");
}

export function htmlToSlackMarkdown(html: string): string {
    const turndown = new TurndownService();

    const markdown = turndown.turndown(html);
    return markdownToSlack(markdown);
}

export function removeBeforeSeparator(text: string): string {
    return text.replace(/^.*?==========\s*/s, "");
}