const Modal = {
  open() {
    document
      .querySelector('.modal')
      .classList
      .add('modal--active')
  },
  close() {
    document
      .querySelector('.modal')
      .classList
      .remove('modal--active')
  }
}

const Storage = {
  get() {
    const storage = localStorage.getItem('dev.finances:transactions')
    return JSON.parse(storage) || []
  },

  set(transactions) {
    localStorage.setItem('dev.finances:transactions', JSON.stringify(transactions))
  },
}

const Form = {
  description: document.getElementById('description'),
  amount: document.getElementById('amount'),
  date: document.getElementById('date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()
    description = description.trim().toLowerCase()
    amount = Utils.formatAmount(amount)
    date = Utils.formatDate(date)

    return {
      description,
      amount,
      date,
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(e) {
    e.preventDefault()

    const transaction = Form.formatValues()
    Transaction.add(transaction)
    Form.clearFields()
    Modal.close()
  },

  close() {
    Form.clearFields()
    Modal.close()
  }
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)
    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(t => {
      income += t.amount > 0 && t.amount
    })

    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(t => {
      expense += t.amount < 0 && t.amount
    })

    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  },
}

const Dom = {
  transactionContainer: document.querySelector('.dataTable__body'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = Dom.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    Dom.transactionContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const cssClass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    return `
      <td class="dataTable__description">${transaction.description}</td>
      <td class="dataTable__${cssClass}">${amount}</td>
      <td class="dataTable__date">${transaction.date}</td>
      <td>
        <img onClick="Transaction.remove(${index})" src="assets/minus.svg" class="dataTable__minus" alt="Remover transação">
      </td>
    `
  },

  updateBalance() {
    document
      .getElementById('incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())
    document
      .getElementById('expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())
    // total
    let total = Transaction.total()
    document
      .getElementById('totalDisplay')
      .innerHTML = Utils.formatCurrency(total)
    const cardTotal = document.
      getElementById('cardTotal')

    total = Number(total)
    cardTotal.classList.add(total >= 0 ? 'card--green' : 'card--red')
    cardTotal.classList.remove(total >= 0 ? 'card--red' : 'card--green')
  },

  clearTransactions() {
    Dom.transactionContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    const editedValue = Math.round(Number(value) * 100)
    return editedValue
  },

  formatDate(date) {
    const [year, month, day] = date.split('-')
    return `${day}/${month}/${year}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = (Number(value) / 100).toLocaleString('pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    )


    return `${signal}${value}`
  },
}

const App = {
  init() {
    Transaction.all.forEach(Dom.addTransaction)
    Dom.updateBalance()
    Storage.set(Transaction.all)
  },

  reload() {
    Dom.clearTransactions()
    App.init()
  }
}

App.init()