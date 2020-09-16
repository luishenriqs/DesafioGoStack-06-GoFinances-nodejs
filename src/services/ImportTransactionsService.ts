import csvParse from 'csv-parse';
import fs from 'fs';
import CreateTransactionService from './CreateTransactionService';

interface CSVTransaction {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  public async execute(filePath: string): Promise<void> {

    const readCSVStream = fs.createReadStream(filePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });
    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: CSVTransaction[] = [];

    parseCSV.on('data', async line => {
      const [title, type, value, category] = line.map((cell: string) =>
        cell.toString(),
      );

      if (!title || !type || !value) {return};

      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });
    // ***** Até aqui importação do CSVFile feita com sucesso.

    // Aqui nova instância do service
    const createTransaction = new CreateTransactionService();

    // O loop for...of percorre objetos iterativos
    for (const elem of transactions) {
      await createTransaction.execute(elem);
    };
  }
}

export default ImportTransactionsService;
