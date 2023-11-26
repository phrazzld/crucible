"use client";

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const purposeFormSchema = z.object({
  name: z.string().min(1, {
    message: 'Name is required',
  }).max(255, {
    message: 'Name must be less than 255 characters',
  }),
})

export default function Dashboard() {
  const { user } = useAuthContext();
  const [purposes, setPurposes] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      console.warn('No user found')
      redirect('/login')
    }
  }, [user])

  useEffect(() => {
    fetchPurposes();
  }, []);

  const fetchPurposes = async () => {
    try {
      if (!auth.currentUser) {
        console.warn("No user found");
        return;
      }
      const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "purposes"));
      const purposeData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPurposes(purposeData);
    } catch (error) {
      console.error("Error fetching purposes: ", error);
    }
    setLoading(false);
  };

  const form = useForm<z.infer<typeof purposeFormSchema>>({
    resolver: zodResolver(purposeFormSchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = (values: z.infer<typeof purposeFormSchema>) => {
    const user = auth.currentUser
    if (!user) {
      console.error('No user found')
      return
    }

    const purposesRef = collection(db, `users/${user.uid}/purposes`)
    addDoc(purposesRef, {
      name: values.name,
    }).then((docRef) => {
      console.log('Document written with ID: ', docRef.id)
      fetchPurposes();
      form.reset()
    }).catch((error) => {
      console.error('Error adding document: ', error)
    })
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-8">Dashboard</h1>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div>
            {purposes.map((purpose: any) => (
              <div key={purpose.id}>
                <Link href={`/purposes?id=${purpose.id}`}>
                  <h2>{purpose.name}</h2>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
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
