import { useFollowers } from '../hooks/useFollowers'
import { FilterPanel } from '../components/dashboard/FilterPanel'
import { FollowerList } from '../components/dashboard/FollowerList'
import { ActionPanel } from '../components/dashboard/ActionPanel'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Users, UserX, Bot, Shield } from 'lucide-react'

export function DashboardPage() {
  const {
    filteredFollowers,
    selectedFollowers,
    isLoading,
    error,
    filters,
    pagination,
    setFilters,
    selectAll,
    deselectAll,
    removeSelected,
    clearError
  } = useFollowers()

  const stats = {
    total: filteredFollowers.length,
    selected: selectedFollowers.length,
    nonMutual: filteredFollowers.filter(f => !f.isMutual).length,
    bots: filteredFollowers.filter(f => f.botScore > 0.6).length,
    verified: filteredFollowers.filter(f => f.isVerified).length
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your followers with intelligent filtering and bulk removal tools
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Followers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {pagination.total > 0 && `of ${pagination.total.toLocaleString()} total`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.selected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.selected > 0 && `${Math.round((stats.selected / stats.total) * 100)}% of filtered`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non-Mutual</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.nonMutual.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.nonMutual / stats.total) * 100)}% of filtered`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspected Bots</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.bots.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 && `${Math.round((stats.bots / stats.total) * 100)}% of filtered`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Panel */}
      <FilterPanel
        filters={filters}
        onFiltersChange={setFilters}
        onAnalyze={() => {}}
        isLoading={isLoading}
      />

      {/* Action Panel */}
      {stats.selected > 0 && (
        <ActionPanel
          selectedCount={stats.selected}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onRemoveSelected={removeSelected}
          isLoading={isLoading}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-destructive">
              <Shield className="h-4 w-4" />
              <span>{error}</span>
              <button
                onClick={clearError}
                className="ml-auto text-sm underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Follower List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Followers</CardTitle>
              <CardDescription>
                {stats.total > 0 ? (
                  <>
                    Showing {stats.total.toLocaleString()} followers
                    {filters.nonMutualOnly && (
                      <Badge variant="secondary" className="ml-2">
                        Non-mutual only
                      </Badge>
                    )}
                    {filters.botDetectionEnabled && (
                      <Badge variant="secondary" className="ml-2">
                        Bot detection enabled
                      </Badge>
                    )}
                  </>
                ) : (
                  'No followers match your current filters'
                )}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={selectAll}
                className="text-sm text-primary hover:underline"
                disabled={stats.total === 0}
              >
                Select All
              </button>
              <span className="text-muted-foreground">•</span>
              <button
                onClick={deselectAll}
                className="text-sm text-primary hover:underline"
                disabled={stats.selected === 0}
              >
                Deselect All
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <FollowerList
            followers={filteredFollowers}
            selectedFollowers={selectedFollowers}
            onToggleSelection={() => {}}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}
