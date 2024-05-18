import * as fs from 'fs';
import path from 'path';

export async function generateDestination(folderPath : string, fileName? :string ) {
    try {
      // Create the folder if it doesn't exist (with recursive option)
      await fs.promises.mkdir(folderPath, { recursive: true });
      if(!fileName)return ;
      const filePath = path.join(folderPath, fileName);
      // Create an empty file
      await fs.promises.writeFile(filePath, '', 'utf8'); // Write an empty string with utf8 encoding
      console.log('Empty file created successfully!');
    } catch (err: any) {
      if (err.code === 'EACCES') {
        console.error('Permission error: Cannot create folder or file.');
      } else if (err.code === 'EEXIST') {
        console.error('Folder already exists. Skipping folder creation.');
        // You can optionally add logic here to handle existing file (e.g., create with a different name)
      } else {
        console.error('An unexpected error occurred:', err);
      }
    }
  }