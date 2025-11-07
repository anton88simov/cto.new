// Пример файла для тестирования AI Terminal IDE

// Функция для вычисления суммы массива
function calculateSum(numbers) {
  return numbers.reduce((sum, num) => sum + num, 0);
}

// Функция для поиска максимального значения
function findMax(numbers) {
  return Math.max(...numbers);
}

// Класс для работы с пользователями
class UserManager {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    this.users.push(user);
  }

  getUser(id) {
    return this.users.find(user => user.id === id);
  }

  getAllUsers() {
    return this.users;
  }
}

// Экспорт функций
module.exports = {
  calculateSum,
  findMax,
  UserManager
};
