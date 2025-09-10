import { User, CreateUserPayload} from "@/types/user"
import { supabase } from "@/utilities/supabaseClient"

export const createUser = async (payload: CreateUserPayload): Promise<User> => {
    const token = await supabase.auth.getSession()
    const res = await fetch(process.env.BASE_URL + "/api/users", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token.data.session?.access_token}`
        }
    })
    const data = await res.json()
    return data.user;
}