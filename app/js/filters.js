'use strict';

/* Filters */


angular.module('teamHubFilters', []).filter('project', function() {
  return function(repos, prj) {
    // console.log(repos, prj);
    if (prj == '') {
        return repos;
    }
    return repos.filter(function(repo){
            if (repo.hasOwnProperty('proj') && repo.proj.indexOf(prj) > -1) {
                return repo;
                }
    });
  };
});
