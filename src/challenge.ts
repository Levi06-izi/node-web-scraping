import { parseCompanyList } from "./parseCompanyList";
import { CSV_INPUT_PATH } from "./resources";
import { scrapeCompanyPage } from "./scrapeCompanyPage";
import { SCRAPED_FILE, SCRAPED_FOLDER } from "./utils/constants";
import { generateDestination } from "./utils/generateDestination";

/**
 * The entry point function. This will read the provided CSV file, scrape the companies'
 * YC pages, and output structured data in a JSON file.
 */
export async function processCompanyList() {
  /**
   * Put your code here!
   */
  const companies = await parseCompanyList(CSV_INPUT_PATH);
  // console.log(companies)
  
  await generateDestination(SCRAPED_FOLDER, SCRAPED_FILE);
  console.log("Created output folder")
  await scrapeCompanyPage(companies)

  /**
   * running this, I'm successfully able to get info into JSON file
   * I have added a JSON file as outExample where there is copy I got
   */
}
