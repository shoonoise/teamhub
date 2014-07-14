'use strict';

/* Controllers */

var teamHubControllers = angular.module('teamHubControllers', []);


teamHubControllers.controller("AuthCtrl", function($scope, $location) {

    if ($location.path() == '/oauth_callback') {
        OAuth.callback(function(err, result) {
            if (err) {
                console.log(err);
            }
            else {
                $scope.user_signed = true;
                $scope.$emit('SignIn', result.access_token);
                $location.path('/') ;
                store.set("gitHubToken", result.access_token);
            }
        });
    };

    $scope.signIn = function () {
       OAuth.initialize('eeQJ00VZ4JN-FLF5BtWuBOmDXXQ');
       OAuth.redirect('github', {'cache': true}, 'http://localhost:8000/app/#oauth_callback');
    };

    $scope.logOut = function () {
       $scope.user_signed = false;
       $scope.gitHubToken = '';
       store.set("gitHubToken", '');
       $scope.repos = [];
    };

});


teamHubControllers.controller('RepoCtrl', function ($scope, $location) {
    $scope.repos = [];
    $scope.$on('SignIn', showRepos);

    var storedToken = store.get("gitHubToken");

    if (storedToken) {
        showRepos('', storedToken);
        $scope.user_signed = true;
    };

    function showRepos(event, gitHubToken) {

        var github = new Github({
            token: gitHubToken,
            auth: "oauth"
        });

        var user = github.getUser();

        user.repos(function (err, repos) {
            if (err) {
                console.log(err);
                return;
            } else {
                // TODO: should be refactored
                $scope.user_avatar = repos[0].owner.avatar_url;
                $scope.user_name = repos[0].owner.login;

                repos.map(addPullsInfo);
            }
        });

        user.orgs(function (err, orgs) {
            if (orgs) {
                orgs.map(addOrgRepos);
            }
        });

    };

    function pushToScope(repo) {
        $scope.repos.push(repo);
        $scope.$digest();
    }

    function addPullsInfo(repo) {
        if (repo.open_issues > 0) {
            github.getRepo(repo.owner.login, repo.name).listPulls('open', function (err, pulls) {
                if (err) {
                    console.log(err);
                    return;
                }
                else {
                    repo.pulls = pulls;
                    pushToScope(repo)
                }
            })
        }
        else {
            repo.pulls = [];
            pushToScope(repo)
        }
    }

    function addOrgRepos(org) {
        user.orgRepos(org.login, function (err, repos) {
            if (err) {
                console.log(err);
                return;
            } else {
                repos.map(addPullsInfo)
            }
        });
    }

});
