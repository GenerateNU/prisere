'use client'
import { login} from '@/actions/auth'
import { Input } from '@/components/ui/input'


export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-200">
      <div className="max-w-md w-full space-y-8">
        <div className = "flex justify-center">
            <label className = "block text-3xl text-black font-bold"> Log In </label>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl">
          <div className="space-y-4">
            <div>
              <Input
                id="email" 
                name="email" 
                type="email" 
                placeholder="Email"
                required 
              />
            </div>
            <div>
              <Input
                id="password" 
                name="password" 
                type="password" 
                placeholder="Password"
                required 
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              formAction={login}
              className="flex-1 bg-gray-400 text-black py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Log In
            </button>
            <button 
              formAction={login}
              className="flex-1 bg-gray-400 text-black py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}