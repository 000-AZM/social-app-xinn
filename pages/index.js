// pages/index.js
import { useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, addDoc, getDocs, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useRouter } from 'next/router';

export default function Home() {
  const [user, setUser] = useState(null);
  const [post, setPost] = useState('');
  const [posts, setPosts] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) setUser(u);
      else router.push('/login');
    });
    return unsub;
  }, []);

  useEffect(() => {
    const loadPosts = async () => {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      setPosts(snap.docs.map(doc => doc.data()));
    };
    loadPosts();
  }, [posts.length]);

  const sendPost = async () => {
    if (!post) return;
    await addDoc(collection(db, "posts"), {
      author: user.email,
      content: post,
      timestamp: serverTimestamp()
    });
    setPost('');
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {user?.email}</h1>
      <button onClick={() => signOut(auth)}>Logout</button>
      <hr />
      <input value={post} onChange={e => setPost(e.target.value)} placeholder="Write a post..." />
      <button onClick={sendPost}>Post</button>

      <h2>Posts:</h2>
      {posts.map((p, i) => (
        <div key={i} style={{ margin: '10px 0', borderBottom: '1px solid #ccc' }}>
          <strong>{p.author}</strong>: {p.content}
        </div>
      ))}
    </div>
  );
}
