import * as cheerio from "cheerio";
import { htmlToSlackMarkdown } from "./markdownToSlack";

const SECTION_TEXT_LIMIT = 3000;
const MAX_BLOCKS = 50;

type SlackMessage = {
    blocks: Array<{
        type: "section";
        text: {
            type: "mrkdwn";
            text: string;
        };
    }>;
    text: string;
};

const section = (text: string) => ({
    type: "section" as const,
    text: {
        type: "mrkdwn" as const,
        text: text.slice(0, SECTION_TEXT_LIMIT),
    },
});

export function htmlToSlackBlocks(html: string): SlackMessage {
    const $ = cheerio.load(html);

    const dishes = $("p")
        .map((_, el) => htmlToSlackMarkdown($.html(el)))
        .get()
        .filter((dish) => dish.trim().length > 0);

    if (dishes.length === 0) {
        throw new Error("No <p> tags found.");
    }

    const title =
        [$("h1").first().text(), $("h5").first().text()]
            .map((heading) => heading.trim())
            .filter(Boolean)
            .join(" – ") || "Today's menu";

    return {
        text: title,
        blocks: [
            section(`⭐ *${title}* ⭐`),
            ...dishes
                .slice(0, MAX_BLOCKS - 1)
                .map((dish) => section(`🔸 ${dish}`)),
        ],
    };
}
