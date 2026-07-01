import "dotenv/config";
import { getTodaysMenuAsHtml } from "./scrape";
import { postMenu } from "./slack";

async function main() {
    try {
        console.log("Fetching menu...");

        const menu = await getTodaysMenuAsHtml();
        console.log("Posting to Slack...");
        
        await postMenu(menu);

        console.log("Done!");
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
main();