import { WebClient } from "@slack/web-api";
import { Menu } from "./scrape";
import { htmlToSlackBlocks } from "./htmlToSlackBlock";

const token = process.env.SLACK_BOT_TOKEN;
if (!token) {
    throw new Error("Missing SLACK_BOT_TOKEN");
}
const client = new WebClient(token);

export async function postMenu(menuAsHtml: string) {
    const channel = process.env.SLACK_CHANNEL_ID;
    if (!channel) {
        throw new Error("Missing SLACK_CHANNEL_ID");
    }

    const slackBlock = htmlToSlackBlocks(menuAsHtml);

    console.log(slackBlock);

    await client.chat.postMessage({
        channel,
        ...slackBlock,
    });
}