import { Hono } from 'hono'
import { UserService } from '../services/user.service'

const usersRoute = new Hono()

usersRoute.get('/', async (c) => {
  try {
    const allUsers = await UserService.getAllUsers()
    
    return c.json({
      success: true,
      data: allUsers,
      count: allUsers.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default usersRoute