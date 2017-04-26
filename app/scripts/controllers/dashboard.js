'use strict';

angular.module('solcontrolApp').controller('dashboard',function($scope, Restangular) {

    // Keep the data for PDF export
    var allData = {};

    /*
    * General KPIs
    */
    $scope.loading1 = true;
    Restangular.all('solcontroller').get('total').then(function(response){
        $scope.loading1 = false;
        if (response === undefined){
            $scope.total_nb_solcontrols = '0';
            allData['Total number of agents'] = '0';
        }else{
            $scope.total_nb_solcontrols = response;
            allData['Total number of agents'] = response;
        }
    }, function() {
        $scope.loading1 = false;
        $scope.total_nb_solcontrols = 0;
        allData['Total number of agents'] = 0;
    });

    $scope.loading2 = true;
    Restangular.all('sam').get('total').then(function(response){
        $scope.loading2 = false;
        if (response === undefined){
            $scope.total_nb_agents = '0';
            allData['Total number of SOLcontrols'] = '0';
        }else{
            $scope.total_nb_agents = response;
            allData['Total number of SOLcontrols'] = response;
        }
    }, function() {
        $scope.loading2 = false;
        $scope.total_nb_agents = 0;
        allData['Total number of SOLcontrols'] = 0;
    });

    $scope.loading3 = true;
    Restangular.all('sam').get('sc_per_sam').then(function(response){
        $scope.loading3 = false;
        var round = response*100;
        round = Math.round(round);
        round = round/100;
        $scope.avg_nb_solcontrols_per_agent = round;
        allData['Average number of SOLcontrols per agent'] = round;
    }, function() {
        $scope.loading3 = false;
        $scope.avg_nb_solcontrols_per_agent = 0;
        allData['Average number of SOLcontrols per agent'] = 0;
    });

    $scope.loading4 = true;
    Restangular.all('solcontroller').get('avg_outstanding_payback_time').then(function(response){
        $scope.loading4 = false;
        var nb = response;
        var round = nb*100;
        round = Math.round(round);
        round = round/100;
        $scope.avg_outstanding_payback = round + ' days';
        allData['Average outstanding payback time'] = round + ' days';
    }, function() {
        $scope.loading4 = false;
        $scope.avg_outstanding_payback = '0';
        allData['Average outstanding payback time'] = '0';
    });

    $scope.loading5 = true;
    Restangular.all('solcontroller').get('avg_outstanding_balance').then(function(response){
        $scope.loading5 = false;
        var nb = response;
        var round = nb*100;
        round = Math.round(round);
        round = round/100;
        $scope.avg_outstanding_balance = round + ' Tk';
        allData['Average outstanding balance'] = round + ' Tk';
    }, function() {
        $scope.loading5 = false;
        $scope.avg_outstanding_balance = '0';
        allData['Average outstanding balance'] = '0';
    });

    /*
    * Easy pie chart
    */
    $scope.percent_solved = 50;
    $scope.percent_warning = 74;
    $scope.percent_broken = 82;

    $scope.options = {
        lineWidth: 4,
        size: 80,
        barColor: 'rgba(255,255,255,.7)',
        trackColor: 'rgba(0,0,0,.1)',
        lineCap: 'butt',
        easing: 'easeOutBounce',
        onStep: function (from, to, percent) {
            angular.element(this.el).find('.percent').text(Math.round(percent));
        }
    };

    /*
    * Daily Visits Chart
    */
    var minDate = function(dateArray, numberDays){
        if (numberDays === -1){
            return dateArray;
        } else{
            return dateArray.slice(dateArray.length-numberDays, dateArray.length);
        }
    };
    $scope.weeks = 30;
    var data = ['03/01/16','04/01/16','05/01/16','06/01/16','07/01/16','08/01/16','09/01/16','10/01/16','11/01/16','12/01/16','13/01/16','14/01/16','15/01/16','16/01/16','17/01/16','18/01/16','19/01/16','20/01/16','21/01/16','22/01/16','23/01/16','24/01/16','25/01/16','26/01/16','27/01/16','28/01/16','29/01/16','30/01/16','31/01/16','01/02/16','02/02/16','03/02/16','04/02/16','05/02/16','06/02/16','07/02/16','08/02/16','09/02/16','10/02/16','11/02/16','12/02/16','13/02/16','14/02/16','15/02/16','16/02/16','17/02/16','18/02/16','19/02/16','20/02/16','21/02/16','22/02/16','23/02/16','24/02/16','25/02/16','26/02/16','27/02/16','28/02/16','29/02/16','01/03/16','02/03/16','03/03/16','04/03/16','05/03/16','06/03/16','07/03/16','08/03/16','09/03/16','10/03/16','11/03/16','12/03/16','13/03/16','14/03/16','15/03/16','16/03/16','17/03/16','18/03/16','19/03/16','20/03/16','21/03/16','22/03/16','23/03/16','24/03/16','25/03/16','26/03/16','27/03/16','28/03/16','29/03/16','30/03/16','31/03/16','01/04/16','02/04/16','03/04/16','04/04/16','05/04/16','06/04/16','07/04/16','08/04/16','09/04/16','10/04/16','11/04/16','12/04/16','13/04/16','14/04/16','15/04/16','16/04/16','17/04/16','18/04/16','19/04/16','20/04/16','21/04/16','22/04/16','23/04/16','24/04/16','25/04/16','26/04/16','27/04/16','28/04/16','29/04/16','30/04/16','01/05/16','02/05/16','03/05/16','04/05/16','05/05/16','06/05/16','07/05/16','08/05/16','09/05/16','10/05/16','11/05/16','12/05/16','13/05/16','14/05/16','15/05/16','16/05/16','17/05/16','18/05/16','19/05/16','20/05/16','21/05/16','22/05/16','23/05/16','24/05/16','25/05/16','26/05/16','27/05/16','28/05/16','29/05/16','30/05/16','31/05/16','01/06/16','02/06/16','03/06/16','04/06/16','05/06/16','06/06/16','07/06/16','08/06/16','09/06/16','10/06/16','11/06/16','12/06/16','13/06/16','14/06/16','15/06/16','16/06/16','17/06/16','18/06/16','19/06/16','20/06/16','21/06/16','22/06/16','23/06/16','24/06/16','25/06/16','26/06/16','27/06/16','28/06/16','29/06/16','30/06/16','01/07/16','02/07/16','03/07/16','04/07/16','05/07/16','06/07/16','07/07/16','08/07/16','09/07/16','10/07/16','11/07/16','12/07/16','13/07/16','14/07/16','15/07/16','16/07/16','17/07/16','18/07/16','19/07/16','20/07/16','21/07/16','22/07/16','23/07/16','24/07/16','25/07/16','26/07/16','27/07/16','28/07/16','29/07/16','30/07/16','31/07/16','01/08/16','02/08/16','03/08/16'];
    var dataRanged = minDate(data, $scope.weeks*7);
    var min = dataRanged[0];

    $scope.updateDates = function(){
        dataRanged = minDate(data, $scope.weeks*7);
        min = dataRanged[0];
        $scope.dailyVisitsLabels = dataRanged;
        $scope.dailyVisitsChartOptions = {
            elements: {
                line: {
                  tension: 0,
                  fill: false,
                },
                point: {
                    radius: 3,
                    borderWidth: 0
               }
            },
            title: {
                display: true,
                text: 'Daily Visits'
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10
                },
            },
            hover: {
                mode: 'label'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMMM'
                        },
                        format: 'DD/MM/YY',
                        max: '03/08/16',
                        min: min
                      }
                  }]
            }
        };
    };

    $scope.lastWeek = function(){
        dataRanged = minDate(data, 7);
        min = dataRanged[0];
        $scope.dailyVisitsLabels = dataRanged;
        $scope.dailyVisitsChartOptions = {
            elements: {
                line: {
                  tension: 0,
                  fill: false,
                },
                point: {
                    radius: 3,
                    borderWidth: 0
               }
            },
            title: {
                display: true,
                text: 'Daily Visits'
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10
                },
            },
            hover: {
                mode: 'label'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'days',
                        displayFormats:{
                            day: 'll'
                        },
                        format: 'DD/MM/YY',
                        max: '03/08/16',
                        min: min
                      }
                  }]
            }
        };
    };

    $scope.lastMonth = function(){
        dataRanged = minDate(data, 31);
        min = dataRanged[0];
        $scope.dailyVisitsLabels = dataRanged;
        $scope.dailyVisitsChartOptions = {
            elements: {
                line: {
                  tension: 0,
                  fill: false,
                },
                point: {
                    radius: 3,
                    borderWidth: 0
               }
            },
            title: {
                display: true,
                text: 'Daily Visits'
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10
                },
            },
            hover: {
                mode: 'label'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'weeks',
                        displayFormats: {
                            day: 'DD/MM/YY'
                        },
                        format: 'DD/MM/YY',
                        max: '03/08/16',
                        min: min
                      }
                  }]
            }
        };
    };

    $scope.lastYear = function(){
        dataRanged = data;
        min = dataRanged[0];
        $scope.dailyVisitsLabels = dataRanged;
        $scope.dailyVisitsChartOptions = {
            elements: {
                line: {
                  tension: 0,
                  fill: false,
                },
                point: {
                    radius: 3,
                    borderWidth: 0
               }
            },
            title: {
                display: true,
                text: 'Daily Visits'
            },
            legend: {
                display: true,
                position: 'bottom',
                labels: {
                    boxWidth: 10
                },
            },
            hover: {
                mode: 'label'
            },
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'month',
                        displayFormats: {
                            month: 'MMMM'
                        },
                        format: 'DD/MM/YY',
                        max: '03/08/16',
                        min: min
                      }
                  }]
            }
        };
    };

    $scope.dailyVisitsLabels = dataRanged;
    $scope.dailyVisitsSeries = ['Total number of visits', 'Agent visits, user not at home', 'Fake visits'];
    $scope.dailyVisitsData = [
            ['195','190','159','168','156','149','154','200','202','202','188','162','159','188','166','192','192','179','179','159','166','191','201','197','194','176','187','188','173','153','170','165','195','182','186','149','183','192','201','182','192','186','196','148','172','160','192','162','191','168','173','154','156','171','148','148','200','188','188','171','193','156','189','186','190','172','187','170','162','186','150','151','170','198','152','194','156','196','153','199','162','178','151','171','202','152','171','200','192','157','168','183','165','154','167','153','179','152','176','194','190','178','197','157','174','201','149','182','195','155','179','155','185','182','179','185','186','148','182','176','157','202','157','175','154','176','181','186','181','154','177','168','185','172','178','156','171','180','191','163','187','167','171','170','202','202','152','185','202','187','158','157','187','167','185','193','196','163','176','174','169','151','195','151','175','171','160','198','148','149','159','187','168','182','155','167','182','159','150','181','199','161','191','183','181','173','174','174','188','148','201','155','151','194','159','178','162','172','174','163','173','185','148','194','165','155','159','199','167','161','178','163','175','166'],
            ['55','33','43','41','33','42','49','36','33','60','13','47','31','38','61','55','22','61','47','38','16','58','35','34','19','64','49','45','30','44','50','20','13','29','48','33','58','32','57','27','28','58','61','46','32','58','36','41','55','19','15','59','64','38','29','18','37','13','50','54','45','36','61','45','53','45','14','46','13','58','61','28','52','58','62','19','52','33','48','43','39','51','37','39','24','53','44','48','54','30','38','34','54','35','14','42','15','15','24','16','61','20','32','48','14','29','54','53','49','38','31','24','24','56','50','35','44','30','19','34','48','45','55','37','15','57','15','18','59','26','21','56','34','40','39','36','57','29','24','41','54','43','53','14','34','39','37','14','57','43','35','40','24','25','13','26','17','15','32','64','29','40','55','50','16','30','21','60','46','33','37','36','63','26','37','32','53','61','33','45','40','56','20','51','16','20','13','21','23','32','21','39','60','63','24','64','28','33','60','62','54','33','33','52','46','57','20','35','53','41','15','28','32','23'],
            ['7','1','12','11','9','16','0','7','15','5','7','0','14','5','20','9','13','7','4','6','4','7','15','0','18','16','6','5','20','7','15','6','8','7','17','17','2','18','3','18','3','11','18','17','16','18','5','8','5','10','15','10','17','9','10','15','4','17','0','3','3','15','9','12','2','6','9','4','3','13','1','6','3','20','3','19','18','8','7','3','18','1','13','15','11','3','10','15','20','11','19','3','6','8','15','8','14','4','13','18','17','14','4','20','14','7','18','11','16','5','15','14','7','7','8','18','11','19','13','10','9','11','14','15','19','9','2','13','13','15','11','9','9','15','8','2','2','6','14','18','12','8','11','19','16','20','17','6','19','9','17','7','20','11','1','19','20','4','11','13','20','1','1','8','17','10','11','19','17','5','17','9','14','8','8','9','8','4','16','6','13','13','13','13','3','15','11','3','19','2','16','18','3','18','6','0','8','17','19','4','2','16','14','16','3','1','5','11','5','0','17','19','14','10']
        ];
    $scope.onClick = function (points, evt) {
        console.log(points, evt);
    };
    $scope.dailyVisitsChartOptions = {
        elements: {
            line: {
              tension: 0,
              fill: false,
            },
            point: {
                radius: 3,
                borderWidth: 0
           }
        },
        title: {
            display: true,
            text: 'Daily Visits'
        },
        legend: {
            display: true,
            position: 'bottom',
            labels: {
                boxWidth: 10
            },
        },
        hover: {
            mode: 'label'
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                type: 'time',
                time: {
                    unit: 'month',
                    displayFormats: {
                        month: 'MMMM'
                    },
                    format: 'DD/MM/YY',
                    max: '03/08/16',
                    min: min
                  }
              }]
        }
    };

    /*
    * Sold SOLcontrols Graph
    */
    $scope.soldSClabels = ['District1', 'District2', 'District3', 'District4', 'District5','District6', 'District7','District8', 'District9'];
    $scope.soldSCdata = ['149','159','187','168','182','155','167','182','159'];

    $scope.soldSCRangeSelection = 'month';

    $scope.soldSCoptions = {
        title: {
            display: true,
            text: 'Sold Systems Last Month'
        },
        scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              }
            }]
        }
    };

    $scope.soldSystemsLastWeek = function(){
        $scope.soldSCRangeSelection = 'week';
        $scope.soldSCdata = ['163','135','128','182','162','155','168','182','123'];
        $scope.soldSCoptions = {
            title: {
                display: true,
                text: 'Sold Systems Last Week'
            },
            scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
            }
        };
    };

    $scope.soldSystemsLastMonth = function(){
        $scope.soldSCRangeSelection = 'month';
        $scope.soldSCdata = ['149','159','187','168','182','155','167','182','159'];
        $scope.soldSCoptions = {
            title: {
                display: true,
                text: 'Sold Systems Last Month'
            },
            scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
            }
        };
    };

    $scope.soldSystemsLast3Months = function(){
        $scope.soldSCRangeSelection = '3months';
        $scope.soldSCdata = ['161','124','162','182','163','192','122','155','198'];
        $scope.soldSCoptions = {
            title: {
                display: true,
                text: 'Sold Systems Last 3 Months'
            },
            scales: {
                yAxes: [{
                  ticks: {
                    beginAtZero: true
                  }
                }]
            }
        };
    };

    /*
    * Download PDF
    */
    $scope.downloadPdf = function(){
        var currentdate = new Date();
        var date = currentdate.getDate() + '/' + (currentdate.getMonth()+1)  + '/' + currentdate.getFullYear();

        var imgData = 'data:image/png;base64,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';

        var doc = new jsPDF();
        // doc.setFontSize(18);
        // doc.text(84, 20, 'ME SOLshare');
        doc.addImage(imgData, 'png', 70, 10, 70, 17.27);

        doc.setFontSize(22);
        doc.text(47, 48, 'SOLcontrol Dashboard Overview');
        doc.setFontSize(20);
        doc.text(84, 58, date);
        doc.setFontSize(16);

        var y = 78;

        angular.forEach(allData, function(value, key) {
            doc.text(25, y, key + ': ' + value);
            y += 10;
        });

        // Save the PDF
        doc.save('dashboard_' + date + '.pdf');
    };

});
