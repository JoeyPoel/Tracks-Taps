import { useEffect, useState } from 'react'
import { Text, View } from 'react-native'
import { supabase } from './utils/supabase'

function Page() {
    const [todos, setTodos] = useState<any[]>([])

    useEffect(() => {
        async function getTodos() {
            const { data } = await supabase.from('todos').select()

            if (data && data.length > 0) {
                setTodos(data)
            }
        }

        getTodos()
    }, [])

    return (
        <View>
            {todos.map((todo) => (
                <Text key={todo.id}>{JSON.stringify(todo)}</Text>
            ))}
        </View>
    )
}
export default Page