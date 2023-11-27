"use client"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { CONFIG_NAMES } from '@/constants';
import { useAuthContext } from "@/context/AuthContext";
import { auth, db, functions } from "@/lib/firebase";
import { zodResolver } from '@hookform/resolvers/zod';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { httpsCallable } from "firebase/functions";

const configFormSchema = z.object({
  model: z.enum(['gpt-3.5-turbo', 'gpt-4', 'gpt-4-1106-preview', 'gpt-4-32k', 'gpt-3.5-turbo-1106', 'gpt-3.5-turbo-16k']),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().min(1).max(128000),
  frequencyPenalty: z.number().min(0).max(1),
  presencePenalty: z.number().min(0).max(1),
  systemPrompt: z.string(),
  userPrompt: z.string(),
})

export default function Purpose() {
  const { user } = useAuthContext();
  const [purpose, setPurpose] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [configs, setConfigs] = useState<any>([]);
  const [error, setError] = useState<any>(null);
  const params = useSearchParams()

  useEffect(() => {
    const fetchPurpose = async () => {
      try {
        setError(null);
        setLoading(true);
        console.log('params', params);
        console.log('auth.currentUser', auth.currentUser);
        if (!auth.currentUser) {
          setError('No user logged in');
          setLoading(false);
          return;
        }

        const uid = auth.currentUser.uid;
        if (!params.get("id")) return;

        const purposeRef = doc(db, `users/${uid}/purposes/${params.get("id")}`);

        const docSnap = await getDoc(purposeRef);
        if (docSnap.exists()) {
          setPurpose(docSnap.data());
        } else {
          setError('Purpose not found');
        }
      } catch (err) {
        setError('Error fetching purpose');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurpose();
  }, [params, user]);

  useEffect(() => {
    fetchConfigs();
  }, [purpose]);

  console.log("configs:", configs)

  const fetchConfigs = async () => {
    try {
      if (!auth.currentUser) {
        console.warn("No user found");
        return;
      }
      const querySnapshot = await getDocs(collection(db, "users", auth.currentUser.uid, "purposes", params.get("id") || "", "configs"));
      const configsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConfigs(configsData);
    } catch (error) {
      console.error("Error fetching configs: ", error);
    }
    setLoading(false);
  };

  const deleteConfig = async (id: string) => {
    try {
      if (!auth.currentUser) {
        console.warn("No user found");
        return;
      }
      await deleteDoc(doc(db, "users", auth.currentUser.uid, "purposes", params.get("id") || "", "configs", id));
      fetchConfigs();
    } catch (error) {
      console.error("Error deleting config: ", error);
    }
  }

  const form = useForm<z.infer<typeof configFormSchema>>({
    resolver: zodResolver(configFormSchema),
    defaultValues: {
      model: 'gpt-3.5-turbo',
      temperature: 0.5,
      maxTokens: 2048,
      frequencyPenalty: 0.5,
      presencePenalty: 0.5,
      systemPrompt: '',
      userPrompt: '',
    },
  })

  const onSubmit = (values: z.infer<typeof configFormSchema>) => {
    const user = auth.currentUser
    if (!user) {
      console.error('No user found')
      return
    }

    if (!params.get("id")) {
      console.error('No purpose found')
      return
    }

    const configsRef = collection(db, "users", user.uid, "purposes", params.get("id") || "", "configs")

    // make list of cool default config names, e.g. alpha, beta, gamma, etc
    const existingConfigNames = configs.map((config: any) => config.name);
    // select first default config name that isn't already taken
    const configName = CONFIG_NAMES.find((name: string) => !existingConfigNames.includes(name))
    if (!configName) {
      console.error('No default config name found')
      return
    }

    addDoc(configsRef, {
      name: configName,
      model: values.model,
      temperature: Number(values.temperature),
      maxTokens: Number(values.maxTokens),
      frequencyPenalty: Number(values.frequencyPenalty),
      presencePenalty: Number(values.presencePenalty),
      systemPrompt: values.systemPrompt,
      userPrompt: values.userPrompt,
    }).then((docRef) => {
      console.log('Document written with ID: ', docRef.id)
      fetchConfigs();
      form.reset()
    }).catch((error) => {
      console.error('Error adding document: ', error)
    })
  }

  // TODO: show trial runs
  const handleRunTrial = async () => {
    if (!auth.currentUser) {
      console.error('No user found')
      return
    }

    const purposeId = params.get("id")
    if (!purposeId) {
      console.error('No purpose found')
      return
    }

    const trialsRef = collection(db, "users", auth.currentUser?.uid, "purposes", purposeId, "trials")

    const trialDoc = await addDoc(trialsRef, {
      configIds: configs.map((config: any) => config.id),
      createdAt: new Date(),
    })
    const trialRef = doc(db, "users", auth.currentUser?.uid, "purposes", purposeId, "trials", trialDoc.id)

    const runConfigTrial = httpsCallable(functions, 'runConfigTrial');
    for (const config of configs) {
      console.log("running trial for config:", config)
      const { data } = await runConfigTrial({ config })
      console.log('result data', data)
      await addDoc(collection(trialRef, "results"), {
        configId: config.id,
        createdAt: new Date(),
        result: data
      })
      console.log("trial result saved")
    }
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!purpose) return <div>No purpose found</div>;

  return (
    <div>
      <div className="container mx-auto px-4 py-16 max-w-2xl flex flex-row justify-between items-center">
        <h1 className="text-4xl font-bold">{purpose.name}</h1>
        <Button onClick={handleRunTrial}>Run Test</Button>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <h2 className="text-2xl font-bold">Configs</h2>
        <ul className="space-y-4">
          {configs.length === 0 && (
            <h3 className="text-lg">No configs yet</h3>
          )}
          {configs.length > 0 && configs.map((config: any) => (
            <li key={config.id}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">{config.name}</h3>
                  <p className="text-sm text-gray-500">{config.model}</p>
                  <p className="text-sm text-gray-500">Temperature: {config.temperature}</p>
                  <p className="text-sm text-gray-500">Max Tokens: {config.maxTokens}</p>
                  <p className="text-sm text-gray-500">Frequency Penalty: {config.frequencyPenalty}</p>
                  <p className="text-sm text-gray-500">Presence Penalty: {config.presencePenalty}</p>
                  <p className="text-sm text-gray-500">System Prompt: {config.systemPrompt}</p>
                  <p className="text-sm text-gray-500">User Prompt: {config.userPrompt}</p>
                </div>
                <div>
                  <Button variant="destructive" onClick={() => deleteConfig(config.id)}>Delete</Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <h2 className="text-2xl font-bold">Create Config</h2>
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-4-1106-preview">GPT-4 1106 Preview</SelectItem>
                      <SelectItem value="gpt-4-32k">GPT-4 32k</SelectItem>
                      <SelectItem value="gpt-3.5-turbo-1106">GPT-3.5 Turbo 1106</SelectItem>
                      <SelectItem value="gpt-3.5-turbo-16k">GPT-3.5 Turbo 16k</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The model to use for generating text.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperature</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Temperature"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Controls randomness. Lowering results in less random completions. Higher temperature results in more random completions.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxTokens"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Tokens</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Max Tokens"
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    The maximum number of tokens to generate. (One token is roughly 4 characters for normal English text.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequencyPenalty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency Penalty</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Frequency Penalty"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How much to penalize new tokens based on their existing frequency in the text so far. Decreases the model's likelihood to repeat the same line verbatim.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="presencePenalty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presence Penalty</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="number"
                      placeholder="Presence Penalty"
                      step="0.1"
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    How much to penalize new tokens based on whether they appear in the text so far. Increases the model's likelihood to talk about new topics.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="systemPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="System Prompt" {...field} />
                  </FormControl>
                  <FormDescription>
                    The prompt to use for the system. Think of this as the context and initialization for the system's response.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="userPrompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User Prompt</FormLabel>
                  <FormControl>
                    <Textarea placeholder="User Prompt" {...field} />
                  </FormControl>
                  <FormDescription>
                    The prompt to use for the user. Think of this as direct instructions to the system.
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
