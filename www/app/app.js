// Creating module with name cordovaApp
var cordovaApp = angular.module('cordovaApp', []);

// creating the controller and inject Angular's $scope
cordovaApp.controller('mainController', function ($scope) {;
    $scope.createinvoiceform = {
        date: "2017-01-01",
        customer: {},
        amount: 15,
        description: "5 books for Rs. 2 each"
    };
    $scope.addcustomerform = {
        name: "Shashank",
        email: "shashank.agarwal94@gmail.com",
        phone: "9739170570"
    };
    $scope.launchForm = {
        companyName: ""
    }
    $scope.allInvoices = [];
    $scope.allCustomers = [];
    $scope.selectedInvoice = {};
    var defaultEmailSubjectPattern = "Invoice from <company>";
    var defaultEmailBodyPattern = `Here are your invoice details:
        From:       <company>
        Dated:      <date>
        Decription: <description>
        Amount:     <amount>`;

    $scope.defaultEmailSubject = "";
    $scope.defaultEmailBody = "";
    // localStorage.removeItem("companyName");

    $scope.db = window.sqlitePlugin.openDatabase({name: 'demo.db', location: 'default'}, function(db) {
        db.transaction(function(tx) {
            // tx.executeSql('DROP TABLE Invoices');
            // tx.executeSql('DROP TABLE Customers');
            tx.executeSql('CREATE TABLE IF NOT EXISTS Invoices (id INTEGER PRIMARY KEY AUTOINCREMENT, customerid, amount, date, description)');
            tx.executeSql('CREATE TABLE IF NOT EXISTS Customers (id INTEGER PRIMARY KEY AUTOINCREMENT, name, email, phone)');
        }, function(error) {
            console.log('Transaction ERROR: ' + error.message);
        }, function() {
            console.log('CREATED TABLE INVOICES');
        });
    });

    $scope.setCurrentScreen = function(newTab, arg) {
        $scope.currentTab = newTab;
        $scope.getAllcustomers();
        $scope.getAllInvoices();
        // $scope.createinvoiceform.customer = $scope.allCustomers[0];
        if($scope.currentTab === "invoice") {
            $scope.selectedInvoice = arg;
        }
    }

    $scope.isSet = function(tab) {
        return ($scope.currentTab === tab);
    }

    $scope.getAllInvoices = function(){
        $scope.allInvoices.length = 0;
        $scope.db.executeSql('SELECT * FROM Invoices', [], function(resultSet) {
            for (let i = 0; i < resultSet.rows.length; i++) {
                $scope.allInvoices.push(resultSet.rows.item(i));
            }
            // console.log($scope.allInvoices);
            $scope.$apply();
        }, function(error) {
            console.log(error.message);
        });
    }

    $scope.getAllcustomers = function(){
        $scope.allCustomers.length = 0;
        $scope.db.executeSql('SELECT * FROM Customers', [], function(resultSet) {
            for (let i = 0; i < resultSet.rows.length; i++) {
                $scope.allCustomers.push(resultSet.rows.item(i));
            }
            // console.log($scope.allCustomers);
            $scope.$apply();
        }, function(error) {
            console.log(error.message);
        });
    }

    $scope.getCustomerById = function(id) {
        return $scope.allCustomers.find((customer) => customer.id === id);
    }

    $scope.createInvoiceButtonClicked = function() {
        let {amount, customer, date, description} = $scope.createinvoiceform;
        // if (!amount || !customer || !date) {
        //     alert("Data missing");
        //     return;
        // }
        $scope.db.executeSql('INSERT INTO Invoices (customerid, amount, date, description) VALUES (?,?,?,?)', [customer.id, amount, date, description], function(resultSet) {
            console.log("Created invoice:", customer.id, amount, date, description)
            window.plugins.toast.showLongCenter("Created Invoice !!");
        }, function(error) {
            console.log(error.message);
        });
        $scope.setCurrentScreen("all");
    }

    $scope.addCustomerButtonClicked = function() {
        let {name, email, phone} = $scope.addcustomerform;
        // if (!name || !email || !phone) {
        //     alert("Data missing");
        //     return;
        // }
        $scope.db.executeSql('INSERT INTO Customers (name, email, phone) VALUES (?,?,?)', [name, email, phone], function(resultSet) {
            console.log("Created customer:", name, email, phone)
            window.plugins.toast.showLongCenter("Added customer!!");
        }, function(error) {
            console.log(error.message);
        });
        $scope.setCurrentScreen("settings");
    }

    $scope.sendEmail = function(email) {
        console.log($scope.selectedInvoice);
        let defaultEmailSubject, defaultEmailBody;
        defaultEmailSubject = defaultEmailSubjectPattern.replace("<company>", $scope.companyName);
        defaultEmailBody = defaultEmailBodyPattern.replace("<company>", $scope.companyName);
        defaultEmailBody = defaultEmailBody.replace("<date>", $scope.selectedInvoice.date);
        defaultEmailBody = defaultEmailBody.replace("<description>", $scope.selectedInvoice.description);
        defaultEmailBody = defaultEmailBody.replace("<amount>", $scope.selectedInvoice.amount);
        defaultEmailBody=encodeURIComponent(defaultEmailBody);
        location.href = `mailto:${email}?subject=${defaultEmailSubject}&body=${defaultEmailBody}`;
    }

    $scope.sendSMS = function(phone) {
        console.log($scope.selectedInvoice);
        let defaultSMSBody;
        defaultSMSBody = defaultEmailBodyPattern.replace("<company>", $scope.companyName);
        defaultSMSBody = defaultSMSBody.replace("<date>", $scope.selectedInvoice.date);
        defaultSMSBody = defaultSMSBody.replace("<description>", $scope.selectedInvoice.description);
        defaultSMSBody = defaultSMSBody.replace("<amount>", $scope.selectedInvoice.amount);

        var options = {
            replaceLineBreaks: false, // true to replace \n by a new line, false by default
            android: {
                intent: 'INTENT'  // send SMS with the native android SMS messaging
                //intent: '' // send SMS without open any other app
            }
        };
        var success = function () {};
        var error = function (e) { alert('Message Failed:' + e); };
        sms.send(phone, defaultSMSBody, options, success, error);
    }

    $scope.setCompanyName = function() {
        window.localStorage.setItem('companyName', $scope.launchForm.companyName);
        $scope.companyName = $scope.launchForm.companyName;
        $scope.setCurrentScreen("all")
    }

    if (window.localStorage.getItem('companyName')) {
        $scope.companyName = window.localStorage.getItem('companyName');
        $scope.setCurrentScreen("all")
    } else {
        $scope.setCurrentScreen("launch")
    }
});
