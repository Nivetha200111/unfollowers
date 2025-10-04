import { Follower } from '../../types'
import { Checkbox } from '../ui/checkbox'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Card, CardContent } from '../ui/card'
import { LoadingSpinner } from '../ui/loading-spinner'
import { formatNumber, formatDate } from '../../utils/validators'
import { BotDetector } from '../../utils/botDetection'
import { 
  UserCheck, 
  UserX, 
  Shield, 
  Users, 
  UserPlus,
  ExternalLink,
  MoreHorizontal
} from 'lucide-react'

interface FollowerListProps {
  followers: Follower[]
  selectedFollowers: string[]
  onToggleSelection: (followerId: string) => void
  isLoading: boolean
}

export function FollowerList({ 
  followers, 
  selectedFollowers, 
  onToggleSelection, 
  isLoading 
}: FollowerListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Loading followers...</p>
        </div>
      </div>
    )
  }

  if (followers.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <Users className="h-12 w-12 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">No followers found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new followers.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {followers.map((follower) => {
        const isSelected = selectedFollowers.includes(follower.id)
        const botResult = BotDetector.detectBot(follower)
        
        return (
          <Card key={follower.id} className={`transition-colors ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelection(follower.id)}
                />
                
                <Avatar className="h-12 w-12">
                  <AvatarImage src={follower.avatarUrl} alt={follower.username} />
                  <AvatarFallback>
                    {follower.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-semibold truncate">
                      {follower.displayName || follower.username}
                    </h4>
                    {follower.isVerified && (
                      <Badge variant="success" className="text-xs">
                        Verified
                      </Badge>
                    )}
                    {follower.isPrivate && (
                      <Badge variant="secondary" className="text-xs">
                        Private
                      </Badge>
                    )}
                    {follower.isMutual && (
                      <Badge variant="outline" className="text-xs">
                        Mutual
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    @{follower.username}
                  </p>
                  
                  {follower.bio && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {follower.bio}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="text-center">
                    <div className="font-semibold">{formatNumber(follower.followerCount)}</div>
                    <div className="text-xs">followers</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold">{formatNumber(follower.followingCount)}</div>
                    <div className="text-xs">following</div>
                  </div>

                  {follower.botScore > 0 && (
                    <div className="text-center">
                      <div className={`font-semibold ${BotDetector.getBotScoreColor(follower.botScore)}`}>
                        {Math.round(follower.botScore * 100)}%
                      </div>
                      <div className="text-xs">bot score</div>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {botResult.isBot && (
                    <Badge variant="destructive" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Bot
                    </Badge>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Additional info row */}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-4">
                  <span>Last analyzed: {formatDate(follower.lastAnalyzed)}</span>
                  {follower.followingCount > 0 && (
                    <span>
                      Ratio: {(follower.followerCount / follower.followingCount).toFixed(1)}:1
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  {!follower.isMutual && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <UserX className="h-3 w-3" />
                      <span>Not following back</span>
                    </div>
                  )}
                  
                  {follower.isMutual && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <UserCheck className="h-3 w-3" />
                      <span>Mutual follow</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
