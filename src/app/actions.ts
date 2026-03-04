'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addTransaction(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get household
    const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .single()

    if (!householdMember) throw new Error('No household found')

    const amount = parseFloat(formData.get('amount') as string)
    const note = formData.get('note') as string
    const type = formData.get('type') as 'debt' | 'repayment'
    const dateStr = formData.get('date') as string

    // Create Date object or use current date
    const dateObj = dateStr ? new Date(dateStr) : new Date()

    const { error } = await supabase.from('transactions').insert({
        household_id: householdMember.household_id,
        amount: amount,
        note,
        type,
        date: dateObj.toISOString().split('T')[0],
        created_by: user.id
    })

    if (error) {
        console.error('Error inserting transaction:', error)
        throw new Error('Could not insert transaction')
    }

    revalidatePath('/')
    revalidatePath('/history')
}
