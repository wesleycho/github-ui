App.$inject = ['Github'];
function App(Github) {
  this.getRepositories = () => {
    let name = this.organizationName;
    this.github.githubOrganization.$setValidity('not-found', true);
    this.organization = null;
    this.repositories = null;
    this.repository = null;
    this.commits = null;

    if (!this.isLoggedIn()) {
      return;
    }

    Github.getRepositoriesForOrg(this.organizationName)
      .then(org => {
        // In this situation, a more fresh request is made
        // Defer results to that response
        if (name !== this.organizationName) {
          return;
        }

        this.organization = org.organization;
        this.repositories = org.repositories;
      }).catch(error => {
        // In this situation, a more fresh request is made
        // Defer results to that response
        if (name !== this.organizationName) {
          return;
        }

        switch (error) {
          case 'Organization not found':
            this.github.githubOrganization.$setValidity('not-found', false);
            return;
        }

        if (error.status === 404) {
          this.github.githubOrganization.$setValidity('not-found', false);
        }
      });
  };

  this.isLoggedIn = () => {
    return Github.isLoggedIn;
  };

  this.loginToGithub = () => {
    Github.login()
      .then(() => {
        if (this.organizationName) {
          this.getRepositories();
        }
      });
  };

  this.logout = () => {
    Github.logout();
    this.organization = null;
    this.repositories = null;
    this.repository = null;
    this.commits = null;
  };

  this.selectRepository = (repository) => {
    this.repository = repository;
    this.commits = null;
    this.noCommits = false;
    Github.getCommitsForRepo(this.organizationName, repository.name)
      .then(commits => {
        this.commits = commits;
      }).catch(error => {
        switch (error) {
          case 'Commits not found':
          case 'No commits found':
            this.noCommits = true;
        }
      });
  };
}

angular.module('netflix.github.app', ['netflix.github.query'])
  .controller('NetflixGithubAppCtrl', App)
  .component('netflixGithubApp', {
    controller: 'NetflixGithubAppCtrl',
    controllerAs: 'app',
    templateUrl: 'src/components/app/app.html'
  });
