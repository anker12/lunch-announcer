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

type Paragraph = {
    markdown: string;
    isHeader: boolean;
    hasInlineDescription: boolean;
};

const section = (text: string) => ({
    type: "section" as const,
    text: {
        type: "mrkdwn" as const,
        text: text.slice(0, SECTION_TEXT_LIMIT),
    },
});

const toMenuSections = (paragraphs: Paragraph[]): string[] => {
    const sections: string[] = [];
    let index = 0;

    while (index < paragraphs.length) {
        const current = paragraphs[index];

        if (current.isHeader) {
            const next = paragraphs[index + 1];
            const hasFollowingDescription =
                !current.hasInlineDescription && next && !next.isHeader;

            sections.push(
                hasFollowingDescription
                    ? `🔸 ${current.markdown}\n${next.markdown}`
                    : `🔸 ${current.markdown}`,
            );
            index += hasFollowingDescription ? 2 : 1;
            continue;
        }

        sections.push(current.markdown);
        index += 1;
    }

    return sections;
};

export function htmlToSlackBlocks(html: string): SlackMessage {
    const $ = cheerio.load(html);

    const paragraphs = $("p")
        .map((_, el) => {
            const html = $.html(el);
            return {
                markdown: htmlToSlackMarkdown(html),
                isHeader: $(el).find("strong").length > 0,
                hasInlineDescription: html.includes("<br"),
            };
        })
        .get()
        .filter((paragraph) => paragraph.markdown.trim().length > 0);

    if (paragraphs.length === 0) {
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
            ...toMenuSections(paragraphs)
                .slice(0, MAX_BLOCKS - 1)
                .map(section),
        ],
    };
}
