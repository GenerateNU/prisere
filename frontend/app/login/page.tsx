import { login, signup } from '@/actions/auth'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-200">
      <div className="max-w-md w-full space-y-8">
        <div className = "flex justify-center">
            <label className = "block text-3xl text-black font-bold"> Login and Signup </label>
        </div>
        <form className="mt-8 space-y-6 bg-white p-8 rounded-xl">
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-black">
                Email
              </label>
              <input 
                id="email" 
                name="email" 
                type="email" 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input 
                id="password" 
                name="password" 
                type="password" 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
              formAction={login}
              className="flex-1 bg-sky-200 text-black py-2 px-4 rounded-md hover:bg-sky-500"
            >
              Log in
            </button>
            <button 
              formAction={signup}
              className="flex-1 bg-gray-400 text-black py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}