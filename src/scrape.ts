import axios from "axios";
import * as cheerio from "cheerio";

const MENU_URL = "https://sandsmad.dk/";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2_000;

const REQUEST_HEADERS = {
    "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "da-DK,da;q=0.9,en;q=0.8",
};

export interface Menu {
    date: string;
    title: string;
    items: string[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The site labels each day as "tirsdag 28/7" / "Tuesday 28/7". */
function copenhagenDayLabel(now: Date): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/Copenhagen",
        day: "numeric",
        month: "numeric",
    }).formatToParts(now);

    const value = (type: "day" | "month") =>
        Number(parts.find((part) => part.type === type)?.value);

    return `${value("day")}/${value("month")}`;
}

async function fetchTodaysMenuAsHtml(): Promise<string> {
    const response = await axios.get<string>(MENU_URL, {
        headers: REQUEST_HEADERS,
        responseType: "text",
        timeout: 20_000,
    });

    const $ = cheerio.load(response.data);
    const days = $(".day-wrapper");
    const dayLabel = copenhagenDayLabel(new Date());

    const matchedByDate = days.filter((_, el) =>
        $(el).find("h5").text().includes(dayLabel),
    );

    const today = matchedByDate.length
        ? matchedByDate.first()
        : days.filter(".active").first();

    if (!today.length) {
        throw new Error(
            `Could not find today's menu (${dayLabel}). ` +
                `HTTP ${response.status}, ${response.data.length} bytes, ` +
                `${days.length} day sections, labels: ${days
                    .map((_, el) => $(el).find("h5").first().text().trim())
                    .get()
                    .join(" | ")}`,
        );
    }

    return today.find(".menu-english").html() ?? "";
}

export async function getTodaysMenuAsHtml(): Promise<string> {
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            return await fetchTodaysMenuAsHtml();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            if (attempt < MAX_ATTEMPTS) {
                console.warn(
                    `Menu fetch attempt ${attempt}/${MAX_ATTEMPTS} failed: ${lastError.message}. Retrying in ${RETRY_DELAY_MS / 1000}s...`,
                );
                await sleep(RETRY_DELAY_MS);
            }
        }
    }

    throw lastError!;
}
