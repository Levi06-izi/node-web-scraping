import * as fs from 'fs';
import { parse } from "csv-parse";
import { Company } from './utils/types';

export async function parseCompanyList(filePath: string): Promise<Company[]> {
    console.log(filePath)
    const companies: Company[] = [];
    const csvData: any = await new Promise((resolve, reject) => {
      const results: string[][] = [];
      // const readStream = fs.createReadStream('C:/Users/999ab/OneDrive/Projects/node-web-scraping-Levi06-izi/inputs/companies.csv'); // Assuming 'filePath' points to your CSV
      const readStream = fs.createReadStream(filePath)
      readStream
        .pipe(parse({ delimiter: ',' })) // Adjust delimiter if needed
        .on('data', (row) => results.push(row))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
    csvData.shift()
    for (const row of csvData) {
      companies.push({
        name: row[0], // Assuming 'name' is in the first column (adjust index if needed)
        url: row[1], // Assuming 'url' is in the second column (adjust index if needed)
      });
    }
  
    return companies;
  }