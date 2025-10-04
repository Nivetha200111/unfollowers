import { FollowerFilters } from '../../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'
import { Slider } from '../ui/slider'
import { Label } from '../ui/label'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Filter, RotateCcw } from 'lucide-react'

interface FilterPanelProps {
  filters: FollowerFilters
  onFiltersChange: (filters: Partial<FollowerFilters>) => void
  onAnalyze: () => void
  isLoading: boolean
}

export function FilterPanel({ filters, onFiltersChange, onAnalyze, isLoading }: FilterPanelProps) {
  const handleSliderChange = (value: number[], key: keyof FollowerFilters) => {
    onFiltersChange({ [key]: value[0] })
  }

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'nonMutualOnly' || key === 'botDetectionEnabled' || key === 'unknownContactsOnly' || key === 'verifiedOnly' || key === 'privateAccountsOnly') {
      return value === true
    }
    if (key === 'minFollowerThreshold') {
      return value > 0
    }
    if (key === 'maxFollowingRatio') {
      return value < 1000
    }
    return false
  }).length

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters</span>
            </CardTitle>
            <CardDescription>
              Configure criteria for filtering your followers
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">
                {activeFiltersCount} active
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onFiltersChange({
                nonMutualOnly: false,
                minFollowerThreshold: 0,
                maxFollowingRatio: 1000,
                botDetectionEnabled: true,
                unknownContactsOnly: false,
                verifiedOnly: false,
                privateAccountsOnly: false
              })}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Basic Filters</h4>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="non-mutual">Non-mutual followers only</Label>
                <p className="text-xs text-muted-foreground">
                  Show only followers who don't follow you back
                </p>
              </div>
              <Switch
                id="non-mutual"
                checked={filters.nonMutualOnly}
                onCheckedChange={(checked) => onFiltersChange({ nonMutualOnly: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="verified">Verified accounts only</Label>
                <p className="text-xs text-muted-foreground">
                  Show only verified accounts
                </p>
              </div>
              <Switch
                id="verified"
                checked={filters.verifiedOnly}
                onCheckedChange={(checked) => onFiltersChange({ verifiedOnly: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="private">Private accounts only</Label>
                <p className="text-xs text-muted-foreground">
                  Show only private accounts
                </p>
              </div>
              <Switch
                id="private"
                checked={filters.privateAccountsOnly}
                onCheckedChange={(checked) => onFiltersChange({ privateAccountsOnly: checked })}
              />
            </div>
          </div>

          {/* Advanced Filters */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Advanced Filters</h4>
            
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="min-followers">
                  Minimum followers: {filters.minFollowerThreshold.toLocaleString()}
                </Label>
                <Slider
                  id="min-followers"
                  min={0}
                  max={10000}
                  step={100}
                  value={[filters.minFollowerThreshold]}
                  onValueChange={(value) => handleSliderChange(value, 'minFollowerThreshold')}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Hide accounts with fewer than this many followers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-ratio">
                  Max follower/following ratio: {filters.maxFollowingRatio}:1
                </Label>
                <Slider
                  id="max-ratio"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={[filters.maxFollowingRatio]}
                  onValueChange={(value) => handleSliderChange(value, 'maxFollowingRatio')}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Hide accounts with very high follower/following ratios
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bot Detection */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Bot Detection</h4>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="bot-detection">Enable bot detection</Label>
              <p className="text-xs text-muted-foreground">
                Automatically detect and filter out suspected bot accounts
              </p>
            </div>
            <Switch
              id="bot-detection"
              checked={filters.botDetectionEnabled}
              onCheckedChange={(checked) => onFiltersChange({ botDetectionEnabled: checked })}
            />
          </div>

          {filters.botDetectionEnabled && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-xs text-muted-foreground">
                Bot detection analyzes usernames, bio patterns, follower ratios, and account activity 
                to identify likely bot accounts. This helps keep your follower list clean and authentic.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onFiltersChange({})}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onAnalyze}
            disabled={isLoading}
          >
            {isLoading ? 'Analyzing...' : 'Apply Filters'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
