"use client";

import * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

const purposeFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }).max(255, {
    message: 'Name must be less than 255 characters',
  }),
})

// TODO: add form for creating purposes
// TODO: show existing purposes in a list
export default function Dashboard() {
  const form = useForm<z.infer<typeof purposeFormSchema>>({
    resolver: zodResolver(purposeFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = (values: z.infer<typeof purposeFormSchema>) => {
    console.log(values)
    // TODO: create firestore document
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Dashboard</h1>
      </div>
      <div className="container mx-auto px-4 py-16 max-w-2xl"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h2 className="text-2xl font-bold">Create Purpose</h2>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of the purpose.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="default">Create</Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
