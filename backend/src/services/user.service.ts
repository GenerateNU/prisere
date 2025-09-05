import { db } from '../db'
import { users } from '../db/schema/users'

export class UserService {
  static async getAllUsers() {
    try {
      const allUsers = await db.select().from(users)
      return allUsers
    } catch (error) {
      console.error('Error fetching users:', error)
      throw new Error('Failed to fetch users')
    }
  }
}