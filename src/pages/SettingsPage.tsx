import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSettingsSchema, type UserSettingsData } from '../utils/validators'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Slider } from '../components/ui/slider'
import { Separator } from '../components/ui/separator'
import { Settings, Save, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<UserSettingsData>({
    resolver: zodResolver(userSettingsSchema),
    defaultValues: {
      minFollowerThreshold: 100,
      maxFollowingRatio: 10,
      botDetectionEnabled: true,
      mutualOnlyMode: false,
      emailNotifications: false,
      removalConfirmations: true,
      dataRetentionDays: 30
    }
  })

  const watchedValues = watch()

  // Load settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would fetch from the API
        // const response = await apiService.getSettings()
        // if (response.success && response.data) {
        //   reset(response.data)
        // }
      } catch (error) {
        toast.error('Failed to load settings')
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [reset])

  const onSubmit = async (data: UserSettingsData) => {
    try {
      setIsSaving(true)
      
      // In a real app, this would save to the API
      // const response = await apiService.updateSettings(data)
      // if (response.success) {
      //   toast.success('Settings saved successfully')
      // } else {
      //   throw new Error(response.error || 'Failed to save settings')
      // }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save settings'
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    reset({
      minFollowerThreshold: 100,
      maxFollowingRatio: 10,
      botDetectionEnabled: true,
      mutualOnlyMode: false,
      emailNotifications: false,
      removalConfirmations: true,
      dataRetentionDays: 30
    })
    toast.success('Settings reset to defaults')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your follower management preferences
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Filter Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Filter Settings</span>
            </CardTitle>
            <CardDescription>
              Configure default filters for follower analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="min-followers">
                  Minimum follower threshold: {watchedValues.minFollowerThreshold.toLocaleString()}
                </Label>
                <Slider
                  id="min-followers"
                  min={0}
                  max={10000}
                  step={100}
                  value={[watchedValues.minFollowerThreshold]}
                  onValueChange={(value) => setValue('minFollowerThreshold', value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Hide accounts with fewer than this many followers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-ratio">
                  Maximum follower/following ratio: {watchedValues.maxFollowingRatio}:1
                </Label>
                <Slider
                  id="max-ratio"
                  min={0.1}
                  max={100}
                  step={0.1}
                  value={[watchedValues.maxFollowingRatio]}
                  onValueChange={(value) => setValue('maxFollowingRatio', value[0])}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Hide accounts with very high follower/following ratios
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bot-detection">Enable bot detection</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically detect and filter out suspected bot accounts
                  </p>
                </div>
                <Switch
                  id="bot-detection"
                  checked={watchedValues.botDetectionEnabled}
                  onCheckedChange={(checked) => setValue('botDetectionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="mutual-only">Mutual only mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Only show followers who also follow you back
                  </p>
                </div>
                <Switch
                  id="mutual-only"
                  checked={watchedValues.mutualOnlyMode}
                  onCheckedChange={(checked) => setValue('mutualOnlyMode', checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>
              Configure how you want to be notified about actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive email updates about follower management activities
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={watchedValues.emailNotifications}
                onCheckedChange={(checked) => setValue('emailNotifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="removal-confirmations">Removal confirmations</Label>
                <p className="text-xs text-muted-foreground">
                  Show confirmation dialogs before removing followers
                </p>
              </div>
              <Switch
                id="removal-confirmations"
                checked={watchedValues.removalConfirmations}
                onCheckedChange={(checked) => setValue('removalConfirmations', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Privacy & Data</CardTitle>
            <CardDescription>
              Control how your data is stored and managed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="data-retention">
                Data retention period: {watchedValues.dataRetentionDays} days
              </Label>
              <Slider
                id="data-retention"
                min={1}
                max={365}
                step={1}
                value={[watchedValues.dataRetentionDays]}
                onValueChange={(value) => setValue('dataRetentionDays', value[0])}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How long to keep follower data and removal history
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSaving}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset to Defaults
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Saving...</span>
              </div>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
