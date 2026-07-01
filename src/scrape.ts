import axios from "axios";
import * as cheerio from "cheerio";

export interface Menu {
    date: string;
    title: string;
    items: string[];
}

export async function getTodaysMenuAsHtml(): Promise<string> {
    const { data } = await axios.get("https://sandsmad.dk/");

    const $ = cheerio.load(data);

    const activeDay = $(".day-wrapper.active");

    if (!activeDay.length) {
        throw new Error("Could not find today's menu.");
    }

    const englishMenu = activeDay.find(".menu-english");

    return englishMenu.html() ?? "";
};