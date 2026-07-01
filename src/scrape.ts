import axios from "axios";
import * as cheerio from "cheerio";
import TurndownService from "turndown";
import { markdownToSlack, removeBeforeSeparator } from "./markdownToSlack";

export interface Menu {
    date: string;
    title: string;
    items: string[];
}

export async function getTodaysMenuAsMarkdown(): Promise<string> {
    const { data } = await axios.get("https://sandsmad.dk/");

    const $ = cheerio.load(data);

    const activeDay = $(".day-wrapper.active");

    if (!activeDay.length) {
        throw new Error("Could not find today's menu.");
    }

    const englishMenu = activeDay.find(".menu-english");

    const turndown = new TurndownService();

    const markdown = turndown.turndown(englishMenu.html() ?? "");

    const slackFormattedMarkdown = markdownToSlack(removeBeforeSeparator(markdown));

    console.log(slackFormattedMarkdown);

    return slackFormattedMarkdown;
};