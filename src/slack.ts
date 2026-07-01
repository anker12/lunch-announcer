import { WebClient } from "@slack/web-api";
import { Menu } from "./scrape";

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
    throw new Error("Missing SLACK_BOT_TOKEN");
}
const client = new WebClient(token);

export async function postMarkdownMenu(markdown: string) {
     const channel = process.env.SLACK_CHANNEL_ID;
    if (!channel) {
        throw new Error("Missing SLACK_CHANNEL_ID");
    }

    await client.chat.postMessage({
        channel,
        text: markdown,
        mrkdwn: true,
    });
}