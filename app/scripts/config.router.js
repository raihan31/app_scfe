'use strict';

angular
    .module('solcontrolApp')
    .run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.$on('$stateChangeSuccess', function () {
            window.scrollTo(0, 0);
        });
        FastClick.attach(document.body);
    },])
    .config(['$stateProvider', '$urlRouterProvider',
        function ($stateProvider, $urlRouterProvider) {

            // For unmatched routes
            $urlRouterProvider.otherwise('/');

            // Application routes
            $stateProvider
                .state('app', {
                    abstract: true,
                    templateUrl: 'views/common/layout.html'
                })

                .state('login', {
                    url: '/login',
                    templateUrl: 'views/authentication/login.html',
                    controller: 'LoginController',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                files: ['scripts/services/login.js']
                            }]).then(function () {
                                return $ocLazyLoad.load('scripts/controllers/authentication/login.js');
                            });
                        }]
                    },
                    data: {
                        pageTitle: 'Login'
                    }
                })

                // .state('app.dashboard', {
                //   url: '/',
                //   templateUrl: 'views/dashboard.html',
                //   data: {
                //     title: 'Dashboard',
                //   },
                //   resolve: {
                //       deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                //         return $ocLazyLoad.load([
                //                                  'vendor/jsPDF/addimage.js',
                //                                  'vendor/jsPDF/png_support.js',
                //                                  'vendor/jsPDF/png.js',
                //                                  'vendor/jsPDF/zlib.js',
                //                                  'vendor/FileSaver.js/FileSaver.min.js',
                //                                  'scripts/controllers/dashboard.js'
                //                               ]);
                //       }]
                //   },
                //   authenticate: true
                // })

                // .state('app.dashboard2', {
                //   url: '/dashboard2',
                //   templateUrl: 'views/dashboard2.html',
                //   data: {
                //     title: 'Dashboard',
                //   },
                //   resolve: {
                //       deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                //         return $ocLazyLoad.load('scripts/controllers/dashboard.js');
                //       }]
                //   },
                //   authenticate: true
                // })

                // .state('app.dashboard3', {
                //   url: '/dashboard3',
                //   templateUrl: 'views/dashboard3.html',
                //   data: {
                //     title: 'Dashboard',
                //   },
                //   authenticate: true
                // })

                // Customer Routes
                .state('app.customer', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/customer',
                })
                .state('app.customer.viewcustomer', {
                    url: '/:customer_id',
                    views: {
                        '': {
                            templateUrl: 'views/customer/viewcustomer.html',
                            controller: 'viewcustomer',
                            controllerAs: 'viewCustomerCtrl',
                        },
                        'customerLoan@app.customer.viewcustomer': {
                            templateUrl: 'views/customer/customer_loan.html',
                            controller: 'viewcustomer',
                            controllerAs: 'viewCustomerCtrl',
                        }
                    },

                    resolve: {
                        customer: function ($stateParams, Restangular) {
                            return Restangular.one('customer', $stateParams.customer_id).get();
                        },
                        transactions: function ($stateParams, Restangular) {
                            return Restangular.one('customer', $stateParams.customer_id).one('solcontroller_transaction').get();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(
                                'scripts/controllers/customer/viewcustomer.js'
                            );
                        }]
                    },
                    data: {
                        title: 'Customer Data',
                    }
                })
                .state('app.customer.viewcustomer.editloan', {
                    url: '/solcontroller/:sol_id/solcontroller_loan/:sol_loan_id/edit',
                    parent: 'app.customer.viewcustomer',
                    views: {
                        'customerLoan@app.customer.viewcustomer': {
                            templateUrl: 'views/customer/customer_edit_loan.html',
                            controller: 'customerEditLoan',
                            controllerAs: 'customerEditLoanCtrl'
                        }
                    },
                    resolve: {
                        solcontroller_loan: function ($stateParams, Restangular, $state) {
                            return Restangular.one('solcontroller_loan', $stateParams.sol_loan_id).get();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/customer/customer_edit_loan.js',
                                    'scripts/controllers/customer/viewcustomer.js'
                                ]);
                            });
                        }]
                    }
                })
                .state('app.customer.editcustomer', {
                    url: '/:customer_id/edit',
                    templateUrl: 'views/customer/editcustomer.html',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/customer/editcustomer.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'Edit Customer',
                    }
                })

                // Agent Routes
                .state('app.agent', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/agent',
                })
                .state('app.agent.allagents', {
                    url: 's',
                    templateUrl: 'views/agent/allagents.html',
                    controller: 'allagents',
                    controllerAs: 'allAgentsCtrl',
                    resolve: {
                        offices: function (Restangular) {
                            return Restangular.one('regional_office').get();
                        },
                        reasons: function (Restangular) {
                            return Restangular.all('visit_reason').getList();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'scripts/controllers/agent/allagents.js',
                            ]);
                        }]
                    },
                    data: {
                        title: 'All Agents',
                    }
                })
                .state('app.agent.newagent', {
                    url: '/new',
                    templateUrl: 'views/agent/newagent.html',
                    controller: 'newagent',
                    controllerAs: 'newagentCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/agent/newagent.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'New agent',
                    }
                })
                .state('app.agent.editagent', {
                    url: '/:agent_id/edit',
                    templateUrl: 'views/agent/editagent.html',
                    controller: 'editAgent',
                    controllerAs: 'editAgentCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load([
                                    'scripts/controllers/agent/editagent.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'Edit agent',
                    }
                })
                .state('app.agent.allagents.transactions', {
                    parent: 'app.agent.allagents',
                    abstract: true,
                    onEnter: ['$stateParams', '$state', '$uibModal', function ($stateParams, $state, $uibModal) {
                        $uibModal.open({
                            templateUrl: 'views/agent/agent_transactions_modal.html',
                            controller: agentTransactionsModalCtrl,
                            controllerAs: 'agentTransactionsModalCtrl',
                            size: 'lg',
                        }).result.then(function (result) {
                            $state.go('app.agent.allagents');
                        }, function () {
                            $state.go('app.agent.allagents');
                        });
                    }]
                })
                .state('app.agent.allagents.transactions.datefilter', {
                    parent: 'app.agent.allagents.transactions',
                    url: '/:agent_id/transactions?start_date&end_date',
                    resolve: {
                        sam: function ($stateParams, Restangular) {
                            return Restangular.one('sam', $stateParams.agent_id).get();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'scripts/controllers/agent/allagents.js',
                                'scripts/controllers/agent/agentmodal.js'
                            ]);
                        }]
                    },
                    views: {
                        'agentTransactions@': {
                            templateUrl: "views/agent/agents_transactions_modal_table.html",
                            controller: 'agentTransactionsModalTableCtrl',
                            controllerAs: 'agentTransactionsModalTableCtrl'
                        }
                    }
                })

                //  Branch Routes

                .state('app.branch', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/branch',
                })
                .state('app.branch.allbranches', {
                    url: 'es',
                    templateUrl: 'views/branch/allbranches.html',
                    controller: 'allBranches',
                    controllerAs: 'allBranchesCtrl',
                    resolve: {
                        reasons: function (Restangular) {
                            return Restangular.all('show_all_region_and_branch').getList();
                        },

                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load(['scripts/controllers/branch/allbranches.js']);
                        }]
                    },
                    data: {
                        title: 'All Branches',
                    }
                })
                .state('app.branch.newbranch', {
                    url: '/new',
                    templateUrl: 'views/branch/newbranch.html',
                    resolve: {
                        reasons: function (Restangular) {
                            return Restangular.all('organisation').getList();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/branch/newbranch.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'New Branch',
                    }
                })

                .state('app.editregion', {
                    url: '/region/:id/edit',
                    templateUrl: 'views/branch/editregion.html',
                    controller: 'editRegion',
                    resolve: {
                        organisations: function (Restangular) {
                            return Restangular.all('organisation').getList();
                        },
                        regional_office: function ($stateParams, Restangular) {
                            return Restangular.one('regional_office', $stateParams.id).getList('edit');
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/branch/editregion.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'Edit Region',
                    }
                })


                .state('app.editbranch', {
                    url: '/branch/:id/edit',
                    templateUrl: 'views/branch/editbranch.html',
                    controller: 'editBranch',
                    resolve: {
                        regions: function (Restangular) {
                            return Restangular.all('get_all_regions').getList();
                        },
                        branch: function (Restangular, $stateParams) {
                            return Restangular.one('branch_office', $stateParams.id).getList('edit');
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([{
                                insertBefore: '#load_styles_before',
                                files: ['vendor/sweetalert/dist/sweetalert.css']
                            },
                            {
                                name: 'oitozero.ngSweetAlert',
                                files: [
                                    'vendor/sweetalert/dist/sweetalert.min.js',
                                    'vendor/ngSweetAlert/SweetAlert.js'
                                ]
                            }
                            ]).then(function () {
                                return $ocLazyLoad.load(['scripts/controllers/branch/editbranch.js',
                                    'scripts/services/multiTabStepHandler.js'
                                ]);
                            });
                        }]
                    },
                    data: {
                        title: 'Edit Branch',
                    }
                })

                // solcontrol Routes
                .state('app.solcontrol', {
                    template: '<div ui-view></div>',
                    abstract: true,
                })
                .state('app.solcontrol.allsolcontrols', {
                    url: '/',
                    templateUrl: 'views/solcontrol/allsolcontrols.html',
                    controller: 'allsolcontrols',
                    controllerAs: 'allSolcontrolsCtrl',
                    resolve: {
                        offices: function (Restangular) {
                            return Restangular.one('regional_office').get();
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'scripts/controllers/solcontrol/allsolcontrols.js',
                                'scripts/controllers/customer/viewcustomer.js',
                                'scripts/controllers/agent/allagents.js'
                            ]);
                        }]
                    },
                    data: {
                        title: 'Portfolio'
                    }
                })
                // .state('app.solcontrol.newsolcontrol', {
                //   url: '/new',
                //   templateUrl: 'views/solcontrol/newsolcontrol.html',
                //   resolve: {
                //    deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                //       return $ocLazyLoad.load(['scripts/controllers/solcontrol/editsolcontrol.js',
                //                                 'scripts/services/multiTabStepHandler.js']);
                //     }]
                //   },
                //   data: {
                //     title: 'New solcontrol',
                //   }
                // })
                // .state('app.solcontrol.editsolcontrol', {
                //   url: 'solcontroller/:solcontrol_id/edit',
                //   templateUrl: 'views/solcontrol/editsolcontrol.html',
                //   resolve: {
                //     deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                //       return $ocLazyLoad.load([
                //         {
                //           insertBefore: '#load_styles_before',
                //           files: ['vendor/sweetalert/lib/sweet-alert.css']
                //                 },
                //         {
                //           name: 'oitozero.ngSweetAlert',
                //           files: [
                //                     'vendor/sweetalert/lib/sweet-alert.min.js',
                //                     'vendor/angular-sweetalert/SweetAlert.min.js'
                //                     ]
                //                 }]).then(function () {
                //       return $ocLazyLoad.load(['scripts/controllers/solcontrol/editsolcontrol.js',
                //                                 'scripts/services/multiTabStepHandler.js']);
                //       });
                //     }]
                //   },
                //   data: {
                //     title: 'Edit solcontrol',
                //   }
                // })

                // Transaction Routes
                .state('app.transaction', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/transaction',
                })
                .state('app.transaction.alltransactions', {
                    url: 's?start_date&end_date',
                    templateUrl: 'views/transaction/alltransactions.html',
                    controller: 'alltransactions',
                    controllerAs: 'allTransactionsCtrl',
                    resolve: {
                        offices: function (Restangular) {
                            return Restangular.one('regional_office').get();
                        },
                        all_transactions: function ($stateParams, Restangular) {
                            if ($stateParams.start_date && $stateParams.start_date != null && $stateParams.end_date && $stateParams.end_date != null) {
                                return Restangular.all('solcontroller_transaction')
                                    .getList({
                                        start_date: $stateParams.start_date,
                                        end_date: $stateParams.end_date
                                    });
                            } else {
                                return Restangular.all('solcontroller_transaction').getList();
                            }
                        },
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                                'scripts/controllers/transaction/alltransactions.js',
                                'scripts/controllers/agent/allagents.js',
                                'vendor/bootstrap-daterangepicker/daterangepicker.css',
                                'vendor/bootstrap-daterangepicker/daterangepicker.js',
                            ]);
                        }]
                    },
                    data: {
                        title: 'Transaction Log',
                    }
                })





                .state('app.token', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/token',
                })
                .state('app.token.alltoken', {
                    url: 's',
                    templateUrl: 'views/token/tokens.html',
                    controller: 'allToken',
                    controllerAs: 'allTokenCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load([
                              'scripts/controllers/token/token.js'
                            ]);
                        }]
                    },
                    data: {
                        title: 'Token Man',
                    }
                })

                .state('app.token.config', {
                    url: '/:sc_id/config',
                    templateUrl: 'views/token/config.html',
                    controller: 'generateToken',
                    resolve: {
                      deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                          return $ocLazyLoad.load([
                            'scripts/controllers/token/generate_token.js',
                            'vendor/sweetalert/dist/sweetalert.css',
                            'vendor/ngSweetAlert/SweetAlert.js'
                        ]);
                      }]
                    },

                    data: {
                        title: 'Create Token',
                    }
                })






                // SOLshare panel Routes
                .state('app.solshare', {
                    template: '<div ui-view></div>',
                    abstract: true,
                    url: '/solshare',
                })
                .state('app.solshare.alldevices', {
                    url: '/solcontrols',
                    templateUrl: 'views/solshare/alldevices.html',
                    controller: 'alldevices',
                    controllerAs: 'allDevicesCtrl',
                    resolve: {
                        deps: ['$ocLazyLoad', function ($ocLazyLoad) {
                            return $ocLazyLoad.load('scripts/controllers/solshare/alldevices.js');
                        }]
                    },
                    data: {
                        title: 'All SOLcontrols',
                    }
                });

            // // Tickets Routes
            // .state('app.ticket', {
            //   template: '<div ui-view></div>',
            //   abstract: true,
            //   url: '/ticket',
            // })
            // .state('app.ticket.alltickets', {
            //   url: 's',
            //   templateUrl: 'views/ticket/alltickets.html',
            //   resolve: {
            //     deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //       return $ocLazyLoad.load('scripts/controllers/ticket/alltickets.js');
            //     }]
            //   },
            //   data: {
            //     title: 'All tickets',
            //   }
            // })

            // // Visit Routes
            // .state('app.visit', {
            //   template: '<div ui-view></div>',
            //   abstract: true,
            //   url: '/visit',
            // })
            // .state('app.visit.allvisits', {
            //   url: 's',
            //   templateUrl: 'views/visit/allvisits.html',
            //   resolve: {
            //     deps: ['$ocLazyLoad', function ($ocLazyLoad) {
            //       return $ocLazyLoad.load('scripts/controllers/visit/allvisits.js');
            //     }]
            //   },
            //   data: {
            //     title: 'All visits',
            //   }
            // });


        } // end of config states
    ])
    .config(['$ocLazyLoadProvider', function ($ocLazyLoadProvider) {
        $ocLazyLoadProvider.config({
            debug: false,
            events: false
        });
    }])

    // Restangular config
    .config(['RestangularProvider', 'ENV', function (RestangularProvider, ENV) {
        RestangularProvider.setBaseUrl(ENV.apiEndpoint);
    }]);
