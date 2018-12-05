let budgetController = (function () {
    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round(100 * (this.value / totalIncome));
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    const calculateTotal = function (type) {
        let sum = 0;
        data.allItems[type].forEach(element => {
            sum += element.value;
        });
        return sum;
    }

    let data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, des, val) {
            var newItem, ID;

            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            if (type === 'expense') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'income') {
                newItem = new Income(ID, des, val);
            }
            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            })

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalIncome: data.totals.income,
                totalExpense: data.totals.expense,
                percentage: data.percentage
            }
        },

        calculatePercentages: function () {
            data.allItems['expense'].forEach(element => {
                element.calcPercentage(data.totals.income);
            });
        },

        getPercentages: function () {
            let percentages = data.allItems.expense.map(function (cur) {
                return cur.getPercentage();
            })
            return percentages;
        },

        calculateBudget: function () {
            // Calculate and set total income and expenses
            data.totals.expense = calculateTotal('expense');
            data.totals.income = calculateTotal('income');
            // Calculate the budget: income - expenses
            data.budget = data.totals.income - data.totals.expense;
            // Calculate the percentage of income that is spent
            if (data.totals.income > 0) {
                data.percentage = Math.round(100 * (data.totals.expense / data.totals.income));
            } else {
                data.percentage = -1;
            }
        }
    }
})();

let UIController = (function () {

    const DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--date'
    };

    const formatNumber = function (num, type) {
        let numSplit, int, dec;
        num = Math.abs(num).toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        return (type === 'expense' ? '- $' : '+ $') + int + '.' + dec;
    };

    const nodeListForEach = function (nodeList, callback) {
        for (let i = 0; i < nodeList.length; i++) {
            callback(nodeList[i], i);
        }
    };

    return {
        getInputData: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either income or expense
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }
        },

        initAddBtn: function (params) {
            document.querySelector(DOMstrings.inputType).value = 'income';  
        },

        addListItem: function (item, type) {
            var html, element;
            if (type === 'income') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            } else if (type === 'expense') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div> <div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            html = html.replace('%id%', item.id).replace('%description%', item.description).replace('%value%', formatNumber(item.value, type));
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fields = Array.prototype.slice.call(fields);

            fields.forEach(element => {
                element.value = "";
            });

            fields[0].focus();
        },

        displayBudget: function (budget) {
            if (budget.budget >= 0) {
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget.budget, 'income');
            } else {
                document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(budget.budget, 'expense');
            }
            document.querySelector(DOMstrings.incomeLabel).textContent = budget.totalIncome;
            document.querySelector(DOMstrings.expenseLabel).textContent = budget.totalExpense;
            if (budget.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = budget.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },

        updatePercentages: function (percentages) {
            const fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        changedType: function () {
            const fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue
            );

            nodeListForEach(fields, function (element) {
                element.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        displayDate: function () {
            let now;
            const monthNames = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            now = new Date();
            document.querySelector(DOMstrings.dateLabel).textContent = monthNames[now.getMonth() - 1] + ' ' + now.getFullYear();
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();


let controller = (function (budgetCtrl, UICtrl) {

    const setupEventListeners = function () {
        const DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    }

    const initializeValues = function () {
        UICtrl.displayDate();
        UICtrl.displayBudget({
            budget: 0,
            totalIncome: 0,
            totalExpense: 0,
            percentage: -1
        });
        UICtrl.initAddBtn();
    }

    const updateBudget = function () {
        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. Return the budget
        const budget = budgetCtrl.getBudget();
        // 3. Display the budget on the UI
        UICtrl.displayBudget(budget);
    };

    const updatePercentages = function () {
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        // 2. Read Percentages from the budget controller
        const percentages = budgetCtrl.getPercentages();
        // 3. Update the UI with the new percentages
        UICtrl.updatePercentages(percentages);
    };

    const ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input data
        input = UICtrl.getInputData();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);
            // 4. Clear the fields
            UICtrl.clearFields();
            // 5. Calculate and update budget
            updateBudget();
            // 6. calculate and update percentages
            updatePercentages();
        }
    };

    const ctrlDeleteItem = function (event) {
        var itemID;

        itemID = event.target.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);
            // 2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            // 3. Update and show the new budget
            updateBudget();
            // 4. calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            setupEventListeners();
            initializeValues();
        }
    };

})(budgetController, UIController);

controller.init();