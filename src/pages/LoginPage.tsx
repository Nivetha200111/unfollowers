import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '../hooks/useAuth'
import { loginSchema, type LoginFormData } from '../utils/validators'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { LoadingSpinner } from '../components/ui/loading-spinner'
import { AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export function LoginPage() {
  const { login, isLoading } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      platform: 'twitter'
    }
  })

  // Handle OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get('code')
    const state = urlParams.get('state')
    const error = urlParams.get('error')

    if (error) {
      setError(`Authentication failed: ${error}`)
      return
    }

    if (code && state) {
      // This would be handled by the auth hook in a real implementation
      console.log('OAuth callback received:', { code, state })
    }
  }, [])

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true)
      setError(null)
      
      await login(data.username, data.platform)
      
      toast.success('Redirecting to authentication...')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome to Follower Manager</CardTitle>
          <CardDescription>
            Connect your X (Twitter) account to start managing your followers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <div className="flex items-center space-x-2 p-3 border rounded-md bg-muted/50">
                <span className="text-blue-500">𝕏</span>
                <span className="font-medium">X (Twitter)</span>
              </div>
              <input type="hidden" {...register('platform')} value="twitter" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="Enter your username"
                {...register('username')}
                disabled={isSubmitting}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {error && (
              <div className="flex items-center space-x-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner size="sm" />
                  <span>Connecting to X...</span>
                </div>
              ) : (
                'Connect X Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>
              By connecting your account, you agree to our{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
