Github.$inject = ['$http', '$q', 'GITHUB_KEY'];
function Github($http, $q, GITHUB_KEY) {
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
          Authorization: `token ${GITHUB_KEY}`
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
          Authorization: `token ${GITHUB_KEY}`
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
    }
  };
}

angular.module('netflix.github.query', [])
  .constant('GITHUB_KEY', 'b4a2435c408f3643eec67192bc98e9ea3ee98a06')
  .factory('Github', Github);
