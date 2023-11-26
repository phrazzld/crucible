"use client"

import { useAuthContext } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Purpose() {
  const { user } = useAuthContext();
  const [purpose, setPurpose] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!purpose) return <div>No purpose found</div>;

  return (
    <div>
      <h1>{purpose.name}</h1>
    </div>
  );
}
