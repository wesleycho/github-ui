describe('Github', () => {
  let $http, $httpBackend, $rootScope, Github;

  beforeEach(module('netflix.github.query'));
  beforeEach(module(function($provide) {
    $provide.constant('GITHUB_KEY', 'foo');
  }));
  beforeEach(inject(function(_$http_, _$httpBackend_, _$rootScope_, _Github_) {
    $http = _$http_;
    $httpBackend = _$httpBackend_;
    $rootScope = _$rootScope_;
    Github = _Github_;
  }));

  afterEach(() => {
    $httpBackend.verifyNoOutstandingRequest();
    $httpBackend.verifyNoOutstandingExpectation();
  });

  describe('get repositories for org', () => {
    it('should reject the query when it is not a string', () => {
      spyOn($http, 'get').and.callThrough();

      Github.getRepositoriesForOrg({})
        .then(() => expect(true).toBe(false))
        .catch((error) => expect(error).toBe('org must be a string'));

      $rootScope.$digest();

      expect($http.get).not.toHaveBeenCalled();
    });

    it('should query successfully', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/orgs/foobar/repos?per_page=10000')
        .respond(200, [
          {
            id: 12,
            name: 'foo',
            owner: {
              login: 'foos',
              avatar_url: 'https://foo.com/bar.jpg',
              html_url: 'https://github.com/foos'
            },
            stargazers_count: 34
          },
          {
            id: 56,
            name: 'bar',
            owner: {
              login: 'foos',
              avatar_url: 'https://foo.com/bar.jpg',
              html_url: 'https://github.com/foos'
            },
            stargazers_count: 78
          }
        ]);

      Github.getRepositoriesForOrg('foobar')
        .then(data => {
          expect(data).toEqual({
            organization: {
              name: 'foos',
              avatar: 'https://foo.com/bar.jpg',
              url: 'https://github.com/foos'
            },
            repositories: [
              {
                id: 12,
                name: 'foo',
                owner: {
                  name: 'foos'
                },
                stargazers: 34
              },
              {
                id: 56,
                name: 'bar',
                owner: {
                  name: 'foos'
                },
                stargazers: 78
              }
            ]
          });
        }).catch(() => {
          expect(true).toBe(false);
        });

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/orgs/foobar/repos', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        },
        params: {
          per_page: 10000
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('should query successfully and reject with organization not found', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/orgs/foobar/repos?per_page=10000')
        .respond(200, {
          documentation_url: 'https://developer.github.com/v3',
          message: 'Not Found'
        });

      Github.getRepositoriesForOrg('foobar')
        .then(() => {
          expect(true).toBe(false);
        }).catch(error => {
          expect(error).toBe('Organization not found');
        });

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/orgs/foobar/repos', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        },
        params: {
          per_page: 10000
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('should query successfully and reject with no repositories found', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/orgs/foobar/repos?per_page=10000')
        .respond(200, []);

      Github.getRepositoriesForOrg('foobar')
        .then(() => {
          expect(true).toBe(false);
        }).catch(error => {
          expect(error).toBe('No repositories found');
        });

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/orgs/foobar/repos', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        },
        params: {
          per_page: 10000
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });
  });

  describe('get commits for repository', () => {
    it('should reject the promise when either the org or repository is not a string', () => {
      spyOn($http, 'get').and.callThrough();

      Github.getCommitsForRepo({}, 'foo')
        .then(() => expect(true).toBe(false))
        .catch(error => expect(error).toBe('Args must be strings'));

      Github.getCommitsForRepo('foo', {})
        .then(() => expect(true).toBe(false))
        .catch(error => expect(error).toBe('Args must be strings'));

      $rootScope.$digest();

      expect($http.get).not.toHaveBeenCalled();
    });

    it('should reject the promise when no commits are found', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/repos/foo/bar/commits')
        .respond(200, []);

      Github.getCommitsForRepo('foo', 'bar')
        .then(() => expect(true).toBe(false))
        .catch(error => expect(error).toBe('No commits found'));

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/repos/foo/bar/commits', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('should reject the promise when no commits are found', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/repos/foo/bar/commits')
        .respond(200, {
          documentation_url: 'https://developer.github.com/v3',
          message: 'Not Found'
        });

      Github.getCommitsForRepo('foo', 'bar')
        .then(() => expect(true).toBe(false))
        .catch(error => expect(error).toBe('Commits not found'));

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/repos/foo/bar/commits', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('should reject the promise when no commits are found', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/repos/foo/bar/commits')
        .respond(200, []);

      Github.getCommitsForRepo('foo', 'bar')
        .then(() => expect(true).toBe(false))
        .catch(error => expect(error).toBe('No commits found'));

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/repos/foo/bar/commits', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });

    it('should query successfully', () => {
      spyOn($http, 'get').and.callThrough();
      $httpBackend.expectGET('https://api.github.com/repos/foo/bar/commits')
        .respond(200, [
          {
            sha: 'abc123',
            html_url: 'https://github.com/foo/bar/commit/abc123',
            author: {
              login: 'baz'
            },
            commit: {
              author: {
                date: '2016-05-01T21:33:53Z'
              },
              message: 'This illustrates implementing foo\nin bar\nwhen using baz'
            }
          },
          {
            sha: 'def456',
            html_url: 'https://github.com/foo/bar/commit/def456',
            author: {
              login: 'boo'
            },
            commit: {
              author: {
                date: '2016-05-01T20:45:14Z'
              },
              message: 'This implements foo\nbar'
            }
          }
        ]);

      Github.getCommitsForRepo('foo', 'bar')
        .then(data => {
          expect(data).toEqual([
            {
              sha: 'abc123',
              url: 'https://github.com/foo/bar/commit/abc123',
              author: {
                name: 'baz'
              },
              date: new Date('2016-05-01T21:33:53Z'),
              messages: [
                'This illustrates implementing foo',
                'in bar',
                'when using baz'
              ]
            },
            {
              sha: 'def456',
              url: 'https://github.com/foo/bar/commit/def456',
              author: {
                name: 'boo'
              },
              date: new Date('2016-05-01T20:45:14Z'),
              messages: [
                'This implements foo',
                'bar'
              ]
            }
          ]);
        })
        .catch(() => expect(true).toBe(false));

      expect($http.get).toHaveBeenCalledWith('https://api.github.com/repos/foo/bar/commits', {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          Authorization: `token foo`
        }
      });

      $rootScope.$digest();
      $httpBackend.flush();
    });
  });
});
