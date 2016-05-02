Github.$inject = ['$http', '$q'];
function Github($http, $q) {
  let ref = new Firebase(`incandescent-inferno-5723.firebaseio.com`);
  let isLoggedIn = false;
  let accessToken = 'abc123';
  let hasAccessToken = false;

  function formatCommit(commit) {
    return {
      sha: commit.sha,
      url: commit.html_url,
      author: {
        name: commit.author.login
      },
      date: new Date(commit.commit.author.date),
      messages: commit.commit.message.split('\n')
    };
  }

  function formatOrganization(org) {
    return {
      name: org[0].owner.login,
      avatar: org[0].owner.avatar_url,
      url: org[0].owner.html_url
    };
  }

  function formatRepository(repository) {
    return {
      id: repository.id,
      name: repository.name,
      owner: {
        name: repository.owner.login
      },
      stargazers: repository.stargazers_count
    };
  }

  return {
    getCommitsForRepo(org, repo) {
      if (!angular.isString(org) || !angular.isString(repo)) {
        return $q.reject('Args must be strings');
      }

      return $http.get(`https://api.github.com/repos/${org}/${repo}/commits`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${accessToken}`
        }
      }).then(response => {
        if (!angular.isArray(response.data)) {
          return $q.reject('Commits not found');
        }

        if (!response.data.length) {
          return $q.reject('No commits found');
        }

        return response.data.map(formatCommit);
      });
    },
    getRepositoriesForOrg(org) {
      if (!angular.isString(org)) {
        return $q.reject('org must be a string');
      }

      return $http.get(`https://api.github.com/orgs/${org}/repos`, {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token ${accessToken}`
        },
        params: {
          per_page: 10000
        }
      }).then(response => {
        if (!angular.isArray(response.data)) {
          return $q.reject('Organization not found');
        }

        if (!response.data.length) {
          return $q.reject('No repositories found');
        }

        return {
          organization: formatOrganization(response.data),
          repositories: response.data.map(formatRepository)
        };
      });
    },
    get hasAccessToken() {
      return hasAccessToken;
    },
    get isLoggedIn() {
      return isLoggedIn;
    },
    login() {
      return $q((resolve, reject) => {
        ref.authWithOAuthPopup('github', (error, authData) => {
          if (error) {
            reject(error);
          } else {
            isLoggedIn = true;
            hasAccessToken = true;
            accessToken = authData.github.accessToken;

            resolve(authData);
          }
        });
      });
    },
    logout() {
      isLoggedIn = false;
      hasAccessToken = false;
      ref.unauth();
    }
  };
}

angular.module('netflix.github.query', ['firebase'])
  .factory('Github', Github);
