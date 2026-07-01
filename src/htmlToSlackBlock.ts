import * as cheerio from "cheerio";
import { htmlToSlackMarkdown } from "./markdownToSlack";

type SlackBlock = {
    blocks: Array<{
        type: "header" | "section";
        text: {
            type: "plain_text" | "mrkdwn";
            text: string;
        };
    }>;
    text: string;
};

export function htmlToSlackBlocks(html: string): SlackBlock {
    const $ = cheerio.load(html);

    const paragraphs = $("p")
        .map((_, el) => $.html(el))
        .get();

    if (paragraphs.length === 0) {
        throw new Error("No <p> tags found.");
    }

    const slackParagraphs = paragraphs.slice(1).map((paragraph) => ({
        type: "section" as const,
        text: {
            type: "mrkdwn" as const,
            text: `🔸 ${htmlToSlackMarkdown(paragraph)}`,
        },
    }));

    return {
        text: 'Today\'s menu',
        blocks: [
            {
                type: "header",
                text: {
                    type: "plain_text",
                    text: htmlToSlackMarkdown(paragraphs[0]).replace(/\*/g, " ⭐ "),
                },
            },
            ...slackParagraphs,
        ],
    };
}