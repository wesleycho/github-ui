describe('app component', () => {
  let $q, $rootScope, app, Github;

  beforeEach(module('netflix.github.app'));
  beforeEach(inject(function($componentController, _$q_, _$rootScope_, _Github_) {
    $q = _$q_;
    $rootScope = _$rootScope_;
    Github = _Github_;

    app = $componentController('netflixGithubApp', {
      $scope: $rootScope
    });
    app.github = {
      githubOrganization: {
        $setValidity: jasmine.createSpy('$setValidity')
      }
    }
  }));

  describe('get repositories', () => {
    it('should reset the state of existing variables when querying', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.resolve({
        organization: {
          name: 'foobar'
        },
        repositories: [
          'foo',
          'bar'
        ]
      }));
      app.organization = {};
      app.repositories = [];
      app.repository = {};
      this.commits = [];

      app.getRepositories();

      expect(app.organization).toBe(null);
      expect(app.repositories).toBe(null);
      expect(app.repository).toBe(null);
      expect(app.commits).toBe(null);
      expect(app.github.githubOrganization.$setValidity).toHaveBeenCalledWith('not-found', true);
    });

    it('should successfully get the organization and repositories', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.resolve({
        organization: {
          name: 'foobar'
        },
        repositories: [
          'foo',
          'bar'
        ]
      }));
      app.organizationName = 'foobar';

      app.getRepositories();

      expect(Github.getRepositoriesForOrg).toHaveBeenCalledWith('foobar');

      $rootScope.$digest();

      expect(app.organization).toEqual({
        name: 'foobar'
      });
      expect(app.repositories).toEqual(['foo', 'bar']);
    });

    it('should do nothing when the organization name queried for is not the same as the current one', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.resolve({
        organization: {
          name: 'foobar'
        },
        repositories: [
          'foo',
          'bar'
        ]
      }));
      app.organizationName = 'foobar';

      app.getRepositories();

      expect(Github.getRepositoriesForOrg).toHaveBeenCalledWith('foobar');

      app.organizationName = 'foobarz';
      $rootScope.$digest();

      expect(app.organization).toBe(null);
      expect(app.repositories).toBe(null);
    });

    it('should do nothing when the organization name queried for is not the same as the current one and response is rejected', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.reject('Organization not found'));
      app.organizationName = 'foobar';

      app.getRepositories();

      expect(Github.getRepositoriesForOrg).toHaveBeenCalledWith('foobar');

      app.organizationName = 'foobarz';
      $rootScope.$digest();

      expect(app.organization).toBe(null);
      expect(app.repositories).toBe(null);
      expect(app.github.githubOrganization.$setValidity.calls.count()).toBe(1);
    });

    it('should set the validity to not found when organization is not found', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.reject('Organization not found'));
      app.organizationName = 'foobar';

      app.getRepositories();

      expect(Github.getRepositoriesForOrg).toHaveBeenCalledWith('foobar');

      $rootScope.$digest();

      expect(app.github.githubOrganization.$setValidity.calls.count()).toBe(2);
      expect(app.github.githubOrganization.$setValidity.calls.argsFor(1)).toEqual([
        'not-found',
        false
      ]);
    });

    it('should set the validity to not found when organization is not found', () => {
      spyOn(Github, 'getRepositoriesForOrg').and.returnValue($q.reject({
        status: 404
      }));
      app.organizationName = 'foobar';

      app.getRepositories();

      expect(Github.getRepositoriesForOrg).toHaveBeenCalledWith('foobar');

      $rootScope.$digest();

      expect(app.github.githubOrganization.$setValidity.calls.count()).toBe(2);
      expect(app.github.githubOrganization.$setValidity.calls.argsFor(1)).toEqual([
        'not-found',
        false
      ]);
    });
  });

  describe('select repository', () => {
    it('should query commits successfully', () => {
      spyOn(Github, 'getCommitsForRepo').and.returnValue($q.resolve([
        'foo',
        'bar'
      ]));
      app.organizationName = 'foobar';

      app.selectRepository({
        name: 'baz'
      });

      expect(Github.getCommitsForRepo).toHaveBeenCalledWith('foobar', 'baz');
      expect(app.repository).toEqual({
        name: 'baz'
      });
      expect(app.noCommits).toBe(false);

      $rootScope.$digest();

      expect(app.commits).toEqual(['foo', 'bar']);
      expect(app.noCommits).toBe(false);
    });

    it('should handle when commits are not found', () => {
      spyOn(Github, 'getCommitsForRepo').and.returnValue($q.reject('Commits not found'));
      app.organizationName = 'foobar';

      app.selectRepository({
        name: 'baz'
      });

      expect(Github.getCommitsForRepo).toHaveBeenCalledWith('foobar', 'baz');
      expect(app.noCommits).toBe(false);

      $rootScope.$digest();

      expect(app.noCommits).toBe(true);
    });

    it('should handle when there are no commits', () => {
      spyOn(Github, 'getCommitsForRepo').and.returnValue($q.reject('No commits found'));
      app.organizationName = 'foobar';

      app.selectRepository({
        name: 'baz'
      });

      expect(Github.getCommitsForRepo).toHaveBeenCalledWith('foobar', 'baz');
      expect(app.noCommits).toBe(false);

      $rootScope.$digest();

      expect(app.noCommits).toBe(true);
    });
  });
});
