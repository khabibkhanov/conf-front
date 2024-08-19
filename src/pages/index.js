import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  const handleRoleSelection = (role) => {
    if (role === 'speaker') {
      router.push('/speaker');
    } else if (role === 'listener') {
      router.push('/listener');
    }
  };

  return (
    <div>
      <h1>Conference Translator</h1>
      <button onClick={() => handleRoleSelection('speaker')}>Speaker</button>
      <button onClick={() => handleRoleSelection('listener')}>Listener</button>
    </div>
  );
}
