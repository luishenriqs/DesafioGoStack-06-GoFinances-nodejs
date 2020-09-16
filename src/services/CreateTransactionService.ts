import { getCustomRepository, getRepository } from 'typeorm';
import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    // Captura o transactionRepository from 'models/Transactions';
    const transactionRepository = getCustomRepository(TransactionRepository);
    // Captura o categoryRepository from 'models/Category';
    const categoryRepository = getRepository(Category);

    // Verifica se saldo do balance é inferior ao valor do outcome;
    const { total } = await transactionRepository.getBalance();
    if (type === 'outcome' && total < value) {
      throw new AppError('You do not have enough balance');
    }

    // *********** BUSCA CATEGORY EXISTENTE OU CRIA CATEGORY NOVA
    // .findOne busca a categoria especificada no parâmetro (verifica se existe)
    let transactionCategory = await categoryRepository.findOne({
      // Obs: Aqui title da tab. categories (Não confundir com title/transactions)
      where: { title: category },
    });
    // Caso 'category not existed' então será criada e salva no repositório;
    if (!transactionCategory) {
      transactionCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(transactionCategory);
    }

    const category_id = transactionCategory.id;
    // *********** CRIA NOVA TRANSACTION ****************
    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
