import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  // ********** MÉTODO ESPECÍFICO DESSE REPOSITÓRIO
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    // Aprendendo a usar switch and case
    const { income, outcome } = transactions.reduce(
      (accumulator, transaction) => {
        // switch: propriedade de comparação
        switch (transaction.type) {
          // case: condicional, se atendida executa o código a seguir
          case 'income':
            accumulator.income += Number(transaction.value);
            break;
          // case 2: segunda condição, se atendida executa o cód a seguir
          case 'outcome':
            accumulator.outcome += Number(transaction.value);
            break;
          // caso nenhuma condicional seja atendida executa o default
          default:
            break;
        }
        return accumulator;
      },
      // valores iniciais da função reduce
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    const total = income - outcome;

    const balance = { income, outcome, total };

    return balance;
  }
}

export default TransactionsRepository;
