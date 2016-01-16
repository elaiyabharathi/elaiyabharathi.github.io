var homeapp = angular.module("airtelapp", ['angular-loading-bar','ngSanitize', 'ngAnimate', 'ngRoute','ngMessages']);
Parse.initialize("GJP0VrTV1ESuAeGSdymv9Um7TfAK4b4sseSfePON", "MaSgseObCaQXFBxCjdvNEu9Mi6TuB2hVToagIs9J");

homeapp.config(function ($routeProvider) {
    $routeProvider.when('/login',{
        templateUrl:'partials/login.html',
        controller:'loginController'
    }).when('/mobilepacks', {
        templateUrl: 'partials/mobilepacks.html',
        controller: 'mobilepacksController'
    }).when('/ongoingtransactions', {
        templateUrl: 'partials/ongoingtransactions.html',
        controller: 'ongoingtransactionsController'
    }).when('/feedbacks', {
        templateUrl: 'partials/feedbacks.html',
        controller: 'feedbacksController'
    }).when('/paywithwallet',{
        templateUrl: 'partials/paywithwallet.html',
        controller:'paywithwalletController'
    }).otherwise({redirectTo: '/mobilepacks'});
});


homeapp.controller('mobilepacksController',function($scope,$http){
    $scope.mrp=0;
    $scope.talktime=0;
    $scope.sms="0 sms/day";
    $scope.validity="0 days";
    $scope.datapack="0 mb";
    $scope.remarks="Empty";
    $scope.addpack= function(){
        var pack=Parse.Object.extend("TalkTimePack");
        var TalkTimePack=new pack();
        TalkTimePack.set("MRP",parseInt($scope.mrp,10));
        TalkTimePack.set("talkTime",parseInt($scope.talktime,10));
        TalkTimePack.set("SMS",$scope.sms);
        TalkTimePack.set("Validity",$scope.validity);
        TalkTimePack.set("Remarks",$scope.remarks);
        TalkTimePack.set("Datapack",$scope.datapack);
        TalkTimePack.set("packType",parseInt($scope.packtype,10));
        TalkTimePack.save(null,{
            success:function(TalkTimePack){
                alert("success");

            },
            error:function(TalkTimePack,error){
                alert("failed");
            }
        });

    };

    $scope.packs=[];
    $scope.packstemp=[];
    var packsq=Parse.Object.extend('TalkTimePack');
    var query=new Parse.Query(packsq);
    var temppacks=[];
    query.find({
        success:function(results){
            for(var i=0;i<results.length;i++){
                temppacks[i]=[results[i].get('MRP'),results[i].get('Validity'),results[i].get('talkTime'),results[i].get('SMS'),
                results[i].get('Datapack'),results[i].get('Remarks'),i];
                $scope.packstemp[i]=results[i];
            }
            $scope.packs=temppacks;
        },error: function(error){
            alert(error);
        }
    });

    $scope.deletepack=function(id){
        
        var myob=$scope.packstemp[parseInt(id)]
        myob.destroy({success:function(){
            alert("success");
        },error:function(){
            alert("failed");
        }});
    };
});
homeapp.controller('ongoingtransactionsController',function($scope,$http){

    $scope.ongoingtrans=[];
    var q=Parse.Object.extend('OngoingTransactions');
    var query=new Parse.Query(q);
    query.find({
        success:function(results){
            for(var i=0;i<results.length;i++){
                $scope.ongoingtrans[i]=[results[i].get('amount'),results[i].get('ACL')];
            }
        },error: function(error){
            alert(error);
        }
    });

});
homeapp.controller('feedbacksController',function($scope,$http){

    $scope.feedbacks=[];
    var feedbacksq=Parse.Object.extend('Feedback');
    var query=new Parse.Query(feedbacksq);
    query.find({
        success:function(results){
            for(var i=0;i<results.length;i++){
                $scope.feedbacks[i]=[results[i].get('message'),results[i].get('sentby'),results[i].get('email')];
            }
        },error: function(error){
            alert(error);
        }
    });
});
homeapp.controller('paywithwalletController',function($scope,$http){
    $scope.show=false;
    $scope.currentbalance=0;
    var currentUser = Parse.User.current();
    if (currentUser) {
        $scope.currentbalance=currentUser.get('WalletBalance');
    }
    $scope.showcode=function(){
        var currentUser = Parse.User.current();
        if (currentUser) {
            $scope.show=true;
            $scope.currentbalance=currentUser.get('WalletBalance');
            new QRCode(document.getElementById("qrcode"),"{\"amount\":"+$scope.amount+",\"objectId\":\""+currentUser.id+"\"}");
        } else {
            alert("Please login");
        }
    };

    $scope.collect=function(){
        var OngoingTransactions=Parse.Object.extend('OngoingTransactions');
        var currentUser = Parse.User.current();
        var query=new Parse.Query(OngoingTransactions);
        query.find({
            success:function(results){
                var amount=0;
                for(var i=0;i<results.length;i++){
                    var object = results[i];
                    amount=amount+object.get('amount');
                    object.destroy();
                }
                currentUser.set("WalletBalance",$scope.currentbalance+amount);
                currentUser.save(null,{
                    success:function(currentUser){
                        alert("success");  
                    },error:function(currentUser,e){
                        alert("Error occured");
                    }
                });
            },error : function(error){
                alert("Error occured");
            }
        });
    };

    $scope.refresh=function(){
        var currentUser = Parse.User.current();
        currentUser.fetch({
            success:function(currentUser){
                $scope.currentbalance=currentUser.get('WalletBalance');
                alert("success");
            },error:function(currentUser,e){
                alert("failed");
            }
        });
    }
});
homeapp.controller('loginController',function($scope,$http){
    $scope.login=function(){
        Parse.User.logIn($scope.username+"",$scope.password+"", {
            success: function(user) {
                alert("login success");
            },
            error: function(user, error) {
                alert("login failed please try again"+ error.code);
            }
        });
    };
});