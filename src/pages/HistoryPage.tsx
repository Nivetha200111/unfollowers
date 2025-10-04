import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { REMOVAL_REASONS } from '../types'
import { formatDate, formatNumber } from '../utils/validators'
import { History, Trash2, Users, Calendar, Filter } from 'lucide-react'
import toast from 'react-hot-toast'

interface RemovalHistory {
  id: string
  followerIds: string[]
  reason: string
  count: number
  timestamp: string
}

export function HistoryPage() {
  const [removals, setRemovals] = useState<RemovalHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterReason, setFilterReason] = useState<string>('all')

  // Load removal history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        setIsLoading(true)
        
        // In a real app, this would fetch from the API
        // const response = await apiService.getRemovalHistory()
        // if (response.success && response.data) {
        //   setRemovals(response.data.data)
        // }
        
        // Mock data for demonstration
        const mockData: RemovalHistory[] = [
          {
            id: '1',
            followerIds: ['f1', 'f2', 'f3'],
            reason: 'non_mutual',
            count: 3,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
          },
          {
            id: '2',
            followerIds: ['f4', 'f5'],
            reason: 'bot_detected',
            count: 2,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString()
          },
          {
            id: '3',
            followerIds: ['f6'],
            reason: 'low_popularity',
            count: 1,
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString()
          }
        ]
        
        setRemovals(mockData)
        
      } catch (error) {
        toast.error('Failed to load removal history')
      } finally {
        setIsLoading(false)
      }
    }

    loadHistory()
  }, [])

  const filteredRemovals = filterReason === 'all' 
    ? removals 
    : removals.filter(removal => removal.reason === filterReason)

  const totalRemoved = removals.reduce((sum, removal) => sum + removal.count, 0)
  const reasonCounts = REMOVAL_REASONS.map(reason => ({
    ...reason,
    count: removals.filter(r => r.reason === reason.id).reduce((sum, r) => sum + r.count, 0)
  }))

  const getReasonBadgeVariant = (reason: string) => {
    switch (reason) {
      case 'non_mutual':
        return 'secondary'
      case 'bot_detected':
        return 'destructive'
      case 'low_popularity':
        return 'warning'
      case 'unknown_contact':
        return 'outline'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading removal history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Removal History</h1>
        <p className="text-muted-foreground">
          Track all your follower removal activities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Removed</CardTitle>
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRemoved.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              followers removed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Removal Sessions</CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{removals.length}</div>
            <p className="text-xs text-muted-foreground">
              bulk operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {reasonCounts.reduce((max, reason) => 
                reason.count > max.count ? reason : max
              ).label}
            </div>
            <p className="text-xs text-muted-foreground">
              removal reason
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {removals.length > 0 ? formatDate(removals[0].timestamp) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              last removal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter by Reason</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterReason === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterReason('all')}
            >
              All ({totalRemoved})
            </Button>
            {reasonCounts.map((reason) => (
              <Button
                key={reason.id}
                variant={filterReason === reason.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterReason(reason.id)}
              >
                {reason.label} ({reason.count})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Removal History List */}
      <Card>
        <CardHeader>
          <CardTitle>Removal History</CardTitle>
          <CardDescription>
            {filteredRemovals.length > 0 
              ? `Showing ${filteredRemovals.length} removal session${filteredRemovals.length !== 1 ? 's' : ''}`
              : 'No removal history found'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredRemovals.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-4">
                <History className="h-12 w-12 text-muted-foreground mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold">No removal history</h3>
                  <p className="text-muted-foreground">
                    {filterReason === 'all' 
                      ? 'You haven\'t removed any followers yet.'
                      : 'No removals found for the selected reason.'
                    }
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRemovals.map((removal) => {
                const reasonData = REMOVAL_REASONS.find(r => r.id === removal.reason)
                
                return (
                  <div
                    key={removal.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Trash2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-semibold">
                            Removed {formatNumber(removal.count)} follower{removal.count !== 1 ? 's' : ''}
                          </h4>
                          {reasonData && (
                            <Badge variant={getReasonBadgeVariant(removal.reason)}>
                              {reasonData.label}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {formatDate(removal.timestamp)}
                        </p>
                        
                        {reasonData && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {reasonData.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
