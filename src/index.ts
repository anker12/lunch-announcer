import "dotenv/config";
import { getTodaysMenuAsMarkdown } from "./scrape";
import { postMarkdownMenu } from "./slack";

async function main() {
    try {
        console.log("Fetching menu...");

        const menu = await getTodaysMenuAsMarkdown();
        console.log(menu);
        console.log("Posting to Slack...");

        await postMarkdownMenu(menu);
        console.log("Done!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();