import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { REMOVAL_REASONS } from '../../types'
import { UserX, AlertTriangle, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ActionPanelProps {
  selectedCount: number
  onSelectAll: () => void
  onDeselectAll: () => void
  onRemoveSelected: (reason: string) => Promise<{ removedCount: number; failedCount: number }>
  isLoading: boolean
}

export function ActionPanel({ 
  selectedCount, 
  onSelectAll, 
  onDeselectAll, 
  onRemoveSelected, 
  isLoading 
}: ActionPanelProps) {
  const [selectedReason, setSelectedReason] = useState('')
  const [isRemoving, setIsRemoving] = useState(false)
  const [removalProgress, setRemovalProgress] = useState(0)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleRemove = async () => {
    if (!selectedReason) {
      toast.error('Please select a removal reason')
      return
    }

    try {
      setIsRemoving(true)
      setRemovalProgress(0)
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setRemovalProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const result = await onRemoveSelected(selectedReason)
      
      clearInterval(progressInterval)
      setRemovalProgress(100)
      
      toast.success(`Successfully removed ${result.removedCount} followers`)
      
      if (result.failedCount > 0) {
        toast.error(`Failed to remove ${result.failedCount} followers`)
      }
      
      setShowConfirmDialog(false)
      setSelectedReason('')
      
      // Reset progress after a delay
      setTimeout(() => setRemovalProgress(0), 2000)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove followers'
      toast.error(errorMessage)
    } finally {
      setIsRemoving(false)
    }
  }

  const selectedReasonData = REMOVAL_REASONS.find(r => r.id === selectedReason)

  return (
    <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <UserX className="h-5 w-5 text-orange-600" />
          <span>Bulk Actions</span>
        </CardTitle>
        <CardDescription>
          {selectedCount} follower{selectedCount !== 1 ? 's' : ''} selected for removal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {isRemoving && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Removing followers...</span>
              <span>{removalProgress}%</span>
            </div>
            <Progress value={removalProgress} className="w-full" />
          </div>
        )}

        {/* Selection Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={isLoading || isRemoving}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDeselectAll}
              disabled={isLoading || isRemoving}
            >
              Deselect All
            </Button>
          </div>
          
          <Badge variant="secondary" className="text-sm">
            {selectedCount} selected
          </Badge>
        </div>

        {/* Removal Reason Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Removal Reason</label>
          <Select value={selectedReason} onValueChange={setSelectedReason}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason for removal" />
            </SelectTrigger>
            <SelectContent>
              {REMOVAL_REASONS.map((reason) => (
                <SelectItem key={reason.id} value={reason.id}>
                  <div>
                    <div className="font-medium">{reason.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {reason.description}
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogTrigger asChild>
            <Button 
              className="w-full" 
              disabled={!selectedReason || isLoading || isRemoving}
            >
              <UserX className="h-4 w-4 mr-2" />
              Remove Selected Followers
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <span>Confirm Removal</span>
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to remove {selectedCount} follower{selectedCount !== 1 ? 's' : ''}?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            
            {selectedReasonData && (
              <div className="p-4 bg-muted rounded-md">
                <h4 className="font-medium mb-2">Removal Reason:</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedReasonData.description}
                </p>
              </div>
            )}
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                disabled={isRemoving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRemove}
                disabled={isRemoving}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isRemoving ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    <span>Removing...</span>
                  </div>
                ) : (
                  <>
                    <UserX className="h-4 w-4 mr-2" />
                    Remove {selectedCount} Follower{selectedCount !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Warning Message */}
        <div className="flex items-start space-x-2 p-3 bg-orange-100 dark:bg-orange-900/20 rounded-md">
          <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-orange-800 dark:text-orange-200">
            <p className="font-medium">Important:</p>
            <p>
              Removing followers is permanent and cannot be undone. 
              Make sure you've reviewed your selection carefully before proceeding.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
